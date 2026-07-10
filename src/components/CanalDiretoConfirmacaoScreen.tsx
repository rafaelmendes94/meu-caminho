import { useNavigate, useLocation } from "react-router-dom";
import { 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  MessageSquare, 
  Wind,
  Lock,
  ChevronRight,
  EyeOff,
  ArrowLeft
} from "lucide-react";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

export default function CanalDiretoConfirmacaoScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const protocol = (location.state as any)?.protocol as string | undefined;
  const isAnonymous = (location.state as any)?.isAnonymous as boolean | undefined;

  return (
    <EnterpriseUserLayout title="Confirmação de Envio">
      <div className="animate-fade-in relative z-10 w-full lg:max-w-6xl mx-auto">
        
        {/* Header - Mobile Only */}
        <header className="px-6 pt-2 pb-4 lg:hidden w-full">
          <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
            <span className="text-[13px] font-bold text-[#999] uppercase tracking-widest">Relato Enviado</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8FB17D15]">
              <ShieldCheck className="h-3 w-3 text-[#8FB17D]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8FB17D]">Seguro</span>
            </div>
          </div>
        </header>

        <main className="w-full lg:pt-4 pb-20 px-4 lg:px-0">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Column: Success Message & Steps */}
            <div className="lg:col-span-7 space-y-8 w-full">
              {/* Success Hero Card */}
              <section className="relative bg-white rounded-[40px] p-8 lg:p-14 lg:shadow-[0_20px_60px_rgba(0,0,0,0.03)] lg:border lg:border-black/5 flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-up overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8FB17D]/5 rounded-full blur-3xl -mr-20 -mt-20" />
                
                <div className="relative z-10 space-y-8">
                  <div className="h-24 w-24 rounded-full bg-[#8FB17D10] flex items-center justify-center border-4 border-white shadow-xl shadow-[#8FB17D15]">
                    <CheckCircle2 className="h-12 w-12 text-[#8FB17D]" />
                  </div>
                  
                  <div className="space-y-4">
                    <h1 
                      className="text-[32px] lg:text-[44px] leading-[1.1] font-bold text-[#111]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Sua mensagem foi enviada <br className="hidden lg:block"/> 
                      com <span className="text-[#8FB17D]">segurança total.</span>
                    </h1>
                    <p className="text-[16px] lg:text-[18px] font-medium leading-relaxed text-[#666] max-w-xl">
                      O RH responsável já recebeu seu relato. Sua iniciativa é um passo importante para um ambiente de trabalho mais saudável.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#8FB17D10] border border-[#8FB17D15]">
                    <ShieldCheck className="h-4 w-4 text-[#8FB17D]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8FB17D]">
                      Protocolo {protocol ?? "gerado"}
                    </span>
                  </div>
                  {protocol && (
                    <div className="mt-2 text-[12px] text-[#666] font-medium">
                      Guarde este número para acompanhar o caso.{" "}
                      {isAnonymous ? "Envio anônimo — RH não verá sua identidade." : "Envio identificado."}
                    </div>
                  )}
                </div>
              </section>

              {/* What Happens Next Card */}
              <section className="bg-white rounded-[40px] p-8 lg:p-10 lg:shadow-[0_20px_60px_rgba(0,0,0,0.03)] lg:border lg:border-black/5 animate-fade-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-[20px] font-bold text-[#111] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                  O que acontece agora
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { text: "O RH recebe sua mensagem imediatamente.", icon: "01" },
                    { text: "Seu relato é analisado com sigilo.", icon: "02" },
                    { text: "Nada aparece no painel Enterprise.", icon: "03" },
                    { text: "A empresa segue os protocolos internos.", icon: "04" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-5">
                      <span className="text-[11px] font-extrabold text-[#F88A2B] bg-[#F88A2B10] h-7 w-7 rounded-full flex items-center justify-center shrink-0 border border-[#F88A2B15]">
                        {item.icon}
                      </span>
                      <p className="text-[15px] font-bold leading-snug text-[#444] pt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Support & Actions */}
            <div className="lg:col-span-5 space-y-6 w-full lg:sticky lg:top-10">
              
              {/* Privacy Confirmation Card */}
              <section className="rounded-[40px] p-8 lg:p-10 bg-[#0B0908] text-white shadow-2xl relative overflow-hidden animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#F88A2B]/10 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <EyeOff className="h-6 w-6 text-[#F88A2B]" />
                  </div>
                  <h3 className="text-[20px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Fora das estatísticas.
                  </h3>
                  <p className="text-[15px] leading-relaxed text-white/50 font-medium">
                    Seu relato continua protegido e nunca será transformado em gráfico ou métrica coletiva. Sua voz é individual e respeitada.
                  </p>
                </div>
              </section>

              {/* Recovery Action Card */}
              <div className="p-8 rounded-[40px] bg-white border border-black/5 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#F88A2B0D] flex items-center justify-center text-[#F88A2B]">
                      <Wind className="h-5 w-5" />
                    </div>
                    <h4 className="text-[16px] font-bold text-[#111]">Recupere o fôlego</h4>
                </div>
                <p className="text-[14px] text-[#666] font-medium leading-relaxed">Relatar situações sensíveis pode ser exaustivo. Que tal uma pausa agora?</p>
                <button 
                  onClick={() => navigate('/enterprise/checkin/intro')}
                  className="w-full h-14 rounded-full flex items-center justify-center gap-3 bg-[#F88A2B08] text-[#F88A2B] font-bold text-[14px] hover:bg-[#F88A2B10] transition-all"
                >
                  Fazer exercício de respiração
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Actions Section */}
              <div className="space-y-4 pt-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={() => navigate('/enterprise')}
                  className="w-full h-16 rounded-full flex items-center justify-center gap-3 text-white font-bold text-[16px] transition-all hover:opacity-95 active:scale-[0.98] shadow-lg shadow-[#F88A2B]/20"
                  style={{ background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)" }}
                >
                  <span>Voltar ao Enterprise</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => navigate('/enterprise/trilha')}
                  className="w-full h-14 rounded-full flex items-center justify-center text-[#999] font-bold text-[14px] hover:text-[#111] hover:bg-black/5 transition-all uppercase tracking-widest"
                >
                  Ir para Minha Trilha
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </EnterpriseUserLayout>
  );
}
