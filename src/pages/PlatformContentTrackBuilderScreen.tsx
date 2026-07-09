import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Item = { id: string; title: string; type: string; status: string };
type TrackItem = { id: string; track_id: string; item_id: string; sort_order: number; note: string | null; item?: Item };

export default function PlatformContentTrackBuilderScreen() {
  const { id } = useParams();
  const [track, setTrack] = useState<{ id: string; title: string } | null>(null);
  const [items, setItems] = useState<TrackItem[]>([]);
  const [available, setAvailable] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: t } = await supabase.from("content_items").select("id,title").eq("id", id).maybeSingle();
    setTrack(t as any);
    const { data: ti } = await supabase.from("track_items")
      .select("id,track_id,item_id,sort_order,note, item:content_items!track_items_item_id_fkey(id,title,type,status)")
      .eq("track_id", id).order("sort_order");
    setItems((ti ?? []) as any);
    const { data: avail } = await supabase.from("content_items").select("id,title,type,status").neq("id", id).neq("type", "track").eq("status", "published").order("title").limit(500);
    setAvailable((avail ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [id]);

  const add = async (itemId: string) => {
    const { error } = await supabase.from("track_items").insert({ track_id: id!, item_id: itemId, sort_order: items.length });
    if (error) return toast.error(error.message);
    void load();
  };
  const move = async (t: TrackItem, dir: -1 | 1) => {
    const other = items[items.indexOf(t) + dir]; if (!other) return;
    await supabase.from("track_items").update({ sort_order: other.sort_order }).eq("id", t.id);
    await supabase.from("track_items").update({ sort_order: t.sort_order }).eq("id", other.id);
    void load();
  };
  const remove = async (t: TrackItem) => {
    await supabase.from("track_items").delete().eq("id", t.id);
    void load();
  };

  const inTrack = new Set(items.map((i) => i.item_id));
  const filtered = available.filter((a) => !inTrack.has(a.id) && (!q || a.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <PlatformAdminLayout>
      <div className="mb-4"><Link to="/admin/content/tracks" className="text-white/50 text-xs hover:text-white">← Voltar para Trilhas</Link></div>
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Trilha</p>
        <h1 className="text-3xl font-black text-white mt-1">{track?.title ?? "…"}</h1>
      </header>

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-bold mb-3">Conteúdos da trilha ({items.length})</h3>
          {items.length === 0 && <p className="text-white/40 text-sm">Nenhum item ainda.</p>}
          {items.map((t, i, arr) => (
            <div key={t.id} className="flex items-center gap-2 py-2 border-b border-white/5 text-sm">
              <span className="text-white/30 w-6">{i + 1}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-white/60">{t.item?.type}</span>
              <span className="text-white flex-1 truncate">{t.item?.title}</span>
              <button onClick={() => move(t, -1)} disabled={i === 0} className="text-white/40 hover:text-white disabled:opacity-30">↑</button>
              <button onClick={() => move(t, 1)} disabled={i === arr.length - 1} className="text-white/40 hover:text-white disabled:opacity-30">↓</button>
              <button onClick={() => remove(t)} className="text-red-400 text-xs font-bold hover:underline">×</button>
            </div>
          ))}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-bold mb-3">Adicionar conteúdo</h3>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-full mb-3 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
          <div className="max-h-[500px] overflow-y-auto space-y-1">
            {filtered.map((a) => (
              <button key={a.id} onClick={() => add(a.id)} className="w-full flex items-center gap-2 py-2 border-b border-white/5 text-sm text-left hover:bg-white/5 px-2 rounded">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-white/60">{a.type}</span>
                <span className="text-white flex-1 truncate">{a.title}</span>
                <span className="text-[#F88A2B] text-xs font-bold">+</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="text-white/40 text-xs italic">Nenhum conteúdo disponível.</p>}
          </div>
        </div>
      </div>
    </PlatformAdminLayout>
  );
}