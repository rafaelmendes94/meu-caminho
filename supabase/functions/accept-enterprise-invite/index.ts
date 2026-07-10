import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { token, full_name, password, accepted_privacy } = body ?? {};
    if (!token || !password) return json({ error: "token and password required" }, 400);
    if (!accepted_privacy) return json({ error: "privacy_consent_required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const token_hash = await sha256(token);

    const { data: invite, error: invErr } = await admin
      .from("enterprise_invites")
      .select("*")
      .eq("token_hash", token_hash)
      .maybeSingle();
    if (invErr || !invite) return json({ error: "invalid_token" }, 404);
    if (invite.accepted_at) return json({ error: "already_accepted" }, 409);
    if (invite.canceled_at) return json({ error: "canceled" }, 410);
    if (invite.declined_at) return json({ error: "declined" }, 410);
    if (new Date(invite.expires_at).getTime() < Date.now()) return json({ error: "expired" }, 410);

    // Try to create user; if already exists we fetch id
    let userId: string | null = null;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name ?? invite.full_name ?? null },
    });
    if (createErr) {
      // find existing user
      const { data: list } = await admin.auth.admin.listUsers();
      const found = list?.users?.find((u) => u.email?.toLowerCase() === invite.email.toLowerCase());
      if (!found) return json({ error: createErr.message }, 400);
      userId = found.id;
    } else {
      userId = created.user!.id;
    }

    await admin.from("profiles").upsert({
      id: userId,
      organization_id: invite.organization_id,
      full_name: full_name ?? invite.full_name ?? null,
      job_title: invite.job_title ?? null,
      department: invite.department ?? null,
      department_id: invite.department_id ?? null,
      unit_id: invite.unit_id ?? null,
      manager_id: invite.manager_id ?? null,
    });

    await admin.from("user_roles").delete().eq("user_id", userId).eq("role", "b2c_user");
    await admin.from("user_roles").insert({ user_id: userId, organization_id: invite.organization_id, role: invite.role }).select();

    await admin.from("privacy_consents").insert({
      user_id: userId,
      organization_id: invite.organization_id,
      consent_type: "enterprise_privacy",
      version: "v1.0",
      user_agent: req.headers.get("user-agent") ?? null,
    });

    await admin.from("enterprise_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

    // increment licenses_used
    const { data: org } = await admin.from("organizations").select("licenses_used").eq("id", invite.organization_id).maybeSingle();
    if (org) {
      await admin.from("organizations").update({ licenses_used: (org.licenses_used ?? 0) + 1 }).eq("id", invite.organization_id);
    }

    return json({ success: true, email: invite.email });
  } catch (e) {
    console.error("accept-enterprise-invite failed", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}