# ADMIN_DATABASE.md — Tabelas do Super Admin

Todas as leituras administrativas passam por estas tabelas. Nenhuma tela do
Super Admin acessa tabelas de conteúdo individual de colaboradores.

## Tabelas primárias

### `organizations`
Empresas clientes. Colunas relevantes: `name`, `slug`, `plan`,
`subscription_status`, `licenses_total`, `licenses_used`, `mrr_cents`,
`trial_ends_at`, `current_period_end`, `stripe_customer_id`,
`stripe_subscription_id`, `archived_at`, `deleted_at` (soft delete).
RLS: leitura restrita a `platform_admin` e à própria organização.

### `platform_usage_daily`
Telemetria agregada diária por organização. Colunas: `usage_date`,
`ai_messages_count`, `tokens_in`, `tokens_out`, `estimated_ai_cost_cents`,
`checkins_count`, `pulse_count`, `dna_reports_count`, `active_users_count`,
`errors_429`, `errors_500`, `avg_latency_ms`.
Populada pela edge function `compute-platform-usage`.

### `platform_audit_logs`
Trilha de auditoria. Colunas: `actor_user_id`, `action`, `entity_type`,
`entity_id`, `organization_id`, `metadata`, `ip`, `user_agent`, `created_at`.
RLS: leitura só `platform_admin`; escrita permitida a `authenticated`
(quando `actor_user_id = auth.uid()`) e a `service_role`.

### `platform_settings`
Chave/valor JSONB para configuração global. Colunas: `key` (unique), `value`,
`updated_at`. RLS: somente `platform_admin` lê/escreve.

### `support_tickets`
Tickets de suporte da plataforma. Colunas: `organization_id`, `created_by`,
`assigned_to`, `subject`, `body`, `status`, `priority`, `metadata`.

### `support_ticket_comments`
Comentários por ticket. Colunas: `ticket_id`, `author_id`, `body`,
`is_internal`. `is_internal=true` é visível somente a `platform_admin`;
mensagens públicas visíveis também ao RH da organização do ticket.

## Tabelas consultadas para agregados

- `profiles` — contagem de usuários por organização.
- `user_roles` — filtro por `platform_admin`.
- `organizational_scores` — último score por organização.
- `organizational_dna_reports` — último DNA por organização.
- `weekly_ai_insights`, `action_plans`, `intelligent_rituals` — contadores
  no analytics.
- `alerts`, `predictive_signals` — contadores agregados.

## Tabelas explicitamente NUNCA lidas no Super Admin

- `emotional_checkins`
- `pulse_responses`
- `pulse_prompts`
- `onboarding_messages`
- `executive_ai_messages`
- `onboarding_interviews`

## Convenções

- Toda tabela em `public` tem `GRANT` explícito para `authenticated` e
  `service_role`.
- Toda tabela tem `created_at`/`updated_at` com trigger `set_updated_at`.
- Soft delete via `deleted_at`/`archived_at` (nunca `DELETE` físico em
  `organizations`).
