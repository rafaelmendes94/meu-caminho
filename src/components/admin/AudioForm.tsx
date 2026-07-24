import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StorageUpload } from "./StorageUpload";
import { AudioR2Upload, type AudioUploadResult } from "./AudioR2Upload";

export type AudioKind =
  | "pratica_guiada" | "meditacao" | "respiracao" | "relaxamento"
  | "reflexao" | "afirmacao" | "audio_do_dia" | "exercicio" | "foco" | "outro";

const AUDIO_KIND_LABEL: Record<AudioKind, string> = {
  pratica_guiada: "Prática guiada",
  meditacao: "Meditação",
  respiracao: "Respiração",
  relaxamento: "Relaxamento",
  reflexao: "Reflexão curta",
  afirmacao: "Afirmação",
  audio_do_dia: "Áudio do dia",
  exercicio: "Exercício sonoro",
  foco: "Foco",
  outro: "Outro",
};

const BEST_MOMENTS: { value: string; label: string }[] = [
  { value: "inicio_do_dia", label: "Início do dia" },
  { value: "pausa", label: "Pausa" },
  { value: "antes_reuniao", label: "Antes de reunião" },
  { value: "depois_reuniao", label: "Depois de reunião" },
  { value: "fim_do_dia", label: "Fim do dia" },
  { value: "crise_ansiedade", label: "Crise de ansiedade" },
  { value: "antes_dormir", label: "Antes de dormir" },
];

export type AudioItem = {
  id?: string;
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
  duration_minutes: number | null;
  media_url: string | null;
  is_premium: boolean;
  is_featured: boolean;
  published_at: string | null;
  metadata: any;
  audience_tags?: string[];
  recommendation_weights?: any;
};

export const emptyAudio = (): AudioItem => ({
  status: "draft", title: "", subtitle: "", slug: "",
  short_description: "", long_description: "", cover_url: "", banner_url: "",
  category_id: null, language: "pt-BR", duration_minutes: null,
  media_url: "", is_premium: false, is_featured: false, published_at: null,
  metadata: {
    audio_storage: "cloudflare_r2",
    audio_provider: "cloudflare_r2",
    audio_kind: "pratica_guiada",
    best_moment: [],
    emotional_intensity: "leve",
    objective: "",
    narrator: "",
    transcription: "",
    admin_notes: "",
    cta_label: "",
    cta_url: "",
    ai_processing_status: "idle",
  },
  audience_tags: [], recommendation_weights: null,
});

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function AudioForm({ item, onSaved, onClose }: { item: AudioItem; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<AudioItem>(item);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selTags, setSelTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const meta = (form.metadata ?? {}) as Record<string, any>;
  const audioKind: AudioKind = (meta.audio_kind as AudioKind) ?? "pratica_guiada";
  const bestMoments: string[] = Array.isArray(meta.best_moment) ? meta.best_moment : [];

  useEffect(() => {
    (async () => {
      const [c, t] = await Promise.all([
        supabase.from("content_categories").select("id,name").order("name"),
        supabase.from("content_tags").select("id,name").order("name"),
      ]);
      setCats((c.data ?? []) as any);
      setTags((t.data ?? []) as any);
      if (item.id) {
        const { data } = await supabase.from("content_item_tags").select("tag_id").eq("item_id", item.id);
        setSelTags(((data ?? []) as any[]).map((r) => r.tag_id));
      }
    })();
  }, [item.id]);

  const set = <K extends keyof AudioItem>(k: K, v: AudioItem[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setMeta = (patch: Record<string, any>) => setForm((f) => ({ ...f, metadata: { ...(f.metadata ?? {}), ...patch } }));
  const toggleMoment = (v: string) => {
    const next = bestMoments.includes(v) ? bestMoments.filter((x) => x !== v) : [...bestMoments, v];
    setMeta({ best_moment: next });
  };

  const onUploaded = (r: AudioUploadResult) => {
    set("media_url", r.public_url);
    setMeta({
      audio_storage: "cloudflare_r2",
      audio_provider: "cloudflare_r2",
      audio_bucket: r.bucket,
      audio_path: r.object_key,
      audio_url: r.public_url,
      original_file_name: r.original_file_name,
      original_file_size: r.file_size,
      mime_type: r.mime_type,
      uploaded_at: r.uploaded_at,
    });
  };
  const onRemoved = () => {
    set("media_url", "");
    setMeta({
      audio_bucket: null, audio_path: null, audio_url: null,
      original_file_name: null, original_file_size: null, mime_type: null,
    });
  };

  const validateForPublish = (): string | null => {
    if (!form.title.trim()) return "Título obrigatório.";
    if (!form.slug.trim() && !form.title.trim()) return "Slug obrigatório.";
    if (!form.cover_url) return "Capa obrigatória.";
    if (!(form.short_description ?? "").trim()) return "Descrição curta obrigatória.";
    if (!audioKind) return "Tipo do áudio obrigatório.";
    if (!(form.media_url ?? "").trim()) return "Envie o arquivo de áudio antes de publicar.";
    if (!form.duration_minutes) return "Duração obrigatória.";
    return null;
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Título obrigatório.");
    if (form.status === "published") {
      const err = validateForPublish();
      if (err) return toast.error(err);
    }
    setSaving(true);
    const payload: any = {
      ...form,
      type: "audio",
      slug: form.slug?.trim() || slugify(form.title),
      published_at: form.status === "published" && !form.published_at ? new Date().toISOString() : form.published_at,
    };
    let itemId = form.id;
    if (itemId) {
      const { error } = await supabase.from("content_items").update(payload).eq("id", itemId);
      if (error) { setSaving(false); return toast.error(error.message); }
    } else {
      const { data, error } = await supabase.from("content_items").insert(payload).select("id").single();
      if (error || !data) { setSaving(false); return toast.error(error?.message ?? "erro"); }
      itemId = data.id;
      setForm((f) => ({ ...f, id: itemId }));
    }
    await supabase.from("content_item_tags").delete().eq("item_id", itemId);
    if (selTags.length) {
      await supabase.from("content_item_tags").insert(selTags.map((tag_id) => ({ item_id: itemId!, tag_id })));
    }
    setSaving(false);
    toast.success("Áudio salvo.");
    onSaved();
  };

  const analyze = async () => {
    if (!form.id) return toast.error("Salve o áudio antes de analisar com IA.");
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-audio-content", {
        body: {
          audio_id: form.id,
          transcription: meta.transcription ?? "",
          admin_notes: meta.admin_notes ?? "",
          audio_kind: audioKind,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Análise concluída.");
      const { data: fresh } = await supabase.from("content_items").select("*").eq("id", form.id).maybeSingle();
      if (fresh) setForm(fresh as any);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha na análise");
    } finally {
      setAnalyzing(false);
    }
  };

  const uploadMeta = useMemo(() => ({
    public_url: form.media_url ?? undefined,
    object_key: meta.audio_path,
    bucket: meta.audio_bucket,
    file_size: meta.original_file_size,
    mime_type: meta.mime_type,
    original_file_name: meta.original_file_name,
    uploaded_at: meta.uploaded_at,
  }), [form.media_url, meta.audio_path, meta.audio_bucket, meta.original_file_size, meta.mime_type, meta.original_file_name, meta.uploaded_at]);

  const aiStatus: string = meta.ai_processing_status ?? "idle";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-black/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-[#0F172A]">{form.id ? "Editar" : "Novo"} áudio</h2>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#0F172A] text-white uppercase tracking-wider">Áudio · R2</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Título *</span>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>
          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Subtítulo</span>
            <input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>
          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Slug (auto se vazio)</span>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          <label className="block"><span className="text-xs text-[#64748B]">Status</span>
            <select value={form.status} onChange={(e) => set("status", e.target.value as any)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
              <option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option>
            </select>
          </label>
          <label className="block"><span className="text-xs text-[#64748B]">Categoria</span>
            <select value={form.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
              <option value="">—</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="block"><span className="text-xs text-[#64748B]">Tipo do áudio *</span>
            <select value={audioKind} onChange={(e) => setMeta({ audio_kind: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
              {(Object.keys(AUDIO_KIND_LABEL) as AudioKind[]).map((k) => <option key={k} value={k}>{AUDIO_KIND_LABEL[k]}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-xs text-[#64748B]">Intensidade emocional</span>
            <select value={meta.emotional_intensity ?? "leve"} onChange={(e) => setMeta({ emotional_intensity: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
              <option value="leve">Leve</option>
              <option value="media">Média</option>
              <option value="profunda">Profunda</option>
            </select>
          </label>

          <label className="block"><span className="text-xs text-[#64748B]">Duração (min) *</span>
            <input type="number" min={0} step={0.1} value={form.duration_minutes ?? ""} onChange={(e) => set("duration_minutes", e.target.value ? Number(e.target.value) : null)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>
          <label className="block"><span className="text-xs text-[#64748B]">Autor/narrador</span>
            <input value={meta.narrator ?? ""} onChange={(e) => setMeta({ narrator: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          <StorageUpload bucket="content-images" value={form.cover_url ?? null} onChange={(v) => set("cover_url", v)} label="Capa *" />
          <StorageUpload bucket="content-images" value={form.banner_url ?? null} onChange={(v) => set("banner_url", v)} label="Banner" />

          <div className="col-span-2">
            <AudioR2Upload
              audioId={form.id ?? null}
              audioKind={audioKind}
              value={form.media_url ?? null}
              meta={uploadMeta as any}
              onUploaded={onUploaded}
              onRemoved={onRemoved}
            />
          </div>

          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Objetivo do áudio</span>
            <input value={meta.objective ?? ""} onChange={(e) => setMeta({ objective: e.target.value })} placeholder="Ex.: reduzir ansiedade rápida em 3 minutos" className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          <div className="col-span-2">
            <span className="text-xs text-[#64748B]">Melhor momento para ouvir</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {BEST_MOMENTS.map((m) => (
                <button key={m.value} type="button" onClick={() => toggleMoment(m.value)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${bestMoments.includes(m.value) ? "bg-[#F88A2B] text-black border-[#F88A2B]" : "bg-white text-[#334155] border-[#E2E8F0]"}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Descrição curta *</span>
            <textarea value={form.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>
          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Descrição completa</span>
            <textarea value={form.long_description ?? ""} onChange={(e) => set("long_description", e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Transcrição/roteiro (para análise IA profunda)</span>
            <textarea value={meta.transcription ?? ""} onChange={(e) => setMeta({ transcription: e.target.value })} rows={5} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm font-mono" />
          </label>
          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Notas para a IA</span>
            <textarea value={meta.admin_notes ?? ""} onChange={(e) => setMeta({ admin_notes: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          <label className="block"><span className="text-xs text-[#64748B]">CTA · texto</span>
            <input value={meta.cta_label ?? ""} onChange={(e) => setMeta({ cta_label: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>
          <label className="block"><span className="text-xs text-[#64748B]">CTA · destino</span>
            <input value={meta.cta_url ?? ""} onChange={(e) => setMeta({ cta_url: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          <div className="col-span-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex items-center justify-between gap-3">
            <div className="text-xs text-[#334155]">
              <p className="font-semibold text-[#0F172A]">Análise por IA (Gemini)</p>
              <p className="text-[11px] text-[#64748B]">Status: <b>{aiStatus}</b>{meta.ai_processed_at ? ` · ${new Date(meta.ai_processed_at).toLocaleString("pt-BR")}` : ""}{meta.ai_processing_error ? ` · erro: ${meta.ai_processing_error}` : ""}</p>
              {meta.needs_more_info_message && <p className="text-[11px] text-amber-700 mt-1">{meta.needs_more_info_message}</p>}
            </div>
            <button type="button" onClick={analyze} disabled={analyzing || !form.id} className="px-4 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-lg disabled:opacity-40">
              {analyzing ? "Analisando…" : "Analisar áudio com IA"}
            </button>
          </div>

          {meta.ai_summary && (
            <div className="col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-[#064E3B]">
              <p className="font-bold mb-1">Resumo IA</p>
              <p className="whitespace-pre-line">{meta.ai_summary}</p>
              {Array.isArray(meta.topics) && meta.topics.length > 0 && <p className="mt-2"><b>Tópicos:</b> {meta.topics.join(" · ")}</p>}
              {Array.isArray(meta.reflection_questions) && meta.reflection_questions.length > 0 && <p className="mt-2"><b>Reflexões:</b> {meta.reflection_questions.join(" · ")}</p>}
              {Array.isArray(meta.ideal_audience) && meta.ideal_audience.length > 0 && <p><b>Público ideal:</b> {meta.ideal_audience.join(" · ")}</p>}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-[#0F172A]">
            <input type="checkbox" checked={form.is_premium} onChange={(e) => set("is_premium", e.target.checked)} /> Premium
          </label>
          <label className="flex items-center gap-2 text-sm text-[#0F172A]">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Destaque
          </label>

          <div className="col-span-2">
            <span className="text-xs text-[#64748B]">Tags</span>
            <div className="mt-1 flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg max-h-32 overflow-y-auto">
              {tags.map((t) => (
                <button type="button" key={t.id} onClick={() => setSelTags((prev) => prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id])} className={`text-xs px-2 py-1 rounded-full border ${selTags.includes(t.id) ? "bg-[#F88A2B] text-black border-[#F88A2B]" : "bg-white text-[#334155] border-[#E2E8F0]"}`}>{t.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-[#E2E8F0] text-[#334155] text-sm rounded-lg">Cancelar</button>
          <button onClick={save} disabled={saving} className="px-5 py-2 bg-[#F88A2B] text-black text-sm font-bold rounded-lg disabled:opacity-40">
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}