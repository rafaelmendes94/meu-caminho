-- Table
CREATE TABLE public.organizational_dna_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  generated_at timestamptz NOT NULL DEFAULT now(),
  period_start date,
  period_end date,
  status text NOT NULL DEFAULT 'completed',
  overall_score numeric,
  culture_score numeric,
  leadership_score numeric,
  communication_score numeric,
  collaboration_score numeric,
  engagement_score numeric,
  energy_score numeric,
  recovery_score numeric,
  psychological_safety_score numeric,
  summary text,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  opportunities jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_by text,
  version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_org_dna_organization ON public.organizational_dna_reports(organization_id);
CREATE INDEX idx_org_dna_generated_at ON public.organizational_dna_reports(generated_at DESC);

GRANT SELECT ON public.organizational_dna_reports TO authenticated;
GRANT ALL ON public.organizational_dna_reports TO service_role;

ALTER TABLE public.organizational_dna_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RH/Owner can view own org DNA reports"
  ON public.organizational_dna_reports FOR SELECT
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

CREATE POLICY "Service role manages DNA reports"
  ON public.organizational_dna_reports FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER trg_org_dna_updated_at
  BEFORE UPDATE ON public.organizational_dna_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Aggregation function for DNA context
CREATE OR REPLACE FUNCTION public.get_dna_context(_organization_id uuid, _days int DEFAULT 90)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since timestamptz := now() - make_interval(days => _days);
  checkin_summary jsonb := '{}'::jsonb;
  pulse_summary jsonb := '{}'::jsonb;
  weekly_trend jsonb := '[]'::jsonb;
  participation jsonb := '{}'::jsonb;
  active_alerts jsonb := '[]'::jsonb;
  predictive jsonb := '[]'::jsonb;
  org_tree_summary jsonb := '{}'::jsonb;
  c_participants bigint := 0;
  c_mood numeric; c_energy numeric; c_stress numeric;
  p_row record;
  p_json jsonb := '{}'::jsonb;
  total_profiles bigint := 0;
  departments_count bigint := 0;
  units_count bigint := 0;
  managers_count bigint := 0;
BEGIN
  IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
    RAISE EXCEPTION 'organization mismatch';
  END IF;

  -- Check-ins
  SELECT COUNT(DISTINCT user_id),
         ROUND(AVG(mood_score)::numeric,2),
         ROUND(AVG(energy_score)::numeric,2),
         ROUND(AVG(stress_score)::numeric,2)
  INTO c_participants, c_mood, c_energy, c_stress
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id
    AND created_at >= since;

  IF c_participants < 5 THEN
    checkin_summary := jsonb_build_object('participants', c_participants, 'avg_mood', NULL, 'avg_energy', NULL, 'avg_stress', NULL);
  ELSE
    checkin_summary := jsonb_build_object('participants', c_participants, 'avg_mood', c_mood, 'avg_energy', c_energy, 'avg_stress', c_stress);
  END IF;

  -- Pulse by dimension
  FOR p_row IN
    SELECT pp.dimension,
           ROUND(AVG(pr.value_num)::numeric,2) AS avg_value,
           COUNT(DISTINCT pr.user_id) AS pcount,
           COUNT(*) AS rcount
    FROM public.pulse_responses pr
    JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
    WHERE pr.organization_id = _organization_id
      AND pr.responded_at >= since
    GROUP BY pp.dimension
  LOOP
    IF p_row.pcount >= 5 THEN
      p_json := p_json || jsonb_build_object(p_row.dimension, jsonb_build_object('avg', p_row.avg_value, 'participants', p_row.pcount, 'responses', p_row.rcount));
    ELSE
      p_json := p_json || jsonb_build_object(p_row.dimension, jsonb_build_object('avg', NULL, 'participants', p_row.pcount));
    END IF;
  END LOOP;
  pulse_summary := p_json;

  -- Weekly trend
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.week_of DESC), '[]'::jsonb)
  INTO weekly_trend
  FROM (
    SELECT ec.week_of,
           ROUND(AVG(ec.mood_score)::numeric,2) AS avg_mood,
           ROUND(AVG(ec.energy_score)::numeric,2) AS avg_energy,
           ROUND(AVG(ec.stress_score)::numeric,2) AS avg_stress,
           COUNT(DISTINCT ec.user_id) AS participants
    FROM public.emotional_checkins ec
    WHERE ec.organization_id = _organization_id
      AND ec.created_at >= since
    GROUP BY ec.week_of
    HAVING COUNT(DISTINCT ec.user_id) >= 5
  ) t;

  -- Participation
  participation := jsonb_build_object(
    'checkin_participants', c_participants,
    'pulse_participants', (
      SELECT COUNT(DISTINCT user_id) FROM public.pulse_responses
      WHERE organization_id = _organization_id AND responded_at >= since
    ),
    'total_active_profiles', (
      SELECT COUNT(*) FROM public.profiles WHERE organization_id = _organization_id
    )
  );

  -- Alerts
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'alert_type', alert_type, 'severity', severity, 'title', title, 'status', status, 'created_at', created_at
  )), '[]'::jsonb)
  INTO active_alerts
  FROM public.alerts
  WHERE organization_id = _organization_id AND created_at >= since
  ORDER BY created_at DESC
  LIMIT 30;

  -- Predictive
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'signal_type', signal_type, 'severity', severity, 'title', title, 'status', status, 'detected_at', detected_at
  )), '[]'::jsonb)
  INTO predictive
  FROM public.predictive_signals
  WHERE organization_id = _organization_id AND detected_at >= since
  ORDER BY detected_at DESC
  LIMIT 30;

  -- Org tree summary (aggregated only)
  SELECT COUNT(*) INTO total_profiles FROM public.profiles WHERE organization_id = _organization_id;
  SELECT COUNT(*) INTO departments_count FROM public.departments WHERE organization_id = _organization_id;
  SELECT COUNT(*) INTO units_count FROM public.units WHERE organization_id = _organization_id;
  SELECT COUNT(DISTINCT manager_id) INTO managers_count FROM public.profiles
    WHERE organization_id = _organization_id AND manager_id IS NOT NULL;

  org_tree_summary := jsonb_build_object(
    'total_profiles', total_profiles,
    'departments', departments_count,
    'units', units_count,
    'managers', managers_count
  );

  RETURN jsonb_build_object(
    'period_days', _days,
    'checkin_summary', checkin_summary,
    'pulse_summary', pulse_summary,
    'weekly_trend', weekly_trend,
    'participation', participation,
    'active_alerts', active_alerts,
    'predictive_signals', predictive,
    'org_structure', org_tree_summary
  );
END;
$$;