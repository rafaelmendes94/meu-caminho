
CREATE TABLE public.enterprise_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  job_title text,
  department text,
  role app_role NOT NULL DEFAULT 'employee',
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '72 hours'),
  accepted_at timestamptz,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX enterprise_invites_org_idx ON public.enterprise_invites(organization_id);
CREATE INDEX enterprise_invites_email_idx ON public.enterprise_invites(email);
CREATE INDEX enterprise_invites_token_idx ON public.enterprise_invites(token_hash);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.enterprise_invites TO authenticated;
GRANT ALL ON public.enterprise_invites TO service_role;

ALTER TABLE public.enterprise_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_select_admins"
  ON public.enterprise_invites FOR SELECT
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

CREATE POLICY "invites_insert_admins"
  ON public.enterprise_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

CREATE POLICY "invites_update_admins"
  ON public.enterprise_invites FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  )
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

CREATE TRIGGER enterprise_invites_updated_at
  BEFORE UPDATE ON public.enterprise_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
