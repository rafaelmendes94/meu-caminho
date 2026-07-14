import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Play, GitCompare, FlaskConical, Database, Gavel, Rocket, Undo2, ScrollText, LayoutDashboard, FileText, RefreshCw } from "lucide-react";

type PromptConfig = { id: string; key: string; name: string; version: number; status: string; system_instructions: string; model_config: any; updated_at: string };
type Dataset = { id: string; key: string; name: string; ai_module: string; description: string | null; default_criteria: any; created_at: string };
type DatasetItem = { id: string; dataset_id: string; question: string; expected_answer: string | null; category: string | null; criteria: any; context: any; weight: number; position: number };
type Run = { id: string; kind: string; ai_module: string | null; model: string; question: string; response_raw: string | null; status: string; latency_ms: number | null; tokens_in: number | null; tokens_out: number | null; cost_usd: number | null; created_at: string; error: string | null; prompt_config_id: string | null; prompt_version: number | null };
type Benchmark = { id: string; name: string; ai_module: string; model: string; status: string; aggregate: any; created_at: string; completed_at: string | null; error: string | null; dataset_id: string | null; prompt_config_id: string | null };
type Experiment = { id: string; name: string; ai_module: string; status: string; model_a: string; model_b: string; prompt_a_id: string | null; prompt_b_id: string | null; dataset_id: string | null; hypothesis: string | null; metrics: any; winner: string | null; created_at: string };
type Publication = { id: string; prompt_config_id: string; action: string; from_version: number | null; to_version: number | null; notes: string | null; created_at: string };
type Evaluation = { id: string; run_id: string; evaluator_kind: string; overall: number | null; scores: any; comment: string | null; judge_model: string | null; created_at: string };
type LogRow = { id: string; action: string; target_kind: string | null; target_id: string | null; payload: any; created_at: string };

const MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { value: "openai/gpt-5", label: "GPT-5" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano" },
];

const AI_MODULES = [
  "executive-ai",
  "generate-organizational-dna",
  "generate-weekly-insights",
  "generate-action-plan",
  "generate-intelligent-ritual",
  "cms-recommend",
  "ai-orchestrator",
];

export default function PlatformAILabScreen() {
  const [tab, setTab] = useState("dashboard");
  const [prompts, setPrompts] = useState<PromptConfig[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [p, d, r, b, e, pub, ev, lg] = await Promise.all([
      supabase.from("ai_prompt_configs").select("*").order("updated_at", { ascending: false }).limit(100),
      supabase.from("ai_lab_datasets").select("*").order("updated_at", { ascending: false }).limit(200),
      supabase.from("ai_lab_runs").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("ai_lab_benchmarks").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("ai_lab_experiments").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("ai_lab_publications").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("ai_lab_evaluations").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("ai_lab_logs").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setPrompts((p.data ?? []) as any);
    setDatasets((d.data ?? []) as any);
    setRuns((r.data ?? []) as any);
    setBenchmarks((b.data ?? []) as any);
    setExperiments((e.data ?? []) as any);
    setPublications((pub.data ?? []) as any);
    setEvaluations((ev.data ?? []) as any);
    setLogs((lg.data ?? []) as any);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <PlatformAdminLayout>
      <div className="p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="w-6 h-6" /> AI Lab™</h1>
            <p className="text-sm text-muted-foreground">Ambiente interno para criar, testar, comparar e publicar novas versões das IA.</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="ml-2">Recarregar</span>
          </Button>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="playground"><Play className="w-4 h-4 mr-1" />Playground</TabsTrigger>
            <TabsTrigger value="studio"><FileText className="w-4 h-4 mr-1" />Prompt Studio</TabsTrigger>
            <TabsTrigger value="compare"><GitCompare className="w-4 h-4 mr-1" />Comparador</TabsTrigger>
            <TabsTrigger value="benchmarks"><FlaskConical className="w-4 h-4 mr-1" />Benchmarks</TabsTrigger>
            <TabsTrigger value="datasets"><Database className="w-4 h-4 mr-1" />Datasets</TabsTrigger>
            <TabsTrigger value="evaluations"><Gavel className="w-4 h-4 mr-1" />Avaliações</TabsTrigger>
            <TabsTrigger value="experiments"><FlaskConical className="w-4 h-4 mr-1" />Experimentos</TabsTrigger>
            <TabsTrigger value="publications"><Rocket className="w-4 h-4 mr-1" />Publicações</TabsTrigger>
            <TabsTrigger value="rollback"><Undo2 className="w-4 h-4 mr-1" />Rollback</TabsTrigger>
            <TabsTrigger value="logs"><ScrollText className="w-4 h-4 mr-1" />Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab prompts={prompts} datasets={datasets} runs={runs} benchmarks={benchmarks} experiments={experiments} publications={publications} /></TabsContent>
          <TabsContent value="playground"><PlaygroundTab prompts={prompts} onDone={loadAll} runs={runs} /></TabsContent>
          <TabsContent value="studio"><StudioTab prompts={prompts} onChanged={loadAll} /></TabsContent>
          <TabsContent value="compare"><CompareTab prompts={prompts} onDone={loadAll} /></TabsContent>
          <TabsContent value="benchmarks"><BenchmarksTab benchmarks={benchmarks} prompts={prompts} datasets={datasets} onDone={loadAll} /></TabsContent>
          <TabsContent value="datasets"><DatasetsTab datasets={datasets} onChanged={loadAll} /></TabsContent>
          <TabsContent value="evaluations"><EvaluationsTab evaluations={evaluations} runs={runs} onDone={loadAll} /></TabsContent>
          <TabsContent value="experiments"><ExperimentsTab experiments={experiments} prompts={prompts} datasets={datasets} onDone={loadAll} /></TabsContent>
          <TabsContent value="publications"><PublicationsTab publications={publications} prompts={prompts} benchmarks={benchmarks} experiments={experiments} onDone={loadAll} /></TabsContent>
          <TabsContent value="rollback"><RollbackTab prompts={prompts} onDone={loadAll} /></TabsContent>
          <TabsContent value="logs"><LogsTab logs={logs} /></TabsContent>
        </Tabs>
      </div>
    </PlatformAdminLayout>
  );
}

// ---------- Dashboard ----------
function DashboardTab({ prompts, datasets, runs, benchmarks, experiments, publications }: any) {
  const stats = useMemo(() => {
    const avgLat = runs.length ? Math.round(runs.reduce((s: number, r: Run) => s + (r.latency_ms || 0), 0) / runs.length) : 0;
    const totalCost = runs.reduce((s: number, r: Run) => s + Number(r.cost_usd || 0), 0);
    const errors = runs.filter((r: Run) => r.status === "error").length;
    return { avgLat, totalCost, errors };
  }, [runs]);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <Stat label="Prompts" value={prompts.length} />
      <Stat label="Datasets" value={datasets.length} />
      <Stat label="Runs (últ. 100)" value={runs.length} />
      <Stat label="Benchmarks" value={benchmarks.length} />
      <Stat label="Experimentos" value={experiments.length} />
      <Stat label="Publicações" value={publications.length} />
      <Stat label="Latência média" value={`${stats.avgLat} ms`} />
      <Stat label="Custo total (USD)" value={`$${stats.totalCost.toFixed(4)}`} />
      <Stat label="Erros nas runs" value={stats.errors} />
    </div>
  );
}
function Stat({ label, value }: { label: string; value: any }) {
  return (
    <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-semibold mt-1">{value}</div></CardContent></Card>
  );
}

// ---------- Playground ----------
function PlaygroundTab({ prompts, onDone, runs }: any) {
  const [aiModule, setAiModule] = useState(AI_MODULES[0]);
  const [promptId, setPromptId] = useState<string>("");
  const [model, setModel] = useState(MODELS[0].value);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [knowledge, setKnowledge] = useState(true);
  const [question, setQuestion] = useState("");
  const [orgId, setOrgId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const execute = async () => {
    if (!question.trim()) return toast.error("Informe a pergunta");
    setBusy(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-lab-playground", {
        body: { aiModule, promptConfigId: promptId || null, model, temperature, maxTokens, knowledgeEnabled: knowledge, question, organizationId: orgId || null },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Execução concluída");
      onDone();
    } catch (e: any) { toast.error(e.message || "Falhou"); }
    finally { setBusy(false); }
  };

  const recent = runs.filter((r: Run) => r.kind === "playground").slice(0, 5);
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-4">
      <Card><CardHeader><CardTitle className="text-base">Nova execução</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>IA</Label><Select value={aiModule} onValueChange={setAiModule}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AI_MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Modelo</Label><Select value={model} onValueChange={setModel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><Label>Prompt (opcional)</Label><Select value={promptId || "none"} onValueChange={(v) => setPromptId(v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">— sem prompt vinculado —</SelectItem>{prompts.map((p: PromptConfig) => <SelectItem key={p.id} value={p.id}>{p.name} (v{p.version})</SelectItem>)}</SelectContent></Select></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Temperatura</Label><Input type="number" step="0.1" min="0" max="2" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} /></div>
          <div><Label>Max tokens</Label><Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} /></div>
        </div>
        <div className="flex items-center gap-2"><Switch checked={knowledge} onCheckedChange={setKnowledge} /><Label>Injetar Knowledge Hub (RAG)</Label></div>
        <div><Label>Organization ID (opcional)</Label><Input value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="uuid ou vazio p/ global" /></div>
        <div><Label>Pergunta</Label><Textarea rows={5} value={question} onChange={(e) => setQuestion(e.target.value)} /></div>
        <Button onClick={execute} disabled={busy} className="w-full">{busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}Executar</Button>
      </CardContent></Card>

      <Card><CardHeader><CardTitle className="text-base">Resultado</CardTitle></CardHeader><CardContent>
        {!result && <p className="text-sm text-muted-foreground">Nenhum resultado ainda.</p>}
        {result && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap text-xs">
              <Badge variant="outline">{result.model}</Badge>
              <Badge variant="outline">{result.latencyMs} ms</Badge>
              <Badge variant="outline">in: {result.tokensIn}</Badge>
              <Badge variant="outline">out: {result.tokensOut}</Badge>
              <Badge variant="outline">${Number(result.costUsd || 0).toFixed(6)}</Badge>
            </div>
            <pre className="text-xs bg-muted p-3 rounded max-h-96 overflow-auto whitespace-pre-wrap">{result.response}</pre>
          </div>
        )}
        <div className="mt-4">
          <div className="text-xs font-medium mb-2">Últimas execuções</div>
          <div className="space-y-1">
            {recent.map((r: Run) => (
              <div key={r.id} className="text-xs flex justify-between border-b py-1">
                <span className="truncate max-w-[240px]">{r.question}</span>
                <span className="text-muted-foreground">{r.model} · {r.latency_ms}ms · {r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent></Card>
    </div>
  );
}

// ---------- Prompt Studio ----------
function StudioTab({ prompts, onChanged }: any) {
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = prompts.find((p: PromptConfig) => p.id === selectedId);
  const [draft, setDraft] = useState({ name: "", system: "", description: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (selected) setDraft({ name: selected.name, system: selected.system_instructions || "", description: (selected as any).description || "" });
  }, [selectedId]);

  const saveDraft = async () => {
    if (!selected) return;
    setBusy(true);
    const { error } = await supabase.from("ai_prompt_configs").update({
      name: draft.name,
      system_instructions: draft.system,
      description: draft.description,
      status: "draft",
    }).eq("id", selected.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Draft salvo"); onChanged(); }
  };

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-4 mt-4">
      <Card><CardHeader><CardTitle className="text-base">Prompts</CardTitle></CardHeader><CardContent className="space-y-1 max-h-[600px] overflow-auto">
        {prompts.map((p: PromptConfig) => (
          <button key={p.id} onClick={() => setSelectedId(p.id)} className={`w-full text-left p-2 rounded text-sm ${selectedId === p.id ? "bg-primary/10" : "hover:bg-muted"}`}>
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-muted-foreground flex gap-1">v{p.version} <Badge variant="outline" className="ml-1 text-[10px]">{p.status}</Badge></div>
          </button>
        ))}
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Editor</CardTitle></CardHeader><CardContent className="space-y-3">
        {!selected && <p className="text-sm text-muted-foreground">Selecione um prompt.</p>}
        {selected && (
          <>
            <div><Label>Nome</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label>Descrição</Label><Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div><Label>System Instructions</Label><Textarea rows={16} className="font-mono text-xs" value={draft.system} onChange={(e) => setDraft({ ...draft, system: e.target.value })} /></div>
            <div className="flex gap-2"><Button onClick={saveDraft} disabled={busy}>{busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Salvar Draft</Button></div>
            <p className="text-xs text-muted-foreground">A publicação em produção é feita na aba <b>Publicações</b> (cria snapshot em ai_prompt_versions).</p>
          </>
        )}
      </CardContent></Card>
    </div>
  );
}

// ---------- Comparador ----------
function CompareTab({ prompts, onDone }: any) {
  const [aiModule, setAiModule] = useState(AI_MODULES[0]);
  const [promptA, setPromptA] = useState("");
  const [promptB, setPromptB] = useState("");
  const [modelA, setModelA] = useState(MODELS[0].value);
  const [modelB, setModelB] = useState(MODELS[3].value);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [resA, setResA] = useState<any>(null);
  const [resB, setResB] = useState<any>(null);

  const run = async () => {
    if (!question.trim()) return toast.error("Informe a pergunta");
    setBusy(true); setResA(null); setResB(null);
    try {
      const [a, b] = await Promise.all([
        supabase.functions.invoke("ai-lab-playground", { body: { aiModule, promptConfigId: promptA || null, model: modelA, question, knowledgeEnabled: true } }),
        supabase.functions.invoke("ai-lab-playground", { body: { aiModule, promptConfigId: promptB || null, model: modelB, question, knowledgeEnabled: true } }),
      ]);
      if (a.error) throw a.error;
      if (b.error) throw b.error;
      setResA(a.data); setResB(b.data);
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const Side = ({ res, label }: any) => (
    <Card><CardHeader><CardTitle className="text-base">{label}</CardTitle></CardHeader><CardContent>
      {!res && <p className="text-sm text-muted-foreground">—</p>}
      {res && (
        <div className="space-y-2">
          <div className="flex gap-1 flex-wrap text-xs">
            <Badge variant="outline">{res.model}</Badge>
            <Badge variant="outline">{res.latencyMs}ms</Badge>
            <Badge variant="outline">${Number(res.costUsd || 0).toFixed(6)}</Badge>
            <Badge variant="outline">{res.tokensOut} tk</Badge>
          </div>
          <pre className="text-xs bg-muted p-2 rounded max-h-80 overflow-auto whitespace-pre-wrap">{res.response}</pre>
        </div>
      )}
    </CardContent></Card>
  );

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label>IA</Label><Select value={aiModule} onValueChange={setAiModule}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AI_MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Modelo A</Label><Select value={modelA} onValueChange={setModelA}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Modelo B</Label><Select value={modelB} onValueChange={setModelB}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prompt A</Label><Select value={promptA || "none"} onValueChange={(v) => setPromptA(v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem>{prompts.map((p: PromptConfig) => <SelectItem key={p.id} value={p.id}>{p.name} v{p.version}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prompt B</Label><Select value={promptB || "none"} onValueChange={(v) => setPromptB(v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem>{prompts.map((p: PromptConfig) => <SelectItem key={p.id} value={p.id}>{p.name} v{p.version}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><Label>Pergunta</Label><Textarea rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} /></div>
        <Button onClick={run} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <GitCompare className="w-4 h-4 mr-2" />}Comparar</Button>
      </CardContent></Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Side res={resA} label="Variante A" />
        <Side res={resB} label="Variante B" />
      </div>
    </div>
  );
}

// ---------- Benchmarks ----------
function BenchmarksTab({ benchmarks, prompts, datasets, onDone }: any) {
  const [name, setName] = useState("");
  const [aiModule, setAiModule] = useState(AI_MODULES[0]);
  const [datasetId, setDatasetId] = useState("");
  const [promptId, setPromptId] = useState("");
  const [model, setModel] = useState(MODELS[0].value);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (!name || !datasetId) return toast.error("Nome e dataset obrigatórios");
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("ai-lab-benchmark", {
        body: { name, aiModule, datasetId, promptConfigId: promptId || null, model },
      });
      if (error) throw error;
      toast.success("Benchmark iniciado");
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  return (
    <div className="space-y-4 mt-4">
      <Card><CardHeader><CardTitle className="text-base">Novo benchmark em lote</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>IA</Label><Select value={aiModule} onValueChange={setAiModule}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AI_MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Modelo</Label><Select value={model} onValueChange={setModel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Dataset</Label><Select value={datasetId} onValueChange={setDatasetId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{datasets.map((d: Dataset) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prompt (opc.)</Label><Select value={promptId || "none"} onValueChange={(v) => setPromptId(v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem>{prompts.map((p: PromptConfig) => <SelectItem key={p.id} value={p.id}>{p.name} v{p.version}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <Button onClick={start} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FlaskConical className="w-4 h-4 mr-2" />}Executar</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Histórico</CardTitle></CardHeader><CardContent className="space-y-2">
        {benchmarks.map((b: Benchmark) => (
          <div key={b.id} className="border rounded p-3 text-sm">
            <div className="flex justify-between"><div className="font-medium">{b.name}</div><Badge>{b.status}</Badge></div>
            <div className="text-xs text-muted-foreground">{b.ai_module} · {b.model} · {new Date(b.created_at).toLocaleString()}</div>
            {b.aggregate && Object.keys(b.aggregate).length > 0 && (
              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">{JSON.stringify(b.aggregate, null, 2)}</pre>
            )}
            {b.error && <div className="text-xs text-destructive mt-1">{b.error}</div>}
          </div>
        ))}
        {benchmarks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum benchmark ainda.</p>}
      </CardContent></Card>
    </div>
  );
}

// ---------- Datasets ----------
function DatasetsTab({ datasets, onChanged }: any) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [newDs, setNewDs] = useState({ key: "", name: "", ai_module: AI_MODULES[0], description: "" });
  const [newItem, setNewItem] = useState({ question: "", expected_answer: "", category: "" });
  const [busy, setBusy] = useState(false);

  const loadItems = useCallback(async (id: string) => {
    const { data } = await supabase.from("ai_lab_dataset_items").select("*").eq("dataset_id", id).order("position");
    setItems((data ?? []) as any);
  }, []);

  useEffect(() => { if (selectedId) loadItems(selectedId); }, [selectedId, loadItems]);

  const create = async () => {
    if (!newDs.key || !newDs.name) return toast.error("Preencha chave e nome");
    setBusy(true);
    const { error } = await supabase.from("ai_lab_datasets").insert(newDs);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Dataset criado");
    setNewDs({ key: "", name: "", ai_module: AI_MODULES[0], description: "" });
    onChanged();
  };
  const addItem = async () => {
    if (!selectedId || !newItem.question) return;
    const { error } = await supabase.from("ai_lab_dataset_items").insert({ ...newItem, dataset_id: selectedId, position: items.length });
    if (error) return toast.error(error.message);
    setNewItem({ question: "", expected_answer: "", category: "" });
    loadItems(selectedId);
  };
  const delItem = async (id: string) => {
    await supabase.from("ai_lab_dataset_items").delete().eq("id", id);
    loadItems(selectedId);
  };

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-4 mt-4">
      <Card><CardHeader><CardTitle className="text-base">Datasets</CardTitle></CardHeader><CardContent className="space-y-2">
        {datasets.map((d: Dataset) => (
          <button key={d.id} onClick={() => setSelectedId(d.id)} className={`w-full text-left p-2 rounded text-sm ${selectedId === d.id ? "bg-primary/10" : "hover:bg-muted"}`}>
            <div className="font-medium">{d.name}</div>
            <div className="text-xs text-muted-foreground">{d.ai_module} · {d.key}</div>
          </button>
        ))}
        <div className="border-t pt-3 mt-3 space-y-2">
          <Label className="text-xs">Novo dataset</Label>
          <Input placeholder="key" value={newDs.key} onChange={(e) => setNewDs({ ...newDs, key: e.target.value })} />
          <Input placeholder="nome" value={newDs.name} onChange={(e) => setNewDs({ ...newDs, name: e.target.value })} />
          <Select value={newDs.ai_module} onValueChange={(v) => setNewDs({ ...newDs, ai_module: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AI_MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
          <Input placeholder="descrição" value={newDs.description} onChange={(e) => setNewDs({ ...newDs, description: e.target.value })} />
          <Button size="sm" onClick={create} disabled={busy} className="w-full">Criar</Button>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Itens</CardTitle></CardHeader><CardContent className="space-y-2">
        {!selectedId && <p className="text-sm text-muted-foreground">Selecione um dataset.</p>}
        {selectedId && (
          <>
            {items.map((it) => (
              <div key={it.id} className="border rounded p-2 text-sm">
                <div className="flex justify-between gap-2">
                  <div className="font-medium truncate">{it.question}</div>
                  <Button size="sm" variant="ghost" onClick={() => delItem(it.id)}>×</Button>
                </div>
                {it.expected_answer && <div className="text-xs text-muted-foreground mt-1">esperado: {it.expected_answer}</div>}
                {it.category && <Badge variant="outline" className="text-[10px] mt-1">{it.category}</Badge>}
              </div>
            ))}
            <div className="border-t pt-3 mt-3 space-y-2">
              <Textarea placeholder="pergunta" value={newItem.question} onChange={(e) => setNewItem({ ...newItem, question: e.target.value })} />
              <Textarea placeholder="resposta esperada (opcional)" value={newItem.expected_answer} onChange={(e) => setNewItem({ ...newItem, expected_answer: e.target.value })} />
              <Input placeholder="categoria" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
              <Button size="sm" onClick={addItem}>Adicionar item</Button>
            </div>
          </>
        )}
      </CardContent></Card>
    </div>
  );
}

// ---------- Evaluations ----------
function EvaluationsTab({ evaluations, runs, onDone }: any) {
  const [runId, setRunId] = useState("");
  const [busy, setBusy] = useState(false);
  const judge = async () => {
    if (!runId) return;
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("ai-lab-judge", { body: { runId } });
      if (error) throw error;
      toast.success("Avaliação registrada");
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="p-4 flex gap-2 items-end">
        <div className="flex-1"><Label>Run</Label><Select value={runId} onValueChange={setRunId}><SelectTrigger><SelectValue placeholder="Selecione run" /></SelectTrigger><SelectContent>{runs.filter((r: Run) => r.status === "success").slice(0, 30).map((r: Run) => <SelectItem key={r.id} value={r.id}>{r.model} · {r.question.slice(0, 60)}</SelectItem>)}</SelectContent></Select></div>
        <Button onClick={judge} disabled={busy}>{busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Avaliar (LLM-as-judge)</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {evaluations.map((ev: Evaluation) => (
          <Card key={ev.id}><CardContent className="p-3 text-sm">
            <div className="flex justify-between"><div className="font-medium">Overall: {ev.overall ?? "—"}</div><Badge variant="outline">{ev.evaluator_kind}</Badge></div>
            <div className="text-xs text-muted-foreground">{ev.judge_model} · {new Date(ev.created_at).toLocaleString()}</div>
            {ev.scores && <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">{JSON.stringify(ev.scores, null, 2)}</pre>}
            {ev.comment && <p className="text-xs mt-2">{ev.comment}</p>}
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Experiments ----------
function ExperimentsTab({ experiments, prompts, datasets, onDone }: any) {
  const [form, setForm] = useState({ name: "", ai_module: AI_MODULES[0], model_a: MODELS[0].value, model_b: MODELS[3].value, prompt_a_id: "", prompt_b_id: "", dataset_id: "", hypothesis: "" });
  const [busy, setBusy] = useState(false);
  const create = async () => {
    if (!form.name) return toast.error("Nome obrigatório");
    setBusy(true);
    const { error } = await supabase.from("ai_lab_experiments").insert({
      name: form.name, ai_module: form.ai_module, model_a: form.model_a, model_b: form.model_b,
      prompt_a_id: form.prompt_a_id || null, prompt_b_id: form.prompt_b_id || null,
      dataset_id: form.dataset_id || null, hypothesis: form.hypothesis || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Experimento criado");
    onDone();
  };
  return (
    <div className="space-y-4 mt-4">
      <Card><CardHeader><CardTitle className="text-base">Novo experimento A/B</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>IA</Label><Select value={form.ai_module} onValueChange={(v) => setForm({ ...form, ai_module: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AI_MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Modelo A</Label><Select value={form.model_a} onValueChange={(v) => setForm({ ...form, model_a: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Modelo B</Label><Select value={form.model_b} onValueChange={(v) => setForm({ ...form, model_b: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prompt A</Label><Select value={form.prompt_a_id || "none"} onValueChange={(v) => setForm({ ...form, prompt_a_id: v === "none" ? "" : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem>{prompts.map((p: PromptConfig) => <SelectItem key={p.id} value={p.id}>{p.name} v{p.version}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Prompt B</Label><Select value={form.prompt_b_id || "none"} onValueChange={(v) => setForm({ ...form, prompt_b_id: v === "none" ? "" : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem>{prompts.map((p: PromptConfig) => <SelectItem key={p.id} value={p.id}>{p.name} v{p.version}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Dataset</Label><Select value={form.dataset_id || "none"} onValueChange={(v) => setForm({ ...form, dataset_id: v === "none" ? "" : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem>{datasets.map((d: Dataset) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div><Label>Hipótese</Label><Textarea rows={2} value={form.hypothesis} onChange={(e) => setForm({ ...form, hypothesis: e.target.value })} /></div>
        <Button onClick={create} disabled={busy}>Criar experimento</Button>
      </CardContent></Card>
      <div className="space-y-2">
        {experiments.map((ex: Experiment) => (
          <Card key={ex.id}><CardContent className="p-3 text-sm">
            <div className="flex justify-between"><div className="font-medium">{ex.name}</div><Badge>{ex.status}</Badge></div>
            <div className="text-xs text-muted-foreground">{ex.ai_module} · A={ex.model_a} vs B={ex.model_b}{ex.winner ? ` · vencedor: ${ex.winner}` : ""}</div>
            {ex.hypothesis && <p className="text-xs mt-1">💡 {ex.hypothesis}</p>}
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Publications ----------
function PublicationsTab({ publications, prompts, benchmarks, experiments, onDone }: any) {
  const [promptId, setPromptId] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const publish = async () => {
    if (!promptId) return toast.error("Selecione um prompt");
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("ai-lab-publish", { body: { action: "publish", promptConfigId: promptId, notes } });
      if (error) throw error;
      toast.success("Prompt publicado");
      setNotes(""); onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  return (
    <div className="space-y-4 mt-4">
      <Card><CardHeader><CardTitle className="text-base">Publicar draft → produção</CardTitle></CardHeader><CardContent className="space-y-3">
        <div><Label>Prompt</Label><Select value={promptId} onValueChange={setPromptId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{prompts.map((p: PromptConfig) => <SelectItem key={p.id} value={p.id}>{p.name} (v{p.version} · {p.status})</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Notas</Label><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Change log" /></div>
        <Button onClick={publish} disabled={busy}>{busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}<Rocket className="w-4 h-4 mr-2" />Publicar</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Histórico</CardTitle></CardHeader><CardContent className="space-y-2">
        {publications.map((p: Publication) => {
          const pr = prompts.find((x: PromptConfig) => x.id === p.prompt_config_id);
          return (
            <div key={p.id} className="border rounded p-3 text-sm">
              <div className="flex justify-between"><div className="font-medium">{pr?.name || p.prompt_config_id}</div><Badge>{p.action}</Badge></div>
              <div className="text-xs text-muted-foreground">v{p.from_version ?? "?"} → v{p.to_version ?? "?"} · {new Date(p.created_at).toLocaleString()}</div>
              {p.notes && <p className="text-xs mt-1">{p.notes}</p>}
            </div>
          );
        })}
        {publications.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma publicação.</p>}
      </CardContent></Card>
    </div>
  );
}

// ---------- Rollback ----------
function RollbackTab({ prompts, onDone }: any) {
  const [promptId, setPromptId] = useState("");
  const [versions, setVersions] = useState<any[]>([]);
  const [target, setTarget] = useState<number | "">("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!promptId) return setVersions([]);
    supabase.from("ai_prompt_versions").select("*").eq("prompt_config_id", promptId).order("version", { ascending: false })
      .then(({ data }) => setVersions(data ?? []));
  }, [promptId]);

  const rollback = async () => {
    if (!promptId || !target) return;
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("ai-lab-publish", { body: { action: "rollback", promptConfigId: promptId, targetVersion: target } });
      if (error) throw error;
      toast.success(`Rollback para v${target}`);
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };
  return (
    <Card className="mt-4"><CardHeader><CardTitle className="text-base">Rollback de versão</CardTitle></CardHeader><CardContent className="space-y-3">
      <div><Label>Prompt</Label><Select value={promptId} onValueChange={setPromptId}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{prompts.map((p: PromptConfig) => <SelectItem key={p.id} value={p.id}>{p.name} (atual v{p.version})</SelectItem>)}</SelectContent></Select></div>
      {versions.length > 0 && (
        <div><Label>Versão alvo</Label>
          <Select value={String(target)} onValueChange={(v) => setTarget(Number(v))}><SelectTrigger><SelectValue placeholder="Selecione versão" /></SelectTrigger><SelectContent>{versions.map((v) => <SelectItem key={v.id} value={String(v.version)}>v{v.version} — {new Date(v.created_at).toLocaleDateString()} {v.change_note ? `· ${v.change_note}` : ""}</SelectItem>)}</SelectContent></Select>
        </div>
      )}
      <Button variant="destructive" onClick={rollback} disabled={busy || !target}>{busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}<Undo2 className="w-4 h-4 mr-2" />Reverter</Button>
    </CardContent></Card>
  );
}

// ---------- Logs ----------
function LogsTab({ logs }: { logs: LogRow[] }) {
  return (
    <div className="space-y-1 mt-4">
      {logs.map((l) => (
        <div key={l.id} className="border rounded p-2 text-xs flex justify-between gap-3">
          <div>
            <span className="font-medium">{l.action}</span>
            {l.target_kind && <span className="text-muted-foreground"> · {l.target_kind}</span>}
            {l.target_id && <span className="text-muted-foreground"> · {l.target_id.slice(0, 8)}</span>}
          </div>
          <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
        </div>
      ))}
      {logs.length === 0 && <p className="text-sm text-muted-foreground">Sem logs.</p>}
    </div>
  );
}