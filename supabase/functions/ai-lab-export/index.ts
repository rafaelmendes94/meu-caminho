import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED = new Set(["ai_lab_runs", "ai_lab_benchmarks", "ai_lab_evaluations", "ai_lab_publications", "ai_lab_logs", "ai_lab_datasets", "ai_lab_dataset_items"]);

function toCsv(rows: any[]): string {
  if (!rows.length) return "";
  const cols = Array.from(rows.reduce<Set<string>>((s, r) => { Object.keys(r).forEach(k => s.add(k)); return s; }, new Set()));
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
}

// Exporta uma tabela do AI Lab em CSV ou JSON. Somente platform_admin.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "missing_auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: u } = await userClient.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: isAdmin } = await admin.rpc("is_platform_admin");
    if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const { table, format = "csv", filters = {}, limit = 1000 } = body ?? {};
    if (!ALLOWED.has(table)) return new Response(JSON.stringify({ error: "table_not_allowed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let q = admin.from(table).select("*").order("created_at", { ascending: false }).limit(Math.min(Number(limit) || 1000, 10000));
    for (const [k, v] of Object.entries(filters ?? {})) q = q.eq(k, v as any);
    const { data, error } = await q;
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    await admin.from("ai_lab_logs").insert({
      action: "export.download", actor_id: userId, target_kind: table, target_id: null,
      payload: { format, count: data?.length ?? 0, filters },
    });

    if (format === "json") {
      return new Response(JSON.stringify(data ?? [], null, 2), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Content-Disposition": `attachment; filename="${table}.json"` },
      });
    }
    return new Response(toCsv(data ?? []), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${table}.csv"` },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});