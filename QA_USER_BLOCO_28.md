# QA Bloco 28 — RH Dashboard, Canal Direto e Liderança

## Escopo
Auditoria de mocks nas telas do módulo RH: Dashboard, Acesso, Canal Direto (lista/detalhe) e Liderança (visão, saúde, comunicados).

## Telas revisadas
1. **EnterpriseRHAccessScreen** — sem mocks. Apenas grid de acesso a módulos.
2. **EnterpriseRHNavigation** — layout compartilhado, sem dados.
3. **EnterpriseRHDashboardScreen** — removidos blocos hardcoded:
   - "Temperamento do time" (4 barras fixas: Mente acelerada 64%, Sobrecarga 48%, Clareza 71%, Equilíbrio 39%) → substituído por estado vazio explicando amostra mínima.
   - "O que o time mais perguntou à IA" (4 tópicos hardcoded com percentuais) → estado vazio agregado.
   - "Recorte por área" (Comercial/Operações/Produto com valores fixos) → estado vazio de volume mínimo.
   - "Decisões sugeridas" (3 recomendações hardcoded) → estado vazio aguardando IA.
   - KPIs superiores, Score, Alertas, DNA, Insights, Impacto e Rituais já vinham de RPC/backend.
4. **EnterpriseRHReportsScreen** — sem mocks. Já integrado a `reports` via Supabase + realtime.
5. **EnterpriseRHReportDetailScreen** — sem mocks. Já integrado a `reports` + `report_messages`.
6. **EnterpriseLeadershipOverviewScreen** — todas as listas hardcoded neutralizadas:
   - KPIs (Maturidade 74, Adesão 87%, -18% sobrecarga, +12% clareza) → "—".
   - `impacts`, `attentionAreas`, `evolutionSteps`, `indicators` esvaziados com fallback empty state.
   - Resumo estratégico (aspa hardcoded sobre pressão operacional) → estado vazio.
7. **EnterpriseLeadershipHealthScreen** — neutralizado:
   - KPIs (68%/41%/74%/+9%) → "—".
   - Leitura coletiva, sinais observados, indicadores (60→80%), fatores e movimentos sugeridos → estados vazios.
8. **EnterpriseLeadershipMessageScreen** — neutralizado:
   - `recentMessages` (3 comunicados fake) e `cultureQuotes` (4 frases hardcoded) esvaziados.
   - Comunicado em destaque hardcoded ("Pausas também fazem parte da performance", "Hoje 10:30") → estado vazio orientando a criar o primeiro.
   - Formulário de criação mantido (envio ainda toast-only, sem persistência).

## Alterações neste bloco
- `src/components/EnterpriseRHDashboardScreen.tsx`
- `src/components/EnterpriseLeadershipOverviewScreen.tsx`
- `src/components/EnterpriseLeadershipHealthScreen.tsx`
- `src/components/EnterpriseLeadershipMessageScreen.tsx`

## Pendências (Features)
- **FEATURE-B28-01**: `EnterpriseRHDashboardScreen` — carregar "Temperamento do time" a partir de agregados de `emotional_checkins`/`pulse_responses` respeitando volume mínimo.
- **FEATURE-B28-02**: `EnterpriseRHDashboardScreen` — carregar "O que o time mais perguntou à IA" a partir de agregação de temas em `executive_ai_conversations`/`executive_ai_messages` (sem exposição de conversas individuais).
- **FEATURE-B28-03**: `EnterpriseRHDashboardScreen` — carregar "Recorte por área" a partir de `departments` + agregados anonimizados (volume mínimo por área).
- **FEATURE-B28-04**: `EnterpriseRHDashboardScreen` — gerar "Decisões sugeridas" via IA (weekly_ai_insights ou função dedicada) com base em DNA/alertas/impacto.
- **FEATURE-B28-05**: `EnterpriseLeadershipOverviewScreen` — carregar KPIs, impactos, áreas de atenção, evolução e indicadores de `organizational_scores` + `impact_measurements` + `predictive_signals`.
- **FEATURE-B28-06**: `EnterpriseLeadershipOverviewScreen` — gerar "Resumo estratégico" com IA a partir dos agregados da organização.
- **FEATURE-B28-07**: `EnterpriseLeadershipHealthScreen` — carregar indicadores exclusivos de lideranças (subset de `employee_profiles` com role liderança) respeitando anonimização e amostra mínima.
- **FEATURE-B28-08**: `EnterpriseLeadershipMessageScreen` — persistir comunicados em nova tabela `leadership_messages` (com audiência/tom/autor) e listar mensagens recentes reais.
- **FEATURE-B28-09**: `EnterpriseLeadershipMessageScreen` — configuração organizacional de "frases que fortalecem cultura" (banco editorial por organização).

## Status
Bloco 28 concluído. Pronto para prosseguir com o **Bloco 29**.