
-- Helper: user pertence à organização (usa employee_profiles se existir)
CREATE OR REPLACE FUNCTION public.user_in_org(_org UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.employee_profiles ep
    WHERE ep.user_id = auth.uid() AND ep.organization_id = _org
  );
$$;

-- Assinaturas
CREATE TABLE public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.platform_plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'trialing', -- trialing|active|past_due|suspended|canceled|expired
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  currency TEXT NOT NULL DEFAULT 'BRL',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  mrr_cents INTEGER NOT NULL DEFAULT 0,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  gateway TEXT NOT NULL DEFAULT 'manual',
  external_customer_id TEXT,
  external_subscription_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_subscriptions TO authenticated;
GRANT ALL ON public.billing_subscriptions TO service_role;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_subs read own or admin" ON public.billing_subscriptions FOR SELECT TO authenticated
  USING (public.has_role('platform_admin'::app_role) OR public.user_in_org(organization_id));
CREATE POLICY "billing_subs admin manage" ON public.billing_subscriptions FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Faturas
CREATE TABLE public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.billing_subscriptions(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.platform_plans(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'draft', -- draft|open|paid|failed|refunded|void
  due_date DATE,
  paid_at TIMESTAMPTZ,
  gateway TEXT NOT NULL DEFAULT 'manual',
  external_invoice_id TEXT,
  pdf_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_invoices TO authenticated;
GRANT ALL ON public.billing_invoices TO service_role;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_inv read own or admin" ON public.billing_invoices FOR SELECT TO authenticated
  USING (public.has_role('platform_admin'::app_role) OR public.user_in_org(organization_id));
CREATE POLICY "billing_inv admin manage" ON public.billing_invoices FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Cupons
CREATE TABLE public.billing_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- percentage|amount|trial|licenses
  value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  max_redemptions INTEGER,
  redemptions_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_coupons TO authenticated;
GRANT ALL ON public.billing_coupons TO service_role;
ALTER TABLE public.billing_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_coupons read auth" ON public.billing_coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "billing_coupons admin manage" ON public.billing_coupons FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.billing_coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.billing_coupons(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.billing_subscriptions(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.billing_coupon_redemptions TO authenticated;
GRANT ALL ON public.billing_coupon_redemptions TO service_role;
ALTER TABLE public.billing_coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_coupon_red read own or admin" ON public.billing_coupon_redemptions FOR SELECT TO authenticated
  USING (public.has_role('platform_admin'::app_role) OR (organization_id IS NOT NULL AND public.user_in_org(organization_id)));
CREATE POLICY "billing_coupon_red admin manage" ON public.billing_coupon_redemptions FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Add-ons
CREATE TABLE public.billing_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- ai|storage|users|consulting|training|other
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  unit TEXT, -- pack|month|hour|seat
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_addons TO authenticated;
GRANT ALL ON public.billing_addons TO service_role;
ALTER TABLE public.billing_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_addons read auth" ON public.billing_addons FOR SELECT TO authenticated USING (true);
CREATE POLICY "billing_addons admin manage" ON public.billing_addons FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.billing_org_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES public.billing_addons(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_org_addons TO authenticated;
GRANT ALL ON public.billing_org_addons TO service_role;
ALTER TABLE public.billing_org_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_org_addons read own or admin" ON public.billing_org_addons FOR SELECT TO authenticated
  USING (public.has_role('platform_admin'::app_role) OR public.user_in_org(organization_id));
CREATE POLICY "billing_org_addons admin manage" ON public.billing_org_addons FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Histórico de licenças
CREATE TABLE public.billing_license_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT,
  actor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_license_events TO authenticated;
GRANT ALL ON public.billing_license_events TO service_role;
ALTER TABLE public.billing_license_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_license read own or admin" ON public.billing_license_events FOR SELECT TO authenticated
  USING (public.has_role('platform_admin'::app_role) OR public.user_in_org(organization_id));
CREATE POLICY "billing_license admin manage" ON public.billing_license_events FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Consumo diário
CREATE TABLE public.billing_consumption_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  ai_tokens BIGINT NOT NULL DEFAULT 0,
  ai_cost_cents INTEGER NOT NULL DEFAULT 0,
  storage_mb NUMERIC NOT NULL DEFAULT 0,
  uploads INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  edge_invocations INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, day)
);
GRANT SELECT ON public.billing_consumption_daily TO authenticated;
GRANT ALL ON public.billing_consumption_daily TO service_role;
ALTER TABLE public.billing_consumption_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_cons read own or admin" ON public.billing_consumption_daily FOR SELECT TO authenticated
  USING (public.has_role('platform_admin'::app_role) OR public.user_in_org(organization_id));
CREATE POLICY "billing_cons admin manage" ON public.billing_consumption_daily FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Webhooks (inbox)
CREATE TABLE public.billing_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT NOT NULL DEFAULT 'manual',
  event_type TEXT NOT NULL,
  external_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|processed|failed|ignored
  error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_webhook_events TO authenticated;
GRANT ALL ON public.billing_webhook_events TO service_role;
ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_webhooks admin only" ON public.billing_webhook_events FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Configurações de gateway
CREATE TABLE public.billing_gateway_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT NOT NULL UNIQUE, -- stripe|mercado_pago|pagarme|asaas|manual
  enabled BOOLEAN NOT NULL DEFAULT false,
  mode TEXT NOT NULL DEFAULT 'sandbox',
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_gateway_configs TO authenticated;
GRANT ALL ON public.billing_gateway_configs TO service_role;
ALTER TABLE public.billing_gateway_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_gw admin only" ON public.billing_gateway_configs FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Alertas de consumo (80/90/100%)
CREATE TABLE public.billing_usage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  resource TEXT NOT NULL, -- licenses|ai_tokens|storage|edge_invocations
  threshold INTEGER NOT NULL, -- 80|90|100
  current_value NUMERIC NOT NULL DEFAULT 0,
  limit_value NUMERIC NOT NULL DEFAULT 0,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_usage_alerts TO authenticated;
GRANT ALL ON public.billing_usage_alerts TO service_role;
ALTER TABLE public.billing_usage_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_alerts read own or admin" ON public.billing_usage_alerts FOR SELECT TO authenticated
  USING (public.has_role('platform_admin'::app_role) OR public.user_in_org(organization_id));
CREATE POLICY "billing_alerts admin manage" ON public.billing_usage_alerts FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Triggers updated_at
CREATE TRIGGER trg_billing_subs_u BEFORE UPDATE ON public.billing_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_billing_inv_u BEFORE UPDATE ON public.billing_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_billing_coupons_u BEFORE UPDATE ON public.billing_coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_billing_addons_u BEFORE UPDATE ON public.billing_addons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_billing_org_addons_u BEFORE UPDATE ON public.billing_org_addons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
