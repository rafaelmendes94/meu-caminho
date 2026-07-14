# Super Admin — Módulo SaaS

Painel operacional exclusivo da equipe Meu Caminho Enterprise. Não expõe dados
individuais de colaboradores (mensagens, check-ins, pulse, onboarding, chat).
Somente agregados, metadados administrativos e telemetria da plataforma.

## Papel de acesso

- Role `platform_admin` (enum `public.app_role`), sempre com `organization_id IS NULL`.
- Trigger `user_roles_enforce_org_scope` bloqueia qualquer outra role sem organização.
- Todas as rotas `/admin/*` passam pelo wrapper `PlatformAdmin` em `src/App.tsx`, que exige `requiredRoles={["platform_admin"]}`.

## Rotas

| Rota                          | Tela                                    | Descrição                                                 |
|-------------------------------|-----------------------------------------|-----------------------------------------------------------|
| `/admin/dashboard`            | `PlatformAdminDashboardScreen`          | Visão geral (orgs, licenças, IA, tickets)                 |
| `/admin/organizations`        | `PlatformOrganizationsScreen`           | CRM das empresas clientes                                 |
| `/admin/organizations/:id`    | `PlatformOrganizationDetailScreen`      | Detalhe comercial de uma organização                      |
| `/admin/subscriptions`        | `PlatformSubscriptionsScreen`           | Lista de assinaturas                                      |
| `/admin/billing`              | `PlatformBillingScreen`                 | MRR, ARR, trials, churn, LTV                              |
| `/admin/ai-usage`             | `PlatformAIUsageScreen`                 | Consumo de IA (tokens, custos, falhas)                    |
| `/admin/analytics`            | `PlatformAnalyticsScreen`               | DAU/WAU/MAU, uso por módulo, engajamento, retenção        |
| `/admin/system`               | `PlatformSystemHealthScreen`            | Health check de DB, cron, realtime, IA, OAuth, Stripe     |
| `/admin/support`              | `PlatformSupportScreen`                 | Tickets, atribuição, comentários, timeline                |
| `/admin/audit`                | `PlatformAuditScreen`                   | Trilha de auditoria com filtros e export CSV              |
| `/admin/settings`             | `PlatformSettingsScreen`                | Configurações globais (IA, LGPD, feature flags, etc.)     |

## Estados de UI padronizados

Toda tela do Super Admin implementa:

- **Loading** — `Carregando…` ou skeleton de cards/linhas.
- **Erro** — mensagem inline sem stack trace, com hint de recarregar.
- **Empty state** — `Sem dados disponíveis.` (nunca preenchemos zero fictício).
- **Filtros/busca** — quando presentes, permitem limpar; contador de registros exibido.
- **Paginação** — listagens usam `.limit()` explícito (organizações 500, auditoria 500, suporte 300).
- **Exportação** — auditoria exporta CSV do resultado filtrado.

## Privacidade

- Nenhuma tela lê linhas individuais de `emotional_checkins`, `pulse_responses`, `onboarding_messages` ou `executive_ai_messages`.
- Toda leitura passa por `organizations` ou tabelas agregadas (`platform_usage_daily`, `organizational_scores`).
- RPCs administrativas checam `is_platform_admin()` antes de retornar dados.
- Ações sensíveis gravam em `platform_audit_logs`.

## Fases entregues

1. Bootstrap `platform_admin` + dashboard.
2. Organizações (CRM + detalhe).
3. Billing (MRR/ARR/trials/churn/LTV) — Stripe placeholder.
4. IA (tokens, custos, falhas, gráficos 30/7/hoje).
5. Analytics (DAU/WAU/MAU, uso por módulo, retenção).
6. Health (DB, cron, realtime, IA, OAuth, Stripe, Resend).
7. Suporte (tickets, atribuição, comentários públicos/internos).
8. Auditoria (filtros por empresa/usuário/data/ação + CSV + timeline).
9. Configurações (10 seções persistidas em `platform_settings`).
10. Hardening — auditoria e documentação (esta fase).

## Referências

- `ADMIN_DATABASE.md` — tabelas usadas.
- `ADMIN_RPCS.md` — RPCs administrativas.
- `ADMIN_EDGE_FUNCTIONS.md` — edge functions relacionadas.

## Performance Center

Acesso em Sistema → Performance (`/admin/system/performance`). 12 abas cobrem Dashboard, Banco, Edge Functions, Storage, Realtime, Cron, IA, Cache, Consultas, Stress Tests, Load Tests e Relatórios. Health Score 0–100 com breakdown por componente. Simulações não executam carga real.

## QA Center

Acesso em Sistema → QA Center (`/admin/system/qa`). 11 abas cobrem Dashboard, Suites, Execuções, Casos, Bugs, Evidências, Cobertura, Checklists, Smoke Tests, Go Live e Histórico. Seed pronto: 10 suites por módulo e 6 checklists (Go Live, Nova Empresa, Nova Versão, Release, Hotfix, Smoke Tests).
