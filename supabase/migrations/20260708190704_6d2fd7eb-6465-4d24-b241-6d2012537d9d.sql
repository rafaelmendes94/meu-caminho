
-- 1) Tighten has_role / has_any_role: NULL organization_id only valid for platform_admin
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = _role
      AND (
        (ur.organization_id IS NULL AND ur.role = 'platform_admin')
        OR ur.organization_id = public.current_organization_id()
      )
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_roles app_role[])
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY(_roles)
      AND (
        (ur.organization_id IS NULL AND ur.role = 'platform_admin')
        OR ur.organization_id = public.current_organization_id()
      )
  )
$$;

-- Enforce at data-layer: only platform_admin may have NULL organization_id
CREATE OR REPLACE FUNCTION public.user_roles_enforce_org_scope()
RETURNS trigger
LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.role <> 'platform_admin' THEN
    RAISE EXCEPTION 'Only platform_admin role may have organization_id = NULL (got %)', NEW.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_user_roles_org_scope ON public.user_roles;
CREATE TRIGGER enforce_user_roles_org_scope
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.user_roles_enforce_org_scope();

-- 2) employee_profiles: add explicit restrictive policy + explicit RH read policy so access rules are unambiguous
-- Keep existing self-access policies; add restrictive policy blocking anon and cross-org access.
CREATE POLICY "employee_profiles_block_anon"
ON public.employee_profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Explicit RH/owner read within same organization (aggregated / admin use)
CREATE POLICY "employee_profiles_rh_read_same_org"
ON public.employee_profiles
FOR SELECT
TO authenticated
USING (
  organization_id IS NOT NULL
  AND organization_id = public.current_organization_id()
  AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
);

-- 3 & 4) Lock down SECURITY DEFINER function EXECUTE privileges
-- Revoke EXECUTE from anon on ALL functions in public schema
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Revoke EXECUTE from authenticated on internal-only SECURITY DEFINER functions
-- (these are only invoked by triggers, service_role edge functions, or by other SECURITY DEFINER functions)
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.user_roles_enforce_org_scope() FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.calculate_organizational_score(uuid) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.measure_impact(uuid, text, uuid) FROM authenticated, anon, public;

-- Ensure service_role retains ability
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.user_roles_enforce_org_scope() TO service_role;
GRANT EXECUTE ON FUNCTION public.calculate_organizational_score(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.measure_impact(uuid, text, uuid) TO service_role;

-- Re-grant EXECUTE to authenticated on the SECURITY DEFINER RPCs the app actually calls
GRANT EXECUTE ON FUNCTION public.current_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_checkin_aggregate(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pulse_aggregate(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_capacity_pulse(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_emotional_map(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rh_dashboard_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_predictive_context(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dna_context(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_executive_context(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_ai_context(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_tree(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.org_node_indicators(uuid, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_organizations() TO authenticated;
