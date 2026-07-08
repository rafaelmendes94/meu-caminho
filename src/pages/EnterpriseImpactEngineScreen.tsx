import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ShieldCheck, TrendingUp, TrendingDown, Minus, RefreshCw, Target, Sparkles, FileText } from "lucide-react";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Measurement = {
  id: string;
  source_type: "action_plan" | "ritual" | "weekly_insight";
  source_id: string;
  baseline_score: number | null;
  current_score: number | null;
  impact_score: number | null;
  confidence: number | null;
  measured_at: string;
  summary: string | null;
};

type Timeline = {
  id: string;
  event_type: string;
  event_id: string | null;
  event_date: string;
  score_before: number | null;
  score_after: number | null;
  delta: number | null;
};

const num = (v: number | null | undefined) =>
  v === null || v === undefined ? "•••" : Number(v).toFixed(1);

const SourceIcon = ({ t }: { t: string }) =>
  t === "action_plan" ? <Target className="w-4 h-4" /> :
  t === "ritual" ? <Sparkles className="w-4 h-4" /> :
  <FileText className="w-4 h-4" />;

const sourceLabel = (t: string) =>
  t === "action_plan" ? "Plano de ação" : t === "ritual" ? "Ritual" : "Insight semanal";

export default function EnterpriseImpactEngineScreen() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const [{ data: m }, { data: t }] = await Promise.all([
      (supabase as any)
        .from("impact_measurements")
        .select("*")
        .eq("organization_id", organization.id)
        .order("measured_at", { ascending: false })
        .limit(50),
      (supabase as any)
        .from("impact_timelines")
        .select("*")
        .eq("organization_id", organization.id)
        .order("event_date", { ascending: false })
        .limit(30),
    ]);
    setMeasurements((m ?? []) as Measurement[]);
    setTimeline((t ?? []) as Timeline[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const total = measurements.length;
  const avgImpact = total > 0
    ? measurements.reduce((s, x) => s + (Number(x.impact_score ?? 0)), 0) / total
    : null;
  const avgConfidence = total > 0
    ? measurements.reduce((s, x) => s + (Number(x.confidence ?? 0)), 0) / total
    : null;

  const byType = (t: Measurement["source_type"]) =>
    measurements.filter((m) => m.source_type === t);

  const top = [...measurements].filter((m) => m.impact_score != null)
    .sort((a, b) => Number(b.impact_score) - Number(a.impact_score)).slice(0, 3);
  const bottom = [...measurements].filter((m) => m.impact_score != null)
    .sort((a, b) => Number(a.impact_score) - Number(b.impact_score)).slice(0, 3);

  const measureRecent = async () => {
    if (!organization?.id) return;
    setRunning(true);
    // measure the 10 most recent items across the three sources
    const [{ data: plans }, { data: rituals }, { data: insights }] = await Promise.all([
      (supabase as any).from("action_plans").select("id").eq("organization_id", organization.id).order("created_at", { ascending: false }).limit(5),
      (supabase as any).from("intelligent_rituals").select("id").eq("organization_id", organization.id).order("created_at", { ascending: false }).limit(5),
      (supabase as any).from("weekly_ai_insights").select("id").eq("organization_id", organization.id).order("generated_at", { ascending: false }).limit(5),
    ]);
    const jobs: Array<{ source_type: string; source_id: string }> = [];
    (plans ?? []).forEach((r: any) => jobs.push({ source_type: "action_plan", source_id: r.id }));
    (rituals ?? []).forEach((r: any) => jobs.push({ source_type: "ritual", source_id: r.id }));
    (insights ?? []).forEach((r: any) => jobs.push({ source_type: "weekly_insight", source_id: r.id }));

    let ok = 0; let failed = 0;
    for (const j of jobs) {
      const { error } = await supabase.functions.invoke("measure-impact", { body: j });
      if (error) failed++; else ok++;
    }
    setRunning(false);
    toast({ title: "Medição concluída", description: `${ok} avaliadas · ${failed} falharam` });
    await load();
  };

  return (
    <EnterpriseRHLayout title="Motor de Impacto™">
      <div className="space-y-8 animate-fade-in">
        <section className="rounded-[2.5rem] bg-white border border-[#E5E0DA] p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/5 blur-[120px] rounded-full -mr-40 -mt-40" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-[#F88A2B]/10 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-[#F88A2B]/20 inline-flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Motor de Impacto™
                </span>
              </div>
              <h2 className="text-[32px] md:text-[42px] leading-tight font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                O que realmente funcionou?
              </h2>
              <p className="text-[15px] md:text-[17px] leading-relaxed text-[#666] max-w-xl">
                Medimos o impacto de cada plano, ritual e insight comparando o Score Organizacional antes e depois — sempre em base agregada.
              </p>
            </div>
            <div className="shrink-0">
              <button
                onClick={measureRecent}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#F88A2B] text-white px-5 py-3 text-[12px] font-bold hover:opacity-90 disabled:opacity-40"
              >
                {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                {running ? "Medindo…" : "Medir iniciativas recentes"}
              </button>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white p-5 border border-[#E5E0DA]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Iniciativas avaliadas</div>
            <div className="text-[32px] font-bold text-[#111] mt-1">{total}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-[#E5E0DA]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Impacto médio</div>
            <div className={`text-[32px] font-bold mt-1 ${avgImpact != null && avgImpact >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {avgImpact != null ? `${avgImpact >= 0 ? "+" : ""}${avgImpact.toFixed(1)}` : "•••"}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-[#E5E0DA]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Confiança média</div>
            <div className="text-[32px] font-bold text-[#111] mt-1">{avgConfidence != null ? `${Math.round(avgConfidence * 100)}%` : "•••"}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 border border-[#E5E0DA]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#999]">Melhor delta</div>
            <div className="text-[32px] font-bold text-emerald-600 mt-1">{top[0]?.impact_score != null ? `+${Number(top[0].impact_score).toFixed(1)}` : "•••"}</div>
          </div>
        </section>

        {loading && !measurements.length && (
          <div className="rounded-3xl bg-white p-10 border border-[#E5E0DA] text-center text-[13px] text-[#666]">Carregando…</div>
        )}

        {!loading && measurements.length === 0 && (
          <div className="rounded-3xl bg-white p-10 border border-[#E5E0DA] text-center space-y-3">
            <Activity className="w-8 h-8 mx-auto text-[#F88A2B]" />
            <p className="text-[15px] font-bold text-[#111]">Nenhuma iniciativa medida ainda.</p>
            <p className="text-[12px] text-[#666] max-w-md mx-auto">
              Rode "Medir iniciativas recentes" ou clique em "Medir impacto" nas telas de Planos, Rituais ou Insights.
            </p>
          </div>
        )}

        {/* Por tipo */}
        {measurements.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(["action_plan","ritual","weekly_insight"] as const).map((t) => {
              const items = byType(t);
              const avg = items.length > 0 ? items.reduce((s, x) => s + Number(x.impact_score ?? 0), 0) / items.length : null;
              return (
                <div key={t} className="rounded-2xl bg-white p-6 border border-[#E5E0DA]">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#999]">
                    <SourceIcon t={t} /> {sourceLabel(t)}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <div className={`text-[28px] font-bold ${avg != null && avg >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {avg != null ? `${avg >= 0 ? "+" : ""}${avg.toFixed(1)}` : "•••"}
                    </div>
                    <div className="text-[11px] text-[#666]">{items.length} medições</div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Top e Bottom */}
        {measurements.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-[2rem] bg-white p-8 border-l-4 border-l-emerald-500 border border-[#E5E0DA]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#111]">Top iniciativas</h3>
              </div>
              <ul className="space-y-3">
                {top.length === 0 && <li className="text-[13px] text-[#999] italic">Sem dados suficientes.</li>}
                {top.map((m) => (
                  <li key={m.id} className="text-[13px] text-[#333] flex justify-between gap-3">
                    <span className="flex items-center gap-2"><SourceIcon t={m.source_type} /> {sourceLabel(m.source_type)}</span>
                    <span className="font-bold text-emerald-600">+{Number(m.impact_score).toFixed(1)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2rem] bg-white p-8 border-l-4 border-l-amber-500 border border-[#E5E0DA]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#111]">Iniciativas sem efeito</h3>
              </div>
              <ul className="space-y-3">
                {bottom.length === 0 && <li className="text-[13px] text-[#999] italic">Sem dados suficientes.</li>}
                {bottom.map((m) => (
                  <li key={m.id} className="text-[13px] text-[#333] flex justify-between gap-3">
                    <span className="flex items-center gap-2"><SourceIcon t={m.source_type} /> {sourceLabel(m.source_type)}</span>
                    <span className={`font-bold ${Number(m.impact_score) >= 0 ? "text-[#666]" : "text-red-600"}`}>{Number(m.impact_score) >= 0 ? "+" : ""}{Number(m.impact_score).toFixed(1)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <section className="rounded-[2rem] bg-white p-8 border border-[#E5E0DA]">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-4">Linha do tempo de impacto</h3>
            <ul className="space-y-3">
              {timeline.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 border-b border-[#F0EAE3] pb-3 last:border-none last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <SourceIcon t={t.event_type} />
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-[#111]">{sourceLabel(t.event_type)}</div>
                      <div className="text-[11px] text-[#999]">{new Date(t.event_date).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#666]">
                      {num(t.score_before)} → {num(t.score_after)}
                    </div>
                    <div className={`text-[13px] font-bold ${t.delta != null && Number(t.delta) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {t.delta != null ? `${Number(t.delta) >= 0 ? "+" : ""}${Number(t.delta).toFixed(1)}` : "—"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="rounded-2xl bg-[#F7F4F2] border border-[#E5E0DA] p-5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#F88A2B] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#666] leading-relaxed italic">
            O Motor de Impacto™ utiliza exclusivamente indicadores organizacionais agregados.
          </p>
        </div>
      </div>
    </EnterpriseRHLayout>
  );
}