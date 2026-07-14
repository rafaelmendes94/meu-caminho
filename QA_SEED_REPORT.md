# QA_SEED_REPORT.md

Seed: `qa_three_companies_100_employees`

- Empresas criadas: 3
- Contas de autenticação: 103
- Admins (owner): 3
- Líderes: 16
- Employees: 84

## Onboarding (colaboradores)
- Não iniciado: 60
- Em andamento: 40
- Concluído: 0

## Por empresa
- **Horizonte Tecnologia Ltda.** — 34 colaboradores + 1 admin, licenças 35/1000
- **ValeSul Indústria Ltda.** — 33 colaboradores + 1 admin, licenças 34/5000
- **Atlântica Serviços Corporativos Ltda.** — 33 colaboradores + 1 admin, licenças 34/1000

## Idempotência
A função `seed-qa-enterprise-data` reexecuta sem duplicar (busca por slug, e-mail, nome de dep/unidade e chaves únicas).

## Duplicidades evitadas
- Auth users: reaproveitados por e-mail.
- Organizações: upsert por `slug`.
- Departamentos e unidades: upsert por (org, nome).
- Roles: reset e reinsert por usuário.
- Check-ins e pulse dos últimos 40 dias com contexto `qa_seed` são removidos antes de reinserção.

## Logins de teste sugeridos
- admin@teste.com.br (platform_admin) — 12345678
- admin.horizonte@qa.meucaminho.test — McQa@2026! (owner de Horizonte Tecnologia Ltda.)
- admin.valesul@qa.meucaminho.test — McQa@2026! (owner de ValeSul Indústria Ltda.)
- admin.atlantica@qa.meucaminho.test — McQa@2026! (owner de Atlântica Serviços Corporativos Ltda.)
- colaborador.horizonte.001@qa.meucaminho.test — McQa@2026! (líder Horizonte)
- colaborador.horizonte.010@qa.meucaminho.test — McQa@2026! (employee Horizonte)
- colaborador.valesul.001@qa.meucaminho.test — McQa@2026! (líder ValeSul)
- colaborador.atlantica.001@qa.meucaminho.test — McQa@2026! (líder Atlântica)

## Isolamento
Garantido por RLS existente (`current_organization_id()` + `has_role`). Cada owner só acessa a própria organização.