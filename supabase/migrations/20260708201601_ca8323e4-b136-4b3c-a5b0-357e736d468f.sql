
-- 1. New columns on organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. Extend enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid
                 WHERE t.typname='subscription_status' AND e.enumlabel='suspended') THEN
    ALTER TYPE public.subscription_status ADD VALUE 'suspended';
  END IF;
END $$;

-- 3. RLS: platform_admin full access
DROP POLICY IF EXISTS "org_platform_admin_all" ON public.organizations;
CREATE POLICY "org_platform_admin_all" ON public.organizations
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- 4. Detailed function
CREATE OR REPLACE FUNCTION public.get_platform_organization_details(_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  org record;
  since_30d timestamptz := now() - interval '30 days';
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO org FROM public.organizations WHERE id = _id;
  IF org.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'organization', jsonb_build_object(
      'id', org.id, 'name', org.name, 'slug', org.slug, 'cnpj', org.cnpj,
      'domain', org.domain, 'logo_url', org.logo_url,
      'plan', org.plan,
      'subscription_status', org.subscription_status::text,
      'trial_ends_at', org.trial_ends_at, 'current_period_end', org.current_period_end,
      'licenses_total', org.licenses_total, 'licenses_used', org.licenses_used,
      'mrr_cents', org.mrr_cents,
      'stripe_customer_id', org.stripe_customer_id,
      'stripe_subscription_id', org.stripe_subscription_id,
      'internal_notes', org.internal_notes,
      'suspended_at', org.suspended_at,
      'archived_at', org.archived_at,
      'deleted_at', org.deleted_at,
      'created_at', org.created_at,
      'updated_at', org.updated_at
    ),
    'counts', jsonb_build_object(
      'profiles', (SELECT COUNT(*) FROM public.profiles WHERE organization_id = _id),
      'admins', (SELECT COUNT(*) FROM public.user_roles WHERE organization_id = _id AND role IN ('owner','rh_admin')),
      'departments', (SELECT COUNT(*) FROM public.departments WHERE organization_id = _id),
      'units', (SELECT COUNT(*) FROM public.units WHERE organization_id = _id),
      'open_alerts', (SELECT COUNT(*) FROM public.alerts WHERE organization_id = _id AND status='open'),
      'open_tickets', (SELECT COUNT(*) FROM public.support_tickets WHERE organization_id = _id AND status IN ('open','in_progress'))
    ),
    'usage_30d', jsonb_build_object(
      'active_users', (
        SELECT COUNT(DISTINCT user_id) FROM (
          SELECT user_id FROM public.emotional_checkins WHERE organization_id=_id AND created_at>=since_30d
          UNION SELECT user_id FROM public.pulse_responses WHERE organization_id=_id AND responded_at>=since_30d
        ) u
      ),
      'ai_messages', COALESCE((SELECT SUM(ai_messages_count) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0),
      'tokens', COALESCE((SELECT SUM(tokens_in+tokens_out) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0),
      'ai_cost_cents', COALESCE((SELECT SUM(estimated_ai_cost_cents) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0),
      'checkins', COALESCE((SELECT SUM(checkins_count) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0)
    ),
    'usage_daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'usage_date', usage_date, 'ai_messages', ai_messages_count,
        'tokens', tokens_in+tokens_out, 'cost_cents', estimated_ai_cost_cents,
        'checkins', checkins_count
      ) ORDER BY usage_date DESC)
      FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30
    ), '[]'::jsonb),
    'latest', jsonb_build_object(
      'last_dna_at', (SELECT generated_at FROM public.organizational_dna_reports WHERE organization_id=_id ORDER BY generated_at DESC LIMIT 1),
      'last_score', (SELECT overall_score FROM public.organizational_scores WHERE organization_id=_id ORDER BY score_date DESC LIMIT 1),
      'last_score_date', (SELECT score_date FROM public.organizational_scores WHERE organization_id=_id ORDER BY score_date DESC LIMIT 1),
      'last_activity_at', (
        SELECT GREATEST(
          COALESCE((SELECT MAX(created_at) FROM public.emotional_checkins WHERE organization_id=_id), 'epoch'::timestamptz),
          COALESCE((SELECT MAX(responded_at) FROM public.pulse_responses WHERE organization_id=_id), 'epoch'::timestamptz),
          COALESCE((SELECT MAX(usage_date)::timestamptz FROM public.platform_usage_daily WHERE organization_id=_id), 'epoch'::timestamptz)
        )
      )
    ),
    'tickets', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'title', title, 'status', status, 'priority', priority, 'created_at', created_at
      ) ORDER BY created_at DESC)
      FROM (SELECT * FROM public.support_tickets WHERE organization_id=_id ORDER BY created_at DESC LIMIT 20) t
    ), '[]'::jsonb),
    'audit_logs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'action', action, 'entity_type', entity_type, 'metadata', metadata, 'created_at', created_at
      ) ORDER BY created_at DESC)
      FROM (SELECT * FROM public.platform_audit_logs WHERE organization_id=_id ORDER BY created_at DESC LIMIT 30) l
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_platform_organization_details(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_organization_details(uuid) TO authenticated, service_role;

-- 5. Enhanced list: adds plan, last_activity_at, respects soft delete/archive
DROP FUNCTION IF EXISTS public.get_platform_organizations();
CREATE OR REPLACE FUNCTION public.get_platform_organizations(
  _search text DEFAULT NULL,
  _status text DEFAULT NULL,
  _include_archived boolean DEFAULT false,
  _limit int DEFAULT 50,
  _offset int DEFAULT 0,
  _sort text DEFAULT 'created_desc'
)
 RETURNS TABLE(
   id uuid, name text, slug text, plan text, subscription_status text,
   licenses_total integer, licenses_used integer,
   created_at timestamp with time zone,
   archived_at timestamp with time zone,
   suspended_at timestamp with time zone,
   active_users_30d bigint, ai_messages_30d bigint,
   last_activity_at timestamp with time zone,
   last_dna_generated_at timestamp with time zone,
   last_score numeric, health_status text, total_count bigint
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
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
    AND (_search IS NULL OR o.name ILIKE '%'||_search||'%' OR o.slug ILIKE '%'||_search||'%')
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
        COALESCE((SELECT MAX(created_at) FROM public.emotional_checkins WHERE organization_id=o.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(responded_at) FROM public.pulse_responses WHERE organization_id=o.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(usage_date)::timestamptz FROM public.platform_usage_daily WHERE organization_id=o.id), 'epoch'::timestamptz)
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
    total
  FROM public.organizations o
  WHERE o.deleted_at IS NULL
    AND (_include_archived OR o.archived_at IS NULL)
    AND (_search IS NULL OR o.name ILIKE '%'||_search||'%' OR o.slug ILIKE '%'||_search||'%')
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

REVOKE ALL ON FUNCTION public.get_platform_organizations(text,text,boolean,int,int,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_organizations(text,text,boolean,int,int,text) TO authenticated, service_role;
