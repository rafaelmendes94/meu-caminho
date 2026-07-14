import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Activity, ListChecks, PlayCircle, FileText, Bug, Paperclip,
  BarChart3, ClipboardList, Zap, Rocket, History, RefreshCw, Loader2, Plus, Trash2, FileDown,
} from "lucide-react";

type Tab =
  | "dashboard" | "suites" | "executions" | "cases" | "bugs"
  | "evidence" | "coverage" | "checklists" | "smoke" | "go_live" | "history";

type Suite = { id: string; name: string; module: string; description: string | null };
type Case = {
  id: string; suite_id: string | null; code: string | null; title: string;
  description: string | null; preconditions: string | null; steps: any;
  expected_result: string | null; priority: string; tags: string[];
  assignee: string | null; created_at: string;
};
type Exec = {
  id: string; test_case_id: string | null; executed_by: string | null;
  status: string; actual_result: string | null; notes: string | null;
  duration_ms: number | null; evidence: any; executed_at: string;
};
type BugRow = {
  id: string; title: string; description: string | null;
  severity: string; area: string | null; status: string;
  version: string | null; release: string | null; fix_note: string | null;
  related_case_id: string | null; assignee: string | null;
  created_at: string; updated_at: string;
};
type Checklist = { id: string; name: string; kind: string; items: any };
type ChecklistRun = { id: string; checklist_id: string | null; items: any; status: string; notes: string | null; created_at: string };
type Evidence = { id: string; execution_id: string | null; bug_id: string | null; kind: string; url: string; notes: string | null; created_at: string };
type GoLiveSnap = { id: string; score: number; criteria: any; status: string; created_at: string };

const db = supabase as any;
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString("pt-BR") : "—");

const statusColor = (s: string) => ({
  passed: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  failed: "bg-red-500/15 text-red-700 border-red-500/30",
  blocked: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  running: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  skipped: "bg-slate-500/15 text-slate-700 border-slate-500/30",
  not_started: "bg-slate-500/10 text-slate-500 border-slate-500/20",
}[s] ?? "bg-slate-500/10 text-slate-500 border-slate-500/20");

const sevColor = (s: string) => ({
  low: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  medium: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  high: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  critical: "bg-red-500/15 text-red-700 border-red-500/30",
}[s] ?? "bg-slate-500/10 text-slate-500 border-slate-500/20");

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: Activity },
  { key: "suites", label: "Test Suites", icon: ListChecks },
  { key: "executions", label: "Execuções", icon: PlayCircle },
  { key: "cases", label: "Casos de Teste", icon: FileText },
  { key: "bugs", label: "Bugs", icon: Bug },
  { key: "evidence", label: "Evidências", icon: Paperclip },
  { key: "coverage", label: "Cobertura", icon: BarChart3 },
  { key: "checklists", label: "Checklists", icon: ClipboardList },
  { key: "smoke", label: "Smoke Tests", icon: Zap },
  { key: "go_live", label: "Go Live", icon: Rocket },
  { key: "history", label: "Histórico", icon: History },
];

const PRIORITIES = ["low", "medium", "high", "critical"];
const SEVERITIES = ["low", "medium", "high", "critical"];
const BUG_STATUSES = ["open", "in_progress", "fixed", "wontfix", "duplicate", "closed"];
const EXEC_STATUSES = ["not_started", "running", "passed", "failed", "blocked", "skipped"];

const PlatformQACenterScreen = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [suites, setSuites] = useState<Suite[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [execs, setExecs] = useState<Exec[]>([]);
  const [bugs, setBugs] = useState<BugRow[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [runs, setRuns] = useState<ChecklistRun[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [snaps, setSnaps] = useState<GoLiveSnap[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [s, c, e, b, cl, r, ev, gs] = await Promise.all([
      db.from("qa_suites").select("*").order("module"),
      db.from("qa_test_cases").select("*").order("created_at", { ascending: false }),
      db.from("qa_executions").select("*").order("executed_at", { ascending: false }).limit(200),
      db.from("qa_bugs").select("*").order("created_at", { ascending: false }),
      db.from("qa_checklists").select("*").order("kind"),
      db.from("qa_checklist_runs").select("*").order("created_at", { ascending: false }).limit(50),
      db.from("qa_evidence").select("*").order("created_at", { ascending: false }).limit(100),
      db.from("qa_go_live_snapshots").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    setSuites(s.data ?? []); setCases(c.data ?? []); setExecs(e.data ?? []);
    setBugs(b.data ?? []); setChecklists(cl.data ?? []); setRuns(r.data ?? []);
    setEvidence(ev.data ?? []); setSnaps(gs.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ---- Métricas ----
  const metrics = useMemo(() => {
    const latestByCase: Record<string, Exec> = {};
    for (const e of execs) if (!latestByCase[e.test_case_id ?? ""]) latestByCase[e.test_case_id ?? ""] = e;
    const rows = Object.values(latestByCase);
    const passed = rows.filter((r) => r.status === "passed").length;
    const failed = rows.filter((r) => r.status === "failed").length;
    const blocked = rows.filter((r) => r.status === "blocked").length;
    const executedIds = new Set(rows.filter((r) => r.status !== "not_started").map((r) => r.test_case_id));
    const coverage = cases.length ? Math.round((executedIds.size / cases.length) * 100) : 0;
    const critical = bugs.filter((b) => b.severity === "critical" && !["fixed","closed","wontfix"].includes(b.status)).length;
    const high = bugs.filter((b) => b.severity === "high" && !["fixed","closed","wontfix"].includes(b.status)).length;
    const medium = bugs.filter((b) => b.severity === "medium" && !["fixed","closed","wontfix"].includes(b.status)).length;
    const low = bugs.filter((b) => b.severity === "low" && !["fixed","closed","wontfix"].includes(b.status)).length;
    return { total: cases.length, passed, failed, blocked, coverage, critical, high, medium, low };
  }, [cases, execs, bugs]);

  const coverageByModule = useMemo(() => {
    const map: Record<string, { total: number; executed: number; passed: number }> = {};
    for (const s of suites) map[s.module] = { total: 0, executed: 0, passed: 0 };
    const suiteModule: Record<string, string> = Object.fromEntries(suites.map((s) => [s.id, s.module]));
    for (const c of cases) {
      const mod = suiteModule[c.suite_id ?? ""] ?? "outros";
      if (!map[mod]) map[mod] = { total: 0, executed: 0, passed: 0 };
      map[mod].total += 1;
    }
    const latest: Record<string, Exec> = {};
    for (const e of execs) if (!latest[e.test_case_id ?? ""]) latest[e.test_case_id ?? ""] = e;
    for (const c of cases) {
      const mod = suiteModule[c.suite_id ?? ""] ?? "outros";
      const l = latest[c.id];
      if (l && l.status !== "not_started") map[mod].executed += 1;
      if (l?.status === "passed") map[mod].passed += 1;
    }
    return map;
  }, [suites, cases, execs]);

  const goLiveCriteria = useMemo(() => ({
    "Sem bugs críticos": metrics.critical === 0,
    "Sem bugs altos": metrics.high === 0,
    "Cobertura ≥ 95%": metrics.coverage >= 95,
    "Casos aprovados > 0": metrics.passed > 0,
    "Suites cadastradas": suites.length > 0,
  }), [metrics, suites]);

  const goLiveScore = useMemo(() => {
    const total = Object.values(goLiveCriteria).length;
    const ok = Object.values(goLiveCriteria).filter(Boolean).length;
    return total ? Math.round((ok / total) * 100) : 0;
  }, [goLiveCriteria]);

  // ---- Formularios ----
  const [caseForm, setCaseForm] = useState({ suite_id: "", code: "", title: "", description: "", preconditions: "", expected_result: "", priority: "medium", steps: "" });
  const saveCase = async () => {
    if (!caseForm.title || !caseForm.suite_id) return toast.error("Suite e título são obrigatórios");
    const steps = caseForm.steps.split("\n").map((t) => t.trim()).filter(Boolean).map((text, i) => ({ n: i + 1, text }));
    const { error } = await db.from("qa_test_cases").insert({ ...caseForm, steps });
    if (error) return toast.error(error.message);
    toast.success("Caso criado");
    setCaseForm({ suite_id: caseForm.suite_id, code: "", title: "", description: "", preconditions: "", expected_result: "", priority: "medium", steps: "" });
    loadAll();
  };
  const deleteCase = async (id: string) => {
    if (!confirm("Excluir caso?")) return;
    await db.from("qa_test_cases").delete().eq("id", id); loadAll();
  };

  const [execForm, setExecForm] = useState({ test_case_id: "", status: "passed", actual_result: "", notes: "", duration_ms: 0 });
  const saveExec = async () => {
    if (!execForm.test_case_id) return toast.error("Selecione um caso");
    const { error } = await db.from("qa_executions").insert({ ...execForm, executed_by: user?.id ?? null });
    if (error) return toast.error(error.message);
    toast.success("Execução registrada");
    setExecForm({ test_case_id: "", status: "passed", actual_result: "", notes: "", duration_ms: 0 });
    loadAll();
  };

  const [bugForm, setBugForm] = useState({ title: "", description: "", severity: "medium", area: "", status: "open", version: "", release: "", related_case_id: "" });
  const saveBug = async () => {
    if (!bugForm.title) return toast.error("Título obrigatório");
    const payload: any = { ...bugForm, created_by: user?.id ?? null };
    if (!payload.related_case_id) payload.related_case_id = null;
    const { error } = await db.from("qa_bugs").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Bug registrado");
    setBugForm({ title: "", description: "", severity: "medium", area: "", status: "open", version: "", release: "", related_case_id: "" });
    loadAll();
  };
  const updateBug = async (id: string, patch: Partial<BugRow>) => {
    await db.from("qa_bugs").update(patch).eq("id", id); loadAll();
  };

  const [evForm, setEvForm] = useState({ execution_id: "", kind: "image", url: "", notes: "" });
  const saveEvidence = async () => {
    if (!evForm.url) return toast.error("URL obrigatória");
    const payload: any = { ...evForm, uploaded_by: user?.id ?? null };
    if (!payload.execution_id) payload.execution_id = null;
    const { error } = await db.from("qa_evidence").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Evidência anexada");
    setEvForm({ execution_id: "", kind: "image", url: "", notes: "" });
    loadAll();
  };

  const runChecklist = async (cl: Checklist) => {
    const items = Array.isArray(cl.items) ? cl.items.map((it: any) => ({ ...it, done: false })) : [];
    const { error } = await db.from("qa_checklist_runs").insert({
      checklist_id: cl.id, executed_by: user?.id ?? null,
      items, status: "running",
    });
    if (error) return toast.error(error.message);
    toast.success(`Execução do checklist "${cl.name}" iniciada`); loadAll();
  };
  const toggleRunItem = async (run: ChecklistRun, idx: number) => {
    const items = [...(Array.isArray(run.items) ? run.items : [])];
    items[idx] = { ...items[idx], done: !items[idx].done };
    const done = items.every((it: any) => it.done);
    await db.from("qa_checklist_runs").update({ items, status: done ? "passed" : "running" }).eq("id", run.id);
    loadAll();
  };

  const captureGoLive = async () => {
    const status = goLiveScore === 100 ? "green" : goLiveScore >= 80 ? "yellow" : "red";
    const { error } = await db.from("qa_go_live_snapshots").insert({
      score: goLiveScore, criteria: goLiveCriteria, status, created_by: user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success(`Snapshot Go Live ${goLiveScore}/100 registrado`); loadAll();
  };

  const exportJSON = () => {
    const payload = { suites, cases, executions: execs, bugs, checklists, runs, evidence, goLive: snaps, metrics };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qa-center-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  };
  const exportCSV = () => {
    const header = "case_code,title,suite,status,executed_at";
    const suiteName: Record<string, string> = Object.fromEntries(suites.map((s) => [s.id, s.name]));
    const latest: Record<string, Exec> = {};
    for (const e of execs) if (!latest[e.test_case_id ?? ""]) latest[e.test_case_id ?? ""] = e;
    const rows = cases.map((c) => {
      const l = latest[c.id];
      return [c.code ?? "", JSON.stringify(c.title), suiteName[c.suite_id ?? ""] ?? "", l?.status ?? "not_started", l?.executed_at ?? ""].join(",");
    });
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qa-cases-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  return (
    <PlatformAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">QA Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Homologação manual da plataforma — estrutura preparada para integração futura com Playwright, Cypress, Vitest, Jest e GitHub Actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${goLiveScore === 100 ? statusColor("passed") : goLiveScore >= 80 ? statusColor("blocked") : statusColor("failed")}`}>
            Go Live {goLiveScore}/100
          </span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Metric title="Total de testes" value={String(metrics.total)} />
              <Metric title="Aprovados" value={String(metrics.passed)} tone="ok" />
              <Metric title="Falhados" value={String(metrics.failed)} tone="bad" />
              <Metric title="Bloqueados" value={String(metrics.blocked)} tone="warn" />
              <Metric title="Cobertura" value={`${metrics.coverage}%`} tone={metrics.coverage >= 95 ? "ok" : metrics.coverage >= 70 ? "warn" : "bad"} />
              <Metric title="Última execução" value={fmtDate(execs[0]?.executed_at)} />
              <Metric title="Última homologação" value={fmtDate(snaps[0]?.created_at)} />
              <Metric title="Go Live" value={`${goLiveScore}/100`} tone={goLiveScore === 100 ? "ok" : goLiveScore >= 80 ? "warn" : "bad"} />
              <Metric title="Bugs críticos" value={String(metrics.critical)} tone={metrics.critical ? "bad" : "ok"} />
              <Metric title="Bugs altos" value={String(metrics.high)} tone={metrics.high ? "warn" : "ok"} />
              <Metric title="Bugs médios" value={String(metrics.medium)} />
              <Metric title="Bugs baixos" value={String(metrics.low)} />
            </div>
          )}

          {tab === "suites" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suites.map((s) => {
                const cv = coverageByModule[s.module] ?? { total: 0, executed: 0, passed: 0 };
                const pct = cv.total ? Math.round((cv.executed / cv.total) * 100) : 0;
                return (
                  <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.description ?? "—"}</p>
                    <div className="mt-3 text-xs text-slate-600 flex justify-between">
                      <span>{cv.total} casos</span>
                      <span>{cv.executed} executados · {cv.passed} ok</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${pct >= 95 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "cases" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Novo caso</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <select value={caseForm.suite_id} onChange={(e) => setCaseForm({ ...caseForm, suite_id: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    <option value="">Suite…</option>
                    {suites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input placeholder="Código (ex.: SA-001)" value={caseForm.code} onChange={(e) => setCaseForm({ ...caseForm, code: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <input placeholder="Título" value={caseForm.title} onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <input placeholder="Pré-condições" value={caseForm.preconditions} onChange={(e) => setCaseForm({ ...caseForm, preconditions: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <input placeholder="Resultado esperado" value={caseForm.expected_result} onChange={(e) => setCaseForm({ ...caseForm, expected_result: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <textarea placeholder="Passos (um por linha)" value={caseForm.steps} onChange={(e) => setCaseForm({ ...caseForm, steps: e.target.value })} className="md:col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm" rows={3} />
                  <select value={caseForm.priority} onChange={(e) => setCaseForm({ ...caseForm, priority: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button onClick={saveCase} className="md:col-span-4 px-3 py-2 rounded-lg bg-[#F88A2B] text-black text-xs font-bold inline-flex items-center justify-center gap-2"><Plus className="w-3.5 h-3.5" /> Salvar caso</button>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left p-3">Código</th><th className="text-left p-3">Título</th>
                      <th className="text-left p-3">Suite</th><th className="text-left p-3">Prioridade</th>
                      <th className="text-left p-3">Último status</th><th className="text-right p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.length === 0 ? (
                      <tr><td colSpan={6} className="p-6 text-center text-slate-400 text-sm">Nenhum caso cadastrado.</td></tr>
                    ) : cases.map((c) => {
                      const latest = execs.find((e) => e.test_case_id === c.id);
                      const suite = suites.find((s) => s.id === c.suite_id);
                      return (
                        <tr key={c.id} className="border-t border-slate-100">
                          <td className="p-3 font-mono text-xs">{c.code ?? "—"}</td>
                          <td className="p-3">{c.title}</td>
                          <td className="p-3 text-slate-500 text-xs">{suite?.name ?? "—"}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${sevColor(c.priority)}`}>{c.priority}</span></td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusColor(latest?.status ?? "not_started")}`}>{latest?.status ?? "not_started"}</span></td>
                          <td className="p-3 text-right">
                            <button onClick={() => deleteCase(c.id)} className="p-1.5 rounded-md hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "executions" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-2">
                <select value={execForm.test_case_id} onChange={(e) => setExecForm({ ...execForm, test_case_id: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="">Caso…</option>
                  {cases.map((c) => <option key={c.id} value={c.id}>{c.code ?? c.id.slice(0, 6)} · {c.title}</option>)}
                </select>
                <select value={execForm.status} onChange={(e) => setExecForm({ ...execForm, status: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  {EXEC_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="number" placeholder="ms" value={execForm.duration_ms} onChange={(e) => setExecForm({ ...execForm, duration_ms: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <input placeholder="Resultado obtido" value={execForm.actual_result} onChange={(e) => setExecForm({ ...execForm, actual_result: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <textarea placeholder="Observações" value={execForm.notes} onChange={(e) => setExecForm({ ...execForm, notes: e.target.value })} className="md:col-span-5 px-3 py-2 rounded-lg border border-slate-200 text-sm" rows={2} />
                <button onClick={saveExec} className="px-3 py-2 rounded-lg bg-[#F88A2B] text-black text-xs font-bold">Registrar</button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left p-3">Quando</th><th className="text-left p-3">Caso</th>
                      <th className="text-left p-3">Status</th><th className="text-left p-3">Tempo</th>
                      <th className="text-left p-3">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {execs.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-400 text-sm">Sem execuções.</td></tr>
                    ) : execs.map((e) => {
                      const c = cases.find((x) => x.id === e.test_case_id);
                      return (
                        <tr key={e.id} className="border-t border-slate-100">
                          <td className="p-3 text-xs">{fmtDate(e.executed_at)}</td>
                          <td className="p-3 text-xs">{c?.code ?? "—"} — {c?.title ?? "?"}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusColor(e.status)}`}>{e.status}</span></td>
                          <td className="p-3">{e.duration_ms ?? 0} ms</td>
                          <td className="p-3 text-xs text-slate-600">{e.actual_result ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "bugs" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-2">
                <input placeholder="Título" value={bugForm.title} onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <select value={bugForm.severity} onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input placeholder="Área" value={bugForm.area} onChange={(e) => setBugForm({ ...bugForm, area: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <input placeholder="Versão" value={bugForm.version} onChange={(e) => setBugForm({ ...bugForm, version: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <input placeholder="Release" value={bugForm.release} onChange={(e) => setBugForm({ ...bugForm, release: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <select value={bugForm.related_case_id} onChange={(e) => setBugForm({ ...bugForm, related_case_id: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="">Sem caso</option>
                  {cases.map((c) => <option key={c.id} value={c.id}>{c.code ?? c.id.slice(0, 6)} · {c.title}</option>)}
                </select>
                <textarea placeholder="Descrição" value={bugForm.description} onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })} className="md:col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm" rows={2} />
                <button onClick={saveBug} className="px-3 py-2 rounded-lg bg-[#F88A2B] text-black text-xs font-bold">Registrar bug</button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left p-3">Título</th><th className="text-left p-3">Severidade</th>
                      <th className="text-left p-3">Status</th><th className="text-left p-3">Área</th>
                      <th className="text-left p-3">Versão</th><th className="text-left p-3">Criado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bugs.length === 0 ? (
                      <tr><td colSpan={6} className="p-6 text-center text-slate-400 text-sm">Sem bugs.</td></tr>
                    ) : bugs.map((b) => (
                      <tr key={b.id} className="border-t border-slate-100">
                        <td className="p-3">{b.title}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${sevColor(b.severity)}`}>{b.severity}</span></td>
                        <td className="p-3">
                          <select value={b.status} onChange={(e) => updateBug(b.id, { status: e.target.value as any })} className="px-2 py-1 rounded-md border border-slate-200 text-xs">
                            {BUG_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="p-3 text-xs text-slate-500">{b.area ?? "—"}</td>
                        <td className="p-3 text-xs">{b.version ?? "—"}</td>
                        <td className="p-3 text-xs">{fmtDate(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "evidence" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-2">
                <select value={evForm.execution_id} onChange={(e) => setEvForm({ ...evForm, execution_id: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="">Execução…</option>
                  {execs.slice(0, 50).map((e) => <option key={e.id} value={e.id}>{fmtDate(e.executed_at)} — {e.status}</option>)}
                </select>
                <select value={evForm.kind} onChange={(e) => setEvForm({ ...evForm, kind: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  {["image","pdf","video","txt","link"].map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <input placeholder="URL" value={evForm.url} onChange={(e) => setEvForm({ ...evForm, url: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <input placeholder="Comentário" value={evForm.notes} onChange={(e) => setEvForm({ ...evForm, notes: e.target.value })} className="md:col-span-4 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <button onClick={saveEvidence} className="px-3 py-2 rounded-lg bg-[#F88A2B] text-black text-xs font-bold">Anexar</button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                    <tr><th className="text-left p-3">Data</th><th className="text-left p-3">Tipo</th><th className="text-left p-3">URL</th><th className="text-left p-3">Comentário</th></tr>
                  </thead>
                  <tbody>
                    {evidence.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-slate-400 text-sm">Sem evidências.</td></tr>
                    ) : evidence.map((e) => (
                      <tr key={e.id} className="border-t border-slate-100">
                        <td className="p-3 text-xs">{fmtDate(e.created_at)}</td>
                        <td className="p-3 font-mono text-xs">{e.kind}</td>
                        <td className="p-3 text-xs"><a href={e.url} target="_blank" rel="noreferrer" className="text-sky-600 underline break-all">{e.url}</a></td>
                        <td className="p-3 text-xs text-slate-600">{e.notes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "coverage" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(coverageByModule).map(([mod, cv]) => {
                const pct = cv.total ? Math.round((cv.executed / cv.total) * 100) : 0;
                const passRate = cv.executed ? Math.round((cv.passed / cv.executed) * 100) : 0;
                return (
                  <div key={mod} className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="font-bold text-slate-900 capitalize">{mod.replace(/_/g, " ")}</p>
                    <p className="text-xs text-slate-500 mt-1">{cv.total} casos · {cv.executed} executados · {cv.passed} ok</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1"><span>Cobertura</span><span className="font-bold">{pct}%</span></div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${pct >= 95 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1"><span>Taxa de sucesso</span><span className="font-bold">{passRate}%</span></div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${passRate >= 95 ? "bg-emerald-500" : passRate >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${passRate}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(tab === "checklists" || tab === "smoke") && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {checklists
                  .filter((cl) => (tab === "smoke" ? cl.kind === "smoke" : cl.kind !== "smoke"))
                  .map((cl) => (
                    <div key={cl.id} className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{cl.name}</p>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{cl.kind}</span>
                      </div>
                      <ul className="mt-3 text-xs text-slate-600 space-y-1">
                        {(Array.isArray(cl.items) ? cl.items : []).map((it: any, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {it.label}
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => runChecklist(cl)} className="mt-3 w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center gap-2">
                        <PlayCircle className="w-3.5 h-3.5" /> Iniciar execução
                      </button>
                    </div>
                  ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Execuções recentes</p>
                {runs.length === 0 ? <p className="text-sm text-slate-400">Nenhuma execução.</p> : (
                  <div className="space-y-3">
                    {runs.slice(0, 10).map((run) => {
                      const cl = checklists.find((c) => c.id === run.checklist_id);
                      return (
                        <div key={run.id} className="border border-slate-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm">{cl?.name ?? "?"} <span className="text-xs text-slate-400">· {fmtDate(run.created_at)}</span></p>
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusColor(run.status)}`}>{run.status}</span>
                          </div>
                          <ul className="space-y-1">
                            {(Array.isArray(run.items) ? run.items : []).map((it: any, i: number) => (
                              <li key={i} className="flex items-center gap-2 text-xs">
                                <input type="checkbox" checked={!!it.done} onChange={() => toggleRunItem(run, i)} />
                                <span className={it.done ? "line-through text-slate-400" : "text-slate-700"}>{it.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "go_live" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Go Live Score</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${goLiveScore === 100 ? statusColor("passed") : goLiveScore >= 80 ? statusColor("blocked") : statusColor("failed")}`}>{goLiveScore}/100</span>
                </div>
                <ul className="mt-3 text-sm divide-y divide-slate-100">
                  {Object.entries(goLiveCriteria).map(([k, ok]) => (
                    <li key={k} className="py-2 flex items-center justify-between">
                      <span>{k}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${ok ? statusColor("passed") : statusColor("failed")}`}>{ok ? "OK" : "PENDENTE"}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex gap-2">
                  <button onClick={captureGoLive} className="px-3 py-2 rounded-lg bg-[#F88A2B] text-black text-xs font-bold">Registrar snapshot</button>
                  <button onClick={exportJSON} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1"><FileDown className="w-3.5 h-3.5" /> JSON</button>
                  <button onClick={exportCSV} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1"><FileDown className="w-3.5 h-3.5" /> CSV</button>
                  <button onClick={() => window.print()} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold">Imprimir / PDF</button>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Critérios adicionais (Backup, Performance, Health, IA, Storage, Cron) são acompanhados nos módulos dedicados (Backup & Recovery, Performance Center).
                </p>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  <tr><th className="text-left p-3">Data</th><th className="text-left p-3">Score</th><th className="text-left p-3">Status</th><th className="text-left p-3">Critérios</th></tr>
                </thead>
                <tbody>
                  {snaps.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-400 text-sm">Nenhum snapshot.</td></tr>
                  ) : snaps.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100 align-top">
                      <td className="p-3 text-xs">{fmtDate(s.created_at)}</td>
                      <td className="p-3 font-bold">{s.score}/100</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${s.status === "green" ? statusColor("passed") : s.status === "yellow" ? statusColor("blocked") : statusColor("failed")}`}>{s.status}</span></td>
                      <td className="p-3 text-xs text-slate-500 font-mono">{JSON.stringify(s.criteria)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PlatformAdminLayout>
  );
};

const Metric = ({ title, value, tone }: { title: string; value: string; tone?: "ok" | "warn" | "bad" }) => {
  const color = tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-red-600" : "text-slate-900";
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{title}</p>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
    </div>
  );
};

export default PlatformQACenterScreen;