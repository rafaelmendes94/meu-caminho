
-- ============ onboarding_interviews ============
CREATE TABLE public.onboarding_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','abandoned')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  message_count int NOT NULL DEFAULT 0,
  model_used text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_onboarding_interviews_user ON public.onboarding_interviews(user_id);
CREATE INDEX idx_onboarding_interviews_org ON public.onboarding_interviews(organization_id);

GRANT SELECT, INSERT, UPDATE ON public.onboarding_interviews TO authenticated;
GRANT ALL ON public.onboarding_interviews TO service_role;

ALTER TABLE public.onboarding_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own interviews select" ON public.onboarding_interviews
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own interviews insert" ON public.onboarding_interviews
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own interviews update" ON public.onboarding_interviews
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_onboarding_interviews_updated
  BEFORE UPDATE ON public.onboarding_interviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ onboarding_messages ============
CREATE TABLE public.onboarding_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES public.onboarding_interviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  dimension_tags text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_onboarding_messages_interview ON public.onboarding_messages(interview_id);
CREATE INDEX idx_onboarding_messages_user ON public.onboarding_messages(user_id);

GRANT SELECT, INSERT ON public.onboarding_messages TO authenticated;
GRANT ALL ON public.onboarding_messages TO service_role;

ALTER TABLE public.onboarding_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own messages select" ON public.onboarding_messages
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own messages insert" ON public.onboarding_messages
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============ employee_profiles ============
CREATE TABLE public.employee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_professional jsonb NOT NULL DEFAULT '{}'::jsonb,
  profile_development jsonb NOT NULL DEFAULT '{}'::jsonb,
  profile_leadership jsonb NOT NULL DEFAULT '{}'::jsonb,
  profile_communication jsonb NOT NULL DEFAULT '{}'::jsonb,
  profile_energy jsonb NOT NULL DEFAULT '{}'::jsonb,
  profile_engagement jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text,
  confidence text NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low','medium','high')),
  version int NOT NULL DEFAULT 1,
  generated_by_model text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_employee_profiles_org ON public.employee_profiles(organization_id);

GRANT SELECT, INSERT, UPDATE ON public.employee_profiles TO authenticated;
GRANT ALL ON public.employee_profiles TO service_role;

ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

-- Somente o próprio colaborador pode ler/gravar o próprio perfil.
CREATE POLICY "own profile select" ON public.employee_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own profile insert" ON public.employee_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own profile update" ON public.employee_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_employee_profiles_updated
  BEFORE UPDATE ON public.employee_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ View segura para RH (agregações) ============
CREATE OR REPLACE VIEW public.employee_profiles_rh_view
WITH (security_invoker = true) AS
SELECT
  ep.organization_id,
  ep.user_id,
  COALESCE((ep.profile_leadership->>'is_leader')::boolean, false) AS is_leader,
  NULLIF(ep.profile_communication->>'feedback_style','') AS communication_style,
  NULLIF((ep.profile_energy->>'baseline_energy'),'')::numeric AS energy_baseline,
  NULLIF((ep.profile_engagement->>'purpose_alignment'),'')::numeric AS engagement_level,
  ep.generated_at
FROM public.employee_profiles ep
WHERE public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  AND ep.organization_id = public.current_organization_id();

GRANT SELECT ON public.employee_profiles_rh_view TO authenticated;
