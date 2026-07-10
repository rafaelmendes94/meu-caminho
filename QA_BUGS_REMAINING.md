# QA EMPRESA / RH — Bugs remanescentes

**Data:** 2026-07-10  
**Critérios:** somente bugs reais reproduzíveis ou débitos técnicos com impacto funcional. Excluídos: warnings pré-existentes do linter, placeholders de UI, telas ainda não cabeadas cujos requisitos não foram definidos.

---

## Médios (3)

### M-01 — Notificações não persistidas
**Arquivo:** `src/components/EnterpriseNotificationsScreen.tsx`  
**Descrição:** UI de notificações renderiza mas não há tabela `notifications` no banco. Badge, marcar-como-lida e rota de destino não têm origem real. Não bloqueia fluxo administrativo — bloqueia a área de notificações em si.  
**Correção proposta:** migração criando `notifications(user_id, organization_id, type, title, body, action_url, read_at, created_at)` + realtime + cablear.  
**Estimativa:** 1 onda dedicada (M-01 + N-02).

### M-02 — Reflexo CMS → app do colaborador não auditado
**Descrição:** Fluxo do §31 (livros/cursos/vídeos publicados aparecem para employee, drafts não) não pôde ser validado — exige CMS populado e conta employee.  
**Correção proposta:** rodar E2E com um conteúdo em cada estado (draft/published/archived) em ambiente com owner+employee.

### M-03 — Motor de impacto sem baseline dedicado
**Arquivo:** `src/pages/EnterpriseImpactEngineScreen.tsx`  
**Descrição:** Calcula variação atual vs anterior, mas não persiste baseline por medição (`impact_measurements.baseline_snapshot`). Se o ritual mudar de escopo, impactos históricos podem ficar inconsistentes.  
**Correção proposta:** ao iniciar medição, congelar snapshot em `impact_measurements`.

---

## Baixos (6)

### B-01 — Benchmark limitado à própria org
**Arquivo:** `src/components/EnterpriseBenchmarkScreen.tsx`  
**Descrição:** Sem tabela de benchmarks de mercado, o comparativo é intra-org. Aceitável para MVP, mas o rótulo "benchmark" pode gerar expectativa de comparação externa.  
**Correção proposta:** renomear seção para "Comparativo por segmento interno" ou plugar API externa.

### B-02 — 47 warnings pré-existentes do Supabase linter
**Descrição:** `SECURITY DEFINER` público + `pgcrypto` em `public`. Padrão do projeto (validação de role dentro de cada função). Não introduzidos nesta rodada.  
**Correção proposta:** mover funções para schema `internal` numa refatoração dedicada.

### B-03 — `EnterpriseAIInsightsScreen` (legado) ainda aponta rota
**Arquivo:** `src/App.tsx` rota `/enterprise/rh/insights-ia`  
**Descrição:** Rota antiga permanece; conteúdo é redirect para `/enterprise/rh/insights-semanais`. Funciona, mas dobra a superfície.  
**Correção proposta:** substituir por `<Navigate>` no roteador.

### B-04 — Central Admin: seções "Leitura estratégica" e "Próximas recomendações"
**Arquivo:** `src/pages/EnterpriseAdminCenterScreen.tsx`  
**Descrição:** Textos ainda estáticos (frase decorativa + 4 recomendações genéricas). Não são KPIs — são cópia editorial. Não expõem dados fictícios de outra org.  
**Correção proposta:** cabelar em `weekly_ai_insights` mais recente da org (recomendações dinâmicas). Baixa prioridade porque não representa mock de dado de outra empresa.

### B-05 — "Status organizacional" com estados fixos "Ativo"
**Mesmo arquivo:** grid final mostra 6 status como "Ativo/Ativa/Protegido/Conectado/Validado".  
**Descrição:** Deveriam refletir estado real de compliance/SSO/domínio. Hoje são rótulos decorativos.  
**Correção proposta:** ler `organization_settings` + verificação real de SSO/domínio; usar `EmptyState` quando não configurado.

### B-06 — Padronização de `useAsyncCall`/`EmptyState` não aplicada em todas as telas
**Descrição:** Hook e componente existem (Onda 6), mas apenas Pulse RH e Ritual Participations foram migrados. Telas antigas seguem com loading/erro ad-hoc.  
**Correção proposta:** varrer 20+ telas restantes numa refatoração dedicada.

---

## Pendentes E2E (não são bugs — exigem dataset)

Ver `QA_EMPRESA_RH_FINAL.md` seção "Pendentes E2E".

---

## Conclusão

Sem bugs **críticos** ou **altos** abertos no módulo Empresa/RH após esta rodada. Débitos técnicos catalogados acima podem entrar em uma próxima onda dedicada de acabamento.