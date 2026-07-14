import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Activity, Database, Zap, HardDrive, Radio, CalendarClock, Brain, Layers,
  Search, Gauge, ListChecks, FileDown, RefreshCw, Loader2, PlayCircle, AlertTriangle,
} from "lucide-react";

type Tab =
  | "dashboard" | "database" | "edge" | "storage" | "realtime" | "cron"
  | "ai" | "cache" | "queries" | "stress" | "load" | "reports";

type Snapshot = { id: string; category: string; metric: string; value_num: number | null; unit: string | null; metadata: any; captured_at: string };
type Rule = { id: string; name: string; metric: string; comparator: string; threshold: number; severity: string; enabled: boolean; description: string | null };
type Alert = { id: string; rule_id: string | null; metric: string; value: number | null; severity: string; message: string | null; resolved_at: string | null; created_at: string };
type Plan = { id: string; name: string; profile_users: number; scenarios: any; notes: string | null; created_at: string };
type Run = { id: string; plan_id: string | null; mode: string; status: string; results: any; started_at: string | null; finished_at: string | null; created_at: string };
type Score = { id: string; score: number; breakdown: any; captured_at: string };

const db = supabase as any;
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString("pt-BR") : "—");
const fmtNum = (n?: number | null, unit = "") => (n == null ? "—" : `${Number(n).toLocaleString("pt-BR")}${unit ? " " + unit : ""}`);

const sevBadge = (s: string) => ({
  info: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  warning: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  critical: "bg-red-500/15 text-red-700 border-red-500/30",
}[s] ?? "bg-slate-500/10 text-slate-600 border-slate-500/20");

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: Activity },
  { key: "database", label: "Banco", icon: Database },
  { key: "edge", label: "Edge Functions", icon: Zap },
  { key: "storage", label: "Storage", icon: HardDrive },
  { key: "realtime", label: "Realtime", icon: Radio },
  { key: "cron", label: "Cron", icon: CalendarClock },
  { key: "ai", label: "IA", icon: Brain },
  { key: "cache", label: "Cache", icon: Layers },
  { key: "queries", label: "Consultas", icon: Search },
  { key: "stress", label: "Stress Tests", icon: Gauge },
  { key: "load", label: "Load Tests", icon: ListChecks },
  { key: "reports", label: "Relatórios", icon: FileDown },
];

const PROFILES = [50, 100, 500, 1000, 5000, 10000];
const SCENARIOS = ["Login", "Dashboard RH", "Dashboard User", "Check-in", "Pulse", "IA", "Upload", "Knowledge Hub", "CMS"];

const PlatformPerformanceCenterScreen = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [s, r, a, p, ru, sc] = await Promise.all([
      db.from("perf_snapshots").select("*").order("captured_at", { ascending: false }).limit(500),
      db.from("perf_alert_rules").select("*").order("name"),
      db.from("perf_alerts").select("*").order("created_at", { ascending: false }).limit(100),
      db.from("load_test_plans").select("*").order("created_at", { ascending: false }),
      db.from("load_test_runs").select("*").order("created_at", { ascending: false }).limit(50),
      db.from("health_score_history").select("*").order("captured_at", { ascending: false }).limit(30),
    ]);
    setSnaps(s.data ?? []); setRules(r.data ?? []); setAlerts(a.data ?? []);
    setPlans(p.data ?? []); setRuns(ru.data ?? []); setScores(sc.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Última métrica por (category, metric)
  const latest = useMemo(() => {
    const m: Record<string, Snapshot> = {};
    for (const s of snaps) {
      const k = `${s.category}.${s.metric}`;
      if (!m[k] || new Date(s.captured_at) > new Date(m[k].captured_at)) m[k] = s;
    }
    return m;
  }, [snaps]);

  const get = (key: string) => latest[key]?.value_num ?? null;
  const unitOf = (key: string) => latest[key]?.unit ?? "";

  // Health score baseado nas métricas mais recentes vs. regras
  const healthScore = useMemo(() => {
    const components = ["db", "storage", "edge", "cron", "ai", "realtime", "cache"];
    const breakdown: Record<string, number> = {};
    for (const c of components) {
      const componentRules = rules.filter((r) => r.metric.startsWith(`${c}.`) && r.enabled);
      if (componentRules.length === 0) { breakdown[c] = 100; continue; }
      let ok = 0;
      for (const r of componentRules) {
        const v = get(r.metric);
        if (v == null) { ok += 1; continue; } // sem dado ⇒ ok
        const cmp: Record<string, (a: number, b: number) => boolean> = {
          gt: (a, b) => a > b, gte: (a, b) => a >= b,
          lt: (a, b) => a < b, lte: (a, b) => a <= b,
          eq: (a, b) => a === b,
        };
        const triggered = cmp[r.comparator]?.(Number(v), Number(r.threshold)) ?? false;
        if (!triggered) ok += 1;
      }
      breakdown[c] = Math.round((ok / componentRules.length) * 100);
    }
    const overall = Math.round(Object.values(breakdown).reduce((s, v) => s + v, 0) / (components.length || 1));
    return { overall, breakdown };
  }, [rules, latest]);

  const captureHealthScore = async () => {
    const { error } = await db.from("health_score_history").insert({ score: healthScore.overall, breakdown: healthScore.breakdown });
    if (error) return toast.error(error.message);
    toast.success(`Health score ${healthScore.overall} registrado`);
    loadAll();
  };

  // Ingestão manual de snapshot (para popular métricas sem worker externo)
  const [snapForm, setSnapForm] = useState({ category: "db", metric: "db.query_ms", value_num: 0, unit: "ms" });
  const submitSnapshot = async () => {
    if (!snapForm.metric) return toast.error("Métrica obrigatória");
    const { error } = await db.from("perf_snapshots").insert(snapForm);
    if (error) return toast.error(error.message);
    toast.success("Snapshot registrado");
    loadAll();
  };

  // Simulação (sem gerar carga real)
  const [planForm, setPlanForm] = useState({ name: "", profile_users: 100, scenarios: [] as string[], notes: "" });
  const savePlan = async () => {
    if (!planForm.name) return toast.error("Nome obrigatório");
    const { error } = await db.from("load_test_plans").insert({ ...planForm, created_by: user?.id ?? null });
    if (error) return toast.error(error.message);
    toast.success("Plano criado");
    setPlanForm({ name: "", profile_users: 100, scenarios: [], notes: "" });
    loadAll();
  };
  const runSimulation = async (plan: Plan) => {
    const startedAt = new Date().toISOString();
    const { data: run, error } = await db.from("load_test_runs").insert({
      plan_id: plan.id, mode: "simulation", status: "running", started_at: startedAt, requested_by: user?.id ?? null,
    }).select().single();
    if (error) return toast.error(error.message);
    // Modelagem determinística: nada é executado contra produção
    const users = plan.profile_users;
    const tps = Math.max(1, Math.round(users / 10));
    const latency = 80 + Math.round(users / 20);
    const errorRate = users > 1000 ? Number(((users - 1000) / 100000).toFixed(3)) : 0;
    const results = {
      simulated: true,
      users, tps,
      latency_ms_p50: latency,
      latency_ms_p95: Math.round(latency * 2.5),
      latency_ms_p99: Math.round(latency * 4),
      error_rate: errorRate,
      cpu_estimated_pct: Math.min(95, Math.round(users / 120)),
      db_load_pct: Math.min(90, Math.round(users / 150)),
      storage_load_pct: Math.min(70, Math.round(users / 200)),
      realtime_load_pct: Math.min(80, Math.round(users / 180)),
      scenarios: plan.scenarios,
      note: "Simulação matemática — nenhuma carga real gerada na plataforma.",
    };
    const finishedAt = new Date().toISOString();
    await db.from("load_test_runs").update({ status: "success", results, finished_at: finishedAt }).eq("id", run.id);
    toast.success("Simulação concluída");
    loadAll();
  };

  const toggleRule = async (r: Rule) => {
    await db.from("perf_alert_rules").update({ enabled: !r.enabled }).eq("id", r.id);
    loadAll();
  };

  const exportJSON = () => {
    const payload = { snapshots: snaps, alerts, rules, plans, runs, health: { current: healthScore, history: scores } };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `performance-center-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  const exportCSV = () => {
    const header = "category,metric,value,unit,captured_at";
    const rows = snaps.map((s) => `${s.category},${s.metric},${s.value_num ?? ""},${s.unit ?? ""},${s.captured_at}`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `performance-snapshots-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <PlatformAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Performance Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Métricas, alertas e simulações — nenhum teste real é executado contra produção automaticamente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
            healthScore.overall >= 80 ? sevBadge("info") : healthScore.overall >= 60 ? sevBadge("warning") : sevBadge("critical")
          }`}>Health {healthScore.overall}/100</span>
          <button onClick={loadAll} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
            <RefreshCw className="w-3.5 h-3.5" /> Recarregar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
              tab === t.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</div>
      ) : (
        <>
          {tab === "dashboard" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <Metric title="CPU (estimada)" value={fmtNum(get("system.cpu_pct"), unitOf("system.cpu_pct") || "%")} />
                <Metric title="Memória" value={fmtNum(get("system.mem_pct"), unitOf("system.mem_pct") || "%")} />
                <Metric title="Query média" value={fmtNum(get("db.query_ms"), "ms")} />
                <Metric title="Edge média" value={fmtNum(get("edge.latency_ms"), "ms")} />
                <Metric title="IA média" value={fmtNum(get("ai.latency_ms"), "ms")} />
                <Metric title="Upload médio" value={fmtNum(get("storage.upload_ms"), "ms")} />
                <Metric title="Download médio" value={fmtNum(get("storage.download_ms"), "ms")} />
                <Metric title="Login médio" value={fmtNum(get("auth.login_ms"), "ms")} />
                <Metric title="Dashboard RH" value={fmtNum(get("page.dashboard_rh_ms"), "ms")} />
                <Metric title="Dashboard User" value={fmtNum(get("page.dashboard_user_ms"), "ms")} />
                <Metric title="Realtime conexões" value={fmtNum(get("realtime.connections"))} />
                <Metric title="Cron jobs ativos" value={fmtNum(get("cron.jobs"))} />
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Health score por componente</p>
                  <button onClick={captureHealthScore} className="px-3 py-1.5 rounded-lg bg-[#F88A2B] text-black text-xs font-bold">Registrar snapshot</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {Object.entries(healthScore.breakdown).map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-slate-200 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{k}</p>
                      <p className={`text-xl font-black mt-1 ${v >= 80 ? "text-emerald-600" : v >= 60 ? "text-amber-600" : "text-red-600"}`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Ingestão manual de métrica</p>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input placeholder="category" value={snapForm.category} onChange={(e) => setSnapForm({ ...snapForm, category: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <input placeholder="metric (ex.: db.query_ms)" value={snapForm.metric} onChange={(e) => setSnapForm({ ...snapForm, metric: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <input type="number" placeholder="valor" value={snapForm.value_num} onChange={(e) => setSnapForm({ ...snapForm, value_num: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <div className="flex gap-2">
                    <input placeholder="unit" value={snapForm.unit} onChange={(e) => setSnapForm({ ...snapForm, unit: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                    <button onClick={submitSnapshot} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold">Salvar</button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Coletores automáticos (edge/worker) pendentes. Enquanto isso, use este formulário ou insira via SQL.</p>
              </div>
            </div>
          )}

          {tab === "database" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric title="Tabelas" value={fmtNum(get("db.tables"))} />
              <Metric title="Índices" value={fmtNum(get("db.indexes"))} />
              <Metric title="RPCs" value={fmtNum(get("db.rpcs"))} />
              <Metric title="Query média" value={fmtNum(get("db.query_ms"), "ms")} />
              <Metric title="Maior query" value={fmtNum(get("db.max_query_ms"), "ms")} />
              <Metric title="Locks" value={fmtNum(get("db.locks"))} />
              <Metric title="Conexões" value={fmtNum(get("db.connections"))} />
              <Metric title="Timeouts" value={fmtNum(get("db.timeouts"))} />
              <div className="md:col-span-2 lg:col-span-4">
                <MetricsTable title="Top consultas lentas (perf_snapshots category=db.top_slow)" rows={snaps.filter((s) => s.category === "db.top_slow").slice(0, 20)} />
              </div>
            </div>
          )}

          {tab === "edge" && (
            <MetricsTable title="Edge Functions (perf_snapshots category=edge)"
              rows={snaps.filter((s) => s.category === "edge").slice(0, 50)} />
          )}

          {tab === "storage" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric title="Buckets" value={fmtNum(get("storage.buckets"))} />
              <Metric title="Arquivos" value={fmtNum(get("storage.files"))} />
              <Metric title="Espaço usado" value={fmtNum(get("storage.used_pct"), "%")} />
              <Metric title="Uploads" value={fmtNum(get("storage.uploads"))} />
              <Metric title="Downloads" value={fmtNum(get("storage.downloads"))} />
              <Metric title="Erros" value={fmtNum(get("storage.errors"))} />
              <Metric title="Upload médio" value={fmtNum(get("storage.upload_ms"), "ms")} />
              <Metric title="Download médio" value={fmtNum(get("storage.download_ms"), "ms")} />
            </div>
          )}

          {tab === "realtime" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric title="Conexões" value={fmtNum(get("realtime.connections"))} />
              <Metric title="Eventos" value={fmtNum(get("realtime.events"))} />
              <Metric title="Canais" value={fmtNum(get("realtime.channels"))} />
              <Metric title="Tempo médio" value={fmtNum(get("realtime.latency_ms"), "ms")} />
              <Metric title="Falhas" value={fmtNum(get("realtime.errors"))} />
            </div>
          )}

          {tab === "cron" && (
            <MetricsTable title="Cron jobs (perf_snapshots category=cron)"
              rows={snaps.filter((s) => s.category === "cron").slice(0, 50)} />
          )}

          {tab === "ai" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric title="Latência média" value={fmtNum(get("ai.latency_ms"), "ms")} />
              <Metric title="Tokens" value={fmtNum(get("ai.tokens"))} />
              <Metric title="Custo estimado" value={fmtNum(get("ai.cost_brl"), "BRL")} />
              <Metric title="Erros" value={fmtNum(get("ai.errors"))} />
            </div>
          )}

          {tab === "cache" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric title="Hit ratio" value={fmtNum(get("cache.hit_ratio"))} />
              <Metric title="Miss" value={fmtNum(get("cache.miss"))} />
              <Metric title="TTL médio" value={fmtNum(get("cache.ttl"), "s")} />
              <Metric title="Itens" value={fmtNum(get("cache.items"))} />
              <Metric title="Economia estimada" value={fmtNum(get("cache.saved_ms"), "ms")} />
            </div>
          )}

          {tab === "queries" && (
            <div className="space-y-4">
              <MetricsTable title="RPC mais lenta" rows={snaps.filter((s) => s.metric === "db.rpc_slow").slice(0, 10)} />
              <MetricsTable title="Edge mais lenta" rows={snaps.filter((s) => s.metric === "edge.slow").slice(0, 10)} />
              <MetricsTable title="Página mais lenta" rows={snaps.filter((s) => s.metric === "page.slow").slice(0, 10)} />
              <MetricsTable title="Bucket mais lento" rows={snaps.filter((s) => s.metric === "storage.slow_bucket").slice(0, 10)} />
            </div>
          )}

          {(tab === "stress" || tab === "load") && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800">
                  Load/Stress executam apenas em modo simulação (matemático). Nenhuma requisição é disparada contra a plataforma em produção.
                  Execuções reais devem ser conduzidas em ambiente isolado com ferramentas externas (k6, Artillery).
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Novo plano</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input placeholder="Nome" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <select value={planForm.profile_users} onChange={(e) => setPlanForm({ ...planForm, profile_users: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    {PROFILES.map((p) => <option key={p} value={p}>{p} usuários</option>)}
                  </select>
                  <button onClick={savePlan} className="px-3 py-2 rounded-lg bg-[#F88A2B] text-black text-xs font-bold">Criar plano</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SCENARIOS.map((s) => {
                    const active = planForm.scenarios.includes(s);
                    return (
                      <button key={s} onClick={() => setPlanForm({ ...planForm, scenarios: active ? planForm.scenarios.filter((x) => x !== s) : [...planForm.scenarios, s] })}
                        className={`px-2 py-1 rounded-full text-[11px] font-semibold border ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
                <textarea placeholder="Notas" value={planForm.notes} onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" rows={2} />
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <tr><th className="text-left p-3">Plano</th><th className="text-left p-3">Perfil</th><th className="text-left p-3">Cenários</th><th className="text-right p-3">Ações</th></tr>
                  </thead>
                  <tbody>
                    {plans.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-slate-400 text-sm">Sem planos.</td></tr>
                    ) : plans.map((p) => (
                      <tr key={p.id} className="border-t border-slate-100">
                        <td className="p-3 font-semibold">{p.name}</td>
                        <td className="p-3">{p.profile_users} users</td>
                        <td className="p-3 text-slate-500 text-xs">{Array.isArray(p.scenarios) ? p.scenarios.join(", ") : "—"}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => runSimulation(p)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold">
                            <PlayCircle className="w-3.5 h-3.5" /> Simular
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <p className="p-3 text-xs uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">Execuções</p>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <tr><th className="text-left p-3">Data</th><th className="text-left p-3">Plano</th><th className="text-left p-3">Status</th><th className="text-left p-3">Resultado</th></tr>
                  </thead>
                  <tbody>
                    {runs.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-slate-400 text-sm">Sem execuções.</td></tr>
                    ) : runs.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100 align-top">
                        <td className="p-3 text-xs">{fmtDate(r.created_at)}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{r.plan_id?.slice(0, 8) ?? "—"}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${sevBadge(r.status === "success" ? "info" : "warning")}`}>{r.status}</span></td>
                        <td className="p-3 text-xs text-slate-600">
                          {r.results?.tps ? (
                            <>TPS <b>{r.results.tps}</b> · P95 <b>{r.results.latency_ms_p95}ms</b> · Err <b>{(r.results.error_rate * 100).toFixed(2)}%</b> · CPU~<b>{r.results.cpu_estimated_pct}%</b></>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "reports" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-2">
                <button onClick={exportCSV} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold">Exportar CSV</button>
                <button onClick={exportJSON} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold">Exportar JSON</button>
                <button onClick={() => window.print()} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold">Imprimir / PDF</button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Alertas recentes</p>
                {alerts.length === 0 ? <p className="text-sm text-slate-400">Sem alertas.</p> : (
                  <ul className="text-sm divide-y divide-slate-100">
                    {alerts.slice(0, 20).map((a) => (
                      <li key={a.id} className="py-2 flex items-center justify-between">
                        <span className="text-slate-700">{a.metric} = {a.value} — {a.message ?? ""}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${sevBadge(a.severity)}`}>{a.severity}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Regras de alerta</p>
                <table className="w-full text-sm">
                  <thead className="text-slate-500 text-xs uppercase">
                    <tr><th className="text-left py-1">Nome</th><th className="text-left py-1">Métrica</th><th className="text-left py-1">Regra</th><th className="text-left py-1">Severidade</th><th className="text-right py-1">Ativa</th></tr>
                  </thead>
                  <tbody>
                    {rules.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100">
                        <td className="py-2">{r.name}</td>
                        <td className="py-2 font-mono text-xs">{r.metric}</td>
                        <td className="py-2 text-xs">{r.comparator} {r.threshold}</td>
                        <td className="py-2"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${sevBadge(r.severity)}`}>{r.severity}</span></td>
                        <td className="py-2 text-right">
                          <button onClick={() => toggleRule(r)} className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${r.enabled ? sevBadge("info") : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                            {r.enabled ? "on" : "off"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Histórico de Health Score</p>
                {scores.length === 0 ? <p className="text-sm text-slate-400">Sem snapshots.</p> : (
                  <ul className="text-sm divide-y divide-slate-100">
                    {scores.map((s) => (
                      <li key={s.id} className="py-2 flex items-center justify-between">
                        <span>{fmtDate(s.captured_at)}</span>
                        <span className={`font-bold ${s.score >= 80 ? "text-emerald-600" : s.score >= 60 ? "text-amber-600" : "text-red-600"}`}>{s.score}/100</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </PlatformAdminLayout>
  );
};

const Metric = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4">
    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{title}</p>
    <p className="text-xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

const MetricsTable = ({ title, rows }: { title: string; rows: Snapshot[] }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <p className="p-3 text-xs uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">{title}</p>
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
        <tr><th className="text-left p-3">Data</th><th className="text-left p-3">Métrica</th><th className="text-left p-3">Valor</th><th className="text-left p-3">Metadata</th></tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={4} className="p-6 text-center text-slate-400 text-sm">Sem dados coletados.</td></tr>
        ) : rows.map((r) => (
          <tr key={r.id} className="border-t border-slate-100 align-top">
            <td className="p-3 text-xs">{fmtDate(r.captured_at)}</td>
            <td className="p-3 font-mono text-xs">{r.metric}</td>
            <td className="p-3">{r.value_num ?? "—"} {r.unit ?? ""}</td>
            <td className="p-3 text-xs text-slate-500 max-w-md truncate">{Object.keys(r.metadata ?? {}).length ? JSON.stringify(r.metadata) : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default PlatformPerformanceCenterScreen;