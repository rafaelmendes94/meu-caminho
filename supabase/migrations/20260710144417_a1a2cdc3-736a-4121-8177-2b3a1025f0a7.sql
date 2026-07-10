
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.predictive_signals REPLICA IDENTITY FULL;
ALTER TABLE public.action_plans REPLICA IDENTITY FULL;
ALTER TABLE public.action_plan_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.weekly_ai_insights REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.predictive_signals; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.action_plans; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.action_plan_tasks; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_ai_insights; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
