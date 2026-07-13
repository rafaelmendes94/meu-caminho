# QA USER — BLOCO 09: Biblioteca (Clube do Livro)

**Data:** 13/07/2026 · **Usuário:** colaborador@teste.com.br · **Viewport:** 1280×1800 / 390×1800

## Escopo
- `/enterprise/biblioteca` (LibraryScreen — variante enterprise)
- Cards de livros vindos de `content_items` (CMS via `useCmsItems('book')`)
- Filtros por categoria (CMS) e busca
- Componente `RecommendedForYou`

## Bugs corrigidos

### BUG-B9-01 (Média) — Badge de notificação hardcoded "3"
O sino no header exibia sempre "3" pendências, independentemente do estado real de `notifications`. Enganava o usuário sobre alertas inexistentes.
**Correção:** removido o badge fixo; sino apenas abre `NotificationsSheet`, que já mostra contagem real via query. (Uma futura melhoria pode ler `unread_count` e re-adicionar o badge dinâmico.)

### BUG-B9-02 (Alta) — Progresso fake "0% concluído" em todo livro
`mapItem` fixa `progress: 0` para todo item CMS; ainda assim a barra e o texto "0% concluído" apareciam em todos os cards, sugerindo tracking de leitura inexistente.
**Correção:** removida barra e legenda de progresso; card mostra apenas duração quando disponível. Reintroduzir quando existir tabela `reading_progress`/`content_views` por usuário.

### BUG-B9-03 (Média) — CTA "Explorar livros" sem ação
Botão no HERO sem `onClick`/`Link` — clique não fazia nada.
**Correção:** botão removido. A grade "Sua Estante" logo abaixo já cumpre o papel de exploração.

### BUG-B9-04 (Média) — CTA "Acessar Novidades" sem ação
Botão no card "Destaques do Mês" também sem handler.
**Correção:** botão removido; card mantido como banner informativo até existir rota/filtro real de novidades.

## Validado sem bug
- Categorias e busca operam sobre dados reais do CMS (`useCmsCategories`, `useCmsItems`).
- Livros com `is_premium=true` mostram overlay de cadeado e redirecionam para a home enterprise (não abre leitor sem permissão).
- Empty states corretos ("Carregando…", busca sem resultado, biblioteca vazia).
- `NotificationsSheet` abre e fecha corretamente.
- `RecommendedForYou` mantém tratamento próprio.

## Pendências (fora do escopo)
- **FEATURE-B9-01:** tabela `reading_progress(user_id, content_item_id, percent, last_position)` + hook para reexibir barra de progresso real e integrar com "Continue sua jornada".
- **FEATURE-B9-02:** contagem real de notificações não-lidas no badge do sino (query em `notifications` por `user_id` + `read_at IS NULL`).
- **FEATURE-B9-03:** rota/filtro "Novidades do mês" (`published_at >= now() - 30d`) para reativar o CTA do banner.

## Resultado
**7/7 checks OK · 4 bugs corrigidos · 3 features registradas.** Bloco 9 concluído.