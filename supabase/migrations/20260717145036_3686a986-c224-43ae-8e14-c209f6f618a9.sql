
-- Add audience/difficulty/outcomes/competencies/prerequisites to content_items
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS audience_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty_level int NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS expected_outcomes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS competency_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prerequisite_ids uuid[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_content_items_audience_tags ON public.content_items USING GIN (audience_tags);
CREATE INDEX IF NOT EXISTS idx_content_items_difficulty ON public.content_items (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_content_items_competencies ON public.content_items USING GIN (competency_ids);
