import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "Meu Caminho Enterprise <no-reply@augustocury.fivestarsmarketing.com.br>";

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "unauthorized" }, 401);
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { action, invite_id } = body ?? {};
    if (!invite_id || !["cancel", "resend"].includes(action)) return json({ error: "invalid_request" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin.from("profiles").select("organization_id").eq("id", userId).maybeSingle();
    if (!profile?.organization_id) return json({ error: "no_organization" }, 403);
    const orgId = profile.organization_id;

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId).eq("organization_id", orgId);
    const roleList = (roles ?? []).map((r: { role: string }) => r.role);
    if (!roleList.includes("owner") && !roleList.includes("rh_admin")) return json({ error: "forbidden" }, 403);

    const { data: invite } = await admin.from("enterprise_invites").select("*").eq("id", invite_id).eq("organization_id", orgId).maybeSingle();
    if (!invite) return json({ error: "invite_not_found" }, 404);
    if (invite.accepted_at) return json({ error: "already_accepted" }, 409);

    if (action === "cancel") {
      if (invite.canceled_at) return json({ error: "already_canceled" }, 409);
      const { error: uErr } = await admin.from("enterprise_invites")
        .update({ canceled_at: new Date().toISOString(), canceled_by: userId })
        .eq("id", invite_id);
      if (uErr) return json({ error: uErr.message }, 400);
      await admin.from("organization_audit_logs").insert({
        organization_id: orgId, actor_user_id: userId, action: "invite.cancel",
        entity_type: "enterprise_invite", entity_id: invite_id,
        before_data: invite as unknown as Record<string, unknown>,
        metadata: { email: invite.email },
      });
      return json({ ok: true });
    }

    // resend
    if (invite.canceled_at || invite.declined_at) return json({ error: "invite_not_active" }, 409);
    const token = randomToken();
    const token_hash = await sha256(token);
    const nowIso = new Date().toISOString();
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error: uErr } = await admin.from("enterprise_invites").update({
      token_hash,
      expires_at: newExpiry,
      last_resent_at: nowIso,
      resent_count: (invite.resent_count ?? 0) + 1,
    }).eq("id", invite_id);
    if (uErr) return json({ error: uErr.message }, 400);

    const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
    const baseUrl = origin ? new URL(origin).origin : "";
    const invite_link = `${baseUrl}/enterprise/convite/${token}`;

    let emailSent = false;
    if (RESEND_API_KEY && LOVABLE_API_KEY) {
      try {
        const r = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": RESEND_API_KEY },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [invite.email],
            subject: "Lembrete: seu convite para o Meu Caminho Enterprise",
            html: `<p>Olá${invite.full_name ? " " + invite.full_name : ""},</p><p>Este é um lembrete do seu convite.</p><p><a href="${invite_link}">Aceitar convite</a></p>`,
          }),
        });
        emailSent = r.ok;
      } catch (e) { console.warn("resend failed", e); }
    }

    await admin.from("organization_audit_logs").insert({
      organization_id: orgId, actor_user_id: userId, action: "invite.resend",
      entity_type: "enterprise_invite", entity_id: invite_id,
      metadata: { email: invite.email, resent_count: (invite.resent_count ?? 0) + 1 },
    });
    return json({ ok: true, invite_link, email_sent: emailSent });
  } catch (e) {
    console.error("manage-enterprise-invite failed", e);
    return json({ error: (e as Error).message }, 500);
  }
});