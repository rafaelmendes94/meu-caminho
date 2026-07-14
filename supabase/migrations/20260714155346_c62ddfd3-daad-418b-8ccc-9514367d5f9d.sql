CREATE POLICY "kh_bucket_admin_all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'knowledge-hub' AND public.has_role('platform_admin'::app_role))
WITH CHECK (bucket_id = 'knowledge-hub' AND public.has_role('platform_admin'::app_role));