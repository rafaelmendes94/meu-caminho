import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Ações: publish (draft -> published, snapshot em ai_prompt_versions),
//        rollback (restaura snapshot de versão anterior como novo draft),
//        archive (arquiva a config).
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "missing_auth" }, 401);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await userClient.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return json({ error: "unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("is_platform_admin");
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const { prompt_config_id, action, target_version, notes = null, benchmark_id = null, experiment_id = null } = body ?? {};
    if (!prompt_config_id || !["publish", "rollback", "archive"].includes(action)) {
      return json({ error: "invalid_request" }, 400);
    }

    const { data: cfg, error: cfgErr } = await admin.from("ai_prompt_configs").select("*").eq("id", prompt_config_id).maybeSingle();
    if (cfgErr || !cfg) return json({ error: "config_not_found" }, 404);
    const from_version = cfg.version;
    let to_version = from_version;

    if (action === "publish") {
      to_version = (from_version ?? 0) + 1;
      const snapshot = {
        system_instructions: cfg.system_instructions,
        tone_config: cfg.tone_config,
        output_structure: cfg.output_structure,
        suggested_questions: cfg.suggested_questions,
        examples: cfg.examples,
        guardrails: cfg.guardrails,
        model_config: cfg.model_config,
      };
      await admin.from("ai_prompt_versions").insert({
        prompt_config_id, version: to_version, snapshot,
        change_note: notes ?? "publish via ai-lab", created_by: userId,
      });
      await admin.from("ai_prompt_configs").update({
        status: "published", version: to_version, published_at: new Date().toISOString(), updated_by: userId,
      }).eq("id", prompt_config_id);
    } else if (action === "rollback") {
      if (!target_version) return json({ error: "target_version_required" }, 400);
      const { data: ver, error: vErr } = await admin.from("ai_prompt_versions")
        .select("*").eq("prompt_config_id", prompt_config_id).eq("version", target_version).maybeSingle();
      if (vErr || !ver) return json({ error: "version_not_found" }, 404);
      const s = ver.snapshot ?? {};
      to_version = (from_version ?? 0) + 1;
      // Restaura como nova versão (nunca sobrescreve histórico)
      await admin.from("ai_prompt_configs").update({
        system_instructions: s.system_instructions ?? cfg.system_instructions,
        tone_config: s.tone_config ?? cfg.tone_config,
        output_structure: s.output_structure ?? cfg.output_structure,
        suggested_questions: s.suggested_questions ?? cfg.suggested_questions,
        examples: s.examples ?? cfg.examples,
        guardrails: s.guardrails ?? cfg.guardrails,
        model_config: s.model_config ?? cfg.model_config,
        status: "published", version: to_version, published_at: new Date().toISOString(), updated_by: userId,
      }).eq("id", prompt_config_id);
      await admin.from("ai_prompt_versions").insert({
        prompt_config_id, version: to_version, snapshot: s,
        change_note: notes ?? `rollback to v${target_version}`, created_by: userId,
      });
    } else if (action === "archive") {
      await admin.from("ai_prompt_configs").update({ status: "archived", updated_by: userId }).eq("id", prompt_config_id);
    }

    const { data: pub } = await admin.from("ai_lab_publications").insert({
      prompt_config_id, action, from_version, to_version, benchmark_id, experiment_id, notes, created_by: userId,
    }).select().single();

    await admin.from("ai_lab_logs").insert({
      action: `publication.${action}`, actor_id: userId,
      target_kind: "prompt_config", target_id: prompt_config_id,
      payload: { from_version, to_version, benchmark_id, experiment_id },
    });

    return json({ ok: true, publication: pub, from_version, to_version });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});