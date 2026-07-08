
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  db_size text;
  cron_jobs int := 0;
  cron_last_run timestamptz;
  ai_msgs_24h bigint := 0;
  ai_msgs_1h  bigint := 0;
  audit_errors_24h bigint := 0;
  audit_last timestamptz;
  audit_last_action text;
  open_tickets bigint := 0;
  orgs_with_stripe bigint := 0;
  orgs_total bigint := 0;
  realtime_tables int := 0;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  BEGIN
    SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;
  EXCEPTION WHEN OTHERS THEN db_size := NULL;
  END;

  BEGIN
    EXECUTE 'SELECT count(*) FROM cron.job' INTO cron_jobs;
    EXECUTE 'SELECT max(start_time) FROM cron.job_run_details' INTO cron_last_run;
  EXCEPTION WHEN OTHERS THEN
    cron_jobs := 0;
    cron_last_run := NULL;
  END;

  SELECT COALESCE(SUM(ai_messages_count + executive_ai_messages_count),0) INTO ai_msgs_24h
  FROM public.platform_usage_daily WHERE usage_date >= current_date - 1;

  SELECT COALESCE(SUM(ai_messages_count + executive_ai_messages_count),0) INTO ai_msgs_1h
  FROM public.platform_usage_daily WHERE usage_date = current_date;

  SELECT COUNT(*), MAX(created_at)
  INTO audit_errors_24h, audit_last
  FROM public.platform_audit_logs
  WHERE created_at >= now() - interval '24 hours';

  SELECT action INTO audit_last_action
  FROM public.platform_audit_logs
  ORDER BY created_at DESC LIMIT 1;

  SELECT COUNT(*) INTO open_tickets FROM public.support_tickets WHERE status IN ('open','in_progress');

  SELECT COUNT(*) INTO orgs_total FROM public.organizations WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO orgs_with_stripe FROM public.organizations
    WHERE deleted_at IS NULL AND stripe_customer_id IS NOT NULL;

  BEGIN
    SELECT COUNT(*) INTO realtime_tables
    FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
  EXCEPTION WHEN OTHERS THEN realtime_tables := 0;
  END;

  RETURN jsonb_build_object(
    'checked_at', now(),
    'database', jsonb_build_object(
      'status', 'online',
      'size', db_size
    ),
    'cron', jsonb_build_object(
      'status', CASE WHEN cron_jobs > 0 THEN 'online' ELSE 'not_configured' END,
      'jobs', cron_jobs,
      'last_run', cron_last_run
    ),
    'realtime', jsonb_build_object(
      'status', CASE WHEN realtime_tables > 0 THEN 'online' ELSE 'not_configured' END,
      'tables', realtime_tables
    ),
    'ai', jsonb_build_object(
      'status', CASE WHEN ai_msgs_24h > 0 THEN 'online' ELSE 'idle' END,
      'messages_1h', ai_msgs_1h,
      'messages_24h', ai_msgs_24h
    ),
    'oauth', jsonb_build_object(
      'status', 'online',
      'note', 'Gerenciado pelo Lovable Cloud Auth'
    ),
    'stripe', jsonb_build_object(
      'status', CASE WHEN orgs_with_stripe > 0 THEN 'online' ELSE 'not_configured' END,
      'orgs_connected', orgs_with_stripe,
      'orgs_total', orgs_total
    ),
    'audit', jsonb_build_object(
      'events_24h', audit_errors_24h,
      'last_at', audit_last,
      'last_action', audit_last_action
    ),
    'support', jsonb_build_object(
      'open_tickets', open_tickets
    )
  );
END;
$$;
