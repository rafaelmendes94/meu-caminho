import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Cat = { id: string; name: string; slug: string; color: string | null; icon: string | null; description: string | null; sort_order: number };

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const empty: Partial<Cat> = { name: "", slug: "", color: "#F88A2B", icon: "", description: "", sort_order: 0 };

export default function PlatformContentCategoriesScreen() {
  const [rows, setRows] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Cat> | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("content_categories").select("*").order("sort_order").order("name").limit(500);
    if (error) setError(error.message);
    else setRows((data ?? []) as Cat[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing?.name?.trim()) return toast.error("Nome obrigatório.");
    const payload = { ...editing, slug: editing.slug?.trim() || slugify(editing.name) };
    const { error } = editing.id
      ? await supabase.from("content_categories").update(payload).eq("id", editing.id)
      : await supabase.from("content_categories").insert(payload as any);
    if (error) return toast.error(error.message);
    toast.success("Categoria salva.");
    setEditing(null); void load();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir categoria?")) return;
    const { error } = await supabase.from("content_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluída."); void load();
  };

  const filtered = rows.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.slug.includes(q.toLowerCase()));

  return (
    <PlatformAdminLayout>
      <header className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Content</p>
          <h1 className="text-3xl font-black text-white mt-1">Categorias</h1>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="px-4 py-2.5 bg-[#F88A2B] text-black rounded-lg text-sm font-bold">Nova categoria</button>
      </header>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-full max-w-sm mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30" />

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      {!loading && !error && filtered.length === 0 && <p className="text-white/40 text-sm">Sem categorias.</p>}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {filtered.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
            <span className="w-3 h-3 rounded-full" style={{ background: r.color ?? "#666" }} />
            <span className="text-white font-semibold flex-1">{r.name}</span>
            <span className="text-white/40 text-xs">/{r.slug}</span>
            <button onClick={() => setEditing(r)} className="text-[#F88A2B] text-xs font-bold hover:underline">Editar</button>
            <button onClick={() => remove(r.id)} className="text-red-400 text-xs font-bold hover:underline">Excluir</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#0B0908] border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black text-white mb-4">{editing.id ? "Editar" : "Nova"} categoria</h2>
            <div className="space-y-3">
              <label className="block"><span className="text-xs text-white/50">Nome</span><input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="block"><span className="text-xs text-white/50">Slug (auto se vazio)</span><input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="text-xs text-white/50">Cor</span><input type="color" value={editing.color ?? "#F88A2B"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="w-full mt-1 h-10 bg-white/5 border border-white/10 rounded-lg" /></label>
                <label className="block"><span className="text-xs text-white/50">Ícone (nome)</span><input value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              </div>
              <label className="block"><span className="text-xs text-white/50">Descrição</span><textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" rows={3} /></label>
              <label className="block"><span className="text-xs text-white/50">Ordem</span><input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-white/60 text-sm">Cancelar</button>
              <button onClick={save} className="px-4 py-2 bg-[#F88A2B] text-black rounded-lg text-sm font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </PlatformAdminLayout>
  );
}