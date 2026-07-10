import { useEffect, useState } from "react";
import { Gauge, RefreshCw, ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "@/components/EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";

type ScoreRow = {
  id: string;
  score_date: string;
  overall_score: number | null;
  energy_score: number | null;
  engagement_score: number | null;
  communication_score: number | null;
  equilibrium_score: number | null;
  recovery_score: number | null;
  participation_score: number | null;
  risk_penalty: number | null;
  confidence: number | null;
  evidence: any;
};

const fmt = (v: number | null | undefined) =>
  v === null || v === undefined ? "•••" : Math.round(Number(v)).toString();

const Bar = ({ label, value }: { label: string; value: number | null | undefined }) => (
  <div className="rounded-2xl p-5 bg-white border border-[#E5E0DA]">
    <div className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-2">{label}</div>
    <div className="flex items-end gap-1">
      <div className="text-[28px] font-bold text-[#111] leading-none">{fmt(value)}</div>
      <div className="text-[11px] text-[#666] font-bold pb-1">/100</div>
    </div>
    <div className="mt-3 h-1.5 bg-[#F7F4F2] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: value != null ? `${Math.min(100, Math.max(0, value))}%` : "0%",
          background: "linear-gradient(90deg, #F88A2B 0%, #FFB870 100%)",
        }}
      />
    </div>
  </div>
);

export default function EnterpriseOrganizationalScoreScreen() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [latest, setLatest] = useState<ScoreRow | null>(null);
  const [history, setHistory] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [computing, setComputing] = useState(false);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("organizational_scores")
      .select("*")
      .eq("organization_id", organization.id)
      .order("score_date", { ascending: false })
      .limit(30);
    const rows = (data ?? []) as ScoreRow[];
    setHistory(rows);
    setLatest(rows[0] ?? null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const compute = async () => {
    setComputing(true);
    const { error } = await supabase.functions.invoke("compute-organizational-score", { body: {} });
    setComputing(false);
    if (error) toast({ title: "Erro ao atualizar score", description: error.message, variant: "destructive" });
    else { toast({ title: "Score atualizado" }); await load(); }
  };

  const previous = history[1];
  const delta = latest?.overall_score != null && previous?.overall_score != null
    ? Number(latest.overall_score) - Number(previous.overall_score) : null;

  const evidence = latest?.evidence ?? {};
  const insufficient = latest?.overall_score == null;

  return (
    <EnterpriseRHLayout title="Score Organizacional™">
      <div className="space-y-8 animate-fade-in">
        <section className="rounded-[2.5rem] bg-white border border-[#E5E0DA] p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/5 blur-[120px] rounded-full -mr-40 -mt-40" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-[#F88A2B]/10 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-[#F88A2B]/20 inline-flex items-center gap-1.5">
                  <Gauge className="w-3 h-3" /> Score Organizacional™
                </span>
              </div>
              <h2 className="text-[32px] md:text-[42px] leading-tight font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Um índice único para acompanhar a saúde da organização.
              </h2>
              <p className="text-[15px] md:text-[17px] leading-relaxed text-[#666] max-w-xl">
                Calculado a partir de indicadores exclusivamente agregados. Atualizado diariamente.
              </p>
            </div>
            <div className="shrink-0">
              <EnterpriseRHButton onClick={compute} icon={computing ? RefreshCw : Gauge} fullWidth={false}>
                {computing ? "Atualizando…" : "Atualizar score"}
              </EnterpriseRHButton>
            </div>
          </div>
        </section>

        {loading && !latest && (
          <div className="rounded-3xl bg-white p-10 border border-[#E5E0DA] text-center text-[13px] text-[#666]">
            Carregando score…
          </div>
        )}

        {!loading && !latest && (
          <EmptyState
            icon={Gauge}
            title="Nenhum score calculado ainda"
            description='Clique em "Atualizar score" para calcular o primeiro Score Organizacional™ com base nos dados dos últimos 30 dias.'
          />
        )}

        {latest && (
          <>
            <section className="rounded-[2.5rem] bg-gradient-to-br from-[#0B0908] to-[#1a1614] text-white p-10 md:p-14 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F88A2B]/20 blur-[120px] rounded-full -mr-40 -mt-40" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] mb-3">Score atual</div>
                  <div className="flex items-end gap-3">
                    <div className="text-[72px] md:text-[96px] font-bold leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {fmt(latest.overall_score)}
                    </div>
                    <div className="text-[16px] text-white/60 pb-4 font-bold">/100</div>
                  </div>
                  {delta !== null && (
                    <div className={`mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-white/60"}`}>
                      {delta > 0 ? <TrendingUp className="w-4 h-4" /> : delta < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                      {delta > 0 ? "+" : ""}{Math.round(delta)} vs score anterior
                    </div>
                  )}
                </div>
                <div className="max-w-md text-[13px] text-white/70 leading-relaxed space-y-2">
                  <div><span className="text-white/50">Confiança:</span> <b>{latest.confidence != null ? `${Math.round(Number(latest.confidence) * 100)}%` : "•••"}</b></div>
                  <div><span className="text-white/50">Penalidade de risco:</span> <b>-{Math.round(Number(latest.risk_penalty ?? 0))}</b></div>
                  <div><span className="text-white/50">Data:</span> <b>{new Date(latest.score_date).toLocaleDateString("pt-BR")}</b></div>
                  {insufficient && (
                    <div className="text-amber-300 mt-2">Amostra insuficiente para gerar score confiável.</div>
                  )}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Bar label="Energia" value={latest.energy_score} />
              <Bar label="Engajamento" value={latest.engagement_score} />
              <Bar label="Comunicação" value={latest.communication_score} />
              <Bar label="Equilíbrio" value={latest.equilibrium_score} />
              <Bar label="Recuperação" value={latest.recovery_score} />
              <Bar label="Participação" value={latest.participation_score} />
            </section>

            {history.length > 1 && (
              <section className="rounded-[2rem] bg-white p-8 border border-[#E5E0DA]">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-4">Tendência últimos {history.length} dias</h3>
                <div className="flex items-end gap-1 h-32">
                  {[...history].reverse().map((r) => (
                    <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-[#F88A2B] to-[#FFB870]"
                        style={{ height: `${Math.max(2, Number(r.overall_score ?? 0))}%` }}
                        title={`${r.score_date}: ${fmt(r.overall_score)}`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[2rem] bg-white p-8 border border-[#E5E0DA]">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-4">Evidências</h3>
              <pre className="text-[11px] text-[#333] leading-relaxed whitespace-pre-wrap font-mono bg-[#F7F4F2] p-4 rounded-xl overflow-auto">
                {JSON.stringify(evidence, null, 2)}
              </pre>
            </section>
          </>
        )}

        <div className="rounded-2xl bg-[#F7F4F2] border border-[#E5E0DA] p-5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#F88A2B] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#666] leading-relaxed italic">
            O Score Organizacional™ é calculado exclusivamente com dados agregados. Nenhum dado individual é utilizado.
          </p>
        </div>
      </div>
    </EnterpriseRHLayout>
  );
}