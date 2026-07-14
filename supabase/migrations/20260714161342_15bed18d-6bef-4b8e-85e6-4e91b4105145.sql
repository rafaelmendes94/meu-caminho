-- =========================================================
-- AI LAB™ schema
-- =========================================================

-- Datasets
CREATE TABLE public.ai_lab_datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  ai_module text NOT NULL,
  description text,
  default_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_lab_datasets TO authenticated;
GRANT ALL ON public.ai_lab_datasets TO service_role;
ALTER TABLE public.ai_lab_datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab admins datasets" ON public.ai_lab_datasets FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE TABLE public.ai_lab_dataset_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid NOT NULL REFERENCES public.ai_lab_datasets(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  question text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  expected_answer text,
  criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  weight numeric NOT NULL DEFAULT 1.0,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_lab_dataset_items_ds_idx ON public.ai_lab_dataset_items (dataset_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_lab_dataset_items TO authenticated;
GRANT ALL ON public.ai_lab_dataset_items TO service_role;
ALTER TABLE public.ai_lab_dataset_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab admins dataset items" ON public.ai_lab_dataset_items FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

-- Runs (Playground / Benchmark / Experimento / Dataset)
CREATE TABLE public.ai_lab_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('playground','benchmark','experiment','dataset','judge')),
  ai_module text,
  prompt_config_id uuid REFERENCES public.ai_prompt_configs(id) ON DELETE SET NULL,
  prompt_version integer,
  prompt_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text NOT NULL,
  temperature numeric,
  max_tokens integer,
  organization_id uuid,
  question text NOT NULL,
  final_prompt jsonb NOT NULL DEFAULT '[]'::jsonb,
  response_raw text,
  response_parsed jsonb,
  tokens_in integer DEFAULT 0,
  tokens_out integer DEFAULT 0,
  cost_usd numeric DEFAULT 0,
  latency_ms integer DEFAULT 0,
  knowledge_enabled boolean NOT NULL DEFAULT true,
  context_enabled boolean NOT NULL DEFAULT true,
  streaming boolean NOT NULL DEFAULT false,
  chunks_used jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  status text NOT NULL DEFAULT 'ok' CHECK (status IN ('ok','error','timeout')),
  error text,
  dataset_id uuid REFERENCES public.ai_lab_datasets(id) ON DELETE SET NULL,
  dataset_item_id uuid REFERENCES public.ai_lab_dataset_items(id) ON DELETE SET NULL,
  parent_run_id uuid REFERENCES public.ai_lab_runs(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_lab_runs_kind_idx ON public.ai_lab_runs (kind, created_at DESC);
CREATE INDEX ai_lab_runs_config_idx ON public.ai_lab_runs (prompt_config_id, created_at DESC);
CREATE INDEX ai_lab_runs_dataset_idx ON public.ai_lab_runs (dataset_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_lab_runs TO authenticated;
GRANT ALL ON public.ai_lab_runs TO service_role;
ALTER TABLE public.ai_lab_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab admins runs" ON public.ai_lab_runs FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

-- Avaliações (humano ou LLM-as-judge)
CREATE TABLE public.ai_lab_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.ai_lab_runs(id) ON DELETE CASCADE,
  evaluator_kind text NOT NULL CHECK (evaluator_kind IN ('human','llm_judge')),
  evaluator_id uuid,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  overall numeric,
  comment text,
  judge_model text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_lab_evaluations_run_idx ON public.ai_lab_evaluations (run_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_lab_evaluations TO authenticated;
GRANT ALL ON public.ai_lab_evaluations TO service_role;
ALTER TABLE public.ai_lab_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab admins evals" ON public.ai_lab_evaluations FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

-- Benchmarks
CREATE TABLE public.ai_lab_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ai_module text NOT NULL,
  dataset_id uuid REFERENCES public.ai_lab_datasets(id) ON DELETE SET NULL,
  prompt_config_id uuid REFERENCES public.ai_prompt_configs(id) ON DELETE SET NULL,
  prompt_version integer,
  model text NOT NULL,
  aggregate jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','complete','failed')),
  error text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX ai_lab_benchmarks_module_idx ON public.ai_lab_benchmarks (ai_module, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_lab_benchmarks TO authenticated;
GRANT ALL ON public.ai_lab_benchmarks TO service_role;
ALTER TABLE public.ai_lab_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab admins benchmarks" ON public.ai_lab_benchmarks FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

-- Experimentos A/B
CREATE TABLE public.ai_lab_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ai_module text NOT NULL,
  hypothesis text,
  prompt_a_id uuid REFERENCES public.ai_prompt_configs(id) ON DELETE SET NULL,
  prompt_a_version integer,
  prompt_a_snapshot jsonb,
  prompt_b_id uuid REFERENCES public.ai_prompt_configs(id) ON DELETE SET NULL,
  prompt_b_version integer,
  prompt_b_snapshot jsonb,
  model_a text NOT NULL,
  model_b text NOT NULL,
  dataset_id uuid REFERENCES public.ai_lab_datasets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','running','complete','failed')),
  winner text CHECK (winner IN ('a','b','tie','inconclusive') OR winner IS NULL),
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_lab_experiments TO authenticated;
GRANT ALL ON public.ai_lab_experiments TO service_role;
ALTER TABLE public.ai_lab_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab admins experiments" ON public.ai_lab_experiments FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE TABLE public.ai_lab_experiment_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.ai_lab_experiments(id) ON DELETE CASCADE,
  variant text NOT NULL CHECK (variant IN ('a','b')),
  run_id uuid NOT NULL REFERENCES public.ai_lab_runs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_lab_experiment_runs_exp_idx ON public.ai_lab_experiment_runs (experiment_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_lab_experiment_runs TO authenticated;
GRANT ALL ON public.ai_lab_experiment_runs TO service_role;
ALTER TABLE public.ai_lab_experiment_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab admins experiment runs" ON public.ai_lab_experiment_runs FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

-- Publicações e Rollbacks (histórico próprio, independente de ai_prompt_versions)
CREATE TABLE public.ai_lab_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_config_id uuid NOT NULL REFERENCES public.ai_prompt_configs(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('publish','rollback','archive')),
  from_version integer,
  to_version integer,
  benchmark_id uuid REFERENCES public.ai_lab_benchmarks(id) ON DELETE SET NULL,
  experiment_id uuid REFERENCES public.ai_lab_experiments(id) ON DELETE SET NULL,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_lab_publications_config_idx ON public.ai_lab_publications (prompt_config_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_lab_publications TO authenticated;
GRANT ALL ON public.ai_lab_publications TO service_role;
ALTER TABLE public.ai_lab_publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab admins pubs" ON public.ai_lab_publications FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

-- Logs / Auditoria
CREATE TABLE public.ai_lab_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_id uuid,
  target_kind text,
  target_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_lab_logs_action_idx ON public.ai_lab_logs (action, created_at DESC);
GRANT SELECT, INSERT ON public.ai_lab_logs TO authenticated;
GRANT ALL ON public.ai_lab_logs TO service_role;
ALTER TABLE public.ai_lab_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab admins logs read" ON public.ai_lab_logs FOR SELECT TO authenticated
  USING (public.is_platform_admin());
CREATE POLICY "lab admins logs insert" ON public.ai_lab_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

-- updated_at triggers
CREATE TRIGGER ai_lab_datasets_upd BEFORE UPDATE ON public.ai_lab_datasets
  FOR EACH ROW EXECUTE FUNCTION public.tg_ai_prompt_configs_updated_at();
