import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StorageUpload } from "./StorageUpload";
import VTurbPlayer, { parseVTurbSource } from "@/components/VTurbPlayer";

export type VideoKind =
  | "introdutorio" | "boas_vindas" | "institucional" | "feed"
  | "comunicacao_rh" | "apoio_emocional" | "explicativo_app" | "campanha" | "outro";

export type VideoProvider = "vturb" | "youtube" | "vimeo" | "upload" | "external";

export type VideoPlacement =
  | "feed" | "home" | "onboarding" | "trilha" | "empresa" | "biblioteca" | "dashboard_rh";

const KIND_LABELS: Record<VideoKind, string> = {
  introdutorio: "Introdutório",
  boas_vindas: "Boas-vindas",
  institucional: "Institucional",
  feed: "Vídeo do Feed",
  comunicacao_rh: "Comunicação do RH",
  apoio_emocional: "Apoio emocional (curto)",
  explicativo_app: "Explicativo do app",
  campanha: "Campanha interna",
  outro: "Outro",
};

const PLACEMENT_LABELS: Record<VideoPlacement, string> = {
  feed: "Feed",
  home: "Home",
  onboarding: "Onboarding",
  trilha: "Trilha (apoio/contexto)",
  empresa: "Empresa",
  biblioteca: "Biblioteca",
  dashboard_rh: "Dashboard RH",
};

const AUDIENCE_SUGGESTIONS = ["novo-colaborador","lideranca","gestor","alta-ansiedade","baixa-energia","comunicacao","recuperacao","todos"];

const VTURB_RE = /scripts\.converteai\.net\/([^/]+)\/players\/([^/]+)\/player\.js/i;

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

export type VideoItem = {
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
  difficulty_level?: number;
  expected_outcomes?: string[];
  recommendation_weights?: any;
};

export const emptyVideo = (): VideoItem => ({
  status: "draft", title: "", subtitle: "", slug: "",
  short_description: "", long_description: "", cover_url: "", banner_url: "",
  category_id: null, language: "pt-BR", duration_minutes: null,
  media_url: "", is_premium: false, is_featured: false, published_at: null,
  metadata: {
    content_mode: "informational_video",
    video_provider: "vturb",
    video_kind: "introdutorio",
    placement: [],
    cta_label: "",
    cta_url: "",
    vturb_script_url: "",
    alt_url: "",
    transcription: "",
    admin_notes: "",
    ai_processing_status: "idle",
  },
  audience_tags: [], difficulty_level: 1, expected_outcomes: [],
  recommendation_weights: null,
});

export function VideoForm({ item, onSaved, onClose }: { item: VideoItem; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<VideoItem>(item);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selAuthors, setSelAuthors] = useState<string[]>([]);
  const [selTags, setSelTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newAudience, setNewAudience] = useState("");
  const [newOutcome, setNewOutcome] = useState("");

  const meta = (form.metadata ?? {}) as Record<string, any>;
  const provider: VideoProvider = (meta.video_provider as VideoProvider) ?? "vturb";
  const kind: VideoKind = (meta.video_kind as VideoKind) ?? "introdutorio";
  const placement: VideoPlacement[] = Array.isArray(meta.placement) ? meta.placement : [];
  const scriptUrl: string = meta.vturb_script_url ?? (provider === "vturb" ? (form.media_url ?? "") : "");
  const audienceArr = form.audience_tags ?? [];
  const outcomeArr = form.expected_outcomes ?? [];

  const vturbInfo = useMemo(() => {
    const raw = (scriptUrl || "").trim();
    if (!raw) return { valid: false, message: "Cole a URL completa do script VTurb, terminando em /player.js." };
    const m = raw.match(VTURB_RE);
    if (!m) return { valid: false, message: "Cole a URL completa do script VTurb, terminando em /player.js." };
    return { valid: true, account: m[1], player: m[2], message: "URL VTurb válida." };
  }, [scriptUrl]);

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

  const set = <K extends keyof VideoItem>(k: K, v: VideoItem[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setMeta = (patch: Record<string, any>) => setForm((f) => ({ ...f, metadata: { ...(f.metadata ?? {}), ...patch } }));
  const togglePlacement = (p: VideoPlacement) => {
    const next = placement.includes(p) ? placement.filter((x) => x !== p) : [...placement, p];
    setMeta({ placement: next });
  };

  // Sync vturb metadata + media_url quando muda a URL
  const applyScriptUrl = (raw: string) => {
    const trimmed = raw.trim();
    const m = trimmed.match(VTURB_RE);
    setMeta({
      vturb_script_url: trimmed,
      vturb_account_id: m ? m[1] : null,
      vturb_player_id: m ? m[2] : null,
      video_provider: "vturb",
    });
    set("media_url", trimmed);
  };

  const applyAltUrl = (raw: string) => {
    const trimmed = raw.trim();
    setMeta({ alt_url: trimmed });
    if (provider !== "vturb" && trimmed) set("media_url", trimmed);
  };

  const validateForPublish = (): string | null => {
    if (!form.title.trim()) return "Título obrigatório.";
    if (!form.slug?.trim() && !form.title.trim()) return "Slug obrigatório.";
    if (!form.cover_url) return "Capa obrigatória.";
    if (!(form.short_description ?? "").trim()) return "Descrição curta obrigatória.";
    if (!kind) return "Tipo do vídeo obrigatório.";
    if (placement.length === 0) return "Escolha pelo menos um local de exibição.";
    if (provider === "vturb") {
      if (!vturbInfo.valid) return "URL VTurb inválida.";
    } else {
      if (!(form.media_url ?? "").trim()) return "URL/mídia do vídeo obrigatória.";
    }
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
      type: "video",
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
    await supabase.from("content_item_authors").delete().eq("item_id", itemId);
    if (selAuthors.length) {
      await supabase.from("content_item_authors").insert(selAuthors.map((author_id, i) => ({ item_id: itemId!, author_id, sort_order: i })));
    }
    await supabase.from("content_item_tags").delete().eq("item_id", itemId);
    if (selTags.length) {
      await supabase.from("content_item_tags").insert(selTags.map((tag_id) => ({ item_id: itemId!, tag_id })));
    }
    setSaving(false);
    toast.success("Vídeo salvo.");
    onSaved();
  };

  const analyze = async () => {
    if (!form.id) return toast.error("Salve o vídeo antes de analisar com IA.");
    setAnalyzing(true);
    setMeta({ ai_processing_status: "processing", ai_processing_error: null });
    try {
      const { data, error } = await supabase.functions.invoke("process-informational-video", {
        body: {
          video_id: form.id,
          video_url: provider === "vturb" ? scriptUrl : (form.media_url ?? ""),
          transcription: meta.transcription ?? "",
          admin_notes: meta.admin_notes ?? "",
          video_kind: kind,
        },
      });
      if (error) throw error;
      toast.success("Análise concluída.");
      // Recarrega o item para refletir metadata
      const { data: fresh } = await supabase.from("content_items").select("*").eq("id", form.id).maybeSingle();
      if (fresh) setForm(fresh as any);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha na análise");
      setMeta({ ai_processing_status: "failed", ai_processing_error: e?.message ?? "erro" });
    } finally {
      setAnalyzing(false);
    }
  };

  const aiStatus: string = meta.ai_processing_status ?? "idle";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-black/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-[#0F172A]">{form.id ? "Editar" : "Novo"} vídeo</h2>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#0F172A] text-white uppercase tracking-wider">Vídeo informativo</span>
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

          <label className="block"><span className="text-xs text-[#64748B]">Tipo do vídeo *</span>
            <select value={kind} onChange={(e) => setMeta({ video_kind: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
              {(Object.keys(KIND_LABELS) as VideoKind[]).map((k) => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-xs text-[#64748B]">Origem do vídeo</span>
            <select value={provider} onChange={(e) => setMeta({ video_provider: e.target.value })} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm">
              <option value="vturb">VTurb / ConverteAI</option>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="upload">Upload</option>
              <option value="external">Externo</option>
            </select>
          </label>

          <label className="block"><span className="text-xs text-[#64748B]">Duração (min)</span>
            <input type="number" value={form.duration_minutes ?? ""} onChange={(e) => set("duration_minutes", e.target.value ? Number(e.target.value) : null)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>
          <label className="block"><span className="text-xs text-[#64748B]">Idioma</span>
            <input value={form.language ?? ""} onChange={(e) => set("language", e.target.value)} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          <StorageUpload bucket="content-images" value={form.cover_url ?? null} onChange={(v) => set("cover_url", v)} label="Capa *" />
          <StorageUpload bucket="content-images" value={form.banner_url ?? null} onChange={(v) => set("banner_url", v)} label="Banner" />

          {/* VTurb block */}
          {provider === "vturb" && (
            <div className="col-span-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">URL do script VTurb (ConverteAI)</p>
                  <p className="text-xs text-[#64748B]">Ex.: https://scripts.converteai.net/&lt;conta&gt;/players/&lt;id&gt;/player.js</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#0F172A] text-white uppercase tracking-wider">VTurb</span>
              </div>
              <input
                value={scriptUrl}
                onChange={(e) => applyScriptUrl(e.target.value)}
                placeholder="https://scripts.converteai.net/<conta>/players/<id>/player.js"
                className={`w-full px-3 py-2 bg-white border rounded-lg text-[#0F172A] text-sm font-mono ${scriptUrl && !vturbInfo.valid ? "border-red-400" : "border-[#E2E8F0]"}`}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className={`text-[11px] ${!scriptUrl ? "text-[#64748B]" : vturbInfo.valid ? "text-emerald-700" : "text-red-600"}`}>{vturbInfo.message}</p>
                <button type="button" disabled={!vturbInfo.valid} onClick={() => setShowPreview((v) => !v)} className="px-3 py-1.5 bg-[#F88A2B] text-black text-[11px] font-bold rounded-lg disabled:opacity-40">
                  {showPreview ? "Ocultar preview" : "Testar player"}
                </button>
              </div>
              {vturbInfo.valid && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#334155]">
                  <div className="bg-white border border-[#E2E8F0] rounded px-2 py-1"><span className="text-[#64748B]">Account ID</span><p className="font-mono truncate">{vturbInfo.account}</p></div>
                  <div className="bg-white border border-[#E2E8F0] rounded px-2 py-1"><span className="text-[#64748B]">Player ID</span><p className="font-mono truncate">{vturbInfo.player}</p></div>
                </div>
              )}
              {showPreview && parseVTurbSource(scriptUrl)?.playerId && (
                <div className="mt-3 rounded-lg overflow-hidden border border-[#E2E8F0]">
                  <VTurbPlayer source={scriptUrl} className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* URL alternativa / upload */}
          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">URL alternativa (YouTube/Vimeo/externa)</span>
            <input value={meta.alt_url ?? ""} onChange={(e) => applyAltUrl(e.target.value)} placeholder="https://..." className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>
          <div className="col-span-2">
            <StorageUpload bucket="content-video" value={provider === "upload" ? (form.media_url ?? null) : null} onChange={(v) => { setMeta({ video_provider: "upload" }); set("media_url", v); }} label="Upload de vídeo (opcional)" />
          </div>

          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Descrição curta *</span>
            <textarea value={form.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>
          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Descrição completa</span>
            <textarea value={form.long_description ?? ""} onChange={(e) => set("long_description", e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          {/* Onde pode aparecer */}
          <div className="col-span-2">
            <span className="text-xs text-[#64748B]">Onde pode aparecer *</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {(Object.keys(PLACEMENT_LABELS) as VideoPlacement[]).map((p) => (
                <button type="button" key={p} onClick={() => togglePlacement(p)} className={`text-xs px-2 py-1 rounded-full border ${placement.includes(p) ? "bg-[#F88A2B] text-black border-[#F88A2B]" : "bg-white text-[#334155] border-[#E2E8F0]"}`}>
                  {PLACEMENT_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <label className="block"><span className="text-xs text-[#64748B]">CTA · texto do botão</span>
            <input value={meta.cta_label ?? ""} onChange={(e) => setMeta({ cta_label: e.target.value })} placeholder="Ex.: Começar jornada" className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>
          <label className="block"><span className="text-xs text-[#64748B]">CTA · destino (rota interna ou URL)</span>
            <input value={meta.cta_url ?? ""} onChange={(e) => setMeta({ cta_url: e.target.value })} placeholder="/trilha ou https://…" className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          {/* Público-alvo */}
          <div className="col-span-2">
            <span className="text-xs text-[#64748B]">Público-alvo (tags de audiência)</span>
            <div className="mt-1 flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg min-h-[42px]">
              {audienceArr.map((a) => (
                <span key={a} className="text-xs px-2 py-1 rounded-full bg-[#F88A2B] text-black flex items-center gap-1">
                  {a}
                  <button type="button" onClick={() => set("audience_tags", audienceArr.filter((x) => x !== a))} className="text-black/70">×</button>
                </span>
              ))}
            </div>
            <div className="mt-1 flex gap-1 flex-wrap">
              {AUDIENCE_SUGGESTIONS.filter((s) => !audienceArr.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => set("audience_tags", [...audienceArr, s])} className="text-[10px] px-2 py-0.5 rounded-full border border-[#E2E8F0] text-[#64748B]">+ {s}</button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={newAudience} onChange={(e) => setNewAudience(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = newAudience.trim().toLowerCase(); if (v && !audienceArr.includes(v)) { set("audience_tags", [...audienceArr, v]); setNewAudience(""); } } }} placeholder="ex.: engenharia" className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs" />
            </div>
          </div>

          {/* Transcrição / notas */}
          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Transcrição (opcional — melhora a análise da IA)</span>
            <textarea value={meta.transcription ?? ""} onChange={(e) => setMeta({ transcription: e.target.value })} rows={4} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm font-mono" />
          </label>
          <label className="col-span-2 block"><span className="text-xs text-[#64748B]">Notas para a IA (contexto, tom, público)</span>
            <textarea value={meta.admin_notes ?? ""} onChange={(e) => setMeta({ admin_notes: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm" />
          </label>

          {/* IA */}
          <div className="col-span-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex items-center justify-between gap-3">
            <div className="text-xs text-[#334155]">
              <p className="font-semibold text-[#0F172A]">Análise por IA (Gemini)</p>
              <p className="text-[11px] text-[#64748B]">
                Status: <b>{aiStatus}</b>
                {meta.ai_processed_at ? ` · em ${new Date(meta.ai_processed_at).toLocaleString("pt-BR")}` : ""}
                {meta.ai_processing_error ? ` · erro: ${meta.ai_processing_error}` : ""}
              </p>
              {meta.needs_more_info_message && <p className="text-[11px] text-amber-700 mt-1">{meta.needs_more_info_message}</p>}
            </div>
            <button type="button" onClick={analyze} disabled={analyzing || !form.id} className="px-4 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-lg disabled:opacity-40">
              {analyzing ? "Analisando…" : "Analisar vídeo com IA"}
            </button>
          </div>

          {meta.ai_summary && (
            <div className="col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-[#064E3B]">
              <p className="font-bold mb-1">Resumo IA</p>
              <p className="whitespace-pre-line">{meta.ai_summary}</p>
              {Array.isArray(meta.topics) && meta.topics.length > 0 && (
                <p className="mt-2"><b>Tópicos:</b> {meta.topics.join(" · ")}</p>
              )}
              {Array.isArray(meta.ideal_audience) && meta.ideal_audience.length > 0 && (
                <p><b>Público ideal:</b> {meta.ideal_audience.join(" · ")}</p>
              )}
              {Array.isArray(meta.recommended_contexts) && meta.recommended_contexts.length > 0 && (
                <p><b>Recomendar quando:</b> {meta.recommended_contexts.join(" · ")}</p>
              )}
            </div>
          )}

          {/* Flags */}
          <label className="flex items-center gap-2 text-sm text-[#0F172A]">
            <input type="checkbox" checked={form.is_premium} onChange={(e) => set("is_premium", e.target.checked)} /> Premium
          </label>
          <label className="flex items-center gap-2 text-sm text-[#0F172A]">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Destaque
          </label>

          {/* Autores + tags */}
          <div className="col-span-2">
            <span className="text-xs text-[#64748B]">Autor / responsável</span>
            <div className="mt-1 flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg max-h-32 overflow-y-auto">
              {authors.length === 0 && <span className="text-xs text-[#94A3B8]">Cadastre autores no CMS Hub.</span>}
              {authors.map((a) => (
                <button type="button" key={a.id} onClick={() => setSelAuthors((prev) => prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id])} className={`text-xs px-2 py-1 rounded-full border ${selAuthors.includes(a.id) ? "bg-[#F88A2B] text-black border-[#F88A2B]" : "bg-white text-[#334155] border-[#E2E8F0]"}`}>{a.name}</button>
              ))}
            </div>
          </div>
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