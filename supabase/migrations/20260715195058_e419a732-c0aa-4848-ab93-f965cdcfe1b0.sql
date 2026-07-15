CREATE OR REPLACE FUNCTION public.get_org_announcement_history(_organization_id uuid)
RETURNS TABLE (
  batch_id uuid,
  title text,
  body text,
  created_at timestamptz,
  total_recipients bigint,
  read_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'platform_admin')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.organization_id = _organization_id
        AND (
          public.has_role(auth.uid(), 'owner')
          OR public.has_role(auth.uid(), 'rh_admin')
        )
    )
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT
    (n.metadata->>'batch_id')::uuid AS batch_id,
    (array_agg(n.title ORDER BY n.created_at))[1] AS title,
    (array_agg(n.body ORDER BY n.created_at))[1] AS body,
    min(n.created_at) AS created_at,
    count(*)::bigint AS total_recipients,
    count(n.read_at)::bigint AS read_count
  FROM public.notifications n
  WHERE n.organization_id = _organization_id
    AND n.type = 'announcement'
    AND n.metadata ? 'batch_id'
  GROUP BY (n.metadata->>'batch_id')
  ORDER BY min(n.created_at) DESC
  LIMIT 100;
END;
$$;

REVOKE ALL ON FUNCTION public.get_org_announcement_history(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_org_announcement_history(uuid) TO authenticated;