import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const SYSTEM_PROMPT = `Você é o motor de recomendação de conteúdo do Meu Caminho.
Recomende conteúdos do catálogo levando em conta o interesse, humor, tipo preferido e histórico do usuário.
Você recebe uma LISTA DE CONTEÚDOS DISPONÍVEIS (id, type, title, category, short_description).
SOMENTE recomende itens dessa lista — nunca invente ids ou títulos.
Priorize diversidade de tipos e categorias quando fizer sentido.
Responda EXCLUSIVAMENTE em JSON:
{
  "items": [{ "id": string, "reason": string }],
  "message": string
}
No máximo 6 recomendações. "message" é uma frase curta em português explicando o critério.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const mood: string = String(body?.mood ?? "").slice(0, 120);
    const interest: string = String(body?.interest ?? "").slice(0, 200);
    const preferredType: string = String(body?.preferred_type ?? "").slice(0, 30);
    const limit: number = Math.min(Math.max(Number(body?.limit ?? 6), 1), 12);

    // Pool of published content
    const { data: items, error: itemsErr } = await admin
      .from("content_items")
      .select("id,type,title,short_description,category_id")
      .eq("status", "published")
      .limit(200);
    if (itemsErr) return json({ error: itemsErr.message }, 500);
    if (!items || items.length === 0) return json({ items: [], message: "Sem conteúdo disponível ainda." });

    const { data: cats } = await admin.from("content_categories").select("id,name");
    const catName = new Map((cats ?? []).map((c: any) => [c.id, c.name]));

    const pool = items.map((i: any) => ({
      id: i.id,
      type: i.type,
      title: i.title,
      category: i.category_id ? catName.get(i.category_id) : null,
      short_description: i.short_description ?? "",
    }));

    const userContext = { mood, interest, preferred_type: preferredType, limit };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Contexto do usuário:\n${JSON.stringify(userContext)}\n\nCatálogo disponível:\n${JSON.stringify(pool)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      console.error("cms-recommend ai error", aiRes.status, text);
      if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "ai_gateway_error", details: text }, aiRes.status);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "";
    let parsed: any = null;
    try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return json({ error: "invalid_ai_response", raw }, 502); }

    const allowedIds = new Set(pool.map((p) => p.id));
    const rec = Array.isArray(parsed?.items) ? parsed.items.filter((r: any) => allowedIds.has(r?.id)).slice(0, limit) : [];
    const message = String(parsed?.message ?? "");

    return json({ items: rec, message });
  } catch (e) {
    console.error("cms-recommend error", e);
    return json({ error: (e as Error).message }, 500);
  }
});