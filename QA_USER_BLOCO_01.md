# QA Usuário — Bloco 1: Acesso, Sessão e Permissões

Data: 2026-07-13
Escopo: rotas protegidas, redirecionamento por role, persistência/expiração de sessão, isolamento cross-org.
Sem mocks. Sem alterações em Super Admin ou RH.

## Ambiente

Usuários de teste (senha `12345678`):
- `admin@teste.com.br` — `platform_admin`
- `empresa@teste.com.br` — `owner` (org "Empresa Teste")
- `colaborador@teste.com.br` — `employee` + `employee_profile` (org "Empresa Teste")

## Testes executados (Playwright, headless, viewport 1280×1800)

| # | Caso | Esperado | Observado | Status |
|---|---|---|---|---|
| T1 | GET `/enterprise` sem sessão | redir `/login` | `/login` | ✅ |
| T2 | GET `/admin/dashboard` sem sessão | redir `/login` | `/login` | ✅ |
| T3 | Login com credenciais inválidas | toast/alert PT-BR | "E-mail ou senha incorretos." | ✅ |
| T4 | Login employee c/ `employee_profile` | redir `/enterprise` | `/enterprise` | ✅ |
| T5 | Employee acessa `/admin/dashboard` | negado + volta pro home do role | volta a `/enterprise` (toast "Acesso negado") | ✅ |
| T6 | Employee acessa `/enterprise/rh/dashboard` | negado + volta pro home do role | volta a `/enterprise` | ✅ |
| T7 | Refresh em `/enterprise` mantém sessão | permanece `/enterprise` | `/enterprise` (após reload) | ✅ |
| T8 | Login owner | redir `/enterprise/rh/central-admin` | `/enterprise/rh/central-admin` | ✅ |
| T9 | Owner acessa `/admin/dashboard` | negado + volta pro home do role | `/enterprise/rh/central-admin` | ✅ |
| T10 | Login platform_admin | redir `/admin/dashboard` | `/admin/dashboard` | ✅ |
| T11 | Admin acessa `/enterprise/rh/dashboard` | negado (não tem role owner/rh_admin) | `/admin/dashboard` | ✅ |
| T12 | Sessão expirada (localStorage limpo) → GET `/enterprise` | redir `/login` | `/login` | ✅ |
| T13 | Employee `SELECT` direto em `organizations` | RLS filtra (0 linhas) | `[]` | ✅ |
| T14 | Employee RPC `get_my_organization()` | somente a própria org, sem campos sensíveis | 1 linha (Empresa Teste, subscription/licenças) | ✅ |

## Bugs encontrados

Nenhum. O bloco 1 já reflete correções aplicadas nos QAs anteriores (BUG-U01..U05 do QA_USER_01, hardening cross-org de `organizations`).

## Verificações estruturais

- `ProtectedRoute` (`src/components/ProtectedRoute.tsx`): gate por `loading` antes de redirecionar; nega `requiredRoles`; força `/onboarding` para employee/leader sem `employee_profile`; bloqueia orgs `suspended|canceled` para não-admins.
- `useAuth` (`src/hooks/useAuth.tsx`): `hydrate` re-carrega `profile/roles/organization/employee_profile` em cada `onAuthStateChange`; `getSession()` inicial garante SSR-like restore.
- `Auth` wrapper (`src/App.tsx`): platform_admin é redirecionado para `getDefaultAuthenticatedPath` (impede `platform_admin` "vazar" na área /home).
- `get_my_organization()` RPC devolve apenas campos seguros; `SELECT` direto em `organizations` para membros regulares retorna 0 linhas via política `org_select_admins` (fix aplicado no security scan anterior).

## Resumo

- Testes executados: 14
- Aprovados: 14
- Corrigidos: 0
- Pendentes: 0
- Bloqueados: 0
- Bugs críticos/altos/médios/baixos: 0

**Bloco 1 — CONCLUÍDO.** Pronto para prosseguir com o Bloco 2 (Convite e Cadastro).