# Planos de Ação IA™ — Admin Guide

Módulo Super Admin para configurar o gerador de Planos de Ação IA™.

## Rota
`/admin/ai/planos-acao` — item ativo no submenu **Inteligência Artificial → Planos de Ação**.

## Armazenamento
- `ai_prompt_configs` com `key = 'action_plan'`.
- Snapshots por publicação em `ai_prompt_versions`.
- Auditoria em `platform_audit_logs` (`action = 'ai_prompt_published'`).

## Estrutura da configuração (`tone_config` aninhado)
- **Comportamento:** `tone`, `detail`, `max_tasks`, `max_risks`, `require_deadline`, `require_owner`, `require_metrics`, `require_impact_measurement`, `prefer_low_effort_high_impact`, `extra_instructions`.
- **Tarefas:** `tasks.{min,max,require_owner,require_relative_deadline,require_completion_criteria,allow_dependencies,allow_effort,allow_impact,allow_priority,granularity}`.
- **Métricas/Impacto:** `metrics.{require_baseline,require_indicator,require_direction,require_comparison_window,default_impact_window_days,min_confidence,extra_instructions}`.
- **Priorização:** `prioritization.{priorities[],effort[],impact[]}` — labels/keys editáveis (mínimo 1 por bucket).
- **Estrutura de saída:** 17 blocos com `order`/`active`. Obrigatórios (sempre ativos): `title`, `problem_statement`, `objective`, `due_date`, `success_metrics`, `tasks`, `impact_measurement`.
- **Modelo:** `primary_model`, `fallback_model`, `temperature`, `max_tokens`, `timeout_seconds`, `json_retries`, `streaming`, `max_cost_per_generation_usd`.

## Guardrails imutáveis (aplicados no backend)
- Só dados agregados, k-anonimato.
- Sem identificação individual, chats, denúncias, onboarding pessoal.
- Sem diagnóstico clínico, demissão individual ou ações discriminatórias.
- Sem cruzar dados de outra organização.
- Sem números inventados, sem meta sem baseline.
- `owner_role` restrito a papéis (nunca pessoa).

## JSON de saída
```
{
  "title","description","source_type","source_id",
  "problem_statement","objective","expected_result","target_audience",
  "priority","owner_role","start_date","due_date",
  "success_metrics":[],
  "tasks":[{"title","description","owner_role","priority","effort","impact",
            "due_offset_days","dependencies":[],"completion_criteria"}],
  "execution_risks":[{"description","probability","impact","prevention","contingency"}],
  "dependencies":[], "follow_up_cadence", "completion_criteria",
  "impact_measurement":{"baseline_metrics":[],"comparison_window_days","success_rule"},
  "confidence", "confidence_reason", "limitations":[]
}
```

## Edge function (`generate-action-plan`)
1. Autentica (JWT) — teste requer `platform_admin`; produção requer `owner`/`rh_admin`.
2. Carrega config: `config_source` = `published` (default) ou `draft` (só teste).
3. Coleta contexto agregado por `source_type` (`dna`, `predictive_signal`, `alert`, `executive_ai`, `weekly_insight`, `manual`) + `get_rh_dashboard_summary`.
4. Monta system prompt dinâmico (estrutura, exigências, guardrails imutáveis, papéis permitidos, formato JSON).
5. Chama modelo principal → fallback automático em erros 5xx/429.
6. Sanitiza (papéis, prioridades, effort/impact válidos; corta arrays; força medição de impacto placeholder se ausente; `confidence` clampada).
7. `test_mode: true` → retorna `{plan, warnings, metrics}` sem persistir.
8. Modo normal → grava em `action_plans` + `action_plan_tasks`.
9. Métricas: `model, fallback_used, latency_ms, tokens_in/out, estimated_cost_usd, config_version, config_source`.

## Fluxo Super Admin
1. Editar rascunho nas 6 abas de configuração.
2. **Salvar rascunho** (aparece com status `draft`).
3. **Testar Geração** *(Sub-fase B)* — usa `config_source: draft`, `test_mode: true`.
4. **Publicar** → gera snapshot em `ai_prompt_versions`, incrementa `version` e registra auditoria.
5. **Editar por IA** *(Sub-fase C)* — chat sugerido com diff antes de aplicar no rascunho.
6. **Histórico** *(Sub-fase C)* — comparação A×B e restauro no rascunho.

## Fallback / recuperação
- Falha do modelo primário (5xx/429) → tenta fallback (`gemini-2.5-flash`).
- Falha do JSON → retorna `invalid_ai_response` com raw.
- `429`/`402` do gateway propagados literalmente para o cliente com toasts.
- Timeout respeita `model_config.timeout_seconds`.
