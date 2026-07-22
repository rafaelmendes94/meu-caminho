import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export type ResendConfig = {
  apiKey: string;
  from: string;
};

export async function loadResendConfig(): Promise<ResendConfig | null> {
  // 1) Preferred: platform_resend_settings (managed via Super Admin panel)
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data } = await admin
      .from("platform_resend_settings")
      .select("api_key, from_email, from_name")
      .eq("id", 1)
      .maybeSingle();
    if (data?.api_key) {
      const name = (data.from_name ?? "Meu Caminho Enterprise").trim();
      const email = (data.from_email ?? "").trim();
      const from = email ? `${name} <${email}>` : name;
      return { apiKey: data.api_key, from };
    }
  } catch (e) {
    console.warn("loadResendConfig: DB lookup failed", e);
  }

  // 2) Fallback: env var
  const envKey = Deno.env.get("RESEND_API_KEY");
  if (envKey) {
    const envFrom = Deno.env.get("RESEND_FROM")
      ?? "Meu Caminho Enterprise <no-reply@augustocury.fivestarsmarketing.com.br>";
    return { apiKey: envKey, from: envFrom };
  }

  return null;
}

export async function sendResendEmail(
  cfg: ResendConfig,
  payload: { to: string | string[]; subject: string; html: string; from?: string },
): Promise<boolean> {
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        from: payload.from ?? cfg.from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });
    if (!r.ok) {
      console.warn("Resend send failed", r.status, await r.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Resend send exception", e);
    return false;
  }
}