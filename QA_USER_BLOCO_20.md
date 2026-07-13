# QA Bloco 20 — Jornada · Trilhas · Cursos · Provas · Diagnósticos

## Status: 15/15 telas revisadas

### Correções (mocks removidos)
- **JourneyOverviewScreen.tsx** — Removido card editorial "A maior revolução acontece silenciosamente..." com foto de Augusto Cury; texto de compartilhamento genérico; import `curyImg` removido.
- **CursoDesbloqueadoScreen.tsx** — Card de citação Cury ("Grandes mudanças acontecem quando aprendemos a governar a mente." + foto) removido; import `cury` removido.
- **ProximaTrilhaScreen.tsx** — Array `insights` (3 frases hardcoded sobre clareza/desacelerar/relações) esvaziado; card Cury (citação + foto) removido; import `curyImg` removido.
- **MudancaJornadaScreen.tsx** — Card Cury ("A evolução emocional muda..." + foto) removido; import `curyImg` removido. Listas `before`/`now`/`miniCards` mantidas como copy educacional genérica da trilha.
- **ProvaFinalScreen.tsx** — Citação "O autoconhecimento é o início da liberdade emocional. — Augusto Cury" removida do rodapé de perguntas.
- **ResultadoProvaScreen.tsx** — Card Cury ("A mente que se conhece..." + foto) removido; grid ajustado para uma única coluna; import `cury` removido.
- **DiagnosticoFinalScreen.tsx** — Arrays `before` (4 métricas 78–82%), `now` (4 métricas 80–88%) e `insights` (3 frases) esvaziados; card Cury (citação + foto) removido; import `curyImg` removido.
- **TrilhaScreen.tsx, ModulosScreen.tsx, CursoScreen.tsx, MateriaisScreen.tsx, MudarTrilhaConfirmScreen.tsx, SugestaoTrilhaScreen.tsx, RespostaCriticaScreen.tsx, DiagnosticoScreen.tsx** — Revisadas; sem referências a Augusto Cury / Unsplash / mocks de dados reais (apenas copy estrutural genérica da UI da trilha).

### Pendências (features)
- FEATURE-B20-01 `journey_quotes(track_id)` — citação editorial dinâmica exibida no rodapé da Visão da Jornada / Curso Desbloqueado / Próxima Trilha / Mudança de Jornada / Prova Final / Resultado / Diagnóstico Final.
- FEATURE-B20-02 `track_insights(user_id, track_id)` — insights personalizados exibidos em "Por que essa trilha?" na próxima trilha e no diagnóstico final.
- FEATURE-B20-03 `diagnostic_comparison(user_id)` — pares Antes/Agora (dimensão + % + ícone) para o comparativo do Diagnóstico Final.
- FEATURE-B20-04 `journey_progress(user_id)` — checkpoints da timeline "Sua Jornada" com estado done/current/final e datas reais.
- FEATURE-B20-05 `exam_summary(user_id, exam_id)` — resumo e insights automáticos exibidos no Resultado da Prova.

**Próximo:** Bloco 21.