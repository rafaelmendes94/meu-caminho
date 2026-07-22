import { createClient } from "npm:@supabase/supabase-js@2";
import { resolveOrgAiSettings } from "../_shared/org_ai_settings.ts";
import { openAICompatChatFetch, openAICompatEmbeddingFetch } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FALLBACK_SYSTEM_PROMPT = `Você é um consultor executivo especializado em Inteligência Humana Corporativa.
Analise exclusivamente os dados agregados enviados.
Nunca identifique indivíduos.
Nunca realize diagnóstico clínico.
Nunca utilize linguagem médica.
Produza um diagnóstico executivo agregado em pt-BR, seguindo o schema JSON solicitado.
Quando uma dimensão não tiver amostra suficiente, atribua score null e explique em limitations. Nunca invente números.`;

const IMMUTABLE_GUARDRAILS = [
  "Utilizar apenas dados agregados fornecidos pelo backend.",
  "Respeitar k-anonimato (amostra mínima definida pela organização).",
  "Nunca identificar indivíduos, times minoritários ou denunciantes.",
  "Nunca acessar chats, mensagens, onboarding individual ou denúncias.",
  "Nunca realizar diagnóstico clínico ou usar linguagem médica.",
  "Nunca inventar números, participantes ou tendências.",
  "Nunca inferir dimensão com amostra insuficiente — retornar null.",
  "Nunca cruzar dados com outra organização.",
];

// Cache leve (60s) da configuração publicada
let cachedCfg: { at: number; cfg: any } | null = null;
async function loadPublishedConfig(admin: any) {
  if (cachedCfg && Date.now() - cachedCfg.at < 60_000) return cachedCfg.cfg;
  const { data } = await admin
    .from("ai_prompt_configs")
    .select("*")
    .eq("key", "organizational_dna")
    .maybeSingle();
  cachedCfg = { at: Date.now(), cfg: data ?? null };
  return data ?? null;
}
async function loadConfigBySource(admin: any, source: "draft" | "published") {
  if (source === "published") return await loadPublishedConfig(admin);
  const { data } = await admin
    .from("ai_prompt_configs")
    .select("*")
    .eq("key", "organizational_dna")
    .maybeSingle();
  return data ?? null;
}

function buildSystemPrompt(cfg: any): string {
  const tone = cfg?.tone_config ?? {};
  const dims = Array.isArray(cfg?.dimensions_config) ? cfg.dimensions_config.filter((d: any) => d?.active !== false) : [];
  const cls = Array.isArray(cfg?.classifications_config) ? cfg.classifications_config : [];
  const structure = Array.isArray(cfg?.output_structure) ? [...cfg.output_structure].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).filter((b: any) => b.active) : [];
  const base = String(cfg?.system_instructions ?? FALLBACK_SYSTEM_PROMPT);

  const guardrailsBlock = IMMUTABLE_GUARDRAILS.map((g) => `- ${g}`).join("\n");
  const dimsBlock = dims.length
    ? dims.map((d: any) => `- ${d.key} (${d.label}): ${d.description ?? ""}`).join("\n")
    : "- (usar as dimensões padrão: cultura, liderança, comunicação, colaboração, engajamento, energia, recuperação, segurança psicológica)";
  const clsBlock = cls.length
    ? cls.map((c: any) => `- ${c.min}-${c.max}: ${c.label}`).join("\n")
    : "- 85-100 Fortaleza; 70-84 Saudável; 55-69 Atenção; 40-54 Risco; 0-39 Risco elevado";
  const structBlock = structure.map((b: any) => `- ${b.key}: ${b.title}`).join("\n");

  return `${base}

REGRAS IMUTÁVEIS DE SEGURANÇA (obrigatórias, aplicadas pelo backend):
${guardrailsBlock}

DIMENSÕES A AVALIAR:
${dimsBlock}

CLASSIFICAÇÕES:
${clsBlock}

SEÇÕES DO RELATÓRIO (na ordem):
${structBlock}

COMPORTAMENTO:
- Tom: ${tone.tone ?? "executivo"} | Detalhe: ${tone.detail ?? "equilibrado"} | Formalidade: ${tone.formality ?? "alta"}
- Máximo de forças: ${tone.max_strengths ?? 5}
- Máximo de riscos: ${tone.max_risks ?? 5}
- Máximo de recomendações: ${tone.max_recommendations ?? 6}
- Incluir tensões: ${tone.include_tensions !== false}
- Incluir oportunidades: ${tone.include_opportunities !== false}
- Incluir plano inicial: ${tone.include_initial_plan !== false}
- Sempre incluir evidências, nível de confiança e limitações.

${tone.extra_instructions ? `INSTRUÇÕES ADICIONAIS:\n${tone.extra_instructions}\n` : ""}
SAÍDA: retorne EXCLUSIVAMENTE um JSON válido no schema abaixo:
{
  "executive_summary": string,
  "organizational_identity": string,
  "overall_score": number|null,
  "dimensions": [{ "key": string, "label": string, "score": number|null, "classification": string, "trend": string, "evidence": string[], "risks": string[], "opportunities": string[], "confidence": number }],
  "strengths": [{ "dimension": string, "evidence": string, "impact": string, "expansion": string }],
  "tensions": [{ "diverging": string, "explanation": string, "risk": string, "action": string }],
  "risks": [{ "title": string, "level": "baixo"|"moderado"|"alto"|"critico", "evidence": string, "trend": string, "horizon": string, "impact": string, "confidence": number }],
  "opportunities": [{ "title": string, "description": string }],
  "priorities": [{ "code": "P1"|"P2"|"P3", "title": string, "reason": string }],
  "recommendations": [{ "title": string, "description": string, "priority": "P1"|"P2"|"P3", "owner": string, "deadline": string, "effort": "baixo"|"medio"|"alto", "impact": "baixo"|"medio"|"alto", "metrics": string[], "dependencies": string[] }],
  "initial_action_plan": [{ "step": string, "owner": string, "when": string }],
  "confidence": number,
  "confidence_reason": string,
  "limitations": string[],
  "used_sections": string[]
}
Regras de score:
- Se amostra < mínimo permitido para uma dimensão, use score = null e cite em limitations.
- Nunca preencha score com valor arbitrário.`;
}

// Custo estimado (USD) — aproximação para observabilidade
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
    const days = Number(body?.days ?? 90);
    const testMode = body?.test_mode === true;
    const configSource: "draft" | "published" = body?.config_source === "draft" ? "draft" : "published";

    const { data: profile } = await admin
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = (body?.organization_id as string | undefined) ?? profile?.organization_id;
    if (!orgId) return json({ error: "no organization" }, 400);

    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("organization_id", orgId);
    const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
    const { data: globalRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .is("organization_id", null);
    (globalRoles ?? []).forEach((r: { role: string }) => roleSet.add(r.role));

    if (testMode) {
      if (!roleSet.has("platform_admin")) return json({ error: "forbidden" }, 403);
    } else if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
      return json({ error: "forbidden" }, 403);
    }

    // Fetch aggregated context
    const { data: ctx, error: ctxErr } = await userClient.rpc("get_dna_context", {
      _organization_id: orgId,
      _days: days,
    });
    if (ctxErr) return json({ error: ctxErr.message }, 500);

    const periodStart = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
    const periodEnd = new Date().toISOString().slice(0, 10);

    // Carregar configuração publicada / rascunho + fallback
    const cfg = await loadConfigBySource(admin, configSource);
    let modelPrimary = cfg?.model_config?.primary_model ?? "google/gemini-2.5-pro";
    const modelFallback = cfg?.model_config?.fallback_model ?? "google/gemini-2.5-flash";
    let temperature = Number(cfg?.model_config?.temperature ?? 0.4);
    const maxTokens = Number(cfg?.model_config?.max_tokens ?? 6000);
    const systemPrompt = cfg ? buildSystemPrompt(cfg) : FALLBACK_SYSTEM_PROMPT;

    // Overrides por organização
    const orgAi = await resolveOrgAiSettings(admin, orgId);
    if (orgAi.participates === false || orgAi.allow_dna === false) {
      return json({ error: "ai_disabled_for_organization" }, 403);
    }
    if (orgAi.model) modelPrimary = orgAi.model;
    if (orgAi.temperature != null) temperature = orgAi.temperature;

    const { fetchKnowledgeContext } = await import("../_shared/knowledge_rag.ts");
    const rag = await fetchKnowledgeContext({
      query: `DNA organizacional cultura liderança engajamento clima ${orgId}`,
      organizationId: orgId,
      aiModule: "generate-organizational-dna",
    });

    const started = Date.now();
    async function callModel(model: string) {
      return await openAICompatChatFetch({
          model,
          temperature,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: systemPrompt },
            ...(rag.contextBlock ? [{ role: "user" as const, content: rag.contextBlock }] : []),
            {
              role: "user",
              content:
                `Contexto agregado (últimos ${days} dias) da organização. Apenas dados com amostra >= mínimo são exibidos. Gere o DNA Organizacional em JSON válido conforme o schema.\n\n` +
                JSON.stringify(ctx ?? {}, null, 2),
            },
          ],
          response_format: { type: "json_object" },
        });
    }

    // Call Lovable AI Gateway
    let usedModel = modelPrimary;
    let aiRes = await callModel(modelPrimary);
    if (!aiRes.ok && modelFallback && modelFallback !== modelPrimary && aiRes.status >= 500) {
      usedModel = modelFallback;
      aiRes = await callModel(modelFallback);
    }

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "ai_gateway_error", details: errText }, aiRes.status);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "";
    const usage = aiJson?.usage ?? {};
    const tokensIn = Number(usage?.prompt_tokens ?? 0);
    const tokensOut = Number(usage?.completion_tokens ?? 0);
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: "invalid_ai_response", raw }, 502);
    }
    if (!parsed || typeof parsed !== "object") {
      return json({ error: "invalid_ai_response" }, 502);
    }

    const num = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const arr = (v: unknown) => (Array.isArray(v) ? v : []);
    const obj = (v: unknown) =>
      v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

    // Mapear scores das dimensões novas para as colunas legadas (compatibilidade RH)
    const dims = arr((parsed as any).dimensions) as any[];
    const dimScore = (key: string): number | null => {
      const d = dims.find((x) => x?.key === key);
      return d ? num(d.score) : null;
    };

    const p: any = parsed;
    const summaryText = String(p.executive_summary ?? p.summary ?? "").trim();
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
    };

    if (testMode) {
      return json({ ok: true, test: true, report: parsed, metrics });
    }

    const record = {
      organization_id: orgId,
      period_start: periodStart,
      period_end: periodEnd,
      status: "completed",
      overall_score: num(p.overall_score),
      culture_score: dimScore("culture"),
      leadership_score: dimScore("leadership"),
      communication_score: dimScore("communication"),
      collaboration_score: dimScore("collaboration"),
      engagement_score: dimScore("engagement"),
      energy_score: dimScore("energy"),
      recovery_score: dimScore("recovery"),
      psychological_safety_score: dimScore("psychological_safety"),
      summary: summaryText,
      strengths: arr(p.strengths),
      opportunities: arr(p.opportunities),
      recommendations: arr(p.recommendations),
      evidence: { ...obj(p.evidence_raw), rich: parsed, metrics },
      generated_by: usedModel,
      version: cfg?.version ?? 1,
    };

    const { data: inserted, error: insErr } = await admin
      .from("organizational_dna_reports")
      .insert(record)
      .select()
      .single();
    if (insErr) return json({ error: insErr.message }, 500);

    return json({ ok: true, report: inserted, metrics });
  } catch (e) {
    console.error("generate-organizational-dna error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}