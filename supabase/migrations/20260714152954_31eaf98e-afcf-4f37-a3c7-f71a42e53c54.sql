-- Fase IA 07 — Sub-fase A: AI Orchestrator™ (núcleo)

-- 1) Memória organizacional
CREATE TABLE IF NOT EXISTS public.ai_orchestrator_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('dna','insight','plan','alert','ritual','score','council','recommendation','impact')),
  ref_id uuid,
  summary text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  weight numeric NOT NULL DEFAULT 1.0,
  captured_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_orchestrator_memory TO authenticated;
GRANT ALL ON public.ai_orchestrator_memory TO service_role;
ALTER TABLE public.ai_orchestrator_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orch_memory_admin_read" ON public.ai_orchestrator_memory
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE INDEX IF NOT EXISTS idx_orch_memory_org_kind_captured
  ON public.ai_orchestrator_memory(organization_id, kind, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_orch_memory_expires
  ON public.ai_orchestrator_memory(expires_at) WHERE expires_at IS NOT NULL;

-- 2) Cache inteligente
CREATE TABLE IF NOT EXISTS public.ai_orchestrator_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  intent_hash text NOT NULL,
  intent text NOT NULL,
  specialists text[] NOT NULL DEFAULT ARRAY[]::text[],
  response jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence numeric,
  config_version integer,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 hours'),
  is_stale boolean NOT NULL DEFAULT false,
  invalidation_reason text,
  hits integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, intent_hash)
);
GRANT SELECT ON public.ai_orchestrator_cache TO authenticated;
GRANT ALL ON public.ai_orchestrator_cache TO service_role;
ALTER TABLE public.ai_orchestrator_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orch_cache_admin_read" ON public.ai_orchestrator_cache
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE INDEX IF NOT EXISTS idx_orch_cache_org_stale
  ON public.ai_orchestrator_cache(organization_id, is_stale, expires_at);
CREATE TRIGGER trg_orch_cache_updated
  BEFORE UPDATE ON public.ai_orchestrator_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) Logs
CREATE TABLE IF NOT EXISTS public.ai_orchestrator_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  intent text NOT NULL,
  intent_hash text,
  specialists text[] NOT NULL DEFAULT ARRAY[]::text[],
  routing jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text,
  fallback_used boolean NOT NULL DEFAULT false,
  tokens_input integer,
  tokens_output integer,
  cost_usd numeric,
  latency_ms integer,
  cache_hit boolean NOT NULL DEFAULT false,
  confidence numeric,
  status text NOT NULL DEFAULT 'ok' CHECK (status IN ('ok','fallback','error','insufficient_data')),
  error text,
  config_version integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_orchestrator_logs TO authenticated;
GRANT ALL ON public.ai_orchestrator_logs TO service_role;
ALTER TABLE public.ai_orchestrator_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orch_logs_admin_read" ON public.ai_orchestrator_logs
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE INDEX IF NOT EXISTS idx_orch_logs_org_created
  ON public.ai_orchestrator_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orch_logs_status_created
  ON public.ai_orchestrator_logs(status, created_at DESC);

-- 4) Invalidação de cache por eventos
CREATE OR REPLACE FUNCTION public.invalidate_orch_cache_org(_org_id uuid, _reason text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.ai_orchestrator_cache
     SET is_stale = true, expires_at = now(),
         invalidation_reason = _reason, updated_at = now()
   WHERE organization_id = _org_id;
$$;
REVOKE EXECUTE ON FUNCTION public.invalidate_orch_cache_org(uuid, text) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.trg_invalidate_orch_cache_org()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE oid uuid; reason text := TG_ARGV[0];
BEGIN
  oid := COALESCE(NEW.organization_id, OLD.organization_id);
  IF oid IS NOT NULL THEN PERFORM public.invalidate_orch_cache_org(oid, reason); END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

DROP TRIGGER IF EXISTS trg_orchcache_checkin ON public.emotional_checkins;
CREATE TRIGGER trg_orchcache_checkin AFTER INSERT ON public.emotional_checkins
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_orch_cache_org('checkin');

DROP TRIGGER IF EXISTS trg_orchcache_pulse ON public.pulse_responses;
CREATE TRIGGER trg_orchcache_pulse AFTER INSERT ON public.pulse_responses
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_orch_cache_org('pulse');

DROP TRIGGER IF EXISTS trg_orchcache_dna ON public.organizational_dna_reports;
CREATE TRIGGER trg_orchcache_dna AFTER INSERT OR UPDATE ON public.organizational_dna_reports
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_orch_cache_org('dna');

DROP TRIGGER IF EXISTS trg_orchcache_insights ON public.weekly_ai_insights;
CREATE TRIGGER trg_orchcache_insights AFTER INSERT OR UPDATE ON public.weekly_ai_insights
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_orch_cache_org('insight');

DROP TRIGGER IF EXISTS trg_orchcache_plans ON public.action_plans;
CREATE TRIGGER trg_orchcache_plans AFTER INSERT OR UPDATE ON public.action_plans
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_orch_cache_org('plan');

DROP TRIGGER IF EXISTS trg_orchcache_score ON public.organizational_scores;
CREATE TRIGGER trg_orchcache_score AFTER INSERT OR UPDATE ON public.organizational_scores
  FOR EACH ROW EXECUTE FUNCTION public.trg_invalidate_orch_cache_org('score');

-- 5) Seed do prompt config
INSERT INTO public.ai_prompt_configs (
  key, name, description,
  system_instructions, tone_config, output_structure, guardrails, model_config,
  version, status, published_at
) VALUES (
  'orchestrator',
  'AI Orchestrator™',
  'Camada de inteligência acima das IAs (Conselho, DNA, Insights, Planos, Rituais, Recomendação, Impacto). Decide qual especialista usar, compartilha contexto, evita respostas contraditórias e mantém memória organizacional.',
  'Você é o AI Orchestrator™. Nunca converse diretamente com o usuário — apenas roteie, consolide e valide respostas dos especialistas. Priorize o menor número possível de modelos. Se apenas um especialista resolver, não chame outros. Nunca use dados individuais de outro colaborador. Se dados forem insuficientes, responda "sem dados suficientes".',
  jsonb_build_object(
    'routing', jsonb_build_array(
      jsonb_build_object('intent','engagement','keywords', jsonb_build_array('engajamento','engagement','motivação','equipe'),
        'specialists', jsonb_build_array('dna','insights','plans','impact'), 'priority', jsonb_build_array('dna','insights')),
      jsonb_build_object('intent','recommendation','keywords', jsonb_build_array('livro','vídeo','conteúdo','curso','podcast','recomendar'),
        'specialists', jsonb_build_array('recommendation'), 'priority', jsonb_build_array('recommendation')),
      jsonb_build_object('intent','risk','keywords', jsonb_build_array('risco','alerta','crítico','urgente'),
        'specialists', jsonb_build_array('council','dna','alerts'), 'priority', jsonb_build_array('council','dna')),
      jsonb_build_object('intent','ritual','keywords', jsonb_build_array('ritual','prática','cerimônia'),
        'specialists', jsonb_build_array('rituals','dna'), 'priority', jsonb_build_array('rituals')),
      jsonb_build_object('intent','impact','keywords', jsonb_build_array('impacto','resultado','antes e depois','delta'),
        'specialists', jsonb_build_array('impact','score'), 'priority', jsonb_build_array('impact')),
      jsonb_build_object('intent','council','keywords', jsonb_build_array('conselho','decisão','estratégia','plano estratégico'),
        'specialists', jsonb_build_array('council','dna','insights'), 'priority', jsonb_build_array('council'))
    ),
    'default_specialists', jsonb_build_array('council'),
    'consolidation', jsonb_build_object('dedupe', true, 'max_sections', 6, 'conflict_policy', 'prioritize_by_confidence'),
    'confidence', jsonb_build_object(
      'min_sources', 1, 'ideal_sources', 3,
      'weights', jsonb_build_object('sources',0.35,'consistency',0.35,'data_volume',0.20,'freshness',0.10)
    ),
    'memory', jsonb_build_object(
      'ttl_days_dna', 90, 'ttl_days_insight', 21, 'ttl_days_plan', 60,
      'ttl_days_alert', 14, 'ttl_days_ritual', 30, 'ttl_days_score', 30,
      'ttl_days_council', 30, 'ttl_days_recommendation', 7, 'ttl_days_impact', 60,
      'per_kind_limit', 20
    )
  ),
  jsonb_build_array(
    jsonb_build_object('key','intent','title','Intenção detectada','active',true,'order',1,'required',true),
    jsonb_build_object('key','specialists','title','Especialistas usados','active',true,'order',2,'required',true),
    jsonb_build_object('key','answer','title','Resposta consolidada','active',true,'order',3,'required',true),
    jsonb_build_object('key','confidence','title','Confiança final (0-1)','active',true,'order',4,'required',true),
    jsonb_build_object('key','limitations','title','Limitações','active',true,'order',5,'required',false),
    jsonb_build_object('key','sources','title','Fontes utilizadas','active',true,'order',6,'required',true)
  ),
  jsonb_build_array(
    'Nunca converse diretamente com o usuário final — apenas roteie e consolide.',
    'Nunca use dados individuais de outro colaborador, denúncias ou chats privados.',
    'Priorize o menor número possível de modelos. Se um especialista bastar, não chame outros.',
    'Se dados forem insuficientes, responda explicitamente "sem dados suficientes".',
    'Deduplique recomendações e evite textos repetidos entre seções.',
    'Em caso de conflito entre especialistas, priorize pela confiança e justifique a escolha.'
  ),
  jsonb_build_object(
    'primary_model', 'google/gemini-2.5-flash',
    'fallback_model', 'google/gemini-2.5-flash-lite',
    'temperature', 0.2,
    'max_tokens', 2000,
    'timeout_seconds', 30,
    'streaming', false,
    'cache_ttl_seconds', 7200,
    'cost_table', jsonb_build_object(
      'google/gemini-2.5-pro', jsonb_build_object('input_per_1k', 0.00125, 'output_per_1k', 0.005),
      'google/gemini-2.5-flash', jsonb_build_object('input_per_1k', 0.000075, 'output_per_1k', 0.0003),
      'google/gemini-2.5-flash-lite', jsonb_build_object('input_per_1k', 0.00004, 'output_per_1k', 0.00015),
      'google/gemini-3-flash-preview', jsonb_build_object('input_per_1k', 0.0001, 'output_per_1k', 0.0004)
    ),
    'specialists', jsonb_build_array(
      jsonb_build_object('key','council','label','Conselho Executivo IA™','function','executive-ai','active',true),
      jsonb_build_object('key','dna','label','DNA Organizacional™','function','generate-organizational-dna','active',true),
      jsonb_build_object('key','insights','label','Insights Semanais IA™','function','generate-weekly-insights','active',true),
      jsonb_build_object('key','plans','label','Planos de Ação','function','generate-action-plan','active',true),
      jsonb_build_object('key','rituals','label','Rituais Inteligentes™','function','generate-intelligent-ritual','active',true),
      jsonb_build_object('key','recommendation','label','Motor de Recomendação™','function','recommend-content','active',true),
      jsonb_build_object('key','impact','label','Motor de Impacto™','function','measure-impact','active',true),
      jsonb_build_object('key','alerts','label','Alertas','function','compute-basic-alerts','active',true),
      jsonb_build_object('key','score','label','Score Organizacional™','function','compute-organizational-score','active',true)
    )
  ),
  1, 'published', now()
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.ai_prompt_versions (prompt_config_id, version, snapshot, change_note)
SELECT id, version, to_jsonb(c), 'Seed inicial do AI Orchestrator™'
  FROM public.ai_prompt_configs c
 WHERE key = 'orchestrator'
   AND NOT EXISTS (
     SELECT 1 FROM public.ai_prompt_versions v
      WHERE v.prompt_config_id = c.id AND v.version = c.version
   );