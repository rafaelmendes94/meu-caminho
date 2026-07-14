CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.knowledge_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL, slug text NOT NULL, description text,
  priority int NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_collections TO authenticated;
GRANT ALL ON public.knowledge_collections TO service_role;
ALTER TABLE public.knowledge_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kh_collections_read" ON public.knowledge_collections FOR SELECT TO authenticated
USING (public.has_role('platform_admin'::app_role) OR organization_id IS NULL OR organization_id = public.current_organization_id());
CREATE POLICY "kh_collections_write" ON public.knowledge_collections FOR ALL TO authenticated
USING (public.has_role('platform_admin'::app_role) OR (organization_id = public.current_organization_id() AND (public.has_role('owner'::app_role) OR public.has_role('rh_admin'::app_role))))
WITH CHECK (public.has_role('platform_admin'::app_role) OR (organization_id = public.current_organization_id() AND (public.has_role('owner'::app_role) OR public.has_role('rh_admin'::app_role))));

CREATE TABLE public.knowledge_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.knowledge_categories(id) ON DELETE SET NULL,
  name text NOT NULL, slug text NOT NULL, description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_categories TO authenticated;
GRANT ALL ON public.knowledge_categories TO service_role;
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kh_categories_read" ON public.knowledge_categories FOR SELECT TO authenticated
USING (public.has_role('platform_admin'::app_role) OR organization_id IS NULL OR organization_id = public.current_organization_id());
CREATE POLICY "kh_categories_write" ON public.knowledge_categories FOR ALL TO authenticated
USING (public.has_role('platform_admin'::app_role) OR (organization_id = public.current_organization_id() AND (public.has_role('owner'::app_role) OR public.has_role('rh_admin'::app_role))))
WITH CHECK (public.has_role('platform_admin'::app_role) OR (organization_id = public.current_organization_id() AND (public.has_role('owner'::app_role) OR public.has_role('rh_admin'::app_role))));

CREATE TABLE public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES public.knowledge_collections(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.knowledge_categories(id) ON DELETE SET NULL,
  title text NOT NULL, description text, author text, source text, source_url text,
  doc_type text NOT NULL DEFAULT 'pdf', language text DEFAULT 'pt-BR', license text,
  ai_summary text, keywords text[] DEFAULT ARRAY[]::text[], tags text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'pending', version int NOT NULL DEFAULT 1,
  storage_bucket text DEFAULT 'knowledge-hub', storage_path text, content_hash text,
  page_count int DEFAULT 0, chunk_count int DEFAULT 0,
  quality_score numeric(4,2) DEFAULT 0, confidence numeric(4,2) DEFAULT 0, completeness numeric(4,2) DEFAULT 0,
  freshness_at timestamptz, embedding_model text DEFAULT 'google/gemini-embedding-001',
  chunk_size int DEFAULT 1000, chunk_overlap int DEFAULT 150,
  priority int NOT NULL DEFAULT 0, error_message text, is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id), updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kh_docs_org_idx ON public.knowledge_documents(organization_id);
CREATE INDEX kh_docs_collection_idx ON public.knowledge_documents(collection_id);
CREATE INDEX kh_docs_status_idx ON public.knowledge_documents(status);
CREATE INDEX kh_docs_hash_idx ON public.knowledge_documents(content_hash);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_documents TO authenticated;
GRANT ALL ON public.knowledge_documents TO service_role;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kh_docs_read" ON public.knowledge_documents FOR SELECT TO authenticated
USING (public.has_role('platform_admin'::app_role) OR organization_id IS NULL OR organization_id = public.current_organization_id());
CREATE POLICY "kh_docs_write" ON public.knowledge_documents FOR ALL TO authenticated
USING (public.has_role('platform_admin'::app_role) OR (organization_id = public.current_organization_id() AND (public.has_role('owner'::app_role) OR public.has_role('rh_admin'::app_role))))
WITH CHECK (public.has_role('platform_admin'::app_role) OR (organization_id = public.current_organization_id() AND (public.has_role('owner'::app_role) OR public.has_role('rh_admin'::app_role))));

CREATE TABLE public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  chunk_index int NOT NULL, content text NOT NULL, tokens int DEFAULT 0,
  embedding vector(3072), metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kh_chunks_doc_idx ON public.knowledge_chunks(document_id);
CREATE INDEX kh_chunks_org_idx ON public.knowledge_chunks(organization_id);
CREATE INDEX kh_chunks_embedding_idx ON public.knowledge_chunks USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_chunks TO authenticated;
GRANT ALL ON public.knowledge_chunks TO service_role;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kh_chunks_read" ON public.knowledge_chunks FOR SELECT TO authenticated
USING (public.has_role('platform_admin'::app_role) OR organization_id IS NULL OR organization_id = public.current_organization_id());
CREATE POLICY "kh_chunks_write_admin" ON public.knowledge_chunks FOR ALL TO authenticated
USING (public.has_role('platform_admin'::app_role))
WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.knowledge_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  version int NOT NULL, snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, change_note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version)
);
GRANT SELECT, INSERT ON public.knowledge_versions TO authenticated;
GRANT ALL ON public.knowledge_versions TO service_role;
ALTER TABLE public.knowledge_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kh_versions_read" ON public.knowledge_versions FOR SELECT TO authenticated
USING (public.has_role('platform_admin'::app_role) OR EXISTS (SELECT 1 FROM public.knowledge_documents d WHERE d.id = document_id AND (d.organization_id IS NULL OR d.organization_id = public.current_organization_id())));
CREATE POLICY "kh_versions_insert" ON public.knowledge_versions FOR INSERT TO authenticated
WITH CHECK (public.has_role('platform_admin'::app_role));

CREATE TABLE public.knowledge_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  query_hash text NOT NULL, query_text text,
  top_chunks jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, query_hash)
);
CREATE INDEX kh_cache_expires_idx ON public.knowledge_cache(expires_at);
GRANT ALL ON public.knowledge_cache TO service_role;
ALTER TABLE public.knowledge_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kh_cache_admin_read" ON public.knowledge_cache FOR SELECT TO authenticated
USING (public.has_role('platform_admin'::app_role));

CREATE TABLE public.knowledge_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.knowledge_documents(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL, ai_module text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kh_logs_doc_idx ON public.knowledge_logs(document_id);
CREATE INDEX kh_logs_action_idx ON public.knowledge_logs(action);
GRANT SELECT ON public.knowledge_logs TO authenticated;
GRANT ALL ON public.knowledge_logs TO service_role;
ALTER TABLE public.knowledge_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kh_logs_admin_read" ON public.knowledge_logs FOR SELECT TO authenticated
USING (public.has_role('platform_admin'::app_role));

CREATE TABLE public.knowledge_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  ai_module text NOT NULL, chunk_ids uuid[] DEFAULT ARRAY[]::uuid[],
  confidence numeric(4,2),
  used_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kh_usage_doc_idx ON public.knowledge_usage(document_id);
CREATE INDEX kh_usage_module_idx ON public.knowledge_usage(ai_module);
GRANT SELECT ON public.knowledge_usage TO authenticated;
GRANT ALL ON public.knowledge_usage TO service_role;
ALTER TABLE public.knowledge_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kh_usage_admin_read" ON public.knowledge_usage FOR SELECT TO authenticated
USING (public.has_role('platform_admin'::app_role));

CREATE TRIGGER kh_collections_touch BEFORE UPDATE ON public.knowledge_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER kh_categories_touch BEFORE UPDATE ON public.knowledge_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER kh_documents_touch BEFORE UPDATE ON public.knowledge_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding vector(3072),
  target_org_id uuid DEFAULT NULL,
  match_count int DEFAULT 6,
  min_similarity float DEFAULT 0.5
)
RETURNS TABLE (chunk_id uuid, document_id uuid, organization_id uuid, chunk_index int, content text, similarity float, document_title text, collection_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.document_id, c.organization_id, c.chunk_index, c.content,
    1 - (c.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)) AS similarity,
    d.title, d.collection_id
  FROM public.knowledge_chunks c
  JOIN public.knowledge_documents d ON d.id = c.document_id
  WHERE d.status = 'indexed' AND d.is_published = true
    AND (c.organization_id IS NULL OR c.organization_id = target_org_id OR target_org_id IS NULL)
    AND (1 - (c.embedding::halfvec(3072) <=> query_embedding::halfvec(3072))) >= min_similarity
  ORDER BY c.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  LIMIT match_count;
$$;
REVOKE EXECUTE ON FUNCTION public.match_knowledge_chunks(vector, uuid, int, float) FROM public;
GRANT EXECUTE ON FUNCTION public.match_knowledge_chunks(vector, uuid, int, float) TO service_role;

CREATE OR REPLACE FUNCTION public.invalidate_knowledge_cache()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.knowledge_cache
  WHERE organization_id IS NULL OR organization_id = COALESCE(NEW.organization_id, OLD.organization_id);
  RETURN NULL;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.invalidate_knowledge_cache() FROM public;

CREATE TRIGGER kh_cache_inv_docs AFTER INSERT OR UPDATE OR DELETE ON public.knowledge_documents
FOR EACH ROW EXECUTE FUNCTION public.invalidate_knowledge_cache();
CREATE TRIGGER kh_cache_inv_collections AFTER INSERT OR UPDATE OR DELETE ON public.knowledge_collections
FOR EACH ROW EXECUTE FUNCTION public.invalidate_knowledge_cache();