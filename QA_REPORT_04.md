# QA_REPORT_04 — Estrutura Organizacional

**Escopo:** Departamentos · Unidades · Gestores · Organograma Vivo™ · Snapshot · Indicadores · k-anonimato · Permissões
**Ambiente:** preview `id-preview--64f0bb59...` · roles testadas: `owner`, `rh_admin`
**Método:** revisão dos componentes `EnterpriseDepartmentsScreen`, `EnterpriseDepartmentDetailScreen`, `EnterpriseUnitsScreen`, `EnterpriseOrgChartScreen`, `EnterpriseEmployeeAdminScreen`, tabelas `departments`, `units`, `profiles`, `org_chart_snapshots`, RPCs `org_tree` / `org_node_indicators`, edge function `snapshot-org-chart`.

---

## 1. Departamentos — CRUD

| Teste | Resultado |
|---|---|
| Criar | ✅ insert em `departments(name, parent_id, organization_id)` funcional |
| Listar | ✅ join com `profiles.department_id` → contagem correta |
| Editar | 🔴 **BUG-01** — item "Editar" no dropdown não tem handler (`<DropdownMenuItem>` sem `onClick`) |
| Remover | ✅ delete por id |
| Campos do form | 🔴 **BUG-02** — inputs `code`, `responsible` e `count` são apenas visuais: não são persistidos (colunas equivalentes não são gravadas; `leader_id` existe na tabela mas o form nunca envia). Card mostra sempre `responsible = "—"` e `code` = 3 primeiras letras. |
| Detalhe (`/enterprise/rh/departamentos/:id`) | 🔴 **BUG-03** — `EnterpriseDepartmentDetailScreen` totalmente mockado: `deptName = "Operações"`, KPIs literais `2,9 / 67% / 46% / 83%`, botão "Gerar plano" só dispara `toast`. Nenhuma leitura por `id`. |
| Pesquisa / filtros / paginação | ⚠️ inexistentes (lista completa renderizada; aceitável enquanto n < 100) — **P2** |

**Correções aplicadas nesta fase:** nenhuma (bloco QA, sem desenvolvimento). Registrado como pendências.

---

## 2. Unidades — CRUD

| Teste | Resultado |
|---|---|
| Criar | ✅ insert em `units(name, address, organization_id)` |
| Listar | ✅ com contagem por `profiles.unit_id` |
| Editar / Excluir / Desativar / Reativar | 🔴 **BUG-04** — nenhuma ação disponível na UI. Cards têm botões "Acessar" e "Insights" **sem `onClick`**. |
| Pesquisa | 🔴 **BUG-05** — input de busca sem `value`/`onChange`, não filtra a lista. |
| KPIs da seção "Unidades ativas / Regiões / Colaboradores distribuídos / Implantação" | 🔴 **BUG-06** — valores **hardcoded** (`12`, `5`, `842`, `91%`) — não refletem os dados reais. |
| "Regional Insights" (Operações, Atendimento, Liderança regional, Unidade internacional) | 🔴 **BUG-07** — bloco totalmente hardcoded (mock visual). |
| Ordenação / paginação | ⚠️ inexistentes — **P3** |

---

## 3. Gestores — CRUD

Não existe tela dedicada de "Gestores". A gestão de gestor é feita em `EnterpriseEmployeeAdminScreen` via campo `manager_id` (dropdown de colaboradores da mesma organização).

| Teste | Resultado |
|---|---|
| Definir gestor | ✅ update em `profiles.manager_id` |
| Trocar gestor | ✅ mesmo fluxo |
| Remover gestor (colaborador vira raiz) | ✅ `manager_id = null` |
| Impedir ciclo (A → B → A) | 🟡 **BUG-08** — não há validação de ciclo antes do update. `org_tree` (recursive CTE) tem `WHERE NOT cycle` — protege leitura, mas o insert cru é aceito. Risco baixo (RH raramente cria ciclo), mas deve validar no client. **P2** |
| Papel formal "gestor" em `user_roles` | ⚠️ não implementado — o enum `app_role` cobre owner/rh_admin/employee/platform_admin; "gestor" hoje é implícito (quem tem liderados). Alinhado com o modelo atual — **não é bug**, é decisão de escopo. |

---

## 4. Organograma Vivo™

| Teste | Resultado |
|---|---|
| Renderização hierárquica (`org_tree` RPC) | ✅ CTE recursiva, tolera ciclos, retorna `level`, `direct_reports_count`, `total_reports_count` |
| Atualização automática ao mudar colaborador | 🟡 **BUG-09** — não há subscription Realtime. Depois de mudar gestor/departamento/unidade em outra aba, é necessário clicar em "Recarregar". **P1** |
| Mover colaborador (departamento/unidade) | ✅ via `EnterpriseEmployeeAdminScreen` (`profiles.department_id`, `unit_id`) |
| Promoção (troca de `job_title` / nível) | ✅ campo `job_title` editável. Sem histórico versionado. **P3** |
| Troca de gestor | ✅ (ver §3) |
| Demissão (desativar) | ✅ `profiles.status = 'inactive'`. Nó continua na árvore com badge "inactive" (correto para não órfanizar liderados durante transição). |
| Snapshot | ✅ edge function `snapshot-org-chart` — valida JWT + role (`owner`/`rh_admin`), grava em `org_chart_snapshots(tree jsonb)`. Sem UI para visualizar snapshots salvos. **P2** |
| Indicadores agregados por nó (`org_node_indicators`) | ✅ retorna humor/energia/estresse/equilíbrio + pulses agregados dos últimos 30 dias, propagando por `total_reports_count`. |
| Auditoria de mudanças estruturais | ⚠️ `platform_audit_logs` só registra ações da plataforma; mudanças em `profiles.manager_id/department_id/unit_id` não são auditadas. **P2** |

---

## 5. k-anonimato / Privacidade

| Teste | Resultado |
|---|---|
| Bloqueio de indicadores por amostra mínima | ✅ `org_node_indicators` marca `insufficient_sample` quando `participants_count < 5`; UI mostra aviso âmbar. |
| Threshold configurável por organização | 🔴 **BUG-10 (CRÍTICO de coerência)** — o mínimo é **hardcoded em 3 lugares diferentes**: `org_node_indicators` = 5, texto do Organograma = 5, `EnterpriseDepartmentsScreen.minVolume` = 8. A tela de Departamentos exibe "Protegido por volume mínimo" (8) para grupos que os relatórios agregados já expõem (limiar 5). **Divergência de política de privacidade.** Deve haver um único valor em `organization_settings.privacy_min_group_size` lido por todas as telas e RPCs. |
| RH nunca vê respostas individuais | ✅ RLS em `pulse_responses`/`emotional_checkins` impede leitura individual por owner/rh_admin (política existente) |

---

## 6. Permissões

| Papel | Departamentos | Unidades | Organograma | Snapshot | Indicadores |
|---|---|---|---|---|---|
| owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| rh_admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| employee | 🔒 bloqueado por `ProtectedRoute` | 🔒 | 🔒 | 🔒 | 🔒 |
| platform_admin | 🔒 (rota `/enterprise/*` fora do escopo dele) | 🔒 | 🔒 | 🔒 | 🔒 |

RLS conferido: `departments`, `units` restringem por `organization_id`; snapshot valida role no edge; `org_tree`/`org_node_indicators` são `SECURITY DEFINER` com verificação de organização.

---

## 7. Resumo executivo

### Bugs (10)
- 🔴 **BUG-01** Editar departamento sem handler
- 🔴 **BUG-02** Campos `code`/`responsible`/`count` do form de departamentos não persistem
- 🔴 **BUG-03** `EnterpriseDepartmentDetailScreen` 100% mockado
- 🔴 **BUG-04** Unidades sem editar/excluir/desativar (botões sem handler)
- 🔴 **BUG-05** Busca de unidades não funcional
- 🔴 **BUG-06** KPIs de unidades hardcoded
- 🔴 **BUG-07** Regional Insights hardcoded
- 🟡 **BUG-08** Sem validação de ciclo em `manager_id`
- 🟡 **BUG-09** Organograma sem Realtime (requer refresh manual)
- 🔴 **BUG-10** Threshold de k-anonimato divergente (5 vs 8) — risco de contradição de política de privacidade

### Pendências priorizadas (para próxima fase de desenvolvimento)
1. **P0** — Corrigir BUG-10 (unificar `privacy_min_group_size` em `organization_settings`)
2. **P0** — Cablear `EnterpriseDepartmentDetailScreen` a dados reais (BUG-03)
3. **P0** — Persistir `leader_id` no form de Departamentos e habilitar "Editar" (BUG-01, BUG-02)
4. **P0** — Implementar editar/excluir/desativar unidades + busca funcional (BUG-04, BUG-05)
5. **P1** — Substituir KPIs e insights hardcoded das Unidades por leituras reais (BUG-06, BUG-07)
6. **P1** — Adicionar subscription Realtime no Organograma (BUG-09)
7. **P2** — Validação client-side de ciclo em `manager_id` (BUG-08)
8. **P2** — UI para listar snapshots salvos + comparar
9. **P2** — Auditar mudanças estruturais (`profiles.manager_id/department_id/unit_id`) em `platform_audit_logs`
10. **P3** — Pesquisa/filtros/ordenação/paginação em Departamentos e Unidades
11. **P3** — Histórico de cargos (`job_title`) para trilha de promoção

### Status geral

**REPROVADO para go-live com clientes** — BUG-10 é bloqueante (coerência de política de privacidade) e BUG-03/BUG-04/BUG-06/BUG-07 expõem mocks visíveis ao cliente. Os fluxos essenciais (criar departamento/unidade, mover colaborador, gerar organograma, snapshot, indicadores com k-anon) funcionam no backend e nas telas primárias — porém as telas de detalhe e KPIs precisam ser cabeadas antes de liberar.

**Aprovado para prosseguir para FASE QA 05** — os defeitos acima estão contidos nesta camada e não bloqueiam o teste dos próximos módulos.
