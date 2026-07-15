import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "Meu Caminho Enterprise <no-reply@augustocury.fivestarsmarketing.com.br>";

const VALID_ROLES = new Set(["employee", "leader", "rh_admin"]);

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
    const { email, full_name, job_title, department, role, department_id, unit_id, manager_id } = body ?? {};
    if (!email) return json({ error: "email required" }, 400);
    const normalizedEmail = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return json({ error: "invalid_email" }, 400);
    const finalRole = VALID_ROLES.has(role) ? role : "employee";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: profile } = await admin.from("profiles").select("organization_id").eq("id", userId).maybeSingle();
    if (!profile?.organization_id) return json({ error: "no_organization" }, 403);
    const orgId = profile.organization_id;

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId).eq("organization_id", orgId);
    const roleList = (roles ?? []).map((r: { role: string }) => r.role);
    if (!roleList.includes("owner") && !roleList.includes("rh_admin")) return json({ error: "forbidden" }, 403);

    // Gestor imediato é obrigatório para employee/leader — apenas rh_admin (topo)
    // pode ficar sem gestor. Se veio manager_id, valida que pertence à mesma org.
    if (finalRole !== "rh_admin" && !manager_id) {
      return json({ error: "manager_required" }, 400);
    }
    if (manager_id) {
      const { data: mgr } = await admin
        .from("profiles")
        .select("id, organization_id, deleted_at, status")
        .eq("id", manager_id)
        .maybeSingle();
      if (!mgr || mgr.organization_id !== orgId || mgr.deleted_at) {
        return json({ error: "manager_invalid" }, 400);
      }
    }

    // License precheck
    const { data: org } = await admin
      .from("organizations")
      .select("name, logo_url, licenses_total, licenses_used")
      .eq("id", orgId)
      .maybeSingle();
    const total = org?.licenses_total ?? 0;
    const used = org?.licenses_used ?? 0;
    const { count: pendingCount } = await admin
      .from("enterprise_invites")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .is("accepted_at", null)
      .is("canceled_at", null)
      .is("declined_at", null);
    if (total > 0 && used + (pendingCount ?? 0) >= total) {
      return json({ error: "license_limit_reached", licenses_total: total, licenses_used: used, pending: pendingCount ?? 0 }, 402);
    }

    // Dedupe: reject if there's an active pending invite for the same email
    const { data: existing } = await admin
      .from("enterprise_invites")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", normalizedEmail)
      .is("accepted_at", null)
      .is("canceled_at", null)
      .is("declined_at", null)
      .maybeSingle();
    if (existing) return json({ error: "invite_already_pending" }, 409);

    const token = randomToken();
    const token_hash = await sha256(token);

    const { data: invite, error: insErr } = await admin
      .from("enterprise_invites")
      .insert({
        organization_id: orgId,
        email: normalizedEmail,
        full_name: full_name ?? null,
        job_title: job_title ?? null,
        department: department ?? null,
        department_id: department_id ?? null,
        unit_id: unit_id ?? null,
        manager_id: manager_id ?? null,
        role: finalRole,
        token_hash,
        invited_by: userId,
      })
      .select("*")
      .single();
    if (insErr) return json({ error: insErr.message }, 400);

    const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
    const baseUrl = origin ? new URL(origin).origin : "";
    const invite_link = `${baseUrl}/enterprise/convite/${token}`;

    // Contexto extra do convite (nome do RH e nomes de departamento/unidade/gestor)
    const { data: inviter } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    const inviterName = inviter?.full_name ?? null;

    const [{ data: deptRow }, { data: unitRow }, { data: mgrRow }] = await Promise.all([
      department_id
        ? admin.from("departments").select("name").eq("id", department_id).maybeSingle()
        : Promise.resolve({ data: null }),
      unit_id
        ? admin.from("units").select("name").eq("id", unit_id).maybeSingle()
        : Promise.resolve({ data: null }),
      manager_id
        ? admin.from("profiles").select("full_name").eq("id", manager_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const orgName = org?.name ?? "sua empresa";
    const orgLogo = (org as { logo_url?: string | null } | null)?.logo_url ?? null;
    const deptName = department ?? (deptRow as { name?: string } | null)?.name ?? null;
    const unitName = (unitRow as { name?: string } | null)?.name ?? null;
    const mgrName = (mgrRow as { full_name?: string } | null)?.full_name ?? null;
    const roleLabel =
      finalRole === "rh_admin" ? "RH / Administrador"
      : finalRole === "leader" ? "Liderança"
      : "Colaborador";

    const emailHtml = buildInviteEmail({
      recipientName: full_name ?? null,
      orgName,
      orgLogo,
      inviterName,
      roleLabel,
      jobTitle: job_title ?? null,
      deptName,
      unitName,
      mgrName,
      inviteLink: invite_link,
    });

    let emailSent = false;
    if (RESEND_API_KEY && LOVABLE_API_KEY) {
      try {
        const r = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": RESEND_API_KEY,
          },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [email],
            subject: `${orgName} convidou você para o Meu Caminho Enterprise`,
            html: emailHtml,
          }),
        });
        emailSent = r.ok;
      } catch (e) {
        console.warn("resend send failed", e);
      }
    }

    return json({ invite: { id: invite.id, email: invite.email, role: invite.role }, invite_link, email_sent: emailSent });
  } catch (e) {
    console.error("send-enterprise-invite failed", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function esc(s: string | null | undefined) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildInviteEmail(p: {
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
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #EFEAE4;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8A827B;font-weight:700;width:44%;">${esc(k)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #EFEAE4;font-size:14px;color:#0B0908;font-weight:600;">${esc(v)}</td>
      </tr>`,
    )
    .join("");
  const logoBlock = p.orgLogo
    ? `<img src="${esc(p.orgLogo)}" alt="${esc(p.orgName)}" width="56" height="56" style="border-radius:14px;display:block;margin:0 auto 16px;object-fit:cover;background:#fff;" />`
    : `<div style="width:56px;height:56px;margin:0 auto 16px;border-radius:14px;background:#F88A2B;color:#0B0908;font-weight:800;font-size:22px;line-height:56px;text-align:center;font-family:Arial,sans-serif;">${esc(p.orgName.charAt(0).toUpperCase())}</div>`;
  const invitedBy = p.inviterName
    ? `<p style="margin:0 0 20px;color:#5C544D;font-size:14px;line-height:1.6;">${esc(p.inviterName)}, do RH de <strong style="color:#0B0908;">${esc(p.orgName)}</strong>, convidou você para participar do Meu Caminho Enterprise — a plataforma que cuida da sua jornada emocional e profissional dentro da empresa.</p>`
    : `<p style="margin:0 0 20px;color:#5C544D;font-size:14px;line-height:1.6;"><strong style="color:#0B0908;">${esc(p.orgName)}</strong> convidou você para participar do Meu Caminho Enterprise — a plataforma que cuida da sua jornada emocional e profissional dentro da empresa.</p>`;

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Convite ${esc(p.orgName)}</title>
  </head>
  <body style="margin:0;padding:0;background:#F7F4F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0B0908;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4F2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(11,9,8,0.06);">
            <tr>
              <td style="background:#0B0908;padding:28px 32px;text-align:center;">
                <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(248,138,43,0.12);color:#F88A2B;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Convite Enterprise</div>
                <h1 style="margin:14px 0 0;color:#FFFFFF;font-size:22px;font-weight:800;letter-spacing:-0.3px;">Meu Caminho Enterprise</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px;text-align:center;">
                ${logoBlock}
                <p style="margin:0;color:#8A827B;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">${esc(p.orgName)}</p>
                <h2 style="margin:8px 0 0;color:#0B0908;font-size:26px;font-weight:800;line-height:1.25;">${greeting},<br/>bem-vindo à sua jornada.</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px;">
                ${invitedBy}
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
              <td style="padding:28px 32px 8px;text-align:center;">
                <a href="${esc(p.inviteLink)}" style="display:inline-block;padding:16px 32px;background:#F88A2B;color:#0B0908;font-weight:800;font-size:15px;letter-spacing:0.3px;border-radius:14px;text-decoration:none;">Aceitar convite e ativar acesso</a>
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
                <p style="margin:0;color:#8A827B;font-size:11px;line-height:1.5;">Este convite foi enviado para você por ${esc(p.orgName)} via Meu Caminho Enterprise.<br/>Se você não esperava este e-mail, pode ignorá-lo com segurança.</p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;color:#B5ADA6;font-size:11px;">© Meu Caminho Enterprise</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}