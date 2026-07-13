# QA USER — BLOCO 10: Curso (Detalhe + Módulos + Prova)

**Data:** 13/07/2026 · **Usuário:** colaborador@teste.com.br · **Viewport:** 1280×1800 / 390×1800

## Escopo
- `/enterprise/curso?slug=…` (CursoScreen)
- Card de stats (progresso, aulas, duração, nível)
- Lista de módulos (via `useCmsCourse`)
- CTA "Continuar/Iniciar curso"
- Card "Prova Final"

## Bugs corrigidos

### BUG-B10-01 (Alta) — Stats hardcoded (35% · 8 aulas · ~2h30m · Nível 3)
O card exibia progresso 35%, "8 aulas", "~2h30m" e "Nível 3 emocional" fixos, independente do curso carregado.
**Correção:** valores calculados a partir de `dbModules`:
- `totalLessons = Σ lessons.length`
- `totalMinutes = Σ duration_minutes` com formatação `Xh Ymin`
- `progressPct = 0` (não existe tabela de progresso por usuário ainda) — anel exibe 0% real
- Coluna "Nível emocional" removida (métrica fictícia sem fonte).
- Card só renderiza quando há curso CMS carregado.

### BUG-B10-02 (Alta) — Módulos mock (mod1/mod2/mod3) em fallback
Sem curso no CMS, a tela mostrava 3 módulos fictícios ("Entendendo sua mente", "Pensamentos acelerados", "Gestão da emoção") com status done/current/locked chumbados.
**Correção:** removido o fallback; quando `dbModules` está vazio, mostra empty state ("Este curso ainda não possui módulos publicados").

### BUG-B10-03 (Alta) — Prova Final com "3/8 aulas" e barra 35% fixas
Barra e contagem sempre mostravam 3/8 aulas concluídas.
**Correção:** progresso amarrado a `progressPct` (0%) e contagem em `0/{totalLessons}`; seção só aparece quando há curso CMS.

### BUG-B10-04 (Média) — CTA "Continuar curso" sempre no mesmo texto
Sem progresso, o botão dizia "Continuar" enganosamente.
**Correção:** texto dinâmico — "Iniciar curso" quando `progressPct === 0`, "Continuar curso" quando > 0. CTA também escondido quando não há curso CMS.

## Validado sem bug
- `courseTitle`, `courseDesc`, `courseLongDesc` vêm do CMS com fallback textual neutro no hero (aceitável como placeholder editorial).
- Navegação para `/enterprise/aula`, `/enterprise/modulos`, `/enterprise/prova-final` mantida via `useAudienceLink`.
- Status visual dos módulos (done/current/locked): primeiro módulo como "current", demais "locked" — comportamento coerente sem tabela de progresso.
- Ícone/lock overlays continuam consistentes.

## Pendências (fora do escopo)
- **FEATURE-B10-01:** tabela `lesson_progress(user_id, lesson_id, completed_at, seconds_watched)` + agregação para calcular `progressPct` real e status por módulo (done/current/locked dinâmicos).
- **FEATURE-B10-02:** desbloqueio automático de módulos conforme conclusão + trigger para atualizar `content_views`.
- **FEATURE-B10-03:** liberar/rotear prova final quando `progressPct === 100`.

## Resultado
**8/8 checks OK · 4 bugs corrigidos · 3 features registradas.** Bloco 10 concluído.