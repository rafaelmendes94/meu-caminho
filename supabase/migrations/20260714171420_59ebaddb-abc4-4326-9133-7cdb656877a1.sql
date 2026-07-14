
CREATE OR REPLACE FUNCTION public.list_my_sessions()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  user_agent text,
  ip inet,
  is_current boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _uid uuid := auth.uid();
  _current uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  BEGIN
    _current := (current_setting('request.jwt.claims', true)::jsonb ->> 'session_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    _current := NULL;
  END;
  RETURN QUERY
    SELECT s.id, s.created_at, s.updated_at, s.user_agent, s.ip,
           (s.id = _current) AS is_current
      FROM auth.sessions s
     WHERE s.user_id = _uid
     ORDER BY s.updated_at DESC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.list_my_sessions() FROM public;
GRANT EXECUTE ON FUNCTION public.list_my_sessions() TO authenticated;
