
-- Add suspension detail fields
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS suspension_until timestamptz;

-- RPC: list all owners (platform admin only)
CREATE OR REPLACE FUNCTION public.admin_list_owners()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  email text,
  phone text,
  organization_id uuid,
  organization_name text,
  plan text,
  subscription_status text,
  licenses_total integer,
  licenses_used integer,
  last_sign_in_at timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  suspended_at timestamptz,
  suspension_reason text,
  suspension_until timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  invite_accepted_at timestamptz,
  mrr_cents integer,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  RETURN QUERY
  SELECT
    ur.user_id,
    p.full_name,
    au.email::text,
    p.phone,
    o.id AS organization_id,
    o.name AS organization_name,
    o.plan,
    o.subscription_status::text,
    o.licenses_total,
    o.licenses_used,
    au.last_sign_in_at,
    o.current_period_end,
    o.trial_ends_at,
    o.suspended_at,
    o.suspension_reason,
    o.suspension_until,
    o.archived_at,
    o.deleted_at,
    au.confirmed_at AS invite_accepted_at,
    o.mrr_cents,
    o.stripe_customer_id,
    o.stripe_subscription_id,
    COALESCE(p.created_at, au.created_at) AS created_at
  FROM public.user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  LEFT JOIN public.profiles p ON p.id = ur.user_id
  LEFT JOIN public.organizations o ON o.id = ur.organization_id
  WHERE ur.role = 'owner'
  ORDER BY COALESCE(p.created_at, au.created_at) DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_owners() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_owners() TO authenticated;

-- RPC: aggregated KPIs for the Owners dashboard
CREATE OR REPLACE FUNCTION public.admin_owners_kpis()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH owners AS (
    SELECT ur.user_id, ur.organization_id, o.subscription_status::text AS status,
           o.suspended_at, o.deleted_at, o.mrr_cents,
           o.licenses_total, o.licenses_used, au.last_sign_in_at
    FROM public.user_roles ur
    JOIN auth.users au ON au.id = ur.user_id
    LEFT JOIN public.organizations o ON o.id = ur.organization_id
    WHERE ur.role = 'owner'
  )
  SELECT jsonb_build_object(
    'active', COUNT(*) FILTER (WHERE status='active' AND suspended_at IS NULL AND deleted_at IS NULL),
    'trialing', COUNT(*) FILTER (WHERE status='trialing' AND suspended_at IS NULL AND deleted_at IS NULL),
    'suspended', COUNT(*) FILTER (WHERE suspended_at IS NOT NULL AND deleted_at IS NULL),
    'never_accessed', COUNT(*) FILTER (WHERE last_sign_in_at IS NULL AND deleted_at IS NULL),
    'deleted', COUNT(*) FILTER (WHERE deleted_at IS NOT NULL),
    'licenses_total', COALESCE(SUM(licenses_total),0),
    'licenses_used', COALESCE(SUM(licenses_used),0),
    'licenses_free', GREATEST(0, COALESCE(SUM(licenses_total),0) - COALESCE(SUM(licenses_used),0)),
    'mrr_cents', COALESCE(SUM(mrr_cents) FILTER (WHERE suspended_at IS NULL AND deleted_at IS NULL),0),
    'arr_cents', COALESCE(SUM(mrr_cents) FILTER (WHERE suspended_at IS NULL AND deleted_at IS NULL),0) * 12,
    'churn_90d', (
      SELECT COUNT(*) FROM public.organizations
      WHERE (deleted_at >= now() - interval '90 days'
             OR (subscription_status = 'canceled' AND updated_at >= now() - interval '90 days'))
    )
  ) INTO result
  FROM owners;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_owners_kpis() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_owners_kpis() TO authenticated;
