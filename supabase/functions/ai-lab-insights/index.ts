import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const pct = (a: number, b: number) => (!a ? null : Number((((b - a) / a) * 100).toFixed(1)));

// Compara dois benchmarks e devolve insight legível: "qualidade +8%, custo -18%".
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

    const { baseline_id, candidate_id } = await req.json().catch(() => ({}));
    if (!baseline_id || !candidate_id) return json({ error: "invalid_request" }, 400);

    const [{ data: a }, { data: b }] = await Promise.all([
      admin.from("ai_lab_benchmarks").select("*").eq("id", baseline_id).maybeSingle(),
      admin.from("ai_lab_benchmarks").select("*").eq("id", candidate_id).maybeSingle(),
    ]);
    if (!a || !b) return json({ error: "benchmark_not_found" }, 404);

    const A = (a.aggregate ?? {}) as any;
    const B = (b.aggregate ?? {}) as any;
    const insight = {
      approval_pct_delta: pct(Number(A.approval_rate ?? 0), Number(B.approval_rate ?? 0)),
      quality_pct_delta: pct(Number(A.avg_quality ?? 0), Number(B.avg_quality ?? 0)),
      latency_pct_delta: pct(Number(A.avg_latency_ms ?? 0), Number(B.avg_latency_ms ?? 0)),
      cost_pct_delta: pct(Number(A.total_cost_usd ?? 0), Number(B.total_cost_usd ?? 0)),
      absolute: {
        approval: [A.approval_rate ?? 0, B.approval_rate ?? 0],
        quality: [A.avg_quality ?? null, B.avg_quality ?? null],
        latency_ms: [A.avg_latency_ms ?? 0, B.avg_latency_ms ?? 0],
        cost_usd: [A.total_cost_usd ?? 0, B.total_cost_usd ?? 0],
      },
    };

    const parts: string[] = [];
    if (insight.quality_pct_delta !== null) parts.push(`qualidade ${insight.quality_pct_delta >= 0 ? "+" : ""}${insight.quality_pct_delta}%`);
    if (insight.approval_pct_delta !== null) parts.push(`aprovação ${insight.approval_pct_delta >= 0 ? "+" : ""}${insight.approval_pct_delta}%`);
    if (insight.cost_pct_delta !== null) parts.push(`custo ${insight.cost_pct_delta >= 0 ? "+" : ""}${insight.cost_pct_delta}%`);
    if (insight.latency_pct_delta !== null) parts.push(`latência ${insight.latency_pct_delta >= 0 ? "+" : ""}${insight.latency_pct_delta}%`);
    const summary = parts.join(" · ") || "sem métricas suficientes";

    const winner: "baseline" | "candidate" | "tie" =
      (insight.quality_pct_delta ?? 0) > 3 ? "candidate"
      : (insight.quality_pct_delta ?? 0) < -3 ? "baseline"
      : (insight.cost_pct_delta ?? 0) < -5 ? "candidate"
      : (insight.cost_pct_delta ?? 0) > 5 ? "baseline" : "tie";

    await admin.from("ai_lab_logs").insert({
      action: "insight.compare_benchmarks", actor_id: userId,
      target_kind: "benchmark", target_id: candidate_id,
      payload: { baseline_id, summary, winner, insight },
    });

    return json({ ok: true, summary, winner, insight });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});