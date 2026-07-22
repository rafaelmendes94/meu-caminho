// Shared RAG helper — Knowledge Hub™
// Used by all AI edge functions to fetch grounded context before generation.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { openAICompatChatFetch, openAICompatEmbeddingFetch } from "../_shared/gemini.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

export interface KnowledgeChunk {
  chunk_id: string;
  document_id: string;
  organization_id: string | null;
  chunk_index: number;
  content: string;
  similarity: number;
  document_title: string;
  collection_id: string | null;
}

export interface RagContext {
  query: string;
  chunks: KnowledgeChunk[];
  confidence: number;
  cache_hit: boolean;
  contextBlock: string;
  sources: Array<{ document_id: string; title: string; similarity: number }>;
}

async function embed(text: string): Promise<number[] | null> {
  try {
    const resp = await openAICompatEmbeddingFetch({
        model: "google/gemini-embedding-001",
        input: text.slice(0, 8000),
      });
    if (!resp.ok) return null;
    const json = await resp.json();
    return json?.data?.[0]?.embedding ?? null;
  } catch (_e) {
    return null;
  }
}

function hashQuery(query: string, orgId: string | null): string {
  const raw = `${orgId ?? "global"}::${query.toLowerCase().trim()}`;
  // Simple non-crypto hash acceptable for cache keying
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
  return `kh_${h.toString(36)}`;
}

export async function fetchKnowledgeContext(opts: {
  query: string;
  organizationId?: string | null;
  aiModule: string;
  topK?: number;
  minSimilarity?: number;
  useCache?: boolean;
  cacheTtlSeconds?: number;
}): Promise<RagContext> {
  const {
    query,
    organizationId = null,
    aiModule,
    topK = 6,
    minSimilarity = 0.5,
    useCache = true,
    cacheTtlSeconds = 3600,
  } = opts;

  const empty: RagContext = {
    query,
    chunks: [],
    confidence: 0,
    cache_hit: false,
    contextBlock: "",
    sources: [],
  };
  if (!query || query.length < 3) return empty;

  const cacheKey = hashQuery(query, organizationId);

  // 1) Cache lookup
  if (useCache) {
    const { data: cached } = await admin
      .from("knowledge_cache")
      .select("top_chunks, expires_at")
      .eq("organization_id", organizationId)
      .eq("query_hash", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (cached?.top_chunks && Array.isArray(cached.top_chunks) && cached.top_chunks.length > 0) {
      return buildContext(query, cached.top_chunks as KnowledgeChunk[], true);
    }
  }

  // 2) Embed + match
  const embedding = await embed(query);
  if (!embedding) return empty;

  const { data: matches, error } = await admin.rpc("match_knowledge_chunks", {
    query_embedding: embedding as unknown as string,
    target_org_id: organizationId,
    match_count: topK,
    min_similarity: minSimilarity,
  });
  if (error || !matches || matches.length === 0) return empty;

  const chunks = matches as KnowledgeChunk[];

  // 3) Save cache
  if (useCache) {
    const expires = new Date(Date.now() + cacheTtlSeconds * 1000).toISOString();
    await admin.from("knowledge_cache").upsert(
      {
        organization_id: organizationId,
        query_hash: cacheKey,
        query_text: query.slice(0, 500),
        top_chunks: chunks,
        expires_at: expires,
      },
      { onConflict: "organization_id,query_hash" },
    );
  }

  // 4) Log usage per document
  try {
    const byDoc = new Map<string, { chunkIds: string[]; conf: number }>();
    for (const c of chunks) {
      const cur = byDoc.get(c.document_id) ?? { chunkIds: [], conf: 0 };
      cur.chunkIds.push(c.chunk_id);
      cur.conf = Math.max(cur.conf, c.similarity);
      byDoc.set(c.document_id, cur);
    }
    const rows = Array.from(byDoc.entries()).map(([document_id, v]) => ({
      organization_id: organizationId,
      document_id,
      ai_module: aiModule,
      chunk_ids: v.chunkIds,
      confidence: Number(v.conf.toFixed(2)),
    }));
    if (rows.length) await admin.from("knowledge_usage").insert(rows);
  } catch (_e) { /* non-fatal */ }

  return buildContext(query, chunks, false);
}

function buildContext(query: string, chunks: KnowledgeChunk[], cacheHit: boolean): RagContext {
  const confidence = chunks.length
    ? Number((chunks.reduce((s, c) => s + c.similarity, 0) / chunks.length).toFixed(2))
    : 0;
  const contextBlock = [
    "== CONTEXTO DA BASE DE CONHECIMENTO (Knowledge Hub) ==",
    ...chunks.map(
      (c, i) =>
        `[Fonte ${i + 1}] ${c.document_title} (similaridade ${c.similarity.toFixed(2)})\n${c.content}`,
    ),
    "== FIM DO CONTEXTO ==",
  ].join("\n\n");
  const sources = chunks.map((c) => ({
    document_id: c.document_id,
    title: c.document_title,
    similarity: Number(c.similarity.toFixed(2)),
  }));
  return { query, chunks, confidence, cache_hit: cacheHit, contextBlock, sources };
}