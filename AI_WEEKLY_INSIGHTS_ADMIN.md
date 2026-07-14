# AI_WEEKLY_INSIGHTS_ADMIN.md — Editor dos Insights Semanais IA™ (Super Admin)

## Sub-fase A entregue

Rota `/admin/ai/insights-semanais` habilita o Super Admin a configurar comportamento, janela/comparações, estrutura, sinais e limites do relatório semanal. A Edge Function `generate-weekly-insights` passa a ler a configuração publicada, montar o system prompt dinamicamente, aplicar guardrails imutáveis e validar idempotência por semana.

## Banco

- Seed em `ai_prompt_configs` com `key='weekly_insights'`:
  - `tone_config` inclui blocos aninhados `period` (janela e comparações) e `signals` (severidade e prioridades).
  - `output_structure` com 10 blocos (5 obrigatórios: `title`, `executive_summary`, `key_changes`, `confidence`, `limitations`).
  - `guardrails` imutáveis e `model_config` (Gemini 2.5 Pro + fallback Flash, com `max_cost_per_generation_usd`).
- Snapshot v1 gravado em `ai_prompt_versions`.

RLS herdadas: leitura/escrita restritas a `platform_admin`; edge functions usam service role.

## Abas (Sub-fase A)

1. **Comportamento** — tom, detalhe, formalidade, máximos (mudanças, evoluções, sinais, ações, watchlist), switches (hipóteses, evoluções positivas), switches obrigatórios travados (confiança, limitações), instruções adicionais, prompt base.
2. **Período e Comparações** — início da semana (segunda/domingo), período principal (7 dias/semana calendário), toggles de comparação (semana anterior, 4w, 12w), obrigatoriedades (timezone da empresa, amostras comparáveis).
3. **Estrutura** — 10 blocos ordenáveis; 5 obrigatórios travados.
4. **Sinais e Prioridades** — labels de severidade editáveis, requerimentos (evidência obrigatória, prazo, indicador), heurística baixo esforço/alto impacto, instruções adicionais.
5. **Modelo e Limites** — modelo primário/fallback, temperatura, max_tokens, timeout, retries JSON, streaming, custo máximo. Chave nunca exposta.
6. **Testar Geração** — placeholder (Sub-fase B).
7. **Histórico** — lista de snapshots publicados; comparação/restauro chegam na Sub-fase C.

Publicação registra `platform_audit_logs` (`ai_prompt_published`, entity `ai_prompt_configs`).

## Guardrails imutáveis (aplicados sempre pelo backend)

- Apenas dados agregados fornecidos pelo backend.
- Respeitar k-anonimato (amostra mínima da organização).
- Nunca identificar indivíduos, times minoritários ou denunciantes.
- Nunca acessar chats, mensagens, onboarding individual ou denúncias.
- Nunca cruzar dados com outra organização.
- Nunca realizar diagnóstico clínico ou usar linguagem médica.
- Nunca inventar números, percentuais, participantes ou tendências.
- Nunca afirmar causalidade sem evidência (usar linguagem de hipótese).
- Nunca comparar janelas com amostras incompatíveis.

Regras exibidas com cadeado no topo da tela; injetadas pelo backend independentemente do texto salvo.

## Edge Function `generate-weekly-insights`

- Modos de invocação:
  - **RH/Owner autenticado**: geração real para a própria organização (payload `{ organization_id?, config_source? }`).
  - **`test_mode: true`** (restrito a `platform_admin`): usa mesma pipeline, mas **não persiste** em `weekly_ai_insights`.
  - **Cron `run_all: true`**: itera empresas ativas via service role (comportamento preservado).
- Idempotência: para geração real, ignora empresas que já têm insight persistido para o `week_of` calculado (respeita `week_start` configurado). O flag `force: true` permite regenerar.
- Config: carrega `key='weekly_insights'` com cache leve (60s) para publicada; suporta `config_source='draft'`.
- Modelo: chama primário; em erro 5xx, tenta fallback. Métricas retornadas: `model`, `elapsed_ms`, `tokens_in/out/total`, `estimated_cost_usd`, `config_source`, `config_version`, `config_status`, `week_of`.
- Validação: parse JSON estrito; erro `invalid_ai_response` se falhar.
- Persistência real: uma linha por semana em `weekly_ai_insights` (compatível com RH atual), com o JSON rico completo em `evidence.rich` e métricas em `evidence.metrics`.

## Saída JSON alvo

`title`, `executive_summary`, `period{}`, `key_changes[]`, `positive_evolutions[]`, `attention_signals[]`, `hypotheses[]`, `priority_actions[]`, `watchlist[]`, `confidence`, `confidence_reason`, `limitations[]`, `used_sections[]`.

Amostra insuficiente ⇒ dimensão marcada como indisponível e citada em `limitations`.

## Pendências (próximas sub-fases)

- **Sub-fase B**: aba **Testar Geração** com seletor de empresa, execução em `test_mode`, preview renderizado + JSON + métricas.
- **Sub-fase C**: **Editar por IA** (diff + guardrails reforçados) e Histórico com comparação A×B / restauro no rascunho. Reaproveita a Edge Function `ai-prompt-suggest` com `prompt_key='weekly_insights'`.
