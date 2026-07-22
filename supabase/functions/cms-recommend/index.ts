import { createClient } from "npm:@supabase/supabase-js@2";
import { enforceRateLimit } from "../_shared/rate_limit.ts";
import { openAICompatChatFetch, openAICompatEmbeddingFetch } from "../_shared/gemini.ts";

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
Monte uma TRILHA PERSONALIZADA para o colaborador — comece SEMPRE pelo nível mais básico (difficulty 1)
e só suba de nível conforme o colaborador evolui (histórico de itens concluídos).
Regras duras:
- SOMENTE itens da lista fornecida — nunca invente ids.
- Respeite pré-requisitos: nunca recomende um item cujos "prerequisites" não estejam concluídos.
- Ordene do menor "difficulty" para o maior.
- Case "audience_tags" com o perfil (papel, momento emocional, foco). "todos" cabe em qualquer perfil.
- Priorize competências alinhadas ao perfil.
- Diversifique formato (livro, vídeo, exercício, ritual) só quando o nível permitir.
Responda EXCLUSIVAMENTE em JSON:
{
  "items": [{ "id": string, "reason": string, "order": number }],
  "message": string
}
No máximo 6 recomendações. "message" é uma frase curta em português explicando por que essa trilha, nessa ordem.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    const rl = await enforceRateLimit(
      admin,
      { userId: userData.user.id, functionName: "cms-recommend", kind: "chat" },
      corsHeaders,
    );
    if (!rl.allowed) return rl.response!;

    const body = await req.json().catch(() => ({}));
    const mood: string = String(body?.mood ?? "").slice(0, 120);
    const interest: string = String(body?.interest ?? "").slice(0, 200);
    const preferredType: string = String(body?.preferred_type ?? "").slice(0, 30);
    const limit: number = Math.min(Math.max(Number(body?.limit ?? 6), 1), 12);

    // Pool of published content
    const { data: items, error: itemsErr } = await admin
      .from("content_items")
      .select("id,type,title,short_description,category_id,audience_tags,difficulty_level,expected_outcomes,competency_ids,prerequisite_ids")
      .eq("status", "published")
      .order("difficulty_level", { ascending: true })
      .limit(300);
    if (itemsErr) return json({ error: itemsErr.message }, 500);
    if (!items || items.length === 0) return json({ items: [], message: "Sem conteúdo disponível ainda." });

    const { data: cats } = await admin.from("content_categories").select("id,name");
    const catName = new Map((cats ?? []).map((c: any) => [c.id, c.name]));

    // Employee profile + histórico de conclusões
    const { data: profileRow } = await admin.from("profiles").select("organization_id").eq("id", userData.user.id).maybeSingle();
    const { data: empProfile } = await admin.from("employee_profiles").select("*").eq("user_id", userData.user.id).maybeSingle();
    const { data: views } = await admin
      .from("content_views")
      .select("content_item_id,progress_pct")
      .eq("user_id", userData.user.id)
      .limit(500);
    const completedIds = new Set((views ?? []).filter((v: any) => (v.progress_pct ?? 0) >= 90).map((v: any) => v.content_item_id));

    // Hard filter: só itens cujos pré-requisitos foram concluídos
    const eligible = (items as any[]).filter((i) => {
      const prereqs: string[] = i.prerequisite_ids ?? [];
      return prereqs.every((p) => completedIds.has(p));
    });

    const pool = eligible.map((i: any) => ({
      id: i.id,
      type: i.type,
      title: i.title,
      category: i.category_id ? catName.get(i.category_id) : null,
      short_description: i.short_description ?? "",
      difficulty: i.difficulty_level ?? 1,
      audience_tags: i.audience_tags ?? [],
      expected_outcomes: i.expected_outcomes ?? [],
      competencies: i.competency_ids ?? [],
      prerequisites: i.prerequisite_ids ?? [],
      already_seen: completedIds.has(i.id),
    }));

    const userContext = {
      mood,
      interest,
      preferred_type: preferredType,
      limit,
      profile: empProfile ? {
        strengths: (empProfile as any).strengths ?? null,
        aspirations: (empProfile as any).aspirations ?? null,
        current_focus: (empProfile as any).current_focus ?? null,
        dimensions: (empProfile as any).dimensions ?? null,
      } : null,
      completed_count: completedIds.size,
    };

    const { fetchKnowledgeContext } = await import("../_shared/knowledge_rag.ts");
    const rag = await fetchKnowledgeContext({
      query: `${mood} ${interest} ${preferredType}`.trim() || "recomendação de conteúdo bem-estar",
      organizationId: (profileRow as any)?.organization_id ?? null,
      aiModule: "cms-recommend",
    });

    const aiRes = await openAICompatChatFetch({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(rag.contextBlock ? [{ role: "user", content: rag.contextBlock }] : []),
          { role: "user", content: `Contexto do usuário:\n${JSON.stringify(userContext)}\n\nCatálogo disponível:\n${JSON.stringify(pool)}` },
        ],
        response_format: { type: "json_object" },
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