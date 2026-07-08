# SYSTEM_ARCHITECTURE.md — Enterprise v1.0

## Camadas

```
┌──────────────────────────────────────────────────────────────┐
│  Frontend (React 18 + Vite + Tailwind + shadcn)              │
│  - Rotas RH: /enterprise/rh/*                                │
│  - Rotas Colaborador: /enterprise/*                          │
│  - B2C (legado): rotas raiz                                  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  Supabase Client (SDK)                                       │
│  - Auth (email/senha + Google)                               │
│  - PostgREST (RLS everywhere)                                │
│  - Edge Functions (invoke)                                   │
└──────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼──────────────────┐
          ▼                 ▼                  ▼
  ┌───────────────┐  ┌──────────────┐  ┌────────────────┐
  │ Postgres      │  │ Edge Funcs   │  │ Lovable AI GW  │
  │ + RLS + RPC   │  │ (Deno)       │  │ (Gemini)       │
  │ + pg_cron     │  │              │  │                │
  └───────────────┘  └──────────────┘  └────────────────┘
```

## Fluxo de inteligência
```
Sinais individuais (check-ins, pulse)
        │  RLS bloqueia leitura direta
        ▼
RPC agregadora (k-anonimato ≥5, SECURITY DEFINER)
        │
        ├─► Dashboard RH
        ├─► DNA Organizacional™
        ├─► Score Organizacional™
        ├─► Sinais Preditivos
        └─► Contexto Executivo (get_executive_context)
                │
                ▼
        Conselho Executivo IA™ ──► recomendações
                │
                ▼
        Planos de Ação / Rituais / Insights Semanais
                │
                ▼
        Motor de Impacto™ (mede delta de score pós-ação)
                │
                └─► retroalimenta Conselho Executivo
```

## Módulos
| Módulo | Route | Tabelas | RPC | Edge |
|---|---|---|---|---|
| Auth / Org / Convites | `/auth`, `/enterprise/onboarding` | organizations, profiles, user_roles, enterprise_invites | current_organization_id | create-organization-admin, send/accept-enterprise-invite |
| Onboarding IA | `/enterprise/onboarding` | onboarding_* | — | onboarding-chat, generate-employee-profile |
| Pulse / Check-in | `/enterprise/checkin`, `/enterprise/pulse` | pulse_*, emotional_checkins | get_pulse_aggregate, get_weekly_checkin_aggregate | — |
| Organograma Vivo™ | `/enterprise/rh/organograma` | profiles, org_chart_snapshots | org_tree, org_node_indicators | snapshot-org-chart |
| Dashboard RH | `/enterprise/rh/dashboard` | (agregados) | get_rh_dashboard_summary | — |
| Inteligência Preditiva | `/enterprise/rh/preditiva` | predictive_signals, alerts | get_predictive_context | detect-predictive-signals, compute-basic-alerts |
| DNA Organizacional™ | `/enterprise/rh/dna` | organizational_dna_reports | get_dna_context | generate-organizational-dna |
| Conselho Executivo IA™ | `/enterprise/rh/conselho` | executive_ai_* | get_executive_context | executive-ai (streaming) |
| Planos de Ação | `/enterprise/rh/planos` | action_plans, action_plan_tasks | — | generate-action-plan |
| Insights Semanais | `/enterprise/rh/insights-semanais` | weekly_ai_insights | get_weekly_ai_context | generate-weekly-insights |
| Rituais Inteligentes™ | `/enterprise/rh/rituais-inteligentes` | intelligent_rituals, ritual_participations | — | generate-intelligent-ritual |
| Score Organizacional™ | `/enterprise/rh/score-organizacional` | organizational_scores | calculate_organizational_score | compute-organizational-score |
| Motor de Impacto™ | `/enterprise/rh/impacto` | impact_measurements, impact_timelines | measure_impact | measure-impact |

## Fronteiras de segurança
- **Cliente nunca acessa dados individuais de outros colaboradores.**
- **RH nunca acessa dado bruto individual** — apenas agregados via RPC.
- **Edge functions usam `service_role`** e validam autorização em código.
- **IA nunca recebe PII** — apenas contexto agregado retornado por RPC.