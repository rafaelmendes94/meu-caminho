import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Dashboard = {
  totals: Record<string, number>;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_month: { month: string; cnt: number }[];
  by_category: { name: string; cnt: number }[];
  top_items_30d: { id: string; title: string; type: string; views: number }[];
};

const TYPE_LABEL: Record<string, string> = {
  book: "Livros",
  course: "Cursos",
  track: "Trilhas",
  podcast: "Podcasts",
  video: "Vídeos",
  audio: "Áudios",
  material: "Materiais",
};

export default function PlatformContentDashboardScreen() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.rpc("get_cms_dashboard");
      if (error) setError(error.message);
      else setData(data as unknown as Dashboard);
      setLoading(false);
    })();
  }, []);

  return (
    <PlatformAdminLayout>
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Content</p>
        <h1 className="text-3xl font-black text-white mt-1">CMS — Dashboard</h1>
        <p className="text-sm text-white/60 mt-2">Visão geral do catálogo. Todos os dados vêm do banco.</p>
      </header>

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}

      {data && (
        <>
          <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {Object.entries(data.totals || {}).map(([k, v]) => (
              <div key={k} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{k}</p>
                <p className="text-2xl font-black text-white mt-1">{v ?? 0}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">Por status</p>
              {(["draft","published","archived"] as const).map((s) => (
                <div key={s} className="flex justify-between text-sm py-1.5 border-b border-white/5">
                  <span className="text-white/70 capitalize">{s}</span>
                  <span className="text-white font-bold">{data.by_status?.[s] ?? 0}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">Por tipo</p>
              {Object.keys(TYPE_LABEL).map((t) => (
                <div key={t} className="flex justify-between text-sm py-1.5 border-b border-white/5">
                  <span className="text-white/70">{TYPE_LABEL[t]}</span>
                  <span className="text-white font-bold">{data.by_type?.[t] ?? 0}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">Publicados (12 meses)</p>
              {data.by_month.length === 0 && <p className="text-sm text-white/40">Sem dados.</p>}
              {data.by_month.map((m) => (
                <div key={m.month} className="flex justify-between text-sm py-1.5 border-b border-white/5">
                  <span className="text-white/70">{m.month}</span>
                  <span className="text-white font-bold">{m.cnt}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">Por categoria</p>
              {data.by_category.length === 0 && <p className="text-sm text-white/40">Cadastre categorias.</p>}
              {data.by_category.map((c) => (
                <div key={c.name} className="flex justify-between text-sm py-1.5 border-b border-white/5">
                  <span className="text-white/70">{c.name}</span>
                  <span className="text-white font-bold">{c.cnt}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">Top 10 conteúdos (30d)</p>
              {data.top_items_30d.length === 0 && <p className="text-sm text-white/40">Sem visualizações registradas.</p>}
              {data.top_items_30d.map((i) => (
                <div key={i.id} className="flex justify-between text-sm py-1.5 border-b border-white/5">
                  <span className="text-white/70 truncate mr-3">{i.title} <span className="text-white/30">· {TYPE_LABEL[i.type]}</span></span>
                  <span className="text-white font-bold">{i.views}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-wrap gap-3">
            <Link to="/admin/content/authors" className="px-4 py-2.5 bg-[#F88A2B] text-black rounded-lg text-sm font-bold">Gerenciar autores</Link>
            <Link to="/admin/content/categories" className="px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm font-bold">Categorias</Link>
            <Link to="/admin/content/tags" className="px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm font-bold">Tags</Link>
          </section>
        </>
      )}
    </PlatformAdminLayout>
  );
}