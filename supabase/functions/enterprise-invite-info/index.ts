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
    const { token } = body ?? {};
    if (!token || typeof token !== "string") return json({ error: "token_required" }, 400);
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const token_hash = await sha256(token);
    const { data: invite } = await admin
      .from("enterprise_invites")
      .select("email, full_name, role, expires_at, accepted_at, canceled_at, declined_at, organization_id")
      .eq("token_hash", token_hash)
      .maybeSingle();
    if (!invite) return json({ error: "invalid_token" }, 404);
    let status: string = "valid";
    if (invite.accepted_at) status = "accepted";
    else if (invite.canceled_at) status = "canceled";
    else if (invite.declined_at) status = "declined";
    else if (new Date(invite.expires_at as string).getTime() < Date.now()) status = "expired";
    const { data: org } = await admin
      .from("organizations")
      .select("name, logo_url")
      .eq("id", invite.organization_id)
      .maybeSingle();
    return json({
      status,
      email: invite.email,
      full_name: invite.full_name,
      role: invite.role,
      organization_name: org?.name ?? null,
      organization_logo: org?.logo_url ?? null,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}