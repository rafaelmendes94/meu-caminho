import { createClient } from "npm:@supabase/supabase-js@2";
import { fetchKnowledgeContext } from "../_shared/knowledge_rag.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const COST: Record<string, { in: number; out: number }> = {
  "google/gemini-2.5-pro": { in: 1.25, out: 10 },
  "google/gemini-2.5-flash": { in: 0.075, out: 0.3 },
  "google/gemini-3-flash-preview": { in: 0.15, out: 0.6 },
  "openai/gpt-5-mini": { in: 0.5, out: 1.5 },
  "openai/gpt-5-nano": { in: 0.1, out: 0.4 },
};
const cost = (m: string, i: number, o: number) => {
  const t = COST[m]; if (!t) return 0;
  return Number(((i / 1e6) * t.in + (o / 1e6) * t.out).toFixed(6));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "missing_auth" }, 401);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await userClient.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return json({ error: "unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("is_platform_admin");
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const {
      name, ai_module, dataset_id, prompt_config_id = null,
      model = "google/gemini-3-flash-preview", system_prompt = "",
      temperature = 0.4, max_tokens = 1024, judge = true,
      knowledge_enabled = true, response_format_json = false,
      limit = 100,
    } = body ?? {};
    if (!name || !ai_module || !dataset_id) return json({ error: "invalid_request" }, 400);

    const { data: items } = await admin.from("ai_lab_dataset_items")
      .select("*").eq("dataset_id", dataset_id).order("position").limit(limit);
    if (!items?.length) return json({ error: "empty_dataset" }, 400);

    const { data: cfg } = prompt_config_id
      ? await admin.from("ai_prompt_configs").select("*").eq("id", prompt_config_id).maybeSingle()
      : { data: null as any };
    const sys = system_prompt || cfg?.system_instructions || "";

    const { data: bench, error: bErr } = await admin.from("ai_lab_benchmarks").insert({
      name, ai_module, dataset_id, prompt_config_id,
      prompt_version: cfg?.version ?? null, model,
      status: "running", created_by: userId,
    }).select().single();
    if (bErr) return json({ error: bErr.message }, 500);

    let ok = 0, fail = 0, jsonInvalid = 0, totIn = 0, totOut = 0, totLat = 0, totCost = 0;
    let sumQuality = 0, evalCount = 0;

    for (const item of items) {
      const messages: Array<{ role: string; content: string }> = [];
      if (sys) messages.push({ role: "system", content: sys });
      if (knowledge_enabled) {
        const rag = await fetchKnowledgeContext({ query: item.question, organizationId: null, aiModule: `ai-lab-benchmark:${ai_module}` });
        if (rag.contextBlock) messages.push({ role: "user", content: rag.contextBlock });
      }
      if (item.context && Object.keys(item.context).length) {
        messages.push({ role: "user", content: `Contexto:\n${JSON.stringify(item.context)}` });
      }
      messages.push({ role: "user", content: item.question });

      const t0 = Date.now();
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}` },
        body: JSON.stringify({
          model, temperature, max_tokens, messages,
          ...(response_format_json ? { response_format: { type: "json_object" } } : {}),
        }),
      });
      const lat = Date.now() - t0;
      totLat += lat;

      if (!r.ok) {
        fail++;
        await admin.from("ai_lab_runs").insert({
          kind: "benchmark", ai_module, prompt_config_id, prompt_snapshot: { system_instructions: sys },
          model, temperature, max_tokens, question: item.question, final_prompt: messages,
          latency_ms: lat, status: "error", error: (await r.text()).slice(0, 300),
          dataset_id, dataset_item_id: item.id, parent_run_id: null, created_by: userId,
          knowledge_enabled, context_enabled: true, metadata: { benchmark_id: bench.id },
        });
        continue;
      }
      const aij = await r.json();
      const raw = aij?.choices?.[0]?.message?.content ?? "";
      let parsed: unknown = null;
      if (response_format_json) { try { parsed = JSON.parse(raw); } catch { jsonInvalid++; } }
      const tin = Number(aij?.usage?.prompt_tokens ?? 0);
      const tout = Number(aij?.usage?.completion_tokens ?? 0);
      const c = cost(model, tin, tout);
      totIn += tin; totOut += tout; totCost += c;
      ok++;

      const { data: run } = await admin.from("ai_lab_runs").insert({
        kind: "benchmark", ai_module, prompt_config_id, prompt_snapshot: { system_instructions: sys },
        model, temperature, max_tokens, question: item.question, final_prompt: messages,
        response_raw: raw, response_parsed: parsed, tokens_in: tin, tokens_out: tout,
        cost_usd: c, latency_ms: lat, status: "ok",
        dataset_id, dataset_item_id: item.id, knowledge_enabled, context_enabled: true,
        created_by: userId, metadata: { benchmark_id: bench.id },
      }).select().single();

      if (judge && run) {
        // Fire and forget judge to avoid blocking; still awaited briefly to keep aggregate.
        try {
          const jr = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-lab-judge`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: auth },
            body: JSON.stringify({ run_id: run.id }),
          });
          if (jr.ok) {
            const jj = await jr.json();
            const ov = Number(jj?.evaluation?.overall ?? 0);
            if (ov > 0) { sumQuality += ov; evalCount++; }
          }
        } catch { /* ignore */ }
      }
    }

    const approval = items.length ? Number((ok / items.length).toFixed(3)) : 0;
    const aggregate = {
      total: items.length, ok, fail,
      approval_rate: approval,
      json_invalid: jsonInvalid,
      avg_latency_ms: items.length ? Math.round(totLat / items.length) : 0,
      total_tokens_in: totIn, total_tokens_out: totOut, total_cost_usd: Number(totCost.toFixed(6)),
      avg_quality: evalCount ? Number((sumQuality / evalCount).toFixed(2)) : null,
      evaluations: evalCount,
    };

    await admin.from("ai_lab_benchmarks").update({
      status: "complete", aggregate, completed_at: new Date().toISOString(),
    }).eq("id", bench.id);
    await admin.from("ai_lab_logs").insert({
      action: "benchmark.complete", actor_id: userId,
      target_kind: "benchmark", target_id: bench.id, payload: aggregate,
    });

    return json({ ok: true, benchmark_id: bench.id, aggregate });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});