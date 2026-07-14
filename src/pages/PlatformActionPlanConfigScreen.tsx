import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import {
  Lock, Save, Send, Plus, Trash2, ArrowUp, ArrowDown, ShieldCheck, ListChecks,
  MessageSquare, Target, Cpu, FlaskConical, History, LineChart, Layers, Flag,
  Sparkles, RotateCcw, GitCompare,
} from "lucide-react";

type PrioItem = { key: string; label: string; description?: string };
type TasksCfg = {
  min: number; max: number;
  require_owner: boolean; require_relative_deadline: boolean; require_completion_criteria: boolean;
  allow_dependencies: boolean; allow_effort: boolean; allow_impact: boolean; allow_priority: boolean;
  granularity: string;
};
type MetricsCfg = {
  require_baseline: boolean; require_indicator: boolean; require_direction: boolean;
  require_comparison_window: boolean; default_impact_window_days: number;
  min_confidence: number; extra_instructions: string;
};
type Prio = { priorities: PrioItem[]; effort: PrioItem[]; impact: PrioItem[] };
type ToneConfig = {
  tone: string; detail: string;
  max_tasks: number; max_risks: number;
  require_deadline: boolean; require_owner: boolean;
  require_metrics: boolean; require_impact_measurement: boolean;
  prefer_low_effort_high_impact: boolean; extra_instructions: string;
  tasks: TasksCfg; metrics: MetricsCfg; prioritization: Prio;
};
type StructureBlock = { key: string; title: string; description?: string; active: boolean; order: number; required?: boolean };
type ModelConfig = {
  primary_model: string; fallback_model: string;
  temperature: number; max_tokens: number; timeout_seconds: number;
  json_retries: number; streaming: boolean; max_cost_per_generation_usd?: number;
};
type Cfg = {
  id: string; key: string; name: string; description: string | null;
  system_instructions: string;
  tone_config: ToneConfig;
  output_structure: StructureBlock[];
  guardrails: string[];
  model_config: ModelConfig;
  version: number; status: "draft" | "published" | "archived";
  published_at: string | null; updated_at: string;
};
type VersionRow = { id: string; version: number; change_note: string | null; created_at: string; snapshot?: any };

const REQUIRED_BLOCKS = new Set(["title","problem_statement","objective","due_date","success_metrics","tasks","impact_measurement"]);
const TABS = [
  { id: "behavior", label: "Comportamento", icon: MessageSquare },
  { id: "structure", label: "Estrutura", icon: Layers },
  { id: "tasks", label: "Tarefas", icon: ListChecks },
  { id: "metrics", label: "Métricas e Impacto", icon: LineChart },
  { id: "prio", label: "Priorização", icon: Flag },
  { id: "model", label: "Modelo e Limites", icon: Cpu },
  { id: "test", label: "Testar Geração", icon: FlaskConical },
  { id: "edit_ai", label: "Editar por IA", icon: Sparkles },
  { id: "history", label: "Histórico", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

const TONE_OPTS = [
  { value: "executivo", label: "Executivo" },
  { value: "pratico", label: "Prático" },
  { value: "estrategico", label: "Estratégico" },
  { value: "consultivo", label: "Consultivo" },
];
const DETAIL_OPTS = [
  { value: "resumido", label: "Resumido" },
  { value: "equilibrado", label: "Equilibrado" },
  { value: "detalhado", label: "Detalhado" },
];
const MODEL_OPTS = [
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
];
const GRANULARITY_OPTS = [
  { value: "estrategica", label: "Estratégica" },
  { value: "operacional", label: "Operacional" },
  { value: "detalhada", label: "Detalhada" },
];

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
  return <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0"><span className="text-sm text-slate-700">{label}</span>{children}</div>;
}

export default function PlatformActionPlanConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [config, setConfig] = useState<Cfg | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [tab, setTab] = useState<TabId>("behavior");
  const [changeNote, setChangeNote] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("ai_prompt_configs").select("*").eq("key", "action_plan").maybeSingle();
    if (error || !data) { toast.error("Falha ao carregar Planos de Ação"); setLoading(false); return; }
    setConfig(data as unknown as Cfg);
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
    if (!t.require_deadline || !t.require_owner || !t.require_metrics || !t.require_impact_measurement)
      return "Exigências obrigatórias (prazo, responsável, métricas e medição de impacto) não podem ser desativadas.";
    if (t.max_tasks < 3 || t.max_tasks > 15) return "Máx. tarefas entre 3 e 15.";
    if (t.max_risks < 1 || t.max_risks > 10) return "Máx. riscos entre 1 e 10.";
    if (t.tasks.min < 1 || t.tasks.min > t.tasks.max) return "Mín. tarefas inválido.";
    for (const k of REQUIRED_BLOCKS) {
      const b = config.output_structure.find((x) => x.key === k);
      if (!b || !b.active) return `Bloco obrigatório "${k}" precisa estar ativo.`;
    }
    if (t.prioritization.priorities.length === 0 || t.prioritization.effort.length === 0 || t.prioritization.impact.length === 0)
      return "Priorização/esforço/impacto não podem ficar vazios.";
    const m = config.model_config;
    if (m.temperature < 0 || m.temperature > 1) return "Temperatura entre 0 e 1.";
    if (m.max_tokens < 512 || m.max_tokens > 12000) return "Máx. tokens entre 512 e 12000.";
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
        metadata: { key: "action_plan", version: nextVersion, note: changeNote || null } as any,
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
            <h1 className="text-3xl font-bold mt-1 flex items-center gap-3"><ListChecks className="w-7 h-7 text-[#F88A2B]" /> Planos de Ação</h1>
            <p className="text-sm text-slate-500 mt-1">Configure comportamento, estrutura, tarefas, métricas, priorização e limites do gerador de planos.</p>
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
        {tab === "structure" && <StructureTab config={config} setConfig={setConfig} />}
        {tab === "tasks" && <TasksTab config={config} setConfig={setConfig} />}
        {tab === "metrics" && <MetricsTab config={config} setConfig={setConfig} />}
        {tab === "prio" && <PrioritizationTab config={config} setConfig={setConfig} />}
        {tab === "model" && <ModelTab config={config} setConfig={setConfig} />}
        {tab === "test" && <TestTab config={config} />}
        {tab === "edit_ai" && <EditByAITab config={config} setConfig={setConfig} />}
        {tab === "history" && <HistoryTab versions={versions} currentVersion={config.version} setConfig={setConfig} />}

        {(tab !== "test" && tab !== "history" && tab !== "edit_ai") && (
          <Card>
            <Label>Nota da alteração (opcional)</Label>
            <Input value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Ex.: Reduzido máximo de tarefas para 6 e reforçado critério de conclusão." />
            <p className="mt-2 text-xs text-slate-500">A nota é registrada junto ao snapshot ao publicar.</p>
          </Card>
        )}
      </div>
    </PlatformAdminLayout>
  );
}

function BehaviorTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const t = config.tone_config;
  const upd = (patch: Partial<ToneConfig>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, ...patch } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Tom e limites</h3>
        <div className="space-y-4">
          <div><Label>Tom</Label><Select value={t.tone} onChange={(v) => upd({ tone: v })} options={TONE_OPTS} /></div>
          <div><Label>Nível de detalhe</Label><Select value={t.detail} onChange={(v) => upd({ detail: v })} options={DETAIL_OPTS} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Máx. tarefas (3–15)</Label><Input type="number" min={3} max={15} value={t.max_tasks} onChange={(e) => upd({ max_tasks: Math.max(3, Math.min(15, Number(e.target.value) || 8)) })} /></div>
            <div><Label>Máx. riscos (1–10)</Label><Input type="number" min={1} max={10} value={t.max_risks} onChange={(e) => upd({ max_risks: Math.max(1, Math.min(10, Number(e.target.value) || 5)) })} /></div>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Exigências obrigatórias</h3>
        <div className="space-y-1">
          <Row label="Exigir prazo"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir responsável"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir métricas"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir medição de impacto"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Priorizar baixo esforço / alto impacto"><Toggle checked={t.prefer_low_effort_high_impact} onChange={(v) => upd({ prefer_low_effort_high_impact: v })} /></Row>
        </div>
      </Card>
      <Card className="md:col-span-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Instruções e prompt base</h3>
        <div className="space-y-4">
          <div><Label>Instruções adicionais</Label>
            <Textarea rows={4} value={t.extra_instructions} onChange={(e) => upd({ extra_instructions: e.target.value })} placeholder="Ex.: Sempre priorize planos que reforcem rituais existentes." />
          </div>
          <div><Label>Prompt base</Label>
            <Textarea rows={7} value={config.system_instructions} onChange={(e) => setConfig((c) => c ? { ...c, system_instructions: e.target.value } : c)} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function StructureTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
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
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Blocos do plano</h3>
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

function TasksTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const tk = config.tone_config.tasks;
  const upd = (patch: Partial<TasksCfg>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, tasks: { ...c.tone_config.tasks, ...patch } } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Quantidade e granularidade</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Mín. tarefas</Label><Input type="number" min={1} max={tk.max} value={tk.min} onChange={(e) => upd({ min: Math.max(1, Number(e.target.value) || 1) })} /></div>
          <div><Label>Máx. tarefas</Label><Input type="number" min={tk.min} max={15} value={tk.max} onChange={(e) => upd({ max: Math.max(tk.min, Math.min(15, Number(e.target.value) || tk.min)) })} /></div>
          <div className="col-span-2"><Label>Granularidade</Label><Select value={tk.granularity} onChange={(v) => upd({ granularity: v })} options={GRANULARITY_OPTS} /></div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Exigências por tarefa</h3>
        <div className="space-y-1">
          <Row label="Exigir responsável"><Toggle checked={tk.require_owner} onChange={(v) => upd({ require_owner: v })} /></Row>
          <Row label="Exigir prazo relativo"><Toggle checked={tk.require_relative_deadline} onChange={(v) => upd({ require_relative_deadline: v })} /></Row>
          <Row label="Exigir critério de conclusão"><Toggle checked={tk.require_completion_criteria} onChange={(v) => upd({ require_completion_criteria: v })} /></Row>
          <Row label="Permitir dependências"><Toggle checked={tk.allow_dependencies} onChange={(v) => upd({ allow_dependencies: v })} /></Row>
          <Row label="Permitir esforço"><Toggle checked={tk.allow_effort} onChange={(v) => upd({ allow_effort: v })} /></Row>
          <Row label="Permitir impacto"><Toggle checked={tk.allow_impact} onChange={(v) => upd({ allow_impact: v })} /></Row>
          <Row label="Permitir prioridade"><Toggle checked={tk.allow_priority} onChange={(v) => upd({ allow_priority: v })} /></Row>
        </div>
      </Card>
    </div>
  );
}

function MetricsTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const m = config.tone_config.metrics;
  const upd = (patch: Partial<MetricsCfg>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, metrics: { ...c.tone_config.metrics, ...patch } } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Exigências de medição</h3>
        <div className="space-y-1">
          <Row label="Exigir baseline"><Toggle checked={m.require_baseline} onChange={(v) => upd({ require_baseline: v })} /></Row>
          <Row label="Exigir indicador"><Toggle checked={m.require_indicator} onChange={(v) => upd({ require_indicator: v })} /></Row>
          <Row label="Exigir direção esperada"><Toggle checked={m.require_direction} onChange={(v) => upd({ require_direction: v })} /></Row>
          <Row label="Exigir janela de comparação"><Toggle checked={m.require_comparison_window} onChange={(v) => upd({ require_comparison_window: v })} /></Row>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Janela e confiança</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Janela padrão de impacto (dias)</Label><Input type="number" min={7} max={180} value={m.default_impact_window_days} onChange={(e) => upd({ default_impact_window_days: Math.max(7, Math.min(180, Number(e.target.value) || 30)) })} /></div>
          <div><Label>Confiança mínima (0–1)</Label><Input type="number" step={0.05} min={0} max={1} value={m.min_confidence} onChange={(e) => upd({ min_confidence: Math.max(0, Math.min(1, Number(e.target.value) || 0.55)) })} /></div>
        </div>
        <div className="mt-4"><Label>Instruções adicionais</Label>
          <Textarea rows={3} value={m.extra_instructions} onChange={(e) => upd({ extra_instructions: e.target.value })} placeholder="Ex.: Sempre relacione métricas ao Score Organizacional." />
        </div>
      </Card>
    </div>
  );
}

function PrioritizationTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const p = config.tone_config.prioritization;
  const updList = (bucket: keyof Prio, list: PrioItem[]) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, prioritization: { ...c.tone_config.prioritization, [bucket]: list } } } : c);
  const section = (bucket: keyof Prio, title: string) => {
    const list = p[bucket];
    return (
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">{title}</h3>
        <ul className="space-y-2">
          {list.map((item, i) => (
            <li key={i} className="grid grid-cols-[80px,1fr,2fr,auto] gap-2 items-center">
              <Input value={item.key} onChange={(e) => { const next = [...list]; next[i] = { ...item, key: e.target.value }; updList(bucket, next); }} />
              <Input value={item.label} onChange={(e) => { const next = [...list]; next[i] = { ...item, label: e.target.value }; updList(bucket, next); }} />
              <Input value={item.description ?? ""} placeholder="Descrição (opcional)" onChange={(e) => { const next = [...list]; next[i] = { ...item, description: e.target.value }; updList(bucket, next); }} />
              <button onClick={() => { if (list.length <= 1) { toast.error("Precisa de ao menos 1 opção."); return; } updList(bucket, list.filter((_, idx) => idx !== i)); }} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
        <button onClick={() => updList(bucket, [...list, { key: "novo", label: "Novo", description: "" }])} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"><Plus className="w-3.5 h-3.5" /> Adicionar</button>
      </Card>
    );
  };
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {section("priorities", "Prioridades (P1/P2/P3)")}
      {section("effort", "Esforço")}
      {section("impact", "Impacto")}
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">Observação</h3>
        <p className="text-xs text-slate-500">As chaves são referenciadas pelo backend; ao remover uma chave usada, os planos existentes não são retroativamente reclassificados.</p>
      </Card>
    </div>
  );
}

function ModelTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
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
          <div><Label>Temperatura (0–1)</Label><Input type="number" step={0.05} min={0} max={1} value={m.temperature} onChange={(e) => upd({ temperature: Number(e.target.value) })} /></div>
          <div><Label>Máx. tokens</Label><Input type="number" min={512} max={12000} step={128} value={m.max_tokens} onChange={(e) => upd({ max_tokens: Number(e.target.value) })} /></div>
          <div><Label>Timeout (s)</Label><Input type="number" min={10} max={240} value={m.timeout_seconds} onChange={(e) => upd({ timeout_seconds: Number(e.target.value) })} /></div>
          <div><Label>Tentativas correção JSON</Label><Input type="number" min={0} max={2} value={m.json_retries} onChange={(e) => upd({ json_retries: Number(e.target.value) })} /></div>
          <div><Label>Custo máx. por geração (USD)</Label><Input type="number" step={0.05} min={0} value={m.max_cost_per_generation_usd ?? 0} onChange={(e) => upd({ max_cost_per_generation_usd: Number(e.target.value) })} /></div>
        </div>
        <p className="mt-3 text-xs text-slate-500">A chave da API permanece no backend e nunca é exposta.</p>
      </Card>
    </div>
  );
}

type SourceKind = "manual" | "alert" | "predictive_signal" | "dna" | "executive_ai" | "weekly_insight";
const SOURCE_OPTS: { value: SourceKind; label: string; needsId: boolean }[] = [
  { value: "manual", label: "Manual (sem origem)", needsId: false },
  { value: "alert", label: "Alerta", needsId: true },
  { value: "predictive_signal", label: "Sinal preditivo", needsId: true },
  { value: "dna", label: "DNA Organizacional (mais recente ou específico)", needsId: false },
  { value: "weekly_insight", label: "Insight Semanal (mais recente ou específico)", needsId: false },
  { value: "executive_ai", label: "Mensagem do Conselho Executivo", needsId: true },
];

function TestTab({ config }: { config: Cfg }) {
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [orgId, setOrgId] = useState<string>("");
  const [sourceType, setSourceType] = useState<SourceKind>("manual");
  const [sources, setSources] = useState<{ id: string; label: string }[]>([]);
  const [sourceId, setSourceId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [configSource, setConfigSource] = useState<"draft" | "published">("draft");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("organizations").select("id, name").order("name").limit(200);
      const list = (data ?? []) as { id: string; name: string }[];
      setOrgs(list); if (list[0]) setOrgId((prev) => prev || list[0].id);
    })();
  }, []);

  useEffect(() => {
    setSources([]); setSourceId("");
    if (!orgId) return;
    (async () => {
      if (sourceType === "alert") {
        const { data } = await supabase.from("alerts").select("id, title, severity, created_at")
          .eq("organization_id", orgId).order("created_at", { ascending: false }).limit(20);
        setSources((data ?? []).map((a: any) => ({ id: a.id, label: `[${a.severity}] ${a.title}` })));
      } else if (sourceType === "predictive_signal") {
        const { data } = await supabase.from("predictive_signals").select("id, title, severity, detected_at")
          .eq("organization_id", orgId).order("detected_at", { ascending: false }).limit(20);
        setSources((data ?? []).map((s: any) => ({ id: s.id, label: `[${s.severity}] ${s.title}` })));
      } else if (sourceType === "dna") {
        const { data } = await supabase.from("organizational_dna_reports").select("id, generated_at, overall_score")
          .eq("organization_id", orgId).order("generated_at", { ascending: false }).limit(20);
        setSources((data ?? []).map((d: any) => ({ id: d.id, label: `DNA ${new Date(d.generated_at).toLocaleDateString("pt-BR")} — score ${d.overall_score ?? "–"}` })));
      } else if (sourceType === "weekly_insight") {
        const { data } = await supabase.from("weekly_ai_insights").select("id, created_at")
          .eq("organization_id", orgId).order("created_at", { ascending: false }).limit(20);
        setSources((data ?? []).map((w: any) => ({ id: w.id, label: `Insight ${new Date(w.created_at).toLocaleString("pt-BR")}` })));
      } else if (sourceType === "executive_ai") {
        const { data } = await supabase.from("executive_ai_messages").select("id, role, created_at").order("created_at", { ascending: false }).limit(20);
        setSources((data ?? []).map((m: any) => ({ id: m.id, label: `[${m.role}] ${new Date(m.created_at).toLocaleString("pt-BR")}` })));
      }
    })();
  }, [orgId, sourceType]);

  const needsId = SOURCE_OPTS.find((s) => s.value === sourceType)?.needsId ?? false;

  async function run() {
    if (!orgId) { toast.error("Selecione uma empresa"); return; }
    if (needsId && !sourceId) { toast.error("Selecione a origem específica"); return; }
    setRunning(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-action-plan", {
        body: {
          test_mode: true, config_source: configSource,
          organization_id: orgId, source_type: sourceType,
          source_id: sourceId || null, prompt: prompt || undefined,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data);
      toast.success("Plano gerado em modo teste (não persistido)");
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.includes("rate_limited")) toast.error("Limite temporário atingido. Tente novamente em instantes.");
      else if (msg.includes("credits_exhausted")) toast.error("Créditos de IA esgotados no workspace.");
      else if (msg.includes("forbidden")) toast.error("Sem permissão para test_mode.");
      else toast.error(`Falha na geração: ${msg}`);
    } finally { setRunning(false); }
  }

  const plan = result?.plan;
  const metrics = result?.metrics;
  const warnings: string[] = result?.warnings ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Parâmetros de teste</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Empresa</Label>
            <select value={orgId} onChange={(e) => setOrgId(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Fonte</Label>
            <select value={sourceType} onChange={(e) => setSourceType(e.target.value as SourceKind)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              {SOURCE_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {(needsId || sources.length > 0) && (
            <div className="md:col-span-2">
              <Label>{needsId ? "Item de origem (obrigatório)" : "Item específico (opcional)"}</Label>
              <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="">{needsId ? "— selecione —" : "— usar mais recente —"}</option>
                {sources.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <Label>Orientação adicional (opcional)</Label>
            <Textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex.: focar em ações que possam ser executadas em 30 dias." />
          </div>
          <div>
            <Label>Configuração usada</Label>
            <Select value={configSource} onChange={(v) => setConfigSource(v as "draft" | "published")}
              options={[{ value: "draft", label: `Rascunho (v${config.version} em edição)` }, { value: "published", label: `Publicada (v${config.version})` }]} />
          </div>
          <div className="flex items-end">
            <button onClick={run} disabled={running}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-semibold hover:brightness-105 disabled:opacity-50">
              <FlaskConical className="w-4 h-4" /> {running ? "Gerando…" : "Executar teste"}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Modo teste: nenhum plano é persistido; nenhum e-mail/notificação é enviado. Contexto respeita agregação e k-anonimato.</p>
      </Card>

      {result && (
        <>
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Métricas da execução</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Metric label="Modelo" value={metrics?.model} />
              <Metric label="Fallback usado" value={metrics?.fallback_used ? "Sim" : "Não"} />
              <Metric label="Latência" value={`${metrics?.latency_ms} ms`} />
              <Metric label="Tokens (in/out)" value={`${metrics?.tokens_in}/${metrics?.tokens_out}`} />
              <Metric label="Custo estimado" value={`US$ ${Number(metrics?.estimated_cost_usd ?? 0).toFixed(5)}`} />
              <Metric label="Config" value={`${metrics?.config_source} v${metrics?.config_version}`} />
            </div>
            {warnings.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">Avisos do sanitizador</p>
                <ul className="text-xs text-amber-900 list-disc list-inside space-y-0.5">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Preview do plano</h3>
            {plan ? (
              <div className="space-y-4 text-sm text-slate-800">
                <div>
                  <p className="text-lg font-bold">{plan.title}</p>
                  {plan.priority && <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wide font-semibold">Prioridade {plan.priority}</span>}
                </div>
                {plan.problem_statement && <Field label="Problema">{plan.problem_statement}</Field>}
                {plan.objective && <Field label="Objetivo">{plan.objective}</Field>}
                {plan.description && <Field label="Descrição">{plan.description}</Field>}
                {Array.isArray(plan.tasks) && plan.tasks.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tarefas</p>
                    <ol className="space-y-2">
                      {plan.tasks.map((t: any, i: number) => (
                        <li key={i} className="rounded-lg border border-slate-200 p-3">
                          <p className="font-semibold">{i + 1}. {t.title}</p>
                          {t.description && <p className="text-xs text-slate-600 mt-1">{t.description}</p>}
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                            {t.owner_role && <span>👤 {t.owner_role}</span>}
                            {typeof t.due_offset_days === "number" && <span>⏱ D+{t.due_offset_days}</span>}
                            {t.effort && <span>Esforço: {t.effort}</span>}
                            {t.impact && <span>Impacto: {t.impact}</span>}
                            {t.completion_criteria && <span>✓ {t.completion_criteria}</span>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {Array.isArray(plan.success_metrics) && plan.success_metrics.length > 0 && (
                  <Field label="Métricas de sucesso">
                    <ul className="list-disc list-inside">{plan.success_metrics.map((m: any, i: number) => (
                      <li key={i}>{typeof m === "string" ? m : `${m.indicator ?? ""} — baseline ${m.baseline ?? "?"} → meta ${m.target ?? "?"} (${m.direction ?? ""})`}</li>
                    ))}</ul>
                  </Field>
                )}
                {Array.isArray(plan.risks) && plan.risks.length > 0 && (
                  <Field label="Riscos">
                    <ul className="list-disc list-inside">{plan.risks.map((r: any, i: number) => <li key={i}>{typeof r === "string" ? r : `${r.description} (mitigação: ${r.mitigation ?? "–"})`}</li>)}</ul>
                  </Field>
                )}
                {plan.impact_measurement && <Field label="Medição de impacto">{typeof plan.impact_measurement === "string" ? plan.impact_measurement : JSON.stringify(plan.impact_measurement, null, 2)}</Field>}
                <details className="mt-2">
                  <summary className="text-xs text-slate-500 cursor-pointer">Ver JSON completo</summary>
                  <pre className="mt-2 text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto max-h-96">{JSON.stringify(plan, null, 2)}</pre>
                </details>
              </div>
            ) : <p className="text-sm text-slate-500">Nenhum plano retornado.</p>}
          </Card>
        </>
      )}
    </div>
  );
}
function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-lg border border-slate-200 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{value ?? "–"}</p></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p><div className="text-sm text-slate-800 whitespace-pre-wrap">{children}</div></div>;
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
