import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, RefreshCw, ShieldCheck, Target, AlertCircle, Zap, Activity } from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "@/components/EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRealtime } from "@/hooks/useRealtime";
import { EmptyState } from "@/components/ui/empty-state";

type Insight = {
  id: string;
  week_of: string;
  title: string;
  summary: string | null;
  insight_type: string | null;
  severity: string | null;
  confidence: number | null;
  evidence: Record<string, unknown> | null;
  recommended_actions: unknown;
  generated_at: string;
};

const severityColor = (s: string | null) => {
  switch ((s ?? "").toLowerCase()) {
    case "critical": return "bg-red-500/10 text-red-600 border-red-500/20";
    case "high": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    case "medium": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    case "low": return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
    default: return "bg-[#F7F4F2] text-[#666] border-[#E5E0DA]";
  }
};

const toList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : JSON.stringify(x))) : [];

const EVIDENCE_LABELS: Record<string, string> = {
  window_days: "Janela analisada",
  participants: "Participantes",
  total_profiles: "Perfis totais",
  pulse_participants: "Pulsos respondidos",
  checkin_participants: "Check-ins realizados",
  avg_energy: "Energia média",
  avg_engagement: "Engajamento médio",
  avg_communication: "Comunicação média",
  avg_equilibrium: "Equilíbrio médio",
  avg_recovery: "Recuperação média",
  base_score: "Score base",
  overall_score: "Score geral",
  risk_penalty: "Penalidade de risco",
  confidence: "Confiança",
  unit: "Unidade",
  unit_name: "Unidade",
  trend: "Tendência",
  delta: "Variação",
  variation: "Variação",
};

const humanizeKey = (k: string) =>
  EVIDENCE_LABELS[k] ??
  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatEvidenceValue = (k: string, v: unknown): string => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") {
    if (k === "window_days") return `${v} dias`;
    if (k === "confidence" || (v > 0 && v < 1 && k.startsWith("avg_"))) {
      return `${Math.round(v * 100)}%`;
    }
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
};
export default function EnterpriseWeeklyInsightsScreen() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [planningId, setPlanningId] = useState<string | null>(null);
  const [ritualId, setRitualId] = useState<string | null>(null);
  const [impactBySource, setImpactBySource] = useState<Record<string, number>>({});
  const [measuringId, setMeasuringId] = useState<string | null>(null);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("weekly_ai_insights")
      .select("*")
      .eq("organization_id", organization.id)
      .order("generated_at", { ascending: false })
      .limit(20);
    setInsights((data ?? []) as Insight[]);
    const ids = (data ?? []).map((r: any) => r.id);
    if (ids.length) {
      const { data: imp } = await (supabase as any)
        .from("impact_measurements")
        .select("source_id, impact_score, measured_at")
        .eq("organization_id", organization.id)
        .eq("source_type", "weekly_insight")
        .in("source_id", ids)
        .order("measured_at", { ascending: false });
      const map: Record<string, number> = {};
      ((imp ?? []) as any[]).forEach((r) => { if (!(r.source_id in map) && r.impact_score != null) map[r.source_id] = r.impact_score; });
      setImpactBySource(map);
    } else setImpactBySource({});
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  useRealtime(
    `weekly-insights-${organization?.id ?? "none"}`,
    organization?.id
      ? [{ table: "weekly_ai_insights", filter: `organization_id=eq.${organization.id}` }]
      : [],
    () => { void load(); },
    [organization?.id]
  );

  const generate = async () => {
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("generate-weekly-insights", { body: {} });
    setGenerating(false);
    if (error || (data as any)?.error) {
      toast({ title: "Não foi possível gerar", description: error?.message ?? String((data as any)?.error), variant: "destructive" });
    } else {
      toast({ title: "Insights semanais atualizados" });
      await load();
    }
  };

  const generatePlan = async (insight: Insight) => {
    setPlanningId(insight.id);
    const { data, error } = await supabase.functions.invoke("generate-action-plan", {
      body: { source_type: "weekly_insight", source_id: insight.id, context: { title: insight.title, summary: insight.summary } },
    });
    setPlanningId(null);
    if (error || (data as any)?.error) {
      toast({ title: "Erro ao gerar plano", description: error?.message ?? String((data as any)?.error), variant: "destructive" });
    } else {
      toast({ title: "Plano de ação criado" });
      navigate("/enterprise/rh/plano-acao");
    }
  };

  const suggestRitual = async (insight: Insight) => {
    setRitualId(insight.id);
    const { data, error } = await supabase.functions.invoke("generate-intelligent-ritual", {
      body: { source_type: "weekly_insight", source_id: insight.id },
    });
    setRitualId(null);
    if (error || (data as any)?.error) {
      toast({ title: "Erro ao sugerir ritual", description: error?.message ?? String((data as any)?.error), variant: "destructive" });
    } else {
      toast({ title: "Ritual sugerido" });
      navigate("/enterprise/rh/rituais-inteligentes");
    }
  };

  const measureImpact = async (id: string) => {
    setMeasuringId(id);
    const { error } = await supabase.functions.invoke("measure-impact", {
      body: { source_type: "weekly_insight", source_id: id },
    });
    setMeasuringId(null);
    if (error) toast({ title: "Erro ao medir impacto", description: error.message, variant: "destructive" });
    else { toast({ title: "Impacto medido" }); await load(); }
  };

  const currentWeek = insights[0]?.week_of;
  const weekInsights = insights.filter((i) => i.week_of === currentWeek);

  return (
    <EnterpriseRHLayout title="Insights Semanais IA™">
      <div className="space-y-8 animate-fade-in">
        <section className="rounded-[2.5rem] bg-white border border-[#E5E0DA] p-10 md:p-14 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/5 blur-[120px] rounded-full -mr-40 -mt-40" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="px-3 py-1.5 rounded-full bg-[#F88A2B]/10 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-[#F88A2B]/20 inline-flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Briefing Executivo Semanal
              </span>
              <h2 className="text-[32px] md:text-[42px] leading-tight font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                O que sua organização está sinalizando esta semana.
              </h2>
              <p className="text-[15px] md:text-[17px] leading-relaxed text-[#666] max-w-xl">
                A IA analisa automaticamente indicadores agregados e destaca até cinco insights estratégicos por semana.
              </p>
            </div>
            <div className="shrink-0">
              <EnterpriseRHButton onClick={generate} icon={generating ? RefreshCw : Sparkles} fullWidth={false}>
                {generating ? "Gerando…" : "Gerar insights agora"}
              </EnterpriseRHButton>
              {currentWeek && (
                <p className="text-[11px] text-[#999] mt-3 text-center">
                  Semana de {new Date(currentWeek).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="rounded-2xl bg-[#F7F4F2] border border-[#E5E0DA] p-4 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#F88A2B] mt-0.5" />
          <p className="text-[12px] text-[#666] leading-relaxed">
            Os Insights Semanais utilizam exclusivamente dados organizacionais agregados e anonimizados.
          </p>
        </div>

        {loading && insights.length === 0 && (
          <div className="rounded-3xl bg-white p-10 border border-white/60 text-center text-[13px] text-[#666]">
            Carregando insights…
          </div>
        )}

        {!loading && insights.length === 0 && !generating && (
          <EmptyState
            icon={Sparkles}
            title="Nenhum insight gerado ainda"
            description='Clique em "Gerar insights agora" para produzir o primeiro briefing semanal com base nos dados agregados.'
          />
        )}

        {generating && (
          <div className="rounded-3xl bg-white p-10 border border-white/60 flex items-center justify-center gap-3 text-[13px] text-[#666]">
            <RefreshCw className="w-4 h-4 animate-spin text-[#F88A2B]" />
            Analisando indicadores agregados…
          </div>
        )}

        {weekInsights.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {weekInsights.map((i) => {
              const actions = toList(i.recommended_actions);
              const evidenceKeys = i.evidence ? Object.keys(i.evidence) : [];
              return (
                <article key={i.id} className="rounded-3xl bg-white border border-[#E5E0DA] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4">
                  <header className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${severityColor(i.severity)}`}>
                          {i.severity ?? "medium"}
                        </span>
                        {i.insight_type && (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F7F4F2] text-[#666] border border-[#E5E0DA]">
                            {i.insight_type}
                          </span>
                        )}
                        {i.confidence != null && (
                          <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">
                            Confiança {Math.round((i.confidence ?? 0) * 100)}%
                          </span>
                        )}
                        {impactBySource[i.id] != null && (
                          <span className={`text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${Number(impactBySource[i.id]) >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                            <Activity className="w-3 h-3" /> Impacto {Number(impactBySource[i.id]) >= 0 ? "+" : ""}{Number(impactBySource[i.id]).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[18px] font-bold text-[#111] leading-snug">{i.title}</h3>
                    </div>
                  </header>
                  {i.summary && <p className="text-[13px] text-[#555] leading-relaxed">{i.summary}</p>}
                  {evidenceKeys.length > 0 && (
                    <div className="rounded-2xl bg-gradient-to-br from-[#FBF8F5] to-[#F7F4F2] p-4 border border-[#E5E0DA]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-3 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 text-[#F88A2B]" /> Evidências
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {evidenceKeys.slice(0, 6).map((k) => {
                          const raw = (i.evidence as any)?.[k];
                          const isPrimitive =
                            raw === null ||
                            ["string", "number", "boolean"].includes(typeof raw);
                          if (!isPrimitive) return null;
                          return (
                            <div
                              key={k}
                              className="rounded-xl bg-white border border-[#EFE9E3] px-3 py-2 flex flex-col gap-0.5"
                            >
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#999] truncate">
                                {humanizeKey(k)}
                              </span>
                              <span className="text-[14px] font-bold text-[#111] leading-tight tabular-nums">
                                {formatEvidenceValue(k, raw)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {actions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-2">Ações recomendadas</p>
                      <ul className="space-y-1.5">
                        {actions.slice(0, 5).map((a, idx) => (
                          <li key={idx} className="text-[12px] text-[#555] leading-relaxed flex gap-2">
                            <span className="text-[#F88A2B]">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => generatePlan(i)}
                    disabled={planningId === i.id}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#F88A2B]/30 bg-white text-[#F88A2B] px-4 py-2 text-[12px] font-bold hover:bg-[#F88A2B]/5 disabled:opacity-40"
                  >
                    {planningId === i.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
                    {planningId === i.id ? "Gerando plano…" : "Criar Plano de Ação"}
                  </button>
                  <button
                    onClick={() => suggestRitual(i)}
                    disabled={ritualId === i.id}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#F88A2B]/30 bg-white text-[#F88A2B] px-4 py-2 text-[12px] font-bold hover:bg-[#F88A2B]/5 disabled:opacity-40"
                  >
                    {ritualId === i.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {ritualId === i.id ? "Sugerindo ritual…" : "Sugerir ritual"}
                  </button>
                  <button
                    onClick={() => measureImpact(i.id)}
                    disabled={measuringId === i.id}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E5E0DA] bg-white text-[#111] px-4 py-2 text-[12px] font-bold hover:bg-[#F7F4F2] disabled:opacity-40"
                  >
                    {measuringId === i.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                    {measuringId === i.id ? "Medindo impacto…" : "Medir impacto"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </EnterpriseRHLayout>
  );
}