
CREATE TABLE IF NOT EXISTS public.support_ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id),
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_comments_ticket ON public.support_ticket_comments(ticket_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_ticket_comments TO authenticated;
GRANT ALL ON public.support_ticket_comments TO service_role;

ALTER TABLE public.support_ticket_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_admin_comments" ON public.support_ticket_comments;
CREATE POLICY "platform_admin_comments" ON public.support_ticket_comments
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin() AND author_id = auth.uid());

DROP POLICY IF EXISTS "rh_read_org_comments" ON public.support_ticket_comments;
CREATE POLICY "rh_read_org_comments" ON public.support_ticket_comments
  FOR SELECT TO authenticated
  USING (
    NOT is_internal
    AND EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = support_ticket_comments.ticket_id
        AND t.organization_id = public.current_organization_id()
        AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
    )
  );

CREATE OR REPLACE FUNCTION public.assign_support_ticket(_ticket_id uuid, _assignee uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  UPDATE public.support_tickets SET assigned_to = _assignee, updated_at = now()
  WHERE id = _ticket_id;
END;
$$;
