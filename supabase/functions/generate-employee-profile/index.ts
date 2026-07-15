import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const DEFAULT_MODEL = "google/gemini-2.5-pro";

const DEFAULT_SYSTEM = `Você é um analista que gera um Perfil Inteligente a partir de uma entrevista conversacional do colaborador. Baseie-se ESTRITAMENTE no que foi dito. Nunca faça diagnóstico clínico. Nunca use linguagem médica ou psicológica. Se não houver evidência para um campo, deixe vazio e use confidence "low". Responda APENAS com um JSON válido, sem texto adicional.`;

const OUTPUT_SHAPE = `Formato de saída obrigatório:
{
  "profile_professional": { "work_style": "", "experience_level": "", "strengths": [], "growth_areas": [] },
  "profile_development": { "learning_style": "", "current_focus": "", "aspirations": [] },
  "profile_leadership": { "is_leader": false, "style": "", "span_of_care": "" },
  "profile_communication": { "preferred_channels": [], "directness_score": 0, "feedback_style": "" },
  "profile_energy": { "baseline_energy": 0, "drainers": [], "restorers": [] },
  "profile_engagement": { "motivators": [], "purpose_alignment": 0, "risk_signals": [] },
  "summary": "",
  "confidence": "low"
}`;

async function loadProfileConfig(admin: any): Promise<{ system: string; model: string }> {
  try {
    const { data } = await admin
      .from("ai_prompt_configs")
      .select("tone_config, model_config, status")
      .eq("key", "onboarding")
      .maybeSingle();
    if (!data || data.status !== "published") throw new Error("no_config");
    const tc = (data.tone_config ?? {}) as any;
    const mc = (data.model_config ?? {}) as any;
    const base = (typeof tc.profile_prompt === "string" && tc.profile_prompt.trim()) ? tc.profile_prompt : DEFAULT_SYSTEM;
    return {
      system: `${base}\n\n${OUTPUT_SHAPE}`,
      model: mc.profile_model || DEFAULT_MODEL,
    };
  } catch {
    return { system: `${DEFAULT_SYSTEM}\n\n${OUTPUT_SHAPE}`, model: DEFAULT_MODEL };
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractJson(text: string): any | null {
  try { return JSON.parse(text); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
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

    const { interview_id } = await req.json().catch(() => ({}));
    if (!interview_id) return json({ error: "interview_id_required" }, 400);

    const { data: iv } = await admin
      .from("onboarding_interviews").select("*").eq("id", interview_id).maybeSingle();
    if (!iv || iv.user_id !== user.id) return json({ error: "forbidden" }, 403);

    const { data: msgs } = await admin
      .from("onboarding_messages")
      .select("role,content")
      .eq("interview_id", interview_id)
      .order("created_at", { ascending: true });

    const transcript = (msgs ?? [])
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const cfg = await loadProfileConfig(admin);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: "system", content: cfg.system },
          { role: "user", content: `Transcrição da entrevista:\n\n${transcript}\n\nGere o JSON do Perfil Inteligente.` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (aiRes.status === 429) return json({ error: "rate_limited" }, 429);
    if (aiRes.status === 402) return json({ error: "credits_exhausted" }, 402);
    if (!aiRes.ok) return json({ error: "ai_error", detail: await aiRes.text() }, 500);

    const aiData = await aiRes.json();
    const raw = aiData?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(raw);
    if (!parsed) return json({ error: "invalid_ai_json", raw }, 500);

    const row = {
      user_id: user.id,
      organization_id: iv.organization_id,
      profile_professional: parsed.profile_professional ?? {},
      profile_development: parsed.profile_development ?? {},
      profile_leadership: parsed.profile_leadership ?? {},
      profile_communication: parsed.profile_communication ?? {},
      profile_energy: parsed.profile_energy ?? {},
      profile_engagement: parsed.profile_engagement ?? {},
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      confidence: ["low","medium","high"].includes(parsed.confidence) ? parsed.confidence : "low",
      generated_by_model: cfg.model,
      generated_at: new Date().toISOString(),
    };

    const { data: existing } = await admin
      .from("employee_profiles").select("id,version").eq("user_id", user.id).maybeSingle();

    if (existing) {
      await admin.from("employee_profiles")
        .update({ ...row, version: (existing.version ?? 1) + 1 })
        .eq("id", existing.id);
    } else {
      await admin.from("employee_profiles").insert(row);
    }

    await admin.from("onboarding_interviews")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", interview_id);

    return json({ ok: true, profile: row });
  } catch (e) {
    return json({ error: "server_error", detail: String(e) }, 500);
  }
});