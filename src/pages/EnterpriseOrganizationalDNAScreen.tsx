import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dna, Sparkles, RefreshCw, ShieldCheck, TrendingUp, AlertCircle, Target } from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "@/components/EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type DNAReport = {
  id: string;
  generated_at: string;
  period_start: string | null;
  period_end: string | null;
  overall_score: number | null;
  culture_score: number | null;
  leadership_score: number | null;
  communication_score: number | null;
  collaboration_score: number | null;
  engagement_score: number | null;
  energy_score: number | null;
  recovery_score: number | null;
  psychological_safety_score: number | null;
  summary: string | null;
  strengths: unknown;
  opportunities: unknown;
  recommendations: unknown;
  generated_by: string | null;
};

const fmt = (v: number | null | undefined) =>
  v === null || v === undefined ? "•••" : Math.round(Number(v)).toString();

const toList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string" || typeof x === "object") .map((x) => typeof x === "string" ? x : JSON.stringify(x)) : [];

const ScoreCard = ({ label, value }: { label: string; value: number | null }) => (
  <div className="rounded-3xl p-6 bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
    <div className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-2">{label}</div>
    <div className="flex items-end gap-1">
      <div className="text-[36px] font-bold text-[#111] leading-none">{fmt(value)}</div>
      <div className="text-[12px] text-[#666] font-bold pb-1">/100</div>
    </div>
    <div className="mt-4 h-2 bg-[#F7F4F2] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{
          width: value != null ? `${Math.min(100, Math.max(0, value))}%` : "0%",
          background: "linear-gradient(90deg, #F88A2B 0%, #FFB870 100%)",
        }}
      />
    </div>
  </div>
);

export default function EnterpriseOrganizationalDNAScreen() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [report, setReport] = useState<DNAReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [planning, setPlanning] = useState(false);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("organizational_dna_reports")
      .select("*")
      .eq("organization_id", organization.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setReport((data as DNAReport) ?? null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const generate = async () => {
    setGenerating(true);
    const { error } = await supabase.functions.invoke("generate-organizational-dna", {
      body: { days: 90 },
    });
    if (error) {
      toast({ title: "Não foi possível gerar o DNA", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "DNA Organizacional gerado" });
      await load();
    }
    setGenerating(false);
  };

  const generatePlan = async () => {
    if (!report?.id) return;
    setPlanning(true);
    const { data, error } = await supabase.functions.invoke("generate-action-plan", {
      body: { source_type: "dna", source_id: report.id },
    });
    setPlanning(false);
    if (error || (data as any)?.error) {
      toast({ title: "Erro ao gerar plano", description: error?.message ?? String((data as any)?.error), variant: "destructive" });
    } else {
      toast({ title: "Plano de ação criado" });
      navigate("/enterprise/rh/plano-acao");
    }
  };

  const strengths = toList(report?.strengths);
  const opportunities = toList(report?.opportunities);
  const recommendations = toList(report?.recommendations);

  return (
    <EnterpriseRHLayout title="DNA Organizacional™">
      <div className="space-y-8 animate-fade-in">
        {/* Hero */}
        <section className="rounded-[2.5rem] bg-white border border-[#E5E0DA] p-10 md:p-14 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/5 blur-[120px] rounded-full -mr-40 -mt-40" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-[#F88A2B]/10 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-[#F88A2B]/20 inline-flex items-center gap-1.5">
                  <Dna className="w-3 h-3" /> DNA Organizacional™
                </span>
              </div>
              <h2 className="text-[32px] md:text-[42px] leading-tight font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                A leitura viva do comportamento coletivo da sua organização.
              </h2>
              <p className="text-[15px] md:text-[17px] leading-relaxed text-[#666] max-w-xl">
                Uma síntese executiva construída por IA sobre dados exclusivamente agregados e anonimizados.
              </p>
            </div>
            <div className="shrink-0">
              <EnterpriseRHButton onClick={generate} icon={generating ? RefreshCw : Sparkles} fullWidth={false}>
                {generating ? "Gerando…" : report ? "Gerar novo DNA" : "Gerar DNA agora"}
              </EnterpriseRHButton>
              {report && (
                <button
                  onClick={generatePlan}
                  disabled={planning}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#F88A2B]/30 bg-white text-[#F88A2B] px-4 py-2 text-[12px] font-bold hover:bg-[#F88A2B]/5 disabled:opacity-40"
                >
                  {planning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
                  {planning ? "Gerando plano…" : "Gerar plano de ação"}
                </button>
              )}
              {report?.generated_at && (
                <p className="text-[11px] text-[#999] mt-3 text-center">
                  Última geração: {new Date(report.generated_at).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Loading / Empty */}
        {loading && !report && (
          <div className="rounded-3xl bg-white p-10 border border-white/60 text-center text-[13px] text-[#666]">
            Carregando relatório…
          </div>
        )}

        {!loading && !report && !generating && (
          <div className="rounded-3xl bg-white p-10 border border-white/60 text-center space-y-3">
            <Dna className="w-8 h-8 mx-auto text-[#F88A2B]" />
            <p className="text-[15px] font-bold text-[#111]">Nenhum DNA Organizacional gerado ainda.</p>
            <p className="text-[12px] text-[#666] max-w-md mx-auto">
              Clique em "Gerar DNA agora" para produzir o primeiro relatório executivo com base nos dados agregados dos últimos 90 dias.
            </p>
          </div>
        )}

        {generating && (
          <div className="rounded-3xl bg-white p-10 border border-white/60 flex items-center justify-center gap-3 text-[13px] text-[#666]">
            <RefreshCw className="w-4 h-4 animate-spin text-[#F88A2B]" />
            Analisando dados agregados e sintetizando o DNA…
          </div>
        )}

        {report && (
          <>
            {/* Score geral */}
            <section className="rounded-[2.5rem] bg-gradient-to-br from-[#0B0908] to-[#1a1614] text-white p-10 md:p-14 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F88A2B]/20 blur-[120px] rounded-full -mr-40 -mt-40" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] mb-3">Score geral organizacional</div>
                  <div className="flex items-end gap-3">
                    <div className="text-[72px] md:text-[96px] font-bold leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {fmt(report.overall_score)}
                    </div>
                    <div className="text-[16px] text-white/60 pb-4 font-bold">/100</div>
                  </div>
                </div>
                <div className="max-w-md text-[13px] text-white/70 leading-relaxed">
                  Síntese executiva do comportamento coletivo agregado nos últimos {report.period_start ? Math.round((new Date(report.period_end ?? "").getTime() - new Date(report.period_start).getTime()) / 86_400_000) : 90} dias.
                </div>
              </div>
            </section>

            {/* Grid de scores */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ScoreCard label="Energia" value={report.energy_score} />
              <ScoreCard label="Engajamento" value={report.engagement_score} />
              <ScoreCard label="Comunicação" value={report.communication_score} />
              <ScoreCard label="Colaboração" value={report.collaboration_score} />
              <ScoreCard label="Segurança psicológica" value={report.psychological_safety_score} />
              <ScoreCard label="Liderança" value={report.leadership_score} />
              <ScoreCard label="Recuperação" value={report.recovery_score} />
              <ScoreCard label="Cultura" value={report.culture_score} />
            </section>

            {/* Resumo executivo */}
            {report.summary && (
              <section className="rounded-[2rem] bg-white p-8 md:p-10 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-4">Resumo executivo</h3>
                <p className="text-[15px] text-[#333] leading-relaxed whitespace-pre-line">{report.summary}</p>
              </section>
            )}

            {/* Forças, Oportunidades, Recomendações */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-[2rem] bg-white p-8 border-l-4 border-l-emerald-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#111]">Principais forças</h3>
                </div>
                <ul className="space-y-3">
                  {strengths.length === 0 && <li className="text-[13px] text-[#999] italic">Sem itens.</li>}
                  {strengths.map((s, i) => (
                    <li key={i} className="text-[13px] text-[#333] leading-relaxed flex gap-2">
                      <span className="text-emerald-500 shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] bg-white p-8 border-l-4 border-l-amber-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#111]">Oportunidades</h3>
                </div>
                <ul className="space-y-3">
                  {opportunities.length === 0 && <li className="text-[13px] text-[#999] italic">Sem itens.</li>}
                  {opportunities.map((s, i) => (
                    <li key={i} className="text-[13px] text-[#333] leading-relaxed flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] bg-white p-8 border-l-4 border-l-[#F88A2B] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#F88A2B]" />
                  <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#111]">Recomendações estratégicas</h3>
                </div>
                <ul className="space-y-3">
                  {recommendations.length === 0 && <li className="text-[13px] text-[#999] italic">Sem itens.</li>}
                  {recommendations.map((s, i) => (
                    <li key={i} className="text-[13px] text-[#333] leading-relaxed flex gap-2">
                      <span className="text-[#F88A2B] shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

        {/* Aviso de privacidade */}
        <div className="rounded-2xl bg-[#F7F4F2] border border-[#E5E0DA] p-5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#F88A2B] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#666] leading-relaxed italic">
            O DNA Organizacional™ é elaborado exclusivamente com dados agregados e anonimizados. Nenhuma pessoa é identificada e nenhuma informação individual é utilizada.
          </p>
        </div>
      </div>
    </EnterpriseRHLayout>
  );
}