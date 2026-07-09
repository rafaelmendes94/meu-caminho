
-- Módulos de curso
CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_modules TO anon, authenticated;
GRANT ALL ON public.course_modules TO service_role;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules read" ON public.course_modules FOR SELECT USING (true);
CREATE POLICY "modules admin" ON public.course_modules
  FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE INDEX idx_course_modules_course ON public.course_modules(course_id, sort_order);
CREATE TRIGGER trg_course_modules_updated BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Aulas
DO $$ BEGIN
  CREATE TYPE public.lesson_type AS ENUM ('video','text','pdf','audio','exercise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  lesson_type public.lesson_type NOT NULL DEFAULT 'video',
  duration_minutes int,
  sort_order int NOT NULL DEFAULT 0,
  media_url text,
  content text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_lessons TO anon, authenticated;
GRANT ALL ON public.course_lessons TO service_role;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons read" ON public.course_lessons FOR SELECT USING (is_published OR public.is_platform_admin());
CREATE POLICY "lessons admin" ON public.course_lessons
  FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE INDEX idx_course_lessons_module ON public.course_lessons(module_id, sort_order);
CREATE TRIGGER trg_course_lessons_updated BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Itens de trilha
CREATE TABLE public.track_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (track_id, item_id)
);
GRANT SELECT ON public.track_items TO anon, authenticated;
GRANT ALL ON public.track_items TO service_role;
ALTER TABLE public.track_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "track_items read" ON public.track_items FOR SELECT USING (true);
CREATE POLICY "track_items admin" ON public.track_items
  FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE INDEX idx_track_items_track ON public.track_items(track_id, sort_order);
CREATE TRIGGER trg_track_items_updated BEFORE UPDATE ON public.track_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
