import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

const QA_PASSWORD = "McQa@2026!";
const SEED_TAG = "qa_three_companies_100_employees";

type Company = {
  slug: string;
  name: string;
  segment: string;
  city: string;
  state: string;
  plan: string;
  licenses_total: number;
  subscription_status: "active" | "trialing";
  admin_email: string;
  employees: number;
  leaders: number;
  departments: string[];
  units: string[];
  emp_prefix: string;
  emp_key: string;
};

const COMPANIES: Company[] = [
  {
    slug: "horizonte-tecnologia-qa",
    name: "Horizonte Tecnologia Ltda.",
    segment: "Tecnologia",
    city: "Florianópolis",
    state: "SC",
    plan: "Plano 1.000",
    licenses_total: 1000,
    subscription_status: "active",
    admin_email: "admin.horizonte@qa.meucaminho.test",
    employees: 34,
    leaders: 5,
    departments: ["Produto", "Engenharia", "Comercial", "Customer Success", "Administrativo", "Pessoas e Cultura"],
    units: ["Florianópolis", "Remoto"],
    emp_prefix: "colaborador.horizonte",
    emp_key: "horizonte",
  },
  {
    slug: "valesul-industria-qa",
    name: "ValeSul Indústria Ltda.",
    segment: "Indústria",
    city: "Joinville",
    state: "SC",
    plan: "Plano 5.000",
    licenses_total: 5000,
    subscription_status: "active",
    admin_email: "admin.valesul@qa.meucaminho.test",
    employees: 33,
    leaders: 6,
    departments: ["Produção", "Qualidade", "Manutenção", "Logística", "Engenharia", "Administrativo", "Recursos Humanos"],
    units: ["Joinville", "Araquari"],
    emp_prefix: "colaborador.valesul",
    emp_key: "valesul",
  },
  {
    slug: "atlantica-servicos-qa",
    name: "Atlântica Serviços Corporativos Ltda.",
    segment: "Serviços",
    city: "Balneário Camboriú",
    state: "SC",
    plan: "Plano 1.000",
    licenses_total: 1000,
    subscription_status: "trialing",
    admin_email: "admin.atlantica@qa.meucaminho.test",
    employees: 33,
    leaders: 5,
    departments: ["Operações", "Atendimento", "Comercial", "Financeiro", "Marketing", "Recursos Humanos"],
    units: ["Balneário Camboriú", "Itajaí", "Remoto"],
    emp_prefix: "colaborador.atlantica",
    emp_key: "atlantica",
  },
];

const FIRST_NAMES = [
  "Ana", "Bruno", "Camila", "Daniel", "Eduarda", "Felipe", "Gabriela", "Henrique",
  "Isabela", "João", "Karina", "Lucas", "Marina", "Nathan", "Olívia", "Paulo",
  "Queila", "Rafael", "Sabrina", "Thiago", "Ursula", "Vinícius", "Wagner", "Xênia",
  "Yasmin", "Zeca", "Amanda", "Beatriz", "Carlos", "Débora", "Eliane", "Fábio",
  "Giovana", "Heitor",
];
const LAST_NAMES = [
  "Martins", "Almeida", "Ribeiro", "Ferreira", "Souza", "Oliveira", "Costa", "Pereira",
  "Lima", "Gomes", "Rocha", "Araújo", "Barbosa", "Cardoso", "Nogueira", "Teixeira",
  "Moreira", "Cavalcanti", "Pinto", "Machado",
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function pad(n: number) { return String(n).padStart(3, "0"); }

function nameFor(company: string, idx: number): string {
  const first = FIRST_NAMES[(idx * 7 + company.length) % FIRST_NAMES.length];
  const last = LAST_NAMES[(idx * 13 + company.length * 3) % LAST_NAMES.length];
  return `${first} ${last} QA`;
}

// Deterministic pseudo-random 0..1
function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function scoreFor(bias: { mood: number; energy: number; stress: number }, seed: number) {
  return {
    mood_score: clamp(Math.round(bias.mood + (rand(seed) - 0.5) * 2), 1, 5),
    energy_score: clamp(Math.round(bias.energy + (rand(seed + 1) - 0.5) * 2), 1, 5),
    stress_score: clamp(Math.round(bias.stress + (rand(seed + 2) - 0.5) * 2), 1, 5),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!jwt) return json({ error: "unauthorized" }, 401);

    const authed = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: me } = await authed.auth.getUser();
    if (!me.user) return json({ error: "unauthorized" }, 401);
    const { data: isAdmin } = await authed.rpc("is_platform_admin");
    if (!isAdmin) return json({ error: "forbidden: platform_admin required" }, 403);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Cache existing auth users by email (idempotent lookups)
    const emailToId = new Map<string, string>();
    {
      let page = 1;
      while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) throw error;
        for (const u of data.users) if (u.email) emailToId.set(u.email.toLowerCase(), u.id);
        if (!data.users.length || data.users.length < 200) break;
        page += 1;
      }
    }

    async function ensureUser(email: string, fullName: string): Promise<string> {
      const key = email.toLowerCase();
      let id = emailToId.get(key);
      if (!id) {
        const { data, error } = await admin.auth.admin.createUser({
          email, password: QA_PASSWORD, email_confirm: true,
          user_metadata: { full_name: fullName, is_test_data: true, seed: SEED_TAG },
        });
        if (error) throw new Error(`createUser(${email}): ${error.message}`);
        id = data.user!.id;
        emailToId.set(key, id);
      } else {
        // Ensure password + confirmed for idempotent re-runs
        await admin.auth.admin.updateUserById(id, {
          password: QA_PASSWORD, email_confirm: true,
          user_metadata: { full_name: fullName, is_test_data: true, seed: SEED_TAG },
        });
      }
      return id!;
    }

    const report: any = { companies: [], users: [] };

    for (const c of COMPANIES) {
      // 1) Organization (upsert by slug)
      let orgId: string;
      {
        const { data: existing } = await admin.from("organizations").select("id").eq("slug", c.slug).maybeSingle();
        const payload = {
          name: c.name, slug: c.slug, segment: c.segment, city: c.city, state: c.state,
          country: "Brasil", plan: c.plan, licenses_total: c.licenses_total,
          subscription_status: c.subscription_status,
          trial_ends_at: c.subscription_status === "trialing" ? new Date(Date.now() + 14 * 86400000).toISOString() : null,
          internal_notes: `SEED:${SEED_TAG}`,
        };
        if (existing) {
          orgId = existing.id;
          await admin.from("organizations").update(payload).eq("id", orgId);
        } else {
          const { data, error } = await admin.from("organizations").insert(payload).select("id").single();
          if (error) throw new Error(`org(${c.slug}): ${error.message}`);
          orgId = data.id;
        }
      }

      // 2) Departments
      const depIds = new Map<string, string>();
      for (const d of c.departments) {
        const { data: existing } = await admin.from("departments")
          .select("id").eq("organization_id", orgId).eq("name", d).maybeSingle();
        if (existing) { depIds.set(d, existing.id); continue; }
        const { data, error } = await admin.from("departments")
          .insert({ organization_id: orgId, name: d }).select("id").single();
        if (error) throw new Error(`dept(${d}): ${error.message}`);
        depIds.set(d, data.id);
      }

      // 3) Units
      const unitIds = new Map<string, string>();
      for (const u of c.units) {
        const { data: existing } = await admin.from("units")
          .select("id").eq("organization_id", orgId).eq("name", u).maybeSingle();
        if (existing) { unitIds.set(u, existing.id); continue; }
        const { data, error } = await admin.from("units")
          .insert({ organization_id: orgId, name: u }).select("id").single();
        if (error) throw new Error(`unit(${u}): ${error.message}`);
        unitIds.set(u, data.id);
      }

      // 4) Admin (owner)
      const adminFullName = `Admin ${c.name.split(" ")[0]} QA`;
      const adminId = await ensureUser(c.admin_email, adminFullName);
      await admin.from("profiles").upsert({
        id: adminId, organization_id: orgId, full_name: adminFullName, display_name: adminFullName,
        job_title: "Owner / RH", status: "active", hired_at: new Date().toISOString().slice(0, 10),
      }, { onConflict: "id" });
      await admin.from("user_roles").delete().eq("user_id", adminId);
      await admin.from("user_roles").insert({ user_id: adminId, organization_id: orgId, role: "owner" });
      report.users.push({
        company: c.name, full_name: adminFullName, email: c.admin_email,
        temporary_password: QA_PASSWORD, role: "owner", department: "-", unit: "-",
        manager_email: "", onboarding_status: "n/a", account_status: "active",
      });

      // 5) Employees
      const deps = [...depIds.entries()];
      const uns = [...unitIds.entries()];
      const leaderIdsByDept = new Map<string, string>(); // department name -> profile id (leader)
      const emailsCreated: { email: string; fullName: string; role: "leader" | "employee"; dept: string; unit: string; profileId: string; userId: string; onboarding: string }[] = [];

      for (let i = 1; i <= c.employees; i++) {
        const email = `${c.emp_prefix}.${pad(i)}@qa.meucaminho.test`;
        const fullName = nameFor(c.emp_key, i);
        const dept = deps[(i - 1) % deps.length];
        const unit = uns[(i - 1) % uns.length];
        const isLeader = i <= c.leaders;
        const userId = await ensureUser(email, fullName);

        await admin.from("profiles").upsert({
          id: userId, organization_id: orgId, full_name: fullName, display_name: fullName,
          job_title: isLeader ? "Líder" : "Colaborador",
          department: dept[0], department_id: dept[1], unit_id: unit[1],
          status: "active",
          hired_at: new Date(Date.now() - (30 + i) * 86400000).toISOString().slice(0, 10),
        }, { onConflict: "id" });

        await admin.from("user_roles").delete().eq("user_id", userId);
        await admin.from("user_roles").insert({
          user_id: userId, organization_id: orgId,
          role: isLeader ? "leader" : "employee",
        });

        if (isLeader) leaderIdsByDept.set(dept[0], userId);

        // Onboarding buckets ~20% / 30% / 50% per company
        const notStartedCount = Math.round(c.employees * 0.20);
        const inProgressCount = Math.round(c.employees * 0.30);
        const onboarding =
          i <= notStartedCount ? "not_started" :
          i <= notStartedCount + inProgressCount ? "in_progress" :
          "completed";

        emailsCreated.push({ email, fullName, role: isLeader ? "leader" : "employee",
          dept: dept[0], unit: unit[0], profileId: userId, userId, onboarding });
      }

      // 6) Assign manager_id: everyone whose dept has a leader gets that leader as manager
      for (const e of emailsCreated) {
        if (e.role === "leader") continue;
        const leader = leaderIdsByDept.get(e.dept);
        if (leader) {
          await admin.from("profiles").update({ manager_id: leader }).eq("id", e.profileId);
        }
      }

      // 7) employee_profiles for the completed group (idempotent upsert by user_id)
      const completed = emailsCreated.filter(e => e.onboarding === "completed");
      for (const e of completed) {
        await admin.from("employee_profiles").upsert({
          user_id: e.userId, organization_id: orgId,
          profile_professional: { role: e.role, dept: e.dept, unit: e.unit, seed: SEED_TAG },
          profile_development: { focus: ["comunicação", "gestão do tempo"] },
          profile_leadership: { style: e.role === "leader" ? "mentor" : "colaborativo" },
          profile_communication: { preference: "assíncrona" },
          profile_energy: { peak: "manhã" },
          profile_engagement: { drivers: ["propósito", "autonomia"] },
          summary: "Perfil sintético QA — dados fictícios para homologação.",
          confidence: "medium", generated_by_model: "qa-seed",
        }, { onConflict: "user_id" });
      }

      // 8) Pulse prompts + check-ins for completed users, last 30 days
      const { data: prompts } = await admin.from("pulse_prompts").select("id,dimension").eq("active", true);
      const promptList = (prompts ?? []) as { id: string; dimension: string }[];

      // Bias per company
      const bias =
        c.emp_key === "horizonte" ? { mood: 4, energy: 4, stress: 2 } :
        c.emp_key === "valesul"   ? { mood: 3, energy: 2, stress: 4 } :
                                    { mood: 3, energy: 3, stress: 3 };

      // Delete previous seeded pulse+checkins for these users to avoid duplicates on re-run
      const userIds = completed.map(e => e.userId);
      if (userIds.length) {
        const since = new Date(Date.now() - 40 * 86400000).toISOString();
        await admin.from("pulse_responses").delete().in("user_id", userIds).gte("responded_at", since);
        await admin.from("emotional_checkins").delete().in("user_id", userIds).gte("created_at", since);
      }

      const checkinRows: any[] = [];
      const pulseRows: any[] = [];
      for (let idx = 0; idx < completed.length; idx++) {
        const e = completed[idx];
        // ~8-14 check-ins over last 30 days
        const numCheckins = 8 + (idx % 7);
        for (let k = 0; k < numCheckins; k++) {
          const daysAgo = Math.floor(rand(idx * 100 + k) * 30);
          const ts = new Date(Date.now() - daysAgo * 86400000).toISOString();
          const s = scoreFor(bias, idx * 1000 + k);
          checkinRows.push({
            user_id: e.userId, organization_id: orgId, created_at: ts, ...s,
            tags: ["qa_seed"],
          });
        }
        // Pulse: 3 responses per week -> ~12 in 30 days
        for (let k = 0; k < 12; k++) {
          const p = promptList[(idx + k) % Math.max(1, promptList.length)];
          if (!p) break;
          const daysAgo = Math.floor(rand(idx * 200 + k + 7) * 30);
          const ts = new Date(Date.now() - daysAgo * 86400000).toISOString();
          const base =
            p.dimension === "energy" ? bias.energy :
            p.dimension === "recovery" ? 6 - bias.stress :
            p.dimension === "engagement" ? bias.mood :
            3 + (rand(idx + k) - 0.5);
          const value = clamp(Math.round(base + (rand(idx * 3 + k) - 0.5) * 2), 1, 5);
          pulseRows.push({
            user_id: e.userId, organization_id: orgId, prompt_id: p.id,
            value_num: value, responded_at: ts, context: "qa_seed",
          });
        }
      }
      // Bulk insert in chunks
      const chunk = <T>(arr: T[], n: number) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
      for (const part of chunk(checkinRows, 500)) {
        const { error } = await admin.from("emotional_checkins").insert(part);
        if (error) throw new Error(`checkins: ${error.message}`);
      }
      for (const part of chunk(pulseRows, 500)) {
        const { error } = await admin.from("pulse_responses").insert(part);
        if (error) throw new Error(`pulse: ${error.message}`);
      }

      // 9) One alert + signal + action plan + ritual per company (idempotent)
      const alertTitle = `[QA] Atenção — ${c.emp_key === "valesul" ? "sobrecarga em Produção" : c.emp_key === "atlantica" ? "comunicação em Operações" : "recuperação em Engenharia"}`;
      await admin.from("alerts").delete().eq("organization_id", orgId).eq("title", alertTitle);
      await admin.from("alerts").insert({
        organization_id: orgId, alert_type: "qa_seed", severity: "warning",
        title: alertTitle, message: "Alerta sintético gerado pelo seed de QA.",
        evidence: { seed: SEED_TAG },
      });

      const signalTitle = `[QA] Sinal preditivo — ${c.name}`;
      await admin.from("predictive_signals").delete().eq("organization_id", orgId).eq("title", signalTitle);
      await admin.from("predictive_signals").insert({
        organization_id: orgId, signal_type: "qa_seed", severity: "info", confidence: 0.7,
        title: signalTitle, narrative: "Sinal sintético para validação do painel preditivo.",
        evidence: { seed: SEED_TAG },
      });

      const planTitle = `[QA] Plano de ação — ${c.name}`;
      await admin.from("action_plans").delete().eq("organization_id", orgId).eq("title", planTitle);
      await admin.from("action_plans").insert({
        organization_id: orgId, title: planTitle, description: "Plano sintético de QA.",
        source_type: "manual", status: "draft", priority: "medium",
      });

      const ritualTitle = `[QA] Ritual — ${c.name}`;
      await admin.from("intelligent_rituals").delete().eq("organization_id", orgId).eq("title", ritualTitle);
      await admin.from("intelligent_rituals").insert({
        organization_id: orgId, title: ritualTitle,
        description: "Ritual sintético publicado para QA.",
        ritual_type: "reflection", source_type: "manual", status: "published",
        duration_minutes: 15, audience: "all",
        instructions: [{ step: 1, text: "Reunir a equipe por 15 min." }],
      });

      // 10) Licenses
      const licensesUsed = c.employees + 1;
      await admin.from("organizations").update({ licenses_used: licensesUsed }).eq("id", orgId);

      report.companies.push({
        slug: c.slug, name: c.name, id: orgId, plan: c.plan,
        licenses_total: c.licenses_total, licenses_used: licensesUsed,
        departments: c.departments, units: c.units,
        admin_email: c.admin_email,
        employees: c.employees, leaders: c.leaders,
      });
      for (const e of emailsCreated) {
        const managerEmail = e.role === "employee" && leaderIdsByDept.get(e.dept)
          ? (emailsCreated.find(x => x.userId === leaderIdsByDept.get(e.dept))?.email ?? "")
          : "";
        report.users.push({
          company: c.name, full_name: e.fullName, email: e.email,
          temporary_password: QA_PASSWORD, role: e.role, department: e.dept, unit: e.unit,
          manager_email: managerEmail, onboarding_status: e.onboarding, account_status: "active",
        });
      }
    }

    return json({ ok: true, seed: SEED_TAG, report });
  } catch (e) {
    console.error("[seed-qa]", e);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});