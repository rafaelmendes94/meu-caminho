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
  ["billing", "Billing"],
  ["support", "Suporte"],
  ["audit", "Auditoria"],
  ["notes", "Observações"],
] as const;
type TabKey = (typeof TABS)[number][0];

const fmtDate = (v: string | null | undefined) => (v ? new Date(v).toLocaleDateString("pt-BR") : "—");
const fmtDT = (v: string | null | undefined) => (v ? new Date(v).toLocaleString("pt-BR") : "—");

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
          <p className="text-slate-500 text-sm">{org.slug} · {org.plan ?? "sem plano"} · {org.subscription_status}</p>
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
      <KPI label="Status" value={org.subscription_status} />
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
    const { error } = await supabase.from("organizations").update(f as any).eq("id", org.id);
    if (error) { toast.error(error.message); setSaving(false); return; }
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

const TabPlan = ({ data, onSaved }: { data: Details; onSaved: () => void }) => {
  const org = data.organization;
  const [f, setF] = useState({
    plan: org.plan ?? "", subscription_status: org.subscription_status ?? "trialing",
    licenses_total: org.licenses_total ?? 0,
    trial_ends_at: org.trial_ends_at ? org.trial_ends_at.slice(0, 10) : "",
    grace_period_ends_at: org.grace_period_ends_at ? org.grace_period_ends_at.slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    const payload: any = {
      plan: f.plan || null, subscription_status: f.subscription_status,
      licenses_total: Number(f.licenses_total) || 0,
      trial_ends_at: f.trial_ends_at || null,
      grace_period_ends_at: f.grace_period_ends_at || null,
    };
    const { error } = await supabase.from("organizations").update(payload).eq("id", org.id);
    if (error) { toast.error(error.message); setSaving(false); return; }
    await audit(org.id, "org.plan.update", payload);
    toast.success("Plano atualizado.");
    setSaving(false); onSaved();
  };
  const quickAction = async (label: string, patch: any) => {
    const { error } = await supabase.from("organizations").update(patch).eq("id", org.id);
    if (error) return toast.error(error.message);
    await audit(org.id, label, patch);
    toast.success("Feito.");
    onSaved();
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Input label="Plano" value={f.plan} onChange={(v) => setF({ ...f, plan: v })} />
        <div>
          <Label>Status</Label>
          <select value={f.subscription_status} onChange={(e) => setF({ ...f, subscription_status: e.target.value })}
            className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
            {["trialing","active","past_due","suspended","canceled","grace_period"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <Input label="Licenças contratadas" type="number" value={String(f.licenses_total)} onChange={(v) => setF({ ...f, licenses_total: Number(v) as any })} />
        <Input label="Trial até" type="date" value={f.trial_ends_at} onChange={(v) => setF({ ...f, trial_ends_at: v })} />
        <Input label="Grace period até" type="date" value={f.grace_period_ends_at} onChange={(v) => setF({ ...f, grace_period_ends_at: v })} />
        <KPI label="Licenças usadas" value={org.licenses_used ?? 0} />
      </div>
      <div className="flex gap-2">
        <button disabled={saving} onClick={save} className="px-6 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold disabled:opacity-50">
          {saving ? "Salvando…" : "Salvar plano"}
        </button>
      </div>
      <div className="border-t border-slate-200 pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">Ações rápidas</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => quickAction("org.licenses.add", { licenses_total: (org.licenses_total ?? 0) + 10 })} className="px-3 py-2 rounded bg-white border border-slate-200 text-xs">+ 10 licenças</button>
          <button onClick={() => quickAction("org.licenses.remove", { licenses_total: Math.max(0, (org.licenses_total ?? 0) - 10) })} className="px-3 py-2 rounded bg-white border border-slate-200 text-xs">− 10 licenças</button>
          <button onClick={() => quickAction("org.trial.extend", { trial_ends_at: new Date(Date.now() + 30 * 86400000).toISOString() })} className="px-3 py-2 rounded bg-white border border-slate-200 text-xs">Renovar trial +30d</button>
          <button onClick={() => quickAction("org.cancel", { subscription_status: "canceled" })} className="px-3 py-2 rounded bg-white border border-red-200 text-red-600 text-xs">Cancelar</button>
          <button onClick={() => quickAction("org.reactivate", { subscription_status: "active", suspended_at: null })} className="px-3 py-2 rounded bg-white border border-emerald-200 text-emerald-700 text-xs">Reativar</button>
        </div>
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