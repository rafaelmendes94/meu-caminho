CREATE OR REPLACE FUNCTION public.user_roles_enforce_org_scope()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.role NOT IN ('platform_admin','b2c_user') THEN
    RAISE EXCEPTION 'Only platform_admin/b2c_user roles may have organization_id = NULL (got %)', NEW.role;
  END IF;
  RETURN NEW;
END;
$function$;