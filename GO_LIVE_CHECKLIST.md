# GO LIVE CHECKLIST — Fase 28

Data: 2026-07-14 · Versão: v1.0.0-rc.28

## Banco de Dados (Lovable Cloud)
- [x] RLS habilitada em todas as tabelas públicas.
- [x] Policies revisadas (Platform Admin / Empresa / Colaborador).
- [x] `has_role`, `user_in_org` como SECURITY DEFINER + `search_path=public`.
- [x] Índices em colunas de filtragem quente (`user_id`, `organization_id`, `created_at`).
- [x] Triggers `updated_at` em todas as tabelas mutáveis.
- [ ] Rodar `supabase--slow_queries` semanalmente após go-live.

## Buckets / Storage
- [x] Policies de acesso por role e org.
- [ ] Ativar lifecycle rules de expiração (uploads temporários).

## Edge Functions
- [x] CORS + validação Zod em todas as funções expostas.
- [x] `verify_jwt` padrão (false) com validação em código quando necessário.
- [ ] Deploy dos jobs futuros: `billing-webhook`, `billing-invoice-generator`, `billing-consumption-aggregator`, `gamification-award`, `cms-import-runner`, `cms-versioning-writer`, `cms-ai-enrich`.

## Cron / Agendamentos
- [x] `perf_snapshots`, `health_score_history`, `backup_jobs` populam via jobs internos.
- [ ] Configurar cron de agregação de consumo (`billing_consumption_daily`).

## QA
- [x] QA Center™ com CRUD de suites, testes, execuções, bugs, checklists.
- [ ] Rodar checklist "Go Live" no QA Center antes do release.

## Performance
- [x] Performance Center™ com snapshots, alertas, health score.
- [x] Lazy loading de rotas em `App.tsx` (React.lazy + Suspense).
- [x] `useRealtime` apenas em telas críticas (alertas, insights).

## Backup
- [x] `backup_policies`, `backup_schedules`, `backup_jobs`, `backup_logs`.
- [ ] Validar retenção mínima (30 dias) antes do go-live.

## Billing
- [x] Arquitetura Billing Ready (adapter layer, sem gateway conectado).
- [x] `billing_*` tables com RLS.
- [ ] Escolher e plugar gateway (Stripe / Mercado Pago / Pagar.me / Asaas).

## CMS
- [x] Livros, Cursos, Vídeos, Podcasts, Trilhas, Áudios, Materiais, Categorias, Autores, Coleções, Tags, Competências, Emoções, Reflexões, Mensagens, Quizzes, Certificados.
- [x] Versionamento + importações (estrutura).
- [ ] Editor visual de quizzes e upload de assets em massa.

## IA
- [x] Lovable AI Gateway como provedor default (Gemini 3 Flash).
- [x] Prompts versionados (`ai_prompt_configs`, `ai_prompt_versions`).
- [x] Observability (`ai_usage_daily`, `ai_orchestrator_logs`).
- [x] AI Lab (benchmarks, datasets, experimentos).

## Gamificação
- [x] `gam_*` (XP, níveis, badges, missões, conquistas, temporadas, eventos, streaks, org settings).
- [x] Sem ranking global obrigatório.
- [ ] Motor server-side de concessão automática de XP.

## Empresa / RH
- [x] Executive Cockpit (Fase 23).
- [x] Command Palette ⌘K.
- [x] Alertas segmentados, DNA, Conselho, Insights, Planos, Rituais, Impacto.

## Colaborador
- [x] Employee Experience (Fase 24) — primitives, streaks, palette ⌘K.
- [x] Preferências locais (`employeePrefs`) para "continuar de onde parou".

## Segurança
- [x] 0 findings críticos.
- [ ] 51 warnings (SECURITY DEFINER exec + extension in public) — herdados, sem exploitação; revisitar com hardening dedicado.
- [x] Secrets gerenciados via `add_secret` (não commitados).
- [x] `LOVABLE_API_KEY` server-only.

## Ambiente
- [x] `.env` populado (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID).
- [x] Lovable Cloud ativa.
- [ ] Confirmar `ACTIVE_HEALTHY` no `supabase--cloud_status` no momento do publish.
