# QA Bloco 31 — Feeds, Explore e Library do usuário

## Escopo
Auditoria de branding "Cury" e mocks residuais em telas de descoberta de conteúdo.

## Telas revisadas
1. **FeedScreen** — white-label:
   - Filtro `"Cury IA"` renomeado para `"IA"` (rótulo do chip + chave em `filterMap` + `typeMeta.ia.label`).
   - `postsFallback` já vazio (feed usa `useCmsItems`).
2. **ThemedLibraryScreen** — white-label:
   - Bloco `"Recomendação Cury IA"` → `"Recomendação da IA"`.
   - Rota `/cury-digital/chat` mantida (renomeação global registrada em FEATURE-B27-02).
3. **VideoShortsScreen** — white-label:
   - Nome hardcoded `"Augusto Cury"` no autor do corte substituído por `v.creatorRole || "Criador"`.
   - Array `videos: Vid[] = []` já vazio; render nunca dispara antes da integração.
4. **ExploreScreen** — já carrega `content_items` via supabase; `TRENDING`/`RECENTS` vazios (aguardando agregação).
5. **SavedContentScreen / DownloadsScreen / ContinueWatchingScreen / NewReleaseScreen / FeedCategoriesScreen / BlogReadingScreen** — sem mocks residuais; empty states neutros já presentes.

## Alterações
- `src/components/FeedScreen.tsx`
- `src/components/ThemedLibraryScreen.tsx`
- `src/components/VideoShortsScreen.tsx`

## Pendências (Features)
- **FEATURE-B31-01**: `ExploreScreen` — popular `TRENDING`/`RECENTS` a partir de eventos agregados (`content_views`, `content_downloads`, `search_events`).
- **FEATURE-B31-02**: `SavedContentScreen`/`DownloadsScreen` — carregar itens reais de `content_downloads` + saved list por usuário.
- **FEATURE-B31-03**: `VideoShortsScreen` — integrar cortes reais de `content_items` (type=video, formato short) com autor/organização via `content_authors`.
- **FEATURE-B31-04**: `FeedCategoriesScreen` — carregar `moods`/tags reais de `content_tags` filtradas por organização.
- **FEATURE-B31-05**: Renomear rota `/cury-digital/chat` para `/ia/chat` no ThemedLibraryScreen (parte de FEATURE-B27-02).

## Status
Bloco 31 concluído. Pronto para o **Bloco 32**.