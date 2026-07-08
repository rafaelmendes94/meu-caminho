
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- Re-grant to authenticated only for client-facing RPCs (already granted, re-affirm idempotently)
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

-- service_role retains full access
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
