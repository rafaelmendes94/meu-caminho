import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import {
  Lock, Save, Send, Plus, Trash2, ArrowUp, ArrowDown, ShieldCheck, Sparkles,
  MessageSquare, Cpu, FlaskConical, History, Layers, ListChecks, GaugeCircle,
  GitCompare, RotateCcw,
} from "lucide-react";

const SCENARIOS: { key: string; label: string; description: string }[] = [
  { key: "low_communication", label: "Queda de comunicação", description: "Comunicação em declínio, pulse abrindo pouco." },
  { key: "low_energy", label: "Energia baixa", description: "Humor em queda, sobrecarga percebida." },
  { key: "high_overload", label: "Alta sobrecarga", description: "Capacidade no vermelho, horas extras altas." },
  { key: "low_engagement", label: "Baixo engajamento", description: "Participação e conclusão de rituais caindo." },
  { key: "good_recovery", label: "Boa recuperação", description: "Humor e energia em recuperação positiva." },
  { key: "high_participation", label: "Alta participação", description: "Participação e conclusão excelentes." },
  { key: "low_score", label: "Score organizacional baixo", description: "Score < 50 com liderança e segurança fracos." },
  { key: "high_score", label: "Score organizacional alto", description: "Score > 80 com engajamento e cultura fortes." },
];

type RitualType = { key: string; label: string; description?: string; active: boolean };
type StepsCfg = { min: number; max: number; require_time_per_step: boolean; granularity: string };
type QuestionsCfg = { min: number; max: number };
type Variations = { presencial: boolean; remoto: boolean; hibrido: boolean };
type Personalization = { by_company_size: boolean; by_department: boolean; by_moment: boolean; by_objective: boolean };
type ToneConfig = {
  tone: string; detail: string;
  min_duration_minutes: number; max_duration_minutes: number;
  require_objective: boolean; require_problem: boolean; require_audience: boolean;
  require_facilitator_role: boolean; require_materials: boolean;
  require_success_metric: boolean; require_impact_measurement: boolean;
  require_questions: boolean; require_closing: boolean;
  variations: Variations; extra_instructions: string;
  steps: StepsCfg; questions: QuestionsCfg; personalization: Personalization;
};
type StructureBlock = { key: string; title: string; description?: string; active: boolean; order: number; required?: boolean };
type ModelConfig = {
  primary_model: string; fallback_model: string;
  temperature: number; max_tokens: number; timeout_seconds: number;
  json_retries: number; streaming: boolean; max_cost_per_generation_usd?: number;
  ritual_types: RitualType[];
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

const REQUIRED_BLOCKS = new Set([
  "title","type","objective","problem","audience","duration","materials","facilitator",
  "steps","questions","closing","variations","success_metrics","impact_measurement",
]);
const TABS = [
  { id: "behavior", label: "Comportamento", icon: MessageSquare },
  { id: "types", label: "Tipos", icon: Layers },
  { id: "structure", label: "Estrutura", icon: ListChecks },
  { id: "steps", label: "Passo a Passo", icon: GaugeCircle },
  { id: "model", label: "Modelo e Limites", icon: Cpu },
  { id: "test", label: "Testar Geração", icon: FlaskConical },
  { id: "edit_ai", label: "Editar por IA", icon: Sparkles },
  { id: "history", label: "Histórico", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

const TONE_OPTS = [
  { value: "pratico", label: "Prático" },
  { value: "executivo", label: "Executivo" },
  { value: "consultivo", label: "Consultivo" },
  { value: "acolhedor", label: "Acolhedor" },
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
  { value: "operacional", label: "Operacional" },
  { value: "detalhada", label: "Detalhada" },
  { value: "estrategica", label: "Estratégica" },
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

export default function PlatformIntelligentRitualConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [config, setConfig] = useState<Cfg | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [tab, setTab] = useState<TabId>("behavior");
  const [changeNote, setChangeNote] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("ai_prompt_configs").select("*").eq("key", "intelligent_ritual").maybeSingle();
    if (error || !data) { toast.error("Falha ao carregar Rituais Inteligentes"); setLoading(false); return; }
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
    if (!t.require_objective || !t.require_problem || !t.require_audience || !t.require_facilitator_role ||
        !t.require_materials || !t.require_success_metric || !t.require_impact_measurement ||
        !t.require_questions || !t.require_closing)
      return "Exigências obrigatórias (objetivo, problema, público, facilitador, materiais, métrica, impacto, perguntas, fechamento) não podem ser desativadas.";
    if (t.min_duration_minutes < 5 || t.max_duration_minutes > 120 || t.min_duration_minutes > t.max_duration_minutes)
      return "Duração inválida (5–120 min, min ≤ max).";
    if (t.steps.min < 3 || t.steps.max > 12 || t.steps.min > t.steps.max) return "Passos inválidos (3–12, min ≤ max).";
    if (t.questions.min < 1 || t.questions.max > 10 || t.questions.min > t.questions.max) return "Perguntas inválidas (1–10, min ≤ max).";
    for (const k of REQUIRED_BLOCKS) {
      const b = config.output_structure.find((x) => x.key === k);
      if (!b || !b.active) return `Bloco obrigatório "${k}" precisa estar ativo.`;
    }
    if ((config.model_config.ritual_types ?? []).filter((r) => r.active).length === 0)
      return "Ao menos um tipo de ritual precisa estar ativo.";
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
        metadata: { key: "intelligent_ritual", version: nextVersion, note: changeNote || null } as any,
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
            <h1 className="text-3xl font-bold mt-1 flex items-center gap-3"><Sparkles className="w-7 h-7 text-[#F88A2B]" /> Rituais Inteligentes</h1>
            <p className="text-sm text-slate-500 mt-1">Configure comportamento, tipos, estrutura, passo a passo e limites do gerador de rituais.</p>
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
        {tab === "types" && <TypesTab config={config} setConfig={setConfig} />}
        {tab === "structure" && <StructureTab config={config} setConfig={setConfig} />}
        {tab === "steps" && <StepsTab config={config} setConfig={setConfig} />}
        {tab === "model" && <ModelTab config={config} setConfig={setConfig} />}
        {tab === "test" && <TestTab config={config} />}
        {tab === "edit_ai" && <EditByAITab config={config} setConfig={setConfig} />}
        {tab === "history" && <HistoryTab versions={versions} currentVersion={config.version} setConfig={setConfig} />}

        {(tab !== "test" && tab !== "history" && tab !== "edit_ai") && (
          <Card>
            <Label>Nota da alteração (opcional)</Label>
            <Input value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Ex.: Rituais mais curtos para times remotos e reforço em segurança psicológica." />
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
  const updVar = (patch: Partial<Variations>) => upd({ variations: { ...t.variations, ...patch } });
  const updPer = (patch: Partial<Personalization>) => upd({ personalization: { ...t.personalization, ...patch } });
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Tom e duração</h3>
        <div className="space-y-4">
          <div><Label>Tom</Label><Select value={t.tone} onChange={(v) => upd({ tone: v })} options={TONE_OPTS} /></div>
          <div><Label>Nível de detalhe</Label><Select value={t.detail} onChange={(v) => upd({ detail: v })} options={DETAIL_OPTS} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Duração mín. (min)</Label><Input type="number" min={5} max={t.max_duration_minutes} value={t.min_duration_minutes} onChange={(e) => upd({ min_duration_minutes: Math.max(5, Number(e.target.value) || 10) })} /></div>
            <div><Label>Duração máx. (min)</Label><Input type="number" min={t.min_duration_minutes} max={120} value={t.max_duration_minutes} onChange={(e) => upd({ max_duration_minutes: Math.min(120, Number(e.target.value) || 60) })} /></div>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Exigências obrigatórias</h3>
        <div className="space-y-1">
          <Row label="Exigir objetivo"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir problema que resolve"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir público"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Facilitador como papel"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir materiais"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir métrica de sucesso"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir medição de impacto"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir perguntas de reflexão"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Exigir fechamento"><Toggle checked disabled hint="Obrigatório" /></Row>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Variações</h3>
        <div className="space-y-1">
          <Row label="Presencial"><Toggle checked={t.variations.presencial} onChange={(v) => updVar({ presencial: v })} /></Row>
          <Row label="Remoto"><Toggle checked={t.variations.remoto} onChange={(v) => updVar({ remoto: v })} /></Row>
          <Row label="Híbrido"><Toggle checked={t.variations.hibrido} onChange={(v) => updVar({ hibrido: v })} /></Row>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Personalização</h3>
        <div className="space-y-1">
          <Row label="Por tamanho da empresa"><Toggle checked={t.personalization.by_company_size} onChange={(v) => updPer({ by_company_size: v })} /></Row>
          <Row label="Por departamento"><Toggle checked={t.personalization.by_department} onChange={(v) => updPer({ by_department: v })} /></Row>
          <Row label="Por momento"><Toggle checked={t.personalization.by_moment} onChange={(v) => updPer({ by_moment: v })} /></Row>
          <Row label="Por objetivo"><Toggle checked={t.personalization.by_objective} onChange={(v) => updPer({ by_objective: v })} /></Row>
        </div>
      </Card>
      <Card className="md:col-span-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Instruções e prompt base</h3>
        <div className="space-y-4">
          <div><Label>Instruções adicionais</Label>
            <Textarea rows={4} value={t.extra_instructions} onChange={(e) => upd({ extra_instructions: e.target.value })} placeholder="Ex.: Sempre incluir um momento de silêncio e reflexão coletiva." />
          </div>
          <div><Label>Prompt base</Label>
            <Textarea rows={7} value={config.system_instructions} onChange={(e) => setConfig((c) => c ? { ...c, system_instructions: e.target.value } : c)} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function TypesTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const list = config.model_config.ritual_types ?? [];
  const updList = (next: RitualType[]) => setConfig((c) => c ? { ...c, model_config: { ...c.model_config, ritual_types: next } } : c);
  const upd = (i: number, patch: Partial<RitualType>) => { const next = [...list]; next[i] = { ...next[i], ...patch }; updList(next); };
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Biblioteca de tipos de ritual</h3>
        <button onClick={() => updList([...list, { key: `novo_${list.length + 1}`, label: "Novo tipo", description: "", active: true }])}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"><Plus className="w-3.5 h-3.5" /> Adicionar tipo</button>
      </div>
      <ul className="space-y-2">
        {list.map((t, i) => (
          <li key={i} className="grid grid-cols-[110px,140px,1fr,auto,auto] gap-2 items-center border border-slate-200 rounded-xl p-2">
            <Input value={t.key} onChange={(e) => upd(i, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} placeholder="chave" />
            <Input value={t.label} onChange={(e) => upd(i, { label: e.target.value })} placeholder="rótulo" />
            <Input value={t.description ?? ""} onChange={(e) => upd(i, { description: e.target.value })} placeholder="descrição (opcional)" />
            <Toggle checked={t.active} onChange={(v) => upd(i, { active: v })} hint={t.active ? "Ativo" : "Inativo"} />
            <button onClick={() => { if (list.filter((x) => x.active).length <= 1 && t.active) { toast.error("Ao menos 1 tipo ativo é obrigatório."); return; } updList(list.filter((_, idx) => idx !== i)); }} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">O motor só aceita rituais com tipo pertencente à biblioteca ativa. Renomeações não retroagem em rituais já criados.</p>
    </Card>
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
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Blocos do ritual</h3>
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

function StepsTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const s = config.tone_config.steps;
  const q = config.tone_config.questions;
  const upd = (patch: Partial<StepsCfg>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, steps: { ...c.tone_config.steps, ...patch } } } : c);
  const updQ = (patch: Partial<QuestionsCfg>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, questions: { ...c.tone_config.questions, ...patch } } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Passo a passo</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Mín. passos</Label><Input type="number" min={3} max={s.max} value={s.min} onChange={(e) => upd({ min: Math.max(3, Number(e.target.value) || 5) })} /></div>
          <div><Label>Máx. passos</Label><Input type="number" min={s.min} max={12} value={s.max} onChange={(e) => upd({ max: Math.min(12, Number(e.target.value) || 10) })} /></div>
          <div className="col-span-2"><Label>Granularidade</Label><Select value={s.granularity} onChange={(v) => upd({ granularity: v })} options={GRANULARITY_OPTS} /></div>
        </div>
        <div className="mt-4"><Row label="Exigir tempo por passo"><Toggle checked={s.require_time_per_step} onChange={(v) => upd({ require_time_per_step: v })} /></Row></div>
        <p className="mt-3 text-xs text-slate-500">Estrutura recomendada: Abertura → Contextualização → Dinâmica → Discussão → Reflexão → Compromissos → Encerramento.</p>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Perguntas de reflexão</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Mín. perguntas</Label><Input type="number" min={1} max={q.max} value={q.min} onChange={(e) => updQ({ min: Math.max(1, Number(e.target.value) || 2) })} /></div>
          <div><Label>Máx. perguntas</Label><Input type="number" min={q.min} max={10} value={q.max} onChange={(e) => updQ({ max: Math.min(10, Number(e.target.value) || 6) })} /></div>
        </div>
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
          <div className="col-span-2"><Label>Custo máx. por geração (USD)</Label><Input type="number" step={0.05} min={0} value={m.max_cost_per_generation_usd ?? 0} onChange={(e) => upd({ max_cost_per_generation_usd: Number(e.target.value) })} /></div>
        </div>
        <p className="mt-3 text-xs text-slate-500">A chave da API permanece no backend e nunca é exposta.</p>
      </Card>
    </div>
  );
}

function TestTab({ config }: { config: Cfg }) {
  const activeTypes = (config.model_config.ritual_types ?? []).filter((t) => t.active);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [orgId, setOrgId] = useState<string>("");
  const [scenario, setScenario] = useState<string>(SCENARIOS[0].key);
  const [ritualType, setRitualType] = useState<string>(activeTypes[0]?.key ?? "");
  const [modality, setModality] = useState<"presencial" | "remoto" | "hibrido">("hibrido");
  const [extra, setExtra] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("organizations").select("id, name").order("name").limit(200);
      const list = (data ?? []) as { id: string; name: string }[];
      setOrgs(list);
      if (list[0]) setOrgId(list[0].id);
    })();
  }, []);

  async function runTest() {
    if (!orgId) { toast.error("Selecione uma organização."); return; }
    setRunning(true); setError(null); setResult(null); setWarnings([]); setMetrics(null);
    const { data, error } = await supabase.functions.invoke("generate-intelligent-ritual", {
      body: {
        source_type: "scenario",
        scenario,
        ritual_type: ritualType || null,
        organization_id: orgId,
        test_mode: true,
        prompt: [
          `Modalidade preferencial: ${modality}.`,
          extra ? `Contexto do teste: ${extra}` : "",
        ].filter(Boolean).join(" "),
      },
    });
    setRunning(false);
    if (error) { setError(error.message); toast.error("Falha na geração de teste"); return; }
    if ((data as any)?.error) { setError((data as any).error); toast.error((data as any).error); return; }
    setResult((data as any)?.ritual ?? null);
    setWarnings((data as any)?.warnings ?? []);
    setMetrics((data as any)?.metrics ?? null);
    toast.success("Teste concluído (sem persistir)");
  }

  const sc = SCENARIOS.find((s) => s.key === scenario);
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Configuração do teste</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Organização (contexto real, sem persistência)</Label>
            <Select value={orgId} onChange={setOrgId} options={orgs.map((o) => ({ value: o.id, label: o.name }))} />
          </div>
          <div>
            <Label>Cenário simulado</Label>
            <Select value={scenario} onChange={setScenario} options={SCENARIOS.map((s) => ({ value: s.key, label: s.label }))} />
            {sc && <p className="mt-1 text-xs text-slate-500">{sc.description}</p>}
          </div>
          <div>
            <Label>Tipo de ritual</Label>
            <Select value={ritualType} onChange={setRitualType} options={[{ value: "", label: "IA escolhe" }, ...activeTypes.map((t) => ({ value: t.key, label: t.label }))]} />
          </div>
          <div>
            <Label>Modalidade preferencial</Label>
            <Select value={modality} onChange={(v) => setModality(v as any)} options={[
              { value: "presencial", label: "Presencial" },
              { value: "remoto", label: "Remoto" },
              { value: "hibrido", label: "Híbrido" },
            ]} />
          </div>
          <div className="md:col-span-2">
            <Label>Orientação adicional (opcional)</Label>
            <Textarea rows={3} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Ex.: time comercial em final de trimestre, foco em recuperação de energia." />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">O teste roda com a config atual (rascunho ou publicada), respeita guardrails e não grava rituais.</p>
          <button onClick={runTest} disabled={running || !orgId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-semibold hover:brightness-105 disabled:opacity-50">
            <FlaskConical className="w-4 h-4" /> {running ? "Gerando…" : "Rodar teste"}
          </button>
        </div>
      </Card>

      {error && <Card className="border-red-200 bg-red-50/40"><p className="text-sm text-red-700">{error}</p></Card>}

      {metrics && (
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Métricas da execução</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Metric label="Modelo" value={metrics.model} sub={metrics.fallback_used ? "fallback usado" : "primário"} />
            <Metric label="Latência" value={`${metrics.latency_ms} ms`} />
            <Metric label="Tokens" value={`${metrics.tokens_total}`} sub={`in ${metrics.tokens_in} · out ${metrics.tokens_out}`} />
            <Metric label="Custo est." value={`US$ ${Number(metrics.estimated_cost_usd ?? 0).toFixed(6)}`} sub={`config v${metrics.config_version}`} />
          </div>
        </Card>
      )}

      {warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 mb-2">Avisos</h3>
          <ul className="text-xs text-amber-900 space-y-1">{warnings.map((w, i) => <li key={i}>• {w}</li>)}</ul>
        </Card>
      )}

      {result && <RitualPreview ritual={result} modality={modality} />}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function RitualPreview({ ritual, modality }: { ritual: any; modality: "presencial" | "remoto" | "hibrido" }) {
  const variation = ritual?.variations?.[modality] ?? null;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#F88A2B] font-semibold">{ritual.type ?? "ritual"}</p>
          <h3 className="text-lg font-bold text-slate-900">{ritual.title}</h3>
          {ritual.description && <p className="text-sm text-slate-600 mt-1">{ritual.description}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Duração</p>
          <p className="text-sm font-bold text-slate-800">{ritual.duration ?? "—"} min</p>
          {typeof ritual.confidence === "number" && (
            <p className="text-[11px] text-slate-500 mt-1">Confiança {(ritual.confidence * 100).toFixed(0)}%</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-2">
        <Section title="Objetivo">{ritual.objective}</Section>
        <Section title="Problema que resolve">{ritual.problem}</Section>
        <Section title="Público-alvo">{ritual.audience}</Section>
        <Section title="Facilitador (papel)">{ritual.facilitator}</Section>
        <Section title="Contexto">{ritual.context}</Section>
        <Section title="Quando aplicar">{ritual.when_to_apply}</Section>
      </div>

      {Array.isArray(ritual.materials) && ritual.materials.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Materiais</p>
          <div className="flex flex-wrap gap-1.5">{ritual.materials.map((m: string, i: number) => <span key={i} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">{m}</span>)}</div>
        </div>
      )}

      {Array.isArray(ritual.steps) && ritual.steps.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Passo a passo</p>
          <ol className="space-y-2">
            {ritual.steps.map((s: any, i: number) => (
              <li key={i} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{s.order ?? i + 1}. {s.title}</p>
                  {s.minutes != null && <span className="text-[11px] text-slate-500">{s.minutes} min</span>}
                </div>
                {s.description && <p className="text-xs text-slate-600 mt-1">{s.description}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {Array.isArray(ritual.questions) && ritual.questions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Perguntas de reflexão</p>
          <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">{ritual.questions.map((q: string, i: number) => <li key={i}>{q}</li>)}</ul>
        </div>
      )}

      {ritual.closing && <Section title="Fechamento">{ritual.closing}</Section>}

      {variation && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Variação · {modality}</p>
          <div className="grid md:grid-cols-2 gap-3">
            <Section title="Setup">{variation.setup}</Section>
            <Section title="Ajustes">{variation.adjustments}</Section>
          </div>
        </div>
      )}

      {Array.isArray(ritual.success_metrics) && ritual.success_metrics.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Métricas de sucesso</p>
          <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">{ritual.success_metrics.map((m: any, i: number) => <li key={i}>{typeof m === "string" ? m : JSON.stringify(m)}</li>)}</ul>
        </div>
      )}

      {ritual.impact_measurement && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Medição de impacto</p>
          <div className="text-xs text-slate-700 space-y-1">
            {Array.isArray(ritual.impact_measurement.baseline_metrics) && ritual.impact_measurement.baseline_metrics.length > 0 && (
              <p><span className="font-semibold">Baseline:</span> {ritual.impact_measurement.baseline_metrics.join(", ")}</p>
            )}
            {ritual.impact_measurement.comparison_window_days != null && (
              <p><span className="font-semibold">Janela:</span> {ritual.impact_measurement.comparison_window_days} dias</p>
            )}
            {ritual.impact_measurement.success_rule && <p><span className="font-semibold">Regra de sucesso:</span> {ritual.impact_measurement.success_rule}</p>}
          </div>
        </div>
      )}

      {Array.isArray(ritual.limitations) && ritual.limitations.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Limitações declaradas</p>
          <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">{ritual.limitations.map((l: string, i: number) => <li key={i}>{l}</li>)}</ul>
        </div>
      )}
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{title}</p>
      <p className="text-sm text-slate-800 whitespace-pre-wrap">{children}</p>
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
      <p className="mt-3 text-xs text-slate-500">Editar por IA + comparação A × B e restauro chegam na Sub-fase C.</p>
    </Card>
  );
}
