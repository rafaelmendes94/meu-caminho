import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  ChevronRight,
  Lock,
  MessageSquare,
  Clock,
  AlertCircle,
  Brain,
  Zap,
  Activity,
  UserCircle
} from "lucide-react";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const suggestions = [
  { 
    title: "Estou sob pressão por entrega", 
    desc: "Para quando a mente não desacelera.",
    icon: <Zap className="h-5 w-5" />
  },
  { 
    title: "Estou cansado emocionalmente", 
    desc: "Para perceber limites antes do esgotamento.",
    icon: <Activity className="h-5 w-5" />
  },
  { 
    title: "Estou com dificuldade em uma relação no trabalho", 
    desc: "Para organizar pensamentos antes de agir.",
    icon: <UserCircle className="h-5 w-5" />
  },
  { 
    title: "Sinto que perdi clareza", 
    desc: "Para recuperar foco e presença.",
    icon: <Brain className="h-5 w-5" />
  },
  { 
    title: "Quero lidar melhor com ansiedade", 
    desc: "Para acolher a mente sem se julgar.",
    icon: <MessageSquare className="h-5 w-5" />
  }
];

const history: Array<{ title: string; date: string }> = [];

export default function EnterpriseCuryDigitalScreen() {
  const navigate = useNavigate();

  const handleStartChat = (theme?: string) => {
    navigate('/enterprise/cury-digital/chat', { state: { initialMessage: theme } });
  };

  return (
    <EnterpriseUserLayout title="Cury Digital IA">
      <div className="animate-fade-in space-y-8 lg:space-y-12 pb-20 lg:pb-0">
        
        {/* Hero Section - Clean and Premium */}
        <section className="relative -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="relative overflow-hidden rounded-b-[40px] lg:rounded-[40px] bg-gradient-to-br from-[#FDFCFB] via-[#F7F4F2] to-[#EFEAE5] p-8 lg:p-16 border-b border-black/5 min-h-[440px] lg:min-h-[480px] flex flex-col justify-center">
            {/* Soft Background Effects */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F88A2B]/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white rounded-full blur-[100px] -ml-32 -mb-32" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12 lg:gap-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-black/5 mb-10 shadow-sm backdrop-blur-xl">
                  <div className="h-2 w-2 rounded-full bg-[#F88A2B] animate-pulse shadow-[0_0_8px_#F88A2B]" />
                  <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Sistema de Inteligência</span>
                </div>
                
                <h2 className="text-[42px] lg:text-[64px] font-bold leading-[1.05] mb-6 tracking-tight text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Cury Digital <span className="text-[#F88A2B] relative inline-block">IA
                    <span className="absolute bottom-2 left-0 w-full h-1 bg-[#F88A2B]/20 rounded-full blur-sm" />
                  </span>
                </h2>
                
                <p className="text-[17px] lg:text-[21px] text-[#666] font-medium leading-relaxed max-w-[500px]">
                  O suporte emocional que você precisa, inspirado no método do Dr. Augusto Cury, disponível 24h para seus desafios.
                </p>
              </div>
              
              <div className="relative group w-full lg:w-fit">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#F88A2B] via-[#FFB347] to-[#F88A2B] rounded-[22px] blur opacity-15 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <button
                  onClick={() => handleStartChat()}
                  className="relative w-full lg:w-[280px] h-16 lg:h-20 rounded-[20px] bg-[#F88A2B] text-[#111] font-[900] text-[17px] tracking-wide transition-all hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(248,138,43,0.25)] active:scale-[0.97] flex items-center justify-center gap-4 shrink-0 overflow-hidden"
                >
                  <span className="relative z-10">Falar com Cury IA</span>
                  <MessageSquare className="h-5 w-5 fill-[#111]/10 relative z-10" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Status / Privacy Section - Compact Scrollable on Mobile */}
        <section className="overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
          <div className="flex lg:grid lg:grid-cols-3 gap-4 min-w-max lg:min-w-0">
            {[
              { icon: <ShieldCheck className="h-5 w-5 text-[#F88A2B]" />, label: "Privacidade", value: "Totalmente Seguro" },
              { icon: <Lock className="h-5 w-5 text-[#F88A2B]" />, label: "Criptografia", value: "Conversas Privadas", gradient: true },
              { icon: <Brain className="h-5 w-5 text-[#F88A2B]" />, label: "Método", value: "Dr. Augusto Cury" }
            ].map((item, i) => (
              <div 
                key={i}
                className={`flex items-center gap-3 p-4 lg:p-5 rounded-[20px] lg:rounded-[24px] border border-black/5 shadow-sm min-w-[180px] lg:min-w-0 ${
                  item.gradient ? 'bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border-[#E5E0DA]' : 'bg-white'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${item.gradient ? 'bg-black/5' : 'bg-[#F88A2B1A]'}`}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] lg:text-[10px] text-[#999] uppercase font-bold tracking-wider">{item.label}</span>
                  <span className="text-[12px] lg:text-[13px] font-bold text-[#111] whitespace-nowrap">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Suggestions & History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Suggestions Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[12px] font-bold text-[#999] uppercase tracking-wider">Sugestões de temas</h4>
              <Zap className="h-3.5 w-3.5 text-[#F88A2B]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 px-1">
              {suggestions.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleStartChat(item.title)}
                  className="p-4 lg:p-5 rounded-[20px] lg:rounded-[24px] bg-white border border-black/5 text-left flex items-start gap-4 hover:border-[#F88A2B]/30 transition-all group shadow-sm hover:shadow-md h-full"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#F88A2B08] flex items-center justify-center text-[#F88A2B] group-hover:bg-[#F88A2B1A] transition-colors shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="text-[14px] lg:text-[15px] font-bold text-[#111] leading-tight mb-1">{item.title}</h4>
                    <p className="text-[11px] lg:text-[12px] text-[#666] leading-relaxed line-clamp-2">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#CCC] group-hover:text-[#F88A2B] transition-colors self-center shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar: History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[12px] font-bold text-[#999] uppercase tracking-wider">Histórico recente</h4>
              <Clock className="h-3.5 w-3.5 text-[#999]" />
            </div>
            <div className="space-y-3 px-1">
              {history.length > 0 ? history.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => navigate('/enterprise/cury-digital/chat')}
                  className="w-full p-4 rounded-xl lg:rounded-2xl bg-white border border-black/[0.03] text-left flex items-center justify-between hover:bg-[#FBF9F7] hover:border-[#F88A2B]/20 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-[#F88A2B]/40" />
                    <span className="text-[13px] lg:text-[14px] font-bold text-[#444]">{item.title}</span>
                  </div>
                  <span className="text-[10px] lg:text-[11px] text-[#999] font-medium">{item.date}</span>
                </button>
              )) : (
                <div className="p-5 rounded-2xl bg-white border border-dashed border-black/10 text-center">
                  <MessageSquare className="h-4 w-4 text-[#CCC] mx-auto mb-2" />
                  <p className="text-[12px] text-[#666] font-medium">Nenhuma conversa registrada ainda.</p>
                  <p className="text-[11px] text-[#999] mt-0.5">Suas próximas sessões aparecerão aqui.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* SOS Card - Moved to Bottom */}
        <section className="pt-6 lg:pt-8 border-t border-black/5 px-1">
          <div 
            className="rounded-[24px] p-5 lg:p-8 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] relative overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
            onClick={() => navigate('/enterprise/sos-rh')}
          >
            <div className="flex items-center gap-4 lg:gap-5">
              <div className="h-12 w-12 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6 text-[#F88A2B]" />
              </div>
              <div>
                <h3 className="text-[18px] lg:text-[20px] font-bold text-[#111] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Canal Direto RH
                </h3>
                <p className="text-[12px] lg:text-[13px] text-[#777] leading-relaxed max-w-md">
                  Para assuntos sensíveis como assédio ou ambiente tóxico diretamente com o RH de forma segura e privada.
                </p>
              </div>
            </div>
            <button 
              className="w-full md:w-fit h-12 lg:px-8 rounded-full bg-white text-[#0B0908] font-bold text-[14px] transition-all active:scale-[0.95] group-hover:bg-[#F88A2B] group-hover:text-[#111] shrink-0 border border-black/5 shadow-sm"
            >
              Acessar Canal
            </button>
          </div>
        </section>
      </div>
    </EnterpriseUserLayout>
  );
}
