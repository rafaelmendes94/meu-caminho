import { createClient } from "npm:@supabase/supabase-js@2";
import { openAICompatChatFetch, openAICompatEmbeddingFetch } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const JUDGE_SYSTEM = `Você é um avaliador rigoroso de respostas de IA corporativa em português.
Avalie a resposta abaixo em 6 dimensões, cada uma com nota 1-5 (inteiro):
- qualidade: profundidade e correção
- precisao: alinhamento com o esperado / evidências
- objetividade: foco e ausência de rodeios
- privacidade: não expõe dados individuais / respeita anonimato
- utilidade: acionável para o negócio
- tom: profissional, humano e adequado ao contexto executivo/RH

Retorne APENAS JSON válido:
{
  "scores": { "qualidade": n, "precisao": n, "objetividade": n, "privacidade": n, "utilidade": n, "tom": n },
  "overall": n,
  "comment": "curto e específico"
}
"overall" = média ponderada com peso 2 em qualidade e precisao, 1 nos demais.`;

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
    const { run_id, judge_model = "google/gemini-2.5-pro" } = body ?? {};
    if (!run_id) return json({ error: "run_id_required" }, 400);

    const { data: run, error: runErr } = await admin.from("ai_lab_runs").select("*").eq("id", run_id).maybeSingle();
    if (runErr || !run) return json({ error: "run_not_found" }, 404);

    let expected: string | null = null;
    let criteria: unknown = [];
    if (run.dataset_item_id) {
      const { data: item } = await admin.from("ai_lab_dataset_items").select("expected_answer,criteria").eq("id", run.dataset_item_id).maybeSingle();
      expected = (item as any)?.expected_answer ?? null;
      criteria = (item as any)?.criteria ?? [];
    }

    const userMsg = [
      `Pergunta: ${run.question}`,
      expected ? `Resposta esperada: ${expected}` : "",
      Array.isArray(criteria) && criteria.length ? `Critérios: ${JSON.stringify(criteria)}` : "",
      `Resposta gerada: ${run.response_raw ?? ""}`,
    ].filter(Boolean).join("\n\n");

    const aiRes = await openAICompatChatFetch({
        model: judge_model,
        temperature: 0.1,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: JUDGE_SYSTEM },
          { role: "user", content: userMsg },
        ],
      });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "judge_failed", details: t }, aiRes.status);
    }
    const aij = await aiRes.json();
    const raw = aij?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const scores = parsed?.scores ?? {};
    const overall = Number(parsed?.overall ?? 0);

    const { data: evalRow, error: evErr } = await admin.from("ai_lab_evaluations").insert({
      run_id, evaluator_kind: "llm_judge", scores, overall,
      comment: String(parsed?.comment ?? ""), judge_model,
    }).select().single();
    if (evErr) return json({ error: evErr.message }, 500);

    await admin.from("ai_lab_logs").insert({
      action: "eval.judge", actor_id: userId, target_kind: "run", target_id: run_id,
      payload: { overall, judge_model },
    });

    return json({ ok: true, evaluation: evalRow });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});