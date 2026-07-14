ALTER TABLE public.organization_settings REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.organization_settings;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;