# Employee Experience™ (Colaborador 2.0)

Fase 24 — refino de UX da área do colaborador. Nenhum módulo novo,
nenhuma regra de negócio alterada, nenhum banco tocado.

## Novos artefatos

- `src/lib/employeePrefs.ts` — preferências locais do colaborador
  (continuar de onde parou, rotas recentes, streak motivacional,
  pool de mensagens curtas). 100% client-side, `localStorage`.
- `src/components/employee/EmployeePrimitives.tsx` — biblioteca de
  primitivas visuais reutilizáveis (Skeletons, EmptyState,
  SectionTitle, ProgressRing, MissionCard, RecommendationCard,
  ContinueCard, MotivationLine, JourneyRoadmap, XPPill) com a
  identidade "creme + laranja + sálvia" já usada no Home.
- `src/components/employee/employeeNav.ts` — fonte única da
  navegação do colaborador para busca global.
- `src/components/employee/EmployeeCommandPalette.tsx` — busca
  global ⌘K / Ctrl+K com "continuar de onde parou", rotas
  recentes e itens de navegação agrupados.

## Integrações

- `AppUserLayout` monta o palette globalmente (mobile + desktop
  B2C + enterprise-user) e faz `trackRoute` + `pingMotivation` a
  cada mudança de rota. Layout do RH permanece intocado.
- BottomNav e HomeScreen continuam com sua UX atual — as
  primitivas são de adoção incremental.

## Adoção incremental sugerida

Cada tela do colaborador pode migrar gradualmente para as
primitivas sem alterar rotas nem contratos:

| Tela                  | Primitiva sugerida                                    |
| --------------------- | ----------------------------------------------------- |
| HomeScreen            | `EmployeeMissionCard`, `EmployeeContinueCard`, `EmployeeRecommendationCard`, `EmployeeMotivationLine`, `EmployeeXPPill`, `EmployeeJourneyRoadmap` |
| LibraryScreen         | `EmployeeSectionTitle`, `EmployeeCardSkeleton`, `EmployeeEmptyState` |
| FavoritesScreen       | `EmployeeSectionTitle`, `EmployeeEmptyState`          |
| ProfileScreen         | `EmployeeSectionTitle`, `EmployeeProgressRing`, `EmployeeXPPill` |
| JourneyOverviewScreen | `EmployeeJourneyRoadmap`, `EmployeeProgressRing`      |

## Personalização

`getContinueItems`, `getLatestByKind` e `getRecentRoutes`
permitem que qualquer tela ordene blocos automaticamente com
base no que o colaborador consumiu por último. Basta chamar
`trackContinue({ id, kind, title, href, progress })` a partir
dos players existentes (livro, curso, vídeo, podcast, exercício)
quando o item for aberto ou o progresso mudar — sem alteração
de RLS, edge functions ou schema.

## Pendências reais

- Adoção das primitivas em cada tela (refino incremental).
- Chamar `trackContinue` nos players existentes (BookReader,
  AudioPlayer, AulaPlayer, Podcast, etc.) para popular
  "continuar de onde parou" com dados reais.
- Preparo de export (PDF/Excel) do histórico pessoal — a
  estrutura já pode ler de `getContinueItems` + tabelas
  existentes (`content_views`, `content_downloads`).
- Auditoria WCAG por tela (foco visível, ordem de tab,
  contraste de badges secundários).
- Virtualização em telas de alto volume (Biblioteca completa,
  Explorar) — usar `react-virtual` quando lista > 200 itens.