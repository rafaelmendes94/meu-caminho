# ADMIN_EDGE_FUNCTIONS.md — Edge Functions do Super Admin

Somente edge functions que servem o Super Admin (bootstrap, telemetria e
criação/gestão de organizações). Funções específicas do app enterprise
(insights, DNA, planos, rituais) estão em `EDGE_FUNCTIONS.md`.

## `bootstrap-platform-admin`
Cria o primeiro usuário `platform_admin` a partir de um e-mail whitelisted.
Idempotente. Grava em `platform_audit_logs` com `action = 'platform_admin_bootstrapped'`.
JWT obrigatório; retorna 403 se o chamador não estiver na allowlist do secret.

## `create-organization-admin`
Cria uma nova organização e o primeiro usuário `owner` associado. Usado no
CRM (`/admin/organizations`) e no checkout enterprise. Grava
`platform_audit_logs` com `action = 'organization_created'`.

## `compute-platform-usage`
Cron diário (03:15 UTC). Agrega telemetria em `platform_usage_daily`:
mensagens/tokens de IA, check-ins, pulse, DNA, usuários ativos, custos
estimados e latências. Nunca copia dados individuais — só contagens
por organização por dia.

## Tratamento de erro padrão

Todas as edge functions do Super Admin seguem o mesmo contrato:

- Validação de JWT e de payload no início.
- `try/catch` externo que serializa erros em `{ error, details }` com
  status HTTP apropriado (401/403/404/500) e headers CORS.
- Erros do provedor (Supabase, gateway de IA, Resend) são relayados com
  status e corpo originais, nunca convertidos em `500` genérico.
- Falhas gravam `platform_audit_logs` com `action` prefixado por
  `error.<function-name>`.

## Não implementado (placeholder)

- `stripe-webhook` — a integração com Stripe é preparada, mas nenhuma
  edge function foi ativada. Enquanto a assinatura de webhook não estiver
  configurada, `/admin/billing` mostra "Billing não conectado".
- `resend-webhook` — idem para eventos de e-mail.

Ambos devem ser adicionados junto com a rotação de secrets antes de ir
para produção final.
