
CREATE POLICY "platform_admin manage org-logos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'org-logos' AND public.is_platform_admin())
WITH CHECK (bucket_id = 'org-logos' AND public.is_platform_admin());

CREATE POLICY "authenticated read org-logos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'org-logos');
