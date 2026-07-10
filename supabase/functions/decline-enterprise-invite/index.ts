import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { token, reason } = body ?? {};
    if (!token) return json({ error: "token_required" }, 400);
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const token_hash = await sha256(String(token));
    const { data: invite } = await admin.from("enterprise_invites").select("*").eq("token_hash", token_hash).maybeSingle();
    if (!invite) return json({ error: "invalid_token" }, 404);
    if (invite.accepted_at) return json({ error: "already_accepted" }, 409);
    if (invite.declined_at) return json({ ok: true, already: true });
    if (invite.canceled_at) return json({ error: "canceled" }, 409);

    await admin.from("enterprise_invites").update({ declined_at: new Date().toISOString() }).eq("id", invite.id);
    await admin.from("organization_audit_logs").insert({
      organization_id: invite.organization_id, actor_user_id: null, action: "invite.decline",
      entity_type: "enterprise_invite", entity_id: invite.id,
      metadata: { email: invite.email, reason: reason ?? null },
    });
    return json({ ok: true });
  } catch (e) {
    console.error("decline-enterprise-invite failed", e);
    return json({ error: (e as Error).message }, 500);
  }
});