
CREATE TABLE public.job_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_positions TO authenticated;
GRANT ALL ON public.job_positions TO service_role;

ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members view job positions"
ON public.job_positions FOR SELECT
TO authenticated
USING (organization_id = public.current_organization_id());

CREATE POLICY "RH manage job positions insert"
ON public.job_positions FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

CREATE POLICY "RH manage job positions update"
ON public.job_positions FOR UPDATE
TO authenticated
USING (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

CREATE POLICY "RH manage job positions delete"
ON public.job_positions FOR DELETE
TO authenticated
USING (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

CREATE TRIGGER job_positions_set_updated_at
BEFORE UPDATE ON public.job_positions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_job_positions_org ON public.job_positions(organization_id);
