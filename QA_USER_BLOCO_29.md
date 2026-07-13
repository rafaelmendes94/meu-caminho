# QA Bloco 29 — Benchmark, Journey Evolution e Departamento (detalhe)

## Escopo
Auditoria de mocks em telas de leitura comparativa e evolução da jornada organizacional.

## Telas revisadas
1. **EnterpriseBenchmarkScreen** — neutralizado:
   - `benchmarkData`, `strengths`, `opportunities`, `historyData` esvaziados; renderização passou a exibir empty states explicando que o comparativo só aparece com volume mínimo.
   - Score de maturidade fixo `74`, delta `+9% este mês` e frase "crescimento sustentável" substituídos por `maturityScore`/`maturityDeltaLabel` (nulos por padrão) e mensagem neutra.
   - Anel SVG e barras usam agora os valores dinâmicos (0% quando vazio).
2. **EnterpriseJourneyEvolutionScreen** — neutralizado:
   - `timelineData` (5 marcos fake), `indicators` (4 métricas fake 85/78/82/90) e `transformations` (4 cards) esvaziados; empty states substituem cada bloco.
   - Card lateral "Crescimento" perdeu a largura hardcoded 85% e o label `+12% vs mês anterior`, agora reflete `growthLabel` (nulo).
   - Aspa da "Leitura da IA" passou a usar `aiReading` (nulo), com fallback textual sem mock.
3. **EnterpriseDepartmentDetailScreen** — neutralizado:
   - Gráfico organic de tendência (4 semanas fake 3.5→2.9), badge "Queda gradual" e aspa "queda gradual há 3 semanas" removidos; substituídos por estado vazio (com aviso quando abaixo do volume mínimo).
   - Lista de "Fatores associados" (Pressão por entrega, Mente acelerada, Cansaço emocional, Baixa recuperação) neutralizada.
   - Bloco "Temas no Cury Digital" renomeado para "Temas na IA"; percentuais fake (38/27/21/14%) removidos.
   - "Ações recomendadas" (4 cards hardcoded) neutralizadas.

## Alterações
- `src/components/EnterpriseBenchmarkScreen.tsx`
- `src/components/EnterpriseJourneyEvolutionScreen.tsx`
- `src/components/EnterpriseDepartmentDetailScreen.tsx`

## Pendências (Features)
- **FEATURE-B29-01**: `EnterpriseBenchmarkScreen` — carregar `maturityScore`, delta e `historyData` de `organizational_scores`; comparativos por segmento a partir de agregados internos com volume mínimo.
- **FEATURE-B29-02**: `EnterpriseBenchmarkScreen` — gerar `strengths`/`opportunities` via IA a partir de DNA/insights/predictive_signals.
- **FEATURE-B29-03**: `EnterpriseJourneyEvolutionScreen` — carregar linha do tempo e métricas de evolução de `organizational_scores` + `impact_timelines`.
- **FEATURE-B29-04**: `EnterpriseJourneyEvolutionScreen` — `aiReading` gerado por `generate-weekly-insights` (ou nova função) sobre a curva histórica.
- **FEATURE-B29-05**: `EnterpriseDepartmentDetailScreen` — carregar tendência semanal, fatores associados e temas de IA agregados por `department_id` (respeitando volume mínimo).
- **FEATURE-B29-06**: `EnterpriseDepartmentDetailScreen` — gerar plano/ações recomendadas por departamento via `generate-action-plan`.

## Status
Bloco 29 concluído. Pronto para o **Bloco 30**.