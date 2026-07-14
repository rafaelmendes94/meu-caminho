
CREATE OR REPLACE FUNCTION public.qa_seed_users_export()
RETURNS TABLE(company text, full_name text, email text, temporary_password text, role text, department text, unit text, manager_email text, onboarding_status text, account_status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.name::text, p.full_name::text, u.email::text, 'McQa@2026!'::text,
         r.role::text, COALESCE(d.name,'-')::text, COALESCE(un.name,'-')::text,
         COALESCE(mu.email,'')::text,
         CASE WHEN ep.user_id IS NOT NULL THEN 'completed' ELSE 'pending' END::text,
         'active'::text
  FROM public.organizations o
  JOIN public.profiles p ON p.organization_id = o.id
  JOIN auth.users u ON u.id = p.id
  JOIN public.user_roles r ON r.user_id = p.id AND r.organization_id = o.id
  LEFT JOIN public.departments d ON d.id = p.department_id
  LEFT JOIN public.units un ON un.id = p.unit_id
  LEFT JOIN auth.users mu ON mu.id = p.manager_id
  LEFT JOIN public.employee_profiles ep ON ep.user_id = p.id
  WHERE o.slug IN ('horizonte-tecnologia-qa','valesul-industria-qa','atlantica-servicos-qa')
  ORDER BY o.name, r.role, u.email;
$$;
REVOKE ALL ON FUNCTION public.qa_seed_users_export() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.qa_seed_users_export() TO service_role;
