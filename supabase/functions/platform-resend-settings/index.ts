import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function maskKey(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}${"•".repeat(Math.max(4, key.length - 8))}${key.slice(-4)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "unauthorized" }, 401);

    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: rolesData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const roles = (rolesData ?? []).map((r: { role: string }) => r.role);
    if (!roles.includes("platform_admin")) return json({ error: "forbidden" }, 403);

    if (req.method === "GET") {
      const { data } = await admin
        .from("platform_resend_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      return json({
        configured: !!data?.api_key,
        api_key_masked: maskKey(data?.api_key ?? null),
        from_email: data?.from_email ?? "",
        from_name: data?.from_name ?? "",
        updated_at: data?.updated_at ?? null,
      });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { api_key, from_email, from_name } = body ?? {};
      const patch: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: userData.user.id,
      };
      if (typeof api_key === "string" && api_key.trim().length > 0) {
        patch.api_key = api_key.trim();
      }
      if (typeof from_email === "string") patch.from_email = from_email.trim();
      if (typeof from_name === "string") patch.from_name = from_name.trim();

      const { error } = await admin
        .from("platform_resend_settings")
        .upsert({ id: 1, ...patch }, { onConflict: "id" });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (req.method === "DELETE") {
      const { error } = await admin
        .from("platform_resend_settings")
        .update({ api_key: null, updated_at: new Date().toISOString(), updated_by: userData.user.id })
        .eq("id", 1);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (e) {
    console.error("platform-resend-settings failed", e);
    return json({ error: (e as Error).message }, 500);
  }
});