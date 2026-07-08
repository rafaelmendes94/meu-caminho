import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "unauthorized" }, 401);

    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { organization_name, slug, cnpj, domain } = body ?? {};
    if (!organization_name || !slug) return json({ error: "organization_name and slug required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // ensure user has no org yet
    const { data: existingProfile } = await admin.from("profiles").select("organization_id").eq("id", userId).maybeSingle();
    if (existingProfile?.organization_id) return json({ error: "user_already_in_organization" }, 409);

    const { data: org, error: orgErr } = await admin
      .from("organizations")
      .insert({ name: organization_name, slug, cnpj: cnpj ?? null, domain: domain ?? null, licenses_total: 10, licenses_used: 1 })
      .select("*")
      .single();
    if (orgErr) return json({ error: orgErr.message }, 400);

    await admin.from("profiles").upsert({ id: userId, organization_id: org.id });
    await admin.from("user_roles").delete().eq("user_id", userId).eq("role", "b2c_user");
    await admin.from("user_roles").insert({ user_id: userId, organization_id: org.id, role: "owner" });

    return json({ organization: org });
  } catch (e) {
    console.error("create-organization-admin failed", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}