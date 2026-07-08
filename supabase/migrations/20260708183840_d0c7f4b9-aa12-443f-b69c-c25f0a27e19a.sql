-- TABELAS

CREATE TABLE public.platform_usage_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  usage_date date NOT NULL DEFAULT current_date,
  active_users int DEFAULT 0,
  checkins_count int DEFAULT 0,
  pulses_count int DEFAULT 0,
  ai_messages_count int DEFAULT 0,
  executive_ai_messages_count int DEFAULT 0,
  dna_reports_count int DEFAULT 0,
  action_plans_count int DEFAULT 0,
  rituals_count int DEFAULT 0,
  tokens_in int DEFAULT 0,
  tokens_out int DEFAULT 0,
  estimated_ai_cost_cents int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_platform_usage_daily_org_date ON public.platform_usage_daily(organization_id, usage_date);
CREATE INDEX idx_platform_usage_daily_date ON public.platform_usage_daily(usage_date);

GRANT SELECT ON public.platform_usage_daily TO authenticated;
GRANT ALL ON public.platform_usage_daily TO service_role;

ALTER TABLE public.platform_usage_daily ENABLE ROW LEVEL SECURITY;

-- PLATFORM AUDIT LOGS
CREATE TABLE public.platform_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  organization_id uuid REFERENCES public.organizations(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_platform_audit_logs_actor ON public.platform_audit_logs(actor_user_id);
CREATE INDEX idx_platform_audit_logs_org ON public.platform_audit_logs(organization_id);
CREATE INDEX idx_platform_audit_logs_created ON public.platform_audit_logs(created_at DESC);

GRANT SELECT, INSERT ON public.platform_audit_logs TO authenticated;
GRANT ALL ON public.platform_audit_logs TO service_role;

ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- SUPPORT TICKETS
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id),
  opened_by uuid REFERENCES auth.users(id),
  title text NOT NULL,
  message text,
  status text CHECK (status IN ('open','in_progress','resolved','closed')) DEFAULT 'open',
  priority text CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_support_tickets_org ON public.support_tickets(organization_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);

GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FUNÇÕES

-- is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'platform_admin'
      AND ur.organization_id IS NULL
  )
$$;

-- get_platform_overview (somente platform_admin)
CREATE OR REPLACE FUNCTION public.get_platform_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  since_30d timestamptz := now() - interval '30 days';
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT jsonb_build_object(
    'total_organizations', (SELECT COUNT(*) FROM public.organizations),
    'active_organizations', (SELECT COUNT(*) FROM public.organizations WHERE subscription_status = 'active'),
    'trialing_organizations', (SELECT COUNT(*) FROM public.organizations WHERE subscription_status = 'trialing'),
    'past_due_organizations', (SELECT COUNT(*) FROM public.organizations WHERE subscription_status = 'past_due'),
    'canceled_organizations', (SELECT COUNT(*) FROM public.organizations WHERE subscription_status = 'canceled'),
    'total_licenses', (SELECT COALESCE(SUM(licenses_total),0) FROM public.organizations),
    'licenses_used', (SELECT COALESCE(SUM(licenses_used),0) FROM public.organizations),
    'total_active_users_30d', (
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM public.emotional_checkins WHERE created_at >= since_30d
        UNION
        SELECT user_id FROM public.pulse_responses WHERE responded_at >= since_30d
      ) u
    ),
    'total_ai_messages_30d', (
      SELECT COALESCE(SUM(ai_messages_count), 0) FROM public.platform_usage_daily
      WHERE usage_date >= (current_date - 30)
    ),
    'total_tokens_30d', (
      SELECT COALESCE(SUM(tokens_in + tokens_out), 0) FROM public.platform_usage_daily
      WHERE usage_date >= (current_date - 30)
    ),
    'estimated_ai_cost_30d', (
      SELECT COALESCE(SUM(estimated_ai_cost_cents), 0) FROM public.platform_usage_daily
      WHERE usage_date >= (current_date - 30)
    ),
    'open_support_tickets', (SELECT COUNT(*) FROM public.support_tickets WHERE status IN ('open','in_progress'))
  ) INTO result;

  RETURN result;
END;
$$;

-- get_platform_organizations (somente platform_admin)
CREATE OR REPLACE FUNCTION public.get_platform_organizations()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  subscription_status text,
  licenses_total int,
  licenses_used int,
  created_at timestamptz,
  active_users_30d bigint,
  ai_messages_30d bigint,
  last_dna_generated_at timestamptz,
  last_score numeric,
  health_status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.slug,
    o.subscription_status,
    o.licenses_total::int,
    o.licenses_used::int,
    o.created_at,
    COALESCE((
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT ec.user_id FROM public.emotional_checkins ec
        WHERE ec.organization_id = o.id AND ec.created_at >= now() - interval '30 days'
        UNION
        SELECT pr.user_id FROM public.pulse_responses pr
        WHERE pr.organization_id = o.id AND pr.responded_at >= now() - interval '30 days'
      ) u
    ), 0) AS active_users_30d,
    COALESCE((
      SELECT SUM(pu.ai_messages_count) FROM public.platform_usage_daily pu
      WHERE pu.organization_id = o.id AND pu.usage_date >= (current_date - 30)
    ), 0) AS ai_messages_30d,
    (
      SELECT d.generated_at FROM public.organizational_dna_reports d
      WHERE d.organization_id = o.id ORDER BY d.generated_at DESC LIMIT 1
    ) AS last_dna_generated_at,
    (
      SELECT s.overall_score FROM public.organizational_scores s
      WHERE s.organization_id = o.id ORDER BY s.score_date DESC LIMIT 1
    ) AS last_score,
    CASE
      WHEN o.subscription_status IN ('canceled','past_due') THEN 'at_risk'
      WHEN o.licenses_used > o.licenses_total THEN 'over_limit'
      WHEN (
        SELECT COUNT(*) FROM public.alerts a
        WHERE a.organization_id = o.id AND a.status = 'open' AND a.severity = 'critical'
      ) > 2 THEN 'attention'
      ELSE 'healthy'
    END AS health_status
  FROM public.organizations o
  ORDER BY o.created_at DESC;
END;
$$;

-- POLICIES

-- platform_usage_daily: platform_admin read
CREATE POLICY "platform_admin_read_usage" ON public.platform_usage_daily
  FOR SELECT TO authenticated
  USING (public.is_platform_admin());

-- platform_usage_daily: service writes
CREATE POLICY "service_writes_usage" ON public.platform_usage_daily
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- platform_audit_logs: platform_admin read
CREATE POLICY "platform_admin_read_audit" ON public.platform_audit_logs
  FOR SELECT TO authenticated
  USING (public.is_platform_admin());

-- platform_audit_logs: any authenticated can insert (for logging own actions)
CREATE POLICY "authenticated_insert_audit" ON public.platform_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (actor_user_id = auth.uid());

-- platform_audit_logs: service writes
CREATE POLICY "service_writes_audit" ON public.platform_audit_logs
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- support_tickets: owner/rh_admin can create for own org
CREATE POLICY "rh_create_ticket" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
    AND opened_by = auth.uid()
  );

-- support_tickets: owner/rh_admin can read own org tickets
CREATE POLICY "rh_read_org_tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

-- support_tickets: platform_admin full
CREATE POLICY "platform_admin_tickets" ON public.support_tickets
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- support_tickets: service
CREATE POLICY "service_tickets" ON public.support_tickets
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Adicionar campos Stripe (placeholders) na tabela organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS mrr_cents int DEFAULT 0;