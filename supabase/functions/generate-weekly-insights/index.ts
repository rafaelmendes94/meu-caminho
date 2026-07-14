import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FALLBACK_SYSTEM_PROMPT = `Você é analista executivo de Inteligência Humana Corporativa.
Gere uma leitura semanal executiva em pt-BR sobre o que mudou na organização. Use apenas dados agregados.
Nunca identifique pessoas. Nunca faça diagnóstico clínico. Nunca invente números.
Quando participants < 5, marque a dimensão como indisponível e reduza a confiança.
Retorne EXCLUSIVAMENTE JSON válido no schema descrito no prompt de contexto.`;

const IMMUTABLE_GUARDRAILS = [
  "Utilizar apenas dados agregados fornecidos pelo backend.",
  "Respeitar k-anonimato (amostra mínima da organização).",
  "Nunca identificar indivíduos, times minoritários ou denunciantes.",
  "Nunca acessar chats, mensagens, onboarding individual ou denúncias.",
  "Nunca cruzar dados com outra organização.",
  "Nunca realizar diagnóstico clínico ou usar linguagem médica.",
  "Nunca inventar números, percentuais, participantes ou tendências.",
  "Nunca afirmar causalidade sem evidência (usar linguagem de hipótese).",
  "Nunca comparar janelas com amostras incompatíveis.",
];

let cachedCfg: { at: number; cfg: any } | null = null;
async function loadPublishedConfig(admin: any) {
  if (cachedCfg && Date.now() - cachedCfg.at < 60_000) return cachedCfg.cfg;
  const { data } = await admin
    .from("ai_prompt_configs").select("*").eq("key", "weekly_insights").maybeSingle();
  cachedCfg = { at: Date.now(), cfg: data ?? null };
  return data ?? null;
}
async function loadConfigBySource(admin: any, source: "draft" | "published") {
  if (source === "published") return await loadPublishedConfig(admin);
  const { data } = await admin
    .from("ai_prompt_configs").select("*").eq("key", "weekly_insights").maybeSingle();
  return data ?? null;
}

function buildSystemPrompt(cfg: any): string {
  const tone = cfg?.tone_config ?? {};
  const period = tone?.period ?? {};
  const signals = tone?.signals ?? {};
  const structure = Array.isArray(cfg?.output_structure)
    ? [...cfg.output_structure].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).filter((b: any) => b.active)
    : [];
  const base = String(cfg?.system_instructions ?? FALLBACK_SYSTEM_PROMPT);
  const gl = IMMUTABLE_GUARDRAILS.map((g) => `- ${g}`).join("\n");
  const structBlock = structure.map((b: any) => `- ${b.key}: ${b.title}`).join("\n");
  return `${base}

REGRAS IMUTÁVEIS DE SEGURANÇA (aplicadas pelo backend):
${gl}

JANELA E COMPARAÇÕES:
- Início da semana: ${period.week_start ?? "monday"} | Janela: ${period.main_window ?? "7_days"} | Timezone da empresa: ${period.use_org_timezone !== false}
- Comparar semana anterior: ${period.compare_previous_week !== false}
- Comparar média 4 semanas: ${period.compare_4w_average !== false}
- Comparar média 12 semanas: ${period.compare_12w_average !== false}
- Exigir amostras comparáveis: ${period.require_comparable_samples !== false}

SEÇÕES DO INSIGHT (na ordem):
${structBlock}

COMPORTAMENTO:
- Tom: ${tone.tone ?? "executivo"} | Detalhe: ${tone.detail ?? "equilibrado"} | Formalidade: ${tone.formality ?? "alta"}
- Máx. mudanças: ${tone.max_key_changes ?? 5} | evoluções: ${tone.max_positive_evolutions ?? 5} | sinais: ${tone.max_attention_signals ?? 5} | ações: ${tone.max_priority_actions ?? 5} | watchlist: ${tone.max_watchlist ?? 5}
- Incluir hipóteses: ${tone.include_hypotheses !== false} | Incluir evoluções positivas: ${tone.include_positive_evolutions !== false}
- Sempre incluir confiança e limitações.

SINAIS E AÇÕES:
- Labels de severidade: ${(signals.severity_labels ?? ["observacao","atencao","alto","critico"]).join(", ")}
- Exigir evidência: ${signals.require_evidence !== false} | prazo: ${signals.require_deadline !== false} | indicador: ${signals.require_indicator !== false}
- Priorizar baixo esforço / alto impacto: ${signals.prefer_low_effort_high_impact !== false}
${signals.extra_instructions ? `- Extras: ${signals.extra_instructions}` : ""}

${tone.extra_instructions ? `INSTRUÇÕES ADICIONAIS:\n${tone.extra_instructions}\n` : ""}
SAÍDA: retorne EXCLUSIVAMENTE JSON válido no schema:
{
  "title": string,
  "executive_summary": string,
  "period": { "current_start": string, "current_end": string, "comparison_start": string, "comparison_end": string },
  "key_changes": [{ "dimension": string, "direction": "up"|"down"|"stable", "magnitude": string, "period_compared": string, "evidence": string, "relevance": string, "confidence": number }],
  "positive_evolutions": [{ "title": string, "evidence": string, "possible_factor": string, "how_to_sustain": string, "indicator_to_monitor": string }],
  "attention_signals": [{ "title": string, "severity": string, "evidence": string, "duration": string, "trend": string, "possible_consequence": string, "recommended_action": string, "confidence": number }],
  "hypotheses": [{ "hypothesis": string, "supporting_evidence": string[], "contradicting_evidence": string[], "how_to_validate": string, "confidence": number }],
  "priority_actions": [{ "title": string, "priority": "P1"|"P2"|"P3", "objective": string, "owner": string, "deadline": string, "effort": "baixo"|"medio"|"alto", "impact": "baixo"|"medio"|"alto", "success_indicator": string }],
  "watchlist": [{ "metric": string, "desired_direction": string, "deadline": string, "attention_trigger": string }],
  "confidence": number,
  "confidence_reason": string,
  "limitations": string[],
  "used_sections": string[]
}
Regras: nunca invente números; quando amostra < 5 marque a dimensão como indisponível e cite em "limitations"; nunca use causalidade sem evidência (apenas hipóteses).`;
}

function estimateCost(model: string, tokensIn: number, tokensOut: number): number {
  const rates: Record<string, { in: number; out: number }> = {
    "google/gemini-2.5-pro": { in: 1.25 / 1e6, out: 5 / 1e6 },
    "google/gemini-2.5-flash": { in: 0.075 / 1e6, out: 0.3 / 1e6 },
    "google/gemini-2.5-flash-lite": { in: 0.05 / 1e6, out: 0.2 / 1e6 },
    "openai/gpt-5.5": { in: 3 / 1e6, out: 15 / 1e6 },
  };
  const r = rates[model] ?? { in: 1 / 1e6, out: 3 / 1e6 };
  return Number((tokensIn * r.in + tokensOut * r.out).toFixed(6));
}

function computeWeekOf(weekStart: string): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = weekStart === "sunday" ? -day : (day === 0 ? -6 : 1 - day);
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function processOrganization(
  admin: ReturnType<typeof createClient>,
  orgId: string,
  lovableKey: string,
  opts: { testMode?: boolean; configSource?: "draft" | "published"; force?: boolean } = {},
) {
  const testMode = !!opts.testMode;
  const configSource: "draft" | "published" = opts.configSource === "draft" ? "draft" : "published";
  const cfg = await loadConfigBySource(admin, configSource);
  const tone = cfg?.tone_config ?? {};
  const modelPrimary = cfg?.model_config?.primary_model ?? "google/gemini-2.5-pro";
  const modelFallback = cfg?.model_config?.fallback_model ?? "google/gemini-2.5-flash";
  const temperature = Number(cfg?.model_config?.temperature ?? 0.4);
  const maxTokens = Number(cfg?.model_config?.max_tokens ?? 6000);
  const systemPrompt = cfg ? buildSystemPrompt(cfg) : FALLBACK_SYSTEM_PROMPT;
  const weekOfStr = computeWeekOf(String(tone?.period?.week_start ?? "monday"));

  if (!testMode && !opts.force) {
    const { data: existing } = await admin
      .from("weekly_ai_insights")
      .select("id")
      .eq("organization_id", orgId)
      .eq("week_of", weekOfStr)
      .limit(1);
    if (existing && existing.length > 0) {
      return { skipped: true, reason: "already_generated_this_week", week_of: weekOfStr, inserted: 0 };
    }
  }

  const { data: ctx, error: ctxErr } = await admin.rpc("get_weekly_ai_context" as any, {
    _organization_id: orgId,
  });
  if (ctxErr) throw new Error(ctxErr.message);

  const started = Date.now();
  async function callModel(model: string) {
    return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model, temperature, max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content:
            `Contexto agregado da organização (semana em análise: ${weekOfStr}). Gere o Insight Semanal em JSON válido conforme o schema.\n\n` +
            JSON.stringify(ctx ?? {}, null, 2),
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
  }

  let usedModel = modelPrimary;
  let aiRes = await callModel(modelPrimary);
  if (!aiRes.ok && modelFallback && modelFallback !== modelPrimary && aiRes.status >= 500) {
    usedModel = modelFallback;
    aiRes = await callModel(modelFallback);
  }
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
  try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; }
  catch { throw new Error("invalid_ai_response"); }
  if (!parsed || typeof parsed !== "object" || typeof parsed.title !== "string") {
    throw new Error("invalid_ai_response");
  }

  const tokensIn = Number(aiJson?.usage?.prompt_tokens ?? 0);
  const tokensOut = Number(aiJson?.usage?.completion_tokens ?? 0);
  const metrics = {
    model: usedModel,
    elapsed_ms: Date.now() - started,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    tokens_total: tokensIn + tokensOut,
    estimated_cost_usd: estimateCost(usedModel, tokensIn, tokensOut),
    config_source: configSource,
    config_version: cfg?.version ?? null,
    config_status: cfg?.status ?? "fallback",
    week_of: weekOfStr,
  };

  if (testMode) return { test: true, report: parsed, metrics, inserted: 0 };

  const sev = String(parsed.attention_signals?.[0]?.severity ?? "atencao");
  const legacySeverity = sev === "critico" ? "critical" : sev === "alto" ? "high" : sev === "observacao" ? "low" : "medium";
  const row = {
    organization_id: orgId,
    week_of: weekOfStr,
    title: String(parsed.title ?? "Insight semanal"),
    summary: String(parsed.executive_summary ?? ""),
    insight_type: "weekly_executive",
    severity: legacySeverity,
    confidence: Number.isFinite(Number(parsed.confidence)) ? Number(parsed.confidence) / 100 : null,
    evidence: { rich: parsed, metrics },
    recommended_actions: Array.isArray(parsed.priority_actions) ? parsed.priority_actions.map((a: any) => a?.title).filter(Boolean) : [],
    version: cfg?.version ?? 1,
  };
  const { error: insErr, data } = await admin
    .from("weekly_ai_insights").insert(row).select("id").single();
  if (insErr) throw new Error(insErr.message);
  return { inserted: 1, id: data?.id, week_of: weekOfStr, metrics, report: parsed };
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
    const testMode = body?.test_mode === true;
    const configSource: "draft" | "published" = body?.config_source === "draft" ? "draft" : "published";
    const force = body?.force === true;

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
      const orgId = (body?.organization_id as string | undefined) ?? (profile as any)?.organization_id;
      if (!orgId) return json({ error: "no organization" }, 400);

      const { data: roles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      const roleSet = new Set((roles ?? []).map((r: any) => r.role));
      if (testMode) {
        if (!roleSet.has("platform_admin")) return json({ error: "forbidden" }, 403);
      } else if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
        return json({ error: "forbidden" }, 403);
      }

      try {
        const result = await processOrganization(admin, orgId as string, lovableKey, { testMode, configSource, force });
        return json({ ok: true, ...result });
      } catch (e: any) {
        if (e?.status === 429) return json({ error: "rate_limited" }, 429);
        if (e?.status === 402) return json({ error: "credits_exhausted" }, 402);
        return json({ error: e?.message ?? "error" }, 500);
      }
    }

    // Scheduled run_all (cron): itera empresas ativas
    const { data: orgs, error: orgsErr } = await admin
      .from("organizations")
      .select("id");
    if (orgsErr) return json({ error: orgsErr.message }, 500);

    const results: Array<{ organization_id: string; ok: boolean; error?: string; inserted?: number; skipped?: boolean }> = [];
    for (const o of orgs ?? []) {
      try {
        const r = await processOrganization(admin, (o as any).id as string, lovableKey, { testMode: false, configSource, force });
        results.push({ organization_id: (o as any).id, ok: true, inserted: r.inserted, skipped: (r as any).skipped });
      } catch (e: any) {
        results.push({ organization_id: (o as any).id, ok: false, error: e?.message ?? "error" });
      }
    }
    return json({ ok: true, results });
  } catch (e) {
    console.error("generate-weekly-insights error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
