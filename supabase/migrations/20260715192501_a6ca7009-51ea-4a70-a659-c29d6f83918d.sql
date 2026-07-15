CREATE OR REPLACE FUNCTION public.measure_impact(_organization_id uuid, _source_type text, _source_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_service boolean := (current_setting('role', true) = 'service_role');
  ref_date timestamptz;
  baseline numeric;
  current_s numeric;
  impact numeric;
  v_confidence numeric := 0.3;
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
    SELECT ap.created_at, to_jsonb(ap.*), COALESCE(ap.title, 'Plano de ação')
      INTO ref_date, snapshot, src_title
    FROM public.action_plans ap
    WHERE ap.id = _source_id AND ap.organization_id = _organization_id;
  ELSIF _source_type = 'ritual' THEN
    SELECT ir.created_at, to_jsonb(ir.*), COALESCE(ir.title, 'Ritual')
      INTO ref_date, snapshot, src_title
    FROM public.intelligent_rituals ir
    WHERE ir.id = _source_id AND ir.organization_id = _organization_id;
  ELSIF _source_type = 'weekly_insight' THEN
    SELECT wi.generated_at, to_jsonb(wi.*), COALESCE(wi.title, 'Insight semanal')
      INTO ref_date, snapshot, src_title
    FROM public.weekly_ai_insights wi
    WHERE wi.id = _source_id AND wi.organization_id = _organization_id;
  END IF;

  IF ref_date IS NULL THEN
    RAISE EXCEPTION 'source not found';
  END IF;

  SELECT os.overall_score, os.confidence, os.score_date INTO score_before_row
  FROM public.organizational_scores os
  WHERE os.organization_id = _organization_id AND os.score_date <= ref_date::date
  ORDER BY os.score_date DESC LIMIT 1;

  SELECT os.overall_score, os.confidence, os.score_date INTO score_after_row
  FROM public.organizational_scores os
  WHERE os.organization_id = _organization_id AND os.score_date > ref_date::date
  ORDER BY os.score_date DESC LIMIT 1;

  baseline := score_before_row.overall_score;
  current_s := score_after_row.overall_score;
  IF baseline IS NOT NULL AND current_s IS NOT NULL THEN
    impact := ROUND((current_s - baseline)::numeric, 2);
  END IF;

  SELECT COUNT(DISTINCT ec.user_id) INTO participation
  FROM public.emotional_checkins ec
  WHERE ec.organization_id = _organization_id AND ec.created_at >= ref_date;

  SELECT COUNT(*) INTO alerts_open
  FROM public.alerts a
  WHERE a.organization_id = _organization_id AND a.status = 'open' AND a.created_at >= ref_date;

  v_confidence := ROUND(LEAST(1.0, (
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
    baseline, current_s, impact, v_confidence,
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
    'confidence', v_confidence,
    'evidence', evidence,
    'baseline_snapshot', snapshot,
    'summary', summary
  );
END;
$function$;