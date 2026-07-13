# QA Bloco 17 — Biblioteca / Meus livros / Progresso / Player / Chapters / Lock / Unlock / New Release / Monthly / AudioReading

## Status: 9/9 telas revisadas

### Correções (mocks removidos)
- **MyReadingScreen.tsx** — `inProgress`, `lastChapters`, `quotes` esvaziados; card "Continuar" vira estado vazio; contadores 3/11/5h20m → dinâmicos ou "—"; contagens hardcoded ("11 trechos salvos", "7 notas", "12 dias") neutralizadas; seções condicionais.
- **ReadingProgressScreen.tsx** — `week`(bares fake), `finished`(3 livros Cury), `insights` esvaziados; ring 62% → 0%; "12 dias", "5h 20m", "118 min", "+24% vs anterior" neutralizados.
- **MonthlyBooksScreen.tsx** — `newBooks` (2 títulos Cury) esvaziado; badge "Maio · Ciclo 02" e "Junho · em 28 dias" removidos.
- **AudiobookScreen.tsx** — COVER Unsplash removido; `chapters` (6 fake) esvaziado; `t=11:08`, `playing=true` zerados; título "O território das emoções", autor/narrador "Bruno Magnata" removidos; citação Cury removida.
- **AudioReadingScreen.tsx** — títulos "A calma que transforma", autor Cury, dica do mentor, sidepanel jornada e transcrição fake substituídos por placeholders; progresso 36% → 0%; tempos 06:42/18:36 → 00:00/--:--.
- **BookChaptersScreen.tsx** — `chapters` (7 caps) esvaziado; card em leitura oculto se sem `current`; "11 reflexões" → "—"; título hero "O vendedor de sonhos" → "Sumário"; seção "Reflexões salvas" removida.
- **BookLockedScreen.tsx** — `NEXT` (3 títulos Cury + Unsplash) esvaziado; days=12→0; "27 mai 2026", "Ciclo 02", "3 de 7 livros" neutralizados; capa Unsplash e citação Cury removidos.
- **BookUnlockedScreen.tsx** — capa Unsplash, "Augusto Cury / O Vendedor de Sonhos", "Cap. 03", "3 de 7 livros", stats "5h 20m/12/+2" e citação neutralizados; barra jornada 43%→0%.
- **NewReleaseScreen.tsx** — capa "O vendedor de sonhos", meta "312 páginas · 5h 40m · 7 capítulos" e citação Cury neutralizados.

### Pendências (features)
- FEATURE-B17-01 `reading_progress(user_id, book_id)` + `reading_progress_chapter` para % por capítulo e histórico "últimos capítulos".
- FEATURE-B17-02 `reading_streaks(user_id)` — dias consecutivos, minutos por dia (chart semanal), delta semana anterior.
- FEATURE-B17-03 `saved_highlights(user_id, book_id, chapter_id, quote)` — frases salvas / reflexões.
- FEATURE-B17-04 `book_chapters(book_id)` — sumário real com duração, ordem, status.
- FEATURE-B17-05 `book_releases(book_id)` — programação de liberação (data, ciclo, dias restantes).
- FEATURE-B17-06 `user_subscription_progress(user_id)` — X de N livros desbloqueados.
- FEATURE-B17-07 `audiobook_chapters` + `audio_progress(user_id, audiobook_id)` — trilha, capítulos e posição atual.
- FEATURE-B17-08 `audio_content_metadata` — formato, nível, transcrição, dica do mentor.

**Próximo:** Bloco 18.
