import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um analista executivo de Inteligência Humana Corporativa.
Analise EXCLUSIVAMENTE os dados organizacionais agregados fornecidos.
Nunca identifique pessoas.
Nunca faça diagnóstico clínico.
Produza no máximo 5 insights executivos em português do Brasil.

Retorne SOMENTE JSON válido no formato:
{
  "insights": [
    {
      "title": string,
      "summary": string,
      "insight_type": string,
      "severity": "low" | "medium" | "high" | "critical",
      "confidence": number (0.0 - 1.0),
      "evidence": object,
      "recommended_actions": string[]
    }
  ]
}
Se um indicador não tiver amostra suficiente (participants < 5), mencione a limitação e reduza a confiança.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function processOrganization(admin: ReturnType<typeof createClient>, orgId: string, lovableKey: string) {
  const { data: ctx, error: ctxErr } = await admin.rpc("get_weekly_ai_context", {
    _organization_id: orgId,
  });
  if (ctxErr) throw new Error(ctxErr.message);

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${lovableKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Contexto agregado da organização. Todos os dados são anônimos. Gere os insights semanais em JSON.\n\n` +
            JSON.stringify(ctx ?? {}, null, 2),
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text();
    console.error("AI gateway error", aiRes.status, errText);
    const err: any = new Error(`ai_gateway_error_${aiRes.status}`);
    err.status = aiRes.status;
    err.details = errText;
    throw err;
  }

  const aiJson = await aiRes.json();
  const raw = aiJson?.choices?.[0]?.message?.content ?? "";
  let parsed: any = null;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw new Error("invalid_ai_response");
  }
  const insights = Array.isArray(parsed?.insights) ? parsed.insights.slice(0, 5) : [];
  const weekOf = new Date();
  const day = weekOf.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  weekOf.setUTCDate(weekOf.getUTCDate() + diff);
  const weekOfStr = weekOf.toISOString().slice(0, 10);

  const rows = insights.map((i: any) => ({
    organization_id: orgId,
    week_of: weekOfStr,
    title: String(i?.title ?? "Insight"),
    summary: String(i?.summary ?? ""),
    insight_type: i?.insight_type ? String(i.insight_type) : null,
    severity: i?.severity ? String(i.severity) : "medium",
    confidence: Number.isFinite(Number(i?.confidence)) ? Number(i.confidence) : null,
    evidence: i?.evidence && typeof i.evidence === "object" ? i.evidence : {},
    recommended_actions: Array.isArray(i?.recommended_actions) ? i.recommended_actions : [],
    version: 1,
  }));

  if (rows.length === 0) return { inserted: 0 };

  const { error: insErr, data } = await admin
    .from("weekly_ai_insights")
    .insert(rows)
    .select("id");
  if (insErr) throw new Error(insErr.message);
  return { inserted: data?.length ?? 0 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const admin = createClient(supabaseUrl, serviceKey);
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("Authorization");
    const runAll = body?.run_all === true;

    // Manual invocation by authenticated RH/Owner
    if (!runAll && authHeader) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);
      const userId = userData.user.id;

      const { data: profile } = await admin
        .from("profiles")
        .select("organization_id")
        .eq("id", userId)
        .maybeSingle();
      const orgId = (body?.organization_id as string | undefined) ?? profile?.organization_id;
      if (!orgId) return json({ error: "no organization" }, 400);

      const { data: roles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      const roleSet = new Set((roles ?? []).map((r: any) => r.role));
      if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
        return json({ error: "forbidden" }, 403);
      }

      try {
        const result = await processOrganization(admin, orgId, lovableKey);
        return json({ ok: true, ...result });
      } catch (e: any) {
        if (e?.status === 429) return json({ error: "rate_limited" }, 429);
        if (e?.status === 402) return json({ error: "credits_exhausted" }, 402);
        return json({ error: e?.message ?? "error" }, 500);
      }
    }

    // Scheduled run_all: iterate active organizations
    const { data: orgs, error: orgsErr } = await admin
      .from("organizations")
      .select("id");
    if (orgsErr) return json({ error: orgsErr.message }, 500);

    const results: Array<{ organization_id: string; ok: boolean; error?: string; inserted?: number }> = [];
    for (const o of orgs ?? []) {
      try {
        const r = await processOrganization(admin, o.id, lovableKey);
        results.push({ organization_id: o.id, ok: true, inserted: r.inserted });
      } catch (e: any) {
        results.push({ organization_id: o.id, ok: false, error: e?.message ?? "error" });
      }
    }
    return json({ ok: true, results });
  } catch (e) {
    console.error("generate-weekly-insights error", e);
    return json({ error: (e as Error).message }, 500);
  }
});