DO $$
DECLARE bkt text;
BEGIN
  FOREACH bkt IN ARRAY ARRAY['content-audio','content-video','content-pdf','content-images'] LOOP
    EXECUTE format($f$
      CREATE POLICY "content_%1$s_admin_write" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = %2$L AND public.is_platform_admin());
    $f$, replace(bkt,'-','_'), bkt);
    EXECUTE format($f$
      CREATE POLICY "content_%1$s_admin_update" ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = %2$L AND public.is_platform_admin())
      WITH CHECK (bucket_id = %2$L AND public.is_platform_admin());
    $f$, replace(bkt,'-','_'), bkt);
    EXECUTE format($f$
      CREATE POLICY "content_%1$s_admin_delete" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = %2$L AND public.is_platform_admin());
    $f$, replace(bkt,'-','_'), bkt);
    EXECUTE format($f$
      CREATE POLICY "content_%1$s_auth_read" ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = %2$L);
    $f$, replace(bkt,'-','_'), bkt);
  END LOOP;
END $$;