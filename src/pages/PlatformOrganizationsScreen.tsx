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
  { key: "trialing", label: "Trials" },
  { key: "past_due", label: "Past due" },
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

const healthColor = (s: string) =>
  s === "healthy" ? "text-emerald-600" :
  s === "attention" ? "text-amber-600" :
  s === "at_risk" ? "text-red-600" :
  s === "over_limit" ? "text-orange-600" :
  s === "archived" ? "text-slate-400" : "text-slate-500";

const fmtDate = (v: string | null) => (v ? new Date(v).toLocaleDateString("pt-BR") : "—");
const fmtRel = (v: string | null) => {
  if (!v) return "—";
  const days = Math.floor((Date.now() - new Date(v).getTime()) / 86400000);
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
    const { error } = await supabase.from("organizations").update(patch as any).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("platform_audit_logs" as any).insert({
      action: actionLabel, entity_type: "organization", entity_id: id, metadata: patch,
    });
    toast.success("Atualizado.");
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
                    <td className="p-3 text-slate-700">{r.subscription_status ?? "—"}</td>
                    <td className="p-3 text-slate-700">{r.plan ?? "—"}</td>
                    <td className="p-3">{r.licenses_used ?? 0} / {r.licenses_total ?? 0}</td>
                    <td className="p-3">{r.active_users_30d}</td>
                    <td className="p-3 text-slate-600 text-xs">{fmtRel(r.last_activity_at)}</td>
                    <td className="p-3">{r.last_score ?? "—"}</td>
                    <td className="p-3 text-slate-500 text-xs">{fmtDate(r.last_dna_generated_at)}</td>
                    <td className="p-3">{r.ai_messages_30d}</td>
                    <td className="p-3 text-slate-600 text-xs">{fmtDate(r.created_at)}</td>
                    <td className={`p-3 font-bold text-xs ${healthColor(r.health_status)}`}>{r.health_status}</td>
                    <td className="p-3">
                      <RowActions row={r} onAction={setAction} />
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

      {showCreate && <NewOrgModal onClose={() => setShowCreate(false)} onSaved={load} />}
    </PlatformAdminLayout>
  );
};

const RowActions = ({ row, onAction }: {
  row: Row;
  onAction: (id: string, patch: Record<string, any>, label: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

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
          {!isSuspended ? (
            <button onClick={() => { setOpen(false); onAction(row.id, { suspended_at: new Date().toISOString(), subscription_status: "suspended" }, "org.suspend"); }}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-amber-600">Suspender</button>
          ) : (
            <button onClick={() => { setOpen(false); onAction(row.id, { suspended_at: null, subscription_status: "active" }, "org.reactivate"); }}
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
};

/* ---------- Modal: Nova empresa ---------- */

type Section = "empresa" | "responsavel" | "plano" | "rh" | "notas";

const NewOrgModal = ({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) => {
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<Section>("empresa");
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
  const [slugTouched, setSlugTouched] = useState(false);

  const slugify = (s: string) =>
    s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

  const save = async () => {
    if (!form.name || !form.slug) { toast.error("Nome e slug são obrigatórios."); setOpen("empresa"); return; }
    setSaving(true);
    // Slug duplicado?
    const { data: dup } = await supabase.from("organizations").select("id").eq("slug", form.slug).maybeSingle();
    if (dup?.id) {
      toast.error("Slug já em uso. Escolha outro.");
      setSaving(false); setOpen("empresa"); return;
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
    const { data, error } = await supabase.from("organizations").insert(payload).select("id").maybeSingle();
    if (error || !data?.id) {
      const msg = error?.message || "";
      if (msg.includes("organizations_slug_key") || msg.toLowerCase().includes("duplicate")) {
        toast.error("Slug já em uso. Escolha outro.");
        setOpen("empresa");
      } else {
        toast.error(msg || "Falha ao criar.");
      }
      setSaving(false); return;
    }
    const orgId = data.id as string;

    const settingsRows = RH_FLAG_KEYS.map((key) => ({
      organization_id: orgId, key, value: { enabled: !!flags[key] } as any,
    }));
    await supabase.from("organization_settings" as any).upsert(settingsRows, {
      onConflict: "organization_id,key",
    });

    await supabase.from("platform_audit_logs" as any).insert({
      action: "org.create", entity_type: "organization", entity_id: orgId, metadata: payload,
    });
    toast.success("Empresa criada.");
    setSaving(false);
    onSaved();
    onClose();
  };

  const Sec = ({ id, title, children }: { id: Section; title: string; children: React.ReactNode }) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(open === id ? id : id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="font-bold text-slate-800 text-sm">{title}</span>
        <span className="text-slate-400 text-xs">{open === id ? "▾" : "▸"}</span>
      </button>
      {open === id && <div className="px-4 pb-4 space-y-3">{children}</div>}
      {open !== id && <button onClick={() => setOpen(id)} className="hidden" />}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-slate-50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900">Nova empresa</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
        </div>

        <div className="space-y-3">
          {/* Simple accordion via click */}
          <div className="flex gap-1 mb-2 flex-wrap">
            {([
              ["empresa","1. Dados"],["responsavel","2. Responsável"],
              ["plano","3. Plano"],["rh","4. Config RH"],["notas","5. Notas"]
            ] as [Section,string][]).map(([k,l]) => (
              <button key={k} onClick={() => setOpen(k)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${open===k?"bg-[#F88A2B] text-black border-[#F88A2B]":"bg-white text-slate-600 border-slate-200"}`}>
                {l}
              </button>
            ))}
          </div>

          {open==="empresa" && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome *" value={form.name} onChange={(v) => {
                setForm((f) => ({ ...f, name: v, slug: slugTouched ? f.slug : slugify(v) }));
              }} />
              <Input label="Slug *" value={form.slug} onChange={(v) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: slugify(v) }));
              }} />
              <Input label="CNPJ" value={form.cnpj} onChange={(v) => setForm({ ...form, cnpj: v })} />
              <Input label="Domínio" value={form.domain} onChange={(v) => setForm({ ...form, domain: v })} placeholder="empresa.com.br" />
              <Input label="Logo (URL)" value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} />
              <Input label="Segmento" value={form.segment} onChange={(v) => setForm({ ...form, segment: v })} />
              <Input label="Tamanho" value={form.company_size} onChange={(v) => setForm({ ...form, company_size: v })} placeholder="ex: 50-200" />
              <Input label="País" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
              <Input label="Estado" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
              <Input label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            </div>
          )}

          {open==="responsavel" && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" value={form.responsible_name} onChange={(v) => setForm({ ...form, responsible_name: v })} />
              <Input label="E-mail" value={form.responsible_email} onChange={(v) => setForm({ ...form, responsible_email: v })} />
              <Input label="Telefone" value={form.responsible_phone} onChange={(v) => setForm({ ...form, responsible_phone: v })} />
              <Input label="Cargo" value={form.responsible_role} onChange={(v) => setForm({ ...form, responsible_role: v })} />
              <p className="col-span-2 text-[11px] text-slate-500">Este responsável é apenas informação comercial. Não cria acesso ainda.</p>
            </div>
          )}

          {open==="plano" && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Plano" value={form.plan} onChange={(v) => setForm({ ...form, plan: v })} placeholder="ex: enterprise" />
              <div>
                <Label>Status</Label>
                <select value={form.subscription_status}
                  onChange={(e) => setForm({ ...form, subscription_status: e.target.value })}
                  className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
                  {["trialing","active","past_due","suspended","canceled","grace_period"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Input label="Licenças contratadas" type="number" value={String(form.licenses_total)} onChange={(v) => setForm({ ...form, licenses_total: Number(v) })} />
              <Input label="Trial até" type="date" value={form.trial_ends_at} onChange={(v) => setForm({ ...form, trial_ends_at: v })} />
              <Input label="Grace period até" type="date" value={form.grace_period_ends_at} onChange={(v) => setForm({ ...form, grace_period_ends_at: v })} />
            </div>
          )}

          {open==="rh" && (
            <div className="grid grid-cols-2 gap-2">
              {RH_FLAG_KEYS.map((k) => (
                <label key={k} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" checked={!!flags[k]} onChange={(e) => setFlags({ ...flags, [k]: e.target.checked })} />
                  {FEATURE_FLAG_LABELS[k] || k}
                </label>
              ))}
            </div>
          )}

          {open==="notas" && (
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

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-700">Cancelar</button>
          <button disabled={saving} onClick={save} className="flex-1 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold disabled:opacity-50">
            {saving ? "Salvando…" : "Criar empresa"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{children}</label>
);

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