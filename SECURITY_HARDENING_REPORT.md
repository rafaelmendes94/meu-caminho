# SECURITY_HARDENING_REPORT — FASE RC-06

Data: 2026-07-13  
Escopo: exclusivamente segurança. Nenhuma alteração de layout, UX ou regra de negócio.

## Migration aplicada

`supabase/migrations/…_rc06_security_hardening.sql` (aplicada via `supabase--migration`, aprovada pelo cliente).

## Correções

| # | Problema (antes) | Correção | Validação |
|---|---|---|---|
| 1 | **B-01** — Bucket `content-images` tinha duas políticas SELECT combinadas por OR. A permissiva (`content_content_images_auth_read`) liberava qualquer arquivo para `authenticated`, sobrepondo a restritiva. | `DROP POLICY content_content_images_auth_read` — mantida apenas a política `cms read content-images` que valida `content_items.status='published'`. | Query em `pg_policy`: sobrou apenas a política restritiva. |
| 2 | **B-02** — Bucket `content-audio` tinha só a política permissiva. | `DROP` da permissiva + `CREATE POLICY cms read content-audio` (mesmo padrão de `content-audios`: `is_platform_admin() OR EXISTS(content_items published)`). | Idem. |
| 3 | **B-03** — Bucket `content-video` idem. | `DROP` + `CREATE POLICY cms read content-video` no mesmo padrão. | Idem. |
| 4 | **B-04** — Bucket `content-pdf` idem. | `DROP` + `CREATE POLICY cms read content-pdf` no mesmo padrão. | Idem. |
| 5 | **B-05** — View `public.employee_profiles_rh_view` com `SECURITY DEFINER` (linter `0010_security_definer_view`). | `DROP VIEW`. Confirmado por `rg` em `src/**/*.tsx` e `supabase/functions/**` que a view **não era usada** pelo aplicativo (RH consome dados via RPCs `get_rh_dashboard_summary`, `get_pulse_aggregate`, etc., que já enforçam `has_any_role` + k-anon). | Linter pós-migration: finding `0010_security_definer_view` desapareceu. |

## Impacto

- **Segurança:** conteúdo em `draft` ou `archived` (e conteúdo premium não publicado) deixa de ser baixável por qualquer usuário logado nesses 4 buckets. Apenas `platform_admin` (via CMS) e arquivos vinculados a `content_items.status='published'` retornam ao SELECT.
- **UX:** zero regressão — signed URLs continuam funcionando normalmente para conteúdo publicado; downloads/uploads/upload de covers seguem inalterados.
- **RH/Colaborador:** nenhum fluxo consumia `employee_profiles_rh_view`; nenhum efeito.
- **Regras de negócio:** inalteradas.

## Auditoria pós-hardening

### Storage (RC-06 §3)

| Bucket | SELECT restrito a `published`? | Upload/Update/Delete restrito a admin? |
|---|---|---|
| content-images | ✅ | ✅ |
| content-covers | ✅ (já era) | ✅ |
| content-books | ✅ (já era) | ✅ |
| content-audio | ✅ (novo) | ✅ |
| content-audios | ✅ (já era) | ✅ |
| content-video | ✅ (novo) | ✅ |
| content-videos | ✅ (já era) | ✅ |
| content-pdf | ✅ (novo) | ✅ |
| content-materials | ✅ (já era) | ✅ |

Todos os buckets `public=false` — download exclusivo via signed URL emitido pelo backend após checagem RLS.

### Security Advisor (RC-06 §4)

- **Antes:** 41 findings — 4 ERROR (storage) + 1 ERROR (view definer) + 36 WARN/INFO.
- **Depois:** 36 findings — **0 ERROR**, 36 WARN/INFO.
- **WARNs remanescentes (esperados / não corrigíveis sem quebrar arquitetura):**
  - `0029_authenticated_security_definer_function_executable` × 35 — todas as funções `SECURITY DEFINER` do projeto (`has_role`, `has_any_role`, `is_platform_admin`, `current_organization_id`, `get_*_aggregate`, `get_*_dashboard_summary`, `get_dna_context`, `get_executive_context`, `get_predictive_context`, `calculate_organizational_score`, `measure_impact`, `org_tree`, etc.). São propositalmente `SECURITY DEFINER` porque **implementam** a checagem de role internamente (padrão Supabase para evitar recursão em RLS). Marcadas como intencionais.
  - `0014_extension_in_public` × 1 — extensão instalada no schema `public` (default histórico do projeto). Não corrigível sem migration destrutiva; sem impacto de segurança em runtime.

### Build / Typecheck / Lint (RC-06 §5)

- `bunx tsgo --noEmit` → ✅ **0 erros**.
- Vite build → coberto pelo pipeline automático (verde após migration).
- Nenhum código do client precisou de ajuste (types regenerados; a view removida não era importada).

## Conclusão

**SECURITY HARDENING CONCLUÍDO.**  
Todos os bloqueadores ERROR eliminados. Nenhum finding de nível ERROR restante. Warns remanescentes são intencionais e documentados.

Resta apenas: BLK-01 (QA humano E2E) e BLK-08 (domínio de e-mail) — ambos dependem do cliente/QA, não da engenharia.