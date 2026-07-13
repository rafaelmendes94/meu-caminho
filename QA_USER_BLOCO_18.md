# QA Bloco 18 — Players e Consumo de Mídia

## Status: 7/7 telas revisadas

### Correções (mocks removidos)
- **AudioPlayerScreen.tsx** — `COVER` Unsplash → vazio; `t=2:14`, `playing=true`, `total=8:24` zerados; título "Aquiete a mente…" → "Áudio indisponível"; avatar/nome "Augusto Cury" e badge "ÁUDIO GUIADO" removidos; citação hardcoded removida.
- **AulaPlayerScreen.tsx** — Título "Curso 1 — Inteligência Emocional" → "Aula"; chip "Módulo 2" removido; título "Pensamentos acelerados" → "Aula em preparação"; descrição fake substituída por placeholder; card "Reflexão de Augusto Cury" (com `curyImg`) removido.
- **BlogReadingScreen.tsx** — Hero `blogHero`, badge "Desenvolvimento pessoal", título "O poder da mente focada…", avatar `augusto`, autor/data "20 de abril de 2024 • 6 min", blockquote Cury, corpo do artigo, chips ["Mentalidade", "Foco", …] e contadores "1.2k/128" removidos; conteúdo agora exibe placeholder neutro.
- **PodcastPlayerScreen.tsx** — `COVER` Unsplash → vazio; `chapters` (4 fake), `comments` (Marina/Rafael + avatars), `related` (3 eps) esvaziados; `total=18min`, `t=6:52`, `playing=true`, `activeChapter=2` zerados; título "Como desacelerar…", avatar/handle "@augustocury", "Ep. 12 · 18 min" e citação Cury removidos; seções ocultas quando vazias.
- **VideoContentScreen.tsx** — `topics` (4 itens), `metaData` (24 min/Intermediário/data), `SidePanelList` de aulas hardcoded e card "Material de Apoio · PDF 1.2 MB" removidos; thumb `videoThumb` → fundo neutro; barra de progresso 07:35/24:18/31% removida; título "Como controlar a ansiedade…" → "Vídeo em preparação"; autor "Augusto Cury / Psiquiatra e Escritor" removido.
- **VideoShortsScreen.tsx** — `SAMPLE_VIDEOS` (Google sample), `POSTERS` Unsplash e `REELS` (3 títulos + captions + "Augusto Cury / Verified") removidos; lista `videos` inicia vazia; scroller substituído por estado vazio "Nenhum corte disponível".
- **ContinueWatchingScreen.tsx** — `HERO` (curso Cury), `ITEMS` (5 fake com Unsplash) e `QUICK` (4 fake) esvaziados; hero card, CTA "Retomar jornada", seção "Recentes" e "Retomada rápida" só renderizam com dados reais; estado vazio inserido no lugar do hero.

### Pendências (features)
- FEATURE-B18-01 `audio_tracks` + `audio_progress(user_id, track_id, position_s)` — capa, autor, tempo total e retomada do player de áudio.
- FEATURE-B18-02 `audio_quotes(track_id)` — citação exibida sob o waveform.
- FEATURE-B18-03 `course_lessons` (título, descrição, duração, tópicos, transcrição) + `lesson_progress` para AulaPlayerScreen e VideoContentScreen.
- FEATURE-B18-04 `lesson_reflections(lesson_id, author)` — reflexão do mentor exibida na aula.
- FEATURE-B18-05 `articles(article_id)` + `article_blocks` + `article_reactions` — corpo, citações, tags, likes/comentários do BlogReadingScreen.
- FEATURE-B18-06 `podcast_episodes` + `podcast_chapters` + `podcast_comments` + `podcast_related` — capa, título, capítulos, comunidade e episódios relacionados.
- FEATURE-B18-07 `video_lessons` + `video_topics` + `video_support_materials` — thumbnail, tópicos e materiais de apoio (PDF).
- FEATURE-B18-08 `video_shorts(short_id, video_url, poster_url, creator_id)` + `short_reactions` — cortes verticais com contadores reais.
- FEATURE-B18-09 `playback_history(user_id, content_id, kind, progress, last_seen_at)` — feed "Continue de onde parou" e "Retomada rápida".

**Próximo:** Bloco 19.