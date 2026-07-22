import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { loadResendConfig, sendResendEmail } from "../_shared/resend.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { action, invite_id } = body ?? {};
    if (!invite_id || !["cancel", "resend"].includes(action)) return json({ error: "invalid_request" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin.from("profiles").select("organization_id").eq("id", userId).maybeSingle();
    if (!profile?.organization_id) return json({ error: "no_organization" }, 403);
    const orgId = profile.organization_id;

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId).eq("organization_id", orgId);
    const roleList = (roles ?? []).map((r: { role: string }) => r.role);
    if (!roleList.includes("owner") && !roleList.includes("rh_admin")) return json({ error: "forbidden" }, 403);

    const { data: invite } = await admin.from("enterprise_invites").select("*").eq("id", invite_id).eq("organization_id", orgId).maybeSingle();
    if (!invite) return json({ error: "invite_not_found" }, 404);
    if (invite.accepted_at) return json({ error: "already_accepted" }, 409);

    if (action === "cancel") {
      if (invite.canceled_at) return json({ error: "already_canceled" }, 409);
      const { error: uErr } = await admin.from("enterprise_invites")
        .update({ canceled_at: new Date().toISOString(), canceled_by: userId })
        .eq("id", invite_id);
      if (uErr) return json({ error: uErr.message }, 400);
      await admin.from("organization_audit_logs").insert({
        organization_id: orgId, actor_user_id: userId, action: "invite.cancel",
        entity_type: "enterprise_invite", entity_id: invite_id,
        before_data: invite as unknown as Record<string, unknown>,
        metadata: { email: invite.email },
      });
      return json({ ok: true });
    }

    // resend
    if (invite.canceled_at || invite.declined_at) return json({ error: "invite_not_active" }, 409);
    const token = randomToken();
    const token_hash = await sha256(token);
    const nowIso = new Date().toISOString();
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error: uErr } = await admin.from("enterprise_invites").update({
      token_hash,
      expires_at: newExpiry,
      last_resent_at: nowIso,
      resent_count: (invite.resent_count ?? 0) + 1,
    }).eq("id", invite_id);
    if (uErr) return json({ error: uErr.message }, 400);

    const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
    const baseUrl = origin ? new URL(origin).origin : "";
    const invite_link = `${baseUrl}/enterprise/convite/${token}`;

    // Contexto para email bonito
    const { data: org } = await admin
      .from("organizations")
      .select("name, logo_url")
      .eq("id", orgId)
      .maybeSingle();
    const { data: inviter } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    const [{ data: deptRow }, { data: unitRow }, { data: mgrRow }] = await Promise.all([
      invite.department_id
        ? admin.from("departments").select("name").eq("id", invite.department_id).maybeSingle()
        : Promise.resolve({ data: null }),
      invite.unit_id
        ? admin.from("units").select("name").eq("id", invite.unit_id).maybeSingle()
        : Promise.resolve({ data: null }),
      invite.manager_id
        ? admin.from("profiles").select("full_name").eq("id", invite.manager_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const roleLabel =
      invite.role === "rh_admin" ? "RH / Administrador"
      : invite.role === "leader" ? "Liderança"
      : "Colaborador";

    const expiresDate = new Date(newExpiry).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    const emailHtml = buildReminderEmail({
      recipientName: invite.full_name ?? null,
      orgName: org?.name ?? "sua empresa",
      orgLogo: (org as { logo_url?: string | null } | null)?.logo_url ?? null,
      inviterName: inviter?.full_name ?? null,
      roleLabel,
      jobTitle: invite.job_title ?? null,
      deptName: invite.department ?? (deptRow as { name?: string } | null)?.name ?? null,
      unitName: (unitRow as { name?: string } | null)?.name ?? null,
      mgrName: (mgrRow as { full_name?: string } | null)?.full_name ?? null,
      inviteLink: invite_link,
      expiresLabel: expiresDate,
      resentCount: (invite.resent_count ?? 0) + 1,
    });

    let emailSent = false;
    const resendCfg = await loadResendConfig();
    if (resendCfg) {
      emailSent = await sendResendEmail(resendCfg, {
        to: invite.email,
        subject: `Lembrete: ${org?.name ?? "sua empresa"} está te esperando no Meu Caminho`,
        html: emailHtml,
      });
    }

    await admin.from("organization_audit_logs").insert({
      organization_id: orgId, actor_user_id: userId, action: "invite.resend",
      entity_type: "enterprise_invite", entity_id: invite_id,
      metadata: { email: invite.email, resent_count: (invite.resent_count ?? 0) + 1 },
    });
    return json({ ok: true, invite_link, email_sent: emailSent });
  } catch (e) {
    console.error("manage-enterprise-invite failed", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function esc(s: string | null | undefined) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReminderEmail(p: {
  recipientName: string | null;
  orgName: string;
  orgLogo: string | null;
  inviterName: string | null;
  roleLabel: string;
  jobTitle: string | null;
  deptName: string | null;
  unitName: string | null;
  mgrName: string | null;
  inviteLink: string;
  expiresLabel: string;
  resentCount: number;
}) {
  const greeting = p.recipientName ? `Olá, ${esc(p.recipientName.split(" ")[0])}` : "Olá";
  const rows: Array<[string, string | null]> = [
    ["Empresa", p.orgName],
    ["Papel", p.roleLabel],
    ["Cargo", p.jobTitle],
    ["Departamento", p.deptName],
    ["Unidade", p.unitName],
    ["Gestor imediato", p.mgrName],
  ];
  const detailRows = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #EFEAE4;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8A827B;font-weight:700;width:44%;">${esc(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #EFEAE4;font-size:14px;color:#0B0908;font-weight:600;">${esc(v)}</td>
      </tr>`)
    .join("");
  const logoBlock = p.orgLogo
    ? `<img src="${esc(p.orgLogo)}" alt="${esc(p.orgName)}" width="56" height="56" style="border-radius:14px;display:block;margin:0 auto 16px;object-fit:cover;background:#fff;" />`
    : `<div style="width:56px;height:56px;margin:0 auto 16px;border-radius:14px;background:#F88A2B;color:#0B0908;font-weight:800;font-size:22px;line-height:56px;text-align:center;font-family:Arial,sans-serif;">${esc(p.orgName.charAt(0).toUpperCase())}</div>`;
  const invitedBy = p.inviterName
    ? `${esc(p.inviterName)}, do RH de <strong style="color:#0B0908;">${esc(p.orgName)}</strong>,`
    : `<strong style="color:#0B0908;">${esc(p.orgName)}</strong>`;

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Lembrete de convite — ${esc(p.orgName)}</title>
  </head>
  <body style="margin:0;padding:0;background:#F7F4F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0B0908;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4F2;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(11,9,8,0.06);">
          <tr>
            <td style="background:#0B0908;padding:28px 32px;text-align:center;">
              <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(248,138,43,0.12);color:#F88A2B;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Lembrete de convite</div>
              <h1 style="margin:14px 0 0;color:#FFFFFF;font-size:22px;font-weight:800;letter-spacing:-0.3px;">Meu Caminho Enterprise</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px;text-align:center;">
              ${logoBlock}
              <p style="margin:0;color:#8A827B;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">${esc(p.orgName)}</p>
              <h2 style="margin:8px 0 0;color:#0B0908;font-size:26px;font-weight:800;line-height:1.25;">${greeting},<br/>seu lugar ainda está reservado.</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px;">
              <p style="margin:0 0 20px;color:#5C544D;font-size:14px;line-height:1.6;">${invitedBy} enviou este lembrete porque seu convite para o <strong style="color:#0B0908;">Meu Caminho Enterprise</strong> ainda não foi ativado. Basta um clique para começar sua jornada de autoconhecimento e desenvolvimento dentro da empresa.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F6;border:1px solid #EFEAE4;border-radius:16px;padding:8px 20px;">
                ${detailRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 4px;">
              <div style="background:#FFF4E6;border:1px solid #F8D3A6;border-radius:14px;padding:14px 18px;">
                <p style="margin:0;color:#8A4E10;font-size:13px;line-height:1.5;">⏳ Seu link é válido até <strong>${esc(p.expiresLabel)}</strong>. Após essa data, você precisará solicitar um novo convite ao RH.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px;text-align:center;">
              <a href="${esc(p.inviteLink)}" style="display:inline-block;padding:16px 32px;background:#F88A2B;color:#0B0908;font-weight:800;font-size:15px;letter-spacing:0.3px;border-radius:14px;text-decoration:none;">Aceitar convite agora</a>
              <p style="margin:16px 0 0;color:#8A827B;font-size:12px;line-height:1.5;">Ou copie e cole este link no navegador:<br/><span style="color:#0B0908;word-break:break-all;">${esc(p.inviteLink)}</span></p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px;">
              <div style="border-top:1px solid #EFEAE4;padding-top:20px;">
                <p style="margin:0 0 8px;color:#0B0908;font-size:13px;font-weight:700;">🔒 Sua experiência é privada</p>
                <p style="margin:0;color:#5C544D;font-size:12px;line-height:1.6;">Seus check-ins, conversas e reflexões individuais são confidenciais. Sua empresa vê apenas indicadores agregados e anonimizados, nunca respostas pessoais.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;text-align:center;">
              <p style="margin:0;color:#8A827B;font-size:11px;line-height:1.5;">Este é o ${p.resentCount}º lembrete deste convite, enviado por ${esc(p.orgName)} via Meu Caminho Enterprise.<br/>Se você não esperava este e-mail, pode ignorá-lo com segurança.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#B5ADA6;font-size:11px;">© Meu Caminho Enterprise</p>
      </td></tr>
    </table>
  </body>
</html>`;
}