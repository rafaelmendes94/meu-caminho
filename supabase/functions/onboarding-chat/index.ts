import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { enforceRateLimit } from "../_shared/rate_limit.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const DEFAULT_MODEL = "google/gemini-2.5-flash";

const DEFAULT_SYSTEM_PROMPT = `Você é o guia do Meu Caminho Enterprise. Conduza uma entrevista conversacional, acolhedora e breve em português do Brasil. Seu objetivo é compreender contexto profissional, rotina, relação com liderança, percepção do ambiente, objetivos, comunicação, energia, engajamento e desafios atuais. Faça uma pergunta por vez. Nunca faça diagnóstico clínico. Nunca use linguagem médica. Nunca diga que está avaliando saúde mental. Ao perceber que já possui informações suficientes, convide o usuário a finalizar e gerar seu Perfil Inteligente.

Regras: 1 pergunta por resposta. Tom humano, respeitoso e breve. Máximo 180 palavras. Nunca cite RH. Nunca diga que as respostas serão vistas pela empresa. Reforce privacidade quando fizer sentido.`;

async function loadOnboardingConfig(admin: any): Promise<{ system: string; model: string; temperature: number; maxTokens: number; guardrails: string[] }> {
  try {
    const { data } = await admin
      .from("ai_prompt_configs")
      .select("system_instructions, model_config, guardrails, status")
      .eq("key", "onboarding")
      .maybeSingle();
    if (!data || data.status !== "published") throw new Error("no_config");
    const mc = (data.model_config ?? {}) as any;
    const guardrails = Array.isArray(data.guardrails) ? (data.guardrails as string[]) : [];
    const system = guardrails.length
      ? `${data.system_instructions}\n\nGuardrails:\n- ${guardrails.join("\n- ")}`
      : (data.system_instructions as string);
    return {
      system: system || DEFAULT_SYSTEM_PROMPT,
      model: mc.chat_model || DEFAULT_MODEL,
      temperature: typeof mc.temperature === "number" ? mc.temperature : 0.7,
      maxTokens: typeof mc.max_tokens === "number" ? mc.max_tokens : 800,
      guardrails,
    };
  } catch {
    return { system: DEFAULT_SYSTEM_PROMPT, model: DEFAULT_MODEL, temperature: 0.7, maxTokens: 800, guardrails: [] };
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes?.user) return json({ error: "unauthorized" }, 401);
    const user = userRes.user;

    const rl = await enforceRateLimit(
      admin,
      { userId: user.id, functionName: "onboarding-chat", kind: "chat" },
      corsHeaders,
    );
    if (!rl.allowed) return rl.response!;

    const body = await req.json().catch(() => ({}));
    const { interview_id, message, finish } = body ?? {};
    if (!message || typeof message !== "string") return json({ error: "message_required" }, 400);

    const { data: profile } = await admin
      .from("profiles").select("organization_id").eq("id", user.id).maybeSingle();
    const organization_id = profile?.organization_id ?? null;

    const cfg = await loadOnboardingConfig(admin);

    // Get or create interview
    let interviewId: string | null = interview_id ?? null;
    if (interviewId) {
      const { data: iv } = await admin
        .from("onboarding_interviews").select("id,user_id").eq("id", interviewId).maybeSingle();
      if (!iv || iv.user_id !== user.id) return json({ error: "invalid_interview" }, 403);
    } else {
      const { data: created, error: cErr } = await admin
        .from("onboarding_interviews")
        .insert({ user_id: user.id, organization_id, model_used: cfg.model })
        .select("id").single();
      if (cErr) return json({ error: cErr.message }, 500);
      interviewId = created.id;
    }

    // Save user message
    await admin.from("onboarding_messages").insert({
      interview_id: interviewId, user_id: user.id, organization_id,
      role: "user", content: message,
    });

    // Load history for context
    const { data: history } = await admin
      .from("onboarding_messages")
      .select("role,content")
      .eq("interview_id", interviewId)
      .order("created_at", { ascending: true });

    const messages = [
      { role: "system", content: cfg.system },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
    ];
    if (finish) {
      messages.push({
        role: "system",
        content: "O usuário deseja finalizar. Agradeça brevemente e confirme que ele pode gerar o Perfil Inteligente agora.",
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({ model: cfg.model, messages, temperature: cfg.temperature, max_tokens: cfg.maxTokens }),
    });
    if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
    if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return json({ error: "ai_error", detail: t }, 500);
    }
    const aiData = await aiRes.json();
    const assistant = aiData?.choices?.[0]?.message?.content?.trim?.() ?? "";

    await admin.from("onboarding_messages").insert({
      interview_id: interviewId, user_id: user.id, organization_id,
      role: "assistant", content: assistant,
    });

    // Update interview counters
    const { count } = await admin
      .from("onboarding_messages")
      .select("*", { count: "exact", head: true })
      .eq("interview_id", interviewId);
    await admin
      .from("onboarding_interviews")
      .update({ message_count: count ?? 0 })
      .eq("id", interviewId);

    return json({ interview_id: interviewId, assistant, message_count: count ?? 0 });
  } catch (e) {
    return json({ error: "server_error", detail: String(e) }, 500);
  }
});