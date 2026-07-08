
CREATE TABLE public.weekly_ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  week_of date NOT NULL DEFAULT date_trunc('week', now())::date,
  title text NOT NULL,
  summary text,
  insight_type text,
  severity text,
  confidence numeric,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.weekly_ai_insights TO authenticated;
GRANT ALL ON public.weekly_ai_insights TO service_role;

ALTER TABLE public.weekly_ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RH can view weekly insights"
ON public.weekly_ai_insights
FOR SELECT
TO authenticated
USING (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

CREATE POLICY "Service role manages weekly insights"
ON public.weekly_ai_insights
FOR ALL
TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_weekly_ai_insights_org_week ON public.weekly_ai_insights(organization_id, week_of DESC);

CREATE TRIGGER trg_weekly_ai_insights_updated
BEFORE UPDATE ON public.weekly_ai_insights
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.get_weekly_ai_context(_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dna jsonb;
  dashboard jsonb;
  pulse jsonb;
  weekly jsonb;
  alerts jsonb;
  predictive jsonb;
  org_summary jsonb;
  participation jsonb;
  action_plans_active jsonb;
BEGIN
  IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) AND current_setting('role', true) <> 'service_role' THEN
    -- allow service role bypass
    IF (auth.uid() IS NOT NULL) THEN
      RAISE EXCEPTION 'not authorized';
    END IF;
  END IF;

  SELECT to_jsonb(r) INTO dna FROM (
    SELECT id, generated_at, overall_score, summary, strengths, opportunities, recommendations, dimensions, period_days
    FROM public.organizational_dna_reports
    WHERE organization_id = _organization_id
    ORDER BY generated_at DESC
    LIMIT 1
  ) r;

  dashboard := public.get_rh_dashboard_summary(_organization_id);

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
  INTO pulse
  FROM (SELECT * FROM public.get_pulse_aggregate(_organization_id, 30)) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.week_of DESC), '[]'::jsonb)
  INTO weekly
  FROM (SELECT * FROM public.get_weekly_checkin_aggregate(_organization_id)) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'alert_type', alert_type, 'severity', severity, 'title', title, 'status', status, 'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb)
  INTO alerts
  FROM public.alerts
  WHERE organization_id = _organization_id
    AND created_at >= now() - interval '30 days';

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'signal_type', signal_type, 'severity', severity, 'title', title, 'status', status, 'detected_at', detected_at
  ) ORDER BY detected_at DESC), '[]'::jsonb)
  INTO predictive
  FROM public.predictive_signals
  WHERE organization_id = _organization_id
    AND detected_at >= now() - interval '60 days';

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

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'title', title, 'status', status, 'priority', priority, 'source_type', source_type, 'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb)
  INTO action_plans_active
  FROM public.action_plans
  WHERE organization_id = _organization_id
    AND status IN ('draft','in_progress','active');

  RETURN jsonb_build_object(
    'generated_at', now(),
    'organization_id', _organization_id,
    'dna_latest', dna,
    'rh_dashboard', dashboard,
    'pulse_30d', pulse,
    'weekly_checkins', weekly,
    'alerts_30d', alerts,
    'predictive_signals_60d', predictive,
    'org_structure', org_summary,
    'participation', participation,
    'action_plans_active', action_plans_active
  );
END;
$$;
