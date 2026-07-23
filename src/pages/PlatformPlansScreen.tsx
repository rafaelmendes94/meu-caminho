import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { RH_FLAG_KEYS, FEATURE_FLAG_LABELS } from "@/lib/orgSettings";

const AI_LIMIT_FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: "chat_messages_per_month", label: "Mensagens de chat / mês" },
  { key: "action_plans_per_month", label: "Planos de ação / mês" },
  { key: "rituals_per_month", label: "Rituais inteligentes / mês" },
  { key: "insights_per_month", label: "Insights semanais / mês" },
  { key: "dna_reports_per_month", label: "Relatórios de DNA / mês" },
  { key: "tokens_per_month", label: "Tokens de IA / mês", hint: "0 = ilimitado" },
];

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  plan_type: "standard" | "enterprise" | "custom";
  default_licenses: number;
  min_licenses: number | null;
  max_licenses: number | null;
  price_monthly_cents: number;
  price_yearly_cents: number;
  currency: string;
  billing_cycle: "monthly" | "yearly" | "custom";
  included_modules: Record<string, any>;
  ai_limits: Record<string, any>;
  support_level: string;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
};

const empty = (): Plan => ({
  id: "",
  name: "",
  slug: "",
  description: "",
  plan_type: "standard",
  default_licenses: 0,
  min_licenses: 0,
  max_licenses: null,
  price_monthly_cents: 0,
  price_yearly_cents: 0,
  currency: "BRL",
  billing_cycle: "monthly",
  included_modules: {},
  ai_limits: {},
  support_level: "standard",
  is_public: false,
  is_active: true,
  sort_order: 0,
});

const audit = (action: string, entity_id: string | null, metadata: any) =>
  supabase.from("platform_audit_logs" as any).insert({
    action, entity_type: "platform_plan", entity_id, metadata,
  });

const currencyBR = (cents: number, cur = "BRL") =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: cur }).format((cents ?? 0) / 100);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{children}</label>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label>{label}</Label>
    <div className="mt-1">{children}</div>
  </div>
);

const inputCls =
  "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 text-sm";

const PlatformPlansScreen = () => {
  const [rows, setRows] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<Plan | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platform_plans" as any)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) setErr(error.message);
    else { setRows((data as any as Plan[]) ?? []); setErr(null); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (p: Plan, field: "is_active" | "is_public") => {
    const patch = { [field]: !p[field] };
    const { error } = await supabase.from("platform_plans" as any).update(patch).eq("id", p.id);
    if (error) return toast.error(error.message);
    await audit(field === "is_active" ? "plan.toggle_active" : "plan.toggle_public", p.id, patch);
    load();
  };

  return (
    <PlatformAdminLayout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Planos</h1>
          <p className="text-slate-500 mt-1 text-sm">Modelos comerciais da plataforma ({rows.length}).</p>
        </div>
        <button
          onClick={() => setEdit(empty())}
          className="px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold hover:bg-[#F88A2B]/90"
        >+ Novo plano</button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{err}</div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          Nenhum plano cadastrado.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Slug</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Licenças</th>
                <th className="text-left p-3">Mensal</th>
                <th className="text-left p-3">Anual</th>
                <th className="text-left p-3">Ciclo</th>
                <th className="text-left p-3">Público</th>
                <th className="text-left p-3">Ativo</th>
                <th className="text-left p-3">Ordem</th>
                <th className="text-left p-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                  <td className="p-3 text-slate-500 text-xs">{p.slug}</td>
                  <td className="p-3 text-slate-700">{p.plan_type}</td>
                  <td className="p-3 text-slate-700">{p.default_licenses}</td>
                  <td className="p-3 text-slate-700">{currencyBR(p.price_monthly_cents, p.currency)}</td>
                  <td className="p-3 text-slate-700">{currencyBR(p.price_yearly_cents, p.currency)}</td>
                  <td className="p-3 text-slate-700">{p.billing_cycle}</td>
                  <td className="p-3">
                    <button onClick={() => toggle(p, "is_public")} className={`text-[10px] uppercase px-2 py-1 rounded ${p.is_public ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {p.is_public ? "público" : "privado"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggle(p, "is_active")} className={`text-[10px] uppercase px-2 py-1 rounded ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {p.is_active ? "ativo" : "inativo"}
                    </button>
                  </td>
                  <td className="p-3 text-slate-700">{p.sort_order}</td>
                  <td className="p-3">
                    <button onClick={() => setEdit(p)} className="text-xs px-2 py-1 rounded bg-white border border-slate-200">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {edit && <PlanEditor plan={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </PlatformAdminLayout>
  );
};

const PlanEditor = ({ plan, onClose, onSaved }: { plan: Plan; onClose: () => void; onSaved: () => void }) => {
  const [f, setF] = useState<Plan>(plan);
  const [saving, setSaving] = useState(false);
  const isNew = !plan.id;

  const toggleModule = (mod: string, on: boolean) => {
    const next = { ...(f.included_modules || {}) };
    if (on) next[mod] = true;
    else delete next[mod];
    setF({ ...f, included_modules: next });
  };

  const setLimit = (key: string, raw: string) => {
    const next = { ...(f.ai_limits || {}) };
    if (raw === "") delete next[key];
    else next[key] = Number(raw);
    setF({ ...f, ai_limits: next });
  };

  const save = async () => {
    if (!f.name || !f.slug) { toast.error("Nome e slug são obrigatórios."); return; }
    setSaving(true);
    const payload: any = {
      name: f.name, slug: f.slug, description: f.description || null,
      plan_type: f.plan_type,
      default_licenses: Number(f.default_licenses) || 0,
      min_licenses: f.min_licenses != null ? Number(f.min_licenses) : 0,
      max_licenses: f.max_licenses != null ? Number(f.max_licenses) : null,
      price_monthly_cents: Number(f.price_monthly_cents) || 0,
      price_yearly_cents: Number(f.price_yearly_cents) || 0,
      currency: f.currency || "BRL",
      billing_cycle: f.billing_cycle,
      included_modules: f.included_modules || {},
      ai_limits: f.ai_limits || {},
      support_level: f.support_level || "standard",
      is_public: !!f.is_public, is_active: !!f.is_active,
      sort_order: Number(f.sort_order) || 0,
    };
    let error: any = null; let savedId = f.id;
    if (isNew) {
      const res = await supabase.from("platform_plans" as any).insert(payload).select("id").maybeSingle();
      error = res.error; savedId = (res.data as any)?.id ?? "";
    } else {
      const res = await supabase.from("platform_plans" as any).update(payload).eq("id", f.id);
      error = res.error;
    }
    if (error) { toast.error(error.message); setSaving(false); return; }
    await audit(isNew ? "plan.create" : "plan.update", savedId, payload);
    toast.success(isNew ? "Plano criado." : "Plano atualizado.");
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-slate-50 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900">{isNew ? "Novo plano" : "Editar plano"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome *"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Slug *"><input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className={inputCls} /></Field>
          <Field label="Tipo">
            <select value={f.plan_type} onChange={(e) => setF({ ...f, plan_type: e.target.value as any })} className={inputCls}>
              <option value="standard">Standard</option>
              <option value="enterprise">Enterprise</option>
              <option value="custom">Custom</option>
            </select>
          </Field>
          <Field label="Ciclo cobrança">
            <select value={f.billing_cycle} onChange={(e) => setF({ ...f, billing_cycle: e.target.value as any })} className={inputCls}>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
              <option value="custom">Personalizado</option>
            </select>
          </Field>
          <Field label="Licenças padrão"><input type="number" value={f.default_licenses} onChange={(e) => setF({ ...f, default_licenses: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Moeda"><input value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value.toUpperCase() })} className={inputCls} /></Field>
          <Field label="Licenças mín."><input type="number" value={f.min_licenses ?? 0} onChange={(e) => setF({ ...f, min_licenses: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Licenças máx."><input type="number" value={f.max_licenses ?? ""} onChange={(e) => setF({ ...f, max_licenses: e.target.value === "" ? null : Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Preço mensal (centavos)"><input type="number" value={f.price_monthly_cents} onChange={(e) => setF({ ...f, price_monthly_cents: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Preço anual (centavos)"><input type="number" value={f.price_yearly_cents} onChange={(e) => setF({ ...f, price_yearly_cents: Number(e.target.value) })} className={inputCls} /></Field>
          <Field label="Nível de suporte"><input value={f.support_level} onChange={(e) => setF({ ...f, support_level: e.target.value })} className={inputCls} /></Field>
          <Field label="Ordem"><input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} className={inputCls} /></Field>
        </div>

        <div className="mt-4">
          <Field label="Descrição">
            <textarea value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} className={inputCls} />
          </Field>
        </div>

        <div className="mt-6">
          <Label>Módulos incluídos</Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-white border border-slate-200 rounded-xl p-3">
            {RH_FLAG_KEYS.map((mod) => {
              const checked = !!(f.included_modules as any)?.[mod];
              return (
                <label key={mod} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleModule(mod, e.target.checked)}
                  />
                  {FEATURE_FLAG_LABELS[mod] ?? mod}
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <Label>Limites de IA</Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3 bg-white border border-slate-200 rounded-xl p-3">
            {AI_LIMIT_FIELDS.map((lim) => (
              <Field key={lim.key} label={lim.label}>
                <input
                  type="number"
                  min={0}
                  value={(f.ai_limits as any)?.[lim.key] ?? ""}
                  onChange={(e) => setLimit(lim.key, e.target.value)}
                  placeholder={lim.hint ?? "0 = ilimitado"}
                  className={inputCls}
                />
              </Field>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Ativo
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.is_public} onChange={(e) => setF({ ...f, is_public: e.target.checked })} /> Público
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm">Cancelar</button>
          <button disabled={saving} onClick={save} className="px-6 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-bold disabled:opacity-50">
            {saving ? "Salvando…" : "Salvar plano"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformPlansScreen;