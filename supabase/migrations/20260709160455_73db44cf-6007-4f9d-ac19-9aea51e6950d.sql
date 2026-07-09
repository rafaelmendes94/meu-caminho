
-- Policies para storage.objects nos buckets de conteúdo
DO $$
DECLARE b text;
BEGIN
  FOR b IN SELECT unnest(ARRAY['content-covers','content-books','content-videos','content-audios','content-materials','content-images']) LOOP
    EXECUTE format($p$
      CREATE POLICY %I ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = %L);
    $p$, 'cms read ' || b, b);
    EXECUTE format($p$
      CREATE POLICY %I ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = %L AND public.is_platform_admin());
    $p$, 'cms insert ' || b, b);
    EXECUTE format($p$
      CREATE POLICY %I ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = %L AND public.is_platform_admin());
    $p$, 'cms update ' || b, b);
    EXECUTE format($p$
      CREATE POLICY %I ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = %L AND public.is_platform_admin());
    $p$, 'cms delete ' || b, b);
  END LOOP;
END $$;
