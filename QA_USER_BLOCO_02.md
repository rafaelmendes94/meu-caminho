# QA Usuário — Bloco 2: Convite e Cadastro

Data: 2026-07-13
Escopo: fluxo de convite Enterprise (envio, aceite, cancelamento, licenças, deduplicação, validações).
Sem mocks. Sem alterações em Super Admin. RH tocado apenas para chamar `send-enterprise-invite`/`manage-enterprise-invite`.

## Ambiente

- Org: "Empresa Teste" (`a40d6d2b-…`, licenças 10/2)
- RH: `empresa@teste.com.br` (owner)
- Edge functions: `enterprise-invite-info`, `send-enterprise-invite`, `accept-enterprise-invite`, `manage-enterprise-invite`, `decline-enterprise-invite`

## Testes executados (Playwright, headless, viewport 1280×1800)

| # | Caso | Esperado | Observado | Status |
|---|---|---|---|---|
| T1 | `enterprise-invite-info` token desconhecido | 404 `invalid_token` | 404 `invalid_token` | ✅ |
| T2 | `enterprise-invite-info` sem token | 400 `token_required` | 400 `token_required` | ✅ |
| T3 | GET `/enterprise/convite/inexistente` | tela "Convite inválido" | tela renderizada | ✅ |
| T4 | Login RH owner | redir `/enterprise/rh/central-admin` | ok | ✅ |
| T5 | `send-enterprise-invite` e-mail inválido | 400 `invalid_email` | 400 `invalid_email` | ✅ |
| T6 | `send-enterprise-invite` válido | 200 com `invite_link` + `token` | 200, link retornado | ✅ |
| T7 | Segundo convite mesmo e-mail pendente | 409 `invite_already_pending` | 409 | ✅ |
| T8 | Aceite sem `accepted_privacy` | 400 `privacy_consent_required` | 400 | ✅ |
| T9 | Aceite com senha fraca `"123"` | 400 `weak_password` | ANTES: 200 (bug); DEPOIS: 400 `weak_password` | ✅ (corrigido) |
| T9b | Aceite senha só dígitos `"12345678"` | 400 `weak_password` | 400 `weak_password` | ✅ |
| T10 | Aceite válido (`Abcdefg1`) | 200, cria profile + role + consent, `licenses_used++` | 200, profile criado com role `employee` | ✅ |
| T11 | Reaceite do mesmo token | 409 `already_accepted` | 409 | ✅ |
| T12 | Aceite com token inexistente | 404 `invalid_token` | 404 | ✅ |
| T13 | Cancelar convite via `manage-enterprise-invite` | 200 `{ok:true}` | 200 | ✅ |
| T14 | Aceite após cancelamento | 410 `canceled` | 410 | ✅ |
| T15 | Login do novo usuário (sem `employee_profile`) | redir `/onboarding` | `/onboarding` (contexto limpo) | ✅ |
| T16 | Papel atribuído confere no DB | `role = employee`, `organization_id` correto | confirmado via SELECT | ✅ |

## Bugs encontrados

### BUG-B2-01 (HIGH) — `accept-enterprise-invite` aceitava senha fraca

- **Causa:** a edge function `accept-enterprise-invite` validava apenas `token` e `password` como presentes; qualquer string (ex.: `"123"`) era enviada direto para `admin.auth.admin.createUser` — e o Supabase, em ambiente sem policy adicional, aceitava. O front tinha validação, mas uma chamada direta bypassa.
- **Impacto:** qualquer convite ativo permitia criar conta com senha trivial via curl.
- **Correção:** adicionada validação server-side em `supabase/functions/accept-enterprise-invite/index.ts` — mínimo 8 caracteres, exigindo letra e número, além de checagem de `full_name` mínimo (3 chars) quando enviado. Retorna 400 `weak_password` / `invalid_full_name`.
- **Revalidação:** T9/T9b passaram a retornar 400; aceite com `Abcdef12` continua 200.

## Falso positivo

No primeiro passe, T16 (login do novo usuário) foi observado caindo em `/enterprise/rh/central-admin`. Causa: o contexto Playwright preservava a sessão do RH owner. Repetido em contexto limpo, redireciona corretamente para `/onboarding`. Nenhuma alteração de código necessária.

## Arquivos alterados

- `supabase/functions/accept-enterprise-invite/index.ts` — validação de senha e nome no servidor.

## Resumo

- Testes: 17
- Aprovados: 16
- Corrigidos: 1 (BUG-B2-01)
- Pendentes: 0
- Bloqueados: 0

Pronto para Bloco 3 (Onboarding IA + Perfil Inteligente).