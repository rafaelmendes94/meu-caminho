import { createClient } from "npm:@supabase/supabase-js@2";
import { enforceRateLimit } from "../_shared/rate_limit.ts";
import { fetchKnowledgeContext } from "../_shared/knowledge_rag.ts";
import { resolveOrgAiSettings } from "../_shared/org_ai_settings.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FALLBACK_SYSTEM_PROMPT = `Você é o Conselho Executivo IA do Meu Caminho Enterprise.
Sua função é apoiar decisões estratégicas utilizando exclusivamente indicadores organizacionais agregados.
Nunca invente dados.
Nunca faça diagnósticos clínicos.
Nunca identifique pessoas.
Nunca exponha informações individuais.
Quando não houver dados suficientes, responda claramente que não existe base estatística suficiente.
Sempre explique o motivo da conclusão.
Sempre apresente evidências.
Sempre cite limitações.
Nunca responda além do contexto recebido.

Retorne EXCLUSIVAMENTE um JSON válido no formato:
{
  "answer": string,
  "confidence": "low" | "medium" | "high",
  "used_sections": string[],
  "recommendations": string[]
}`;

// Guardrails imutáveis aplicados no backend, independentemente da config em banco.
const IMMUTABLE_GUARDRAILS = [
  "Usar somente dados agregados.",
  "Nunca acessar chats pessoais ou dados de onboarding individual.",
  "Nunca revelar identidade de colaboradores.",
  "Nunca acessar denúncias anônimas.",
  "Respeitar k-anonimato (mínimo do grupo).",
  "Não diagnosticar doenças.",
  "Não recomendar demissão individual.",
  "Não inventar números.",
  "Nunca acessar dados de outra empresa.",
].join("\n- ");

// Cache em memória (por instância) por 60s.
let cachedConfig: { at: number; value: any } | null = null;
const CONFIG_CACHE_TTL_MS = 60_000;

async function loadPublishedConfig(admin: any): Promise<any | null> {
  const now = Date.now();
  if (cachedConfig && now - cachedConfig.at < CONFIG_CACHE_TTL_MS) return cachedConfig.value;
  try {
    const { data } = await admin
      .from("ai_prompt_configs")
      .select("system_instructions, tone_config, output_structure, model_config")
      .eq("key", "executive_council")
      .eq("status", "published")
      .maybeSingle();
    cachedConfig = { at: now, value: data ?? null };
    return data ?? null;
  } catch (_e) {
    return null;
  }
}

// Sem cache — sempre lê a última versão (draft ou published) para o modo de teste.
async function loadConfigForTest(admin: any, source: "draft" | "published"): Promise<any | null> {
  try {
    const { data } = await admin
      .from("ai_prompt_configs")
      .select("system_instructions, tone_config, output_structure, model_config, status, version")
      .eq("key", "executive_council")
      .maybeSingle();
    if (!data) return null;
    // 'draft' testa exatamente o que está salvo (independente do status atual).
    // 'published' só retorna se realmente estiver publicada.
    if (source === "published" && data.status !== "published") return null;
    return data;
  } catch (_e) {
    return null;
  }
}

// Custo estimado (USD por 1M tokens) — apenas indicativo para o painel de testes.
const MODEL_PRICING: Record<string, { in: number; out: number }> = {
  "google/gemini-2.5-pro": { in: 1.25, out: 10 },
  "google/gemini-2.5-flash": { in: 0.3, out: 2.5 },
  "google/gemini-2.5-flash-lite": { in: 0.1, out: 0.4 },
  "openai/gpt-5.5": { in: 5, out: 15 },
};

function estimateCostUsd(model: string, tokensIn: number, tokensOut: number): number {
  const p = MODEL_PRICING[model];
  if (!p) return 0;
  return (tokensIn * p.in + tokensOut * p.out) / 1_000_000;
}

function buildSystemPrompt(cfg: any | null): string {
  if (!cfg || !cfg.system_instructions) return FALLBACK_SYSTEM_PROMPT;
  const tone = cfg.tone_config ?? {};
  const blocks: any[] = Array.isArray(cfg.output_structure) ? cfg.output_structure : [];
  const activeBlocks = blocks.filter((b) => b?.active).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const sectionLines = activeBlocks.map((b) => `- ${b.title}: ${b.description ?? ""}`).join("\n");
  const toneLine = `Tom: ${tone.tone ?? "executivo"}. Nível de detalhe: ${tone.detail ?? "equilibrado"}. Formalidade: ${tone.formality ?? "alta"}. Máximo de ${tone.max_recommendations ?? 5} recomendações.`;
  const extras = String(tone.extra_instructions ?? "").trim();
  return [
    cfg.system_instructions.trim(),
    "",
    "REGRAS OBRIGATÓRIAS DE SEGURANÇA (não podem ser ignoradas):",
    `- ${IMMUTABLE_GUARDRAILS}`,
    "",
    toneLine,
    extras ? `Instruções adicionais: ${extras}` : "",
    "",
    "Estrutura esperada da resposta (siga a ordem):",
    sectionLines,
    "",
    `Retorne EXCLUSIVAMENTE um JSON válido no formato:
{
  "answer": string,
  "confidence": "low" | "medium" | "high",
  "used_sections": string[],
  "recommendations": string[]
}`,
  ].filter(Boolean).join("\n");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

    const rl = await enforceRateLimit(
      admin,
      { userId, functionName: "executive-ai", kind: "chat" },
      corsHeaders,
    );
    if (!rl.allowed) return rl.response!;

    const body = await req.json().catch(() => ({}));
    const question: string = String(body?.question ?? "").trim();
    let conversationId: string | null = body?.conversation_id ?? null;
    const testMode: boolean = body?.test_mode === true;
    const testOrgId: string | null = body?.test_organization_id ?? null;
    const configSource: "draft" | "published" =
      body?.config_source === "draft" ? "draft" : "published";
    if (!question) return json({ error: "missing_question" }, 400);

    // Role lookup
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
    const isPlatformAdmin = roleSet.has("platform_admin");

    // ===== Test mode (somente platform_admin) =====
    if (testMode) {
      if (!isPlatformAdmin) return json({ error: "forbidden" }, 403);
      if (!testOrgId) return json({ error: "missing_test_organization" }, 400);

      const promptCfg = await loadConfigForTest(admin, configSource);
      if (!promptCfg && configSource === "published") {
        return json({ error: "no_published_config" }, 400);
      }
      const systemPrompt = buildSystemPrompt(promptCfg);
      const modelCfg = promptCfg?.model_config ?? {};
      const primaryModel = modelCfg.primary_model || "google/gemini-2.5-pro";
      const temperature = typeof modelCfg.temperature === "number" ? modelCfg.temperature : 0.3;
      const maxTokens = typeof modelCfg.max_tokens === "number" ? modelCfg.max_tokens : 2048;

      const { data: ctx, error: ctxErr } = await userClient.rpc(
        "get_executive_context_admin",
        { _organization_id: testOrgId },
      );
      if (ctxErr) return json({ error: ctxErr.message }, 500);

      const messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            `MODO DE TESTE — Contexto organizacional agregado da empresa em avaliação:\n` +
            JSON.stringify(ctx ?? {}, null, 2),
        },
        { role: "user", content: question },
      ];
      const ragTest = await fetchKnowledgeContext({
        query: question,
        organizationId: testOrgId,
        aiModule: "executive-ai:test",
      });
      if (ragTest.contextBlock) {
        messages.splice(messages.length - 1, 0, { role: "user", content: ragTest.contextBlock });
      }

      const startedAt = Date.now();
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lovableKey}`,
        },
        body: JSON.stringify({
          model: primaryModel,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
        }),
      });
      const elapsedMs = Date.now() - startedAt;

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
        if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
        return json({ error: "ai_gateway_error", details: errText }, aiRes.status);
      }

      const aiJson = await aiRes.json();
      const raw = aiJson?.choices?.[0]?.message?.content ?? "";
      let parsed: any = null;
      try { parsed = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { /* handled below */ }
      if (!parsed || typeof parsed !== "object") {
        return json({ error: "invalid_ai_response", raw }, 502);
      }
      const response = {
        answer: String(parsed.answer ?? ""),
        confidence: ["low", "medium", "high"].includes(parsed.confidence) ? parsed.confidence : "low",
        used_sections: Array.isArray(parsed.used_sections) ? parsed.used_sections : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
      const usage = aiJson?.usage ?? {};
      const tokensIn = Number(usage?.prompt_tokens ?? 0);
      const tokensOut = Number(usage?.completion_tokens ?? 0);
      const metrics = {
        model: primaryModel,
        elapsed_ms: elapsedMs,
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        tokens_total: tokensIn + tokensOut,
        estimated_cost_usd: estimateCostUsd(primaryModel, tokensIn, tokensOut),
        config_source: configSource,
        config_version: promptCfg?.version ?? null,
        config_status: promptCfg?.status ?? null,
      };
      // NÃO persistimos conversas nem mensagens em test_mode.
      return json({ ok: true, test_mode: true, response, metrics });
    }

    // ===== Fluxo normal (owner/rh_admin) =====
    const promptCfg = await loadPublishedConfig(admin);
    const systemPrompt = buildSystemPrompt(promptCfg);
    const modelCfg = promptCfg?.model_config ?? {};
    const primaryModel = modelCfg.primary_model || "google/gemini-2.5-pro";
    const temperature = typeof modelCfg.temperature === "number" ? modelCfg.temperature : 0.3;
    const maxTokens = typeof modelCfg.max_tokens === "number" ? modelCfg.max_tokens : 2048;

    const { data: profile } = await admin
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) return json({ error: "no_organization" }, 400);

    if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
      return json({ error: "forbidden" }, 403);
    }

    // Overrides por organização (organization_settings.ai_settings)
    const orgAi = await resolveOrgAiSettings(admin, orgId);
    if (orgAi.participates === false || orgAi.allow_council === false) {
      return json({ error: "ai_disabled_for_organization" }, 403);
    }
    const effectiveModel = orgAi.model || primaryModel;
    const effectiveTemperature = orgAi.temperature != null ? orgAi.temperature : temperature;

    // Aggregated context via user client (RLS + role check inside function)
    const { data: ctx, error: ctxErr } = await userClient.rpc("get_executive_context", {
      _organization_id: orgId,
    });
    if (ctxErr) return json({ error: ctxErr.message }, 500);

    // Ensure conversation
    if (!conversationId) {
      const { data: conv, error: convErr } = await admin
        .from("executive_ai_conversations")
        .insert({
          organization_id: orgId,
          user_id: userId,
          title: question.slice(0, 80),
        })
        .select("id")
        .single();
      if (convErr) return json({ error: convErr.message }, 500);
      conversationId = conv.id;
    } else {
      // Validate conversation ownership
      const { data: conv } = await admin
        .from("executive_ai_conversations")
        .select("id, organization_id")
        .eq("id", conversationId)
        .maybeSingle();
      if (!conv || conv.organization_id !== orgId) {
        return json({ error: "conversation_not_found" }, 404);
      }
    }

    // Prior history (last 20)
    const { data: history } = await admin
      .from("executive_ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content:
          `Contexto organizacional agregado (apenas amostras >= 5 são numéricas; demais aparecem como null):\n` +
          JSON.stringify(ctx ?? {}, null, 2),
      },
      ...((history ?? []).map((m) => ({ role: m.role, content: m.content }))),
      { role: "user", content: question },
    ];
    const rag = await fetchKnowledgeContext({
      query: question,
      organizationId: orgId,
      aiModule: "executive-ai",
    });
    if (rag.contextBlock) {
      messages.splice(messages.length - 1, 0, { role: "user", content: rag.contextBlock });
    }

    // Persist user message
    await admin.from("executive_ai_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: question,
    });

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages,
        temperature: effectiveTemperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
      if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
      return json({ error: "ai_gateway_error", details: errText }, aiRes.status);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "";
    let parsed: any = null;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: "invalid_ai_response", raw }, 502);
    }
    if (!parsed || typeof parsed !== "object") {
      return json({ error: "invalid_ai_response" }, 502);
    }

    const response = {
      answer: String(parsed.answer ?? ""),
      confidence: ["low", "medium", "high"].includes(parsed.confidence) ? parsed.confidence : "low",
      used_sections: Array.isArray(parsed.used_sections) ? parsed.used_sections : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };

    const usage = aiJson?.usage ?? {};
    await admin.from("executive_ai_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: JSON.stringify(response),
      context_snapshot: { sections: response.used_sections, confidence: response.confidence },
      tokens_in: usage?.prompt_tokens ?? null,
      tokens_out: usage?.completion_tokens ?? null,
    });

    await admin
      .from("executive_ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return json({ ok: true, conversation_id: conversationId, response });
  } catch (e) {
    console.error("executive-ai error", e);
    return json({ error: (e as Error).message }, 500);
  }
});