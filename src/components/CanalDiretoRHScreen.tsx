import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle,
  MessageSquare,
  Users,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const reasons = [
  "Estou passando por uma situação de assédio",
  "Sinto que o ambiente está tóxico",
  "Preciso de ajuda — assunto sensível",
  "Quero relatar algo com sigilo",
  "Outro assunto confidencial"
];

export default function CanalDiretoRHScreen() {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState<number | null>(null);

  const handleContinue = () => {
    if (selectedReason !== null) {
      navigate('/enterprise/sos-rh/mensagem', { state: { reason: reasons[selectedReason] } });
    }
  };

  return (
    <EnterpriseUserLayout title="Canal Direto RH">
      <div className="animate-fade-in relative z-10 w-full lg:max-w-6xl mx-auto">
        {/* Header - Mobile Only */}
        <header className="px-6 pt-2 pb-4 lg:hidden">
          <div className="flex items-center justify-between mb-6 max-w-md mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-white active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-5 w-5 text-[#111]" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[13px] font-bold text-[#111]">Canal Direto RH</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F88A2B15]">
              <Lock className="h-3 w-3 text-[#F88A2B]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F88A2B]">Confidencial</span>
            </div>
          </div>
        </header>

        <main className="w-full lg:pt-4 pb-20 px-4 lg:px-0">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Context and Selection */}
            <div className="lg:col-span-7 space-y-8 w-full">
              {/* Hero Dark Card */}
              <section className="relative rounded-[40px] bg-[#0B0908] p-8 lg:p-12 text-white shadow-2xl overflow-hidden animate-fade-up">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-[0.1] rounded-full -translate-y-20 translate-x-20 blur-3xl" />
                
                <div className="relative z-10 space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <Lock className="h-7 w-7 text-[#F88A2B]" />
                  </div>
                  
                  <h1 
                    className="text-[28px] lg:text-[36px] leading-[1.1] font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Algumas situações precisam <br className="hidden lg:block"/> ser ouvidas em particular.
                  </h1>
                  <p className="text-[16px] lg:text-[18px] leading-relaxed text-white/50 font-medium max-w-xl">
                    Este canal é totalmente independente dos relatórios e dashboards. Sua mensagem é protegida e encaminhada diretamente ao RH responsável.
                  </p>
                  
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <EyeOff className="h-4 w-4 text-[#F88A2B]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Exclusão de Dashboard</span>
                  </div>
                </div>
              </section>

              {/* Reason Selection */}
              <section className="space-y-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
                    Escolha o motivo do relato
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {reasons.map((reason, idx) => {
                    const isSelected = selectedReason === idx;
                    return (
                      <button 
                        key={idx}
                        onClick={() => setSelectedReason(idx)}
                        className={`w-full p-6 lg:p-8 rounded-[32px] text-left flex items-center justify-between transition-all duration-300 border group ${
                          isSelected 
                            ? "bg-white border-[#F88A2B] shadow-[0_15px_35px_-10px_rgba(248,138,43,0.2)] ring-1 ring-[#F88A2B]/10" 
                            : "bg-white border-black/5 shadow-sm hover:border-[#F88A2B]/30 hover:bg-[#F88A2B02]"
                        } active:scale-[0.99]`}
                      >
                        <span className={`text-[16px] lg:text-[18px] font-bold leading-tight flex-1 pr-6 ${isSelected ? "text-[#F88A2B]" : "text-[#444] group-hover:text-[#111]"}`}>
                          {reason}
                        </span>
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? "bg-[#F88A2B] border-[#F88A2B]" 
                            : "bg-transparent border-black/10 group-hover:border-[#F88A2B]/30"
                        }`}>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Column: Information & Actions */}
            <div className="lg:col-span-5 space-y-6 w-full lg:sticky lg:top-10">
              
              {/* Privacy Explanation Card */}
              <section className="p-8 lg:p-10 rounded-[40px] bg-white border border-black/5 shadow-sm animate-fade-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-[20px] font-bold text-[#111] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Por que este canal é separado?
                </h3>
                <p className="text-[15px] leading-relaxed text-[#666] font-medium mb-8">
                  Situações sensíveis exigem escuta individual e confidencial. Por isso, este fluxo nunca vira métrica estatística nos painéis da empresa.
                </p>
                
                <div className="space-y-5">
                  {[
                    "Proteção total da identidade",
                    "Sem exibição em dashboards coletivos",
                    "Canal direto com RH especializado",
                    "Foco no cuidado e resolução individual"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-[24px] bg-[#F88A2B08] border border-[#F88A2B05]">
                      <div className="h-6 w-6 rounded-full bg-[#F88A2B] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[14px] font-bold text-[#444] leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actions Section */}
              <div className="space-y-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={handleContinue}
                  disabled={selectedReason === null}
                  className="w-full h-16 rounded-full flex items-center justify-center gap-3 text-white font-bold text-[16px] transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#F88A2B]/20"
                  style={{ 
                    background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
                  }}
                >
                  <span>Continuar com segurança</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => navigate('/enterprise')}
                  className="w-full h-14 rounded-full flex items-center justify-center text-[#999] font-bold text-[14px] hover:text-[#111] hover:bg-black/5 transition-all uppercase tracking-widest"
                >
                  Voltar ao Enterprise
                </button>

                <div className="pt-6 text-center">
                    <p className="text-[11px] font-medium text-[#BBB] leading-relaxed max-w-[280px] mx-auto">
                        Este é um ambiente seguro e criptografado para relatos confidenciais.
                    </p>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </EnterpriseUserLayout>
  );
}
