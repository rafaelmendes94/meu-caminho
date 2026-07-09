import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Tag = { id: string; name: string; slug: string };
function slugify(s: string) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export default function PlatformContentTagsScreen() {
  const [rows, setRows] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.from("content_tags").select("*").order("name").limit(500);
    if (error) setError(error.message); else setRows((data ?? []) as Tag[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("content_tags").insert({ name: name.trim(), slug: slugify(name) });
    if (error) return toast.error(error.message);
    setName(""); void load();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir tag?")) return;
    const { error } = await supabase.from("content_tags").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void load();
  };

  const filtered = rows.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <PlatformAdminLayout>
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Content</p>
        <h1 className="text-3xl font-black text-white mt-1">Tags</h1>
      </header>

      <div className="flex gap-2 mb-4">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Nova tag…" className="flex-1 max-w-sm px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
        <button onClick={add} className="px-4 py-2.5 bg-[#F88A2B] text-black rounded-lg text-sm font-bold">Adicionar</button>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-full max-w-sm mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      {!loading && filtered.length === 0 && <p className="text-white/40 text-sm">Sem tags.</p>}

      <div className="flex flex-wrap gap-2">
        {filtered.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white">
            {t.name}
            <button onClick={() => remove(t.id)} className="text-red-400 hover:text-red-300">×</button>
          </span>
        ))}
      </div>
    </PlatformAdminLayout>
  );
}