# QA Bloco 26 — Livros, Áudios e Leitura

## Escopo
Auditoria e limpeza de mocks nas telas de leitura de livros, audiolivros, blog e progresso.

## Telas revisadas
1. **BookDetailScreen** — removida citação hardcoded "Os sonhos são a única coisa..." atribuída a Augusto Cury. Restante já usa `useCmsItemBySlug` corretamente.
2. **BookChaptersScreen** — já sem mocks (arrays vazios, estados neutros).
3. **BookLockedScreen** — já sem mocks (countdown zerado, próximos livros vazios).
4. **BookUnlockedScreen** — já sem mocks (stats "—", jornada sem passos concluídos).
5. **BookReaderScreen** — já sem mocks (BOOK vazio, estado de indisponibilidade).
6. **AudiobookScreen** — já sem mocks (capítulos vazios, sem citação).
7. **AudioPlayerScreen** — já sem mocks (sem trilha, tempo zerado, citação removida).
8. **AudioReadingScreen** — já sem mocks (título/descrição/metadata neutros).
9. **BlogReadingScreen** — já sem mocks (título e corpo em preparação).
10. **MonthlyBooksScreen** — removida "Augusto Cury" como marca d'água da capa (agora usa `b.a` do CMS) e removida citação atribuída no rodapé.
11. **MyReadingScreen** — já sem mocks (`inProgress`, `lastChapters`, `quotes` vazios).
12. **NewReleaseScreen** — já sem mocks (meta com traços, citação removida).
13. **ReadingProgressScreen** — já sem mocks (semana zerada, `finished`/`insights` vazios). Frase inspiracional genérica (sem atribuição) mantida.

## Alterações neste bloco
- `src/components/BookDetailScreen.tsx`: bloco de citação atribuída a Augusto Cury removido; comentário indica carga futura via CMS.
- `src/components/MonthlyBooksScreen.tsx`:
  - marca d'água da capa passa a usar o campo `a` do item (autor) com fallback "—".
  - bloco de citação atribuída a Augusto Cury removido.

## Pendências (Features)
- **FEATURE-B26-01**: `BookDetailScreen` deve carregar citação em destaque do CMS (`content_items.highlight_quote` + `quote_author`) quando disponível.
- **FEATURE-B26-02**: `MonthlyBooksScreen` deve ser alimentado pelo CMS (livros do mês por trilha/perfil), incluindo autor real, capa, páginas e duração.
- **FEATURE-B26-03**: `AudiobookScreen` / `AudioPlayerScreen` precisam de player conectado a `content_items` do tipo áudio (URL, duração, capítulos, progresso do usuário).
- **FEATURE-B26-04**: `ReadingProgressScreen` deve consumir agregados reais (dias seguidos, minutos por dia, insights marcados, livros concluídos).
- **FEATURE-B26-05**: `MyReadingScreen` deve consumir `content_views` + progressos por livro para "em andamento" e "últimos capítulos".

## Status
Bloco 26 concluído. Pronto para prosseguir com o **Bloco 27**.