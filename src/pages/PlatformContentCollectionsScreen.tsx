import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Row = { id: string; title: string; slug: string; description: string | null; cover_url: string | null; is_published: boolean; updated_at: string };

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function PlatformContentCollectionsScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.from("content_collections").select("*").order("updated_at", { ascending: false });
    if (error) setError(error.message); else setRows((data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing?.title?.trim()) return toast.error("Título obrigatório.");
    const payload: any = {
      title: editing.title,
      slug: editing.slug?.trim() || slugify(editing.title),
      description: editing.description ?? null,
      cover_url: editing.cover_url ?? null,
      is_published: editing.is_published ?? false,
    };
    const { error } = editing.id
      ? await supabase.from("content_collections").update(payload).eq("id", editing.id)
      : await supabase.from("content_collections").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Coleção salva."); setEditing(null); void load();
  };

  const togglePublish = async (r: Row) => {
    const { error } = await supabase.from("content_collections").update({ is_published: !r.is_published }).eq("id", r.id);
    if (error) return toast.error(error.message);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta coleção? Os vínculos com itens serão removidos.")) return;
    const { error } = await supabase.from("content_collections").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Coleção excluída."); void load();
  };

  return (
    <PlatformAdminLayout>
      <header className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Content</p>
          <h1 className="text-3xl font-black text-white mt-1">Coleções</h1>
          <p className="text-white/50 text-sm mt-2">Agrupamentos livres de conteúdo para destaques e curadoria.</p>
        </div>
        <button onClick={() => setEditing({ title: "", slug: "", description: "", cover_url: "", is_published: false })} className="px-4 py-2.5 bg-[#F88A2B] text-black rounded-lg text-sm font-bold">Nova coleção</button>
      </header>

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      {!loading && !error && rows.length === 0 && <p className="text-white/40 text-sm">Nenhuma coleção ainda.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((r) => (
          <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            {r.cover_url ? <img src={r.cover_url} alt="" className="w-full h-32 object-cover rounded-lg mb-3" /> : <div className="w-full h-32 bg-white/10 rounded-lg mb-3" />}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white font-bold truncate">{r.title}</p>
                <p className="text-white/40 text-xs truncate">/{r.slug}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.is_published ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>{r.is_published ? "PUBLICADA" : "RASCUNHO"}</span>
            </div>
            {r.description && <p className="text-white/60 text-xs mt-2 line-clamp-2">{r.description}</p>}
            <div className="flex gap-3 mt-4 text-xs font-bold">
              <Link to={`/admin/content/collections/${r.id}`} className="text-[#F88A2B] hover:underline">Gerenciar itens</Link>
              <button onClick={() => setEditing(r)} className="text-white/70 hover:underline">Editar</button>
              <button onClick={() => togglePublish(r)} className="text-green-400 hover:underline">{r.is_published ? "Despublicar" : "Publicar"}</button>
              <button onClick={() => remove(r.id)} className="text-red-400 hover:underline ml-auto">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#0B0908] border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black text-white mb-4">{editing.id ? "Editar" : "Nova"} coleção</h2>
            <div className="space-y-3">
              <label className="block"><span className="text-xs text-white/50">Título *</span><input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="block"><span className="text-xs text-white/50">Slug (auto se vazio)</span><input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="block"><span className="text-xs text-white/50">Capa (URL)</span><input value={editing.cover_url ?? ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="block"><span className="text-xs text-white/50">Descrição</span><textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
              <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={!!editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />Publicada</label>
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