import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Eye, EyeOff, Archive, Copy, Trash2, BookOpen, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { emptyItem, type ContentItem } from "@/components/admin/ContentItemForm";
import { BookForm } from "@/components/admin/BookForm";

type Row = ContentItem & { id: string };

const STATUS_META: Record<string, { label: string; color: string }> = {
  not_started: { label: "Sem PDF", color: "bg-slate-100 text-slate-600" },
  uploaded: { label: "PDF enviado", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Processando", color: "bg-amber-100 text-amber-800" },
  processed: { label: "Processado", color: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Falha", color: "bg-red-100 text-red-700" },
};

function IconAction({ title, onClick, className = "", children }: { title: string; onClick: () => void; className?: string; children: React.ReactNode }) {
  return (
    <button type="button" title={title} aria-label={title} onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${className}`}>
      {children}
    </button>
  );
}

export default function PlatformContentBooksScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true); setError(null);
    let query = supabase.from("content_items").select("*").eq("type", "book").order("updated_at", { ascending: false }).limit(500);
    if (status) query = query.eq("status", status as any);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setRows((data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { void load(); }, [status]);

  const filtered = useMemo(
    () => rows.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.slug.includes(q.toLowerCase())),
    [rows, q]
  );

  const changeStatus = async (id: string, s: "draft" | "published" | "archived", r?: Row) => {
    if (s === "published") {
      const ps = (r?.metadata as any)?.processing_status;
      if (ps !== "processed") { toast.error("Processe o PDF antes de publicar."); return; }
    }
    const payload: any = { status: s };
    if (s === "published") payload.published_at = new Date().toISOString();
    const { error } = await supabase.from("content_items").update(payload).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(s === "published" ? "Livro publicado." : s === "archived" ? "Arquivado." : "Despublicado.");
    void load();
  };

  const duplicate = async (r: Row) => {
    const { id, ...rest } = r as any;
    const meta = { ...(rest.metadata ?? {}) };
    // não copia arquivo/processamento (é um novo livro)
    delete meta.original_file_path;
    delete meta.original_file_bucket;
    delete meta.original_file_name;
    delete meta.original_file_size;
    delete meta.processed_at;
    delete meta.chapters_count;
    delete meta.words_count;
    meta.processing_status = "not_started";
    const copy = { ...rest, title: r.title + " (cópia)", slug: r.slug + "-copia-" + Date.now().toString(36), status: "draft", published_at: null, metadata: meta };
    const { error } = await supabase.from("content_items").insert(copy);
    if (error) return toast.error(error.message);
    toast.success("Livro duplicado."); void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir permanentemente? Capítulos e progresso de leitura também serão apagados.")) return;
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Livro excluído."); void load();
  };

  return (
    <PlatformAdminLayout>
      <header className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#F88A2B] font-bold">Content · Kindle Mode</p>
          <h1 className="text-3xl font-black text-[#0F172A] mt-1">Livros</h1>
          <p className="text-sm text-[#64748B] mt-1">Envie PDFs, processe com IA e disponibilize leitura estruturada no app.</p>
        </div>
        <button onClick={() => setEditing(emptyItem("book"))} className="px-4 py-2.5 bg-[#F88A2B] text-black rounded-lg text-sm font-bold flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Novo livro
        </button>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
          <option value="">Todos status</option>
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
          <option value="archived">Arquivado</option>
        </select>
        <span className="ml-auto text-[#64748B] text-sm self-center">{filtered.length} livros</span>
      </div>

      {loading && <p className="text-[#64748B] text-sm">Carregando…</p>}
      {error && <p className="text-red-600 text-sm">Erro: {error}</p>}
      {!loading && !error && filtered.length === 0 && <p className="text-[#94A3B8] text-sm">Nenhum livro cadastrado.</p>}

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {filtered.map((r) => {
          const meta: any = r.metadata ?? {};
          const ps = meta.processing_status ?? (meta.original_file_path ? "uploaded" : "not_started");
          const badge = STATUS_META[ps] ?? STATUS_META.not_started;
          return (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#F1F5F9] last:border-b-0">
              {r.cover_url ? <img src={r.cover_url} alt="" className="w-10 h-14 object-cover rounded" /> : <div className="w-10 h-14 bg-[#F1F5F9] rounded" />}
              <div className="flex-1 min-w-0">
                <p className="text-[#0F172A] font-semibold truncate">{r.title}</p>
                <p className="text-[#94A3B8] text-xs truncate">
                  /{r.slug} · {r.language ?? "—"}
                  {meta.chapters_count ? ` · ${meta.chapters_count} caps` : ""}
                  {meta.estimated_reading_minutes ? ` · ${meta.estimated_reading_minutes} min` : ""}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label.toUpperCase()}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "published" ? "bg-green-100 text-green-700" : r.status === "archived" ? "bg-slate-100 text-slate-500" : "bg-yellow-100 text-yellow-700"}`}>{r.status.toUpperCase()}</span>
              {r.is_premium && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F88A2B]/20 text-[#F88A2B]">PREMIUM</span>}
              <div className="flex items-center gap-1 ml-2">
                {ps === "processed" && (
                  <IconAction title="Pré-visualizar leitura" onClick={() => window.open(`/livros/${r.id}/ler`, "_blank")} className="text-[#0F172A] hover:bg-[#F1F5F9]">
                    <Sparkles className="w-4 h-4" />
                  </IconAction>
                )}
                <IconAction title="Editar" onClick={() => setEditing(r)} className="text-[#F88A2B] hover:bg-[#F88A2B]/10">
                  <Pencil className="w-4 h-4" />
                </IconAction>
                {r.status !== "published" && (
                  <IconAction title="Publicar" onClick={() => changeStatus(r.id, "published", r)} className="text-green-600 hover:bg-green-100">
                    <Eye className="w-4 h-4" />
                  </IconAction>
                )}
                {r.status === "published" && (
                  <IconAction title="Despublicar" onClick={() => changeStatus(r.id, "draft")} className="text-yellow-600 hover:bg-yellow-100">
                    <EyeOff className="w-4 h-4" />
                  </IconAction>
                )}
                {r.status !== "archived" && (
                  <IconAction title="Arquivar" onClick={() => changeStatus(r.id, "archived")} className="text-[#64748B] hover:bg-[#F1F5F9]">
                    <Archive className="w-4 h-4" />
                  </IconAction>
                )}
                <IconAction title="Duplicar" onClick={() => duplicate(r)} className="text-[#64748B] hover:bg-[#F1F5F9]">
                  <Copy className="w-4 h-4" />
                </IconAction>
                <IconAction title="Excluir" onClick={() => remove(r.id)} className="text-red-600 hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </IconAction>
              </div>
            </div>
          );
        })}
      </div>

      {editing && <BookForm item={editing} onSaved={() => { setEditing(null); void load(); }} onClose={() => setEditing(null)} />}
    </PlatformAdminLayout>
  );
}