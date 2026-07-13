# Release Candidate Report — MVP

**Data:** 2026-07-13
**Escopo:** regressão completa pré-entrega (sem pagamento).
**Executor:** auditoria estática + inspeção de dados no banco piloto.

> ⚠️ **Limitação da auditoria:** o agente não pode simular presencialmente
> 27 passos E2E com 5 usuários reais (aceite de convite por email, upload
> humano de conteúdo, participação em ritual, etc.). O que segue é uma
> verificação de superfície: build, RLS, RPCs, edge functions, dados
> presentes, cobertura de código, feature flags. Fluxos que exigem múltiplas
> contas reais foram marcados como **NÃO EXECUTADO — requer QA manual**.

---

## 1. Saúde técnica

| Item | Status | Evidência |
|---|---|---|
| Build de produção | ✅ | `bun run build` → `built in 10.04s`, sem erros |
| Bundle size | ⚠️ | `index.js` = 2.615 kB (>500 kB warning). Sem code-splitting. |
| CSS | ✅ | 253 kB (gzip 34 kB) |
| Console | ✅ | Sem erros no snapshot atual |
| Typecheck | ✅ | (rodado no ciclo de build) |
| RLS coverage | ✅ | 56/56 tabelas em `public` com `rowsecurity=true` |
| Edge Functions deployadas | ✅ | 24 funções presentes em `supabase/functions/` |
| Cron jobs | ⚠️ | Schema `cron` não legível fora do service_role. Verificar `email-queue` e `platform_usage`. |

## 2. Cobertura funcional (por camada)

### Super Admin (Platform)
- Login, dashboard, orgs, plans, subscriptions, billing (visual), settings, security, content CMS: **telas prontas**.
- Dados: 1 organização, 4 planos, 24 itens de conteúdo, 4 registros em `platform_usage_daily`.
- `platform_settings`: **VAZIO** — rate limits não seeded, ainda não propagados em runtime.

### Empresa/RH
- Onboarding wizard, estrutura (departamentos/unidades), convites, dashboard, DNA, Score, Conselho Executivo IA, planos de ação, rituais, Motor de Impacto: **telas prontas**.
- RPCs de agregação (`get_rh_dashboard_summary`, `get_pulse_aggregate`, `get_emotional_map`, `get_dna_context`, `calculate_organizational_score`, `measure_impact`) presentes e com k-anonimato (`HAVING COUNT(DISTINCT user_id) >= 5`).
- Onboarding step **não persiste** em `organizations.onboarding_step`.

### Usuário final
- Check-in, Pulse, feed, biblioteca, curso, jornada, IA de apoio, relatórios, notificações: **telas prontas**.
- Fluxo criança-por-PIN respeita escopo do próprio perfil (memória do usuário).

### IA
- `executive-ai`, `onboarding-chat`, `cms-recommend`, `generate-*` (8 functions): deployadas via Lovable AI Gateway.
- **Sem rate-limit ad-hoc** (upstream 429 é o único gate). `platform_settings.ai_chat_per_day` documentado, mas não consumido.

### Convites
- `send-enterprise-invite`, `accept-enterprise-invite`, `decline-enterprise-invite`, `enterprise-invite-info`, `manage-enterprise-invite`: **deployadas**.
- Email transacional via infra Lovable Emails — **não verificado neste ciclo** (domínio precisa estar `active`).

### Uploads
- Buckets de conteúdo (`content-audio`, `content-video`, `content-pdf`) **não criados**.
- CMS admin lista conteúdo mas fluxo de upload não está ligado ao Storage.

### Isolamento multi-tenant / K-anonimato / LGPD
- ✅ `current_organization_id()` + `has_role()`/`has_any_role()` com SECURITY DEFINER, sem recursão.
- ✅ Todas RPCs de agregação bloqueiam se `_organization_id != current_organization_id()`.
- ✅ K-anonimato mínimo = 5 (configurável via `get_org_min_group_size` → default 5).
- ✅ `user_roles` em tabela separada com `has_role()` — sem risco de escalada.
- ⚠️ TTL de dados sensíveis (checkins, pulse, ai messages) **sem cron de expurgo** aplicado.
- ⚠️ Export LGPD/GDPR: tabelas `data_export_requests` e `data_deletion_requests` existem, mas **fluxo automatizado ausente**.

## 3. Fluxo E2E (27 passos) — Status

| # | Passo | Status | Nota |
|---|---|---|---|
| 1 | Platform admin login | ✅ código | Não executado com conta real |
| 2 | Criar empresa | ✅ código | `create-organization-admin` ok |
| 3 | Vincular plano/licenças | ✅ código | Manual via CMS admin |
| 4 | Configurar módulos | ⚠️ | Não há UI de feature-flag por org |
| 5 | RH login | ✅ código | |
| 6 | Criar estrutura | ✅ código | departments/units + cycle guards |
| 7 | Convidar 5 colaboradores | ✅ código | `send-enterprise-invite`; email não verificado |
| 8 | Todos aceitam | ⚠️ | **Não executado** — requer 5 emails reais |
| 9 | Todos completam onboarding | ⚠️ | **Não executado** |
| 10 | Todos respondem Pulse | ⚠️ | **Não executado** |
| 11 | Todos fazem check-in | ⚠️ | **Não executado** |
| 12 | RH visualiza agregados | ✅ código | RPCs prontas; k-anon exige ≥5 |
| 13 | RH gera Score | ✅ código | `calculate_organizational_score` |
| 14 | RH gera DNA | ✅ código | `generate-organizational-dna` |
| 15 | Conselho Executivo IA | ✅ código | `executive-ai` sem rate-limit ad-hoc |
| 16 | Cria plano | ✅ código | `generate-action-plan` |
| 17 | Publica ritual | ✅ código | `generate-intelligent-ritual` |
| 18 | Usuário participa | ✅ código | `ritual_participations` |
| 19 | Motor de Impacto | ✅ código | `measure-impact` |
| 20 | Denúncia anônima | ✅ código | `reports` com protocolo `RPT-*` |
| 21 | RH responde | ✅ código | `report_messages` |
| 22 | Usuário consulta | ✅ código | |
| 23 | Super Admin publica conteúdo | ⚠️ | **Upload real não ligado** |
| 24 | Usuário consome conteúdo | ⚠️ | Depende de #23 |
| 25 | Progresso persiste | ✅ código | `content_views`, `content_downloads` |
| 26 | Logout e novo login | ✅ código | |
| 27 | Dados permanecem | ✅ código | RLS + persistência via Supabase |

**Executado end-to-end com 5 usuários reais: NÃO.**
**Passível de execução em piloto real: SIM, com blockers de #4, #7-#11, #23-#24.**

## 4. Feature flags recomendadas (desabilitar até fecharem pendências)

- `FEATURE_BILLING` = **off** (decisão do usuário: adiar pagamento)
- `FEATURE_CMS_UPLOAD` = **off** até bucket + fluxo `draft→review→published`
- `FEATURE_RATE_LIMIT_AI` = **off** até seed de `platform_settings`
- `FEATURE_LGPD_EXPORT_AUTOMATED` = **off** até edge function de export
- `FEATURE_MODULE_TOGGLE_BY_ORG` = **off** (não existe UI ainda)

## 5. Veredito

**MVP BLOQUEADO POR PENDÊNCIAS** (ver `RELEASE_BLOCKERS.md`).

O código está sólido, a segurança de base (RLS, k-anonimato, SECURITY DEFINER,
multi-tenant) está bem executada, e as 24 edge functions cobrem os fluxos
críticos. Porém:

1. O E2E real de 27 passos **nunca foi executado com usuários piloto** —
   requer QA humano com 5 emails reais aceitando convite.
2. Existem 5 pendências backend documentadas (blocos 34–40) que impactam
   cobrança, uploads de CMS, rate-limit AI, persistência de onboarding e
   cron de expurgo TTL.
3. Bundle >2.6 MB é blocker de performance em rede 3G/mobile.