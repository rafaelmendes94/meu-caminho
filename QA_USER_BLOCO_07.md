# QA USUÁRIO — Bloco 7: Cury Digital (IA conversacional)

**Escopo:** `/enterprise/cury-digital` (home), `/enterprise/cury-digital/chat` (chat).
**Modo:** Playwright headless, colaborador real, sem mocks. Verificação de console errors.

## Resumo
- Testes executados: **9**
- Aprovados: **9**
- Bugs corrigidos: **3** (todos "alta" — mocks/features fake)
- Pendentes: **1** (feature real de chat IA — não bloqueante, tela agora comunica honestamente estado)
- Bloqueados: 0

## Bugs corrigidos

| ID | Severidade | Descrição | Correção |
|---|---|---|---|
| **BUG-B7-01** | Alta (mock) | `EnterpriseCuryDigitalScreen` mostrava histórico com 2 conversas fake ("Pressão por entrega — Esta semana", "Mente acelerada à noite — Semana passada"). | `history` esvaziada; empty state honesto ("Nenhuma conversa registrada ainda"). |
| **BUG-B7-02** | Crítica (mock + feature fake) | `CuryDigitalChatScreen` renderizava mensagens fake do usuário e da IA hardcoded ("Sinto que minha mente não desacelera...", "Compreendo perfeitamente..."), com input funcionalmente inativo (`// handle send`) simulando chat funcional. | Mensagens fake removidas. Bloco central substituído por empty state "O Cury Digital está sendo preparado". `textarea`, botão de anexo e botão de enviar `disabled` com estilo apagado e legenda "A conversa com o Cury Digital será liberada em breve". Ações rápidas (respirar, reflexão) preservadas — todas são links reais. |
| **BUG-B7-03** | Alta (mock) | Sidebar desktop do chat exibia "Cury Digital · Agora · Pensamentos acelerados consomem..." + 3 "Sessão anterior — Como lidar com a pressão no trabalho?" fictícias. | Substituída por empty state "Nenhuma conversa ainda". |

## Casos de teste

| # | Cenário | Resultado |
|---|---|---|
| T1 | `GET /enterprise/cury-digital` como employee | ✅ Carrega, hero + CTAs |
| T2 | Cards de sugestão navegam para `/enterprise/cury-digital/chat` com `state.initialMessage` | ✅ (navegação funcional; state chega até o destino) |
| T3 | Ausência de "Pressão por entrega" e "Mente acelerada" no DOM | ✅ |
| T4 | Empty state "Nenhuma conversa registrada ainda" visível na sidebar de histórico | ✅ |
| T5 | `GET /enterprise/cury-digital/chat` | ✅ |
| T6 | Ausência das mensagens fake ("turbilhão", "Compreendo perfeitamente") | ✅ |
| T7 | Empty state "O Cury Digital está sendo preparado" + "A conversa com a IA será liberada em breve" | ✅ |
| T8 | `<textarea>` e botões `disabled` (usuário não consegue enviar mensagem inválida sem backend) | ✅ (`textarea.disabled === true`) |
| T9 | Sidebar desktop mostra apenas empty state, sem sessões fake | ✅ |

## Rotas testadas
`/enterprise/cury-digital`, `/enterprise/cury-digital/chat`.

## Tabelas / RPCs / Edge Functions
- Nenhuma. Verificado que **não existe** edge function de chat conectada (apenas `executive-ai` e `onboarding-chat`, escopos diferentes).

## Pendências não-bloqueantes
- **FEATURE-B7-01**: implementar edge function `cury-chat` (streaming AI SDK) + persistência em `executive_ai_conversations`/`executive_ai_messages` ou nova tabela `cury_conversations`. Fora do escopo de QA — requer aprovação de produto e nova conversa com o usuário sobre shape (thread única vs múltiplas, storage etc.).

## Arquivos alterados
- `src/components/EnterpriseCuryDigitalScreen.tsx` — histórico → empty state.
- `src/components/CuryDigitalChatScreen.tsx` — mensagens fake removidas; input desabilitado com aviso; sidebar sem sessões fake.

## Status do build
✅ Sem erros. Nenhum erro no console durante navegação.

## Status
Bloco 7 concluído — mocks removidos, telas comunicam honestamente o estado real. Pronto para **Bloco 8**.
