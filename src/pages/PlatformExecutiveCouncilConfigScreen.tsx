import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import {
  Lock, Save, Send, Plus, Trash2, ArrowUp, ArrowDown, Sparkles,
  ShieldCheck, MessageSquare, ListChecks, FlaskConical, Cpu, History, Bot,
} from "lucide-react";

type ToneConfig = {
  tone: string;
  detail: string;
  formality: string;
  max_recommendations: number;
  include_risks: boolean;
  include_opportunities: boolean;
  include_limitations: boolean;
  include_confidence: boolean;
  include_evidence: boolean;
  extra_instructions: string;
};

type StructureBlock = {
  key: string;
  title: string;
  description: string;
  active: boolean;
  order: number;
  required?: boolean;
};

type SuggestedQuestion = { id: string; text: string; active: boolean; order: number };
type Example = { id: string; question: string; expected_behavior: string; notes?: string; active: boolean };

type ModelConfig = {
  primary_model: string;
  fallback_model: string;
  temperature: number;
  max_tokens: number;
  timeout_seconds: number;
  json_retries: number;
  streaming: boolean;
};

type PromptConfig = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  system_instructions: string;
  tone_config: ToneConfig;
  output_structure: StructureBlock[];
  suggested_questions: SuggestedQuestion[];
  examples: Example[];
  guardrails: string[];
  model_config: ModelConfig;
  version: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};

type VersionRow = {
  id: string;
  version: number;
  change_note: string | null;
  created_at: string;
  created_by: string | null;
};

const TABS = [
  { id: "behavior", label: "Comportamento", icon: MessageSquare },
  { id: "structure", label: "Estrutura da Resposta", icon: ListChecks },
  { id: "questions", label: "Perguntas Sugeridas", icon: Sparkles },
  { id: "examples", label: "Exemplos", icon: FlaskConical },
  { id: "model", label: "Modelo e Limites", icon: Cpu },
  { id: "chat", label: "Testar no Chat", icon: Bot },
  { id: "history", label: "Histórico de Versões", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

const TONE_OPTIONS = [
  { value: "executivo", label: "Executivo" },
  { value: "estrategico", label: "Estratégico" },
  { value: "consultivo", label: "Consultivo" },
  { value: "direto", label: "Direto" },
  { value: "humano", label: "Humano" },
];
const DETAIL_OPTIONS = [
  { value: "resumido", label: "Resumido" },
  { value: "equilibrado", label: "Equilibrado" },
  { value: "detalhado", label: "Detalhado" },
];
const FORMALITY_OPTIONS = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
];
const MODEL_OPTIONS = [
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "openai/gpt-5.5", label: "GPT-5.5" },
];

function uid() {
  return (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/40 ${props.className ?? ""}`}
    />
  );
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/40 ${props.className ?? ""}`}
    />
  );
}
function Select({ value, onChange, options, className = "" }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/40 ${className}`}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Toggle({ checked, onChange, disabled, hint }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; hint?: string }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-[#F88A2B]" : "bg-slate-300"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
}

export default function PlatformExecutiveCouncilConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [config, setConfig] = useState<PromptConfig | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [tab, setTab] = useState<TabId>("behavior");
  const [changeNote, setChangeNote] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_prompt_configs")
      .select("*")
      .eq("key", "executive_council")
      .maybeSingle();
    if (error) { toast.error("Falha ao carregar configuração"); setLoading(false); return; }
    setConfig(data as unknown as PromptConfig);
    const { data: v } = await supabase
      .from("ai_prompt_versions")
      .select("id, version, change_note, created_at, created_by")
      .eq("prompt_config_id", (data as any).id)
      .order("version", { ascending: false })
      .limit(50);
    setVersions((v ?? []) as VersionRow[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const updateTone = (patch: Partial<ToneConfig>) =>
    setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, ...patch } } : c);
  const updateModel = (patch: Partial<ModelConfig>) =>
    setConfig((c) => c ? { ...c, model_config: { ...c.model_config, ...patch } } : c);

  function validate(): string | null {
    if (!config) return "Configuração não carregada.";
    const t = config.tone_config;
    if (!t.include_evidence || !t.include_confidence || !t.include_limitations)
      return "Evidências, confiança e limitações são obrigatórias.";
    if (t.max_recommendations < 1 || t.max_recommendations > 10)
      return "Máximo de recomendações deve estar entre 1 e 10.";
    const requiredBlocks = ["evidence", "confidence", "limitations"];
    for (const key of requiredBlocks) {
      const b = config.output_structure.find((x) => x.key === key);
      if (!b || !b.active) return `Bloco obrigatório "${key}" precisa estar ativo.`;
    }
    const m = config.model_config;
    if (m.temperature < 0 || m.temperature > 1) return "Temperatura deve estar entre 0 e 1.";
    if (m.max_tokens < 128 || m.max_tokens > 8192) return "Máximo de tokens deve estar entre 128 e 8192.";
    if (m.timeout_seconds < 5 || m.timeout_seconds > 180) return "Timeout deve estar entre 5 e 180s.";
    if (m.json_retries < 0 || m.json_retries > 2) return "Tentativas de correção de JSON devem estar entre 0 e 2.";
    return null;
  }

  async function saveDraft() {
    if (!config) return;
    const err = validate();
    if (err) { toast.error(err); return; }
    setSaving(true);
    const { error } = await supabase
      .from("ai_prompt_configs")
      .update({
        system_instructions: config.system_instructions,
        tone_config: config.tone_config as any,
        output_structure: config.output_structure as any,
        suggested_questions: config.suggested_questions as any,
        examples: config.examples as any,
        model_config: config.model_config as any,
        status: "draft",
      })
      .eq("id", config.id);
    setSaving(false);
    if (error) { toast.error("Falha ao salvar rascunho"); return; }
    toast.success("Rascunho salvo");
    void load();
  }

  async function publish() {
    if (!config) return;
    const err = validate();
    if (err) { toast.error(err); return; }
    setPublishing(true);
    const nextVersion = config.version + 1;
    const { error: upErr } = await supabase
      .from("ai_prompt_configs")
      .update({
        system_instructions: config.system_instructions,
        tone_config: config.tone_config as any,
        output_structure: config.output_structure as any,
        suggested_questions: config.suggested_questions as any,
        examples: config.examples as any,
        model_config: config.model_config as any,
        version: nextVersion,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", config.id);
    if (upErr) { setPublishing(false); toast.error("Falha ao publicar"); return; }
    const { data: fresh } = await supabase.from("ai_prompt_configs").select("*").eq("id", config.id).maybeSingle();
    await supabase.from("ai_prompt_versions").insert({
      prompt_config_id: config.id,
      version: nextVersion,
      snapshot: fresh as any,
      change_note: changeNote || "Publicação de nova versão.",
    });
    try {
      const { data: userRes } = await supabase.auth.getUser();
      await supabase.from("platform_audit_logs").insert({
        actor_user_id: userRes.user?.id ?? null,
        action: "ai_prompt_published",
        entity_type: "ai_prompt_configs",
        entity_id: config.id,
        metadata: { key: config.key, version: nextVersion, note: changeNote || null } as any,
      });
    } catch { /* auditoria não é bloqueadora */ }
    setPublishing(false);
    setChangeNote("");
    toast.success(`Versão ${nextVersion} publicada`);
    void load();
  }

  if (loading || !config) {
    return (
      <PlatformAdminLayout>
        <div className="text-sm text-slate-500">Carregando…</div>
      </PlatformAdminLayout>
    );
  }

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#F88A2B] font-semibold">Inteligência Artificial</p>
            <h1 className="text-3xl font-bold mt-1">Conselho Executivo IA</h1>
            <p className="text-sm text-slate-500 mt-1">Ajuste tom, estrutura, perguntas e limites do assistente estratégico.</p>
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
            <button
              onClick={saveDraft}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Salvando…" : "Salvar rascunho"}
            </button>
            <button
              onClick={publish}
              disabled={publishing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-semibold hover:brightness-105 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {publishing ? "Publicando…" : "Publicar versão"}
            </button>
          </div>
        </div>

        {/* Guardrails locked card */}
        <Card className="border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Regras obrigatórias de segurança</h2>
            <ShieldCheck className="w-4 h-4 text-amber-600 ml-1" />
          </div>
          <ul className="grid md:grid-cols-2 gap-1.5 text-sm text-amber-900/90">
            {config.guardrails.map((g, i) => (
              <li key={i} className="flex gap-2"><span className="text-amber-600">•</span>{g}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-amber-700">Estas regras são aplicadas no backend e não podem ser removidas.</p>
        </Card>

        {/* Tabs */}
        <div className="border-b border-slate-200 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t.id ? "border-[#F88A2B] text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "behavior" && <BehaviorTab config={config} updateTone={updateTone} setConfig={setConfig} />}
        {tab === "structure" && <StructureTab config={config} setConfig={setConfig} />}
        {tab === "questions" && <QuestionsTab config={config} setConfig={setConfig} />}
        {tab === "examples" && <ExamplesTab config={config} setConfig={setConfig} />}
        {tab === "model" && <ModelTab config={config} updateModel={updateModel} />}
        {tab === "chat" && <ChatTestTab configVersion={config.version} configStatus={config.status} />}
        {tab === "history" && <HistoryTab versions={versions} currentVersion={config.version} />}

        {/* Note for publish */}
        {(tab === "behavior" || tab === "structure" || tab === "questions" || tab === "examples" || tab === "model") && (
          <Card>
            <Label>Nota da alteração (opcional)</Label>
            <Input
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="Ex.: Reduzido para 3 recomendações e tom mais direto."
            />
            <p className="mt-2 text-xs text-slate-500">A nota é registrada junto ao snapshot ao publicar.</p>
          </Card>
        )}
      </div>
    </PlatformAdminLayout>
  );
}

/* ============ TABS ============ */

function BehaviorTab({ config, updateTone, setConfig }: {
  config: PromptConfig;
  updateTone: (p: Partial<ToneConfig>) => void;
  setConfig: React.Dispatch<React.SetStateAction<PromptConfig | null>>;
}) {
  const t = config.tone_config;
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Tom e detalhe</h3>
        <div className="space-y-4">
          <div><Label>Tom principal</Label><Select value={t.tone} onChange={(v) => updateTone({ tone: v })} options={TONE_OPTIONS} /></div>
          <div><Label>Nível de detalhe</Label><Select value={t.detail} onChange={(v) => updateTone({ detail: v })} options={DETAIL_OPTIONS} /></div>
          <div><Label>Formalidade</Label><Select value={t.formality} onChange={(v) => updateTone({ formality: v })} options={FORMALITY_OPTIONS} /></div>
          <div>
            <Label>Máximo de recomendações (1–10)</Label>
            <Input type="number" min={1} max={10} value={t.max_recommendations}
              onChange={(e) => updateTone({ max_recommendations: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Composição da resposta</h3>
        <div className="space-y-3">
          <Row label="Incluir riscos"><Toggle checked={t.include_risks} onChange={(v) => updateTone({ include_risks: v })} /></Row>
          <Row label="Incluir oportunidades"><Toggle checked={t.include_opportunities} onChange={(v) => updateTone({ include_opportunities: v })} /></Row>
          <Row label="Incluir limitações"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Incluir nível de confiança"><Toggle checked disabled hint="Obrigatório" /></Row>
          <Row label="Incluir evidências"><Toggle checked disabled hint="Obrigatório" /></Row>
        </div>
      </Card>

      <Card className="md:col-span-2">
        <Label>Instruções adicionais</Label>
        <Textarea rows={4}
          value={t.extra_instructions}
          onChange={(e) => updateTone({ extra_instructions: e.target.value })}
          placeholder="Ex.: Priorize ações de baixo esforço e alto impacto." />
        <div className="mt-6">
          <Label>Instruções do sistema (prompt base)</Label>
          <Textarea rows={8}
            value={config.system_instructions}
            onChange={(e) => setConfig((c) => c ? { ...c, system_instructions: e.target.value } : c)}
          />
          <p className="mt-2 text-xs text-slate-500">Regras de segurança listadas acima são sempre aplicadas no backend, mesmo que não estejam neste texto.</p>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-700">{label}</span>
      {children}
    </div>
  );
}

function StructureTab({ config, setConfig }: {
  config: PromptConfig;
  setConfig: React.Dispatch<React.SetStateAction<PromptConfig | null>>;
}) {
  const blocks = [...config.output_structure].sort((a, b) => a.order - b.order);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    [next[idx], next[to]] = [next[to], next[idx]];
    setConfig((c) => c ? { ...c, output_structure: next.map((b, i) => ({ ...b, order: i + 1 })) } : c);
  };
  const toggle = (idx: number) => {
    const next = [...blocks];
    if (next[idx].required) { toast.error("Bloco obrigatório não pode ser desativado."); return; }
    next[idx] = { ...next[idx], active: !next[idx].active };
    setConfig((c) => c ? { ...c, output_structure: next } : c);
  };
  const updateText = (idx: number, patch: Partial<StructureBlock>) => {
    const next = [...blocks];
    next[idx] = { ...next[idx], ...patch };
    setConfig((c) => c ? { ...c, output_structure: next } : c);
  };

  return (
    <Card>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Blocos da resposta</h3>
      <p className="text-xs text-slate-500 mb-4">Use as setas para reordenar. Blocos com cadeado são obrigatórios.</p>
      <div className="space-y-3">
        {blocks.map((b, i) => (
          <div key={b.key} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1">
                <button onClick={() => move(i, -1)} className="p-1 rounded hover:bg-white"><ArrowUp className="w-4 h-4 text-slate-500" /></button>
                <button onClick={() => move(i, 1)} className="p-1 rounded hover:bg-white"><ArrowDown className="w-4 h-4 text-slate-500" /></button>
              </div>
              <div className="flex-1 grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Título exibido</Label>
                  <Input value={b.title} onChange={(e) => updateText(i, { title: e.target.value })} />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input value={b.description} onChange={(e) => updateText(i, { description: e.target.value })} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  {b.required && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">#{b.order}</span>
                </div>
                <Toggle checked={b.active} onChange={() => toggle(i)} disabled={b.required} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuestionsTab({ config, setConfig }: {
  config: PromptConfig;
  setConfig: React.Dispatch<React.SetStateAction<PromptConfig | null>>;
}) {
  const list = [...config.suggested_questions].sort((a, b) => a.order - b.order);

  const update = (items: SuggestedQuestion[]) =>
    setConfig((c) => c ? { ...c, suggested_questions: items.map((q, i) => ({ ...q, order: i + 1 })) } : c);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Perguntas sugeridas</h3>
        <button
          onClick={() => update([...list, { id: uid(), text: "", active: true, order: list.length + 1 }])}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:brightness-110"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>
      <div className="space-y-2">
        {list.length === 0 && <p className="text-sm text-slate-500">Nenhuma pergunta cadastrada.</p>}
        {list.map((q, i) => (
          <div key={q.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 bg-white">
            <div className="flex flex-col gap-0.5">
              <button onClick={() => { const n = [...list]; if (i > 0) { [n[i], n[i - 1]] = [n[i - 1], n[i]]; update(n); } }} className="p-0.5"><ArrowUp className="w-3.5 h-3.5 text-slate-500" /></button>
              <button onClick={() => { const n = [...list]; if (i < n.length - 1) { [n[i], n[i + 1]] = [n[i + 1], n[i]]; update(n); } }} className="p-0.5"><ArrowDown className="w-3.5 h-3.5 text-slate-500" /></button>
            </div>
            <Input value={q.text} onChange={(e) => { const n = [...list]; n[i] = { ...q, text: e.target.value }; update(n); }} />
            <Toggle checked={q.active} onChange={(v) => { const n = [...list]; n[i] = { ...q, active: v }; update(n); }} />
            <button onClick={() => update(list.filter((x) => x.id !== q.id))} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ExamplesTab({ config, setConfig }: {
  config: PromptConfig;
  setConfig: React.Dispatch<React.SetStateAction<PromptConfig | null>>;
}) {
  const list = config.examples;
  const update = (items: Example[]) => setConfig((c) => c ? { ...c, examples: items } : c);
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Exemplos de comportamento</h3>
          <p className="text-xs text-slate-500 mt-1">Use apenas cenários fictícios. Nunca inclua dados reais de empresas.</p>
        </div>
        <button
          onClick={() => update([...list, { id: uid(), question: "", expected_behavior: "", notes: "", active: true }])}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:brightness-110"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>
      <div className="space-y-3">
        {list.length === 0 && <p className="text-sm text-slate-500">Nenhum exemplo cadastrado.</p>}
        {list.map((ex, i) => (
          <div key={ex.id} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">Exemplo #{i + 1}</span>
              <div className="flex items-center gap-2">
                <Toggle checked={ex.active} onChange={(v) => { const n = [...list]; n[i] = { ...ex, active: v }; update(n); }} />
                <button onClick={() => update(list.filter((x) => x.id !== ex.id))} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div><Label>Pergunta</Label><Input value={ex.question} onChange={(e) => { const n = [...list]; n[i] = { ...ex, question: e.target.value }; update(n); }} /></div>
            <div><Label>Comportamento esperado</Label><Textarea rows={3} value={ex.expected_behavior} onChange={(e) => { const n = [...list]; n[i] = { ...ex, expected_behavior: e.target.value }; update(n); }} /></div>
            <div><Label>Observações</Label><Input value={ex.notes ?? ""} onChange={(e) => { const n = [...list]; n[i] = { ...ex, notes: e.target.value }; update(n); }} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ModelTab({ config, updateModel }: {
  config: PromptConfig;
  updateModel: (p: Partial<ModelConfig>) => void;
}) {
  const m = config.model_config;
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Modelos</h3>
        <div className="space-y-4">
          <div><Label>Modelo principal</Label><Select value={m.primary_model} onChange={(v) => updateModel({ primary_model: v })} options={MODEL_OPTIONS} /></div>
          <div><Label>Modelo fallback</Label><Select value={m.fallback_model} onChange={(v) => updateModel({ fallback_model: v })} options={MODEL_OPTIONS} /></div>
          <div>
            <Label>Streaming</Label>
            <Toggle checked={m.streaming} onChange={(v) => updateModel({ streaming: v })} />
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Limites</h3>
        <div className="space-y-4">
          <div>
            <Label>Temperatura (0–1)</Label>
            <Input type="number" step={0.05} min={0} max={1} value={m.temperature}
              onChange={(e) => updateModel({ temperature: Math.max(0, Math.min(1, Number(e.target.value) || 0)) })} />
          </div>
          <div>
            <Label>Máximo de tokens</Label>
            <Input type="number" min={128} max={8192} value={m.max_tokens}
              onChange={(e) => updateModel({ max_tokens: Number(e.target.value) || 2048 })} />
          </div>
          <div>
            <Label>Timeout (segundos)</Label>
            <Input type="number" min={5} max={180} value={m.timeout_seconds}
              onChange={(e) => updateModel({ timeout_seconds: Number(e.target.value) || 60 })} />
          </div>
          <div>
            <Label>Tentativas de correção de JSON (0–2)</Label>
            <Input type="number" min={0} max={2} value={m.json_retries}
              onChange={(e) => updateModel({ json_retries: Math.max(0, Math.min(2, Number(e.target.value) || 0)) })} />
          </div>
        </div>
      </Card>
      <Card className="md:col-span-2 bg-slate-50/70">
        <p className="text-xs text-slate-500">A chave da API nunca é exibida aqui — permanece armazenada com segurança no backend.</p>
      </Card>
    </div>
  );
}

function ComingSoonTab({ title, description }: { title: string; description: string }) {
  return (
    <Card className="text-center py-14">
      <Sparkles className="mx-auto w-8 h-8 text-slate-400" />
      <h3 className="mt-3 text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">{description}</p>
    </Card>
  );
}

type TestOrg = { id: string; name: string; slug: string };
type TestMetrics = {
  model: string;
  elapsed_ms: number;
  tokens_in: number;
  tokens_out: number;
  tokens_total: number;
  estimated_cost_usd: number;
  config_source: "draft" | "published";
  config_version: number | null;
  config_status: string | null;
};
type TestResponse = {
  answer: string;
  confidence: "low" | "medium" | "high";
  used_sections: string[];
  recommendations: string[];
};
type TestExchange = {
  id: string;
  question: string;
  response?: TestResponse;
  metrics?: TestMetrics;
  error?: string;
  loading: boolean;
};

function ChatTestTab({ configVersion, configStatus }: { configVersion: number; configStatus: string }) {
  const [orgs, setOrgs] = useState<TestOrg[]>([]);
  const [orgId, setOrgId] = useState<string>("");
  const [source, setSource] = useState<"draft" | "published">("draft");
  const [question, setQuestion] = useState("");
  const [exchanges, setExchanges] = useState<TestExchange[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_platform_organizations");
      if (error) { toast.error("Falha ao carregar empresas"); return; }
      const list = ((data ?? []) as any[]).map((o) => ({ id: o.id, name: o.name, slug: o.slug }));
      setOrgs(list);
      if (list.length && !orgId) setOrgId(list[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send() {
    const q = question.trim();
    if (!q) return;
    if (!orgId) { toast.error("Selecione uma empresa para testar."); return; }
    const id = uid();
    setExchanges((prev) => [...prev, { id, question: q, loading: true }]);
    setQuestion("");
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("executive-ai", {
        body: {
          question: q,
          test_mode: true,
          test_organization_id: orgId,
          config_source: source,
        },
      });
      if (error) throw error;
      const payload = data as { response: TestResponse; metrics: TestMetrics; error?: string };
      if ((payload as any)?.error) throw new Error(String((payload as any).error));
      setExchanges((prev) => prev.map((e) => e.id === id
        ? { ...e, loading: false, response: payload.response, metrics: payload.metrics }
        : e));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setExchanges((prev) => prev.map((ex) => ex.id === id ? { ...ex, loading: false, error: msg } : ex));
      toast.error(`Erro no teste: ${msg}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Empresa (contexto agregado)</Label>
            <Select
              value={orgId}
              onChange={setOrgId}
              options={orgs.map((o) => ({ value: o.id, label: o.name }))}
            />
          </div>
          <div>
            <Label>Fonte da configuração</Label>
            <Select
              value={source}
              onChange={(v) => setSource(v as "draft" | "published")}
              options={[
                { value: "draft", label: `Rascunho atual (v${configVersion} · ${configStatus})` },
                { value: "published", label: "Última versão publicada" },
              ]}
            />
          </div>
          <div className="flex items-end">
            <div className="text-xs text-slate-500 leading-relaxed">
              Modo isolado: nenhuma conversa é registrada, nenhum dado individual é acessado.
              Somente o Super Admin executa este teste.
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          {exchanges.length === 0 && (
            <p className="text-sm text-slate-500">
              Envie uma pergunta para simular o Conselho Executivo com a configuração selecionada.
            </p>
          )}
          {exchanges.map((ex) => (
            <div key={ex.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">Pergunta</p>
                <p className="text-sm text-slate-800 mt-1">{ex.question}</p>
              </div>
              {ex.loading && <p className="text-sm text-slate-500">Consultando o Conselho…</p>}
              {ex.error && <p className="text-sm text-rose-600">Erro: {ex.error}</p>}
              {ex.response && (
                <>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">Resposta</p>
                    <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{ex.response.answer}</p>
                  </div>
                  {ex.response.recommendations.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-500">Recomendações</p>
                      <ul className="mt-1 space-y-1 text-sm text-slate-700 list-disc pl-5">
                        {ex.response.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 text-[11px]">
                    <Chip label={`Confiança: ${ex.response.confidence}`} tone={
                      ex.response.confidence === "high" ? "emerald" :
                      ex.response.confidence === "medium" ? "amber" : "slate"
                    } />
                    {ex.metrics && (
                      <>
                        <Chip label={`Modelo: ${ex.metrics.model}`} />
                        <Chip label={`${ex.metrics.elapsed_ms} ms`} />
                        <Chip label={`${ex.metrics.tokens_in} in · ${ex.metrics.tokens_out} out`} />
                        <Chip label={`~ US$ ${ex.metrics.estimated_cost_usd.toFixed(5)}`} />
                        <Chip label={`Config: ${ex.metrics.config_source} v${ex.metrics.config_version ?? "?"}`} />
                      </>
                    )}
                    {ex.response.used_sections.length > 0 && (
                      <Chip label={`Seções: ${ex.response.used_sections.join(", ")}`} />
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Textarea
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex.: Quais riscos organizacionais devo priorizar neste trimestre?"
          />
          <button
            onClick={send}
            disabled={sending || !question.trim() || !orgId}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-semibold hover:brightness-105 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {sending ? "Enviando…" : "Enviar"}
          </button>
          {exchanges.length > 0 && (
            <button
              onClick={() => setExchanges([])}
              className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50"
            >
              Limpar
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Chip({ label, tone = "slate" }: { label: string; tone?: "slate" | "emerald" | "amber" }) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return <span className={`px-2 py-0.5 rounded-full font-semibold ${map[tone]}`}>{label}</span>;
}

function HistoryTab({ versions, currentVersion }: { versions: VersionRow[]; currentVersion: number }) {
  return (
    <Card>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Histórico de versões</h3>
      {versions.length === 0 && <p className="text-sm text-slate-500">Nenhuma versão registrada.</p>}
      <div className="divide-y divide-slate-200">
        {versions.map((v) => (
          <div key={v.id} className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Versão {v.version}
                {v.version === currentVersion && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">atual</span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(v.created_at).toLocaleString("pt-BR")}
                {v.change_note ? ` · ${v.change_note}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">Ações de restauração e comparação serão disponibilizadas na próxima sub-fase.</p>
    </Card>
  );
}