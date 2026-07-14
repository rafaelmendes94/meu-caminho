
DO $$ BEGIN CREATE TYPE public.backup_job_type AS ENUM ('database','storage','content','settings','ai','knowledge','full'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.backup_status AS ENUM ('pending','running','success','failed','canceled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.backup_frequency AS ENUM ('manual','hourly','daily','weekly','monthly'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.health_status AS ENUM ('healthy','warning','critical','unknown'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE IF NOT EXISTS public.backup_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type public.backup_job_type NOT NULL,
  status public.backup_status NOT NULL DEFAULT 'pending',
  size_bytes BIGINT, duration_ms INTEGER,
  destination TEXT, checksum TEXT, error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  schedule_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.backup_jobs TO authenticated;
GRANT ALL ON public.backup_jobs TO service_role;
ALTER TABLE public.backup_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "backup_jobs admin all" ON public.backup_jobs FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_backup_jobs_updated BEFORE UPDATE ON public.backup_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.backup_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scope public.backup_job_type NOT NULL DEFAULT 'full',
  frequency public.backup_frequency NOT NULL DEFAULT 'daily',
  retention_days INTEGER NOT NULL DEFAULT 30,
  enabled BOOLEAN NOT NULL DEFAULT true,
  next_run_at TIMESTAMPTZ, last_run_at TIMESTAMPTZ,
  destination TEXT DEFAULT 'supabase',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.backup_schedules TO authenticated;
GRANT ALL ON public.backup_schedules TO service_role;
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "backup_schedules admin all" ON public.backup_schedules FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_backup_schedules_updated BEFORE UPDATE ON public.backup_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.restore_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID REFERENCES public.backup_jobs(id) ON DELETE SET NULL,
  reason TEXT,
  dry_run BOOLEAN NOT NULL DEFAULT true,
  status public.backup_status NOT NULL DEFAULT 'pending',
  affected_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  error TEXT, duration_ms INTEGER,
  started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.restore_jobs TO authenticated;
GRANT ALL ON public.restore_jobs TO service_role;
ALTER TABLE public.restore_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "restore_jobs admin all" ON public.restore_jobs FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_restore_jobs_updated BEFORE UPDATE ON public.restore_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL,
  status public.health_status NOT NULL DEFAULT 'unknown',
  latency_ms INTEGER, message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.health_checks TO authenticated;
GRANT ALL ON public.health_checks TO service_role;
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health_checks admin all" ON public.health_checks FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_health_checks_component_time ON public.health_checks(component, checked_at DESC);

CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT, ref_type TEXT, ref_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.backup_logs TO authenticated;
GRANT ALL ON public.backup_logs TO service_role;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "backup_logs admin all" ON public.backup_logs FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_backup_logs_created ON public.backup_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS public.backup_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.backup_policies TO authenticated;
GRANT ALL ON public.backup_policies TO service_role;
ALTER TABLE public.backup_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "backup_policies admin all" ON public.backup_policies FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_backup_policies_updated BEFORE UPDATE ON public.backup_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.backup_policies (key, value, description) VALUES
  ('retention', '{"daily":7,"weekly":30,"monthly":90,"yearly":365}'::jsonb, 'Retenção padrão por frequência (dias)'),
  ('destinations', '{"primary":"supabase","available":["supabase","s3","gcs","azure_blob"]}'::jsonb, 'Destinos disponíveis (arquitetura)'),
  ('dry_run_default', '{"enabled":true}'::jsonb, 'Restore inicia em dry-run por padrão')
ON CONFLICT (key) DO NOTHING;
