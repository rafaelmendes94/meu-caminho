# QA USER 02 — Onboarding IA e Perfil Inteligente

Data: 2026-07-10
Escopo: fluxo `/onboarding` do colaborador (entrevista conversacional → geração do Perfil Inteligente → liberação de `/enterprise`).
Sem mocks. Sem alterações em Super Admin. Empresa/RH tocada só para consertar violação de privacidade.

## Bugs encontrados e corrigidos

| ID | Severidade | Descrição | Correção |
|---|---|---|---|
| **BUG-U06** | **CRÍTICO (Privacidade)** | RLS `employee_profiles_rh_read_same_org` permitia owner/rh_admin fazer `SELECT` na linha bruta de `employee_profiles`, expondo campos sensíveis (`profile_energy.drainers`, `profile_engagement.risk_signals`, `profile_leadership.style`, etc.). Violava a promessa da UI ("não serão exibidas individualmente ao RH"). | Política removida. A view segura `employee_profiles_rh_view` foi alterada para `security_invoker = false` (definer), continua filtrando por `has_any_role + current_organization_id` e projeta apenas campos agregados (`is_leader`, `communication_style`, `energy_baseline`, `engagement_level`). Documentado no `@security-memory` para não regredir. |
| **BUG-U07** | Alto | Ao recarregar `/onboarding`, o `interviewId` era perdido e a UI voltava para a mensagem inicial; qualquer nova mensagem criava uma segunda entrevista órfã. "Sair e voltar" e "retomar entrevista" falhavam. | `OnboardingChatScreen` agora carrega, no mount, a última entrevista não concluída do usuário e suas mensagens em ordem (`onboarding_messages` por `created_at`), populando `messages`, `interviewId` e `userTurns`. |
| **BUG-U08** | Médio | Se a IA falhava (429/500/vazio), a mensagem do usuário permanecia visível na conversa e o input ficava vazio — o usuário perdia o que havia escrito e a UX sugeria que a mensagem foi processada. | Em caso de erro, a última bolha do usuário é removida e o texto volta para o `input`. Mensagens de erro traduzidas por código (`rate_limited`, `credits_exhausted`, `ai_error`, `empty_ai_response`, `unauthorized`). |
| **BUG-U09** | Baixo | Resposta assistente vazia era renderizada como bolha em branco. | Verificação de `assistant.trim().length > 0`; caso contrário emite `empty_ai_response` e ativa o fluxo de retry acima. |

## 1. Início `/onboarding`

| Caso | Resultado |
|---|---|
| Abrir `/onboarding` | ✅ carrega spinner curto, depois hidrata |
| Carregar entrevista existente | ✅ corrigido (BUG-U07) |
| Criar nova entrevista quando não há pendente | ✅ mostra `INITIAL_ASSISTANT`, cria no primeiro `send` |
| Loading | ✅ spinner + botão "Enviar" desabilitado |
| Erro no carregamento | ✅ tela dedicada com botão "Tentar novamente" |
| Empty state indevido | ✅ eliminado (sempre há a mensagem inicial da IA) |

## 2. Conversa

| Caso | Resultado |
|---|---|
| Enviar mensagem | ✅ |
| Impedir mensagem vazia | ✅ botão disabled + `trim()` guard |
| Mostrar mensagem do usuário | ✅ bolha laranja imediata |
| Indicador de digitação | ✅ "Pensando…" enquanto `sending` |
| Chamar `onboarding-chat` | ✅ com `interview_id + message + finish` |
| Receber resposta IA | ✅ |
| Salvar mensagem (usuário e assistente) | ✅ persistência em `onboarding_messages` pela edge function |
| Manter ordem / horário | ✅ ordenado por `created_at asc` |
| Evitar duplicidade | ✅ append-only + reload por `interview_id` |
| Atualizar página / histórico permanece | ✅ corrigido (BUG-U07) |
| Sair e voltar | ✅ retoma automaticamente a entrevista não concluída |
| Retomar entrevista | ✅ idem |

## 3. Erros IA

| Caso | Resultado |
|---|---|
| Timeout / edge function indisponível | ✅ erro amigável + mensagem preservada |
| Resposta vazia | ✅ `empty_ai_response` (BUG-U09) |
| JSON inválido (na geração do perfil) | ✅ `generate-employee-profile` já valida com `extractJson` e retorna `invalid_ai_json` |
| 429 (rate limit) | ✅ mensagem "Muitas mensagens em pouco tempo…" |
| 402 (créditos) | ✅ mensagem "Cota de IA temporariamente indisponível…" |
| 500 (ai_error) | ✅ mensagem "A IA não conseguiu responder agora." |
| Retry | ✅ input é repopulado e usuário só clica Enviar de novo |
| Não perder histórico | ✅ estado local + carregamento por reload garantem isso |

## 4. Conclusão

| Caso | Resultado |
|---|---|
| Detectar entrevista pronta para finalizar | ✅ `canFinish = userTurns >= 4` libera o CTA |
| Chamar `generate-employee-profile` | ✅ |
| Gerar 6 dimensões (professional, development, leadership, communication, energy, engagement) | ✅ prompt força JSON com esses 6 blocos |
| Salvar `employee_profile` | ✅ upsert por `user_id` com incremento de `version` |
| Marcar onboarding como `completed` | ✅ `onboarding_interviews.status = 'completed', completed_at = now()` |
| Redirecionar `/onboarding/concluido` | ✅ `navigate(..., { replace: true })` |
| Liberar `/enterprise` | ✅ `useAuth.refresh()` atualiza `hasEmployeeProfile`, `ProtectedRoute` deixa passar sem `/onboarding` |

## 5. Privacidade

| Requisito | Resultado |
|---|---|
| RH não lê mensagens (`onboarding_messages`) | ✅ RLS só permite `user_id = auth.uid()` |
| RH não lê respostas individuais (`onboarding_interviews`) | ✅ mesma regra |
| RH não lê `employee_profile` sensível | ✅ **corrigido (BUG-U06)** — política de leitura RH removida |
| Apenas visão segura agregada | ✅ `employee_profiles_rh_view` como definer view, filtro interno por org+role, projeção reduzida |
| RLS bloqueia acesso indevido | ✅ verificado via `pg_policies` |

## 6. Resumo

- **Testes executados:** 38
- **Aprovados sem alteração:** 34
- **Corrigidos nesta fase:** 4 (BUG-U06..U09)
- **Pendentes:** 0
- **Bloqueados:** 0
- **Bugs críticos:** 1 (fechado — privacidade)
- **Bugs altos:** 1 (fechado)
- **Bugs médios:** 1 (fechado)
- **Bugs baixos:** 1 (fechado)

### Arquivos alterados

- `src/pages/OnboardingChatScreen.tsx` — carrega entrevista existente + histórico; trata erros IA sem perder mensagem do usuário; valida resposta vazia; traduz códigos de erro.
- `supabase/migrations/…_privacy_employee_profiles.sql` — remove política RH em `employee_profiles`; converte a view RH para definer semantics.
- `@security-memory` — registra o linter finding `0010_security_definer_view` como intencional e privacy-critical.

---

**QA USER 02 CONCLUÍDO**