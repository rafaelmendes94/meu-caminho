import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Compute daily aggregated usage per organization.
// No individual data is exposed — only counts per org.

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json().catch(() => ({}));
    const targetDate: string = body?.date ?? new Date().toISOString().slice(0, 10);
    const singleOrgId: string | undefined = body?.organization_id;

    const dayStart = `${targetDate}T00:00:00.000Z`;
    const dayEnd = `${targetDate}T23:59:59.999Z`;

    let orgQuery = supabase.from('organizations').select('id');
    if (singleOrgId) orgQuery = orgQuery.eq('id', singleOrgId);
    const { data: orgs, error: orgErr } = await orgQuery;
    if (orgErr) throw orgErr;

    const processed: string[] = [];
    for (const org of orgs ?? []) {
      const orgId = org.id as string;

      const counts = async (table: string, dateCol: string) => {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .gte(dateCol, dayStart)
          .lte(dateCol, dayEnd);
        return count ?? 0;
      };

      const [
        checkinsCount,
        pulsesCount,
        dnaCount,
        actionPlansCount,
        ritualsCount,
      ] = await Promise.all([
        counts('emotional_checkins', 'created_at'),
        counts('pulse_responses', 'responded_at'),
        counts('organizational_dna_reports', 'generated_at'),
        counts('action_plans', 'created_at'),
        counts('intelligent_rituals', 'created_at'),
      ]);

      // Executive AI messages
      const { data: convIds } = await supabase
        .from('executive_ai_conversations')
        .select('id')
        .eq('organization_id', orgId);
      const conversationIds = (convIds ?? []).map((c: any) => c.id);
      let execMessages = 0;
      if (conversationIds.length > 0) {
        const { count } = await supabase
          .from('executive_ai_messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .gte('created_at', dayStart)
          .lte('created_at', dayEnd);
        execMessages = count ?? 0;
      }

      // Active users (checkins ∪ pulses)
      const [{ data: ecu }, { data: pru }] = await Promise.all([
        supabase.from('emotional_checkins').select('user_id')
          .eq('organization_id', orgId).gte('created_at', dayStart).lte('created_at', dayEnd),
        supabase.from('pulse_responses').select('user_id')
          .eq('organization_id', orgId).gte('responded_at', dayStart).lte('responded_at', dayEnd),
      ]);
      const uniq = new Set<string>();
      (ecu ?? []).forEach((r: any) => uniq.add(r.user_id));
      (pru ?? []).forEach((r: any) => uniq.add(r.user_id));

      const aiMessages = execMessages; // approximate: total user-facing IA
      // Tokens/cost approximation (no per-message token stored yet)
      const tokensIn = aiMessages * 800;
      const tokensOut = aiMessages * 400;
      const costCents = Math.round(((tokensIn + tokensOut) / 1000) * 0.15); // rough placeholder

      const row = {
        organization_id: orgId,
        usage_date: targetDate,
        active_users: uniq.size,
        checkins_count: checkinsCount,
        pulses_count: pulsesCount,
        ai_messages_count: aiMessages,
        executive_ai_messages_count: execMessages,
        dna_reports_count: dnaCount,
        action_plans_count: actionPlansCount,
        rituals_count: ritualsCount,
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        estimated_ai_cost_cents: costCents,
      };

      const { error: upErr } = await supabase
        .from('platform_usage_daily')
        .upsert(row, { onConflict: 'organization_id,usage_date' });
      if (upErr) throw upErr;
      processed.push(orgId);
    }

    return new Response(JSON.stringify({ ok: true, processed, date: targetDate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('compute-platform-usage error', e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});