# Super Admin — Arquitetura Operacional

Painel exclusivo da operação SaaS Meu Caminho Enterprise. **Não** expõe dados
individuais de colaboradores (mensagens, check-ins, pulses, onboarding, perfis).
Somente agregados e metadados administrativos.

## Role

- `platform_admin` (enum `public.app_role`) — não pertence a uma organização
  (`organization_id IS NULL`). Trigger `enforce_user_roles_org_scope` bloqueia
  qualquer outra role com `organization_id` nulo.

## Proteção de rotas

Todas as rotas `/admin/*` são envolvidas pelo wrapper `PlatformAdmin`
(`src/App.tsx`), que usa `ProtectedRoute requiredRoles={["platform_admin"]}`.
Owner, rh_admin, leader, employee e b2c_user recebem "Acesso negado" e são
redirecionados para `/`.

### Redirect pós-login (`src/pages/Index.tsx`)

| Role                  | Destino                                |
|-----------------------|----------------------------------------|
| `platform_admin`      | `/admin/dashboard`                     |
| `owner` / `rh_admin`  | `/enterprise/rh`                       |
| `employee` / `leader` | `/enterprise` (com onboarding se falta)|
| `b2c_user` / demais   | fluxo padrão do app                    |

## Rotas

| Rota                              | Tela                                    |
|-----------------------------------|-----------------------------------------|
| `/admin/dashboard`                | `PlatformAdminDashboardScreen`          |
| `/admin/organizations`            | `PlatformOrganizationsScreen`           |
| `/admin/organizations/:id`        | `PlatformOrganizationDetailScreen`      |
| `/admin/subscriptions`            | `PlatformSubscriptionsScreen`           |
| `/admin/ai-usage`                 | `PlatformAIUsageScreen`                 |
| `/admin/support`                  | `PlatformSupportScreen`                 |
| `/admin/audit`                    | `PlatformAuditScreen`                   |

## Tabelas usadas

- `organizations` — clientes, assinatura, licenças, MRR.
- `platform_usage_daily` — telemetria diária (mensagens IA, tokens, custo).
- `platform_audit_logs` — trilha de ações administrativas.
- `platform_settings` — configuração global chave/valor (RLS: apenas
  `platform_admin`).
- `support_tickets` — tickets de suporte da plataforma.
- Agregados de leitura: `organizational_scores`, `organizational_dna_reports`,
  `alerts` (somente contagens/últimos registros por org).

## RPCs administrativas (SECURITY DEFINER)

Todas checam `public.is_platform_admin()` antes de retornar dados.

- `get_platform_overview()` → jsonb com contadores globais.
- `get_platform_dashboard_summary()` → jsonb com os campos exigidos pela FASE
  Super Admin 01 (`organizations_total`, `organizations_active`, `trial_count`,
  `past_due_count`, `cancelled_count`, `licenses_total`, `licenses_used`,
  `active_users_30d`, `ai_messages_30d`, `ai_tokens_30d`, `ai_cost_estimate`,
  `open_tickets`).
- `get_platform_organizations()` → tabela consolidada por organização
  (status, licenças, ativos 30d, IA 30d, último DNA, último score, health).
- `is_platform_admin()` → boolean helper usado por RLS/RPCs.

## Correções nesta fase

- `get_platform_organizations` retornava `subscription_status text`, mas a
  coluna real é enum `subscription_status`. Adicionado cast explícito
  `::text` (também em `health_status`). Erro `structure of query does not
  match function result type` corrigido.
- Adicionada `get_platform_dashboard_summary` com nomes de campo padronizados.
- Criada `platform_settings` (RLS: só `platform_admin`).

## Privacidade

- Nenhuma tela do Super Admin lê linhas individuais de `emotional_checkins`,
  `pulse_responses`, `onboarding_messages` ou `executive_ai_messages`.
- Todas as leituras cruzam `organizations`/agregados.
- Ações sensíveis devem ser gravadas em `platform_audit_logs` pelo próprio
  código chamador (frontend ou edge function).