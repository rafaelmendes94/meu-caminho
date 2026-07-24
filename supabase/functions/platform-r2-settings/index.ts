// Platform R2 settings: GET / PUT / TEST.
// Only platform_admin can read/write. Secret is never returned in full.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { requirePlatformAdmin, testR2Connection } from "../_shared/r2.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function mask(v: string | null | undefined): string | null {
  if (!v) return null;
  if (v.length <= 8) return "•".repeat(v.length);
  return v.slice(0, 4) + "…" + v.slice(-4);
}

function sanitize(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    provider: row.provider,
    account_id: row.account_id,
    access_key_id: row.access_key_id,
    access_key_id_masked: mask(row.access_key_id),
    secret_configured: !!row.secret_access_key,
    secret_access_key_masked: mask(row.secret_access_key),
    bucket_name: row.bucket_name,
    public_base_url: row.public_base_url,
    region: row.region,
    connection_status: row.connection_status,
    last_test_at: row.last_test_at,
    last_test_message: row.last_test_message,
    last_tested_by: row.last_tested_by,
    updated_at: row.updated_at,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requirePlatformAdmin(req);
  if (auth instanceof Response) {
    return new Response(auth.body, { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const { data: existing } = await admin.from("platform_r2_storage").select("*").limit(1).maybeSingle();
  if (!existing) {
    const { data: created } = await admin.from("platform_r2_storage").insert({ provider: "cloudflare_r2" }).select("*").maybeSingle();
    return new Response(JSON.stringify({ settings: sanitize(created) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (req.method === "GET") {
    return new Response(JSON.stringify({ settings: sanitize(existing) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (req.method === "POST" || req.method === "PUT") {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "test") {
      const cfg = {
        provider: existing.provider ?? "cloudflare_r2",
        account_id: existing.account_id ?? "",
        access_key_id: existing.access_key_id ?? "",
        secret_access_key: existing.secret_access_key ?? "",
        bucket_name: existing.bucket_name ?? "",
        public_base_url: existing.public_base_url ?? null,
        region: existing.region ?? "auto",
      };
      const missing = ["account_id","access_key_id","secret_access_key","bucket_name"].filter((k) => !(cfg as any)[k]);
      if (missing.length) {
        return new Response(JSON.stringify({ ok: false, message: "Faltando: " + missing.join(", ") }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const res = await testR2Connection(cfg as any);
      await admin.from("platform_r2_storage").update({
        connection_status: res.ok ? "ok" : "error",
        last_test_at: new Date().toISOString(),
        last_test_message: res.message,
        last_tested_by: auth.userId,
      }).eq("id", existing.id);
      const { data: fresh } = await admin.from("platform_r2_storage").select("*").eq("id", existing.id).maybeSingle();
      return new Response(JSON.stringify({ ok: res.ok, message: res.message, settings: sanitize(fresh) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const patch: any = {};
    if (typeof body.account_id === "string") patch.account_id = body.account_id.trim() || null;
    if (typeof body.access_key_id === "string") patch.access_key_id = body.access_key_id.trim() || null;
    if (typeof body.secret_access_key === "string" && body.secret_access_key.trim() !== "") patch.secret_access_key = body.secret_access_key.trim();
    if (body.clear_secret === true) patch.secret_access_key = null;
    if (typeof body.bucket_name === "string") patch.bucket_name = body.bucket_name.trim() || null;
    if (typeof body.public_base_url === "string") patch.public_base_url = body.public_base_url.trim() || null;
    if (typeof body.region === "string") patch.region = body.region.trim() || "auto";
    patch.connection_status = "unknown";
    patch.last_test_message = null;

    const { data: updated, error: uErr } = await admin.from("platform_r2_storage").update(patch).eq("id", existing.id).select("*").maybeSingle();
    if (uErr) return new Response(JSON.stringify({ error: uErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ settings: sanitize(updated) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});