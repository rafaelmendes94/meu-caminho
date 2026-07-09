import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Coll = { id: string; title: string; slug: string; is_published: boolean };
type Item = { id: string; type: string; title: string; status: string; cover_url: string | null };
type LinkedItem = Item & { sort_order: number };

export default function PlatformContentCollectionBuilderScreen() {
  const { id } = useParams<{ id: string }>();
  const [coll, setColl] = useState<Coll | null>(null);
  const [linked, setLinked] = useState<LinkedItem[]>([]);
  const [all, setAll] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: c }, { data: ci }, { data: it }] = await Promise.all([
      supabase.from("content_collections").select("id,title,slug,is_published").eq("id", id).maybeSingle(),
      supabase.from("content_collection_items").select("sort_order,item:content_items(id,type,title,status,cover_url)").eq("collection_id", id).order("sort_order"),
      supabase.from("content_items").select("id,type,title,status,cover_url").order("updated_at", { ascending: false }).limit(500),
    ]);
    setColl(c as any);
    setLinked(((ci ?? []) as any[]).filter((r) => r.item).map((r) => ({ ...(r.item as any), sort_order: r.sort_order })));
    setAll((it ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [id]);

  const linkedIds = useMemo(() => new Set(linked.map((l) => l.id)), [linked]);
  const available = useMemo(
    () => all.filter((a) => !linkedIds.has(a.id) && (!typeFilter || a.type === typeFilter) && (!q || a.title.toLowerCase().includes(q.toLowerCase()))),
    [all, linkedIds, q, typeFilter]
  );

  const add = async (itemId: string) => {
    if (!id) return;
    const next = (linked[linked.length - 1]?.sort_order ?? -1) + 1;
    const { error } = await supabase.from("content_collection_items").insert({ collection_id: id, item_id: itemId, sort_order: next });
    if (error) return toast.error(error.message);
    void load();
  };
  const remove = async (itemId: string) => {
    if (!id) return;
    const { error } = await supabase.from("content_collection_items").delete().eq("collection_id", id).eq("item_id", itemId);
    if (error) return toast.error(error.message);
    void load();
  };
  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (!id || j < 0 || j >= linked.length) return;
    const a = linked[idx], b = linked[j];
    await supabase.from("content_collection_items").update({ sort_order: b.sort_order }).eq("collection_id", id).eq("item_id", a.id);
    await supabase.from("content_collection_items").update({ sort_order: a.sort_order }).eq("collection_id", id).eq("item_id", b.id);
    void load();
  };

  return (
    <PlatformAdminLayout>
      <header className="mb-6">
        <Link to="/admin/content/collections" className="text-[#F88A2B] text-xs font-bold">← Voltar</Link>
        <h1 className="text-3xl font-black text-white mt-2">{coll?.title ?? "Coleção"}</h1>
        <p className="text-white/40 text-xs">/{coll?.slug} · {coll?.is_published ? "publicada" : "rascunho"}</p>
      </header>

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}

      {!loading && (
        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <h2 className="text-white font-bold mb-3">Itens na coleção ({linked.length})</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {linked.length === 0 && <p className="p-4 text-white/40 text-sm">Vazia — adicione itens à direita.</p>}
              {linked.map((it, idx) => (
                <div key={it.id} className="flex items-center gap-3 px-3 py-2 border-b border-white/5">
                  {it.cover_url ? <img src={it.cover_url} alt="" className="w-8 h-10 object-cover rounded" /> : <div className="w-8 h-10 bg-white/10 rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{it.title}</p>
                    <p className="text-white/40 text-[10px] uppercase">{it.type} · {it.status}</p>
                  </div>
                  <button onClick={() => move(idx, -1)} className="text-white/60 text-xs px-2">↑</button>
                  <button onClick={() => move(idx, 1)} className="text-white/60 text-xs px-2">↓</button>
                  <button onClick={() => remove(it.id)} className="text-red-400 text-xs font-bold">Remover</button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold mb-3">Adicionar conteúdo</h2>
            <div className="flex gap-2 mb-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                <option value="">Todos</option>
                <option value="book">Livros</option>
                <option value="course">Cursos</option>
                <option value="track">Trilhas</option>
                <option value="podcast">Podcasts</option>
                <option value="video">Vídeos</option>
                <option value="audio">Áudios</option>
                <option value="material">Materiais</option>
              </select>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto">
              {available.length === 0 && <p className="p-4 text-white/40 text-sm">Nenhum conteúdo disponível.</p>}
              {available.map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-3 py-2 border-b border-white/5">
                  {it.cover_url ? <img src={it.cover_url} alt="" className="w-8 h-10 object-cover rounded" /> : <div className="w-8 h-10 bg-white/10 rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{it.title}</p>
                    <p className="text-white/40 text-[10px] uppercase">{it.type} · {it.status}</p>
                  </div>
                  <button onClick={() => add(it.id)} className="text-[#F88A2B] text-xs font-bold">Adicionar</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </PlatformAdminLayout>
  );
}