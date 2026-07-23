
-- 1) Fix user_in_org to rely on user_roles + current_organization_id (aligned with rest of app)
CREATE OR REPLACE FUNCTION public.user_in_org(_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.organization_id = _org
      AND ur.role = ANY (ARRAY['owner'::app_role, 'rh_admin'::app_role])
  );
$$;

-- 2) Tighten billing SELECT policies: owner/rh_admin of the same org OR platform_admin
DROP POLICY IF EXISTS "billing_cons read own or admin" ON public.billing_consumption_daily;
CREATE POLICY "billing_cons read own or admin"
ON public.billing_consumption_daily FOR SELECT TO authenticated
USING (
  has_role('platform_admin'::app_role)
  OR (organization_id = current_organization_id()
      AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role]))
);

DROP POLICY IF EXISTS "billing_inv read own or admin" ON public.billing_invoices;
CREATE POLICY "billing_inv read own or admin"
ON public.billing_invoices FOR SELECT TO authenticated
USING (
  has_role('platform_admin'::app_role)
  OR (organization_id = current_organization_id()
      AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role]))
);

DROP POLICY IF EXISTS "billing_subs read own or admin" ON public.billing_subscriptions;
CREATE POLICY "billing_subs read own or admin"
ON public.billing_subscriptions FOR SELECT TO authenticated
USING (
  has_role('platform_admin'::app_role)
  OR (organization_id = current_organization_id()
      AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role]))
);

DROP POLICY IF EXISTS "billing_org_addons read own or admin" ON public.billing_org_addons;
CREATE POLICY "billing_org_addons read own or admin"
ON public.billing_org_addons FOR SELECT TO authenticated
USING (
  has_role('platform_admin'::app_role)
  OR (organization_id = current_organization_id()
      AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role]))
);

DROP POLICY IF EXISTS "billing_license read own or admin" ON public.billing_license_events;
CREATE POLICY "billing_license read own or admin"
ON public.billing_license_events FOR SELECT TO authenticated
USING (
  has_role('platform_admin'::app_role)
  OR (organization_id = current_organization_id()
      AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role]))
);

DROP POLICY IF EXISTS "billing_coupon_red read own or admin" ON public.billing_coupon_redemptions;
CREATE POLICY "billing_coupon_red read own or admin"
ON public.billing_coupon_redemptions FOR SELECT TO authenticated
USING (
  has_role('platform_admin'::app_role)
  OR (organization_id IS NOT NULL
      AND organization_id = current_organization_id()
      AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role]))
);

DROP POLICY IF EXISTS "billing_alerts read own or admin" ON public.billing_usage_alerts;
CREATE POLICY "billing_alerts read own or admin"
ON public.billing_usage_alerts FOR SELECT TO authenticated
USING (
  has_role('platform_admin'::app_role)
  OR (organization_id = current_organization_id()
      AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role]))
);

-- 3) Allow HR admins/owners to read employee profiles of their own organization
DROP POLICY IF EXISTS "employee_profiles admin select org" ON public.employee_profiles;
CREATE POLICY "employee_profiles admin select org"
ON public.employee_profiles FOR SELECT TO authenticated
USING (
  organization_id = current_organization_id()
  AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role])
);

-- 4) Document that org-chart snapshots and audit logs are backend-written only
DROP POLICY IF EXISTS "org_snapshots_service_write" ON public.org_chart_snapshots;
CREATE POLICY "org_snapshots_service_write"
ON public.org_chart_snapshots FOR ALL TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "org_audit_service_write" ON public.organization_audit_logs;
CREATE POLICY "org_audit_service_write"
ON public.organization_audit_logs FOR ALL TO service_role
USING (true) WITH CHECK (true);
