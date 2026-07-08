
CREATE TABLE public.organizational_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  score_date date NOT NULL DEFAULT current_date,
  overall_score numeric,
  energy_score numeric,
  engagement_score numeric,
  communication_score numeric,
  equilibrium_score numeric,
  recovery_score numeric,
  participation_score numeric,
  risk_penalty numeric NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0.5,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, score_date)
);

CREATE INDEX idx_org_scores_org_date ON public.organizational_scores(organization_id, score_date DESC);

GRANT SELECT ON public.organizational_scores TO authenticated;
GRANT ALL ON public.organizational_scores TO service_role;

ALTER TABLE public.organizational_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_scores_select_rh"
ON public.organizational_scores FOR SELECT
TO authenticated
USING (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

CREATE POLICY "org_scores_service_all"
ON public.organizational_scores FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- Function to calculate score
CREATE OR REPLACE FUNCTION public.calculate_organizational_score(_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_service boolean := (current_setting('role', true) = 'service_role');
  since timestamptz := now() - interval '30 days';

  c_participants bigint := 0;
  avg_mood numeric; avg_energy_ci numeric; avg_stress numeric;

  p_energy numeric; p_energy_n bigint := 0;
  p_engagement numeric; p_engagement_n bigint := 0;
  p_communication numeric; p_communication_n bigint := 0;
  p_equilibrium numeric; p_equilibrium_n bigint := 0;
  p_recovery numeric; p_recovery_n bigint := 0;

  total_profiles bigint := 0;
  pulse_participants bigint := 0;

  score_energy numeric;
  score_engagement numeric;
  score_communication numeric;
  score_equilibrium numeric;
  score_recovery numeric;
  score_participation numeric;

  base_score numeric;
  penalty numeric := 0;
  crit_alerts bigint := 0;
  warn_alerts bigint := 0;
  crit_signals bigint := 0;
  warn_signals bigint := 0;

  overall numeric;
  confidence numeric := 0.3;
  evidence jsonb;

  scale_1_5 CONSTANT numeric := 25.0; -- (v-1)*25 -> 0..100
BEGIN
  IF NOT is_service THEN
    IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
      RAISE EXCEPTION 'not authorized';
    END IF;
    IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
      RAISE EXCEPTION 'organization mismatch';
    END IF;
  END IF;

  -- Check-ins (energy fallback)
  SELECT COUNT(DISTINCT user_id),
         ROUND(AVG(mood_score)::numeric,2),
         ROUND(AVG(energy_score)::numeric,2),
         ROUND(AVG(stress_score)::numeric,2)
  INTO c_participants, avg_mood, avg_energy_ci, avg_stress
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id
    AND created_at >= since;

  -- Pulse by dimension
  SELECT ROUND(AVG(pr.value_num)::numeric,2), COUNT(DISTINCT pr.user_id)
  INTO p_energy, p_energy_n
  FROM public.pulse_responses pr JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
  WHERE pr.organization_id = _organization_id AND pp.dimension = 'energy' AND pr.responded_at >= since;

  SELECT ROUND(AVG(pr.value_num)::numeric,2), COUNT(DISTINCT pr.user_id)
  INTO p_engagement, p_engagement_n
  FROM public.pulse_responses pr JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
  WHERE pr.organization_id = _organization_id AND pp.dimension = 'engagement' AND pr.responded_at >= since;

  SELECT ROUND(AVG(pr.value_num)::numeric,2), COUNT(DISTINCT pr.user_id)
  INTO p_communication, p_communication_n
  FROM public.pulse_responses pr JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
  WHERE pr.organization_id = _organization_id AND pp.dimension = 'communication' AND pr.responded_at >= since;

  SELECT ROUND(AVG(pr.value_num)::numeric,2), COUNT(DISTINCT pr.user_id)
  INTO p_equilibrium, p_equilibrium_n
  FROM public.pulse_responses pr JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
  WHERE pr.organization_id = _organization_id AND pp.dimension = 'equilibrium' AND pr.responded_at >= since;

  SELECT ROUND(AVG(pr.value_num)::numeric,2), COUNT(DISTINCT pr.user_id)
  INTO p_recovery, p_recovery_n
  FROM public.pulse_responses pr JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
  WHERE pr.organization_id = _organization_id AND pp.dimension = 'recovery' AND pr.responded_at >= since;

  -- Participation
  SELECT COUNT(*) INTO total_profiles FROM public.profiles WHERE organization_id = _organization_id;
  SELECT COUNT(DISTINCT user_id) INTO pulse_participants
  FROM public.pulse_responses
  WHERE organization_id = _organization_id AND responded_at >= since;

  -- Component scores (0-100)
  IF p_energy_n >= 5 THEN
    score_energy := (p_energy - 1) * scale_1_5;
  ELSIF c_participants >= 5 AND avg_energy_ci IS NOT NULL THEN
    score_energy := (avg_energy_ci - 1) * scale_1_5;
  END IF;

  IF p_engagement_n >= 5 THEN
    score_engagement := (p_engagement - 1) * scale_1_5;
  END IF;

  IF p_communication_n >= 5 THEN
    score_communication := (p_communication - 1) * scale_1_5;
  END IF;

  IF p_equilibrium_n >= 5 THEN
    score_equilibrium := (p_equilibrium - 1) * scale_1_5;
  ELSIF c_participants >= 5 AND avg_stress IS NOT NULL THEN
    score_equilibrium := (5 - avg_stress - 1 + 1) * scale_1_5; -- (5 - stress - 1) * 25 = (4 - stress) * 25
    score_equilibrium := GREATEST(0, LEAST(100, (5 - avg_stress) * scale_1_5));
  END IF;

  IF p_recovery_n >= 5 THEN
    score_recovery := (p_recovery - 1) * scale_1_5;
  END IF;

  IF total_profiles > 0 THEN
    score_participation := LEAST(100, ROUND((GREATEST(c_participants, pulse_participants)::numeric / total_profiles * 100)::numeric, 2));
  END IF;

  -- Weighted base with available components
  DECLARE
    total_weight numeric := 0;
    sum_weighted numeric := 0;
  BEGIN
    IF score_energy IS NOT NULL THEN sum_weighted := sum_weighted + score_energy * 0.20; total_weight := total_weight + 0.20; END IF;
    IF score_engagement IS NOT NULL THEN sum_weighted := sum_weighted + score_engagement * 0.20; total_weight := total_weight + 0.20; END IF;
    IF score_communication IS NOT NULL THEN sum_weighted := sum_weighted + score_communication * 0.15; total_weight := total_weight + 0.15; END IF;
    IF score_equilibrium IS NOT NULL THEN sum_weighted := sum_weighted + score_equilibrium * 0.15; total_weight := total_weight + 0.15; END IF;
    IF score_recovery IS NOT NULL THEN sum_weighted := sum_weighted + score_recovery * 0.15; total_weight := total_weight + 0.15; END IF;
    IF score_participation IS NOT NULL THEN sum_weighted := sum_weighted + score_participation * 0.15; total_weight := total_weight + 0.15; END IF;

    IF total_weight > 0 THEN
      base_score := ROUND((sum_weighted / total_weight)::numeric, 2);
    END IF;
  END;

  -- Penalties
  SELECT COUNT(*) FILTER (WHERE severity='critical'), COUNT(*) FILTER (WHERE severity='warning')
  INTO crit_alerts, warn_alerts
  FROM public.alerts WHERE organization_id = _organization_id AND status = 'open';

  SELECT COUNT(*) FILTER (WHERE severity='critical'), COUNT(*) FILTER (WHERE severity='warning')
  INTO crit_signals, warn_signals
  FROM public.predictive_signals WHERE organization_id = _organization_id AND status = 'open';

  penalty := crit_alerts * 8 + warn_alerts * 4 + crit_signals * 10 + warn_signals * 5;

  IF base_score IS NOT NULL THEN
    overall := GREATEST(0, LEAST(100, base_score - penalty));
  END IF;

  -- Confidence
  confidence := LEAST(1.0,
    (CASE WHEN c_participants >= 5 THEN 0.25 ELSE (c_participants::numeric / 20) END) +
    (CASE WHEN pulse_participants >= 5 THEN 0.25 ELSE (pulse_participants::numeric / 20) END) +
    (CASE WHEN total_profiles > 0 THEN LEAST(0.25, (GREATEST(c_participants, pulse_participants)::numeric / GREATEST(total_profiles,1)) * 0.5) ELSE 0 END) +
    (CASE WHEN base_score IS NOT NULL THEN 0.25 ELSE 0 END)
  );
  confidence := ROUND(confidence::numeric, 2);

  evidence := jsonb_build_object(
    'checkin_participants', c_participants,
    'pulse_participants', pulse_participants,
    'total_profiles', total_profiles,
    'pulse_counts', jsonb_build_object(
      'energy', p_energy_n, 'engagement', p_engagement_n,
      'communication', p_communication_n, 'equilibrium', p_equilibrium_n, 'recovery', p_recovery_n
    ),
    'penalties', jsonb_build_object(
      'critical_alerts', crit_alerts, 'warning_alerts', warn_alerts,
      'critical_signals', crit_signals, 'warning_signals', warn_signals,
      'total', penalty
    ),
    'base_score', base_score
  );

  RETURN jsonb_build_object(
    'organization_id', _organization_id,
    'score_date', current_date,
    'overall_score', overall,
    'energy_score', score_energy,
    'engagement_score', score_engagement,
    'communication_score', score_communication,
    'equilibrium_score', score_equilibrium,
    'recovery_score', score_recovery,
    'participation_score', score_participation,
    'risk_penalty', penalty,
    'confidence', confidence,
    'evidence', evidence
  );
END;
$$;

-- Extend executive context
CREATE OR REPLACE FUNCTION public.get_executive_context(_organization_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  dna jsonb;
  dashboard jsonb;
  emotional jsonb;
  pulse jsonb;
  alerts jsonb;
  predictive jsonb;
  org_summary jsonb;
  participation jsonb;
  weekly jsonb;
  weekly_insights jsonb;
  scores jsonb;
BEGIN
  IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
    RAISE EXCEPTION 'organization mismatch';
  END IF;

  SELECT to_jsonb(r) INTO dna FROM (
    SELECT id, generated_at, overall_score, summary, strengths, opportunities, recommendations,
           dimensions, period_days
    FROM public.organizational_dna_reports
    WHERE organization_id = _organization_id
    ORDER BY generated_at DESC
    LIMIT 1
  ) r;

  dashboard := public.get_rh_dashboard_summary(_organization_id);

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.week_of DESC), '[]'::jsonb)
  INTO emotional
  FROM (SELECT * FROM public.get_emotional_map(_organization_id, 12)) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
  INTO pulse
  FROM (SELECT * FROM public.get_pulse_aggregate(_organization_id, 30)) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'alert_type', alert_type, 'severity', severity, 'title', title,
    'status', status, 'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb)
  INTO alerts
  FROM public.alerts
  WHERE organization_id = _organization_id
    AND created_at >= now() - interval '60 days'
  LIMIT 30;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'signal_type', signal_type, 'severity', severity, 'title', title,
    'status', status, 'detected_at', detected_at, 'evidence', evidence
  ) ORDER BY detected_at DESC), '[]'::jsonb)
  INTO predictive
  FROM public.predictive_signals
  WHERE organization_id = _organization_id
    AND detected_at >= now() - interval '90 days'
  LIMIT 30;

  org_summary := jsonb_build_object(
    'total_profiles', (SELECT COUNT(*) FROM public.profiles WHERE organization_id = _organization_id),
    'departments', (SELECT COUNT(*) FROM public.departments WHERE organization_id = _organization_id),
    'units', (SELECT COUNT(*) FROM public.units WHERE organization_id = _organization_id),
    'managers', (SELECT COUNT(DISTINCT manager_id) FROM public.profiles WHERE organization_id = _organization_id AND manager_id IS NOT NULL)
  );

  participation := jsonb_build_object(
    'checkin_participants_30d', (
      SELECT COUNT(DISTINCT user_id) FROM public.emotional_checkins
      WHERE organization_id = _organization_id AND created_at >= now() - interval '30 days'
    ),
    'pulse_participants_30d', (
      SELECT COUNT(DISTINCT user_id) FROM public.pulse_responses
      WHERE organization_id = _organization_id AND responded_at >= now() - interval '30 days'
    )
  );

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.week_of DESC), '[]'::jsonb)
  INTO weekly
  FROM (SELECT * FROM public.get_weekly_checkin_aggregate(_organization_id)) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'week_of', week_of, 'title', title, 'summary', summary,
    'severity', severity, 'confidence', confidence,
    'recommended_actions', recommended_actions, 'generated_at', generated_at
  ) ORDER BY generated_at DESC), '[]'::jsonb)
  INTO weekly_insights
  FROM public.weekly_ai_insights
  WHERE organization_id = _organization_id
    AND generated_at >= now() - interval '60 days';

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'score_date', score_date, 'overall_score', overall_score,
    'energy_score', energy_score, 'engagement_score', engagement_score,
    'communication_score', communication_score, 'equilibrium_score', equilibrium_score,
    'recovery_score', recovery_score, 'participation_score', participation_score,
    'risk_penalty', risk_penalty, 'confidence', confidence
  ) ORDER BY score_date DESC), '[]'::jsonb)
  INTO scores
  FROM (
    SELECT * FROM public.organizational_scores
    WHERE organization_id = _organization_id
    ORDER BY score_date DESC
    LIMIT 30
  ) s;

  RETURN jsonb_build_object(
    'generated_at', now(),
    'organization_id', _organization_id,
    'dna_latest', dna,
    'rh_dashboard', dashboard,
    'emotional_map_12w', emotional,
    'pulse_30d', pulse,
    'alerts_60d', alerts,
    'predictive_signals_90d', predictive,
    'org_structure', org_summary,
    'participation', participation,
    'weekly_checkins', weekly,
    'weekly_ai_insights', weekly_insights,
    'organizational_scores_30d', scores
  );
END;
$function$;
