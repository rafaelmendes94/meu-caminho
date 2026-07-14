# QA_SEED_REPORT — Massa QA 3 empresas / 100 colaboradores

## Empresas criadas (idempotente por slug)
| Empresa | Slug | Plano | Licenças (usadas/total) | Status |
|---|---|---|---|---|
| Horizonte Tecnologia Ltda. | horizonte-tecnologia-qa | Plano 1.000 | 35 / 1000 | active |
| ValeSul Indústria Ltda. | valesul-industria-qa | Plano 5.000 | 34 / 5000 | active |
| Atlântica Serviços Corporativos Ltda. | atlantica-servicos-qa | Plano 1.000 | 34 / 1000 | trialing |

## Contas de autenticação (email_confirm = true, senha `McQa@2026!`)
- Total: **103** — Admins/owners: 3 — Líderes: 16 — Colaboradores (employee): 84
- Distribuição: Horizonte 34 (5 lead + 29 emp), ValeSul 33 (6 lead + 27 emp), Atlântica 33 (5 lead + 28 emp).

## Estrutura organizacional
- Departamentos criados: 19 (6 + 7 + 6) — todos únicos por org.
- Unidades criadas: 7 (2 + 2 + 3) — todos únicos por org.
- `manager_id` atribuído para todos os employees cujo dept tem um leader.

## Onboarding
- `not_started`: ~20% (sem employee_profile)
- `in_progress`: ~30%
- `completed`: 49 colaboradores (17 Horizonte + 16 ValeSul + 16 Atlântica) com `employee_profiles` sintéticos.

## Dados operacionais sintéticos
- Check-ins emocionais (30 dias): **490** — tag `qa_seed`, viés por empresa.
- Respostas Pulse (30 dias): **588** — context `qa_seed`.
- Alerts sintéticos: 3 (1 por empresa) — tipo `qa_seed`.
- Sinais preditivos sintéticos: 3.
- Planos de ação: 3 (draft).
- Rituais Inteligentes publicados: 3.

## Duplicidades evitadas
- Upsert por `slug` (organizations), por `name+organization_id` (departments/units), por `id` (profiles), por `user_id` (employee_profiles). Re-execuções não duplicam.

## Isolamento (RLS)
- Todas as tabelas seguem RLS por `current_organization_id()`. Usuários de uma empresa não veem dados de outras (validado por consulta: joins retornam 0 fora do próprio `organization_id`).

## Artefatos
- `QA_TEST_USERS.csv` (raiz) — 103 linhas + header — **em .gitignore**.
- `QA_TEST_COMPANIES.md` — descritivo por empresa.

## Pendências
- Validação manual de login por usuário deve ser feita pela equipe de QA (o script não executa login end-to-end).
- Não foi enviado nenhum e-mail (contas criadas com `email_confirm=true`).
