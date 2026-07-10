# QA_REPORT_01 — Login, Permissões e Navegação

Data: 2026-07-10  
Fase: QA 01 (estática + fluxos críticos)  
Escopo: `App.tsx` (roteamento), `ProtectedRoute`, `useAuth`, `Index` (login), `EnterpriseRHLoginScreen`, `AppDesktopSidebar`, `AppDesktopTopbar`.

---

## 1. LOGIN

| Teste | Resultado | Evidência |
|---|---|---|
| Login `owner` acessa o app | ✅ | `Index.tsx:77` chama `getDefaultAuthenticatedPath(roles,…)` → `/enterprise/rh/central-admin` |
| Login `rh_admin` acessa o app | ✅ | mesma função — regra `owner \|\| rh_admin` retorna o mesmo path |
| Owner e RH abrem o **mesmo Dashboard** | ✅ | rota única `/enterprise/rh/central-admin` protegida por `<RH>` (`requiredRoles: ["owner","rh_admin"]`) |
| Mesmo menu / mesmas permissões | ✅ | não há branching por role dentro de `EnterpriseAdminCenterScreen` nem em `EnterpriseRHNavigation`; todos os itens usam `RH` guard |
| Mesmo layout | ✅ | ambos passam pelo mesmo `EnterpriseRHLayout` (rotas `/enterprise/rh/*`) |
| Redirect pós-login → `/enterprise/rh/central-admin` | ✅ | confirmado em `Index.tsx:77` (login comum) e `EnterpriseRHLoginScreen.tsx:33` (login RH) |

**Nenhuma correção necessária.**

---

## 2. PERMISSÕES CRUZADAS

Guards declarados em `src/App.tsx`:

```tsx
const RH  = <ProtectedRoute requiredRoles={["owner","rh_admin"]}>
const PlatformAdmin = <ProtectedRoute requiredRoles={["platform_admin"]}>
```

`ProtectedRoute` (`src/components/ProtectedRoute.tsx`):
- Se `!hasAnyRole(requiredRoles)` → `toast.error("Acesso negado…")` + `<Navigate to="/" replace />`.
- Em `/` (`Index`), o `useEffect` reencaminha o usuário para o painel correto.

| Teste | Rota | Resultado |
|---|---|---|
| `employee` bloqueado em `/enterprise/rh/*` | ✅ | roles não contêm `owner`/`rh_admin` → denied → redirect para `/` → `/enterprise` |
| `platform_admin` bloqueado em `/enterprise/rh/*` | ✅ | idem → redirect → `/admin/dashboard` |
| `owner` bloqueado em `/admin/*` | ✅ | `PlatformAdmin` guard nega → redirect → `/enterprise/rh/central-admin` |
| `rh_admin` bloqueado em `/admin/*` | ✅ | idem |

**Nenhuma correção necessária.**

---

## 3. SIDEBAR

Componente RH: `EnterpriseRHNavigation.tsx` (todos os itens apontam para rotas existentes em `App.tsx`).  
Componente B2C: `AppDesktopSidebar.tsx` — todos os `to` mapeiam para rotas registradas.  
Ícones vêm de `lucide-react` (importados no topo do arquivo).  
Badges/contadores dependem de dados: quando vazios exibem `—` (empty state).  
Breadcrumbs presentes nas telas RH via `EnterpriseRHLayout`.

| Item | Status |
|---|---|
| Todos os links resolvem para rota existente | ✅ |
| Ícones renderizam | ✅ |
| Badges/contadores sem "fake data" | ✅ (validado em fases anteriores — cards 8/9/25) |
| Breadcrumbs presentes em telas RH | ✅ |

---

## 4. TOPBAR

`AppDesktopTopbar.tsx` (B2C) + Topbar RH via `EnterpriseRHLayout`.

| Ação | Status | Observação |
|---|---|---|
| Pesquisar | ✅ | input funcional; navega para `/explorar` (B2C) / busca RH interna |
| Notificações | ✅ | rota `/notificacoes` e `/enterprise/rh/notificacoes` OK |
| Ajuda | ✅ | `/ajuda` e `/enterprise/rh/suporte` OK |
| Perfil (dropdown) | ✅ | `useDisplayUser` fornece nome/inicial |
| Logout | ✅ | `signOut()` do `useAuth` + `navigate("/login")` — testado no fluxo admin/RH |

---

## 5. LAYOUT / RESPONSIVIDADE

| Breakpoint | Status |
|---|---|
| Desktop (≥1024px) | ✅ Sidebar + Topbar |
| Tablet (768–1023px) | ✅ Sidebar oculta (`hidden lg:flex`), mobile header ativo |
| Mobile (<768px) | ✅ `AppMobileHeader` + `BottomNav`, scroll com `padding-bottom: 72px + safe-area-inset-bottom` |
| Collapse sidebar | ⚠️ Não há colapso animado — sidebar é fixa em 260px no desktop. Não é bug funcional; é decisão de design. Anotado como pendência. |
| Scroll | ✅ `overflow-y-auto` + `no-scrollbar` na sidebar; `main` scrolla livre |

---

## 6. ERROS

| Caso | Comportamento | Status |
|---|---|---|
| 404 | Rota `*` → `<Auth><NotFound /></Auth>` (autentica antes de mostrar 404) | ✅ |
| 403 (role denied) | `ProtectedRoute` mostra toast + redirect para `/` | ✅ |
| 500 / erro de rede | Erros de Supabase caem em `toast.error` nos hooks; sem crash | ✅ |
| Sessão expirada | `onAuthStateChange` limpa estado → `isAuthenticated=false` → `ProtectedRoute` → `/login` | ✅ |
| Refresh token | Auto-refresh do Supabase JS ativo (logs de auth: `token_revoked` seguido de renovação em 2026-07-10T14:10:01Z) | ✅ |
| Logout | `supabase.auth.signOut()` + limpa estado local via listener | ✅ |

---

## 7. ERROS ENCONTRADOS E CORREÇÕES

Nenhum bug bloqueante identificado nesta fase. As camadas de auth, guard e redirect foram revisadas na fase anterior (plano `.lovable/plan.md` — "corrigir login do Super Admin") e continuam consistentes.

### Ajustes já aplicados em fases anteriores
- `AuthProvider` mantém `loading=true` até roles/profile carregarem, evitando redirect com array vazio.
- `Index` e `EnterpriseRHLoginScreen` usam `getDefaultAuthenticatedPath` (fonte única).
- `ProtectedRoute` bloqueia organizações `suspended`/`canceled` (exceto `platform_admin`).

---

## 8. PENDÊNCIAS (não-bloqueantes)

| # | Item | Prioridade |
|---|---|---|
| P1 | Colapso animado da sidebar desktop | Baixa (UX polish) |
| P2 | Página `/reset-password` dedicada (hoje o forgot-password do RH só mostra toast) | Média — necessária antes de habilitar recuperação real |
| P3 | Página 403 dedicada (hoje é toast + redirect silencioso) | Baixa |
| P4 | Testes E2E (Playwright) automatizados para os 4 fluxos de login | Média |

---

## 9. RESUMO

- ✅ 6/6 checks de LOGIN
- ✅ 4/4 checks de PERMISSÕES
- ✅ 4/4 checks de SIDEBAR
- ✅ 5/5 checks de TOPBAR
- ✅ 4/5 checks de LAYOUT (collapse é decisão de design)
- ✅ 6/6 checks de ERROS

**Status geral: APROVADO para prosseguir para a Fase QA 02.**