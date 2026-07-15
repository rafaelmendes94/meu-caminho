import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { MessageSquare, Layers, Cpu, ShieldCheck, Save, Send, Sparkles, Lock, Loader2, History, Play } from "lucide-react";

type Dim = { key: string; label: string; active: boolean };
type ToneCfg = {
  tone: string;
  min_user_turns: number;
  max_words: number;
  reinforce_privacy: boolean;
  one_question_at_a_time: boolean;
  initial_message: string;
  profile_prompt: string;
};
type ModelCfg = {
  chat_model: string;
  profile_model: string;
  fallback_model: string;
  temperature: number;
  max_tokens: number;
  timeout_seconds: number;
};
type Cfg = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  system_instructions: string;
  tone_config: ToneCfg;
  guardrails: string[];
  model_config: ModelCfg;
  dimensions_config: Dim[];
  version: number;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
};
type VersionRow = { id: string; version: number; change_note: string | null; created_at: string };

const TONE_OPTS = [
  { value: "acolhedor", label: "Acolhedor" },
  { value: "coloquial", label: "Coloquial" },
  { value: "consultivo", label: "Consultivo" },
  { value: "direto", label: "Direto" },
];
const MODEL_OPTS = [
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
];

const TABS = [
  { id: "behavior", label: "Comportamento", icon: MessageSquare },
  { id: "dimensions", label: "Dimensoes", icon: Layers },
  { id: "model", label: "Modelo & Limites", icon: Cpu },
  { id: "guardrails", label: "Guardrails", icon: ShieldCheck },
  { id: "profile", label: "Geracao de Perfil", icon: Sparkles },
  { id: "history", label: "Historico", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}
function L({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{children}</label>;
}
function I(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/40 ${props.className ?? ""}`} />;
}
function T(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/40 ${props.className ?? ""}`} />;
}
function S({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/40">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Toggle({ checked, onChange }: { checked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange?.(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-[#F88A2B]" : "bg-slate-300"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}
function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "emerald" | "amber" }) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold ${map[tone]}`}>{children}</span>;
}

export default function PlatformOnboardingConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [config, setConfig] = useState<Cfg | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [tab, setTab] = useState<TabId>("behavior");
  const [changeNote, setChangeNote] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("ai_prompt_configs").select("*").eq("key", "onboarding").maybeSingle();
    if (error || !data) { toast.error("Falha ao carregar configuracao do Onboarding"); setLoading(false); return; }
    setConfig(data as unknown as Cfg);
    const { data: v } = await supabase.from("ai_prompt_versions")
      .select("id, version, change_note, created_at")
      .eq("prompt_config_id", (data as any).id).order("version", { ascending: false }).limit(50);
    setVersions((v ?? []) as VersionRow[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function validate(): string | null {
    if (!config) return "Config nao carregada.";
    const m = config.model_config, t = config.tone_config;
    if (!config.system_instructions?.trim()) return "System prompt nao pode ficar vazio.";
    if (!m.chat_model) return "Modelo do chat e obrigatorio.";
    if (!m.profile_model) return "Modelo do perfil e obrigatorio.";
    if (m.temperature < 0 || m.temperature > 1) return "Temperatura entre 0 e 1.";
    if (m.max_tokens < 128 || m.max_tokens > 4000) return "Max tokens entre 128 e 4000.";
    if (t.min_user_turns < 1 || t.min_user_turns > 20) return "Turnos minimos entre 1 e 20.";
    if ((config.dimensions_config ?? []).filter(d => d.active).length === 0) return "Ative ao menos 1 dimensao.";
    return null;
  }

  async function saveDraft() {
    if (!config) return;
    const err = validate(); if (err) { toast.error(err); return; }
    setSaving(true);
    const { error } = await supabase.from("ai_prompt_configs").update({
      system_instructions: config.system_instructions,
      tone_config: config.tone_config as any,
      model_config: config.model_config as any,
      guardrails: config.guardrails as any,
      dimensions_config: config.dimensions_config as any,
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
    const next = config.version + 1;
    const { error: upErr } = await supabase.from("ai_prompt_configs").update({
      system_instructions: config.system_instructions,
      tone_config: config.tone_config as any,
      model_config: config.model_config as any,
      guardrails: config.guardrails as any,
      dimensions_config: config.dimensions_config as any,
      version: next, status: "published", published_at: new Date().toISOString(),
    }).eq("id", config.id);
    if (upErr) { setPublishing(false); toast.error("Falha ao publicar"); return; }
    const { data: fresh } = await supabase.from("ai_prompt_configs").select("*").eq("id", config.id).maybeSingle();
    await supabase.from("ai_prompt_versions").insert({
      prompt_config_id: config.id, version: next, snapshot: fresh as any,
      change_note: changeNote || "Publicacao de nova versao.",
    });
    try {
      const { data: userRes } = await supabase.auth.getUser();
      await supabase.from("platform_audit_logs").insert({
        actor_user_id: userRes.user?.id ?? null,
        action: "ai_prompt_published", entity_type: "ai_prompt_configs", entity_id: config.id,
        metadata: { key: "onboarding", version: next, note: changeNote || null } as any,
      });
    } catch {}
    setPublishing(false); setChangeNote("");
    toast.success(`Versao ${next} publicada`);
    void load();
  }

  if (loading || !config) {
    return <PlatformAdminLayout><div className="text-sm text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div></PlatformAdminLayout>;
  }

  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#F88A2B] font-semibold">Inteligencia Artificial</p>
            <h1 className="text-3xl font-bold mt-1 flex items-center gap-3"><MessageSquare className="w-7 h-7 text-[#F88A2B]" /> Onboarding Conversacional</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">Entrevista adaptativa que o colaborador vive ao entrar. Configura tom, dimensoes exploradas, modelo, guardrails e o prompt de geracao do Perfil Inteligente.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Versao publicada</p>
              <p className="text-lg font-bold text-slate-800">v{config.version}
                <span className="ml-2"><Pill tone={config.status === "published" ? "emerald" : "amber"}>{config.status}</Pill></span>
              </p>
            </div>
            <button onClick={saveDraft} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar rascunho"}
            </button>
            <button onClick={publish} disabled={publishing} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F88A2B] text-black text-sm font-semibold hover:brightness-105 disabled:opacity-50">
              <Send className="w-4 h-4" /> {publishing ? "Publicando..." : "Publicar versao"}
            </button>
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Guardrails ativos</h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-1.5 text-sm text-amber-900/90">
            {(config.guardrails ?? []).map((g, i) => <li key={i} className="flex gap-2"><span className="text-amber-600">-</span>{g}</li>)}
          </ul>
        </Card>

        <div className="border-b border-slate-200 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t.id ? "border-[#F88A2B] text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "behavior" && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">System prompt da entrevista</h3>
              <T rows={9} value={config.system_instructions}
                 onChange={(e) => setConfig(c => c ? { ...c, system_instructions: e.target.value } : c)} />
              <p className="text-xs text-slate-500 mt-2">Este texto e enviado como mensagem system a cada turno da conversa.</p>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Tom & ritmo</h3>
                <div className="space-y-4">
                  <div><L>Tom</L>
                    <S value={config.tone_config.tone} onChange={(v) => setConfig(c => c ? { ...c, tone_config: { ...c.tone_config, tone: v } } : c)} options={TONE_OPTS} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><L>Turnos minimos p/ finalizar</L>
                      <I type="number" min={1} max={20} value={config.tone_config.min_user_turns}
                         onChange={(e) => setConfig(c => c ? { ...c, tone_config: { ...c.tone_config, min_user_turns: Math.min(20, Math.max(1, Number(e.target.value)||4)) } } : c)} />
                    </div>
                    <div><L>Maximo de palavras/resposta</L>
                      <I type="number" min={40} max={400} value={config.tone_config.max_words}
                         onChange={(e) => setConfig(c => c ? { ...c, tone_config: { ...c.tone_config, max_words: Math.min(400, Math.max(40, Number(e.target.value)||180)) } } : c)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between"><span className="text-sm text-slate-700">1 pergunta por resposta</span>
                    <Toggle checked={config.tone_config.one_question_at_a_time} onChange={(v) => setConfig(c => c ? { ...c, tone_config: { ...c.tone_config, one_question_at_a_time: v } } : c)} />
                  </div>
                  <div className="flex items-center justify-between"><span className="text-sm text-slate-700">Reforcar privacidade</span>
                    <Toggle checked={config.tone_config.reinforce_privacy} onChange={(v) => setConfig(c => c ? { ...c, tone_config: { ...c.tone_config, reinforce_privacy: v } } : c)} />
                  </div>
                </div>
              </Card>
              <Card>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Mensagem inicial da IA</h3>
                <T rows={7} value={config.tone_config.initial_message}
                   onChange={(e) => setConfig(c => c ? { ...c, tone_config: { ...c.tone_config, initial_message: e.target.value } } : c)} />
                <p className="text-xs text-slate-500 mt-2">Exibida ao colaborador antes de qualquer resposta.</p>
              </Card>
            </div>
          </div>
        )}

        {tab === "dimensions" && (
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Dimensoes exploradas pela entrevista</h3>
            <p className="text-xs text-slate-500 mb-4">A IA usa essas dimensoes como bussola. Desative para tirar do escopo (ex.: se sua empresa nao quer explorar lideranca).</p>
            <div className="space-y-2">
              {(config.dimensions_config ?? []).map((d, i) => (
                <div key={d.key} className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3">
                  <div className="flex-1">
                    <I value={d.label} onChange={(e) => setConfig(c => {
                      if (!c) return c;
                      const arr = [...c.dimensions_config]; arr[i] = { ...arr[i], label: e.target.value };
                      return { ...c, dimensions_config: arr };
                    })} />
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">chave: {d.key}</p>
                  </div>
                  <Toggle checked={d.active} onChange={(v) => setConfig(c => {
                    if (!c) return c;
                    const arr = [...c.dimensions_config]; arr[i] = { ...arr[i], active: v };
                    return { ...c, dimensions_config: arr };
                  })} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "model" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Modelos</h3>
              <div className="space-y-4">
                <div><L>Modelo do chat (entrevista)</L>
                  <S value={config.model_config.chat_model} onChange={(v) => setConfig(c => c ? { ...c, model_config: { ...c.model_config, chat_model: v } } : c)} options={MODEL_OPTS} />
                </div>
                <div><L>Modelo de geracao do Perfil Inteligente</L>
                  <S value={config.model_config.profile_model} onChange={(v) => setConfig(c => c ? { ...c, model_config: { ...c.model_config, profile_model: v } } : c)} options={MODEL_OPTS} />
                </div>
                <div><L>Fallback</L>
                  <S value={config.model_config.fallback_model} onChange={(v) => setConfig(c => c ? { ...c, model_config: { ...c.model_config, fallback_model: v } } : c)} options={MODEL_OPTS} />
                </div>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Limites</h3>
              <div className="space-y-4">
                <div><L>Temperatura ({config.model_config.temperature})</L>
                  <input type="range" min={0} max={1} step={0.05} value={config.model_config.temperature} className="w-full accent-[#F88A2B]"
                         onChange={(e) => setConfig(c => c ? { ...c, model_config: { ...c.model_config, temperature: Number(e.target.value) } } : c)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><L>Max tokens</L>
                    <I type="number" min={128} max={4000} value={config.model_config.max_tokens}
                       onChange={(e) => setConfig(c => c ? { ...c, model_config: { ...c.model_config, max_tokens: Math.min(4000, Math.max(128, Number(e.target.value)||800)) } } : c)} />
                  </div>
                  <div><L>Timeout (s)</L>
                    <I type="number" min={10} max={180} value={config.model_config.timeout_seconds}
                       onChange={(e) => setConfig(c => c ? { ...c, model_config: { ...c.model_config, timeout_seconds: Math.min(180, Math.max(10, Number(e.target.value)||60)) } } : c)} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "guardrails" && (
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Regras invioláveis</h3>
            <p className="text-xs text-slate-500 mb-4">Cada linha vira uma regra enviada ao modelo. Uma por linha.</p>
            <T rows={10} value={(config.guardrails ?? []).join("\n")}
               onChange={(e) => setConfig(c => c ? { ...c, guardrails: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) } : c)} />
          </Card>
        )}

        {tab === "profile" && (
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Prompt de geracao do Perfil Inteligente</h3>
            <p className="text-xs text-slate-500 mb-4">Usado pela funcao <code>generate-employee-profile</code> ao final da entrevista. A estrutura JSON de saida (6 dimensoes) e fixa.</p>
            <T rows={12} value={config.tone_config.profile_prompt}
               onChange={(e) => setConfig(c => c ? { ...c, tone_config: { ...c.tone_config, profile_prompt: e.target.value } } : c)} />
          </Card>
        )}

        {tab === "history" && (
          <Card>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Historico de versoes</h3>
            {versions.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma versao publicada ainda.</p>
            ) : (
              <div className="divide-y divide-slate-200">
                {versions.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">v{v.version}</p>
                      <p className="text-xs text-slate-500">{v.change_note || "(sem nota)"}</p>
                    </div>
                    <p className="text-xs text-slate-400">{new Date(v.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab !== "history" && (
          <Card>
            <L>Nota da alteracao (opcional)</L>
            <I value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Ex.: aumentei turnos minimos para 5 e reforcei tom acolhedor." />
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1"><Play className="w-3 h-3" /> A nota fica no snapshot da versao publicada e no audit log.</p>
          </Card>
        )}
      </div>
    </PlatformAdminLayout>
  );
}