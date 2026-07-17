REVOKE EXECUTE ON FUNCTION public.get_org_announcement_history(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_org_announcement_history(uuid) TO authenticated, service_role;