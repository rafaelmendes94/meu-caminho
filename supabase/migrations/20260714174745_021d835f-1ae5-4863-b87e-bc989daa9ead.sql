
DO $$ BEGIN CREATE TYPE public.qa_status AS ENUM ('not_started','running','passed','failed','blocked','skipped'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.qa_priority AS ENUM ('low','medium','high','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.qa_severity AS ENUM ('low','medium','high','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.qa_bug_status AS ENUM ('open','in_progress','fixed','wontfix','duplicate','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.qa_checklist_kind AS ENUM ('go_live','new_company','new_version','release','hotfix','smoke'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.qa_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, module TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qa_suites TO authenticated;
GRANT ALL ON public.qa_suites TO service_role;
ALTER TABLE public.qa_suites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_suites admin all" ON public.qa_suites FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_qa_suites_updated BEFORE UPDATE ON public.qa_suites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.qa_test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID REFERENCES public.qa_suites(id) ON DELETE CASCADE,
  code TEXT, title TEXT NOT NULL,
  description TEXT, preconditions TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_result TEXT,
  priority public.qa_priority NOT NULL DEFAULT 'medium',
  assignee UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qa_test_cases TO authenticated;
GRANT ALL ON public.qa_test_cases TO service_role;
ALTER TABLE public.qa_test_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_test_cases admin all" ON public.qa_test_cases FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_qa_test_cases_updated BEFORE UPDATE ON public.qa_test_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.qa_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID REFERENCES public.qa_test_cases(id) ON DELETE CASCADE,
  executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.qa_status NOT NULL DEFAULT 'not_started',
  actual_result TEXT, notes TEXT,
  duration_ms INTEGER,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qa_executions TO authenticated;
GRANT ALL ON public.qa_executions TO service_role;
ALTER TABLE public.qa_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_executions admin all" ON public.qa_executions FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE INDEX IF NOT EXISTS idx_qa_exec_case ON public.qa_executions(test_case_id, executed_at DESC);

CREATE TABLE IF NOT EXISTS public.qa_bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT,
  severity public.qa_severity NOT NULL DEFAULT 'medium',
  area TEXT,
  status public.qa_bug_status NOT NULL DEFAULT 'open',
  assignee UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_case_id UUID REFERENCES public.qa_test_cases(id) ON DELETE SET NULL,
  version TEXT, release TEXT, fix_note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qa_bugs TO authenticated;
GRANT ALL ON public.qa_bugs TO service_role;
ALTER TABLE public.qa_bugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_bugs admin all" ON public.qa_bugs FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_qa_bugs_updated BEFORE UPDATE ON public.qa_bugs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.qa_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind public.qa_checklist_kind NOT NULL DEFAULT 'release',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qa_checklists TO authenticated;
GRANT ALL ON public.qa_checklists TO service_role;
ALTER TABLE public.qa_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_checklists admin all" ON public.qa_checklists FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_qa_checklists_updated BEFORE UPDATE ON public.qa_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.qa_checklist_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES public.qa_checklists(id) ON DELETE CASCADE,
  executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.qa_status NOT NULL DEFAULT 'not_started',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qa_checklist_runs TO authenticated;
GRANT ALL ON public.qa_checklist_runs TO service_role;
ALTER TABLE public.qa_checklist_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_checklist_runs admin all" ON public.qa_checklist_runs FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE TRIGGER trg_qa_checklist_runs_updated BEFORE UPDATE ON public.qa_checklist_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.qa_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES public.qa_executions(id) ON DELETE CASCADE,
  bug_id UUID REFERENCES public.qa_bugs(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  url TEXT NOT NULL,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qa_evidence TO authenticated;
GRANT ALL ON public.qa_evidence TO service_role;
ALTER TABLE public.qa_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_evidence admin all" ON public.qa_evidence FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE IF NOT EXISTS public.qa_go_live_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score INTEGER NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qa_go_live_snapshots TO authenticated;
GRANT ALL ON public.qa_go_live_snapshots TO service_role;
ALTER TABLE public.qa_go_live_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_go_live_snapshots admin all" ON public.qa_go_live_snapshots FOR ALL TO authenticated
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Seed suites
INSERT INTO public.qa_suites (name, module, description) VALUES
  ('Super Admin', 'super_admin', 'Homologação da área do Platform Admin'),
  ('Empresa / RH', 'enterprise_rh', 'Fluxos de Owner/RH e configurações enterprise'),
  ('Colaborador', 'employee', 'Jornada do colaborador: onboarding, check-in, pulse, IA'),
  ('CMS', 'cms', 'Content Studio, cursos, trilhas, livros'),
  ('IA', 'ai', 'Conselho Executivo, DNA, Insights, Rituais, Orchestrator'),
  ('Knowledge Hub', 'knowledge', 'Ingestão, busca semântica e recomendação'),
  ('Performance', 'performance', 'Health, latências, cache, cron'),
  ('Segurança', 'security', 'RLS, roles, MFA, auditoria'),
  ('Billing', 'billing', 'Planos, assinaturas, upgrades'),
  ('Integrações', 'integrations', 'Providers externos e connectors')
ON CONFLICT DO NOTHING;

-- Seed checklists exigidas
INSERT INTO public.qa_checklists (name, kind, items) VALUES
  ('Go Live', 'go_live', '[
    {"label":"Sem bugs críticos abertos","done":false},
    {"label":"Sem bugs altos abertos","done":false},
    {"label":"Cobertura ≥ 95%","done":false},
    {"label":"Backup OK","done":false},
    {"label":"Performance OK","done":false},
    {"label":"Health OK","done":false},
    {"label":"IA OK","done":false},
    {"label":"Storage OK","done":false},
    {"label":"Cron OK","done":false}
  ]'::jsonb),
  ('Nova Empresa', 'new_company', '[
    {"label":"Owner criado","done":false},
    {"label":"Empresa configurada","done":false},
    {"label":"Branding aplicado","done":false},
    {"label":"Plano vinculado","done":false},
    {"label":"Convites enviados","done":false}
  ]'::jsonb),
  ('Nova Versão', 'new_version', '[
    {"label":"Migrations revisadas","done":false},
    {"label":"Types atualizados","done":false},
    {"label":"Suites regressivas ok","done":false},
    {"label":"Changelog publicado","done":false}
  ]'::jsonb),
  ('Release', 'release', '[
    {"label":"Smoke tests verdes","done":false},
    {"label":"Aprovação do Product Owner","done":false},
    {"label":"Backup executado","done":false}
  ]'::jsonb),
  ('Hotfix', 'hotfix', '[
    {"label":"Causa raiz documentada","done":false},
    {"label":"Teste específico criado","done":false},
    {"label":"Deploy verificado","done":false}
  ]'::jsonb),
  ('Smoke Tests', 'smoke', '[
    {"label":"Login","done":false},
    {"label":"Dashboard","done":false},
    {"label":"Empresa","done":false},
    {"label":"RH","done":false},
    {"label":"Colaborador","done":false},
    {"label":"CMS","done":false},
    {"label":"IA","done":false},
    {"label":"Logout","done":false}
  ]'::jsonb)
ON CONFLICT DO NOTHING;
