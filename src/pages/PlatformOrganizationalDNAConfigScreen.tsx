import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import {
  Lock, Save, Send, Plus, Trash2, ArrowUp, ArrowDown, ShieldCheck, Dna,
  MessageSquare, Layers, ListChecks, Sliders, Target, Cpu, FlaskConical, History, Wand2,
  Play, Clock, DollarSign, Hash, AlertTriangle, CheckCircle2, Building2, Sparkles, RotateCcw, GitCompare, Undo2,
} from "lucide-react";

type ToneConfig = {
  tone: string; detail: string; formality: string;
  max_strengths: number; max_risks: number; max_recommendations: number;
  include_tensions: boolean; include_opportunities: boolean; include_initial_plan: boolean;
  include_risks: boolean; include_confidence: boolean; include_limitations: boolean; include_evidence: boolean;
  extra_instructions: string;
};
type StructureBlock = { key: string; title: string; description?: string; active: boolean; order: number; required?: boolean };
type Dimension = { key: string; label: string; description?: string; required?: boolean; active: boolean; weight: number; order: number };
type Classification = { min: number; max: number; label: string; description?: string };
type ModelConfig = {
  primary_model: string; fallback_model: string;
  temperature: number; max_tokens: number; timeout_seconds: number; json_retries: number; streaming: boolean;
};
type RecommendationsConfig = {
  max_items: number;
  require_owner: boolean; require_deadline: boolean; require_effort: boolean;
  require_impact: boolean; require_metric: boolean; prefer_low_effort_high_impact: boolean;
  extra_instructions: string;
};
type DnaConfig = {
  id: string; key: string; name: string; description: string | null;
  system_instructions: string;
  tone_config: ToneConfig;
  output_structure: StructureBlock[];
  dimensions_config: Dimension[];
  classifications_config: Classification[];
  examples: any[];
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
  { id: "dimensions", label: "Dimensões", icon: Layers },
  { id: "structure", label: "Estrutura", icon: ListChecks },
  { id: "classifications", label: "Classificações", icon: Sliders },
  { id: "recommendations", label: "Recomendações", icon: Target },
  { id: "model", label: "Modelo e Limites", icon: Cpu },
  { id: "ai_edit", label: "Editar por IA", icon: Sparkles },
  { id: "test", label: "Testar Geração", icon: FlaskConical },
  { id: "history", label: "Histórico", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

const TONE_OPTS = [
  { value: "executivo", label: "Executivo" },
  { value: "analitico", label: "Analítico" },
  { value: "estrategico", label: "Estratégico" },
  { value: "consultivo", label: "Consultivo" },
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
const REQUIRED_DIMENSIONS = new Set(["leadership","communication","engagement","energy","recovery","psychological_safety"]);
const REQUIRED_BLOCKS = new Set(["executive_summary","dimensions","confidence","limitations"]);

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

export default function PlatformOrganizationalDNAConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [config, setConfig] = useState<DnaConfig | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [tab, setTab] = useState<TabId>("behavior");
  const [changeNote, setChangeNote] = useState("");
  const [recCfg, setRecCfg] = useState<RecommendationsConfig>({
    max_items: 6, require_owner: true, require_deadline: true, require_effort: true,
    require_impact: true, require_metric: true, prefer_low_effort_high_impact: true, extra_instructions: "",
  });

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("ai_prompt_configs").select("*").eq("key", "organizational_dna").maybeSingle();
    if (error || !data) { toast.error("Falha ao carregar DNA"); setLoading(false); return; }
    const cfg = data as unknown as DnaConfig;
    const tc = (cfg.tone_config as any) ?? {};
    if (tc.recommendations) setRecCfg((r) => ({ ...r, ...tc.recommendations }));
    setConfig(cfg);
    const { data: v } = await supabase.from("ai_prompt_versions")
      .select("id, version, change_note, created_at, snapshot")
      .eq("prompt_config_id", cfg.id).order("version", { ascending: false }).limit(50);
    setVersions((v ?? []) as VersionRow[]);
    setLoading(false);
  }
  useEffect(() => { void load(); /* eslint-disable-next-line */ }, []);

  function validate(): string | null {
    if (!config) return "Configuração não carregada.";
    const t = config.tone_config;
    if (!t.include_evidence || !t.include_confidence || !t.include_limitations)
      return "Evidências, confiança e limitações são obrigatórias.";
    for (const r of ["max_strengths","max_risks","max_recommendations"] as const) {
      const v = Number((t as any)[r]);
      if (!Number.isFinite(v) || v < 1 || v > 10) return `${r} deve estar entre 1 e 10.`;
    }
    for (const k of REQUIRED_BLOCKS) {
      const b = config.output_structure.find((x) => x.key === k);
      if (!b || !b.active) return `Bloco obrigatório "${k}" precisa estar ativo.`;
    }
    for (const k of REQUIRED_DIMENSIONS) {
      const d = config.dimensions_config.find((x) => x.key === k);
      if (!d || !d.active) return `Dimensão obrigatória "${k}" precisa estar ativa.`;
    }
    if (config.dimensions_config.filter((d) => d.active).length === 0) return "Ao menos uma dimensão ativa.";
    const cs = [...config.classifications_config].sort((a, b) => a.min - b.min);
    if (cs.length === 0) return "Defina ao menos uma classificação.";
    if (cs[0].min !== 0) return "Classificações devem começar em 0.";
    if (cs[cs.length - 1].max !== 100) return "Classificações devem cobrir até 100.";
    for (let i = 0; i < cs.length; i++) {
      if (cs[i].max < cs[i].min) return "Classificação inválida (max < min).";
      if (i > 0 && cs[i].min !== cs[i - 1].max + 1) return "Classificações não podem ter lacunas ou sobreposição.";
    }
    const m = config.model_config;
    if (m.temperature < 0 || m.temperature > 1) return "Temperatura entre 0 e 1.";
    if (m.max_tokens < 512 || m.max_tokens > 12000) return "Máx. tokens entre 512 e 12000.";
    if (m.timeout_seconds < 10 || m.timeout_seconds > 240) return "Timeout entre 10 e 240s.";
    if (m.json_retries < 0 || m.json_retries > 2) return "Tentativas de correção JSON entre 0 e 2.";
    return null;
  }

  function packedTone(): any {
    return { ...config!.tone_config, recommendations: recCfg };
  }

  async function saveDraft() {
    if (!config) return;
    const err = validate(); if (err) { toast.error(err); return; }
    setSaving(true);
    const { error } = await supabase.from("ai_prompt_configs").update({
      system_instructions: config.system_instructions,
      tone_config: packedTone(),
      output_structure: config.output_structure as any,
      dimensions_config: config.dimensions_config as any,
      classifications_config: config.classifications_config as any,
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
      tone_config: packedTone(),
      output_structure: config.output_structure as any,
      dimensions_config: config.dimensions_config as any,
      classifications_config: config.classifications_config as any,
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
        metadata: { key: "organizational_dna", version: nextVersion, note: changeNote || null } as any,
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
            <h1 className="text-3xl font-bold mt-1 flex items-center gap-3"><Dna className="w-7 h-7 text-[#F88A2B]" /> DNA Organizacional</h1>
            <p className="text-sm text-slate-500 mt-1">Ajuste dimensões, classificações, estrutura, tom e limites do diagnóstico executivo.</p>
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
        {tab === "dimensions" && <DimensionsTab config={config} setConfig={setConfig} />}
        {tab === "structure" && <StructureTab config={config} setConfig={setConfig} />}
        {tab === "classifications" && <ClassificationsTab config={config} setConfig={setConfig} />}
        {tab === "recommendations" && <RecommendationsTab recCfg={recCfg} setRecCfg={setRecCfg} maxRec={config.tone_config.max_recommendations} onMaxChange={(v) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, max_recommendations: v } } : c)} />}
        {tab === "model" && <ModelTab config={config} setConfig={setConfig} />}
        {tab === "test" && <TestTab configVersion={config.version} configStatus={config.status} />}
        {tab === "history" && <HistoryTab versions={versions} currentVersion={config.version} />}

        {(tab !== "test" && tab !== "history") && (
          <Card>
            <Label>Nota da alteração (opcional)</Label>
            <Input value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Ex.: Ajustado peso da recuperação e novo limite de 4 recomendações." />
            <p className="mt-2 text-xs text-slate-500">A nota é registrada junto ao snapshot ao publicar.</p>
          </Card>
        )}
      </div>
    </PlatformAdminLayout>
  );
}

function BehaviorTab({ config, setConfig }: { config: DnaConfig; setConfig: React.Dispatch<React.SetStateAction<DnaConfig | null>> }) {
  const t = config.tone_config;
  const upd = (patch: Partial<ToneConfig>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, ...patch } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Tom e detalhe</h3>
        <div className="space-y-4">
          <div><Label>Tom</Label><Select value={t.tone} onChange={(v) => upd({ tone: v })} options={TONE_OPTS} /></div>
          <div><Label>Nível de detalhe</Label><Select value={t.detail} onChange={(v) => upd({ detail: v })} options={DETAIL_OPTS} /></div>
          <div><Label>Formalidade</Label><Select value={t.formality} onChange={(v) => upd({ formality: v })} options={FORMALITY_OPTS} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Máx. forças</Label><Input type="number" min={1} max={10} value={t.max_strengths} onChange={(e) => upd({ max_strengths: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} /></div>
            <div><Label>Máx. riscos</Label><Input type="number" min={1} max={10} value={t.max_risks} onChange={(e) => upd({ max_risks: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} /></div>
            <div><Label>Máx. recomend.</Label><Input type="number" min={1} max={10} value={t.max_recommendations} onChange={(e) => upd({ max_recommendations: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} /></div>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Composição da resposta</h3>
        <div className="space-y-1">
          <Row label="Incluir tensões"><Toggle checked={t.include_tensions} onChange={(v) => upd({ include_tensions: v })} /></Row>
          <Row label="Incluir oportunidades"><Toggle checked={t.include_opportunities} onChange={(v) => upd({ include_opportunities: v })} /></Row>
          <Row label="Incluir plano inicial"><Toggle checked={t.include_initial_plan} onChange={(v) => upd({ include_initial_plan: v })} /></Row>
          <Row label="Incluir riscos"><Toggle checked={t.include_risks} onChange={(v) => upd({ include_risks: v })} /></Row>
          <Row label="Incluir evidências"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Incluir confiança"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Incluir limitações"><Toggle checked disabled hint="Obrigatório" /></Row>
        </div>
      </Card>
      <Card className="md:col-span-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Instruções e prompt base</h3>
        <div className="space-y-4">
          <div><Label>Instruções adicionais (opcional)</Label><Textarea rows={4} value={t.extra_instructions} onChange={(e) => upd({ extra_instructions: e.target.value })} placeholder="Ex.: Priorize evidências recentes; conecte tensões a ações do Motor de Impacto." /></div>
          <div><Label>Prompt base do assistente</Label><Textarea rows={7} value={config.system_instructions} onChange={(e) => setConfig((c) => c ? { ...c, system_instructions: e.target.value } : c)} /></div>
        </div>
      </Card>
    </div>
  );
}

function DimensionsTab({ config, setConfig }: { config: DnaConfig; setConfig: React.Dispatch<React.SetStateAction<DnaConfig | null>> }) {
  const list = [...config.dimensions_config].sort((a, b) => a.order - b.order);
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...list]; const j = idx + dir; if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    next.forEach((d, i) => (d.order = i + 1));
    setConfig((c) => c ? { ...c, dimensions_config: next } : c);
  };
  const upd = (idx: number, patch: Partial<Dimension>) => {
    const next = [...list]; next[idx] = { ...next[idx], ...patch };
    setConfig((c) => c ? { ...c, dimensions_config: next } : c);
  };
  const addDim = () => {
    const key = `custom_${Math.random().toString(36).slice(2, 7)}`;
    setConfig((c) => c ? { ...c, dimensions_config: [...c.dimensions_config, { key, label: "Nova dimensão", description: "", active: true, weight: 1, order: c.dimensions_config.length + 1 }] } : c);
  };
  const removeDim = (idx: number) => {
    const d = list[idx]; if (REQUIRED_DIMENSIONS.has(d.key)) { toast.error("Dimensão obrigatória não pode ser removida."); return; }
    const next = list.filter((_, i) => i !== idx); next.forEach((x, i) => (x.order = i + 1));
    setConfig((c) => c ? { ...c, dimensions_config: next } : c);
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Dimensões avaliadas</h3>
        <button onClick={addDim} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"><Plus className="w-3.5 h-3.5" /> Adicionar</button>
      </div>
      <ul className="space-y-2">
        {list.map((d, i) => (
          <li key={d.key} className="border border-slate-200 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-1">
                <button onClick={() => move(i, -1)} className="p-1 rounded hover:bg-slate-100"><ArrowUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => move(i, 1)} className="p-1 rounded hover:bg-slate-100"><ArrowDown className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input value={d.label} onChange={(e) => upd(i, { label: e.target.value })} />
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wide">{d.key}</span>
                  {REQUIRED_DIMENSIONS.has(d.key) && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">Obrigatória</span>}
                </div>
                <Textarea rows={2} value={d.description ?? ""} onChange={(e) => upd(i, { description: e.target.value })} placeholder="Descrição da dimensão" />
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2"><span className="text-slate-500">Peso</span><input type="number" min={0.1} max={5} step={0.1} value={d.weight} onChange={(e) => upd(i, { weight: Number(e.target.value) || 1 })} className="w-20 rounded border border-slate-300 px-2 py-1" /></label>
                  <label className="flex items-center gap-2"><span className="text-slate-500">Ativa</span><Toggle checked={d.active} onChange={(v) => { if (!v && REQUIRED_DIMENSIONS.has(d.key)) { toast.error("Dimensão obrigatória"); return; } upd(i, { active: v }); }} disabled={REQUIRED_DIMENSIONS.has(d.key)} /></label>
                  <button onClick={() => removeDim(i)} className="ml-auto inline-flex items-center gap-1 text-red-600 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /> Remover</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StructureTab({ config, setConfig }: { config: DnaConfig; setConfig: React.Dispatch<React.SetStateAction<DnaConfig | null>> }) {
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
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Blocos do relatório</h3>
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

function ClassificationsTab({ config, setConfig }: { config: DnaConfig; setConfig: React.Dispatch<React.SetStateAction<DnaConfig | null>> }) {
  const list = [...config.classifications_config].sort((a, b) => a.min - b.min);
  const upd = (idx: number, patch: Partial<Classification>) => {
    const next = [...list]; next[idx] = { ...next[idx], ...patch };
    setConfig((c) => c ? { ...c, classifications_config: next } : c);
  };
  const add = () => {
    const last = list[list.length - 1]; const nextMin = last ? Math.min(100, last.max + 1) : 0;
    setConfig((c) => c ? { ...c, classifications_config: [...c.classifications_config, { min: nextMin, max: 100, label: "Nova faixa" }] } : c);
  };
  const remove = (idx: number) => {
    setConfig((c) => c ? { ...c, classifications_config: c.classifications_config.filter((_, i) => i !== idx) } : c);
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Faixas de classificação</h3>
        <button onClick={add} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"><Plus className="w-3.5 h-3.5" /> Adicionar faixa</button>
      </div>
      <p className="text-xs text-slate-500 mb-3">As faixas devem cobrir 0 a 100 sem lacunas nem sobreposição.</p>
      <ul className="space-y-2">
        {list.map((c, i) => (
          <li key={i} className="grid grid-cols-12 gap-2 items-center border border-slate-200 rounded-xl p-3">
            <div className="col-span-2"><Label>Mín</Label><Input type="number" min={0} max={100} value={c.min} onChange={(e) => upd(i, { min: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></div>
            <div className="col-span-2"><Label>Máx</Label><Input type="number" min={0} max={100} value={c.max} onChange={(e) => upd(i, { max: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></div>
            <div className="col-span-3"><Label>Label</Label><Input value={c.label} onChange={(e) => upd(i, { label: e.target.value })} /></div>
            <div className="col-span-4"><Label>Descrição</Label><Input value={c.description ?? ""} onChange={(e) => upd(i, { description: e.target.value })} /></div>
            <div className="col-span-1 flex justify-end pt-5"><button onClick={() => remove(i)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function RecommendationsTab({ recCfg, setRecCfg, maxRec, onMaxChange }: { recCfg: RecommendationsConfig; setRecCfg: React.Dispatch<React.SetStateAction<RecommendationsConfig>>; maxRec: number; onMaxChange: (v: number) => void }) {
  const upd = (patch: Partial<RecommendationsConfig>) => setRecCfg((r) => ({ ...r, ...patch }));
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Limites</h3>
        <div className="space-y-4">
          <div><Label>Máximo de recomendações (1–10)</Label><Input type="number" min={1} max={10} value={maxRec} onChange={(e) => onMaxChange(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} /></div>
          <div><Label>Instruções adicionais para recomendações</Label><Textarea rows={4} value={recCfg.extra_instructions} onChange={(e) => upd({ extra_instructions: e.target.value })} placeholder="Ex.: Priorize ações com evidência quantitativa e horizonte de 30 dias." /></div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Campos exigidos</h3>
        <div className="space-y-1">
          <Row label="Exigir responsável"><Toggle checked={recCfg.require_owner} onChange={(v) => upd({ require_owner: v })} /></Row>
          <Row label="Exigir prazo"><Toggle checked={recCfg.require_deadline} onChange={(v) => upd({ require_deadline: v })} /></Row>
          <Row label="Exigir esforço"><Toggle checked={recCfg.require_effort} onChange={(v) => upd({ require_effort: v })} /></Row>
          <Row label="Exigir impacto"><Toggle checked={recCfg.require_impact} onChange={(v) => upd({ require_impact: v })} /></Row>
          <Row label="Exigir métricas"><Toggle checked={recCfg.require_metric} onChange={(v) => upd({ require_metric: v })} /></Row>
          <Row label="Priorizar baixo esforço / alto impacto"><Toggle checked={recCfg.prefer_low_effort_high_impact} onChange={(v) => upd({ prefer_low_effort_high_impact: v })} /></Row>
        </div>
      </Card>
    </div>
  );
}

function ModelTab({ config, setConfig }: { config: DnaConfig; setConfig: React.Dispatch<React.SetStateAction<DnaConfig | null>> }) {
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
          <div className="col-span-2"><Row label="Streaming (quando suportado)"><Toggle checked={m.streaming} onChange={(v) => upd({ streaming: v })} /></Row></div>
        </div>
        <p className="mt-3 text-xs text-slate-500">A chave da API nunca é exposta e permanece no backend.</p>
      </Card>
    </div>
  );
}

type OrgOpt = { id: string; name: string };
type TestMetrics = {
  model: string; elapsed_ms: number; tokens_in: number; tokens_out: number;
  tokens_total: number; estimated_cost_usd: number;
  config_source: string; config_version: number | null; config_status: string;
};

function TestTab({ configVersion, configStatus }: { configVersion: number; configStatus: string }) {
  const [orgs, setOrgs] = useState<OrgOpt[]>([]);
  const [orgId, setOrgId] = useState<string>("");
  const [days, setDays] = useState<number>(90);
  const [source, setSource] = useState<"draft" | "published">("draft");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<TestMetrics | null>(null);
  const [view, setView] = useState<"preview" | "json">("preview");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("organizations").select("id, name").order("name").limit(200);
      const list = (data ?? []) as OrgOpt[];
      setOrgs(list);
      if (list.length && !orgId) setOrgId(list[0].id);
    })();
    // eslint-disable-next-line
  }, []);

  async function run() {
    if (!orgId) { toast.error("Selecione uma empresa."); return; }
    setRunning(true); setError(null); setReport(null); setMetrics(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-organizational-dna", {
        body: { organization_id: orgId, days, test_mode: true, config_source: source },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setReport((data as any).report);
      setMetrics((data as any).metrics);
      toast.success("Geração de teste concluída");
    } catch (e: any) {
      const msg = e?.message ?? "Falha na geração de teste";
      setError(msg); toast.error(msg);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-4 h-4 text-[#F88A2B]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Testar geração isolada</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Executa a geração do DNA em modo teste (sem persistir relatório) usando dados agregados reais da empresa. Restrito a Super Admins.
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label>Empresa</Label>
            <select value={orgId} onChange={(e) => setOrgId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              {orgs.length === 0 && <option value="">— sem empresas —</option>}
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Janela (dias)</Label>
            <Input type="number" min={7} max={365} value={days} onChange={(e) => setDays(Math.max(7, Math.min(365, Number(e.target.value) || 90)))} />
          </div>
          <div>
            <Label>Configuração</Label>
            <Select value={source} onChange={(v) => setSource(v as "draft" | "published")}
              options={[
                { value: "draft", label: `Rascunho atual (v${configVersion} ${configStatus})` },
                { value: "published", label: "Última publicada" },
              ]}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Guardrails imutáveis aplicados no backend. Nenhum dado individual é acessado.
          </p>
          <button onClick={run} disabled={running || !orgId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-semibold hover:brightness-105 disabled:opacity-50">
            <Play className="w-4 h-4" /> {running ? "Gerando…" : "Executar teste"}
          </button>
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50/40">
          <div className="flex items-start gap-2 text-red-800">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Erro na geração</p>
              <p className="text-xs mt-1 break-all">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {metrics && (
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Métricas da execução
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Metric icon={<Cpu className="w-3.5 h-3.5" />} label="Modelo" value={metrics.model.split("/").pop() ?? metrics.model} />
            <Metric icon={<Clock className="w-3.5 h-3.5" />} label="Latência" value={`${(metrics.elapsed_ms / 1000).toFixed(2)}s`} />
            <Metric icon={<Hash className="w-3.5 h-3.5" />} label="Tokens in" value={metrics.tokens_in.toLocaleString("pt-BR")} />
            <Metric icon={<Hash className="w-3.5 h-3.5" />} label="Tokens out" value={metrics.tokens_out.toLocaleString("pt-BR")} />
            <Metric icon={<Hash className="w-3.5 h-3.5" />} label="Total" value={metrics.tokens_total.toLocaleString("pt-BR")} />
            <Metric icon={<DollarSign className="w-3.5 h-3.5" />} label="Custo est." value={`$${metrics.estimated_cost_usd.toFixed(4)}`} />
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Config: <b>{metrics.config_source}</b> · v{metrics.config_version ?? "?"} · status <b>{metrics.config_status}</b>
          </div>
        </Card>
      )}

      {report && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Preview do relatório</h3>
            <div className="flex items-center gap-1 text-xs">
              <button onClick={() => setView("preview")}
                className={`px-3 py-1.5 rounded-lg font-semibold ${view === "preview" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>Preview</button>
              <button onClick={() => setView("json")}
                className={`px-3 py-1.5 rounded-lg font-semibold ${view === "json" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>JSON</button>
            </div>
          </div>
          {view === "preview" ? <ReportPreview report={report} /> : (
            <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-4 overflow-auto max-h-[560px]">{JSON.stringify(report, null, 2)}</pre>
          )}
        </Card>
      )}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">{icon}{label}</div>
      <div className="text-sm font-bold text-slate-800 mt-1 truncate" title={value}>{value}</div>
    </div>
  );
}

function ReportPreview({ report }: { report: any }) {
  const dims = Array.isArray(report?.dimensions) ? report.dimensions : [];
  const recs = Array.isArray(report?.recommendations) ? report.recommendations : [];
  const risks = Array.isArray(report?.risks) ? report.risks : [];
  const lims = Array.isArray(report?.limitations) ? report.limitations : [];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F88A2B] to-amber-500 text-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider font-semibold">Score</div>
            <div className="text-2xl font-black">{report?.overall_score ?? "—"}</div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Identidade organizacional</p>
          <p className="text-sm font-semibold text-slate-800">{report?.organizational_identity ?? "—"}</p>
          <p className="text-xs text-slate-600 mt-1">Confiança: {report?.confidence ?? "—"} · {report?.confidence_reason ?? ""}</p>
        </div>
      </div>
      {report?.executive_summary && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Sumário executivo</p>
          <p className="text-sm text-slate-700 leading-relaxed">{report.executive_summary}</p>
        </div>
      )}
      {dims.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Dimensões</p>
          <div className="grid md:grid-cols-2 gap-2">
            {dims.map((d: any, i: number) => (
              <div key={i} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">{d.label ?? d.key}</span>
                  <span className="text-xs font-bold text-[#F88A2B]">{d.score ?? "n/d"}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{d.classification ?? ""} · confiança {d.confidence ?? "—"}</div>
                {Array.isArray(d.evidence) && d.evidence.length > 0 && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{d.evidence[0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {risks.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Riscos</p>
          <ul className="space-y-1.5">
            {risks.slice(0, 6).map((r: any, i: number) => (
              <li key={i} className="text-xs text-slate-700 border-l-2 border-red-400 pl-2">
                <b>{r.title}</b> <span className="text-[10px] uppercase text-red-600">[{r.level}]</span> — {r.evidence}
              </li>
            ))}
          </ul>
        </div>
      )}
      {recs.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Recomendações</p>
          <ol className="space-y-1.5 list-decimal list-inside">
            {recs.slice(0, 8).map((r: any, i: number) => (
              <li key={i} className="text-xs text-slate-700">
                <b>{r.title}</b> <span className="text-[10px] text-slate-500">({r.priority} · esforço {r.effort} · impacto {r.impact})</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {lims.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Limitações</p>
          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
            {lims.map((l: string, i: number) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function HistoryTab({ versions, currentVersion }: { versions: VersionRow[]; currentVersion: number }) {
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
      <p className="mt-3 text-xs text-slate-500 flex items-center gap-1"><Wand2 className="w-3.5 h-3.5" /> Restauração e comparação A × B chegam na Sub-fase C.</p>
    </Card>
  );
}
