# QA_TEST_COMPANIES — Massa QA (3 empresas / 103 contas)

Todos os registros são **fictícios** e marcados como dados de teste (`SEED:qa_three_companies_100_employees` em `organizations.internal_notes`, tag `qa_seed` em check-ins/pulse). Senha temporária única para QA: `McQa@2026!`.

## 1. Horizonte Tecnologia Ltda.
- Slug: `horizonte-tecnologia-qa` — Segmento: Tecnologia — Florianópolis/SC
- Plano: **Plano 1.000** — Licenças: 1000 total / 35 em uso — Status: `active`
- Admin (owner/rh): `admin.horizonte@qa.meucaminho.test`
- Colaboradores: 34 (5 leaders + 29 employees) + 1 admin
- Departamentos: Produto, Engenharia, Comercial, Customer Success, Administrativo, Pessoas e Cultura
- Unidades: Florianópolis, Remoto
- Cenário esperado: tendência saudável, leve atenção em recuperação/energia noturna.

## 2. ValeSul Indústria Ltda.
- Slug: `valesul-industria-qa` — Segmento: Indústria — Joinville/SC
- Plano: **Plano 5.000** — Licenças: 5000 total / 34 em uso — Status: `active`
- Admin (owner/rh): `admin.valesul@qa.meucaminho.test`
- Colaboradores: 33 (6 leaders + 27 employees) + 1 admin
- Departamentos: Produção, Qualidade, Manutenção, Logística, Engenharia, Administrativo, Recursos Humanos
- Unidades: Joinville, Araquari
- Cenário esperado: sobrecarga em Produção — energia baixa, estresse elevado.

## 3. Atlântica Serviços Corporativos Ltda.
- Slug: `atlantica-servicos-qa` — Segmento: Serviços — Balneário Camboriú/SC
- Plano: **Plano 1.000** — Licenças: 1000 total / 34 em uso — Status: `trialing` (14 dias)
- Admin (owner/rh): `admin.atlantica@qa.meucaminho.test`
- Colaboradores: 33 (5 leaders + 28 employees) + 1 admin
- Departamentos: Operações, Atendimento, Comercial, Financeiro, Marketing, Recursos Humanos
- Unidades: Balneário Camboriú, Itajaí, Remoto
- Cenário esperado: atenção em comunicação e participação (dispersão entre unidades).

## Onboarding (por empresa, ~mesma proporção)
- ~20% `not_started` (convite aceito, sem employee_profile)
- ~30% `in_progress`
- ~50% `completed` (com `employee_profile` sintético + check-ins/pulse 30d)

## Como acessar
- Admins entram em `/enterprise/rh/central-admin`.
- Colaboradores/leaders usam login normal do app.
- Senha para todos: `McQa@2026!` (somente QA).
