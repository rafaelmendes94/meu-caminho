// AI Orchestrator™ — camada acima das IAs especialistas.
// Não conversa com o usuário; roteia, consolida, valida e mede.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type Cfg = {
  id: string;
  version: number;
  system_instructions: string;
  tone_config: any;
  model_config: any;
  guardrails: any;
};

async function loadConfig(admin: any): Promise<Cfg> {
  const { data, error } = await admin
    .from("ai_prompt_configs")
    .select("id, version, system_instructions, tone_config, model_config, guardrails")
    .eq("key", "orchestrator")
    .maybeSingle();
  if (error || !data) throw new Error("orchestrator config not found");
  return data as Cfg;
}

async function hashIntent(intent: string, specialists: string[]): Promise<string> {
  const enc = new TextEncoder().encode(intent.trim().toLowerCase() + "|" + specialists.sort().join(","));
  const h = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function detectIntent(question: string, routing: any[]): { intent: string; specialists: string[]; priority: string[] } {
  const q = question.toLowerCase();
  let best: any = null;
  let bestScore = 0;
  for (const r of routing ?? []) {
    const kws: string[] = r.keywords ?? [];
    const score = kws.reduce((acc, k) => acc + (q.includes(String(k).toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = r; }
  }
  if (best) return { intent: best.intent, specialists: best.specialists ?? [], priority: best.priority ?? [] };
  return { intent: "general", specialists: ["council"], priority: ["council"] };
}

function estimateCost(model: string, costTable: any, tokIn: number, tokOut: number): number {
  const row = costTable?.[model];
  if (!row) return 0;
  return ((tokIn / 1000) * Number(row.input_per_1k || 0)) + ((tokOut / 1000) * Number(row.output_per_1k || 0));
}

async function fetchMemory(admin: any, orgId: string): Promise<any[]> {
  if (!orgId) return [];
  const { data } = await admin
    .from("ai_orchestrator_memory")
    .select("kind, summary, weight, captured_at")
    .eq("organization_id", orgId)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("captured_at", { ascending: false })
    .limit(40);
  return data ?? [];
}

async function refreshMemory(admin: any, orgId: string, cfg: Cfg) {
  if (!orgId) return;
  const mem = cfg.tone_config?.memory ?? {};
  const now = new Date();
  const iso = (days: number) => new Date(now.getTime() + days * 86400_000).toISOString();
  const inserts: any[] = [];

  const push = async (kind: string, table: string, select: string, orderCol: string, buildSummary: (r: any) => string, ttlDays: number) => {
    const { data } = await admin.from(table).select(select).eq("organization_id", orgId).order(orderCol, { ascending: false }).limit(3);
    for (const r of (data ?? [])) {
      inserts.push({ organization_id: orgId, kind, ref_id: r.id, summary: buildSummary(r), payload: r, weight: 1.0, expires_at: iso(ttlDays) });
    }
  };

  await Promise.all([
    push("dna", "organizational_dna_reports", "id, created_at, executive_summary", "created_at",
      (r) => (r.executive_summary || "DNA gerado").slice(0, 240), mem.ttl_days_dna ?? 90),
    push("insight", "weekly_ai_insights", "id, created_at, headline", "created_at",
      (r) => r.headline || "Insight semanal", mem.ttl_days_insight ?? 21),
    push("plan", "action_plans", "id, created_at, title", "created_at",
      (r) => r.title || "Plano de ação", mem.ttl_days_plan ?? 60),
    push("ritual", "intelligent_rituals", "id, created_at, name", "created_at",
      (r) => r.name || "Ritual", mem.ttl_days_ritual ?? 30),
    push("score", "organizational_scores", "id, computed_at, total_score", "computed_at",
      (r) => `Score ${r.total_score}`, mem.ttl_days_score ?? 30),
  ]);

  if (inserts.length) {
    await admin.from("ai_orchestrator_memory").insert(inserts);
  }
}

async function invokeSpecialist(admin: any, specialistKey: string, fnName: string, payload: any, authHeader: string | null): Promise<{ ok: boolean; data?: any; error?: string; ms: number }> {
  const start = Date.now();
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/${fnName}`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader ?? `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        "apikey": Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      },
      body: JSON.stringify(payload ?? {}),
    });
    const ms = Date.now() - start;
    const txt = await r.text();
    let data: any = null;
    try { data = JSON.parse(txt); } catch { data = { raw: txt.slice(0, 500) }; }
    if (!r.ok) return { ok: false, error: `${specialistKey}:${r.status}`, ms, data };
    return { ok: true, data, ms };
  } catch (e) {
    return { ok: false, error: String((e as Error).message), ms: Date.now() - start };
  }
}

function extractText(x: any): string {
  if (!x) return "";
  if (typeof x === "string") return x;
  return x.answer || x.headline || x.summary || x.executive_summary || x.reason || x.message || "";
}

function computeConfidence(specialists: string[], results: any[], weights: any): number {
  const w = weights?.weights ?? { sources: 0.35, consistency: 0.35, data_volume: 0.20, freshness: 0.10 };
  const ok = results.filter((r) => r.ok).length;
  const sources = Math.min(1, ok / Math.max(1, weights?.ideal_sources ?? 3));
  const consistency = ok === 0 ? 0 : Math.min(1, ok / Math.max(1, specialists.length));
  const dataVolume = Math.min(1, ok / 3);
  const freshness = 1;
  const score = w.sources * sources + w.consistency * consistency + w.data_volume * dataVolume + w.freshness * freshness;
  return Math.round(Math.max(0, Math.min(1, score)) * 100) / 100;
}

function consolidate(specialists: string[], results: any[], intent: string): { answer: string; sections: any[]; limitations: string[] } {
  const sections: any[] = [];
  const seen = new Set<string>();
  const limitations: string[] = [];
  for (let i = 0; i < specialists.length; i++) {
    const key = specialists[i];
    const r = results[i];
    if (!r?.ok) { limitations.push(`${key}: ${r?.error || "sem resposta"}`); continue; }
    const text = extractText(r.data).trim();
    if (!text) { limitations.push(`${key}: sem conteúdo utilizável`); continue; }
    const norm = text.slice(0, 200).toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);
    sections.push({ specialist: key, text });
  }
  const answer = sections.length
    ? sections.map((s) => `【${s.specialist}】 ${s.text}`).join("\n\n")
    : "sem dados suficientes";
  return { answer, sections, limitations };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const started = Date.now();
  let logRow: any = null;
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const body = await req.json().catch(() => ({}));
    const {
      question, organization_id: orgId, user_id: userId,
      force_refresh, mode = "run",
    } = body ?? {};
    if (!question || typeof question !== "string") return json({ error: "question is required" }, 400);

    const authHeader = req.headers.get("Authorization");
    const cfg = await loadConfig(admin);
    const routing = cfg.tone_config?.routing ?? [];
    const { intent, specialists: baseSpecs, priority } = detectIntent(question, routing);

    // Priorização: usa apenas prioritários; fallback só se preciso
    const chosen: string[] = (priority.length ? priority : baseSpecs).slice(0, 3);
    const intentHash = await hashIntent(question, chosen);

    // Cache lookup
    if (!force_refresh && orgId && mode === "run") {
      const { data: cache } = await admin
        .from("ai_orchestrator_cache")
        .select("*")
        .eq("organization_id", orgId)
        .eq("intent_hash", intentHash)
        .maybeSingle();
      if (cache && !cache.is_stale && new Date(cache.expires_at) > new Date()) {
        await admin.from("ai_orchestrator_cache").update({ hits: (cache.hits ?? 0) + 1 }).eq("id", cache.id);
        await admin.from("ai_orchestrator_logs").insert({
          organization_id: orgId, user_id: userId ?? null, intent, intent_hash: intentHash,
          specialists: chosen, routing: { intent, priority, base: baseSpecs },
          cache_hit: true, status: "ok", confidence: cache.confidence, config_version: cfg.version,
          latency_ms: Date.now() - started,
        });
        return json({ ...cache.response, cache_hit: true, confidence: cache.confidence });
      }
    }

    // Refresh memória organizacional (best-effort)
    if (orgId) await refreshMemory(admin, orgId, cfg).catch(() => {});
    const memory = orgId ? await fetchMemory(admin, orgId) : [];

    // Executar especialistas em paralelo
    const specConfigs: any[] = cfg.model_config?.specialists ?? [];
    const specMap = new Map(specConfigs.map((s: any) => [s.key, s]));
    const payloadBase = { organization_id: orgId, user_id: userId, question, memory, from_orchestrator: true };

    const results = await Promise.all(chosen.map((k) => {
      const spec = specMap.get(k);
      if (!spec || spec.active === false) return Promise.resolve({ ok: false, error: `${k}:disabled`, ms: 0 });
      return invokeSpecialist(admin, k, spec.function, payloadBase, authHeader);
    }));

    // Consolidação + confiança
    const { answer, sections, limitations } = consolidate(chosen, results, intent);
    const confidence = computeConfidence(chosen, results, cfg.tone_config?.confidence);
    const status = results.every((r) => !r.ok) ? "insufficient_data" : (results.some((r) => !r.ok) ? "fallback" : "ok");

    // Custo estimado (soma tokens reportados pelos especialistas se houver)
    const costTable = cfg.model_config?.cost_table ?? {};
    let tokIn = 0, tokOut = 0;
    for (const r of results) {
      const u = r.data?.usage ?? r.data?.tokens ?? null;
      if (u) { tokIn += Number(u.input_tokens ?? u.prompt_tokens ?? 0); tokOut += Number(u.output_tokens ?? u.completion_tokens ?? 0); }
    }
    const modelUsed = cfg.model_config?.primary_model ?? null;
    const costUsd = estimateCost(modelUsed, costTable, tokIn, tokOut);

    const response = {
      intent, specialists: chosen, priority, answer, sections,
      limitations: limitations.length ? limitations : undefined,
      confidence, sources: chosen, config_version: cfg.version,
    };

    // Cache write
    if (orgId && status !== "insufficient_data" && mode === "run") {
      const ttl = Number(cfg.model_config?.cache_ttl_seconds ?? 7200);
      await admin.from("ai_orchestrator_cache").upsert({
        organization_id: orgId, intent_hash: intentHash, intent,
        specialists: chosen, response, confidence,
        config_version: cfg.version, is_stale: false, invalidation_reason: null,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
      }, { onConflict: "organization_id,intent_hash" });
    }

    // Log
    await admin.from("ai_orchestrator_logs").insert({
      organization_id: orgId ?? null, user_id: userId ?? null,
      intent, intent_hash: intentHash, specialists: chosen,
      routing: { intent, priority, base: baseSpecs, results: results.map((r, i) => ({ key: chosen[i], ok: r.ok, ms: r.ms, error: r.error })) },
      model: modelUsed, fallback_used: status === "fallback",
      tokens_input: tokIn || null, tokens_output: tokOut || null, cost_usd: costUsd || null,
      latency_ms: Date.now() - started, cache_hit: false, confidence,
      status, config_version: cfg.version,
    });

    return json(response);
  } catch (e) {
    const msg = String((e as Error).message);
    try {
      await admin.from("ai_orchestrator_logs").insert({
        intent: "error", status: "error", error: msg, latency_ms: Date.now() - started,
      });
    } catch { /* ignore */ }
    return json({ error: msg }, 500);
  }
});