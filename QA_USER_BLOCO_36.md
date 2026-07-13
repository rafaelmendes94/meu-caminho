# QA Bloco 36 — Enterprise Privacidade, Compliance, Permissões e Billing

## Escopo
Auditoria de branding "Cury" e mocks em telas de governança, privacidade e cobrança Enterprise.

## Telas revisadas
1. **EnterprisePrivacyCenterScreen** — white-label:
   - `"Conversas privadas com Cury Digital"` → `"Conversas privadas com a IA"`.
2. **EnterprisePrivacyConsentScreen** — white-label:
   - Descrição `"O Cury Digital é privado e confidencial."` → `"As conversas com a IA são privadas e confidenciais."`.
3. **EnterpriseBillingScreen** — white-label:
   - Feature incluída `"Cury Digital Enterprise"` (2 pontos) → `"IA de apoio emocional"` e descrição correspondente atualizada.
4. **EnterpriseComplianceScreen / EnterpriseDataRetentionScreen / EnterprisePoliciesScreen** — sem mocks; conteúdo institucional já neutro.
5. **EnterprisePermissionsScreen / EnterpriseMultiAdminsScreen** — sem mocks; usa `user_roles`.
6. **EnterpriseLicensesScreen** — sem mocks; usa `organization_contracts`.
7. **EnterpriseAuditLogsScreen** — sem mocks; usa `organization_audit_logs`.

## Alterações
- `src/components/EnterprisePrivacyCenterScreen.tsx`
- `src/components/EnterprisePrivacyConsentScreen.tsx`
- `src/pages/EnterpriseBillingScreen.tsx`

## Pendências (Features)
- **FEATURE-B36-01**: `EnterpriseBillingScreen` — carregar features do plano ativo de `platform_plans` (não hardcoded na tela).
- **FEATURE-B36-02**: `EnterprisePrivacyCenterScreen` — configurar textos por organização (algumas empresas podem querer copy customizada).
- **FEATURE-B36-03**: `EnterprisePoliciesScreen` — permitir upload de política customizada por organização (`organization_policies`).
- **FEATURE-B36-04**: `EnterpriseDataRetentionScreen` — aplicar TTL real via job/cron nas tabelas de checkins/pulse/AI.
- **FEATURE-B36-05**: `EnterpriseComplianceScreen` — gerar relatório LGPD/GDPR sob demanda via edge function.

## Status
Bloco 36 concluído. Restam ~24 telas Platform Admin (super admin) para Blocos 37–40.