
-- 1) Novas colunas opcionais (compatíveis com o Conselho existente)
ALTER TABLE public.ai_prompt_configs
  ADD COLUMN IF NOT EXISTS dimensions_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS classifications_config jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Seed do DNA Organizacional (idempotente)
INSERT INTO public.ai_prompt_configs (
  key, name, description, system_instructions,
  tone_config, output_structure, suggested_questions, examples,
  guardrails, model_config, dimensions_config, classifications_config,
  version, status, published_at
)
SELECT
  'organizational_dna',
  'DNA Organizacional™',
  'Diagnóstico executivo agregado da organização.',
  'Você é um consultor executivo especializado em Inteligência Humana Corporativa. Analise exclusivamente dados agregados. Produza um diagnóstico organizacional consistente, comparável e acionável em pt-BR para RH e Diretoria. Nunca identifique indivíduos, nunca faça diagnóstico clínico, nunca invente números.',
  jsonb_build_object(
    'tone','executivo',
    'detail','equilibrado',
    'formality','alta',
    'max_strengths', 5,
    'max_risks', 5,
    'max_recommendations', 6,
    'include_tensions', true,
    'include_opportunities', true,
    'include_initial_plan', true,
    'include_risks', true,
    'include_confidence', true,
    'include_limitations', true,
    'include_evidence', true,
    'extra_instructions',''
  ),
  jsonb_build_array(
    jsonb_build_object('key','executive_summary','title','Resumo Executivo','description','3 a 5 parágrafos com estado atual, principal força, principal tensão, maior risco e prioridade.','active',true,'order',1,'required',true),
    jsonb_build_object('key','organizational_identity','title','Identidade Organizacional','description','Leitura sintética da organização em 1–2 parágrafos.','active',true,'order',2),
    jsonb_build_object('key','dimensions','title','Dimensões Avaliadas','description','Score, classificação, tendência, evidências, riscos, oportunidades e confiança por dimensão.','active',true,'order',3,'required',true),
    jsonb_build_object('key','strengths','title','Forças','description','Até 5 forças com evidência, impacto e potencial de expansão.','active',true,'order',4),
    jsonb_build_object('key','tensions','title','Tensões','description','Contradições internas com explicação, risco e ação sugerida.','active',true,'order',5),
    jsonb_build_object('key','risks','title','Riscos','description','Classificação, evidência, tendência, horizonte, impacto e confiança.','active',true,'order',6),
    jsonb_build_object('key','opportunities','title','Oportunidades','description','Oportunidades reais e acionáveis.','active',true,'order',7),
    jsonb_build_object('key','priorities','title','Prioridades','description','P1 (imediato), P2 (30 dias), P3 (90 dias).','active',true,'order',8),
    jsonb_build_object('key','recommendations','title','Recomendações','description','Até 6 recomendações com prioridade, responsável, prazo, esforço, impacto, métricas e dependências.','active',true,'order',9),
    jsonb_build_object('key','initial_action_plan','title','Plano Inicial Sugerido','description','Rascunho de plano com passos iniciais.','active',true,'order',10),
    jsonb_build_object('key','confidence','title','Nível de Confiança','description','Score 0–100 com motivo.','active',true,'order',11,'required',true),
    jsonb_build_object('key','limitations','title','Limitações dos Dados','description','Amostras insuficientes, ausência de sinais, restrições de k-anonimato.','active',true,'order',12,'required',true)
  ),
  '[]'::jsonb,
  '[]'::jsonb,
  jsonb_build_array(
    'Utilizar apenas dados agregados fornecidos pelo backend.',
    'Respeitar k-anonimato (amostra mínima definida pela organização).',
    'Nunca identificar indivíduos, times minoritários ou denunciantes.',
    'Nunca acessar chats, mensagens, onboarding individual ou denúncias.',
    'Nunca realizar diagnóstico clínico ou usar linguagem médica.',
    'Nunca inventar números, participantes ou tendências.',
    'Nunca inferir dimensão com amostra insuficiente — retornar null.',
    'Nunca cruzar dados com outra organização.'
  ),
  jsonb_build_object(
    'primary_model','google/gemini-2.5-pro',
    'fallback_model','google/gemini-2.5-flash',
    'temperature',0.4,
    'max_tokens',6000,
    'timeout_seconds',90,
    'json_retries',1,
    'streaming',false
  ),
  jsonb_build_array(
    jsonb_build_object('key','culture','label','Cultura','description','Valores praticados, coerência entre discurso e execução.','required',false,'active',true,'weight',1,'order',1),
    jsonb_build_object('key','leadership','label','Liderança','description','Qualidade percebida da liderança e proximidade.','required',true,'active',true,'weight',1,'order',2),
    jsonb_build_object('key','communication','label','Comunicação','description','Clareza, frequência e efetividade.','required',true,'active',true,'weight',1,'order',3),
    jsonb_build_object('key','collaboration','label','Colaboração','description','Cooperação entre áreas e times.','required',false,'active',true,'weight',1,'order',4),
    jsonb_build_object('key','engagement','label','Engajamento','description','Nível de conexão e comprometimento.','required',true,'active',true,'weight',1,'order',5),
    jsonb_build_object('key','energy','label','Energia','description','Vitalidade agregada do sistema humano.','required',true,'active',true,'weight',1,'order',6),
    jsonb_build_object('key','recovery','label','Recuperação','description','Capacidade de descanso e regeneração.','required',true,'active',true,'weight',1,'order',7),
    jsonb_build_object('key','psychological_safety','label','Segurança Psicológica','description','Ambiente para expressar ideias e erros.','required',true,'active',true,'weight',1,'order',8),
    jsonb_build_object('key','capacity','label','Capacidade Organizacional','description','Folga entre carga e capacidade.','required',false,'active',true,'weight',1,'order',9),
    jsonb_build_object('key','human_system_health','label','Saúde do Sistema Humano','description','Visão integrada de saúde organizacional.','required',false,'active',true,'weight',1,'order',10)
  ),
  jsonb_build_array(
    jsonb_build_object('min',85,'max',100,'label','Fortaleza consolidada','description','Excelente desempenho, replicável.'),
    jsonb_build_object('min',70,'max',84,'label','Saudável','description','Bom desempenho, com manutenção.'),
    jsonb_build_object('min',55,'max',69,'label','Atenção','description','Sinais de pressão que exigem monitoramento.'),
    jsonb_build_object('min',40,'max',54,'label','Risco','description','Deterioração que exige ação estruturada.'),
    jsonb_build_object('min',0,'max',39,'label','Risco elevado','description','Situação crítica que exige intervenção imediata.')
  ),
  1,
  'published',
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.ai_prompt_configs WHERE key = 'organizational_dna');

-- 3) Registrar snapshot v1 se acabou de ser criado
INSERT INTO public.ai_prompt_versions (prompt_config_id, version, snapshot, change_note)
SELECT c.id, c.version, to_jsonb(c.*), 'Seed inicial do DNA Organizacional™.'
FROM public.ai_prompt_configs c
WHERE c.key = 'organizational_dna'
  AND NOT EXISTS (
    SELECT 1 FROM public.ai_prompt_versions v
    WHERE v.prompt_config_id = c.id AND v.version = c.version
  );
