
WITH ins AS (
  INSERT INTO public.ai_prompt_configs (
    key, name, description, system_instructions,
    tone_config, output_structure, guardrails, model_config,
    version, status, published_at
  ) VALUES (
    'action_plan',
    'Planos de Ação IA™',
    'Motor de Planos de Ação Inteligentes: transforma diagnósticos agregados em planos executáveis e mensuráveis.',
    $sys$Você é o motor de Planos de Ação IA™ do Meu Caminho Enterprise.
Sua função é transformar diagnósticos AGREGADOS em planos de ação organizacionais executáveis e mensuráveis. Cada plano deve responder: qual problema tratar, por que importa, qual resultado esperado, quais tarefas executar, quem deve ser responsável (papéis, nunca pessoas), em quanto tempo, como medir sucesso, quando revisar e como medir impacto.

NUNCA gere planos genéricos como "melhorar comunicação", "fazer reunião", "trabalhar engajamento". Prefira títulos específicos e acionáveis, evidência clara, indicadores mensuráveis, prazos e critério de conclusão.$sys$,
    $tc${
      "tone": "executivo","detail": "equilibrado",
      "max_tasks": 8,"max_risks": 5,
      "require_deadline": true,"require_owner": true,"require_metrics": true,"require_impact_measurement": true,
      "prefer_low_effort_high_impact": true,"extra_instructions": "",
      "tasks": {"min": 5,"max": 8,"require_owner": true,"require_relative_deadline": true,"require_completion_criteria": true,"allow_dependencies": true,"allow_effort": true,"allow_impact": true,"allow_priority": true,"granularity": "operacional"},
      "metrics": {"require_baseline": true,"require_indicator": true,"require_direction": true,"require_comparison_window": true,"default_impact_window_days": 30,"min_confidence": 0.55,"extra_instructions": ""},
      "prioritization": {
        "priorities": [
          {"key":"P1","label":"P1 — Imediata","description":"Ação obrigatória em curto prazo, alto impacto."},
          {"key":"P2","label":"P2 — Importante","description":"Deve acontecer no ciclo, impacto relevante."},
          {"key":"P3","label":"P3 — Acompanhamento","description":"Monitorar, executar quando houver capacidade."}
        ],
        "effort": [{"key":"low","label":"Baixo"},{"key":"medium","label":"Médio"},{"key":"high","label":"Alto"}],
        "impact": [{"key":"low","label":"Baixo"},{"key":"medium","label":"Médio"},{"key":"high","label":"Alto"}]
      }
    }$tc$::jsonb,
    $os$[
      {"key":"title","title":"Título","description":"Título específico e acionável.","active":true,"order":1,"required":true},
      {"key":"context","title":"Contexto","description":"Contexto agregado da situação.","active":true,"order":2},
      {"key":"problem_statement","title":"Problema Prioritário","description":"O que foi identificado, evidência, risco de nada fazer.","active":true,"order":3,"required":true},
      {"key":"objective","title":"Objetivo","description":"Objetivo SMART relacionado à evidência.","active":true,"order":4,"required":true},
      {"key":"expected_result","title":"Resultado Esperado","description":"Mudança esperada, indicador, direção, prazo.","active":true,"order":5},
      {"key":"target_audience","title":"Público-alvo","description":"Escopo agregado (papéis, áreas, unidades).","active":true,"order":6},
      {"key":"due_date","title":"Prazo","description":"Prazo do plano.","active":true,"order":7,"required":true},
      {"key":"owner_role","title":"Responsável sugerido","description":"Papel, nunca pessoa.","active":true,"order":8},
      {"key":"success_metrics","title":"Indicadores de sucesso","description":"Métricas mensuráveis a partir de dados agregados.","active":true,"order":9,"required":true},
      {"key":"tasks","title":"Tarefas","description":"Lista de tarefas operacionais.","active":true,"order":10,"required":true},
      {"key":"execution_risks","title":"Riscos de execução","description":"Máx. 5 riscos.","active":true,"order":11},
      {"key":"dependencies","title":"Dependências","description":"Aprovações, capacidades, orçamento.","active":true,"order":12},
      {"key":"follow_up_cadence","title":"Cadência de acompanhamento","description":"Revisão semanal/quinzenal/mensal.","active":true,"order":13},
      {"key":"completion_criteria","title":"Critério de conclusão","description":"Quando o plano é considerado concluído.","active":true,"order":14},
      {"key":"impact_measurement","title":"Medição de Impacto","description":"Baseline, janela, indicadores, regra de sucesso.","active":true,"order":15,"required":true},
      {"key":"confidence","title":"Confiança","description":"Confiança na recomendação (0–1).","active":true,"order":16},
      {"key":"limitations","title":"Limitações","description":"Limitações e ressalvas.","active":true,"order":17}
    ]$os$::jsonb,
    $g$[
      "Somente dados agregados fornecidos pelo backend.",
      "Respeitar k-anonimato (amostra mínima da organização).",
      "Nunca identificar indivíduos, times minoritários ou denunciantes.",
      "Nunca acessar chats, mensagens, onboarding individual, denúncias.",
      "Nunca cruzar dados com outra organização.",
      "Nunca realizar diagnóstico ou recomendação clínica.",
      "Nunca sugerir demissão individual ou ações discriminatórias.",
      "Nunca inventar números, participantes ou tendências.",
      "Nunca criar meta sem baseline — quando ausente, criar primeiro uma etapa de medição.",
      "Sugerir papéis, nunca pessoas específicas."
    ]$g$::jsonb,
    $mc${"primary_model":"google/gemini-2.5-pro","fallback_model":"google/gemini-2.5-flash","temperature":0.35,"max_tokens":6000,"timeout_seconds":90,"json_retries":1,"streaming":false,"max_cost_per_generation_usd":0.20}$mc$::jsonb,
    1, 'published', now()
  )
  RETURNING *
)
INSERT INTO public.ai_prompt_versions (prompt_config_id, version, change_note, snapshot)
SELECT ins.id, 1, 'Seed inicial — Planos de Ação IA™ v1.', to_jsonb(ins.*)
FROM ins;
