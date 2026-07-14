# QA Center

Rota: `/admin/system/qa` — acesso somente `platform_admin` (Owner/RH/Colaborador não têm acesso).

## Estrutura de dados (public, RLS: platform_admin only)
- `qa_suites` — módulos: Super Admin, Empresa/RH, Colaborador, CMS, IA, Knowledge Hub, Performance, Segurança, Billing, Integrações (seed pronto).
- `qa_test_cases` — `code`, `title`, `description`, `preconditions`, `steps (jsonb)`, `expected_result`, `priority`, `tags`, `assignee`.
- `qa_executions` — `status` (`not_started|running|passed|failed|blocked|skipped`), `actual_result`, `duration_ms`, `notes`, `evidence`, `executed_by`, `executed_at`.
- `qa_bugs` — `title`, `description`, `severity`, `area`, `status` (`open|in_progress|fixed|wontfix|duplicate|closed`), `assignee`, `related_case_id`, `version`, `release`, `fix_note`.
- `qa_checklists` + `qa_checklist_runs` — Go Live, Nova Empresa, Nova Versão, Release, Hotfix, Smoke Tests (seed pronto). Cada run mantém `items[]` com toggle individual.
- `qa_evidence` — anexos (`image|pdf|video|txt|link`) vinculados a execução ou bug.
- `qa_go_live_snapshots` — histórico do score de Go Live.

Enums novos: `qa_status`, `qa_priority`, `qa_severity`, `qa_bug_status`, `qa_checklist_kind`.

## UI
11 abas: Dashboard, Test Suites, Execuções, Casos de Teste, Bugs, Evidências, Cobertura, Checklists, Smoke Tests, Go Live, Histórico. Nenhuma alteração de UX em Empresa/RH/Colaborador.

- Dashboard: total de casos, aprovados/falhados/bloqueados, cobertura, última execução, última homologação, bugs por severidade, Go Live score.
- Cobertura: por módulo (cobertura vs. taxa de sucesso).
- Go Live: critérios computados em tempo real (sem bugs críticos, sem bugs altos, cobertura ≥ 95%, casos aprovados > 0, suites cadastradas) + snapshot histórico.
- Exportações: CSV (casos + último status) e JSON completo; Imprimir/PDF via `window.print`.

## Permissões
- Platform Admin: CRUD completo (RLS `has_role('platform_admin')`).
- Owner: sem acesso à rota (client guard + RLS negam).
- RH / Colaborador: sem acesso.

## Auditoria
Toda operação de execução, alteração de bug, criação de checklist, snapshot Go Live grava linha nas tabelas com `executed_by/created_by = auth.uid()`, formando trilha auditável.

## Integração futura (arquitetura pronta, não conectada)
- Playwright / Cypress: importar resultados em `qa_executions` via edge function.
- Vitest / Jest: `test_case_id.code` como chave para linkar suites unitárias.
- GitHub Actions: webhook para popular `qa_executions` a cada CI run.

## Pendências reais
- Bucket dedicado para evidências (hoje aceita URL externa/publica). Migrar para bucket privado `qa-evidence` quando houver upload direto.
- Integração automática com pipelines de teste (Playwright/CI) — hoje o registro é manual.
- Critérios de Go Live que dependem de outros módulos (Backup/Performance) são exibidos como referência, avaliados nos módulos dedicados.