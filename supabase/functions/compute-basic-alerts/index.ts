import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "unauthorized" }, 401);
    }

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

    // Fetch profile → organization
    const { data: profile } = await admin
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = profile?.organization_id;
    if (!orgId) return json({ error: "no organization" }, 400);

    // Verify role
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
    if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
      return json({ error: "forbidden" }, 403);
    }

    // Aggregate checkin last 30d
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const { data: checkins } = await admin
      .from("emotional_checkins")
      .select("user_id, mood_score, energy_score, stress_score")
      .eq("organization_id", orgId)
      .gte("created_at", since);

    const participants = new Set((checkins ?? []).map((c) => c.user_id)).size;
    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    const avgStress = avg((checkins ?? []).map((c) => Number(c.stress_score)).filter(Number.isFinite));
    const avgEnergy = avg((checkins ?? []).map((c) => Number(c.energy_score)).filter(Number.isFinite));

    // Aggregate pulse engagement
    const { data: pulseRows } = await admin
      .from("pulse_responses")
      .select("user_id, value_num, prompt_id, pulse_prompts!inner(dimension)")
      .eq("organization_id", orgId)
      .gte("responded_at", since);
    const engagementRows = (pulseRows ?? []).filter(
      // deno-lint-ignore no-explicit-any
      (r: any) => r.pulse_prompts?.dimension === "engagement",
    );
    const engagementParticipants = new Set(engagementRows.map((r) => r.user_id)).size;
    const avgEngagement = avg(engagementRows.map((r) => Number(r.value_num)).filter(Number.isFinite));

    type Candidate = {
      alert_type: string;
      severity: "info" | "warning" | "critical";
      title: string;
      message: string;
      evidence: Record<string, unknown>;
    };
    const candidates: Candidate[] = [];

    if (participants < 5) {
      candidates.push({
        alert_type: "insufficient_sample",
        severity: "info",
        title: "Amostra insuficiente",
        message: `Apenas ${participants} colaborador(es) participaram nos últimos 30 dias. Indicadores só são exibidos com 5+.`,
        evidence: { source: "emotional_checkins", period_days: 30, participants },
      });
    } else {
      if (avgStress !== null && avgStress >= 4.0) {
        candidates.push({
          alert_type: "high_stress",
          severity: "critical",
          title: "Estresse coletivo elevado",
          message: `A média de estresse dos últimos 30 dias está em ${avgStress.toFixed(2)}.`,
          evidence: { source: "emotional_checkins", period_days: 30, participants, avg: avgStress },
        });
      }
      if (avgEnergy !== null && avgEnergy <= 2.5) {
        candidates.push({
          alert_type: "low_energy",
          severity: "warning",
          title: "Baixa energia coletiva",
          message: `A média de energia dos últimos 30 dias está em ${avgEnergy.toFixed(2)}.`,
          evidence: { source: "emotional_checkins", period_days: 30, participants, avg: avgEnergy },
        });
      }
    }

    if (engagementParticipants >= 5 && avgEngagement !== null && avgEngagement <= 2.5) {
      candidates.push({
        alert_type: "low_engagement",
        severity: "warning",
        title: "Baixo engajamento coletivo",
        message: `A média de engajamento (pulse) está em ${avgEngagement.toFixed(2)}.`,
        evidence: { source: "pulse_responses", dimension: "engagement", period_days: 30, participants: engagementParticipants, avg: avgEngagement },
      });
    }

    // Dedupe: skip if same alert_type is already open in last 7 days
    const sevenDays = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const { data: existing } = await admin
      .from("alerts")
      .select("alert_type")
      .eq("organization_id", orgId)
      .eq("status", "open")
      .gte("created_at", sevenDays);
    const openTypes = new Set((existing ?? []).map((a: { alert_type: string }) => a.alert_type));

    const toInsert = candidates.filter((c) => !openTypes.has(c.alert_type));
    let inserted = 0;
    if (toInsert.length) {
      const { error } = await admin.from("alerts").insert(
        toInsert.map((c) => ({ ...c, organization_id: orgId })),
      );
      if (error) return json({ error: error.message }, 500);
      inserted = toInsert.length;
    }

    return json({ ok: true, evaluated: candidates.length, inserted });
  } catch (e) {
    console.error("compute-basic-alerts error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}