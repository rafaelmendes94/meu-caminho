# RLS.md — Enterprise v1.0

## Regras universais
1. Toda tabela em `public` tem RLS habilitado.
2. Papéis vêm de `user_roles`, nunca de `profiles`.
3. Toda verificação de papel usa `has_role` ou `has_any_role` (SECURITY DEFINER, sem recursão).
4. Toda RPC agregadora valida `_organization_id = current_organization_id()`.
5. K-anonimato ≥ 5 obrigatório em qualquer agregação exposta ao RH.

## Matriz de acesso (resumo)

| Tabela | employee | rh_admin / owner | service_role |
|---|---|---|---|
| `profiles` | próprio + colegas mesma org (leitura) | full na org | full |
| `user_roles` | próprio (leitura) | full na org | full |
| `emotional_checkins` | próprio (CRUD) | ❌ (só agregados via RPC) | full |
| `pulse_responses` | próprio (CRUD) | ❌ (só agregados via RPC) | full |
| `alerts` | ❌ | leitura na org | full |
| `predictive_signals` | ❌ | leitura na org | full |
| `organizational_dna_reports` | ❌ | leitura na org | full |
| `weekly_ai_insights` | ❌ | leitura na org | full |
| `organizational_scores` | ❌ | leitura na org | full |
| `impact_measurements`, `impact_timelines` | ❌ | leitura na org | full |
| `action_plans`, `action_plan_tasks` | atribuído (leitura) | full na org | full |
| `intelligent_rituals` | leitura (publicado) | full na org | full |
| `ritual_participations` | próprio (CRUD) | ❌ agregados | full |
| `executive_ai_*` | ❌ | própria conversa | full |
| `onboarding_*` | própria entrevista | leitura na org | full |
| `privacy_consents` | próprio | leitura na org | full |
| `enterprise_invites` | ❌ | full na org | full |

## Padrões de policy
```sql
-- Leitura RH agregada
CREATE POLICY "rh reads org" ON public.<t>
  FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

-- Escrita apenas por service_role (edge functions)
CREATE POLICY "service writes" ON public.<t>
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

## Riscos monitorados
- Nenhuma tabela pública sem RLS.
- Nenhum SECURITY DEFINER sem `SET search_path = public`.
- Nenhum GRANT para `anon` em tabelas com dados de organização.