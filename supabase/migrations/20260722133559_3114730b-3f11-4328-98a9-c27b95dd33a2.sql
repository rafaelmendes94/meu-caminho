CREATE TABLE IF NOT EXISTS public.platform_resend_settings (
  id INT PRIMARY KEY DEFAULT 1,
  api_key TEXT,
  from_email TEXT NOT NULL DEFAULT 'no-reply@augustocury.fivestarsmarketing.com.br',
  from_name TEXT NOT NULL DEFAULT 'Meu Caminho Enterprise',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID,
  CONSTRAINT single_row CHECK (id = 1)
);

GRANT ALL ON public.platform_resend_settings TO service_role;

ALTER TABLE public.platform_resend_settings ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated: only service_role (via edge function) can read/write.

INSERT INTO public.platform_resend_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;