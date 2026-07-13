import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ShieldCheck, 
  CheckCircle2, 
  MessageCircle, 
  BarChart3, 
  UserCircle2, 
  Sparkles, 
  ArrowRight,
  Heart,
  Brain,
  Activity,
  Zap,
  Lock,
  Ghost
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const EnterpriseInviteAcceptanceScreen = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  return (
    <EnterpriseUserLayout>
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] font-montserrat overflow-y-auto pb-32">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#F7F4F2]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-lg flex items-center justify-center">
            <span className="text-[#111] font-playfair font-bold text-xs">MC</span>
          </div>
          <span className="text-sm font-playfair font-bold text-[#0B0908]">Meu Caminho Enterprise</span>
        </div>
        <Badge className="bg-white text-[#F88A2B] border border-[#F88A2B]/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
          Convite privado
        </Badge>
      </header>

      <main className="px-6 space-y-12 max-w-4xl mx-auto pt-4">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-14 text-[#111] shadow-2xl">
          {/* Breathing Amber Glow */}
          <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] bg-[#F88A2B]/20 blur-[100px] rounded-full animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[250px] h-[250px] bg-[#F88A2B]/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-2 rounded-full border border-black/5">
              <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]">Privado e seguro</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-playfair font-bold leading-tight">
              Sua empresa disponibilizou um espaço de cuidado emocional.
            </h1>
            
            <p className="text-[#444] text-base md:text-lg max-w-xl font-light leading-relaxed">
              O Meu Caminho Enterprise foi criado para apoiar clareza, equilíbrio emocional e saúde mental — com total privacidade individual.
            </p>

            <div className="pt-4 flex items-center gap-4">
               <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0B0908] bg-black/5 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 text-[#F88A2B]/60" />
                  </div>
                ))}
              </div>
              <span className="text-xs text-[#999] font-medium italic">Partículas de calma e foco.</span>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B0908]">Como funciona</h2>
            <p className="text-black/40 text-sm">Transparência total desde o primeiro passo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <UserCircle2 className="w-6 h-6 text-[#F88A2B]" />,
                title: "Seu check-in é privado",
                desc: "A empresa não vê respostas individuais."
              },
              {
                icon: <MessageCircle className="w-6 h-6 text-[#F88A2B]" />,
                title: "Conversas com IA são confidenciais",
                desc: "O RH nunca acessa suas conversas."
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-[#F88A2B]" />,
                title: "Os dados são agregados",
                desc: "A organização enxerga apenas tendências coletivas."
              },
              {
                icon: <Zap className="w-6 h-6 text-[#F88A2B]" />,
                title: "Você controla sua jornada",
                desc: "O foco é apoio emocional, não monitoramento."
              }
            ].map((card, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-sm border border-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="font-bold text-[#0B0908] mb-2">{card.title}</h3>
                <p className="text-sm text-black/50 leading-relaxed font-light">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* O que você terá acesso */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#0B0908]">Sua nova caixa de ferramentas</h2>
            <p className="text-black/40 text-sm">Recursos premium para sua saúde mental.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: <Activity className="w-5 h-5" />, label: "Trilhas emocionais" },
              { icon: <Brain className="w-5 h-5" />, label: "Exercícios mentais" },
              { icon: <Heart className="w-5 h-5" />, label: "Check-ins diários" },
              { icon: <Sparkles className="w-5 h-5" />, label: "Conversa com IA" },
              { icon: <ShieldCheck className="w-5 h-5" />, label: "Equilíbrio" },
              { icon: <Zap className="w-5 h-5" />, label: "Recuperação" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-black/[0.03] text-center space-y-3 hover:bg-[#F88A2B]/5 transition-colors cursor-default shadow-sm">
                <div className="mx-auto w-10 h-10 flex items-center justify-center text-[#F88A2B]">
                  {item.icon}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#0B0908]/70 block">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mensagem da Empresa */}
        <section className="space-y-4">
          <div className="bg-white/40 backdrop-blur-md border border-white p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F88A2B]/5 rounded-bl-full pointer-events-none" />
            
            <div className="max-w-xl mx-auto text-center space-y-6">
              <Heart className="w-8 h-8 text-[#F88A2B] mx-auto opacity-40" />
              <blockquote className="text-xl md:text-2xl font-playfair italic text-[#0B0908] leading-relaxed">
                “Estamos iniciando uma jornada coletiva de cuidado emocional. Sua experiência individual é protegida e privada.”
              </blockquote>
              <div className="pt-2">
                <div className="h-px w-12 bg-[#F88A2B]/30 mx-auto mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0B0908]/40">RH & Liderança</p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacidade Garantida */}
        <section className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-14 text-[#111] relative overflow-hidden shadow-2xl">
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#F88A2B]/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 bg-black/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-black/5">
                <Lock className="w-8 h-8 text-[#F88A2B]" />
              </div>
              <h3 className="text-2xl md:text-4xl font-playfair font-bold leading-tight">
                Nenhuma emoção individual aparece para a empresa.
              </h3>
              <div className="inline-flex items-center gap-2 bg-[#F88A2B]/20 border border-[#F88A2B]/30 px-5 py-2.5 rounded-full">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F88A2B] animate-pulse shadow-[0_0_10px_#F88A2B]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Proteção emocional ativa</span>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="bg-black/[0.03] backdrop-blur-xl p-8 rounded-[2rem] border border-black/5 space-y-5">
                {[
                  "Sem monitoramento individual",
                  "Sem acesso a conversas privadas",
                  "Sem relatórios pessoais",
                  "Anonimização automática",
                  "IA agregada"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="w-5 h-5 rounded-full bg-[#F88A2B]/20 flex items-center justify-center group-hover:bg-[#F88A2B]/40 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F88A2B]" />
                    </div>
                    <span className="text-[#444] text-sm font-light group-hover:text-[#111] transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Antes de Começar */}
        <section className="space-y-6 max-w-2xl mx-auto bg-white/20 p-8 rounded-3xl border border-white/40">
           <h3 className="text-center font-bold text-[#0B0908] uppercase tracking-widest text-xs">Antes de começar</h3>
           <div className="space-y-4">
            {[
              "Experiência individual privada",
              "Empresa vê apenas tendências coletivas",
              "Participação voluntária",
              "Jornada emocional personalizada",
              "Ambiente protegido"
            ].map((check, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-sm text-[#0B0908]/60 font-medium">{check}</span>
              </div>
            ))}
           </div>
        </section>

        {/* CTAs */}
        <section className="pt-8 space-y-4 max-w-md mx-auto w-full">
          <Button 
            onClick={() => navigate('/enterprise/aceite-privacidade')}
            className="w-full h-16 bg-[#F88A2B] hover:bg-[#e0751a] text-[#111] rounded-2xl text-lg font-bold shadow-xl shadow-[#F88A2B]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Continuar com segurança
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/enterprise/privacy')}
            className="w-full h-14 text-[#0B0908]/50 hover:text-[#0B0908] hover:bg-black/5 rounded-2xl font-bold uppercase tracking-widest text-xs"
          >
            Entender privacidade
          </Button>
        </section>

        {/* Footer */}
        <footer className="pt-12 pb-8 text-center">
          <p className="text-[#0B0908]/30 text-xs font-medium max-w-xs mx-auto leading-relaxed italic">
            "O cuidado emocional só funciona quando existe confiança."
          </p>
        </footer>
      </main>
    </div>
    </EnterpriseUserLayout>
  );
};

export default EnterpriseInviteAcceptanceScreen;
