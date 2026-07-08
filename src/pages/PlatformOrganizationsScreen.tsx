import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

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
};

const STATUSES = [
  { key: null, label: "Todas" },
  { key: "active", label: "Ativas" },
  { key: "trialing", label: "Trials" },
  { key: "past_due", label: "Past Due" },
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
  s === "healthy" ? "text-emerald-400" :
  s === "attention" ? "text-amber-400" :
  s === "at_risk" ? "text-red-400" :
  s === "over_limit" ? "text-orange-400" :
  s === "archived" ? "text-white/40" : "text-white/60";

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
  const [editing, setEditing] = useState<Row | null>(null);

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
          <h1 className="text-3xl font-black">Organizações</h1>
          <p className="text-white/60 mt-1">CRM interno de empresas clientes ({total}).</p>
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
          placeholder="Buscar por nome ou slug…"
          className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 flex-1 min-w-[220px]"
        />
        <select
          value={sort}
          onChange={(e) => { setPage(0); setSort(e.target.value); }}
          className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
        >
          {SORTS.map((s) => <option key={s.key} value={s.key} className="bg-[#0B0908]">{s.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs text-white/60 px-2">
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
                : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/30"
            }`}
          >{s.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          Não foi possível carregar as organizações. {err}
          <button onClick={load} className="ml-3 underline">Tentar novamente</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-white/60 mb-2">Nenhuma organização encontrada.</p>
          <p className="text-white/40 text-xs mb-4">Ajuste os filtros ou cadastre a primeira empresa.</p>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold">
            + Nova empresa
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/50">
                <tr>
                  <th className="text-left p-3">Nome / Slug</th>
                  <th className="text-left p-3">Plano</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Licenças</th>
                  <th className="text-left p-3">Ativos 30d</th>
                  <th className="text-left p-3">Último acesso</th>
                  <th className="text-left p-3">DNA</th>
                  <th className="text-left p-3">Score</th>
                  <th className="text-left p-3">IA 30d</th>
                  <th className="text-left p-3">Criada</th>
                  <th className="text-left p-3">Saúde</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="p-3">
                      <Link to={`/admin/organizations/${r.id}`} className="font-semibold hover:text-[#F88A2B]">{r.name}</Link>
                      <p className="text-[11px] text-white/40">{r.slug}</p>
                    </td>
                    <td className="p-3 text-white/70">{r.plan ?? "—"}</td>
                    <td className="p-3 text-white/70">{r.subscription_status ?? "—"}</td>
                    <td className="p-3">{r.licenses_used ?? 0} / {r.licenses_total ?? 0}</td>
                    <td className="p-3">{r.active_users_30d}</td>
                    <td className="p-3 text-white/60 text-xs">{fmtRel(r.last_activity_at)}</td>
                    <td className="p-3 text-white/50 text-xs">{fmtDate(r.last_dna_generated_at)}</td>
                    <td className="p-3">{r.last_score ?? "—"}</td>
                    <td className="p-3">{r.ai_messages_30d}</td>
                    <td className="p-3 text-white/60 text-xs">{fmtDate(r.created_at)}</td>
                    <td className={`p-3 font-bold text-xs ${healthColor(r.health_status)}`}>{r.health_status}</td>
                    <td className="p-3">
                      <RowActions row={r} onEdit={() => setEditing(r)} onAction={setAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-white/60">
            <span>Página {page + 1} de {totalPages} · {total} organizações</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded bg-white/5 border border-white/10 disabled:opacity-30"
              >← Anterior</button>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded bg-white/5 border border-white/10 disabled:opacity-30"
              >Próxima →</button>
            </div>
          </div>
        </>
      )}

      {showCreate && <OrgFormModal onClose={() => setShowCreate(false)} onSaved={load} />}
      {editing && <OrgFormModal org={editing} onClose={() => setEditing(null)} onSaved={load} />}
    </PlatformAdminLayout>
  );
};

const RowActions = ({ row, onEdit, onAction }: {
  row: Row;
  onEdit: () => void;
  onAction: (id: string, patch: Record<string, any>, label: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const isSuspended = !!row.suspended_at || row.subscription_status === "suspended";
  const isArchived = !!row.archived_at;
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs">⋯</button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-[#171410] border border-white/10 rounded-lg shadow-xl z-10 py-1 text-xs">
          <Link to={`/admin/organizations/${row.id}`} className="block px-3 py-2 hover:bg-white/5">Ver detalhes</Link>
          <button onClick={() => { setOpen(false); onEdit(); }} className="w-full text-left px-3 py-2 hover:bg-white/5">Editar</button>
          {!isSuspended ? (
            <button onClick={() => { setOpen(false); onAction(row.id, { suspended_at: new Date().toISOString(), subscription_status: "suspended" }, "org.suspend"); }}
              className="w-full text-left px-3 py-2 hover:bg-white/5 text-amber-300">Suspender</button>
          ) : (
            <button onClick={() => { setOpen(false); onAction(row.id, { suspended_at: null, subscription_status: "active" }, "org.reactivate"); }}
              className="w-full text-left px-3 py-2 hover:bg-white/5 text-emerald-300">Reativar</button>
          )}
          {!isArchived ? (
            <button onClick={() => { setOpen(false); onAction(row.id, { archived_at: new Date().toISOString() }, "org.archive"); }}
              className="w-full text-left px-3 py-2 hover:bg-white/5">Arquivar</button>
          ) : (
            <button onClick={() => { setOpen(false); onAction(row.id, { archived_at: null }, "org.unarchive"); }}
              className="w-full text-left px-3 py-2 hover:bg-white/5">Desarquivar</button>
          )}
          <button onClick={() => {
            if (!confirm(`Excluir "${row.name}"? Soft delete — pode ser restaurado no banco.`)) return;
            setOpen(false);
            onAction(row.id, { deleted_at: new Date().toISOString() }, "org.soft_delete");
          }} className="w-full text-left px-3 py-2 hover:bg-white/5 text-red-300">Excluir (soft)</button>
        </div>
      )}
    </div>
  );
};

const OrgFormModal = ({ org, onClose, onSaved }: {
  org?: Row;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const isEdit = !!org;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: org?.name ?? "",
    slug: org?.slug ?? "",
    plan: org?.plan ?? "",
    subscription_status: org?.subscription_status ?? "trialing",
    licenses_total: org?.licenses_total ?? 0,
  });

  const save = async () => {
    if (!form.name || !form.slug) return toast.error("Nome e slug são obrigatórios.");
    setSaving(true);
    if (isEdit) {
      const { error } = await supabase.from("organizations").update({
        name: form.name, slug: form.slug, plan: form.plan || null,
        subscription_status: form.subscription_status as any,
        licenses_total: Number(form.licenses_total) || 0,
      }).eq("id", org!.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await supabase.from("platform_audit_logs" as any).insert({
        action: "org.update", entity_type: "organization", entity_id: org!.id, metadata: form,
      });
    } else {
      const { data, error } = await supabase.from("organizations").insert({
        name: form.name, slug: form.slug, plan: form.plan || null,
        subscription_status: form.subscription_status as any,
        licenses_total: Number(form.licenses_total) || 0,
      }).select("id").maybeSingle();
      if (error) { toast.error(error.message); setSaving(false); return; }
      await supabase.from("platform_audit_logs" as any).insert({
        action: "org.create", entity_type: "organization", entity_id: data?.id, metadata: form,
      });
    }
    toast.success(isEdit ? "Organização atualizada." : "Organização criada.");
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-[#171410] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-black mb-4">{isEdit ? "Editar empresa" : "Nova empresa"}</h2>
        <div className="space-y-3 text-sm">
          <Input label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
          <Input label="Plano" value={form.plan} onChange={(v) => setForm({ ...form, plan: v })} placeholder="ex: enterprise, growth" />
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Status</label>
            <select
              value={form.subscription_status ?? "trialing"}
              onChange={(e) => setForm({ ...form, subscription_status: e.target.value })}
              className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              {["trialing","active","past_due","suspended","canceled","grace_period"].map((s) => (
                <option key={s} value={s} className="bg-[#0B0908]">{s}</option>
              ))}
            </select>
          </div>
          <Input label="Licenças contratadas" type="number" value={String(form.licenses_total)} onChange={(v) => setForm({ ...form, licenses_total: Number(v) })} />
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-sm">Cancelar</button>
          <button disabled={saving} onClick={save} className="flex-1 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold disabled:opacity-50">
            {saving ? "Salvando…" : "Salvar"}
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
    <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</label>
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30"
    />
  </div>
);

export default PlatformOrganizationsScreen;