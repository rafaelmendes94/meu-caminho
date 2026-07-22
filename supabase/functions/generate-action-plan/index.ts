import { createClient } from "npm:@supabase/supabase-js@2";
import { openAICompatChatFetch, openAICompatEmbeddingFetch } from "../_shared/gemini.ts";

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
  "Nunca acessar chats, mensagens, onboarding individual, denúncias.",
  "Nunca cruzar dados com outra organização.",
  "Nunca realizar diagnóstico ou recomendação clínica.",
  "Nunca sugerir demissão individual ou ações discriminatórias.",
  "Nunca inventar números, participantes ou tendências.",
  "Nunca criar meta sem baseline — quando ausente, criar primeiro uma etapa de medição.",
  "Sugerir papéis, nunca pessoas específicas.",
];

const ALLOWED_SOURCES = new Set([
  "dna","predictive_signal","alert","executive_ai","weekly_insight","manual",
]);

const ALLOWED_OWNER_ROLES = [
  "RH","liderança","gestor da área","comunicação interna","diretoria","grupo de trabalho","responsável pelo plano",
];

const PRICES: Record<string, { in: number; out: number }> = {
  "google/gemini-2.5-pro": { in: 1.25e-6, out: 5.00e-6 },
  "google/gemini-2.5-flash": { in: 3.00e-7, out: 2.50e-6 },
  "google/gemini-2.5-flash-lite": { in: 1.00e-7, out: 4.00e-7 },
};
function estimateCost(model: string, tIn: number, tOut: number): number {
  const r = PRICES[model] ?? { in: 5e-7, out: 1.5e-6 };
  return Number((tIn * r.in + tOut * r.out).toFixed(6));
}

async function loadConfig(admin: any, source: "draft" | "published") {
  const { data } = await admin.from("ai_prompt_configs").select("*").eq("key", "action_plan").maybeSingle();
  if (!data) throw new Error("action_plan config not found");
  if (source === "published" && data.status !== "published") {
    // Backend só respeita published em produção; test_mode pode pedir draft explicitamente.
  }
  return data;
}

function buildSystemPrompt(cfg: any): string {
  const t = cfg.tone_config ?? {};
  const structure = (cfg.output_structure ?? []).filter((b: any) => b.active).sort((a: any, b: any) => a.order - b.order);
  const tasksCfg = t.tasks ?? {};
  const metricsCfg = t.metrics ?? {};
  const prio = t.prioritization ?? {};
  const guardrails = Array.from(new Set([...(cfg.guardrails ?? []), ...IMMUTABLE_RULES]));
  const priorityKeys = (prio.priorities ?? []).map((p: any) => p.key).join(", ");
  const effortKeys = (prio.effort ?? []).map((p: any) => p.key).join(", ");
  const impactKeys = (prio.impact ?? []).map((p: any) => p.key).join(", ");

  return [
    cfg.system_instructions ?? "",
    "",
    "REGRAS INVIOLÁVEIS DE SEGURANÇA (bloqueadas):",
    ...guardrails.map((g) => `- ${g}`),
    "",
    `Tom: ${t.tone ?? "executivo"} · Detalhe: ${t.detail ?? "equilibrado"}.`,
    `Máx. tarefas: ${t.max_tasks ?? 8} · Máx. riscos: ${t.max_risks ?? 5}.`,
    `Tarefas: entre ${tasksCfg.min ?? 5} e ${tasksCfg.max ?? 8}. Granularidade: ${tasksCfg.granularity ?? "operacional"}.`,
    tasksCfg.require_owner ? "- Toda tarefa precisa de owner_role (papel)." : "",
    tasksCfg.require_relative_deadline ? "- Toda tarefa precisa de due_offset_days (>=1)." : "",
    tasksCfg.require_completion_criteria ? "- Toda tarefa precisa de completion_criteria." : "",
    `Prioridades permitidas: ${priorityKeys}. Esforço: ${effortKeys}. Impacto: ${impactKeys}.`,
    metricsCfg.require_baseline ? "- Exigir baseline. Se ausente, criar primeiro uma etapa de medição." : "",
    metricsCfg.require_indicator ? "- Exigir indicador para o resultado esperado." : "",
    metricsCfg.require_direction ? "- Explicitar direção esperada (aumentar/reduzir/manter)." : "",
    metricsCfg.require_comparison_window ? `- Janela padrão de comparação: ${metricsCfg.default_impact_window_days ?? 30} dias.` : "",
    `Confiança mínima aceitável: ${metricsCfg.min_confidence ?? 0.55}. Se abaixo, marcar limitations claras.`,
    t.prefer_low_effort_high_impact ? "- Prefira ações de baixo esforço e alto impacto quando possível." : "",
    t.extra_instructions ? `Instruções adicionais do RH/Admin: ${t.extra_instructions}` : "",
    "",
    `Papéis permitidos em owner_role: ${ALLOWED_OWNER_ROLES.join(", ")}. Nunca use nomes de pessoas.`,
    "",
    "Estrutura ordenada de saída (JSON):",
    ...structure.map((b: any, i: number) => `${i + 1}. ${b.key} — ${b.title}${b.required ? " (obrigatório)" : ""}`),
    "",
    "Retorne EXCLUSIVAMENTE JSON válido no formato:",
    `{
  "title": "", "description": "",
  "source_type": "", "source_id": "",
  "problem_statement": "", "objective": "", "expected_result": "",
  "target_audience": "", "priority": "P1|P2|P3",
  "owner_role": "", "start_date": "", "due_date": "",
  "success_metrics": [], 
  "tasks": [{ "title":"", "description":"", "owner_role":"", "priority":"P1|P2|P3",
              "effort":"low|medium|high", "impact":"low|medium|high",
              "due_offset_days": 0, "dependencies": [], "completion_criteria": "" }],
  "execution_risks": [{ "description":"", "probability":"low|medium|high",
                        "impact":"low|medium|high", "prevention":"", "contingency":"" }],
  "dependencies": [],
  "follow_up_cadence": "weekly|biweekly|monthly",
  "completion_criteria": "",
  "impact_measurement": { "baseline_metrics": [], "comparison_window_days": 30, "success_rule": "" },
  "confidence": 0.0, "confidence_reason": "", "limitations": []
}`,
    "Sem prosa, sem markdown, apenas JSON.",
  ].filter(Boolean).join("\n");
}

async function callModel(model: string, key: string, systemPrompt: string, userPrompt: string, cfg: any) {
  const timeoutMs = Math.max(10, Number(cfg?.model_config?.timeout_seconds ?? 90)) * 1000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await openAICompatChatFetch({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: Number(cfg?.model_config?.temperature ?? 0.35),
        max_tokens: Number(cfg?.model_config?.max_tokens ?? 6000),
        response_format: { type: "json_object" },
      });
    return res;
  } finally { clearTimeout(timer); }
}

function sanitizePlan(plan: any, cfg: any, sourceType: string, sourceId: string | null): { plan: any; warnings: string[] } {
  const warnings: string[] = [];
  const t = cfg.tone_config ?? {};
  const tasksCfg = t.tasks ?? {};
  const prio = t.prioritization ?? {};
  const priKeys = new Set((prio.priorities ?? []).map((p: any) => p.key));
  const effKeys = new Set((prio.effort ?? []).map((p: any) => p.key));
  const impKeys = new Set((prio.impact ?? []).map((p: any) => p.key));
  const maxTasks = Number(t.max_tasks ?? 8);
  const minTasks = Number(tasksCfg.min ?? 3);
  const maxRisks = Number(t.max_risks ?? 5);

  const safe: any = { ...plan };
  safe.source_type = sourceType;
  safe.source_id = sourceId;
  if (!safe.title || typeof safe.title !== "string") { safe.title = "Plano de Ação"; warnings.push("Título ausente — placeholder aplicado."); }
  if (!priKeys.has(safe.priority)) safe.priority = "P2";
  if (!Array.isArray(safe.tasks)) safe.tasks = [];
  safe.tasks = safe.tasks.slice(0, maxTasks).map((task: any, i: number) => {
    const days = Number(task?.due_offset_days);
    return {
      title: String(task?.title ?? `Tarefa ${i + 1}`).slice(0, 200),
      description: task?.description ? String(task.description).slice(0, 2000) : "",
      owner_role: ALLOWED_OWNER_ROLES.includes(String(task?.owner_role)) ? String(task.owner_role) : (tasksCfg.require_owner ? "responsável pelo plano" : ""),
      priority: priKeys.has(task?.priority) ? task.priority : "P2",
      effort: effKeys.has(task?.effort) ? task.effort : "medium",
      impact: impKeys.has(task?.impact) ? task.impact : "medium",
      due_offset_days: Number.isFinite(days) ? Math.max(1, Math.min(180, Math.round(days))) : 7,
      dependencies: Array.isArray(task?.dependencies) ? task.dependencies.slice(0, 8).map(String) : [],
      completion_criteria: task?.completion_criteria ? String(task.completion_criteria).slice(0, 500) : "",
    };
  });
  if (safe.tasks.length < minTasks) warnings.push(`Menos de ${minTasks} tarefas — considere refinar contexto.`);
  if (!Array.isArray(safe.execution_risks)) safe.execution_risks = [];
  safe.execution_risks = safe.execution_risks.slice(0, maxRisks);
  if (!safe.impact_measurement || typeof safe.impact_measurement !== "object") {
    safe.impact_measurement = { baseline_metrics: [], comparison_window_days: Number(t?.metrics?.default_impact_window_days ?? 30), success_rule: "" };
    warnings.push("Medição de impacto ausente — placeholder aplicado.");
  }
  const conf = Number(safe.confidence);
  if (!Number.isFinite(conf) || conf < 0 || conf > 1) safe.confidence = 0.5;
  if (!Array.isArray(safe.success_metrics)) safe.success_metrics = [];
  if (!Array.isArray(safe.limitations)) safe.limitations = [];
  if (t?.metrics?.require_baseline && (safe.impact_measurement.baseline_metrics ?? []).length === 0) {
    warnings.push("Baseline ausente — plano deve iniciar por etapa de medição.");
  }
  return { plan: safe, warnings };
}

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
    const extraPrompt = String(body?.prompt ?? "").slice(0, 2000);
    const testMode = body?.test_mode === true;
    const configSource: "draft" | "published" = body?.config_source === "draft" ? "draft" : "published";
    if (!ALLOWED_SOURCES.has(sourceType)) return json({ error: "invalid_source_type" }, 400);

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r: any) => r.role));
    const isPlatformAdmin = roleSet.has("platform_admin");
    if (testMode && !isPlatformAdmin) return json({ error: "forbidden" }, 403);

    const { data: profile } = await admin.from("profiles").select("organization_id").eq("id", userId).maybeSingle();
    const orgId = (testMode && isPlatformAdmin && body?.organization_id) ? String(body.organization_id) : (profile as any)?.organization_id;
    if (!orgId) return json({ error: "no_organization" }, 400);
    if (!testMode && !roleSet.has("owner") && !roleSet.has("rh_admin")) return json({ error: "forbidden" }, 403);

    // Contexto agregado por fonte
    const context: Record<string, unknown> = { source_type: sourceType, organization_id: orgId };
    if (sourceType === "dna") {
      const q = admin.from("organizational_dna_reports")
        .select("id, generated_at, overall_score, summary, strengths, opportunities, recommendations, dimensions")
        .eq("organization_id", orgId);
      const { data } = sourceId ? await q.eq("id", sourceId).maybeSingle() : await q.order("generated_at", { ascending: false }).limit(1).maybeSingle();
      context.dna_report = data ?? null;
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
    } else if (sourceType === "weekly_insight") {
      const q = admin.from("weekly_ai_insights").select("*").eq("organization_id", orgId);
      const { data } = sourceId ? await q.eq("id", sourceId).maybeSingle() : await q.order("created_at", { ascending: false }).limit(1).maybeSingle();
      context.weekly_insight = data ?? null;
    }

    try {
      const { data: dashboard } = await userClient.rpc("get_rh_dashboard_summary", { _organization_id: orgId });
      context.rh_dashboard = dashboard ?? null;
    } catch { /* opcional */ }

    const cfg = await loadConfig(admin, configSource);
    // Overrides por organização
    const { resolveOrgAiSettings } = await import("../_shared/org_ai_settings.ts");
    const orgAi = await resolveOrgAiSettings(admin, orgId);
    if (orgAi.participates === false || orgAi.allow_plans === false) {
      return json({ error: "ai_disabled_for_organization" }, 403);
    }
    if (orgAi.model) cfg.model_config = { ...(cfg.model_config ?? {}), primary_model: orgAi.model };
    if (orgAi.temperature != null) cfg.model_config = { ...(cfg.model_config ?? {}), temperature: orgAi.temperature };
    const systemPrompt = buildSystemPrompt(cfg);
    const { fetchKnowledgeContext } = await import("../_shared/knowledge_rag.ts");
    const rag = await fetchKnowledgeContext({
      query: `plano de ação ${sourceType} ${extraPrompt ?? ""}`.slice(0, 500),
      organizationId: orgId,
      aiModule: "generate-action-plan",
    });
    const userPrompt = `${rag.contextBlock ? rag.contextBlock + "\n\n" : ""}Contexto organizacional agregado (k-anonimato aplicado):\n${JSON.stringify(context, null, 2)}${extraPrompt ? `\n\nOrientação adicional:\n${extraPrompt}` : ""}`;

    const startedAt = Date.now();
    const primary = String(cfg.model_config?.primary_model ?? "google/gemini-2.5-pro");
    const fallback = String(cfg.model_config?.fallback_model ?? "google/gemini-2.5-flash");
    let usedModel = primary;
    let aiRes = await callModel(primary, lovableKey, systemPrompt, userPrompt, cfg).catch((e) => { throw e; });
    let fallbackUsed = false;
    if (!aiRes.ok && (aiRes.status >= 500 || aiRes.status === 429)) {
      const status = aiRes.status;
      const errText = await aiRes.text();
      console.warn("primary_failed", status, errText.slice(0, 200));
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

    const { plan, warnings } = sanitizePlan(parsed, cfg, sourceType, sourceId);
    const tokensIn = Number(aiJson?.usage?.prompt_tokens ?? 0);
    const tokensOut = Number(aiJson?.usage?.completion_tokens ?? 0);
    const metrics = {
      model: usedModel,
      fallback_used: fallbackUsed,
      latency_ms: Date.now() - startedAt,
      tokens_in: tokensIn, tokens_out: tokensOut, tokens_total: tokensIn + tokensOut,
      estimated_cost_usd: estimateCost(usedModel, tokensIn, tokensOut),
      config_version: cfg.version, config_source: configSource,
    };

    if (testMode) return json({ ok: true, test: true, plan, warnings, metrics });

    // Persistência
    const start = plan.start_date ? new Date(plan.start_date) : new Date();
    const due = plan.due_date ? new Date(plan.due_date) : new Date(Date.now() + 30 * 86400_000);
    const { data: created, error: planErr } = await admin.from("action_plans").insert({
      organization_id: orgId,
      title: String(plan.title).slice(0, 200),
      description: (plan.description ?? plan.problem_statement ?? "").slice(0, 4000),
      source_type: sourceType, source_id: sourceId,
      owner_id: null, status: "draft",
      priority: plan.priority === "P1" ? "high" : plan.priority === "P3" ? "low" : "medium",
      due_date: due.toISOString().slice(0, 10),
      created_by: userId,
    }).select("id").single();
    if (planErr || !created) return json({ error: planErr?.message ?? "insert_failed" }, 500);

    const now = start.getTime();
    const taskRows = plan.tasks.map((t: any) => ({
      action_plan_id: created.id,
      title: t.title,
      description: t.description || null,
      status: "todo",
      due_date: new Date(now + t.due_offset_days * 86_400_000).toISOString().slice(0, 10),
    }));
    if (taskRows.length) {
      const { error: tErr } = await admin.from("action_plan_tasks").insert(taskRows);
      if (tErr) console.error("tasks insert error", tErr);
    }

    return json({ ok: true, plan_id: created.id, tasks_count: taskRows.length, plan, warnings, metrics });
  } catch (e) {
    console.error("generate-action-plan error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
