# QA_REPORT_07 — Canal Direto, LGPD, Auditoria e Privacidade

**Escopo:** Canal Direto · Denúncia · Anonimato · LGPD · Auditoria · Logs · Exportação · Consentimentos · Privacidade · k-anonimato · Permissões · RLS
**Regra-mãe do teste:** *Nenhum dado individual deve aparecer para o RH.*

---

## 1. Canal Direto (denúncia / comunicação segura)

Componentes: `CanalDiretoMensagemScreen`, `CanalDiretoRHScreen`, `CanalDiretoConfirmacaoScreen`.

| Item | Resultado |
|---|---|
| Colaborador envia denúncia | 🔴 **BUG-01 (P0 LEGAL)** — `CanalDiretoMensagemScreen` **não tem uma única call a Supabase** (0 refs). A mensagem "é registrada" apenas na UI (navega para tela de confirmação). Nada persiste. |
| Modo anônimo | 🔴 **BUG-02 (P0)** — toggle "enviar anonimamente" é decorativo; sem persistência não há como diferenciar identificado vs anônimo. |
| RH recebe denúncia | 🔴 **BUG-03 (P0)** — `CanalDiretoRHScreen` também sem nenhuma leitura de dados; lista mockada. RH não vê nada real. |
| Trilha de estado (aberta/em análise/resolvida) | 🔴 sem tabela dedicada |
| Tabela de destino | ⚠️ **não existe tabela `reports`/`denuncias`/`whistleblower_reports`**. `support_tickets` existe mas Canal Direto **não a usa** (e mesmo se usasse, o texto do ticket ficaria legível pelo RH — o requisito de anonimato exige separação `reports` vs `report_identities` com RLS distinta). |
| Confirmação com protocolo | 🟡 tela mostra protocolo aleatório gerado no client — sem valor legal. |

**Diagnóstico:** o Canal Direto de denúncia está inteiramente mockado. Isso é exposição regulatória — em jurisdição brasileira, uma organização de médio/grande porte que anuncia canal de denúncia **precisa** cumprir Lei 14.457/2022 e LGPD; oferecer uma UI que finge coletar denúncia sem persistir é pior do que não oferecer.

---

## 2. LGPD — Direitos do titular

| Direito (LGPD art. 18) | Implementado? |
|---|---|
| Acesso aos dados pessoais | 🔴 **BUG-04 (P0)** — sem tela; sem RPC `export_my_data(user_id)` |
| Portabilidade | 🔴 **BUG-05 (P0)** — sem export estruturado |
| Correção | 🟡 parcial (via `EnterpriseEmployeeAdminScreen`, mas o titular não edita a si mesmo por essa rota) |
| Anonimização | ⚠️ existe conceitualmente (RH vê só agregados), mas não é aplicada aos dados brutos do titular |
| Eliminação | 🔴 **BUG-06 (P0)** — sem botão "excluir minha conta" e sem cascade documentado |
| Revogação de consentimento | 🔴 **BUG-07 (P0)** — `privacy_consents` tem coluna `revoked_at` mas nenhuma UI grava; o consentimento é registrado uma vez e nunca pode ser revogado pelo titular |
| Informação sobre uso compartilhado | ⚠️ apresentado como texto estático em `EnterprisePrivacyConsentScreen` |

---

## 3. Auditoria & Logs

| Item | Resultado |
|---|---|
| `PlatformAuditScreen` (platform_admin) | ✅ lê `platform_audit_logs`, `organizations`, `profiles`; filtros por ação e ator |
| `EnterpriseAuditLogsScreen` (RH da organização) | 🔴 **BUG-08 (P0)** — 0 refs a Supabase. UI totalmente mock. RH não tem visibilidade das ações administrativas na sua própria org. |
| Escrita de auditoria automática | 🟡 **BUG-09 (P1)** — apenas eventos de plataforma disparam insert em `platform_audit_logs`. Ações críticas de RH (alterar `manager_id`, `department_id`, `unit_id`, status do colaborador, geração de DNA/Score, criação/resolução de alertas, exclusão de dados) **não são auditadas**. |
| RLS | ✅ `platform_audit_logs`: SELECT restrito a `is_platform_admin()`; INSERT autenticado; service_role escreve. Não vaza para RH da org. |
| Retenção | ⚠️ sem política de retenção definida (LGPD art. 15 exige eliminação após finalidade) |

---

## 4. Exportação

`EnterpriseExportsScreen` (RH):

| Item | Resultado |
|---|---|
| Exportar relatórios agregados | 🔴 **BUG-10 (P0)** — 0 refs a Supabase. Botões "Exportar" não geram nada. |
| Registrar quem exportou o quê (trilha) | 🔴 sem trilha (dependente de BUG-08/09) |
| Filtro de anonimização antes do export | 🔴 sem lógica |
| CSV/PDF | 🔴 sem geração |

---

## 5. Consentimentos

| Item | Resultado |
|---|---|
| Colaborador dá consentimento inicial | ✅ `EnterprisePrivacyConsentScreen` grava em `privacy_consents(consent_type='enterprise_privacy', version='v1.0')` |
| Versionamento de política | 🟡 **BUG-11 (P1)** — versão é literal `"v1.0"` no código; ao mudar a política, colaboradores existentes não são reprocessados nem reintimados |
| Granularidade por tipo | 🟡 UI mostra 4 toggles (individualPrivate, collectiveTrends, anonymousProcessing, privacyPolicy) mas grava **um único registro** — perde a granularidade |
| Revogar consentimento | 🔴 **BUG-07** (repetido) |
| RH ver quem consentiu | ⚠️ policy `consents_select_org_admin` permite mas **não há UI** que use |
| RLS | ✅ self-select + admin-select-org; insert self-only |

---

## 6. Privacy Center (RH e Enterprise)

`EnterprisePrivacyCenterScreen` e `PrivacyEnterpriseScreen`:

| Item | Resultado |
|---|---|
| Cabeamento | 🔴 **BUG-12 (P0)** — 0 refs a Supabase em ambas. Configurações de privacidade exibidas (min. grupo, retenção, subprocessadores) são texto estático. |
| `organization_settings` | ⚠️ tabela existe (6 cols, 2 policies) mas nenhuma tela do Privacy Center lê/escreve |
| Subprocessadores / DPA | 🔴 texto fixo — não vinculado a `organization_contracts` |

---

## 7. k-anonimato

| Item | Resultado |
|---|---|
| Enforcement na leitura agregada | ✅ `org_node_indicators` marca `insufficient_sample` quando participantes < 5 |
| Threshold único | 🔴 **BUG-13 (P0)** — mesmo bug reportado no QA-04 (`minVolume=8` no Departamentos vs `5` no Organograma). Divergência ativa. |
| RH lê resposta individual | ✅ **RLS bloqueia**: `pulse_responses` e `emotional_checkins` só permitem `user_id = auth.uid()`; nem owner nem rh_admin conseguem ler individualmente. **Requisito-mãe do teste atendido tecnicamente.** |
| RH lê respostas via join / view | ✅ sem view exposta; RPCs `org_node_indicators` e `get_pulse_aggregate` retornam apenas agregados |
| Denúncia individual identificada | ⚠️ N/A — o Canal Direto sequer persiste (BUG-01/02/03), então o vetor não existe hoje. Quando for implementado, `reports` DEVE ter RLS que impeça leitura pelo RH quando modo anônimo estiver marcado. |

---

## 8. Relatórios RH

`EnterpriseRHReportsScreen`, `EnterpriseRHReportDetailScreen`, `EnterpriseReportScreen`:

| Item | Resultado |
|---|---|
| Cabeamento | 🔴 **BUG-14 (P0)** — 0 refs a Supabase. Lista e detalhes totalmente mockados. |
| Fonte de dados | ⚠️ Deveria unir `organizational_dna_reports`, `weekly_ai_insights`, `organizational_scores`, `impact_measurements` — nada disso é lido. |
| Compartilhamento | 🔴 sem export/link seguro |

---

## 9. Permissões (varredura cruzada)

| Papel | Canal Direto envio | Canal Direto RH | Audit RH | Audit Plataforma | Exports | Privacy Center | Consentimentos |
|---|---|---|---|---|---|---|---|
| employee | 🟡 UI aberta (mas mock) | 🔒 | 🔒 | 🔒 | 🔒 | 🟡 UI aberta (mock) | ✅ próprio |
| owner | — | 🟡 UI aberta (mock) | 🟡 UI aberta (mock) | 🔒 | 🟡 UI aberta (mock) | 🟡 UI aberta (mock) | ✅ próprio + org |
| rh_admin | — | 🟡 idem | 🟡 idem | 🔒 | 🟡 idem | 🟡 idem | ✅ próprio + org |
| platform_admin | — | 🔒 | 🔒 | ✅ | 🔒 | 🔒 | ✅ (via service) |

RLS de fundo está **correta** onde as tabelas existem — a vulnerabilidade não é de policy, é de **funcionalidade ausente + UI enganosa**.

---

## 10. Teste-mãe: "nenhum dado individual deve aparecer"

**Resultado técnico: ✅ APROVADO** — as RLS de `pulse_responses`, `emotional_checkins`, `privacy_consents` e a definição das RPCs agregadas (`org_node_indicators`, `get_pulse_aggregate`, `get_emotional_map`, `get_capacity_pulse`) garantem que **RH não consegue ler respostas individuais** por nenhum caminho da UI atual.

**Ressalva:** o Canal Direto, quando for implementado de verdade, precisa de uma camada de separação (ex.: `reports` sem `user_id` quando `anonymous=true`, ou `report_identities` em schema separado com policy `USING (false)`). Como hoje ele não persiste nada, não vaza — mas também não cumpre o propósito.

---

## 11. Resumo executivo

### Bugs (14)
| # | Sev | Módulo | Descrição |
|---|---|---|---|
| BUG-01 | 🔴 P0 legal | Canal Direto | Envio de denúncia não persiste |
| BUG-02 | 🔴 P0 legal | Canal Direto | Toggle "anônimo" decorativo |
| BUG-03 | 🔴 P0 legal | Canal Direto RH | Inbox 100% mock |
| BUG-04 | 🔴 P0 LGPD | LGPD | Sem export do próprio dado (art. 18 II/V) |
| BUG-05 | 🔴 P0 LGPD | LGPD | Sem portabilidade |
| BUG-06 | 🔴 P0 LGPD | LGPD | Sem eliminação da conta pelo titular |
| BUG-07 | 🔴 P0 LGPD | Consentimento | Sem revogação (coluna `revoked_at` existe mas UI não grava) |
| BUG-08 | 🔴 P0 | Auditoria RH | Tela 100% mock |
| BUG-09 | 🟠 P1 | Auditoria | Ações críticas de RH não são auditadas |
| BUG-10 | 🔴 P0 | Exportação | Botões "exportar" não geram nada |
| BUG-11 | 🟠 P1 | Consentimento | Versão hardcoded "v1.0", sem re-consentimento |
| BUG-12 | 🔴 P0 | Privacy Center | Duas telas 100% mock |
| BUG-13 | 🔴 P0 | k-anonimato | Threshold divergente (5 vs 8) — repete QA-04 |
| BUG-14 | 🔴 P0 | Relatórios RH | 3 telas 100% mock |

### Vitórias
- ✅ **RLS de dados sensíveis está correta.** Nenhum dado individual é acessível ao RH pelas RPCs/tabelas expostas hoje.
- ✅ `PlatformAuditScreen` funcional e restrita a `platform_admin`.
- ✅ `EnterprisePrivacyConsentScreen` grava consentimento inicial com trilha (user_id, user_agent, versão).

### Bloqueadores para go-live (P0 obrigatórios antes de aceitar cliente pagante)
1. **BUG-01/02/03** — Cablear Canal Direto (criar tabela `reports` + `report_messages` com RLS que respeita flag `anonymous`, tela de RH lendo, tela de colaborador gravando).
2. **BUG-04/05/06/07** — Implementar os 4 direitos LGPD ausentes: **export**, **portabilidade**, **eliminação** e **revogação de consentimento**. Sem isso a solução está fora de conformidade legal.
3. **BUG-08/10/12/14** — Cablear ou remover as 4 famílias de telas 100% mockadas (Audit RH, Exports, Privacy Center, Reports RH). Manter no ar prometendo o que não entrega é risco reputacional + regulatório.
4. **BUG-13** — Unificar threshold de k-anonimato em `organization_settings.privacy_min_group_size` (repete QA-04).

### Recomendação de sequência
1. Migração: criar `reports`, `report_messages`, `data_export_requests`, `data_deletion_requests`, `consent_events` (versionado); RLS restrita.
2. Edge functions: `export-my-data`, `delete-my-account`, `revoke-consent`, `create-report`.
3. Substituir mocks das 6 telas listadas.
4. Adicionar audit hooks (trigger em `profiles`, `departments`, `units`, `organizational_dna_reports`, etc. → `platform_audit_logs` com `scope='organization'` ou tabela `organization_audit_logs`).

### Status geral

**REPROVADO para produção com cliente real.** A camada técnica de proteção (RLS) está sólida — o problema não é vazamento, é **ausência funcional** de módulos anunciados e **exposição regulatória** (Canal Direto + direitos LGPD). Um teste do PROCON, DPO externo ou ANPD identificaria imediatamente os BUGs 01–07 e 12 como não-conformidades.

**Aprovado para prosseguir para FASE QA 08** — os defeitos são de escopo funcional/regulatório desta fase e não bloqueiam o teste dos próximos módulos.
