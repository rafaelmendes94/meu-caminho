import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);
    const userId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const title = String(body?.title ?? "").trim().slice(0, 160);
    const message = String(body?.message ?? "").trim().slice(0, 4000);
    const actionUrl = body?.action_url ? String(body.action_url).slice(0, 500) : null;
    const tone = body?.tone ? String(body.tone).slice(0, 40) : null;
    if (!title || !message) return json({ error: "title_and_message_required" }, 400);

    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r: any) => r.role));
    if (!roleSet.has("owner") && !roleSet.has("rh_admin") && !roleSet.has("platform_admin")) {
      return json({ error: "forbidden" }, 403);
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = (profile as any)?.organization_id;
    if (!orgId) return json({ error: "no_organization" }, 400);

    const { data: members, error: memErr } = await admin
      .from("profiles")
      .select("id")
      .eq("organization_id", orgId)
      .is("deleted_at", null);
    if (memErr) return json({ error: memErr.message }, 500);

    const recipients = (members ?? []).map((m: any) => m.id).filter(Boolean);
    if (recipients.length === 0) return json({ error: "no_recipients" }, 400);

    const rows = recipients.map((uid: string) => ({
      user_id: uid,
      organization_id: orgId,
      type: "announcement",
      title,
      body: message,
      action_url: actionUrl,
      metadata: { sent_by: userId, tone },
    }));

    // Insert in chunks to avoid large payloads.
    const chunkSize = 500;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error: insErr } = await admin.from("notifications").insert(chunk);
      if (insErr) return json({ error: insErr.message, inserted }, 500);
      inserted += chunk.length;
    }

    return json({ ok: true, recipients: inserted, organization_id: orgId });
  } catch (e) {
    console.error("broadcast-org-announcement error", e);
    return json({ error: (e as Error).message }, 500);
  }
});