-- ============================================================
-- Fase IA 06 — Sub-fase A: Motor de Recomendação Inteligente™
-- ============================================================

-- 1) Pesos de recomendação em content_items
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS recommendation_weights jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.content_items.recommendation_weights IS
  'Pesos usados pelo Motor de Recomendação. Ex: {"energy":95,"anxiety":98,"communication":65,"leadership":55,"recovery":90,"difficulty":"medium","format":"book","time_minutes":240,"objectives":["gestao_emocional"],"tags":["ansiedade"]}';

-- 2) recommendation_events
CREATE TABLE IF NOT EXISTS public.recommendation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  item_id uuid REFERENCES public.content_items(id) ON DELETE CASCADE,
  item_type text,
  event_type text NOT NULL CHECK (event_type IN ('shown','clicked','started','completed','dismissed','favorite','shared')),
  score numeric,
  reason text,
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  config_version integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.recommendation_events TO authenticated;
GRANT ALL ON public.recommendation_events TO service_role;

ALTER TABLE public.recommendation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rec_events_insert_own" ON public.recommendation_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rec_events_select_own" ON public.recommendation_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin());

CREATE INDEX IF NOT EXISTS idx_rec_events_user_created
  ON public.recommendation_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rec_events_item_created
  ON public.recommendation_events(item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rec_events_org_type
  ON public.recommendation_events(organization_id, event_type, created_at DESC);

-- 3) user_recommendation_cache
CREATE TABLE IF NOT EXISTS public.user_recommendation_cache (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_vector jsonb NOT NULL DEFAULT '{}'::jsonb,
  config_version integer,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '6 hours'),
  is_stale boolean NOT NULL DEFAULT false,
  invalidation_reason text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_recommendation_cache TO authenticated;
GRANT ALL ON public.user_recommendation_cache TO service_role;

ALTER TABLE public.user_recommendation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rec_cache_read_own" ON public.user_recommendation_cache
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin());

CREATE INDEX IF NOT EXISTS idx_rec_cache_stale ON public.user_recommendation_cache(is_stale, expires_at);

CREATE TRIGGER trg_rec_cache_updated
  BEFORE UPDATE ON public.user_recommendation_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4) Funções e triggers de invalidação
CREATE OR REPLACE FUNCTION public.invalidate_rec_cache_user(_user_id uuid, _reason text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_recommendation_cache
     SET is_stale = true, expires_at = now(),
         invalidation_reason = _reason, updated_at = now()
   WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.invalidate_rec_cache_all(_reason text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_recommendation_cache
     SET is_stale = true, expires_at = now(),
         invalidation_reason = _reason, updated_at = now();
$$;

CREATE OR REPLACE FUNCTION public.trg_invalidate_rec_cache_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  reason text := TG_ARGV[0];
BEGIN
  uid := COALESCE(NEW.user_id, OLD.user_id);
  IF uid IS NOT NULL THEN
    PERFORM public.invalidate_rec_cache_user(uid, reason);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_invalidate_rec_cache_all()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reason text := TG_ARGV[0];
BEGIN
  PERFORM public.invalidate_rec_cache_all(reason);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_reccache_checkin ON public.emotional_checkins;
CREATE TRIGGER trg_reccache_checkin
  AFTER INSERT OR UPDATE ON public.emotional_checkins
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_rec_cache_user('checkin');

DROP TRIGGER IF EXISTS trg_reccache_pulse ON public.pulse_responses;
CREATE TRIGGER trg_reccache_pulse
  AFTER INSERT ON public.pulse_responses
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_rec_cache_user('pulse');

DROP TRIGGER IF EXISTS trg_reccache_event ON public.recommendation_events;
CREATE TRIGGER trg_reccache_event
  AFTER INSERT ON public.recommendation_events
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_rec_cache_user('event');

DROP TRIGGER IF EXISTS trg_reccache_ritual ON public.ritual_participations;
CREATE TRIGGER trg_reccache_ritual
  AFTER INSERT OR UPDATE ON public.ritual_participations
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_rec_cache_user('ritual');

DROP TRIGGER IF EXISTS trg_reccache_employee_profile ON public.employee_profiles;
CREATE TRIGGER trg_reccache_employee_profile
  AFTER INSERT OR UPDATE ON public.employee_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_rec_cache_user('employee_profile');

DROP TRIGGER IF EXISTS trg_reccache_content_item ON public.content_items;
CREATE TRIGGER trg_reccache_content_item
  AFTER INSERT OR UPDATE OF status, recommendation_weights, is_premium ON public.content_items
  FOR EACH STATEMENT EXECUTE FUNCTION public.trg_invalidate_rec_cache_all('content_change');

-- 5) Seed do prompt config (guardrails é jsonb neste projeto)
INSERT INTO public.ai_prompt_configs (
  key, name, description,
  system_instructions, tone_config, output_structure, guardrails, model_config,
  version, status, published_at
) VALUES (
  'recommendation_engine',
  'Motor de Recomendação Inteligente™',
  'Configuração do cérebro de recomendação: pesos por dimensão, boosts, penalidades e limites do ranking.',
  'Você configura o Motor de Recomendação. A recomendação diária é feita por SQL/ranking rápido; a IA apenas ajusta pesos e explicações. Respeite k-anonimato, nunca use dados de outro colaborador, denúncias ou chats privados.',
  jsonb_build_object(
    'dimension_weights', jsonb_build_object(
      'energy', 1.0, 'anxiety', 1.0, 'communication', 0.9,
      'leadership', 0.9, 'recovery', 1.0, 'engagement', 0.9,
      'equilibrium', 1.0, 'psychological_safety', 0.8
    ),
    'format_weights', jsonb_build_object(
      'book', 0.9, 'video', 1.0, 'podcast', 0.9, 'course', 1.0,
      'track', 1.0, 'exercise', 0.9, 'reflection', 0.8, 'ritual', 1.0, 'message', 0.6
    ),
    'boosts', jsonb_build_object(
      'never_seen', 0.20, 'partially_completed', 0.30, 'started', 0.15,
      'favorite_category', 0.12, 'related', 0.10, 'ai_recommended', 0.15,
      'best_fit_profile', 0.25, 'featured', 0.05
    ),
    'penalties', jsonb_build_object(
      'repeat_within_days', 30, 'repeat_penalty', 0.5,
      'completed_penalty', 0.9, 'dismissed_penalty', 0.8,
      'archived_penalty', 1.0, 'draft_penalty', 1.0,
      'premium_without_license_penalty', 1.0
    ),
    'time_available_minutes', 30,
    'novelty_half_life_days', 14,
    'top_n', 20,
    'min_score', 0.05,
    'diversity', jsonb_build_object('max_per_format', 6, 'max_per_category', 6),
    'explanation', jsonb_build_object('style', 'empatica', 'max_length', 220, 'include_signals', true)
  ),
  jsonb_build_array(
    jsonb_build_object('key','item_id','title','ID do conteúdo','active',true,'order',1,'required',true),
    jsonb_build_object('key','score','title','Score final (0-1)','active',true,'order',2,'required',true),
    jsonb_build_object('key','reason','title','Motivo humano ("Recomendado porque…")','active',true,'order',3,'required',true),
    jsonb_build_object('key','factors','title','Fatores que compõem o score','active',true,'order',4,'required',true),
    jsonb_build_object('key','type','title','Tipo (book/video/podcast/course/track/exercise/ritual/reflection/message)','active',true,'order',5,'required',true),
    jsonb_build_object('key','title','title','Título do item','active',true,'order',6,'required',true),
    jsonb_build_object('key','confidence','title','Confiança do ranking','active',true,'order',7,'required',true)
  ),
  jsonb_build_array(
    'Nunca usar dados de outro colaborador, denúncias ou chats privados.',
    'Nunca recomendar conteúdo arquivado, draft ou premium sem licença.',
    'Nunca repetir conteúdo já concluído dentro da janela configurada.',
    'A IA generativa é usada apenas para ajustar pesos e gerar explicações — nunca a cada acesso.',
    'A recomendação diária deve ser servida por cache/SQL em até 300ms.'
  ),
  jsonb_build_object(
    'primary_model', 'google/gemini-2.5-pro',
    'fallback_model', 'google/gemini-2.5-flash',
    'temperature', 0.2,
    'max_tokens', 3000,
    'timeout_seconds', 60,
    'json_retries', 1,
    'streaming', false,
    'categories', jsonb_build_array(
      jsonb_build_object('key','gestao_emocional','label','Gestão emocional','active',true),
      jsonb_build_object('key','lideranca','label','Liderança','active',true),
      jsonb_build_object('key','comunicacao','label','Comunicação','active',true),
      jsonb_build_object('key','energia','label','Energia e recuperação','active',true),
      jsonb_build_object('key','engajamento','label','Engajamento','active',true),
      jsonb_build_object('key','desenvolvimento','label','Desenvolvimento','active',true),
      jsonb_build_object('key','clima','label','Clima e cultura','active',true)
    ),
    'formats', jsonb_build_array(
      jsonb_build_object('key','book','label','Livro','active',true),
      jsonb_build_object('key','video','label','Vídeo','active',true),
      jsonb_build_object('key','podcast','label','Podcast','active',true),
      jsonb_build_object('key','course','label','Curso','active',true),
      jsonb_build_object('key','track','label','Trilha','active',true),
      jsonb_build_object('key','exercise','label','Exercício','active',true),
      jsonb_build_object('key','reflection','label','Reflexão','active',true),
      jsonb_build_object('key','ritual','label','Ritual','active',true),
      jsonb_build_object('key','message','label','Mensagem','active',true)
    )
  ),
  1, 'published', now()
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.ai_prompt_versions (prompt_config_id, version, snapshot, change_note)
SELECT id, version, to_jsonb(c), 'Seed inicial do Motor de Recomendação Inteligente™'
  FROM public.ai_prompt_configs c
 WHERE key = 'recommendation_engine'
   AND NOT EXISTS (
     SELECT 1 FROM public.ai_prompt_versions v
      WHERE v.prompt_config_id = c.id AND v.version = c.version
   );