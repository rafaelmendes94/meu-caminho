
-- impact_measurements
CREATE TABLE public.impact_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('action_plan','ritual','weekly_insight')),
  source_id uuid NOT NULL,
  baseline_score numeric,
  current_score numeric,
  impact_score numeric,
  confidence numeric,
  measured_at timestamptz NOT NULL DEFAULT now(),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text
);

CREATE INDEX idx_impact_meas_org ON public.impact_measurements(organization_id, measured_at DESC);
CREATE INDEX idx_impact_meas_src ON public.impact_measurements(source_type, source_id);

GRANT SELECT ON public.impact_measurements TO authenticated;
GRANT ALL ON public.impact_measurements TO service_role;

ALTER TABLE public.impact_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impact_meas_select_rh"
ON public.impact_measurements FOR SELECT TO authenticated
USING (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

CREATE POLICY "impact_meas_service_all"
ON public.impact_measurements FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- impact_timelines
CREATE TABLE public.impact_timelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_id uuid,
  event_date timestamptz NOT NULL DEFAULT now(),
  score_before numeric,
  score_after numeric,
  delta numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_impact_tl_org ON public.impact_timelines(organization_id, event_date DESC);

GRANT SELECT ON public.impact_timelines TO authenticated;
GRANT ALL ON public.impact_timelines TO service_role;

ALTER TABLE public.impact_timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impact_tl_select_rh"
ON public.impact_timelines FOR SELECT TO authenticated
USING (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

CREATE POLICY "impact_tl_service_all"
ON public.impact_timelines FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- measure_impact function
CREATE OR REPLACE FUNCTION public.measure_impact(
  _organization_id uuid,
  _source_type text,
  _source_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_service boolean := (current_setting('role', true) = 'service_role');
  ref_date timestamptz;
  baseline numeric;
  current_s numeric;
  impact numeric;
  confidence numeric := 0.3;
  evidence jsonb := '{}'::jsonb;
  summary text;
  score_before_row record;
  score_after_row record;
  participation bigint := 0;
  alerts_open bigint := 0;
BEGIN
  IF NOT is_service THEN
    IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
      RAISE EXCEPTION 'not authorized';
    END IF;
    IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
      RAISE EXCEPTION 'organization mismatch';
    END IF;
  END IF;

  IF _source_type NOT IN ('action_plan','ritual','weekly_insight') THEN
    RAISE EXCEPTION 'invalid source_type';
  END IF;

  -- Resolve reference date
  IF _source_type = 'action_plan' THEN
    SELECT created_at INTO ref_date FROM public.action_plans
    WHERE id = _source_id AND organization_id = _organization_id;
  ELSIF _source_type = 'ritual' THEN
    SELECT created_at INTO ref_date FROM public.intelligent_rituals
    WHERE id = _source_id AND organization_id = _organization_id;
  ELSIF _source_type = 'weekly_insight' THEN
    SELECT generated_at INTO ref_date FROM public.weekly_ai_insights
    WHERE id = _source_id AND organization_id = _organization_id;
  END IF;

  IF ref_date IS NULL THEN
    RAISE EXCEPTION 'source not found';
  END IF;

  -- Baseline: score most recent BEFORE ref_date (up to 30d earlier)
  SELECT overall_score, confidence, score_date INTO score_before_row
  FROM public.organizational_scores
  WHERE organization_id = _organization_id
    AND score_date <= ref_date::date
  ORDER BY score_date DESC
  LIMIT 1;

  -- Current: most recent score AFTER ref_date
  SELECT overall_score, confidence, score_date INTO score_after_row
  FROM public.organizational_scores
  WHERE organization_id = _organization_id
    AND score_date > ref_date::date
  ORDER BY score_date DESC
  LIMIT 1;

  baseline := score_before_row.overall_score;
  current_s := score_after_row.overall_score;

  IF baseline IS NOT NULL AND current_s IS NOT NULL THEN
    impact := ROUND((current_s - baseline)::numeric, 2);
  END IF;

  -- Aggregated context (participation / alerts) for confidence and evidence
  SELECT COUNT(DISTINCT user_id) INTO participation
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id
    AND created_at >= ref_date;

  SELECT COUNT(*) INTO alerts_open
  FROM public.alerts
  WHERE organization_id = _organization_id
    AND status = 'open'
    AND created_at >= ref_date;

  confidence := ROUND(LEAST(1.0, (
    COALESCE(score_before_row.confidence, 0) * 0.4 +
    COALESCE(score_after_row.confidence, 0) * 0.4 +
    (CASE WHEN participation >= 5 THEN 0.2 ELSE participation::numeric / 25 END)
  ))::numeric, 2);

  evidence := jsonb_build_object(
    'baseline_date', score_before_row.score_date,
    'current_date', score_after_row.score_date,
    'baseline_confidence', score_before_row.confidence,
    'current_confidence', score_after_row.confidence,
    'participation_after', participation,
    'alerts_after', alerts_open,
    'ref_date', ref_date
  );

  summary := CASE
    WHEN impact IS NULL THEN 'Sem dados suficientes de score antes/depois para medir impacto.'
    WHEN impact >= 3 THEN 'Impacto positivo relevante identificado após a iniciativa.'
    WHEN impact > 0 THEN 'Melhora leve observada após a iniciativa.'
    WHEN impact = 0 THEN 'Sem variação significativa no score organizacional.'
    WHEN impact <= -3 THEN 'Queda relevante do score após a iniciativa; investigar contexto.'
    ELSE 'Leve queda do score após a iniciativa.'
  END;

  -- Persist measurement
  INSERT INTO public.impact_measurements (
    organization_id, source_type, source_id,
    baseline_score, current_score, impact_score, confidence, evidence, summary
  ) VALUES (
    _organization_id, _source_type, _source_id,
    baseline, current_s, impact, confidence, evidence, summary
  );

  -- Timeline row
  INSERT INTO public.impact_timelines (
    organization_id, event_type, event_id, event_date,
    score_before, score_after, delta
  ) VALUES (
    _organization_id, _source_type, _source_id, ref_date,
    baseline, current_s, impact
  );

  RETURN jsonb_build_object(
    'organization_id', _organization_id,
    'source_type', _source_type,
    'source_id', _source_id,
    'baseline_score', baseline,
    'current_score', current_s,
    'impact_score', impact,
    'confidence', confidence,
    'evidence', evidence,
    'summary', summary
  );
END;
$$;

-- Extend get_executive_context with impact
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
  impact jsonb;
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
    ORDER BY generated_at DESC LIMIT 1
  ) r;

  dashboard := public.get_rh_dashboard_summary(_organization_id);

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.week_of DESC), '[]'::jsonb)
  INTO emotional FROM (SELECT * FROM public.get_emotional_map(_organization_id, 12)) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
  INTO pulse FROM (SELECT * FROM public.get_pulse_aggregate(_organization_id, 30)) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'alert_type', alert_type, 'severity', severity, 'title', title,
    'status', status, 'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb)
  INTO alerts FROM public.alerts
  WHERE organization_id = _organization_id AND created_at >= now() - interval '60 days' LIMIT 30;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'signal_type', signal_type, 'severity', severity, 'title', title,
    'status', status, 'detected_at', detected_at, 'evidence', evidence
  ) ORDER BY detected_at DESC), '[]'::jsonb)
  INTO predictive FROM public.predictive_signals
  WHERE organization_id = _organization_id AND detected_at >= now() - interval '90 days' LIMIT 30;

  org_summary := jsonb_build_object(
    'total_profiles', (SELECT COUNT(*) FROM public.profiles WHERE organization_id = _organization_id),
    'departments', (SELECT COUNT(*) FROM public.departments WHERE organization_id = _organization_id),
    'units', (SELECT COUNT(*) FROM public.units WHERE organization_id = _organization_id),
    'managers', (SELECT COUNT(DISTINCT manager_id) FROM public.profiles WHERE organization_id = _organization_id AND manager_id IS NOT NULL)
  );

  participation := jsonb_build_object(
    'checkin_participants_30d', (SELECT COUNT(DISTINCT user_id) FROM public.emotional_checkins WHERE organization_id = _organization_id AND created_at >= now() - interval '30 days'),
    'pulse_participants_30d', (SELECT COUNT(DISTINCT user_id) FROM public.pulse_responses WHERE organization_id = _organization_id AND responded_at >= now() - interval '30 days')
  );

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.week_of DESC), '[]'::jsonb)
  INTO weekly FROM (SELECT * FROM public.get_weekly_checkin_aggregate(_organization_id)) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'week_of', week_of, 'title', title, 'summary', summary,
    'severity', severity, 'confidence', confidence,
    'recommended_actions', recommended_actions, 'generated_at', generated_at
  ) ORDER BY generated_at DESC), '[]'::jsonb)
  INTO weekly_insights FROM public.weekly_ai_insights
  WHERE organization_id = _organization_id AND generated_at >= now() - interval '60 days';

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'score_date', score_date, 'overall_score', overall_score,
    'energy_score', energy_score, 'engagement_score', engagement_score,
    'communication_score', communication_score, 'equilibrium_score', equilibrium_score,
    'recovery_score', recovery_score, 'participation_score', participation_score,
    'risk_penalty', risk_penalty, 'confidence', confidence
  ) ORDER BY score_date DESC), '[]'::jsonb)
  INTO scores FROM (
    SELECT * FROM public.organizational_scores
    WHERE organization_id = _organization_id
    ORDER BY score_date DESC LIMIT 30
  ) s;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'source_type', source_type, 'source_id', source_id,
    'baseline_score', baseline_score, 'current_score', current_score,
    'impact_score', impact_score, 'confidence', confidence,
    'summary', summary, 'measured_at', measured_at
  ) ORDER BY measured_at DESC), '[]'::jsonb)
  INTO impact FROM public.impact_measurements
  WHERE organization_id = _organization_id
    AND measured_at >= now() - interval '180 days';

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
    'organizational_scores_30d', scores,
    'impact_measurements_180d', impact
  );
END;
$function$;
