
CREATE TABLE public.gam_xp_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  daily_cap INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_xp_rules TO authenticated;
GRANT ALL ON public.gam_xp_rules TO service_role;
ALTER TABLE public.gam_xp_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_xp_rules read" ON public.gam_xp_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "gam_xp_rules admin" ON public.gam_xp_rules FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  min_xp INTEGER NOT NULL,
  color TEXT, icon TEXT,
  perks JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_levels TO authenticated;
GRANT ALL ON public.gam_levels TO service_role;
ALTER TABLE public.gam_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_levels read" ON public.gam_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "gam_levels admin" ON public.gam_levels FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, description TEXT, category TEXT,
  icon TEXT, image_url TEXT, color TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_badges TO authenticated;
GRANT ALL ON public.gam_badges TO service_role;
ALTER TABLE public.gam_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_badges read" ON public.gam_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "gam_badges admin" ON public.gam_badges FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, description TEXT,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_seasons TO authenticated;
GRANT ALL ON public.gam_seasons TO service_role;
ALTER TABLE public.gam_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_seasons read" ON public.gam_seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "gam_seasons admin" ON public.gam_seasons FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, description TEXT,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
  xp_multiplier NUMERIC NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_events TO authenticated;
GRANT ALL ON public.gam_events TO service_role;
ALTER TABLE public.gam_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_events read" ON public.gam_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "gam_events admin" ON public.gam_events FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL, description TEXT,
  mission_type TEXT NOT NULL DEFAULT 'daily',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  badge_id UUID REFERENCES public.gam_badges(id) ON DELETE SET NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  season_id UUID REFERENCES public.gam_seasons(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.gam_events(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_missions TO authenticated;
GRANT ALL ON public.gam_missions TO service_role;
ALTER TABLE public.gam_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_missions read" ON public.gam_missions FOR SELECT TO authenticated USING (true);
CREATE POLICY "gam_missions admin" ON public.gam_missions FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  badge_id UUID REFERENCES public.gam_badges(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_achievements TO authenticated;
GRANT ALL ON public.gam_achievements TO service_role;
ALTER TABLE public.gam_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_achievements read" ON public.gam_achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "gam_achievements admin" ON public.gam_achievements FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  action_key TEXT NOT NULL,
  xp INTEGER NOT NULL,
  source TEXT, reference_id UUID,
  season_id UUID REFERENCES public.gam_seasons(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.gam_events(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX gam_user_xp_user_idx ON public.gam_user_xp(user_id, created_at DESC);
GRANT SELECT ON public.gam_user_xp TO authenticated;
GRANT ALL ON public.gam_user_xp TO service_role;
ALTER TABLE public.gam_user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_user_xp self" ON public.gam_user_xp FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role('platform_admin'::app_role));
CREATE POLICY "gam_user_xp admin" ON public.gam_user_xp FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.gam_badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(user_id, badge_id)
);
GRANT SELECT ON public.gam_user_badges TO authenticated;
GRANT ALL ON public.gam_user_badges TO service_role;
ALTER TABLE public.gam_user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_user_badges self" ON public.gam_user_badges FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role('platform_admin'::app_role));
CREATE POLICY "gam_user_badges admin" ON public.gam_user_badges FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.gam_missions(id) ON DELETE CASCADE,
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'in_progress',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);
GRANT SELECT, INSERT, UPDATE ON public.gam_user_missions TO authenticated;
GRANT ALL ON public.gam_user_missions TO service_role;
ALTER TABLE public.gam_user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_user_missions self" ON public.gam_user_missions FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role('platform_admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_user_streaks (
  user_id UUID PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  recoveries_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_user_streaks TO authenticated;
GRANT ALL ON public.gam_user_streaks TO service_role;
ALTER TABLE public.gam_user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_user_streaks self" ON public.gam_user_streaks FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role('platform_admin'::app_role));
CREATE POLICY "gam_user_streaks admin" ON public.gam_user_streaks FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.gam_org_settings (
  organization_id UUID PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  hide_xp BOOLEAN NOT NULL DEFAULT false,
  hide_levels BOOLEAN NOT NULL DEFAULT false,
  hide_streak BOOLEAN NOT NULL DEFAULT false,
  hide_badges BOOLEAN NOT NULL DEFAULT false,
  streak_max_recoveries INTEGER NOT NULL DEFAULT 2,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gam_org_settings TO authenticated;
GRANT ALL ON public.gam_org_settings TO service_role;
ALTER TABLE public.gam_org_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gam_org_settings read" ON public.gam_org_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "gam_org_settings admin" ON public.gam_org_settings FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TRIGGER trg_gam_xp_rules_u BEFORE UPDATE ON public.gam_xp_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gam_levels_u BEFORE UPDATE ON public.gam_levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gam_badges_u BEFORE UPDATE ON public.gam_badges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gam_missions_u BEFORE UPDATE ON public.gam_missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gam_achievements_u BEFORE UPDATE ON public.gam_achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gam_seasons_u BEFORE UPDATE ON public.gam_seasons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gam_events_u BEFORE UPDATE ON public.gam_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gam_user_missions_u BEFORE UPDATE ON public.gam_user_missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
