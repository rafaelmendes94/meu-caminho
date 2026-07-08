
-- ============ emotional_checkins ============
CREATE TABLE public.emotional_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  mood_score int NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  energy_score int NOT NULL CHECK (energy_score BETWEEN 1 AND 5),
  stress_score int NOT NULL CHECK (stress_score BETWEEN 1 AND 5),
  notes text,
  tags text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  week_of date GENERATED ALWAYS AS ((date_trunc('week', (created_at AT TIME ZONE 'UTC')))::date) STORED
);
CREATE INDEX idx_emotional_checkins_user ON public.emotional_checkins(user_id, created_at DESC);
CREATE INDEX idx_emotional_checkins_org_week ON public.emotional_checkins(organization_id, week_of);

GRANT SELECT, INSERT ON public.emotional_checkins TO authenticated;
GRANT ALL ON public.emotional_checkins TO service_role;

ALTER TABLE public.emotional_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own checkins select" ON public.emotional_checkins
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own checkins insert" ON public.emotional_checkins
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND organization_id = public.current_organization_id());

-- ============ pulse_prompts ============
CREATE TABLE public.pulse_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  question text NOT NULL,
  response_type text NOT NULL DEFAULT 'scale_1_5' CHECK (response_type IN ('scale_1_5','emoji_5','binary')),
  dimension text NOT NULL CHECK (dimension IN ('energy','engagement','communication','equilibrium','recovery')),
  rotation_weight int NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pulse_prompts TO authenticated;
GRANT ALL ON public.pulse_prompts TO service_role;

ALTER TABLE public.pulse_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prompts read active" ON public.pulse_prompts
  FOR SELECT TO authenticated USING (active = true);

INSERT INTO public.pulse_prompts (code, question, dimension) VALUES
  ('energy_today', 'Como está sua energia hoje?', 'energy'),
  ('engagement_today', 'Hoje você se sente conectado ao seu trabalho?', 'engagement'),
  ('communication_week', 'Como está a comunicação com sua equipe nesta semana?', 'communication'),
  ('equilibrium_today', 'Como está seu equilíbrio emocional hoje?', 'equilibrium'),
  ('recovery_recent', 'Você sente que conseguiu se recuperar bem nos últimos dias?', 'recovery');

-- ============ pulse_responses ============
CREATE TABLE public.pulse_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES public.pulse_prompts(id),
  value_num int CHECK (value_num BETWEEN 1 AND 5),
  value_text text,
  context text,
  responded_at timestamptz NOT NULL DEFAULT now(),
  week_of date GENERATED ALWAYS AS ((date_trunc('week', (responded_at AT TIME ZONE 'UTC')))::date) STORED
);
CREATE INDEX idx_pulse_responses_user ON public.pulse_responses(user_id, responded_at DESC);
CREATE INDEX idx_pulse_responses_org_week ON public.pulse_responses(organization_id, week_of);
CREATE INDEX idx_pulse_responses_prompt ON public.pulse_responses(prompt_id);

GRANT SELECT, INSERT ON public.pulse_responses TO authenticated;
GRANT ALL ON public.pulse_responses TO service_role;

ALTER TABLE public.pulse_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own pulse select" ON public.pulse_responses
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own pulse insert" ON public.pulse_responses
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND organization_id = public.current_organization_id());

-- ============ pulse_schedules ============
CREATE TABLE public.pulse_schedules (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_days int[] NOT NULL DEFAULT '{2,4}',
  preferred_hour int NOT NULL DEFAULT 10,
  snooze_until timestamptz,
  opted_out boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.pulse_schedules TO authenticated;
GRANT ALL ON public.pulse_schedules TO service_role;

ALTER TABLE public.pulse_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own schedule select" ON public.pulse_schedules
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own schedule insert" ON public.pulse_schedules
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own schedule update" ON public.pulse_schedules
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_pulse_schedules_updated
  BEFORE UPDATE ON public.pulse_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Aggregations (RH-safe, k-anonimato >= 5) ============
CREATE OR REPLACE FUNCTION public.get_weekly_checkin_aggregate(_organization_id uuid)
RETURNS TABLE (
  week_of date,
  avg_mood numeric,
  avg_energy numeric,
  avg_stress numeric,
  participants_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ec.week_of,
    ROUND(AVG(ec.mood_score)::numeric, 2) AS avg_mood,
    ROUND(AVG(ec.energy_score)::numeric, 2) AS avg_energy,
    ROUND(AVG(ec.stress_score)::numeric, 2) AS avg_stress,
    COUNT(DISTINCT ec.user_id) AS participants_count
  FROM public.emotional_checkins ec
  WHERE ec.organization_id = _organization_id
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
    AND _organization_id = public.current_organization_id()
  GROUP BY ec.week_of
  HAVING COUNT(DISTINCT ec.user_id) >= 5
  ORDER BY ec.week_of DESC;
$$;

REVOKE ALL ON FUNCTION public.get_weekly_checkin_aggregate(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_weekly_checkin_aggregate(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_pulse_aggregate(_organization_id uuid, _days int DEFAULT 30)
RETURNS TABLE (
  dimension text,
  avg_value numeric,
  participants_count bigint,
  response_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pp.dimension,
    ROUND(AVG(pr.value_num)::numeric, 2) AS avg_value,
    COUNT(DISTINCT pr.user_id) AS participants_count,
    COUNT(*) AS response_count
  FROM public.pulse_responses pr
  JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
  WHERE pr.organization_id = _organization_id
    AND pr.responded_at >= now() - make_interval(days => _days)
    AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[])
    AND _organization_id = public.current_organization_id()
  GROUP BY pp.dimension
  HAVING COUNT(DISTINCT pr.user_id) >= 5
  ORDER BY pp.dimension;
$$;

REVOKE ALL ON FUNCTION public.get_pulse_aggregate(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pulse_aggregate(uuid, int) TO authenticated;
