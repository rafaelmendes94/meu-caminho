
-- Alerts table
CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  title text NOT NULL,
  message text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_alerts_org_status ON public.alerts(organization_id, status);
CREATE INDEX idx_alerts_created ON public.alerts(organization_id, created_at DESC);

GRANT SELECT, UPDATE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RH can view org alerts"
ON public.alerts FOR SELECT TO authenticated
USING (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

CREATE POLICY "RH can update org alerts"
ON public.alerts FOR UPDATE TO authenticated
USING (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
)
WITH CHECK (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

-- Aggregate function: RH dashboard summary
CREATE OR REPLACE FUNCTION public.get_rh_dashboard_summary(_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  checkin_participants bigint := 0;
  avg_mood numeric;
  avg_energy numeric;
  avg_stress numeric;
  equilibrium numeric;
  open_count bigint := 0;
  critical_count bigint := 0;
  pulse_row record;
  pulse_json jsonb := '{}'::jsonb;
BEGIN
  IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
    RAISE EXCEPTION 'organization mismatch';
  END IF;

  SELECT
    COUNT(DISTINCT user_id),
    ROUND(AVG(mood_score)::numeric, 2),
    ROUND(AVG(energy_score)::numeric, 2),
    ROUND(AVG(stress_score)::numeric, 2)
  INTO checkin_participants, avg_mood, avg_energy, avg_stress
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id
    AND created_at >= now() - interval '30 days';

  IF checkin_participants < 5 THEN
    avg_mood := NULL;
    avg_energy := NULL;
    avg_stress := NULL;
    equilibrium := NULL;
  ELSE
    equilibrium := ROUND(((COALESCE(avg_mood,0) + COALESCE(avg_energy,0) + (5 - COALESCE(avg_stress,0))) / 3.0)::numeric, 2);
  END IF;

  FOR pulse_row IN
    SELECT pp.dimension,
      ROUND(AVG(pr.value_num)::numeric, 2) AS avg_value,
      COUNT(DISTINCT pr.user_id) AS participants
    FROM public.pulse_responses pr
    JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
    WHERE pr.organization_id = _organization_id
      AND pr.responded_at >= now() - interval '30 days'
    GROUP BY pp.dimension
  LOOP
    IF pulse_row.participants >= 5 THEN
      pulse_json := pulse_json || jsonb_build_object(pulse_row.dimension, pulse_row.avg_value);
    ELSE
      pulse_json := pulse_json || jsonb_build_object(pulse_row.dimension, NULL);
    END IF;
  END LOOP;

  SELECT COUNT(*) FILTER (WHERE status = 'open'),
         COUNT(*) FILTER (WHERE status = 'open' AND severity = 'critical')
  INTO open_count, critical_count
  FROM public.alerts
  WHERE organization_id = _organization_id;

  result := jsonb_build_object(
    'avg_mood_30d', avg_mood,
    'avg_energy_30d', avg_energy,
    'avg_stress_30d', avg_stress,
    'equilibrium_index_30d', equilibrium,
    'checkin_participants_30d', checkin_participants,
    'pulse_energy_30d', pulse_json->'energy',
    'pulse_engagement_30d', pulse_json->'engagement',
    'pulse_communication_30d', pulse_json->'communication',
    'pulse_equilibrium_30d', pulse_json->'equilibrium',
    'pulse_recovery_30d', pulse_json->'recovery',
    'pulse_participants_30d', (
      SELECT COUNT(DISTINCT user_id) FROM public.pulse_responses
      WHERE organization_id = _organization_id
        AND responded_at >= now() - interval '30 days'
    ),
    'open_alerts_count', open_count,
    'critical_alerts_count', critical_count
  );

  RETURN result;
END;
$$;

-- Emotional map (weekly)
CREATE OR REPLACE FUNCTION public.get_emotional_map(_organization_id uuid, _weeks int DEFAULT 8)
RETURNS TABLE(week_of date, avg_mood numeric, avg_energy numeric, avg_stress numeric, equilibrium_index numeric, participants_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ec.week_of,
    ROUND(AVG(ec.mood_score)::numeric, 2) AS avg_mood,
    ROUND(AVG(ec.energy_score)::numeric, 2) AS avg_energy,
    ROUND(AVG(ec.stress_score)::numeric, 2) AS avg_stress,
    ROUND(((AVG(ec.mood_score) + AVG(ec.energy_score) + (5 - AVG(ec.stress_score))) / 3.0)::numeric, 2) AS equilibrium_index,
    COUNT(DISTINCT ec.user_id) AS participants_count
  FROM public.emotional_checkins ec
  WHERE ec.organization_id = _organization_id
    AND ec.week_of >= (current_date - (_weeks || ' weeks')::interval)::date
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
    AND _organization_id = public.current_organization_id()
  GROUP BY ec.week_of
  HAVING COUNT(DISTINCT ec.user_id) >= 5
  ORDER BY ec.week_of DESC;
$$;

-- Capacity pulse (delegates to existing aggregate)
CREATE OR REPLACE FUNCTION public.get_capacity_pulse(_organization_id uuid, _days int DEFAULT 30)
RETURNS TABLE(dimension text, avg_value numeric, participants_count bigint, response_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.get_pulse_aggregate(_organization_id, _days);
$$;
