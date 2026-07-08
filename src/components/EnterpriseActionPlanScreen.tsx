import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  Plus,
  RefreshCw,
  CheckCircle2,
  Circle,
  CircleDot,
  Trash2,
  Target,
  Calendar,
  Flag,
  Loader2,
  Activity,
} from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Priority = "low" | "medium" | "high" | "critical";
type PlanStatus = "draft" | "active" | "paused" | "completed" | "canceled";
type TaskStatus = "todo" | "doing" | "done";
type SourceType = "dna" | "predictive_signal" | "alert" | "executive_ai" | "manual";

type Task = {
  id: string;
  action_plan_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
};

type Plan = {
  id: string;
  title: string;
  description: string | null;
  source_type: SourceType;
  source_id: string | null;
  status: PlanStatus;
  priority: Priority;
  due_date: string | null;
  created_at: string;
};

const PRIORITY_STYLE: Record<Priority, string> = {
  low: "bg-zinc-100 text-zinc-600 border-zinc-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_STYLE: Record<PlanStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  canceled: "bg-red-100 text-red-700",
};

const SOURCE_LABEL: Record<SourceType, string> = {
  dna: "DNA Organizacional™",
  predictive_signal: "Sinal Preditivo",
  alert: "Alerta RH",
  executive_ai: "Conselho Executivo IA",
  manual: "Criado manualmente",
};

export default function EnterpriseActionPlanScreen() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [manualTitle, setManualTitle] = useState("");
  const [impactBySource, setImpactBySource] = useState<Record<string, { impact: number | null; confidence: number | null }>>({});
  const [measuringId, setMeasuringId] = useState<string | null>(null);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data: planData, error } = await (supabase as any)
      .from("action_plans")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    const list = (planData as Plan[]) ?? [];
    setPlans(list);
    if (list.length) {
      const { data: taskData } = await (supabase as any)
        .from("action_plan_tasks")
        .select("*")
        .in("action_plan_id", list.map((p) => p.id))
        .order("created_at", { ascending: true });
      const grouped: Record<string, Task[]> = {};
      ((taskData as Task[]) ?? []).forEach((t) => {
        (grouped[t.action_plan_id] ??= []).push(t);
      });
      setTasks(grouped);
      const { data: imp } = await (supabase as any)
        .from("impact_measurements")
        .select("source_id, impact_score, confidence, measured_at")
        .eq("organization_id", organization.id)
        .eq("source_type", "action_plan")
        .in("source_id", list.map((p) => p.id))
        .order("measured_at", { ascending: false });
      const map: Record<string, { impact: number | null; confidence: number | null }> = {};
      ((imp ?? []) as any[]).forEach((r) => {
        if (!(r.source_id in map)) map[r.source_id] = { impact: r.impact_score, confidence: r.confidence };
      });
      setImpactBySource(map);
    } else {
      setTasks({});
      setImpactBySource({});
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const createManual = async () => {
    if (!organization?.id || !manualTitle.trim()) return;
    setCreating(true);
    const { error } = await (supabase as any).from("action_plans").insert({
      organization_id: organization.id,
      title: manualTitle.trim(),
      source_type: "manual",
      status: "draft",
      priority: "medium",
    });
    setCreating(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setManualTitle("");
    toast({ title: "Plano criado" });
    await load();
  };

  const updatePlan = async (id: string, patch: Partial<Plan>) => {
    const { error } = await (supabase as any).from("action_plans").update(patch).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Excluir este plano e todas as suas tarefas?")) return;
    const { error } = await (supabase as any).from("action_plans").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };

  const addTask = async (planId: string) => {
    const title = (newTaskTitle[planId] ?? "").trim();
    if (!title) return;
    const { error } = await (supabase as any).from("action_plan_tasks").insert({
      action_plan_id: planId,
      title,
      status: "todo",
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      setNewTaskTitle((s) => ({ ...s, [planId]: "" }));
      load();
    }
  };

  const cycleTask = async (t: Task) => {
    const next: TaskStatus = t.status === "todo" ? "doing" : t.status === "doing" ? "done" : "todo";
    const patch: Partial<Task> = { status: next, completed_at: next === "done" ? new Date().toISOString() : null };
    const { error } = await (supabase as any).from("action_plan_tasks").update(patch).eq("id", t.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };

  const deleteTask = async (id: string) => {
    const { error } = await (supabase as any).from("action_plan_tasks").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };

  const measurePlan = async (id: string) => {
    setMeasuringId(id);
    const { error } = await supabase.functions.invoke("measure-impact", {
      body: { source_type: "action_plan", source_id: id },
    });
    setMeasuringId(null);
    if (error) toast({ title: "Erro ao medir impacto", description: error.message, variant: "destructive" });
    else { toast({ title: "Impacto medido" }); await load(); }
  };

  const grouped = useMemo(() => {
    const g: Record<PlanStatus, Plan[]> = { draft: [], active: [], paused: [], completed: [], canceled: [] };
    plans.forEach((p) => g[p.status].push(p));
    return g;
  }, [plans]);

  const progress = (planId: string) => {
    const list = tasks[planId] ?? [];
    if (!list.length) return 0;
    return Math.round((list.filter((t) => t.status === "done").length / list.length) * 100);
  };

  const renderTaskIcon = (s: TaskStatus) =>
    s === "done" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
    s === "doing" ? <CircleDot className="w-4 h-4 text-[#F88A2B]" /> :
    <Circle className="w-4 h-4 text-zinc-400" />;

  const PlanCard = ({ plan }: { plan: Plan }) => {
    const planTasks = tasks[plan.id] ?? [];
    const pct = progress(plan.id);
    const isOpen = expanded === plan.id;
    return (
      <div className="rounded-[28px] bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[plan.priority]}`}>
                  <Flag className="inline w-3 h-3 mr-1" />{plan.priority}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLE[plan.status]}`}>
                  {plan.status}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#999]">{SOURCE_LABEL[plan.source_type]}</span>
                {impactBySource[plan.id]?.impact != null && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${Number(impactBySource[plan.id].impact) >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    <Activity className="w-3 h-3" /> Impacto {Number(impactBySource[plan.id].impact) >= 0 ? "+" : ""}{Number(impactBySource[plan.id].impact).toFixed(1)}
                  </span>
                )}
              </div>
              <h4 className="text-[17px] font-bold text-[#111] leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                {plan.title}
              </h4>
              {plan.description && (
                <p className="text-[13px] text-[#666] mt-2 leading-relaxed line-clamp-3">{plan.description}</p>
              )}
            </div>
            <button
              onClick={() => deletePlan(plan.id)}
              className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition"
              aria-label="Excluir plano"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#999]">
              <span>Progresso</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-[#F7F4F2] rounded-full overflow-hidden">
              <div className="h-full bg-[#F88A2B] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[10px] text-[#999]">{planTasks.filter(t => t.status === "done").length} de {planTasks.length} tarefas</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#F7F4F2]">
            <select
              value={plan.status}
              onChange={(e) => updatePlan(plan.id, { status: e.target.value as PlanStatus })}
              className="text-[11px] rounded-lg border border-zinc-200 px-2 py-1 bg-white"
            >
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Concluído</option>
              <option value="canceled">Cancelado</option>
            </select>
            <select
              value={plan.priority}
              onChange={(e) => updatePlan(plan.id, { priority: e.target.value as Priority })}
              className="text-[11px] rounded-lg border border-zinc-200 px-2 py-1 bg-white"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
            <button
              onClick={() => setExpanded(isOpen ? null : plan.id)}
              className="ml-auto text-[11px] font-bold uppercase tracking-wider text-[#F88A2B] hover:opacity-80"
            >
              {isOpen ? "Recolher" : "Ver tarefas"}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-[#F7F4F2] bg-[#FAFAFA] p-6 space-y-3">
            {planTasks.length === 0 && <p className="text-[12px] text-[#999] italic">Sem tarefas ainda.</p>}
            {planTasks.map((t) => (
              <div key={t.id} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-zinc-100">
                <button onClick={() => cycleTask(t)} className="mt-0.5 shrink-0">
                  {renderTaskIcon(t.status)}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium ${t.status === "done" ? "line-through text-zinc-400" : "text-[#111]"}`}>{t.title}</div>
                  {t.description && <p className="text-[11px] text-[#666] mt-0.5 leading-relaxed">{t.description}</p>}
                  {t.due_date && (
                    <div className="text-[10px] text-[#999] mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(t.due_date).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </div>
                <button onClick={() => deleteTask(t.id)} className="p-1 text-zinc-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <input
                value={newTaskTitle[plan.id] ?? ""}
                onChange={(e) => setNewTaskTitle((s) => ({ ...s, [plan.id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") addTask(plan.id); }}
                placeholder="Nova tarefa…"
                className="flex-1 text-[13px] rounded-xl border border-zinc-200 px-3 py-2 bg-white focus:outline-none focus:border-[#F88A2B]"
              />
              <button
                onClick={() => addTask(plan.id)}
                className="px-3 py-2 rounded-xl bg-[#F88A2B] text-white text-[12px] font-bold inline-flex items-center gap-1 hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const StatusSection = ({ label, list }: { label: string; list: Plan[] }) => {
    if (list.length === 0) return null;
    return (
      <section>
        <div className="flex items-center gap-3 mb-4 px-1">
          <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999]">{label}</h3>
          <span className="text-[11px] text-[#999]">({list.length})</span>
          <div className="h-px flex-1 bg-black/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {list.map((p) => <PlanCard key={p.id} plan={p} />)}
        </div>
      </section>
    );
  };

  return (
    <EnterpriseRHLayout title="Planos de Ação Inteligentes">
      <div className="space-y-8 animate-fade-in">
        {/* Hero */}
        <section className="rounded-[32px] bg-white border border-black/5 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-[#F88A2B]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Execução estratégica</span>
          </div>
          <h2 className="text-[28px] leading-tight font-extrabold text-[#111] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Transforme diagnósticos em execução real.
          </h2>
          <p className="text-[14px] leading-relaxed text-[#666] max-w-3xl">
            Planos de ação criados a partir do DNA Organizacional™, Sinais Preditivos, Alertas RH e Conselho Executivo IA.
          </p>
        </section>

        {/* Criar manual */}
        <section className="rounded-3xl bg-white p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-3">Criar plano manual</h3>
          <div className="flex gap-2">
            <input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createManual(); }}
              placeholder="Título do plano de ação…"
              className="flex-1 text-[14px] rounded-2xl border border-zinc-200 px-4 py-3 bg-white focus:outline-none focus:border-[#F88A2B]"
            />
            <button
              onClick={createManual}
              disabled={creating || !manualTitle.trim()}
              className="px-5 rounded-2xl bg-[#0B0908] text-white text-[12px] font-bold inline-flex items-center gap-2 hover:opacity-90 disabled:opacity-40"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Criar
            </button>
          </div>
        </section>

        {/* Privacidade */}
        <div className="rounded-2xl bg-[#F7F4F2] border border-[#E5E0DA] p-5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#F88A2B] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#666] leading-relaxed italic">
            Planos de ação são gerados a partir de dados agregados e recomendações organizacionais. Nenhum dado individual é utilizado.
          </p>
        </div>

        {loading && plans.length === 0 && (
          <div className="rounded-3xl bg-white p-10 border border-white/60 text-center text-[13px] text-[#666]">
            Carregando planos…
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div className="rounded-3xl bg-white p-10 border border-white/60 text-center space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-[#F88A2B]" />
            <p className="text-[15px] font-bold text-[#111]">Nenhum plano de ação ainda.</p>
            <p className="text-[12px] text-[#666] max-w-md mx-auto">
              Gere planos a partir do DNA Organizacional™, Sinais Preditivos, Alertas ou Conselho Executivo IA — ou crie manualmente acima.
            </p>
          </div>
        )}

        <StatusSection label="Ativos" list={grouped.active} />
        <StatusSection label="Rascunhos" list={grouped.draft} />
        <StatusSection label="Pausados" list={grouped.paused} />
        <StatusSection label="Concluídos" list={grouped.completed} />
        <StatusSection label="Cancelados" list={grouped.canceled} />
      </div>
    </EnterpriseRHLayout>
  );
}