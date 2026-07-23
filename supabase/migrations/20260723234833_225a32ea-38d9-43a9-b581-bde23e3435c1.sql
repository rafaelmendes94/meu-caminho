
DROP POLICY IF EXISTS "content-books admin all" ON storage.objects;
CREATE POLICY "content-books admin all"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'content-books' AND public.is_platform_admin())
WITH CHECK (bucket_id = 'content-books' AND public.is_platform_admin());

CREATE TABLE public.book_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  chapter_index integer NOT NULL,
  title text NOT NULL,
  subtitle text,
  summary text,
  word_count integer NOT NULL DEFAULT 0,
  estimated_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_id, chapter_index)
);
GRANT SELECT ON public.book_chapters TO authenticated;
GRANT ALL ON public.book_chapters TO service_role;
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "book_chapters read published" ON public.book_chapters FOR SELECT TO authenticated
USING (public.is_platform_admin()
  OR EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = book_id AND ci.status = 'published'));
CREATE POLICY "book_chapters admin write" ON public.book_chapters FOR ALL TO authenticated
USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE TABLE public.book_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.book_chapters(id) ON DELETE CASCADE,
  section_index integer NOT NULL,
  title text,
  content text NOT NULL DEFAULT '',
  content_json jsonb,
  word_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, section_index)
);
GRANT SELECT ON public.book_sections TO authenticated;
GRANT ALL ON public.book_sections TO service_role;
ALTER TABLE public.book_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "book_sections read published" ON public.book_sections FOR SELECT TO authenticated
USING (public.is_platform_admin()
  OR EXISTS (SELECT 1 FROM public.book_chapters c
    JOIN public.content_items ci ON ci.id = c.book_id
    WHERE c.id = chapter_id AND ci.status = 'published'));
CREATE POLICY "book_sections admin write" ON public.book_sections FOR ALL TO authenticated
USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE TABLE public.book_reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.book_chapters(id) ON DELETE SET NULL,
  section_id uuid REFERENCES public.book_sections(id) ON DELETE SET NULL,
  progress_percent numeric NOT NULL DEFAULT 0,
  last_position jsonb,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_reading_progress TO authenticated;
GRANT ALL ON public.book_reading_progress TO service_role;
ALTER TABLE public.book_reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "book_reading_progress owner" ON public.book_reading_progress FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.book_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.book_chapters(id) ON DELETE SET NULL,
  section_id uuid REFERENCES public.book_sections(id) ON DELETE SET NULL,
  selected_text text NOT NULL,
  note text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_highlights TO authenticated;
GRANT ALL ON public.book_highlights TO service_role;
ALTER TABLE public.book_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "book_highlights owner" ON public.book_highlights FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_book_chapters_updated BEFORE UPDATE ON public.book_chapters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_book_sections_updated BEFORE UPDATE ON public.book_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_book_reading_progress_updated BEFORE UPDATE ON public.book_reading_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_book_chapters_book ON public.book_chapters(book_id, chapter_index);
CREATE INDEX idx_book_sections_chapter ON public.book_sections(chapter_id, section_index);
CREATE INDEX idx_book_progress_user ON public.book_reading_progress(user_id, book_id);
CREATE INDEX idx_book_highlights_user_book ON public.book_highlights(user_id, book_id);
