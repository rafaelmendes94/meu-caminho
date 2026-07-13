# QA Bloco 27 — Canal RH, Conquista e IA

## Escopo
Auditoria de mocks nas telas de Canal Direto RH (SOS-RH), Conquista e fluxo de IA (Cury Digital → Conversa com IA).

## Telas revisadas
1. **CanalDiretoRHScreen** — sem mocks. Motivos são categorias fixas do fluxo (não pessoais). Backend integrado.
2. **CanalDiretoMensagemScreen** — sem mocks. Formulário limpo, insert em `reports` via Supabase com protocolo gerado por RPC.
3. **CanalDiretoConfirmacaoScreen** — sem mocks. Protocolo e flag de anonimato vêm do state.
4. **ConquistaScreen** — removida assinatura hardcoded "Augusto Cury" no certificado (mantido placeholder "ASSINATURA DO MENTOR"). Nome da trilha concluída ("Inteligência Emocional") substituído por "—" aguardando dado dinâmico. `insights` e `journey` mantidos como estrutura visual, sem PII.
5. **CuryDigitalChatScreen** — branding "Cury Digital" trocado por "Conversa com IA" / "IA" em todos os labels (header, título do layout, sidebar, empty state, hint do input). Empty state e chat de recente já vazios.
6. **CuryDigitalHomeScreen** — branding "Cury Digital" trocado por "Conversa com IA" / "IA". Sugestões rápidas (categorias de sentimento) mantidas — são atalhos genéricos, não mocks pessoais.
7. **HistoricoIAScreen** — sem mocks (`items` vazio, filtros são categorias fixas, header "Histórico emocional").
8. **InsightsIAScreen** — sem mocks (`cards` e `points` vazios, estado neutro exibido).

## Alterações neste bloco
- `src/components/ConquistaScreen.tsx`: nome de trilha e assinatura de mentor removidos/neutralizados.
- `src/components/CuryDigitalChatScreen.tsx`: todas as menções "Cury Digital" → "Conversa com IA" / "IA".
- `src/components/CuryDigitalHomeScreen.tsx`: idem.

## Pendências (Features)
- **FEATURE-B27-01**: `ConquistaScreen` deve receber nome da trilha, data, nível emocional final e URL/nome do mentor (assinatura) do backend (ex.: `user_journey_completions` + `content_authors`).
- **FEATURE-B27-02**: Renomear rota `/cury-digital` para `/ia` (ou similar white-label) — pendência de refatoração cross-app.
- **FEATURE-B27-03**: `CuryDigitalHomeScreen` deve carregar "Seu estado atual" e "Reflexão do dia" de agregados reais (checkins + IA gateway).
- **FEATURE-B27-04**: `HistoricoIAScreen` e `InsightsIAScreen` devem consumir `executive_ai_conversations` / `weekly_ai_insights` para popular listas e gráfico.
- **FEATURE-B27-05**: `ConquistaScreen` — permitir configurar por organização o rótulo do mentor (white-label).

## Status
Bloco 27 concluído. Pronto para prosseguir com o **Bloco 28**.