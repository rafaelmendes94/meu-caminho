-- Allow org owner/rh_admin to manage their own organization_settings (Privacy Center writes)
CREATE POLICY "rh_admin manages own org settings"
ON public.organization_settings
FOR ALL
TO authenticated
USING (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[]))
WITH CHECK (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[]));

-- Audit triggers for critical RH actions (BUG-09)
DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
CREATE TRIGGER trg_audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('profile');

DROP TRIGGER IF EXISTS trg_audit_departments ON public.departments;
CREATE TRIGGER trg_audit_departments
AFTER INSERT OR UPDATE OR DELETE ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('department');

DROP TRIGGER IF EXISTS trg_audit_units ON public.units;
CREATE TRIGGER trg_audit_units
AFTER INSERT OR UPDATE OR DELETE ON public.units
FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('unit');

DROP TRIGGER IF EXISTS trg_audit_org_settings ON public.organization_settings;
CREATE TRIGGER trg_audit_org_settings
AFTER INSERT OR UPDATE OR DELETE ON public.organization_settings
FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('org_setting');

DROP TRIGGER IF EXISTS trg_audit_alerts ON public.alerts;
CREATE TRIGGER trg_audit_alerts
AFTER INSERT OR UPDATE OR DELETE ON public.alerts
FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('alert');

DROP TRIGGER IF EXISTS trg_audit_dna ON public.organizational_dna_reports;
CREATE TRIGGER trg_audit_dna
AFTER INSERT OR UPDATE OR DELETE ON public.organizational_dna_reports
FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('dna_report');

DROP TRIGGER IF EXISTS trg_audit_action_plans ON public.action_plans;
CREATE TRIGGER trg_audit_action_plans
AFTER INSERT OR UPDATE OR DELETE ON public.action_plans
FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('action_plan');