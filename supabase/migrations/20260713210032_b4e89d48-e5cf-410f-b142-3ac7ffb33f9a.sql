-- =========================================================
-- ai_prompt_configs
-- =========================================================
CREATE TABLE public.ai_prompt_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  system_instructions text NOT NULL DEFAULT '',
  tone_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_structure jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggested_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  examples jsonb NOT NULL DEFAULT '[]'::jsonb,
  guardrails jsonb NOT NULL DEFAULT '[]'::jsonb,
  model_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompt_configs TO authenticated;
GRANT ALL ON public.ai_prompt_configs TO service_role;

ALTER TABLE public.ai_prompt_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform admins manage prompt configs"
  ON public.ai_prompt_configs
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- =========================================================
-- ai_prompt_versions
-- =========================================================
CREATE TABLE public.ai_prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_config_id uuid NOT NULL REFERENCES public.ai_prompt_configs(id) ON DELETE CASCADE,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  change_note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_prompt_versions_config_idx
  ON public.ai_prompt_versions (prompt_config_id, version DESC);

GRANT SELECT, INSERT ON public.ai_prompt_versions TO authenticated;
GRANT ALL ON public.ai_prompt_versions TO service_role;

ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform admins read prompt versions"
  ON public.ai_prompt_versions
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

CREATE POLICY "platform admins insert prompt versions"
  ON public.ai_prompt_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin());

-- =========================================================
-- updated_at trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.tg_ai_prompt_configs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ai_prompt_configs_updated_at
  BEFORE UPDATE ON public.ai_prompt_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_ai_prompt_configs_updated_at();

-- =========================================================
-- Seed: executive_council
-- =========================================================
INSERT INTO public.ai_prompt_configs (
  key, name, description, system_instructions,
  tone_config, output_structure, suggested_questions, examples, guardrails, model_config,
  version, status, published_at
) VALUES (
  'executive_council',
  'Conselho Executivo IA',
  'Configuração do Conselho Executivo IA usada pela Edge Function executive-ai.',
  'Você é o Conselho Executivo IA do Meu Caminho Enterprise.
Sua função é apoiar decisões estratégicas utilizando exclusivamente indicadores organizacionais agregados.
Sempre explique o motivo da conclusão, apresente evidências e cite limitações.
Quando não houver dados suficientes, responda claramente que não existe base estatística suficiente.',
  jsonb_build_object(
    'tone', 'executivo',
    'detail', 'equilibrado',
    'formality', 'alta',
    'max_recommendations', 5,
    'include_risks', true,
    'include_opportunities', true,
    'include_limitations', true,
    'include_confidence', true,
    'include_evidence', true,
    'extra_instructions', ''
  ),
  jsonb_build_array(
    jsonb_build_object('key','executive_answer','title','Resposta Executiva','description','Síntese direta da resposta.','active',true,'order',1,'required',false),
    jsonb_build_object('key','evidence','title','Evidências','description','Indicadores agregados que sustentam a resposta.','active',true,'order',2,'required',true),
    jsonb_build_object('key','strategic_read','title','Leitura Estratégica','description','Interpretação executiva do cenário.','active',true,'order',3,'required',false),
    jsonb_build_object('key','risks','title','Riscos','description','Principais riscos identificados.','active',true,'order',4,'required',false),
    jsonb_build_object('key','opportunities','title','Oportunidades','description','Oportunidades de alto impacto.','active',true,'order',5,'required',false),
    jsonb_build_object('key','recommendations','title','Recomendações','description','Ações priorizadas.','active',true,'order',6,'required',false),
    jsonb_build_object('key','next_action','title','Próxima Ação','description','Próximo passo recomendado.','active',true,'order',7,'required',false),
    jsonb_build_object('key','confidence','title','Confiança','description','Nível de confiança da análise.','active',true,'order',8,'required',true),
    jsonb_build_object('key','limitations','title','Limitações','description','Limites de dados e interpretação.','active',true,'order',9,'required',true)
  ),
  jsonb_build_array(
    jsonb_build_object('id', gen_random_uuid(), 'text','Qual é o principal risco humano da empresa hoje?','active',true,'order',1),
    jsonb_build_object('id', gen_random_uuid(), 'text','O que mais pressiona o Score Organizacional?','active',true,'order',2),
    jsonb_build_object('id', gen_random_uuid(), 'text','Quais ações devem ser priorizadas nos próximos 30 dias?','active',true,'order',3),
    jsonb_build_object('id', gen_random_uuid(), 'text','O último ritual apresentou impacto?','active',true,'order',4),
    jsonb_build_object('id', gen_random_uuid(), 'text','Onde existe maior oportunidade de melhoria?','active',true,'order',5)
  ),
  '[]'::jsonb,
  jsonb_build_array(
    'Usar somente dados agregados.',
    'Nunca acessar chats pessoais.',
    'Nunca acessar onboarding individual.',
    'Nunca revelar identidade.',
    'Nunca acessar denúncias anônimas.',
    'Respeitar k-anonimato (mínimo do grupo).',
    'Não diagnosticar doenças.',
    'Não recomendar demissão individual.',
    'Não inventar números.',
    'Não acessar dados de outra empresa.'
  ),
  jsonb_build_object(
    'primary_model','google/gemini-2.5-pro',
    'fallback_model','google/gemini-2.5-flash',
    'temperature',0.3,
    'max_tokens',2048,
    'timeout_seconds',60,
    'json_retries',1,
    'streaming', false
  ),
  1,
  'published',
  now()
);

-- Snapshot v1
INSERT INTO public.ai_prompt_versions (prompt_config_id, version, snapshot, change_note)
SELECT id, 1, to_jsonb(c.*), 'Seed inicial (comportamento atual da Edge Function).'
FROM public.ai_prompt_configs c
WHERE c.key = 'executive_council';