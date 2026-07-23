CREATE OR REPLACE FUNCTION public.billing_overview()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_mrr_cents bigint := 0;
  v_arr_cents bigint := 0;
  v_revenue_month_cents bigint := 0;
  v_revenue_year_cents bigint := 0;
  v_trials bigint := 0;
  v_active bigint := 0;
  v_past_due bigint := 0;
  v_canceled bigint := 0;
  v_new_active_30d bigint := 0;
  v_churned_30d bigint := 0;
  v_conversion_rate numeric;
  v_churn_rate numeric;
  v_avg_mrr_per_customer numeric;
  v_ltv_cents numeric;
  v_stripe_connected bigint := 0;
  v_total_orgs bigint := 0;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT
    COALESCE(SUM(CASE WHEN o.subscription_status IN ('active','past_due','grace_period') THEN COALESCE(o.mrr_cents,0) ELSE 0 END),0),
    COUNT(*) FILTER (WHERE o.subscription_status='trialing'),
    COUNT(*) FILTER (WHERE o.subscription_status='active'),
    COUNT(*) FILTER (WHERE o.subscription_status='past_due'),
    COUNT(*) FILTER (WHERE o.subscription_status='canceled'),
    COUNT(*) FILTER (WHERE o.stripe_customer_id IS NOT NULL),
    COUNT(*)
  INTO v_mrr_cents, v_trials, v_active, v_past_due, v_canceled, v_stripe_connected, v_total_orgs
  FROM public.organizations o
  WHERE o.deleted_at IS NULL;

  v_arr_cents := v_mrr_cents * 12;
  v_revenue_month_cents := v_mrr_cents;
  v_revenue_year_cents := v_arr_cents;

  SELECT COUNT(*) INTO v_new_active_30d
  FROM public.organizations o
  WHERE o.deleted_at IS NULL AND o.subscription_status='active'
    AND o.created_at >= now() - interval '30 days';

  SELECT COUNT(*) INTO v_churned_30d
  FROM public.organizations o
  WHERE o.deleted_at IS NULL AND o.subscription_status='canceled'
    AND o.updated_at >= now() - interval '30 days';

  IF (v_trials + v_new_active_30d) > 0 THEN
    v_conversion_rate := ROUND((v_new_active_30d::numeric / GREATEST(v_trials + v_new_active_30d,1)) * 100, 2);
  END IF;

  IF v_active > 0 THEN
    v_churn_rate := ROUND((v_churned_30d::numeric / GREATEST(v_active + v_churned_30d,1)) * 100, 2);
  END IF;

  IF v_active > 0 THEN
    v_avg_mrr_per_customer := ROUND(v_mrr_cents::numeric / v_active, 2);
  END IF;

  IF v_churn_rate IS NOT NULL AND v_churn_rate > 0 AND v_avg_mrr_per_customer IS NOT NULL THEN
    v_ltv_cents := ROUND(v_avg_mrr_per_customer / (v_churn_rate / 100), 2);
  END IF;

  RETURN jsonb_build_object(
    'stripe_connected_count', v_stripe_connected,
    'total_organizations', v_total_orgs,
    'has_billing_data', v_stripe_connected > 0 OR v_mrr_cents > 0,
    'mrr_cents', v_mrr_cents,
    'arr_cents', v_arr_cents,
    'revenue_month_cents', v_revenue_month_cents,
    'revenue_year_cents', v_revenue_year_cents,
    'trials', v_trials,
    'active', v_active,
    'past_due', v_past_due,
    'canceled', v_canceled,
    'new_active_30d', v_new_active_30d,
    'churned_30d', v_churned_30d,
    'conversion_rate_pct', v_conversion_rate,
    'churn_rate_pct', v_churn_rate,
    'avg_mrr_per_customer_cents', v_avg_mrr_per_customer,
    'ltv_cents', v_ltv_cents,
    'cac_cents', NULL
  );
END;
$function$;