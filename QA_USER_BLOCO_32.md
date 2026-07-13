# QA Bloco 32 — Players e Leitores (usuário)

## Escopo
Auditoria de mocks e conteúdo hardcoded em telas de reprodução (áudio, vídeo, podcast, livro, aula).

## Telas revisadas
1. **AudioPlayerScreen** — sem mocks; UI puramente presentacional. Consome parâmetros de rota (`slug`).
2. **AudioReadingScreen** — sem mocks; layout de leitura assistida por áudio, aguardando conteúdo via CMS.
3. **AudiobookScreen** — `chapters: [] = []` já vazio; card usa slug via query string.
4. **AulaPlayerScreen** — `sheetData` é config de UI (velocidade/legendas/áudio/PIP), não mock de dados; mantido.
5. **BookReaderScreen** — `BOOK` fallback com título `"Leitura indisponível"` já neutro.
6. **PodcastPlayerScreen** — `chapters: [] = []` e `related: [] = []` já vazios.
7. **VideoContentScreen** — sem mocks; consome slug da rota.

## Alterações
Nenhum patch necessário — todas as telas já estão com fallbacks vazios ou dependem de query params/CMS.

## Pendências (Features)
- **FEATURE-B32-01**: `AudioPlayerScreen` / `PodcastPlayerScreen` / `VideoContentScreen` — carregar metadata (título, autor, duração, URL de mídia) via `content_items` pelo slug.
- **FEATURE-B32-02**: `AudiobookScreen` — popular `chapters` a partir de `course_lessons` (ou nova tabela `audiobook_chapters`) e progresso via `content_views`.
- **FEATURE-B32-03**: `BookReaderScreen` — carregar capítulos e blocos de leitura via CMS (`content_items` type=book + storage de EPUB/HTML).
- **FEATURE-B32-04**: `AulaPlayerScreen` — persistir preferências (velocidade, idioma, legendas) por usuário e integrar tracks reais de vídeo (HLS/DASH).
- **FEATURE-B32-05**: `PodcastPlayerScreen` — carregar episódios/relacionados via `content_items` (type=podcast) e progresso por usuário.

## Status
Bloco 32 concluído. Pronto para o **Bloco 33**.