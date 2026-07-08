# ENTERPRISE_REVIEW.md — Fase 17

Sweep completo do projeto. Nada foi removido; apenas mapeado.

## 1. TODO / FIXME
- Nenhum `TODO`/`FIXME` crítico em código de produção (RH/Enterprise). Alguns comentários residuais em telas B2C legadas — não tocar (fora do escopo).

## 2. Mocks e dados hardcoded
- Telas B2C (`Audiobook`, `BookReader`, `CuryDigitalChat`, `Diagnostico*`, `CampaignsScreen`, `ContinueWatching`, `Downloads`, etc.) mantêm arrays estáticos de conteúdo — parte do produto B2C, não migrar para banco nesta fase.
- `EnterpriseNavigationSystemScreen`, `EnterpriseEmptyStatesScreen`, `EnterpriseLoadingStatesScreen`, `EnterpriseStatusHealthScreen`, `EnterpriseDesktopResponsiveScreen` — telas de design system / demo. Manter (referência interna), marcar como não-rota.
- Telas RH principais (`EnterpriseRHDashboardScreen`, `EnterpriseOrganizationalDNAScreen`, `EnterpriseExecutiveCouncilScreen`, `EnterpriseActionPlanScreen`, `EnterpriseWeeklyInsightsScreen`, `EnterpriseIntelligentRitualsScreen`, `EnterpriseOrganizationalScoreScreen`, `EnterpriseImpactEngineScreen`) — 100% conectadas a RPC/edge/DB. Sem mocks.

## 3. localStorage
- Usado apenas para: preferências de UI (tema, idioma), sessão Supabase (padrão do SDK) e cache de PIN infantil. Nenhum uso para autorização crítica.

## 4. Componentes / imports mortos
- Suspeitos (não removidos nesta fase, apenas mapeados):
  - `EnterpriseImpactScreen.tsx` — substituído por `EnterpriseImpactEngineScreen` (Fase 16). Candidata a deprecação.
  - `EnterpriseCapacityPulseScreen.tsx` — sobreposição parcial com Pulse IA™. Reavaliar.
  - `EnterpriseBenchmarkScreen.tsx` — funcionalidade planejada para fase futura.
  - Telas de "design system demo" listadas acima.

## 5. Edge Functions
Todas em uso:
`accept-enterprise-invite`, `compute-basic-alerts`, `compute-organizational-score`, `create-organization-admin`, `detect-predictive-signals`, `executive-ai`, `generate-action-plan`, `generate-employee-profile`, `generate-intelligent-ritual`, `generate-organizational-dna`, `generate-weekly-insights`, `measure-impact`, `onboarding-chat`, `send-enterprise-invite`, `snapshot-org-chart`.

## 6. RPC (funções DB)
Todas em uso:
`has_role`, `has_any_role`, `handle_new_user`, `set_updated_at`, `current_organization_id`, `get_weekly_checkin_aggregate`, `get_pulse_aggregate`, `org_node_indicators`, `get_predictive_context`, `get_dna_context`, `get_emotional_map`, `get_rh_dashboard_summary`, `get_capacity_pulse`, `get_weekly_ai_context`, `calculate_organizational_score`, `measure_impact`, `get_executive_context`, `org_tree`.

## 7. Rotas órfãs
Não detectadas em `App.tsx`. Todas as rotas RH/Enterprise têm entrada no `EnterpriseRHNavigation` ou botão no `EnterpriseRHDashboardScreen`.

## 8. Warnings / duplicações
- TypeScript: sem erros. Alguns `any` em respostas JSON de RPC — mapeado em SECURITY_REPORT.md como low.
- Sem interfaces duplicadas relevantes.

## 9. Pendências de otimização (aplicar somente as seguras)
- Aplicar `React.lazy` em telas RH pesadas (DNA, Executive Council, Impact) — segura.
- Cachear resultados de `get_executive_context` (última chamada) em memória por 60s.
- Paginação em listas longas (`EnterpriseAuditLogsScreen`, `EnterpriseAlertsScreen`).

Nenhuma remoção nesta fase. Ver `ENTERPRISE_READY_REPORT.md` para plano.