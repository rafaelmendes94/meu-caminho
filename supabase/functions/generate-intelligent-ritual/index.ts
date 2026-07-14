import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const IMMUTABLE_RULES = [
  "Somente dados agregados fornecidos pelo backend.",
  "Respeitar k-anonimato (amostra mínima da organização).",
  "Nunca identificar indivíduos, times minoritários ou denunciantes.",
  "Nunca acessar chats, mensagens, onboarding individual, denúncias ou respostas individuais.",
  "Nunca cruzar dados com outra organização.",
  "Nunca realizar diagnóstico ou recomendação clínica.",
  "Nunca prometer cura, tratamento ou resultado terapêutico.",
  "Nunca inventar números, participantes ou tendências.",
  "Nunca sugerir demissão, exposição ou constrangimento individual.",
  "Facilitador é sempre um papel, nunca uma pessoa nomeada.",
];

const ALLOWED_SOURCES = new Set([
  "dna","weekly_insight","executive_ai","alert","predictive_signal",
  "impact_engine","organizational_score","pulse","checkin","capacity","trend",
  "participation","ritual_history","manual","scenario",
]);

const PRICES: Record<string, { in: number; out: number }> = {
  "google/gemini-2.5-pro": { in: 1.25e-6, out: 5.00e-6 },
  "google/gemini-2.5-flash": { in: 3.00e-7, out: 2.50e-6 },
  "google/gemini-2.5-flash-lite": { in: 1.00e-7, out: 4.00e-7 },
};
function estimateCost(model: string, tIn: number, tOut: number): number {
  const r = PRICES[model] ?? { in: 5e-7, out: 1.5e-6 };
  return Number((tIn * r.in + tOut * r.out).toFixed(6));
}

async function loadConfig(admin: any) {
  const { data } = await admin.from("ai_prompt_configs").select("*").eq("key", "intelligent_ritual").maybeSingle();
  if (!data) throw new Error("intelligent_ritual config not found");
  return data;
}

function activeTypeKeys(cfg: any): string[] {
  const list = Array.isArray(cfg?.model_config?.ritual_types) ? cfg.model_config.ritual_types : [];
  return list.filter((t: any) => t?.active !== false).map((t: any) => String(t.key));
}

function buildSystemPrompt(cfg: any): string {
  const t = cfg.tone_config ?? {};
  const structure = (cfg.output_structure ?? []).filter((b: any) => b.active).sort((a: any, b: any) => a.order - b.order);
  const guardrails = Array.from(new Set([...(cfg.guardrails ?? []), ...IMMUTABLE_RULES]));
  const types = activeTypeKeys(cfg);
  const stepsCfg = t.steps ?? {};
  const qCfg = t.questions ?? {};
  const variations = t.variations ?? {};

  return [
    cfg.system_instructions ?? "",
    "",
    "REGRAS INVIOLÁVEIS DE SEGURANÇA (bloqueadas):",
    ...guardrails.map((g: string) => `- ${g}`),
    "",
    `Tom: ${t.tone ?? "pratico"} · Detalhe: ${t.detail ?? "detalhado"}.`,
    `Duração entre ${t.min_duration_minutes ?? 10} e ${t.max_duration_minutes ?? 60} minutos.`,
    `Passo a passo: entre ${stepsCfg.min ?? 5} e ${stepsCfg.max ?? 10} passos${stepsCfg.require_time_per_step ? " (informar tempo por passo)" : ""}.`,
    `Perguntas de reflexão: entre ${qCfg.min ?? 2} e ${qCfg.max ?? 6}.`,
    `Tipos permitidos (use exatamente uma destas chaves em "type"): ${types.join(", ")}.`,
    t.require_objective ? "- Objetivo é obrigatório." : "",
    t.require_problem ? "- Problema que resolve é obrigatório." : "",
    t.require_audience ? "- Público-alvo (agregado) é obrigatório." : "",
    t.require_facilitator_role ? "- Facilitador é um papel (nunca pessoa)." : "",
    t.require_materials ? "- Listar materiais necessários." : "",
    t.require_success_metric ? "- Definir métrica de sucesso mensurável." : "",
    t.require_impact_measurement ? "- Definir medição de impacto (baseline, janela, indicadores)." : "",
    t.require_questions ? "- Incluir perguntas de reflexão coletiva." : "",
    t.require_closing ? "- Incluir fechamento com compromissos claros." : "",
    `Variações obrigatórias: ${[
      variations.presencial !== false ? "presencial" : null,
      variations.remoto !== false ? "remoto" : null,
      variations.hibrido !== false ? "hibrido" : null,
    ].filter(Boolean).join(", ")}.`,
    t.extra_instructions ? `Instruções adicionais do RH/Admin: ${t.extra_instructions}` : "",
    "",
    "Estrutura ordenada de saída (JSON):",
    ...structure.map((b: any, i: number) => `${i + 1}. ${b.key} — ${b.title}${b.required ? " (obrigatório)" : ""}`),
    "",
    "Retorne EXCLUSIVAMENTE JSON válido no formato:",
    `{
  "title":"", "description":"", "type":"",
  "objective":"", "problem":"", "context":"", "when_to_apply":"",
  "audience":"", "duration":15, "preparation":"",
  "materials":[], "facilitator":"",
  "steps":[{"order":1,"title":"","description":"","minutes":5}],
  "questions":[""],
  "closing":"",
  "variations":{
    "presencial":{"setup":"","adjustments":""},
    "remoto":{"setup":"","adjustments":""},
    "hibrido":{"setup":"","adjustments":""}
  },
  "success_metrics":[],
  "impact_measurement":{"baseline_metrics":[],"comparison_window_days":30,"success_rule":""},
  "confidence":0.0, "limitations":[]
}`,
    "Sem prosa, sem markdown, apenas JSON.",
  ].filter(Boolean).join("\n");
}

async function callModel(model: string, key: string, systemPrompt: string, userPrompt: string, cfg: any) {
  const timeoutMs = Math.max(10, Number(cfg?.model_config?.timeout_seconds ?? 90)) * 1000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: Number(cfg?.model_config?.temperature ?? 0.4),
        max_tokens: Number(cfg?.model_config?.max_tokens ?? 6000),
        response_format: { type: "json_object" },
      }),
    });
  } finally { clearTimeout(timer); }
}

function sanitizeRitual(ritual: any, cfg: any, sourceType: string): { ritual: any; warnings: string[] } {
  const warnings: string[] = [];
  const t = cfg.tone_config ?? {};
  const types = new Set(activeTypeKeys(cfg));
  const stepsCfg = t.steps ?? {};
  const qCfg = t.questions ?? {};
  const minD = Number(t.min_duration_minutes ?? 10);
  const maxD = Number(t.max_duration_minutes ?? 60);

  const safe: any = { ...ritual };
  if (!safe.title || typeof safe.title !== "string") { safe.title = "Ritual"; warnings.push("Título ausente — placeholder aplicado."); }
  if (!types.has(safe.type)) { safe.type = types.values().next().value ?? "culture"; warnings.push("Tipo inválido — ajustado para tipo ativo."); }

  const d = Number(safe.duration);
  safe.duration = Number.isFinite(d) ? Math.max(minD, Math.min(maxD, Math.round(d))) : 20;

  if (!Array.isArray(safe.steps)) safe.steps = [];
  safe.steps = safe.steps.slice(0, Number(stepsCfg.max ?? 10)).map((s: any, i: number) => ({
    order: Number(s?.order) || i + 1,
    title: String(s?.title ?? `Passo ${i + 1}`).slice(0, 200),
    description: String(s?.description ?? "").slice(0, 1200),
    minutes: Number.isFinite(Number(s?.minutes)) ? Math.max(1, Math.min(60, Math.round(Number(s.minutes)))) : 3,
  }));
  if (safe.steps.length < Number(stepsCfg.min ?? 5)) warnings.push(`Menos de ${stepsCfg.min ?? 5} passos.`);

  if (!Array.isArray(safe.questions)) safe.questions = [];
  safe.questions = safe.questions.slice(0, Number(qCfg.max ?? 6)).map((q: any) => String(q).slice(0, 300));
  if (safe.questions.length < Number(qCfg.min ?? 2) && t.require_questions) warnings.push("Poucas perguntas de reflexão.");

  if (!Array.isArray(safe.materials)) safe.materials = [];
  safe.materials = safe.materials.slice(0, 12).map((m: any) => String(m).slice(0, 120));

  if (!safe.facilitator || /\b(sr\.|sra\.|dr\.|dra\.)\b/i.test(String(safe.facilitator))) {
    safe.facilitator = "RH ou líder da área";
    warnings.push("Facilitador ajustado para papel — nunca pessoa.");
  } else safe.facilitator = String(safe.facilitator).slice(0, 120);

  const variations = safe.variations && typeof safe.variations === "object" ? safe.variations : {};
  const varsCfg = t.variations ?? {};
  for (const key of ["presencial", "remoto", "hibrido"] as const) {
    if (varsCfg[key] === false) continue;
    const v = variations[key] ?? {};
    variations[key] = {
      setup: String(v?.setup ?? "").slice(0, 800),
      adjustments: String(v?.adjustments ?? "").slice(0, 800),
    };
    if (!variations[key].setup) warnings.push(`Variação ${key} sem setup — placeholder aplicado.`);
  }
  safe.variations = variations;

  if (!Array.isArray(safe.success_metrics)) safe.success_metrics = [];
  safe.success_metrics = safe.success_metrics.slice(0, 6).map((m: any) => typeof m === "string" ? m : m);

  if (!safe.impact_measurement || typeof safe.impact_measurement !== "object") {
    safe.impact_measurement = { baseline_metrics: [], comparison_window_days: 30, success_rule: "" };
    warnings.push("Medição de impacto ausente — placeholder aplicado.");
  }

  const conf = Number(safe.confidence);
  if (!Number.isFinite(conf) || conf < 0 || conf > 1) safe.confidence = 0.5;
  if (!Array.isArray(safe.limitations)) safe.limitations = [];

  safe.source_type = sourceType;
  return { ritual: safe, warnings };
}

// Cenários pré-definidos para modo teste
const SCENARIOS: Record<string, any> = {
  low_communication: { label: "Queda de comunicação", signals: { communication_score: 42, trend: "-18% em 3 semanas", pulse_open_rate: "declining" } },
  low_energy: { label: "Energia baixa", signals: { energy_score: 38, checkins_mood_avg: 2.3, overtime_hours_avg: "high" } },
  high_overload: { label: "Alta sobrecarga", signals: { capacity_pulse: "red", overtime_hours_avg: 12, wellbeing_trend: "-22%" } },
  low_engagement: { label: "Baixo engajamento", signals: { engagement_score: 41, participation_rate: 0.42, ritual_completion: "declining" } },
  good_recovery: { label: "Boa recuperação", signals: { recovery_score: 78, energy_trend: "+9%", mood_trend: "+12%" } },
  high_participation: { label: "Alta participação", signals: { participation_rate: 0.88, ritual_completion: 0.9, engagement_trend: "+7%" } },
  low_score: { label: "Score organizacional baixo", signals: { organizational_score: 44, dimensions: { leadership: 38, psychological_safety: 40, communication: 46 } } },
  high_score: { label: "Score organizacional alto", signals: { organizational_score: 82, dimensions: { engagement: 84, communication: 80, culture: 86 } } },
};

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

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const userId = userData.user.id;
    const body = await req.json().catch(() => ({}));

    const sourceType = String(body?.source_type ?? "manual");
    const sourceId: string | null = body?.source_id ?? null;
    const scenarioKey: string | null = body?.scenario ?? null;
    const extraPrompt = String(body?.prompt ?? "").slice(0, 2000);
    const testMode = body?.test_mode === true;
    const ritualTypeReq: string | null = body?.ritual_type ?? null;
    if (!ALLOWED_SOURCES.has(sourceType)) return json({ error: "invalid_source_type" }, 400);

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r: any) => r.role));
    const isPlatformAdmin = roleSet.has("platform_admin");
    if (testMode && !isPlatformAdmin) return json({ error: "forbidden" }, 403);

    const { data: profile } = await admin.from("profiles").select("organization_id").eq("id", userId).maybeSingle();
    const orgId = (testMode && isPlatformAdmin && body?.organization_id) ? String(body.organization_id) : (profile as any)?.organization_id;
    if (!orgId) return json({ error: "no_organization" }, 400);
    if (!testMode && !roleSet.has("owner") && !roleSet.has("rh_admin")) return json({ error: "forbidden" }, 403);

    const context: Record<string, unknown> = { source_type: sourceType, organization_id: orgId };
    if (sourceType === "scenario" && scenarioKey && SCENARIOS[scenarioKey]) {
      context.scenario = SCENARIOS[scenarioKey];
    } else if (sourceType === "dna") {
      const q = admin.from("organizational_dna_reports")
        .select("id, generated_at, overall_score, summary, strengths, opportunities, recommendations, dimensions")
        .eq("organization_id", orgId);
      const { data } = sourceId ? await q.eq("id", sourceId).maybeSingle() : await q.order("generated_at", { ascending: false }).limit(1).maybeSingle();
      context.dna_report = data ?? null;
    } else if (sourceType === "weekly_insight") {
      const q = admin.from("weekly_ai_insights").select("*").eq("organization_id", orgId);
      const { data } = sourceId ? await q.eq("id", sourceId).maybeSingle() : await q.order("created_at", { ascending: false }).limit(1).maybeSingle();
      context.weekly_insight = data ?? null;
    } else if (sourceType === "predictive_signal" && sourceId) {
      const { data } = await admin.from("predictive_signals")
        .select("id, signal_type, severity, confidence, title, narrative, evidence, detected_at")
        .eq("organization_id", orgId).eq("id", sourceId).maybeSingle();
      context.predictive_signal = data ?? null;
    } else if (sourceType === "alert" && sourceId) {
      const { data } = await admin.from("alerts")
        .select("id, alert_type, severity, title, message, evidence, created_at")
        .eq("organization_id", orgId).eq("id", sourceId).maybeSingle();
      context.alert = data ?? null;
    } else if (sourceType === "executive_ai" && sourceId) {
      const { data } = await admin.from("executive_ai_messages")
        .select("id, role, content, context_snapshot, created_at").eq("id", sourceId).maybeSingle();
      context.executive_message = data ?? null;
    } else if (sourceType === "organizational_score") {
      const { data } = await admin.from("organizational_scores").select("*")
        .eq("organization_id", orgId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
      context.organizational_score = data ?? null;
    } else if (sourceType === "ritual_history") {
      const { data } = await admin.from("intelligent_rituals")
        .select("id, title, ritual_type, status, created_at")
        .eq("organization_id", orgId).order("created_at", { ascending: false }).limit(20);
      context.ritual_history = data ?? [];
    }

    try {
      const { data: dashboard } = await userClient.rpc("get_rh_dashboard_summary", { _organization_id: orgId });
      context.rh_dashboard = dashboard ?? null;
    } catch { /* opcional */ }

    const cfg = await loadConfig(admin);
    const { resolveOrgAiSettings } = await import("../_shared/org_ai_settings.ts");
    const orgAi = await resolveOrgAiSettings(admin, orgId);
    if (orgAi.participates === false || orgAi.allow_rituals === false) {
      return json({ error: "ai_disabled_for_organization" }, 403);
    }
    if (orgAi.model) cfg.model_config = { ...(cfg.model_config ?? {}), primary_model: orgAi.model };
    if (orgAi.temperature != null) cfg.model_config = { ...(cfg.model_config ?? {}), temperature: orgAi.temperature };
    const systemPrompt = buildSystemPrompt(cfg);
    const { fetchKnowledgeContext } = await import("../_shared/knowledge_rag.ts");
    const rag = await fetchKnowledgeContext({
      query: `ritual inteligente ${ritualTypeReq ?? ""} ${extraPrompt ?? ""}`.slice(0, 500),
      organizationId: orgId,
      aiModule: "generate-intelligent-ritual",
    });
    const userPrompt = [
      rag.contextBlock || "",
      `Contexto organizacional agregado (k-anonimato aplicado):`,
      JSON.stringify(context, null, 2),
      ritualTypeReq ? `\nTipo de ritual desejado: ${ritualTypeReq}` : "",
      extraPrompt ? `\nOrientação adicional:\n${extraPrompt}` : "",
    ].filter(Boolean).join("\n");

    const startedAt = Date.now();
    const primary = String(cfg.model_config?.primary_model ?? "google/gemini-2.5-pro");
    const fallback = String(cfg.model_config?.fallback_model ?? "google/gemini-2.5-flash");
    let usedModel = primary;
    let aiRes = await callModel(primary, lovableKey, systemPrompt, userPrompt, cfg);
    let fallbackUsed = false;
    if (!aiRes.ok && (aiRes.status >= 500 || aiRes.status === 429)) {
      const errText = await aiRes.text();
      console.warn("primary_failed", aiRes.status, errText.slice(0, 200));
      aiRes = await callModel(fallback, lovableKey, systemPrompt, userPrompt, cfg);
      usedModel = fallback;
      fallbackUsed = true;
    }
    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "ai_gateway_error", details: errText }, aiRes.status);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "";
    let parsed: any = null;
    try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { /* handled */ }
    if (!parsed || typeof parsed !== "object") return json({ error: "invalid_ai_response", raw }, 502);

    const { ritual, warnings } = sanitizeRitual(parsed, cfg, sourceType);
    const tokensIn = Number(aiJson?.usage?.prompt_tokens ?? 0);
    const tokensOut = Number(aiJson?.usage?.completion_tokens ?? 0);
    const metrics = {
      model: usedModel, fallback_used: fallbackUsed,
      latency_ms: Date.now() - startedAt,
      tokens_in: tokensIn, tokens_out: tokensOut, tokens_total: tokensIn + tokensOut,
      estimated_cost_usd: estimateCost(usedModel, tokensIn, tokensOut),
      config_version: cfg.version,
    };

    if (testMode) return json({ ok: true, test: true, ritual, warnings, metrics });

    // Persistência (modo produção)
    const { data: created, error: insErr } = await admin.from("intelligent_rituals").insert({
      organization_id: orgId,
      title: String(ritual.title).slice(0, 200),
      description: (ritual.description ?? ritual.objective ?? "").slice(0, 4000),
      ritual_type: ritual.type,
      source_type: sourceType, source_id: sourceId,
      status: "draft",
      duration_minutes: ritual.duration,
      instructions: ritual.steps,
      expected_outcome: (ritual.success_metrics && ritual.success_metrics[0]) ? String(ritual.success_metrics[0]).slice(0, 2000) : (ritual.objective ?? null),
      created_by: userId,
      generated_by_ai: true,
    }).select("id").single();
    if (insErr || !created) return json({ error: insErr?.message ?? "insert_failed" }, 500);

    return json({ ok: true, ritual_id: created.id, ritual, warnings, metrics });
  } catch (e) {
    console.error("generate-intelligent-ritual error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
