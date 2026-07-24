// Delete an audio object from Cloudflare R2. Only platform_admin.
// Body: { object_key: string, audio_id?: string, clear_from_content?: boolean }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { loadR2Config, deleteObject, requirePlatformAdmin } from "../_shared/r2.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requirePlatformAdmin(req);
  if (auth instanceof Response) {
    return new Response(auth.body, { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json();
    const objectKey: string | undefined = body?.object_key;
    if (!objectKey) throw new Error("object_key obrigatório.");
    const cfg = await loadR2Config();
    await deleteObject(cfg, objectKey);

    if (body?.audio_id && body?.clear_from_content) {
      const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
      const { data: it } = await admin.from("content_items").select("metadata").eq("id", body.audio_id).maybeSingle();
      if (it) {
        const meta = { ...((it.metadata as any) ?? {}) };
        delete meta.audio_url;
        delete meta.audio_path;
        delete meta.audio_bucket;
        delete meta.original_file_name;
        delete meta.original_file_size;
        delete meta.mime_type;
        await admin.from("content_items").update({ media_url: null, metadata: meta }).eq("id", body.audio_id);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});