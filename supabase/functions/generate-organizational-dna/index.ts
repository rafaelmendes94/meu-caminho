import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é um consultor executivo especializado em Inteligência Humana Corporativa.
Analise exclusivamente os dados agregados enviados.
Nunca identifique indivíduos.
Nunca realize diagnóstico clínico.
Nunca utilize linguagem médica.
Seu objetivo é produzir um relatório executivo para RH e Diretoria em português do Brasil.

Retorne EXCLUSIVAMENTE um JSON válido no seguinte formato (todos os campos obrigatórios):
{
  "overall_score": number (0-100),
  "culture_score": number (0-100),
  "leadership_score": number (0-100),
  "communication_score": number (0-100),
  "collaboration_score": number (0-100),
  "engagement_score": number (0-100),
  "energy_score": number (0-100),
  "recovery_score": number (0-100),
  "psychological_safety_score": number (0-100),
  "summary": string (2-4 parágrafos executivos),
  "strengths": string[] (3-6 itens),
  "opportunities": string[] (3-6 itens),
  "recommendations": string[] (3-6 itens acionáveis),
  "evidence": object (referências agregadas usadas)
}
Quando um indicador não tiver amostra suficiente (participants < 5), atribua um score neutro (ex.: 50) e mencione a limitação no summary. Nunca invente dados individuais.`;

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
    const days = Number(body?.days ?? 90);

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
      .eq("user_id", userId)
      .eq("organization_id", orgId);
    const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
    // Also check global roles (organization_id null)
    const { data: globalRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .is("organization_id", null);
    (globalRoles ?? []).forEach((r: { role: string }) => roleSet.add(r.role));
    if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
      return json({ error: "forbidden" }, 403);
    }

    // Fetch aggregated context
    const { data: ctx, error: ctxErr } = await userClient.rpc("get_dna_context", {
      _organization_id: orgId,
      _days: days,
    });
    if (ctxErr) return json({ error: ctxErr.message }, 500);

    const periodStart = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
    const periodEnd = new Date().toISOString().slice(0, 10);

    // Call Lovable AI Gateway
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
              `Contexto agregado (últimos ${days} dias) da organização. Todos os dados são anônimos e apenas com amostra >= 5 são exibidos. Gere o DNA Organizacional em JSON.\n\n` +
              JSON.stringify(ctx ?? {}, null, 2),
          },
        ],
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
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: "invalid_ai_response", raw }, 502);
    }
    if (!parsed || typeof parsed !== "object") {
      return json({ error: "invalid_ai_response" }, 502);
    }

    const num = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const arr = (v: unknown) => (Array.isArray(v) ? v : []);
    const obj = (v: unknown) =>
      v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

    const record = {
      organization_id: orgId,
      period_start: periodStart,
      period_end: periodEnd,
      status: "completed",
      overall_score: num((parsed as any).overall_score),
      culture_score: num((parsed as any).culture_score),
      leadership_score: num((parsed as any).leadership_score),
      communication_score: num((parsed as any).communication_score),
      collaboration_score: num((parsed as any).collaboration_score),
      engagement_score: num((parsed as any).engagement_score),
      energy_score: num((parsed as any).energy_score),
      recovery_score: num((parsed as any).recovery_score),
      psychological_safety_score: num((parsed as any).psychological_safety_score),
      summary: String((parsed as any).summary ?? ""),
      strengths: arr((parsed as any).strengths),
      opportunities: arr((parsed as any).opportunities),
      recommendations: arr((parsed as any).recommendations),
      evidence: obj((parsed as any).evidence),
      generated_by: "google/gemini-2.5-pro",
      version: 1,
    };

    const { data: inserted, error: insErr } = await admin
      .from("organizational_dna_reports")
      .insert(record)
      .select()
      .single();
    if (insErr) return json({ error: insErr.message }, 500);

    return json({ ok: true, report: inserted });
  } catch (e) {
    console.error("generate-organizational-dna error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}