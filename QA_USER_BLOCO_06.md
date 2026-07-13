# QA USUÁRIO — Bloco 6: Minha Trilha (Jornada Personalizada)

**Escopo:** `/enterprise/trilha`, `/trilha` (mesmo componente).
**Modo:** Playwright headless em `1280×1800` (desktop) e `390×1800` (mobile), usuário `colaborador@teste.com.br` (role `employee`). Sem mocks.

## Resumo
- Testes executados: **8**
- Aprovados: **8**
- Bugs corrigidos: **3**
- Pendentes: 0 · Bloqueados: 0

## Bugs corrigidos

| ID | Severidade | Descrição | Correção |
|---|---|---|---|
| **BUG-B6-01** | Alta (mock) | Card de progresso exibia `35% da jornada concluída` + barra hardcoded, sem qualquer fonte de dados. | Card só é renderizado quando há trilha CMS carregada, com progresso `0%` e legenda "Seu progresso será registrado a cada etapa concluída". Placeholder de barra removido quando 0. |
| **BUG-B6-02** | Alta (mock) | Grid de stats exibia `12 dias seguidos`, `Nível 3 em evolução`, `+18% evolução semanal` — todos valores fixos. | Grid inteiro removido. Não há tabela de progresso do usuário; melhor não exibir do que enganar. |
| **BUG-B6-03** | Alta (mock) | Quando não havia `track_items` no CMS, exibia 6 etapas fake ("Curso 1 · Inteligência Emocional", "Concluída em 12/05", "Curso 2 · Gestão da Emoção" bloqueado, etc.). | Substituído por empty state real: "Sua trilha ainda não foi publicada · Assim que sua organização liberar uma trilha personalizada, as etapas aparecerão aqui." Rodapé "Você está no caminho certo!" só aparece quando há etapas reais. |

## Casos de teste

| # | Cenário | Resultado |
|---|---|---|
| T1 | `GET /enterprise/trilha` autenticado como employee, sem CMS track publicada | ✅ Empty state renderizado |
| T2 | Header e navegação lateral carregam sem erros | ✅ |
| T3 | Ausência de `35%`, `12 dias seguidos`, `Nível 3`, `+18%` no DOM | ✅ |
| T4 | Ausência de "Concluída em 12/05" (mock antigo) | ✅ |
| T5 | Ausência de "Você está no caminho certo!" (rodapé condicional) | ✅ |
| T6 | Ausência do card de stats + barra 0% quando não há trilha | ✅ |
| T7 | Renderização mobile (390px) idêntica em conteúdo, layout adaptado | ✅ |
| T8 | Nenhum erro no console durante navegação | ✅ |

## Rotas testadas
`/enterprise/trilha` (desktop e mobile).

## Tabelas/RPCs
- `content_tracks`, `track_items`, `content_items` (via `useCmsTrack`) — leitura pública (RLS `USING true`).
- Nenhuma tabela de progresso do usuário existe hoje; correção não introduz nova dependência.

## Arquivos alterados
- `src/components/TrilhaScreen.tsx` — remoção dos mocks (`etapas` fallback, stats fixos, `35%`), empty state, gating do card de progresso e do rodapé quando `!hasTrack`.

## Status do build
✅ Sem erros. Sem console errors.

## Notas / pendências não-bloqueantes
- Título/descrição de fallback ("Domínio Emocional") ainda é copy estático quando não há track — aceitável como texto de placeholder do hero, sem sugerir dado do usuário.
- O menu "…" ainda contém "Reiniciar trilha" e "Compartilhar" apontando para `#`. Deixado para bloco futuro (fora do escopo de "remoção de mocks", pois não exibe dado falso — apenas ações sem handler).
- Falta um sistema real de progresso por usuário (tabela `user_track_progress`). Não é regressão nem bug — feature pendente de produto.

## Status
Bloco 6 concluído. Pronto para **Bloco 7 (Cury Digital / IA conversacional)**.
