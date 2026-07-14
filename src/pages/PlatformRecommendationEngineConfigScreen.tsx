import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import {
  Lock, Save, Send, Plus, Trash2, ShieldCheck, Wand2, Sparkles,
  Sliders, Layers, ListChecks, GaugeCircle, Cpu,
  FlaskConical, History, GitCompare, RotateCcw,
} from "lucide-react";

// ---------- Types ----------
type Weighted = Record<string, number>;
type CatFmt = { key: string; label: string; active: boolean };
type ModelCfg = {
  primary_model: string;
  fallback_model: string;
  temperature: number;
  max_tokens: number;
  timeout_seconds: number;
  json_retries: number;
  streaming: boolean;
  categories: CatFmt[];
  formats: CatFmt[];
};
type ToneCfg = {
  dimension_weights: Weighted;
  format_weights: Weighted;
  boosts: Weighted;
  penalties: Weighted;
  time_available_minutes: number;
  novelty_half_life_days: number;
  top_n: number;
  min_score: number;
  diversity: { max_per_format: number; max_per_category: number };
  explanation: { style: string; max_length: number; include_signals: boolean };
};
type OutBlock = { key: string; title: string; active: boolean; order: number; required?: boolean };
type Cfg = {
  id: string; key: string; name: string; description: string | null;
  system_instructions: string;
  tone_config: ToneCfg;
  output_structure: OutBlock[];
  guardrails: string[];
  model_config: ModelCfg;
  version: number; status: "draft" | "published" | "archived";
  published_at: string | null; updated_at: string;
};
type VersionRow = { id: string; version: number; change_note: string | null; created_at: string; snapshot?: any };

// ---------- Constants ----------
const DIMENSIONS: { key: string; label: string }[] = [
  { key: "energy", label: "Energia" },
  { key: "anxiety", label: "Ansiedade" },
  { key: "communication", label: "Comunicação" },
  { key: "leadership", label: "Liderança" },
  { key: "recovery", label: "Recuperação" },
  { key: "engagement", label: "Engajamento" },
  { key: "equilibrium", label: "Equilíbrio" },
  { key: "psychological_safety", label: "Segurança psicológica" },
];
const BOOSTS: { key: string; label: string; hint: string }[] = [
  { key: "never_seen", label: "Nunca visto", hint: "Item que o colaborador ainda não viu." },
  { key: "partially_completed", label: "Parcialmente concluído", hint: "Deixado no meio — voltar para concluir." },
  { key: "started", label: "Iniciado recentemente", hint: "Item iniciado, mas ainda ativo." },
  { key: "favorite_category", label: "Categoria favorita", hint: "Categoria que o colaborador mais consome." },
  { key: "related", label: "Relacionado", hint: "Relacionado a conteúdos recentes." },
  { key: "ai_recommended", label: "Recomendado pela IA", hint: "Marcador de conteúdos priorizados pela IA." },
  { key: "best_fit_profile", label: "Melhor aderência ao perfil", hint: "Muito alinhado com perfil e sinais." },
  { key: "featured", label: "Em destaque", hint: "Curadoria em destaque." },
];
const PENALTIES: { key: string; label: string; hint: string; kind: "days" | "factor" }[] = [
  { key: "repeat_within_days", label: "Janela de repetição (dias)", hint: "Não repetir dentro dessa janela.", kind: "days" },
  { key: "repeat_penalty", label: "Penalidade de repetição", hint: "Multiplicador quando repete.", kind: "factor" },
  { key: "completed_penalty", label: "Penalidade após concluir", hint: "Multiplicador para conteúdos já concluídos.", kind: "factor" },
  { key: "dismissed_penalty", label: "Penalidade após dispensar", hint: "Multiplicador se o item foi dispensado.", kind: "factor" },
  { key: "archived_penalty", label: "Penalidade para arquivado", hint: "1.0 = nunca recomenda.", kind: "factor" },
  { key: "draft_penalty", label: "Penalidade para rascunho", hint: "1.0 = nunca recomenda.", kind: "factor" },
  { key: "premium_without_license_penalty", label: "Premium sem licença", hint: "1.0 = nunca recomenda.", kind: "factor" },
];
const STYLE_OPTS = [
  { value: "empatica", label: "Empática" },
  { value: "pratica", label: "Prática" },
  { value: "executiva", label: "Executiva" },
  { value: "acolhedora", label: "Acolhedora" },
];
const MODEL_OPTS = [
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
];

const TABS = [
  { id: "engine", label: "Motor", icon: Wand2 },
  { id: "weights", label: "Pesos", icon: Sliders },
  { id: "categories", label: "Categorias", icon: Layers },
  { id: "formats", label: "Formatos", icon: ListChecks },
  { id: "ranking", label: "Ranking", icon: GaugeCircle },
  { id: "model", label: "Modelo", icon: Cpu },
  { id: "test", label: "Testar Ranking", icon: FlaskConical },
  { id: "edit_ai", label: "Editar por IA", icon: Sparkles },
  { id: "history", label: "Histórico", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ---------- UI primitives (mesma linguagem das outras telas de IA) ----------
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{children}</label>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/40 ${props.className ?? ""}`} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/40 ${props.className ?? ""}`} />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/40">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Toggle({ checked, onChange, disabled, hint }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; hint?: string }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" disabled={disabled} onClick={() => onChange?.(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-[#F88A2B]" : "bg-slate-300"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
}
function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-slate-700">{label}</p>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
function NumberField({ value, onChange, min, max, step = 0.05, className = "" }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; className?: string }) {
  return (
    <Input type="number" min={min} max={max} step={step} value={value}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isNaN(n)) return;
        onChange(Math.min(max, Math.max(min, n)));
      }} className={`w-24 text-right ${className}`} />
  );
}

// ---------- Página ----------
export default function PlatformRecommendationEngineConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [config, setConfig] = useState<Cfg | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [tab, setTab] = useState<TabId>("engine");
  const [changeNote, setChangeNote] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("ai_prompt_configs").select("*").eq("key", "recommendation_engine").maybeSingle();
    if (error || !data) { toast.error("Falha ao carregar Motor de Recomendação"); setLoading(false); return; }
    setConfig(data as unknown as Cfg);
    const { data: v } = await supabase.from("ai_prompt_versions")
      .select("id, version, change_note, created_at, snapshot")
      .eq("prompt_config_id", (data as any).id).order("version", { ascending: false }).limit(50);
    setVersions((v ?? []) as VersionRow[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function validate(): string | null {
    if (!config) return "Configuração não carregada.";
    const t = config.tone_config;
    const m = config.model_config;
    if (t.top_n < 5 || t.top_n > 50) return "Top-N precisa estar entre 5 e 50.";
    if (t.min_score < 0 || t.min_score > 1) return "Score mínimo entre 0 e 1.";
    if (t.novelty_half_life_days < 1 || t.novelty_half_life_days > 90) return "Meia-vida de novidade entre 1 e 90 dias.";
    if (t.time_available_minutes < 5 || t.time_available_minutes > 240) return "Tempo disponível entre 5 e 240 minutos.";
    if (t.diversity.max_per_format < 1 || t.diversity.max_per_category < 1) return "Diversidade precisa ser ≥ 1.";
    if ((m.categories ?? []).filter((c) => c.active).length === 0) return "Ao menos uma categoria precisa estar ativa.";
    if ((m.formats ?? []).filter((c) => c.active).length === 0) return "Ao menos um formato precisa estar ativo.";
    if (m.temperature < 0 || m.temperature > 1) return "Temperatura entre 0 e 1.";
    if (m.max_tokens < 512 || m.max_tokens > 12000) return "Máx. tokens entre 512 e 12000.";
    // Guardrail: penalidades absolutas continuam 1.0
    if ((t.penalties.archived_penalty ?? 0) < 1 || (t.penalties.draft_penalty ?? 0) < 1 || (t.penalties.premium_without_license_penalty ?? 0) < 1)
      return "Penalidades para arquivado, rascunho e premium sem licença precisam permanecer em 1.0.";
    return null;
  }

  async function saveDraft() {
    if (!config) return;
    const err = validate(); if (err) { toast.error(err); return; }
    setSaving(true);
    const { error } = await supabase.from("ai_prompt_configs").update({
      system_instructions: config.system_instructions,
      tone_config: config.tone_config as any,
      output_structure: config.output_structure as any,
      model_config: config.model_config as any,
      status: "draft",
    }).eq("id", config.id);
    setSaving(false);
    if (error) { toast.error("Falha ao salvar rascunho"); return; }
    toast.success("Rascunho salvo");
    void load();
  }

  async function publish() {
    if (!config) return;
    const err = validate(); if (err) { toast.error(err); return; }
    setPublishing(true);
    const nextVersion = config.version + 1;
    const { error: upErr } = await supabase.from("ai_prompt_configs").update({
      system_instructions: config.system_instructions,
      tone_config: config.tone_config as any,
      output_structure: config.output_structure as any,
      model_config: config.model_config as any,
      version: nextVersion, status: "published", published_at: new Date().toISOString(),
    }).eq("id", config.id);
    if (upErr) { setPublishing(false); toast.error("Falha ao publicar"); return; }
    const { data: fresh } = await supabase.from("ai_prompt_configs").select("*").eq("id", config.id).maybeSingle();
    await supabase.from("ai_prompt_versions").insert({
      prompt_config_id: config.id, version: nextVersion, snapshot: fresh as any,
      change_note: changeNote || "Publicação de nova versão.",
    });
    try {
      const { data: userRes } = await supabase.auth.getUser();
      await supabase.from("platform_audit_logs").insert({
        actor_user_id: userRes.user?.id ?? null,
        action: "ai_prompt_published", entity_type: "ai_prompt_configs", entity_id: config.id,
        metadata: { key: "recommendation_engine", version: nextVersion, note: changeNote || null } as any,
      });
    } catch { /* auditoria não bloqueia */ }
    setPublishing(false); setChangeNote("");
    toast.success(`Versão ${nextVersion} publicada`);
    void load();
  }

  if (loading || !config) {
    return <PlatformAdminLayout><div className="text-sm text-slate-500">Carregando…</div></PlatformAdminLayout>;
  }

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#F88A2B] font-semibold">Inteligência Artificial</p>
            <h1 className="text-3xl font-bold mt-1 flex items-center gap-3"><Wand2 className="w-7 h-7 text-[#F88A2B]" /> Motor de Recomendação</h1>
            <p className="text-sm text-slate-500 mt-1">Configure pesos, boosts, penalidades, categorias, formatos e ranking do cérebro que decide o que recomendar.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Versão publicada</p>
              <p className="text-lg font-bold text-slate-800">v{config.version}
                <span className={`ml-2 inline-block text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold ${config.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{config.status}</span>
              </p>
            </div>
            <button onClick={saveDraft} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Salvando…" : "Salvar rascunho"}
            </button>
            <button onClick={publish} disabled={publishing} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-semibold hover:brightness-105 disabled:opacity-50">
              <Send className="w-4 h-4" /> {publishing ? "Publicando…" : "Publicar versão"}
            </button>
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Regras invioláveis do motor</h2>
            <ShieldCheck className="w-4 h-4 text-amber-600 ml-1" />
          </div>
          <ul className="grid md:grid-cols-2 gap-1.5 text-sm text-amber-900/90">
            {(config.guardrails ?? []).map((g, i) => <li key={i} className="flex gap-2"><span className="text-amber-600">•</span>{g}</li>)}
          </ul>
          <p className="mt-3 text-xs text-amber-700">Estas regras são aplicadas no backend e não podem ser removidas.</p>
        </Card>

        <div className="border-b border-slate-200 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t.id ? "border-[#F88A2B] text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "engine" && <EngineTab config={config} setConfig={setConfig} />}
        {tab === "weights" && <WeightsTab config={config} setConfig={setConfig} />}
        {tab === "categories" && <CategoriesTab config={config} setConfig={setConfig} />}
        {tab === "formats" && <FormatsTab config={config} setConfig={setConfig} />}
        {tab === "ranking" && <RankingTab config={config} setConfig={setConfig} />}
        {tab === "model" && <ModelTab config={config} setConfig={setConfig} />}
        {tab === "test" && <TestTab />}
        {tab === "edit_ai" && <EditByAITab config={config} setConfig={setConfig} />}
        {tab === "history" && <HistoryTab versions={versions} currentVersion={config.version} setConfig={setConfig} />}

        {(tab !== "test" && tab !== "history" && tab !== "edit_ai") && (
        <Card>
          <Label>Nota da alteração (opcional)</Label>
          <Input value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Ex.: mais peso em liderança e diversidade máxima por formato = 4." />
          <p className="mt-2 text-xs text-slate-500">A nota é registrada junto ao snapshot ao publicar uma nova versão.</p>
        </Card>
        )}
      </div>
    </PlatformAdminLayout>
  );
}

// ---------- Motor ----------
function EngineTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const t = config.tone_config;
  const upd = (patch: Partial<ToneCfg>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, ...patch } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Parâmetros gerais</h3>
        <div className="space-y-1">
          <Row label="Tempo disponível padrão (min)" hint="Usado para priorizar conteúdos que caibam no tempo do colaborador.">
            <NumberField value={t.time_available_minutes} min={5} max={240} step={5} onChange={(v) => upd({ time_available_minutes: v })} />
          </Row>
          <Row label="Meia-vida de novidade (dias)" hint="Quanto tempo um conteúdo ainda é considerado 'novo'.">
            <NumberField value={t.novelty_half_life_days} min={1} max={90} step={1} onChange={(v) => upd({ novelty_half_life_days: v })} />
          </Row>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Explicação por item</h3>
        <div className="space-y-4">
          <div><Label>Estilo da explicação</Label>
            <Select value={t.explanation.style} onChange={(v) => upd({ explanation: { ...t.explanation, style: v } })} options={STYLE_OPTS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tamanho máx. (chars)</Label>
              <Input type="number" min={80} max={400} value={t.explanation.max_length}
                onChange={(e) => upd({ explanation: { ...t.explanation, max_length: Math.min(400, Math.max(80, Number(e.target.value) || 220)) } })} />
            </div>
            <div className="flex items-end justify-between border border-slate-200 rounded-lg px-3 py-2">
              <span className="text-sm text-slate-700">Incluir sinais</span>
              <Toggle checked={t.explanation.include_signals} onChange={(v) => upd({ explanation: { ...t.explanation, include_signals: v } })} />
            </div>
          </div>
        </div>
      </Card>
      <Card className="md:col-span-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F88A2B]" /> Instruções do motor (usadas pela IA no ajuste de pesos)
        </h3>
        <Textarea rows={7} value={config.system_instructions}
          onChange={(e) => setConfig((c) => c ? { ...c, system_instructions: e.target.value } : c)} />
        <p className="mt-2 text-xs text-slate-500">A recomendação diária é feita por ranking rápido (&lt;300ms). A IA só ajusta pesos e explicações.</p>
      </Card>
    </div>
  );
}

// ---------- Pesos ----------
function WeightsTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const t = config.tone_config;
  const upd = (patch: Partial<ToneCfg>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, ...patch } } : c);
  const updDim = (k: string, v: number) => upd({ dimension_weights: { ...t.dimension_weights, [k]: v } });
  const updFmt = (k: string, v: number) => upd({ format_weights: { ...t.format_weights, [k]: v } });
  const updBoost = (k: string, v: number) => upd({ boosts: { ...t.boosts, [k]: v } });
  const updPen = (k: string, v: number) => upd({ penalties: { ...t.penalties, [k]: v } });
  const lockedPenalty = (k: string) => k === "archived_penalty" || k === "draft_penalty" || k === "premium_without_license_penalty";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Pesos por dimensão do perfil</h3>
        <div className="space-y-1">
          {DIMENSIONS.map((d) => (
            <Row key={d.key} label={d.label} hint="0 = ignora, 1 = padrão, 2 = dobrado.">
              <NumberField value={t.dimension_weights[d.key] ?? 1} min={0} max={2} step={0.05} onChange={(v) => updDim(d.key, v)} />
            </Row>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Pesos por formato</h3>
        <div className="space-y-1">
          {(config.model_config.formats ?? []).map((f) => (
            <Row key={f.key} label={f.label} hint="Aplica-se ao formato do conteúdo.">
              <NumberField value={t.format_weights[f.key] ?? 1} min={0} max={2} step={0.05} onChange={(v) => updFmt(f.key, v)} />
            </Row>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Boosts</h3>
        <div className="space-y-1">
          {BOOSTS.map((b) => (
            <Row key={b.key} label={b.label} hint={b.hint}>
              <NumberField value={t.boosts[b.key] ?? 0} min={0} max={1} step={0.05} onChange={(v) => updBoost(b.key, v)} />
            </Row>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Penalidades</h3>
        <div className="space-y-1">
          {PENALTIES.map((p) => (
            <Row key={p.key} label={p.label} hint={p.hint + (lockedPenalty(p.key) ? " Bloqueado em 1.0." : "")}>
              {p.kind === "days" ? (
                <NumberField value={t.penalties[p.key] ?? 0} min={0} max={365} step={1} onChange={(v) => updPen(p.key, v)} />
              ) : (
                <NumberField value={t.penalties[p.key] ?? 0} min={0} max={1} step={0.05} onChange={(v) => updPen(p.key, v)} />
              )}
            </Row>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-amber-700">Regra inviolável: arquivado, rascunho e premium sem licença permanecem em 1.0.</p>
      </Card>
    </div>
  );
}

// ---------- Categorias / Formatos ----------
function EditableList({ items, onChange, kindLabel }: { items: CatFmt[]; onChange: (v: CatFmt[]) => void; kindLabel: string }) {
  const upd = (i: number, patch: Partial<CatFmt>) => { const next = [...items]; next[i] = { ...next[i], ...patch }; onChange(next); };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { key: `${kindLabel}_${items.length + 1}`, label: `Novo ${kindLabel}`, active: true }]);
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={`${it.key}-${i}`} className="grid grid-cols-12 gap-2 items-center border border-slate-200 rounded-lg p-2">
          <input value={it.key} onChange={(e) => upd(i, { key: e.target.value.trim() })}
            className="col-span-4 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-mono text-slate-700" />
          <input value={it.label} onChange={(e) => upd(i, { label: e.target.value })}
            className="col-span-6 rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800" />
          <div className="col-span-1 flex justify-center"><Toggle checked={it.active} onChange={(v) => upd(i, { active: v })} /></div>
          <button onClick={() => remove(i)} className="col-span-1 inline-flex justify-center text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button onClick={add} className="inline-flex items-center gap-2 text-sm font-semibold text-[#F88A2B] hover:brightness-110">
        <Plus className="w-4 h-4" /> Adicionar {kindLabel}
      </button>
    </div>
  );
}
function CategoriesTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const list = config.model_config.categories ?? [];
  return (
    <Card>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Categorias consideradas pelo motor</h3>
      <EditableList items={list} kindLabel="categoria"
        onChange={(v) => setConfig((c) => c ? { ...c, model_config: { ...c.model_config, categories: v } } : c)} />
      <p className="mt-3 text-xs text-slate-500">Somente categorias ativas entram no ranking. Mantenha ao menos uma ativa.</p>
    </Card>
  );
}
function FormatsTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const list = config.model_config.formats ?? [];
  return (
    <Card>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Formatos considerados pelo motor</h3>
      <EditableList items={list} kindLabel="formato"
        onChange={(v) => setConfig((c) => c ? { ...c, model_config: { ...c.model_config, formats: v } } : c)} />
      <p className="mt-3 text-xs text-slate-500">Chaves suportadas pelo backend: book, video, podcast, course, track, exercise, reflection, ritual, message.</p>
    </Card>
  );
}

// ---------- Ranking ----------
function RankingTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const t = config.tone_config;
  const upd = (patch: Partial<ToneCfg>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, ...patch } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Limites do ranking</h3>
        <div className="space-y-1">
          <Row label="Top-N recomendações" hint="Quantidade de itens retornados por chamada.">
            <NumberField value={t.top_n} min={5} max={50} step={1} onChange={(v) => upd({ top_n: v })} />
          </Row>
          <Row label="Score mínimo" hint="Itens abaixo desse score são descartados.">
            <NumberField value={t.min_score} min={0} max={1} step={0.01} onChange={(v) => upd({ min_score: v })} />
          </Row>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Diversidade</h3>
        <div className="space-y-1">
          <Row label="Máx. por formato" hint="Evita saturar recomendações de um único formato.">
            <NumberField value={t.diversity.max_per_format} min={1} max={20} step={1}
              onChange={(v) => upd({ diversity: { ...t.diversity, max_per_format: v } })} />
          </Row>
          <Row label="Máx. por categoria" hint="Evita saturar recomendações de uma única categoria.">
            <NumberField value={t.diversity.max_per_category} min={1} max={20} step={1}
              onChange={(v) => upd({ diversity: { ...t.diversity, max_per_category: v } })} />
          </Row>
        </div>
      </Card>
      <Card className="md:col-span-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Blocos do payload de saída</h3>
        <div className="space-y-1">
          {(config.output_structure ?? []).map((b, i) => (
            <Row key={b.key} label={`${b.title}${b.required ? " (obrigatório)" : ""}`} hint={`chave: ${b.key}`}>
              <Toggle checked={b.active} disabled={b.required} onChange={(v) => {
                const next = [...config.output_structure]; next[i] = { ...b, active: v };
                setConfig((c) => c ? { ...c, output_structure: next } : c);
              }} />
            </Row>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---------- Modelo ----------
function ModelTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const m = config.model_config;
  const upd = (patch: Partial<ModelCfg>) => setConfig((c) => c ? { ...c, model_config: { ...c.model_config, ...patch } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Modelos</h3>
        <div className="space-y-4">
          <div><Label>Modelo principal</Label><Select value={m.primary_model} onChange={(v) => upd({ primary_model: v })} options={MODEL_OPTS} /></div>
          <div><Label>Modelo de fallback</Label><Select value={m.fallback_model} onChange={(v) => upd({ fallback_model: v })} options={MODEL_OPTS} /></div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Limites</h3>
        <div className="space-y-1">
          <Row label="Temperatura"><NumberField value={m.temperature} min={0} max={1} step={0.05} onChange={(v) => upd({ temperature: v })} /></Row>
          <Row label="Máx. tokens"><NumberField value={m.max_tokens} min={512} max={12000} step={128} onChange={(v) => upd({ max_tokens: v })} /></Row>
          <Row label="Timeout (s)"><NumberField value={m.timeout_seconds} min={5} max={180} step={1} onChange={(v) => upd({ timeout_seconds: v })} /></Row>
          <Row label="Retentativas JSON"><NumberField value={m.json_retries} min={0} max={3} step={1} onChange={(v) => upd({ json_retries: v })} /></Row>
          <Row label="Streaming"><Toggle checked={m.streaming} onChange={(v) => upd({ streaming: v })} /></Row>
        </div>
      </Card>
    </div>
  );
}