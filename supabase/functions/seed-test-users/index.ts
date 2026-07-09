import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    async function ensureUser(email: string, password: string) {
      const { data: created, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (!error) return created.user!.id;
      const { data: list } = await admin.auth.admin.listUsers();
      const f = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!f) throw error;
      await admin.auth.admin.updateUserById(f.id, { password, email_confirm: true });
      return f.id;
    }

    const adminEmail = "admin@teste.com.br";
    console.log("creating admin");
    const adminId = await ensureUser(adminEmail, "12345678");
    console.log("adminId", adminId);
    await admin.from("user_roles").delete().eq("user_id", adminId);
    await admin.from("user_roles").insert({ user_id: adminId, organization_id: null, role: "platform_admin" });
    await admin.from("profiles").upsert({ id: adminId, full_name: "Platform Admin", organization_id: null });

    let { data: org } = await admin.from("organizations").select("*").eq("slug", "empresa-teste").maybeSingle();
    if (!org) {
      const { data: newOrg, error: orgErr } = await admin.from("organizations")
        .insert({ name: "Empresa Teste", slug: "empresa-teste", licenses_total: 10, licenses_used: 2 })
        .select("*").single();
      if (orgErr) throw orgErr;
      org = newOrg;
    }

    const ownerId = await ensureUser("empresa@teste.com.br", "12345678");
    await admin.from("profiles").upsert({ id: ownerId, full_name: "Owner Teste", organization_id: org.id });
    await admin.from("user_roles").delete().eq("user_id", ownerId);
    await admin.from("user_roles").insert({ user_id: ownerId, organization_id: org.id, role: "owner" });

    const empId = await ensureUser("colaborador@teste.com.br", "12345678");
    await admin.from("profiles").upsert({ id: empId, full_name: "Colaborador Teste", organization_id: org.id });
    await admin.from("user_roles").delete().eq("user_id", empId);
    await admin.from("user_roles").insert({ user_id: empId, organization_id: org.id, role: "employee" });
    await admin.from("employee_profiles").upsert({ user_id: empId, organization_id: org.id }, { onConflict: "user_id" });

    return new Response(JSON.stringify({
      ok: true,
      organization: { id: org.id, name: org.name, slug: org.slug },
      users: {
        platform_admin: { email: adminEmail, id: adminId },
        owner: { email: "empresa@teste.com.br", id: ownerId },
        employee: { email: "colaborador@teste.com.br", id: empId },
      },
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e as Error)?.message ?? e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
