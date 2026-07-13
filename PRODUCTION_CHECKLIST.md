# Production Checklist — MVP

Ordem de execução antes de anunciar público.

## Fase 1 — Fechar blockers críticos
- [ ] BLK-01 QA E2E com 5 colaboradores reais (screenshot cada passo)
- [ ] BLK-02 Buckets Storage + upload CMS ligado
- [ ] BLK-03 Code-splitting por rota (React.lazy)
- [ ] BLK-04 pg_cron para `compute-platform-usage` diário 03:00
- [ ] BLK-05 pg_cron para expurgo TTL diário 04:00

## Fase 2 — Fechar blockers altos
- [ ] BLK-06 Rate-limit AI ad-hoc (`platform_settings` + `ai_usage_daily`)
- [ ] BLK-07 `organizations.onboarding_step` persistente
- [ ] BLK-08 Email domain `active` + envio teste
- [ ] BLK-09 Feature toggle por organização

## Fase 3 — Ambiente
- [ ] Publish visibility = **public** (`update_visibility`)
- [ ] Custom domain conectado
- [ ] SEO: title/meta description específicos em `index.html` (não "Lovable App")
- [ ] OG image validada
- [ ] Favicon final
- [ ] Badge "Edit with Lovable" — decidir mostrar/ocultar (Pro+)

## Fase 4 — Segurança
- [ ] Enable **HIBP leaked password protection** (`configure_auth password_hibp_enabled: true`)
- [ ] Confirmar Google OAuth configurado (não só habilitado)
- [ ] Rodar `security--run_security_scan` e resolver findings críticos
- [ ] Confirmar 56/56 tabelas com RLS + GRANT explícito
- [ ] Confirmar `SUPABASE_SERVICE_ROLE_KEY` só em edge functions, nunca no client
- [ ] Rate-limit AI ativo em produção

## Fase 5 — Dados iniciais
- [ ] Seed `platform_settings`:
  - `ai_chat_per_day` = 100
  - `ai_generation_per_day` = 20
  - `privacy_min_group_size` = 5
  - `data_retention_days` = 90
- [ ] Seed `platform_plans` com nomes/preços definitivos (sem "R$ 19" placeholder)
- [ ] Bootstrap platform admin real (`bootstrap-platform-admin` com email do cliente)
- [ ] Remover/marcar `seed-test-users` como não-produção
- [ ] Popular `content_items` com biblioteca inicial (mínimo 20 itens: 5 áudios, 5 vídeos, 5 artigos, 5 PDFs)
- [ ] Popular `pulse_prompts` com perguntas revisadas por psicólogo

## Fase 6 — Observabilidade
- [ ] AI Gateway logs revisados após 24h de tráfego real
- [ ] Edge function logs sem erro sustentado
- [ ] `platform_audit_logs` recebendo eventos de ações admin
- [ ] `organization_audit_logs` recebendo eventos por org
- [ ] Alertas de erro (email/Slack) para 5xx sustentado em edge functions

## Fase 7 — Compliance LGPD
- [ ] Termos de uso publicados e linkados no rodapé
- [ ] Política de privacidade publicada e linkada
- [ ] Consentimento explícito no signup (`consent_events`)
- [ ] Fluxo "Exportar meus dados" funcional
- [ ] Fluxo "Excluir minha conta" funcional (30 dias grace)
- [ ] DPO/contato de privacidade visível
- [ ] Registro de operações de tratamento atualizado

## Fase 8 — Backup e DR
- [ ] Confirmar backup automático do Postgres (Lovable Cloud gerencia)
- [ ] Documentar plano de restore
- [ ] Testar restore em ambiente sandbox

## Fase 9 — Feature flags off para MVP
- [ ] `FEATURE_BILLING` = off
- [ ] `FEATURE_CMS_UPLOAD` = off até BLK-02
- [ ] `FEATURE_RATE_LIMIT_AI` = off até BLK-06
- [ ] `FEATURE_LGPD_EXPORT_AUTOMATED` = off até BLK-10
- [ ] `FEATURE_MODULE_TOGGLE_BY_ORG` = off até BLK-09

## Fase 10 — Aprovação final
- [ ] Reemitir `RELEASE_CANDIDATE_REPORT.md` com todos os 27 passos ✅
- [ ] Assinatura do responsável técnico
- [ ] Assinatura do responsável de produto
- [ ] Comunicar go-live para stakeholders
- [ ] Publicar

---

**Status atual: 0/10 fases completas.**