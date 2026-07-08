
-- Fix enum vs text mismatch on get_platform_organizations and add get_platform_dashboard_summary

CREATE OR REPLACE FUNCTION public.get_platform_organizations()
 RETURNS TABLE(id uuid, name text, slug text, subscription_status text, licenses_total integer, licenses_used integer, created_at timestamp with time zone, active_users_30d bigint, ai_messages_30d bigint, last_dna_generated_at timestamp with time zone, last_score numeric, health_status text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.slug,
    o.subscription_status::text,
    o.licenses_total::int,
    o.licenses_used::int,
    o.created_at,
    COALESCE((
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT ec.user_id FROM public.emotional_checkins ec
        WHERE ec.organization_id = o.id AND ec.created_at >= now() - interval '30 days'
        UNION
        SELECT pr.user_id FROM public.pulse_responses pr
        WHERE pr.organization_id = o.id AND pr.responded_at >= now() - interval '30 days'
      ) u
    ), 0)::bigint AS active_users_30d,
    COALESCE((
      SELECT SUM(pu.ai_messages_count) FROM public.platform_usage_daily pu
      WHERE pu.organization_id = o.id AND pu.usage_date >= (current_date - 30)
    ), 0)::bigint AS ai_messages_30d,
    (
      SELECT d.generated_at FROM public.organizational_dna_reports d
      WHERE d.organization_id = o.id ORDER BY d.generated_at DESC LIMIT 1
    ) AS last_dna_generated_at,
    (
      SELECT s.overall_score FROM public.organizational_scores s
      WHERE s.organization_id = o.id ORDER BY s.score_date DESC LIMIT 1
    ) AS last_score,
    (CASE
      WHEN o.subscription_status::text IN ('canceled','past_due') THEN 'at_risk'
      WHEN o.licenses_used > o.licenses_total THEN 'over_limit'
      WHEN (
        SELECT COUNT(*) FROM public.alerts a
        WHERE a.organization_id = o.id AND a.status = 'open' AND a.severity = 'critical'
      ) > 2 THEN 'attention'
      ELSE 'healthy'
    END)::text AS health_status
  FROM public.organizations o
  ORDER BY o.created_at DESC;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_platform_organizations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_organizations() TO authenticated, service_role;

-- Alias RPC requested by FASE SUPER ADMIN 01
CREATE OR REPLACE FUNCTION public.get_platform_dashboard_summary()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base jsonb;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  base := public.get_platform_overview();
  RETURN jsonb_build_object(
    'organizations_total', base->'total_organizations',
    'organizations_active', base->'active_organizations',
    'trial_count', base->'trialing_organizations',
    'past_due_count', base->'past_due_organizations',
    'cancelled_count', base->'canceled_organizations',
    'licenses_total', base->'total_licenses',
    'licenses_used', base->'licenses_used',
    'active_users_30d', base->'total_active_users_30d',
    'ai_messages_30d', base->'total_ai_messages_30d',
    'ai_tokens_30d', base->'total_tokens_30d',
    'ai_cost_estimate', base->'estimated_ai_cost_30d',
    'open_tickets', base->'open_support_tickets'
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.get_platform_dashboard_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_dashboard_summary() TO authenticated, service_role;
