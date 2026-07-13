# Release Blockers — MVP

**Data:** 2026-07-13 (atualizado após ciclo de correção)
**Status:** 5 blockers fechados nesta sessão. 1 crítico + 4 altos + 1 médio remanescentes.

## ✅ Fechados nesta sessão

- **BLK-02** CMS upload — buckets `content-audio/video/pdf/images` criados privados; policies `is_platform_admin()` para write + `authenticated` para read; componente `<StorageUpload>` integrado ao `ContentItemForm` com validação de tamanho (10–500MB por tipo) e signed URL (1 ano).
- **BLK-03** Code-splitting — `manualChunks` para vendor + 110 rotas Enterprise/Platform convertidas para `React.lazy`. Bundle principal: 2.615 kB → 860 kB (gzip 361 kB → 167 kB).
- **BLK-04** Cron `compute-platform-usage-daily` agendado diariamente 03:00 (pg_cron job 3).
- **BLK-05** Cron `expire-sensitive-data-daily` agendado 04:00 (job 5). Edge function `expire-sensitive-data` deployada e testada (200 OK, respeita `data_retention_days` por org com fallback 90d).
- **BLK-12** `login-abstract.png` (1.38 MB) convertido para WebP (56 kB, −96%).
- Bônus: `platform_settings` semeada com `data_retention_days=90`, `ai_chat_per_day=100`, `ai_generation_per_day=20`, `privacy_min_group_size=5`.

## 🔴 Críticos (impedem entrega)

### BLK-01 — E2E piloto nunca executado
**Camada:** QA
**Impacto:** não há evidência de funcionamento fim-a-fim com múltiplos usuários reais.
**Ação:** rodar em ambiente piloto com 1 platform admin + 1 RH + 5 colaboradores usando emails reais. Documentar cada um dos 27 passos com screenshot/log.
**Estimativa:** 1 dia útil de QA humano.

## 🟠 Altos

### BLK-06 — Rate limit AI ad-hoc ✅ RESOLVIDO
Tabela `ai_usage_daily` (PK user+data+função, RLS service_role, leitura admin) + helper `_shared/rate_limit.ts` com cache de 60s, upsert incremental e 429 c/ `Retry-After`. Aplicado em `executive-ai`, `onboarding-chat`, `cms-recommend`. Defaults: chat=100/dia, generation=20/dia.

### BLK-07 — Onboarding wizard sem persistência ✅ RESOLVIDO
Adicionadas colunas `organizations.onboarding_step` e `organizations.onboarding_data` (jsonb). Wizard carrega progresso ao montar e faz autosave debounced (400ms) de step + formData + checklist. Ao finalizar marca `onboarding_status='completed'`.

### BLK-08 — Convites: email transacional não verificado
`send-enterprise-invite` chama enqueue mas domínio `notify.*` não checado neste ciclo. **Ação:** rodar `email_domain--check_email_domain_status` e enviar 1 teste. **Est.:** 15min + propagação DNS.

### BLK-09 — Módulos por organização (feature toggle)
Passo E2E #4 pede "configurar módulos". Não existe tabela `organization_features` nem UI. **Est.:** 2h.

## 🟡 Médios

### BLK-10 — Export LGPD/GDPR sob demanda
`data_export_requests` existe mas sem edge function que gere ZIP e envie link. **Est.:** 3h.

### BLK-11 — Filtros/timeline em `platform_audit_logs`
UI existe, filtros por ator/ação/org ausentes. **Est.:** 2h.

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