
DO $$ BEGIN CREATE TYPE public.perf_severity AS ENUM ('info','warning','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.perf_comparator AS ENUM ('gt','gte','lt','lte','eq'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.perf_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  metric TEXT NOT NULL,
  value_num NUMERIC,
  unit TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.perf_snapshots TO authenticated;
GRANT ALL ON public.perf_snapshots TO service_role;
ALTER TABLE public.perf_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perf_snapshots admin all" ON public.perf_snapshots FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_perf_snapshots_cat_time ON public.perf_snapshots(category, captured_at DESC);

CREATE TABLE IF NOT EXISTS public.perf_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  metric TEXT NOT NULL,
  comparator public.perf_comparator NOT NULL DEFAULT 'gt',
  threshold NUMERIC NOT NULL,
  severity public.perf_severity NOT NULL DEFAULT 'warning',
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.perf_alert_rules TO authenticated;
GRANT ALL ON public.perf_alert_rules TO service_role;
ALTER TABLE public.perf_alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perf_alert_rules admin all" ON public.perf_alert_rules FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_perf_alert_rules_updated BEFORE UPDATE ON public.perf_alert_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.perf_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.perf_alert_rules(id) ON DELETE SET NULL,
  metric TEXT NOT NULL,
  value NUMERIC,
  severity public.perf_severity NOT NULL DEFAULT 'warning',
  message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.perf_alerts TO authenticated;
GRANT ALL ON public.perf_alerts TO service_role;
ALTER TABLE public.perf_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perf_alerts admin all" ON public.perf_alerts FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE IF NOT EXISTS public.load_test_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  profile_users INTEGER NOT NULL DEFAULT 100,
  scenarios JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.load_test_plans TO authenticated;
GRANT ALL ON public.load_test_plans TO service_role;
ALTER TABLE public.load_test_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "load_test_plans admin all" ON public.load_test_plans FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_load_test_plans_updated BEFORE UPDATE ON public.load_test_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.load_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.load_test_plans(id) ON DELETE SET NULL,
  mode TEXT NOT NULL DEFAULT 'simulation',
  status TEXT NOT NULL DEFAULT 'pending',
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.load_test_runs TO authenticated;
GRANT ALL ON public.load_test_runs TO service_role;
ALTER TABLE public.load_test_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "load_test_runs admin all" ON public.load_test_runs FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE IF NOT EXISTS public.health_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score INTEGER NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.health_score_history TO authenticated;
GRANT ALL ON public.health_score_history TO service_role;
ALTER TABLE public.health_score_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health_score_history admin all" ON public.health_score_history FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_health_score_time ON public.health_score_history(captured_at DESC);

-- Seed alert rules
INSERT INTO public.perf_alert_rules (name, metric, comparator, threshold, severity, description) VALUES
  ('Query lenta',       'db.query_ms',      'gt', 500,  'warning',  'Query média acima de 500ms'),
  ('Edge lenta',        'edge.latency_ms',  'gt', 2000, 'warning',  'Edge function acima de 2s'),
  ('IA lenta',          'ai.latency_ms',    'gt', 8000, 'warning',  'Chamada IA acima de 8s'),
  ('Upload lento',      'storage.upload_ms','gt', 3000, 'warning',  'Upload acima de 3s'),
  ('Cron falhando',     'cron.failures',    'gt', 0,    'critical', 'Cron com falhas na última janela'),
  ('Realtime instável', 'realtime.errors',  'gt', 5,    'warning',  'Falhas de conexão realtime'),
  ('Cache baixo',       'cache.hit_ratio',  'lt', 0.5,  'warning',  'Cache hit ratio abaixo de 50%'),
  ('Storage cheio',     'storage.used_pct', 'gt', 80,   'critical', 'Storage acima de 80%')
ON CONFLICT DO NOTHING;
