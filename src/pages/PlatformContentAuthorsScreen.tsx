import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Author = { id: string; name: string; slug: string; photo_url: string | null; mini_bio: string | null; specialty: string | null; is_published: boolean };
function slugify(s: string) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
const empty: Partial<Author> = { name: "", slug: "", photo_url: "", mini_bio: "", specialty: "", is_published: true };

export default function PlatformContentAuthorsScreen() {
  const [rows, setRows] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Author> | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.from("content_authors").select("*").order("name").limit(500);
    if (error) setError(error.message); else setRows((data ?? []) as Author[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing?.name?.trim()) return toast.error("Nome obrigatório.");
    const payload = { ...editing, slug: editing.slug?.trim() || slugify(editing.name) };
    const { error } = editing.id
      ? await supabase.from("content_authors").update(payload).eq("id", editing.id)
      : await supabase.from("content_authors").insert(payload as any);
    if (error) return toast.error(error.message);
    toast.success("Autor salvo.");
    setEditing(null); void load();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir autor?")) return;
    const { error } = await supabase.from("content_authors").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  const filtered = rows.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <PlatformAdminLayout>
      <header className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Content</p>
          <h1 className="text-3xl font-black text-white mt-1">Autores</h1>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="px-4 py-2.5 bg-[#F88A2B] text-black rounded-lg text-sm font-bold">Novo autor</button>
      </header>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-full max-w-sm mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      {!loading && filtered.length === 0 && <p className="text-white/40 text-sm">Sem autores.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {a.photo_url ? <img src={a.photo_url} alt={a.name} className="w-full h-full object-cover" /> : <span className="text-white/60 font-bold">{a.name[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{a.name}</p>
              <p className="text-white/40 text-xs truncate">{a.specialty || "—"}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.is_published ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>{a.is_published ? "PUB" : "OFF"}</span>
            <button onClick={() => setEditing(a)} className="text-[#F88A2B] text-xs font-bold hover:underline">Editar</button>
            <button onClick={() => remove(a.id)} className="text-red-400 text-xs font-bold hover:underline">Excluir</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#0B0908] border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black text-white mb-4">{editing.id ? "Editar" : "Novo"} autor</h2>
            <div className="space-y-3">
              <label className="block"><span className="text-xs text-white/50">Nome</span><input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="block"><span className="text-xs text-white/50">Slug (auto se vazio)</span><input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="block"><span className="text-xs text-white/50">Especialidade</span><input value={editing.specialty ?? ""} onChange={(e) => setEditing({ ...editing, specialty: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="block"><span className="text-xs text-white/50">Foto (URL)</span><input value={editing.photo_url ?? ""} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="block"><span className="text-xs text-white/50">Mini bio</span><textarea value={editing.mini_bio ?? ""} onChange={(e) => setEditing({ ...editing, mini_bio: e.target.value })} rows={4} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={editing.is_published ?? true} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />Publicado</label>
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