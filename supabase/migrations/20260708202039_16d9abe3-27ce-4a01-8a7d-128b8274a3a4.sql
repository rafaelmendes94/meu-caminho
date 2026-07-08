
CREATE OR REPLACE FUNCTION public.get_ai_usage(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since date := (current_date - GREATEST(_days,1) + 1);
  totals jsonb;
  daily jsonb;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT jsonb_build_object(
    'messages', COALESCE(SUM(ai_messages_count),0),
    'exec_messages', COALESCE(SUM(executive_ai_messages_count),0),
    'tokens_in', COALESCE(SUM(tokens_in),0),
    'tokens_out', COALESCE(SUM(tokens_out),0),
    'tokens_total', COALESCE(SUM(tokens_in+tokens_out),0),
    'cost_cents', COALESCE(SUM(estimated_ai_cost_cents),0),
    'dna_reports', COALESCE(SUM(dna_reports_count),0),
    'action_plans', COALESCE(SUM(action_plans_count),0),
    'rituals', COALESCE(SUM(rituals_count),0),
    'active_orgs', COUNT(DISTINCT organization_id)
  ) INTO totals
  FROM public.platform_usage_daily
  WHERE usage_date >= since;

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.usage_date), '[]'::jsonb) INTO daily
  FROM (
    SELECT usage_date,
           SUM(ai_messages_count)::int AS messages,
           SUM(executive_ai_messages_count)::int AS exec_messages,
           SUM(tokens_in)::int AS tokens_in,
           SUM(tokens_out)::int AS tokens_out,
           SUM(estimated_ai_cost_cents)::int AS cost_cents
    FROM public.platform_usage_daily
    WHERE usage_date >= since
    GROUP BY usage_date
  ) t;

  RETURN jsonb_build_object(
    'period_days', _days,
    'since', since,
    'totals', totals,
    'daily', daily
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_ai_costs(_days integer DEFAULT 30)
RETURNS TABLE(
  organization_id uuid,
  organization_name text,
  messages bigint,
  exec_messages bigint,
  tokens_in bigint,
  tokens_out bigint,
  tokens_total bigint,
  dna_reports bigint,
  action_plans bigint,
  rituals bigint,
  cost_cents bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since date := (current_date - GREATEST(_days,1) + 1);
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT o.id, o.name,
    COALESCE(SUM(u.ai_messages_count),0)::bigint,
    COALESCE(SUM(u.executive_ai_messages_count),0)::bigint,
    COALESCE(SUM(u.tokens_in),0)::bigint,
    COALESCE(SUM(u.tokens_out),0)::bigint,
    COALESCE(SUM(u.tokens_in + u.tokens_out),0)::bigint,
    COALESCE(SUM(u.dna_reports_count),0)::bigint,
    COALESCE(SUM(u.action_plans_count),0)::bigint,
    COALESCE(SUM(u.rituals_count),0)::bigint,
    COALESCE(SUM(u.estimated_ai_cost_cents),0)::bigint
  FROM public.organizations o
  LEFT JOIN public.platform_usage_daily u
    ON u.organization_id = o.id AND u.usage_date >= since
  WHERE o.deleted_at IS NULL AND o.archived_at IS NULL
  GROUP BY o.id, o.name
  ORDER BY COALESCE(SUM(u.estimated_ai_cost_cents),0) DESC NULLS LAST, o.name;
END;
$$;
