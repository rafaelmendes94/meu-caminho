// Edge Function: process-course-video
// Usa Gemini (via helper compartilhado) para analisar um curso de vídeo único e
// preencher metadados pedagógicos + campos de recomendação em content_items.
// - Valida platform_admin.
// - Não tenta "assistir" o vídeo. Trabalha com transcrição + notas + URL informadas.
// - Persiste resultado em content_items.metadata e sincroniza course_lessons via trigger.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { generateJson } from "../_shared/gemini.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Payload = {
  course_id: string;
  video_url?: string | null;
  transcription?: string | null;
  admin_notes?: string | null;
};

const SYSTEM_PROMPT = `Você é o organizador pedagógico da plataforma Meu Caminho, do Dr. Augusto Cury.
Analisa cursos de vídeo único e gera metadados para trilhas personalizadas.

REGRAS:
- Responda APENAS com JSON válido, sem comentários ou texto fora do JSON.
- Escreva em português do Brasil, tom acolhedor e profissional.
- Se você NÃO tiver transcrição nem descrição suficiente do conteúdo, marque analysis_confidence = "low"
  e retorne o campo needs_more_info = true com uma mensagem clara pedindo transcrição ou resumo.
- Nunca invente detalhes que não estejam no material recebido.

FORMATO ESPERADO:
{
  "title_suggestion": string,
  "subtitle_suggestion": string,
  "short_description": string,
  "long_description": string,
  "estimated_duration_minutes": number|null,
  "main_objective": string,
  "topics": string[],
  "ideal_audience": string[],
  "emotional_moment": string[],
  "contraindications": string[],
  "recommended_track_stage": "inicio"|"meio"|"avancado"|"fechamento",
  "emotional_intensity": "leve"|"moderada"|"profunda",
  "difficulty_level": 1|2|3|4|5,
  "level_label": "iniciante"|"intermediario"|"avancado",
  "competencies": string[],
  "expected_outcomes": string[],
  "audience_tags": string[],
  "recommendation_weights": { "ansiedade": number, "energia": number, "comunicacao": number, "lideranca": number, "recuperacao": number, "engajamento": number, "seguranca_psicologica": number, "equilibrio_emocional": number },
  "reflection_questions": string[],
  "ai_summary": string,
  "recommendation_reason_template": string,
  "analysis_confidence": "low"|"medium"|"high",
  "needs_more_info": boolean,
  "needs_more_info_message": string|null
}

Os pesos em recommendation_weights vão de 0.0 a 1.0 e indicam quanto este curso
ajuda cada sinal do perfil emocional/comportamental.`;

function inferProvider(url: string | null | undefined): string {
  if (!url) return "external";
  const u = url.toLowerCase();
  if (u.includes("converteai.net") || u.includes("scripts.converteai")) return "vturb";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.startsWith("http") && (u.includes("/storage/v1/") || u.includes("content-video"))) return "upload";
  return "external";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let isAdmin = false;
    try {
      const { data } = await admin.rpc("is_platform_admin");
      isAdmin = !!data;
    } catch { /* ignore */ }
    if (!isAdmin) {
      const { data: role } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "platform_admin")
        .maybeSingle();
      if (!role) {
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = (await req.json()) as Payload;
    if (!body?.course_id) throw new Error("course_id obrigatório");

    const { data: course, error: cErr } = await admin
      .from("content_items")
      .select("id,type,title,metadata,short_description,long_description,duration_minutes,media_url")
      .eq("id", body.course_id)
      .maybeSingle();
    if (cErr || !course) throw new Error("curso não encontrado");
    if (course.type !== "course") throw new Error("item não é do tipo course");

    const meta = (course.metadata ?? {}) as Record<string, unknown>;
    const videoUrl = body.video_url ?? course.media_url ?? "";
    const transcription = (body.transcription ?? (meta.transcription as string) ?? "").trim();
    const adminNotes = (body.admin_notes ?? (meta.admin_notes as string) ?? "").trim();
    const provider = inferProvider(videoUrl);

    // Marca "processing"
    await admin.from("content_items").update({
      metadata: {
        ...meta,
        course_mode: "single_video",
        video_provider: provider,
        video_url: videoUrl || null,
        transcription: transcription || null,
        admin_notes: adminNotes || null,
        ai_processing_status: "processing",
        ai_processing_error: null,
      },
    }).eq("id", body.course_id);

    const hasSubstance = transcription.length > 80 || adminNotes.length > 80 || (course.long_description ?? "").length > 80;
    const userPrompt = [
      `Título atual: ${course.title || "(sem título)"}`,
      `Descrição atual (curta): ${course.short_description ?? ""}`,
      `Descrição atual (completa): ${course.long_description ?? ""}`,
      `URL do vídeo (${provider}): ${videoUrl || "(nenhuma)"}`,
      `Duração informada: ${course.duration_minutes ?? "desconhecida"} min`,
      "",
      "TRANSCRIÇÃO DO VÍDEO:",
      transcription || "(não fornecida)",
      "",
      "NOTAS DO ADMIN PARA A IA:",
      adminNotes || "(nenhuma)",
    ].join("\n");

    let ai: Record<string, unknown> = {};
    try {
      ai = await generateJson<Record<string, unknown>>({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2400,
      });
    } catch (e) {
      const msg = (e as Error).message || String(e);
      await admin.from("content_items").update({
        metadata: {
          ...meta,
          course_mode: "single_video",
          video_provider: provider,
          video_url: videoUrl || null,
          transcription: transcription || null,
          admin_notes: adminNotes || null,
          ai_processing_status: "failed",
          ai_processing_error: msg,
        },
      }).eq("id", body.course_id);
      throw new Error(`falha na IA: ${msg}`);
    }

    if (!hasSubstance) {
      ai.analysis_confidence = "low";
      ai.needs_more_info = true;
      ai.needs_more_info_message =
        "Para análise profunda, cole a transcrição do vídeo ou um resumo detalhado do conteúdo. Sem isso, os campos abaixo são apenas uma sugestão inicial baseada no título/URL.";
    }

    // Persistência: atualizações “duras” em colunas + metadata rico.
    const patch: Record<string, unknown> = {
      metadata: {
        ...meta,
        course_mode: "single_video",
        video_provider: provider,
        video_url: videoUrl || null,
        transcription: transcription || null,
        admin_notes: adminNotes || null,
        ai_processing_status: "success",
        ai_processing_error: null,
        ai_processed_at: new Date().toISOString(),
        ai_summary: ai.ai_summary ?? null,
        main_objective: ai.main_objective ?? null,
        topics: ai.topics ?? [],
        ideal_audience: ai.ideal_audience ?? [],
        emotional_moment: ai.emotional_moment ?? [],
        contraindications: ai.contraindications ?? [],
        recommended_track_stage: ai.recommended_track_stage ?? null,
        emotional_intensity: ai.emotional_intensity ?? null,
        reflection_questions: ai.reflection_questions ?? [],
        recommendation_reason_template: ai.recommendation_reason_template ?? null,
        analysis_confidence: ai.analysis_confidence ?? "medium",
        needs_more_info: ai.needs_more_info ?? false,
        needs_more_info_message: ai.needs_more_info_message ?? null,
        title_suggestion: ai.title_suggestion ?? null,
        subtitle_suggestion: ai.subtitle_suggestion ?? null,
      },
    };

    // Só sobrescreve descrições se estiverem vazias.
    if (!course.short_description && typeof ai.short_description === "string") patch.short_description = ai.short_description;
    if (!course.long_description && typeof ai.long_description === "string") patch.long_description = ai.long_description;
    if (!course.duration_minutes && typeof ai.estimated_duration_minutes === "number") patch.duration_minutes = ai.estimated_duration_minutes;
    if (typeof ai.difficulty_level === "number") patch.difficulty_level = Math.min(5, Math.max(1, Math.round(ai.difficulty_level as number)));
    if (typeof ai.level_label === "string") patch.level = ai.level_label;
    if (Array.isArray(ai.audience_tags)) patch.audience_tags = (ai.audience_tags as string[]).map((t) => String(t).toLowerCase().slice(0, 40)).slice(0, 20);
    if (Array.isArray(ai.expected_outcomes)) patch.expected_outcomes = (ai.expected_outcomes as string[]).slice(0, 20);
    if (ai.recommendation_weights && typeof ai.recommendation_weights === "object") patch.recommendation_weights = ai.recommendation_weights;

    await admin.from("content_items").update(patch).eq("id", body.course_id);

    return new Response(JSON.stringify({ ok: true, ai, patch: { ...patch, metadata: undefined } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    console.error("process-course-video:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});