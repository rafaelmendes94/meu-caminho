import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é o Conselho Executivo IA do Meu Caminho Enterprise.
Sua função é apoiar decisões estratégicas utilizando exclusivamente indicadores organizacionais agregados.
Nunca invente dados.
Nunca faça diagnósticos clínicos.
Nunca identifique pessoas.
Nunca exponha informações individuais.
Quando não houver dados suficientes, responda claramente que não existe base estatística suficiente.
Sempre explique o motivo da conclusão.
Sempre apresente evidências.
Sempre cite limitações.
Nunca responda além do contexto recebido.

Retorne EXCLUSIVAMENTE um JSON válido no formato:
{
  "answer": string,
  "confidence": "low" | "medium" | "high",
  "used_sections": string[],
  "recommendations": string[]
}`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const question: string = String(body?.question ?? "").trim();
    let conversationId: string | null = body?.conversation_id ?? null;
    if (!question) return json({ error: "missing_question" }, 400);

    const { data: profile } = await admin
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) return json({ error: "no_organization" }, 400);

    // Role check
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
    if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
      return json({ error: "forbidden" }, 403);
    }

    // Aggregated context via user client (RLS + role check inside function)
    const { data: ctx, error: ctxErr } = await userClient.rpc("get_executive_context", {
      _organization_id: orgId,
    });
    if (ctxErr) return json({ error: ctxErr.message }, 500);

    // Ensure conversation
    if (!conversationId) {
      const { data: conv, error: convErr } = await admin
        .from("executive_ai_conversations")
        .insert({
          organization_id: orgId,
          user_id: userId,
          title: question.slice(0, 80),
        })
        .select("id")
        .single();
      if (convErr) return json({ error: convErr.message }, 500);
      conversationId = conv.id;
    } else {
      // Validate conversation ownership
      const { data: conv } = await admin
        .from("executive_ai_conversations")
        .select("id, organization_id")
        .eq("id", conversationId)
        .maybeSingle();
      if (!conv || conv.organization_id !== orgId) {
        return json({ error: "conversation_not_found" }, 404);
      }
    }

    // Prior history (last 20)
    const { data: history } = await admin
      .from("executive_ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Contexto organizacional agregado (apenas amostras >= 5 são numéricas; demais aparecem como null):\n` +
          JSON.stringify(ctx ?? {}, null, 2),
      },
      ...((history ?? []).map((m) => ({ role: m.role, content: m.content }))),
      { role: "user", content: question },
    ];

    // Persist user message
    await admin.from("executive_ai_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: question,
    });

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "ai_gateway_error", details: errText }, aiRes.status);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "";
    let parsed: any = null;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: "invalid_ai_response", raw }, 502);
    }
    if (!parsed || typeof parsed !== "object") {
      return json({ error: "invalid_ai_response" }, 502);
    }

    const response = {
      answer: String(parsed.answer ?? ""),
      confidence: ["low", "medium", "high"].includes(parsed.confidence) ? parsed.confidence : "low",
      used_sections: Array.isArray(parsed.used_sections) ? parsed.used_sections : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };

    const usage = aiJson?.usage ?? {};
    await admin.from("executive_ai_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: JSON.stringify(response),
      context_snapshot: { sections: response.used_sections, confidence: response.confidence },
      tokens_in: usage?.prompt_tokens ?? null,
      tokens_out: usage?.completion_tokens ?? null,
    });

    await admin
      .from("executive_ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return json({ ok: true, conversation_id: conversationId, response });
  } catch (e) {
    console.error("executive-ai error", e);
    return json({ error: (e as Error).message }, 500);
  }
});