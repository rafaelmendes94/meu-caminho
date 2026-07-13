-- content-images: keep restrictive policy, drop the permissive one
DROP POLICY IF EXISTS "content_content_images_auth_read" ON storage.objects;

-- content-audio: replace permissive with restrictive
DROP POLICY IF EXISTS "content_content_audio_auth_read" ON storage.objects;
CREATE POLICY "cms read content-audio"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'content-audio'
  AND (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.content_items ci
      WHERE ci.status = 'published'
        AND (
          ci.file_url  LIKE '%' || storage.objects.name
          OR ci.media_url LIKE '%' || storage.objects.name
        )
    )
  )
);

-- content-video: replace permissive with restrictive
DROP POLICY IF EXISTS "content_content_video_auth_read" ON storage.objects;
CREATE POLICY "cms read content-video"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'content-video'
  AND (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.content_items ci
      WHERE ci.status = 'published'
        AND (
          ci.file_url  LIKE '%' || storage.objects.name
          OR ci.media_url LIKE '%' || storage.objects.name
        )
    )
  )
);

-- content-pdf: replace permissive with restrictive
DROP POLICY IF EXISTS "content_content_pdf_auth_read" ON storage.objects;
CREATE POLICY "cms read content-pdf"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'content-pdf'
  AND (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.content_items ci
      WHERE ci.status = 'published'
        AND (
          ci.file_url  LIKE '%' || storage.objects.name
          OR ci.media_url LIKE '%' || storage.objects.name
        )
    )
  )
);

-- Remove unused SECURITY DEFINER view (not referenced by any application code)
DROP VIEW IF EXISTS public.employee_profiles_rh_view;
