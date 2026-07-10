
-- =========================================================
-- ONDA 1 — Fundação LGPD, Canal Direto e Auditoria
-- =========================================================

-- 1) Colunas novas em tabelas existentes ------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE public.enterprise_invites
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS canceled_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS declined_at timestamptz,
  ADD COLUMN IF NOT EXISTS resent_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_resent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_invites_state ON public.enterprise_invites(organization_id, accepted_at, canceled_at, declined_at, expires_at);

-- 2) Chave de privacidade unificada ------------------------

CREATE OR REPLACE FUNCTION public.get_org_min_group_size(_organization_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF((value->>'value')::text, '')::int,
    (value #>> '{}')::int,
    5
  )
  FROM public.organization_settings
  WHERE organization_id = _organization_id
    AND key = 'privacy_min_group_size'
  UNION ALL
  SELECT 5
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_org_min_group_size(uuid) TO authenticated, service_role;

-- 3) Reports (Canal Direto) --------------------------------

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  protocol text NOT NULL UNIQUE,
  category text NOT NULL,             -- 'assedio' | 'discriminacao' | 'seguranca' | 'financeiro' | 'outro'
  severity text NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'critical'
  status text NOT NULL DEFAULT 'open',     -- 'open' | 'in_review' | 'awaiting_reporter' | 'resolved' | 'archived'
  subject text NOT NULL,
  body text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT true,
  reporter_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL when anonymous
  reporter_department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  reporter_unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_org_status ON public.reports(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_user_id) WHERE reporter_user_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Employee creates a report in their own org
CREATE POLICY "reports_insert_by_org_member"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_organization_id());

-- Reporter (identified) sees their own reports
CREATE POLICY "reports_select_own"
  ON public.reports FOR SELECT TO authenticated
  USING (
    reporter_user_id = auth.uid()
    AND is_anonymous = false
  );

-- RH / owner sees all reports of their org
CREATE POLICY "reports_select_rh"
  ON public.reports FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

-- RH updates report state (status, assignment, severity)
CREATE POLICY "reports_update_rh"
  ON public.reports FOR UPDATE TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  )
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4) Report messages ---------------------------------------

CREATE TABLE IF NOT EXISTS public.report_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_role text NOT NULL, -- 'reporter' | 'rh'
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_messages_report ON public.report_messages(report_id, created_at);

GRANT SELECT, INSERT ON public.report_messages TO authenticated;
GRANT ALL ON public.report_messages TO service_role;

ALTER TABLE public.report_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "report_messages_select"
  ON public.report_messages FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND (
      public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
      OR EXISTS (
        SELECT 1 FROM public.reports r
        WHERE r.id = report_id
          AND r.reporter_user_id = auth.uid()
          AND r.is_anonymous = false
      )
    )
  );

CREATE POLICY "report_messages_insert"
  ON public.report_messages FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND (
      (author_role = 'rh' AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[]))
      OR (author_role = 'reporter' AND EXISTS (
          SELECT 1 FROM public.reports r
          WHERE r.id = report_id
            AND r.reporter_user_id = auth.uid()
            AND r.is_anonymous = false
      ))
    )
  );

-- 5) Data export requests (LGPD art. 18 II/V) --------------

CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | processing | ready | failed | expired
  file_path text,
  file_size_bytes bigint,
  expires_at timestamptz,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  error text
);

CREATE INDEX IF NOT EXISTS idx_export_requests_user ON public.data_export_requests(user_id, requested_at DESC);

GRANT SELECT, INSERT ON public.data_export_requests TO authenticated;
GRANT ALL ON public.data_export_requests TO service_role;

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "export_select_own"
  ON public.data_export_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "export_insert_own"
  ON public.data_export_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "export_select_rh"
  ON public.data_export_requests FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL
    AND organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

-- 6) Data deletion requests --------------------------------

CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | scheduled | completed | canceled
  reason text,
  scheduled_for timestamptz, -- 7 day cooling period
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  canceled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_user ON public.data_deletion_requests(user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_scheduled ON public.data_deletion_requests(scheduled_for) WHERE status = 'scheduled';

GRANT SELECT, INSERT, UPDATE ON public.data_deletion_requests TO authenticated;
GRANT ALL ON public.data_deletion_requests TO service_role;

ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deletion_select_own"
  ON public.data_deletion_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "deletion_insert_own"
  ON public.data_deletion_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only the owner can cancel their own pending request
CREATE POLICY "deletion_update_own_cancel"
  ON public.data_deletion_requests FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status IN ('pending','scheduled'))
  WITH CHECK (user_id = auth.uid() AND status IN ('pending','scheduled','canceled'));

CREATE POLICY "deletion_select_rh"
  ON public.data_deletion_requests FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL
    AND organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

-- 7) Consent events (versioned) ----------------------------

CREATE TABLE IF NOT EXISTS public.consent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  consent_type text NOT NULL, -- 'enterprise_privacy' | 'individual_private' | 'collective_trends' | 'anonymous_processing' | 'privacy_policy' | 'marketing'
  action text NOT NULL,        -- 'granted' | 'revoked'
  version text NOT NULL,
  source text,                 -- 'onboarding' | 'settings' | 'policy_change' | 'admin'
  user_agent text,
  ip_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_events_user_type ON public.consent_events(user_id, consent_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_events_org ON public.consent_events(organization_id, created_at DESC);

GRANT SELECT, INSERT ON public.consent_events TO authenticated;
GRANT ALL ON public.consent_events TO service_role;

ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_events_select_own"
  ON public.consent_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "consent_events_insert_own"
  ON public.consent_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "consent_events_select_rh"
  ON public.consent_events FOR SELECT TO authenticated
  USING (
    organization_id IS NOT NULL
    AND organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

-- 8) Organization audit logs (RH-scoped trail) -------------

CREATE TABLE IF NOT EXISTS public.organization_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,             -- e.g. 'profile.update.manager_id'
  entity_type text NOT NULL,        -- 'profile' | 'department' | 'unit' | 'invite' | 'report' | ...
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_audit_org_created ON public.organization_audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_audit_entity ON public.organization_audit_logs(entity_type, entity_id);

GRANT SELECT ON public.organization_audit_logs TO authenticated;
GRANT ALL ON public.organization_audit_logs TO service_role;

ALTER TABLE public.organization_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_audit_select_rh"
  ON public.organization_audit_logs FOR SELECT TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  );

-- Only triggers / service_role insert. No policy for INSERT to authenticated.

-- 9) Trigger de auditoria (genérico) -----------------------

CREATE OR REPLACE FUNCTION public.log_organization_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org uuid;
  v_entity text := TG_ARGV[0];
  v_before jsonb;
  v_after jsonb;
  v_action text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_org := NEW.organization_id;
    v_before := NULL;
    v_after := to_jsonb(NEW);
    v_action := v_entity || '.create';
  ELSIF TG_OP = 'UPDATE' THEN
    v_org := NEW.organization_id;
    v_before := to_jsonb(OLD);
    v_after := to_jsonb(NEW);
    v_action := v_entity || '.update';

    -- Soft delete detection for profiles
    IF v_entity = 'profile' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      v_action := 'profile.soft_delete';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_org := OLD.organization_id;
    v_before := to_jsonb(OLD);
    v_after := NULL;
    v_action := v_entity || '.delete';
  END IF;

  IF v_org IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.organization_audit_logs (
    organization_id, actor_user_id, action, entity_type, entity_id, before_data, after_data
  ) VALUES (
    v_org,
    auth.uid(),
    v_action,
    v_entity,
    COALESCE(NEW.id, OLD.id),
    v_before,
    v_after
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers on profiles / departments / units
DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
CREATE TRIGGER trg_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('profile');

DROP TRIGGER IF EXISTS trg_audit_departments ON public.departments;
CREATE TRIGGER trg_audit_departments
  AFTER INSERT OR UPDATE OR DELETE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('department');

DROP TRIGGER IF EXISTS trg_audit_units ON public.units;
CREATE TRIGGER trg_audit_units
  AFTER INSERT OR UPDATE OR DELETE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.log_organization_change('unit');

-- 10) Helper: protocol generator for reports ---------------

CREATE OR REPLACE FUNCTION public.generate_report_protocol()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT 'RPT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
$$;

GRANT EXECUTE ON FUNCTION public.generate_report_protocol() TO authenticated, service_role;
