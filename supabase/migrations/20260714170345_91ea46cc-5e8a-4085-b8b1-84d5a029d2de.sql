
-- 1) Colunas novas em organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS legal_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS employee_count integer;

-- 2) RPC de upsert de settings com auditoria
CREATE OR REPLACE FUNCTION public.enterprise_settings_upsert(
  _key text,
  _value jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org uuid := current_organization_id();
  _before jsonb;
BEGIN
  IF _org IS NULL THEN
    RAISE EXCEPTION 'no_organization';
  END IF;
  IF NOT has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role]) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT value INTO _before
    FROM public.organization_settings
   WHERE organization_id = _org AND key = _key;

  INSERT INTO public.organization_settings (organization_id, key, value)
       VALUES (_org, _key, _value)
  ON CONFLICT (organization_id, key)
  DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  INSERT INTO public.organization_audit_logs (
    organization_id, actor_user_id, action, entity_type, entity_id, before_data, after_data, metadata
  ) VALUES (
    _org, auth.uid(), 'update', 'organization_settings', NULL,
    COALESCE(_before, 'null'::jsonb), _value, jsonb_build_object('key', _key)
  );

  RETURN _value;
END;
$$;

REVOKE ALL ON FUNCTION public.enterprise_settings_upsert(text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.enterprise_settings_upsert(text, jsonb) TO authenticated;

-- 3) Policies do bucket privado org-branding
--    path esperado: {organization_id}/<arquivo>
DROP POLICY IF EXISTS "org_branding_select" ON storage.objects;
DROP POLICY IF EXISTS "org_branding_insert" ON storage.objects;
DROP POLICY IF EXISTS "org_branding_update" ON storage.objects;
DROP POLICY IF EXISTS "org_branding_delete" ON storage.objects;

CREATE POLICY "org_branding_select" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'org-branding'
  AND (storage.foldername(name))[1] = current_organization_id()::text
  AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role])
);

CREATE POLICY "org_branding_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'org-branding'
  AND (storage.foldername(name))[1] = current_organization_id()::text
  AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role])
);

CREATE POLICY "org_branding_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'org-branding'
  AND (storage.foldername(name))[1] = current_organization_id()::text
  AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role])
);

CREATE POLICY "org_branding_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'org-branding'
  AND (storage.foldername(name))[1] = current_organization_id()::text
  AND has_any_role(ARRAY['owner'::app_role, 'rh_admin'::app_role])
);
