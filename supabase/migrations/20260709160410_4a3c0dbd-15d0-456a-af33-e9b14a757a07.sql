
-- ============================================================
-- FASE 11 — CMS — Onda 1: Schema base
-- ============================================================

-- Enum: tipo de conteúdo
DO $$ BEGIN
  CREATE TYPE public.content_type AS ENUM (
    'book','course','track','podcast','video','audio','material'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enum: status
DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- CATEGORIAS
-- ------------------------------------------------------------
CREATE TABLE public.content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text,
  icon text,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_categories TO anon, authenticated;
GRANT ALL ON public.content_categories TO service_role;
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories read all" ON public.content_categories
  FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.content_categories
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());
CREATE TRIGGER trg_content_categories_updated BEFORE UPDATE ON public.content_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- TAGS
-- ------------------------------------------------------------
CREATE TABLE public.content_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_tags TO anon, authenticated;
GRANT ALL ON public.content_tags TO service_role;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags read all" ON public.content_tags FOR SELECT USING (true);
CREATE POLICY "tags admin write" ON public.content_tags
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());
CREATE TRIGGER trg_content_tags_updated BEFORE UPDATE ON public.content_tags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- AUTORES
-- ------------------------------------------------------------
CREATE TABLE public.content_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  photo_url text,
  mini_bio text,
  specialty text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_authors TO anon, authenticated;
GRANT ALL ON public.content_authors TO service_role;
ALTER TABLE public.content_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authors read published" ON public.content_authors
  FOR SELECT USING (is_published OR public.is_platform_admin());
CREATE POLICY "authors admin write" ON public.content_authors
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());
CREATE TRIGGER trg_content_authors_updated BEFORE UPDATE ON public.content_authors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- COLEÇÕES
-- ------------------------------------------------------------
CREATE TABLE public.content_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_collections TO anon, authenticated;
GRANT ALL ON public.content_collections TO service_role;
ALTER TABLE public.content_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections read published" ON public.content_collections
  FOR SELECT USING (is_published OR public.is_platform_admin());
CREATE POLICY "collections admin write" ON public.content_collections
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());
CREATE TRIGGER trg_content_collections_updated BEFORE UPDATE ON public.content_collections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- CONTENT ITEMS (unificado)
-- ------------------------------------------------------------
CREATE TABLE public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.content_type NOT NULL,
  status public.content_status NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  subtitle text,
  slug text NOT NULL UNIQUE,
  short_description text,
  long_description text,
  cover_url text,
  banner_url text,
  category_id uuid REFERENCES public.content_categories(id) ON DELETE SET NULL,
  language text DEFAULT 'pt-BR',
  level text,
  duration_minutes int,
  file_url text,
  media_url text,
  is_premium boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_items TO anon, authenticated;
GRANT ALL ON public.content_items TO service_role;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items read published" ON public.content_items
  FOR SELECT USING (status = 'published' OR public.is_platform_admin());
CREATE POLICY "items admin write" ON public.content_items
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());
CREATE INDEX idx_content_items_type_status ON public.content_items(type, status);
CREATE INDEX idx_content_items_category ON public.content_items(category_id);
CREATE INDEX idx_content_items_published_at ON public.content_items(published_at DESC);
CREATE INDEX idx_content_items_search ON public.content_items
  USING gin (to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(subtitle,'') || ' ' || coalesce(short_description,'')));
CREATE TRIGGER trg_content_items_updated BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- N:N — item x autores
-- ------------------------------------------------------------
CREATE TABLE public.content_item_authors (
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.content_authors(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, author_id)
);
GRANT SELECT ON public.content_item_authors TO anon, authenticated;
GRANT ALL ON public.content_item_authors TO service_role;
ALTER TABLE public.content_item_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "item_authors read all" ON public.content_item_authors FOR SELECT USING (true);
CREATE POLICY "item_authors admin write" ON public.content_item_authors
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- ------------------------------------------------------------
-- N:N — item x tags
-- ------------------------------------------------------------
CREATE TABLE public.content_item_tags (
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.content_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, tag_id)
);
GRANT SELECT ON public.content_item_tags TO anon, authenticated;
GRANT ALL ON public.content_item_tags TO service_role;
ALTER TABLE public.content_item_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "item_tags read all" ON public.content_item_tags FOR SELECT USING (true);
CREATE POLICY "item_tags admin write" ON public.content_item_tags
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- ------------------------------------------------------------
-- N:N — coleção x itens
-- ------------------------------------------------------------
CREATE TABLE public.content_collection_items (
  collection_id uuid NOT NULL REFERENCES public.content_collections(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, item_id)
);
GRANT SELECT ON public.content_collection_items TO anon, authenticated;
GRANT ALL ON public.content_collection_items TO service_role;
ALTER TABLE public.content_collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collection_items read all" ON public.content_collection_items FOR SELECT USING (true);
CREATE POLICY "collection_items admin write" ON public.content_collection_items
  FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- ------------------------------------------------------------
-- TELEMETRIA — views
-- ------------------------------------------------------------
CREATE TABLE public.content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  organization_id uuid,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  duration_seconds int,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.content_views TO authenticated;
GRANT ALL ON public.content_views TO service_role;
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "views insert own" ON public.content_views
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "views admin read" ON public.content_views
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE INDEX idx_content_views_item ON public.content_views(item_id, viewed_at DESC);
CREATE INDEX idx_content_views_org ON public.content_views(organization_id, viewed_at DESC);

-- ------------------------------------------------------------
-- TELEMETRIA — downloads
-- ------------------------------------------------------------
CREATE TABLE public.content_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  organization_id uuid,
  downloaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.content_downloads TO authenticated;
GRANT ALL ON public.content_downloads TO service_role;
ALTER TABLE public.content_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "downloads insert own" ON public.content_downloads
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "downloads admin read" ON public.content_downloads
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE INDEX idx_content_downloads_item ON public.content_downloads(item_id, downloaded_at DESC);

-- ------------------------------------------------------------
-- RPC — dashboard do CMS
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cms_dashboard()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  totals jsonb;
  by_status jsonb;
  by_type jsonb;
  by_month jsonb;
  by_category jsonb;
  top_items jsonb;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT jsonb_build_object(
    'items', (SELECT count(*) FROM content_items),
    'authors', (SELECT count(*) FROM content_authors),
    'categories', (SELECT count(*) FROM content_categories),
    'tags', (SELECT count(*) FROM content_tags),
    'collections', (SELECT count(*) FROM content_collections)
  ) INTO totals;

  SELECT COALESCE(jsonb_object_agg(status, cnt), '{}'::jsonb) INTO by_status
  FROM (SELECT status::text, count(*) AS cnt FROM content_items GROUP BY status) s;

  SELECT COALESCE(jsonb_object_agg(type, cnt), '{}'::jsonb) INTO by_type
  FROM (SELECT type::text, count(*) AS cnt FROM content_items GROUP BY type) t;

  SELECT COALESCE(jsonb_agg(row_to_json(m) ORDER BY m.month), '[]'::jsonb) INTO by_month
  FROM (
    SELECT to_char(date_trunc('month', published_at), 'YYYY-MM') AS month, count(*) AS cnt
    FROM content_items
    WHERE published_at >= (now() - interval '12 months')
    GROUP BY 1
  ) m;

  SELECT COALESCE(jsonb_agg(row_to_json(c)), '[]'::jsonb) INTO by_category
  FROM (
    SELECT cat.name, count(i.id) AS cnt
    FROM content_categories cat
    LEFT JOIN content_items i ON i.category_id = cat.id
    GROUP BY cat.id, cat.name
    ORDER BY cnt DESC
  ) c;

  SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) INTO top_items
  FROM (
    SELECT i.id, i.title, i.type::text, count(v.id) AS views
    FROM content_items i
    LEFT JOIN content_views v ON v.item_id = i.id AND v.viewed_at >= now() - interval '30 days'
    WHERE i.status = 'published'
    GROUP BY i.id, i.title, i.type
    ORDER BY views DESC NULLS LAST
    LIMIT 10
  ) x;

  RETURN jsonb_build_object(
    'totals', totals,
    'by_status', by_status,
    'by_type', by_type,
    'by_month', by_month,
    'by_category', by_category,
    'top_items_30d', top_items
  );
END; $$;
