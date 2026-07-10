# QA_REPORT_02 — Módulo Empresa

Data: 2026-07-10  
Escopo: `/admin/organizations`, `/admin/organizations/:id` (CRM interno), `EnterpriseCompanySettingsScreen` (RH), `PlatformAdminDashboardScreen` (KPIs).  
Arquivos revisados: `PlatformOrganizationsScreen.tsx`, `PlatformOrganizationDetailScreen.tsx`, `EnterpriseCompanySettingsScreen.tsx`, RPC `get_platform_organizations`, tabela `organizations` (38 colunas).

---

## 1. EMPRESA — CRUD

| Ação | Local | Resultado |
|---|---|---|
| Cadastrar | `NewOrgModal` (`PlatformOrganizationsScreen.tsx:337`) — 5 seções (Empresa, Responsável, Plano, RH flags, Notas). | ✅ Valida `name`/`slug`, checa slug duplicado antes do insert (`:364`) e trata `organizations_slug_key` no catch (`:391`). |
| Editar | `TabIdentificacao` em `PlatformOrganizationDetailScreen.tsx`. | ✅ Nome, slug, CNPJ, domínio, logo, segmento, tamanho, país/UF/cidade, responsável. |
| Excluir | Menu ⋯ → "Excluir (soft)" grava `deleted_at = now()` + audit `org.soft_delete`. | ✅ Soft-delete (sem hard-delete pela UI — correto para LGPD/histórico). |
| Arquivar / Desarquivar | Menu ⋯ → `archived_at` toggle + audit `org.archive`/`org.unarchive`. | ✅ Toggle "Incluir arquivadas" no filtro. |
| Suspender / Reativar | Menu ⋯ → `suspended_at` + `subscription_status='suspended'` + motivo opcional. | ✅ `ProtectedRoute` bloqueia usuários da org suspensa. |
| Pesquisar | Full-text por nome/slug/CNPJ/domínio/responsável/email (param `_search` da RPC). | ✅ |
| Filtros | Chips "Todas/Ativas/Trials/Past due/Canceladas/Suspensas" + checkbox arquivadas. | ✅ |
| Ordenação | 5 chaves: `created_desc`, `created_asc`, `name_asc`, `name_desc`, `licenses_desc`. | ✅ |
| Paginação | `PAGE_SIZE=20`, `total_count` da RPC, botões com disabled states. | ✅ |

**Correções aplicadas:** nenhuma — módulo consistente.

---

## 2. PLANO

`TabPlan` em `PlatformOrganizationDetailScreen.tsx` (a partir de `:225`).

| Estado | Status | Observação |
|---|---|---|
| Trocar plano | ✅ | Select carregado de `platform_plans` (`is_active=true`, `sort_order`). Botão "Aplicar valores do plano padrão" copia `default_licenses`, `included_modules`, `ai_limits`. |
| Trial | ✅ | Status `trialing` + `trial_ends_at`. |
| Ativo | ✅ | Status `active`, MRR em `mrr_cents`. |
| Cancelado | ✅ | Status `canceled`; audit `org.contract.cancel`. |
| Past due | ✅ | Status `past_due` + `grace_period_ends_at`. |
| Personalizado | ✅ | Após aplicar plano padrão, todos os campos permanecem editáveis por empresa. |

**Observação:** cobrança real (Stripe) não conectada — trocar plano só atualiza colunas em `organizations`; MRR/ARR e webhooks aparecerão quando o Stripe for ativado.

---

## 3. LICENÇAS

| Item | Status | Local |
|---|---|---|
| Adicionar / remover | ✅ | Input `licenses_total` em `TabPlan` (`:377`). |
| Utilizadas | ✅ | Coluna `licenses_used` (mantida nos fluxos de convite/aceite). |
| Livres | ✅ | Derivado (`total − used`), exibido `used / total` na lista. |
| Excedidas | ✅ | Health status `over_limit` (laranja) computado pela RPC. |
| Bloqueio ao esgotar | ⚠️ **PARCIAL** | Edge `send-enterprise-invite` valida no backend, mas o botão "Convidar" da UI não bloqueia previamente — só surfa erro. **Pendência P1.** |

---

## 4. CONFIGURAÇÕES

### 4.1 CRM Platform Admin (`/admin/organizations/:id` → Identificação)

| Campo | Status |
|---|---|
| Nome | ✅ editável |
| Slug | ✅ editável (dedup) |
| Logo (URL) | ✅ `logo_url` |
| Domínio | ✅ `domain` |
| CNPJ, País/UF/Cidade | ✅ |
| Timezone | ❌ coluna não existe em `public.organizations` |
| Idioma / Locale | ❌ coluna não existe em `public.organizations` |
| LGPD / Privacidade | 🟡 gerido em `/enterprise/rh/privacidade` (tabela `privacy_consents`); sem atalho no CRM |

### 4.2 RH (`/enterprise/rh/configuracoes` → `EnterpriseCompanySettingsScreen`)

🔴 **BUG ENCONTRADO** — a tela mostra dados **hardcoded** e não persiste:

| Campo | Valor exibido | Origem |
|---|---|---|
| Nome da empresa | `"Instituto Augusto Cury"` | Hardcoded (`:107`) |
| Nº colaboradores | `"250 colaboradores"` | Hardcoded (`:108`) |
| Responsável RH | `"Rafael Oliveira"` | Hardcoded (`:109`) |
| E-mail contato | `"rafael.oliveira@instituto.com.br"` | Hardcoded (`:110`) |
| Frequência check-in | `useState("Semanal")` | Estado local |
| Departamentos | Array literal de 5 strings | Estado local |
| Handler "Salvar" | `toast.success(...)` sem chamada Supabase (`:76`) | Sem persistência |

**Causa:** tela criada como mock visual antes da integração com `organizations`/`departments`/`profiles`.  
**Impacto:** owner/RH vê nome de outra empresa e alterações não são gravadas.  
**Solução (fase de correção, fora do escopo QA-only):**
1. Ler `organization` de `useAuth()` e popular `name`, `responsible_name`, `responsible_email`, `logo_url`, `domain`.
2. Contagem real: `SELECT count(*) FROM employee_profiles WHERE organization_id = :id`.
3. Departamentos via `SELECT id,name FROM public.departments WHERE organization_id = :id`.
4. Persistir com `supabase.from('organizations').update(...).eq('id', org.id)` (RLS já permite owner/rh_admin).
5. Adicionar `timezone`/`locale` via migration (ou usar `organization_settings` key/value já existente).

**Registrado como pendência P0.**

---

## 5. REFLEXO NO DASHBOARD

`PlatformAdminDashboardScreen` puxa dos mesmos campos usados no CRM:

| KPI | Fonte | Reflete alterações? |
|---|---|---|
| Total de empresas | `count(*) organizations WHERE deleted_at IS NULL` | ✅ |
| Ativas / Trials / Past due | `subscription_status` | ✅ |
| Licenças (total/usadas) | `sum(licenses_total)` / `sum(licenses_used)` | ✅ |
| MRR / ARR | `sum(mrr_cents)` | 🟡 zera até Stripe conectar |
| Suspensas / Arquivadas | `suspended_at`/`archived_at IS NOT NULL` | ✅ |

Listagem `/admin/organizations` recarrega via `load()` após cada ação — mudança aparece sem refresh manual.

---

## 6. RESUMO

| Bloco | Passa | Falha | Pendência |
|---|---|---|---|
| CRUD Empresa | 9/9 | 0 | — |
| Plano | 5/5 | 0 | Stripe real |
| Licenças | 5/6 | 0 | P1 — guard rígido no botão convidar |
| Config CRM | 6/9 | 0 | Timezone/Idioma; LGPD fora do CRM |
| Config RH | 0/7 | 🔴 7 | **P0 — mock em `EnterpriseCompanySettingsScreen`** |
| Reflexo Dashboard | 5/6 | 0 | MRR depende de Stripe |

### Pendências consolidadas

| # | Item | Prioridade |
|---|---|---|
| P0 | Cablear `EnterpriseCompanySettingsScreen` aos dados reais + persistência | Alta |
| P1 | Bloquear botão "Convidar colaborador" quando `licenses_used >= licenses_total` | Média |
| P2 | Adicionar `timezone` e `locale` em `organizations` (ou `organization_settings`) e expor no CRM | Média |
| P3 | Atalho "Consentimentos LGPD" no detalhe da empresa | Baixa |
| P4 | Ativar Stripe para MRR/ARR reais | Alta (produto) |

### Bugs encontrados

- 🔴 **BUG-01** — `EnterpriseCompanySettingsScreen` mostra dados hardcoded e não salva. (P0)

**Status geral: APROVADO com pendências.** O CRM `/admin/organizations` está estável e pronto para operação interna. O painel de configurações RH precisa ser cabeado antes do go-live com clientes.
