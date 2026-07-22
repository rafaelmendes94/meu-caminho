import { createClient } from "npm:@supabase/supabase-js@2";
import { enforceRateLimit } from "../_shared/rate_limit.ts";
import { openAICompatChatFetch, openAICompatEmbeddingFetch } from "../_shared/gemini.ts";

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

const RITUAL_SYSTEM_PROMPT = `Você é um assistente de configuração dos Rituais Inteligentes IA™ (motor de intervenções organizacionais).
Recebe a configuração atual do rascunho e uma instrução em linguagem natural do Super Admin.
Proponha alterações mínimas sem violar as regras de segurança obrigatórias.

REGRAS INVIOLÁVEIS (jamais remova, contorne ou reduza):
- Sempre usar exclusivamente dados agregados e respeitar k-anonimato.
- Nunca identificar indivíduos, times minoritários ou denunciantes.
- Nunca realizar diagnóstico clínico ou usar linguagem médica.
- Nunca inventar números, participantes ou tendências.
- Facilitador é sempre um papel, nunca uma pessoa nomeada.
- Sempre manter blocos obrigatórios ativos: title, type, objective, problem, audience, duration, materials, facilitator, steps, questions, closing, variations, success_metrics, impact_measurement.
- Sempre exigir objetivo, problema, público, facilitador (papel), materiais, métrica de sucesso, medição de impacto, perguntas de reflexão e fechamento.
- Duração entre 5 e 120 min (min ≤ max); passos entre 3 e 12 (min ≤ max); perguntas entre 1 e 10 (min ≤ max).
- Ao menos 1 tipo de ritual precisa permanecer ativo. Renomeações não retroagem.
- Temperatura entre 0 e 1; max_tokens entre 512 e 12000.

Retorne SOMENTE JSON válido em "summary", "warnings" e "changes" com apenas as chaves que devem mudar (system_instructions, tone_config, output_structure, model_config). Quando enviar arrays (output_structure ou model_config.ritual_types), devolva a lista COMPLETA ordenada preservando itens obrigatórios ativos.`;

const RECOMMENDATION_SYSTEM_PROMPT = `Você é um assistente de configuração do Motor de Recomendação Inteligente™.
Recebe a configuração atual do rascunho e uma instrução em linguagem natural do Super Admin.
Proponha alterações mínimas e cirúrgicas sem violar as regras invioláveis.

REGRAS INVIOLÁVEIS (jamais remova, contorne ou reduza):
- A recomendação diária é feita por ranking rápido (<300ms). A IA apenas ajusta pesos e explicações — nunca a cada acesso.
- Nunca usar dados de outro colaborador, denúncias ou chats privados.
- Nunca recomendar conteúdo arquivado, rascunho ou premium sem licença.
- Nunca repetir conteúdo já concluído dentro da janela configurada.
- Manter as penalidades archived_penalty, draft_penalty e premium_without_license_penalty em 1.0.
- Pesos por dimensão e formato devem ficar entre 0 e 2. Boosts entre 0 e 1. Penalidades multiplicadoras entre 0 e 1 (exceto as bloqueadas em 1.0). repeat_within_days entre 0 e 365.
- top_n entre 5 e 50, min_score entre 0 e 1, novelty_half_life_days entre 1 e 90, time_available_minutes entre 5 e 240.
- diversity.max_per_format e max_per_category devem permanecer ≥ 1. Ao menos 1 categoria e 1 formato precisam ficar ativos.
- Temperatura entre 0 e 1; max_tokens entre 512 e 12000.

Retorne SOMENTE JSON válido em "summary", "warnings" e "changes" com apenas as chaves que devem mudar (system_instructions, tone_config, output_structure, model_config). Quando enviar arrays (output_structure, model_config.categories, model_config.formats), devolva a lista COMPLETA ordenada, preservando ao menos 1 item ativo.`;

const ORCHESTRATOR_SYSTEM_PROMPT = `Você é um assistente de configuração do AI Orchestrator™ (camada acima das IAs especialistas).
Recebe a configuração atual do rascunho e uma instrução em linguagem natural do Super Admin.
Proponha alterações mínimas e cirúrgicas sem violar as regras invioláveis.

REGRAS INVIOLÁVEIS (jamais remova, contorne ou reduza):
- O orquestrador nunca conversa diretamente com o usuário: apenas roteia, consolida, valida e mede.
- Nunca substituir uma edge function especialista existente — apenas coordená-las.
- Nunca inventar dados: se um especialista falhar, degradar para "sem dados suficientes".
- Memória é sempre organizacional (nunca individual) e usa k-anonimato ≥ 5.
- Cache expira em no máximo 24h e invalida em check-in, pulse, DNA, insight, plano e score.
- Ao menos 1 especialista precisa permanecer ativo; ao menos 1 regra de roteamento precisa existir.
- Cost table deve manter valores ≥ 0. Temperatura entre 0 e 1; max_tokens entre 256 e 8000; timeout entre 5 e 120s; cache_ttl_seconds entre 60 e 86400.
- Consolidation.max_sections entre 1 e 12. Confidence.min_sources entre 1 e 5; ideal_sources entre 1 e 7.
- Nunca reduzir os guardrails da lista publicada abaixo de 1 item.

Retorne SOMENTE JSON válido em "summary", "warnings" e "changes" com apenas as chaves que devem mudar (system_instructions, tone_config, model_config). Quando enviar arrays (routing, specialists, cost_table entries), devolva a lista COMPLETA preservando itens obrigatórios ativos.`;

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
      promptKey !== "action_plan" &&
      promptKey !== "intelligent_ritual" &&
      promptKey !== "recommendation_engine" &&
      promptKey !== "orchestrator"
    )
      return json({ error: "invalid_prompt_key" }, 400);
    const SYSTEM_PROMPT =
      promptKey === "organizational_dna" ? DNA_SYSTEM_PROMPT :
      promptKey === "weekly_insights" ? WEEKLY_SYSTEM_PROMPT :
      promptKey === "action_plan" ? ACTION_PLAN_SYSTEM_PROMPT :
      promptKey === "intelligent_ritual" ? RITUAL_SYSTEM_PROMPT :
      promptKey === "recommendation_engine" ? RECOMMENDATION_SYSTEM_PROMPT :
      promptKey === "orchestrator" ? ORCHESTRATOR_SYSTEM_PROMPT :
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
    const aiRes = await openAICompatChatFetch({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: "json_object" },
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
      promptKey === "intelligent_ritual" ? ["title","type","objective","problem","audience","duration","materials","facilitator","steps","questions","closing","variations","success_metrics","impact_measurement"] :
      promptKey === "recommendation_engine" ? ["item_id","score","reason","factors","type","title","confidence"] :
      promptKey === "orchestrator" ? [] :
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
      } else if (promptKey === "intelligent_ritual") {
        const tc = changes.tone_config;
        tc.require_objective = true;
        tc.require_problem = true;
        tc.require_audience = true;
        tc.require_facilitator_role = true;
        tc.require_materials = true;
        tc.require_success_metric = true;
        tc.require_impact_measurement = true;
        tc.require_questions = true;
        tc.require_closing = true;
        if (typeof tc.min_duration_minutes === "number") tc.min_duration_minutes = Math.max(5, Math.min(120, tc.min_duration_minutes));
        if (typeof tc.max_duration_minutes === "number") tc.max_duration_minutes = Math.max(5, Math.min(120, tc.max_duration_minutes));
        if (typeof tc.min_duration_minutes === "number" && typeof tc.max_duration_minutes === "number" && tc.min_duration_minutes > tc.max_duration_minutes)
          tc.max_duration_minutes = tc.min_duration_minutes;
        if (tc.steps && typeof tc.steps === "object") {
          if (typeof tc.steps.min === "number") tc.steps.min = Math.max(3, Math.min(12, tc.steps.min));
          if (typeof tc.steps.max === "number") tc.steps.max = Math.max(3, Math.min(12, tc.steps.max));
          if (typeof tc.steps.min === "number" && typeof tc.steps.max === "number" && tc.steps.min > tc.steps.max) tc.steps.max = tc.steps.min;
        }
        if (tc.questions && typeof tc.questions === "object") {
          if (typeof tc.questions.min === "number") tc.questions.min = Math.max(1, Math.min(10, tc.questions.min));
          if (typeof tc.questions.max === "number") tc.questions.max = Math.max(1, Math.min(10, tc.questions.max));
          if (typeof tc.questions.min === "number" && typeof tc.questions.max === "number" && tc.questions.min > tc.questions.max) tc.questions.max = tc.questions.min;
        }
      } else if (promptKey === "recommendation_engine") {
        const tc = changes.tone_config;
        const clamp = (n: any, lo: number, hi: number, def: number) => {
          const x = Number(n);
          return Number.isFinite(x) ? Math.max(lo, Math.min(hi, x)) : def;
        };
        const clampMap = (m: any, lo: number, hi: number) => {
          if (!m || typeof m !== "object") return m;
          const out: Record<string, number> = {};
          for (const [k, v] of Object.entries(m)) out[k] = clamp(v, lo, hi, lo);
          return out;
        };
        if (tc.dimension_weights) tc.dimension_weights = clampMap(tc.dimension_weights, 0, 2);
        if (tc.format_weights) tc.format_weights = clampMap(tc.format_weights, 0, 2);
        if (tc.boosts) tc.boosts = clampMap(tc.boosts, 0, 1);
        if (tc.penalties && typeof tc.penalties === "object") {
          const p: any = { ...tc.penalties };
          if (typeof p.repeat_within_days === "number") p.repeat_within_days = clamp(p.repeat_within_days, 0, 365, 30);
          for (const k of ["repeat_penalty","completed_penalty","dismissed_penalty"]) {
            if (typeof p[k] === "number") p[k] = clamp(p[k], 0, 1, 0.5);
          }
          // Bloqueadas em 1.0
          p.archived_penalty = 1.0;
          p.draft_penalty = 1.0;
          p.premium_without_license_penalty = 1.0;
          tc.penalties = p;
        }
        if (typeof tc.top_n === "number") tc.top_n = clamp(tc.top_n, 5, 50, 20);
        if (typeof tc.min_score === "number") tc.min_score = clamp(tc.min_score, 0, 1, 0.05);
        if (typeof tc.novelty_half_life_days === "number") tc.novelty_half_life_days = clamp(tc.novelty_half_life_days, 1, 90, 14);
        if (typeof tc.time_available_minutes === "number") tc.time_available_minutes = clamp(tc.time_available_minutes, 5, 240, 30);
        if (tc.diversity && typeof tc.diversity === "object") {
          if (typeof tc.diversity.max_per_format === "number") tc.diversity.max_per_format = Math.max(1, Math.min(20, tc.diversity.max_per_format));
          if (typeof tc.diversity.max_per_category === "number") tc.diversity.max_per_category = Math.max(1, Math.min(20, tc.diversity.max_per_category));
        }
        if (tc.explanation && typeof tc.explanation === "object") {
          if (typeof tc.explanation.max_length === "number") tc.explanation.max_length = Math.max(80, Math.min(400, tc.explanation.max_length));
        }
      } else if (promptKey === "orchestrator") {
        // clamps
        const tc = changes.tone_config;
        if (tc.consolidation && typeof tc.consolidation === "object") {
          if (typeof tc.consolidation.max_sections === "number")
            tc.consolidation.max_sections = Math.max(1, Math.min(12, tc.consolidation.max_sections));
        }
        if (tc.confidence && typeof tc.confidence === "object") {
          if (typeof tc.confidence.min_sources === "number")
            tc.confidence.min_sources = Math.max(1, Math.min(5, tc.confidence.min_sources));
          if (typeof tc.confidence.ideal_sources === "number")
            tc.confidence.ideal_sources = Math.max(1, Math.min(7, tc.confidence.ideal_sources));
        }
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

    if (changes.model_config && typeof changes.model_config === "object") {
      const mc = changes.model_config;
      if (typeof mc.temperature === "number") mc.temperature = Math.max(0, Math.min(1, mc.temperature));
      if (typeof mc.max_tokens === "number") mc.max_tokens = Math.max(256, Math.min(12000, mc.max_tokens));
      if (promptKey === "orchestrator") {
        if (typeof mc.timeout_seconds === "number") mc.timeout_seconds = Math.max(5, Math.min(120, mc.timeout_seconds));
        if (typeof mc.cache_ttl_seconds === "number") mc.cache_ttl_seconds = Math.max(60, Math.min(86400, mc.cache_ttl_seconds));
        if (Array.isArray(mc.specialists)) {
          const anyActive = mc.specialists.some((s: any) => s?.active !== false);
          if (!anyActive && mc.specialists.length > 0) mc.specialists[0].active = true;
        }
        if (mc.cost_table && typeof mc.cost_table === "object") {
          for (const [k, v] of Object.entries(mc.cost_table)) {
            const row: any = v ?? {};
            row.input_per_1k = Math.max(0, Number(row.input_per_1k ?? 0));
            row.output_per_1k = Math.max(0, Number(row.output_per_1k ?? 0));
            (mc.cost_table as any)[k] = row;
          }
        }
      }
      if (promptKey === "intelligent_ritual" && Array.isArray(mc.ritual_types)) {
        const anyActive = mc.ritual_types.some((t: any) => t?.active !== false);
        if (!anyActive && mc.ritual_types.length > 0) mc.ritual_types[0].active = true;
      }
      if (promptKey === "recommendation_engine") {
        for (const listKey of ["categories", "formats"] as const) {
          if (Array.isArray(mc[listKey])) {
            const anyActive = mc[listKey].some((t: any) => t?.active !== false);
            if (!anyActive && mc[listKey].length > 0) mc[listKey][0].active = true;
          }
        }
      }
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