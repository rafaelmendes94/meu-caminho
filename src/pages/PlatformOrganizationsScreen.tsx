import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { RH_FLAG_KEYS, FEATURE_FLAG_LABELS } from "@/lib/orgSettings";

type Row = {
  id: string;
  name: string;
  slug: string;
  plan: string | null;
  subscription_status: string | null;
  licenses_total: number | null;
  licenses_used: number | null;
  created_at: string;
  archived_at: string | null;
  suspended_at: string | null;
  active_users_30d: number;
  ai_messages_30d: number;
  last_activity_at: string | null;
  last_dna_generated_at: string | null;
  last_score: number | null;
  health_status: string;
  total_count: number;
  responsible_name: string | null;
  responsible_email: string | null;
};

const STATUSES = [
  { key: null, label: "Todas" },
  { key: "active", label: "Ativas" },
  { key: "trialing", label: "Em teste" },
  { key: "past_due", label: "Em atraso" },
  { key: "canceled", label: "Canceladas" },
  { key: "suspended", label: "Suspensas" },
] as const;

const SORTS = [
  { key: "created_desc", label: "Mais recentes" },
  { key: "created_asc", label: "Mais antigas" },
  { key: "name_asc", label: "Nome A-Z" },
  { key: "name_desc", label: "Nome Z-A" },
  { key: "licenses_desc", label: "Mais licenças" },
] as const;

const PAGE_SIZE = 20;

type PlanOption = {
  slug: string;
  name: string;
  default_licenses: number;
  price_monthly_cents: number;
  currency: string;
};

const healthColor = (s: string) =>
  s === "healthy" ? "text-emerald-600" :
  s === "attention" ? "text-amber-600" :
  s === "at_risk" ? "text-red-600" :
  s === "over_limit" ? "text-orange-600" :
  s === "archived" ? "text-slate-400" : "text-slate-500";

const fmtDate = (v: string | null) => (v ? new Date(v).toLocaleDateString("pt-BR") : "—");

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  trialing: "Em teste",
  active: "Ativa",
  past_due: "Em atraso",
  suspended: "Suspensa",
  canceled: "Cancelada",
  grace_period: "Tolerância",
};

const HEALTH_LABELS: Record<string, string> = {
  healthy: "Saudável",
  attention: "Atenção",
  at_risk: "Em risco",
  over_limit: "Acima do limite",
  archived: "Arquivada",
};
const fmtRel = (v: string | null) => {
  if (!v) return "—";
  const t = new Date(v).getTime();
  if (!Number.isFinite(t) || t <= 0) return "—";
  // 'epoch' fallback vindo do backend quando não houve atividade real
  if (new Date(v).getUTCFullYear() < 2000) return "—";
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `${days}d atrás`;
  return fmtDate(v);
};

const PlatformOrganizationsScreen = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [sort, setSort] = useState<string>("created_desc");
  const [page, setPage] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [editOrgId, setEditOrgId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_platform_organizations" as any, {
      _search: search || null,
      _status: status,
      _include_archived: includeArchived,
      _limit: PAGE_SIZE,
      _offset: page * PAGE_SIZE,
      _sort: sort,
    });
    if (error) { setErr(error.message); setRows([]); setTotal(0); }
    else {
      const r = (data as Row[]) ?? [];
      setRows(r);
      setTotal(r[0]?.total_count ?? 0);
      setErr(null);
    }
    setLoading(false);
  }, [search, status, includeArchived, sort, page]);

  useEffect(() => { load(); }, [load]);

  const setAction = async (id: string, patch: Record<string, any>, actionLabel: string) => {
    const { _reason, ...dbPatch } = patch;
    const { error } = await supabase.from("organizations").update(dbPatch as any).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("platform_audit_logs" as any).insert({
      action: actionLabel, entity_type: "organization", entity_id: id, metadata: { ...dbPatch, reason: _reason ?? null },
    });
    toast.success("Empresa atualizada.");
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PlatformAdminLayout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Empresas</h1>
          <p className="text-slate-500 mt-1 text-sm">CRM interno de empresas clientes ({total}).</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold hover:bg-[#F88A2B]/90"
        >+ Nova empresa</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <input
          value={search}
          onChange={(e) => { setPage(0); setSearch(e.target.value); }}
          placeholder="Buscar por nome, slug, CNPJ, domínio, responsável ou e-mail…"
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 flex-1 min-w-[240px]"
        />
        <select
          value={sort}
          onChange={(e) => { setPage(0); setSort(e.target.value); }}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900"
        >
          {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-500 px-2">
          <input type="checkbox" checked={includeArchived} onChange={(e) => { setPage(0); setIncludeArchived(e.target.checked); }} />
          Incluir arquivadas
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s.label}
            onClick={() => { setPage(0); setStatus(s.key as any); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              status === s.key
                ? "bg-[#F88A2B] border-[#F88A2B] text-black"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >{s.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Não foi possível carregar as empresas. {err}
          <button onClick={load} className="ml-3 underline">Tentar novamente</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-600 mb-2">Nenhuma empresa encontrada.</p>
          <p className="text-slate-400 text-xs mb-4">Ajuste os filtros ou cadastre a primeira empresa.</p>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold">
            + Nova empresa
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="text-left p-3">Empresa</th>
                  <th className="text-left p-3">Responsável</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Plano</th>
                  <th className="text-left p-3">Licenças</th>
                  <th className="text-left p-3">Ativos 30d</th>
                  <th className="text-left p-3">Último acesso</th>
                  <th className="text-left p-3">Score</th>
                  <th className="text-left p-3">DNA</th>
                  <th className="text-left p-3">IA 30d</th>
                  <th className="text-left p-3">Criada</th>
                  <th className="text-left p-3">Saúde</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <Link to={`/admin/organizations/${r.id}`} className="font-semibold text-slate-900 hover:text-[#F88A2B]">{r.name}</Link>
                      <p className="text-[11px] text-slate-400">{r.slug}</p>
                    </td>
                    <td className="p-3 text-slate-700">
                      {r.responsible_name || "—"}
                      {r.responsible_email && <p className="text-[11px] text-slate-400">{r.responsible_email}</p>}
                    </td>
                    <td className="p-3 text-slate-700">{r.subscription_status ? (SUBSCRIPTION_STATUS_LABELS[r.subscription_status] ?? r.subscription_status) : "—"}</td>
                    <td className="p-3 text-slate-700">{r.plan ?? "—"}</td>
                    <td className="p-3">{r.licenses_used ?? 0} / {r.licenses_total ?? 0}</td>
                    <td className="p-3">{r.active_users_30d}</td>
                    <td className="p-3 text-slate-600 text-xs">{fmtRel(r.last_activity_at)}</td>
                    <td className="p-3">{r.last_score ?? "—"}</td>
                    <td className="p-3 text-slate-500 text-xs">{fmtDate(r.last_dna_generated_at)}</td>
                    <td className="p-3">{r.ai_messages_30d}</td>
                    <td className="p-3 text-slate-600 text-xs">{fmtDate(r.created_at)}</td>
                    <td className={`p-3 font-bold text-xs ${healthColor(r.health_status)}`}>{HEALTH_LABELS[r.health_status] ?? r.health_status}</td>
                    <td className="p-3">
                      <RowActions row={r} onAction={setAction} onEdit={() => setEditOrgId(r.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span>Página {page + 1} de {totalPages} · {total} empresas</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded bg-white border border-slate-200 disabled:opacity-30"
              >← Anterior</button>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded bg-white border border-slate-200 disabled:opacity-30"
              >Próxima →</button>
            </div>
          </div>
        </>
      )}

      {showCreate && <OrgFormModal mode="create" onClose={() => setShowCreate(false)} onSaved={load} />}
      {editOrgId && <OrgFormModal mode="edit" orgId={editOrgId} onClose={() => setEditOrgId(null)} onSaved={load} />}
    </PlatformAdminLayout>
  );
};

const RowActions = ({ row, onAction, onEdit }: {
  row: Row;
  onAction: (id: string, patch: Record<string, any>, label: string) => void;
  onEdit: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [pwdModal, setPwdModal] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const width = 192; // w-48
      setPos({ top: r.bottom + 4, left: Math.min(r.right - width, window.innerWidth - width - 8) });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest?.("[data-row-actions-menu]") &&
          !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open]);

  const isSuspended = !!row.suspended_at || row.subscription_status === "suspended";
  const isArchived = !!row.archived_at;
  return (
    <>
      <button ref={btnRef} onClick={() => setOpen((v) => !v)} className="px-2 py-1 rounded bg-white border border-slate-200 text-xs">⋯</button>
      {open && pos && createPortal(
        <div data-row-actions-menu style={{ position: "fixed", top: pos.top, left: pos.left }} className="w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-[100] py-1 text-xs">
          <Link to={`/admin/organizations/${row.id}`} className="block px-3 py-2 hover:bg-slate-50 text-slate-700">Ver detalhes</Link>
          <button onClick={() => { setOpen(false); onEdit(); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700">Editar</button>
          <button onClick={async () => {
            setOpen(false);
            setPwd(""); setPwd2(""); setShowPwd(false); setPwdModal(true);
          }} className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700">Definir senha do RH</button>
          {!isSuspended ? (
            <button onClick={() => {
              if (!window.confirm(`Suspender "${row.name}"? Os dados são preservados.`)) return;
              const reason = window.prompt("Motivo (opcional):", "") || null;
              setOpen(false);
              onAction(row.id, { suspended_at: new Date().toISOString(), subscription_status: "suspended", _reason: reason } as any, "org.suspend");
            }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-amber-600">Suspender</button>
          ) : (
            <button onClick={() => {
              if (!window.confirm(`Reativar "${row.name}"?`)) return;
              const reason = window.prompt("Motivo (opcional):", "") || null;
              setOpen(false);
              onAction(row.id, { suspended_at: null, subscription_status: "active", _reason: reason } as any, "org.reactivate");
            }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-emerald-600">Reativar</button>
          )}
          {!isArchived ? (
            <button onClick={() => { setOpen(false); onAction(row.id, { archived_at: new Date().toISOString() }, "org.archive"); }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700">Arquivar</button>
          ) : (
            <button onClick={() => { setOpen(false); onAction(row.id, { archived_at: null }, "org.unarchive"); }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700">Desarquivar</button>
          )}
          <button onClick={() => {
            if (!confirm(`Excluir "${row.name}"? Soft delete — pode ser restaurado no banco.`)) return;
            setOpen(false);
            onAction(row.id, { deleted_at: new Date().toISOString() }, "org.soft_delete");
          }} className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600">Excluir (soft)</button>
        </div>,
        document.body
      )}
    </>
  );
  // NOTE: unreachable due to early return above; real return below
};

/* ---------- Modal: Wizard de empresa (criar/editar) ---------- */

type Section = "empresa" | "responsavel" | "plano" | "rh" | "notas";
const STEPS: { id: Section; label: string }[] = [
  { id: "empresa", label: "1. Dados" },
  { id: "responsavel", label: "2. Responsável" },
  { id: "plano", label: "3. Plano" },
  { id: "rh", label: "4. Config RH" },
  { id: "notas", label: "5. Notas" },
];

const OrgFormModal = ({
  mode, orgId, onClose, onSaved,
}: { mode: "create" | "edit"; orgId?: string; onClose: () => void; onSaved: () => void }) => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx].id;
  const isLast = stepIdx === STEPS.length - 1;
  const isFirst = stepIdx === 0;
  const [form, setForm] = useState({
    name: "", slug: "", cnpj: "", domain: "", logo_url: "",
    segment: "", company_size: "", country: "Brasil", state: "", city: "",
    responsible_name: "", responsible_email: "", responsible_phone: "", responsible_role: "",
    plan: "", subscription_status: "trialing", licenses_total: 10,
    trial_ends_at: "", grace_period_ends_at: "",
    internal_notes: "", internal_status: "", customer_success_owner: "", onboarding_status: "",
  });
  const [flags, setFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(RH_FLAG_KEYS.map((k) => [k, true]))
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [plans, setPlans] = useState<PlanOption[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("platform_plans" as any)
        .select("slug,name,default_licenses,price_monthly_cents,currency,sort_order,is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (!alive) return;
      if (error) { console.error(error); return; }
      setPlans((data as any[])?.map((p) => ({
        slug: p.slug, name: p.name,
        default_licenses: p.default_licenses ?? 0,
        price_monthly_cents: p.price_monthly_cents ?? 0,
        currency: p.currency ?? "BRL",
      })) ?? []);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !orgId) return;
    let alive = true;
    (async () => {
      const { data: org, error } = await supabase
        .from("organizations").select("*").eq("id", orgId).maybeSingle();
      if (!alive) return;
      if (error || !org) { toast.error("Falha ao carregar empresa."); onClose(); return; }
      const toDate = (v: any) => (v ? String(v).slice(0, 10) : "");
      setForm((f) => ({
        ...f,
        name: org.name ?? "", slug: org.slug ?? "",
        cnpj: org.cnpj ?? "", domain: org.domain ?? "", logo_url: org.logo_url ?? "",
        segment: org.segment ?? "", company_size: org.company_size ?? "",
        country: org.country ?? "Brasil", state: org.state ?? "", city: org.city ?? "",
        responsible_name: org.responsible_name ?? "",
        responsible_email: org.responsible_email ?? "",
        responsible_phone: org.responsible_phone ?? "",
        responsible_role: org.responsible_role ?? "",
        plan: org.plan ?? "",
        subscription_status: org.subscription_status ?? "trialing",
        licenses_total: org.licenses_total ?? 0,
        trial_ends_at: toDate(org.trial_ends_at),
        grace_period_ends_at: toDate(org.grace_period_ends_at),
        internal_notes: org.internal_notes ?? "",
        internal_status: org.internal_status ?? "",
        customer_success_owner: org.customer_success_owner ?? "",
        onboarding_status: org.onboarding_status ?? "",
      }));
      const { data: settings } = await supabase
        .from("organization_settings" as any).select("key,value").eq("organization_id", orgId);
      if (settings && alive) {
        const next: Record<string, boolean> = { ...Object.fromEntries(RH_FLAG_KEYS.map((k) => [k, true])) };
        for (const row of settings as any[]) {
          if (RH_FLAG_KEYS.includes(row.key)) next[row.key] = !!row.value?.enabled;
        }
        setFlags(next);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [mode, orgId, onClose]);

  const slugify = (s: string) =>
    s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

  const validateStep = (idx: number): string | null => {
    if (idx === 0) {
      if (!form.name.trim()) return "Informe o nome da empresa.";
      if (!form.slug.trim()) return "Informe o slug.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep(stepIdx);
    if (err) { toast.error(err); return; }
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  };
  const prev = () => setStepIdx((i) => Math.max(0, i - 1));

  const save = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      const err = validateStep(i);
      if (err) { toast.error(err); setStepIdx(i); return; }
    }
    setSaving(true);
    // Slug duplicado?
    const { data: dup } = await supabase.from("organizations").select("id").eq("slug", form.slug).maybeSingle();
    if (dup?.id && dup.id !== orgId) {
      toast.error("Slug já em uso. Escolha outro.");
      setSaving(false); setStepIdx(0); return;
    }
    const payload: any = {
      name: form.name, slug: form.slug,
      cnpj: form.cnpj || null, domain: form.domain || null, logo_url: form.logo_url || null,
      segment: form.segment || null, company_size: form.company_size || null,
      country: form.country || null, state: form.state || null, city: form.city || null,
      responsible_name: form.responsible_name || null,
      responsible_email: form.responsible_email || null,
      responsible_phone: form.responsible_phone || null,
      responsible_role: form.responsible_role || null,
      plan: form.plan || null,
      subscription_status: form.subscription_status as any,
      licenses_total: Number(form.licenses_total) || 0,
      trial_ends_at: form.trial_ends_at || null,
      grace_period_ends_at: form.grace_period_ends_at || null,
      internal_notes: form.internal_notes || null,
      internal_status: form.internal_status || null,
      customer_success_owner: form.customer_success_owner || null,
      onboarding_status: form.onboarding_status || null,
    };
    let savedId = orgId ?? null;
    if (mode === "create") {
      const { data, error } = await supabase.from("organizations").insert(payload).select("id").maybeSingle();
      if (error || !data?.id) {
        const msg = error?.message || "";
        if (msg.includes("organizations_slug_key") || msg.toLowerCase().includes("duplicate")) {
          toast.error("Slug já em uso. Escolha outro."); setStepIdx(0);
        } else {
          toast.error(msg || "Falha ao criar.");
        }
        setSaving(false); return;
      }
      savedId = data.id as string;
    } else {
      const { error } = await supabase.from("organizations").update(payload).eq("id", orgId!);
      if (error) {
        const msg = error.message || "";
        if (msg.includes("organizations_slug_key") || msg.toLowerCase().includes("duplicate")) {
          toast.error("Slug já em uso. Escolha outro."); setStepIdx(0);
        } else {
          toast.error(msg || "Falha ao salvar.");
        }
        setSaving(false); return;
      }
    }

    const settingsRows = RH_FLAG_KEYS.map((key) => ({
      organization_id: savedId!, key, value: { enabled: !!flags[key] } as any,
    }));
    await supabase.from("organization_settings" as any).upsert(settingsRows, {
      onConflict: "organization_id,key",
    });

    await supabase.from("platform_audit_logs" as any).insert({
      action: mode === "create" ? "org.create" : "org.update",
      entity_type: "organization", entity_id: savedId, metadata: payload,
    });

    // Ao criar: provisiona o Owner (RH) e envia e-mail de boas-vindas
    if (mode === "create" && savedId && form.responsible_email && form.responsible_name) {
      try {
        const { data: ownerRes, error: ownerErr } = await supabase.functions.invoke("admin-create-owner", {
          body: {
            full_name: form.responsible_name,
            email: form.responsible_email,
            phone: form.responsible_phone || null,
            organization_id: savedId,
            plan: form.plan || "starter",
            licenses_total: Number(form.licenses_total) || 0,
            subscription_status: form.subscription_status,
          },
        });
        if (ownerErr || (ownerRes as any)?.error) {
          toast.success("Empresa criada.");
          toast.warning("Não foi possível enviar o e-mail de acesso ao RH. Use 'Definir senha do RH' no menu de ações.");
        } else {
          toast.success("Empresa criada. Convite enviado ao RH por e-mail.");
        }
      } catch {
        toast.success("Empresa criada.");
        toast.warning("Falha ao provisionar acesso do RH. Use 'Definir senha do RH' no menu de ações.");
      }
    } else {
      toast.success(mode === "create" ? "Empresa criada." : "Empresa atualizada.");
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-slate-50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {mode === "create" ? "Nova empresa" : "Editar empresa"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Etapa {stepIdx + 1} de {STEPS.length} · {STEPS[stepIdx].label.replace(/^\d+\.\s*/, "")}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#F88A2B] transition-all"
                 style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="flex gap-1 mt-3 flex-wrap">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  // permite voltar livremente; ao avançar, valida etapas anteriores
                  if (i <= stepIdx) { setStepIdx(i); return; }
                  for (let j = stepIdx; j < i; j++) {
                    const err = validateStep(j);
                    if (err) { toast.error(err); setStepIdx(j); return; }
                  }
                  setStepIdx(i);
                }}
                className={`text-[11px] px-3 py-1.5 rounded-full font-semibold border transition-colors ${
                  i === stepIdx
                    ? "bg-[#F88A2B] text-black border-[#F88A2B]"
                    : i < stepIdx
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Carregando dados da empresa…</div>
        ) : (
        <div className="space-y-3">
          {step==="empresa" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <CnpjLookupField
                  value={form.cnpj}
                  onChange={(v) => setForm((f) => ({ ...f, cnpj: v }))}
                  onLookup={(data) => {
                    setForm((f) => ({
                      ...f,
                      cnpj: data.cnpj ?? f.cnpj,
                      name: f.name || data.name || "",
                      slug: slugTouched ? f.slug : slugify(data.name || f.name),
                      domain: f.domain || data.domain || "",
                      segment: f.segment || data.segment || "",
                      company_size: f.company_size || data.company_size || "",
                      country: f.country || "Brasil",
                      state: f.state || data.state || "",
                      city: f.city || data.city || "",
                      responsible_email: f.responsible_email || data.email || "",
                      responsible_phone: f.responsible_phone || data.phone || "",
                    }));
                  }}
                />
              </div>
              <Input label="Nome *" value={form.name} onChange={(v) => {
                setForm((f) => ({ ...f, name: v, slug: slugTouched ? f.slug : slugify(v) }));
              }} />
              <Input label="Slug *" value={form.slug} onChange={(v) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: slugify(v) }));
              }} />
              <Input label="Domínio" value={form.domain} onChange={(v) => setForm({ ...form, domain: v })} placeholder="empresa.com.br" />
              <LogoUploadField value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} />
              <Input label="Segmento" value={form.segment} onChange={(v) => setForm({ ...form, segment: v })} />
              <Input label="Tamanho" value={form.company_size} onChange={(v) => setForm({ ...form, company_size: v })} placeholder="ex: 50-200" />
              <Input label="País" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
              <Input label="Estado" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
              <Input label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            </div>
          )}

          {step==="responsavel" && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" value={form.responsible_name} onChange={(v) => setForm({ ...form, responsible_name: v })} />
              <Input label="E-mail" value={form.responsible_email} onChange={(v) => setForm({ ...form, responsible_email: v })} />
              <Input label="Telefone" value={form.responsible_phone} onChange={(v) => setForm({ ...form, responsible_phone: v })} />
              <Input label="Cargo" value={form.responsible_role} onChange={(v) => setForm({ ...form, responsible_role: v })} />
              <p className="col-span-2 text-[11px] text-slate-500">Este responsável é apenas informação comercial. Não cria acesso ainda.</p>
            </div>
          )}

          {step==="plano" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Plano</Label>
                <select
                  value={form.plan}
                  onChange={(e) => {
                    const slug = e.target.value;
                    const p = plans.find((pl) => pl.slug === slug);
                    setForm({
                      ...form,
                      plan: slug,
                      licenses_total: p && p.default_licenses > 0 ? p.default_licenses : form.licenses_total,
                    });
                  }}
                  className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="">Selecione um plano…</option>
                  {plans.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                      {p.price_monthly_cents > 0
                        ? ` — ${(p.price_monthly_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: p.currency })}/mês`
                        : ""}
                    </option>
                  ))}
                  {form.plan && !plans.some((p) => p.slug === form.plan) && (
                    <option value={form.plan}>{form.plan} (atual)</option>
                  )}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Planos gerenciados em <Link to="/plataforma/planos" className="underline">Planos da plataforma</Link>.
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.subscription_status}
                  onChange={(e) => setForm({ ...form, subscription_status: e.target.value })}
                  className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
                  {[
                    { v: "trialing", l: "Em teste" },
                    { v: "active", l: "Ativa" },
                    { v: "past_due", l: "Pagamento em atraso" },
                    { v: "suspended", l: "Suspensa" },
                    { v: "canceled", l: "Cancelada" },
                    { v: "grace_period", l: "Período de tolerância" },
                  ].map((s) => (
                    <option key={s.v} value={s.v}>{s.l}</option>
                  ))}
                </select>
              </div>
              <Input label="Licenças contratadas" type="number" value={String(form.licenses_total)} onChange={(v) => setForm({ ...form, licenses_total: Number(v) })} />
              <Input label="Teste até" type="date" value={form.trial_ends_at} onChange={(v) => setForm({ ...form, trial_ends_at: v })} />
              <Input label="Tolerância até" type="date" value={form.grace_period_ends_at} onChange={(v) => setForm({ ...form, grace_period_ends_at: v })} />
            </div>
          )}

          {step==="rh" && (
            <div className="grid grid-cols-2 gap-2">
              {RH_FLAG_KEYS.map((k) => (
                <label key={k} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" checked={!!flags[k]} onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })} />
                  {FEATURE_FLAG_LABELS[k] || k}
                </label>
              ))}
            </div>
          )}

          {step==="notas" && (
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Observações internas</Label>
                <textarea value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                  rows={4} className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="Status comercial" value={form.internal_status} onChange={(v) => setForm({ ...form, internal_status: v })} />
                <Input label="CS responsável" value={form.customer_success_owner} onChange={(v) => setForm({ ...form, customer_success_owner: v })} />
                <Input label="Status onboarding" value={form.onboarding_status} onChange={(v) => setForm({ ...form, onboarding_status: v })} />
              </div>
            </div>
          )}
        </div>
        )}

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700">
            Cancelar
          </button>
          <button
            onClick={prev}
            disabled={isFirst || loading}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <div className="flex-1" />
          {!isLast ? (
            <button
              onClick={next}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold disabled:opacity-50"
            >
              Próximo →
            </button>
          ) : (
            <button
              disabled={saving || loading}
              onClick={save}
              className="px-6 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold disabled:opacity-50"
            >
              {saving ? "Salvando…" : mode === "create" ? "Criar empresa" : "Salvar alterações"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{children}</label>
);

const maskCnpj = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

type CnpjLookupData = {
  cnpj?: string; name?: string; domain?: string; segment?: string;
  company_size?: string; state?: string; city?: string;
  email?: string; phone?: string;
};

const CnpjLookupField = ({
  value, onChange, onLookup,
}: { value: string; onChange: (v: string) => void; onLookup: (d: CnpjLookupData) => void }) => {
  const [busy, setBusy] = useState(false);
  const digits = value.replace(/\D/g, "");

  const fetchCnpj = async (raw: string) => {
    const only = raw.replace(/\D/g, "");
    if (only.length !== 14) {
      toast.error("CNPJ inválido. Informe 14 dígitos.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${only}`);
      if (!res.ok) {
        toast.error(res.status === 404 ? "CNPJ não encontrado." : "Falha ao consultar CNPJ.");
        return;
      }
      const d: any = await res.json();
      const empresa = d.nome_fantasia?.trim() || d.razao_social?.trim() || "";
      const phoneRaw = d.ddd_telefone_1 || d.ddd_telefone_2 || "";
      const phone = phoneRaw ? phoneRaw.replace(/^(\d{2})(\d{4,5})(\d{4}).*/, "($1) $2-$3") : "";
      const sizeMap: Record<string, string> = {
        "MICRO EMPRESA": "1-19",
        "EMPRESA DE PEQUENO PORTE": "20-99",
        "DEMAIS": "100+",
      };
      onLookup({
        cnpj: maskCnpj(only),
        name: empresa,
        segment: d.cnae_fiscal_descricao || "",
        company_size: sizeMap[d.porte?.descricao ?? d.porte ?? ""] || "",
        state: d.uf || "",
        city: d.municipio ? d.municipio.charAt(0) + d.municipio.slice(1).toLowerCase() : "",
        email: d.email || "",
        phone,
      });
      toast.success("Dados preenchidos a partir do CNPJ.");
    } catch {
      toast.error("Falha ao consultar CNPJ.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Label>CNPJ (busca automática)</Label>
      <div className="mt-1 flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            const masked = maskCnpj(e.target.value);
            onChange(masked);
            if (masked.replace(/\D/g, "").length === 14) void fetchCnpj(masked);
          }}
          placeholder="00.000.000/0000-00"
          inputMode="numeric"
          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => void fetchCnpj(value)}
          disabled={busy || digits.length !== 14}
          className="px-3 py-2 rounded-lg bg-[#F88A2B] text-black text-xs font-bold disabled:opacity-50 whitespace-nowrap"
        >
          {busy ? "Buscando…" : "Buscar"}
        </button>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">Ao completar 14 dígitos, os dados públicos são preenchidos automaticamente.</p>
    </div>
  );
};

const LogoUploadField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Envie um arquivo de imagem (PNG, JPG, SVG ou WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo excede 5MB.");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `nova/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("org-logos").upload(path, file, {
        contentType: file.type || undefined,
        cacheControl: "31536000",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data, error: signErr } = await supabase.storage.from("org-logos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr) throw signErr;
      onChange(data.signedUrl);
      toast.success("Logo enviada.");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha no upload.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <Label>Logo</Label>
      <div className="mt-1 flex gap-2 items-start">
        {value ? (
          <img src={value} alt="Logo" className="h-11 w-11 rounded-lg object-contain bg-white border border-slate-200 shrink-0" />
        ) : (
          <div className="h-11 w-11 rounded-lg border border-dashed border-slate-300 bg-slate-100 shrink-0" />
        )}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL ou envie um arquivo"
            className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 text-sm"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="px-3 py-2 rounded-lg bg-[#F88A2B] text-black text-xs font-bold disabled:opacity-50 whitespace-nowrap"
          >
            {busy ? "Enviando…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) => (
  <div>
    <Label>{label}</Label>
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400"
    />
  </div>
);

export default PlatformOrganizationsScreen;