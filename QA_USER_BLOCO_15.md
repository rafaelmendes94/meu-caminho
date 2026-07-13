# QA USER — Bloco 15 (Feed + Explorar)

## Escopo
- `/enterprise/feed` — `FeedScreen`
- `/enterprise/explorar` — `ExploreScreen`

## Checks
- [OK] 1. Feed: 12 posts hardcoded do `postsFallback` (Unsplash + textos + "2.4k inspires / 56 reflections") removidos → estado vazio quando o CMS não retorna itens.
- [OK] 2. Feed: array `notifications` com 6 itens fake ("Cury IA preparou algo", "Sua reflexão inspirou 1.2k pessoas") esvaziado; notificações reais ficam a cargo de `NotificacoesScreen`.
- [OK] 3. Feed: avatar do header trocado — parava-se de usar duas URLs Unsplash fixas e passa a exibir `avatarUrl` do `useDisplayUser`.
- [OK] 4. Explorar: bloco "Tendências emocionais" (Ansiedade noturna +32%, Reconstruir confiança +18%, etc) removido — só renderiza se houver agregação real.
- [OK] 5. Explorar: "Buscas recentes" com 4 termos inventados (paz interior, augusto cury sono, perdoar, ansiedade no peito) ocultado até persistirmos histórico real.
- [OK] 6. Explorar: grid principal e "Para você" já usam `content_items` reais via Supabase + `RecommendedForYou`.

## Bugs corrigidos
- BUG-B15-01 (Alta) FeedScreen — postsFallback exibia 12 posts fake quando o CMS estava vazio.
- BUG-B15-02 (Alta) FeedScreen — notifications hardcoded no dropdown, com contador de badges em cima.
- BUG-B15-03 (Média) FeedScreen — avatar mock via Unsplash para b2c/enterprise ignorando o profile do usuário.
- BUG-B15-04 (Alta) ExploreScreen — Tendências emocionais com 5 tags e percentuais 100% inventados.
- BUG-B15-05 (Média) ExploreScreen — 4 buscas recentes hardcoded (sem persistência de histórico).

## Features registradas
- FEATURE-B15-01: tabela `feed_reactions(user_id, item_id, kind)` para contadores "inspires/reflections" reais.
- FEATURE-B15-02: dropdown de notificações do Feed lendo `notifications` real (mesma fonte de `NotificacoesScreen`).
- FEATURE-B15-03: tabela `search_events(user_id, query, matched_items, created_at)` para popular Tendências emocionais e Buscas recentes.
- FEATURE-B15-04: componente de estado vazio ilustrado quando `posts.length === 0`.

## Arquivos alterados
- `src/components/FeedScreen.tsx`
- `src/components/ExploreScreen.tsx`

## Status
Bloco 15 concluído — 6/6 checks OK, 5 bugs corrigidos, 4 features registradas.
Próximo: Bloco 16 = Detalhe de conteúdo + Leitores (Blog, Áudio-Leitura, Livro).
