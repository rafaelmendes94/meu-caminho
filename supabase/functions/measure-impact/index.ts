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

    const admin = createClient(supabaseUrl, serviceKey);
    const userId = userData.user.id;

    const { data: profile } = await admin
      .from("profiles").select("organization_id").eq("id", userId).maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) return json({ error: "no_organization" }, 400);

    const { data: roles } = await admin
      .from("user_roles").select("role").eq("user_id", userId);
    const rset = new Set((roles ?? []).map((r: { role: string }) => r.role));
    if (!rset.has("owner") && !rset.has("rh_admin")) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const source_type = String(body?.source_type ?? "");
    const source_id = String(body?.source_id ?? "");
    if (!["action_plan","ritual","weekly_insight"].includes(source_type)) {
      return json({ error: "invalid_source_type" }, 400);
    }
    if (!source_id) return json({ error: "missing_source_id" }, 400);

    const { data, error } = await admin.rpc("measure_impact", {
      _organization_id: orgId,
      _source_type: source_type,
      _source_id: source_id,
    });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, result: data });
  } catch (e) {
    console.error("measure-impact error", e);
    return json({ error: (e as Error).message }, 500);
  }
});