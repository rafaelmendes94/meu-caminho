// Edge Function: process-informational-video
// Analisa vídeos informativos (não-curso) usando Gemini configurado no Super Admin.
// - Valida platform_admin.
// - Nunca "assiste" o vídeo; usa transcrição + notas do admin.
// - Persiste metadata específica de vídeo informativo em content_items.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { generateJson } from "../_shared/gemini.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Payload = {
  video_id: string;
  video_url?: string | null;
  transcription?: string | null;
  admin_notes?: string | null;
  video_kind?: string | null;
};

const VTURB_RE = /scripts\.converteai\.net\/([^/]+)\/players\/([^/]+)\/player\.js/i;

function inferProvider(url: string | null | undefined): string {
  if (!url) return "external";
  const u = url.toLowerCase();
  if (u.includes("converteai.net")) return "vturb";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.startsWith("http") && (u.includes("/storage/v1/") || u.includes("content-video"))) return "upload";
  return "external";
}

const SYSTEM_PROMPT = `Você é o curador de conteúdo da plataforma Meu Caminho, do Dr. Augusto Cury.
Analisa VÍDEOS INFORMATIVOS curtos (boas-vindas, institucional, comunicações do RH, apoio emocional curto, campanhas, feed). NÃO são cursos nem aulas.

REGRAS:
- Responda APENAS com JSON válido, sem comentários ou texto fora do JSON.
- Escreva em português do Brasil, tom acolhedor e humano.
- Se você NÃO tiver transcrição nem notas suficientes do conteúdo, defina analysis_confidence = "low"
  e needs_more_info = true com uma mensagem clara pedindo ao admin colar transcrição ou descrever o conteúdo.
  Não invente detalhes do vídeo.
- Vídeo informativo é APOIO/CONTEXTO. Nunca competir com cursos educativos em peso de recomendação.

FORMATO ESPERADO:
{
  "ai_summary": string,
  "long_description_suggestion": string,
  "topics": string[],
  "ideal_audience": string[],
  "recommended_contexts": string[],
  "not_recommended_contexts": string[],
  "recommended_moment": string,
  "tags_suggestion": string[],
  "cta_suggestion": { "label": string, "url": string|null },
  "category_suggestion": string,
  "emotional_sensitivity": "baixa"|"media"|"alta",
  "placement_suggestion": ("feed"|"home"|"onboarding"|"trilha"|"empresa"|"biblioteca"|"dashboard_rh")[],
  "recommendation_reason_template": string,
  "recommendation_weights": {
    "format": "video",
    "content_mode": "informational",
    "onboarding": number,
    "anxiety": number,
    "energy": number,
    "leadership": number,
    "priority": "support"
  },
  "analysis_confidence": "low"|"medium"|"high",
  "needs_more_info": boolean,
  "needs_more_info_message": string|null
}

Pesos em recommendation_weights vão de 0.0 a 1.0. Para vídeos de apoio, mantenha pesos leves (≤0.8).`;

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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let isAdmin = false;
    try {
      const { data } = await admin.rpc("is_platform_admin");
      isAdmin = !!data;
    } catch { /* ignore */ }
    if (!isAdmin) {
      const { data: role } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "platform_admin").maybeSingle();
      if (!role) {
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = (await req.json()) as Payload;
    if (!body?.video_id) throw new Error("video_id obrigatório");

    const { data: video, error: vErr } = await admin
      .from("content_items")
      .select("id,type,title,metadata,short_description,long_description,duration_minutes,media_url,audience_tags")
      .eq("id", body.video_id)
      .maybeSingle();
    if (vErr || !video) throw new Error("vídeo não encontrado");
    if (video.type !== "video") throw new Error("item não é do tipo video");

    const meta = (video.metadata ?? {}) as Record<string, unknown>;
    const videoUrl = body.video_url ?? (meta.vturb_script_url as string) ?? video.media_url ?? "";
    const transcription = (body.transcription ?? (meta.transcription as string) ?? "").trim();
    const adminNotes = (body.admin_notes ?? (meta.admin_notes as string) ?? "").trim();
    const videoKind = body.video_kind ?? (meta.video_kind as string) ?? "outro";
    const provider = inferProvider(videoUrl);

    const vturbMatch = (videoUrl || "").match(VTURB_RE);
    const vturbFields = provider === "vturb" && vturbMatch
      ? {
          vturb_script_url: videoUrl,
          vturb_account_id: vturbMatch[1],
          vturb_player_id: vturbMatch[2],
        }
      : {};

    // Marca processing
    await admin.from("content_items").update({
      metadata: {
        ...meta,
        content_mode: "informational_video",
        video_provider: provider,
        video_kind: videoKind,
        transcription: transcription || null,
        admin_notes: adminNotes || null,
        ai_processing_status: "processing",
        ai_processing_error: null,
        ...vturbFields,
      },
    }).eq("id", body.video_id);

    const hasSubstance = transcription.length > 60 || adminNotes.length > 60 || (video.long_description ?? "").length > 60;

    // Se realmente não temos nada substancial e é VTurb (não conseguimos ler), retornamos aviso claro sem alucinar.
    if (!hasSubstance) {
      const message = "Para análise profunda, cole a transcrição ou descreva o conteúdo do vídeo. Sem isso, a IA não tem material real para trabalhar.";
      await admin.from("content_items").update({
        metadata: {
          ...meta,
          content_mode: "informational_video",
          video_provider: provider,
          video_kind: videoKind,
          transcription: transcription || null,
          admin_notes: adminNotes || null,
          ai_processing_status: "success",
          ai_processing_error: null,
          ai_processed_at: new Date().toISOString(),
          analysis_confidence: "low",
          needs_more_info: true,
          needs_more_info_message: message,
          ...vturbFields,
        },
      }).eq("id", body.video_id);
      return new Response(JSON.stringify({ ok: true, needs_more_info: true, message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      `Título atual: ${video.title || "(sem título)"}`,
      `Descrição curta: ${video.short_description ?? ""}`,
      `Descrição completa: ${video.long_description ?? ""}`,
      `Tipo do vídeo (video_kind): ${videoKind}`,
      `URL do vídeo (${provider}): ${videoUrl || "(nenhuma)"}`,
      `Duração informada: ${video.duration_minutes ?? "desconhecida"} min`,
      "",
      "TRANSCRIÇÃO:",
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
      await admin.from("content_items").update({
        metadata: {
          ...meta,
          content_mode: "informational_video",
          video_provider: provider,
          video_kind: videoKind,
          ai_processing_status: "failed",
          ai_processing_error: msg,
          ...vturbFields,
        },
      }).eq("id", body.video_id);
      throw new Error(`falha na IA: ${msg}`);
    }

    const nextMetadata: Record<string, any> = {
      ...meta,
      content_mode: "informational_video",
      video_provider: provider,
      video_kind: videoKind,
      transcription: transcription || null,
      admin_notes: adminNotes || null,
      ai_processing_status: "success",
      ai_processing_error: null,
      ai_processed_at: new Date().toISOString(),
      ai_summary: ai.ai_summary ?? null,
      topics: ai.topics ?? [],
      ideal_audience: ai.ideal_audience ?? [],
      recommended_contexts: ai.recommended_contexts ?? [],
      not_recommended_contexts: ai.not_recommended_contexts ?? [],
      recommended_moment: ai.recommended_moment ?? null,
      emotional_sensitivity: ai.emotional_sensitivity ?? null,
      placement_suggestion: ai.placement_suggestion ?? [],
      cta_suggestion: ai.cta_suggestion ?? null,
      category_suggestion: ai.category_suggestion ?? null,
      recommendation_reason_template: ai.recommendation_reason_template ?? null,
      analysis_confidence: ai.analysis_confidence ?? "medium",
      needs_more_info: ai.needs_more_info ?? false,
      needs_more_info_message: ai.needs_more_info_message ?? null,
      ...vturbFields,
    };

    const patch: Record<string, unknown> = { metadata: nextMetadata };
    if (!video.long_description && typeof ai.long_description_suggestion === "string") {
      patch.long_description = ai.long_description_suggestion;
    }
    if (Array.isArray(ai.ideal_audience)) {
      const merged = Array.from(new Set([...(video.audience_tags ?? []), ...ai.ideal_audience.map((t: any) => String(t).toLowerCase().slice(0, 40))])).slice(0, 20);
      patch.audience_tags = merged;
    }
    if (ai.recommendation_weights && typeof ai.recommendation_weights === "object") {
      patch.recommendation_weights = {
        format: "video",
        content_mode: "informational",
        priority: "support",
        ...ai.recommendation_weights,
      };
    }

    await admin.from("content_items").update(patch).eq("id", body.video_id);

    return new Response(JSON.stringify({ ok: true, ai }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    console.error("process-informational-video:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});