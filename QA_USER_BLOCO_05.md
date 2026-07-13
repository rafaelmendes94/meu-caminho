# QA USUÁRIO — Bloco 5: Check-in Emocional + Pulse IA

**Escopo:** rotas `/enterprise/checkin/intro`, `/enterprise/checkin`, `/enterprise/checkin/resultado`.
**Fora do escopo:** `/enterprise/rh/*` (Pulse RH) — apenas leitura para validar reflexo.
**Modo:** Playwright headless (1280×1800), usuário `colaborador@teste.com.br` (role `employee`). Sem mocks. Chamadas reais ao backend (`emotional_checkins`).

## Resumo

- Testes executados: **12**
- Aprovados: **12**
- Bugs corrigidos: **4**
- Pendentes: **0**
- Bloqueados: **0**

## Bugs encontrados e corrigidos

| ID | Severidade | Descrição | Correção |
|---|---|---|---|
| **BUG-B5-01** | Média (mock) | `EnterpriseCheckinResultScreen` exibia "Referência: Semana 32" hardcoded, ignorando a semana real. | Cálculo dinâmico da semana ISO baseado em `last.created_at` (ou `now` quando vazio). Exibiu "Semana 29" em 13/jul/2026 ✓. |
| **BUG-B5-02** | Média (mock) | Título "Sua mente pediu um pouco mais de pausa." era fixo, mesmo com scores altos. | Título dinâmico em 4 faixas (`balance >= 4` bom ritmo · `>=3` atenção · `>=2` pausa · `<2` cuidado). Também variante "primeiro registro" quando não há histórico. |
| **BUG-B5-03** | Alta (mock) | Quick stats mostravam `Tempo: 2min` e `Frequência: Ideal` sem qualquer fonte de dados. | Removida a stat "Tempo" e substituída "Frequência" por `Registros: N` real (`history.length`). `Check-in` passa a exibir `Concluído`/`—` conforme existência de resposta. |
| **BUG-B5-04** | Média (mock) | "Reflexão da Semana" trazia sempre a mesma citação, independente das respostas. | Citação escolhida a partir da dimensão de menor valor (`mood`/`energy`/`stress_inv`), com fallback neutro quando não há check-in. |

## Casos de teste

| # | Cenário | Resultado |
|---|---|---|
| T1 | `GET /enterprise/checkin/intro` autenticado como employee | ✅ Página carrega com hero, cards e CTAs |
| T2 | Botão "Começar agora" → `/enterprise/checkin` | ✅ |
| T3 | Renderização da pergunta 1 (`Como está sua mente...`) com 5 opções e ícone `Brain` | ✅ |
| T4-T9 | Seleção da 1ª opção e avanço nas 6 perguntas até "Finalizar Check-in" | ✅ Fluxo completo sem erros |
| T10 | `insert` em `emotional_checkins` com `mood_score`, `energy_score`, `stress_score` calculados | ✅ RLS `user_id = auth.uid()` permite (novo registro visível na leitura subsequente) |
| T11 | Redirect para `/enterprise/checkin/resultado` após salvar | ✅ |
| T12 | Resultado exibe **Diagnóstico dinâmico** ("bom ritmo"), **Semana ISO 29**, **Pulso Emocional real** (Equilíbrio 5.0, Humor 5/5, Energia 5/5, Estresse 1/5), **Registros: 1** | ✅ Confirmado por screenshot |

## Rotas testadas
`/enterprise/checkin/intro`, `/enterprise/checkin`, `/enterprise/checkin/resultado`.

## RPCs / Tabelas
- `emotional_checkins` (INSERT + SELECT filtrado por `user_id`).

## Edge Functions
Nenhuma envolvida no fluxo de colaborador (Pulse IA usa RPCs no lado RH).

## Arquivos alterados
- `src/components/EnterpriseCheckinResultScreen.tsx` — semana ISO dinâmica, título de diagnóstico dinâmico, stats reais, reflexão selecionada por menor dimensão.

## Status do build
✅ Sem erros. Sem console errors durante o fluxo.

## Notas
- Card "Recomendação: Técnica de Desaceleração · 6 min" foi mantido — é copy estática de CTA que navega para `/enterprise/trilha` (rota real). Não é dado mock, mas é candidato a personalização em bloco futuro (motor de recomendação).
- Bloco 5 concluído. Pronto para **Bloco 6**.
