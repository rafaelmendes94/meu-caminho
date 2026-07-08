
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('owner', 'rh_admin', 'leader', 'employee', 'b2c_user');
CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'grace_period');

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  cnpj text,
  domain text,
  logo_url text,
  subscription_status public.subscription_status DEFAULT 'trialing',
  trial_ends_at timestamptz,
  licenses_total int DEFAULT 0,
  licenses_used int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id),
  full_name text,
  display_name text,
  avatar_url text,
  job_title text,
  department text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, organization_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- PRIVACY CONSENTS
CREATE TABLE public.privacy_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id),
  consent_type text NOT NULL,
  version text NOT NULL,
  accepted_at timestamptz DEFAULT now(),
  ip inet,
  user_agent text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.privacy_consents TO authenticated;
GRANT ALL ON public.privacy_consents TO service_role;
ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;

-- FUNCTIONS
CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = _role
      AND (
        ur.organization_id IS NULL
        OR ur.organization_id = public.current_organization_id()
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_roles public.app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY(_roles)
      AND (
        ur.organization_id IS NULL
        OR ur.organization_id = public.current_organization_id()
      )
  )
$$;

-- POLICIES: organizations
CREATE POLICY "org_select_own" ON public.organizations
  FOR SELECT TO authenticated
  USING (id = public.current_organization_id());

CREATE POLICY "org_update_owner" ON public.organizations
  FOR UPDATE TO authenticated
  USING (id = public.current_organization_id() AND public.has_role('owner'))
  WITH CHECK (id = public.current_organization_id() AND public.has_role('owner'));

-- POLICIES: profiles
CREATE POLICY "profiles_select_self" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_select_org_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::public.app_role[])
  );

CREATE POLICY "profiles_update_org_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::public.app_role[])
  )
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::public.app_role[])
  );

-- POLICIES: user_roles
CREATE POLICY "roles_select_self" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "roles_select_org_admin" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::public.app_role[])
  );

CREATE POLICY "roles_insert_owner" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_role('owner')
  );

CREATE POLICY "roles_update_owner" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_role('owner')
  )
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_role('owner')
  );

CREATE POLICY "roles_delete_owner" ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_role('owner')
  );

-- POLICIES: privacy_consents
CREATE POLICY "consents_select_self" ON public.privacy_consents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "consents_insert_self" ON public.privacy_consents
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "consents_select_org_admin" ON public.privacy_consents
  FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::public.app_role[])
  );

-- TRIGGER: new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (NEW.id, NULL, 'b2c_user')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
