# CONSISTENCY_PENDING — pendências reais

Somente itens que exigem escrita/alteração fora do escopo conservador de RC-03. Nada aqui bloqueia o MVP.

## P-01 · Trigger para manter `organizations.licenses_used` derivado

- **Origem:** C-01 do `CONSISTENCY_REPORT.md`.
- **Escopo:** 1 migration (criar função `sync_org_licenses_used()` + trigger `AFTER INSERT/UPDATE OF deleted_at ON profiles`).
- **Efeito esperado:** `licenses_used = COUNT(profiles WHERE organization_id = X AND deleted_at IS NULL)`.
- **Ajuste complementar:** remover o `licenses_used = licenses_used + 1` manual em `accept-enterprise-invite` (o trigger cobre).
- **Risco:** baixo — operação isolada em uma coluna já existente.
- **Estimativa:** 1 migration + 1 pequena edição de edge function.

## P-02 · Unificar leitura de `licenses_total` no RH

- **Origem:** C-02.
- **Escopo:** ajustar `EnterpriseAdminCenterScreen.tsx` para preferir `organizations.licenses_total` quando `organization_contracts.licenses_total` for `null` ou mais antigo que a última mudança em `organizations`.
- **Alternativa canônica:** um único campo (`organizations.licenses_total`) e retirar `licenses_total` de `organization_contracts` (requer migration + data backfill).
- **Risco:** baixo (leitura) / médio (se remover coluna).
- **Estimativa:** 1 patch de front (rápido) ou 1 migration + backfill (canônica).

---

## Não é pendência (fica registrado para não voltar como bug)

- Delay ≤24h em KPIs de `platform_usage_daily` é **esperado** — a agregação é diária por design (cron `compute-platform-usage`). RH e Colaborador leem ao vivo.
- Agregados vazios com <5 colaboradores é **esperado** por k-anon.
- BLK-01 (E2E humano) e BLK-08 (e-mail transacional aguardando domínio) permanecem em `RELEASE_BLOCKERS.md`.