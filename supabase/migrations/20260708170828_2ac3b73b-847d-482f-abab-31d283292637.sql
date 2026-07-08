
-- Conversations
CREATE TABLE public.executive_ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.executive_ai_conversations TO authenticated;
GRANT ALL ON public.executive_ai_conversations TO service_role;

ALTER TABLE public.executive_ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners/RH can manage own org conversations"
  ON public.executive_ai_conversations
  FOR ALL
  TO authenticated
  USING (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
  )
  WITH CHECK (
    organization_id = public.current_organization_id()
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
    AND user_id = auth.uid()
  );

CREATE POLICY "Service role manages conversations"
  ON public.executive_ai_conversations
  FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_exec_conv_org ON public.executive_ai_conversations(organization_id, updated_at DESC);
CREATE INDEX idx_exec_conv_user ON public.executive_ai_conversations(user_id);

CREATE TRIGGER trg_exec_conv_updated
  BEFORE UPDATE ON public.executive_ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Messages
CREATE TABLE public.executive_ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.executive_ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  tokens_in integer,
  tokens_out integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.executive_ai_messages TO authenticated;
GRANT ALL ON public.executive_ai_messages TO service_role;

ALTER TABLE public.executive_ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners/RH can manage own org messages"
  ON public.executive_ai_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.executive_ai_conversations c
      WHERE c.id = conversation_id
        AND c.organization_id = public.current_organization_id()
        AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.executive_ai_conversations c
      WHERE c.id = conversation_id
        AND c.organization_id = public.current_organization_id()
        AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
    )
  );

CREATE POLICY "Service role manages messages"
  ON public.executive_ai_messages
  FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_exec_msg_conv ON public.executive_ai_messages(conversation_id, created_at);

-- get_executive_context: aggregated-only context
CREATE OR REPLACE FUNCTION public.get_executive_context(_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dna jsonb;
  dashboard jsonb;
  emotional jsonb;
  pulse jsonb;
  alerts jsonb;
  predictive jsonb;
  org_summary jsonb;
  participation jsonb;
  weekly jsonb;
BEGIN
  IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
    RAISE EXCEPTION 'organization mismatch';
  END IF;

  SELECT to_jsonb(r) INTO dna FROM (
    SELECT id, generated_at, overall_score, summary, strengths, opportunities, recommendations,
           dimensions, period_days
    FROM public.organizational_dna_reports
    WHERE organization_id = _organization_id
    ORDER BY generated_at DESC
    LIMIT 1
  ) r;

  dashboard := public.get_rh_dashboard_summary(_organization_id);

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.week_of DESC), '[]'::jsonb)
  INTO emotional
  FROM (
    SELECT * FROM public.get_emotional_map(_organization_id, 12)
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
  INTO pulse
  FROM (SELECT * FROM public.get_pulse_aggregate(_organization_id, 30)) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'alert_type', alert_type, 'severity', severity, 'title', title,
    'status', status, 'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb)
  INTO alerts
  FROM public.alerts
  WHERE organization_id = _organization_id
    AND created_at >= now() - interval '60 days'
  LIMIT 30;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'signal_type', signal_type, 'severity', severity, 'title', title,
    'status', status, 'detected_at', detected_at, 'evidence', evidence
  ) ORDER BY detected_at DESC), '[]'::jsonb)
  INTO predictive
  FROM public.predictive_signals
  WHERE organization_id = _organization_id
    AND detected_at >= now() - interval '90 days'
  LIMIT 30;

  org_summary := jsonb_build_object(
    'total_profiles', (SELECT COUNT(*) FROM public.profiles WHERE organization_id = _organization_id),
    'departments', (SELECT COUNT(*) FROM public.departments WHERE organization_id = _organization_id),
    'units', (SELECT COUNT(*) FROM public.units WHERE organization_id = _organization_id),
    'managers', (SELECT COUNT(DISTINCT manager_id) FROM public.profiles WHERE organization_id = _organization_id AND manager_id IS NOT NULL)
  );

  participation := jsonb_build_object(
    'checkin_participants_30d', (
      SELECT COUNT(DISTINCT user_id) FROM public.emotional_checkins
      WHERE organization_id = _organization_id AND created_at >= now() - interval '30 days'
    ),
    'pulse_participants_30d', (
      SELECT COUNT(DISTINCT user_id) FROM public.pulse_responses
      WHERE organization_id = _organization_id AND responded_at >= now() - interval '30 days'
    )
  );

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.week_of DESC), '[]'::jsonb)
  INTO weekly
  FROM (SELECT * FROM public.get_weekly_checkin_aggregate(_organization_id)) t;

  RETURN jsonb_build_object(
    'generated_at', now(),
    'organization_id', _organization_id,
    'dna_latest', dna,
    'rh_dashboard', dashboard,
    'emotional_map_12w', emotional,
    'pulse_30d', pulse,
    'alerts_60d', alerts,
    'predictive_signals_90d', predictive,
    'org_structure', org_summary,
    'participation', participation,
    'weekly_checkins', weekly
  );
END;
$$;
