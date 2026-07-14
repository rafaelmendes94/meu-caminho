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
| Knowledge Hub™ | `/admin/knowledge` | knowledge_documents, knowledge_chunks (pgvector), knowledge_collections, knowledge_categories, knowledge_versions, knowledge_cache, knowledge_logs, knowledge_usage | match_knowledge_chunks | knowledge-ingest, knowledge-search, _shared/knowledge_rag.ts |

## Fronteiras de segurança
- **Cliente nunca acessa dados individuais de outros colaboradores.**
- **RH nunca acessa dado bruto individual** — apenas agregados via RPC.
- **Edge functions usam `service_role`** e validam autorização em código.
- **IA nunca recebe PII** — apenas contexto agregado retornado por RPC.

## Camada RAG (Knowledge Hub™)
Todas as IAs generativas (`executive-ai`, `generate-organizational-dna`, `generate-weekly-insights`, `generate-action-plan`, `generate-intelligent-ritual`, `cms-recommend`) invocam `fetchKnowledgeContext()` antes de chamar o LLM. O helper embeda a query (`google/gemini-embedding-001`, 3072d), consulta `match_knowledge_chunks` filtrando por `organization_id` (global + org atual), respeita cache (TTL 1h, invalidação por trigger) e registra uso em `knowledge_usage`. O bloco de contexto é injetado como mensagem `user` adicional, preservando os prompts versionados. O `ai-orchestrator` não faz RAG próprio — herda o contexto via seus especialistas para evitar chamadas duplicadas. `recommend-content` é motor determinístico (sem LLM) e permanece fora do RAG.

## Enterprise Settings

Rota `/enterprise/rh/configuracoes` (Sub-fases A/B/C — Fase 18). 11 abas persistindo em `organizations`, `organization_settings` e bucket `org-branding`. Detalhes em `ENTERPRISE_SETTINGS.md`.

## Backup & Disaster Recovery

Rota `/admin/system/backup` (platform_admin). Tabelas: `backup_jobs`, `backup_schedules`, `restore_jobs`, `health_checks`, `backup_logs`, `backup_policies`. Ver [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md). Integrações externas (Supabase Backups, S3, GCS, Azure Blob) preparadas na arquitetura, ainda não conectadas.
