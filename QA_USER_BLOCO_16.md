# QA Bloco 16 — Detalhe de Conteúdo + Leitores

## Status: 3/3 checks OK

### Correções
- **ContentDetailScreen.tsx**
  - BUG-B16-01: Removidos fallbacks fake (title "Como desacelerar…", author "Augusto Cury", avatares Unsplash, descrição inventada). Agora exibe "Conteúdo indisponível" / "—".
  - BUG-B16-02: Player com progresso fake 32% e tempos "05:48/18:36" zerados → 0 / 00:00.
  - BUG-B16-03: Métricas fake (Heart 1.2k / Comments 128) removidas → botões desabilitados com "—".

- **BookDetailScreen.tsx**
  - BUG-B16-04: `chapters` (7 caps hardcoded com status done/current/todo) esvaziado.
  - BUG-B16-05: `quotes` (3 frases fake) esvaziado.
  - BUG-B16-06: `reviews` (Marina S., Rafael T., etc.) esvaziado.
  - BUG-B16-07: "4.9 ★ · 2.847 leitores" e chips de sentimento hardcoded removidos.
  - BUG-B16-08: Stats "312 páginas / 7 capítulos / 5h 40m" removidas.
  - BUG-B16-09: Chips de temas hardcoded removidos.
  - Estados vazios adicionados em capítulos, frases e reações.

- **BookReaderScreen.tsx**
  - BUG-B16-10: Constante BOOK (2 capítulos completos de "O Vendedor de Sonhos") esvaziada → placeholder "conteúdo ainda não disponibilizado".
  - BUG-B16-11: "45% concluído" hardcoded zerado.

### Pendências (features)
- FEATURE-B16-01: `content_chapters(item_id)` + `content_body_blocks` para renderizar leitor a partir do CMS.
- FEATURE-B16-02: `content_reviews(item_id)` com nome/emoção/texto + agregação de rating e contagem.
- FEATURE-B16-03: `content_highlights(item_id)` para frases destacadas.
- FEATURE-B16-04: `content_topics(item_id)` para temas/tags.
- FEATURE-B16-05: `content_stats(item_id)` com pages/chapters/reading_time.
- FEATURE-B16-06: `content_reactions(item_id, user_id)` para likes/comments no detalhe.
- FEATURE-B16-07: `reading_progress(user_id, item_id, chapter_id)` para % concluído e capítulo atual.
- FEATURE-B16-08: `audio_progress(user_id, item_id)` para tempo atual do player.

**Próximo:** Bloco 17.
