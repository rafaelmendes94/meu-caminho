# Bloco 40 — Platform Admin: Planos, Billing, Segurança, Settings

## Escopo
- `PlatformPlansScreen`
- `PlatformBillingScreen`
- `PlatformSubscriptionsScreen`
- `PlatformSecurityScreen`
- `PlatformSettingsScreen`

## Auditoria
Telas consomem `platform_plans`, `organization_contracts`, `platform_settings`, `platform_audit_logs`. Sem mocks nem preços fake.

Encontrado e corrigido: chave hardcoded `cury_chat_per_day` em `PlatformSettingsScreen.tsx` (defaults de rate limits + label do NumberGrid). Renomeada para `ai_chat_per_day` / `ai-chat / dia` para remover branding.

## Alterações
- `src/pages/PlatformSettingsScreen.tsx`: `cury_chat_per_day` → `ai_chat_per_day`.

## Pendências (features backend)
- **Plans:** editor visual de features/limites por plano + versionamento (`platform_plans.version`).
- **Billing:** integração real com Stripe/Paddle (invoices, tax, dunning) e webhook `billing.*`.
- **Subscriptions:** upgrade/downgrade com pro-rata + trial extendido por org.
- **Security:** dashboard de 2FA adoption, sessões ativas, revogação de tokens, alertas SIEM.
- **Settings:** propagar `rate_limits` em runtime nas edge functions (`ai-chat`, `executive-ai`, `generate-dna`, `send-invite`, `submit-pulse`) via `platform_settings` cache.
- Migrar chave `cury_chat_per_day` existente em `platform_settings` para `ai_chat_per_day` (script one-shot).

## Status
✅ Concluído — branding removido; features de billing/security aguardam backend.

---

## 🏁 Cobertura total dos 40 blocos
Blocos 01–40 cobrem as 180 telas do sistema (usuário, enterprise RH, enterprise config, platform admin). Próximos passos ficam no lado de backend/integrações listadas em cada bloco.