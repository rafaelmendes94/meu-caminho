// Edge Function: process-podcast-video
// Analisa podcasts em vídeo (VTurb) ou áudio usando Gemini configurado no Super Admin.
// - Valida platform_admin.
// - Não "assiste" o vídeo; usa transcrição + notas do admin.
// - Persiste metadata específica de podcast em content_items.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { generateJson } from "../_shared/gemini.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Payload = {
  podcast_id: string;
  media_url?: string | null;
  transcription?: string | null;
  admin_notes?: string | null;
};

const VTURB_RE = /scripts\.converteai\.net\/([^/]+)\/players\/([^/]+)\/player\.js/i;

function inferProvider(url: string | null | undefined): string {
  if (!url) return "external";
  const u = url.toLowerCase();
  if (u.includes("converteai.net")) return "vturb";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("spotify.com")) return "spotify";
  if (u.startsWith("http") && (u.includes("/storage/v1/") || u.includes("content-audio") || u.includes("content-video"))) return "upload";
  return "external";
}

const SYSTEM_PROMPT = `Você é o curador de conteúdo da plataforma Meu Caminho, do Dr. Augusto Cury.
Analisa PODCASTS (episódios de conversa/entrevista/reflexão longa, geralmente em vídeo via VTurb). NÃO são cursos, aulas nem vídeos institucionais curtos.

REGRAS:
- Responda APENAS com JSON válido, sem comentários ou texto fora do JSON.
- Escreva em português do Brasil, tom acolhedor, humano e reflexivo.
- Se você NÃO tiver transcrição nem notas suficientes, defina analysis_confidence = "low"
  e needs_more_info = true com mensagem pedindo ao admin colar transcrição ou descrever o episódio.
  Não invente detalhes do episódio.
- Podcast é conteúdo de APROFUNDAMENTO/REFLEXÃO. Recomendado quando o usuário tem mais tempo.
  Não deve competir com cursos como aula. Não é vídeo institucional curto.

FORMATO ESPERADO:
{
  "ai_summary": string,
  "long_description_suggestion": string,
  "topics": string[],
  "key_moments": [{ "timestamp": string, "label": string }],
  "reflection_questions": string[],
  "ideal_audience": string[],
  "recommended_contexts": string[],
  "not_recommended_contexts": string[],
  "emotional_depth": "leve"|"media"|"profunda",
  "tags_suggestion": string[],
  "alt_title_suggestion": string|null,
  "cta_suggestion": { "label": string, "url": string|null },
  "recommendation_reason_template": string,
  "recommendation_weights": {
    "format": "podcast",
    "content_mode": "video_podcast",
    "depth": "light"|"medium"|"deep",
    "anxiety": number,
    "communication": number,
    "leadership": number,
    "recovery": number,
    "engagement": number,
    "best_when_time_minutes_gte": number
  },
  "analysis_confidence": "low"|"medium"|"high",
  "needs_more_info": boolean,
  "needs_more_info_message": string|null
}

Pesos em recommendation_weights vão de 0.0 a 1.0. best_when_time_minutes_gte é minutos (ex.: 15).`;

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
    if (!body?.podcast_id) throw new Error("podcast_id obrigatório");

    const { data: pod, error: pErr } = await admin
      .from("content_items")
      .select("id,type,title,metadata,short_description,long_description,duration_minutes,media_url,audience_tags")
      .eq("id", body.podcast_id)
      .maybeSingle();
    if (pErr || !pod) throw new Error("podcast não encontrado");
    if (pod.type !== "podcast") throw new Error("item não é do tipo podcast");

    const meta = (pod.metadata ?? {}) as Record<string, unknown>;
    const mediaUrl = body.media_url ?? (meta.vturb_script_url as string) ?? pod.media_url ?? "";
    const transcription = (body.transcription ?? (meta.transcription as string) ?? "").trim();
    const adminNotes = (body.admin_notes ?? (meta.admin_notes as string) ?? "").trim();
    const provider = inferProvider(mediaUrl);
    const podcastFormat = (meta.podcast_format as string) ?? "video_podcast";
    const podcastMode = podcastFormat === "audio_only" ? "audio_only" : "video_podcast";

    const vturbMatch = (mediaUrl || "").match(VTURB_RE);
    const vturbFields = provider === "vturb" && vturbMatch
      ? {
          vturb_script_url: mediaUrl,
          vturb_account_id: vturbMatch[1],
          vturb_player_id: vturbMatch[2],
        }
      : {};

    const baseMeta = {
      ...meta,
      content_mode: podcastMode,
      podcast_mode: podcastMode,
      podcast_format: podcastFormat,
      media_provider: provider,
      transcription: transcription || null,
      admin_notes: adminNotes || null,
      ...vturbFields,
    };

    // Marca processing
    await admin.from("content_items").update({
      metadata: { ...baseMeta, ai_processing_status: "processing", ai_processing_error: null },
    }).eq("id", body.podcast_id);

    const hasSubstance = transcription.length > 80 || adminNotes.length > 80 || (pod.long_description ?? "").length > 80;

    if (!hasSubstance) {
      const message = "Para análise profunda, cole a transcrição ou descreva o episódio. Sem isso, a IA não tem material real para trabalhar.";
      await admin.from("content_items").update({
        metadata: {
          ...baseMeta,
          ai_processing_status: "success",
          ai_processing_error: null,
          ai_processed_at: new Date().toISOString(),
          analysis_confidence: "low",
          needs_more_info: true,
          needs_more_info_message: message,
        },
      }).eq("id", body.podcast_id);
      return new Response(JSON.stringify({ ok: true, needs_more_info: true, message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      `Título atual: ${pod.title || "(sem título)"}`,
      `Série: ${meta.series_name ?? "—"} · Temporada ${meta.season_number ?? "?"} · Episódio ${meta.episode_number ?? "?"}`,
      `Apresentadores: ${Array.isArray(meta.host_names) ? (meta.host_names as string[]).join(", ") : "—"}`,
      `Convidados: ${Array.isArray(meta.guest_names) ? (meta.guest_names as string[]).join(", ") : "—"}`,
      `Formato: ${podcastFormat} · Provedor: ${provider}`,
      `Descrição curta: ${pod.short_description ?? ""}`,
      `Descrição completa: ${pod.long_description ?? ""}`,
      `Duração informada: ${pod.duration_minutes ?? "?"} min`,
      `URL da mídia: ${mediaUrl || "(nenhuma)"}`,
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
        max_tokens: 2600,
      });
    } catch (e) {
      const msg = (e as Error).message || String(e);
      await admin.from("content_items").update({
        metadata: { ...baseMeta, ai_processing_status: "failed", ai_processing_error: msg },
      }).eq("id", body.podcast_id);
      throw new Error(`falha na IA: ${msg}`);
    }

    const nextMetadata: Record<string, any> = {
      ...baseMeta,
      ai_processing_status: "success",
      ai_processing_error: null,
      ai_processed_at: new Date().toISOString(),
      ai_summary: ai.ai_summary ?? null,
      topics: ai.topics ?? [],
      key_moments: ai.key_moments ?? [],
      reflection_questions: ai.reflection_questions ?? [],
      ideal_audience: ai.ideal_audience ?? [],
      recommended_contexts: ai.recommended_contexts ?? [],
      not_recommended_contexts: ai.not_recommended_contexts ?? [],
      emotional_depth: ai.emotional_depth ?? "media",
      alt_title_suggestion: ai.alt_title_suggestion ?? null,
      cta_suggestion: ai.cta_suggestion ?? null,
      recommendation_reason_template: ai.recommendation_reason_template ?? null,
      analysis_confidence: ai.analysis_confidence ?? "medium",
      needs_more_info: ai.needs_more_info ?? false,
      needs_more_info_message: ai.needs_more_info_message ?? null,
    };

    const patch: Record<string, unknown> = { metadata: nextMetadata };
    if (!pod.long_description && typeof ai.long_description_suggestion === "string") {
      patch.long_description = ai.long_description_suggestion;
    }
    if (Array.isArray(ai.ideal_audience)) {
      const merged = Array.from(new Set([...(pod.audience_tags ?? []), ...ai.ideal_audience.map((t: any) => String(t).toLowerCase().slice(0, 40))])).slice(0, 20);
      patch.audience_tags = merged;
    }
    if (ai.recommendation_weights && typeof ai.recommendation_weights === "object") {
      patch.recommendation_weights = {
        format: "podcast",
        content_mode: podcastMode,
        priority: "deep",
        ...ai.recommendation_weights,
      };
    }

    await admin.from("content_items").update(patch).eq("id", body.podcast_id);

    return new Response(JSON.stringify({ ok: true, ai }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    console.error("process-podcast-video:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});