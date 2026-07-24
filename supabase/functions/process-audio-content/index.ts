// Analyze an audio content_item using Gemini configured in the Super Admin AI panel.
// Only platform_admin. No Lovable AI. No fake transcription.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { generateJson } from "../_shared/gemini.ts";
import { requirePlatformAdmin } from "../_shared/r2.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_PROMPT = `Você é o curador de conteúdo da plataforma Meu Caminho, do Dr. Augusto Cury.
Analisa ÁUDIOS PUROS (prática guiada, meditação, respiração, relaxamento, reflexão curta, afirmação, foco, pausa).
NÃO é curso, NÃO é podcast, NÃO é vídeo. Áudio é geralmente curto e de suporte emocional.

REGRAS:
- Responda APENAS com JSON válido, sem comentários fora do JSON.
- Escreva em português do Brasil, tom acolhedor, humano e sensível.
- Se NÃO houver transcrição/roteiro nem notas suficientes, defina analysis_confidence = "low"
  e needs_more_info = true. Não invente conteúdo.
- Áudios podem ser recomendados para pausa, ansiedade, foco, fim de dia, antes de dormir.
- Áudios profundos NÃO devem aparecer em contexto de crise sem cuidado.

FORMATO ESPERADO:
{
  "short_description": string,
  "long_description": string,
  "objective": string,
  "topics": string[],
  "best_moment": ("inicio_do_dia"|"pausa"|"antes_reuniao"|"depois_reuniao"|"fim_do_dia"|"crise_ansiedade"|"antes_dormir")[],
  "ideal_audience": string[],
  "emotional_profile": string,
  "contraindications": string[],
  "tags_suggestion": string[],
  "reflection_questions": string[],
  "expected_outcomes": string[],
  "recommendation_reason_template": string,
  "recommendation_weights": {
    "format": "audio",
    "content_mode": "uploaded_audio",
    "storage": "cloudflare_r2",
    "time_minutes": number,
    "anxiety": number,
    "energy": number,
    "recovery": number,
    "focus": number,
    "communication": number,
    "leadership": number,
    "best_when": string[],
    "priority": "quick_support"|"deep"|"support"
  },
  "analysis_confidence": "low"|"medium"|"high",
  "needs_more_info": boolean,
  "needs_more_info_message": string|null
}

Pesos vão de 0.0 a 1.0.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requirePlatformAdmin(req);
  if (auth instanceof Response) {
    return new Response(auth.body, { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  try {
    const body = await req.json();
    if (!body?.audio_id) throw new Error("audio_id obrigatório");
    const { data: it, error } = await admin.from("content_items").select("*").eq("id", body.audio_id).maybeSingle();
    if (error || !it) throw new Error("áudio não encontrado");
    if (it.type !== "audio") throw new Error("item não é do tipo audio");

    const meta = { ...((it.metadata as any) ?? {}) };
    const transcription = String(body.transcription ?? meta.transcription ?? "").trim();
    const adminNotes = String(body.admin_notes ?? meta.admin_notes ?? "").trim();
    const audioKind = String(body.audio_kind ?? meta.audio_kind ?? "").trim();

    meta.transcription = transcription || null;
    meta.admin_notes = adminNotes || null;
    if (audioKind) meta.audio_kind = audioKind;
    meta.ai_processing_status = "processing";
    meta.ai_processing_error = null;
    await admin.from("content_items").update({ metadata: meta }).eq("id", it.id);

    const substance = transcription.length > 40 || adminNotes.length > 40 || (it.long_description ?? "").length > 40;
    if (!substance) {
      const message = "Para análise profunda, cole a transcrição/roteiro ou descreva o conteúdo do áudio.";
      meta.ai_processing_status = "success";
      meta.ai_processed_at = new Date().toISOString();
      meta.analysis_confidence = "low";
      meta.needs_more_info = true;
      meta.needs_more_info_message = message;
      await admin.from("content_items").update({ metadata: meta }).eq("id", it.id);
      return new Response(JSON.stringify({ ok: true, needs_more_info: true, message }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userPrompt = [
      `Título: ${it.title || "(sem título)"}`,
      `Tipo do áudio: ${audioKind || meta.audio_kind || "—"}`,
      `Objetivo informado: ${meta.objective ?? "—"}`,
      `Duração (min): ${it.duration_minutes ?? "?"}`,
      `Melhor momento (informado): ${Array.isArray(meta.best_moment) ? meta.best_moment.join(", ") : "—"}`,
      `Intensidade emocional: ${meta.emotional_intensity ?? "—"}`,
      `Descrição curta: ${it.short_description ?? ""}`,
      `Descrição completa: ${it.long_description ?? ""}`,
      "",
      "TRANSCRIÇÃO/ROTEIRO:",
      transcription || "(não fornecida)",
      "",
      "NOTAS DO ADMIN:",
      adminNotes || "(nenhuma)",
    ].join("\n");

    let ai: Record<string, any> = {};
    try {
      ai = await generateJson<Record<string, any>>({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2200,
      });
    } catch (e) {
      const msg = (e as Error).message || String(e);
      meta.ai_processing_status = "failed";
      meta.ai_processing_error = msg;
      await admin.from("content_items").update({ metadata: meta }).eq("id", it.id);
      throw new Error(`falha na IA: ${msg}`);
    }

    const nextMeta = {
      ...meta,
      ai_processing_status: "success",
      ai_processing_error: null,
      ai_processed_at: new Date().toISOString(),
      ai_summary: ai.short_description ?? ai.ai_summary ?? null,
      objective: ai.objective ?? meta.objective ?? null,
      topics: ai.topics ?? [],
      ideal_audience: ai.ideal_audience ?? [],
      emotional_profile: ai.emotional_profile ?? null,
      contraindications: ai.contraindications ?? [],
      reflection_questions: ai.reflection_questions ?? [],
      expected_outcomes: ai.expected_outcomes ?? [],
      recommendation_reason_template: ai.recommendation_reason_template ?? null,
      best_moment: Array.isArray(ai.best_moment) && ai.best_moment.length ? ai.best_moment : (meta.best_moment ?? []),
      analysis_confidence: ai.analysis_confidence ?? "medium",
      needs_more_info: ai.needs_more_info ?? false,
      needs_more_info_message: ai.needs_more_info_message ?? null,
    };

    const patch: Record<string, unknown> = { metadata: nextMeta };
    if (!it.short_description && typeof ai.short_description === "string") patch.short_description = ai.short_description;
    if (!it.long_description && typeof ai.long_description === "string") patch.long_description = ai.long_description;
    if (Array.isArray(ai.ideal_audience)) {
      const merged = Array.from(new Set([...(it.audience_tags ?? []), ...ai.ideal_audience.map((t: any) => String(t).toLowerCase().slice(0, 40))])).slice(0, 20);
      patch.audience_tags = merged;
    }
    if (ai.recommendation_weights && typeof ai.recommendation_weights === "object") {
      patch.recommendation_weights = {
        format: "audio",
        content_mode: "uploaded_audio",
        storage: "cloudflare_r2",
        priority: "quick_support",
        ...ai.recommendation_weights,
      };
    }
    if (Array.isArray(ai.expected_outcomes)) patch.expected_outcomes = ai.expected_outcomes;

    await admin.from("content_items").update(patch).eq("id", it.id);
    return new Response(JSON.stringify({ ok: true, ai }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    console.error("process-audio-content:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});