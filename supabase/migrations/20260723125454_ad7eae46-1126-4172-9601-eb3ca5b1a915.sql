
-- Recompute platform_usage_daily from raw tables for the last 90 days,
-- and update get_platform_analytics to compute the daily series directly
-- from raw data (so it always reflects reality).

WITH days AS (
  SELECT generate_series(current_date - 89, current_date, interval '1 day')::date AS d
),
orgs AS (
  SELECT id FROM public.organizations WHERE deleted_at IS NULL
),
grid AS (
  SELECT o.id AS organization_id, d.d AS usage_date FROM orgs o CROSS JOIN days d
),
ck AS (
  SELECT organization_id, created_at::date AS d, COUNT(*) AS cnt, COUNT(DISTINCT user_id) AS uu
  FROM public.emotional_checkins
  WHERE created_at >= current_date - 89
  GROUP BY 1,2
),
pu AS (
  SELECT organization_id, responded_at::date AS d, COUNT(*) AS cnt, COUNT(DISTINCT user_id) AS uu
  FROM public.pulse_responses
  WHERE responded_at >= current_date - 89
  GROUP BY 1,2
),
dna AS (
  SELECT organization_id, generated_at::date AS d, COUNT(*) AS cnt
  FROM public.organizational_dna_reports
  WHERE generated_at >= current_date - 89
  GROUP BY 1,2
),
ap AS (
  SELECT organization_id, created_at::date AS d, COUNT(*) AS cnt
  FROM public.action_plans
  WHERE created_at >= current_date - 89
  GROUP BY 1,2
),
ri AS (
  SELECT organization_id, created_at::date AS d, COUNT(*) AS cnt
  FROM public.intelligent_rituals
  WHERE created_at >= current_date - 89
  GROUP BY 1,2
),
ex AS (
  SELECT c.organization_id, m.created_at::date AS d, COUNT(*) AS cnt
  FROM public.executive_ai_messages m
  JOIN public.executive_ai_conversations c ON c.id = m.conversation_id
  WHERE m.created_at >= current_date - 89
  GROUP BY 1,2
),
au AS (
  SELECT organization_id, d, COUNT(DISTINCT user_id) AS active_users FROM (
    SELECT organization_id, created_at::date AS d, user_id FROM public.emotional_checkins WHERE created_at >= current_date - 89
    UNION
    SELECT organization_id, responded_at::date, user_id FROM public.pulse_responses WHERE responded_at >= current_date - 89
  ) x GROUP BY 1,2
)
INSERT INTO public.platform_usage_daily (
  organization_id, usage_date, active_users, checkins_count, pulses_count,
  ai_messages_count, executive_ai_messages_count, dna_reports_count,
  action_plans_count, rituals_count, tokens_in, tokens_out, estimated_ai_cost_cents
)
SELECT
  g.organization_id, g.usage_date,
  COALESCE(au.active_users, 0),
  COALESCE(ck.cnt, 0),
  COALESCE(pu.cnt, 0),
  COALESCE(ex.cnt, 0),
  COALESCE(ex.cnt, 0),
  COALESCE(dna.cnt, 0),
  COALESCE(ap.cnt, 0),
  COALESCE(ri.cnt, 0),
  COALESCE(ex.cnt, 0) * 800,
  COALESCE(ex.cnt, 0) * 400,
  ROUND(COALESCE(ex.cnt, 0) * 1200 / 1000.0 * 0.15)::int
FROM grid g
LEFT JOIN ck  ON ck.organization_id = g.organization_id AND ck.d = g.usage_date
LEFT JOIN pu  ON pu.organization_id = g.organization_id AND pu.d = g.usage_date
LEFT JOIN dna ON dna.organization_id = g.organization_id AND dna.d = g.usage_date
LEFT JOIN ap  ON ap.organization_id = g.organization_id AND ap.d = g.usage_date
LEFT JOIN ri  ON ri.organization_id = g.organization_id AND ri.d = g.usage_date
LEFT JOIN ex  ON ex.organization_id = g.organization_id AND ex.d = g.usage_date
LEFT JOIN au  ON au.organization_id = g.organization_id AND au.d = g.usage_date
ON CONFLICT (organization_id, usage_date) DO UPDATE SET
  active_users = EXCLUDED.active_users,
  checkins_count = EXCLUDED.checkins_count,
  pulses_count = EXCLUDED.pulses_count,
  ai_messages_count = EXCLUDED.ai_messages_count,
  executive_ai_messages_count = EXCLUDED.executive_ai_messages_count,
  dna_reports_count = EXCLUDED.dna_reports_count,
  action_plans_count = EXCLUDED.action_plans_count,
  rituals_count = EXCLUDED.rituals_count,
  tokens_in = EXCLUDED.tokens_in,
  tokens_out = EXCLUDED.tokens_out,
  estimated_ai_cost_cents = EXCLUDED.estimated_ai_cost_cents;


-- Update RPC: compute daily series directly from raw data (source of truth).
CREATE OR REPLACE FUNCTION public.get_platform_analytics(_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  since_days timestamptz := now() - make_interval(days => GREATEST(_days,1));
  since_24h  timestamptz := now() - interval '1 day';
  since_7d   timestamptz := now() - interval '7 days';
  since_30d  timestamptz := now() - interval '30 days';
  since_60d  timestamptz := now() - interval '60 days';
  start_date date := (current_date - GREATEST(_days,1) + 1);

  orgs_total bigint; orgs_active bigint; users_total bigint;
  dau bigint; wau bigint; mau bigint;
  checkins bigint; pulses bigint;
  dna_reports bigint; plans bigint; rituals bigint;
  avg_impact numeric;
  engagement_rate numeric;
  retention_rate numeric;
  active_prev bigint; active_now bigint; retained bigint;
  daily jsonb;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COUNT(*) INTO orgs_total FROM public.organizations WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO orgs_active FROM public.organizations
    WHERE deleted_at IS NULL AND archived_at IS NULL
      AND subscription_status IN ('active','trialing');
  SELECT COUNT(*) INTO users_total FROM public.profiles;

  WITH activity AS (
    SELECT user_id, created_at AS at FROM public.emotional_checkins
    UNION ALL
    SELECT user_id, responded_at FROM public.pulse_responses
  )
  SELECT
    COUNT(DISTINCT user_id) FILTER (WHERE at >= since_24h),
    COUNT(DISTINCT user_id) FILTER (WHERE at >= since_7d),
    COUNT(DISTINCT user_id) FILTER (WHERE at >= since_30d)
  INTO dau, wau, mau FROM activity;

  SELECT COUNT(*) INTO checkins FROM public.emotional_checkins WHERE created_at >= since_days;
  SELECT COUNT(*) INTO pulses   FROM public.pulse_responses    WHERE responded_at >= since_days;
  SELECT COUNT(*) INTO dna_reports FROM public.organizational_dna_reports WHERE generated_at >= since_days;
  SELECT COUNT(*) INTO plans    FROM public.action_plans        WHERE created_at >= since_days;
  SELECT COUNT(*) INTO rituals  FROM public.intelligent_rituals WHERE created_at >= since_days;

  SELECT ROUND(AVG(impact_score)::numeric, 2) INTO avg_impact
  FROM public.impact_measurements WHERE measured_at >= since_days;

  IF users_total > 0 THEN
    engagement_rate := ROUND((mau::numeric / users_total * 100), 2);
  ELSE
    engagement_rate := 0;
  END IF;

  WITH prev AS (
    SELECT DISTINCT user_id FROM (
      SELECT user_id, created_at AS at FROM public.emotional_checkins
      UNION ALL SELECT user_id, responded_at FROM public.pulse_responses
    ) x WHERE at >= since_60d AND at < since_30d
  ),
  now_active AS (
    SELECT DISTINCT user_id FROM (
      SELECT user_id, created_at AS at FROM public.emotional_checkins
      UNION ALL SELECT user_id, responded_at FROM public.pulse_responses
    ) x WHERE at >= since_30d
  )
  SELECT (SELECT COUNT(*) FROM prev),
         (SELECT COUNT(*) FROM now_active),
         (SELECT COUNT(*) FROM prev p JOIN now_active n ON n.user_id = p.user_id)
  INTO active_prev, active_now, retained;

  IF active_prev > 0 THEN
    retention_rate := ROUND((retained::numeric / active_prev * 100), 2);
  ELSE
    retention_rate := NULL;
  END IF;

  -- Daily series computed directly from raw sources so it always reflects reality.
  WITH days AS (
    SELECT generate_series(start_date, current_date, interval '1 day')::date AS d
  ),
  ck AS (
    SELECT created_at::date AS d, COUNT(*) AS cnt, COUNT(DISTINCT user_id) AS uu
    FROM public.emotional_checkins WHERE created_at >= start_date GROUP BY 1
  ),
  pu AS (
    SELECT responded_at::date AS d, COUNT(*) AS cnt, COUNT(DISTINCT user_id) AS uu
    FROM public.pulse_responses WHERE responded_at >= start_date GROUP BY 1
  ),
  ex AS (
    SELECT m.created_at::date AS d, COUNT(*) AS cnt
    FROM public.executive_ai_messages m
    WHERE m.created_at >= start_date GROUP BY 1
  ),
  au AS (
    SELECT d, COUNT(DISTINCT user_id) AS active_users FROM (
      SELECT created_at::date AS d, user_id FROM public.emotional_checkins WHERE created_at >= start_date
      UNION
      SELECT responded_at::date, user_id FROM public.pulse_responses WHERE responded_at >= start_date
    ) x GROUP BY 1
  )
  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.day), '[]'::jsonb) INTO daily
  FROM (
    SELECT
      to_char(d.d, 'YYYY-MM-DD') AS day,
      COALESCE(au.active_users, 0)::int AS active_users,
      COALESCE(ck.cnt, 0)::int AS checkins,
      COALESCE(pu.cnt, 0)::int AS pulses,
      COALESCE(ex.cnt, 0)::int AS ai_messages
    FROM days d
    LEFT JOIN ck ON ck.d = d.d
    LEFT JOIN pu ON pu.d = d.d
    LEFT JOIN ex ON ex.d = d.d
    LEFT JOIN au ON au.d = d.d
  ) t;

  RETURN jsonb_build_object(
    'period_days', _days,
    'orgs_total', orgs_total,
    'orgs_active', orgs_active,
    'users_total', users_total,
    'dau', dau, 'wau', wau, 'mau', mau,
    'checkins', checkins,
    'pulses', pulses,
    'dna_reports', dna_reports,
    'action_plans', plans,
    'rituals', rituals,
    'avg_impact', avg_impact,
    'engagement_rate', engagement_rate,
    'retention_rate', retention_rate,
    'retention_cohort', jsonb_build_object(
      'prev_active', active_prev,
      'current_active', active_now,
      'retained', retained
    ),
    'daily', daily
  );
END;
$function$;
