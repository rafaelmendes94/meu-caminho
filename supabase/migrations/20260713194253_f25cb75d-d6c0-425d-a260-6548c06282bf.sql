
CREATE TABLE IF NOT EXISTS public.ai_usage_daily (
  user_id uuid NOT NULL,
  usage_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  function_name text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date, function_name)
);

GRANT ALL ON public.ai_usage_daily TO service_role;

ALTER TABLE public.ai_usage_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_usage_daily_admin_read" ON public.ai_usage_daily;
CREATE POLICY "ai_usage_daily_admin_read" ON public.ai_usage_daily
  FOR SELECT TO authenticated
  USING (public.is_platform_admin());

CREATE INDEX IF NOT EXISTS ai_usage_daily_date_idx ON public.ai_usage_daily(usage_date);

INSERT INTO public.platform_settings (key, value) VALUES
  ('ai_chat_per_day', '{"limit": 100}'::jsonb),
  ('ai_generation_per_day', '{"limit": 20}'::jsonb)
ON CONFLICT (key) DO NOTHING;
