// Gerencia a configuração global de IA (Gemini) usada por todas as edge functions.
// Acessível apenas para usuários com papel `platform_admin`.
//
// Rotas:
//   GET  /                 -> config atual (chave sempre mascarada)
//   POST /                 -> atualiza campos permitidos; se enviar `gemini_api_key`, substitui
//   POST /test             -> executa "ping" contra Gemini com prompt "Responda apenas: ok"
//
// A API key nunca é retornada — apenas `key_last4` mascarado.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { chatCompletion, invalidateSettingsCache, loadPlatformAiSettings } from "../_shared/gemini.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function toPublic(row: Record<string, unknown> | null) {
  if (!row) return null;
  const { gemini_api_key: _omit, ...rest } = row as Record<string, unknown>;
  return {
    ...rest,
    key_configured: !!(row as any).gemini_api_key,
    key_last4: (row as any).key_last4 ?? null,
  };
}

async function requirePlatformAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return { error: json({ error: "unauthorized" }, 401) };
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes?.user) return { error: json({ error: "unauthorized" }, 401) };
  const { data: role } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userRes.user.id)
    .eq("role", "platform_admin")
    .maybeSingle();
  if (!role) return { error: json({ error: "forbidden" }, 403) };
  return { admin, user: userRes.user };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requirePlatformAdmin(req);
    if ("error" in auth) return auth.error;
    const { admin } = auth;

    const url = new URL(req.url);
    const isTest = url.pathname.endsWith("/test") || url.searchParams.get("action") === "test";

    // GET current config
    if (req.method === "GET") {
      const { data } = await admin
        .from("platform_ai_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      return json({ settings: toPublic(data) });
    }

    if (req.method === "POST" && isTest) {
      const started = Date.now();
      try {
        const settings = await loadPlatformAiSettings();
        if (!settings.gemini_api_key) {
          return json({ success: false, error: "Chave da API do Gemini não configurada." }, 400);
        }
        const resp = await chatCompletion({
          model: settings.default_model,
          messages: [
            { role: "system", content: "Responda exatamente e apenas: ok" },
            { role: "user", content: "ping" },
          ],
          max_tokens: 8,
          temperature: 0,
        });
        const latency = Date.now() - started;
        const output = resp.choices?.[0]?.message?.content?.trim() ?? "";
        await admin
          .from("platform_ai_settings")
          .update({
            test_status: "success",
            tested_at: new Date().toISOString(),
            tested_model: resp.model,
            test_latency_ms: latency,
            test_error: null,
          })
          .not("id", "is", null);
        return json({ success: true, model: resp.model, latency_ms: latency, sample: output });
      } catch (e: any) {
        const latency = Date.now() - started;
        const msg = e?.detail || e?.message || "Erro desconhecido";
        const friendly = friendlyError(msg, e?.status);
        await admin
          .from("platform_ai_settings")
          .update({
            test_status: "failed",
            tested_at: new Date().toISOString(),
            test_latency_ms: latency,
            test_error: friendly,
          })
          .not("id", "is", null);
        return json({ success: false, error: friendly, latency_ms: latency }, 200);
      }
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const patch: Record<string, unknown> = {};
      if (typeof body.default_model === "string") patch.default_model = body.default_model;
      if (typeof body.fallback_model === "string") patch.fallback_model = body.fallback_model;
      if (typeof body.embedding_model === "string") patch.embedding_model = body.embedding_model;
      if (typeof body.temperature === "number") patch.temperature = clampNumber(body.temperature, 0, 2);
      if (typeof body.max_tokens === "number") patch.max_tokens = Math.max(1, Math.min(32768, Math.floor(body.max_tokens)));
      if (typeof body.provider === "string") patch.provider = body.provider;
      if (typeof body.gemini_api_key === "string" && body.gemini_api_key.trim()) {
        const key = body.gemini_api_key.trim();
        patch.gemini_api_key = key;
        patch.key_last4 = key.slice(-4);
        // Ao trocar chave, invalida cache e status de teste.
        patch.test_status = null;
        patch.tested_at = null;
        patch.test_error = null;
      }
      if (Object.keys(patch).length === 0) return json({ error: "empty_patch" }, 400);

      const { data: existing } = await admin
        .from("platform_ai_settings")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await admin.from("platform_ai_settings").update(patch).eq("id", existing.id);
      } else {
        await admin.from("platform_ai_settings").insert(patch);
      }
      invalidateSettingsCache();

      const { data: updated } = await admin
        .from("platform_ai_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      return json({ settings: toPublic(updated) });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (e) {
    return json({ error: "server_error", detail: String(e) }, 500);
  }
});

function clampNumber(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function friendlyError(msg: string, status?: number): string {
  const s = String(msg).toLowerCase();
  if (status === 401 || s.includes("api_key_invalid") || s.includes("api key not valid") || s.includes("permission_denied")) {
    return "Chave do Gemini inválida ou sem permissão. Verifique a API key.";
  }
  if (status === 429 || s.includes("rate")) {
    return "Limite de requisições atingido. Aguarde alguns segundos e tente de novo.";
  }
  if (status === 402 || s.includes("quota") || s.includes("billing")) {
    return "Cota/faturamento do Gemini indisponível. Verifique o billing da conta Google.";
  }
  if (s.includes("not_configured")) return "Chave da API do Gemini ainda não foi configurada.";
  if (s.includes("model") && s.includes("not found")) return "Modelo selecionado não existe no Gemini. Escolha outro.";
  return msg.slice(0, 240);
}