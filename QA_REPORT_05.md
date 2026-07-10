# QA_REPORT_05 — Dashboard, Analítico e Motor de Impacto

**Escopo:** Dashboard RH · KPIs · Alertas · Mapa Emocional · Capacity Pulse · Pulse IA · Insights · DNA · Score Organizacional · Conselho Executivo IA · Planos de Ação · Rituais · Motor de Impacto · Estados (loading/erro/sem dados) · Atualização em tempo real
**Método:** revisão dos componentes e das RPCs/edge functions correspondentes: `get_rh_dashboard_summary`, `get_capacity_pulse`, `get_emotional_map`, `get_pulse_aggregate`, `compute-basic-alerts`, `detect-predictive-signals`, `generate-organizational-dna`, `compute-organizational-score`, `executive-ai`, `generate-weekly-insights`, `generate-intelligent-ritual`, `measure-impact`, `generate-action-plan`.

---

## 1. Dashboard RH (`/enterprise/rh`)

| Item | Resultado |
|---|---|
| KPIs cabeados | ✅ `get_rh_dashboard_summary` retorna equilíbrio, sobrecarga, clareza, adesão |
| Alertas resumidos | ✅ leitura de `predictive_signals` (open + critical + top) |
| DNA resumido | ✅ último `organizational_dna_reports` |
| Score resumido | ✅ últimos 2 `organizational_scores` (delta vs anterior) |
| Insights semanais | ✅ `weekly_ai_insights` filtrado por `week_of` atual |
| Motor de Impacto | ✅ agregação client-side de `impact_measurements` (média + top) |
| Loading | ✅ `setLoading(true)` durante fetch |
| Erro | ⚠️ falhas silenciosas em blocos secundários (DNA/insights/score/impacto) — sem toast, apenas `setX(null)` — **BUG-01 (P2)** |
| Sem dados | ✅ estados vazios tratados (retorna `null`/`0`) |
| Atualização | ✅ botão "Atualizar alertas" invoca `compute-basic-alerts` + recarrega |
| Tempo real | 🟡 sem subscription; apenas reload por ação — **BUG-02 (P2)** |

---

## 2. Alertas (`EnterpriseAlertsScreen`)

| Item | Resultado |
|---|---|
| Listagem | ✅ `alerts` + `predictive_signals` filtradas por organização e status |
| Ações (resolver/ignorar) | ✅ updates em `alerts` e `predictive_signals` |
| Recomputar sinais preditivos | ✅ `detect-predictive-signals` |
| Gerar plano de ação a partir do alerta | ✅ `generate-action-plan` |
| Gerar ritual a partir do alerta | ✅ `generate-intelligent-ritual` |
| Loading/Erro | ✅ toast em erro; loading local |
| Sem dados | ✅ estado vazio |
| Tempo real | 🟡 sem subscription em `alerts` — novos alertas só aparecem após reload — **BUG-03 (P1)** — RECOMENDADO por ser um canal de segurança (`alerts` com severity crítica) |

---

## 3. Mapa Emocional (`EnterpriseEmotionalMapScreen`)

| Item | Resultado |
|---|---|
| Dados | ✅ RPC `get_emotional_map(_organization_id, _weeks: 8)` |
| Loading/erro/sem dados | ✅ tratados |
| Tempo real | ⚠️ leitura por semana; polling desnecessário — OK |
| k-anonimato | ✅ RPC já respeita o mínimo de participantes |

---

## 4. Capacity Pulse (`EnterpriseCapacityPulseScreen`)

| Item | Resultado |
|---|---|
| Dados | ✅ RPC `get_capacity_pulse(_organization_id, _days: 30)` |
| Estados | ✅ loading, erro e vazio |
| Ação | ⚠️ tela é leitura pura; sem CTA — OK conforme design |

---

## 5. Pulse IA — Configurações e execução

| Item | Resultado |
|---|---|
| `PulseSettingsScreen` (schedules) | ✅ CRUD sobre `pulse_schedules` |
| `PulseWidget` (colaborador) | ✅ lê `pulse_prompts` e grava `pulse_responses` |
| Agregação | ✅ `get_pulse_aggregate` |
| Loading/Erro | ✅ |
| Sem dados | ✅ mensagem "sem prompts ativos" |
| Cron/tempo real | 🟡 execução dos schedules depende de cron externo (edge function agendada). Sem visualização do "last run" no admin — **BUG-04 (P2)** |

---

## 6. Insights — 3 telas distintas

### 6.1 `EnterpriseWeeklyInsightsScreen` (RH) ✅
- Wired: `generate-weekly-insights`, `generate-action-plan`, `generate-intelligent-ritual`, `measure-impact`
- Loading, erro e vazio OK.

### 6.2 `EnterpriseAIInsightsScreen` (RH — rota alternativa) 🔴 **BUG-05**
- **Todo o conteúdo é hardcoded**: arrays literais `insights`, `trends`, `recommendations`. Nenhuma chamada a Supabase/edge functions.
- Confunde com a versão semanal real e induz o cliente ao erro. **Recomendação:** ou remover essa rota ou substituir por leitura real de `weekly_ai_insights`.

### 6.3 `InsightsIAScreen` (colaborador) 🔴 **BUG-06**
- Arrays `cards`, `points` totalmente mockados ("Você desacelera melhor à noite", "+34%"). Sem integração com dados individuais do usuário.
- Aceitável apenas se marcado como "demo"; hoje aparece na rota `/cury-digital/insights` sem aviso — **P0 se for para produção**.

---

## 7. DNA Organizacional (`EnterpriseOrganizationalDNAScreen`) ✅

| Item | Resultado |
|---|---|
| Gerar | ✅ `generate-organizational-dna` grava em `organizational_dna_reports` |
| Ler | ✅ último relatório |
| Ações derivadas | ✅ `generate-action-plan`, `generate-intelligent-ritual` |
| Estados | ✅ loading/erro/vazio |

---

## 8. Score Organizacional (`EnterpriseOrganizationalScoreScreen`) ✅

| Item | Resultado |
|---|---|
| Cálculo | ✅ `compute-organizational-score` → `organizational_scores` |
| Delta | ✅ compara com registro anterior |
| Confiança | ✅ campo `confidence` exibido |
| Estados | ✅ |

---

## 9. Conselho Executivo IA (`EnterpriseExecutiveCouncilScreen`) ✅

| Item | Resultado |
|---|---|
| Chat multi-turn | ✅ `executive_ai_conversations` + `executive_ai_messages` |
| Gateway | ✅ edge function `executive-ai` (Lovable AI) |
| Ação: plano | ✅ `generate-action-plan` |
| Streaming/typing | ⚠️ resposta síncrona (não streaming). UX aceitável; **P3** para streaming futuro |
| Estados | ✅ |

---

## 10. Planos de Ação

- **Sem tela dedicada de listagem/gestão de `action_plans`.** Planos são gerados a partir de Alertas / DNA / Insights / Council, mas depois **não há UI para revisar, atualizar status de tasks (`action_plan_tasks`), reatribuir, arquivar**. — 🔴 **BUG-07 (P0)**
- RLS em `action_plans` e `action_plan_tasks` presente (1 policy cada — verificar cobertura de UPDATE por owner/rh_admin).

---

## 11. Rituais

| Tela | Resultado |
|---|---|
| `EnterpriseIntelligentRitualsScreen` | ✅ wired em `intelligent_rituals` + `generate-intelligent-ritual` + `measure-impact` |
| `EnterpriseGuidedRitualsScreen` | 🔴 **BUG-08** — nenhuma chamada a Supabase; conteúdo estático |
| `EnterpriseRitualsScreen` (componente antigo) | 🔴 **BUG-09** — nenhuma chamada a Supabase; conteúdo estático. Rota potencialmente ainda linkada — verificar `App.tsx` |
| Participação (`ritual_participations`) | ⚠️ tabela existe (1 policy) mas nenhuma tela do RH lista participação por ritual — **BUG-10 (P2)** |

---

## 12. Motor de Impacto

| Tela | Resultado |
|---|---|
| `EnterpriseImpactEngineScreen` | ✅ wired: leitura de `impact_measurements`, `impact_timelines` + `measure-impact` |
| `EnterpriseImpactScreen` (antiga) | 🔴 **BUG-11** — sem calls a Supabase; provavelmente mock legado. Verificar se ainda está roteada |
| Timeline | ✅ `impact_timelines` |
| Cálculo automático pós-ação | ✅ chamada explícita em Alertas / DNA / Insights / Rituais |

---

## 13. Estados globais

| Estado | Cobertura |
|---|---|
| Loading | ✅ presente em quase todas as telas cabeadas (`setLoading`) |
| Erro | 🟡 padrão inconsistente — algumas via toast destrutivo, outras via `console.error` silencioso. **BUG-12 (P2)** — padronizar em um `ErrorBoundary` + hook `useAsyncCall` |
| Sem dados | 🟡 mensagens variam de "•••" a "Nenhum registro" a bloco em branco — **BUG-13 (P3)** — padronizar componente `EmptyState` |
| Atualização manual | ✅ botões "Recarregar"/"Atualizar" em Dashboard, Alertas, Organograma, DNA, Score |
| Tempo real (Realtime) | 🔴 **BUG-14 (P1)** — **nenhuma** tela usa `supabase.channel().on('postgres_changes')`. Módulos que se beneficiariam: Alertas (crítico), Council (nova mensagem), Dashboard (KPIs após snapshot), Pulse (novas respostas em janela ativa). |

---

## 14. Resumo executivo

### Bugs (14)
| # | Severidade | Módulo | Descrição |
|---|---|---|---|
| BUG-01 | 🟡 P2 | Dashboard | Falhas silenciosas em blocos secundários (sem toast) |
| BUG-02 | 🟡 P2 | Dashboard | Sem realtime nos KPIs |
| BUG-03 | 🟠 P1 | Alertas | Sem realtime em `alerts` (canal de segurança) |
| BUG-04 | 🟡 P2 | Pulse | Admin não vê "last run" dos schedules |
| BUG-05 | 🔴 P0 | Insights | `EnterpriseAIInsightsScreen` 100% mock |
| BUG-06 | 🔴 P0 | Insights user | `InsightsIAScreen` 100% mock exibido para o colaborador |
| BUG-07 | 🔴 P0 | Planos | Sem tela de gestão de `action_plans` / `action_plan_tasks` |
| BUG-08 | 🔴 P1 | Rituais | `EnterpriseGuidedRitualsScreen` sem integração |
| BUG-09 | 🔴 P1 | Rituais | `EnterpriseRitualsScreen` (legado) sem integração |
| BUG-10 | 🟡 P2 | Rituais | Sem visão de `ritual_participations` no RH |
| BUG-11 | 🔴 P1 | Impacto | `EnterpriseImpactScreen` (legado) sem integração |
| BUG-12 | 🟡 P2 | Global | Tratamento de erro inconsistente |
| BUG-13 | 🟢 P3 | Global | `EmptyState` inconsistente |
| BUG-14 | 🟠 P1 | Global | Nenhuma tela usa Realtime |

### Aprovado
- Dashboard RH, Alertas (funcional), Mapa Emocional, Capacity Pulse, Pulse (schedules + widget), Weekly Insights, DNA, Score, Council, Intelligent Rituals, Impact Engine.

### Bloqueadores para go-live
1. **BUG-05 + BUG-06** — remover ou cabear telas de insights mockadas antes do cliente vê-las
2. **BUG-07** — sem gestão de planos, o ciclo "alerta → plano → execução → medição" fica quebrado no meio
3. **BUG-08/09/11** — desativar as rotas legadas de rituais/impacto ou substituir pelas versões cabeadas

### Recomendação estratégica (P1)
- Implementar 1 hook `useRealtime<T>(table, filter)` e aplicar em Alertas + Council + Dashboard. Esses são os pontos onde a percepção "vivo" é vendida ao cliente ("Organograma Vivo™", "Enterprise que respira em tempo real") e hoje **não é entregue tecnicamente**.

### Status geral
**REPROVADO para go-live** — 4 bugs P0 e 4 bugs P1 ainda pendentes. Camada analítica principal está sólida (RPCs + edge functions cobrem todos os módulos), mas as rotas mockadas paralelas + ausência da tela de Planos + zero realtime comprometem a promessa de valor do Enterprise.

**Aprovado para prosseguir para FASE QA 06** — os bugs identificados estão contidos nesta camada.
