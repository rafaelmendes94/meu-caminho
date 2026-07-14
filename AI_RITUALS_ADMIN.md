# Rituais Inteligentes IA™ — Admin Guide

Módulo Super Admin para configurar o motor de Rituais Inteligentes IA™.

## Rota
`/admin/ai/rituais-inteligentes` — item ativo no submenu **Inteligência Artificial → Rituais Inteligentes**.

## Armazenamento
- `ai_prompt_configs` com `key = 'intelligent_ritual'`.
- Snapshots por publicação em `ai_prompt_versions`.
- Auditoria em `platform_audit_logs` (`action = 'ai_prompt_published'`).

## Estrutura da configuração (`tone_config` aninhado)
- **Comportamento:** `tone`, `detail`, `min_duration_minutes`, `max_duration_minutes`, exigências obrigatórias (`require_objective`, `require_problem`, `require_audience`, `require_facilitator_role`, `require_materials`, `require_success_metric`, `require_impact_measurement`, `require_questions`, `require_closing`), `variations.{presencial,remoto,hibrido}`, `personalization.{by_company_size,by_department,by_moment,by_objective}`, `extra_instructions`.
- **Passo a Passo:** `steps.{min,max,require_time_per_step,granularity}`.
- **Perguntas:** `questions.{min,max}`.
- **Estrutura de saída:** 20 blocos com `order`/`active`. Obrigatórios: `title`, `type`, `objective`, `problem`, `audience`, `duration`, `materials`, `facilitator`, `steps`, `questions`, `closing`, `variations`, `success_metrics`, `impact_measurement`.
- **Modelo:** `primary_model`, `fallback_model`, `temperature`, `max_tokens`, `timeout_seconds`, `json_retries`, `streaming`, `max_cost_per_generation_usd`, `ritual_types[]` (biblioteca editável).

## Biblioteca de tipos (seed inicial, editável)
`daily`, `weekly`, `monthly`, `integration`, `communication`, `leadership`, `energy`, `recovery`, `recognition`, `feedback`, `alignment`, `mental_health`, `welcome`, `sprint_closing`, `culture`, `innovation`, `development`.

## Guardrails imutáveis (aplicados no backend)
- Só dados agregados, k-anonimato.
- Sem identificação individual, chats, denúncias, onboarding, respostas individuais.
- Sem diagnóstico clínico, promessa de cura, tratamento terapêutico.
- Sem cruzar dados de outra organização.
- Sem números inventados.
- Sem demissão, exposição ou constrangimento individual.
- Facilitador é sempre um papel.
- Duração entre 10 e 60 min (padrão).

## Fontes permitidas
`dna`, `weekly_insight`, `executive_ai`, `alert`, `predictive_signal`, `impact_engine`, `organizational_score`, `pulse`, `checkin`, `capacity`, `trend`, `participation`, `ritual_history`, `manual`, `scenario` (teste).

## JSON de saída
```
{
  "title","description","type",
  "objective","problem","context","when_to_apply",
  "audience","duration","preparation",
  "materials":[],"facilitator":"",
  "steps":[{"order","title","description","minutes"}],
  "questions":[],
  "closing":"",
  "variations":{
    "presencial":{"setup","adjustments"},
    "remoto":{"setup","adjustments"},
    "hibrido":{"setup","adjustments"}
  },
  "success_metrics":[],
  "impact_measurement":{"baseline_metrics":[],"comparison_window_days","success_rule"},
  "confidence", "limitations":[]
}
```

## Edge function (`generate-intelligent-ritual`)
1. Autentica (JWT). `test_mode` requer `platform_admin`; produção requer `owner`/`rh_admin`.
2. Carrega config `intelligent_ritual` de `ai_prompt_configs`.
3. Coleta contexto agregado por `source_type` + `get_rh_dashboard_summary`.
4. Monta system prompt dinâmico (tom, duração, passo a passo, perguntas, variações, tipos ativos, guardrails imutáveis, formato JSON).
5. Chama modelo principal → fallback automático em 5xx/429.
6. Sanitiza (tipo dentro da biblioteca ativa, duração dentro de min/max, passos/perguntas cortados, materiais limitados, facilitador forçado a papel, variações preenchidas, impacto placeholder se ausente, `confidence` clampada).
7. `test_mode: true` → retorna `{ritual, warnings, metrics}` sem persistir.
8. Modo normal → grava em `intelligent_rituals` como `draft`.
9. Métricas: `model, fallback_used, latency_ms, tokens_in/out, estimated_cost_usd, config_version`.

## Cenários de teste (Sub-fase B)
`low_communication`, `low_energy`, `high_overload`, `low_engagement`, `good_recovery`, `high_participation`, `low_score`, `high_score`.

## Fluxo Super Admin
1. Editar rascunho nas 5 abas de configuração (Comportamento, Tipos, Estrutura, Passo a Passo, Modelo).
2. **Salvar rascunho**.
3. **Testar Geração** *(Sub-fase B)* com cenários pré-definidos + fontes reais.
4. **Publicar** → snapshot em `ai_prompt_versions`, versão++ e auditoria.
5. **Editar por IA** *(Sub-fase C)* — chat com diff antes de aplicar no rascunho.
6. **Histórico** *(Sub-fase C)* — comparação A×B e restauro no rascunho.

## Fallback / recuperação
- Falha do modelo primário (5xx/429) → tenta `gemini-2.5-flash`.
- Falha do JSON → retorna `invalid_ai_response` com raw.
- `429`/`402` propagados ao cliente com toasts.
- Timeout respeita `model_config.timeout_seconds`.
