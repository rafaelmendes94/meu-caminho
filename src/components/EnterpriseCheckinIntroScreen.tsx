import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Timer, 
  ShieldCheck, 
  Zap, 
  CloudRain, 
  Sparkles, 
  Scale, 
  Briefcase, 
  BatteryMedium,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const BG = "#F8F9FA";
const ORANGE = "#F88A2B";
const DARK_BG = "#0B0908";

const TopicCard = ({ icon: Icon, label, delay }: { icon: any, label: string, delay: string }) => (
  <div 
    className="flex flex-col items-center justify-center p-4 rounded-[24px] bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white/60 animate-fade-up"
    style={{ animationDelay: delay }}
  >
    <div className="h-10 w-10 rounded-full bg-[#F88A2B0D] flex items-center justify-center mb-2">
      <Icon className="h-5 w-5 text-[#F88A2B]" />
    </div>
    <span className="text-[12px] font-medium text-[#666] text-center leading-tight">{label}</span>
  </div>
);

export default function EnterpriseCheckinIntroScreen() {
  const navigate = useNavigate();

  return (
    <EnterpriseUserLayout title="Check-in">
    <div className="animate-fade-in relative z-10 w-full">
      <main className="flex-1 relative z-10">
        <div className="w-full space-y-12">
          {/* Hero Section */}
          <section className="flex flex-col items-start text-left">
            <div className="relative mb-6">
              <h1 
                className="text-[32px] lg:text-[42px] leading-[1.1] font-bold text-[#111] max-w-[800px] animate-fade-up"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Existe algo dentro de você pedindo para ser ouvido.
              </h1>
            </div>
            <p className="text-[16px] lg:text-[18px] font-medium leading-relaxed text-[#666] max-w-[600px] animate-fade-up [animation-delay:200ms]">
              Seu check-in semanal ajuda a compreender como sua mente tem caminhado nos últimos dias.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-6">
              {/* Time Info Card */}
              <section className="animate-fade-up [animation-delay:400ms]">
                <div className="rounded-[32px] p-8 bg-white border border-black/5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-[#F88A2B08] flex items-center justify-center shrink-0">
                      <Timer className="h-7 w-7 text-[#F88A2B]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[20px] font-bold text-[#111]">Leva menos de 2 minutos</h3>
                      </div>
                      <p className="text-[15px] leading-relaxed text-[#666] font-medium">
                        Uma pausa rápida para perceber mente e emoções de forma prática, sem interromper sua rotina.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy Card */}
              <section className="animate-fade-up [animation-delay:600ms]">
                <div className="rounded-[32px] p-8 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] shadow-xl relative overflow-hidden transition-all hover:shadow-2xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#F88A2B] opacity-[0.1] rounded-full -translate-y-12 translate-x-12 blur-3xl" />
                  <div className="flex items-center gap-5 mb-5 relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-black/5 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-7 w-7 text-[#111]" />
                    </div>
                    <h3 className="text-[20px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Privacidade Total Garantida
                    </h3>
                  </div>
                  <p className="text-[15px] leading-relaxed text-[#666] font-medium relative z-10 max-w-xl">
                    Sua empresa recebe apenas dados agregados e anônimos sobre a saúde emocional da equipe. Seus check-ins individuais nunca são compartilhados.
                  </p>
                </div>
              </section>
            </div>

            <div className="lg:col-span-5 space-y-10">
              {/* Topics Grid */}
              <section>
                <div className="flex items-center justify-between mb-6 px-1">
                  <h4 className="text-[12px] font-bold tracking-wider text-[#999] uppercase">Temas abordados</h4>
                  <Sparkles className="h-4 w-4 text-[#F88A2B]/40" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <TopicCard icon={Zap} label="Mente" delay="800ms" />
                  <TopicCard icon={Sparkles} label="Clareza" delay="900ms" />
                  <TopicCard icon={Scale} label="Equilíbrio" delay="1000ms" />
                  <TopicCard icon={BatteryMedium} label="Energia" delay="1100ms" />
                </div>
              </section>

              {/* CTAs */}
              <div className="flex flex-col gap-4 animate-fade-up [animation-delay:1200ms] pt-4">
                <button 
                  onClick={() => navigate('/enterprise/checkin')}
                  className="w-full h-16 rounded-full flex items-center justify-center text-[#111] font-bold text-[16px] transition-all hover:opacity-95 active:scale-[0.98] shadow-lg shadow-[#F88A2B]/25"
                  style={{ 
                    background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
                  }}
                >
                  <span>Começar agora</span>
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
                
                <button 
                  onClick={() => navigate('/enterprise/privacy')}
                  className="w-full h-14 rounded-full flex items-center justify-center gap-2 text-[#666] font-bold text-[14px] transition-all hover:bg-black/[0.03] border border-black/5"
                >
                  <ShieldCheck className="h-4 w-4 text-[#F88A2B]/60" />
                  <span>Sua privacidade está protegida</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </EnterpriseUserLayout>
  );
}
