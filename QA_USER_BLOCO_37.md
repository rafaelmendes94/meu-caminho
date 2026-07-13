# Bloco 37 — Platform Admin (Dashboard, Auditoria, Saúde, Analytics)

## Escopo
- `PlatformAdminDashboardScreen`
- `PlatformAnalyticsScreen`
- `PlatformAuditScreen`
- `PlatformSystemHealthScreen`
- `PlatformAIUsageScreen`
- `PlatformSearchScreen`
- `PlatformAccountScreen`
- `PlatformDocsScreen`

## Auditoria
Todas as telas já consomem Supabase (`platform_audit_logs`, `platform_usage_daily`, `organizations`, `profiles`, `ai_gateway_logs`, etc.). Nenhum mock, preço fake ou branding "Cury/Augusto" encontrado. `PlatformDocsScreen` é página estática de referência.

## Alterações
- Nenhuma alteração de código nesta rodada — telas já estão limpas.

## Pendências (features backend)
- **Dashboard:** materializar view `platform_usage_daily` com agregações diárias por org (MAU, sessões, mensagens IA, custo).
- **Analytics:** cohorts de retenção + funil de ativação por segmento (edge function agendada via `pg_cron`).
- **Audit:** filtros por ator/ação/organização + exportação CSV assinada.
- **System Health:** integrar `supabase--db_health` e status de edge functions em tempo real.
- **AI Usage:** breakdown por modelo/org com alertas de limite (`platform_settings.rate_limits`).
- **Search:** índice global (orgs, users, tickets, content) via `pg_trgm` ou Meilisearch.
- **Docs:** carregar de CMS interno em vez de conteúdo estático.

## Status
✅ Concluído — sem mocks a remover.