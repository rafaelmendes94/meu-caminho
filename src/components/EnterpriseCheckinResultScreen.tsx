import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  ShieldCheck, 
  PlayCircle,
  MessageSquare,
  Lock,
  ChevronRight,
  TrendingUp,
  Brain,
  Zap,
  Activity,
  Sparkles,
  Timer,
  Heart
} from "lucide-react";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

export default function EnterpriseCheckinResultScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<Array<{ mood_score: number; energy_score: number; stress_score: number; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("emotional_checkins")
        .select("mood_score,energy_score,stress_score,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);
      setHistory(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const last = history[0];
  const balance = last
    ? last.mood_score * 0.4 + last.energy_score * 0.3 + (6 - last.stress_score) * 0.3
    : null;
  const pct = (v: number) => Math.round((v / 5) * 100);
  const balancePct = balance ? Math.round((balance / 5) * 100) : 0;

  return (
    <EnterpriseUserLayout title="Resultado Check-in">
      <div className="animate-fade-in relative z-10 w-full lg:max-w-6xl mx-auto">
        
        {/* Mobile Header */}
        <header className="px-6 pt-2 pb-0 lg:hidden w-full">
          <div className="flex items-center justify-between mb-2 max-w-md mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-white active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5 text-[#111]" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[13px] font-bold text-[#111]">Resultado</span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <main className="w-full lg:pt-4 pb-20 pt-2">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* Left Column: Summary and Pulse */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              
              {/* Main Result Card */}
              <div className="relative bg-white rounded-[40px] p-8 lg:p-12 lg:shadow-[0_20px_60px_rgba(0,0,0,0.03)] lg:border lg:border-black/5 overflow-hidden flex-1 flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/5 rounded-full blur-3xl -mr-20 -mt-20" />
                
                <div className="relative z-10 space-y-8">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="w-20 h-20 rounded-[28px] bg-[#F88A2B08] flex items-center justify-center shrink-0 border border-[#F88A2B10]">
                      <Activity className="h-10 w-10 text-[#F88A2B]" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F88A2B15] border border-[#F88A2B10] text-[#F88A2B] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                        <TrendingUp className="h-3 w-3" />
                        Diagnóstico da Semana
                      </div>
                      <h1 className="text-[32px] lg:text-[40px] font-bold text-[#111] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Sua mente pediu <br className="hidden lg:block"/>
                        um pouco mais de <span className="text-[#F88A2B]">pausa.</span>
                      </h1>
                    </div>
                  </div>

                  <p className="text-[16px] lg:text-[18px] leading-relaxed text-[#666] font-medium max-w-xl">
                    {loading
                      ? "Carregando seu resultado..."
                      : last
                        ? `Seu índice de equilíbrio atual é ${balance!.toFixed(1)}/5. Use os sinais abaixo para calibrar sua semana.`
                        : "Este é o seu primeiro check-in por aqui. Continue registrando para ver a evolução."}
                  </p>

                  <div className="h-px w-full bg-black/5" />

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "Check-in", val: "Completo", icon: ShieldCheck },
                      { label: "Privacidade", val: "Total", icon: Lock },
                      { label: "Tempo", val: "2min", icon: Timer },
                      { label: "Frequência", val: "Ideal", icon: Heart }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[#999]">
                          <stat.icon className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className="text-[14px] font-bold text-[#111]">{stat.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emotional Pulse Card */}
              <div className="bg-white rounded-[40px] p-8 lg:p-10 lg:shadow-[0_20px_60px_rgba(0,0,0,0.03)] lg:border lg:border-black/5">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-[20px] lg:text-[22px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Pulso Emocional
                  </h2>
                  <span className="text-[11px] font-bold text-[#999] uppercase tracking-widest px-3 py-1 rounded-full bg-black/[0.03]">
                    Referência: Semana 32
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {(last
                    ? [
                        { label: "Equilíbrio", value: balance!.toFixed(1), percentage: balancePct, color: "#F88A2B" },
                        { label: "Humor", value: `${last.mood_score}/5`, percentage: pct(last.mood_score), color: "#F88A2B" },
                        { label: "Energia", value: `${last.energy_score}/5`, percentage: pct(last.energy_score), color: "#F88A2B" },
                        { label: "Estresse", value: `${last.stress_score}/5`, percentage: pct(last.stress_score), color: "#999" },
                      ]
                    : [
                        { label: "Equilíbrio", value: "—", percentage: 0, color: "#999" },
                        { label: "Humor", value: "—", percentage: 0, color: "#999" },
                        { label: "Energia", value: "—", percentage: 0, color: "#999" },
                        { label: "Estresse", value: "—", percentage: 0, color: "#999" },
                      ]
                  ).map((item, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[13px] font-bold text-[#666] uppercase tracking-wider">{item.label}</span>
                        <span className="text-[14px] font-extrabold text-[#111]">{item.value}</span>
                      </div>
                      <div className="h-2 w-full bg-black/[0.04] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${item.percentage}%`, 
                            backgroundColor: item.color,
                            boxShadow: item.color === "#F88A2B" ? "0 0 12px rgba(248,138,43,0.3)" : "none"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Insights & Actions */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Insight Card - Dark Theme */}
              <div className="bg-white border border-[#E5E0DA] text-[#111] rounded-[40px] p-8 lg:p-12 relative overflow-hidden shadow-xl flex-1 flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#F88A2B]/10 rounded-full blur-[80px]" />
                <div className="relative z-10 space-y-8">
                  <div className="h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-[#F88A2B]" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[20px] font-bold text-[#111] uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Reflexão da Semana
                    </h3>
                    <p className="text-[18px] lg:text-[22px] leading-relaxed text-[#111] italic font-bold">
                      <span className="text-[#F88A2B]">“</span>Sua produtividade não é medida pelo quanto você corre, mas pela qualidade do silêncio que você consegue manter em meio ao caos.<span className="text-[#F88A2B]">”</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-0.5 bg-[#F88A2B]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#F88A2B]">Dr. Augusto Cury</span>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="bg-white rounded-[40px] p-8 lg:p-10 lg:shadow-[0_20px_60px_rgba(0,0,0,0.03)] lg:border lg:border-black/5 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">Recomendação</h3>
                    <PlayCircle className="h-4 w-4 text-[#F88A2B]" />
                  </div>
                  <button 
                    onClick={() => navigate('/enterprise/trilha')}
                    className="w-full p-6 rounded-[28px] bg-[#F88A2B08] border border-[#F88A2B15] text-left flex items-center gap-5 transition-all hover:bg-[#F88A2B10] group"
                  >
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-white flex items-center justify-center text-[#F88A2B] shadow-sm">
                      <Brain className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-[#111]">Técnica de Desaceleração</h4>
                      <p className="text-[12px] text-[#666] font-medium">Exercício guiado · 6 min</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#CCC] group-hover:text-[#F88A2B] transition-colors" />
                  </button>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/enterprise/trilha')}
                    className="w-full h-16 rounded-full flex items-center justify-center gap-3 text-[#111] font-bold text-[16px] transition-all hover:opacity-95 active:scale-[0.98] shadow-lg shadow-[#F88A2B]/20"
                    style={{ background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)" }}
                  >
                    <span>Seguir minha jornada</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[#CCC]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Resultado 100% Confidencial</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </EnterpriseUserLayout>
  );
}
