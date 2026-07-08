
CREATE TABLE public.action_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  source_type text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('dna','predictive_signal','alert','executive_ai','manual')),
  source_id uuid,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed','canceled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  due_date date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.action_plans TO authenticated;
GRANT ALL ON public.action_plans TO service_role;

ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RH manage action_plans in org"
ON public.action_plans FOR ALL
TO authenticated
USING (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
)
WITH CHECK (
  organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

CREATE INDEX idx_action_plans_org ON public.action_plans(organization_id);
CREATE INDEX idx_action_plans_status ON public.action_plans(status);

CREATE TRIGGER trg_action_plans_updated_at
BEFORE UPDATE ON public.action_plans
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.action_plan_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id uuid NOT NULL REFERENCES public.action_plans(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.action_plan_tasks TO authenticated;
GRANT ALL ON public.action_plan_tasks TO service_role;

ALTER TABLE public.action_plan_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RH manage action_plan_tasks in org"
ON public.action_plan_tasks FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.action_plans ap
    WHERE ap.id = action_plan_tasks.action_plan_id
      AND ap.organization_id = public.current_organization_id()
      AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.action_plans ap
    WHERE ap.id = action_plan_tasks.action_plan_id
      AND ap.organization_id = public.current_organization_id()
      AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  )
);

CREATE INDEX idx_action_plan_tasks_plan ON public.action_plan_tasks(action_plan_id);

CREATE TRIGGER trg_action_plan_tasks_updated_at
BEFORE UPDATE ON public.action_plan_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
