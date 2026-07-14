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
- **B (próxima)**: UI `/admin/ai/lab` — Dashboard, Playground, Prompt Studio, Comparador, Benchmarks, Datasets, Avaliações, Experimentos, Publicações, Rollback, Histórico.
- **C**: execução A/B lado-a-lado com streaming, insights automáticos ("qualidade +8%, custo −18%"), exportação CSV/JSON, seed dos datasets iniciais (Conselho 100, DNA 50, Insights 50, Planos 50, Rituais 40, Recomendação 80), atualização de `AI_PLAYBOOK_ENTERPRISE.md`, `SYSTEM_ARCHITECTURE.md` e `SUPER_ADMIN.md`.

## Segurança
- Nenhuma edição direta em produção — sempre via `Draft → Publish`.
- `ai_prompt_versions` é append-only (INSERT permitido; sem UPDATE/DELETE).
- `ai_lab_logs` é append-only (SELECT + INSERT apenas).
- Rollback nunca sobrescreve histórico: cria nova versão restaurando o snapshot.

## Pendências conhecidas
- Streaming lado-a-lado (Sub-fase C).
- Insights automáticos de comparação entre versões (Sub-fase C).
- Seed inicial de datasets (Sub-fase C).
- Exportação CSV/JSON (Sub-fase C).