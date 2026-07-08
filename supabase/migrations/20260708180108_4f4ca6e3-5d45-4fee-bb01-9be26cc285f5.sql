
CREATE TABLE public.intelligent_rituals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  ritual_type text NOT NULL DEFAULT 'custom' CHECK (ritual_type IN ('energy','communication','recovery','leadership','engagement','collaboration','reflection','custom')),
  source_type text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('weekly_insight','predictive_signal','dna','manual')),
  source_id uuid,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','completed','canceled')),
  scheduled_at timestamptz,
  duration_minutes int NOT NULL DEFAULT 15,
  audience text NOT NULL DEFAULT 'all',
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_outcome text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_by_ai boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_intelligent_rituals_org ON public.intelligent_rituals(organization_id);
CREATE INDEX idx_intelligent_rituals_status ON public.intelligent_rituals(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.intelligent_rituals TO authenticated;
GRANT ALL ON public.intelligent_rituals TO service_role;

ALTER TABLE public.intelligent_rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RH manages rituals of own organization"
  ON public.intelligent_rituals
  FOR ALL
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  )
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

CREATE POLICY "Members view published rituals of own organization"
  ON public.intelligent_rituals
  FOR SELECT
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND status = 'published'
  );

CREATE TRIGGER trg_intelligent_rituals_updated_at
  BEFORE UPDATE ON public.intelligent_rituals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.ritual_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id uuid NOT NULL REFERENCES public.intelligent_rituals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  feedback_score int CHECK (feedback_score BETWEEN 1 AND 5),
  feedback_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ritual_id, user_id)
);

CREATE INDEX idx_ritual_participations_ritual ON public.ritual_participations(ritual_id);
CREATE INDEX idx_ritual_participations_user ON public.ritual_participations(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ritual_participations TO authenticated;
GRANT ALL ON public.ritual_participations TO service_role;

ALTER TABLE public.ritual_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own participation"
  ON public.ritual_participations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_ritual_participations_updated_at
  BEFORE UPDATE ON public.ritual_participations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
