# QA USER — Bloco 3: Onboarding IA + Perfil Inteligente (revalidação)

Data: 2026-07-13
Escopo: revalidação do fluxo `/onboarding` (chat conversacional → `generate-employee-profile` → `/onboarding/concluido`) após os fixes registrados em `QA_USER_02.md`.

## Metodologia

- Playwright headless (1280×1800), usuário `colaborador@teste.com.br` (role `employee`, org "Empresa Teste").
- Sem mocks; chamadas reais ao Lovable AI Gateway (`google/gemini-2.5-flash` para o chat, `google/gemini-2.5-pro` para o perfil).
- Verificação de RLS via `pg_policies` na tabela `employee_profiles`.

## Testes executados

| # | Cenário | Resultado |
|---|---------|-----------|
| T1 | Abrir `/onboarding` sem entrevista prévia | ✅ hidrata, exibe `INITIAL_ASSISTANT`, input habilitado |
| T2 | Enviar 1ª mensagem → cria entrevista + resposta IA | ✅ `POST onboarding-chat 200`, 3 bolhas (initial + user + assistant) |
| T3 | Reload da rota `/onboarding` mantém histórico (regressão BUG-U07) | ✅ carrega `onboarding_interviews` não-concluída + `onboarding_messages` em ordem |
| T4 | Loading state visível ("Pensando…") | ✅ enquanto `sending=true` |
| T5 | Enviar 4 mensagens até liberar CTA "Gerar meu Perfil Inteligente" | ✅ `canFinish = userTurns >= 4` habilita botão |
| T6 | Clicar em "Gerar meu Perfil Inteligente" → `generate-employee-profile` | ✅ `POST 200`, cria linha em `employee_profiles`, marca entrevista `completed` |
| T7 | Redirecionamento pós-geração | ✅ `navigate("/onboarding/concluido", { replace: true })` |
| T8 | `useAuth.refresh()` libera `/enterprise` | ✅ `hasEmployeeProfile=true`, ProtectedRoute deixa passar |
| T9 | RH/owner não pode `SELECT` linha bruta de `employee_profiles` (regressão BUG-U06) | ✅ `pg_policies` mostra apenas `own profile select/insert/update` para `authenticated` + bloqueio total para `anon`. Não existe política de leitura RH. |
| T10 | View agregada `employee_profiles_rh_view` continua definer + filtrada por org/role | ✅ (verificada em QA_USER_02) |

## Bugs encontrados nesta rodada

Nenhum. Todos os fixes registrados em `QA_USER_02.md` (BUG-U06..U09) permanecem estáveis.

## Rotas / Edge Functions tocadas

- Rota: `/onboarding`, `/onboarding/concluido`.
- Edge Functions: `onboarding-chat` (chat), `generate-employee-profile` (perfil).
- Tabelas: `onboarding_interviews`, `onboarding_messages`, `employee_profiles`.

## Resumo

- Testes executados: 10
- Aprovados: 10
- Corrigidos nesta fase: 0
- Pendentes: 0
- Bloqueados: 0
- Bugs críticos/altos/médios/baixos: 0

**Bloco 3 CONCLUÍDO** — nada a corrigir. Pronto para Bloco 4 (Home + Menu/Navegação + Notificações).