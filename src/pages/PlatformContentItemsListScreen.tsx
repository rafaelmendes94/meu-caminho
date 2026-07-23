import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Eye, EyeOff, Archive, Copy, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { ContentItemForm, emptyItem, type ContentItem, type ContentType } from "@/components/admin/ContentItemForm";

type Row = ContentItem & { id: string };

function IconAction({
  title, onClick, className = "", children,
}: { title: string; onClick: () => void; className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function ContentItemsListPage({ type, title, extraActions }: { type: ContentType; title: string; extraActions?: (row: Row) => React.ReactNode }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");

  const load = async () => {
    setLoading(true); setError(null);
    let query = supabase.from("content_items").select("*").eq("type", type).order("updated_at", { ascending: false }).limit(500);
    if (status) query = query.eq("status", status as any);
    const { data, error } = await query;
    if (error) setError(error.message); else setRows((data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [status, type]);

  const filtered = useMemo(
    () => rows.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.slug.includes(q.toLowerCase())),
    [rows, q]
  );

  const changeStatus = async (id: string, s: "draft" | "published" | "archived") => {
    const payload: any = { status: s };
    if (s === "published") payload.published_at = new Date().toISOString();
    const { error } = await supabase.from("content_items").update(payload).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(s === "published" ? "Conteúdo publicado." : s === "archived" ? "Conteúdo arquivado." : "Conteúdo despublicado.");
    void load();
  };
  const duplicate = async (r: Row) => {
    const { id, ...rest } = r as any;
    const copy = { ...rest, title: r.title + " (cópia)", slug: r.slug + "-copia-" + Date.now().toString(36), status: "draft", published_at: null };
    const { error } = await supabase.from("content_items").insert(copy);
    if (error) return toast.error(error.message);
    toast.success("Conteúdo duplicado."); void load();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir permanentemente?")) return;
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Conteúdo excluído."); void load();
  };

  return (
    <PlatformAdminLayout>
      <header className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Content</p>
          <h1 className="text-3xl font-black text-white mt-1">{title}</h1>
        </div>
        <button onClick={() => setEditing(emptyItem(type))} className="px-4 py-2.5 bg-[#F88A2B] text-black rounded-lg text-sm font-bold">Novo</button>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
          <option value="">Todos status</option>
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
          <option value="archived">Arquivado</option>
        </select>
        <span className="ml-auto text-white/40 text-sm self-center">{filtered.length} registros</span>
      </div>

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      {!loading && !error && filtered.length === 0 && <p className="text-white/40 text-sm">Sem conteúdos.</p>}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {filtered.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
            {r.cover_url ? <img src={r.cover_url} alt="" className="w-10 h-14 object-cover rounded" /> : <div className="w-10 h-14 bg-white/10 rounded" />}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{r.title}</p>
              <p className="text-white/40 text-xs truncate">/{r.slug} · {r.language ?? "—"}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "published" ? "bg-green-500/20 text-green-400" : r.status === "archived" ? "bg-white/10 text-white/40" : "bg-yellow-500/20 text-yellow-400"}`}>{r.status.toUpperCase()}</span>
            {r.is_premium && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F88A2B]/20 text-[#F88A2B]">PREMIUM</span>}
            <div className="flex items-center gap-1 ml-2">
              {extraActions?.(r)}
              <IconAction title="Editar" onClick={() => setEditing(r)} className="text-[#F88A2B] hover:bg-[#F88A2B]/10">
                <Pencil className="w-4 h-4" />
              </IconAction>
              {r.status !== "published" && (
                <IconAction title="Publicar" onClick={() => changeStatus(r.id, "published")} className="text-green-400 hover:bg-green-400/10">
                  <Eye className="w-4 h-4" />
                </IconAction>
              )}
              {r.status === "published" && (
                <IconAction title="Despublicar" onClick={() => changeStatus(r.id, "draft")} className="text-yellow-400 hover:bg-yellow-400/10">
                  <EyeOff className="w-4 h-4" />
                </IconAction>
              )}
              {r.status !== "archived" && (
                <IconAction title="Arquivar" onClick={() => changeStatus(r.id, "archived")} className="text-white/60 hover:bg-white/10">
                  <Archive className="w-4 h-4" />
                </IconAction>
              )}
              <IconAction title="Duplicar" onClick={() => duplicate(r)} className="text-white/60 hover:bg-white/10">
                <Copy className="w-4 h-4" />
              </IconAction>
              <IconAction title="Excluir" onClick={() => remove(r.id)} className="text-red-400 hover:bg-red-400/10">
                <Trash2 className="w-4 h-4" />
              </IconAction>
            </div>
          </div>
        ))}
      </div>

      {editing && <ContentItemForm item={editing} onSaved={() => { setEditing(null); void load(); }} onClose={() => setEditing(null)} />}
    </PlatformAdminLayout>
  );
}

export default function PlatformContentBooksScreen() {
  return <ContentItemsListPage type="book" title="Livros" />;
}