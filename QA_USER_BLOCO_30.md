# QA Bloco 30 — Check-in Result e Cury Digital (usuário Enterprise)

## Escopo
Auditoria de branding hardcoded e mocks residuais nas telas de resultado do check-in e no hub de IA do usuário Enterprise.

## Telas revisadas
1. **EnterpriseCheckinResultScreen** — neutralizado:
   - `author: "Dr. Augusto Cury"` (dois pontos) substituído por rótulo neutro `"REFLEXÃO"`.
   - Textos de reflexão por dimensão mantidos como fallback estático (curados, sem PII), aguardando geração por IA.
   - Demais métricas já derivadas de `emotional_checkins`.
2. **EnterpriseCuryDigitalScreen** — neutralizado (white-label):
   - Título do layout `"Cury Digital IA"` → `"Conversa com IA"`.
   - Hero `"Cury Digital IA"` → `"Conversa com IA"`.
   - Copy `"...inspirado no método do Dr. Augusto Cury, disponível 24h..."` substituída por `"Um espaço confidencial para organizar pensamentos e receber apoio emocional a qualquer momento."`.
   - CTA `"Falar com Cury IA"` → `"Iniciar conversa"`.
   - Card de status `"Método: Dr. Augusto Cury"` → `"Suporte: Assistente IA"`.
   - `suggestions` mantidas (temas genéricos, sem PII); `history` já vazio por padrão aguardando integração.
3. **EnterpriseCapacityPulseScreen** — já dinâmico (via `get_capacity_pulse` + `pulse_responses`), sem mock.
4. **EnterpriseAlertsScreen** / **EnterpriseAuditLogsScreen** — já dinâmicos (supabase). Nada a alterar.
5. **EnterpriseCheckinIntroScreen** / **EnterpriseCheckinScreen** — sem mocks residuais.

## Alterações
- `src/components/EnterpriseCheckinResultScreen.tsx`
- `src/components/EnterpriseCuryDigitalScreen.tsx`

## Pendências (Features)
- **FEATURE-B30-01**: `EnterpriseCheckinResultScreen` — gerar `reflection.text` via `executive-ai` (ou nova função) considerando série histórica do usuário, com fallback para os textos curados atuais.
- **FEATURE-B30-02**: `EnterpriseCheckinResultScreen` — permitir por organização configurar autor/atribuição da reflexão (rótulo, imagem opcional) sem hardcode.
- **FEATURE-B30-03**: `EnterpriseCuryDigitalScreen` — carregar `history` real de `executive_ai_conversations` filtradas por usuário + organização.
- **FEATURE-B30-04**: `EnterpriseCuryDigitalScreen` — sugestões dinâmicas por organização (tabela `ai_suggested_prompts` ou org_settings), respeitando white-label.
- **FEATURE-B30-05**: Renomear rota `/enterprise/cury-digital` para `/enterprise/ia` (white-label consistente com Bloco 27).

## Status
Bloco 30 concluído. Pronto para o **Bloco 31**.