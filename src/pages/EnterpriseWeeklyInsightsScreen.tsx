import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, RefreshCw, ShieldCheck, Target, AlertCircle, Zap } from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "@/components/EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

export default function EnterpriseWeeklyInsightsScreen() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [planningId, setPlanningId] = useState<string | null>(null);

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
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

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
          <div className="rounded-3xl bg-white p-10 border border-white/60 text-center space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-[#F88A2B]" />
            <p className="text-[15px] font-bold text-[#111]">Nenhum insight gerado ainda.</p>
            <p className="text-[12px] text-[#666] max-w-md mx-auto">
              Clique em "Gerar insights agora" para produzir o primeiro briefing semanal com base nos dados agregados.
            </p>
          </div>
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
                      </div>
                      <h3 className="text-[18px] font-bold text-[#111] leading-snug">{i.title}</h3>
                    </div>
                  </header>
                  {i.summary && <p className="text-[13px] text-[#555] leading-relaxed">{i.summary}</p>}
                  {evidenceKeys.length > 0 && (
                    <div className="rounded-2xl bg-[#F7F4F2] p-3 border border-[#E5E0DA]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" /> Evidências
                      </p>
                      <div className="space-y-1">
                        {evidenceKeys.slice(0, 6).map((k) => (
                          <div key={k} className="flex items-center justify-between text-[11px] text-[#555]">
                            <span className="font-medium truncate mr-2">{k}</span>
                            <span className="text-[#999] truncate max-w-[60%] text-right">
                              {String((i.evidence as any)?.[k]).slice(0, 60)}
                            </span>
                          </div>
                        ))}
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
                </article>
              );
            })}
          </div>
        )}
      </div>
    </EnterpriseRHLayout>
  );
}