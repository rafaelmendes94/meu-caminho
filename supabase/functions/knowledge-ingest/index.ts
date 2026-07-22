// Knowledge Hub™ — Ingestão de documentos
// Recebe metadados + storage_path (ou raw_text/url) → extrai → chunk → embeddings → indexa
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { openAICompatChatFetch, openAICompatEmbeddingFetch } from "../_shared/gemini.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const DEFAULT_CHUNK = 1000;
const DEFAULT_OVERLAP = 150;

function chunkText(text: string, size: number, overlap: number): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const chunks: string[] = [];
  const step = Math.max(1, size - overlap);
  for (let i = 0; i < cleaned.length; i += step) {
    chunks.push(cleaned.slice(i, i + size));
    if (i + size >= cleaned.length) break;
  }
  return chunks;
}

async function embedBatch(inputs: string[]): Promise<Array<number[] | null>> {
  // Gemini embed via gateway — one call per input to avoid batch caps
  const results: Array<number[] | null> = [];
  for (const input of inputs) {
    try {
      const resp = await openAICompatEmbeddingFetch({
          model: "google/gemini-embedding-001",
          input: input.slice(0, 7000),
        });
      if (!resp.ok) { results.push(null); continue; }
      const j = await resp.json();
      results.push(j?.data?.[0]?.embedding ?? null);
    } catch (_e) { results.push(null); }
  }
  return results;
}

async function extractFromStorage(bucket: string, path: string, docType: string): Promise<string> {
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) throw new Error(`Falha ao baixar arquivo: ${error?.message}`);
  const buf = new Uint8Array(await data.arrayBuffer());
  // Simple text-based extraction for txt/md/csv. PDF/DOCX/PPTX -> attempt UTF-8 decode fallback
  // (Extração binária avançada é feita no worker externo — nesta fase, apenas texto plano/UTF-8.)
  const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  return text.replace(/\u0000/g, "").trim();
}

async function summarizeAndTag(text: string): Promise<{ summary: string; keywords: string[] }> {
  try {
    const resp = await openAICompatChatFetch({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Você resume documentos corporativos em PT-BR de forma consultiva e extrai palavras-chave." },
          { role: "user", content: `Resuma em até 5 linhas e retorne JSON {"summary":"...","keywords":["..."]}.\n\nTexto:\n${text.slice(0, 6000)}` },
        ],
        response_format: { type: "json_object" },
      });
    if (!resp.ok) return { summary: "", keywords: [] };
    const j = await resp.json();
    const raw = j?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    return {
      summary: String(parsed.summary ?? "").slice(0, 2000),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 20).map(String) : [],
    };
  } catch (_e) {
    return { summary: "", keywords: [] };
  }
}

async function computeHash(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await userClient.rpc("has_role", { _role: "platform_admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const {
      document_id,      // if provided → reindex
      organization_id = null,
      collection_id = null,
      category_id = null,
      title,
      description = null,
      author = null,
      source = null,
      source_url = null,
      doc_type = "txt",
      language = "pt-BR",
      license = null,
      tags = [],
      priority = 0,
      chunk_size = DEFAULT_CHUNK,
      chunk_overlap = DEFAULT_OVERLAP,
      embedding_model = "google/gemini-embedding-001",
      storage_path = null,
      raw_text = null,
      publish = true,
    } = body ?? {};

    if (!title && !document_id) return json({ error: "title obrigatório" }, 400);

    // 1) Cria ou reutiliza registro
    let docId = document_id as string | null;
    if (!docId) {
      const { data: doc, error: insErr } = await admin
        .from("knowledge_documents")
        .insert({
          organization_id, collection_id, category_id, title, description,
          author, source, source_url, doc_type, language, license,
          tags, priority, chunk_size, chunk_overlap, embedding_model,
          storage_path, status: "processing", created_by: user.id, updated_by: user.id,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      docId = doc.id;
    } else {
      await admin.from("knowledge_documents").update({ status: "processing", updated_by: user.id }).eq("id", docId);
      // Limpa chunks anteriores
      await admin.from("knowledge_chunks").delete().eq("document_id", docId);
    }

    // 2) Extrai texto
    let text = "";
    if (raw_text) text = String(raw_text);
    else if (storage_path) text = await extractFromStorage("knowledge-hub", storage_path, doc_type);
    else if (source_url) {
      try {
        const r = await fetch(source_url);
        text = await r.text();
      } catch (_e) { text = ""; }
    }
    if (!text) {
      await admin.from("knowledge_documents").update({ status: "error", error_message: "Sem texto extraído" }).eq("id", docId);
      return json({ error: "Sem texto extraído (nesta fase suporte binário PDF/DOCX requer worker externo — envie raw_text ou arquivo texto)" }, 400);
    }

    const hash = await computeHash(text);

    // 3) Chunking
    const pieces = chunkText(text, chunk_size, chunk_overlap);
    if (pieces.length === 0) {
      await admin.from("knowledge_documents").update({ status: "error", error_message: "Texto vazio após chunking" }).eq("id", docId);
      return json({ error: "Texto vazio após chunking" }, 400);
    }

    // 4) Embeddings + insert chunks
    const vectors = await embedBatch(pieces);
    const rows = pieces.map((content, i) => ({
      document_id: docId,
      organization_id,
      chunk_index: i,
      content,
      tokens: Math.ceil(content.length / 4),
      embedding: vectors[i],
      metadata: { model: embedding_model },
    })).filter((r) => r.embedding);

    if (rows.length === 0) {
      await admin.from("knowledge_documents").update({ status: "error", error_message: "Falha ao gerar embeddings" }).eq("id", docId);
      return json({ error: "Falha ao gerar embeddings" }, 500);
    }

    // Insert em lotes de 50
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error: cErr } = await admin.from("knowledge_chunks").insert(batch);
      if (cErr) throw cErr;
    }

    // 5) Resumo IA + keywords
    const { summary, keywords } = await summarizeAndTag(text);

    // 6) Atualiza documento
    const completeness = Math.min(1, rows.length / Math.max(pieces.length, 1));
    const quality = Number((0.6 * completeness + 0.4 * (rows.length > 3 ? 1 : rows.length / 3)).toFixed(2));
    await admin.from("knowledge_documents").update({
      status: "indexed",
      is_published: !!publish,
      chunk_count: rows.length,
      page_count: Math.max(1, Math.ceil(text.length / 3000)),
      content_hash: hash,
      ai_summary: summary || null,
      keywords: keywords.length ? keywords : undefined,
      completeness,
      quality_score: quality,
      confidence: quality,
      freshness_at: new Date().toISOString(),
      error_message: null,
    }).eq("id", docId);

    // 7) Versão + log
    const { data: cur } = await admin.from("knowledge_documents").select("*").eq("id", docId).single();
    if (cur) {
      await admin.from("knowledge_versions").insert({
        document_id: docId, version: cur.version ?? 1, snapshot: cur, created_by: user.id,
      });
    }
    await admin.from("knowledge_logs").insert({
      organization_id, document_id: docId, actor_id: user.id,
      action: document_id ? "reprocess" : "upload",
      meta: { chunks: rows.length, pages: Math.max(1, Math.ceil(text.length / 3000)) },
    });

    return json({ ok: true, document_id: docId, chunks: rows.length, quality });
  } catch (e) {
    console.error("knowledge-ingest error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}