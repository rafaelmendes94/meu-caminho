# Bloco 38 — Platform Admin: CMS de Conteúdo

## Escopo
- `PlatformContentDashboardScreen`
- `PlatformContentLibraryScreen`
- `PlatformContentItemsListScreen`
- `PlatformContentAuthorsScreen`
- `PlatformContentCategoriesScreen`
- `PlatformContentTagsScreen`
- `PlatformContentCollectionsScreen` + `PlatformContentCollectionBuilderScreen`
- `PlatformContentCoursesScreen` + `PlatformContentCourseBuilderScreen`
- `PlatformContentTracksScreen` + `PlatformContentTrackBuilderScreen`
- Stubs: `PlatformContentAudiosScreen`, `PlatformContentVideosScreen`, `PlatformContentPodcastsScreen`, `PlatformContentMaterialsScreen`

## Auditoria
Todas as telas ativas leem/gravam em `content_items`, `content_authors`, `content_categories`, `content_tags`, `content_collections(_items)`, `course_modules`, `course_lessons`, `track_items`. Sem mocks nem branding hardcoded.

Stubs (`Audios`, `Videos`, `Podcasts`, `Materials`) são placeholders de 3 linhas — apontar para `PlatformContentItemsListScreen` filtrado por `type`.

## Alterações
- Nenhuma — CMS já opera sobre tabelas reais.

## Pendências (features backend)
- Substituir os 4 stubs por rota filtrada `?type=audio|video|podcast|material` do `PlatformContentItemsListScreen`.
- Upload direto para Supabase Storage (buckets `content-audio`, `content-video`, `content-pdf`) via `supabase.storage`.
- Publicação com fluxo `draft → review → published` (`content_items.status`).
- Versionamento de conteúdo + histórico de edições em `content_audit_logs`.
- Preview de conteúdo antes de publicar.

## Status
✅ Concluído — sem mocks.