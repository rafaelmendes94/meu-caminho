# PRODUCTION_AUDIT — FASE RC-04

Data: 2026-07-13  
Modo: hardening (auditoria; sem alterar banco/edge/RLS/regras).

## 1. Auth

| Cenário | Fonte | Resultado |
|---|---|---|
| Login / logout / refresh / múltiplas abas | `useAuth.tsx` — `onAuthStateChange` + `getSession` no bootstrap | ✅ Sessão hidrata em todas as abas via evento. |
| Sessão expirada / token inválido | Supabase client `persistSession + autoRefreshToken` (default) | ✅ Refresh automático; falha → `SIGNED_OUT` → `ProtectedRoute` redireciona. |
| Troca de usuário | `signOut` limpa storage; `onAuthStateChange` re-hidrata | ✅ |
| Google OAuth | Provider gerenciado (`configure_social_auth` Google) | ✅ |
| Reset password | Fluxo `resetPasswordForEmail` + rota `/reset-password` | ✅ |
| Magic link | não implementado (não é requisito MVP) | N/A |
| Bloqueio por org suspensa | `ProtectedRoute.orgBlocked` | ✅ |

## 2. RLS

Todas as 57 tabelas do schema `public` têm RLS habilitado (ver `RLS.md`). Auditoria de consistência RC-03 confirmou zero vazamentos cross-org via `has_role(auth.uid(), …)` + escopo por `organization_id`.

- ✅ SELECT/INSERT/UPDATE/DELETE por role auditados.
- ✅ Nenhuma recursão em políticas (todas usam `has_role` security-definer).
- ⚠️ 1 finding **ERROR** de linter em view `SECURITY DEFINER` (ver P-03).
- ⚠️ 15+ findings **WARN** de funções `SECURITY DEFINER` executáveis por `authenticated` — todas são legítimas para o padrão de segurança do projeto (`has_role`, RPCs internas). Marcadas como esperadas; ver `PRODUCTION_BLOCKERS.md`.

## 3. Storage

Buckets: `content-images`, `content-audio`, `content-audios`, `content-video`, `content-videos`, `content-pdf`, `content-materials`, `avatars`, etc.

- ✅ Upload/download com signed URL nas telas Platform Content.
- ✅ Expiração de URL controlada por chamadas `.createSignedUrl(path, ttl)`.
- ❌ **BLOQUEADOR B-01/02/03/04**: 4 buckets (`content-images`, `content-audio`, `content-video`, `content-pdf`) têm política SELECT permissiva que expõe conteúdo **não-publicado** e **premium** a qualquer usuário autenticado. Ver `PRODUCTION_BLOCKERS.md`.

## 4. Edge Functions

30 funções ativas (ver `EDGE_FUNCTIONS.md`). CORS padrão presente em todas. `_shared/rate_limit.ts` aplicado nas rotas de IA.

- ✅ Timeout / 429 / 500 tratados no client via `useAsyncCall` + toast.
- ✅ Retry manual via botão "tentar novamente" onde aplicável.
- ✅ Logs disponíveis via `supabase--edge_function_logs`.

## 5. RPCs / performance

- ✅ RPCs críticas (`has_role`, agregados k-anon) são estáveis, `SECURITY DEFINER` com `search_path = public` fixado.
- ✅ N+1 evitado com selects encadeados (`profiles, departments(name), units(name)`).
- ⚠️ `PlatformOwners` faz 4 counts em paralelo por render — aceitável (<50ms cada) mas ver P-05.

## 6. Cache

- ✅ React Query cache padrão + refetch nas mutações críticas (invites, profiles).
- ✅ `optimistic updates` não usados (evita inconsistências no MVP).
- ✅ Realtime aplicado em canal direto (`reports`) e alertas.

## 7. Network

Percorridos os principais fluxos (auth, RH dashboard, colaborador home, checkout, content items). Nenhum 4xx/5xx inesperado observado no console.

## 8. Build / TypeScript / Lint

- `bunx tsgo --noEmit` → ✅ **0 erros**.
- Vite build → coberto pelo pipeline automático (verde).
- `console.log` de debug em produção → 0 (auditado em RC-02).
- `TODO/FIXME` em código → 0.

## 9. Segurança de input / XSS

- ✅ Nenhum `dangerouslySetInnerHTML` com input de usuário.
- ✅ Uploads validam mime/size no client (Platform Content forms).
- ✅ Segredos: `LOVABLE_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY` armazenados como env de edge functions; nenhum hardcoded (grep 0 hits).
- ✅ Rate-limit IA (`_shared/rate_limit.ts`).

## 10. Crons

- `compute-platform-usage` (diário) — agregação de KPIs SA.
- `compute-organizational-score` (diário) — score/org.
- `compute-basic-alerts`, `detect-predictive-signals`, `expire-sensitive-data`, `generate-weekly-insights` — todos scheduleados via pg_cron.
- ✅ Nenhuma duplicação de schedule detectada.

## 11. IA

- ✅ Todas as edge functions de IA capturam JSON quebrado (`try/catch` + fallback message).
- ✅ Rate-limit + quota diária em `ai_usage_daily`.

## 12. Responsividade

RC-02 confirmou breakpoints principais. Sem quebras novas.

---

## Resultado

**PRODUCTION BLOCKED** (por 4 findings ERROR de Storage — ver `PRODUCTION_BLOCKERS.md`).

Correção requer 1 migration curta (ALTER POLICY em `storage.objects`) — fora do escopo conservador de RC-04 (que proíbe alteração de banco). Precisa autorização explícita para prosseguir com a migration na próxima janela.