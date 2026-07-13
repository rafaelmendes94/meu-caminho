# QA Bloco 25 — Enterprise RH Dashboards, Relatórios, Alertas e Mapa Emocional

## Status: 8/8 telas revisadas

### Correções (mocks removidos)
- **EnterpriseEmotionalMapScreen.tsx** — Arrays hardcoded esvaziados:
  - `emotionalAreas` (4 áreas Operações/Produto/Comercial/Atendimento com estados "Aceleração/Recuperação/Estabilidade/Oscilação" e intensidades 85/62/45/74%)
  - `states` (4 métricas 64%/71%/39%/52% para "Mente acelerada/Clareza/Equilíbrio/Recuperação")
  - `weeklyMovement` (5 dias com pressão Alta/Média/Baixa)
  - Insight IA hardcoded ("A recuperação emocional tende a crescer após redução de pressão operacional…") removido
  - "Leitura coletiva da IA" ("A organização apresenta sinais simultâneos…") substituída por copy neutra que sinaliza geração automática quando houver dados
  - Chips fixos (equilíbrio/clareza/energia/recuperação) removidos
  - Adicionados estados vazios ("Ainda não há dados agregados suficientes por área", "Estados predominantes ainda não disponíveis")
- **EnterpriseReportScreen.tsx** — Toda a página era mock estático. Correções:
  - Botão de período "Maio 2026" trocado por "Selecionar período"
  - Síntese do mês (parágrafo narrativo fixo) trocada por copy de geração automática
  - KPIs "+12% Clareza / 3,8/5 Equilíbrio / 87% Adesão / 2 Áreas atenção" → todos "—"
  - Gráfico de evolução semanal (Sem 1–4 com valores 3.4→3.8) removido, substituído por empty state
  - `ImpactRow`s "Antes/Depois" (58→70%, 31→39%, 55→48%) removidos com empty state
  - Lista "Principais temas emocionais" (Ansiedade 41%/Mente acelerada 29%/Cansaço 18%/Conflitos 12%) removida com empty state
  - "Áreas de atenção" fixas (Operações "Sobrecarga há 3 semanas", Atendimento, Produto) substituídas por empty state
  - 4 `RecommendationCard`s hardcoded substituídos por copy única de recomendações via IA
- **EnterpriseRHDashboardScreen.tsx** — Revisado; consome `organizational_scores`/`impact_measurements` via Supabase, sem mocks.
- **EnterpriseRHReportsScreen.tsx** — Revisado; sem mocks.
- **EnterpriseRHReportDetailScreen.tsx** — Revisado; sem mocks.
- **EnterpriseRHAccessScreen.tsx** — Revisado; sem mocks.
- **EnterpriseAlertsScreen.tsx** — Revisado; consome `alerts` + `predictive_signals` via Supabase com realtime, sem mocks.
- **EnterpriseNotificationsScreen.tsx** — Revisado; lista de tipos de notificação (Check-in Semanal / Pausa Consciente / Conteúdo Recomendado) mantida por ser configuração de produto, não mock de dados.

### Pendências (features)
- FEATURE-B25-01 `get_emotional_map` — expandir RPC para retornar também estados predominantes agregados, movimento semanal e detalhamento por área/departamento (hoje só devolve `weeks`).
- FEATURE-B25-02 `executive_report` — endpoint/RPC que gere o relatório executivo do período selecionado (síntese, KPIs, evolução semanal, impacto antes/depois, temas, áreas em atenção, recomendações via IA).
- FEATURE-B25-03 seletor de período em `EnterpriseReportScreen` — filtro por mês/trimestre plugado no backend.
- FEATURE-B25-04 exportação real do relatório (`handleExport`) — gerar PDF/CSV via edge function em vez de apenas exibir toast.

**Próximo:** Bloco 26.