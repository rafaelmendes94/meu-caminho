# Release Blockers — MVP

**Data:** 2026-07-13
**Total blockers:** 5 críticos, 4 altos, 3 médios.

## 🔴 Críticos (impedem entrega)

### BLK-01 — E2E piloto nunca executado
**Camada:** QA
**Impacto:** não há evidência de funcionamento fim-a-fim com múltiplos usuários reais.
**Ação:** rodar em ambiente piloto com 1 platform admin + 1 RH + 5 colaboradores usando emails reais. Documentar cada um dos 27 passos com screenshot/log.
**Estimativa:** 1 dia útil de QA humano.

### BLK-02 — CMS: upload real não ligado
**Camada:** Backend + Storage
**Impacto:** passos E2E #23–#24 não podem ser cumpridos. Sem conteúdo real → biblioteca/curso ficam vazios em produção.
**Ação:**
- Criar buckets `content-audio`, `content-video`, `content-pdf` via `storage_create_bucket`.
- Ligar UI de upload em `PlatformContentItemsListScreen` ao `supabase.storage.upload`.
- Implementar fluxo `draft → review → published` com validação de mime/tamanho.
**Estimativa:** 4h.

### BLK-03 — Bundle 2.6 MB sem code-splitting
**Camada:** Frontend/perf
**Impacto:** TTI > 8s em 3G. Reprova Core Web Vitals.
**Ação:** dynamic import por rota (React.lazy + Suspense) em `App.tsx` para as 180 telas. Manual chunks para vendor (`react`, `@supabase`, `recharts`).
**Estimativa:** 3h.

### BLK-04 — Cron de agregação `platform_usage_daily` não confirmado
**Camada:** Backend
**Impacto:** dashboards de Platform Admin mostrarão dados desatualizados.
**Ação:** agendar `compute-platform-usage` via pg_cron diariamente às 03:00. Verificar em `cron.job` (requer service_role).
**Estimativa:** 30min.

### BLK-05 — TTL de expurgo de dados sensíveis sem cron
**Camada:** Backend / LGPD
**Impacto:** violação de política declarada de retenção (90 dias). Risco LGPD.
**Ação:** edge function `expire-sensitive-data` + pg_cron diário deletando `emotional_checkins`, `pulse_responses`, `executive_ai_messages`, `onboarding_messages` acima do TTL da org.
**Estimativa:** 2h.

## 🟠 Altos

### BLK-06 — Rate limit AI ad-hoc não implementado
`platform_settings` vazio; `executive-ai`/`onboarding-chat`/`cms-recommend` só passam upstream 429. Item #2 aprovado mas não codado. **Est.:** 3h.

### BLK-07 — Onboarding wizard sem persistência
`organizations.onboarding_step` nunca é escrito → refresh no meio do wizard perde progresso. **Est.:** 1h.

### BLK-08 — Convites: email transacional não verificado
`send-enterprise-invite` chama enqueue mas domínio `notify.*` não checado neste ciclo. **Ação:** rodar `email_domain--check_email_domain_status` e enviar 1 teste. **Est.:** 15min + propagação DNS.

### BLK-09 — Módulos por organização (feature toggle)
Passo E2E #4 pede "configurar módulos". Não existe tabela `organization_features` nem UI. **Est.:** 2h.

## 🟡 Médios

### BLK-10 — Export LGPD/GDPR sob demanda
`data_export_requests` existe mas sem edge function que gere ZIP e envie link. **Est.:** 3h.

### BLK-11 — Filtros/timeline em `platform_audit_logs`
UI existe, filtros por ator/ação/org ausentes. **Est.:** 2h.

### BLK-12 — Chunk `login-abstract.png` = 1.38 MB
Recomprimir/converter para WebP (<200 KB). **Est.:** 10min.

## Não-blockers (fora do MVP)

- Pagamento (decisão explícita do usuário: adiar Stripe/Paddle).
- Editor visual de features por plano.
- Cohorts de retenção avançados.
- Meilisearch / pg_trgm search.

---

**Só declarar MVP APROVADO após:**
- BLK-01 a BLK-05 fechados;
- Repetir os 27 passos E2E sem incidente;
- `RELEASE_CANDIDATE_REPORT.md` reemitido com todos os passos marcados ✅.