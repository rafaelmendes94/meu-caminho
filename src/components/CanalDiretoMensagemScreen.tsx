import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  X
} from "lucide-react";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

export default function CanalDiretoMensagemScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedReason = location.state?.reason || "Assunto sensível";
  
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);

  const isFormValid = message.trim().length > 0 && agreed;

  const handleSend = () => {
    if (isFormValid) {
      navigate('/enterprise/sos-rh/confirmado');
    }
  };

  return (
    <EnterpriseUserLayout title="Nova Mensagem">
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
              <span className="text-[13px] font-bold text-[#111]">Mensagem</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F88A2B15]">
              <Lock className="h-3 w-3 text-[#F88A2B]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F88A2B]">Sigilo</span>
            </div>
          </div>
        </header>

        <main className="w-full lg:pt-4 pb-20 px-4 lg:px-0">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Form Area */}
            <div className="lg:col-span-7 space-y-8 w-full">
              <section className="animate-fade-up">
                <h1 
                  className="text-[32px] lg:text-[42px] leading-[1.1] font-bold text-[#111] mb-6"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Escreva no seu tempo.<br />Seu relato será tratado <span className="text-[#F88A2B]">com sigilo.</span>
                </h1>
                <p className="text-[16px] lg:text-[18px] font-medium leading-relaxed text-[#666] max-w-xl">
                  Compartilhe apenas o que se sentir confortável em dizer agora. O RH responsável receberá seu contato.
                </p>
              </section>

              {/* Form Card */}
              <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="rounded-[40px] bg-white p-8 lg:p-10 shadow-lg border border-black/5 space-y-8">
                  {/* Selected Reason Field */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#999] ml-1">Motivo do relato</label>
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-[#F8F9FA] border border-black/[0.03]">
                      <span className="text-[15px] font-bold text-[#111]">{selectedReason}</span>
                      <button 
                        onClick={() => navigate('/enterprise/sos-rh')}
                        className="text-[11px] font-bold text-[#F88A2B] px-4 py-2 rounded-full bg-white border border-black/[0.03] hover:shadow-sm transition-all"
                      >
                        ALTERAR
                      </button>
                    </div>
                  </div>

                  {/* Message Area */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#999] ml-1">Sua mensagem</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Conte o que aconteceu, como você se sentiu ou que tipo de ajuda precisa…"
                      className="w-full min-h-[220px] p-6 rounded-[32px] bg-[#F8F9FA] border border-transparent focus:border-[#F88A2B] focus:bg-white focus:outline-none transition-all text-[16px] leading-relaxed text-[#333] placeholder:text-[#BBB] resize-none"
                    />
                  </div>

                  {/* Agreement Checkbox */}
                  <button 
                    onClick={() => setAgreed(!agreed)}
                    className="flex items-start gap-4 text-left p-6 rounded-[28px] bg-[#F88A2B05] border border-[#F88A2B08] transition-all hover:bg-[#F88A2B10] group"
                  >
                    <div className={`mt-0.5 h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${agreed ? "bg-[#F88A2B] border-[#F88A2B]" : "bg-white border-black/10 group-hover:border-[#F88A2B]/30"}`}>
                      {agreed && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <span className="text-[14px] font-bold leading-tight text-[#444]">
                      Estou ciente de que esta mensagem será enviada diretamente e exclusivamente ao RH responsável pela plataforma.
                    </span>
                  </button>
                </div>
              </section>
            </div>

            {/* Right Column: Security & Actions */}
            <div className="lg:col-span-5 space-y-6 w-full lg:sticky lg:top-10">
              
              {/* Security Hero Card */}
              <section className="rounded-[40px] p-8 lg:p-10 bg-[#0B0908] text-white shadow-2xl relative overflow-hidden animate-fade-up">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#F88A2B] opacity-[0.1] rounded-full -translate-y-12 translate-x-12 blur-3xl" />
                <div className="relative z-10 space-y-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-[#F88A2B]" />
                  </div>
                  <h3 className="text-[20px] lg:text-[24px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Criptografia Ativa em cada caractere.
                  </h3>
                  <p className="text-[15px] leading-relaxed text-white/50 font-medium">
                    Seu relato não entra em relatórios, gráficos ou IA de análise coletiva. É uma linha direta e protegida.
                  </p>
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <ShieldCheck className="h-4 w-4 text-[#F88A2B]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Envio 100% Protegido</span>
                  </div>
                </div>
              </section>

              {/* Actions Section */}
              <div className="space-y-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={handleSend}
                  disabled={!isFormValid}
                  className="w-full h-16 rounded-full flex items-center justify-center gap-3 text-white font-bold text-[16px] transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#F88A2B]/20"
                  style={{ 
                    background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
                  }}
                >
                  <span>Enviar Relato com Segurança</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => navigate('/enterprise')}
                  className="w-full h-14 rounded-full flex items-center justify-center text-[#999] font-bold text-[14px] hover:text-[#111] hover:bg-black/5 transition-all uppercase tracking-widest"
                >
                  Cancelar Envio
                </button>
              </div>

              <div className="pt-6 text-center">
                <p className="text-[11px] font-medium text-[#999] leading-relaxed max-w-[280px] mx-auto">
                    Se estiver em uma situação de emergência, procure as autoridades competentes.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </EnterpriseUserLayout>
  );
}
