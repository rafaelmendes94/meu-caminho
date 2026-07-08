import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const VALID_ROLES = new Set(["employee", "leader", "rh_admin"]);

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
    const { email, full_name, job_title, department, role, department_id, unit_id, manager_id } = body ?? {};
    if (!email) return json({ error: "email required" }, 400);
    const finalRole = VALID_ROLES.has(role) ? role : "employee";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: profile } = await admin.from("profiles").select("organization_id").eq("id", userId).maybeSingle();
    if (!profile?.organization_id) return json({ error: "no_organization" }, 403);
    const orgId = profile.organization_id;

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId).eq("organization_id", orgId);
    const roleList = (roles ?? []).map((r: { role: string }) => r.role);
    if (!roleList.includes("owner") && !roleList.includes("rh_admin")) return json({ error: "forbidden" }, 403);

    const token = randomToken();
    const token_hash = await sha256(token);

    const { data: invite, error: insErr } = await admin
      .from("enterprise_invites")
      .insert({
        organization_id: orgId,
        email: String(email).toLowerCase().trim(),
        full_name: full_name ?? null,
        job_title: job_title ?? null,
        department: department ?? null,
        department_id: department_id ?? null,
        unit_id: unit_id ?? null,
        manager_id: manager_id ?? null,
        role: finalRole,
        token_hash,
        invited_by: userId,
      })
      .select("*")
      .single();
    if (insErr) return json({ error: insErr.message }, 400);

    const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
    const baseUrl = origin ? new URL(origin).origin : "";
    const invite_link = `${baseUrl}/enterprise/convite/${token}`;

    let emailSent = false;
    if (RESEND_API_KEY && LOVABLE_API_KEY) {
      try {
        const r = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": RESEND_API_KEY,
          },
          body: JSON.stringify({
            from: "Meu Caminho Enterprise <onboarding@resend.dev>",
            to: [email],
            subject: "Convite para o Meu Caminho Enterprise",
            html: `<p>Olá${full_name ? " " + full_name : ""},</p><p>Você foi convidado para o Meu Caminho Enterprise.</p><p><a href="${invite_link}">Aceitar convite</a></p>`,
          }),
        });
        emailSent = r.ok;
      } catch (e) {
        console.warn("resend send failed", e);
      }
    }

    return json({ invite: { id: invite.id, email: invite.email, role: invite.role }, invite_link, email_sent: emailSent });
  } catch (e) {
    console.error("send-enterprise-invite failed", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}