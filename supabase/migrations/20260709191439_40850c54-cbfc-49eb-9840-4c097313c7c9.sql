
-- =========================
-- platform_plans
-- =========================
CREATE TABLE public.platform_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  plan_type text NOT NULL DEFAULT 'standard' CHECK (plan_type IN ('standard','enterprise','custom')),
  default_licenses int NOT NULL DEFAULT 0,
  min_licenses int DEFAULT 0,
  max_licenses int,
  price_monthly_cents int NOT NULL DEFAULT 0,
  price_yearly_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly','custom')),
  included_modules jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  support_level text NOT NULL DEFAULT 'standard',
  is_public boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_plans TO authenticated;
GRANT ALL ON public.platform_plans TO service_role;

ALTER TABLE public.platform_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform admin manages plans"
  ON public.platform_plans
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE TRIGGER platform_plans_updated_at
  BEFORE UPDATE ON public.platform_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- organization_contracts
-- =========================
CREATE TABLE public.organization_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.platform_plans(id) ON DELETE SET NULL,
  contract_type text NOT NULL DEFAULT 'standard' CHECK (contract_type IN ('standard','custom')),
  licenses_total int NOT NULL DEFAULT 0,
  price_monthly_cents int NOT NULL DEFAULT 0,
  price_yearly_cents int NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly','custom')),
  contract_start date,
  contract_end date,
  trial_ends_at timestamptz,
  grace_period_ends_at timestamptz,
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','canceled','suspended','expired')),
  custom_terms text,
  enabled_modules jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_limits_override jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_contracts TO authenticated;
GRANT ALL ON public.organization_contracts TO service_role;

ALTER TABLE public.organization_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform admin manages contracts"
  ON public.organization_contracts
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE TRIGGER organization_contracts_updated_at
  BEFORE UPDATE ON public.organization_contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Sync organizations from contracts
CREATE OR REPLACE FUNCTION public.sync_org_from_contract()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mapped_status public.subscription_status;
BEGIN
  mapped_status := CASE NEW.status
    WHEN 'trialing' THEN 'trialing'::public.subscription_status
    WHEN 'active' THEN 'active'::public.subscription_status
    WHEN 'past_due' THEN 'past_due'::public.subscription_status
    WHEN 'canceled' THEN 'canceled'::public.subscription_status
    WHEN 'suspended' THEN 'past_due'::public.subscription_status
    WHEN 'expired' THEN 'canceled'::public.subscription_status
    ELSE 'trialing'::public.subscription_status
  END;

  UPDATE public.organizations
     SET licenses_total = NEW.licenses_total,
         subscription_status = mapped_status,
         trial_ends_at = NEW.trial_ends_at,
         mrr_cents = NEW.price_monthly_cents,
         updated_at = now()
   WHERE id = NEW.organization_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER organization_contracts_sync
  AFTER INSERT OR UPDATE ON public.organization_contracts
  FOR EACH ROW EXECUTE FUNCTION public.sync_org_from_contract();

-- =========================
-- Seeds
-- =========================
INSERT INTO public.platform_plans (name, slug, description, plan_type, default_licenses, min_licenses, max_licenses, billing_cycle, sort_order, is_public, is_active)
VALUES
  ('Plano 1.000', 'plano-1000', 'Plano padrão até 1.000 licenças.', 'standard', 1000, 1, 1000, 'monthly', 10, true, true),
  ('Plano 5.000', 'plano-5000', 'Plano padrão até 5.000 licenças.', 'standard', 5000, 1001, 5000, 'monthly', 20, true, true),
  ('Plano 10.000', 'plano-10000', 'Plano padrão até 10.000 licenças.', 'standard', 10000, 5001, 10000, 'monthly', 30, true, true),
  ('Enterprise Personalizado', 'enterprise-custom', 'Condições comerciais personalizadas.', 'enterprise', 0, 0, NULL, 'custom', 40, false, true)
ON CONFLICT (slug) DO NOTHING;
