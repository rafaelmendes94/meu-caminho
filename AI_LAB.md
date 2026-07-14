# AI_LAB.md — Enterprise v1.0

Ambiente interno de engenharia de IA. Somente `platform_admin`. Nunca altera funcionamento das IAs em produção — apenas gera/testa/publica novas versões de forma controlada.

## Fluxo
```
Draft (ai_prompt_configs) → Playground / Benchmark / Experimento A/B
     → Avaliação (humana + LLM-as-judge) → Publish (ai_prompt_versions + ai_lab_publications)
     → Rollback disponível a qualquer versão anterior
```

## Tabelas
- `ai_lab_datasets` / `ai_lab_dataset_items` — datasets por módulo (pergunta, contexto, resposta esperada, critérios, peso, categoria).
- `ai_lab_runs` — execuções (`playground`, `benchmark`, `experiment`, `dataset`, `judge`) com prompt final, resposta, tokens, custo, latência, chunks RAG, confiança, `knowledge_enabled`, `context_enabled`.
- `ai_lab_evaluations` — notas 1-5 em 6 dimensões (qualidade, precisão, objetividade, privacidade, utilidade, tom) + overall + comentário. `evaluator_kind ∈ {human, llm_judge}`.
- `ai_lab_benchmarks` — execução de dataset completo com aggregate (`approval_rate`, `avg_latency_ms`, `total_cost_usd`, `avg_quality`, `json_invalid`).
- `ai_lab_experiments` / `ai_lab_experiment_runs` — testes A/B com winner (`a`/`b`/`tie`/`inconclusive`).
- `ai_lab_publications` — histórico de `publish` / `rollback` / `archive` (`from_version` → `to_version`, benchmark/experimento referenciados).
- `ai_lab_logs` — auditoria de todas as ações (criou/testou/publicou/restaurou/arquivou).

RLS: em todas as tabelas, apenas `is_platform_admin()`.

## Edge Functions (Sub-fase A)
- `ai-lab-playground` — executa 1 rodada com modelo/config, RAG opcional, persiste em `ai_lab_runs`.
- `ai-lab-judge` — LLM-as-judge (default `google/gemini-2.5-pro`) devolve `scores{}` + `overall` + `comment` e grava em `ai_lab_evaluations`.
- `ai-lab-benchmark` — roda dataset inteiro (padrão até 100 itens), agrega métricas e opcionalmente aciona o judge por item.
- `ai-lab-publish` — `publish` (draft → published + snapshot em `ai_prompt_versions`), `rollback` (restaura snapshot como nova versão) e `archive`. Nunca sobrescreve histórico.

## Reuso de prompts
O AI Lab reutiliza `ai_prompt_configs` (draft) e `ai_prompt_versions` (snapshots) das IAs em produção. Nada é publicado sem passar por `ai-lab-publish`. O `PlatformOrchestratorConfigScreen` e demais telas atuais continuam funcionando sem alteração.

## Multi-provider
Apenas Lovable AI Gateway (Gemini + GPT) nesta fase. Arquitetura preparada para novos providers (basta adicionar entradas em `COST` e whitelist de modelos nas edge functions).

## Custos
Tabela fixa por modelo dentro das edge functions (mesma referência do AI Orchestrator).

## Sub-fases
- **A (concluída)**: schema completo, RLS por platform_admin, 4 edge functions core (`playground`, `judge`, `benchmark`, `publish`).
- **B (concluída)**: UI `/admin/ai/lab` completa (Dashboard, Playground, Prompt Studio, Comparador, Benchmarks, Datasets, Avaliações, Experimentos, Publicações, Rollback, Logs).
- **C (concluída)**: comparador A/B via `ai-lab-compare`, insights automáticos via `ai-lab-insights` ("qualidade +8% · custo −18%"), exportação CSV/JSON via `ai-lab-export`, seed inicial dos datasets (`seed_executive_council`, `seed_organizational_dna`, `seed_weekly_insights`, `seed_action_plan`, `seed_intelligent_ritual`, `seed_cms_recommend`) e docs atualizados.

### Novas Edge Functions (Sub-fase C)
- `ai-lab-compare` — executa duas variantes (modelo/prompt/temperatura) em paralelo sobre a mesma pergunta, persiste 2 runs `kind=experiment`, opcionalmente aciona o judge e devolve `insight { verdict, latency_delta_ms, cost_delta_usd, quality_delta, summary }`.
- `ai-lab-insights` — compara 2 benchmarks (baseline vs candidato), calcula deltas percentuais (aprovação, qualidade, latência, custo), define `winner` e devolve `summary` legível.
- `ai-lab-export` — baixa qualquer tabela do Lab (`ai_lab_runs`, `ai_lab_benchmarks`, `ai_lab_evaluations`, `ai_lab_publications`, `ai_lab_logs`, `ai_lab_datasets`, `ai_lab_dataset_items`) em CSV ou JSON, com filtros por coluna e limite (até 10.000 linhas).

### Seed inicial de datasets
Migration `20260714163000` cria 6 datasets seed idempotentes cobrindo todos os módulos IA em produção. Volumes maiores (Conselho 100, DNA 50, Insights 50, Planos 50, Rituais 40, Recomendação 80) podem ser adicionados incrementalmente pela UI ou via import CSV/JSON.

## Segurança
- Nenhuma edição direta em produção — sempre via `Draft → Publish`.
- `ai_prompt_versions` é append-only (INSERT permitido; sem UPDATE/DELETE).
- `ai_lab_logs` é append-only (SELECT + INSERT apenas).
- Rollback nunca sobrescreve histórico: cria nova versão restaurando o snapshot.

## Pendências conhecidas
- Streaming token-a-token no comparador (server-sent events) — atualmente a resposta é entregue completa quando pronta.
- Import de datasets via upload CSV/JSON pela UI (export já disponível).
- Anthropic Claude direto (Multi-provider adicional — fora do escopo atual: só Lovable AI Gateway).