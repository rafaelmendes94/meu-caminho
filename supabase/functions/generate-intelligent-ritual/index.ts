import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é especialista em cultura organizacional e facilitação de rituais corporativos.
Crie um ritual simples, seguro e prático para RH aplicar com equipes.
Use apenas o contexto agregado recebido.
Nunca mencione pessoas.
Nunca faça diagnóstico clínico.
Não prometa cura ou tratamento.
O ritual deve ser executável em 10 a 30 minutos.

Retorne EXCLUSIVAMENTE um JSON válido:
{
  "title": string,
  "description": string,
  "ritual_type": "energy|communication|recovery|leadership|engagement|collaboration|reflection|custom",
  "duration_minutes": number,
  "expected_outcome": string,
  "instructions": [ { "step": number, "title": string, "description": string } ]
}`;

const ALLOWED_SOURCES = new Set(["weekly_insight", "predictive_signal", "dna", "manual"]);
const ALLOWED_TYPES = new Set([
  "energy","communication","recovery","leadership","engagement","collaboration","reflection","custom",
]);

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
    const sourceType: string = String(body?.source_type ?? "manual");
    const sourceId: string | null = body?.source_id ?? null;
    const extraPrompt: string = String(body?.prompt ?? "").slice(0, 2000);

    if (!ALLOWED_SOURCES.has(sourceType)) return json({ error: "invalid_source_type" }, 400);

    const { data: profile } = await admin
      .from("profiles").select("organization_id").eq("id", userId).maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) return json({ error: "no_organization" }, 400);

    const { data: roles } = await admin
      .from("user_roles").select("role").eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
    if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
      return json({ error: "forbidden" }, 403);
    }

    const context: Record<string, unknown> = { source_type: sourceType };

    if (sourceType === "dna") {
      const q = admin
        .from("organizational_dna_reports")
        .select("id, generated_at, overall_score, summary, strengths, opportunities, recommendations, dimensions")
        .eq("organization_id", orgId);
      const { data } = sourceId
        ? await q.eq("id", sourceId).maybeSingle()
        : await q.order("generated_at", { ascending: false }).limit(1).maybeSingle();
      context.dna_report = data ?? null;
    } else if (sourceType === "weekly_insight") {
      if (!sourceId) return json({ error: "missing_source_id" }, 400);
      const { data } = await admin
        .from("weekly_ai_insights")
        .select("id, title, summary, insight_type, severity, confidence, evidence, recommended_actions, week_of")
        .eq("organization_id", orgId).eq("id", sourceId).maybeSingle();
      context.weekly_insight = data ?? null;
    } else if (sourceType === "predictive_signal") {
      if (!sourceId) return json({ error: "missing_source_id" }, 400);
      const { data } = await admin
        .from("predictive_signals")
        .select("id, signal_type, severity, confidence, title, narrative, evidence, detected_at")
        .eq("organization_id", orgId).eq("id", sourceId).maybeSingle();
      context.predictive_signal = data ?? null;
    }

    const { data: dashboard } = await userClient.rpc("get_rh_dashboard_summary", {
      _organization_id: orgId,
    });
    context.rh_dashboard = dashboard ?? null;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Contexto organizacional agregado (mínimo 5 participantes por métrica):\n` +
          JSON.stringify(context, null, 2) +
          (extraPrompt ? `\n\nOrientação adicional:\n${extraPrompt}` : ""),
      },
    ];

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
    try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { /* noop */ }
    if (!parsed || typeof parsed !== "object" || !parsed.title) {
      return json({ error: "invalid_ai_response", raw }, 502);
    }

    const ritualType = ALLOWED_TYPES.has(parsed.ritual_type) ? parsed.ritual_type : "custom";
    const duration = Number(parsed.duration_minutes);
    const safeDuration = Number.isFinite(duration) ? Math.max(5, Math.min(60, Math.round(duration))) : 15;
    const instructions = Array.isArray(parsed.instructions)
      ? parsed.instructions.slice(0, 12).map((it: any, idx: number) => ({
          step: Number(it?.step) || idx + 1,
          title: String(it?.title ?? "").slice(0, 200),
          description: String(it?.description ?? "").slice(0, 1000),
        }))
      : [];

    const { data: ritual, error: insErr } = await admin
      .from("intelligent_rituals")
      .insert({
        organization_id: orgId,
        title: String(parsed.title).slice(0, 200),
        description: parsed.description ? String(parsed.description).slice(0, 4000) : null,
        ritual_type: ritualType,
        source_type: sourceType,
        source_id: sourceId,
        status: "draft",
        duration_minutes: safeDuration,
        instructions,
        expected_outcome: parsed.expected_outcome ? String(parsed.expected_outcome).slice(0, 2000) : null,
        created_by: userId,
        generated_by_ai: true,
      })
      .select("id")
      .single();

    if (insErr || !ritual) return json({ error: insErr?.message ?? "insert_failed" }, 500);

    return json({ ok: true, ritual_id: ritual.id });
  } catch (e) {
    console.error("generate-intelligent-ritual error", e);
    return json({ error: (e as Error).message }, 500);
  }
});