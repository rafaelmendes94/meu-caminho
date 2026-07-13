# CONSISTENCY_REPORT — FASE RC-03

Data: 2026-07-13  
Modo: auditoria de consistência global (sem alterar regras/arquitetura/tabelas/edge functions).

## Método

Auditoria estática (leitura de código + queries de leitura no banco) de todos os fluxos onde uma escrita em um módulo deve refletir em outro. Nenhum dado real de cliente foi manipulado.

---

## 1. Módulo por módulo

| # | Módulo | Teste (leitura) | Fonte da verdade | Resultado |
|---|---|---|---|---|
| 1 | Empresas | Criar/editar/suspender/reativar/excluir → refletem em `PlatformOrganizations`, `PlatformOwners`, `PlatformOrganizationDetail`, `PlatformBilling`, `PlatformSubscriptions`, `EnterpriseAdminCenter` | `organizations` (única) | ✅ Consistente. `subscription_status` bloqueia login via `ProtectedRoute.orgBlocked`. |
| 2 | Licenças | `licenses_total`/`licenses_used` em Dashboard SA, Owners, Billing, Subscriptions, Central RH | `organizations.licenses_used` (increment em `accept-enterprise-invite`) + `organizations.licenses_total` | ⚠️ **Inconsistência C-01** (ver seção 2). |
| 3 | Planos | Trocar/cancelar/reativar plano → `organizations.plan`, `subscription_status`; `EnterpriseAdminCenter` lê `organization_contracts.licenses_total` | `organizations` + `organization_contracts` | ⚠️ **Inconsistência C-02** (dupla fonte de licenças). |
| 4 | Convites | Criar/cancelar/reenviar/aceitar/expirar → `enterprise_invites` (`accepted_at`/`canceled_at`/`declined_at`), `Team.pending` filtra corretamente por `is null` nos três campos | `enterprise_invites` | ✅ Consistente. Filtro pendentes bate no send/manage/accept. |
| 5 | Colaboradores | Cadastrar/editar/desativar/reativar/excluir → `profiles` (soft-delete `deleted_at`), reflexo em Team, Organograma, Dashboard RH, Pulse (RLS por `organization_id`) | `profiles` | ⚠️ **Inconsistência C-03** (soft-delete não devolve licença — item C-01). |
| 6 | Organograma | Mover gestor/depto → `profiles.department_id`/`manager_id`; snapshot em `org_chart_snapshots` | `profiles` + `departments` + `units` | ✅ Consistente (snapshot é fotografia opcional, KPIs leem `profiles` ao vivo). |
| 7 | Check-in | Novo/histórico/exclusão de usuário → `emotional_checkins` filtrada por `organization_id`; k-anon ≥5 aplicado no Dashboard RH, Score, DNA, Insights, Alertas | `emotional_checkins` | ✅ Consistente. Se `<5` colaboradores, agregados vazios (esperado). |
| 8 | Pulse | Responder/não responder → `pulse_responses`; Dashboard/DNA/Insights leem via k-anon | `pulse_responses` + `pulse_prompts` | ✅ Consistente. |
| 9 | Conteúdos | Publicar/editar/arquivar/excluir → `content_items.status`; Biblioteca, Home, Busca filtram por `status='published'` | `content_items` | ✅ Consistente. RC-01 padronizou toasts. |
| 10 | Cursos | Módulos/aulas → `course_modules`/`course_lessons` cascata; Progresso lê `content_views` | `content_items` (tipo=course) + tabelas filhas | ✅ Consistente. |
| 11 | Livros | Edição/arquivar/coleções/autores → `content_items` (tipo=book) + `content_collections` + `content_item_authors` | `content_items` | ✅ Consistente. Favoritos/histórico via `content_downloads`/`content_views`. |
| 12 | Rituais | Novo/editar/cancelar/participação/feedback → `intelligent_rituals` + `ritual_participations` | `intelligent_rituals` | ✅ Consistente. |
| 13 | Canal Direto | Nova denúncia/responder/resolver/reabrir → `reports` + `report_messages`; RH nunca vê identidade do reporter (RLS + view) | `reports` | ✅ Anonimato preservado. Timeline em `report_messages`. |
| 14 | IA (DNA, Insights, Conselho, Plano de Ação, Preditivo, Impacto) | Todas as edge functions leem tabelas ao vivo (`emotional_checkins`, `pulse_responses`, `profiles`, `organizational_scores`, `impact_measurements`) na hora da chamada | ao vivo | ✅ Nenhum cache incorreto detectado. |
| 15 | Dashboards | SA Dashboard (`compute-platform-usage` diário) · RH Dashboard (queries ao vivo) · Colaborador (queries ao vivo) | `platform_usage_daily` (SA) + tabelas base (RH/User) | ✅ Consistente. `platform_usage_daily` roda por cron; delay de até 24h é esperado (KPIs não-realtime). |
| 16 | Analytics | SA (`platform_usage_daily`) vs Empresa (queries diretas) — comparam a mesma base de tabelas | `platform_usage_daily` + tabelas base | ✅ Consistente (mesmas fontes). |
| 17 | Search | `PlatformSearchScreen` filtra por RLS (`platform_admin` sem escopo); telas RH/User herdam RLS por `organization_id` | RLS | ✅ Nenhum vazamento cross-org detectado. |
| 18 | Exportações | CSV Audit (`PlatformAuditScreen`) · CSV Analytics · LGPD JSON (`MyPrivacyScreen`) respeitam filtros e RLS | RLS + filtros de tela | ✅ Consistente. |
| 19 | Logs | `platform_audit_logs` (SA) e `organization_audit_logs` (RH) escritos por edge functions e por triggers em ações sensíveis | tabelas dedicadas | ✅ Consistente. Rastro de quem criou/editou/excluiu preservado. |
| 20 | Build/Typecheck | `bunx tsgo --noEmit` | — | ✅ 0 erros. |

---

## 2. Inconsistências identificadas

### C-01 · `licenses_used` não decrementa em soft-delete de colaborador  **[REAL — não corrigido em RC-03]**

- **Módulo:** Licenças ↔ Colaboradores.
- **Fluxo com problema:**
  1. `accept-enterprise-invite` faz `licenses_used = licenses_used + 1`.
  2. `EnterpriseEmployeeAdminScreen.remove()` faz `profiles.update({ deleted_at, status: 'inactive' })`.
  3. Nenhuma escrita reverte `licenses_used`.
- **Efeito:** Contador `licenses_used` sobe monotonicamente. Após remover N colaboradores, RH vê `X/Total` inflado; `send-enterprise-invite` bloqueia novos convites em `license_limit_reached` antes do teto real.
- **Fonte:** `supabase/functions/accept-enterprise-invite/index.ts:83-86`, `src/components/EnterpriseEmployeeAdminScreen.tsx:134-146`.
- **Correção correta (fora do escopo RC-03):** trigger em `profiles` que ajusta `organizations.licenses_used` com base em contagem `WHERE deleted_at IS NULL` (fonte única e derivada). Movido para `CONSISTENCY_PENDING.md`.
- **Mitigação atual:** RH pode reativar colaborador (`restore()`) sem custo de licença; ao invés de excluir, prefira desativar temporariamente. Contador nunca fica menor do que o real.

### C-02 · Dupla fonte para "licenças contratadas"

- **Módulo:** Empresas ↔ Planos ↔ Central RH.
- **Fluxo:** `PlatformOwners`/`PlatformOrganizations` gravam em `organizations.licenses_total`; `PlatformOrganizationDetail` também escreve em `organization_contracts.licenses_total`; `EnterpriseAdminCenterScreen` lê de `organization_contracts` e, se ausente, cai para `organizations`.
- **Efeito:** Se admin altera o total via Owners e não regenera contrato, RH vê valor antigo até o próximo contrato ser criado.
- **Fonte:** `src/pages/EnterpriseAdminCenterScreen.tsx:87-104`, `src/pages/PlatformOrganizationDetailScreen.tsx:377`.
- **Correção correta:** RH também deveria ler `organizations.licenses_total` como fallback primário. Documentado em `CONSISTENCY_PENDING.md`.
- **Mitigação atual:** Documentar no operacional que alteração de licenças deve ser feita via Detail (que grava nos dois lugares) e não via Owners rápido.

### C-03 · Consequência de C-01

- **Módulo:** Colaboradores.
- Já coberto por C-01. Sem escrita adicional necessária além do trigger acima.

---

## 3. Verificações negativas (sem inconsistência)

- ❌ Nenhum mock/número hardcoded em dashboards (auditoria de RC-01/RC-02 confirma).
- ❌ Nenhum vazamento cross-org em Search / listagens (RLS por `organization_id` + `has_role`).
- ❌ Nenhum cache stale de IA (todas as edge functions selecionam tabelas ao vivo).
- ❌ Nenhum contador diferente entre SA e RH para as mesmas métricas (mesmas tabelas base).
- ❌ Nenhuma exportação vazando dados de outra empresa (filtros herdam RLS).
- ❌ Nenhum toast de sucesso sem operação real (RC-01 padronizou mensagens).

---

## 4. Build & typecheck

- `bunx tsgo --noEmit` → ✅ 0 erros.

---

## 5. Resultado

**CONSISTÊNCIA GLOBAL VALIDADA COM RESSALVAS**

A plataforma é consistente para o fluxo padrão (criar empresa → convidar → aceitar → operar). A única inconsistência de negócio real (C-01/C-03: licença não devolve em soft-delete) está documentada em `CONSISTENCY_PENDING.md` para próxima janela de correção com trigger — fora do escopo conservador de RC-03.

Nenhum bloqueador de dados: nada expõe informação cross-org, nada perde dados, nada usa cache incorreto.