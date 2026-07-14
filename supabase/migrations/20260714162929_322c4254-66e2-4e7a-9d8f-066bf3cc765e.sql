
INSERT INTO public.ai_lab_datasets (key, name, ai_module, description, default_criteria) VALUES
 ('seed_executive_council','Seed · Conselho Executivo','executive-ai','Perguntas típicas do Conselho Executivo IA.','["objetividade","precisao","privacidade","utilidade"]'::jsonb),
 ('seed_organizational_dna','Seed · DNA Organizacional','generate-organizational-dna','Amostras para diagnóstico de DNA.','["qualidade","precisao","tom"]'::jsonb),
 ('seed_weekly_insights','Seed · Insights Semanais','generate-weekly-insights','Prompts semanais executivos.','["utilidade","objetividade","privacidade"]'::jsonb),
 ('seed_action_plan','Seed · Planos de Ação','generate-action-plan','Planos de ação a partir de sinais.','["utilidade","precisao","objetividade"]'::jsonb),
 ('seed_intelligent_ritual','Seed · Rituais Inteligentes','generate-intelligent-ritual','Rituais recomendados por contexto.','["utilidade","tom","objetividade"]'::jsonb),
 ('seed_cms_recommend','Seed · Motor de Recomendação','cms-recommend','Recomendação de conteúdo por perfil.','["precisao","utilidade","tom"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

WITH src AS (
  SELECT * FROM (VALUES
    ('seed_executive_council',1,'Quais os principais riscos culturais nas últimas 4 semanas?','Lista curta com evidências agregadas, sem citar indivíduos.','risco','["privacidade","objetividade"]'),
    ('seed_executive_council',2,'Onde estamos perdendo engajamento por unidade?','Comparativo por unidade com % e recomendação.','engajamento','["utilidade","precisao"]'),
    ('seed_executive_council',3,'Como está a saúde emocional dos líderes?','Resumo qualitativo agregado, respeitando privacidade.','lideranca','["privacidade","tom"]'),
    ('seed_executive_council',4,'Quais rituais tiveram maior impacto no último trimestre?','Top 3 rituais com métricas.','rituais','["precisao","utilidade"]'),
    ('seed_executive_council',5,'Qual a prioridade nº1 para o RH esta semana?','Uma prioridade objetiva justificada.','acao','["objetividade","utilidade"]'),
    ('seed_organizational_dna',1,'Gere o DNA organizacional resumido em 5 traços.','5 traços com descrição curta.','sintese','["qualidade","tom"]'),
    ('seed_organizational_dna',2,'Quais são os 3 pontos fortes culturais mais evidentes?','3 pontos com evidência agregada.','forcas','["precisao"]'),
    ('seed_organizational_dna',3,'Quais riscos emergem nos últimos 30 dias?','Riscos priorizados + mitigação.','riscos','["utilidade","precisao"]'),
    ('seed_weekly_insights',1,'Resumo executivo da semana em 5 bullets.','5 bullets acionáveis.','resumo','["objetividade","utilidade"]'),
    ('seed_weekly_insights',2,'Principais sinais preditivos desta semana.','Lista com nível de confiança.','sinais','["precisao"]'),
    ('seed_weekly_insights',3,'Qual o próximo passo prioritário?','Ação clara em 1 frase.','acao','["objetividade"]'),
    ('seed_action_plan',1,'Plano de ação para queda de eNPS na unidade X.','Plano com objetivo, tarefas, prazo e responsável.','plano','["utilidade","precisao"]'),
    ('seed_action_plan',2,'Plano para melhorar segurança psicológica.','Plano 30/60/90.','seguranca','["utilidade"]'),
    ('seed_action_plan',3,'Plano para reduzir turnover em vendas.','Plano com hipóteses e KPIs.','turnover','["precisao"]'),
    ('seed_intelligent_ritual',1,'Ritual para reconexão de time remoto pós-conflito.','Ritual com nome, passos, duração, resultado.','reconexao','["tom","utilidade"]'),
    ('seed_intelligent_ritual',2,'Ritual semanal de reconhecimento entre pares.','Ritual leve e replicável.','reconhecimento','["utilidade"]'),
    ('seed_intelligent_ritual',3,'Ritual de kickoff para nova squad.','Ritual de alinhamento e cultura.','kickoff','["tom"]'),
    ('seed_cms_recommend',1,'Recomende 3 conteúdos para líder iniciante em cultura.','Top 3 com justificativa curta.','lider','["precisao","utilidade"]'),
    ('seed_cms_recommend',2,'Recomende trilha para RH em transformação cultural.','Trilha ordenada e fundamentada.','trilha','["utilidade","tom"]'),
    ('seed_cms_recommend',3,'Recomende podcast + material para engajamento.','2 itens complementares.','engajamento','["precisao"]')
  ) AS t(dkey, pos, q, ea, cat, crit)
)
INSERT INTO public.ai_lab_dataset_items (dataset_id, position, question, expected_answer, category, criteria, weight)
SELECT d.id, s.pos, s.q, s.ea, s.cat, s.crit::jsonb, 1.0
FROM src s
JOIN public.ai_lab_datasets d ON d.key = s.dkey
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_lab_dataset_items i
  WHERE i.dataset_id = d.id AND i.position = s.pos
);
