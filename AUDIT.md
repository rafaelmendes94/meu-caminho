# AUDIT.md — Meu Caminho Enterprise

> Auditoria do bootstrap visual antes da conexão com backend.
> **Nenhum código foi alterado.** Este documento apenas mapeia mocks, dados fake e drift de design system.

---

## 1. Resumo executivo

- **Arquivos analisados:** 219 arquivos `.ts` / `.tsx` em `src/` (pages, components, hooks, data, layouts).
- **Arquivos com mocks / dados fake identificados:** ~180+ (praticamente toda tela renderiza dados hardcoded — esperado para um protótipo visual).
- **Arquivos com `localStorage`:** 6 (auth fake + preferências).
- **Arquivos com `toast.success/error/info` sem persistência real:** 16.
- **Arquivos com `Math.random()`:** 2 (`EnterpriseDepartmentsScreen`, `ui/sidebar`).
- **Arquivos com percentuais/KPIs hardcoded em dashboards:** ~110.
- **Total de rotas registradas em `App.tsx`:** ~180 rotas (incluindo duplicações `enterprise/*`).

### Principais riscos

1. **Autenticação totalmente fake** — `localStorage.setItem("mc_authed","1")` libera qualquer rota protegida. Sem usuário real, role, sessão ou RLS.
2. **RH sem persistência** — Todo o painel RH (dashboard, alertas, denúncias, capacidade, benchmark, ações, insights IA, integrações, licenças, políticas) usa arrays hardcoded dentro dos próprios componentes.
3. **Checkout Enterprise inteiro fake** — Planos, dados, pagamento e sucesso apenas navegam com `toast.success`, sem billing, cobrança ou provisionamento de tenant.
4. **Denúncias (Canal Direto)** — Dados sensíveis em `src/data/enterpriseReports.ts` como constante estática; nenhum sigilo real, nenhum trilho de auditoria persistente.
5. **Chat IA e Cury Digital** — Mensagens hardcoded ou geradas localmente. Sem chamada real a gateway de IA.
6. **Convite de colaborador** — `/enterprise/convite/:token` aceita qualquer token; sem fluxo real de convite/expiração.
7. **Check-in emocional** — Resultado calculado localmente e não vinculado a usuário/organização.
8. **Compliance / retenção de dados / privacidade** — Ações apenas disparam toast; nenhuma política é gravada.

### Módulos mais críticos (ordem de risco descendente)

1. Auth / Sessão / Roles
2. Enterprise RH (dashboards, denúncias, alertas)
3. Check-in emocional (produto core B2B)
4. Checkout Enterprise (receita)
5. Cury Digital / Chat IA
6. Compliance & Privacidade
7. B2C (biblioteca, trilha, conteúdo)

---

## 2. Mapa por módulo

> Legenda de complexidade: **S** = pequena (troca direta por hook/query), **M** = média (nova tabela + policies + hook), **L** = grande (múltiplas tabelas, edge functions, jobs).
> Fases: **F3** = Fundação (auth + schema), **F4** = RH core, **F5** = Colaborador, **F6** = IA/Insights, **F7** = Checkout/Billing, **F8** = B2C.

### Auth

| Arquivo | Tipo de mock | Resumo | Impacto | Compl. | Fase |
|---|---|---|---|---|---|
| `src/components/AuthGate.tsx` | localStorage fake | `mc_authed === "1"` decide sessão | Bloqueia tudo | S | F3 |
| `src/pages/Index.tsx` | login fake | `localStorage.setItem("mc_authed","1")` no submit | Sem validação | S | F3 |
| `src/components/PreloaderRoute.tsx` | timeout fake | Redireciona `/welcome` após 2.8s | Baixo | S | F3 |
| `src/pages/EnterpriseRHLoginScreen.tsx` | login RH fake | `toast.success` sem validar credenciais | Alto (privilégio) | M | F3 |
| `src/components/EnterpriseInviteAcceptanceScreen.tsx` | token fake | Aceita qualquer `:token` na URL | Alto | M | F3 |
| `src/components/EnterpriseEmployeeRegisterScreen.tsx` | cadastro fake | Formulário sem persistência | Alto | M | F3 |
| `src/components/EnterprisePrivacyConsentScreen.tsx` | consent fake | Não grava aceite LGPD | Alto (LGPD) | S | F3 |

### Enterprise Colaborador

| Arquivo | Tipo de mock | Resumo | Impacto | Compl. | Fase |
|---|---|---|---|---|---|
| `EnterpriseHomeScreen.tsx` | KPIs, cards | Progresso e recomendações hardcoded | Alto | M | F5 |
| `EnterpriseCheckinIntroScreen.tsx` / `EnterpriseCheckinScreen.tsx` / `EnterpriseCheckinResultScreen.tsx` | fluxo fake | Perguntas hardcoded, resultado local, sem gravação | Crítico (produto core) | L | F4 |
| `EnterpriseWelcomeScreen.tsx` / `EnterpriseWelcomeJourneyScreen.tsx` | onboarding fake | Steps hardcoded | Médio | S | F5 |
| `EnterpriseCuryDigitalScreen.tsx` | chat fake | Respostas mockadas | Alto | L | F6 |
| `EnterpriseJourneyEvolutionScreen.tsx` | evolução fake | Trilha e progresso hardcoded | Médio | M | F5 |
| `EnterpriseLibraryScreen.tsx` | catálogo fake | Array `BOOKS` hardcoded no componente | Médio | M | F5 |
| `CanalDireto*Screen.tsx` (RH/Mensagem/Confirmacao) | denúncia fake | Envio por `toast`, não persiste | Crítico (compliance) | L | F4 |
| `EnterpriseRitualsScreen.tsx` | rituais fake | Lista hardcoded | Baixo | S | F5 |

### Enterprise RH

| Arquivo | Tipo de mock | Resumo | Impacto | Compl. | Fase |
|---|---|---|---|---|---|
| `EnterpriseRHDashboardScreen.tsx` | KPIs fake | Indicadores (energia, engajamento, equilíbrio, turnover) hardcoded | Crítico | L | F4 |
| `EnterpriseAlertsScreen.tsx` | alertas fake | Lista hardcoded, sem geração real | Crítico | L | F4 |
| `EnterpriseCapacityPulseScreen.tsx` | capacidade fake | KPIs e curvas hardcoded | Alto | M | F4 |
| `EnterpriseReportScreen.tsx` | relatório fake | Dados hardcoded | Alto | M | F4 |
| `EnterpriseTeamManagementScreen.tsx` | colaboradores fake | Array hardcoded | Crítico | L | F4 |
| `EnterpriseDepartmentsScreen.tsx` | departamentos fake | Array + **`Math.random()`** para IDs | Alto | M | F4 |
| `EnterpriseDepartmentDetailScreen.tsx` | detalhe fake | Dados fixos | Médio | M | F4 |
| `EnterpriseEmployeeAdminScreen.tsx` | admin colaborador fake | Persistência via `toast` | Alto | M | F4 |
| `EnterpriseInviteEmployeesScreen.tsx` | convite fake | Sem envio real de e-mail | Alto | M | F4 |
| `EnterpriseImportEmployeesScreen.tsx` | import fake | CSV não processado | Alto | L | F4 |
| `EnterpriseLicensesScreen.tsx` | licenças fake | Contadores hardcoded | Alto | M | F4/F7 |
| `EnterpriseActionPlanScreen.tsx` | plano de ação fake | Ações não persistem | Alto | M | F4 |
| `EnterpriseBenchmarkScreen.tsx` | benchmark fake | Comparativos hardcoded | Médio | L | F6 |
| `EnterpriseLeadership(Overview/Health/Message)Screen.tsx` | liderança fake | KPIs hardcoded, mensagens em toast | Alto | M | F4 |
| `EnterpriseImpactScreen.tsx` | impacto fake | ROI/engajamento hardcoded | Médio | M | F6 |
| `EnterpriseEmotionalMapScreen.tsx` | mapa emocional fake | Pontos hardcoded | Alto | L | F4 |
| `EnterpriseRHReportsScreen.tsx` / `EnterpriseRHReportDetailScreen.tsx` | denúncias fake | Consome `src/data/enterpriseReports.ts` (estático) | Crítico (LGPD) | L | F4 |
| `EnterpriseAdminIntegrationScreen.tsx` / `EnterpriseIntegrationsScreen.tsx` | integrações fake | Botão chama `toast` | Alto | L | F7 |
| `EnterprisePermissionsScreen.tsx` | permissões fake | Roles em memória | Crítico (segurança) | L | F3 |
| `EnterpriseCompanySettingsScreen.tsx` | settings fake | Nada persiste | Alto | M | F4 |
| `EnterpriseDomainAccessScreen.tsx` | domínio fake | Adiciona domínio via toast | Alto | M | F4 |
| `EnterpriseAuditLogsScreen.tsx` | logs fake | Eventos hardcoded | Crítico (compliance) | L | F4 |
| `EnterpriseNotificationsScreen.tsx` | notificações fake | Lista hardcoded | Médio | M | F4 |
| `EnterpriseExportsScreen.tsx` | exports fake | Botão gera toast, sem download real | Médio | M | F4 |
| `EnterprisePrivacyCenterScreen.tsx` | privacidade fake | Ações via toast | Alto (LGPD) | M | F4 |
| `EnterpriseStatusHealthScreen.tsx` | health fake | Status hardcoded | Baixo | S | F4 |

### Checkout

| Arquivo | Tipo de mock | Resumo | Impacto | Compl. | Fase |
|---|---|---|---|---|---|
| `src/pages/EnterpriseCheckoutPlanScreen.tsx` | planos fake | Preços hardcoded, toast em CTA | Crítico | L | F7 |
| `src/pages/EnterpriseCheckoutCompanyDataScreen.tsx` | dados fake | Só valida obrigatoriedade | Alto | M | F7 |
| `src/pages/EnterpriseCheckoutPaymentScreen.tsx` | pagamento fake | Termos + toast; sem Stripe/Paddle | Crítico | L | F7 |
| `src/pages/EnterpriseCheckoutSuccessScreen.tsx` | sucesso fake | Comprovante via toast | Alto | S | F7 |
| `src/pages/EnterpriseBillingScreen.tsx` | billing fake | Faturas hardcoded, `toast.success` para expansão | Crítico | L | F7 |

### B2C

| Arquivo | Tipo de mock | Resumo | Impacto | Compl. | Fase |
|---|---|---|---|---|---|
| `HomeScreen.tsx` | conteúdo fake | Cards e trilha hardcoded | Médio | M | F8 |
| `Library/BookDetail/BookChapters/BookReader/Themed/Monthly/NewRelease/MyReading/ReadingProgress` | catálogo fake | Livros e capítulos hardcoded | Médio | L | F8 |
| `Trilha/JourneyOverview/Curso/Modulos/AulaPlayer/Materiais/Progresso` | trilha/curso fake | Módulos, aulas e progresso hardcoded | Médio | L | F8 |
| `ProvaFinal/ResultadoProva/Diagnostico/DiagnosticoFinal` | prova/diagnóstico fake | Perguntas/resultados hardcoded | Médio | L | F8 |
| `Feed/FeedCategories/Explore/SavedContent/ContinueWatching/Campaigns` | feed/conteúdo fake | Arrays hardcoded | Baixo | M | F8 |
| `Audiobook/AudioPlayer/PodcastPlayer/VideoContent/VideoShorts/BlogReading/ContentDetail` | players fake | Metadata hardcoded, sem histórico | Médio | M | F8 |
| `Conquista/EvolucaoPessoal/ProximaTrilha/MudancaJornada/MudarTrilhaConfirm/CursoDesbloqueado` | conquista fake | Estado hardcoded | Baixo | S | F8 |
| `SubscriptionScreen.tsx` | assinatura fake | Planos + toast | Alto | L | F7 |

### Settings

| Arquivo | Tipo de mock | Resumo | Impacto | Compl. | Fase |
|---|---|---|---|---|---|
| `SettingsScreen.tsx` | localStorage | `mc-lang`, `mc-quality` | Baixo | S | F5 |
| `settings/ChoiceScreens.tsx` | localStorage | preferências genéricas | Baixo | S | F5 |
| `settings/ReadingSettingsScreen.tsx` | localStorage | `mc-font-size`, `mc-font-family`, `mc-line-height` | Baixo | S | F5 |
| `settings/ChangePasswordScreen.tsx` | senha fake | Toast, sem auth | Alto | S | F3 |
| `settings/ChangeEmailScreen.tsx` | e-mail fake | Toast, sem auth | Alto | S | F3 |
| `settings/Phone.tsx` | telefone fake | Sem persistência | Médio | S | F5 |
| `settings/LegalScreens.tsx` | textos estáticos | OK como conteúdo estático; sem versionamento | Baixo | S | F5 |
| `hooks/useDarkMode.ts` | localStorage | `mc-theme` | Baixo | S | F5 |
| `Profile/Menu/Notifications/NotificationsSheet/History/Favorites/Downloads/HelpCenter/ContactUs` | dados fake | Perfil, histórico e notificações hardcoded | Médio | M | F5 |

### Conteúdo

Coberto em **B2C** acima (biblioteca, trilha, players, feed).

### IA / Chat

| Arquivo | Tipo de mock | Resumo | Impacto | Compl. | Fase |
|---|---|---|---|---|---|
| `ChatAIScreen.tsx` | chat fake | Mensagens hardcoded / echo local | Alto | L | F6 |
| `CuryDigitalHomeScreen.tsx` / `CuryDigitalChatScreen.tsx` | chat fake | Sem gateway de IA | Alto | L | F6 |
| `HistoricoIAScreen.tsx` | histórico fake | Sessões hardcoded | Médio | M | F6 |
| `SugestaoTrilhaScreen.tsx` | sugestão fake | Trilha gerada localmente | Médio | M | F6 |
| `RespostaCriticaScreen.tsx` | resposta fake | Texto hardcoded | Médio | M | F6 |
| `InsightsIAScreen.tsx` | insights fake | Cards hardcoded | Médio | M | F6 |
| `src/pages/EnterpriseAIInsightsScreen.tsx` | insights fake | KPIs hardcoded | Alto | L | F6 |
| `EnterpriseCuryDigitalScreen.tsx` | chat corp fake | Precisa contexto por organização | Alto | L | F6 |

### Dashboards

Todos os dashboards Enterprise/RH acima usam **valores fixos** (energia organizacional, engajamento, equilíbrio, turnover, participação, evolução, riscos, alertas, benchmark, impacto, capacidade, mapa emocional). ~110 arquivos com percentuais hardcoded no total. Prioridade **F4/F6**.

### Compliance

| Arquivo | Tipo de mock | Resumo | Impacto | Compl. | Fase |
|---|---|---|---|---|---|
| `src/pages/EnterpriseComplianceScreen.tsx` | políticas fake | Toggle via toast | Crítico (LGPD) | L | F4 |
| `src/pages/EnterprisePoliciesScreen.tsx` | políticas fake | Sem versionamento | Alto | M | F4 |
| `src/pages/EnterpriseDataRetentionScreen.tsx` | retenção fake | `toast.info("simulada com segurança")` | Crítico | L | F4 |
| `src/pages/EnterpriseMultiAdminsScreen.tsx` | admins fake | `toast.success` sem gravação | Crítico (segurança) | L | F3/F4 |
| `PrivacyEnterpriseScreen.tsx` / `EnterprisePrivacyCenterScreen.tsx` / `EnterprisePrivacyConsentScreen.tsx` | consent fake | Nenhum registro persistido | Crítico (LGPD) | M | F3 |
| `EnterpriseAuditLogsScreen.tsx` | logs fake | Eventos hardcoded, sem trilha real | Crítico | L | F4 |

---

## 3. Design System Drift

> Apenas listado — não corrigir agora.

1. **Cores hardcoded fora dos tokens** — presentes em praticamente todas as telas Enterprise:
   - `#F88A2B` (laranja marca), `#111`, `#666`, `#999`, `#F7F4F2`, `#FBE7C7`, `#5B2A12`, etc. como valores literais em `className` e `style` (`bg-[#F88A2B]/10`, `text-[#111]`, `bg-[#F7F4F2]`).
   - Exemplos representativos: `EnterpriseLeadershipHealthScreen`, `EnterpriseLibraryScreen`, `EnterpriseHomeScreen`, `EnterpriseRHDashboardScreen`, `EnterpriseCheckinScreen`, todos os `Enterprise*` em `src/pages/`.
2. **Fontes inline** — `fontFamily: "'Montserrat', sans-serif"` e `"'Playfair Display', Georgia, serif"` via `style` em vez de utilitário Tailwind (`font-display`, `font-serif`). Espalhado na maioria das telas Enterprise.
3. **Espaçamentos duplicados** — mistura de `p-8 rounded-3xl`, `p-8 rounded-[32px]`, `p-6 rounded-[24px]` para o mesmo tipo de card entre telas RH.
4. **Componentes shadcn alterados** — `src/components/ui/*` foi editado após o bootstrap (accordion, alert, badge, button, card, dialog, etc.). Requer diff contra shadcn upstream.
5. **Layouts duplicados** — 3 layouts Enterprise (`EnterpriseUserLayout`, `EnterpriseRHLayout`, `EnterpriseCheckoutLayout`) + `AppUserLayout` + `MediaDesktopLayout`; alguns duplicam cabeçalho/topbar sem reuso (`AppDesktopTopbar`, `AppMobileHeader`, `AppDesktopSidebar`).
6. **`AuthGate` local** — não há provider de auth central; cada tela decide livremente se protege.
7. **Uso misto de `src/pages` e `src/components` para telas** — telas Enterprise mais novas (`EnterpriseAIInsightsScreen`, `EnterpriseBillingScreen`, `EnterpriseAdminCenterScreen`, checkout, RH login/welcome, políticas, retenção, unidades, multi-admins, roadmap, support, launch, rituais, compliance) vivem em `src/pages`; o restante vive em `src/components`. Convenção não uniforme.

---

## 4. Rotas

Total: ~180 rotas em `src/App.tsx`. Todas renderizam (build OK, HTTP 200 no dev). Estado abaixo:

| Rota | Renderiza | Mock | Dep. auth fake | Quebrada |
|---|---|---|---|---|
| `/` , `/login` | ✅ | login fake (`Index`) | grava `mc_authed` | — |
| `/home` | ✅ | mocks | requer `mc_authed` (via `AuthGate` quando usado) | — |
| `/preloader` → `/welcome` | ✅ | timeout | — | — |
| `/menu`, `/perfil`, `/configuracoes/*`, `/ajuda`, `/notificacoes`, `/historico`, `/downloads`, `/favoritos`, `/assinatura` | ✅ | mocks + localStorage | não protege | — |
| `/explorar`, `/feed`, `/feed/*`, `/biblioteca`, `/biblioteca/*`, `/conteudo/*`, `/player/*`, `/campanhas`, `/convidado(/:slug)` | ✅ | catálogo hardcoded | não protege | — |
| `/trilha`, `/jornada`, `/diagnostico`, `/curso(/1)`, `/modulos`, `/aula`, `/materiais`, `/progresso`, `/prova-final(/resultado)`, `/curso-desbloqueado`, `/diagnostico-final`, `/evolucao-pessoal`, `/proxima-trilha`, `/mudanca-jornada`, `/mudar-trilha/confirmar`, `/conquista` | ✅ | fluxo hardcoded | não protege | — |
| `/chat`, `/cury-digital(/chat|/historico|/sugestao|/critico|/insights)` | ✅ | IA fake | não protege | — |
| `/enterprise/welcome`, `/enterprise/privacidade`, `/enterprise/privacy`, `/enterprise/aceite-privacidade`, `/enterprise/cadastro`, `/enterprise/boas-vindas` | ✅ | onboarding fake | — | — |
| `/enterprise/convite/:token` | ✅ | token fake (aceita qualquer) | — | risco alto |
| `/enterprise` (home colaborador) | ✅ | KPIs hardcoded | não protege | — |
| `/enterprise/checkin/(intro|resultado)`, `/enterprise/checkin` | ✅ | fluxo fake, resultado local | — | — |
| `/enterprise/sos-rh(/mensagem|/confirmado)`, `/enterprise/fale-conosco` | ✅ | denúncia fake (toast) | — | crítico (LGPD) |
| `/enterprise/biblioteca`, `/enterprise/trilha`, `/enterprise/feed(/*)`, `/enterprise/conteudo/*`, `/enterprise/player/*`, `/enterprise/aula`, `/enterprise/curso`, `/enterprise/modulos`, `/enterprise/materiais`, `/enterprise/jornada`, `/enterprise/mudanca-jornada`, `/enterprise/prova-final(/resultado)`, `/enterprise/progresso`, `/enterprise/perfil`, `/enterprise/menu`, `/enterprise/notificacoes`, `/enterprise/configuracoes(/leitura)`, `/enterprise/ajuda`, `/enterprise/historico`, `/enterprise/favoritos`, `/enterprise/downloads`, `/enterprise/assinatura`, `/enterprise/explorar` | ✅ | reusa componentes B2C mockados | não filtra contexto de empresa | — |
| `/enterprise/cury-digital(/chat|/historico|/sugestao|/critico|/insights)` | ✅ | IA fake | — | — |
| `/enterprise/checkout/(plano|dados|pagamento|sucesso)` | ✅ | checkout fake (toasts) | — | crítico (receita) |
| `/enterprise/rh/login` | ✅ | login RH fake | — | crítico (privilégio) |
| `/enterprise/rh/welcome` | ✅ | boas-vindas RH | — | — |
| `/enterprise/rh` (acesso) | ✅ | placeholder | não valida role | risco |
| `/enterprise/rh/dashboard`, `/enterprise/rh/alertas`, `/enterprise/rh/capacidade`, `/enterprise/rh/relatorio`, `/enterprise/rh/benchmark`, `/enterprise/rh/impacto`, `/enterprise/rh/mapa-emocional`, `/enterprise/rh/lideranca`, `/enterprise/rh/insights-ia`, `/enterprise/rh/comunicados` | ✅ | KPIs fixos | não valida role | crítico |
| `/enterprise/rh/equipe`, `/enterprise/rh/equipe/(convidar|importar|licencas|:id)`, `/enterprise/rh/departamentos`, `/enterprise/rh/departamento/:id`, `/enterprise/rh/configuracoes`, `/enterprise/rh/dominio`, `/enterprise/rh/plano-acao`, `/enterprise/rh/integracao` | ✅ | arrays hardcoded, ID via `Math.random` | não valida role | crítico |
| `/enterprise/rh/denuncias`, `/enterprise/rh/denuncias/:id`, `/enterprise/rh/sos` | ✅ | `src/data/enterpriseReports.ts` (estático) | não valida role | crítico (LGPD) |
| `/enterprise/rh/retencao-dados`, `/enterprise/rh/compliance`, `/enterprise/rh/politicas`, `/enterprise/rh/unidades`, `/enterprise/rh/multiplos-admins`, `/enterprise/rh/rituais/guiados`, `/enterprise/rh/central-admin`, `/enterprise/rh/billing` | ✅ | toggles/ações via toast | não valida role | crítico |
| `*` (NotFound) | ✅ | — | — | — |

**Duplicação notada:** `/enterprise/biblioteca`, `/enterprise/progresso`, `/enterprise/cury-digital/sugestao` estão declaradas duas vezes em `App.tsx`. React Router usa a primeira ocorrência; a segunda é morta. Registrar para limpar em fase futura (não corrigir agora).

---

## 5. Recomendações — ordem de implementação

### Fase 03 — Fundação (Lovable Cloud + Auth + Roles)
1. Habilitar Lovable Cloud.
2. Modelar `organizations`, `profiles`, `user_roles` (enum `app_role`: `owner | rh_admin | leader | employee`) e função `has_role()` (security definer).
3. Substituir `AuthGate` + `Index` (login) + `EnterpriseRHLoginScreen` por auth real (e-mail/senha + Google); desativar `mc_authed`.
4. Consent LGPD (`EnterprisePrivacyConsentScreen`) gravando em `privacy_consents` versionada.
5. Fluxo real de convite (`enterprise_invites` com token assinado + expiração + aceite).
6. Guard de rotas `/enterprise/rh/*` exigindo `rh_admin` ou `owner`.

### Fase 04 — Enterprise RH (produto core B2B)
1. `check_ins` (colaborador → resultado emocional) + `check_in_answers`.
2. `departments`, `department_members`, `employees` (com licença/status).
3. `alerts` gerados por regras (edge function agendada).
4. `capacity_pulses`, `emotional_map_points`, `leadership_signals` — via views/materialized views.
5. `action_plans` + `action_plan_items`.
6. `sos_reports` (Canal Direto) com trilha `sos_report_events` + criptografia de conteúdo sensível.
7. `audit_logs` para todas as ações do RH.
8. `notifications` server-driven.

### Fase 05 — Enterprise Colaborador
1. `EnterpriseHomeScreen` puxando check-in próprio, próximos rituais, recomendações.
2. Trilha/curso persistentes (`user_track_progress`, `user_content_progress`).
3. Preferências (`user_preferences`) migrando `mc-lang`, `mc-quality`, `mc-font-*`, tema.
4. Perfil / notificações / histórico / favoritos / downloads reais.
5. Onboarding (`EnterpriseWelcomeJourneyScreen`) marcando etapas.

### Fase 06 — People Intelligence Platform (IA / Insights)
1. Integrar Lovable AI Gateway em Cury Digital + Chat IA (contexto restrito por role).
2. `ai_sessions`, `ai_messages`, `ai_insights` (RLS por org/user).
3. `EnterpriseAIInsightsScreen`, `EnterpriseBenchmarkScreen`, `EnterpriseImpactScreen`, `EnterpriseEmotionalMapScreen` alimentados por agregados + jobs de IA.
4. Sugestão de trilha, resposta crítica, insights personalizados.

### Fase 07 — Checkout / Billing Enterprise
1. Escolher provedor (Stripe recomendado para recorrência B2B).
2. `plans`, `subscriptions`, `invoices`, `licenses`.
3. `EnterpriseCheckoutPlanScreen` → `Payment` → `Success` com webhook real.
4. `EnterpriseBillingScreen` lendo faturas reais; `EnterpriseLicensesScreen` sincronizada com `subscriptions.seats`.
5. Integrações externas (`EnterpriseIntegrationsScreen`, `EnterpriseAdminIntegrationScreen`).

### Fase 08 — B2C (por último)
1. Catálogo (livros, cursos, feed, campanhas) em tabelas + storage.
2. Progresso e conquistas persistentes.
3. `SubscriptionScreen` B2C ligada ao provedor.
4. Diagnósticos, prova final, evolução pessoal persistentes.

### Pós-produto (contínuo)
- Consolidar Design System (tokens, remover cores hardcoded, unificar layouts).
- Deduplicar rotas em `App.tsx`.
- Remover `Math.random()` de `EnterpriseDepartmentsScreen` (usar `crypto.randomUUID` ou UUID do banco).
- Auditar diffs de `src/components/ui/*` contra shadcn upstream.

---

**Nenhum arquivo além de `AUDIT.md` foi criado ou modificado.**
