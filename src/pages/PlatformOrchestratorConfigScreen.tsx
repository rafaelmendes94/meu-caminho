import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import {
  Brain, Save, Send, Lock, ShieldCheck, Sparkles, Route as RouteIcon,
  Cpu, Database, DollarSign, Layers, ScrollText, History, Plus, Trash2, Users,
} from "lucide-react";

type Specialist = { key: string; label: string; function: string; active: boolean };
type RoutingRule = { intent: string; keywords: string[]; specialists: string[]; priority: string[] };
type CostRow = { input_per_1k: number; output_per_1k: number };
type ModelCfg = {
  primary_model: string;
  fallback_model: string;
  temperature: number;
  max_tokens: number;
  timeout_seconds: number;
  streaming: boolean;
  cache_ttl_seconds: number;
  cost_table: Record<string, CostRow>;
  specialists: Specialist[];
};
type ToneCfg = {
  routing: RoutingRule[];
  default_specialists: string[];
  consolidation: { dedupe: boolean; max_sections: number; conflict_policy: string };
  confidence: { min_sources: number; ideal_sources: number; weights: Record<string, number> };
  memory: Record<string, number>;
};
type Cfg = {
  id: string; key: string; name: string; description: string | null;
  system_instructions: string;
  tone_config: ToneCfg;
  output_structure: any[];
  guardrails: string[];
  model_config: ModelCfg;
  version: number; status: "draft" | "published" | "archived";
  published_at: string | null; updated_at: string;
};
type VersionRow = { id: string; version: number; change_note: string | null; created_at: string; snapshot?: any };

const MODEL_OPTS = [
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
];

const TABS = [
  { id: "overview", label: "Visão Geral", icon: Brain },
  { id: "specialists", label: "Especialistas", icon: Users },
  { id: "routing", label: "Roteamento", icon: RouteIcon },
  { id: "model", label: "Modelos", icon: Cpu },
  { id: "cache", label: "Cache", icon: Database },
  { id: "costs", label: "Custos", icon: DollarSign },
  { id: "memory", label: "Memória", icon: Layers },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "versions", label: "Versões", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

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
function Toggle({ checked, onChange }: { checked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange?.(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-[#F88A2B]" : "bg-slate-300"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}
function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "emerald" | "amber" | "rose" | "sky" }) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    sky: "bg-sky-100 text-sky-700",
  };
  return <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold ${map[tone]}`}>{children}</span>;
}

export default function PlatformOrchestratorConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [config, setConfig] = useState<Cfg | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [tab, setTab] = useState<TabId>("overview");
  const [changeNote, setChangeNote] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("ai_prompt_configs").select("*").eq("key", "orchestrator").maybeSingle();
    if (error || !data) { toast.error("Falha ao carregar AI Orchestrator"); setLoading(false); return; }
    setConfig(data as unknown as Cfg);
    const { data: v } = await supabase.from("ai_prompt_versions")
      .select("id, version, change_note, created_at, snapshot")
      .eq("prompt_config_id", (data as any).id).order("version", { ascending: false }).limit(50);
    setVersions((v ?? []) as VersionRow[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function validate(): string | null {
    if (!config) return "Config não carregada.";
    const m = config.model_config, t = config.tone_config;
    if (!m.primary_model) return "Modelo principal é obrigatório.";
    if (m.temperature < 0 || m.temperature > 1) return "Temperatura entre 0 e 1.";
    if (m.max_tokens < 256 || m.max_tokens > 8000) return "Máx. tokens entre 256 e 8000.";
    if (m.timeout_seconds < 5 || m.timeout_seconds > 120) return "Timeout entre 5 e 120s.";
    if (m.cache_ttl_seconds < 60 || m.cache_ttl_seconds > 86400) return "TTL do cache entre 60s e 24h.";
    if ((m.specialists ?? []).filter((s) => s.active).length === 0) return "Ao menos um especialista precisa estar ativo.";
    if ((t.routing ?? []).length === 0) return "Defina ao menos uma regra de roteamento.";
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
        metadata: { key: "orchestrator", version: nextVersion, note: changeNote || null } as any,
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
            <h1 className="text-3xl font-bold mt-1 flex items-center gap-3"><Brain className="w-7 h-7 text-[#F88A2B]" /> AI Orchestrator</h1>
            <p className="text-sm text-slate-500 mt-1">Camada que decide qual IA usar, compartilha contexto, evita respostas contraditórias e mantém memória organizacional.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Versão publicada</p>
              <p className="text-lg font-bold text-slate-800">v{config.version}
                <span className="ml-2"><Pill tone={config.status === "published" ? "emerald" : "amber"}>{config.status}</Pill></span>
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
            <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Regras invioláveis do orquestrador</h2>
            <ShieldCheck className="w-4 h-4 text-amber-600 ml-1" />
          </div>
          <ul className="grid md:grid-cols-2 gap-1.5 text-sm text-amber-900/90">
            {(config.guardrails ?? []).map((g, i) => <li key={i} className="flex gap-2"><span className="text-amber-600">•</span>{g}</li>)}
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

        {tab === "overview" && <OverviewTab config={config} setConfig={setConfig} />}
        {tab === "specialists" && <SpecialistsTab config={config} setConfig={setConfig} />}
        {tab === "routing" && <RoutingTab config={config} setConfig={setConfig} />}
        {tab === "model" && <ModelTab config={config} setConfig={setConfig} />}
        {tab === "cache" && <CacheTab config={config} setConfig={setConfig} />}
        {tab === "costs" && <CostsTab config={config} setConfig={setConfig} />}
        {tab === "memory" && <MemoryTab config={config} setConfig={setConfig} />}
        {tab === "logs" && <LogsTab />}
        {tab === "versions" && <VersionsTab versions={versions} currentVersion={config.version} setConfig={setConfig} />}

        {tab !== "logs" && tab !== "versions" && (
          <Card>
            <Label>Nota da alteração (opcional)</Label>
            <Input value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Ex.: nova regra de roteamento para risco." />
            <p className="mt-2 text-xs text-slate-500">A nota é registrada junto ao snapshot ao publicar uma nova versão.</p>
          </Card>
        )}
      </div>
    </PlatformAdminLayout>
  );
}

// ---------- Visão Geral ----------
function OverviewTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const t = config.tone_config, m = config.model_config;
  const upd = (patch: Partial<ToneCfg>) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, ...patch } } : c);
  const activeSpecs = (m.specialists ?? []).filter((s) => s.active).length;
  const routes = (t.routing ?? []).length;
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Especialistas ativos</p><p className="text-3xl font-bold text-slate-800 mt-1">{activeSpecs}</p></Card>
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Rotas configuradas</p><p className="text-3xl font-bold text-slate-800 mt-1">{routes}</p></Card>
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Modelo principal</p><p className="text-sm font-semibold text-slate-800 mt-2">{m.primary_model}</p></Card>
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">TTL do cache</p><p className="text-3xl font-bold text-slate-800 mt-1">{Math.round(m.cache_ttl_seconds / 60)}<span className="text-sm font-normal text-slate-500 ml-1">min</span></p></Card>
      </div>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F88A2B]" /> Instruções do orquestrador
        </h3>
        <Textarea rows={7} value={config.system_instructions}
          onChange={(e) => setConfig((c) => c ? { ...c, system_instructions: e.target.value } : c)} />
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Consolidação</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-700">Deduplicar seções</span><Toggle checked={t.consolidation.dedupe} onChange={(v) => upd({ consolidation: { ...t.consolidation, dedupe: v } })} /></div>
            <div><Label>Máx. de seções na resposta</Label><Input type="number" min={1} max={12} value={t.consolidation.max_sections} onChange={(e) => upd({ consolidation: { ...t.consolidation, max_sections: Math.min(12, Math.max(1, Number(e.target.value) || 6)) } })} /></div>
            <div><Label>Política de conflito</Label>
              <Select value={t.consolidation.conflict_policy} onChange={(v) => upd({ consolidation: { ...t.consolidation, conflict_policy: v } })}
                options={[{ value: "prioritize_by_confidence", label: "Priorizar por confiança" }, { value: "prioritize_by_source_order", label: "Priorizar pela ordem" }, { value: "merge", label: "Mesclar" }]} />
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Confiança final</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Fontes mínimas</Label><Input type="number" min={1} max={5} value={t.confidence.min_sources} onChange={(e) => upd({ confidence: { ...t.confidence, min_sources: Math.min(5, Math.max(1, Number(e.target.value) || 1)) } })} /></div>
              <div><Label>Fontes ideais</Label><Input type="number" min={1} max={7} value={t.confidence.ideal_sources} onChange={(e) => upd({ confidence: { ...t.confidence, ideal_sources: Math.min(7, Math.max(1, Number(e.target.value) || 3)) } })} /></div>
            </div>
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mt-2">Pesos</p>
            {Object.entries(t.confidence.weights ?? {}).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700">{k}</span>
                <Input type="number" min={0} max={1} step={0.05} value={v} className="w-24 text-right"
                  onChange={(e) => upd({ confidence: { ...t.confidence, weights: { ...t.confidence.weights, [k]: Math.min(1, Math.max(0, Number(e.target.value) || 0)) } } })} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Especialistas ----------
function SpecialistsTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const specs = config.model_config.specialists ?? [];
  const [stats, setStats] = useState<Record<string, { uses: number; avg_ms: number; cost: number }>>({});
  useEffect(() => { void (async () => {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { data } = await supabase.from("ai_orchestrator_logs")
      .select("specialists, latency_ms, cost_usd").gte("created_at", since).limit(2000);
    const agg: Record<string, { uses: number; avg_ms: number; cost: number; _sum: number }> = {};
    for (const row of (data ?? [])) {
      const arr: string[] = (row as any).specialists ?? [];
      const ms = Number((row as any).latency_ms ?? 0);
      const cost = Number((row as any).cost_usd ?? 0);
      for (const k of arr) {
        if (!agg[k]) agg[k] = { uses: 0, avg_ms: 0, cost: 0, _sum: 0 };
        agg[k].uses += 1; agg[k]._sum += ms; agg[k].cost += cost;
      }
    }
    const out: Record<string, { uses: number; avg_ms: number; cost: number }> = {};
    for (const k of Object.keys(agg)) out[k] = { uses: agg[k].uses, avg_ms: Math.round(agg[k]._sum / Math.max(1, agg[k].uses)), cost: agg[k].cost };
    setStats(out);
  })(); }, []);
  const setSpec = (i: number, patch: Partial<Specialist>) => {
    const next = [...specs]; next[i] = { ...next[i], ...patch };
    setConfig((c) => c ? { ...c, model_config: { ...c.model_config, specialists: next } } : c);
  };
  return (
    <Card>
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Especialistas conectados</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr><th className="text-left py-2 pr-3">IA</th><th className="text-left py-2 pr-3">Edge Function</th><th className="text-left py-2 pr-3">Status</th><th className="text-right py-2 pr-3">Usos (30d)</th><th className="text-right py-2 pr-3">Latência média</th><th className="text-right py-2 pr-3">Custo (30d)</th></tr>
          </thead>
          <tbody>
            {specs.map((s, i) => {
              const st = stats[s.key];
              return (
                <tr key={s.key} className="border-b border-slate-100">
                  <td className="py-2 pr-3"><div className="font-semibold text-slate-800">{s.label}</div><div className="text-[11px] text-slate-500">{s.key}</div></td>
                  <td className="py-2 pr-3"><code className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100">{s.function}</code></td>
                  <td className="py-2 pr-3"><Toggle checked={s.active} onChange={(v) => setSpec(i, { active: v })} /></td>
                  <td className="py-2 pr-3 text-right">{st?.uses ?? 0}</td>
                  <td className="py-2 pr-3 text-right">{st ? `${st.avg_ms} ms` : "—"}</td>
                  <td className="py-2 pr-3 text-right">{st ? `US$ ${st.cost.toFixed(4)}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">Desativar um especialista o remove do roteamento sem afetar a edge function isolada.</p>
    </Card>
  );
}

// ---------- Roteamento ----------
function RoutingTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const rules = config.tone_config.routing ?? [];
  const specs = config.model_config.specialists ?? [];
  const upd = (next: RoutingRule[]) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, routing: next } } : c);
  const setRule = (i: number, patch: Partial<RoutingRule>) => { const n = [...rules]; n[i] = { ...n[i], ...patch }; upd(n); };
  const add = () => upd([...rules, { intent: "nova_intencao", keywords: [], specialists: [], priority: [] }]);
  const remove = (i: number) => upd(rules.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">Regras de roteamento por intenção. O orquestrador escolhe a rota com mais palavras-chave em comum.</p>
        <button onClick={add} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F88A2B] text-black text-sm font-semibold"><Plus className="w-4 h-4" /> Nova regra</button>
      </div>
      {rules.map((r, i) => (
        <Card key={i}>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="md:col-span-1"><Label>Intent</Label><Input value={r.intent} onChange={(e) => setRule(i, { intent: e.target.value })} /></div>
            <div className="md:col-span-3"><Label>Palavras-chave (separadas por vírgula)</Label>
              <Input value={(r.keywords ?? []).join(", ")} onChange={(e) => setRule(i, { keywords: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></div>
            <div className="md:col-span-2"><Label>Especialistas disponíveis</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {specs.map((s) => {
                  const on = r.specialists.includes(s.key);
                  return <button key={s.key} type="button" onClick={() => setRule(i, { specialists: on ? r.specialists.filter((x) => x !== s.key) : [...r.specialists, s.key] })}
                    className={`text-[11px] px-2.5 py-1 rounded-full border ${on ? "bg-[#F88A2B]/10 border-[#F88A2B] text-slate-800" : "bg-white border-slate-300 text-slate-600"}`}>{s.label}</button>;
                })}
              </div>
            </div>
            <div className="md:col-span-2"><Label>Prioridade (top → fallback)</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {r.specialists.map((k) => {
                  const on = r.priority.includes(k);
                  return <button key={k} type="button" onClick={() => setRule(i, { priority: on ? r.priority.filter((x) => x !== k) : [...r.priority, k] })}
                    className={`text-[11px] px-2.5 py-1 rounded-full border ${on ? "bg-emerald-100 border-emerald-500 text-emerald-800" : "bg-white border-slate-300 text-slate-600"}`}>{k}</button>;
                })}
                {r.specialists.length === 0 && <span className="text-[11px] text-slate-400">Selecione especialistas primeiro.</span>}
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={() => remove(i)} className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5" /> Remover regra</button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ---------- Modelos ----------
function ModelTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const m = config.model_config;
  const upd = (patch: Partial<ModelCfg>) => setConfig((c) => c ? { ...c, model_config: { ...c.model_config, ...patch } } : c);
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Modelos</h3>
        <div className="space-y-3">
          <div><Label>Modelo principal</Label><Select value={m.primary_model} onChange={(v) => upd({ primary_model: v })} options={MODEL_OPTS} /></div>
          <div><Label>Fallback</Label><Select value={m.fallback_model} onChange={(v) => upd({ fallback_model: v })} options={MODEL_OPTS} /></div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Inferência</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Temperatura</Label><Input type="number" min={0} max={1} step={0.05} value={m.temperature} onChange={(e) => upd({ temperature: Number(e.target.value) })} /></div>
            <div><Label>Máx. tokens</Label><Input type="number" min={256} max={8000} value={m.max_tokens} onChange={(e) => upd({ max_tokens: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Timeout (s)</Label><Input type="number" min={5} max={120} value={m.timeout_seconds} onChange={(e) => upd({ timeout_seconds: Number(e.target.value) })} /></div>
        </div>
      </Card>
    </div>
  );
}

// ---------- Cache ----------
function CacheTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const m = config.model_config;
  const [rows, setRows] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; stale: number; hit_rate: number }>({ total: 0, stale: 0, hit_rate: 0 });
  const load = async () => {
    const { data } = await supabase.from("ai_orchestrator_cache")
      .select("organization_id, intent, specialists, hits, is_stale, expires_at, generated_at, invalidation_reason")
      .order("generated_at", { ascending: false }).limit(50);
    setRows(data ?? []);
    const { data: agg } = await supabase.from("ai_orchestrator_cache").select("is_stale, hits");
    const total = (agg ?? []).length;
    const stale = (agg ?? []).filter((r: any) => r.is_stale).length;
    const hits = (agg ?? []).reduce((s: number, r: any) => s + Number(r.hits ?? 0), 0);
    const hit_rate = total ? Math.round((hits / (hits + total)) * 100) : 0;
    setStats({ total, stale, hit_rate });
  };
  useEffect(() => { void load(); }, []);
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Entradas em cache</p><p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p></Card>
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Stale</p><p className="text-3xl font-bold text-amber-700 mt-1">{stats.stale}</p></Card>
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Hit rate estimado</p><p className="text-3xl font-bold text-emerald-700 mt-1">{stats.hit_rate}%</p></Card>
      </div>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Configuração</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label>TTL (segundos)</Label><Input type="number" min={60} max={86400} value={m.cache_ttl_seconds}
            onChange={(e) => setConfig((c) => c ? { ...c, model_config: { ...c.model_config, cache_ttl_seconds: Math.min(86400, Math.max(60, Number(e.target.value) || 7200)) } } : c)} /></div>
          <div className="md:col-span-2 text-xs text-slate-500 self-end pb-2">Invalidação automática ao registrar check-in, pulse, DNA, insight semanal, plano ou score organizacional.</div>
        </div>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Últimas entradas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr><th className="text-left py-2 pr-3">Intent</th><th className="text-left py-2 pr-3">Specialists</th><th className="text-right py-2 pr-3">Hits</th><th className="text-left py-2 pr-3">Status</th><th className="text-left py-2 pr-3">Expira</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 pr-3 max-w-[280px] truncate" title={r.intent}>{r.intent}</td>
                  <td className="py-2 pr-3 text-[11px] text-slate-500">{(r.specialists ?? []).join(", ")}</td>
                  <td className="py-2 pr-3 text-right">{r.hits}</td>
                  <td className="py-2 pr-3">{r.is_stale ? <Pill tone="amber">stale{r.invalidation_reason ? `:${r.invalidation_reason}` : ""}</Pill> : <Pill tone="emerald">fresh</Pill>}</td>
                  <td className="py-2 pr-3 text-[11px] text-slate-500">{new Date(r.expires_at).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-400 text-sm">Sem entradas em cache ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ---------- Custos ----------
function CostsTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const table = config.model_config.cost_table ?? {};
  const [totals, setTotals] = useState<{ day: number; week: number; month: number; tokens: number }>({ day: 0, week: 0, month: 0, tokens: 0 });
  const [byModel, setByModel] = useState<Record<string, { uses: number; cost: number }>>({});
  useEffect(() => { void (async () => {
    const now = Date.now();
    const since = new Date(now - 30 * 86400_000).toISOString();
    const { data } = await supabase.from("ai_orchestrator_logs")
      .select("model, cost_usd, tokens_input, tokens_output, created_at").gte("created_at", since).limit(5000);
    let day = 0, week = 0, month = 0, tokens = 0;
    const bm: Record<string, { uses: number; cost: number }> = {};
    for (const r of (data ?? [])) {
      const cost = Number((r as any).cost_usd ?? 0);
      const ts = new Date((r as any).created_at).getTime();
      if (now - ts <= 86400_000) day += cost;
      if (now - ts <= 7 * 86400_000) week += cost;
      month += cost;
      tokens += Number((r as any).tokens_input ?? 0) + Number((r as any).tokens_output ?? 0);
      const mk = (r as any).model || "—";
      if (!bm[mk]) bm[mk] = { uses: 0, cost: 0 };
      bm[mk].uses += 1; bm[mk].cost += cost;
    }
    setTotals({ day, week, month, tokens });
    setByModel(bm);
  })(); }, []);
  const setCost = (model: string, patch: Partial<CostRow>) => {
    const next = { ...table, [model]: { ...(table[model] ?? { input_per_1k: 0, output_per_1k: 0 }), ...patch } };
    setConfig((c) => c ? { ...c, model_config: { ...c.model_config, cost_table: next } } : c);
  };
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Hoje</p><p className="text-3xl font-bold text-slate-800 mt-1">US$ {totals.day.toFixed(4)}</p></Card>
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Semana</p><p className="text-3xl font-bold text-slate-800 mt-1">US$ {totals.week.toFixed(4)}</p></Card>
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">30 dias</p><p className="text-3xl font-bold text-slate-800 mt-1">US$ {totals.month.toFixed(4)}</p></Card>
        <Card><p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Tokens (30d)</p><p className="text-3xl font-bold text-slate-800 mt-1">{totals.tokens.toLocaleString("pt-BR")}</p></Card>
      </div>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Tabela de custo por modelo (US$ / 1k tokens)</h3>
        <table className="min-w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr><th className="text-left py-2 pr-3">Modelo</th><th className="text-right py-2 pr-3">Input / 1k</th><th className="text-right py-2 pr-3">Output / 1k</th><th className="text-right py-2 pr-3">Usos (30d)</th><th className="text-right py-2 pr-3">Custo (30d)</th></tr>
          </thead>
          <tbody>
            {Object.entries(table).map(([model, row]) => {
              const bm = byModel[model];
              return (
                <tr key={model} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-mono text-[11px]">{model}</td>
                  <td className="py-2 pr-3 text-right"><Input type="number" min={0} step={0.00001} value={row.input_per_1k} className="w-32 text-right" onChange={(e) => setCost(model, { input_per_1k: Number(e.target.value) })} /></td>
                  <td className="py-2 pr-3 text-right"><Input type="number" min={0} step={0.00001} value={row.output_per_1k} className="w-32 text-right" onChange={(e) => setCost(model, { output_per_1k: Number(e.target.value) })} /></td>
                  <td className="py-2 pr-3 text-right">{bm?.uses ?? 0}</td>
                  <td className="py-2 pr-3 text-right">US$ {(bm?.cost ?? 0).toFixed(4)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ---------- Memória ----------
function MemoryTab({ config, setConfig }: { config: Cfg; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const mem = config.tone_config.memory ?? {};
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { void (async () => {
    const { data } = await supabase.from("ai_orchestrator_memory")
      .select("kind, summary, weight, captured_at, expires_at").order("captured_at", { ascending: false }).limit(40);
    setRows(data ?? []);
  })(); }, []);
  const setMem = (k: string, v: number) => setConfig((c) => c ? { ...c, tone_config: { ...c.tone_config, memory: { ...c.tone_config.memory, [k]: v } } } : c);
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">TTL por tipo (dias)</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {Object.entries(mem).map(([k, v]) => (
            <div key={k}><Label>{k.replace("ttl_days_", "")}</Label>
              <Input type="number" min={1} max={365} value={v as number} onChange={(e) => setMem(k, Math.min(365, Math.max(1, Number(e.target.value) || 30)))} /></div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Toda memória é organizacional (nunca individual) e usa k-anonimato ≥ 5 vindo dos especialistas.</p>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Últimos contextos capturados</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr><th className="text-left py-2 pr-3">Tipo</th><th className="text-left py-2 pr-3">Resumo</th><th className="text-right py-2 pr-3">Peso</th><th className="text-left py-2 pr-3">Captura</th><th className="text-left py-2 pr-3">Expira</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 pr-3"><Pill tone="sky">{r.kind}</Pill></td>
                  <td className="py-2 pr-3 max-w-[420px] truncate" title={r.summary}>{r.summary}</td>
                  <td className="py-2 pr-3 text-right">{Number(r.weight).toFixed(2)}</td>
                  <td className="py-2 pr-3 text-[11px] text-slate-500">{new Date(r.captured_at).toLocaleString("pt-BR")}</td>
                  <td className="py-2 pr-3 text-[11px] text-slate-500">{r.expires_at ? new Date(r.expires_at).toLocaleString("pt-BR") : "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-400 text-sm">Nenhuma memória capturada ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ---------- Logs ----------
function LogsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const load = async () => {
    let q = supabase.from("ai_orchestrator_logs")
      .select("id, created_at, intent, specialists, model, fallback_used, cache_hit, latency_ms, cost_usd, confidence, status, error")
      .order("created_at", { ascending: false }).limit(100);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data } = await q;
    setRows(data ?? []);
  };
  useEffect(() => { void load(); }, [statusFilter]);
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Últimas execuções</h3>
        <div className="w-56"><Select value={statusFilter} onChange={setStatusFilter} options={[
          { value: "all", label: "Todos os status" }, { value: "ok", label: "OK" },
          { value: "fallback", label: "Fallback" }, { value: "insufficient_data", label: "Sem dados" },
          { value: "error", label: "Erro" }]} /></div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="text-left py-2 pr-3">Quando</th><th className="text-left py-2 pr-3">Intent</th>
              <th className="text-left py-2 pr-3">Specialists</th><th className="text-left py-2 pr-3">Modelo</th>
              <th className="text-right py-2 pr-3">Latência</th><th className="text-right py-2 pr-3">Custo</th>
              <th className="text-right py-2 pr-3">Conf.</th><th className="text-left py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-2 pr-3 text-[11px] text-slate-500">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                <td className="py-2 pr-3">{r.intent}</td>
                <td className="py-2 pr-3 text-[11px] text-slate-500">{(r.specialists ?? []).join(", ")}</td>
                <td className="py-2 pr-3 font-mono text-[11px]">{r.model || "—"}</td>
                <td className="py-2 pr-3 text-right">{r.latency_ms ? `${r.latency_ms} ms` : "—"}</td>
                <td className="py-2 pr-3 text-right">{r.cost_usd ? `US$ ${Number(r.cost_usd).toFixed(4)}` : "—"}</td>
                <td className="py-2 pr-3 text-right">{r.confidence != null ? Number(r.confidence).toFixed(2) : "—"}</td>
                <td className="py-2 pr-3">
                  {r.cache_hit ? <Pill tone="sky">cache</Pill> :
                    r.status === "ok" ? <Pill tone="emerald">ok</Pill> :
                    r.status === "fallback" ? <Pill tone="amber">fallback</Pill> :
                    r.status === "insufficient_data" ? <Pill tone="amber">sem dados</Pill> :
                    <Pill tone="rose">{r.error ?? "erro"}</Pill>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-slate-400 text-sm">Nenhuma execução registrada ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------- Versões ----------
function VersionsTab({ versions, currentVersion, setConfig }: { versions: VersionRow[]; currentVersion: number; setConfig: React.Dispatch<React.SetStateAction<Cfg | null>> }) {
  const [aId, setAId] = useState<string>("");
  const [bId, setBId] = useState<string>("");
  const a = useMemo(() => versions.find((v) => v.id === aId), [aId, versions]);
  const b = useMemo(() => versions.find((v) => v.id === bId), [bId, versions]);
  const restore = (snap: any) => {
    if (!snap) { toast.error("Snapshot indisponível"); return; }
    setConfig((c) => c ? { ...c, system_instructions: snap.system_instructions ?? c.system_instructions,
      tone_config: snap.tone_config ?? c.tone_config, model_config: snap.model_config ?? c.model_config,
      status: "draft" } : c);
    toast.success("Snapshot carregado no rascunho — revise e publique.");
  };
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Versões publicadas</h3>
        <table className="min-w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr><th className="text-left py-2 pr-3">Versão</th><th className="text-left py-2 pr-3">Quando</th><th className="text-left py-2 pr-3">Nota</th><th className="py-2"></th></tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v.id} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-semibold">v{v.version} {v.version === currentVersion && <Pill tone="emerald">atual</Pill>}</td>
                <td className="py-2 pr-3 text-[11px] text-slate-500">{new Date(v.created_at).toLocaleString("pt-BR")}</td>
                <td className="py-2 pr-3 text-slate-600">{v.change_note || "—"}</td>
                <td className="py-2 text-right"><button onClick={() => restore(v.snapshot)} className="text-xs text-[#F88A2B] font-semibold hover:underline">Restaurar no rascunho</button></td>
              </tr>
            ))}
            {versions.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-sm">Sem versões registradas.</td></tr>}
          </tbody>
        </table>
      </Card>
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Comparar A × B</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div><Label>A</Label><Select value={aId} onChange={setAId} options={[{ value: "", label: "—" }, ...versions.map((v) => ({ value: v.id, label: `v${v.version}` }))]} /></div>
          <div><Label>B</Label><Select value={bId} onChange={setBId} options={[{ value: "", label: "—" }, ...versions.map((v) => ({ value: v.id, label: `v${v.version}` }))]} /></div>
        </div>
        {a && b && (
          <div className="grid md:grid-cols-2 gap-4 text-[11px] font-mono">
            <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto max-h-[400px]">{JSON.stringify(a.snapshot ?? {}, null, 2)}</pre>
            <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto max-h-[400px]">{JSON.stringify(b.snapshot ?? {}, null, 2)}</pre>
          </div>
        )}
        {(!a || !b) && <p className="text-xs text-slate-500">Selecione duas versões para comparar.</p>}
      </Card>
    </div>
  );
}