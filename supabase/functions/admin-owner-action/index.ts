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

type Action =
  | "suspend" | "reactivate" | "reset_password" | "resend_invite"
  | "soft_delete" | "impersonate" | "update_licenses" | "update_plan"
  | "cancel_subscription" | "renew_trial";

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
    const { data: isAdmin } = await authed.rpc("is_platform_admin");
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const body = await req.json().catch(() => ({}));
    const action: Action = body?.action;
    const userId: string | undefined = body?.user_id;
    const orgId: string | undefined = body?.organization_id;
    if (!action) return json({ error: "action required" }, 400);

    const audit = (metadata: Record<string, unknown>) =>
      admin.from("platform_audit_logs").insert({
        actor_user_id: me.user!.id,
        action: `owner.${action}`,
        entity_type: "owner",
        entity_id: userId ?? null,
        organization_id: orgId ?? null,
        metadata,
      });

    switch (action) {
      case "suspend": {
        if (!orgId) return json({ error: "organization_id required" }, 400);
        const until = body.until ? new Date(body.until).toISOString() : null;
        const { error } = await admin.from("organizations").update({
          suspended_at: new Date().toISOString(),
          suspension_reason: body.reason ?? null,
          suspension_until: until,
          subscription_status: "past_due",
        }).eq("id", orgId);
        if (error) return json({ error: error.message }, 400);
        await audit({ reason: body.reason, until });
        return json({ ok: true });
      }
      case "reactivate": {
        if (!orgId) return json({ error: "organization_id required" }, 400);
        const { error } = await admin.from("organizations").update({
          suspended_at: null, suspension_reason: null, suspension_until: null,
          subscription_status: "active",
        }).eq("id", orgId);
        if (error) return json({ error: error.message }, 400);
        await audit({});
        return json({ ok: true });
      }
      case "reset_password": {
        if (!body.email) return json({ error: "email required" }, 400);
        const { error } = await admin.auth.resetPasswordForEmail(body.email);
        if (error) return json({ error: error.message }, 400);
        await audit({ email: body.email });
        return json({ ok: true });
      }
      case "resend_invite": {
        if (!body.email) return json({ error: "email required" }, 400);
        const { error } = await admin.auth.admin.inviteUserByEmail(body.email);
        if (error) return json({ error: error.message }, 400);
        await audit({ email: body.email });
        return json({ ok: true });
      }
      case "soft_delete": {
        if (!orgId) return json({ error: "organization_id required" }, 400);
        const { error } = await admin.from("organizations").update({
          deleted_at: new Date().toISOString(),
          subscription_status: "canceled",
        }).eq("id", orgId);
        if (error) return json({ error: error.message }, 400);
        await audit({});
        return json({ ok: true });
      }
      case "impersonate": {
        if (!body.email) return json({ error: "email required" }, 400);
        const { data, error } = await admin.auth.admin.generateLink({
          type: "magiclink", email: body.email,
          options: { redirectTo: body.redirect_to ?? undefined },
        });
        if (error) return json({ error: error.message }, 400);
        await audit({ email: body.email });
        return json({ ok: true, action_link: data.properties?.action_link });
      }
      case "update_licenses": {
        if (!orgId) return json({ error: "organization_id required" }, 400);
        const { error } = await admin.from("organizations").update({
          licenses_total: Number(body.licenses_total),
        }).eq("id", orgId);
        if (error) return json({ error: error.message }, 400);
        await audit({ licenses_total: body.licenses_total });
        return json({ ok: true });
      }
      case "update_plan": {
        if (!orgId) return json({ error: "organization_id required" }, 400);
        const { error } = await admin.from("organizations").update({
          plan: body.plan, mrr_cents: body.mrr_cents ?? undefined,
        }).eq("id", orgId);
        if (error) return json({ error: error.message }, 400);
        await audit({ plan: body.plan });
        return json({ ok: true });
      }
      case "cancel_subscription": {
        if (!orgId) return json({ error: "organization_id required" }, 400);
        const { error } = await admin.from("organizations").update({
          subscription_status: "canceled",
        }).eq("id", orgId);
        if (error) return json({ error: error.message }, 400);
        await audit({});
        return json({ ok: true });
      }
      case "renew_trial": {
        if (!orgId) return json({ error: "organization_id required" }, 400);
        const days = Number(body.days ?? 14);
        const { error } = await admin.from("organizations").update({
          subscription_status: "trialing",
          trial_ends_at: new Date(Date.now() + days * 86400000).toISOString(),
          suspended_at: null, suspension_reason: null, suspension_until: null,
        }).eq("id", orgId);
        if (error) return json({ error: error.message }, 400);
        await audit({ days });
        return json({ ok: true });
      }
      default:
        return json({ error: "unknown_action" }, 400);
    }
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});