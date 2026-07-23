import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StorageUpload } from "./StorageUpload";
import { BookPdfUpload, type BookFileMeta } from "./BookPdfUpload";
import type { ContentItem } from "./ContentItemForm";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type BookMeta = BookFileMeta & {
  isbn?: string;
  publisher?: string;
  publication_year?: number | null;
  edition?: string;
  pages?: number | null;
  author_display_name?: string;
  copyright_notice?: string;
  source_type?: string;
  reading_mode?: string;
  processing_status?: string;
  processing_error?: string | null;
  processed_at?: string | null;
  chapters_count?: number;
  words_count?: number;
  estimated_reading_minutes?: number;
  [k: string]: unknown;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_started: { label: "Aguardando envio", color: "bg-slate-100 text-slate-600" },
  uploaded: { label: "PDF enviado — pronto para processar", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Processando…", color: "bg-amber-100 text-amber-800" },
  processed: { label: "Processado", color: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Falha no processamento", color: "bg-red-100 text-red-700" },
};

export function BookForm({ item, onSaved, onClose }: { item: ContentItem; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<ContentItem>(item);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selAuthors, setSelAuthors] = useState<string[]>([]);
  const [selTags, setSelTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const meta = (form.metadata ?? {}) as BookMeta;

  useEffect(() => {
    (async () => {
      const [c, a, t] = await Promise.all([
        supabase.from("content_categories").select("id,name").order("name"),
        supabase.from("content_authors").select("id,name").order("name"),
        supabase.from("content_tags").select("id,name").order("name"),
      ]);
      setCats((c.data ?? []) as any);
      setAuthors((a.data ?? []) as any);
      setTags((t.data ?? []) as any);
      if (item.id) {
        const [ia, it] = await Promise.all([
          supabase.from("content_item_authors").select("author_id").eq("item_id", item.id),
          supabase.from("content_item_tags").select("tag_id").eq("item_id", item.id),
        ]);
        setSelAuthors(((ia.data ?? []) as any[]).map((r) => r.author_id));
        setSelTags(((it.data ?? []) as any[]).map((r) => r.tag_id));
      }
    })();
  }, [item.id]);

  const set = <K extends keyof ContentItem>(k: K, v: ContentItem[K]) => setForm({ ...form, [k]: v });
  const setMeta = (patch: Partial<BookMeta>) => setForm({ ...form, metadata: { ...meta, ...patch } });

  const status = meta.processing_status ?? (meta.original_file_path ? "uploaded" : "not_started");
  const badge = STATUS_LABELS[status] ?? STATUS_LABELS.not_started;

  const canPublish = !!meta.original_file_path && status === "processed";

  const save = async (): Promise<string | null> => {
    if (!form.title.trim()) { toast.error("Título obrigatório."); return null; }
    if (form.status === "published" && !canPublish) {
      toast.error("Para publicar, envie o PDF e processe com IA.");
      return null;
    }
    setSaving(true);
    const nextMeta: BookMeta = {
      ...meta,
      source_type: "pdf",
      reading_mode: "kindle",
      processing_status: meta.processing_status ?? (meta.original_file_path ? "uploaded" : "not_started"),
    };
    const payload: any = {
      ...form,
      type: "book",
      slug: form.slug?.trim() || slugify(form.title),
      published_at: form.status === "published" && !form.published_at ? new Date().toISOString() : form.published_at,
      metadata: nextMeta,
    };
    let itemId = form.id;
    if (itemId) {
      const { error } = await supabase.from("content_items").update(payload).eq("id", itemId);
      if (error) { setSaving(false); toast.error(error.message); return null; }
    } else {
      const { data, error } = await supabase.from("content_items").insert(payload).select("id").single();
      if (error || !data) { setSaving(false); toast.error(error?.message ?? "erro"); return null; }
      itemId = data.id;
      setForm({ ...form, id: itemId });
    }
    await supabase.from("content_item_authors").delete().eq("item_id", itemId);
    if (selAuthors.length) {
      await supabase.from("content_item_authors").insert(selAuthors.map((author_id, i) => ({ item_id: itemId!, author_id, sort_order: i })));
    }
    await supabase.from("content_item_tags").delete().eq("item_id", itemId);
    if (selTags.length) {
      await supabase.from("content_item_tags").insert(selTags.map((tag_id) => ({ item_id: itemId!, tag_id })));
    }
    setSaving(false);
    return itemId!;
  };

  const saveAndClose = async () => {
    const id = await save();
    if (id) { toast.success("Livro salvo."); onSaved(); }
  };

  const runProcessing = async () => {
    // Garante que o item foi salvo antes de processar
    let id = form.id;
    if (!id || form.title !== item.title || !meta.original_file_path) {
      id = (await save()) ?? undefined;
      if (!id) return;
    }
    if (!meta.original_file_path) { toast.error("Envie o PDF antes de processar."); return; }
    setProcessing(true);
    setMeta({ processing_status: "processing", processing_error: null });
    try {
      const { data, error } = await supabase.functions.invoke("process-book-pdf", { body: { book_id: id } });
      if (error) throw error;
      toast.success(`Processamento concluído — ${data?.chapters ?? "?"} capítulos.`);
      // Recarrega metadata do banco
      const { data: fresh } = await supabase.from("content_items").select("metadata").eq("id", id).maybeSingle();
      if (fresh?.metadata) setForm((f) => ({ ...f, metadata: fresh.metadata }));
    } catch (e: any) {
      toast.error(e?.message ?? "Falha no processamento.");
      setMeta({ processing_status: "failed", processing_error: String(e?.message ?? e) });
    } finally {
      setProcessing(false);
    }
  };

  const openReader = () => {
    if (!form.id) return;
    window.open(`/livros/${form.id}/ler`, "_blank");
  };

  const toggle = (arr: string[], set: (v: string[]) => void, id: string) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-black/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#F88A2B] font-bold">Livro · Leitura Kindle</p>
            <h2 className="text-xl font-black text-[#0F172A] mt-1">{form.id ? "Editar livro" : "Novo livro"}</h2>
          </div>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${badge.color}`}>{badge.label.toUpperCase()}</span>
        </div>

        {/* Seção 1: Dados básicos */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">1. Dados básicos</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2"><span className="text-xs text-[#64748B]">Título *</span>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label className="col-span-2"><span className="text-xs text-[#64748B]">Subtítulo</span>
              <input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label><span className="text-xs text-[#64748B]">Slug</span>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label><span className="text-xs text-[#64748B]">Status</span>
              <select value={form.status} onChange={(e) => set("status", e.target.value as any)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
                <option value="draft">Rascunho</option>
                <option value="published" disabled={!canPublish}>Publicado{!canPublish ? " (requer PDF processado)" : ""}</option>
                <option value="archived">Arquivado</option>
              </select>
            </label>
            <label><span className="text-xs text-[#64748B]">Categoria</span>
              <select value={form.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
                <option value="">—</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label><span className="text-xs text-[#64748B]">Idioma</span>
              <input value={form.language ?? ""} onChange={(e) => set("language", e.target.value)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <StorageUpload bucket="content-images" value={form.cover_url ?? null} onChange={(v) => set("cover_url", v)} label="Capa vertical *" />
            <StorageUpload bucket="content-images" value={form.banner_url ?? null} onChange={(v) => set("banner_url", v)} label="Banner (opcional)" />
            <div className="col-span-2 flex flex-wrap gap-4 text-sm text-[#334155]">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={form.is_premium} onChange={(e) => set("is_premium", e.target.checked)} /> Premium
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Destaque
              </label>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-[#64748B]">Autores</span>
              <div className="mt-1 flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg max-h-28 overflow-y-auto">
                {authors.length === 0 && <span className="text-xs text-[#94A3B8]">Cadastre autores primeiro.</span>}
                {authors.map((a) => (
                  <button type="button" key={a.id} onClick={() => toggle(selAuthors, setSelAuthors, a.id)} className={`text-xs px-2 py-1 rounded-full border ${selAuthors.includes(a.id) ? "bg-[#F88A2B] text-black border-[#F88A2B]" : "bg-white text-[#334155] border-[#E2E8F0]"}`}>{a.name}</button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-[#64748B]">Tags</span>
              <div className="mt-1 flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg max-h-28 overflow-y-auto">
                {tags.map((t) => (
                  <button type="button" key={t.id} onClick={() => toggle(selTags, setSelTags, t.id)} className={`text-xs px-2 py-1 rounded-full border ${selTags.includes(t.id) ? "bg-[#F88A2B] text-black border-[#F88A2B]" : "bg-white text-[#334155] border-[#E2E8F0]"}`}>{t.name}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Seção 2: Dados editoriais */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">2. Dados editoriais</h3>
          <div className="grid grid-cols-2 gap-3">
            <label><span className="text-xs text-[#64748B]">ISBN</span>
              <input value={meta.isbn ?? ""} onChange={(e) => setMeta({ isbn: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label><span className="text-xs text-[#64748B]">Editora</span>
              <input value={meta.publisher ?? ""} onChange={(e) => setMeta({ publisher: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label><span className="text-xs text-[#64748B]">Ano de publicação</span>
              <input type="number" value={meta.publication_year ?? ""} onChange={(e) => setMeta({ publication_year: e.target.value ? Number(e.target.value) : null })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label><span className="text-xs text-[#64748B]">Edição</span>
              <input value={meta.edition ?? ""} onChange={(e) => setMeta({ edition: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label><span className="text-xs text-[#64748B]">Páginas</span>
              <input type="number" value={meta.pages ?? ""} onChange={(e) => setMeta({ pages: e.target.value ? Number(e.target.value) : null })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label><span className="text-xs text-[#64748B]">Nome do autor (exibição)</span>
              <input value={meta.author_display_name ?? ""} onChange={(e) => setMeta({ author_display_name: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label className="col-span-2"><span className="text-xs text-[#64748B]">Nota de copyright</span>
              <textarea value={meta.copyright_notice ?? ""} onChange={(e) => setMeta({ copyright_notice: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
          </div>
        </section>

        {/* Seção 3: PDF */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">3. Arquivo PDF</h3>
          <BookPdfUpload
            value={{
              original_file_bucket: meta.original_file_bucket,
              original_file_path: meta.original_file_path,
              original_file_name: meta.original_file_name,
              original_file_size: meta.original_file_size,
            }}
            onChange={(v) => setMeta({
              ...v,
              processing_status: v.original_file_path ? "uploaded" : "not_started",
              processing_error: null,
            })}
          />
        </section>

        {/* Seção 4: Processamento IA */}
        <section className="mb-6 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">4. Processamento por IA</h3>
              <p className="text-xs text-[#64748B]">A IA extrai o texto do PDF, organiza em capítulos e seções e gera resumos.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={runProcessing}
                disabled={processing || !meta.original_file_path}
                className="px-4 py-2 bg-[#F88A2B] text-black text-xs font-bold rounded-lg disabled:opacity-50"
              >
                {processing ? "Processando…" : status === "processed" ? "Reprocessar com IA" : "Processar PDF com IA"}
              </button>
              {status === "processed" && form.id && (
                <button type="button" onClick={openReader} className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold rounded-lg">
                  Pré-visualizar leitura
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-2">
              <p className="text-[10px] uppercase text-[#94A3B8]">Capítulos</p>
              <p className="text-lg font-black text-[#0F172A]">{meta.chapters_count ?? "—"}</p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-2">
              <p className="text-[10px] uppercase text-[#94A3B8]">Palavras</p>
              <p className="text-lg font-black text-[#0F172A]">{meta.words_count?.toLocaleString("pt-BR") ?? "—"}</p>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-2">
              <p className="text-[10px] uppercase text-[#94A3B8]">Leitura estimada</p>
              <p className="text-lg font-black text-[#0F172A]">{meta.estimated_reading_minutes ? `${meta.estimated_reading_minutes} min` : "—"}</p>
            </div>
          </div>
          {meta.processing_error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">
              Erro: {meta.processing_error}
            </p>
          )}
        </section>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#64748B] hover:text-[#0F172A]">Cancelar</button>
          <button type="button" onClick={saveAndClose} disabled={saving} className="px-5 py-2 bg-[#0F172A] text-white text-sm font-bold rounded-lg disabled:opacity-50">
            {saving ? "Salvando…" : "Salvar livro"}
          </button>
        </div>
      </div>
    </div>
  );
}