# QA USER — Bloco 13 (Jornada + Módulos)

## Escopo
- `/enterprise/jornada` — `JourneyOverviewScreen`
- `/enterprise/modulos` — `ModulosScreen`

## Checks
- [OK] 1. Datas hardcoded removidas (08/04/2025, "35% da jornada", "100% da jornada").
- [OK] 2. Barra de progresso na visão da jornada zerada (era 35% fixo).
- [OK] 3. Cards de indicadores (Ansiedade 72→38, Autocontrole 45→72, etc) removidos → placeholder "em breve".
- [OK] 4. Etapas todas marcadas como `bloqueado` (sem status "concluído/atual" fake nem meta de data/progresso).
- [OK] 5. Módulos todos como `locked`, sem "18 min / 22 min / progress 100/45" hardcoded.
- [OK] 6. Card de estatísticas do curso (ProgressRing 35%, 2/8 módulos, 1h 05m, Nível 3) substituído por placeholder neutro.

## Bugs corrigidos
- BUG-B13-01 (Alta) JourneyOverview — Checkpoints, progress bar 35% e datas fake.
- BUG-B13-02 (Alta) JourneyOverview — Grid de 4 indicadores emocionais com barras Antes/Agora inventadas.
- BUG-B13-03 (Alta) JourneyOverview — Etapas com status/progresso/meta fake (Diagnóstico concluído 08/04/2025, Curso 1 atual 35%).
- BUG-B13-04 (Alta) ModulosScreen — Card de progresso (ring 35%, "2/8 módulos", "1h 05m", "Nível 3") 100% inventado.
- BUG-B13-05 (Alta) ModulosScreen — Status e progresso por módulo fake (mod1 done/100%, mod2 current/45%).
- BUG-B13-06 (Média) ModulosScreen — Duração ("18/22/20/24 min") hardcoded.

## Features registradas
- FEATURE-B13-01: agregação `journey_progress(user_id)` com `overall_pct`, `checkpoints[]`, `started_at`.
- FEATURE-B13-02: view `emotional_indicators_delta(user_id)` para preencher gráfico Antes/Agora (baseado em `emotional_checkins`).
- FEATURE-B13-03: `course_progress(user_id, course_id)` com `modules_done`, `modules_total`, `time_spent_seconds`, `level`.
- FEATURE-B13-04: `module_status(user_id, module_id)` → done/current/locked + progress; usar em Modulos e Etapas.
- FEATURE-B13-05: coluna `duration_minutes` em `course_modules` para popular a duração real.

## Arquivos alterados
- `src/components/JourneyOverviewScreen.tsx`
- `src/components/ModulosScreen.tsx`

## Status
Bloco 13 concluído — 6/6 checks OK, 6 bugs corrigidos, 5 features registradas.
Próximo: Bloco 14 = Prova Final + Resultado + Materiais + Mudança Jornada.
