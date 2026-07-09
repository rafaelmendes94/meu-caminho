CREATE OR REPLACE FUNCTION public.get_platform_organizations(_search text DEFAULT NULL::text, _status text DEFAULT NULL::text, _include_archived boolean DEFAULT false, _limit integer DEFAULT 50, _offset integer DEFAULT 0, _sort text DEFAULT 'created_desc'::text)
 RETURNS TABLE(id uuid, name text, slug text, plan text, subscription_status text, licenses_total integer, licenses_used integer, created_at timestamp with time zone, archived_at timestamp with time zone, suspended_at timestamp with time zone, active_users_30d bigint, ai_messages_30d bigint, last_activity_at timestamp with time zone, last_dna_generated_at timestamp with time zone, last_score numeric, health_status text, total_count bigint, responsible_name text, responsible_email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  total bigint;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COUNT(*) INTO total FROM public.organizations o
  WHERE o.deleted_at IS NULL
    AND (_include_archived OR o.archived_at IS NULL)
    AND (_search IS NULL
         OR o.name ILIKE '%'||_search||'%'
         OR o.slug ILIKE '%'||_search||'%'
         OR COALESCE(o.cnpj,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.domain,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.responsible_name,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.responsible_email,'') ILIKE '%'||_search||'%')
    AND (_status IS NULL OR o.subscription_status::text = _status);

  RETURN QUERY
  SELECT
    o.id, o.name, o.slug, o.plan, o.subscription_status::text,
    o.licenses_total::int, o.licenses_used::int, o.created_at,
    o.archived_at, o.suspended_at,
    COALESCE((
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT ec.user_id FROM public.emotional_checkins ec
        WHERE ec.organization_id = o.id AND ec.created_at >= now() - interval '30 days'
        UNION
        SELECT pr.user_id FROM public.pulse_responses pr
        WHERE pr.organization_id = o.id AND pr.responded_at >= now() - interval '30 days'
      ) u
    ), 0)::bigint,
    COALESCE((
      SELECT SUM(pu.ai_messages_count) FROM public.platform_usage_daily pu
      WHERE pu.organization_id = o.id AND pu.usage_date >= (current_date - 30)
    ), 0)::bigint,
    (
      SELECT GREATEST(
        COALESCE((SELECT MAX(ec2.created_at) FROM public.emotional_checkins ec2 WHERE ec2.organization_id=o.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(pr2.responded_at) FROM public.pulse_responses pr2 WHERE pr2.organization_id=o.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(pu2.usage_date)::timestamptz FROM public.platform_usage_daily pu2 WHERE pu2.organization_id=o.id), 'epoch'::timestamptz)
      )
    ),
    (SELECT d.generated_at FROM public.organizational_dna_reports d WHERE d.organization_id=o.id ORDER BY d.generated_at DESC LIMIT 1),
    (SELECT s.overall_score FROM public.organizational_scores s WHERE s.organization_id=o.id ORDER BY s.score_date DESC LIMIT 1),
    (CASE
      WHEN o.archived_at IS NOT NULL THEN 'archived'
      WHEN o.suspended_at IS NOT NULL OR o.subscription_status::text IN ('canceled','past_due','suspended') THEN 'at_risk'
      WHEN o.licenses_used > o.licenses_total THEN 'over_limit'
      WHEN (SELECT COUNT(*) FROM public.alerts a WHERE a.organization_id=o.id AND a.status='open' AND a.severity='critical') > 2 THEN 'attention'
      ELSE 'healthy'
    END)::text,
    total,
    o.responsible_name,
    o.responsible_email
  FROM public.organizations o
  WHERE o.deleted_at IS NULL
    AND (_include_archived OR o.archived_at IS NULL)
    AND (_search IS NULL
         OR o.name ILIKE '%'||_search||'%'
         OR o.slug ILIKE '%'||_search||'%'
         OR COALESCE(o.cnpj,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.domain,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.responsible_name,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.responsible_email,'') ILIKE '%'||_search||'%')
    AND (_status IS NULL OR o.subscription_status::text = _status)
  ORDER BY
    CASE WHEN _sort='created_asc'  THEN o.created_at END ASC,
    CASE WHEN _sort='created_desc' THEN o.created_at END DESC,
    CASE WHEN _sort='name_asc'     THEN o.name END ASC,
    CASE WHEN _sort='name_desc'    THEN o.name END DESC,
    CASE WHEN _sort='licenses_desc' THEN o.licenses_used END DESC NULLS LAST
  LIMIT _limit OFFSET _offset;
END;
$function$;