import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || `org-${Date.now()}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!jwt) return json({ error: "unauthorized" }, 401);

    const authed = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: me } = await authed.auth.getUser();
    if (!me.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: isAdmin } = await admin.rpc("is_platform_admin");
    // is_platform_admin uses auth.uid(); call through the user-scoped client:
    const { data: isAdmin2 } = await authed.rpc("is_platform_admin");
    if (!isAdmin && !isAdmin2) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const {
      full_name, email, phone,
      organization_id, organization_name,
      plan = "starter", licenses_total = 10,
      subscription_status = "trialing",
      cnpj, domain,
    } = body ?? {};

    if (!full_name || !email) return json({ error: "full_name and email required" }, 400);

    // Resolve or create organization
    let orgId = organization_id as string | undefined;
    let orgName = organization_name as string | undefined;
    if (!orgId) {
      if (!organization_name) return json({ error: "organization_name required" }, 400);
      const slug = slugify(organization_name);
      const trialEndsAt = subscription_status === "trialing"
        ? new Date(Date.now() + 14 * 86400000).toISOString() : null;
      const { data: newOrg, error: orgErr } = await admin.from("organizations").insert({
        name: organization_name, slug, plan, licenses_total, licenses_used: 0,
        subscription_status, trial_ends_at: trialEndsAt, cnpj, domain,
      }).select("id, name").single();
      if (orgErr) return json({ error: `org_create_failed: ${orgErr.message}` }, 400);
      orgId = newOrg.id;
      orgName = newOrg.name;
    } else {
      const { data: o } = await admin.from("organizations").select("name").eq("id", orgId).maybeSingle();
      orgName = o?.name;
    }

    // Create auth user (or reuse existing by email)
    let userId: string | null = null;
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email, email_confirm: false, user_metadata: { full_name },
    });
    if (cErr) {
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email?.toLowerCase() === String(email).toLowerCase());
      if (!existing) return json({ error: `user_create_failed: ${cErr.message}` }, 400);
      userId = existing.id;
    } else {
      userId = created.user!.id;
    }

    // Send invitation email (magic link)
    const redirectTo = `${new URL(req.url).origin.replace("supabase.co", "lovable.app")}/`;
    await admin.auth.admin.inviteUserByEmail(email, { data: { full_name }, redirectTo }).catch(() => {});

    // Ensure profile
    await admin.from("profiles").upsert({
      id: userId!, full_name, display_name: full_name, phone: phone ?? null,
      organization_id: orgId,
    }, { onConflict: "id" });

    // Assign owner role in the org
    await admin.from("user_roles").upsert(
      { user_id: userId, organization_id: orgId, role: "owner" },
      { onConflict: "user_id,role,organization_id" },
    );

    // Audit
    await admin.from("platform_audit_logs").insert({
      actor_user_id: me.user.id,
      action: "owner.create",
      entity_type: "owner",
      entity_id: userId,
      organization_id: orgId,
      metadata: { email, organization_name: orgName, plan, licenses_total },
    });

    return json({ ok: true, user_id: userId, organization_id: orgId });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});