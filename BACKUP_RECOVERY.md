# Backup & Disaster Recovery

Rota: `/admin/system/backup` — acesso somente `platform_admin`.

## Estrutura de dados (public schema, RLS: platform_admin only)
- `backup_jobs` — histórico de backups (tipo, status, tamanho, duração, destino, checksum, metadata)
- `backup_schedules` — políticas agendadas (escopo, frequência, retenção, destino, enabled)
- `restore_jobs` — solicitações de restore com `dry_run`, motivo, resultado e auditoria
- `health_checks` — snapshots por componente (banco, storage, edge functions, cron, IA, buckets, auth, realtime, fila)
- `backup_logs` — trilha de eventos (`backup.started/completed/deleted`, `restore.*`, `schedule.*`, `health.checked`)
- `backup_policies` — configuração chave/valor (retenção padrão, destinos disponíveis, dry-run default)

Enums: `backup_job_type`, `backup_status`, `backup_frequency`, `health_status`.

## UI (`PlatformBackupRecoveryScreen.tsx`)
8 abas: Dashboard, Backups, Restores, Agendamentos, Health Check, Storage, Logs, Políticas.

- Backups manuais por escopo (`database`, `storage`, `content`, `settings`, `ai`, `knowledge`, `full`) — hoje registram o job no banco e concluem em simulação, deixando a superfície pronta para chamar um edge worker real.
- Restores exigem motivo, começam em dry-run por padrão (política `dry_run_default`) e são auditados em `restore_jobs` + `backup_logs`.
- Health check registra latência simulada por componente e alimenta o card "Status geral" do dashboard.
- Storage soma tamanho declarado nos jobs (aproximação até integração com bucket real).
- Políticas mostram JSON editável no banco (retenção 7/30/90/365, destinos `supabase|s3|gcs|azure_blob`).

## Pendências reais
- **Integração externa**: nenhum job hoje transfere bytes para storage externo. Estrutura pronta para plugar `supabase-backups`, S3, GCS e Azure Blob.
- **Edge worker**: criar função `run-backup` / `run-restore` para executar snapshot real de banco e sincronizar buckets.
- **Cron**: agendamentos persistem `next_run_at`, mas não há job pg_cron consumindo — deve ser adicionado quando o worker existir.
- **Checksum**: valor gerado é placeholder até o worker calcular hash real do artefato.
- **Fila e Edge Functions**: componentes exibidos como `unknown` até haver telemetria consolidada.

## Auditoria
Toda ação (backup manual, restore, dry-run, criação/pausa/exclusão de agendamento, health check) grava linha em `backup_logs` com `event`, `level`, `message`, `ref_type` e `ref_id`.