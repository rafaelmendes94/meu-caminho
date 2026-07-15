import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  MessageCircle, 
  ClipboardCheck, 
  Crown, 
  HeartHandshake,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnterpriseCheckoutLayout } from "@/components/layouts/EnterpriseCheckoutLayout";

const EnterpriseRHWelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <EnterpriseCheckoutLayout>
      <div className="keep-dark animate-fade-in max-w-[1200px] mx-auto text-[#0B0908]">
        {/* Cinema Hero Card - Full Width on Desktop */}
        <section className="bg-[#0B0908] rounded-[3rem] p-10 md:p-16 lg:p-20 relative overflow-hidden mb-12 shadow-2xl text-white">
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#F88A2B]/20 blur-[120px] rounded-full -mr-32 -mt-32 animate-pulse pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-[#F88A2B]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Governança emocional iniciada</span>
            </div>
            
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl mb-8 leading-tight">
              Bem-vindo ao seu ambiente RH.
            </h1>
            
            <p className="text-white/60 text-lg md:text-xl leading-relaxed font-light mb-12">
              Sua organização agora conta com uma central executiva para estruturar o cuidado emocional com privacidade, governança e inteligência.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button 
                onClick={() => navigate("/enterprise/rh/onboarding")}
                className="w-full sm:w-auto h-16 px-12 bg-[#F88A2B] hover:bg-[#F88A2B]/90 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-[#F88A2B]/20 transition-all flex items-center justify-center gap-3 group"
              >
                <span>Iniciar implantação</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button 
                onClick={() => navigate("/enterprise/rh/dashboard")}
                className="text-white/60 hover:text-white font-bold text-[10px] uppercase tracking-widest px-8 py-4 flex items-center gap-2 transition-colors"
              >
                <span>Ir para Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Pilares da implantação em Grid */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl mb-4">Primeiros passos para sua organização</h2>
            <p className="text-sm text-[#0B0908]/40 font-medium">O que você poderá configurar agora.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Estrutura organizacional", desc: "Defina departamentos, unidades e responsáveis.", icon: Building2 },
              { title: "Privacidade por desenho", desc: "Configure anonimização e regras de proteção.", icon: ShieldCheck },
              { title: "Convites à equipe", desc: "Escolha como convidar seus colaboradores.", icon: Users },
              { title: "Comunicação", desc: "Materiais para lançamento interno.", icon: MessageCircle },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-[#0B0908]/5 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-[#0B0908]/5 flex items-center justify-center mb-8 group-hover:bg-[#F88A2B]/10 transition-colors">
                  <item.icon className="w-6 h-6 text-[#0B0908]/40 group-hover:text-[#F88A2B] transition-colors" />
                </div>
                <h4 className="font-bold text-sm mb-4 text-[#0B0908] uppercase tracking-widest">{item.title}</h4>
                <p className="text-xs text-[#0B0908]/50 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Left: Plan Summary */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/40 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
                  <Crown className="w-8 h-8 text-[#F88A2B]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0908]/30 mb-1">Seu plano ativo</div>
                  <h3 className="font-playfair text-3xl text-[#0B0908]">Enterprise Growth</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#0B0908]/5 pt-6 md:pt-0 md:pl-8">
                <div className="text-center md:text-right">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#0B0908]/30 mb-1">Licenças</div>
                  <div className="text-sm font-bold text-[#F88A2B]">250 Disponíveis</div>
                </div>
              </div>
            </section>

            {/* Privacy Card */}
            <section className="bg-[#0B0908] rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[100px] rounded-full"></div>
               <div className="relative z-10">
                 <h3 className="font-playfair text-2xl mb-6 leading-tight">O RH acompanha o coletivo. <br/>A jornada individual continua privada.</h3>
                 <p className="text-white/50 text-sm leading-relaxed mb-10 font-light max-w-xl">
                   O Enterprise foi desenhado para apoiar decisões organizacionais sem jamais comprometer a confidencialidade individual dos colaboradores.
                 </p>
                 <div className="grid sm:grid-cols-2 gap-4 mb-10">
                    {[
                      "Sem respostas individuais",
                      "Sem conversas privadas com IA",
                      "Sem score emocional pessoal",
                      "Relatórios agregados",
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs text-white/70">
                        <Check className="w-4 h-4 text-[#F88A2B]" />
                        {item}
                      </div>
                    ))}
                 </div>
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Privacidade por desenho</span>
                 </div>
               </div>
            </section>
          </div>

          {/* Right: Recommendation & Tip */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-10 border border-[#0B0908]/5 shadow-sm">
               <div className="w-14 h-14 rounded-2xl bg-[#F88A2B]/5 flex items-center justify-center mb-8">
                 <ClipboardCheck className="w-7 h-7 text-[#F88A2B]" />
               </div>
               <p className="text-lg font-medium text-[#0B0908] leading-relaxed mb-8 italic font-playfair">
                 "Comece configurando a empresa e as regras de privacidade antes de enviar os convites. Isso constrói confiança desde o primeiro dia."
               </p>
               <Button 
                onClick={() => navigate("/enterprise/rh/status")}
                variant="ghost" 
                className="w-full h-14 rounded-2xl border border-[#0B0908]/5 text-[#0B0908]/60 hover:text-[#0B0908] font-bold text-[10px] uppercase tracking-[0.2em]"
               >
                 Ver Checklist Completo
               </Button>
            </section>

            <div className="bg-[#F88A2B]/5 rounded-[2.5rem] p-10 border border-[#F88A2B]/10 text-center">
               <HeartHandshake className="w-10 h-10 text-[#F88A2B] mx-auto mb-6 opacity-40" />
               <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0B0908]/30 leading-relaxed">
                 A implantação Enterprise começa pela confiança.
               </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="text-center pb-24">
          <p className="text-[10px] text-[#0B0908]/20 uppercase tracking-[0.3em] font-bold">
            Meu Caminho Enterprise • Central RH
          </p>
        </footer>
      </div>
    </EnterpriseCheckoutLayout>
  );
};

export default EnterpriseRHWelcomeScreen;
