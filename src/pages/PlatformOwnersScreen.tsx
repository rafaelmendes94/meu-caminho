import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { setImpersonation } from "@/components/admin/ImpersonationBanner";

type Owner = {
  user_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  organization_id: string | null;
  organization_name: string | null;
  plan: string | null;
  subscription_status: string | null;
  licenses_total: number | null;
  licenses_used: number | null;
  last_sign_in_at: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  suspension_until: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  invite_accepted_at: string | null;
  mrr_cents: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

type Kpis = {
  active: number; trialing: number; suspended: number; never_accessed: number;
  deleted: number; licenses_total: number; licenses_used: number; licenses_free: number;
  mrr_cents: number; arr_cents: number; churn_90d: number;
};

const fmtDate = (v: string | null) => (v ? new Date(v).toLocaleDateString("pt-BR") : "—");
const fmtMoney = (cents: number) => `R$ ${(cents / 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

const statusPill = (o: Owner) => {
  if (o.deleted_at) return { label: "Excluído", cls: "bg-white/10 text-white/50" };
  if (o.suspended_at) return { label: "Suspenso", cls: "bg-red-500/20 text-red-300" };
  if (!o.invite_accepted_at) return { label: "Sem acesso", cls: "bg-amber-500/20 text-amber-300" };
  if (o.subscription_status === "trialing") return { label: "Trial", cls: "bg-blue-500/20 text-blue-300" };
  if (o.subscription_status === "active") return { label: "Ativo", cls: "bg-emerald-500/20 text-emerald-300" };
  if (o.subscription_status === "past_due") return { label: "Past Due", cls: "bg-orange-500/20 text-orange-300" };
  if (o.subscription_status === "canceled") return { label: "Cancelado", cls: "bg-white/10 text-white/50" };
  return { label: o.subscription_status ?? "—", cls: "bg-white/10 text-white/60" };
};

const Card = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{label}</p>
    <p className="text-2xl font-black mt-1">{value}</p>
    {hint && <p className="text-[11px] text-white/50 mt-1">{hint}</p>}
  </div>
);

const PlatformOwnersScreen = () => {
  const [rows, setRows] = useState<Owner[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);
  const [licensing, setLicensing] = useState<Owner | null>(null);
  const [suspending, setSuspending] = useState<Owner | null>(null);
  const [subscription, setSubscription] = useState<Owner | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: list, error: e1 }, { data: k, error: e2 }] = await Promise.all([
      supabase.rpc("admin_list_owners" as any),
      supabase.rpc("admin_owners_kpis" as any),
    ]);
    if (e1) toast.error(e1.message); else setRows((list ?? []) as Owner[]);
    if (e2) toast.error(e2.message); else setKpis(k as unknown as Kpis);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status === "active" && !(r.subscription_status === "active" && !r.suspended_at && !r.deleted_at)) return false;
      if (status === "trialing" && r.subscription_status !== "trialing") return false;
      if (status === "suspended" && !r.suspended_at) return false;
      if (status === "no_access" && r.invite_accepted_at) return false;
      if (status === "deleted" && !r.deleted_at) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [r.full_name, r.email, r.organization_name].some((v) => (v ?? "").toLowerCase().includes(q));
    });
  }, [rows, search, status]);

  const callAction = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("admin-owner-action", { body: payload });
    if (error) { toast.error(error.message); return null; }
    if ((data as any)?.error) { toast.error((data as any).error); return null; }
    return data;
  };

  const onImpersonate = async (o: Owner) => {
    const data = await callAction({ action: "impersonate", email: o.email, redirect_to: `${window.location.origin}/enterprise/rh/welcome` });
    if (!data) return;
    setImpersonation({ email: o.email, owner_id: o.user_id, organization_name: o.organization_name ?? undefined });
    toast.success("Abrindo sessão do Owner...");
    window.location.href = (data as any).action_link;
  };

  const onSuspend = async (o: Owner, reason: string, until: string) => {
    const ok = await callAction({ action: "suspend", user_id: o.user_id, organization_id: o.organization_id, reason, until: until || null });
    if (ok) { toast.success("Empresa suspensa."); setSuspending(null); void load(); }
  };
  const onReactivate = async (o: Owner) => {
    const ok = await callAction({ action: "reactivate", user_id: o.user_id, organization_id: o.organization_id });
    if (ok) { toast.success("Empresa reativada."); void load(); }
  };
  const onReset = async (o: Owner) => {
    const ok = await callAction({ action: "reset_password", user_id: o.user_id, email: o.email });
    if (ok) toast.success("E-mail de reset enviado.");
  };
  const onResendInvite = async (o: Owner) => {
    const ok = await callAction({ action: "resend_invite", user_id: o.user_id, email: o.email });
    if (ok) toast.success("Convite reenviado.");
  };
  const onDelete = async (o: Owner) => {
    if (!confirm(`Excluir owner ${o.email}? A empresa será marcada como excluída (soft delete).`)) return;
    const ok = await callAction({ action: "soft_delete", user_id: o.user_id, organization_id: o.organization_id });
    if (ok) { toast.success("Owner excluído."); void load(); }
  };

  return (
    <PlatformAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">Organizações</p>
          <h1 className="text-3xl font-black text-white">Owners</h1>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 rounded-lg bg-[#F88A2B] text-black text-sm font-bold hover:opacity-90">
          Novo Owner
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Card label="Ativos" value={kpis?.active ?? "—"} />
        <Card label="Trial" value={kpis?.trialing ?? "—"} />
        <Card label="Suspensos" value={kpis?.suspended ?? "—"} />
        <Card label="Sem acesso" value={kpis?.never_accessed ?? "—"} />
        <Card label="Licenças" value={kpis ? `${kpis.licenses_used}/${kpis.licenses_total}` : "—"} hint={kpis ? `${kpis.licenses_free} livres` : ""} />
        <Card label="MRR" value={kpis ? fmtMoney(kpis.mrr_cents) : "—"} hint={kpis ? `ARR ${fmtMoney(kpis.arr_cents)} · Churn 90d ${kpis.churn_90d}` : ""} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou empresa..."
          className="flex-1 min-w-[240px] h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm">
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="trialing">Trial</option>
          <option value="suspended">Suspensos</option>
          <option value="no_access">Sem acesso</option>
          <option value="deleted">Excluídos</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-white/50">
            <tr>
              {["Nome", "Empresa", "E-mail", "Telefone", "Plano", "Licenças", "Status", "Último acesso", "Próxima cobrança", "Criado", ""].map((h) => (
                <th key={h} className="text-left px-3 py-3 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} className="px-3 py-10 text-center text-white/40">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={11} className="px-3 py-10 text-center text-white/40">Nenhum owner encontrado.</td></tr>
            ) : filtered.map((o) => {
              const s = statusPill(o);
              return (
                <tr key={o.user_id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-3">{o.full_name ?? "—"}</td>
                  <td className="px-3 py-3 text-white/80">{o.organization_name ?? "—"}</td>
                  <td className="px-3 py-3 text-white/60">{o.email}</td>
                  <td className="px-3 py-3 text-white/60">{o.phone ?? "—"}</td>
                  <td className="px-3 py-3 text-white/80">{o.plan ?? "—"}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => setLicensing(o)} className="text-[#F88A2B] hover:underline">
                      {(o.licenses_used ?? 0)}/{(o.licenses_total ?? 0)}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-3 py-3 text-white/60">{fmtDate(o.last_sign_in_at)}</td>
                  <td className="px-3 py-3 text-white/60">{fmtDate(o.current_period_end ?? o.trial_ends_at)}</td>
                  <td className="px-3 py-3 text-white/60">{fmtDate(o.created_at)}</td>
                  <td className="px-3 py-3 text-right">
                    <ActionsMenu
                      o={o}
                      onEdit={() => setEditing(o)}
                      onImpersonate={() => onImpersonate(o)}
                      onSuspend={() => setSuspending(o)}
                      onReactivate={() => onReactivate(o)}
                      onReset={() => onReset(o)}
                      onResendInvite={() => onResendInvite(o)}
                      onSubscription={() => setSubscription(o)}
                      onDelete={() => onDelete(o)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateOwnerModal onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); void load(); }} />}
      {editing && <EditOwnerModal owner={editing} onClose={() => setEditing(null)} onDone={() => { setEditing(null); void load(); }} />}
      {licensing && <LicensesModal owner={licensing} onClose={() => setLicensing(null)} onDone={() => { setLicensing(null); void load(); }} callAction={callAction} />}
      {suspending && <SuspendModal owner={suspending} onClose={() => setSuspending(null)} onConfirm={(r, u) => onSuspend(suspending, r, u)} />}
      {subscription && <SubscriptionModal owner={subscription} onClose={() => setSubscription(null)} />}
    </PlatformAdminLayout>
  );
};

// ------------ Action menu ------------
const ActionsMenu = ({ o, onEdit, onImpersonate, onSuspend, onReactivate, onReset, onResendInvite, onSubscription, onDelete }: {
  o: Owner;
  onEdit: () => void; onImpersonate: () => void; onSuspend: () => void; onReactivate: () => void;
  onReset: () => void; onResendInvite: () => void; onSubscription: () => void; onDelete: () => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setOpen(v => !v)} className="px-2 py-1 rounded hover:bg-white/10 text-white/70">⋯</button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 rounded-lg bg-[#141110] border border-white/10 shadow-xl z-20 text-left">
            <MenuItem onClick={() => { setOpen(false); onEdit(); }}>Editar</MenuItem>
            <MenuItem onClick={() => { setOpen(false); onImpersonate(); }}>Entrar como</MenuItem>
            <MenuItem onClick={() => { setOpen(false); onSubscription(); }}>Assinatura</MenuItem>
            {o.suspended_at
              ? <MenuItem onClick={() => { setOpen(false); onReactivate(); }}>Reativar</MenuItem>
              : <MenuItem onClick={() => { setOpen(false); onSuspend(); }} danger>Suspender</MenuItem>}
            <MenuItem onClick={() => { setOpen(false); onReset(); }}>Resetar senha</MenuItem>
            <MenuItem onClick={() => { setOpen(false); onResendInvite(); }}>Reenviar convite</MenuItem>
            <MenuItem onClick={() => { setOpen(false); onDelete(); }} danger>Excluir</MenuItem>
          </div>
        </>
      )}
    </div>
  );
};
const MenuItem = ({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) => (
  <button onClick={onClick} className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 ${danger ? "text-red-400" : "text-white/80"}`}>{children}</button>
);

// ------------ Create Modal ------------
const Modal = ({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
    <div className="bg-[#141110] border border-white/10 rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black">{title}</h2>
        <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
      </div>
      {children}
    </div>
  </div>
);
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block mb-3">
    <span className="block text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1">{label}</span>
    {children}
  </label>
);
const input = "w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm";

const CreateOwnerModal = ({ onClose, onDone }: { onClose: () => void; onDone: () => void }) => {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    organization_id: "", organization_name: "",
    plan: "starter", licenses_total: 10, subscription_status: "trialing",
    cnpj: "", domain: "",
  });
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [plans, setPlans] = useState<{ slug: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("organizations").select("id,name").is("deleted_at", null).order("name").then(({ data }) => setOrgs(data ?? []));
    supabase.from("platform_plans").select("slug,name").eq("is_active", true).order("sort_order").then(({ data }) => setPlans(data ?? []));
  }, []);

  const submit = async () => {
    if (!form.full_name || !form.email) return toast.error("Nome e e-mail obrigatórios.");
    if (!form.organization_id && !form.organization_name) return toast.error("Escolha ou informe uma empresa.");
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("admin-create-owner", { body: form });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    if ((data as any)?.error) return toast.error((data as any).error);
    toast.success("Owner criado e convite enviado.");
    onDone();
  };

  return (
    <Modal title="Novo Owner" onClose={onClose}>
      <Field label="Nome completo"><input className={input} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
      <Field label="E-mail"><input className={input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Telefone"><input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      <Field label="Empresa existente">
        <select className={input} value={form.organization_id} onChange={(e) => setForm({ ...form, organization_id: e.target.value })}>
          <option value="">— nova empresa —</option>
          {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </Field>
      {!form.organization_id && (
        <>
          <Field label="Nome da nova empresa"><input className={input} value={form.organization_name} onChange={(e) => setForm({ ...form, organization_name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CNPJ"><input className={input} value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} /></Field>
            <Field label="Domínio"><input className={input} value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} /></Field>
          </div>
        </>
      )}
      <div className="grid grid-cols-3 gap-3">
        <Field label="Plano">
          <select className={input} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
            {plans.length === 0 && <option value="">— nenhum plano —</option>}
            {plans.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Licenças"><input type="number" className={input} value={form.licenses_total} onChange={(e) => setForm({ ...form, licenses_total: Number(e.target.value) })} /></Field>
        <Field label="Status">
          <select className={input} value={form.subscription_status} onChange={(e) => setForm({ ...form, subscription_status: e.target.value })}>
            <option value="trialing">Trial</option>
            <option value="active">Ativo</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Cancelado</option>
          </select>
        </Field>
      </div>
      <button disabled={submitting} onClick={submit}
        className="w-full h-11 rounded-lg bg-[#F88A2B] text-black font-bold text-sm mt-2 disabled:opacity-60">
        {submitting ? "Criando..." : "Criar Owner"}
      </button>
    </Modal>
  );
};

// ------------ Edit Modal ------------
const EditOwnerModal = ({ owner, onClose, onDone }: { owner: Owner; onClose: () => void; onDone: () => void }) => {
  const [f, setF] = useState({
    full_name: owner.full_name ?? "", phone: owner.phone ?? "",
    organization_name: owner.organization_name ?? "", plan: owner.plan ?? "starter",
    licenses_total: owner.licenses_total ?? 0, subscription_status: owner.subscription_status ?? "active",
    domain: "", cnpj: "",
  });
  useEffect(() => {
    if (!owner.organization_id) return;
    supabase.from("organizations").select("domain,cnpj").eq("id", owner.organization_id).maybeSingle()
      .then(({ data }) => data && setF((s) => ({ ...s, domain: data.domain ?? "", cnpj: data.cnpj ?? "" })));
  }, [owner.organization_id]);
  const [plans, setPlans] = useState<{ slug: string; name: string }[]>([]);
  useEffect(() => {
    supabase.from("platform_plans").select("slug,name").eq("is_active", true).order("sort_order").then(({ data }) => setPlans(data ?? []));
  }, []);

  const save = async () => {
    await supabase.from("profiles").update({ full_name: f.full_name, phone: f.phone }).eq("id", owner.user_id);
    if (owner.organization_id) {
      await supabase.from("organizations").update({
        name: f.organization_name, plan: f.plan, licenses_total: f.licenses_total,
        subscription_status: f.subscription_status as any, domain: f.domain || null, cnpj: f.cnpj || null,
      }).eq("id", owner.organization_id);
    }
    await supabase.from("platform_audit_logs").insert({
      action: "owner.update", entity_type: "owner", entity_id: owner.user_id,
      organization_id: owner.organization_id, metadata: f as any,
    } as any);
    toast.success("Owner atualizado.");
    onDone();
  };

  return (
    <Modal title="Editar Owner" onClose={onClose}>
      <Field label="Nome"><input className={input} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></Field>
      <Field label="Telefone"><input className={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
      <Field label="Empresa"><input className={input} value={f.organization_name} onChange={(e) => setF({ ...f, organization_name: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="CNPJ"><input className={input} value={f.cnpj} onChange={(e) => setF({ ...f, cnpj: e.target.value })} /></Field>
        <Field label="Domínio"><input className={input} value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Plano">
          <select className={input} value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value })}>
            {plans.length === 0 && <option value="">— nenhum plano —</option>}
            {plans.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Licenças"><input type="number" className={input} value={f.licenses_total} onChange={(e) => setF({ ...f, licenses_total: Number(e.target.value) })} /></Field>
        <Field label="Status">
          <select className={input} value={f.subscription_status} onChange={(e) => setF({ ...f, subscription_status: e.target.value })}>
            <option value="trialing">Trial</option><option value="active">Ativo</option><option value="past_due">Past Due</option><option value="canceled">Cancelado</option>
          </select>
        </Field>
      </div>
      <button onClick={save} className="w-full h-11 rounded-lg bg-[#F88A2B] text-black font-bold text-sm mt-2">Salvar</button>
    </Modal>
  );
};

// ------------ Licenses Modal ------------
const LicensesModal = ({ owner, onClose, onDone, callAction }: {
  owner: Owner; onClose: () => void; onDone: () => void;
  callAction: (p: Record<string, unknown>) => Promise<unknown>;
}) => {
  const total = owner.licenses_total ?? 0;
  const used = owner.licenses_used ?? 0;
  const [newTotal, setNewTotal] = useState(total);

  const save = async () => {
    const ok = await callAction({ action: "update_licenses", organization_id: owner.organization_id, user_id: owner.user_id, licenses_total: newTotal });
    if (ok) { toast.success("Licenças atualizadas."); onDone(); }
  };
  const changePlan = async (plan: string) => {
    const ok = await callAction({ action: "update_plan", organization_id: owner.organization_id, user_id: owner.user_id, plan });
    if (ok) { toast.success(`Plano alterado para ${plan}.`); onDone(); }
  };
  const renew = async () => {
    const ok = await callAction({ action: "renew_trial", organization_id: owner.organization_id, user_id: owner.user_id, days: 14 });
    if (ok) { toast.success("Trial renovado por 14 dias."); onDone(); }
  };
  const cancel = async () => {
    if (!confirm("Cancelar assinatura?")) return;
    const ok = await callAction({ action: "cancel_subscription", organization_id: owner.organization_id, user_id: owner.user_id });
    if (ok) { toast.success("Assinatura cancelada."); onDone(); }
  };

  return (
    <Modal title={`Licenças — ${owner.organization_name ?? "—"}`} onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card label="Contratadas" value={total} />
        <Card label="Usadas" value={used} />
        <Card label="Livres" value={Math.max(0, total - used)} />
      </div>
      <Field label="Total contratado"><input type="number" className={input} value={newTotal} onChange={(e) => setNewTotal(Number(e.target.value))} /></Field>
      <button onClick={save} className="w-full h-10 rounded-lg bg-[#F88A2B] text-black font-bold text-sm mb-3">Atualizar licenças</button>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button onClick={() => changePlan("growth")} className="h-10 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10">Upgrade → Growth</button>
        <button onClick={() => changePlan("enterprise")} className="h-10 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10">Upgrade → Enterprise</button>
        <button onClick={() => changePlan("starter")} className="h-10 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10">Downgrade → Starter</button>
        <button onClick={renew} className="h-10 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10">Renovar trial (14d)</button>
      </div>
      <button onClick={cancel} className="w-full h-10 rounded-lg bg-red-500/20 text-red-300 text-sm font-bold hover:bg-red-500/30">Cancelar assinatura</button>
    </Modal>
  );
};

// ------------ Suspend Modal ------------
const SuspendModal = ({ owner, onClose, onConfirm }: { owner: Owner; onClose: () => void; onConfirm: (reason: string, until: string) => void }) => {
  const [reason, setReason] = useState("");
  const [until, setUntil] = useState("");
  return (
    <Modal title={`Suspender — ${owner.organization_name ?? owner.email}`} onClose={onClose}>
      <Field label="Motivo"><textarea rows={3} className={`${input} h-auto py-2`} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      <Field label="Prazo (opcional)"><input type="date" className={input} value={until} onChange={(e) => setUntil(e.target.value)} /></Field>
      <p className="text-xs text-white/50 mb-3">Bloqueia login, IA, convites e novos check-ins. Nenhum dado é apagado.</p>
      <button onClick={() => onConfirm(reason, until)} className="w-full h-11 rounded-lg bg-red-500 text-white font-bold text-sm">Confirmar suspensão</button>
    </Modal>
  );
};

// ------------ Subscription Modal ------------
const SubscriptionModal = ({ owner, onClose }: { owner: Owner; onClose: () => void }) => (
  <Modal title={`Assinatura — ${owner.organization_name ?? "—"}`} onClose={onClose}>
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
      <dt className="text-white/50">Stripe Customer</dt><dd className="text-white/80 truncate">{owner.stripe_customer_id ?? "—"}</dd>
      <dt className="text-white/50">Subscription</dt><dd className="text-white/80 truncate">{owner.stripe_subscription_id ?? "—"}</dd>
      <dt className="text-white/50">Plano</dt><dd className="text-white/80">{owner.plan ?? "—"}</dd>
      <dt className="text-white/50">Status</dt><dd className="text-white/80">{owner.subscription_status ?? "—"}</dd>
      <dt className="text-white/50">MRR</dt><dd className="text-white/80">{owner.mrr_cents ? fmtMoney(owner.mrr_cents) : "—"}</dd>
      <dt className="text-white/50">Próxima cobrança</dt><dd className="text-white/80">{fmtDate(owner.current_period_end)}</dd>
      <dt className="text-white/50">Trial até</dt><dd className="text-white/80">{fmtDate(owner.trial_ends_at)}</dd>
    </dl>
    <p className="text-[11px] text-white/40 mt-4">
      Cobranças e faturas são gerenciadas via Stripe. Use o Stripe Dashboard para emissão/estorno.
    </p>
  </Modal>
);

export default PlatformOwnersScreen;