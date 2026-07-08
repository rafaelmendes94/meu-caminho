# DATABASE.md — Enterprise v1.0

## Tabelas principais

### Identidade & Multi-tenant
- `organizations` — empresa cliente (plano, status, dados de contato).
- `profiles` — perfil por usuário; FK indireta ao `auth.users`; `organization_id`, `manager_id`, `department_id`, `unit_id`.
- `user_roles` — papéis (`owner`, `rh_admin`, `employee`, `b2c_user`) escopados por organização.
- `departments`, `units` — estrutura organizacional.
- `employee_profiles` — dados profissionais estendidos do colaborador.
- `enterprise_invites` — convites por e-mail com token.

### Sinal humano
- `emotional_checkins` — check-ins semanais individuais (privados; agregados via RPC).
- `pulse_prompts`, `pulse_responses`, `pulse_schedules` — Pulse IA™ (individuais; agregados via RPC).
- `onboarding_interviews`, `onboarding_messages` — entrevista de onboarding com IA.

### Inteligência organizacional
- `alerts` — alertas RH.
- `predictive_signals` — sinais preditivos.
- `organizational_dna_reports` — DNA Organizacional™.
- `weekly_ai_insights` — Insights Semanais IA™.
- `organizational_scores` — Score Organizacional™ (histórico diário).
- `impact_measurements`, `impact_timelines` — Motor de Impacto™.

### Ação
- `action_plans`, `action_plan_tasks` — Planos de Ação Inteligentes.
- `intelligent_rituals`, `ritual_participations` — Rituais Inteligentes™.

### Governança
- `executive_ai_conversations`, `executive_ai_messages` — Conselho Executivo IA™.
- `privacy_consents` — LGPD.
- `org_chart_snapshots` — histórico do Organograma Vivo™.

## Convenções
- Toda tabela: `id uuid PK default gen_random_uuid()`, `created_at`, `updated_at` (com trigger `set_updated_at`).
- Toda tabela em `public` tem GRANT explícito para `authenticated` e `service_role`.
- RLS obrigatório. Papéis validados via `has_role` / `has_any_role`.
- Agregações RH exigem k-anonimato ≥ 5.

## Índices críticos
- `emotional_checkins (organization_id, week_of)`
- `pulse_responses (organization_id, responded_at)`
- `alerts (organization_id, status, severity)`
- `predictive_signals (organization_id, status, detected_at)`
- `organizational_scores (organization_id, score_date DESC)`
- `impact_measurements (organization_id, measured_at DESC)`

## Cron jobs
- Score diário: 06:30 UTC → `compute-organizational-score`.
- Snapshot org chart: diário.
- Sinais preditivos: 03:00 UTC.
- Insights semanais: segunda-feira 07:00 UTC.