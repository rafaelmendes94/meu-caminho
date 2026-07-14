
DROP POLICY IF EXISTS "billing_coupons read auth" ON public.billing_coupons;
CREATE POLICY "billing_coupons read admin" ON public.billing_coupons
  FOR SELECT TO authenticated
  USING (public.has_role('platform_admin'::app_role));

DROP POLICY IF EXISTS "gam_org_settings read" ON public.gam_org_settings;
CREATE POLICY "gam_org_settings read" ON public.gam_org_settings
  FOR SELECT TO authenticated
  USING (
    public.has_role('platform_admin'::app_role)
    OR organization_id = public.current_organization_id()
  );

REVOKE EXECUTE ON FUNCTION public.enterprise_settings_upsert(text, jsonb) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_executive_context_admin(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.invalidate_knowledge_cache() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.list_my_sessions() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.match_knowledge_chunks(vector, uuid, integer, double precision) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.qa_seed_users_export() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_invalidate_orch_cache_org() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_in_org(uuid) FROM anon, PUBLIC;
