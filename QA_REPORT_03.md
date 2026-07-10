# QA_REPORT_03 — Módulo Equipe

Data: 2026-07-10  
Escopo: `/enterprise/rh/equipe`, `/enterprise/rh/equipe/convidar`, `/enterprise/rh/equipe/importar`, `/enterprise/rh/equipe/licencas`, `/enterprise/rh/equipe/:id`.  
Edge functions: `send-enterprise-invite`, `accept-enterprise-invite`.  
Tabelas: `profiles`, `enterprise_invites`, `departments`, `units`, `employee_profiles`.

Este relatório é **apenas de validação**. Nenhuma correção foi aplicada nesta fase.

---

## 1. CONVITE

| Item | Componente | Status | Observações |
|---|---|---|---|
| Convidar 1 colaborador | `EnterpriseInviteEmployeesScreen` → `send-enterprise-invite` | ✅ **Funcional** | Insere em `enterprise_invites`, tenta envio via Resend (fallback: `invite_link` retornado). |
| Convite em lote | Mesma tela permite adicionar mais, um por vez | ⚠️ Parcial | Não há UI de "adicionar vários e enviar de uma vez"; cada convite é 1 request. |
| Importar CSV | `EnterpriseImportEmployeesScreen` | 🔴 **BUG-01 — MOCK COMPLETO** | `handleFileUpload` só faz `setIsUploaded(true)`. Não lê arquivo, não faz parse, não chama Supabase. `handleFinalImport` só mostra toast e navega. **Zero persistência.** |
| Cancelar convite | — | 🔴 **BUG-02 — AUSENTE** | Não existe UI nem edge function. Convites pendentes ficam órfãos até expirar/aceitar. |
| Reenviar convite | Botão em `EnterpriseLicensesScreen:52` e em `EnterpriseEmployeeAdminScreen:105` (adminActions) | 🔴 **BUG-03 — MOCK** | Handlers só chamam `toast(...)`. Nenhuma chamada a edge/DB. |
| Aceitar convite | `EnterpriseAcceptInvitePage` → `accept-enterprise-invite` | ✅ Funcional | Token validado, cria/vincula user + `employee_profiles`, marca `accepted_at`. |
| Recusar convite | — | 🔴 **BUG-04 — AUSENTE** | Não existe rota, botão, coluna `declined_at`, nem handler. |
| Precheck de licença | `send-enterprise-invite` | 🔴 **BUG-05** | Backend **não valida** `licenses_used < licenses_total` antes de emitir convite. Confirma pendência P1 do QA02 e agrava (não bloqueia nem no frontend nem no backend). |

---

## 2. EDIÇÃO DE COLABORADOR

Tela: `EnterpriseEmployeeAdminScreen` (`/enterprise/rh/equipe/:id`).

| Campo/ação | Persiste em `profiles`? | Status |
|---|---|---|
| Nome completo | ✅ `full_name` | ✅ |
| Cargo | ✅ `job_title` | ✅ |
| Departamento | ✅ `department_id` | ✅ |
| Unidade | ✅ `unit_id` | ✅ |
| Gestor | ✅ `manager_id` | ✅ |
| Status (`active`/`inactive`/`suspended`) | ✅ `status` | ✅ Desativar/Reativar funcionam por este seletor. |
| Data de contratação | ✅ `hired_at` | ✅ |
| E-mail exibido | 🔴 hardcoded `"—"` (`:95`) | **BUG-06** — não busca `auth.users.email` nem coluna `email` em profile. |
| Botão "Reenviar convite" | ❌ | Ver BUG-03. |
| Botão "Resetar acesso" | ❌ | Sem handler. |
| Botão "Liberar licença" | ❌ | Sem handler. |
| Botão "Desativar conta" (ação rápida) | ❌ | Sem handler (a desativação real só via combo Status). |
| Status cards (Conta/Convite/Acesso/Check-in) | 🔴 hardcoded (`:255-259`) | **BUG-07** |
| Toggles "Nível de acesso" | 🔴 valores fixos, não persistem (`:277-281`) | **BUG-08** |
| Histórico administrativo | 🔴 4 eventos fixos com data `12/03/2026` (`:300-303`) | **BUG-09** — deveria ler de `platform_audit_logs`. |
| Excluir colaborador | — | 🔴 **BUG-10 — AUSENTE**. Não há botão. Exclusão de `profiles` só via SQL. |

---

## 3. LISTAGEM / PESQUISA / FILTROS / ORDENAÇÃO / PAGINAÇÃO

Tela principal: `EnterpriseTeamManagementScreen`.

| Recurso | Status |
|---|---|
| Lista de colaboradores real | ✅ SELECT `profiles + departments + units` scoped à org (`:86-90`). |
| Convites pendentes reais | ✅ SELECT `enterprise_invites WHERE accepted_at IS NULL` (limit 8) (`:100-106`). |
| KPI "Convidados" / "Ativos" / "Pendentes" | ✅ count real (`:76-80`). |
| KPI "Removidos" | 🔴 hardcoded `"0"` (`:132`) — **BUG-11** |
| Fallback quando `stats` nulo | ⚠️ mostra `142 / 118 / 19` até o `useEffect` resolver (`:129-131`). Deveria ser skeleton, não valores fake. **BUG-12** |
| Bloco "Convites pendentes" alternativo (`EnterpriseInviteEmployeesScreen:491`) | 🔴 renderiza `inviteList` **hardcoded** ("Ana Costa", "Bruno Lima", "Carla Mendes") — **BUG-13** |
| Pesquisa por nome/e-mail/cargo | 🔴 **AUSENTE** — não há input de busca na tela de equipe. |
| Filtro por status/departamento/unidade | 🔴 **AUSENTE** |
| Ordenação | Apenas `order("full_name")` fixo — sem UI de sort. |
| Paginação | 🔴 **AUSENTE** — carrega todos os profiles da org de uma vez (`.select` sem limit). Escala mal (>500 colabs vira lag). **BUG-14** |

---

## 4. REFLEXOS

### 4.1 Dashboard RH (`EnterpriseRHDashboardScreen`)

| Indicador | Fonte | Reflete alterações? |
|---|---|---|
| Total ativos / pendentes | `profiles.count` + `enterprise_invites` | ✅ |
| Convites aceitos hoje | `enterprise_invites WHERE accepted_at >= now()::date` | ✅ |
| Cards de "empresa saudável" | RPCs agregadas | ✅ |

### 4.2 Organograma (`EnterpriseOrgChartScreen` + `snapshot-org-chart`)

- Snapshot é gerado a partir de `profiles.manager_id` — ✅ reflete alterações de gestor.
- Colaborador desativado (`status='inactive'`) **continua aparecendo** no organograma (não há filtro). ⚠️ **BUG-15** — depende da regra de produto.

### 4.3 Licenças (`EnterpriseLicensesScreen`)

| Item | Status |
|---|---|
| Total / Usadas / Disponíveis | ✅ lê `organization.licenses_total`/`licenses_used`. |
| Pendentes | ✅ count real de `enterprise_invites`. |
| Distribuição por departamento | 🔴 hardcoded 5 áreas com números fixos (`:59-65`) — **BUG-16** |
| Lista de convites pendentes | 🔴 3 nomes hardcoded (`:67-71`) — **BUG-17** |
| Botão "Copiar link" | 🔴 só toast, não copia (`:45-50`) — **BUG-18** |
| Botão "Reenviar" | 🔴 só toast — mesmo BUG-03. |

### 4.4 Indicadores gerais

Employee bulk delete/soft-delete não é registrado em `platform_audit_logs` porque a UI não expõe a ação — logs ficam limitados às alterações de perfil via `save()`.

---

## 5. RESUMO DE BUGS

| ID | Severidade | Descrição | Arquivo |
|---|---|---|---|
| BUG-01 | 🔴 Alta | Importar CSV é 100% mock (sem parse, sem persistência) | `EnterpriseImportEmployeesScreen.tsx` |
| BUG-02 | 🔴 Alta | "Cancelar convite" inexistente | — |
| BUG-03 | 🔴 Alta | "Reenviar convite" só mostra toast | `EnterpriseLicensesScreen.tsx:52`, `EnterpriseEmployeeAdminScreen.tsx:105` |
| BUG-04 | 🟡 Média | "Recusar convite" inexistente | — |
| BUG-05 | 🔴 Alta | Sem precheck de licença ao emitir convite | `send-enterprise-invite/index.ts` |
| BUG-06 | 🟡 Média | E-mail do colaborador exibido como `"—"` | `EnterpriseEmployeeAdminScreen.tsx:95` |
| BUG-07 | 🟡 Média | Cards Conta/Convite/Acesso/Check-in hardcoded | `EnterpriseEmployeeAdminScreen.tsx:255` |
| BUG-08 | 🟡 Média | Toggles "Nível de acesso" fixos e sem persistência | `EnterpriseEmployeeAdminScreen.tsx:277` |
| BUG-09 | 🟡 Média | Histórico administrativo hardcoded | `EnterpriseEmployeeAdminScreen.tsx:300` |
| BUG-10 | 🟡 Média | "Excluir colaborador" inexistente na UI | — |
| BUG-11 | 🟢 Baixa | KPI "Removidos" hardcoded `"0"` | `EnterpriseTeamManagementScreen.tsx:132` |
| BUG-12 | 🟡 Média | Fallback de KPIs mostra `142/118/19` fake antes de carregar | `EnterpriseTeamManagementScreen.tsx:129-131` |
| BUG-13 | 🔴 Alta | Lista "Convites recentes" renderiza `Ana/Bruno/Carla` hardcoded | `EnterpriseInviteEmployeesScreen.tsx:86,491` |
| BUG-14 | 🟡 Média | Lista de colaboradores sem busca/filtro/sort/paginação; carrega tudo | `EnterpriseTeamManagementScreen.tsx:86` |
| BUG-15 | 🟢 Baixa | Colaborador `inactive` continua no organograma | `snapshot-org-chart` |
| BUG-16 | 🟡 Média | Distribuição por departamento hardcoded | `EnterpriseLicensesScreen.tsx:59` |
| BUG-17 | 🟡 Média | Lista de pendentes hardcoded | `EnterpriseLicensesScreen.tsx:67` |
| BUG-18 | 🟢 Baixa | "Copiar link" não copia | `EnterpriseLicensesScreen.tsx:45` |

**Total: 18 bugs (6 Alta / 9 Média / 3 Baixa).**

---

## 6. RESUMO POR CHECKLIST

| Bloco | Passa | Falha |
|---|---|---|
| Convite / Aceite | 3/8 | BUG-01, 02, 03, 04, 05 |
| Edição colaborador | 7/13 | BUG-06, 07, 08, 09, 10 (+03) |
| Lista/Pesquisa/Filtro/Sort/Paginação | 3/9 | BUG-11, 12, 13, 14 |
| Reflexos (Dashboard/Organograma/Licenças/Indicadores) | 5/9 | BUG-15, 16, 17, 18 |

**Status geral: REPROVADO para go-live com clientes.**

O CRUD de perfil (edição direta em `profiles`) está sólido, mas os fluxos de **onboarding em escala** (import CSV, cancelar/reenviar/recusar convite, guard de licença) e as **listas com busca/filtro/paginação** ainda estão no estado de mock visual. Sem essas correções, a operação real de uma empresa >30 colaboradores é inviável.

### Próximos passos sugeridos (ordem)

1. **BUG-01 + BUG-05** — implementar parser de CSV real + edge `send-enterprise-invite` com precheck de licença + fluxo em lote.
2. **BUG-02 + BUG-03** — edge `manage-enterprise-invite` (cancel/resend) + botões reais.
3. **BUG-13 + BUG-16 + BUG-17** — substituir listas mock por queries reais.
4. **BUG-14** — busca/filtro/sort/paginação em `EnterpriseTeamManagementScreen`.
5. **BUG-06, 07, 09** — cablear detalhe do colaborador ao banco (email do auth, cards reais, histórico via `platform_audit_logs`).
6. **BUG-10** — botão "Excluir colaborador" (soft-delete via `deleted_at`) com audit log.
7. **BUG-04** — endpoint de recusa + coluna `declined_at`.
8. **BUG-08, 11, 12, 15, 18** — polish.
