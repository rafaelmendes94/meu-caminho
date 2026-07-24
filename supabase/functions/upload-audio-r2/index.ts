// Upload audio file to Cloudflare R2 (S3-compat). Only platform_admin.
// Accepts multipart/form-data with fields: file, audio_id (optional), audio_kind (optional).

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { loadR2Config, putObject, publicUrlFor, requirePlatformAdmin } from "../_shared/r2.ts";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXT = ["mp3", "m4a", "wav", "aac", "ogg"];
const ALLOWED_MIME = new Set([
  "audio/mpeg","audio/mp3","audio/mp4","audio/x-m4a","audio/m4a",
  "audio/wav","audio/x-wav","audio/wave",
  "audio/aac","audio/ogg","audio/vorbis","application/ogg",
]);

function extOf(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}
function mimeFromExt(ext: string): string {
  return {
    mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav",
    aac: "audio/aac", ogg: "audio/ogg",
  }[ext] ?? "application/octet-stream";
}

function safeName(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]+/g, "-").replace(/(^-+|-+$)/g, "").slice(0, 120) || "audio";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const auth = await requirePlatformAdmin(req);
  if (auth instanceof Response) {
    return new Response(auth.body, { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("Arquivo ausente.");
    if (file.size <= 0) throw new Error("Arquivo vazio.");
    if (file.size > MAX_SIZE) throw new Error(`Arquivo excede ${MAX_SIZE / (1024 * 1024)}MB.`);

    const originalName = file.name || "audio.mp3";
    const ext = extOf(originalName);
    if (!ALLOWED_EXT.includes(ext)) throw new Error(`Extensão .${ext || "?"} não suportada. Use ${ALLOWED_EXT.join(", ")}.`);
    const mime = ALLOWED_MIME.has(file.type) ? file.type : mimeFromExt(ext);

    const cfg = await loadR2Config();
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const uuid = crypto.randomUUID();
    const audioId = (form.get("audio_id") as string | null) || null;
    const audioKind = ((form.get("audio_kind") as string | null) || "audio").replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "audio";
    const objectKey = `audios/${yyyy}/${mm}/${audioKind}/${uuid}-${safeName(originalName)}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    await putObject(cfg, objectKey, bytes, mime);
    const publicUrl = publicUrlFor(cfg, objectKey);

    return new Response(JSON.stringify({
      success: true,
      provider: "cloudflare_r2",
      public_url: publicUrl,
      object_key: objectKey,
      bucket: cfg.bucket_name,
      file_size: file.size,
      mime_type: mime,
      original_file_name: originalName,
      uploaded_at: new Date().toISOString(),
      audio_id: audioId,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    console.error("upload-audio-r2:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});