import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é o motor de Planos de Ação Inteligentes do Meu Caminho Enterprise.
Sua função é transformar diagnósticos organizacionais AGREGADOS em planos de ação executivos claros.

Regras absolutas:
- Use APENAS o contexto agregado fornecido.
- NUNCA cite ou identifique pessoas.
- NUNCA invente dados.
- NUNCA proponha ações clínicas ou diagnósticas individuais.
- Foque em ações organizacionais aplicáveis por liderança e RH.
- Se o contexto for insuficiente, ainda assim proponha um plano genérico e prudente marcando priority "low".

Retorne EXCLUSIVAMENTE um JSON válido no formato:
{
  "title": string,
  "description": string,
  "priority": "low" | "medium" | "high" | "critical",
  "tasks": [
    { "title": string, "description": string, "due_in_days": number }
  ]
}

Gere entre 3 e 6 tarefas, cada uma acionável, com due_in_days entre 3 e 45.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const ALLOWED_SOURCES = new Set([
  "dna",
  "predictive_signal",
  "alert",
  "executive_ai",
  "manual",
]);

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
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) return json({ error: "no_organization" }, 400);

    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
    if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
      return json({ error: "forbidden" }, 403);
    }

    // Gather AGGREGATED source context only
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
    } else if (sourceType === "predictive_signal") {
      if (!sourceId) return json({ error: "missing_source_id" }, 400);
      const { data } = await admin
        .from("predictive_signals")
        .select("id, signal_type, severity, confidence, title, narrative, evidence, detected_at")
        .eq("organization_id", orgId)
        .eq("id", sourceId)
        .maybeSingle();
      context.predictive_signal = data ?? null;
    } else if (sourceType === "alert") {
      if (!sourceId) return json({ error: "missing_source_id" }, 400);
      const { data } = await admin
        .from("alerts")
        .select("id, alert_type, severity, title, message, evidence, created_at")
        .eq("organization_id", orgId)
        .eq("id", sourceId)
        .maybeSingle();
      context.alert = data ?? null;
    } else if (sourceType === "executive_ai") {
      if (sourceId) {
        const { data } = await admin
          .from("executive_ai_messages")
          .select("id, role, content, context_snapshot, created_at")
          .eq("id", sourceId)
          .maybeSingle();
        context.executive_message = data ?? null;
      }
    }

    // Also attach the RH dashboard summary for grounding
    const { data: dashboard } = await userClient.rpc("get_rh_dashboard_summary", {
      _organization_id: orgId,
    });
    context.rh_dashboard = dashboard ?? null;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `Contexto organizacional agregado (indicadores expostos apenas quando amostra >= 5):\n` +
          JSON.stringify(context, null, 2) +
          (extraPrompt ? `\n\nOrientação adicional do usuário:\n${extraPrompt}` : ""),
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
    if (!parsed || typeof parsed !== "object" || !parsed.title || !Array.isArray(parsed.tasks)) {
      return json({ error: "invalid_ai_response", raw }, 502);
    }

    const priority = ["low", "medium", "high", "critical"].includes(parsed.priority)
      ? parsed.priority
      : "medium";

    const { data: plan, error: planErr } = await admin
      .from("action_plans")
      .insert({
        organization_id: orgId,
        title: String(parsed.title).slice(0, 200),
        description: parsed.description ? String(parsed.description).slice(0, 4000) : null,
        source_type: sourceType,
        source_id: sourceId,
        owner_id: null,
        status: "draft",
        priority,
        created_by: userId,
      })
      .select("id")
      .single();
    if (planErr || !plan) return json({ error: planErr?.message ?? "insert_failed" }, 500);

    const now = Date.now();
    const tasks = (parsed.tasks as any[])
      .slice(0, 12)
      .map((t) => {
        const days = Number(t?.due_in_days);
        const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(90, Math.round(days))) : 7;
        const due = new Date(now + safeDays * 86_400_000).toISOString().slice(0, 10);
        return {
          action_plan_id: plan.id,
          title: String(t?.title ?? "Tarefa").slice(0, 200),
          description: t?.description ? String(t.description).slice(0, 2000) : null,
          status: "todo" as const,
          due_date: due,
        };
      })
      .filter((t) => t.title.trim().length > 0);

    if (tasks.length > 0) {
      const { error: tErr } = await admin.from("action_plan_tasks").insert(tasks);
      if (tErr) console.error("tasks insert error", tErr);
    }

    return json({ ok: true, plan_id: plan.id, tasks_count: tasks.length });
  } catch (e) {
    console.error("generate-action-plan error", e);
    return json({ error: (e as Error).message }, 500);
  }
});