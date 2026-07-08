import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Severity = "info" | "warning" | "critical";
type Candidate = {
  signal_type: string;
  severity: Severity;
  confidence: number;
  title: string;
  narrative: string;
  evidence: Record<string, unknown>;
};

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
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    const orgId = profile?.organization_id as string | undefined;
    if (!orgId) return json({ error: "no organization" }, 400);

    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
    if (!roleSet.has("owner") && !roleSet.has("rh_admin")) {
      return json({ error: "forbidden" }, 403);
    }

    // Fetch aggregated context via SECURITY DEFINER function
    const { data: ctx, error: ctxErr } = await userClient.rpc(
      "get_predictive_context",
      { _organization_id: orgId, _days: 60 },
    );
    if (ctxErr) return json({ error: ctxErr.message }, 500);

    // deno-lint-ignore no-explicit-any
    const c: any = ctx ?? {};
    const candidates: Candidate[] = [];

    const checkin = c.checkin_summary ?? {};
    const pulse = c.pulse_summary ?? {};
    const part = c.participation_summary ?? {};

    const participants = Number(checkin.participants ?? 0);
    const avgEnergy = num(checkin.avg_energy);
    const avgStress = num(checkin.avg_stress);

    const pulseEnergy = num(pulse?.energy?.avg);
    const pulseEngagement = num(pulse?.engagement?.avg);
    const pulseCommunication = num(pulse?.communication?.avg);
    const pulseRecovery = num(pulse?.recovery?.avg);

    const engCurr = num(part.engagement_current);
    const engPrev = num(part.engagement_previous);
    const stressCurr = num(part.stress_current);
    const stressPrev = num(part.stress_previous);
    const deltaPct = num(part.delta_pct);

    const hasSample = participants >= 5;

    if (!hasSample) {
      candidates.push({
        signal_type: "insufficient_sample",
        severity: "info",
        confidence: 0.3,
        title: "Amostra insuficiente para análise preditiva confiável",
        narrative:
          "Ainda não há volume mínimo de participação (5+) para gerar sinais preditivos confiáveis no período analisado.",
        evidence: { period_days: 60, participants, rule: "min_participants<5" },
      });
    } else {
      // 1. energy_low
      if ((pulseEnergy !== null && pulseEnergy <= 2.5) || (avgEnergy !== null && avgEnergy <= 2.5)) {
        candidates.push({
          signal_type: "energy_low",
          severity: "warning",
          confidence: 0.7,
          title: "Energia coletiva em queda",
          narrative:
            "Os indicadores agregados de energia estão em patamar baixo. Vale observar cargas, ritmo e momentos de recuperação nas próximas semanas.",
          evidence: { period_days: 60, participants, avg_energy: avgEnergy, pulse_energy: pulseEnergy, rule: "energy<=2.5" },
        });
      }

      // 2. engagement_drop
      const engDrop = engPrev !== null && engCurr !== null && engPrev - engCurr >= 0.4;
      if ((pulseEngagement !== null && pulseEngagement <= 2.7) || engDrop) {
        candidates.push({
          signal_type: "engagement_drop",
          severity: "warning",
          confidence: engDrop ? 0.75 : 0.65,
          title: "Sinal de queda no engajamento",
          narrative:
            "O engajamento coletivo apresenta tendência de queda no período. Recomenda-se revisar clareza de propósito, reconhecimento e ritmo de comunicação.",
          evidence: { period_days: 60, participants, engagement_current: engCurr, engagement_previous: engPrev, pulse_engagement: pulseEngagement, rule: engDrop ? "engagement_drop>=0.4" : "engagement<=2.7" },
        });
      }

      // 3. overload_rising
      const stressRise = stressPrev !== null && stressCurr !== null && stressCurr - stressPrev >= 0.4;
      if ((avgStress !== null && avgStress >= 4.0) || stressRise) {
        candidates.push({
          signal_type: "overload_rising",
          severity: "critical",
          confidence: stressRise ? 0.8 : 0.7,
          title: "Sobrecarga em elevação",
          narrative:
            "Os sinais agregados de estresse indicam aumento da sobrecarga percebida. Considere revisar prioridades, prazos e escuta ativa nas equipes.",
          evidence: { period_days: 60, participants, avg_stress: avgStress, stress_current: stressCurr, stress_previous: stressPrev, rule: stressRise ? "stress_rise>=0.4" : "stress>=4.0" },
        });
      }

      // 4. recovery_deficit
      if (pulseRecovery !== null && pulseRecovery <= 2.5 && ((pulseEnergy !== null && pulseEnergy <= 2.8) || (avgEnergy !== null && avgEnergy <= 2.8))) {
        candidates.push({
          signal_type: "recovery_deficit",
          severity: "warning",
          confidence: 0.7,
          title: "Déficit de recuperação",
          narrative:
            "Recuperação e energia coletiva aparecem simultaneamente baixas. Espaços de pausa, desconexão e cuidado podem ser reforçados.",
          evidence: { period_days: 60, participants, pulse_recovery: pulseRecovery, pulse_energy: pulseEnergy, avg_energy: avgEnergy, rule: "recovery<=2.5 & energy<=2.8" },
        });
      }

      // 5. communication_risk
      if (pulseCommunication !== null && pulseCommunication <= 2.6) {
        candidates.push({
          signal_type: "communication_risk",
          severity: "warning",
          confidence: 0.65,
          title: "Risco em comunicação interna",
          narrative:
            "Indicadores agregados de comunicação apontam fragilidade. Rituais de alinhamento e clareza podem ajudar a reduzir ruído coletivo.",
          evidence: { period_days: 60, participants, pulse_communication: pulseCommunication, rule: "communication<=2.6" },
        });
      }

      // 6. participation_decline
      if (deltaPct !== null && deltaPct <= -25) {
        candidates.push({
          signal_type: "participation_decline",
          severity: "warning",
          confidence: 0.7,
          title: "Queda relevante de participação",
          narrative:
            "A adesão aos check-ins caiu significativamente em relação ao período anterior. Vale reforçar convite, sentido e segurança psicológica.",
          evidence: { period_days: 60, current_participants: part.current_participants, previous_participants: part.previous_participants, delta_pct: deltaPct, rule: "delta<=-25%" },
        });
      }
    }

    // Dedupe: skip if same signal_type is already open in last 7 days
    const sevenDays = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const { data: existing } = await admin
      .from("predictive_signals")
      .select("signal_type")
      .eq("organization_id", orgId)
      .eq("status", "open")
      .gte("detected_at", sevenDays);
    const openTypes = new Set((existing ?? []).map((s: { signal_type: string }) => s.signal_type));

    const toInsert = candidates.filter((c) => !openTypes.has(c.signal_type));
    let inserted = 0;
    if (toInsert.length) {
      const { error } = await admin.from("predictive_signals").insert(
        toInsert.map((s) => ({ ...s, organization_id: orgId })),
      );
      if (error) return json({ error: error.message }, 500);
      inserted = toInsert.length;
    }

    return json({ ok: true, evaluated: candidates.length, inserted });
  } catch (e) {
    console.error("detect-predictive-signals error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}