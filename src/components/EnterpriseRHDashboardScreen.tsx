import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Sparkles,
  Dna
} from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Summary = {
  avg_mood_30d: number | null;
  avg_energy_30d: number | null;
  avg_stress_30d: number | null;
  equilibrium_index_30d: number | null;
  checkin_participants_30d: number | null;
  pulse_energy_30d: number | null;
  pulse_engagement_30d: number | null;
  pulse_communication_30d: number | null;
  pulse_equilibrium_30d: number | null;
  pulse_recovery_30d: number | null;
  pulse_participants_30d: number | null;
  open_alerts_count: number;
  critical_alerts_count: number;
};

const fmt = (v: number | null | undefined, digits = 1) =>
  v === null || v === undefined ? "•••" : Number(v).toFixed(digits);

const BG = "#F7F4F2";
const ORANGE = "#F88A2B";
const DARK_BG = "#0B0908";

const KPICard = ({ value, label, trend }: { value: string; label: string; trend?: string }) => (
  <div className="rounded-3xl p-5 bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm">
    <div className="text-[28px] font-bold text-[#111] mb-1 leading-none">{value}</div>
    <div className="text-[12px] font-medium text-[#666] uppercase tracking-wide">{label}</div>
    {trend && (
      <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#7FA06E]">
        <TrendingUp className="h-3 w-3" />
        {trend}
      </div>
    )}
  </div>
);

const AreaCard = ({ 
  name, 
  balance, 
  overload, 
  trend, 
  status = "normal" 
}: { 
  name: string; 
  balance: number; 
  overload: string; 
  trend: string;
  status?: "normal" | "warning";
}) => (
  <div className={`rounded-3xl p-6 border transition-all duration-300 ${
    status === "warning" 
      ? "bg-amber-50/50 border-amber-200/50 shadow-[0_10px_40px_-15px_rgba(245,158,11,0.15)]" 
      : "bg-white border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
  }`}>
    <div className="flex justify-between items-start mb-5">
      <h4 className="text-[18px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>{name}</h4>
      {status === "warning" && (
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
          Alerta
        </span>
      )}
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-[#999] mb-1 font-bold">Equilíbrio</div>
        <div className="text-[16px] font-bold text-[#111]">{balance}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-[#999] mb-1 font-bold">Sobrecarga</div>
        <div className="text-[16px] font-bold text-[#111]">{overload}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-[#999] mb-1 font-bold">Tendência</div>
        <div className={`flex items-center gap-1 text-[13px] font-bold ${
          trend.includes('queda') ? 'text-amber-600' : trend.includes('estável') ? 'text-gray-500' : 'text-[#7FA06E]'
        }`}>
          {trend.includes('queda') ? <TrendingDown className="h-3 w-3" /> : trend.includes('estável') ? <Minus className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
          <span className="text-[11px] leading-tight">{trend}</span>
        </div>
      </div>
    </div>
  </div>
);

export default function EnterpriseRHDashboardScreen() {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [predictive, setPredictive] = useState<{ open: number; critical: number; top?: { title: string; severity: string } | null }>({ open: 0, critical: 0, top: null });
  const [dna, setDna] = useState<{ overall: number | null; generated_at: string | null; strengths: string[] } | null>(null);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_rh_dashboard_summary", {
      _organization_id: organization.id,
    });
    if (!error && data) setSummary(data as unknown as Summary);
    const { data: sig } = await (supabase as any)
      .from("predictive_signals")
      .select("title, severity, status")
      .eq("organization_id", organization.id)
      .neq("status", "resolved")
      .order("detected_at", { ascending: false });
    const list = (sig as { title: string; severity: string; status: string }[]) ?? [];
    setPredictive({
      open: list.length,
      critical: list.filter((s) => s.severity === "critical").length,
      top: list[0] ?? null,
    });
    const { data: dnaRow } = await (supabase as any)
      .from("organizational_dna_reports")
      .select("overall_score, generated_at, strengths")
      .eq("organization_id", organization.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (dnaRow) {
      const s = Array.isArray((dnaRow as any).strengths) ? (dnaRow as any).strengths : [];
      setDna({
        overall: (dnaRow as any).overall_score ?? null,
        generated_at: (dnaRow as any).generated_at ?? null,
        strengths: s.slice(0, 3).map((x: unknown) => typeof x === "string" ? x : JSON.stringify(x)),
      });
    } else {
      setDna(null);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const refreshAlerts = async () => {
    setRecomputing(true);
    const { error } = await supabase.functions.invoke("compute-basic-alerts");
    if (error) toast({ title: "Erro ao atualizar alertas", description: error.message, variant: "destructive" });
    else toast({ title: "Alertas atualizados" });
    await load();
    setRecomputing(false);
  };

  return (
    <EnterpriseRHLayout title="Dashboard">
      <div className="space-y-8 animate-fade-in">
        
        {/* Hero Card */}
        <section>
          <div className="rounded-[2.5rem] bg-white border border-[#E5E0DA] text-[#111] p-10 md:p-14 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1.5 rounded-full bg-[#F88A2B]/10 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-[#F88A2B]/20">Agregado e anônimo</span>
              </div>
              
              <h2 className="text-[32px] md:text-[42px] leading-tight font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                O temperamento do time,<br />semana a semana.
              </h2>
              
              <p className="text-[15px] md:text-[18px] leading-relaxed text-[#666] mb-10 max-w-xl">
                Leia sinais coletivos de equilíbrio, sobrecarga, clareza e adesão — sem expor respostas individuais.
              </p>

              {/* Abstract mini timeline */}
              <div className="flex items-end gap-2 h-16 mb-2 opacity-50 max-w-md">
                {[40, 60, 45, 70, 55, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 rounded-full bg-[#F88A2B]" 
                    style={{ height: `${h}%`, opacity: 0.1 + (i * 0.05) }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <KPICard
            value={summary?.checkin_participants_30d != null ? String(summary.checkin_participants_30d) : "•••"}
            label="Participantes 30d"
          />
          <KPICard
            value={fmt(summary?.pulse_engagement_30d, 2)}
            label="Engajamento (pulse)"
          />
          <KPICard
            value={fmt(summary?.equilibrium_index_30d, 2)}
            label="Índice de equilíbrio"
          />
          <KPICard
            value={summary ? String(summary.open_alerts_count) : "•••"}
            label="Alertas abertos"
          />
        </section>

        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-[#999] italic">
            Indicadores exibidos apenas quando há amostra mínima de 5 participantes. Dados individuais nunca são exibidos.
          </p>
          <button
            onClick={refreshAlerts}
            disabled={recomputing || loading}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#666] hover:text-[#111] disabled:opacity-40"
          >
            <RefreshCw className={`h-3 w-3 ${recomputing ? "animate-spin" : ""}`} />
            Atualizar alertas
          </button>
        </div>

        {/* Inteligência Preditiva — card discreto */}
        <section>
          <button
            onClick={() => navigate('/enterprise/rh/alertas')}
            className="w-full text-left rounded-3xl bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex items-center justify-between gap-4 hover:border-[#F88A2B]/30 transition"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#F88A2B]/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#F88A2B]" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Inteligência Preditiva</div>
                <div className="text-[15px] font-bold text-[#111] mt-1">
                  {predictive.open === 0
                    ? "Nenhum sinal preditivo ativo no momento."
                    : predictive.top?.title ?? "Sinais preditivos ativos"}
                </div>
                <div className="text-[11px] text-[#666] mt-1">
                  {predictive.open} aberto(s) · {predictive.critical} crítico(s)
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-[#666]" />
          </button>
          <p className="text-[10px] text-[#999] italic mt-2 px-1">
            A Inteligência Preditiva utiliza apenas dados agregados e anonimizados. Nenhuma pessoa é identificada.
          </p>
        </section>

        {/* DNA Organizacional — card discreto */}
        <section>
          <button
            onClick={() => navigate('/enterprise/rh/dna-organizacional')}
            className="w-full text-left rounded-3xl bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex items-center justify-between gap-4 hover:border-[#F88A2B]/30 transition"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-10 w-10 rounded-full bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
                <Dna className="h-5 w-5 text-[#F88A2B]" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">DNA Organizacional™</div>
                <div className="text-[15px] font-bold text-[#111] mt-1">
                  {dna
                    ? `Score geral ${dna.overall != null ? Math.round(dna.overall) : "•••"}/100`
                    : "Ainda não gerado — visualize o comportamento coletivo agregado."}
                </div>
                {dna?.strengths?.length ? (
                  <div className="text-[11px] text-[#666] mt-1 truncate">
                    Forças: {dna.strengths.join(" · ")}
                  </div>
                ) : dna?.generated_at ? (
                  <div className="text-[11px] text-[#666] mt-1">
                    Última geração: {new Date(dna.generated_at).toLocaleDateString("pt-BR")}
                  </div>
                ) : null}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-[#666] shrink-0" />
          </button>
          <p className="text-[10px] text-[#999] italic mt-2 px-1">
            O DNA Organizacional™ é elaborado exclusivamente com dados agregados e anonimizados. Nenhuma pessoa é identificada.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Temperamento do Time Chart */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-6 font-montserrat px-1">Temperamento do time</h3>
            <div className="rounded-[32px] bg-white p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
              <div className="space-y-8">
                {[
                  { label: "Mente acelerada", value: 64, color: "#F88A2B" },
                  { label: "Sobrecarga / cansaço", value: 48, color: "#999" },
                  { label: "Clareza em evolução", value: 71, color: "#7FA06E" },
                  { label: "Equilíbrio estável", value: 39, color: "#F3D7BE" }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center text-[14px] font-bold text-[#111]">
                      <span className="font-montserrat">{item.label}</span>
                      <span className="font-montserrat">{item.value}%</span>
                    </div>
                    <div className="h-3 w-full bg-[#F7F4F2] rounded-full overflow-hidden ring-1 ring-black/5">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ 
                          width: `${item.value}%`, 
                          backgroundColor: item.color,
                          boxShadow: `0 0 10px ${item.color}33`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* O que o time mais perguntou */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-6 font-montserrat px-1">O que o time mais perguntou à IA</h3>
            <div className="rounded-[32px] bg-white p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
              <div className="space-y-6 flex-1">
                {[
                  { label: "Ansiedade e pressão por entrega", value: 41 },
                  { label: "Conflitos com pessoas próximas", value: 23 },
                  { label: "Mente que não desacelera", value: 19 },
                  { label: "Cansaço emocional", value: 17 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 group cursor-default">
                    <div className="text-[18px] font-bold text-[#F88A2B] w-12 font-montserrat">{item.value}%</div>
                    <div className="flex-1 text-[15px] text-[#444] font-medium font-montserrat group-hover:text-[#111] transition-colors">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-6 border-t border-[#F7F4F2] flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-[#999]" />
                <p className="text-[12px] text-[#999] font-medium italic font-montserrat">
                  Os temas são agregados. O RH não vê conversas individuais.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Recorte por área */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] font-montserrat">Recorte por área</h3>
            <span className="text-[11px] text-[#999] font-bold font-montserrat">Vol. mín. 5 pessoas</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AreaCard name="Comercial" balance={4.1} overload="38%" trend="estável" />
            <AreaCard name="Operações" balance={2.9} overload="67%" trend="queda há 3 semanas" status="warning" />
            <AreaCard name="Produto" balance={3.7} overload="44%" trend="melhora" />
          </div>

          <p className="text-center text-[12px] text-[#999] font-bold font-montserrat px-4 mt-8 opacity-60">
            Recortes por área só aparecem com volume mínimo de colaboradores por grupo.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          {/* Decisões sugeridas */}
          <section>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] mb-6 font-montserrat px-1">Decisões sugeridas</h3>
            <div className="rounded-[32px] bg-white p-8 border-l-4 border-l-[#F88A2B] border-y border-r border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
              <ul className="space-y-8">
                {[
                  "Priorizar escuta em Operações esta semana.",
                  "Reforçar conteúdos sobre mente acelerada.",
                  "Acompanhar evolução da sobrecarga por mais 7 dias."
                ].map((text, i) => (
                  <li key={i} className="flex gap-5 items-start">
                    <div className="h-7 w-7 rounded-full bg-[#F88A2B1A] flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-[#F88A2B] shadow-[0_0_8px_rgba(248,138,43,0.4)]" />
                    </div>
                    <p className="text-[16px] text-[#333] font-medium leading-relaxed font-montserrat">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex flex-col justify-center gap-4 h-full">
            <EnterpriseRHButton 
              onClick={() => navigate('/enterprise/rh/alertas')}
              icon={ArrowRight}
              className="flex-row-reverse justify-between px-8"
            >
              Ver áreas em alerta
            </EnterpriseRHButton>
            
            <EnterpriseRHButton 
              onClick={() => navigate('/enterprise/rh/capacidade')}
              variant="secondary"
              icon={Zap}
            >
              Ver pulso de capacidade
            </EnterpriseRHButton>
          </section>
        </div>

      </div>
    </EnterpriseRHLayout>
  );
}
