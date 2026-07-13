# QA USER — BLOCO 11: Player de Aula

**Data:** 13/07/2026 · **Usuário:** colaborador@teste.com.br · **Viewport:** 1280×1800 / 390×1800

## Escopo
- `/enterprise/aula` (AulaPlayerScreen)
- Hero de vídeo + timeline
- Card "Seu progresso nesta aula"
- Seção "Próxima aula"
- Quick actions (velocidade, áudio, legendas, materiais, tela cheia)

## Estado do backend
Não existe integração de player de vídeo real, tabela `lesson_progress` nem link com `course_lessons` por ID nesta tela. Qualquer tempo/progresso exibido seria fictício.

## Bugs corrigidos

### BUG-B11-01 (Alta) — Timeline com "04:32 / 22:00" fake
O player mostrava tempo atual 04:32 e duração 22:00 fixos, sem vídeo carregado.
**Correção:** timeline oculta enquanto não há player real conectado. Play button desabilitado com badge "Prévia" e tooltip "Player em produção — vídeo será liberado em breve".

### BUG-B11-02 (Alta) — Card "Seu progresso nesta aula · 20% concluído"
Card mostrava 20%, barra preenchida e contador 04:32/22:00 — todos hardcoded.
**Correção:** seção removida até haver tabela `lesson_progress`.

### BUG-B11-03 (Alta) — Seção "Próxima aula: Respiração e clareza mental"
Card sugeria próxima aula fictícia com thumbnail e duração 18:00, navegando para `/aula?next=respiracao` (sem efeito real).
**Correção:** seção removida. Voltar para a trilha do curso é a rota legítima.

### BUG-B11-04 (Média) — "22 min" e "Aula em progresso" hardcoded no cabeçalho
Metadados da aula sempre exibiam mesma duração e status.
**Correção:** trocado por "Duração a definir" enquanto não há lesson_id + `duration_minutes` do CMS. Status "Aula em progresso" removido.

## Validado sem bug
- Botão de favoritar (⭐/salvar) é local (useState) e não fabrica dado — comportamento honesto de UI-only.
- Menus de velocidade/áudio/legendas/tela cheia atualizam estado local (`picks`) sem prometer efeito real; aceitável como preferência UI enquanto o player não existe.
- Link "Materiais" navega para `/enterprise/materiais` (rota existente).
- Reflexão de Augusto Cury: texto editorial estático, aceitável como copy de brand (não é métrica).

## Pendências (fora do escopo)
- **FEATURE-B11-01:** integrar player de vídeo real (Mux/Cloudflare Stream/HLS) lendo `lesson_id` da querystring e `course_lessons.video_url`.
- **FEATURE-B11-02:** tabela `lesson_progress(user_id, lesson_id, seconds_watched, completed_at)` + hook para recalcular barra, "Continuar" e status por módulo.
- **FEATURE-B11-03:** hook `useNextLesson(courseId, currentLessonId)` para restaurar a seção "Próxima aula" com dado real.
- **FEATURE-B11-04:** aplicar de fato as escolhas de velocidade/áudio/legendas no elemento `<video>`.

## Resultado
**6/6 checks OK · 4 bugs corrigidos · 4 features registradas.** Bloco 11 concluído.