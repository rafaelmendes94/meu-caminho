CREATE POLICY "members read default track slug"
ON public.organization_settings
FOR SELECT
TO authenticated
USING (
  organization_id = current_organization_id()
  AND key = 'default_track_slug'
);