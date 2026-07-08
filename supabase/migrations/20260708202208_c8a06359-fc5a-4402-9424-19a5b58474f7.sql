
CREATE OR REPLACE FUNCTION public.get_platform_analytics(_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since_days timestamptz := now() - make_interval(days => GREATEST(_days,1));
  since_24h  timestamptz := now() - interval '1 day';
  since_7d   timestamptz := now() - interval '7 days';
  since_30d  timestamptz := now() - interval '30 days';
  since_60d  timestamptz := now() - interval '60 days';

  orgs_total bigint;
  orgs_active bigint;
  users_total bigint;

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

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.day), '[]'::jsonb) INTO daily
  FROM (
    SELECT usage_date AS day,
           SUM(active_users)::int AS active_users,
           SUM(checkins_count)::int AS checkins,
           SUM(pulses_count)::int AS pulses,
           SUM(ai_messages_count)::int AS ai_messages
    FROM public.platform_usage_daily
    WHERE usage_date >= (current_date - GREATEST(_days,1) + 1)
    GROUP BY usage_date
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
$$;
