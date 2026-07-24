
-- Course single-video: garantir 1 módulo + 1 aula por curso, sincronizando com content_items.
CREATE OR REPLACE FUNCTION public.ensure_course_default_lesson()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_module_id uuid;
  v_lesson_id uuid;
  v_lesson_title text;
  v_content text;
BEGIN
  IF NEW.type <> 'course' THEN RETURN NEW; END IF;

  SELECT id INTO v_module_id FROM public.course_modules WHERE course_id = NEW.id ORDER BY sort_order LIMIT 1;
  IF v_module_id IS NULL THEN
    INSERT INTO public.course_modules (course_id, title, description, sort_order)
    VALUES (NEW.id, 'Aula principal', 'Vídeo único do curso', 0)
    RETURNING id INTO v_module_id;
  END IF;

  v_lesson_title := COALESCE(NULLIF(NEW.title, ''), 'Aula principal');
  v_content := COALESCE(NULLIF(NEW.metadata->>'transcription',''), NEW.long_description);

  SELECT id INTO v_lesson_id FROM public.course_lessons WHERE module_id = v_module_id ORDER BY sort_order LIMIT 1;
  IF v_lesson_id IS NULL THEN
    INSERT INTO public.course_lessons (module_id, title, lesson_type, sort_order, media_url, content, duration_minutes, is_published)
    VALUES (v_module_id, v_lesson_title, 'video', 0, NEW.media_url, v_content, NEW.duration_minutes, true);
  ELSE
    UPDATE public.course_lessons
       SET title = v_lesson_title,
           media_url = NEW.media_url,
           content = v_content,
           duration_minutes = NEW.duration_minutes,
           lesson_type = 'video',
           is_published = true
     WHERE id = v_lesson_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_ensure_lesson_ins ON public.content_items;
DROP TRIGGER IF EXISTS trg_course_ensure_lesson_upd ON public.content_items;

CREATE TRIGGER trg_course_ensure_lesson_ins
AFTER INSERT ON public.content_items
FOR EACH ROW WHEN (NEW.type = 'course')
EXECUTE FUNCTION public.ensure_course_default_lesson();

CREATE TRIGGER trg_course_ensure_lesson_upd
AFTER UPDATE OF media_url, title, duration_minutes, metadata, long_description ON public.content_items
FOR EACH ROW WHEN (NEW.type = 'course')
EXECUTE FUNCTION public.ensure_course_default_lesson();

-- Backfill: para cursos existentes sem módulo/aula, cria a estrutura.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.content_items WHERE type = 'course' LOOP
    UPDATE public.content_items SET updated_at = now() WHERE id = r.id;
  END LOOP;
END $$;

-- Índice para busca por status de processamento IA no metadata (opcional/leve).
CREATE INDEX IF NOT EXISTS idx_content_items_course_ai_status
  ON public.content_items ((metadata->>'ai_processing_status'))
  WHERE type = 'course';
