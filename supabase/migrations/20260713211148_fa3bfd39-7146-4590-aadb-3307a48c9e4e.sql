
-- Admin-only variant of get_executive_context for the Sub-fase B chat tester.
-- Reuses the same aggregated JSON payload, but gated by is_platform_admin().
CREATE OR REPLACE FUNCTION public.get_executive_context_admin(_organization_id uuid)
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
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
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
    'test_mode', true,
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

REVOKE ALL ON FUNCTION public.get_executive_context_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_executive_context_admin(uuid) TO authenticated, service_role;
