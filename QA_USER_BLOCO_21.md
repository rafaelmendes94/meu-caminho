# QA Bloco 21 — Feed, Explorar, Biblioteca, Salvos e Campanhas

## Status: 8/8 telas revisadas

### Correções (mocks removidos)
- **FeedScreen.tsx** — `FALLBACK_IMG` Unsplash trocado por string vazia; itens continuam vindo do CMS via `useCmsItems`.
- **FeedCategoriesScreen.tsx** — Array `categories` (7 territórios com imagens Unsplash) esvaziado; textos "Curados por Augusto Cury" e "curado por Cury" removidos; card "Insight" com citação atribuída ao Cury removido; renderização do hero/two-up/lista protegida por guard (`featured ?` / empty state).
- **ExploreScreen.tsx** — Sugestão automática `${q} de Augusto Cury` trocada por `${q} guiado`; atribuição "— Augusto Cury" removida dos cards de reflexão.
- **LibraryScreen.tsx** — Fallback Unsplash em `mapItem.bg` trocado por string vazia; avatares Unsplash do header substituídos por placeholder neutro; imagem hero Unsplash trocada por gradiente sólido; texto "Uma curadoria exclusiva de Augusto Cury" reduzido; card final "Insight Cury" (citação + atribuição) substituído por copy neutro; label "Augusto Cury" nas capas de livros trocada por "Clube do Livro".
- **ThemedLibraryScreen.tsx** — Atribuição "Augusto Cury" abaixo do pull-quote removida.
- **SavedContentScreen.tsx** — Array `ITEMS` (8 itens com Unsplash) esvaziado; `PLAYLISTS` (4 playlists mock) esvaziado; atribuição "— Augusto Cury" no card de citação substituída por `item.meta`; stats agora refletem `ITEMS.length` / `PLAYLISTS.length` reais.
- **CampaignsScreen.tsx** — `HERO` mock (Janeiro Branco), `CAMPAIGNS` (Setembro/Trabalho/Outubro) e `PAST` (3 movimentos) esvaziados; card "Manifesto — Augusto Cury" removido; hero e past campaigns protegidos por guard com estado vazio.
- **RecommendedForYou.tsx** — Já não continha mocks Unsplash/Cury (usa `cms-recommend` edge function).

### Pendências (features)
- FEATURE-B21-01 `marketing_campaigns` — CMS de campanhas sazonais (hero + próximas + arquivo) para popular `CampaignsScreen`.
- FEATURE-B21-02 `cms_categories` completo com imagem/tone/glow para `FeedCategoriesScreen` (7 territórios editoriais).
- FEATURE-B21-03 `user_bookmarks` / `user_saved_content` — itens guardados por usuário (áudio/vídeo/leitura/citação) em `SavedContentScreen`.
- FEATURE-B21-04 `user_playlists` — playlists emocionais criadas pelo usuário.
- FEATURE-B21-05 `search_trending` — agregação de eventos de busca para o bloco "Tendências emocionais" e "Buscas recentes" no `ExploreScreen`.
- FEATURE-B21-06 `editorial_quotes` — citações editoriais rotativas para o card final da Biblioteca / Themed Library.

**Próximo:** Bloco 22.