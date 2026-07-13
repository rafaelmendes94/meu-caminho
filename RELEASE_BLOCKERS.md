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

### BLK-08 — Convites: email transacional (aguardando domínio)
Cliente ainda não possui domínio próprio. Envio real de e-mails de convite continua bloqueado até que o domínio seja configurado em Cloud → Emails. Sem impacto no restante do MVP (convite gera link válido via UI).

### BLK-09 — Módulos por organização (feature toggle) ✅ RESOLVIDO
Infra completa: (a) `organization_settings` já armazena flags `rh_*`, (b) UI de edição em `PlatformOrganizationDetailScreen` (aba RH), (c) hook `useOrgFeatures` (cache 60s) e componente `<FeatureGate feature=... redirect />` para gatear rotas/UI em runtime. Aplicar em telas específicas conforme necessidade sem novo trabalho de backend.

## 🟡 Médios

### BLK-10 — Export LGPD/GDPR sob demanda ✅ RESOLVIDO
`MyPrivacyScreen` já gera o export completo do usuário (profile, check-ins, pulses, consents, tickets) em JSON com download imediato + registro em `data_export_requests` (status/tamanho). Fluxo server-side com e-mail fica para pós-MVP quando o domínio for configurado.

### BLK-11 — Filtros/timeline em `platform_audit_logs` ✅ RESOLVIDO
`PlatformAuditScreen` já implementa filtros combinados (ação, empresa, ator, data inicial/final), toggle Tabela↔Timeline e export CSV do resultado filtrado.

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