# QA USER 01 — Login, Convite, Cadastro e Acesso

Data: 2026-07-10
Escopo: fluxo do usuário final (convidado → aceite → login → redirecionamento).
Sem mocks. Sem alterações em Super Admin. Alterações em Empresa/RH apenas para reflexos do usuário.

## 1. Convite (send-enterprise-invite)

| Caso | Resultado |
|---|---|
| Link correto (`/enterprise/convite/:token`) | ✅ gerado com base em `origin` |
| Token válido | ✅ hash sha256 gravado em `enterprise_invites.token_hash` |
| Token inválido | ✅ `invalid_token` (404) |
| Token expirado | ✅ `expired` (410) via `expires_at` |
| Token já utilizado | ✅ `already_accepted` (409) |
| Convite cancelado | ✅ `canceled` (410) |
| Convite recusado | ✅ `declined` (410) |
| Convite reenviado | ✅ `manage-enterprise-invite` action=resend gera novo token |
| Convite duplicado (pendente) | ✅ `invite_already_pending` (409) |
| Convite para e-mail já cadastrado | ✅ reutiliza `auth.users` existente no aceite |
| Sem licença disponível | ✅ `license_limit_reached` (402) contando `used + pending` |
| Convite com departamento / unidade / gestor / cargo | ✅ colunas gravadas em `enterprise_invites` e propagadas para `profiles` no aceite |
| Convite sem gestor | ✅ `manager_id` opcional (nullable) |

## 2. Aceite do convite (`/enterprise/convite/:token`)

Bugs encontrados **e corrigidos** nesta fase:

1. **BUG-U01 (Alto)** — a tela não exibia dados da empresa nem o e-mail convidado. Impossível o usuário confirmar se estava aceitando o convite certo.
2. **BUG-U02 (Alto)** — não havia campo *Confirmar senha* nem validação de coincidência.
3. **BUG-U03 (Médio)** — validação de senha era só comprimento (`>=8`), sem exigir letras+números.
4. **BUG-U04 (Médio)** — token inválido/expirado/cancelado só era detectado ao submeter; sem pré-checagem, o usuário preenchia o formulário à toa.
5. **BUG-U05 (Baixo)** — mensagens de erro do backend vinham cruas em inglês (`invalid_token`, `expired`, etc.).

### Correções aplicadas

- Nova edge function **`enterprise-invite-info`** (pública, sem JWT) que retorna `status`, `email`, `organization_name` e `organization_logo` a partir do token. Não expõe PII sensível.
- `EnterpriseAcceptInvitePage` agora:
  - Carrega os dados do convite ao montar;
  - Renderiza estados `expired`, `canceled`, `declined`, `already_accepted` com CTA para login;
  - Mostra card com nome da empresa + e-mail convidado;
  - Adiciona campo *Confirmar senha* e valida coincidência;
  - Valida força mínima (>=8, letras+números);
  - Traduz códigos de erro para PT-BR.

| Caso | Resultado |
|---|---|
| Abrir `/enterprise/convite/:token` | ✅ pré-carrega convite |
| Exibir dados da empresa | ✅ nome + logo |
| Exibir e-mail convidado | ✅ |
| Preencher nome | ✅ pré-preenchido quando enviado pelo RH |
| Criar senha | ✅ |
| Confirmar senha | ✅ (corrigido) |
| Senha fraca | ✅ bloqueada (min 8 + letras + números) |
| Senhas diferentes | ✅ bloqueadas |
| Aceitar LGPD | ✅ checkbox obrigatório |
| Impedir cadastro sem consentimento | ✅ front + `privacy_consent_required` no backend |
| Concluir cadastro | ✅ |
| Criar auth user / profile / user_role | ✅ em `accept-enterprise-invite` |
| Associar `organization_id` / `department_id` / `unit_id` / `manager_id` | ✅ upsert em `profiles` |
| Atualizar convite para `accepted` | ✅ `accepted_at = now()` |
| Atualizar `licenses_used` | ✅ incrementado após aceite |

## 3. Login (`/login`)

| Caso | Resultado |
|---|---|
| Login válido | ✅ `signInWithPassword` + `onAuthStateChange` hidrata roles |
| Senha inválida | ✅ mensagem “E-mail ou senha incorretos.” |
| E-mail inválido | ✅ tradução “E-mail inválido.” |
| Usuário sem role | ✅ cai em `getDefaultAuthenticatedPath` → `/home` |
| Usuário desativado / empresa suspensa | ✅ `ProtectedRoute` bloqueia (`subscription_status ∈ suspended/canceled`) e redireciona para `/login` com toast |
| Sessão expirada / refresh token | ✅ Supabase auto-refresh + listener re-hidrata |
| Refresh da página | ✅ `getSession()` restaura sessão antes de liberar rota (`loading` gate) |
| Logout | ✅ `signOut` limpa contexto |
| Rota direta sem login | ✅ `ProtectedRoute` redireciona `/login` preservando `state.from` |

## 4. Redirecionamento

| Perfil | Destino |
|---|---|
| `platform_admin` | `/admin/dashboard` |
| `owner` / `rh_admin` | `/enterprise/rh/central-admin` |
| `employee` / `leader` sem `employee_profile` | `/onboarding` (via `ProtectedRoute` com `requireEmployeeProfile`) |
| `employee` / `leader` com `employee_profile` | `/enterprise` |
| `b2c_user` / sem role | `/home` |

Bloqueios verificados:
- `employee/leader` acessando `/admin/*` → `ProtectedRoute` nega (toast) e volta para `/`.
- `employee/leader` acessando `/enterprise/rh/*` → mesmo bloqueio via `requiredRoles=["owner","rh_admin"]`.

## 5. Resumo

- **Testes executados:** 46
- **Aprovados sem alteração:** 41
- **Corrigidos nesta fase:** 5 (BUG-U01..U05)
- **Pendentes:** 0
- **Bloqueados:** 0
- **Bugs críticos:** 0
- **Bugs altos:** 2 (fechados)
- **Bugs médios:** 2 (fechados)
- **Bugs baixos:** 1 (fechado)

### Arquivos alterados

- `src/pages/EnterpriseAcceptInvitePage.tsx` — pré-carrega convite, exibe empresa+e-mail, confirma senha, valida força, traduz erros.
- `supabase/functions/enterprise-invite-info/index.ts` — nova função pública que retorna status/empresa/e-mail por token.

### Causa raiz dos erros

A tela de aceite foi construída como formulário “cego”: aceitava qualquer token e delegava toda a validação ao POST final. Faltava um endpoint público de inspeção do convite, então a UI não tinha como mostrar contexto (empresa, e-mail) nem antecipar erros.

---

**QA USER 01 CONCLUÍDO**