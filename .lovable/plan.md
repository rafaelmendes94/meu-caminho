# FASE 12 — Gestão de Owners (Super Admin)

Módulo `/admin/owners` para o Platform Admin gerenciar o ciclo completo dos Owners (administradores das empresas clientes), sem entrar no painel RH.

## Escopo

### 1. Backend (edge functions + RPC)
- **RPC `admin_list_owners()`** (SECURITY DEFINER, checa `is_platform_admin()`): retorna, por Owner, `user_id, full_name, email, phone, organization_id, organization_name, plan, subscription_status, licenses_total, licenses_used, last_sign_in_at, current_period_end, trial_ends_at, created_at, invite_accepted_at, suspended_at`.
- **RPC `admin_owners_kpis()`**: ativos, em trial, suspensos, sem acesso (nunca logaram), licenças totais/usadas/livres, MRR, ARR estimado, churn últimos 90d.
- **Edge function `admin-create-owner`**: cria user (service role), profile, role `owner`, organização (se não existir), envia convite via `send-enterprise-invite`, registra `platform_audit_logs`.
- **Edge function `admin-owner-action`**: aceita `action ∈ {suspend, reactivate, reset_password, resend_invite, soft_delete, impersonate}` + payload. Aplica em `organizations` (novos campos `suspended_at`, `suspension_reason`, `suspension_until`) e retorna, quando `impersonate`, um `magic link` de curta duração para o Super Admin abrir o Enterprise RH como Owner.
- **Migration**: adicionar em `organizations` `suspended_at`, `suspension_reason`, `suspension_until` (nullable). Trigger de validação RLS para bloquear login/IA/convites quando `suspended_at IS NOT NULL` — implementado via checagens nas RPCs/edge functions existentes (não em Auth).

### 2. Frontend
- **`/admin/owners`** (`PlatformOwnersScreen.tsx`): tabela (Nome, Empresa, Email, Telefone, Plano, Licenças contratadas/utilizadas, Status, Último acesso, Último pagamento, Assinatura, Criado, Ações). Cards KPI no topo.
- **Modal “Novo Owner”**: formulário (Nome, Email, Telefone, Empresa existente ou nova, Plano, Licenças, Status inicial). Chama `admin-create-owner`.
- **Modal “Editar Owner”**: Nome, Telefone, Empresa, Plano, Licenças, Status, Domínio, CNPJ, Logo.
- **Modal “Licenças”**: cards de contratadas/usadas/livres + botões (Adicionar, Remover, Upgrade, Downgrade, Renovar trial, Cancelar).
- **Modal “Assinatura”**: read-only mostrando Stripe Customer, Subscription, Plano, Billing, Invoices, Próxima cobrança, Histórico, Status.
- **Modal “Suspender”**: Motivo + Prazo + confirmação.
- **Ações inline** (dropdown por linha): Editar, Entrar como, Suspender/Reativar, Resetar senha, Reenviar convite, Excluir (soft delete).
- **Impersonation banner**: componente global `<ImpersonationBanner/>` monta em `EnterpriseRHLayout` quando `sessionStorage.impersonating === owner_id`. Vermelho, com botão “Voltar ao Super Admin” (assina o Owner, restaura sessão do Super Admin via token guardado).
- **Menu lateral**: adicionar item `Organizações → Owners` no `PlatformAdminLayout`.

### 3. Auditoria & Segurança
- Toda ação registra em `platform_audit_logs` com `actor_id`, `action`, `target_type='owner'|'organization'`, `target_id`, `metadata`.
- RPCs e edge functions gate: `is_platform_admin()` obrigatório.

## Ordem de entrega
1. Migration (`organizations.suspended_at/reason/until` + RPCs `admin_list_owners`, `admin_owners_kpis`).
2. Edge functions `admin-create-owner` e `admin-owner-action`.
3. `PlatformOwnersScreen.tsx` + modais + item no menu + rota em `App.tsx`.
4. `ImpersonationBanner` + wiring no `EnterpriseRHLayout`.

## Fora de escopo
- Cobrança real no Stripe (mantém read-only dos campos já persistidos em `organizations`).
- Auditoria de campo-a-campo em edição (guardamos `metadata` com diff simples).
