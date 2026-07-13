import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type ContentType = "book" | "course" | "track" | "podcast" | "video" | "audio" | "material";

export type ContentItem = {
  id?: string;
  type: ContentType;
  status: "draft" | "published" | "archived";
  title: string;
  subtitle: string | null;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  cover_url: string | null;
  banner_url: string | null;
  category_id: string | null;
  language: string | null;
  level: string | null;
  duration_minutes: number | null;
  file_url: string | null;
  media_url: string | null;
  is_premium: boolean;
  is_featured: boolean;
  published_at: string | null;
  metadata: any;
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const emptyItem = (type: ContentType): ContentItem => ({
  type, status: "draft", title: "", subtitle: "", slug: "",
  short_description: "", long_description: "", cover_url: "", banner_url: "",
  category_id: null, language: "pt-BR", level: "", duration_minutes: null,
  file_url: "", media_url: "", is_premium: false, is_featured: false,
  published_at: null, metadata: {},
});

export function ContentItemForm({ item, onSaved, onClose }: { item: ContentItem; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<ContentItem>(item);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selAuthors, setSelAuthors] = useState<string[]>([]);
  const [selTags, setSelTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

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

  const save = async () => {
    if (!form.title.trim()) return toast.error("Título obrigatório.");
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug?.trim() || slugify(form.title),
      published_at: form.status === "published" && !form.published_at ? new Date().toISOString() : form.published_at,
    };
    let itemId = form.id;
    if (itemId) {
      const { error } = await supabase.from("content_items").update(payload).eq("id", itemId);
      if (error) { setSaving(false); return toast.error(error.message); }
    } else {
      const { data, error } = await supabase.from("content_items").insert(payload as any).select("id").single();
      if (error || !data) { setSaving(false); return toast.error(error?.message ?? "erro"); }
      itemId = data.id;
    }
    // sync authors + tags
    await supabase.from("content_item_authors").delete().eq("item_id", itemId);
    if (selAuthors.length) {
      await supabase.from("content_item_authors").insert(selAuthors.map((author_id, i) => ({ item_id: itemId!, author_id, sort_order: i })));
    }
    await supabase.from("content_item_tags").delete().eq("item_id", itemId);
    if (selTags.length) {
      await supabase.from("content_item_tags").insert(selTags.map((tag_id) => ({ item_id: itemId!, tag_id })));
    }
    setSaving(false);
    toast.success("Conteúdo salvo.");
    onSaved();
  };

  const toggle = (arr: string[], setArr: (v: string[]) => void, id: string) => {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const createTag = async () => {
    const name = newTag.trim(); if (!name) return;
    const slug = slugify(name);
    const { data, error } = await supabase.from("content_tags").insert({ name, slug }).select("id,name").single();
    if (error || !data) return toast.error(error?.message ?? "erro");
    setTags((prev) => [...prev, data as any]);
    setSelTags((prev) => [...prev, data.id]);
    setNewTag("");
  };

  const set = <K extends keyof ContentItem>(k: K, v: ContentItem[K]) => setForm({ ...form, [k]: v });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0B0908] border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-black text-white mb-4">{form.id ? "Editar" : "Novo"} {form.type}</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block"><span className="text-xs text-white/50">Título *</span><input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
          <label className="col-span-2 block"><span className="text-xs text-white/50">Subtítulo</span><input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
          <label className="col-span-2 block"><span className="text-xs text-white/50">Slug (auto se vazio)</span><input value={form.slug} onChange={(e) => set("slug", e.target.value)} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
          <label className="block"><span className="text-xs text-white/50">Status</span>
            <select value={form.status} onChange={(e) => set("status", e.target.value as any)} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
              <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
            </select>
          </label>
          <label className="block"><span className="text-xs text-white/50">Categoria</span>
            <select value={form.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
              <option value="">—</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-xs text-white/50">Idioma</span><input value={form.language ?? ""} onChange={(e) => set("language", e.target.value)} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
          <label className="block"><span className="text-xs text-white/50">Nível</span><input value={form.level ?? ""} onChange={(e) => set("level", e.target.value)} placeholder="iniciante / intermediário / avançado" className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
          <label className="block"><span className="text-xs text-white/50">Duração (min)</span><input type="number" value={form.duration_minutes ?? ""} onChange={(e) => set("duration_minutes", e.target.value ? Number(e.target.value) : null)} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
          <StorageUpload bucket="content-images" value={form.cover_url ?? null} onChange={(v) => set("cover_url", v)} label="Capa" />
          <StorageUpload bucket="content-images" value={form.banner_url ?? null} onChange={(v) => set("banner_url", v)} label="Banner" />
          <StorageUpload bucket="content-pdf" value={form.file_url ?? null} onChange={(v) => set("file_url", v)} label="Arquivo (PDF/ePub)" />
          <StorageUpload bucket={form.type === "video" ? "content-video" : "content-audio"} value={form.media_url ?? null} onChange={(v) => set("media_url", v)} label="Mídia (áudio/vídeo) — ou cole URL YouTube/Vimeo" />
          <label className="col-span-2 block"><span className="text-xs text-white/50">Descrição curta</span><textarea value={form.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
          <label className="col-span-2 block"><span className="text-xs text-white/50">Descrição completa</span><textarea value={form.long_description ?? ""} onChange={(e) => set("long_description", e.target.value)} rows={5} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></label>
          <div className="col-span-2">
            <span className="text-xs text-white/50">Autores</span>
            <div className="mt-1 flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/10 rounded-lg max-h-32 overflow-y-auto">
              {authors.length === 0 && <span className="text-xs text-white/40">Cadastre autores primeiro.</span>}
              {authors.map((a) => (
                <button type="button" key={a.id} onClick={() => toggle(selAuthors, setSelAuthors, a.id)} className={`text-xs px-2 py-1 rounded-full border ${selAuthors.includes(a.id) ? "bg-[#F88A2B] text-black border-[#F88A2B]" : "bg-white/5 text-white/70 border-white/10"}`}>{a.name}</button>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-white/50">Tags</span>
            <div className="mt-1 flex flex-wrap gap-1.5 p-2 bg-white/5 border border-white/10 rounded-lg max-h-32 overflow-y-auto">
              {tags.map((t) => (
                <button type="button" key={t.id} onClick={() => toggle(selTags, setSelTags, t.id)} className={`text-xs px-2 py-1 rounded-full border ${selTags.includes(t.id) ? "bg-[#F88A2B] text-black border-[#F88A2B]" : "bg-white/5 text-white/70 border-white/10"}`}>{t.name}</button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void createTag(); } }} placeholder="Nova tag…" className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs" />
              <button type="button" onClick={createTag} className="px-3 py-1.5 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20">+ Criar</button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.is_premium} onChange={(e) => set("is_premium", e.target.checked)} />Premium</label>
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />Destaque</label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-white/60 text-sm">Cancelar</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-[#F88A2B] text-black rounded-lg text-sm font-bold disabled:opacity-50">{saving ? "Salvando…" : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}