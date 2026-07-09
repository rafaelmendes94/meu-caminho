
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS segment text,
  ADD COLUMN IF NOT EXISTS company_size text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS responsible_name text,
  ADD COLUMN IF NOT EXISTS responsible_email text,
  ADD COLUMN IF NOT EXISTS responsible_phone text,
  ADD COLUMN IF NOT EXISTS responsible_role text,
  ADD COLUMN IF NOT EXISTS grace_period_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS internal_status text,
  ADD COLUMN IF NOT EXISTS next_contact_at timestamptz,
  ADD COLUMN IF NOT EXISTS customer_success_owner text,
  ADD COLUMN IF NOT EXISTS onboarding_status text,
  ADD COLUMN IF NOT EXISTS commercial_risk text;

CREATE TABLE IF NOT EXISTS public.organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_settings TO authenticated;
GRANT ALL ON public.organization_settings TO service_role;

ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform admin manages org settings" ON public.organization_settings;
CREATE POLICY "platform admin manages org settings"
  ON public.organization_settings FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "members read own org settings" ON public.organization_settings;
CREATE POLICY "members read own org settings"
  ON public.organization_settings FOR SELECT
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_org_settings_updated_at ON public.organization_settings;
CREATE TRIGGER trg_org_settings_updated_at
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_platform_organization_details(_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  org record;
  since_30d timestamptz := now() - interval '30 days';
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO org FROM public.organizations WHERE id = _id;
  IF org.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'organization', to_jsonb(org),
    'settings', COALESCE((
      SELECT jsonb_object_agg(s.key, s.value)
      FROM public.organization_settings s
      WHERE s.organization_id = _id
    ), '{}'::jsonb),
    'counts', jsonb_build_object(
      'profiles', (SELECT COUNT(*) FROM public.profiles WHERE organization_id = _id),
      'admins', (SELECT COUNT(*) FROM public.user_roles WHERE organization_id = _id AND role IN ('owner','rh_admin')),
      'departments', (SELECT COUNT(*) FROM public.departments WHERE organization_id = _id),
      'units', (SELECT COUNT(*) FROM public.units WHERE organization_id = _id),
      'open_alerts', (SELECT COUNT(*) FROM public.alerts WHERE organization_id = _id AND status='open'),
      'open_tickets', (SELECT COUNT(*) FROM public.support_tickets WHERE organization_id = _id AND status IN ('open','in_progress'))
    ),
    'usage_30d', jsonb_build_object(
      'active_users', (
        SELECT COUNT(DISTINCT user_id) FROM (
          SELECT user_id FROM public.emotional_checkins WHERE organization_id=_id AND created_at>=since_30d
          UNION SELECT user_id FROM public.pulse_responses WHERE organization_id=_id AND responded_at>=since_30d
        ) u
      ),
      'ai_messages', COALESCE((SELECT SUM(ai_messages_count) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0),
      'tokens_in', COALESCE((SELECT SUM(tokens_in) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0),
      'tokens_out', COALESCE((SELECT SUM(tokens_out) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0),
      'tokens', COALESCE((SELECT SUM(tokens_in+tokens_out) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0),
      'ai_cost_cents', COALESCE((SELECT SUM(estimated_ai_cost_cents) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0),
      'checkins', COALESCE((SELECT SUM(checkins_count) FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30),0),
      'dnas', (SELECT COUNT(*) FROM public.organizational_dna_reports WHERE organization_id=_id AND generated_at>=since_30d),
      'insights', (SELECT COUNT(*) FROM public.weekly_ai_insights WHERE organization_id=_id AND created_at>=since_30d)
    ),
    'usage_daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'usage_date', usage_date, 'ai_messages', ai_messages_count,
        'tokens', tokens_in+tokens_out, 'cost_cents', estimated_ai_cost_cents,
        'checkins', checkins_count
      ) ORDER BY usage_date DESC)
      FROM public.platform_usage_daily WHERE organization_id=_id AND usage_date>=current_date-30
    ), '[]'::jsonb),
    'latest', jsonb_build_object(
      'last_dna_at', (SELECT generated_at FROM public.organizational_dna_reports WHERE organization_id=_id ORDER BY generated_at DESC LIMIT 1),
      'last_score', (SELECT overall_score FROM public.organizational_scores WHERE organization_id=_id ORDER BY score_date DESC LIMIT 1),
      'last_score_date', (SELECT score_date FROM public.organizational_scores WHERE organization_id=_id ORDER BY score_date DESC LIMIT 1),
      'last_activity_at', (
        SELECT GREATEST(
          COALESCE((SELECT MAX(created_at) FROM public.emotional_checkins WHERE organization_id=_id), 'epoch'::timestamptz),
          COALESCE((SELECT MAX(responded_at) FROM public.pulse_responses WHERE organization_id=_id), 'epoch'::timestamptz),
          COALESCE((SELECT MAX(usage_date)::timestamptz FROM public.platform_usage_daily WHERE organization_id=_id), 'epoch'::timestamptz)
        )
      )
    ),
    'tickets', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id, 'title', t.title, 'status', t.status, 'priority', t.priority, 'created_at', t.created_at
      ) ORDER BY t.created_at DESC)
      FROM (SELECT id, title, status, priority, created_at FROM public.support_tickets WHERE organization_id=_id ORDER BY created_at DESC LIMIT 20) t
    ), '[]'::jsonb),
    'audit_logs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', l.id, 'action', l.action, 'entity_type', l.entity_type, 'metadata', l.metadata, 'created_at', l.created_at
      ) ORDER BY l.created_at DESC)
      FROM (SELECT id, action, entity_type, metadata, created_at FROM public.platform_audit_logs WHERE organization_id=_id ORDER BY created_at DESC LIMIT 30) l
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

DROP FUNCTION IF EXISTS public.get_platform_organizations(text,text,boolean,integer,integer,text);

CREATE OR REPLACE FUNCTION public.get_platform_organizations(
  _search text DEFAULT NULL,
  _status text DEFAULT NULL,
  _include_archived boolean DEFAULT false,
  _limit int DEFAULT 50,
  _offset int DEFAULT 0,
  _sort text DEFAULT 'created_desc'
)
RETURNS TABLE (
  id uuid, name text, slug text, plan text, subscription_status text,
  licenses_total int, licenses_used int, created_at timestamptz,
  archived_at timestamptz, suspended_at timestamptz,
  active_users_30d bigint, ai_messages_30d bigint,
  last_activity_at timestamptz, last_dna_generated_at timestamptz,
  last_score numeric, health_status text, total_count bigint,
  responsible_name text, responsible_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total bigint;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COUNT(*) INTO total FROM public.organizations o
  WHERE o.deleted_at IS NULL
    AND (_include_archived OR o.archived_at IS NULL)
    AND (_search IS NULL
         OR o.name ILIKE '%'||_search||'%'
         OR o.slug ILIKE '%'||_search||'%'
         OR COALESCE(o.cnpj,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.domain,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.responsible_name,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.responsible_email,'') ILIKE '%'||_search||'%')
    AND (_status IS NULL OR o.subscription_status::text = _status);

  RETURN QUERY
  SELECT
    o.id, o.name, o.slug, o.plan, o.subscription_status::text,
    o.licenses_total::int, o.licenses_used::int, o.created_at,
    o.archived_at, o.suspended_at,
    COALESCE((
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT ec.user_id FROM public.emotional_checkins ec
        WHERE ec.organization_id = o.id AND ec.created_at >= now() - interval '30 days'
        UNION
        SELECT pr.user_id FROM public.pulse_responses pr
        WHERE pr.organization_id = o.id AND pr.responded_at >= now() - interval '30 days'
      ) u
    ), 0)::bigint,
    COALESCE((
      SELECT SUM(pu.ai_messages_count) FROM public.platform_usage_daily pu
      WHERE pu.organization_id = o.id AND pu.usage_date >= (current_date - 30)
    ), 0)::bigint,
    (
      SELECT GREATEST(
        COALESCE((SELECT MAX(created_at) FROM public.emotional_checkins WHERE organization_id=o.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(responded_at) FROM public.pulse_responses WHERE organization_id=o.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(usage_date)::timestamptz FROM public.platform_usage_daily WHERE organization_id=o.id), 'epoch'::timestamptz)
      )
    ),
    (SELECT d.generated_at FROM public.organizational_dna_reports d WHERE d.organization_id=o.id ORDER BY d.generated_at DESC LIMIT 1),
    (SELECT s.overall_score FROM public.organizational_scores s WHERE s.organization_id=o.id ORDER BY s.score_date DESC LIMIT 1),
    (CASE
      WHEN o.archived_at IS NOT NULL THEN 'archived'
      WHEN o.suspended_at IS NOT NULL OR o.subscription_status::text IN ('canceled','past_due','suspended') THEN 'at_risk'
      WHEN o.licenses_used > o.licenses_total THEN 'over_limit'
      WHEN (SELECT COUNT(*) FROM public.alerts a WHERE a.organization_id=o.id AND a.status='open' AND a.severity='critical') > 2 THEN 'attention'
      ELSE 'healthy'
    END)::text,
    total,
    o.responsible_name,
    o.responsible_email
  FROM public.organizations o
  WHERE o.deleted_at IS NULL
    AND (_include_archived OR o.archived_at IS NULL)
    AND (_search IS NULL
         OR o.name ILIKE '%'||_search||'%'
         OR o.slug ILIKE '%'||_search||'%'
         OR COALESCE(o.cnpj,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.domain,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.responsible_name,'') ILIKE '%'||_search||'%'
         OR COALESCE(o.responsible_email,'') ILIKE '%'||_search||'%')
    AND (_status IS NULL OR o.subscription_status::text = _status)
  ORDER BY
    CASE WHEN _sort='created_asc'  THEN o.created_at END ASC,
    CASE WHEN _sort='created_desc' THEN o.created_at END DESC,
    CASE WHEN _sort='name_asc'     THEN o.name END ASC,
    CASE WHEN _sort='name_desc'    THEN o.name END DESC,
    CASE WHEN _sort='licenses_desc' THEN o.licenses_used END DESC NULLS LAST
  LIMIT _limit OFFSET _offset;
END;
$$;
