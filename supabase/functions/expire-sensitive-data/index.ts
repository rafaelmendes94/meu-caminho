import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Cron-invoked: deletes sensitive rows older than each org's retention window.
// Defaults to 90 days when no org override exists.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Default retention from platform_settings
  const { data: setting } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'data_retention_days')
    .maybeSingle();
  const defaultDays = Number(setting?.value?.value ?? setting?.value ?? 90);

  const { data: orgs, error: orgErr } = await supabase
    .from('organizations')
    .select('id');
  if (orgErr) {
    return new Response(JSON.stringify({ error: orgErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const report: Record<string, { retention_days: number; deleted: Record<string, number> }> = {};

  for (const org of orgs ?? []) {
    const { data: override } = await supabase
      .from('organization_settings')
      .select('value')
      .eq('organization_id', org.id)
      .eq('key', 'data_retention_days')
      .maybeSingle();
    const days = Number(override?.value?.value ?? override?.value ?? defaultDays);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const deleted: Record<string, number> = {};

    const tables: Array<[string, string]> = [
      ['emotional_checkins', 'created_at'],
      ['pulse_responses', 'responded_at'],
      ['executive_ai_messages', 'created_at'],
      ['onboarding_messages', 'created_at'],
    ];
    for (const [table, col] of tables) {
      const { count, error } = await supabase
        .from(table)
        .delete({ count: 'exact' })
        .eq('organization_id', org.id)
        .lt(col, cutoff);
      if (error) console.error(`[${table}] org=${org.id}:`, error.message);
      deleted[table] = count ?? 0;
    }
    report[org.id] = { retention_days: days, deleted };
  }

  return new Response(JSON.stringify({ ok: true, report }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});