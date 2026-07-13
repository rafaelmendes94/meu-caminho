# RC_REMAINING_ISSUES — pendências não-bloqueantes

Somente itens reais observados. Nada aqui bloqueia go-live do MVP.

## Baixa prioridade — cosmético / conteúdo

| # | Área | Arquivo | Descrição | Ação sugerida |
|---|---|---|---|---|
| R-01 | Marketing/Footer | `src/components/RevealFooter.tsx` | 9 âncoras `href="#"` (Conteúdo, Enterprise, Suporte, Privacidade, Termos, Cookies, Instagram, LinkedIn, YouTube) sem destino | Definir URLs reais (páginas legais + redes) antes de publicação institucional; enquanto isso, substituir por `<span>` ou apontar para rotas existentes |

## Média prioridade — UX (proposto para RC-03, fora do escopo conservador de RC-02)

| # | Área | Arquivo | Descrição | Ação sugerida |
|---|---|---|---|---|
| R-02 | Platform + Enterprise | 15 arquivos (ver lista abaixo) | Uso de `window.confirm()` nativo para ações destrutivas | Migrar para `AlertDialog` (shadcn) — muda visual, portanto deve ser fase dedicada |
| R-03 | Colaborador | telas com "Carregando…" textual | Substituir por `Skeleton` do padrão atual (já listado no backlog RC-01) | Ampliação de skeletons |

### Arquivos com `window.confirm` (R-02)

```
src/components/EnterpriseActionPlanScreen.tsx
src/components/EnterpriseDepartmentsScreen.tsx
src/components/EnterpriseEmployeeAdminScreen.tsx
src/pages/EnterpriseUnitsScreen.tsx
src/pages/MyPrivacyScreen.tsx
src/pages/PlatformContentAuthorsScreen.tsx
src/pages/PlatformContentCategoriesScreen.tsx
src/pages/PlatformContentCollectionsScreen.tsx
src/pages/PlatformContentCourseBuilderScreen.tsx
src/pages/PlatformContentItemsListScreen.tsx
src/pages/PlatformContentTagsScreen.tsx
src/pages/PlatformOrganizationDetailScreen.tsx
src/pages/PlatformOrganizationsScreen.tsx
src/pages/PlatformOwnersScreen.tsx
src/pages/PlatformSettingsScreen.tsx
```

## Bloqueadores externos (não são bugs)

| # | Item | Detalhe |
|---|---|---|
| B-01 | BLK-01 QA humano E2E | Requer execução manual dos 27 passos (`QA_E2E_PILOTO.md`) |
| B-02 | BLK-08 e-mail transacional | Aguardando domínio verificado pelo cliente |