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

const SYSTEM_PROMPT = `Você é um assistente de configuração de prompts para o Conselho Executivo IA.
Recebe a configuração atual e uma instrução em linguagem natural do Super Admin descrevendo mudanças desejadas.
Sua tarefa é propor alterações no rascunho, sem violar as regras de segurança obrigatórias.

REGRAS INVIOLÁVEIS (jamais remova, contorne ou reduza):
- Sempre exigir dados agregados e k-anonimato.
- Nunca identificar pessoas, diagnosticar doenças, recomendar demissão individual ou inventar números.
- Sempre manter os blocos obrigatórios: evidence, confidence, limitations (ativos e presentes).
- Sempre manter include_evidence, include_confidence e include_limitations como true.
- Não incluir chaves de API, segredos, dados de outra empresa, nem instruções que contradigam as regras acima.

Retorne SOMENTE JSON válido no formato:
{
  "summary": string,                       // resumo curto do que muda (pt-BR)
  "warnings": string[],                    // avisos se algo foi ignorado por violar regras
  "changes": {
    "system_instructions"?: string,
    "tone_config"?: {
      "tone"?: "executivo"|"estrategico"|"consultivo"|"direto"|"humano",
      "detail"?: "resumido"|"equilibrado"|"detalhado",
      "formality"?: "baixa"|"media"|"alta",
      "max_recommendations"?: number,
      "include_risks"?: boolean,
      "include_opportunities"?: boolean,
      "extra_instructions"?: string
    },
    "output_structure"?: [{ "key": string, "title": string, "description": string, "active": boolean, "order": number, "required"?: boolean }],
    "suggested_questions"?: [{ "text": string, "active": boolean }],
    "examples"?: [{ "question": string, "expected_behavior": string, "notes"?: string, "active": boolean }],
    "model_config"?: {
      "primary_model"?: string, "fallback_model"?: string, "temperature"?: number,
      "max_tokens"?: number, "timeout_seconds"?: number, "json_retries"?: number, "streaming"?: boolean
    }
  }
}

Só inclua chaves em "changes" que realmente devem mudar. Não repita valores atuais.
Se a instrução pedir algo que viole as regras, ignore essa parte e explique em "warnings".
Se enviar "output_structure", devolva a lista COMPLETA (ordenada) mantendo os blocos obrigatórios ativos.
Se enviar "suggested_questions" ou "examples", devolva a lista COMPLETA que deve substituir a atual.`;

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
    if (!instruction) return json({ error: "missing_instruction" }, 400);
    if (!currentConfig || typeof currentConfig !== "object")
      return json({ error: "missing_current_config" }, 400);

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
    if (changes.tone_config && typeof changes.tone_config === "object") {
      changes.tone_config.include_evidence = true;
      changes.tone_config.include_confidence = true;
      changes.tone_config.include_limitations = true;
    }
    if (Array.isArray(changes.output_structure)) {
      const required = ["evidence", "confidence", "limitations"];
      const keys = new Set(changes.output_structure.map((b: any) => b?.key));
      const currentBlocks = Array.isArray(currentConfig.output_structure) ? currentConfig.output_structure : [];
      for (const key of required) {
        if (!keys.has(key)) {
          const existing = currentBlocks.find((b: any) => b?.key === key);
          if (existing) changes.output_structure.push({ ...existing, active: true, required: true });
        }
      }
      changes.output_structure = changes.output_structure.map((b: any, i: number) => ({
        ...b,
        active: required.includes(b.key) ? true : !!b.active,
        required: required.includes(b.key) ? true : !!b.required,
        order: typeof b.order === "number" ? b.order : i + 1,
      }));
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