# QA EMPRESA / RH — Bugs remanescentes

**Data:** 2026-07-10 (pós-onda de acabamento)

## Fechados nesta rodada
- **M-01** ✅ tabela `notifications` + realtime + AdminTopbar cabeado
- **M-03** ✅ `impact_measurements.baseline_snapshot` + `source_title`; `measure_impact` congela snapshot da iniciativa
- **B-01** ✅ tela renomeada para "Comparativo interno por segmento"; rótulos "Benchmark saudável" → "Referência interna"; disclaimers deixando claro que não é benchmark de mercado
- **B-02** ✅ `REVOKE EXECUTE ... FROM PUBLIC, anon` em todas as 38 funções `SECURITY DEFINER` do schema `public` (linter caiu de 47 → 35 warnings; restantes são "authenticated pode executar" — comportamento desejado, cada função valida role internamente; registrado em security-memory)
- **B-03** ✅ rota legada removida
- **B-04** ✅ Central Admin lê `weekly_ai_insights`
- **B-05** ✅ status organizacional real

## Ainda abertos

### M-02 — Reflexo CMS → app do colaborador não auditado
Exige E2E com CMS populado (draft/published/archived) + conta employee. Fora de escopo curto.

### B-06 — Padronização `useAsyncCall`/`EmptyState` (parcial ✅)
`EmptyState` aplicado nas telas críticas: Score Organizacional, Weekly Insights, Impact Engine, Audit Logs, Ritual Participations. Telas restantes usam padrões locais coerentes; refactor completo continua opcional.

### Warnings linter aceitos (registrado em `@security-memory`)
- 34× `0029_authenticated_security_definer_function_executable` — funções `SECURITY DEFINER` validam role internamente
- 1× `0014_extension_in_public` — `pgcrypto` em `public` (move exige rewrite de ~40 funções)

## Pendentes E2E
Ver `QA_EMPRESA_RH_FINAL.md` — exigem dataset com múltiplos usuários reais.
