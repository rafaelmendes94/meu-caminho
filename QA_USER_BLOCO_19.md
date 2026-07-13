# QA Bloco 19 — Cury Digital · Progresso · Conquista · Evolução · Insights

## Status: 6/6 telas revisadas

### Correções (mocks removidos)
- **CuryDigitalHomeScreen.tsx** — `recents` (2 conversas fake) esvaziado; barra "Mente acelerada / 62% / Clareza emocional em evolução" zerada; card de citação Cury (`curyImg` + "Pensamentos acelerados silenciam emoções…") substituído por placeholder; import `curyImg` removido; seção "Conversas recentes" só renderiza quando houver dados.
- **HistoricoIAScreen.tsx** — `items` (4 conversas Ansiedade/Sono/Desacelerar/Relacionamentos) esvaziado; stats "12 conversas / 7 insights / +34% clareza" → "0/0/—"; card "Insight Cury" (citação + `curyImg`) removido; import `curyImg` removido.
- **ConquistaScreen.tsx** — `insights` (42 aulas/18h/12 práticas/…) esvaziado, seção só renderiza com dados; certificado "Junho de 2025" e "Nível 4 · Consciência Emocional" → "—"; card CURY com citação e `curyImg` removido; import `curyImg` removido.
- **EvolucaoPessoalScreen.tsx** — Card "Reflexão CURY" (`curyImg` + "A maturidade emocional nasce…") removido; import `curyImg` removido. Listas `before`/`now` mantidas como copy educacional genérica da jornada.
- **ProgressoScreen.tsx** — `emocoes` (4 emoções com pcts fake), `dayState`/`barVals` (semana falsa), `steps` (6 etapas hardcoded) esvaziados; Ring 35% → 0; contadores "12 dias / 6h 42m / 8 aulas" → "0"; card "12 dias seguidos", gráfico semanal e card CURY substituídos por estados vazios; import `curyImg` removido.
- **InsightsIAScreen.tsx** — `cards` (4 insights fake) e `points` (5 pontos evolução) esvaziados; "+34% clareza" → "—"; resumo da jornada fake removido; grade de insights e gráfico agora exibem estados vazios.

### Pendências (features)
- FEATURE-B19-01 `ai_conversations(user_id)` + `ai_conversation_messages` — feed de conversas recentes no Cury Digital Home e no Histórico.
- FEATURE-B19-02 `emotional_state(user_id)` — estado atual, clareza emocional (%) e diagnóstico "mente acelerada/calma".
- FEATURE-B19-03 `ai_quotes` / `daily_reflection(user_id)` — citação diária do mentor exibida no Home / cards de Insight.
- FEATURE-B19-04 `conversation_insights(conversation_id)` — resumo por conversa, estado emocional, flag "insight salvo".
- FEATURE-B19-05 `user_achievements(user_id, track_id)` — data de conclusão, nível emocional alcançado, badges do certificado.
- FEATURE-B19-06 `achievement_stats(user_id)` — aulas concluídas, horas dedicadas, práticas emocionais.
- FEATURE-B19-07 `progress_metrics(user_id)` — progresso geral (%), sequência (streak), horas dedicadas, aulas concluídas.
- FEATURE-B19-08 `emotional_evolution(user_id, dimension)` — Antes/Agora por pilar (ansiedade/clareza/autocontrole/relações) com pct.
- FEATURE-B19-09 `weekly_activity(user_id, day)` — presença + minutos por dia (gráfico semanal e Seu ritmo).
- FEATURE-B19-10 `journey_steps(user_id)` — etapas da trilha com status done/current/locked.
- FEATURE-B19-11 `ai_insight_patterns(user_id)` — padrões detectados (ex.: "desacelera à noite") e chips categorizados.
- FEATURE-B19-12 `emotional_trend_series(user_id)` — série temporal para o gráfico "Sua evolução emocional".

**Próximo:** Bloco 20.