import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Row = {
  id: string; type: string; title: string; slug: string; status: string;
  cover_url: string | null; is_premium: boolean; is_featured: boolean;
  language: string | null; category_id: string | null; updated_at: string;
};

const TYPES = ["book","course","track","podcast","video","audio","material"];

export default function PlatformContentLibraryScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    let query = supabase.from("content_items").select("id,type,title,slug,status,cover_url,is_premium,is_featured,language,category_id,updated_at").order("updated_at", { ascending: false }).limit(1000);
    if (type) query = query.eq("type", type as any);
    if (status) query = query.eq("status", status as any);
    if (featuredOnly) query = query.eq("is_featured", true);
    if (premiumOnly) query = query.eq("is_premium", true);
    const { data, error } = await query;
    if (error) setError(error.message); else setRows((data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [type, status, featuredOnly, premiumOnly]);

  const filtered = useMemo(
    () => rows.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.slug.includes(q.toLowerCase())),
    [rows, q]
  );

  const totalsByType = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of rows) m[r.type] = (m[r.type] ?? 0) + 1;
    return m;
  }, [rows]);

  const toggle = async (r: Row, field: "is_featured" | "is_premium") => {
    const { error } = await supabase.from("content_items").update({ [field]: !r[field] } as any).eq("id", r.id);
    if (error) return toast.error(error.message);
    void load();
  };

  return (
    <PlatformAdminLayout>
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Content</p>
        <h1 className="text-3xl font-black text-white mt-1">Biblioteca unificada</h1>
        <p className="text-white/50 text-sm mt-2">Todos os conteúdos do CMS em uma visão única. Use os filtros para segmentar.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {TYPES.map((t) => (
          <div key={t} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <p className="text-[10px] uppercase text-white/40">{t}</p>
            <p className="text-white font-black text-xl">{totalsByType[t] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar título/slug…" className="flex-1 min-w-[220px] max-w-sm px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
          <option value="">Todos tipos</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
          <option value="">Todos status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <label className="flex items-center gap-2 text-white/70 text-sm px-3"><input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />Destaque</label>
        <label className="flex items-center gap-2 text-white/70 text-sm px-3"><input type="checkbox" checked={premiumOnly} onChange={(e) => setPremiumOnly(e.target.checked)} />Premium</label>
        <span className="ml-auto text-white/40 text-sm self-center">{filtered.length} de {rows.length}</span>
      </div>

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      {!loading && !error && filtered.length === 0 && <p className="text-white/40 text-sm">Nenhum conteúdo encontrado.</p>}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {filtered.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
            {r.cover_url ? <img src={r.cover_url} alt="" className="w-10 h-14 object-cover rounded" /> : <div className="w-10 h-14 bg-white/10 rounded" />}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{r.title}</p>
              <p className="text-white/40 text-xs truncate">/{r.slug} · {r.language ?? "—"}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70 uppercase">{r.type}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "published" ? "bg-green-500/20 text-green-400" : r.status === "archived" ? "bg-white/10 text-white/40" : "bg-yellow-500/20 text-yellow-400"}`}>{r.status.toUpperCase()}</span>
            <button onClick={() => toggle(r, "is_featured")} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.is_featured ? "bg-[#F88A2B]/20 text-[#F88A2B]" : "bg-white/5 text-white/40"}`}>DESTAQUE</button>
            <button onClick={() => toggle(r, "is_premium")} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.is_premium ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-white/40"}`}>PREMIUM</button>
          </div>
        ))}
      </div>
    </PlatformAdminLayout>
  );
}