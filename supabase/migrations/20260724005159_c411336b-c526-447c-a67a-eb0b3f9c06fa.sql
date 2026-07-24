
CREATE TABLE IF NOT EXISTS public.platform_r2_storage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'cloudflare_r2',
  account_id TEXT,
  access_key_id TEXT,
  secret_access_key TEXT,
  bucket_name TEXT,
  public_base_url TEXT,
  region TEXT DEFAULT 'auto',
  connection_status TEXT DEFAULT 'unknown',
  last_test_at TIMESTAMPTZ,
  last_test_message TEXT,
  last_tested_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_r2_storage TO authenticated;
GRANT ALL ON public.platform_r2_storage TO service_role;

ALTER TABLE public.platform_r2_storage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_admin_r2" ON public.platform_r2_storage;
CREATE POLICY "platform_admin_r2" ON public.platform_r2_storage
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP TRIGGER IF EXISTS trg_platform_r2_storage_updated_at ON public.platform_r2_storage;
CREATE TRIGGER trg_platform_r2_storage_updated_at
  BEFORE UPDATE ON public.platform_r2_storage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.platform_r2_storage (provider)
SELECT 'cloudflare_r2'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_r2_storage);
