# EDGE_FUNCTIONS.md — Enterprise v1.0

| Função | Objetivo | IA | Auth | Cron |
|---|---|---|---|---|
| `create-organization-admin` | Cria organização + owner | — | JWT | — |
| `send-enterprise-invite` | Envia convite por e-mail | — | JWT (owner/rh_admin) | — |
| `accept-enterprise-invite` | Aceita convite via token | — | JWT | — |
| `onboarding-chat` | Entrevista de onboarding com IA | Lovable AI (Gemini) | JWT | — |
| `generate-employee-profile` | Gera Perfil Inteligente | Lovable AI | JWT | — |
| `snapshot-org-chart` | Salva snapshot do organograma | — | Service | Diário |
| `compute-basic-alerts` | Detecta alertas simples | — | Service | Diário |
| `detect-predictive-signals` | Sinais preditivos | — | Service | 03:00 UTC |
| `generate-organizational-dna` | DNA Organizacional™ | Lovable AI (Gemini Pro) | JWT (owner/rh_admin) | Sob demanda |
| `executive-ai` | Conselho Executivo IA™ (streaming) | Lovable AI | JWT (owner/rh_admin) | — |
| `generate-action-plan` | Plano de ação a partir de sinal/DNA | Lovable AI | JWT (owner/rh_admin) | — |
| `generate-weekly-insights` | Briefing executivo semanal | Lovable AI | Service | Segunda 07:00 UTC |
| `generate-intelligent-ritual` | Rituais Inteligentes™ | Lovable AI | JWT (owner/rh_admin) | — |
| `compute-organizational-score` | Score Organizacional™ | — | Service / JWT | Diário 06:30 UTC |
| `measure-impact` | Motor de Impacto™ | — | JWT (owner/rh_admin) | Sob demanda |

## Padrões
- CORS via `npm:@supabase/supabase-js@2/cors`.
- Validação de entrada com Zod ou checagem manual → 400 em erro.
- Tratamento explícito de `429` (rate limit IA) e `402` (créditos).
- Erros retornam `{ error: string }` com status HTTP semântico.
- Nunca expõem `service_role_key`.