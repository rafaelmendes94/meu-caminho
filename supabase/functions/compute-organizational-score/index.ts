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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const runAll: boolean = body?.all === true;

    let orgIds: string[] = [];

    if (runAll) {
      const { data: orgs, error } = await admin.from("organizations").select("id");
      if (error) return json({ error: error.message }, 500);
      orgIds = (orgs ?? []).map((o: { id: string }) => o.id);
    } else {
      // manual call: use caller's org after role check
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return json({ error: "unauthorized" }, 401);
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

      const { data: profile } = await admin
        .from("profiles").select("organization_id").eq("id", userData.user.id).maybeSingle();
      const orgId = profile?.organization_id;
      if (!orgId) return json({ error: "no_organization" }, 400);

      const { data: roles } = await admin
        .from("user_roles").select("role").eq("user_id", userData.user.id);
      const rset = new Set((roles ?? []).map((r: { role: string }) => r.role));
      if (!rset.has("owner") && !rset.has("rh_admin")) return json({ error: "forbidden" }, 403);

      orgIds = [orgId];
    }

    const results: Array<{ organization_id: string; ok: boolean; error?: string }> = [];

    for (const orgId of orgIds) {
      const { data: calc, error: calcErr } = await admin.rpc("calculate_organizational_score", {
        _organization_id: orgId,
      });
      if (calcErr || !calc) {
        results.push({ organization_id: orgId, ok: false, error: calcErr?.message ?? "calc_failed" });
        continue;
      }
      const row = calc as Record<string, unknown>;
      const { error: upErr } = await admin
        .from("organizational_scores")
        .upsert(
          {
            organization_id: orgId,
            score_date: row.score_date as string,
            overall_score: row.overall_score as number | null,
            energy_score: row.energy_score as number | null,
            engagement_score: row.engagement_score as number | null,
            communication_score: row.communication_score as number | null,
            equilibrium_score: row.equilibrium_score as number | null,
            recovery_score: row.recovery_score as number | null,
            participation_score: row.participation_score as number | null,
            risk_penalty: (row.risk_penalty as number) ?? 0,
            confidence: (row.confidence as number) ?? 0,
            evidence: row.evidence ?? {},
          },
          { onConflict: "organization_id,score_date" },
        );
      results.push({ organization_id: orgId, ok: !upErr, error: upErr?.message });
    }

    return json({ ok: true, count: results.length, results });
  } catch (e) {
    console.error("compute-organizational-score error", e);
    return json({ error: (e as Error).message }, 500);
  }
});