# Data Mock Audit — Super Admin SaaS (Fase 18.1)

Todas as telas do Super Admin (`/admin/*`) consultam exclusivamente dados reais do backend.

## Telas e fontes reais

| Tela | Rota | Fonte |
|------|------|-------|
| Dashboard | `/admin/dashboard` | RPC `get_platform_overview` |
| Organizações | `/admin/organizations` | RPC `get_platform_organizations` |
| Detalhe Organização | `/admin/organizations/:id` | tabelas `organizations`, `platform_usage_daily`, `support_tickets`, `platform_audit_logs` |
| Assinaturas | `/admin/subscriptions` | tabela `organizations` (aviso "Billing não conectado" quando `stripe_customer_id` inexistente) |
| Inteligência Artificial | `/admin/ai-usage` | tabela `platform_usage_daily` (últimos 30 dias) |
| Suporte | `/admin/support` | tabela `support_tickets` |
| Auditoria | `/admin/audit` | tabela `platform_audit_logs` |

## Regras aplicadas

- Nunca exibir números fictícios. Quando não há dados, mostrar "Sem dados disponíveis".
- Nunca exibir dados individuais de colaboradores (mensagens, check-ins pessoais, onboarding, perfil).
- Métricas de Stripe (MRR/ARR/receita) só aparecem quando a integração for conectada; caso contrário, aviso explícito.
- Todos os RPCs verificam `is_platform_admin()` antes de retornar dados.

## Fora do escopo desta fase

O app Enterprise/RH/B2C mantém seus dados atuais; nenhuma tela desses módulos foi alterada.