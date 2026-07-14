# Enterprise Settings — Configurações da Empresa

Rota: `/enterprise/rh/configuracoes` (fallback legado em `/enterprise/rh/configuracoes/legado`).
Componente: `src/pages/EnterpriseSettingsScreen.tsx`.
Hook: `src/hooks/useEnterpriseSettings.ts` (fetch em `organization_settings` + save via RPC `enterprise_settings_upsert`).
Acesso: `owner` e `rh_admin` (redireciona `employee`/`leader` para `/enterprise/rh`).

## Abas

| Aba | Persistência | Observações |
|-----|--------------|-------------|
| Empresa | `organizations` (colunas) | Validação de CNPJ e e-mail |
| Branding | `organization_settings.branding` + bucket `org-branding` | Signed URLs, uploads privados |
| Usuários | — | Placeholder (link para `/enterprise/rh/acesso`) |
| Licença | `organizations.plan/licenses_*` + `platform_plans` | Read-only + botão abre ticket em `support_tickets` |
| Regionalização | `organization_settings.regionalization` | timezone/locale/moeda/formatos |
| Jornada | `organization_settings.journey` | horários, carga, banco de horas, workdays |
| Calendário | `organization_settings.calendar_holidays.items` | CRUD (nacional/estadual/municipal/interno/férias/evento) |
| Integrações | — | Estrutura apenas (cards desabilitados) |
| Notificações | `organization_settings.notifications` | matriz evento × canal |
| Segurança | `organization_settings.security` | TTL sessão, senha mín, MFA, providers |
| IA | `organization_settings.ai_settings` | toggles por módulo + tom/modelo/temperatura/idioma |
| Auditoria | `organization_audit_logs` | leitura + filtro + export CSV |

## Bucket `org-branding`

- Privado.
- Path: `{organization_id}/{campo}-{ts}.{ext}`.
- Policies (`storage.objects`): SELECT/INSERT/UPDATE/DELETE para `owner`/`rh_admin` da própria org.
- Preview via `createSignedUrl(path, 3600)`.

## RPC `enterprise_settings_upsert(_key text, _value jsonb)`

- SECURITY DEFINER.
- Restrita a `owner`/`rh_admin` da `current_organization_id()`.
- Upsert em `organization_settings (organization_id, key)` + insert em `organization_audit_logs` com `before_data`/`after_data`.

## Colunas novas em `organizations`

`legal_name`, `email`, `website`, `phone`, `address`, `postal_code`, `description`, `employee_count`.

## Chaves reservadas em `organization_settings`

`branding`, `regionalization`, `journey`, `calendar_holidays`, `notifications`, `ai_settings`, `security`.
(As chaves existentes `checkin_frequency`, `privacy_min_group_size`, `direct_channel` continuam usadas pela tela legada.)