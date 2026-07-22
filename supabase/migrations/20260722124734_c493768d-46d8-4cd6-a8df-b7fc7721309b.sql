CREATE TABLE IF NOT EXISTS public.platform_ai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'gemini',
  default_model TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  fallback_model TEXT NOT NULL DEFAULT 'gemini-2.5-flash-lite',
  embedding_model TEXT NOT NULL DEFAULT 'gemini-embedding-001',
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 2048,
  gemini_api_key TEXT,
  key_last4 TEXT,
  test_status TEXT,
  tested_at TIMESTAMPTZ,
  tested_model TEXT,
  test_latency_ms INTEGER,
  test_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grants: apenas service_role. Nenhum acesso para anon/authenticated.
GRANT ALL ON public.platform_ai_settings TO service_role;

ALTER TABLE public.platform_ai_settings ENABLE ROW LEVEL SECURITY;

-- Sem policies para authenticated/anon: RLS bloqueia toda leitura/escrita direta.
-- Toda operação passa pela Edge Function `platform-ai-settings` com service_role.

CREATE OR REPLACE FUNCTION public.update_platform_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_update_platform_ai_settings_updated_at ON public.platform_ai_settings;
CREATE TRIGGER trg_update_platform_ai_settings_updated_at
BEFORE UPDATE ON public.platform_ai_settings
FOR EACH ROW EXECUTE FUNCTION public.update_platform_ai_settings_updated_at();

-- Semear registro único com valores padrão (idempotente).
INSERT INTO public.platform_ai_settings (provider, default_model, fallback_model, embedding_model, temperature, max_tokens)
SELECT 'gemini', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-embedding-001', 0.7, 2048
WHERE NOT EXISTS (SELECT 1 FROM public.platform_ai_settings);