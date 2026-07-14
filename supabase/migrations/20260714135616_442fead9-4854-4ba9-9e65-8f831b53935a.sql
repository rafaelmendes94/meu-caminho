WITH ins AS (
  INSERT INTO public.ai_prompt_configs (
    key, name, description, system_instructions,
    tone_config, output_structure, guardrails, model_config,
    version, status, published_at
  ) VALUES (
    'intelligent_ritual',
    'Rituais Inteligentes IA™',
    'Motor de Rituais Inteligentes: transforma sinais agregados em intervenções coletivas práticas, seguras e mensuráveis.',
    $sys$Você é o motor de Rituais Inteligentes IA™ do Meu Caminho Enterprise.
Sua função é transformar sinais organizacionais AGREGADOS em intervenções coletivas concretas — rituais executáveis por RH e lideranças para melhorar comunicação, engajamento, energia, recuperação, liderança, integração, colaboração, pertencimento, segurança psicológica e cultura.

NUNCA gere rituais genéricos como "faça uma reunião" ou "converse com o time". Cada ritual deve trazer objetivo específico, público, duração, materiais, facilitador (papel), passo a passo claro, perguntas de reflexão, fechamento e forma de medir impacto. Sempre gere três variações: presencial, remoto e híbrido.$sys$,
    $tc${
      "tone":"pratico","detail":"detalhado",
      "min_duration_minutes":10,"max_duration_minutes":60,
      "require_objective":true,"require_problem":true,"require_audience":true,
      "require_facilitator_role":true,"require_materials":true,
      "require_success_metric":true,"require_impact_measurement":true,
      "require_questions":true,"require_closing":true,
      "variations":{"presencial":true,"remoto":true,"hibrido":true},
      "extra_instructions":"",
      "steps":{"min":5,"max":10,"require_time_per_step":true,"granularity":"operacional"},
      "questions":{"min":2,"max":6},
      "personalization":{"by_company_size":true,"by_department":true,"by_moment":true,"by_objective":true}
    }$tc$::jsonb,
    $os$[
      {"key":"title","title":"Título","description":"Título específico e evocativo.","active":true,"order":1,"required":true},
      {"key":"description","title":"Descrição","description":"Descrição executiva do ritual.","active":true,"order":2},
      {"key":"type","title":"Tipo","description":"Tipo do ritual (da biblioteca).","active":true,"order":3,"required":true},
      {"key":"objective","title":"Objetivo","description":"Objetivo claro e mensurável.","active":true,"order":4,"required":true},
      {"key":"problem","title":"Problema que resolve","description":"Que sinal agregado motivou o ritual.","active":true,"order":5,"required":true},
      {"key":"context","title":"Contexto","description":"Contexto organizacional agregado.","active":true,"order":6},
      {"key":"when_to_apply","title":"Quando aplicar","description":"Momento/gatilho recomendado.","active":true,"order":7},
      {"key":"audience","title":"Público","description":"Escopo agregado (papéis, áreas).","active":true,"order":8,"required":true},
      {"key":"duration","title":"Duração","description":"Duração total em minutos.","active":true,"order":9,"required":true},
      {"key":"preparation","title":"Preparação","description":"O que preparar antes.","active":true,"order":10},
      {"key":"materials","title":"Materiais","description":"Materiais necessários.","active":true,"order":11,"required":true},
      {"key":"facilitator","title":"Facilitador","description":"Papel do facilitador — nunca pessoa.","active":true,"order":12,"required":true},
      {"key":"steps","title":"Passo a passo","description":"Roteiro claro (abertura → encerramento).","active":true,"order":13,"required":true},
      {"key":"questions","title":"Perguntas","description":"Perguntas de reflexão coletiva.","active":true,"order":14,"required":true},
      {"key":"closing","title":"Fechamento","description":"Ritual de encerramento e compromissos.","active":true,"order":15,"required":true},
      {"key":"variations","title":"Variações","description":"Presencial, remoto, híbrido.","active":true,"order":16,"required":true},
      {"key":"success_metrics","title":"Métricas de sucesso","description":"Como saber se funcionou.","active":true,"order":17,"required":true},
      {"key":"impact_measurement","title":"Medição de impacto","description":"Baseline, janela, indicadores.","active":true,"order":18,"required":true},
      {"key":"confidence","title":"Confiança","description":"Confiança (0–1).","active":true,"order":19},
      {"key":"limitations","title":"Limitações","description":"Limitações e ressalvas.","active":true,"order":20}
    ]$os$::jsonb,
    $g$[
      "Somente dados agregados fornecidos pelo backend.",
      "Respeitar k-anonimato (amostra mínima da organização).",
      "Nunca identificar indivíduos, times minoritários ou denunciantes.",
      "Nunca acessar chats, mensagens, onboarding individual, denúncias ou respostas individuais.",
      "Nunca cruzar dados com outra organização.",
      "Nunca realizar diagnóstico ou recomendação clínica.",
      "Nunca prometer cura, tratamento ou resultado terapêutico.",
      "Nunca inventar números, participantes ou tendências.",
      "Nunca sugerir demissão, exposição ou constrangimento individual.",
      "Facilitador é sempre um papel, nunca uma pessoa nomeada.",
      "Duração entre 10 e 60 minutos por ritual.",
      "Sempre gerar variações presencial, remoto e híbrido quando aplicável."
    ]$g$::jsonb,
    $mc${"primary_model":"google/gemini-2.5-pro","fallback_model":"google/gemini-2.5-flash","temperature":0.4,"max_tokens":6000,"timeout_seconds":90,"json_retries":1,"streaming":false,"max_cost_per_generation_usd":0.20,"ritual_types":[
      {"key":"daily","label":"Daily","description":"Ritmo diário curto.","active":true},
      {"key":"weekly","label":"Weekly","description":"Ritmo semanal.","active":true},
      {"key":"monthly","label":"Monthly","description":"Ritmo mensal.","active":true},
      {"key":"integration","label":"Integração","description":"Integração de times/novos membros.","active":true},
      {"key":"communication","label":"Comunicação","description":"Melhoria de comunicação.","active":true},
      {"key":"leadership","label":"Liderança","description":"Desenvolvimento e prática de liderança.","active":true},
      {"key":"energy","label":"Energia","description":"Restaurar energia coletiva.","active":true},
      {"key":"recovery","label":"Recuperação","description":"Descompressão e recuperação.","active":true},
      {"key":"recognition","label":"Reconhecimento","description":"Reconhecimento coletivo.","active":true},
      {"key":"feedback","label":"Feedback","description":"Cultura de feedback.","active":true},
      {"key":"alignment","label":"Alinhamento","description":"Alinhamento de prioridades.","active":true},
      {"key":"mental_health","label":"Saúde Mental","description":"Bem-estar coletivo (não clínico).","active":true},
      {"key":"welcome","label":"Boas-vindas","description":"Chegada de novos membros.","active":true},
      {"key":"sprint_closing","label":"Encerramento de Sprint","description":"Retro/celebração de ciclo.","active":true},
      {"key":"culture","label":"Cultura","description":"Reforço de cultura e valores.","active":true},
      {"key":"innovation","label":"Inovação","description":"Espaço para novas ideias.","active":true},
      {"key":"development","label":"Desenvolvimento","description":"Desenvolvimento coletivo.","active":true}
    ]}$mc$::jsonb,
    1, 'published', now()
  )
  ON CONFLICT (key) DO NOTHING
  RETURNING *
)
INSERT INTO public.ai_prompt_versions (prompt_config_id, version, change_note, snapshot)
SELECT ins.id, 1, 'Seed inicial — Rituais Inteligentes IA™ v1.', to_jsonb(ins.*)
FROM ins;