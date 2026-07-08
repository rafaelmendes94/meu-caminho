import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Brain, 
  ArrowRight, 
  Lock,
  Heart,
  TrendingUp,
  CloudMoon,
  Check
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const EnterpriseWelcomeJourneyScreen = () => {
  const navigate = useNavigate();

  const features = [
    { 
      title: "Check-ins emocionais", 
      desc: "Perceba como sua mente está caminhando.", 
      icon: Heart,
      delay: 0.1 
    },
    { 
      title: "Cury Digital IA", 
      desc: "Converse com uma IA inspirada nos ensinamentos de Augusto Cury.", 
      icon: MessageSquare,
      delay: 0.2 
    },
    { 
      title: "Trilhas emocionais", 
      desc: "Conteúdos adaptados ao seu momento emocional.", 
      icon: TrendingUp,
      delay: 0.3 
    },
    { 
      title: "Recuperação mental", 
      desc: "Exercícios para desacelerar pensamentos acelerados.", 
      icon: CloudMoon,
      delay: 0.4 
    }
  ];

  return (
    <EnterpriseUserLayout>
    <div className="animate-fade-in space-y-8 lg:space-y-12 pb-20">
      <main className="max-w-6xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <section className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[32px] p-8 lg:p-16 overflow-hidden shadow-2xl flex flex-col lg:flex-row lg:items-center lg:gap-16 min-h-[440px]"
          >
            <div className="relative z-10 space-y-8 text-center lg:text-left flex-1">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5"
              >
                <Lock className="w-3.5 h-3.5 text-[#F88A2B]" />
                <span className="text-[10px] font-bold text-orange-50 tracking-[0.15em] uppercase">Privacidade Total Garantida</span>
              </motion.div>
              
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111] leading-[1.1]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Bem-vindo à sua <br />
                  <span className="text-[#F88A2B]">jornada emocional.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-orange-50/70 text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
                >
                  Este espaço foi criado para ajudar você a desacelerar a mente, recuperar clareza emocional e fortalecer sua inteligência emocional com privacidade absoluta.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <button 
                  onClick={() => navigate("/enterprise/checkin/intro")}
                  className="w-full sm:w-auto bg-[#F88A2B] text-[#111] px-10 h-14 rounded-full flex items-center justify-center gap-3 shadow-lg shadow-[#F88A2B]/20 hover:opacity-90 active:scale-[0.98] transition-all group"
                >
                  <span className="font-bold text-[15px]">Iniciar primeiro check-in</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            <div className="hidden lg:block relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F88A2B]/20 to-transparent rounded-full blur-[100px]" />
              <div className="relative bg-black/[0.03] backdrop-blur-sm border border-black/5 rounded-[40px] p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#F88A2B]" />
                  </div>
                  <div>
                    <h4 className="text-[#111] font-bold">Privacidade 100%</h4>
                    <p className="text-[#777] text-xs">Seus dados nunca são compartilhados individualmente.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    "Criptografia de ponta a ponta",
                    "Anonimato total nas respostas",
                    "Inteligência exclusiva Augusto Cury"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-[#444] text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#F88A2B]/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#F88A2B]" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2">
              <h4 className="text-[12px] font-bold text-[#999] uppercase tracking-wider">O que você encontrará aqui</h4>
              <h2 className="text-3xl font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>Recursos da sua jornada</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay }}
                className="bg-white border border-black/5 rounded-[24px] p-8 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F88A2B08] flex items-center justify-center group-hover:bg-[#F88A2B1A] transition-colors shrink-0">
                  <item.icon className="w-7 h-7 text-[#F88A2B]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-[18px] text-[#111]">{item.title}</h3>
                  <p className="text-[14px] text-[#666] leading-relaxed font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Privacy Card */}
          <section className="h-full">
            <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[32px] p-10 text-[#111] space-y-8 shadow-xl relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full -mr-20 -mt-20" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Privacidade protegida.</h2>
                  <div className="inline-flex items-center gap-1.5 bg-[#F88A2B]/20 px-3 py-1 rounded-full border border-[#F88A2B]/20">
                    <div className="w-1.5 h-1.5 bg-[#F88A2B] rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider">Proteção ativa</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-black/[0.03] border border-black/5 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7 text-[#F88A2B]" />
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-5 pt-4">
                {[
                  "RH não vê suas respostas individuais",
                  "Conversas com IA são confidenciais",
                  "Relatórios são apenas coletivos",
                  "Sua jornada é totalmente protegida"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-black/[0.03] border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#F88A2B]/20 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#F88A2B]" />
                    </div>
                    <span className="text-[14px] text-[#333] font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps Card */}
          <section className="bg-white border border-black/5 rounded-[32px] p-10 flex flex-col h-full shadow-sm">
            <h2 className="text-2xl font-bold text-[#111] mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>Próximos passos</h2>
            
            <div className="space-y-10 flex-1 flex flex-col justify-center">
              {[
                { text: "Realize seu primeiro check-in", icon: Heart, sub: "Entenda seu momento emocional atual." },
                { text: "Descubra sua trilha emocional", icon: Sparkles, sub: "Conteúdos personalizados para você." },
                { text: "Receba conteúdos diários", icon: Brain, sub: "Exercícios práticos para sua mente." }
              ].map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-6">
                  {idx < 2 && (
                    <div className="absolute left-7 top-14 w-px h-10 bg-gradient-to-b from-[#F88A2B]/30 to-transparent" />
                  )}
                  <div className="w-14 h-14 rounded-full bg-[#F88A2B08] border border-[#F88A2B]/10 flex items-center justify-center shrink-0 relative z-10">
                    <item.icon className="w-6 h-6 text-[#F88A2B]" />
                  </div>
                  <div className="pt-1">
                    <p className="text-[16px] font-bold text-[#111]">{item.text}</p>
                    <p className="text-[13px] text-[#666] font-medium">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Quote Section */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F88A2B05] border border-[#F88A2B10] rounded-[32px] p-12 text-center space-y-8 relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
              <p className="text-2xl lg:text-3xl font-medium italic text-[#111] leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                “Uma mente saudável aprende a desacelerar sem perder a intensidade de viver.”
              </p>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Dr. Augusto Cury</span>
                <div className="w-10 h-0.5 bg-[#F88A2B]/20 rounded-full" />
              </div>
            </div>
          </motion.div>
        </section>

      </main>
    </div>
    </EnterpriseUserLayout>
  );
};

export default EnterpriseWelcomeJourneyScreen;
