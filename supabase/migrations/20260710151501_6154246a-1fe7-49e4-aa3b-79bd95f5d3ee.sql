
-- M-03: baseline snapshot
ALTER TABLE public.impact_measurements
  ADD COLUMN IF NOT EXISTS baseline_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_title text;

-- Refresh measure_impact to freeze baseline snapshot
CREATE OR REPLACE FUNCTION public.measure_impact(
  _organization_id uuid,
  _source_type text,
  _source_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_service boolean := (current_setting('role', true) = 'service_role');
  ref_date timestamptz;
  baseline numeric;
  current_s numeric;
  impact numeric;
  confidence numeric := 0.3;
  evidence jsonb := '{}'::jsonb;
  snapshot jsonb := '{}'::jsonb;
  src_title text;
  summary text;
  score_before_row record;
  score_after_row record;
  participation bigint := 0;
  alerts_open bigint := 0;
BEGIN
  IF NOT is_service THEN
    IF NOT public.has_any_role(ARRAY['owner','rh_admin']::app_role[]) THEN
      RAISE EXCEPTION 'not authorized';
    END IF;
    IF _organization_id IS DISTINCT FROM public.current_organization_id() THEN
      RAISE EXCEPTION 'organization mismatch';
    END IF;
  END IF;

  IF _source_type NOT IN ('action_plan','ritual','weekly_insight') THEN
    RAISE EXCEPTION 'invalid source_type';
  END IF;

  IF _source_type = 'action_plan' THEN
    SELECT created_at, to_jsonb(ap.*), COALESCE(ap.title, 'Plano de ação')
      INTO ref_date, snapshot, src_title
    FROM public.action_plans ap
    WHERE ap.id = _source_id AND ap.organization_id = _organization_id;
  ELSIF _source_type = 'ritual' THEN
    SELECT created_at, to_jsonb(ir.*), COALESCE(ir.title, 'Ritual')
      INTO ref_date, snapshot, src_title
    FROM public.intelligent_rituals ir
    WHERE ir.id = _source_id AND ir.organization_id = _organization_id;
  ELSIF _source_type = 'weekly_insight' THEN
    SELECT generated_at, to_jsonb(wi.*), COALESCE(wi.title, 'Insight semanal')
      INTO ref_date, snapshot, src_title
    FROM public.weekly_ai_insights wi
    WHERE wi.id = _source_id AND wi.organization_id = _organization_id;
  END IF;

  IF ref_date IS NULL THEN
    RAISE EXCEPTION 'source not found';
  END IF;

  SELECT overall_score, confidence, score_date INTO score_before_row
  FROM public.organizational_scores
  WHERE organization_id = _organization_id AND score_date <= ref_date::date
  ORDER BY score_date DESC LIMIT 1;

  SELECT overall_score, confidence, score_date INTO score_after_row
  FROM public.organizational_scores
  WHERE organization_id = _organization_id AND score_date > ref_date::date
  ORDER BY score_date DESC LIMIT 1;

  baseline := score_before_row.overall_score;
  current_s := score_after_row.overall_score;
  IF baseline IS NOT NULL AND current_s IS NOT NULL THEN
    impact := ROUND((current_s - baseline)::numeric, 2);
  END IF;

  SELECT COUNT(DISTINCT user_id) INTO participation
  FROM public.emotional_checkins
  WHERE organization_id = _organization_id AND created_at >= ref_date;

  SELECT COUNT(*) INTO alerts_open
  FROM public.alerts
  WHERE organization_id = _organization_id AND status = 'open' AND created_at >= ref_date;

  confidence := ROUND(LEAST(1.0, (
    COALESCE(score_before_row.confidence, 0) * 0.4 +
    COALESCE(score_after_row.confidence, 0) * 0.4 +
    (CASE WHEN participation >= 5 THEN 0.2 ELSE participation::numeric / 25 END)
  ))::numeric, 2);

  evidence := jsonb_build_object(
    'baseline_date', score_before_row.score_date,
    'current_date', score_after_row.score_date,
    'baseline_confidence', score_before_row.confidence,
    'current_confidence', score_after_row.confidence,
    'participation_after', participation,
    'alerts_after', alerts_open,
    'ref_date', ref_date
  );

  summary := CASE
    WHEN impact IS NULL THEN 'Sem dados suficientes de score antes/depois para medir impacto.'
    WHEN impact >= 3 THEN 'Impacto positivo relevante identificado após a iniciativa.'
    WHEN impact > 0 THEN 'Melhora leve observada após a iniciativa.'
    WHEN impact = 0 THEN 'Sem variação significativa no score organizacional.'
    WHEN impact <= -3 THEN 'Queda relevante do score após a iniciativa; investigar contexto.'
    ELSE 'Leve queda do score após a iniciativa.'
  END;

  INSERT INTO public.impact_measurements (
    organization_id, source_type, source_id, source_title,
    baseline_score, current_score, impact_score, confidence,
    evidence, baseline_snapshot, summary
  ) VALUES (
    _organization_id, _source_type, _source_id, src_title,
    baseline, current_s, impact, confidence,
    evidence, COALESCE(snapshot, '{}'::jsonb), summary
  );

  INSERT INTO public.impact_timelines (
    organization_id, event_type, event_id, event_date,
    score_before, score_after, delta
  ) VALUES (
    _organization_id, _source_type, _source_id, ref_date,
    baseline, current_s, impact
  );

  RETURN jsonb_build_object(
    'organization_id', _organization_id,
    'source_type', _source_type,
    'source_id', _source_id,
    'source_title', src_title,
    'baseline_score', baseline,
    'current_score', current_s,
    'impact_score', impact,
    'confidence', confidence,
    'evidence', evidence,
    'baseline_snapshot', snapshot,
    'summary', summary
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.measure_impact(uuid, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.measure_impact(uuid, text, uuid) TO service_role;

-- B-02: revoke anon/public execute on SECURITY DEFINER functions in public
DO $$
DECLARE
  fn record;
  sig text;
BEGIN
  FOR fn IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    sig := format('%I.%I(%s)', fn.nspname, fn.proname, fn.args);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', sig);
  END LOOP;
END $$;
