
CREATE OR REPLACE FUNCTION public.billing_overview()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  mrr_cents bigint := 0;
  arr_cents bigint := 0;
  revenue_month_cents bigint := 0;
  revenue_year_cents bigint := 0;
  trials bigint := 0;
  active bigint := 0;
  past_due bigint := 0;
  canceled bigint := 0;
  new_active_30d bigint := 0;
  churned_30d bigint := 0;
  conversion_rate numeric;
  churn_rate numeric;
  avg_mrr_per_customer numeric;
  ltv_cents numeric;
  stripe_connected bigint := 0;
  total_orgs bigint := 0;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT
    COALESCE(SUM(CASE WHEN subscription_status IN ('active','past_due','grace_period') THEN COALESCE(mrr_cents,0) ELSE 0 END),0),
    COUNT(*) FILTER (WHERE subscription_status='trialing'),
    COUNT(*) FILTER (WHERE subscription_status='active'),
    COUNT(*) FILTER (WHERE subscription_status='past_due'),
    COUNT(*) FILTER (WHERE subscription_status='canceled'),
    COUNT(*) FILTER (WHERE stripe_customer_id IS NOT NULL),
    COUNT(*)
  INTO mrr_cents, trials, active, past_due, canceled, stripe_connected, total_orgs
  FROM public.organizations
  WHERE deleted_at IS NULL;

  arr_cents := mrr_cents * 12;
  revenue_month_cents := mrr_cents;
  revenue_year_cents := arr_cents;

  SELECT COUNT(*) INTO new_active_30d
  FROM public.organizations
  WHERE deleted_at IS NULL AND subscription_status='active'
    AND created_at >= now() - interval '30 days';

  SELECT COUNT(*) INTO churned_30d
  FROM public.organizations
  WHERE deleted_at IS NULL AND subscription_status='canceled'
    AND updated_at >= now() - interval '30 days';

  IF (trials + new_active_30d) > 0 THEN
    conversion_rate := ROUND((new_active_30d::numeric / GREATEST(trials + new_active_30d,1)) * 100, 2);
  END IF;

  IF active > 0 THEN
    churn_rate := ROUND((churned_30d::numeric / GREATEST(active + churned_30d,1)) * 100, 2);
  END IF;

  IF active > 0 THEN
    avg_mrr_per_customer := ROUND(mrr_cents::numeric / active, 2);
  END IF;

  IF churn_rate IS NOT NULL AND churn_rate > 0 AND avg_mrr_per_customer IS NOT NULL THEN
    ltv_cents := ROUND(avg_mrr_per_customer / (churn_rate / 100), 2);
  END IF;

  RETURN jsonb_build_object(
    'stripe_connected_count', stripe_connected,
    'total_organizations', total_orgs,
    'has_billing_data', stripe_connected > 0 OR mrr_cents > 0,
    'mrr_cents', mrr_cents,
    'arr_cents', arr_cents,
    'revenue_month_cents', revenue_month_cents,
    'revenue_year_cents', revenue_year_cents,
    'trials', trials,
    'active', active,
    'past_due', past_due,
    'canceled', canceled,
    'new_active_30d', new_active_30d,
    'churned_30d', churned_30d,
    'conversion_rate_pct', conversion_rate,
    'churn_rate_pct', churn_rate,
    'avg_mrr_per_customer_cents', avg_mrr_per_customer,
    'ltv_cents', ltv_cents,
    'cac_cents', NULL
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.billing_overview() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.billing_overview() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.billing_organizations()
 RETURNS TABLE(
   id uuid, name text, plan text, subscription_status text,
   current_period_end timestamptz, trial_ends_at timestamptz,
   mrr_cents integer, licenses_total integer, licenses_used integer,
   days_remaining integer,
   stripe_customer_id text, stripe_subscription_id text
 )
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
    o.id, o.name, o.plan, o.subscription_status::text,
    o.current_period_end, o.trial_ends_at,
    o.mrr_cents, o.licenses_total, o.licenses_used,
    CASE
      WHEN o.subscription_status = 'trialing' AND o.trial_ends_at IS NOT NULL
        THEN GREATEST(0, EXTRACT(DAY FROM (o.trial_ends_at - now()))::int)
      WHEN o.current_period_end IS NOT NULL
        THEN EXTRACT(DAY FROM (o.current_period_end - now()))::int
      ELSE NULL
    END AS days_remaining,
    o.stripe_customer_id, o.stripe_subscription_id
  FROM public.organizations o
  WHERE o.deleted_at IS NULL AND o.archived_at IS NULL
  ORDER BY o.mrr_cents DESC NULLS LAST, o.created_at DESC;
END;
$function$;

REVOKE ALL ON FUNCTION public.billing_organizations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.billing_organizations() TO authenticated, service_role;
