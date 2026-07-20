
-- Variação realista de scores nos últimos 6 dias para as 3 empresas reais
-- Horizonte: tendência de melhora
WITH days AS (
  SELECT d::date AS score_date, ROW_NUMBER() OVER (ORDER BY d) AS idx
  FROM generate_series(CURRENT_DATE - INTERVAL '5 day', CURRENT_DATE, INTERVAL '1 day') d
),
horizonte AS (
  SELECT 'ef9c9496-bb09-4a4b-a0f3-61098e9f608b'::uuid AS org_id,
         score_date, idx,
         -- score cresce de 48 a 63
         (46 + idx * 2.8 + (random() * 2 - 1))::numeric AS overall,
         (62 + idx * 2 + random()*3)::numeric AS energy,
         (60 + idx * 2.5 + random()*3)::numeric AS engagement,
         (65 + idx * 1.8 + random()*3)::numeric AS communication,
         (63 + idx * 2 + random()*2)::numeric AS equilibrium,
         (68 + idx * 1.6 + random()*3)::numeric AS recovery,
         (35 + idx * 4 + random()*4)::numeric AS participation,
         GREATEST(4, 20 - idx*2)::numeric AS risk
  FROM days
),
valesul AS (
  SELECT 'a1806adf-0d8b-4d4c-99ea-a56baa0a5596'::uuid AS org_id,
         score_date, idx,
         -- score em queda leve de 42 para 30
         (44 - idx * 2.3 + (random()*2-1))::numeric AS overall,
         (55 - idx*1.5 + random()*3)::numeric AS energy,
         (50 - idx*2 + random()*3)::numeric AS engagement,
         (58 - idx*1.2 + random()*3)::numeric AS communication,
         (52 - idx*2 + random()*2)::numeric AS equilibrium,
         (48 - idx*1.5 + random()*3)::numeric AS recovery,
         (30 - idx*2 + random()*3)::numeric AS participation,
         LEAST(25, 10 + idx*2)::numeric AS risk
  FROM days
),
atlantica AS (
  SELECT '4d1d2d59-e32c-4283-80f4-2a09c68b35d8'::uuid AS org_id,
         score_date, idx,
         -- oscilação com pico no meio
         (50 + SIN(idx::float) * 8 + random()*3)::numeric AS overall,
         (65 + SIN(idx::float)*5 + random()*3)::numeric AS energy,
         (60 + SIN(idx::float)*6 + random()*3)::numeric AS engagement,
         (68 + SIN(idx::float)*4 + random()*3)::numeric AS communication,
         (63 + SIN(idx::float)*5 + random()*2)::numeric AS equilibrium,
         (66 + SIN(idx::float)*4 + random()*3)::numeric AS recovery,
         (42 + SIN(idx::float)*8 + random()*3)::numeric AS participation,
         (12 + random()*3)::numeric AS risk
  FROM days
),
combined AS (
  SELECT * FROM horizonte
  UNION ALL SELECT * FROM valesul
  UNION ALL SELECT * FROM atlantica
)
INSERT INTO public.organizational_scores (
  organization_id, score_date, overall_score,
  energy_score, engagement_score, communication_score,
  equilibrium_score, recovery_score, participation_score,
  risk_penalty, confidence, evidence
)
SELECT
  org_id, score_date,
  ROUND(LEAST(100, GREATEST(0, overall))::numeric, 2),
  ROUND(LEAST(100, GREATEST(0, energy))::numeric, 2),
  ROUND(LEAST(100, GREATEST(0, engagement))::numeric, 2),
  ROUND(LEAST(100, GREATEST(0, communication))::numeric, 2),
  ROUND(LEAST(100, GREATEST(0, equilibrium))::numeric, 2),
  ROUND(LEAST(100, GREATEST(0, recovery))::numeric, 2),
  ROUND(LEAST(100, GREATEST(0, participation))::numeric, 2),
  ROUND(risk::numeric, 2),
  0.95,
  jsonb_build_object(
    'base_score', ROUND(LEAST(100, GREATEST(0, overall + risk))::numeric, 2),
    'total_profiles', 42,
    'pulse_participants', (20 + idx*2 + floor(random()*5))::int,
    'checkin_participants', (25 + idx*2 + floor(random()*5))::int,
    'pulse_counts', jsonb_build_object(
      'clima', (10 + floor(random()*8))::int,
      'engajamento', (12 + floor(random()*6))::int,
      'lideranca', (8 + floor(random()*5))::int
    ),
    'penalties', jsonb_build_object(
      'baixa_participacao', GREATEST(0, 8 - idx),
      'clima_negativo', GREATEST(0, 6 - idx)
    )
  )
FROM combined
ON CONFLICT (organization_id, score_date) DO UPDATE SET
  overall_score = EXCLUDED.overall_score,
  energy_score = EXCLUDED.energy_score,
  engagement_score = EXCLUDED.engagement_score,
  communication_score = EXCLUDED.communication_score,
  equilibrium_score = EXCLUDED.equilibrium_score,
  recovery_score = EXCLUDED.recovery_score,
  participation_score = EXCLUDED.participation_score,
  risk_penalty = EXCLUDED.risk_penalty,
  confidence = EXCLUDED.confidence,
  evidence = EXCLUDED.evidence;
