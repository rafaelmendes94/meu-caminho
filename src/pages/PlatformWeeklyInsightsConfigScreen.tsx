import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import {
  Lock, Save, Send, Plus, Trash2, ArrowUp, ArrowDown, ShieldCheck, CalendarClock,
  MessageSquare, ListChecks, CalendarRange, Target, Cpu, FlaskConical, History,
  Building2, Play, Coins, Timer, Hash, Sparkles, Wand2, GitCompare, RotateCcw, Check,
} from "lucide-react";

type Period = {
  week_start: "monday" | "sunday";
  main_window: "7_days" | "calendar_week";
  compare_previous_week: boolean;
  compare_4w_average: boolean;
  compare_12w_average: boolean;
  use_org_timezone: boolean;
  require_comparable_samples: boolean;
};
type Signals = {
  severity_labels: string[];
  require_evidence: boolean;
  require_deadline: boolean;
  require_indicator: boolean;
  prefer_low_effort_high_impact: boolean;
  extra_instructions: string;
};
type ToneConfig = {
  tone: string; detail: string; formality: string;
  max_key_changes: number; max_positive_evolutions: number; max_attention_signals: number;
  max_priority_actions: number; max_watchlist: number;
  include_hypotheses: boolean; include_positive_evolutions: boolean;
  include_confidence: boolean; include_limitations: boolean;
  extra_instructions: string;
  period: Period;
  signals: Signals;
};
type StructureBlock = { key: string; title: string; description?: string; active: boolean; order: number; required?: boolean };
type ModelConfig = {
  primary_model: string; fallback_model: string;
  temperature: number; max_tokens: number; timeout_seconds: number; json_retries: number; streaming: boolean;
  max_cost_per_generation_usd?: number;
};
type WiConfig = {
  id: string; key: string; name: string; description: string | null;
  system_instructions: string;
  tone_config: ToneConfig;
  output_structure: StructureBlock[];
  guardrails: string[];
  model_config: ModelConfig;
  version: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};
type VersionRow = { id: string; version: number; change_note: string | null; created_at: string; snapshot?: any };

const TABS = [
  { id: "behavior", label: "Comportamento", icon: MessageSquare },
  { id: "period", label: "Período e Comparações", icon: CalendarRange },
  { id: "structure", label: "Estrutura", icon: ListChecks },
  { id: "signals", label: "Sinais e Prioridades", icon: Target },
  { id: "model", label: "Modelo e Limites", icon: Cpu },
  { id: "test", label: "Testar Geração", icon: FlaskConical },
  { id: "ai_edit", label: "Editar por IA", icon: Wand2 },
  { id: "history", label: "Histórico", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

const TONE_OPTS = [
  { value: "executivo", label: "Executivo" },
  { value: "analitico", label: "Analítico" },
  { value: "consultivo", label: "Consultivo" },
  { value: "direto", label: "Direto" },
];
const DETAIL_OPTS = [
  { value: "resumido", label: "Resumido" },
  { value: "equilibrado", label: "Equilibrado" },
  { value: "detalhado", label: "Detalhado" },
];
const FORMALITY_OPTS = [
  { value: "baixa", label: "Baixa" }, { value: "media", label: "Média" }, { value: "alta", label: "Alta" },
];
const MODEL_OPTS = [
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "openai/gpt-5.5", label: "GPT-5.5" },
];
const REQUIRED_BLOCKS = new Set(["title","executive_summary","key_changes","confidence","limitations"]);

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
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700">{label}</span>{children}
    </div>
  );
}

export default function PlatformWeeklyInsightsConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [config, setConfig] = useState<WiConfig | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [tab, setTab] = useState<TabId>("behavior");
  const [changeNote, setChangeNote] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("ai_prompt_configs").select("*").eq("key", "weekly_insights").maybeSingle();
    if (error || !data) { toast.error("Falha ao carregar Insights Semanais"); setLoading(false); return; }
    setConfig(data as unknown as WiConfig);
    const { data: v } = await supabase.from("ai_prompt_versions")
      .select("id, version, change_note, created_at, snapshot")
      .eq("prompt_config_id", (data as any).id).order("version", { ascending: false }).limit(50);
    setVersions((v ?? []) as VersionRow[]);
    setLoading(false);
  }
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  function validate(): string | null {
    if (!config) return "Configuração não carregada.";
    const t = config.tone_config;
    if (!t.include_confidence || !t.include_limitations) return "Confiança e limitações são obrigatórias.";
    for (const k of ["max_key_changes","max_positive_evolutions","max_attention_signals","max_priority_actions","max_watchlist"] as const) {
      const v = Number((t as any)[k]);
      if (!Number.isFinite(v) || v < 1 || v > 10) return `${k} deve estar entre 1 e 10.`;
    }
    for (const k of REQUIRED_BLOCKS) {
      const b = config.output_structure.find((x) => x.key === k);
      if (!b || !b.active) return `Bloco obrigatório "${k}" precisa estar ativo.`;
    }
    if (!t.period.use_org_timezone) return "Usar timezone da empresa é obrigatório.";
    if (!t.period.require_comparable_samples) return "Exigir amostras comparáveis é obrigatório.";
    const m = config.model_config;
    if (m.temperature < 0 || m.temperature > 1) return "Temperatura entre 0 e 1.";
    if (m.max_tokens < 512 || m.max_tokens > 12000) return "Máx. tokens entre 512 e 12000.";
    if (m.timeout_seconds < 10 || m.timeout_seconds > 240) return "Timeout entre 10 e 240s.";
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
        action: "ai_prompt_published",
        entity_type: "ai_prompt_configs",
        entity_id: config.id,
        metadata: { key: "weekly_insights", version: nextVersion, note: changeNote || null } as any,
      });
    } catch { /* auditoria não é bloqueadora */ }
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
            <h1 className="text-3xl font-bold mt-1 flex items-center gap-3"><CalendarClock className="w-7 h-7 text-[#F88A2B]" /> Insights Semanais</h1>
            <p className="text-sm text-slate-500 mt-1">Configure comportamento, janela, comparações, estrutura, sinais e limites do relatório semanal.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Versão publicada</p>
              <p className="text-lg font-bold text-slate-800">v{config.version}
                <span className={`ml-2 inline-block text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold ${config.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {config.status}
                </span>
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
            <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Regras obrigatórias de segurança</h2>
            <ShieldCheck className="w-4 h-4 text-amber-600 ml-1" />
          </div>
          <ul className="grid md:grid-cols-2 gap-1.5 text-sm text-amber-900/90">
            {config.guardrails.map((g, i) => <li key={i} className="flex gap-2"><span className="text-amber-600">•</span>{g}</li>)}
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

        {tab === "behavior" && <BehaviorTab config={config} setConfig={setConfig} />}
        {tab === "period" && <PeriodTab config={config} setConfig={setConfig} />}
        {tab === "structure" && <StructureTab config={config} setConfig={setConfig} />}
        {tab === "signals" && <SignalsTab config={config} setConfig={setConfig} />}
        {tab === "model" && <ModelTab config={config} setConfig={setConfig} />}
        {tab === "test" && <TestTab />}
        {tab === "ai_edit" && <AiEditTab config={config} setConfig={setConfig} />}
        {tab === "history" && <HistoryTab versions={versions} currentVersion={config.version} setConfig={setConfig} />}

        {(tab !== "test" && tab !== "history" && tab !== "ai_edit") && (
          <Card>
            <Label>Nota da alteração (opcional)</Label>
            <Input value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Ex.: Ajustada janela para 7 dias e reduzido máximo de ações para 3." />
            <p className="mt-2 text-xs text-slate-500">A nota é registrada junto ao snapshot ao publicar.</p>
          </Card>
        )}
      </div>
    </PlatformAdminLayout>
  );
}

function BehaviorTab({ config, setConfig }: { config: WiConfig; setConfig: React.Dispatch<React.SetStateAction<WiConfig | null>> }) {
  const t = config.tone_config;
  const upd = (patch: Partial<ToneConfig>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, ...patch } } : c);
  const numField = (k: keyof ToneConfig, label: string) => (
    <div>
      <Label>{label}</Label>
      <Input type="number" min={1} max={10} value={t[k] as number}
        onChange={(e) => upd({ [k]: Math.max(1, Math.min(10, Number(e.target.value) || 1)) } as any)} />
    </div>
  );
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Tom e detalhe</h3>
        <div className="space-y-4">
          <div><Label>Tom</Label><Select value={t.tone} onChange={(v) => upd({ tone: v })} options={TONE_OPTS} /></div>
          <div><Label>Nível de detalhe</Label><Select value={t.detail} onChange={(v) => upd({ detail: v })} options={DETAIL_OPTS} /></div>
          <div><Label>Formalidade</Label><Select value={t.formality} onChange={(v) => upd({ formality: v })} options={FORMALITY_OPTS} /></div>
          <div className="grid grid-cols-2 gap-3">
            {numField("max_key_changes", "Máx. mudanças")}
            {numField("max_positive_evolutions", "Máx. evoluções")}
            {numField("max_attention_signals", "Máx. sinais")}
            {numField("max_priority_actions", "Máx. ações")}
            {numField("max_watchlist", "Máx. watchlist")}
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Composição da resposta</h3>
        <div className="space-y-1">
          <Row label="Incluir hipóteses"><Toggle checked={t.include_hypotheses} onChange={(v) => upd({ include_hypotheses: v })} /></Row>
          <Row label="Incluir evoluções positivas"><Toggle checked={t.include_positive_evolutions} onChange={(v) => upd({ include_positive_evolutions: v })} /></Row>
          <Row label="Incluir confiança"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Incluir limitações"><Toggle checked disabled hint="Obrigatório" /></Row>
        </div>
      </Card>
      <Card className="md:col-span-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Instruções e prompt base</h3>
        <div className="space-y-4">
          <div><Label>Instruções adicionais (opcional)</Label><Textarea rows={4} value={t.extra_instructions} onChange={(e) => upd({ extra_instructions: e.target.value })} placeholder="Ex.: Enfatize adesão a rituais e planos ativos." /></div>
          <div><Label>Prompt base do analista</Label><Textarea rows={7} value={config.system_instructions} onChange={(e) => setConfig((c) => c ? { ...c, system_instructions: e.target.value } : c)} /></div>
        </div>
      </Card>
    </div>
  );
}

function PeriodTab({ config, setConfig }: { config: WiConfig; setConfig: React.Dispatch<React.SetStateAction<WiConfig | null>> }) {
  const p = config.tone_config.period;
  const upd = (patch: Partial<Period>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, period: { ...c.tone_config.period, ...patch } } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Janela</h3>
        <div className="space-y-4">
          <div><Label>Início da semana</Label><Select value={p.week_start} onChange={(v) => upd({ week_start: v as any })}
            options={[{ value: "monday", label: "Segunda" }, { value: "sunday", label: "Domingo" }]} /></div>
          <div><Label>Período principal</Label><Select value={p.main_window} onChange={(v) => upd({ main_window: v as any })}
            options={[{ value: "7_days", label: "7 dias" }, { value: "calendar_week", label: "Semana calendário" }]} /></div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Comparações</h3>
        <div className="space-y-1">
          <Row label="Comparar com semana anterior"><Toggle checked={p.compare_previous_week} onChange={(v) => upd({ compare_previous_week: v })} /></Row>
          <Row label="Comparar com média de 4 semanas"><Toggle checked={p.compare_4w_average} onChange={(v) => upd({ compare_4w_average: v })} /></Row>
          <Row label="Comparar com média de 12 semanas"><Toggle checked={p.compare_12w_average} onChange={(v) => upd({ compare_12w_average: v })} /></Row>
          <Row label="Usar timezone da empresa"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir amostras comparáveis"><Toggle checked disabled hint="Obrigatório" /></Row>
        </div>
      </Card>
    </div>
  );
}

function StructureTab({ config, setConfig }: { config: WiConfig; setConfig: React.Dispatch<React.SetStateAction<WiConfig | null>> }) {
  const list = [...config.output_structure].sort((a, b) => a.order - b.order);
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...list]; const j = idx + dir; if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    next.forEach((d, i) => (d.order = i + 1));
    setConfig((c) => c ? { ...c, output_structure: next } : c);
  };
  const upd = (idx: number, patch: Partial<StructureBlock>) => {
    const next = [...list]; next[idx] = { ...next[idx], ...patch };
    setConfig((c) => c ? { ...c, output_structure: next } : c);
  };
  return (
    <Card>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Blocos do insight</h3>
      <ul className="space-y-2">
        {list.map((b, i) => {
          const required = REQUIRED_BLOCKS.has(b.key) || b.required;
          return (
            <li key={b.key} className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <button onClick={() => move(i, -1)} className="p-1 rounded hover:bg-slate-100"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => move(i, 1)} className="p-1 rounded hover:bg-slate-100"><ArrowDown className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-slate-800">{b.title}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wide">{b.key}</span>
                  {required && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">Obrigatório</span>}
                </div>
                {b.description && <p className="text-xs text-slate-500 mt-1">{b.description}</p>}
              </div>
              <Toggle checked={b.active} onChange={(v) => { if (!v && required) { toast.error("Bloco obrigatório"); return; } upd(i, { active: v }); }} disabled={required} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function SignalsTab({ config, setConfig }: { config: WiConfig; setConfig: React.Dispatch<React.SetStateAction<WiConfig | null>> }) {
  const s = config.tone_config.signals;
  const upd = (patch: Partial<Signals>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, signals: { ...c.tone_config.signals, ...patch } } } : c);
  const addLabel = () => upd({ severity_labels: [...s.severity_labels, "nova"] });
  const removeLabel = (i: number) => upd({ severity_labels: s.severity_labels.filter((_, idx) => idx !== i) });
  const editLabel = (i: number, v: string) => upd({ severity_labels: s.severity_labels.map((x, idx) => idx === i ? v : x) });
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Labels de severidade</h3>
        <ul className="space-y-2">
          {s.severity_labels.map((label, i) => (
            <li key={i} className="flex items-center gap-2">
              <Input value={label} onChange={(e) => editLabel(i, e.target.value)} />
              <button onClick={() => removeLabel(i)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
        <button onClick={addLabel} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"><Plus className="w-3.5 h-3.5" /> Adicionar label</button>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Requisitos e prioridades</h3>
        <div className="space-y-1">
          <Row label="Exigir evidência"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir prazo"><Toggle checked={s.require_deadline} onChange={(v) => upd({ require_deadline: v })} /></Row>
          <Row label="Exigir indicador de sucesso"><Toggle checked={s.require_indicator} onChange={(v) => upd({ require_indicator: v })} /></Row>
          <Row label="Priorizar baixo esforço / alto impacto"><Toggle checked={s.prefer_low_effort_high_impact} onChange={(v) => upd({ prefer_low_effort_high_impact: v })} /></Row>
        </div>
        <div className="mt-4"><Label>Instruções adicionais</Label>
          <Textarea rows={3} value={s.extra_instructions} onChange={(e) => upd({ extra_instructions: e.target.value })} placeholder="Ex.: Sempre relacionar sinais críticos a alertas abertos." />
        </div>
      </Card>
    </div>
  );
}

function ModelTab({ config, setConfig }: { config: WiConfig; setConfig: React.Dispatch<React.SetStateAction<WiConfig | null>> }) {
  const m = config.model_config;
  const upd = (patch: Partial<ModelConfig>) => setConfig((c) => c ? { ...c, model_config: { ...c.model_config, ...patch } } : c);
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
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Temperatura (0–1)</Label><Input type="number" step={0.1} min={0} max={1} value={m.temperature} onChange={(e) => upd({ temperature: Number(e.target.value) })} /></div>
          <div><Label>Máx. tokens</Label><Input type="number" min={512} max={12000} step={128} value={m.max_tokens} onChange={(e) => upd({ max_tokens: Number(e.target.value) })} /></div>
          <div><Label>Timeout (s)</Label><Input type="number" min={10} max={240} value={m.timeout_seconds} onChange={(e) => upd({ timeout_seconds: Number(e.target.value) })} /></div>
          <div><Label>Tentativas correção JSON</Label><Input type="number" min={0} max={2} value={m.json_retries} onChange={(e) => upd({ json_retries: Number(e.target.value) })} /></div>
          <div><Label>Custo máx. por geração (USD)</Label><Input type="number" step={0.05} min={0} value={m.max_cost_per_generation_usd ?? 0} onChange={(e) => upd({ max_cost_per_generation_usd: Number(e.target.value) })} /></div>
          <div className="col-span-2"><Row label="Streaming (quando suportado)"><Toggle checked={m.streaming} onChange={(v) => upd({ streaming: v })} /></Row></div>
        </div>
        <p className="mt-3 text-xs text-slate-500">A chave da API nunca é exposta e permanece no backend.</p>
      </Card>
    </div>
  );
}

function TestTab() {
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [orgId, setOrgId] = useState<string>("");
  const [source, setSource] = useState<"draft" | "published">("draft");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("organizations").select("id, name").order("name");
      if (error) { toast.error("Falha ao carregar empresas"); return; }
      setOrgs((data ?? []) as any);
      if (data && data.length && !orgId) setOrgId((data[0] as any).id);
    })();
    // eslint-disable-next-line
  }, []);

  async function runTest() {
    if (!orgId) { toast.error("Selecione uma empresa"); return; }
    setRunning(true); setError(null); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekly-insights", {
        body: { test_mode: true, organization_id: orgId, config_source: source, force: true },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data);
      toast.success("Geração de teste concluída");
    } catch (e: any) {
      const msg = e?.message ?? "Falha na geração";
      setError(msg);
      if (/rate_limited/i.test(msg)) toast.error("Limite temporário excedido. Tente novamente em instantes.");
      else if (/credits_exhausted/i.test(msg)) toast.error("Créditos de IA esgotados. Recarregue na área de billing.");
      else if (/forbidden/i.test(msg)) toast.error("Apenas Super Admin pode executar testes.");
      else toast.error("Falha no teste: " + msg);
    } finally { setRunning(false); }
  }

  const report = result?.report ?? null;
  const metrics = result?.metrics ?? null;

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#F88A2B]" /> Testar Geração
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Empresa</Label>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <Select value={orgId} onChange={setOrgId} options={orgs.map((o) => ({ value: o.id, label: o.name }))} />
            </div>
          </div>
          <div>
            <Label>Origem da configuração</Label>
            <Select value={source} onChange={(v) => setSource(v as any)}
              options={[{ value: "draft", label: "Rascunho atual" }, { value: "published", label: "Versão publicada" }]} />
          </div>
          <div className="flex items-end">
            <button onClick={runTest} disabled={running || !orgId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-semibold hover:brightness-105 disabled:opacity-50 w-full justify-center">
              <Play className="w-4 h-4" /> {running ? "Gerando…" : "Executar teste"}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Modo teste: nada é persistido em <code>weekly_insights</code>. Guardrails de agregação e k-anonimato continuam aplicados no backend.
        </p>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50/40">
          <p className="text-sm text-red-700 font-semibold">Falha na geração</p>
          <p className="text-xs text-red-600 mt-1 break-words">{error}</p>
        </Card>
      )}

      {metrics && (
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F88A2B]" /> Métricas da execução
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric icon={<Cpu className="w-4 h-4" />} label="Modelo" value={String(metrics.model ?? "-")} />
            <Metric icon={<Timer className="w-4 h-4" />} label="Latência" value={`${Math.round(Number(metrics.latency_ms ?? 0))} ms`} />
            <Metric icon={<Hash className="w-4 h-4" />} label="Tokens (in / out)" value={`${metrics.tokens_in ?? 0} / ${metrics.tokens_out ?? 0}`} />
            <Metric icon={<Coins className="w-4 h-4" />} label="Custo estimado" value={`US$ ${Number(metrics.estimated_cost_usd ?? 0).toFixed(6)}`} />
          </div>
          {metrics.fallback_used && (
            <p className="mt-3 text-xs text-amber-700">⚠ Fallback acionado — modelo secundário foi utilizado.</p>
          )}
        </Card>
      )}

      {report && (
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Preview do insight</h3>
          <ReportPreview report={report} />
          <details className="mt-6">
            <summary className="text-xs font-semibold text-slate-600 cursor-pointer hover:text-slate-900">Ver JSON completo</summary>
            <pre className="mt-2 text-[11px] bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96">{JSON.stringify(report, null, 2)}</pre>
          </details>
        </Card>
      )}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{icon}{label}</div>
      <p className="mt-1 text-sm font-bold text-slate-800 break-words">{value}</p>
    </div>
  );
}

function ReportPreview({ report }: { report: any }) {
  const sections: { title: string; content: React.ReactNode }[] = [];
  if (report.title) sections.push({ title: "Título", content: <p className="text-base font-bold text-slate-900">{String(report.title)}</p> });
  if (report.executive_summary) sections.push({ title: "Resumo executivo", content: <p className="text-sm text-slate-700 whitespace-pre-wrap">{String(report.executive_summary)}</p> });
  const arrayBlocks: [string, string][] = [
    ["key_changes", "Principais mudanças"],
    ["positive_evolutions", "Evoluções positivas"],
    ["attention_signals", "Sinais de atenção"],
    ["priority_actions", "Ações prioritárias"],
    ["watchlist", "Watchlist"],
    ["hypotheses", "Hipóteses"],
  ];
  for (const [k, label] of arrayBlocks) {
    const arr = report[k];
    if (Array.isArray(arr) && arr.length) {
      sections.push({
        title: label,
        content: (
          <ul className="space-y-2">
            {arr.map((item: any, i: number) => (
              <li key={i} className="text-sm text-slate-700 border-l-2 border-[#F88A2B]/60 pl-3">
                {typeof item === "string" ? item : (
                  <div className="space-y-0.5">
                    {item.title && <p className="font-semibold text-slate-800">{item.title}</p>}
                    {item.description && <p>{item.description}</p>}
                    {item.severity && <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 mr-1">{item.severity}</span>}
                    {item.evidence && <p className="text-xs text-slate-500 mt-0.5">Evidência: {String(item.evidence)}</p>}
                    {item.deadline && <p className="text-xs text-slate-500">Prazo: {String(item.deadline)}</p>}
                    {item.success_indicator && <p className="text-xs text-slate-500">Indicador: {String(item.success_indicator)}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ),
      });
    }
  }
  if (report.confidence) sections.push({ title: "Confiança", content: <p className="text-sm text-slate-700">{String(report.confidence)}</p> });
  if (report.limitations) sections.push({ title: "Limitações", content: <p className="text-sm text-slate-700 whitespace-pre-wrap">{String(report.limitations)}</p> });

  if (sections.length === 0) return <p className="text-sm text-slate-500">Resposta vazia.</p>;
  return (
    <div className="space-y-5">
      {sections.map((s, i) => (
        <div key={i}>
          <h4 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">{s.title}</h4>
          {s.content}
        </div>
      ))}
    </div>
  );
}
function HistoryPlaceholder({ versions, currentVersion }: { versions: VersionRow[]; currentVersion: number }) {
  const rows = useMemo(() => versions, [versions]);
  if (rows.length === 0) return <Card><p className="text-sm text-slate-500">Sem versões publicadas ainda.</p></Card>;
  return (
    <Card>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Histórico de versões</h3>
      <ul className="divide-y divide-slate-100">
        {rows.map((v) => (
          <li key={v.id} className="py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">v{v.version} {v.version === currentVersion && <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-wide">Atual</span>}</p>
              <p className="text-xs text-slate-500">{new Date(v.created_at).toLocaleString("pt-BR")}</p>
              {v.change_note && <p className="text-xs text-slate-600 mt-1">{v.change_note}</p>}
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">snapshot</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">Comparação A × B e restauro chegam na Sub-fase C.</p>
    </Card>
  );
}
