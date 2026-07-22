import { createClient } from "npm:@supabase/supabase-js@2";
import { fetchKnowledgeContext } from "../_shared/knowledge_rag.ts";
import { openAICompatChatFetch, openAICompatEmbeddingFetch } from "../_shared/gemini.ts";

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
  "google/gemini-2.5-flash-lite": { in: 0.04, out: 0.15 },
  "google/gemini-3-flash-preview": { in: 0.15, out: 0.6 },
  "openai/gpt-5": { in: 5, out: 15 },
  "openai/gpt-5-mini": { in: 0.5, out: 1.5 },
  "openai/gpt-5-nano": { in: 0.1, out: 0.4 },
};
const estCost = (m: string, ti: number, to: number) => {
  const t = COST[m]; if (!t) return 0;
  return Number(((ti / 1e6) * t.in + (to / 1e6) * t.out).toFixed(6));
};

// Executa duas variantes (A/B) em paralelo sobre a mesma pergunta.
// Persiste 2 runs (kind=experiment) e devolve um insight comparativo simples.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "missing_auth" }, 401);
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: u } = await userClient.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return json({ error: "unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("is_platform_admin");
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const {
      ai_module = "compare", question,
      variant_a, variant_b,
      knowledge_enabled = true,
      organization_id = null,
      judge = false,
    } = body ?? {};
    if (!question || !variant_a || !variant_b) return json({ error: "invalid_request" }, 400);

    let rag: { contextBlock?: string; sources?: unknown[]; confidence?: number | null } = {};
    if (knowledge_enabled) {
      rag = await fetchKnowledgeContext({ query: question, organizationId: organization_id, aiModule: `ai-lab-compare:${ai_module}` }) as any;
    }

    const runVariant = async (v: any) => {
      const messages: Array<{ role: string; content: string }> = [];
      const sys = String(v.system_prompt ?? "").trim();
      if (sys) messages.push({ role: "system", content: sys });
      if (rag.contextBlock) messages.push({ role: "user", content: rag.contextBlock });
      messages.push({ role: "user", content: question });
      const t0 = Date.now();
      const r = await openAICompatChatFetch({
          model: v.model,
          temperature: v.temperature ?? 0.4,
          max_tokens: v.max_tokens ?? 1024,
          messages,
          ...(v.response_format_json ? { response_format: { type: "json_object" } } : {}),
        });
      const lat = Date.now() - t0;
      if (!r.ok) {
        const err = (await r.text()).slice(0, 400);
        const { data: run } = await admin.from("ai_lab_runs").insert({
          kind: "experiment", ai_module, prompt_config_id: v.prompt_config_id ?? null,
          prompt_snapshot: { system_instructions: sys },
          model: v.model, temperature: v.temperature ?? 0.4, max_tokens: v.max_tokens ?? 1024,
          question, final_prompt: messages, latency_ms: lat,
          knowledge_enabled, context_enabled: true,
          chunks_used: rag.sources ?? [], confidence: rag.confidence ?? null,
          status: "error", error: err, created_by: userId,
        }).select().single();
        return { run, ok: false };
      }
      const aij = await r.json();
      const raw = aij?.choices?.[0]?.message?.content ?? "";
      const tin = Number(aij?.usage?.prompt_tokens ?? 0);
      const tout = Number(aij?.usage?.completion_tokens ?? 0);
      const cost = estCost(v.model, tin, tout);
      const { data: run } = await admin.from("ai_lab_runs").insert({
        kind: "experiment", ai_module, prompt_config_id: v.prompt_config_id ?? null,
        prompt_snapshot: { system_instructions: sys },
        model: v.model, temperature: v.temperature ?? 0.4, max_tokens: v.max_tokens ?? 1024,
        question, final_prompt: messages, response_raw: raw,
        tokens_in: tin, tokens_out: tout, cost_usd: cost, latency_ms: lat,
        knowledge_enabled, context_enabled: true,
        chunks_used: rag.sources ?? [], confidence: rag.confidence ?? null,
        status: "ok", created_by: userId,
      }).select().single();
      return { run, ok: true };
    };

    const [ra, rb] = await Promise.all([runVariant(variant_a), runVariant(variant_b)]);

    let judgeA: any = null, judgeB: any = null;
    if (judge && ra.ok && rb.ok) {
      const call = (id: string) => fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-lab-judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: auth },
        body: JSON.stringify({ run_id: id }),
      }).then(r => r.ok ? r.json() : null).catch(() => null);
      [judgeA, judgeB] = await Promise.all([call(ra.run!.id), call(rb.run!.id)]);
    }

    const a = ra.run, b = rb.run;
    const insight = (() => {
      if (!a || !b) return { verdict: "inconclusive", reasons: ["run missing"] };
      const dLat = (b.latency_ms ?? 0) - (a.latency_ms ?? 0);
      const dCost = Number(((b.cost_usd ?? 0) - (a.cost_usd ?? 0)).toFixed(6));
      const qA = Number(judgeA?.evaluation?.overall ?? 0);
      const qB = Number(judgeB?.evaluation?.overall ?? 0);
      const dQ = qB - qA;
      let verdict: "a" | "b" | "tie" | "inconclusive" = "inconclusive";
      if (qA || qB) {
        if (Math.abs(dQ) < 0.15) verdict = dCost <= 0 ? "b" : "a";
        else verdict = dQ > 0 ? "b" : "a";
      } else {
        verdict = dCost < 0 && dLat <= 0 ? "b" : dCost > 0 && dLat >= 0 ? "a" : "tie";
      }
      return {
        verdict,
        latency_delta_ms: dLat,
        cost_delta_usd: dCost,
        quality_delta: qA || qB ? Number(dQ.toFixed(2)) : null,
        summary: [
          qA || qB ? `qualidade ${dQ >= 0 ? "+" : ""}${dQ.toFixed(2)}` : "sem judge",
          `custo ${dCost >= 0 ? "+" : ""}${dCost}`,
          `latência ${dLat >= 0 ? "+" : ""}${dLat}ms`,
        ].join(" · "),
      };
    })();

    await admin.from("ai_lab_logs").insert({
      action: "compare.run", actor_id: userId, target_kind: "run", target_id: a?.id ?? null,
      payload: { a_run: a?.id, b_run: b?.id, insight },
    });

    return json({ ok: true, a, b, judge_a: judgeA?.evaluation ?? null, judge_b: judgeB?.evaluation ?? null, insight });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});