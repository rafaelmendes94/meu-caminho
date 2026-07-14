
-- ============ CMS Enterprise tables ============

-- Competencies
CREATE TABLE public.cms_competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  color text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_competencies TO authenticated;
GRANT ALL ON public.cms_competencies TO service_role;
ALTER TABLE public.cms_competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_competencies platform_admin" ON public.cms_competencies FOR ALL
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Emotions
CREATE TABLE public.cms_emotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  color text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_emotions TO authenticated;
GRANT ALL ON public.cms_emotions TO service_role;
ALTER TABLE public.cms_emotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_emotions platform_admin" ON public.cms_emotions FOR ALL
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Reflections
CREATE TABLE public.cms_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  theme text,
  competency_id uuid REFERENCES public.cms_competencies(id) ON DELETE SET NULL,
  emotion_id uuid REFERENCES public.cms_emotions(id) ON DELETE SET NULL,
  category_id uuid,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_reflections TO authenticated;
GRANT ALL ON public.cms_reflections TO service_role;
ALTER TABLE public.cms_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_reflections platform_admin" ON public.cms_reflections FOR ALL
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Motivational messages
CREATE TABLE public.cms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body text NOT NULL,
  category text NOT NULL,
  tone text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_messages TO authenticated;
GRANT ALL ON public.cms_messages TO service_role;
ALTER TABLE public.cms_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_messages platform_admin" ON public.cms_messages FOR ALL
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Quizzes
CREATE TABLE public.cms_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  course_id uuid,
  passing_score int NOT NULL DEFAULT 70,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_quizzes TO authenticated;
GRANT ALL ON public.cms_quizzes TO service_role;
ALTER TABLE public.cms_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_quizzes platform_admin" ON public.cms_quizzes FOR ALL
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.cms_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.cms_quizzes(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  qtype text NOT NULL DEFAULT 'single',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  answer jsonb,
  weight int NOT NULL DEFAULT 1,
  feedback text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_quiz_questions TO authenticated;
GRANT ALL ON public.cms_quiz_questions TO service_role;
ALTER TABLE public.cms_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_quiz_questions platform_admin" ON public.cms_quiz_questions FOR ALL
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Certificates templates
CREATE TABLE public.cms_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  html_template text NOT NULL,
  platform_logo_url text,
  organization_logo_url text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_certificates TO authenticated;
GRANT ALL ON public.cms_certificates TO service_role;
ALTER TABLE public.cms_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_certificates platform_admin" ON public.cms_certificates FOR ALL
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Content versions (snapshot history for any content_item)
CREATE TABLE public.cms_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL,
  version int NOT NULL,
  snapshot jsonb NOT NULL,
  author_id uuid,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_content_versions TO authenticated;
GRANT ALL ON public.cms_content_versions TO service_role;
ALTER TABLE public.cms_content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_content_versions platform_admin" ON public.cms_content_versions FOR ALL
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));
CREATE INDEX cms_content_versions_item_idx ON public.cms_content_versions (content_item_id, version DESC);

-- Content imports
CREATE TABLE public.cms_content_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  source text,
  file_url text,
  status text NOT NULL DEFAULT 'pending',
  total int NOT NULL DEFAULT 0,
  succeeded int NOT NULL DEFAULT 0,
  failed int NOT NULL DEFAULT 0,
  log jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_content_imports TO authenticated;
GRANT ALL ON public.cms_content_imports TO service_role;
ALTER TABLE public.cms_content_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_content_imports platform_admin" ON public.cms_content_imports FOR ALL
  USING (public.has_role('platform_admin'::app_role)) WITH CHECK (public.has_role('platform_admin'::app_role));

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.cms_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_cms_competencies_touch BEFORE UPDATE ON public.cms_competencies FOR EACH ROW EXECUTE FUNCTION public.cms_touch_updated_at();
CREATE TRIGGER trg_cms_emotions_touch BEFORE UPDATE ON public.cms_emotions FOR EACH ROW EXECUTE FUNCTION public.cms_touch_updated_at();
CREATE TRIGGER trg_cms_reflections_touch BEFORE UPDATE ON public.cms_reflections FOR EACH ROW EXECUTE FUNCTION public.cms_touch_updated_at();
CREATE TRIGGER trg_cms_messages_touch BEFORE UPDATE ON public.cms_messages FOR EACH ROW EXECUTE FUNCTION public.cms_touch_updated_at();
CREATE TRIGGER trg_cms_quizzes_touch BEFORE UPDATE ON public.cms_quizzes FOR EACH ROW EXECUTE FUNCTION public.cms_touch_updated_at();
CREATE TRIGGER trg_cms_quiz_questions_touch BEFORE UPDATE ON public.cms_quiz_questions FOR EACH ROW EXECUTE FUNCTION public.cms_touch_updated_at();
CREATE TRIGGER trg_cms_certificates_touch BEFORE UPDATE ON public.cms_certificates FOR EACH ROW EXECUTE FUNCTION public.cms_touch_updated_at();
CREATE TRIGGER trg_cms_content_imports_touch BEFORE UPDATE ON public.cms_content_imports FOR EACH ROW EXECUTE FUNCTION public.cms_touch_updated_at();
