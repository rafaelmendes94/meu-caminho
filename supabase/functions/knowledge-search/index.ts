// Knowledge Hub™ — Busca semântica + chat de teste RAG
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { fetchKnowledgeContext } from "../_shared/knowledge_rag.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);
    const uc = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: { user } } = await uc.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await uc.rpc("has_role", { _role: "platform_admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const { query, organization_id = null, top_k = 6, min_similarity = 0.5, mode = "search" } = await req.json();
    if (!query || typeof query !== "string") return json({ error: "query obrigatório" }, 400);

    const ctx = await fetchKnowledgeContext({
      query, organizationId: organization_id, aiModule: "search",
      topK: top_k, minSimilarity: min_similarity, useCache: mode !== "test",
    });

    if (mode === "test") {
      // Chat RAG de teste — retorna resposta gerada
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${LOVABLE_API_KEY}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Você é um assistente que responde SOMENTE com base no CONTEXTO fornecido. Se não houver contexto suficiente, responda 'Sem dados suficientes na base de conhecimento'. Sempre cite as fontes por índice [Fonte N]." },
            { role: "user", content: `${ctx.contextBlock}\n\nPergunta: ${query}` },
          ],
        }),
      });
      const j = await resp.json();
      const answer = j?.choices?.[0]?.message?.content ?? "";
      return json({ answer, ...ctx });
    }

    return json(ctx);
  } catch (e) {
    console.error("knowledge-search error:", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}