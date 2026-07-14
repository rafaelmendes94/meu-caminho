import { createClient } from "npm:@supabase/supabase-js@2";
import { fetchKnowledgeContext } from "../_shared/knowledge_rag.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const COST_TABLE: Record<string, { in: number; out: number }> = {
  "google/gemini-2.5-pro": { in: 1.25, out: 10 },
  "google/gemini-2.5-flash": { in: 0.075, out: 0.3 },
  "google/gemini-2.5-flash-lite": { in: 0.04, out: 0.15 },
  "google/gemini-3-flash-preview": { in: 0.15, out: 0.6 },
  "openai/gpt-5": { in: 5, out: 15 },
  "openai/gpt-5-mini": { in: 0.5, out: 1.5 },
  "openai/gpt-5-nano": { in: 0.1, out: 0.4 },
};

function estimateCost(model: string, tin: number, tout: number) {
  const t = COST_TABLE[model];
  if (!t) return 0;
  return Number(((tin / 1_000_000) * t.in + (tout / 1_000_000) * t.out).toFixed(6));
}

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
      ai_module = "playground",
      prompt_config_id = null,
      prompt_snapshot = {},
      system_prompt = "",
      model = "google/gemini-3-flash-preview",
      temperature = 0.4,
      max_tokens = 2048,
      organization_id = null,
      question,
      knowledge_enabled = true,
      context_enabled = true,
      response_format_json = false,
      dataset_id = null,
      dataset_item_id = null,
      parent_run_id = null,
      kind = "playground",
    } = body ?? {};

    if (!question || typeof question !== "string") return json({ error: "question_required" }, 400);

    const messages: Array<{ role: string; content: string }> = [];
    const sys = String(system_prompt || (prompt_snapshot as any)?.system_instructions || "").trim();
    if (sys) messages.push({ role: "system", content: sys });

    let chunksUsed: unknown[] = [];
    let confidence: number | null = null;
    if (knowledge_enabled) {
      const rag = await fetchKnowledgeContext({
        query: question,
        organizationId: organization_id,
        aiModule: `ai-lab:${ai_module}`,
      });
      if (rag.contextBlock) messages.push({ role: "user", content: rag.contextBlock });
      chunksUsed = rag.sources;
      confidence = rag.confidence;
    }
    if (context_enabled && (prompt_snapshot as any)?.context_block) {
      messages.push({ role: "user", content: String((prompt_snapshot as any).context_block) });
    }
    messages.push({ role: "user", content: question });

    const started = Date.now();
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}` },
      body: JSON.stringify({
        model, temperature, max_tokens, messages,
        ...(response_format_json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    const latency = Date.now() - started;

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
      const { data: run } = await admin.from("ai_lab_runs").insert({
        kind, ai_module, prompt_config_id, prompt_snapshot, model, temperature, max_tokens,
        organization_id, question, final_prompt: messages, latency_ms: latency,
        knowledge_enabled, context_enabled, chunks_used: chunksUsed, confidence,
        status: "error", error: errText.slice(0, 500), created_by: userId,
        dataset_id, dataset_item_id, parent_run_id,
      }).select().single();
      return json({ error: "ai_gateway_error", details: errText, run }, aiRes.status);
    }

    const aij = await aiRes.json();
    const raw = aij?.choices?.[0]?.message?.content ?? "";
    let parsed: unknown = null;
    if (response_format_json) { try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { /* keep null */ } }
    const tin = Number(aij?.usage?.prompt_tokens ?? 0);
    const tout = Number(aij?.usage?.completion_tokens ?? 0);

    const { data: run, error: runErr } = await admin.from("ai_lab_runs").insert({
      kind, ai_module, prompt_config_id, prompt_snapshot, model, temperature, max_tokens,
      organization_id, question, final_prompt: messages,
      response_raw: raw, response_parsed: parsed,
      tokens_in: tin, tokens_out: tout, cost_usd: estimateCost(model, tin, tout),
      latency_ms: latency, knowledge_enabled, context_enabled,
      chunks_used: chunksUsed, confidence, status: "ok",
      dataset_id, dataset_item_id, parent_run_id, created_by: userId,
    }).select().single();
    if (runErr) return json({ error: runErr.message }, 500);

    await admin.from("ai_lab_logs").insert({
      action: "run.playground", actor_id: userId, target_kind: "run", target_id: run.id,
      payload: { kind, model, ai_module, latency_ms: latency, cost_usd: run.cost_usd },
    });

    return json({ ok: true, run });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});