import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { RH_FLAG_KEYS, FEATURE_FLAG_LABELS, isFlagOn, type OrgSettingsMap } from "@/lib/orgSettings";

type Details = {
  organization: any;
  settings: OrgSettingsMap;
  counts: Record<string, number>;
  usage_30d: {
    active_users: number; ai_messages: number; tokens: number; tokens_in?: number; tokens_out?: number;
    ai_cost_cents: number; checkins: number; dnas?: number; insights?: number;
  };
  usage_daily: Array<{ usage_date: string; ai_messages: number; tokens: number; cost_cents: number; checkins: number }>;
  latest: { last_dna_at: string | null; last_score: number | null; last_score_date: string | null; last_activity_at: string | null };
  tickets: Array<{ id: string; title: string; status: string; priority: string; created_at: string }>;
  audit_logs: Array<{ id: string; action: string; entity_type: string | null; metadata: any; created_at: string }>;
};

const TABS = [
  ["overview", "Visão Geral"],
  ["data", "Dados"],
  ["plan", "Plano e Licenças"],
  ["rh", "Config RH"],
  ["usage", "Uso"],
  ["ai", "IA"],
  ["billing", "Faturamento"],
  ["support", "Suporte"],
  ["audit", "Auditoria"],
  ["notes", "Observações"],
] as const;
type TabKey = (typeof TABS)[number][0];

const fmtDate = (v: string | null | undefined) => (v ? new Date(v).toLocaleDateString("pt-BR") : "—");
const fmtDT = (v: string | null | undefined) => (v ? new Date(v).toLocaleString("pt-BR") : "—");

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  trialing: "Em teste",
  active: "Ativa",
  past_due: "Em atraso",
  suspended: "Suspensa",
  canceled: "Cancelada",
  grace_period: "Tolerância",
};
const subStatusLabel = (s?: string | null) =>
  s ? (SUBSCRIPTION_STATUS_LABELS[s] ?? s) : "—";

const KPI = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4">
    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{label}</p>
    <p className="mt-1.5 text-lg font-semibold text-slate-900 break-words">{value ?? "—"}</p>
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{children}</label>
);

const audit = async (orgId: string, action: string, metadata: any) =>
  supabase.from("platform_audit_logs" as any).insert({
    action, entity_type: "organization", entity_id: orgId, metadata,
  });

const PlatformOrganizationDetailScreen = () => {
  const { id } = useParams();
  const [data, setData] = useState<Details | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: res, error } = await supabase.rpc("get_platform_organization_details" as any, { _id: id });
    if (error) setErr(error.message);
    else setData(res as Details | null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <PlatformAdminLayout>
        <div className="h-8 w-40 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </PlatformAdminLayout>
    );
  }

  if (err || !data) {
    return (
      <PlatformAdminLayout>
        <Link to="/admin/organizations" className="text-xs text-slate-500 hover:text-slate-900">← Voltar</Link>
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-600">{err ? `Erro: ${err}` : "Empresa não encontrada."}</p>
        </div>
      </PlatformAdminLayout>
    );
  }

  const org = data.organization;

  return (
    <PlatformAdminLayout>
      <Link to="/admin/organizations" className="text-xs text-slate-500 hover:text-slate-900">← Voltar</Link>
      <div className="flex items-start justify-between mt-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{org.name}</h1>
          <p className="text-slate-500 text-sm">{org.slug} · {org.plan ?? "sem plano"} · {subStatusLabel(org.subscription_status)}</p>
        </div>
        <div className="flex gap-2 text-[10px] uppercase tracking-[0.2em]">
          {org.suspended_at && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">Suspensa</span>}
          {org.archived_at && <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded">Arquivada</span>}
          {org.deleted_at && <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Excluída</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200 mb-6">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as TabKey)}
            className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab===k ? "border-[#F88A2B] text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}>{l}</button>
        ))}
      </div>

      {tab==="overview" && <TabOverview data={data} />}
      {tab==="data" && <TabData data={data} onSaved={load} />}
      {tab==="plan" && <TabPlan data={data} onSaved={load} />}
      {tab==="rh" && <TabRH data={data} onSaved={load} />}
      {tab==="usage" && <TabUsage data={data} />}
      {tab==="ai" && <TabAI data={data} />}
      {tab==="billing" && <TabBilling data={data} />}
      {tab==="support" && <TabSupport data={data} />}
      {tab==="audit" && <TabAudit data={data} />}
      {tab==="notes" && <TabNotes data={data} onSaved={load} />}
    </PlatformAdminLayout>
  );
};

/* ---------------- Tabs ---------------- */

const TabOverview = ({ data }: { data: Details }) => {
  const org = data.organization; const u = data.usage_30d;
  return (
    <div className="grid grid-cols-4 gap-3">
      <KPI label="Status" value={subStatusLabel(org.subscription_status)} />
      <KPI label="Plano" value={org.plan} />
      <KPI label="Licenças" value={`${org.licenses_used ?? 0} / ${org.licenses_total ?? 0}`} />
      <KPI label="Ativos 30d" value={u.active_users} />
      <KPI label="Score" value={data.latest.last_score ?? "—"} />
      <KPI label="Último DNA" value={fmtDate(data.latest.last_dna_at)} />
      <KPI label="Mensagens IA 30d" value={u.ai_messages} />
      <KPI label="Tickets abertos" value={data.counts.open_tickets} />
      <KPI label="Último acesso" value={fmtDT(data.latest.last_activity_at)} />
      <KPI label="Perfis" value={data.counts.profiles} />
      <KPI label="Admins RH" value={data.counts.admins} />
      <KPI label="Alertas abertos" value={data.counts.open_alerts} />
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) => (
  <div>
    <Label>{label}</Label>
    <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400" />
  </div>
);

const TabData = ({ data, onSaved }: { data: Details; onSaved: () => void }) => {
  const org = data.organization;
  const [f, setF] = useState({
    name: org.name ?? "", slug: org.slug ?? "", cnpj: org.cnpj ?? "", domain: org.domain ?? "",
    logo_url: org.logo_url ?? "", segment: org.segment ?? "", company_size: org.company_size ?? "",
    country: org.country ?? "", state: org.state ?? "", city: org.city ?? "",
    responsible_name: org.responsible_name ?? "", responsible_email: org.responsible_email ?? "",
    responsible_phone: org.responsible_phone ?? "", responsible_role: org.responsible_role ?? "",
  });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    if (f.slug && f.slug !== org.slug) {
      const { data: dup } = await supabase.from("organizations").select("id").eq("slug", f.slug).neq("id", org.id).maybeSingle();
      if (dup?.id) {
        toast.error("Slug já em uso por outra empresa.");
        setSaving(false); return;
      }
    }
    const { error } = await supabase.from("organizations").update(f as any).eq("id", org.id);
    if (error) {
      const m = error.message || "";
      if (m.includes("organizations_slug_key") || m.toLowerCase().includes("duplicate")) {
        toast.error("Slug já em uso por outra empresa.");
      } else toast.error(m);
      setSaving(false); return;
    }
    await audit(org.id, "org.data.update", f);
    toast.success("Dados atualizados.");
    setSaving(false); onSaved();
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
        <Input label="Slug" value={f.slug} onChange={(v) => setF({ ...f, slug: v })} />
        <Input label="CNPJ" value={f.cnpj} onChange={(v) => setF({ ...f, cnpj: v })} />
        <Input label="Domínio" value={f.domain} onChange={(v) => setF({ ...f, domain: v })} />
        <Input label="Logo (URL)" value={f.logo_url} onChange={(v) => setF({ ...f, logo_url: v })} />
        <Input label="Segmento" value={f.segment} onChange={(v) => setF({ ...f, segment: v })} />
        <Input label="Tamanho" value={f.company_size} onChange={(v) => setF({ ...f, company_size: v })} />
        <Input label="País" value={f.country} onChange={(v) => setF({ ...f, country: v })} />
        <Input label="Estado" value={f.state} onChange={(v) => setF({ ...f, state: v })} />
        <Input label="Cidade" value={f.city} onChange={(v) => setF({ ...f, city: v })} />
      </div>
      <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold pt-4">Responsável principal</h3>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome" value={f.responsible_name} onChange={(v) => setF({ ...f, responsible_name: v })} />
        <Input label="E-mail" value={f.responsible_email} onChange={(v) => setF({ ...f, responsible_email: v })} />
        <Input label="Telefone" value={f.responsible_phone} onChange={(v) => setF({ ...f, responsible_phone: v })} />
        <Input label="Cargo" value={f.responsible_role} onChange={(v) => setF({ ...f, responsible_role: v })} />
      </div>
      <button disabled={saving} onClick={save} className="px-6 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold disabled:opacity-50">
        {saving ? "Salvando…" : "Salvar dados"}
      </button>
    </div>
  );
};

type PlanLite = {
  id: string; name: string; slug: string; plan_type: string;
  default_licenses: number; price_monthly_cents: number; price_yearly_cents: number;
  currency: string; billing_cycle: string;
  included_modules: Record<string, any>; ai_limits: Record<string, any>;
};
type Contract = {
  id?: string;
  organization_id: string;
  plan_id: string | null;
  contract_type: "standard" | "custom";
  licenses_total: number;
  price_monthly_cents: number;
  price_yearly_cents: number;
  discount_percent: number;
  currency: string;
  billing_cycle: "monthly" | "yearly" | "custom";
  contract_start: string | null;
  contract_end: string | null;
  trial_ends_at: string | null;
  grace_period_ends_at: string | null;
  status: "trialing" | "active" | "past_due" | "canceled" | "suspended" | "expired";
  custom_terms: string | null;
  enabled_modules: Record<string, any>;
  ai_limits_override: Record<string, any>;
  notes: string | null;
};

const newContract = (orgId: string, org: any): Contract => ({
  organization_id: orgId,
  plan_id: null,
  contract_type: "standard",
  licenses_total: org.licenses_total ?? 0,
  price_monthly_cents: org.mrr_cents ?? 0,
  price_yearly_cents: 0,
  discount_percent: 0,
  currency: "BRL",
  billing_cycle: "monthly",
  contract_start: null,
  contract_end: null,
  trial_ends_at: org.trial_ends_at ?? null,
  grace_period_ends_at: org.grace_period_ends_at ?? null,
  status: (org.subscription_status ?? "trialing") as any,
  custom_terms: null,
  enabled_modules: {},
  ai_limits_override: {},
  notes: null,
});

const TabPlan = ({ data, onSaved }: { data: Details; onSaved: () => void }) => {
  const org = data.organization;
  const [plans, setPlans] = useState<PlanLite[]>([]);
  const [c, setC] = useState<Contract | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: k }] = await Promise.all([
      supabase.from("platform_plans" as any).select("id,name,slug,plan_type,default_licenses,price_monthly_cents,price_yearly_cents,currency,billing_cycle,included_modules,ai_limits").eq("is_active", true).order("sort_order"),
      supabase.from("organization_contracts" as any).select("*").eq("organization_id", org.id).maybeSingle(),
    ]);
    setPlans((p as any as PlanLite[]) ?? []);
    setC(((k as any) as Contract) ?? newContract(org.id, org));
    setLoading(false);
  }, [org]);

  useEffect(() => { load(); }, [load]);

  if (loading || !c) return <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />;

  const set = (patch: Partial<Contract>) => setC({ ...c, ...patch });

  const applyPlanDefaults = () => {
    const p = plans.find((x) => x.id === c.plan_id);
    if (!p) { toast.error("Selecione um plano primeiro."); return; }
    set({
      licenses_total: p.default_licenses,
      price_monthly_cents: p.price_monthly_cents,
      price_yearly_cents: p.price_yearly_cents,
      currency: p.currency,
      billing_cycle: p.billing_cycle as any,
      enabled_modules: p.included_modules ?? {},
      ai_limits_override: p.ai_limits ?? {},
      contract_type: "standard",
    });
    toast.success("Valores do plano padrão aplicados.");
  };

  const save = async () => {
    setSaving(true);
    const payload: any = { ...c };
    delete payload.id;
    const { error } = await supabase
      .from("organization_contracts" as any)
      .upsert(payload, { onConflict: "organization_id" });
    if (error) { toast.error(error.message); setSaving(false); return; }
    await audit(org.id, "org.contract.upsert", payload);
    toast.success("Contrato salvo.");
    setSaving(false); onSaved(); load();
  };

  const changeStatus = async (status: Contract["status"], label: string) => {
    const verbo = status === "suspended" ? "suspender"
      : status === "canceled" ? "cancelar"
      : status === "active" ? "reativar"
      : `mudar para ${status}`;
    if (!window.confirm(`Deseja ${verbo} esta organização?\n\nOs dados são preservados.`)) return;
    const reason = window.prompt(`Motivo (opcional):`, "") || null;
    set({ status });
    const payload: any = { ...c, status };
    delete payload.id;
    const { error } = await supabase
      .from("organization_contracts" as any)
      .upsert(payload, { onConflict: "organization_id" });
    if (error) return toast.error(error.message);
    await audit(org.id, label, { status, reason });
    toast.success("Status atualizado.");
    onSaved(); load();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Plano base</Label>
          <select value={c.plan_id ?? ""} onChange={(e) => set({ plan_id: e.target.value || null })}
            className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
            <option value="">— sem plano —</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.default_licenses} lic.</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Tipo de contrato</Label>
          <select value={c.contract_type} onChange={(e) => set({ contract_type: e.target.value as any })}
            className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
            <option value="standard">Padrão</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        <div>
          <Label>Status</Label>
          <select value={c.status} onChange={(e) => set({ status: e.target.value as any })}
            className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
            {[
              { v: "trialing", l: "Em teste" },
              { v: "active", l: "Ativa" },
              { v: "past_due", l: "Em atraso" },
              { v: "suspended", l: "Suspensa" },
              { v: "canceled", l: "Cancelada" },
              { v: "expired", l: "Expirada" },
            ].map((s) => (
              <option key={s.v} value={s.v}>{s.l}</option>
            ))}
          </select>
        </div>

        <Input label="Licenças contratadas" type="number" value={String(c.licenses_total)} onChange={(v) => set({ licenses_total: Number(v) || 0 })} />
        <Input label="Preço mensal (centavos)" type="number" value={String(c.price_monthly_cents)} onChange={(v) => set({ price_monthly_cents: Number(v) || 0 })} />
        <Input label="Preço anual (centavos)" type="number" value={String(c.price_yearly_cents)} onChange={(v) => set({ price_yearly_cents: Number(v) || 0 })} />

        <Input label="Desconto %" type="number" value={String(c.discount_percent)} onChange={(v) => set({ discount_percent: Number(v) || 0 })} />
        <Input label="Moeda" value={c.currency} onChange={(v) => set({ currency: v.toUpperCase() })} />
        <div>
          <Label>Ciclo cobrança</Label>
          <select value={c.billing_cycle} onChange={(e) => set({ billing_cycle: e.target.value as any })}
            className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <Input label="Teste até" type="date" value={c.trial_ends_at ? c.trial_ends_at.slice(0,10) : ""} onChange={(v) => set({ trial_ends_at: v ? new Date(v).toISOString() : null })} />
        <Input label="Tolerância até" type="date" value={c.grace_period_ends_at ? c.grace_period_ends_at.slice(0,10) : ""} onChange={(v) => set({ grace_period_ends_at: v ? new Date(v).toISOString() : null })} />
        <KPI label="Licenças usadas" value={org.licenses_used ?? 0} />

        <Input label="Início do contrato" type="date" value={c.contract_start ?? ""} onChange={(v) => set({ contract_start: v || null })} />
        <Input label="Fim do contrato" type="date" value={c.contract_end ?? ""} onChange={(v) => set({ contract_end: v || null })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Módulos habilitados (JSON)</Label>
          <textarea defaultValue={JSON.stringify(c.enabled_modules ?? {}, null, 2)} onChange={(e) => { try { set({ enabled_modules: JSON.parse(e.target.value || "{}") }); } catch { /* ignore */ } }} rows={4} className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs" />
        </div>
        <div>
          <Label>Limites IA especiais (JSON)</Label>
          <textarea defaultValue={JSON.stringify(c.ai_limits_override ?? {}, null, 2)} onChange={(e) => { try { set({ ai_limits_override: JSON.parse(e.target.value || "{}") }); } catch { /* ignore */ } }} rows={4} className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs" />
        </div>
      </div>

      <div>
        <Label>Observações comerciais</Label>
        <textarea value={c.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} rows={3}
          className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button disabled={saving} onClick={save} className="px-6 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold disabled:opacity-50">
          {saving ? "Salvando…" : "Salvar contrato"}
        </button>
        <button onClick={applyPlanDefaults} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm">
          Aplicar valores do plano padrão
        </button>
        <button onClick={() => set({ contract_type: "custom" })} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm">
          Criar condição especial
        </button>
        <button onClick={() => changeStatus("canceled", "org.contract.cancel")} className="px-4 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-sm">
          Cancelar assinatura
        </button>
        <button onClick={() => changeStatus("suspended", "org.contract.suspend")} className="px-4 py-2 rounded-lg bg-white border border-amber-200 text-amber-700 text-sm">
          Suspender
        </button>
        <button onClick={() => changeStatus("active", "org.contract.reactivate")} className="px-4 py-2 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-sm">
          Reativar
        </button>
      </div>
    </div>
  );
};

const TabRH = ({ data, onSaved }: { data: Details; onSaved: () => void }) => {
  const org = data.organization;
  const [flags, setFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(RH_FLAG_KEYS.map((k) => [k, isFlagOn(data.settings, k)]))
  );
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const rows = RH_FLAG_KEYS.map((k) => ({
      organization_id: org.id, key: k, value: { enabled: !!flags[k] } as any,
    }));
    const { error } = await supabase.from("organization_settings" as any)
      .upsert(rows, { onConflict: "organization_id,key" });
    if (error) { toast.error(error.message); setSaving(false); return; }
    await audit(org.id, "org.settings.rh.update", flags);
    toast.success("Configurações salvas.");
    setSaving(false); onSaved();
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Habilite ou desabilite módulos disponíveis para esta empresa.</p>
      <div className="grid grid-cols-2 gap-2">
        {RH_FLAG_KEYS.map((k) => (
          <label key={k} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700">
            <input type="checkbox" checked={!!flags[k]} onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })} />
            {FEATURE_FLAG_LABELS[k] || k}
          </label>
        ))}
      </div>
      <button disabled={saving} onClick={save} className="px-6 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold disabled:opacity-50">
        {saving ? "Salvando…" : "Salvar configurações"}
      </button>
    </div>
  );
};

const TabUsage = ({ data }: { data: Details }) => {
  const u = data.usage_30d;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <KPI label="Ativos 30d" value={u.active_users} />
        <KPI label="Check-ins" value={u.checkins} />
        <KPI label="Perfis" value={data.counts.profiles} />
        <KPI label="Último acesso" value={fmtDT(data.latest.last_activity_at)} />
      </div>
      {data.usage_daily.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500">
              <tr><th className="text-left p-2">Data</th><th className="text-left p-2">IA</th><th className="text-left p-2">Tokens</th><th className="text-left p-2">Custo</th><th className="text-left p-2">Check-ins</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.usage_daily.map((d) => (
                <tr key={d.usage_date}>
                  <td className="p-2 text-slate-700">{fmtDate(d.usage_date)}</td>
                  <td className="p-2">{d.ai_messages}</td>
                  <td className="p-2">{Number(d.tokens).toLocaleString("pt-BR")}</td>
                  <td className="p-2">R$ {((d.cost_cents ?? 0) / 100).toFixed(2)}</td>
                  <td className="p-2">{d.checkins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TabAI = ({ data }: { data: Details }) => {
  const u = data.usage_30d;
  return (
    <div className="grid grid-cols-4 gap-3">
      <KPI label="Mensagens IA 30d" value={u.ai_messages} />
      <KPI label="Tokens entrada" value={(u.tokens_in ?? 0).toLocaleString("pt-BR")} />
      <KPI label="Tokens saída" value={(u.tokens_out ?? 0).toLocaleString("pt-BR")} />
      <KPI label="Custo estimado" value={`R$ ${(u.ai_cost_cents / 100).toFixed(2)}`} />
      <KPI label="DNAs gerados 30d" value={u.dnas ?? 0} />
      <KPI label="Insights 30d" value={u.insights ?? 0} />
    </div>
  );
};

const TabBilling = ({ data }: { data: Details }) => {
  const org = data.organization;
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-amber-800 font-semibold">Billing ainda não conectado.</p>
        <p className="text-amber-700 text-xs mt-1">Quando o Stripe estiver ativo, os dados aparecerão aqui automaticamente.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <KPI label="Stripe Customer" value={org.stripe_customer_id ?? "—"} />
        <KPI label="Stripe Subscription" value={org.stripe_subscription_id ?? "—"} />
        <KPI label="MRR (R$)" value={((org.mrr_cents ?? 0) / 100).toFixed(2)} />
        <KPI label="Trial termina" value={fmtDate(org.trial_ends_at)} />
        <KPI label="Fim do período" value={fmtDate(org.current_period_end)} />
        <KPI label="Grace period" value={fmtDate(org.grace_period_ends_at)} />
      </div>
    </div>
  );
};

const TabSupport = ({ data }: { data: Details }) => {
  const org = data.organization;
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const addNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    await audit(org.id, "org.support.internal_note", { note });
    toast.success("Nota registrada em auditoria.");
    setNote(""); setSaving(false);
  };
  return (
    <div className="space-y-4">
      {data.tickets.length === 0 ? (
        <p className="text-slate-500 text-sm">Nenhum ticket.</p>
      ) : data.tickets.map((t) => (
        <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center">
          <div>
            <p className="font-semibold text-sm text-slate-800">{t.title}</p>
            <p className="text-xs text-slate-400">{fmtDT(t.created_at)}</p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] uppercase px-2 py-1 rounded bg-slate-100 text-slate-700">{t.priority}</span>
            <span className="text-[10px] uppercase px-2 py-1 rounded bg-[#F88A2B]/20 text-[#F88A2B]">{t.status}</span>
          </div>
        </div>
      ))}
      <div className="border-t border-slate-200 pt-4">
        <Label>Nota interna</Label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
        <button disabled={saving} onClick={addNote} className="mt-2 px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-xs font-bold disabled:opacity-50">
          Adicionar nota
        </button>
      </div>
    </div>
  );
};

const TabAudit = ({ data }: { data: Details }) => (
  <div className="space-y-1 text-xs font-mono text-slate-600">
    {data.audit_logs.length === 0 ? (
      <p className="text-slate-500 text-sm">Sem registros.</p>
    ) : data.audit_logs.map((l) => (
      <div key={l.id} className="py-1.5 border-b border-slate-100">
        <span className="text-slate-400">{fmtDT(l.created_at)}</span>
        {" · "}<span className="text-[#F88A2B]">{l.action}</span>
        {l.entity_type && <span className="text-slate-500"> · {l.entity_type}</span>}
      </div>
    ))}
  </div>
);

const TabNotes = ({ data, onSaved }: { data: Details; onSaved: () => void }) => {
  const org = data.organization;
  const [f, setF] = useState({
    internal_notes: org.internal_notes ?? "",
    internal_status: org.internal_status ?? "",
    next_contact_at: org.next_contact_at ? org.next_contact_at.slice(0, 10) : "",
    customer_success_owner: org.customer_success_owner ?? "",
    onboarding_status: org.onboarding_status ?? "",
    commercial_risk: org.commercial_risk ?? "",
  });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const payload: any = { ...f, next_contact_at: f.next_contact_at || null };
    const { error } = await supabase.from("organizations").update(payload).eq("id", org.id);
    if (error) { toast.error(error.message); setSaving(false); return; }
    await audit(org.id, "org.notes.update", payload);
    toast.success("Notas salvas.");
    setSaving(false); onSaved();
  };
  return (
    <div className="space-y-4">
      <div>
        <Label>Notas internas</Label>
        <textarea value={f.internal_notes} onChange={(e) => setF({ ...f, internal_notes: e.target.value })} rows={6}
          className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Status comercial" value={f.internal_status} onChange={(v) => setF({ ...f, internal_status: v })} />
        <Input label="Próximo contato" type="date" value={f.next_contact_at} onChange={(v) => setF({ ...f, next_contact_at: v })} />
        <Input label="CS responsável" value={f.customer_success_owner} onChange={(v) => setF({ ...f, customer_success_owner: v })} />
        <Input label="Status onboarding" value={f.onboarding_status} onChange={(v) => setF({ ...f, onboarding_status: v })} />
        <Input label="Risco comercial" value={f.commercial_risk} onChange={(v) => setF({ ...f, commercial_risk: v })} />
      </div>
      <button disabled={saving} onClick={save} className="px-6 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold disabled:opacity-50">
        {saving ? "Salvando…" : "Salvar notas"}
      </button>
    </div>
  );
};

export default PlatformOrganizationDetailScreen;