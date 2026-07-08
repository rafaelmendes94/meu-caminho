
CREATE TABLE public.predictive_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  confidence numeric NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  title text NOT NULL,
  narrative text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  detected_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.predictive_signals TO authenticated;
GRANT ALL ON public.predictive_signals TO service_role;

ALTER TABLE public.predictive_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RH can view predictive signals of own org"
  ON public.predictive_signals FOR SELECT
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

CREATE POLICY "RH can update predictive signals of own org"
  ON public.predictive_signals FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  )
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

CREATE INDEX idx_predictive_signals_org_status ON public.predictive_signals(organization_id, status, detected_at DESC);
CREATE INDEX idx_predictive_signals_type ON public.predictive_signals(organization_id, signal_type, detected_at DESC);

CREATE TRIGGER trg_predictive_signals_updated_at
  BEFORE UPDATE ON public.predictive_signals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Aggregated predictive context (k-anonymity >= 5)
CREATE OR REPLACE FUNCTION public.get_predictive_context(_organization_id uuid, _days integer DEFAULT 60)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since_curr timestamptz := now() - make_interval(days => _days);
  since_prev timestamptz := now() - make_interval(days => _days * 2);
  mid timestamptz := now() - make_interval(days => _days);

  checkin_summary jsonb := '{}'::jsonb;
  pulse_summary jsonb := '{}'::jsonb;
  weekly_trend jsonb := '[]'::jsonb;
  participation_summary jsonb := '{}'::jsonb;
  active_alerts jsonb := '[]'::jsonb;

  c_participants bigint := 0;
  c_mood numeric; c_energy numeric; c_stress numeric;

  p_row record;
  p_json jsonb := '{}'::jsonb;

  prev_participants bigint := 0;
  curr_participants bigint := 0;
  prev_engagement numeric;
  curr_engagement numeric;
  prev_stress numeric;
  curr_stress numeric;
BEGIN
  IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
    RAISE EXCEPTION 'organization mismatch';
  END IF;

  -- Check-in summary current window
  SELECT COUNT(DISTINCT user_id),
         ROUND(AVG(mood_score)::numeric,2),
         ROUND(AVG(energy_score)::numeric,2),
         ROUND(AVG(stress_score)::numeric,2)
  INTO c_participants, c_mood, c_energy, c_stress
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id
    AND created_at >= since_curr;

  IF c_participants < 5 THEN
    checkin_summary := jsonb_build_object(
      'participants', c_participants,
      'avg_mood', NULL, 'avg_energy', NULL, 'avg_stress', NULL
    );
  ELSE
    checkin_summary := jsonb_build_object(
      'participants', c_participants,
      'avg_mood', c_mood, 'avg_energy', c_energy, 'avg_stress', c_stress
    );
  END IF;

  -- Pulse summary by dimension
  FOR p_row IN
    SELECT pp.dimension,
           ROUND(AVG(pr.value_num)::numeric,2) AS avg_value,
           COUNT(DISTINCT pr.user_id) AS pcount
    FROM public.pulse_responses pr
    JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
    WHERE pr.organization_id = _organization_id
      AND pr.responded_at >= since_curr
    GROUP BY pp.dimension
  LOOP
    IF p_row.pcount >= 5 THEN
      p_json := p_json || jsonb_build_object(p_row.dimension, jsonb_build_object('avg', p_row.avg_value, 'participants', p_row.pcount));
    ELSE
      p_json := p_json || jsonb_build_object(p_row.dimension, jsonb_build_object('avg', NULL, 'participants', p_row.pcount));
    END IF;
  END LOOP;
  pulse_summary := p_json;

  -- Weekly trend (checkins)
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
      AND ec.created_at >= since_curr
    GROUP BY ec.week_of
    HAVING COUNT(DISTINCT ec.user_id) >= 5
  ) t;

  -- Participation: previous vs current window (checkins)
  SELECT COUNT(DISTINCT user_id) INTO prev_participants
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id
    AND created_at >= since_prev AND created_at < mid;

  SELECT COUNT(DISTINCT user_id) INTO curr_participants
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id
    AND created_at >= since_curr;

  -- Engagement previous/current
  SELECT ROUND(AVG(pr.value_num)::numeric,2) INTO prev_engagement
  FROM public.pulse_responses pr
  JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
  WHERE pr.organization_id = _organization_id
    AND pp.dimension = 'engagement'
    AND pr.responded_at >= since_prev AND pr.responded_at < mid
  HAVING COUNT(DISTINCT pr.user_id) >= 5;

  SELECT ROUND(AVG(pr.value_num)::numeric,2) INTO curr_engagement
  FROM public.pulse_responses pr
  JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
  WHERE pr.organization_id = _organization_id
    AND pp.dimension = 'engagement'
    AND pr.responded_at >= since_curr
  HAVING COUNT(DISTINCT pr.user_id) >= 5;

  -- Stress previous/current
  SELECT ROUND(AVG(stress_score)::numeric,2) INTO prev_stress
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id
    AND created_at >= since_prev AND created_at < mid
  HAVING COUNT(DISTINCT user_id) >= 5;

  SELECT ROUND(AVG(stress_score)::numeric,2) INTO curr_stress
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id
    AND created_at >= since_curr
  HAVING COUNT(DISTINCT user_id) >= 5;

  participation_summary := jsonb_build_object(
    'current_participants', curr_participants,
    'previous_participants', prev_participants,
    'delta_pct', CASE WHEN prev_participants > 0
      THEN ROUND(((curr_participants::numeric - prev_participants) / prev_participants * 100)::numeric, 2)
      ELSE NULL END,
    'engagement_current', curr_engagement,
    'engagement_previous', prev_engagement,
    'stress_current', curr_stress,
    'stress_previous', prev_stress
  );

  -- Active alerts (recent)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'alert_type', alert_type, 'severity', severity, 'title', title, 'created_at', created_at
  )), '[]'::jsonb)
  INTO active_alerts
  FROM public.alerts
  WHERE organization_id = _organization_id AND status = 'open'
  ORDER BY created_at DESC
  LIMIT 20;

  RETURN jsonb_build_object(
    'period_days', _days,
    'checkin_summary', checkin_summary,
    'pulse_summary', pulse_summary,
    'weekly_trend', weekly_trend,
    'participation_summary', participation_summary,
    'active_alerts', active_alerts
  );
END;
$$;
