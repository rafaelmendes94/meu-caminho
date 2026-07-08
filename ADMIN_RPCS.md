# ADMIN_RPCS.md — RPCs do Super Admin

Todas as funções abaixo são `SECURITY DEFINER` com `search_path = public` e
verificam `public.is_platform_admin()` antes de retornar dados. Se o chamador
não for `platform_admin`, retornam `RAISE EXCEPTION 'not authorized'`.

## Autorização

### `is_platform_admin() → boolean`
Retorna `true` se o `auth.uid()` corrente tem a role `platform_admin` com
`organization_id IS NULL`. Usada por todas as RPCs e políticas RLS abaixo.

## Dashboard e organizações

### `get_platform_overview() → jsonb`
Contadores globais: `total_organizations`, `active_organizations`,
`trialing_organizations`, `past_due_organizations`, `canceled_organizations`,
`total_licenses`, `licenses_used`, `total_active_users_30d`,
`total_ai_messages_30d`, `total_tokens_30d`, `estimated_ai_cost_30d`,
`open_support_tickets`.

### `get_platform_dashboard_summary() → jsonb`
Wrapper com nomes de campo estáveis (`organizations_total`, `trial_count`,
`past_due_count`, `cancelled_count`, `ai_cost_estimate`, `open_tickets`, …).

### `get_platform_organizations(_search text, _status text, _limit int) → table`
Tabela consolidada por organização: `id`, `name`, `slug`, `plan`,
`subscription_status`, `licenses_total`, `licenses_used`,
`active_users_30d`, `ai_messages_30d`, `last_dna_at`, `last_score`,
`ai_cost_30d_cents`, `created_at`, `last_active_at`, `health_status`.

### `get_platform_organization_details(_id uuid) → jsonb`
Bloco único com dados comerciais, licenças, uso 30d, tickets abertos,
últimos audit logs e histórico. Nunca inclui dados individuais.

## Billing

### `billing_overview() → jsonb`
MRR, ARR, receita mensal/anual, trials, `stripe_connected`,
`conversion_rate`, `churn_rate`, `avg_mrr_per_customer`, `ltv_cents`.
Retorna zeros/nulos quando não há dados; nenhum valor sintético.

### `billing_organizations() → table`
`id`, `name`, `plan`, `subscription_status`, `current_period_end`,
`trial_ends_at`, `mrr_cents`, `licenses_total`, `licenses_used`,
`days_remaining`, `stripe_customer_id`, `stripe_subscription_id`.

## IA

### `get_ai_usage(_days int) → jsonb`
Totais + série diária de `ai_messages_count`, `tokens_in`, `tokens_out`,
`errors_429`, `errors_500`, `avg_latency_ms`.

### `get_ai_costs(_days int) → jsonb`
Custos agregados por organização e por dia, em centavos.

## Analytics

### `get_platform_analytics(_days int) → jsonb`
`orgs_total`, `orgs_active`, `users_total`, `dau/wau/mau`, `checkins`,
`pulses`, `dna_reports`, `action_plans`, `rituals`, `avg_impact`,
`engagement_rate`, `retention_rate`, `retention_cohort`, série `daily`.

## Health

### `health_check() → jsonb`
Status por serviço: DB (`pg_size_pretty`), cron (`pg_cron.job_run_details`),
realtime (`pg_publication_tables`), IA (mensagens 24h/1h), OAuth, Stripe
(`stripe_customer_id`), auditoria, suporte. Serviços sem telemetria
(Storage, Edge Functions, Resend) são marcados como `Não instrumentado`,
nunca como `Online` fake.

## Suporte

### `assign_support_ticket(_ticket_id uuid, _assignee uuid) → void`
Atribui um ticket a um usuário (ou libera com `NULL`). Somente
`platform_admin`.
