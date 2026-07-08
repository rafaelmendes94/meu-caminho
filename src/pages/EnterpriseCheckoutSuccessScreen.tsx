import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  ShieldCheck, 
  Building2, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Download, 
  Lock, 
  HeartHandshake,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EnterpriseCheckoutLayout } from "@/components/layouts/EnterpriseCheckoutLayout";

const EnterpriseCheckoutSuccessScreen = () => {
  const navigate = useNavigate();

  const handleDownload = () => {
    toast.success("Comprovante preparado.", {
      description: "O download do resumo da assinatura começará em instantes."
    });
  };

  const handleSchedule = () => {
    toast.success("Solicitação de onboarding assistido enviada.", {
      description: "Um especialista entrará em contato para agendar seu onboarding."
    });
  };

  return (
    <EnterpriseCheckoutLayout currentStep="acesso">
      <div className="animate-fade-in max-w-[1200px] mx-auto text-[#0B0908]">
        {/* Cinema Hero Card - Centralized Premium */}
        <section className="bg-[#0B0908] rounded-[3rem] p-10 md:p-20 relative overflow-hidden mb-12 shadow-2xl text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full lg:w-[800px] h-[500px] bg-[#F88A2B]/20 blur-[120px] rounded-full -mt-60 animate-pulse pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#F88A2B]/20 mb-8 border border-[#F88A2B]/30 shadow-[0_0_50px_rgba(248,138,43,0.4)] animate-in zoom-in duration-700">
              <ShieldCheck className="w-12 h-12 text-[#F88A2B]" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#F88A2B]" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Parceria confirmada</span>
            </div>
            
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl text-white mb-8 leading-tight">
              Enterprise ativado com sucesso.
            </h1>
            <p className="text-white/60 text-lg md:text-2xl leading-relaxed max-w-2xl mx-auto font-light mb-12">
              Sua organização inicia hoje uma jornada de inteligência emocional coletiva e cuidado humano.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => navigate("/enterprise/rh/login")}
                className="w-full sm:w-auto h-16 px-12 bg-[#F88A2B] hover:bg-[#F88A2B]/90 text-white rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-[#F88A2B]/20 transition-all flex items-center justify-center gap-3 group"
              >
                <span>Criar acesso RH</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button 
                onClick={handleDownload}
                className="text-white/60 hover:text-white font-bold text-[10px] uppercase tracking-widest px-8 py-4 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Baixar comprovante</span>
              </button>
            </div>
          </div>
        </section>

        {/* Summary Card Grid */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-xl mb-12 grid md:grid-cols-3 gap-8">
          <div className="space-y-1 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-2">Empresa Ativa</div>
            <div className="font-playfair text-2xl flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#F88A2B]" />
              Bestilife Brasil
            </div>
          </div>
          <div className="space-y-1 p-4 border-y md:border-y-0 md:border-x border-[#0B0908]/5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-2">Plano & Acesso</div>
            <div className="font-medium text-sm flex items-center gap-2">
              <span className="text-[#F88A2B] font-bold">Growth</span>
              <span className="text-[#0B0908]/20">•</span>
              <span className="text-[#0B0908]/60 uppercase tracking-widest text-[10px] font-bold">250 Licenças Iniciais</span>
            </div>
          </div>
          <div className="space-y-1 p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-2">Status do Sistema</div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-green-600">Ambiente Pronto</span>
            </div>
          </div>
        </div>

        {/* Próximos Passos em Grid Desktop */}
        <section className="mb-24">
          <h2 className="font-playfair text-3xl mb-12 text-center">Próximos passos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0B0908] rounded-[2.5rem] p-10 text-white flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/10 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-3xl bg-[#F88A2B]/20 flex items-center justify-center mb-8">
                  <Lock className="w-7 h-7 text-[#F88A2B]" />
                </div>
                <h4 className="font-playfair text-2xl mb-4 leading-tight">Acesse o Dashboard RH</h4>
                <p className="text-sm text-white/40 leading-relaxed mb-10 font-light">
                  Configure a estrutura organizacional, departamentos e domínio da empresa.
                </p>
                <Button 
                  onClick={() => navigate("/enterprise/rh/login")}
                  className="w-full bg-[#F88A2B] hover:bg-[#F88A2B]/90 text-white rounded-2xl h-14 font-bold uppercase text-[10px] tracking-[0.2em]"
                >
                  Entrar no RH Admin
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-[#0B0908]/5 flex flex-col justify-between group cursor-pointer hover:shadow-xl transition-all">
              <div>
                <div className="w-14 h-14 rounded-3xl bg-[#0B0908]/5 flex items-center justify-center mb-8 group-hover:bg-[#F88A2B]/10 transition-colors">
                  <Calendar className="w-7 h-7 text-[#0B0908]/40 group-hover:text-[#F88A2B] transition-colors" />
                </div>
                <h4 className="font-playfair text-2xl mb-4 leading-tight text-[#0B0908]">Agende seu Onboarding</h4>
                <p className="text-sm text-[#0B0908]/40 leading-relaxed mb-10 font-light">
                  Receba apoio direto de um especialista para configurar os convites e o lançamento.
                </p>
              </div>
              <Button 
                onClick={handleSchedule}
                variant="outline"
                className="w-full border-[#0B0908]/10 text-[#0B0908]/60 hover:text-[#0B0908] rounded-2xl h-14 font-bold uppercase text-[10px] tracking-[0.2em]"
              >
                Agendar Horário
              </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-[#0B0908]/5 flex flex-col justify-between group cursor-pointer hover:shadow-xl transition-all">
              <div>
                <div className="w-14 h-14 rounded-3xl bg-[#0B0908]/5 flex items-center justify-center mb-8 group-hover:bg-[#F88A2B]/10 transition-colors">
                  <HeartHandshake className="w-7 h-7 text-[#0B0908]/40 group-hover:text-[#F88A2B] transition-colors" />
                </div>
                <h4 className="font-playfair text-2xl mb-4 leading-tight text-[#0B0908]">Comunique a equipe</h4>
                <p className="text-sm text-[#0B0908]/40 leading-relaxed mb-10 font-light">
                  Acesse materiais de apoio para apresentar o Enterprise aos seus colaboradores.
                </p>
              </div>
              <Button 
                variant="outline"
                className="w-full border-[#0B0908]/10 text-[#0B0908]/60 hover:text-[#0B0908] rounded-2xl h-14 font-bold uppercase text-[10px] tracking-[0.2em]"
              >
                Ver Materiais
              </Button>
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="bg-[#0B0908] rounded-[3rem] p-10 md:p-20 relative overflow-hidden mb-24 text-white">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="font-playfair text-3xl md:text-4xl mb-8 leading-tight">O compromisso com a privacidade continua central.</h3>
              <p className="text-white/60 text-lg leading-relaxed mb-10 font-light">
                O Enterprise foi projetado para oferecer inteligência emocional sem jamais comprometer a confidencialidade individual dos colaboradores.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Privacidade por desenho</span>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-1 gap-4">
              {[
                { icon: Lock, text: "Check-ins individuais são privados" },
                { icon: Sparkles, text: "Conversas com IA são confidenciais" },
                { icon: Users, text: "RH visualiza apenas tendências agregadas" },
                { icon: Check, text: "Exportações 100% anonimizadas" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <item.icon className="w-5 h-5 text-[#F88A2B]" />
                  <span className="text-sm font-medium text-white/80">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Actions (Non-fixed) */}
        <div className="text-center pb-24 border-t border-[#0B0908]/5 pt-20 max-w-2xl mx-auto">
          <HeartHandshake className="w-10 h-10 text-[#F88A2B] mx-auto mb-8" />
          <p className="font-playfair text-2xl md:text-3xl text-[#0B0908] italic leading-relaxed mb-8">
            "Uma organização emocionalmente inteligente começa quando o cuidado genuíno caminha junto com a privacidade e a confiança."
          </p>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0B0908]/30">
            Meu Caminho Enterprise • Boas-vindas
          </div>
        </div>
      </div>
    </EnterpriseCheckoutLayout>
  );
};

export default EnterpriseCheckoutSuccessScreen;
