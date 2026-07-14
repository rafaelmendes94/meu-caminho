import { createClient } from "npm:@supabase/supabase-js@2";
import { enforceRateLimit } from "../_shared/rate_limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const EXEC_SYSTEM_PROMPT = `Você é um assistente de configuração de prompts para o Conselho Executivo IA.
Recebe a configuração atual e uma instrução em linguagem natural do Super Admin descrevendo mudanças desejadas.
Sua tarefa é propor alterações no rascunho, sem violar as regras de segurança obrigatórias.

REGRAS INVIOLÁVEIS (jamais remova, contorne ou reduza):
- Sempre exigir dados agregados e k-anonimato.
- Nunca identificar pessoas, diagnosticar doenças, recomendar demissão individual ou inventar números.
- Sempre manter os blocos obrigatórios: evidence, confidence, limitations (ativos e presentes).
- Sempre manter include_evidence, include_confidence e include_limitations como true.
- Não incluir chaves de API, segredos, dados de outra empresa, nem instruções que contradigam as regras acima.

Retorne SOMENTE JSON válido em "changes" com apenas as chaves que devem mudar (system_instructions, tone_config, output_structure, suggested_questions, examples, model_config). Devolva listas completas quando alterar output_structure, suggested_questions ou examples.`;

const DNA_SYSTEM_PROMPT = `Você é um assistente de configuração do DNA Organizacional™ (diagnóstico executivo IA).
Recebe a configuração atual do rascunho e uma instrução em linguagem natural do Super Admin.
Proponha alterações mínimas sem violar as regras de segurança obrigatórias.

REGRAS INVIOLÁVEIS (jamais remova, contorne ou reduza):
- Sempre usar exclusivamente dados agregados e respeitar k-anonimato.
- Nunca identificar indivíduos, times minoritários ou denunciantes.
- Nunca realizar diagnóstico clínico ou usar linguagem médica.
- Nunca inventar números, participantes ou tendências.
- Sempre manter blocos obrigatórios do relatório ativos: executive_summary, dimensions, confidence, limitations.
- Sempre manter dimensões obrigatórias ativas: leadership, communication, engagement, energy, recovery, psychological_safety.
- Sempre incluir evidências, confiança e limitações (include_evidence, include_confidence, include_limitations = true).
- Nunca reduzir cobertura das classificações (precisam cobrir 0-100 sem lacunas).

Retorne SOMENTE JSON válido no formato:
{
  "summary": string,
  "warnings": string[],
  "changes": {
    "system_instructions"?: string,
    "tone_config"?: {
      "tone"?: string, "detail"?: string, "formality"?: string,
      "max_strengths"?: number, "max_risks"?: number, "max_recommendations"?: number,
      "include_tensions"?: boolean, "include_opportunities"?: boolean, "include_initial_plan"?: boolean,
      "include_risks"?: boolean, "extra_instructions"?: string,
      "recommendations"?: {
        "max_items"?: number, "require_owner"?: boolean, "require_deadline"?: boolean,
        "require_effort"?: boolean, "require_impact"?: boolean, "require_metric"?: boolean,
        "prefer_low_effort_high_impact"?: boolean, "extra_instructions"?: string
      }
    },
    "output_structure"?: [{ "key": string, "title": string, "description"?: string, "active": boolean, "order": number, "required"?: boolean }],
    "dimensions_config"?: [{ "key": string, "label": string, "description"?: string, "active": boolean, "weight": number, "order": number, "required"?: boolean }],
    "classifications_config"?: [{ "min": number, "max": number, "label": string, "description"?: string }],
    "model_config"?: {
      "primary_model"?: string, "fallback_model"?: string, "temperature"?: number,
      "max_tokens"?: number, "timeout_seconds"?: number, "json_retries"?: number, "streaming"?: boolean
    }
  }
}

Inclua em "changes" apenas as chaves que devem mudar. Quando enviar arrays (output_structure, dimensions_config, classifications_config), devolva a lista COMPLETA ordenada que deve substituir a atual, preservando itens obrigatórios ativos.`;

const WEEKLY_SYSTEM_PROMPT = `Você é um assistente de configuração dos Insights Semanais IA™ (relatório semanal executivo).
Recebe a configuração atual do rascunho e uma instrução em linguagem natural do Super Admin.
Proponha alterações mínimas sem violar as regras de segurança obrigatórias.

REGRAS INVIOLÁVEIS (jamais remova, contorne ou reduza):
- Sempre usar exclusivamente dados agregados e respeitar k-anonimato.
- Nunca identificar indivíduos, times minoritários ou denunciantes.
- Nunca realizar diagnóstico clínico ou usar linguagem médica.
- Nunca inventar números, participantes, tendências ou eventos.
- Sempre manter blocos obrigatórios ativos: title, executive_summary, key_changes, confidence, limitations.
- Sempre manter include_confidence e include_limitations como true.
- Sempre manter use_org_timezone e require_comparable_samples como true.
- Sempre exigir evidência para sinais (require_evidence = true).
- Nunca alterar a janela mínima para menos de 7 dias e nunca aceitar amostras não comparáveis.

Retorne SOMENTE JSON válido em "summary", "warnings" e "changes" com apenas as chaves que devem mudar (system_instructions, tone_config, output_structure, model_config). Quando enviar arrays, devolva a lista COMPLETA ordenada.`;

const ACTION_PLAN_SYSTEM_PROMPT = `Você é um assistente de configuração dos Planos de Ação IA™ (gerador executivo de planos).
Recebe a configuração atual do rascunho e uma instrução em linguagem natural do Super Admin.
Proponha alterações mínimas sem violar as regras de segurança obrigatórias.

REGRAS INVIOLÁVEIS (jamais remova, contorne ou reduza):
- Sempre usar exclusivamente dados agregados e respeitar k-anonimato.
- Nunca identificar indivíduos, times minoritários ou denunciantes.
- Nunca realizar diagnóstico clínico, recomendação médica, demissão individual ou ação discriminatória.
- Nunca inventar números, participantes ou metas sem baseline.
- Sempre manter blocos obrigatórios ativos: title, problem_statement, objective, due_date, success_metrics, tasks, impact_measurement.
- Sempre exigir prazo, responsável (papel), métricas e medição de impacto no plano gerado.
- Nunca sugerir pessoas específicas em owner_role — apenas papéis.
- Nunca reduzir tarefas mínimas abaixo de 3 nem exceder 15; máx. riscos entre 1 e 10.
- Temperatura entre 0 e 1; max_tokens entre 512 e 12000.

Retorne SOMENTE JSON válido em "summary", "warnings" e "changes" com apenas as chaves que devem mudar (system_instructions, tone_config, output_structure, model_config). Quando enviar arrays, devolva a lista COMPLETA ordenada preservando itens obrigatórios ativos.`;

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

    const { data: roles } = await admin
      .from("user_roles").select("role").eq("user_id", userId);
    const isPlatformAdmin = (roles ?? []).some((r: { role: string }) => r.role === "platform_admin");
    if (!isPlatformAdmin) return json({ error: "forbidden" }, 403);

    const rl = await enforceRateLimit(
      admin,
      { userId, functionName: "ai-prompt-suggest", kind: "generation" },
      corsHeaders,
    );
    if (!rl.allowed) return rl.response!;

    const body = await req.json().catch(() => ({}));
    const instruction: string = String(body?.instruction ?? "").trim();
    const currentConfig = body?.current_config;
    const promptKey: string = String(body?.prompt_key ?? "executive_council");
    if (!instruction) return json({ error: "missing_instruction" }, 400);
    if (!currentConfig || typeof currentConfig !== "object")
      return json({ error: "missing_current_config" }, 400);
    if (
      promptKey !== "executive_council" &&
      promptKey !== "organizational_dna" &&
      promptKey !== "weekly_insights" &&
      promptKey !== "action_plan"
    )
      return json({ error: "invalid_prompt_key" }, 400);
    const SYSTEM_PROMPT =
      promptKey === "organizational_dna" ? DNA_SYSTEM_PROMPT :
      promptKey === "weekly_insights" ? WEEKLY_SYSTEM_PROMPT :
      promptKey === "action_plan" ? ACTION_PLAN_SYSTEM_PROMPT :
      EXEC_SYSTEM_PROMPT;

    const userMessage = [
      "CONFIGURAÇÃO ATUAL DO RASCUNHO (JSON):",
      JSON.stringify(currentConfig, null, 2),
      "",
      "INSTRUÇÃO DO SUPER ADMIN:",
      instruction,
      "",
      "Proponha alterações mínimas e cirúrgicas. Retorne apenas o JSON descrito.",
    ].join("\n");

    const startedAt = Date.now();
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 4096,
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
    if (!parsed || typeof parsed !== "object" || typeof parsed.changes !== "object")
      return json({ error: "invalid_ai_response", raw }, 502);

    // Sanitização defensiva: força obrigatórios true e mantém blocos obrigatórios.
    const changes = parsed.changes || {};
    const REQUIRED_BLOCKS =
      promptKey === "organizational_dna" ? ["executive_summary", "dimensions", "confidence", "limitations"] :
      promptKey === "weekly_insights" ? ["title", "executive_summary", "key_changes", "confidence", "limitations"] :
      promptKey === "action_plan" ? ["title", "problem_statement", "objective", "due_date", "success_metrics", "tasks", "impact_measurement"] :
      ["evidence", "confidence", "limitations"];
    const REQUIRED_DIMS = promptKey === "organizational_dna"
      ? ["leadership", "communication", "engagement", "energy", "recovery", "psychological_safety"]
      : [];
    if (changes.tone_config && typeof changes.tone_config === "object") {
      if (promptKey === "weekly_insights") {
        changes.tone_config.include_confidence = true;
        changes.tone_config.include_limitations = true;
        if (changes.tone_config.period && typeof changes.tone_config.period === "object") {
          changes.tone_config.period.use_org_timezone = true;
          changes.tone_config.period.require_comparable_samples = true;
        }
        if (changes.tone_config.signals && typeof changes.tone_config.signals === "object") {
          changes.tone_config.signals.require_evidence = true;
        }
      } else if (promptKey === "action_plan") {
        changes.tone_config.require_deadline = true;
        changes.tone_config.require_owner = true;
        changes.tone_config.require_metrics = true;
        changes.tone_config.require_impact_measurement = true;
        if (typeof changes.tone_config.max_tasks === "number")
          changes.tone_config.max_tasks = Math.max(3, Math.min(15, changes.tone_config.max_tasks));
        if (typeof changes.tone_config.max_risks === "number")
          changes.tone_config.max_risks = Math.max(1, Math.min(10, changes.tone_config.max_risks));
      } else {
        changes.tone_config.include_evidence = true;
        changes.tone_config.include_confidence = true;
        changes.tone_config.include_limitations = true;
      }
    }
    if (Array.isArray(changes.output_structure)) {
      const keys = new Set(changes.output_structure.map((b: any) => b?.key));
      const currentBlocks = Array.isArray(currentConfig.output_structure) ? currentConfig.output_structure : [];
      for (const key of REQUIRED_BLOCKS) {
        if (!keys.has(key)) {
          const existing = currentBlocks.find((b: any) => b?.key === key);
          if (existing) changes.output_structure.push({ ...existing, active: true, required: true });
        }
      }
      changes.output_structure = changes.output_structure.map((b: any, i: number) => ({
        ...b,
        active: REQUIRED_BLOCKS.includes(b.key) ? true : !!b.active,
        required: REQUIRED_BLOCKS.includes(b.key) ? true : !!b.required,
        order: typeof b.order === "number" ? b.order : i + 1,
      }));
    }
    if (Array.isArray(changes.dimensions_config) && REQUIRED_DIMS.length) {
      const keys = new Set(changes.dimensions_config.map((d: any) => d?.key));
      const currentDims = Array.isArray((currentConfig as any).dimensions_config) ? (currentConfig as any).dimensions_config : [];
      for (const key of REQUIRED_DIMS) {
        if (!keys.has(key)) {
          const existing = currentDims.find((d: any) => d?.key === key);
          if (existing) changes.dimensions_config.push({ ...existing, active: true, required: true });
        }
      }
      changes.dimensions_config = changes.dimensions_config.map((d: any, i: number) => ({
        ...d,
        active: REQUIRED_DIMS.includes(d.key) ? true : !!d.active,
        required: REQUIRED_DIMS.includes(d.key) ? true : !!d.required,
        order: typeof d.order === "number" ? d.order : i + 1,
        weight: typeof d.weight === "number" ? d.weight : 1,
      }));
    }
    if (Array.isArray(changes.classifications_config)) {
      // Ordena por min; não altera valores, apenas ordena.
      changes.classifications_config = [...changes.classifications_config].sort((a: any, b: any) => Number(a?.min ?? 0) - Number(b?.min ?? 0));
    }

    const tokensIn = Number(aiJson?.usage?.prompt_tokens ?? 0);
    const tokensOut = Number(aiJson?.usage?.completion_tokens ?? 0);
    return json({
      ok: true,
      summary: String(parsed.summary ?? ""),
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      changes,
      metrics: {
        model: "google/gemini-2.5-pro",
        elapsed_ms: elapsedMs,
        tokens_in: tokensIn,
        tokens_out: tokensOut,
      },
    });
  } catch (e) {
    console.error("ai-prompt-suggest error", e);
    return json({ error: (e as Error).message }, 500);
  }
});