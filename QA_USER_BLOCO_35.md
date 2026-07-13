# QA Bloco 35 — Enterprise Setup, Onboarding e Boas-vindas

## Escopo
Auditoria de mocks nas telas de configuração inicial da conta Enterprise e comunicação de lançamento.

## Telas revisadas
1. **EnterpriseSetupScreen** — sem mocks; roteia para os passos do onboarding.
2. **EnterpriseOnboardingScreen** — sem mocks; wizard estrutural (formulários + salvamento incremental).
3. **EnterpriseWelcomeScreen / EnterpriseWelcomeJourneyScreen** — sem mocks; conteúdo estático de boas-vindas.
4. **EnterpriseCompanySettingsScreen** — sem mocks; consome `organizations` + `organization_settings`.
5. **EnterpriseUnitsScreen** — sem mocks; usa `units` via supabase.
6. **EnterpriseDomainAccessScreen** — sem mocks; usa `organization_settings` para domínios permitidos.
7. **EnterpriseLaunchCommunicationScreen** — sem mocks; templates parametrizáveis já vazios.
8. **EnterpriseRoadmapScreen** — sem mocks; roadmap estrutural.
9. **EnterpriseSupportScreen** — sem mocks; usa `support_tickets`.
10. **EnterpriseRHWelcomeScreen / EnterpriseRHLoginScreen** — sem mocks; layouts de entrada.

## Alterações
Nenhum patch necessário — todas as telas já estão sem branding "Cury/Augusto" e sem arrays hardcoded de conteúdo.

## Pendências (Features)
- **FEATURE-B35-01**: `EnterpriseOnboardingScreen` — persistir progresso do wizard em `organizations.onboarding_step` (ou nova coluna) para retomar.
- **FEATURE-B35-02**: `EnterpriseLaunchCommunicationScreen` — usar Resend/edge function para disparar email/Slack de lançamento para toda a base após aprovação.
- **FEATURE-B35-03**: `EnterpriseRoadmapScreen` — carregar marcos do produto de tabela `platform_roadmap` (org-agnostic) ou hardcoded controlado por platform admin.
- **FEATURE-B35-04**: `EnterpriseDomainAccessScreen` — validar e rejeitar convites com email fora dos domínios configurados.
- **FEATURE-B35-05**: `EnterpriseSetupScreen` — indicador visual de progresso baseado nos passos concluídos (integração com `organization_settings`).

## Status
Bloco 35 concluído. Pronto para o **Bloco 36**.