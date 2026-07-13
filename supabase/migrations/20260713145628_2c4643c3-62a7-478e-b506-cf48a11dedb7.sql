
-- 1) Restrict organizations SELECT to owner/rh_admin (+ platform admin already covered by separate policy)
DROP POLICY IF EXISTS "org_select_own" ON public.organizations;
CREATE POLICY "org_select_admins" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

-- Safe RPC for regular members to read basic org info (name/logo/slug/licenses/subscription_status)
CREATE OR REPLACE FUNCTION public.get_my_organization()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo_url text,
  subscription_status subscription_status,
  licenses_total integer,
  licenses_used integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.name, o.slug, o.logo_url, o.subscription_status, o.licenses_total, o.licenses_used
  FROM public.organizations o
  WHERE o.id = public.current_organization_id()
$$;

REVOKE ALL ON FUNCTION public.get_my_organization() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_organization() TO authenticated, service_role;

-- 2) Storage buckets: require the object be referenced by a published content_items row (or admin)
DROP POLICY IF EXISTS "cms read content-covers" ON storage.objects;
CREATE POLICY "cms read content-covers" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'content-covers' AND (
      public.is_platform_admin() OR EXISTS (
        SELECT 1 FROM public.content_items ci
        WHERE ci.status = 'published'
          AND (ci.cover_url LIKE '%' || storage.objects.name
               OR ci.banner_url LIKE '%' || storage.objects.name)
      )
    )
  );

DROP POLICY IF EXISTS "cms read content-books" ON storage.objects;
CREATE POLICY "cms read content-books" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'content-books' AND (
      public.is_platform_admin() OR EXISTS (
        SELECT 1 FROM public.content_items ci
        WHERE ci.status = 'published'
          AND (ci.file_url LIKE '%' || storage.objects.name
               OR ci.media_url LIKE '%' || storage.objects.name)
      )
    )
  );

DROP POLICY IF EXISTS "cms read content-videos" ON storage.objects;
CREATE POLICY "cms read content-videos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'content-videos' AND (
      public.is_platform_admin() OR EXISTS (
        SELECT 1 FROM public.content_items ci
        WHERE ci.status = 'published'
          AND (ci.file_url LIKE '%' || storage.objects.name
               OR ci.media_url LIKE '%' || storage.objects.name)
      )
    )
  );

DROP POLICY IF EXISTS "cms read content-audios" ON storage.objects;
CREATE POLICY "cms read content-audios" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'content-audios' AND (
      public.is_platform_admin() OR EXISTS (
        SELECT 1 FROM public.content_items ci
        WHERE ci.status = 'published'
          AND (ci.file_url LIKE '%' || storage.objects.name
               OR ci.media_url LIKE '%' || storage.objects.name)
      )
    )
  );

DROP POLICY IF EXISTS "cms read content-materials" ON storage.objects;
CREATE POLICY "cms read content-materials" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'content-materials' AND (
      public.is_platform_admin() OR EXISTS (
        SELECT 1 FROM public.content_items ci
        WHERE ci.status = 'published'
          AND (ci.file_url LIKE '%' || storage.objects.name
               OR ci.media_url LIKE '%' || storage.objects.name)
      )
    )
  );

DROP POLICY IF EXISTS "cms read content-images" ON storage.objects;
CREATE POLICY "cms read content-images" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'content-images' AND (
      public.is_platform_admin() OR EXISTS (
        SELECT 1 FROM public.content_items ci
        WHERE ci.status = 'published'
          AND (ci.cover_url LIKE '%' || storage.objects.name
               OR ci.banner_url LIKE '%' || storage.objects.name
               OR ci.file_url  LIKE '%' || storage.objects.name
               OR ci.media_url LIKE '%' || storage.objects.name)
      )
    )
  );
