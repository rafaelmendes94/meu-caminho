
-- ===== departments =====
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  leader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_departments_org ON public.departments(organization_id);
CREATE INDEX idx_departments_parent ON public.departments(parent_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departments_select_org"
  ON public.departments FOR SELECT TO authenticated
  USING (organization_id = public.current_organization_id());
CREATE POLICY "departments_admin_all"
  ON public.departments FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[]))
  WITH CHECK (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[]));

CREATE TRIGGER trg_departments_updated
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== units =====
CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  timezone text DEFAULT 'America/Sao_Paulo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_units_org ON public.units(organization_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.units TO authenticated;
GRANT ALL ON public.units TO service_role;

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_select_org"
  ON public.units FOR SELECT TO authenticated
  USING (organization_id = public.current_organization_id());
CREATE POLICY "units_admin_all"
  ON public.units FOR ALL TO authenticated
  USING (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[]))
  WITH CHECK (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[]));

CREATE TRIGGER trg_units_updated
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== profiles extras =====
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS hired_at date;

CREATE INDEX IF NOT EXISTS idx_profiles_manager ON public.profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_unit_id ON public.profiles(unit_id);

-- ===== enterprise_invites extras =====
ALTER TABLE public.enterprise_invites
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ===== org_chart_snapshots =====
CREATE TABLE public.org_chart_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  tree jsonb NOT NULL
);
CREATE INDEX idx_org_snapshots_org ON public.org_chart_snapshots(organization_id, snapshot_at DESC);

GRANT SELECT ON public.org_chart_snapshots TO authenticated;
GRANT ALL ON public.org_chart_snapshots TO service_role;

ALTER TABLE public.org_chart_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_snapshots_admin_select"
  ON public.org_chart_snapshots FOR SELECT TO authenticated
  USING (organization_id = public.current_organization_id() AND public.has_any_role(ARRAY['owner','rh_admin']::app_role[]));

-- ===== org_tree =====
CREATE OR REPLACE FUNCTION public.org_tree(_organization_id uuid)
RETURNS TABLE(
  profile_id uuid,
  full_name text,
  job_title text,
  department_name text,
  unit_name text,
  manager_id uuid,
  level int,
  direct_reports_count bigint,
  total_reports_count bigint,
  status text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
    RAISE EXCEPTION 'organization mismatch';
  END IF;

  RETURN QUERY
  WITH RECURSIVE tree AS (
    SELECT p.id, p.full_name, p.job_title, p.department_id, p.unit_id,
           p.manager_id, 0 AS level, p.status
    FROM public.profiles p
    WHERE p.organization_id = _organization_id AND p.manager_id IS NULL
    UNION ALL
    SELECT p.id, p.full_name, p.job_title, p.department_id, p.unit_id,
           p.manager_id, t.level + 1, p.status
    FROM public.profiles p
    JOIN tree t ON p.manager_id = t.id
    WHERE p.organization_id = _organization_id
  ),
  direct AS (
    SELECT manager_id AS mgr, COUNT(*)::bigint AS cnt
    FROM public.profiles
    WHERE organization_id = _organization_id AND manager_id IS NOT NULL
    GROUP BY manager_id
  ),
  descendants AS (
    SELECT t.id AS root_id, sub.id AS desc_id
    FROM tree t
    JOIN LATERAL (
      WITH RECURSIVE d AS (
        SELECT p.id, p.manager_id FROM public.profiles p
        WHERE p.manager_id = t.id AND p.organization_id = _organization_id
        UNION ALL
        SELECT p.id, p.manager_id FROM public.profiles p
        JOIN d ON p.manager_id = d.id
        WHERE p.organization_id = _organization_id
      )
      SELECT id FROM d
    ) sub ON TRUE
  ),
  totals AS (
    SELECT root_id, COUNT(*)::bigint AS cnt FROM descendants GROUP BY root_id
  )
  SELECT
    t.id, t.full_name, t.job_title,
    d.name, u.name,
    t.manager_id, t.level,
    COALESCE(dir.cnt, 0), COALESCE(tot.cnt, 0),
    t.status
  FROM tree t
  LEFT JOIN public.departments d ON d.id = t.department_id
  LEFT JOIN public.units u ON u.id = t.unit_id
  LEFT JOIN direct dir ON dir.mgr = t.id
  LEFT JOIN totals tot ON tot.root_id = t.id
  ORDER BY t.level, t.full_name NULLS LAST;
END;
$$;

-- ===== org_node_indicators =====
CREATE OR REPLACE FUNCTION public.org_node_indicators(
  _organization_id uuid,
  _profile_id uuid,
  _days int DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participants bigint := 0;
  avg_mood numeric;
  avg_energy numeric;
  avg_stress numeric;
  equilibrium numeric;
  pulse_json jsonb := '{}'::jsonb;
  pulse_row record;
  since timestamptz := now() - make_interval(days => _days);
BEGIN
  IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
    RAISE EXCEPTION 'organization mismatch';
  END IF;

  -- Set of user_ids: selected profile + all descendants
  CREATE TEMP TABLE IF NOT EXISTS _org_node_scope (user_id uuid PRIMARY KEY) ON COMMIT DROP;
  DELETE FROM _org_node_scope;

  WITH RECURSIVE d AS (
    SELECT id FROM public.profiles
    WHERE id = _profile_id AND organization_id = _organization_id
    UNION ALL
    SELECT p.id FROM public.profiles p
    JOIN d ON p.manager_id = d.id
    WHERE p.organization_id = _organization_id
  )
  INSERT INTO _org_node_scope(user_id) SELECT id FROM d;

  SELECT COUNT(DISTINCT ec.user_id),
         ROUND(AVG(ec.mood_score)::numeric, 2),
         ROUND(AVG(ec.energy_score)::numeric, 2),
         ROUND(AVG(ec.stress_score)::numeric, 2)
  INTO participants, avg_mood, avg_energy, avg_stress
  FROM public.emotional_checkins ec
  WHERE ec.organization_id = _organization_id
    AND ec.user_id IN (SELECT user_id FROM _org_node_scope)
    AND ec.created_at >= since;

  IF participants < 5 THEN
    avg_mood := NULL; avg_energy := NULL; avg_stress := NULL; equilibrium := NULL;
  ELSE
    equilibrium := ROUND(((COALESCE(avg_mood,0) + COALESCE(avg_energy,0) + (5 - COALESCE(avg_stress,0))) / 3.0)::numeric, 2);
  END IF;

  FOR pulse_row IN
    SELECT pp.dimension,
           ROUND(AVG(pr.value_num)::numeric, 2) AS avg_value,
           COUNT(DISTINCT pr.user_id) AS pcount
    FROM public.pulse_responses pr
    JOIN public.pulse_prompts pp ON pp.id = pr.prompt_id
    WHERE pr.organization_id = _organization_id
      AND pr.user_id IN (SELECT user_id FROM _org_node_scope)
      AND pr.responded_at >= since
    GROUP BY pp.dimension
  LOOP
    IF pulse_row.pcount >= 5 THEN
      pulse_json := pulse_json || jsonb_build_object(pulse_row.dimension, pulse_row.avg_value);
    ELSE
      pulse_json := pulse_json || jsonb_build_object(pulse_row.dimension, NULL);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'participants_count', participants,
    'avg_mood', avg_mood,
    'avg_energy', avg_energy,
    'avg_stress', avg_stress,
    'equilibrium_index', equilibrium,
    'pulse_energy', pulse_json->'energy',
    'pulse_engagement', pulse_json->'engagement',
    'pulse_communication', pulse_json->'communication',
    'pulse_equilibrium', pulse_json->'equilibrium',
    'pulse_recovery', pulse_json->'recovery'
  );
END;
$$;
