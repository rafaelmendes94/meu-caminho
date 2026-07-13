import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PulseWidget from "./PulseWidget";
import { 
  Building2, 
  ArrowRight, 
  Brain, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  BookOpen, 
  Compass,
  Lock
} from "lucide-react";
import logoMark from "@/assets/login-abstract.png";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const BG = "#F8F9FA";
const ORANGE = "#F88A2B";
const DARK_BG = "#0B0908";

const StatusMiniCard = ({ 
  label, 
  status, 
  icon: Icon,
  className = "" 
}: { 
  label: string; 
  status: string; 
  icon: any;
  className?: string;
}) => (
  <div className={`min-w-[140px] flex-1 rounded-[24px] p-4 bg-white/60 border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm ${className}`}>
    <div className="flex items-center gap-2 mb-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F88A2B1A] text-[#F88A2B]">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[12px] font-bold tracking-wider text-[#999] uppercase">{label}</span>
    </div>
    <div className="text-[14px] font-bold text-[#111] leading-tight">{status}</div>
  </div>
);

const JourneyCard = ({
  title,
  description,
  buttonText,
  onClick,
  icon: Icon
}: {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  icon: any;
}) => (
  <div className="rounded-[32px] p-6 bg-white/70 border border-white/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] backdrop-blur-md hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] transition-all duration-300">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F88A2B1A] text-[#F88A2B] mb-4">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-[20px] font-bold text-[#111] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
    <p className="text-[14px] leading-relaxed text-[#666] mb-5">{description}</p>
    <button 
      onClick={onClick}
      className="flex items-center gap-2 text-[14px] font-bold text-[#F88A2B] group"
    >
      {buttonText}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </button>
  </div>
);

export default function EnterpriseHomeScreen() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const userName = profile?.display_name || profile?.full_name || "colaborador";
  const [lastCheckin, setLastCheckin] = useState<{ mood_score: number; energy_score: number; stress_score: number; created_at: string } | null>(null);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("emotional_checkins")
        .select("mood_score,energy_score,stress_score,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLastCheckin(data as any);
    })();
  }, [user]);

  const daysSince = lastCheckin
    ? Math.floor((Date.now() - new Date(lastCheckin.created_at).getTime()) / 86_400_000)
    : null;
  const needsCheckin = daysSince === null || daysSince > 3;
  const balance = lastCheckin
    ? (lastCheckin.mood_score * 0.4 + lastCheckin.energy_score * 0.3 + (6 - lastCheckin.stress_score) * 0.3).toFixed(1)
    : null;

  return (
    <EnterpriseUserLayout>
      <div className="animate-fade-in relative">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span
          className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(248,138,43,0.08) 0%, rgba(248,138,43,0) 70%)" }}
        />
        <span
          className="absolute top-1/2 -left-20 w-[300px] h-[300px] rounded-full opacity-20 blur-[80px]"
          style={{ background: "radial-gradient(circle, rgba(143,177,125,0.1) 0%, rgba(143,177,125,0) 70%)" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between lg:hidden px-6 pt-2 pb-4">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="relative">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <div 
              className="absolute -bottom-1 -right-1 text-[#111] text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white lg:border-[#F8F9FA] uppercase tracking-tighter"
              style={{ background: ORANGE }}
            >
              Ent
            </div>
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#111] leading-tight flex items-center gap-x-1.5 whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif" }}>
              {greeting}, {userName}
            </h2>
            <p className="text-[12px] text-[#666] font-medium leading-tight">
              Sua jornada emocional continua hoje.
            </p>
          </div>
        </div>
        
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.05)] ring-1 ring-black/5 overflow-hidden lg:hidden">
          <img src={logoMark} alt="Logo" className="h-7 w-7 object-contain" style={{ mixBlendMode: "multiply" }} />
        </div>
      </header>

      {/* Scrollable Area */}
      <main className="flex-1 relative z-10 px-0 space-y-8 lg:space-y-12">
        
        {/* Desktop Welcome Section (Hidden on Mobile) */}
        <section className="hidden lg:block mb-8">
          <h2 className="text-[32px] font-bold text-[#111] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Bem-vindo de volta, {userName}
          </h2>
          <p className="text-[16px] text-[#666] font-medium mt-1">
            Sua jornada emocional continua de onde você parou.
          </p>
        </section>
        
        {/* Hero Card - Optimized for Desktop */}
        <section className="relative mt-2 lg:max-w-3xl">
          <div className="relative overflow-hidden rounded-[24px] bg-white p-5 lg:p-6 border border-black/5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex h-12 w-12 rounded-xl bg-[#F88A2B1A] items-center justify-center shrink-0">
                  <Zap className="h-6 w-6 text-[#F88A2B]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F88A2B] mb-0.5">
                    {balance ? `Seu equilíbrio: ${balance}/5` : "Check-in Semanal"}
                  </p>
                  <h1 className="text-[20px] lg:text-[22px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {needsCheckin ? "Como sua mente tem caminhado?" : "Você está em dia com o seu equilíbrio."}
                  </h1>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/enterprise/checkin/intro')}
                className="w-full lg:w-fit lg:px-6 h-11 rounded-full flex items-center justify-center gap-3 text-[#111] font-bold text-[14px] transition-all active:scale-[0.95] hover:opacity-90"
                style={{ background: "#F88A2B" }}
              >
                <span>{needsCheckin ? "Responder agora" : "Novo check-in"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <PulseWidget />

        {/* Weekly Moment removed: no real data source; avoiding mock content. */}

        {/* Continue Journey - More Compact Grid */}
        <section className="space-y-4">
          <h4 className="text-[12px] font-bold tracking-wider text-[#999] uppercase">Continue sua jornada</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/enterprise/cury-digital')}
              className="p-4 rounded-2xl bg-white border border-black/5 hover:border-[#F88A2B]/30 transition-all cursor-pointer group flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-[#F88A2B1A] flex items-center justify-center shrink-0">
                <MessageSquare className="h-5 w-5 text-[#F88A2B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-bold text-[#111]">Cury Digital</h3>
                <p className="text-[11px] text-[#666] line-clamp-1">Conversas sobre pressão e ansiedade.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#F88A2B] opacity-0 group-hover:opacity-100 transition-all" />
            </div>

            <div 
              onClick={() => navigate('/enterprise/trilha')}
              className="p-4 rounded-2xl bg-white border border-black/5 hover:border-[#F88A2B]/30 transition-all cursor-pointer group flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-[#F88A2B1A] flex items-center justify-center shrink-0">
                <Compass className="h-5 w-5 text-[#F88A2B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-bold text-[#111]">Trilha Emocional</h3>
                <p className="text-[11px] text-[#666] line-clamp-1">Exercícios recomendados para você.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#F88A2B] opacity-0 group-hover:opacity-100 transition-all" />
            </div>

            <div 
              onClick={() => navigate('/enterprise/biblioteca')}
              className="p-4 rounded-2xl bg-white border border-black/5 hover:border-[#F88A2B]/30 transition-all cursor-pointer group flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-[#F88A2B1A] flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-[#F88A2B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-bold text-[#111]">Biblioteca</h3>
                <p className="text-[11px] text-[#666] line-clamp-1">Conteúdos para desacelerar a mente.</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#F88A2B] opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </div>
        </section>

        {/* Bottom Section - Compact Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:max-w-4xl">
          {/* Privacy Card */}
          <div className="rounded-[24px] p-5 lg:p-6 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md h-full flex items-center justify-between gap-4">
            <div className="relative z-10 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-[#111]" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Sinais Coletivos
                </h3>
                <p className="text-[11px] text-[#666]">Sua evolução continua privada.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/enterprise/privacy')}
              className="relative z-10 text-[12px] font-bold text-[#111] border-b border-black/10 pb-0.5 hover:text-[#111] transition-colors shrink-0"
            >
              Ver mais
            </button>
          </div>

          {/* SOS Card */}
          <div className="rounded-[24px] p-5 lg:p-6 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] border border-white/5 relative overflow-hidden transition-all duration-300 hover:shadow-md h-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5 text-[#F88A2B]" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Canal Direto RH
                </h3>
                <p className="text-[11px] text-[#777]">Privacidade em situações sensíveis.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/enterprise/sos-rh')}
              className="h-10 px-5 rounded-full bg-white text-[#0B0908] font-bold text-[12px] transition-all active:scale-[0.95] shrink-0"
            >
              Falar agora
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      </div>
    </EnterpriseUserLayout>
  );
}