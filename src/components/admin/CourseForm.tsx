import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StorageUpload } from "./StorageUpload";
import { CourseVideoUpload } from "./CourseVideoUpload";
import type { ContentItem } from "./ContentItemForm";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type CourseMeta = {
  course_mode?: string;
  video_provider?: string;
  video_url?: string | null;
  transcription?: string | null;
  admin_notes?: string | null;
  ai_processing_status?: "idle" | "processing" | "success" | "failed";
  ai_processing_error?: string | null;
  ai_processed_at?: string | null;
  ai_summary?: string | null;
  main_objective?: string | null;
  topics?: string[];
  ideal_audience?: string[];
  emotional_moment?: string[];
  contraindications?: string[];
  recommended_track_stage?: string | null;
  emotional_intensity?: string | null;
  reflection_questions?: string[];
  recommendation_reason_template?: string | null;
  analysis_confidence?: string;
  needs_more_info?: boolean;
  needs_more_info_message?: string | null;
  title_suggestion?: string | null;
  subtitle_suggestion?: string | null;
  [k: string]: unknown;
};

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  idle: { label: "Aguardando IA", color: "bg-slate-100 text-slate-600" },
  processing: { label: "Analisando…", color: "bg-amber-100 text-amber-800" },
  success: { label: "Analisado pela IA", color: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Falha na IA", color: "bg-red-100 text-red-700" },
};

const STAGE_OPTIONS = [
  { v: "inicio", label: "Início da trilha" },
  { v: "meio", label: "Meio da trilha" },
  { v: "avancado", label: "Avançado" },
  { v: "fechamento", label: "Fechamento" },
];
const INTENSITY_OPTIONS = [
  { v: "leve", label: "Leve" },
  { v: "moderada", label: "Moderada" },
  { v: "profunda", label: "Profunda" },
];
const AUDIENCE_SUGGESTIONS = ["novo-colaborador", "lideranca", "gestor", "alta-ansiedade", "baixa-energia", "comunicacao", "recuperacao", "todos"];

function inferProvider(url: string | null | undefined): string {
  if (!url) return "external";
  const u = url.toLowerCase();
  if (u.includes("converteai.net")) return "vturb";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.includes("/storage/v1/") || u.includes("content-video")) return "upload";
  return "external";
}

export function CourseForm({ item, onSaved, onClose }: { item: ContentItem; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<ContentItem>(item);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selAuthors, setSelAuthors] = useState<string[]>([]);
  const [selTags, setSelTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [newAudience, setNewAudience] = useState("");
  const [newOutcome, setNewOutcome] = useState("");
  const transcriptRef = useRef<HTMLInputElement>(null);

  const meta = (form.metadata ?? {}) as CourseMeta;
  const aiStatus = meta.ai_processing_status ?? "idle";
  const badge = STATUS_BADGES[aiStatus] ?? STATUS_BADGES.idle;

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

  const set = <K extends keyof ContentItem>(k: K, v: ContentItem[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setMeta = (patch: Partial<CourseMeta>) => setForm((f) => ({ ...f, metadata: { ...(f.metadata as CourseMeta ?? {}), ...patch } }));

  const audienceArr = form.audience_tags ?? [];
  const outcomeArr = form.expected_outcomes ?? [];

  const hasVideoOrContext = useMemo(() => {
    return !!(form.media_url || meta.video_url || (meta.transcription ?? "").length > 40 || (meta.admin_notes ?? "").length > 40);
  }, [form.media_url, meta.video_url, meta.transcription, meta.admin_notes]);

  const canPublish =
    form.title.trim().length > 0 &&
    !!form.slug &&
    !!form.cover_url &&
    !!form.short_description &&
    hasVideoOrContext &&
    !!(form.duration_minutes || meta.ai_processing_status === "success") &&
    ((audienceArr.length > 0) || outcomeArr.length > 0);

  const save = async (): Promise<string | null> => {
    if (!form.title.trim()) { toast.error("Título obrigatório."); return null; }
    if (form.status === "published" && !canPublish) {
      toast.error("Preencha título, slug, capa, descrição curta, vídeo (ou transcrição/notas), duração e ao menos 1 tag/resultado para publicar.");
      return null;
    }
    setSaving(true);
    const provider = inferProvider(form.media_url ?? meta.video_url);
    const nextMeta: CourseMeta = {
      ...meta,
      course_mode: "single_video",
      video_provider: provider,
      video_url: form.media_url ?? meta.video_url ?? null,
      ai_processing_status: meta.ai_processing_status ?? "idle",
    };
    const payload: any = {
      ...form,
      type: "course",
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
      setForm((f) => ({ ...f, id: itemId }));
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
    if (id) { toast.success("Curso salvo."); onSaved(); }
  };

  const analyzeWithAI = async () => {
    let id = form.id;
    if (!id) {
      id = (await save()) ?? undefined;
      if (!id) return;
    } else {
      // salva antes para não perder o que o admin digitou
      const saved = await save();
      if (!saved) return;
      id = saved;
    }
    setProcessing(true);
    setMeta({ ai_processing_status: "processing", ai_processing_error: null });
    try {
      const { data, error } = await supabase.functions.invoke("process-course-video", {
        body: {
          course_id: id,
          video_url: form.media_url ?? meta.video_url ?? null,
          transcription: meta.transcription ?? null,
          admin_notes: meta.admin_notes ?? null,
        },
      });
      if (error) throw error;
      toast.success("Análise concluída pela IA.");
      // Recarrega item
      const { data: fresh } = await supabase.from("content_items").select("*").eq("id", id).maybeSingle();
      if (fresh) setForm(fresh as any);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha na análise.");
      setMeta({ ai_processing_status: "failed", ai_processing_error: String(e?.message ?? e) });
    } finally {
      setProcessing(false);
    }
  };

  const importTranscript = async (file: File) => {
    const t = await file.text();
    // Se for .srt, remove timestamps
    let clean = t;
    if (/^\d+\s*\n\d{2}:\d{2}:\d{2}/.test(t)) {
      clean = t
        .replace(/^\d+\s*$/gm, "")
        .replace(/\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}.*$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }
    setMeta({ transcription: clean });
    toast.success("Transcrição importada.");
  };

  const toggle = (arr: string[], setArr: (v: string[]) => void, id: string) =>
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const applySuggestion = (field: "title" | "subtitle") => {
    if (field === "title" && meta.title_suggestion) set("title", meta.title_suggestion);
    if (field === "subtitle" && meta.subtitle_suggestion) set("subtitle", meta.subtitle_suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-black/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#F88A2B] font-bold">Curso · Vídeo Único</p>
            <h2 className="text-xl font-black text-[#0F172A] mt-1">{form.id ? "Editar curso" : "Novo curso"}</h2>
          </div>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${badge.color}`}>{badge.label.toUpperCase()}</span>
        </div>

        {/* 1. Dados principais */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">1. Dados principais</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2"><span className="text-xs text-[#64748B]">Título *</span>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
              {meta.title_suggestion && meta.title_suggestion !== form.title && (
                <button type="button" onClick={() => applySuggestion("title")} className="mt-1 text-[11px] text-[#F88A2B] hover:underline">Usar sugestão da IA: "{meta.title_suggestion}"</button>
              )}
            </label>
            <label className="col-span-2"><span className="text-xs text-[#64748B]">Subtítulo</span>
              <input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
              {meta.subtitle_suggestion && meta.subtitle_suggestion !== form.subtitle && (
                <button type="button" onClick={() => applySuggestion("subtitle")} className="mt-1 text-[11px] text-[#F88A2B] hover:underline">Usar sugestão da IA: "{meta.subtitle_suggestion}"</button>
              )}
            </label>
            <label><span className="text-xs text-[#64748B]">Slug</span>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label><span className="text-xs text-[#64748B]">Status</span>
              <select value={form.status} onChange={(e) => set("status", e.target.value as any)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
                <option value="draft">Rascunho</option>
                <option value="published" disabled={!canPublish}>Publicado{!canPublish ? " (revise validações)" : ""}</option>
                <option value="archived">Arquivado</option>
              </select>
            </label>
            <label><span className="text-xs text-[#64748B]">Categoria</span>
              <select value={form.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
                <option value="">—</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label><span className="text-xs text-[#64748B]">Duração (min)</span>
              <input type="number" value={form.duration_minutes ?? ""} onChange={(e) => set("duration_minutes", e.target.value ? Number(e.target.value) : null)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <StorageUpload bucket="content-images" value={form.cover_url ?? null} onChange={(v) => set("cover_url", v)} label="Capa *" />
            <StorageUpload bucket="content-images" value={form.banner_url ?? null} onChange={(v) => set("banner_url", v)} label="Banner" />
            <label className="col-span-2"><span className="text-xs text-[#64748B]">Descrição curta *</span>
              <textarea value={form.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label className="col-span-2"><span className="text-xs text-[#64748B]">Descrição completa</span>
              <textarea value={form.long_description ?? ""} onChange={(e) => set("long_description", e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <div className="col-span-2 flex flex-wrap gap-4 text-sm text-[#334155]">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={form.is_premium} onChange={(e) => set("is_premium", e.target.checked)} /> Premium
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Destaque
              </label>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-[#64748B]">Autores / Mentor</span>
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

        {/* 2. Vídeo principal */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">2. Vídeo principal</h3>
          <CourseVideoUpload value={form.media_url ?? null} onChange={(v) => { set("media_url", v); setMeta({ video_url: v, video_provider: inferProvider(v) }); }} />
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B]">Transcrição do vídeo (colar ou importar .txt/.srt)</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => transcriptRef.current?.click()} className="text-[11px] text-[#F88A2B] hover:underline">Importar arquivo</button>
                  <input ref={transcriptRef} type="file" accept=".txt,.srt,text/plain" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void importTranscript(f); if (transcriptRef.current) transcriptRef.current.value = ""; }} />
                </div>
              </div>
              <textarea value={meta.transcription ?? ""} onChange={(e) => setMeta({ transcription: e.target.value })} rows={5} placeholder="Cole a transcrição do vídeo para a IA analisar em profundidade." className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm font-mono" />
            </div>
            <label>
              <span className="text-xs text-[#64748B]">Briefing/notas para a IA</span>
              <textarea value={meta.admin_notes ?? ""} onChange={(e) => setMeta({ admin_notes: e.target.value })} rows={3} placeholder="Ex.: público-alvo, foco emocional, o que este vídeo resolve, contraindicações…" className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
          </div>
        </section>

        {/* 3. Análise pela IA */}
        <section className="mb-6 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">3. Análise pela IA</h3>
              <p className="text-xs text-[#64748B]">A IA usa a transcrição, o briefing e a URL para preencher os campos pedagógicos e de recomendação.</p>
            </div>
            <button
              type="button"
              onClick={analyzeWithAI}
              disabled={processing || !hasVideoOrContext}
              className="px-4 py-2 bg-[#F88A2B] text-black text-xs font-bold rounded-lg disabled:opacity-50"
            >
              {processing ? "Analisando…" : aiStatus === "success" ? "Reanalisar com IA" : "Analisar vídeo com IA"}
            </button>
          </div>
          {!hasVideoOrContext && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded p-2 mb-3">
              Informe uma URL de vídeo ou cole transcrição/briefing antes de analisar.
            </p>
          )}
          {meta.needs_more_info && meta.needs_more_info_message && (
            <p className="text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded p-2 mb-3">
              {meta.needs_more_info_message}
            </p>
          )}
          {meta.ai_processing_error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded p-2 mb-3">Erro: {meta.ai_processing_error}</p>
          )}
          {aiStatus === "success" && (
            <div className="text-xs text-[#334155] space-y-2 bg-white border border-[#E2E8F0] rounded p-3">
              {meta.ai_summary && <p><b>Resumo IA:</b> {meta.ai_summary}</p>}
              {meta.main_objective && <p><b>Objetivo:</b> {meta.main_objective}</p>}
              {!!meta.topics?.length && <p><b>Tópicos:</b> {meta.topics.join(" · ")}</p>}
              {!!meta.ideal_audience?.length && <p><b>Público ideal:</b> {meta.ideal_audience.join(" · ")}</p>}
              {!!meta.reflection_questions?.length && (
                <div><b>Perguntas de reflexão:</b>
                  <ul className="list-disc ml-5 mt-1">{meta.reflection_questions.slice(0,5).map((q, i) => <li key={i}>{q}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 4. Inteligência para trilhas */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-[#0F172A] mb-3">4. Inteligência do curso para trilhas</h3>
          <div className="grid grid-cols-2 gap-3">
            <label><span className="text-xs text-[#64748B]">Etapa recomendada</span>
              <select value={meta.recommended_track_stage ?? ""} onChange={(e) => setMeta({ recommended_track_stage: e.target.value || null })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
                <option value="">—</option>
                {STAGE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
              </select>
            </label>
            <label><span className="text-xs text-[#64748B]">Intensidade emocional</span>
              <select value={meta.emotional_intensity ?? ""} onChange={(e) => setMeta({ emotional_intensity: e.target.value || null })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
                <option value="">—</option>
                {INTENSITY_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
              </select>
            </label>
            <label><span className="text-xs text-[#64748B]">Nível de dificuldade</span>
              <select value={form.difficulty_level ?? 1} onChange={(e) => set("difficulty_level", Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label><span className="text-xs text-[#64748B]">Nível (rótulo)</span>
              <input value={form.level ?? ""} onChange={(e) => set("level", e.target.value)} placeholder="iniciante / intermediário / avançado" className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>
            <label className="col-span-2"><span className="text-xs text-[#64748B]">Dor que resolve / objetivo principal</span>
              <input value={meta.main_objective ?? ""} onChange={(e) => setMeta({ main_objective: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
            </label>

            <ChipsField
              label="Público-alvo (audience_tags)"
              values={audienceArr}
              setValues={(v) => set("audience_tags", v)}
              suggestions={AUDIENCE_SUGGESTIONS}
              newValue={newAudience}
              setNewValue={setNewAudience}
              placeholder="ex.: engenharia"
              chipColor="bg-[#F88A2B] text-black"
            />
            <ChipsField
              label="Resultados esperados"
              values={outcomeArr}
              setValues={(v) => set("expected_outcomes", v)}
              newValue={newOutcome}
              setNewValue={setNewOutcome}
              placeholder="ex.: reduzir ansiedade"
              chipColor="bg-[#E0F2FE] text-[#0369A1]"
            />

            <MetaListField
              className="col-span-2"
              label="Tópicos abordados"
              values={meta.topics ?? []}
              onChange={(v) => setMeta({ topics: v })}
              placeholder="ex.: gestão da ansiedade no trabalho"
            />
            <MetaListField
              className="col-span-2"
              label="Momento emocional indicado"
              values={meta.emotional_moment ?? []}
              onChange={(v) => setMeta({ emotional_moment: v })}
              placeholder="ex.: burnout iminente"
            />
            <MetaListField
              className="col-span-2"
              label="Contraindicações"
              values={meta.contraindications ?? []}
              onChange={(v) => setMeta({ contraindications: v })}
              placeholder="ex.: crise aguda de luto"
            />
            <MetaListField
              className="col-span-2"
              label="Perguntas de reflexão"
              values={meta.reflection_questions ?? []}
              onChange={(v) => setMeta({ reflection_questions: v })}
              placeholder="ex.: o que essa aula mudou em você?"
            />
          </div>
        </section>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#64748B] hover:text-[#0F172A]">Cancelar</button>
          <button type="button" onClick={saveAndClose} disabled={saving} className="px-6 py-2.5 bg-[#F88A2B] text-black rounded-lg text-sm font-bold disabled:opacity-50">
            {saving ? "Salvando…" : "Salvar curso"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChipsField({ label, values, setValues, suggestions, newValue, setNewValue, placeholder, chipColor }: {
  label: string; values: string[]; setValues: (v: string[]) => void; suggestions?: string[];
  newValue: string; setNewValue: (v: string) => void; placeholder: string; chipColor: string;
}) {
  const add = () => {
    const v = newValue.trim();
    if (!v || values.includes(v)) return;
    setValues([...values, v]); setNewValue("");
  };
  return (
    <div className="col-span-2">
      <span className="text-xs text-[#64748B]">{label}</span>
      <div className="mt-1 flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg min-h-[42px]">
        {values.map((a) => (
          <span key={a} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${chipColor}`}>
            {a}
            <button type="button" onClick={() => setValues(values.filter((x) => x !== a))} className="opacity-70 hover:opacity-100">×</button>
          </span>
        ))}
      </div>
      {suggestions && (
        <div className="mt-1 flex gap-1 flex-wrap">
          {suggestions.filter((s) => !values.includes(s)).map((s) => (
            <button key={s} type="button" onClick={() => setValues([...values, s])} className="text-[10px] px-2 py-0.5 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]">+ {s}</button>
          ))}
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <input value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs" />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-[#F88A2B] text-black text-xs font-semibold rounded-lg hover:bg-[#E67A1F]">+ Add</button>
      </div>
    </div>
  );
}

function MetaListField({ label, values, onChange, placeholder, className }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string; className?: string;
}) {
  const [tmp, setTmp] = useState("");
  const add = () => {
    const v = tmp.trim(); if (!v || values.includes(v)) return;
    onChange([...values, v]); setTmp("");
  };
  return (
    <div className={className}>
      <span className="text-xs text-[#64748B]">{label}</span>
      {values.length > 0 && (
        <ul className="mt-1 space-y-1">
          {values.map((v, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-[#334155] bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-1">
              <span className="flex-1">{v}</span>
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-[#94A3B8] hover:text-red-500">×</button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-1 flex gap-2">
        <input value={tmp} onChange={(e) => setTmp(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs" />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-[#F88A2B] text-black text-xs font-semibold rounded-lg hover:bg-[#E67A1F]">+ Add</button>
      </div>
    </div>
  );
}