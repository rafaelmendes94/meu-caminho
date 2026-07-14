# Performance Center

Rota: `/admin/system/performance` — acesso somente `platform_admin`.

## Estrutura de dados (public, RLS: platform_admin only)
- `perf_snapshots` — série temporal `(category, metric, value_num, unit, metadata, captured_at)`. Todo dashboard lê o último valor por `category.metric`.
- `perf_alert_rules` — regras `(metric, comparator gt|gte|lt|lte|eq, threshold, severity info|warning|critical, enabled)`. Seed inclui as regras exigidas: query > 500ms, edge > 2s, IA > 8s, upload > 3s, cron falhando, realtime instável, cache < 50%, storage > 80%.
- `perf_alerts` — disparos históricos por regra (`resolved_at` para fechamento).
- `load_test_plans` — planos com `profile_users` (50/100/500/1000/5000/10000) e lista de `scenarios` (Login, Dashboard RH, Dashboard User, Check-in, Pulse, IA, Upload, Knowledge Hub, CMS).
- `load_test_runs` — execuções (`mode = simulation`), com `results` calculado matematicamente.
- `health_score_history` — snapshots do score 0–100 com breakdown por componente.

Enums novos: `perf_severity`, `perf_comparator`.

## UI
12 abas: Dashboard, Banco, Edge Functions, Storage, Realtime, Cron, IA, Cache, Consultas, Stress Tests, Load Tests, Relatórios.

- Dashboard mostra as métricas exigidas (CPU, Memória, query, edge, IA, upload, download, login, dashboards RH/User, realtime, cron) e o Health Score computado no client a partir das regras ativas.
- Cada aba especializada consome `perf_snapshots` filtrando por `category`/`metric`.
- Stress/Load exibem aviso permanente: simulação matemática — **nenhuma carga é gerada contra produção**. Cálculo determinístico produz TPS, P50/P95/P99, taxa de erro e carga estimada de CPU/DB/Storage/Realtime a partir do número de usuários.
- Relatórios: exporta CSV, JSON e Imprimir/PDF (via `window.print`).
- Um formulário de "Ingestão manual" permite popular métricas até haver coletor automático.

## Health Score
`score = média(componentRules_ok / componentRules_total * 100)` por componente `db|storage|edge|cron|ai|realtime|cache`. Componentes sem regras ou sem dado recente contam 100%. Botão "Registrar snapshot" grava em `health_score_history`.

## Pendências reais
- Coletores automáticos (edge functions ou worker externo) para popular `perf_snapshots` continuamente.
- Integração com métricas reais de CPU/RAM (Lovable Cloud não expõe via API pública).
- Load tests reais devem usar ferramentas externas (k6, Artillery) em ambiente isolado.
- Export PDF usa `window.print`; geração server-side de PDF pode ser adicionada depois.
- Alertas hoje são calculados no client (dashboard/health score); disparo automático em background exige worker/cron para materializar em `perf_alerts`.