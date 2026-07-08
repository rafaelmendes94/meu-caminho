# SECURITY_REPORT.md — Fase 17

Auditoria de segurança da plataforma Enterprise v1.0.

## 1. Row Level Security
- Todas as tabelas do schema `public` têm RLS **habilitado**.
- Nenhum policy `USING (true)` para leitura em tabelas com dados de organização.
- Papel de usuário armazenado em `user_roles` (nunca em `profiles`). Verificação via `has_role` / `has_any_role` (SECURITY DEFINER) — sem risco de recursão.
- Toda RPC agregadora valida `has_any_role(['owner','rh_admin'])` **e** `_organization_id = current_organization_id()`.
- K-anonimato ≥ 5 é aplicado em: `get_weekly_checkin_aggregate`, `get_pulse_aggregate`, `get_emotional_map`, `org_node_indicators`, `get_rh_dashboard_summary`, `get_dna_context`, `get_predictive_context`, `calculate_organizational_score`.
- `impact_measurements`, `impact_timelines`, `organizational_scores`, `weekly_ai_insights`, `organizational_dna_reports`, `predictive_signals`, `alerts`: leitura restrita a owner/rh_admin da mesma organização; escrita restrita a `service_role`.
- `ritual_participations`: colaborador só vê/gerencia a própria participação; RH não acessa dados individuais.

## 2. Grants
- Todas as tabelas criadas em migrations têm `GRANT` explícito para `authenticated` e `service_role`. Nenhuma grant desnecessária para `anon`.

## 3. Edge Functions
- Todas usam `corsHeaders` do `npm:@supabase/supabase-js@2/cors`.
- `executive-ai`, `generate-organizational-dna`, `generate-weekly-insights`, `generate-intelligent-ritual`, `generate-action-plan`, `onboarding-chat`, `generate-employee-profile`: chamam Lovable AI Gateway com `LOVABLE_API_KEY` (nunca exposto ao cliente).
- Todas validam JWT em código (JWT verify desativado no gateway por design da plataforma).
- Todas validam corpo com Zod ou checagem manual e retornam 400 em input inválido.
- Tratamento de `429` (rate limit) e `402` (créditos) presente nas funções que chamam IA.

## 4. Segredos
- Nenhum segredo em código-fonte ou `.env` público.
- Segredos gerenciados: `LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY(S)`, `SUPABASE_SECRET_KEYS`, `SUPABASE_JWKS`, `SUPABASE_DB_URL`.
- `SUPABASE_SERVICE_ROLE_KEY` usado apenas em edge functions.

## 5. Auth
- Signup: email/senha + Google (padrão Lovable Cloud).
- Redirect OAuth: `window.location.origin`.
- Sessão persistida via SDK Supabase (localStorage) — padrão seguro.
- Sem confirmação automática de e-mail em produção; usar Auth Settings.
- PIN infantil escopo apenas ao próprio perfil (memória do usuário respeitada).

## 6. Prompt Injection
- Prompts do sistema em `executive-ai`, `generate-*`, `onboarding-chat` incluem instruções firmes:
  - "Nunca produzir diagnóstico clínico"
  - "Nunca identificar pessoas"
  - "Utilizar apenas dados agregados"
  - "Responder em JSON estruturado" (onde aplicável)
- Recomenda-se adicionar `response_format: { type: "json_object" }` onde a resposta precisa ser JSON estruturado.

## 7. Storage
- Nenhum bucket ativo. Sem uploads públicos.

## 8. Cron
- `pg_cron` roda: cálculo diário de score (`compute-organizational-score`), snapshot org chart, detecção de sinais preditivos, insights semanais. Endpoints protegidos por `SUPABASE_SERVICE_ROLE_KEY`.

## 9. Rate limit
- Delegado ao Lovable AI Gateway (429) + limites naturais do PostgREST.
- Sugerido (próxima fase): middleware por-organização em edge functions com contadores em Redis / tabela dedicada.

## 10. Findings
| Severidade | Item | Ação |
|---|---|---|
| info | Uso pontual de `any` em respostas de RPC no frontend | Tipar com generated types em próxima iteração |
| info | Ausência de rate-limit por organização | Roadmap Fase 18 |
| info | Falta de auditoria estruturada de acessos RH | Melhorar `EnterpriseAuditLogsScreen` — Fase 18 |

**Nenhum finding crítico ou high.**