# Bloco 39 — Platform Admin: Organizações, Owners, Suporte

## Escopo
- `PlatformOrganizationsScreen`
- `PlatformOrganizationDetailScreen`
- `PlatformOwnersScreen`
- `PlatformSupportScreen`

## Auditoria
Todas consomem Supabase (`organizations`, `organization_contracts`, `organization_settings`, `profiles`, `user_roles`, `support_tickets`, `support_ticket_comments`, `enterprise_invites`). Sem mocks, sem preços fake, sem branding "Cury/Augusto".

## Alterações
- Nenhuma.

## Pendências (features backend)
- **Organizações:** ações em massa (suspender, cancelar, exportar) + filtro por plano/segmento/MRR.
- **Detalhe da org:** timeline de eventos (`organization_audit_logs`), impersonation temporária com log, snapshot financeiro.
- **Owners:** convite de novo owner via edge function `send-invite` + revogação com auditoria.
- **Suporte:** SLA por ticket, atribuição a agente, integração com email transacional (Resend), macros de resposta.

## Status
✅ Concluído — sem mocks.