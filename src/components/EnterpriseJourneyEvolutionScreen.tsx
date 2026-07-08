import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  History, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  LineChart,
  Target,
  Zap,
  Heart,
  Brain,
  Layers,
  BarChart3,
  Calendar,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";
import { useLocation } from "react-router-dom";

const EnterpriseJourneyEvolutionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRH = location.pathname.startsWith('/enterprise/rh');
  const Layout = isRH ? EnterpriseRHLayout : EnterpriseUserLayout;

  const timelineData = [
    { month: "Janeiro", label: "Início da jornada", insight: "Primeiros passos na conscientização emocional coletiva.", status: "neutral" },
    { month: "Fevereiro", label: "Aumento de adesão", insight: "O time começa a integrar o cuidado emocional na rotina.", status: "positive" },
    { month: "Março", label: "Melhora de clareza", insight: "Redução de ruídos e maior foco na gestão de pensamentos.", status: "positive" },
    { month: "Abril", label: "Redução de sobrecarga", insight: "Melhora nos indicadores de recuperação e descanso mental.", status: "positive" },
    { month: "Maio", label: "Crescimento sustentável", insight: "A cultura emocional atinge um patamar de maturidade elevado.", status: "highlight" },
  ];

  const indicators = [
    { label: "Equilíbrio Emocional", value: 85, color: "#F88A2B" },
    { label: "Clareza Coletiva", value: 78, color: "#F88A2B" },
    { label: "Energia Sustentável", value: 82, color: "#F88A2B" },
    { label: "Recuperação Mental", value: 90, color: "#F88A2B" },
  ];

  const transformations = [
    { title: "Diálogo Aberto", desc: "Mais abertura para conversas emocionais." },
    { title: "Consciência", desc: "Maior consciência sobre desgaste." },
    { title: "Liderança", desc: "Lideranças mais preventivas." },
    { title: "Valorização", desc: "Recuperação valorizada." }
  ];

  return (
    <Layout title="Evolução da Jornada">
      <div className="animate-fade-in space-y-8 lg:space-y-12 w-full max-w-full lg:pt-4">
        
        {/* Header - Mobile Only */}
        <header className="relative z-20 flex items-center justify-between lg:hidden px-2 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-black/5 text-[#111]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-[13px] font-bold text-[#111]">Evolução</span>
          <div className="w-10" />
        </header>

        {/* Hero Card */}
        <section>
          <div className="bg-white border border-[#E5E0DA] text-[#111] rounded-[32px] p-8 lg:p-14 relative overflow-hidden shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B]/05 rounded-full blur-[100px] -mr-20 -mt-20" />
            
            <div className="relative z-10 space-y-6 text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/5 text-[#333] text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                <History className="w-3 h-3 text-[#F88A2B]" />
                Histórico de Maturidade
              </div>
              
              <h2 className="text-[32px] lg:text-[44px] font-bold text-[#111] leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif" }}>
                A cultura emocional muda <br className="hidden lg:block"/>
                <span className="text-[#F88A2B]">lentamente e profundamente.</span>
              </h2>
              
              <p className="text-[#666] text-[16px] lg:text-[18px] leading-relaxed max-w-xl font-medium">
                Acompanhamos a evolução coletiva da empresa em equilíbrio, clareza e recuperação emocional ao longo do tempo.
              </p>
            </div>

            <div className="hidden lg:block relative z-10 shrink-0">
                <div className="bg-black/[0.03] backdrop-blur-xl border border-black/5 p-8 rounded-[32px] w-[300px] shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-[#F88A2B]/20 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-[#F88A2B]" />
                        </div>
                        <p className="text-[#111] font-bold">Crescimento</p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F88A2B] w-[85%]" />
                        </div>
                        <p className="text-[#999] text-[10px] font-bold uppercase tracking-widest">+12% vs mês anterior</p>
                    </div>
                </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Timeline */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[12px] font-bold text-[#999] uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Linha do tempo emocional
              </h3>
            </div>

            <div className="relative pl-6 space-y-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-[1.5px] bg-gradient-to-b from-[#F88A2B] via-[#F88A2B]/20 to-transparent" />
              
              {timelineData.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className={`absolute -left-[20px] w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                    item.status === 'highlight' ? 'bg-[#F88A2B] scale-125' : 'bg-[#F88A2B]/30'
                  }`} />
                  
                  <div className="bg-white rounded-[24px] p-6 shadow-sm border border-black/5 hover:border-[#F88A2B]/20 transition-all group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold text-[#F88A2B] uppercase tracking-widest">{item.month}</span>
                      <span className="text-[11px] font-bold text-[#999] uppercase tracking-wider">{item.label}</span>
                    </div>
                    <p className="text-[14px] text-[#666] font-medium leading-relaxed group-hover:text-[#111] transition-colors">
                      {item.insight}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Indicators & AI */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-10">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[12px] font-bold text-[#999] uppercase tracking-wider flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Métricas de Evolução
              </h3>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 space-y-8">
              {indicators.map((indicator, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#999]">{indicator.label}</span>
                    <span className="text-[18px] font-bold text-[#111]">{indicator.value}%</span>
                  </div>
                  <div className="h-1.5 bg-black/[0.03] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${indicator.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-[#F88A2B] rounded-full shadow-[0_0_8px_rgba(248,138,43,0.2)]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Reading */}
            <div className="bg-[#F88A2B05] border border-[#F88A2B10] rounded-[32px] p-8 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <Sparkles className="w-4 h-4 text-[#F88A2B]/30" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-black/5">
                  <Brain className="w-5 h-5 text-[#F88A2B]" />
                </div>
                <h4 className="font-bold text-[#111] text-[15px]">Leitura da IA</h4>
              </div>
              <p className="text-[14px] text-[#666] font-medium leading-relaxed italic">
                “A curva demonstra uma estabilização positiva nos indicadores de saúde emocional coletiva do time este mês.”
              </p>
            </div>

            {/* Transformations Grid */}
            <div className="grid grid-cols-2 gap-3">
              {transformations.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-[20px] border border-black/5 shadow-sm text-center">
                  <p className="text-[11px] font-bold text-[#111] mb-1">{item.title}</p>
                  <p className="text-[10px] text-[#999] font-medium leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <section className="pt-8">
          <div className="bg-white border border-[#E5E0DA] text-[#111] rounded-[40px] p-10 lg:p-14 text-[#111] text-center space-y-8 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-[#F88A2B]/05" />
            <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
              <h3 className="text-3xl lg:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>O verdadeiro impacto aparece na cultura.</h3>
              <p className="text-[#666] text-[16px] lg:text-[18px] leading-relaxed max-w-2xl mx-auto">
                A transformação gradual da forma como a empresa percebe equilíbrio e cuidado coletivo é o nosso maior indicador de sucesso.
              </p>
              
              <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/enterprise/checkin/intro')}
                  className="px-10 h-16 bg-[#F88A2B] text-[#111] rounded-full font-bold text-[15px] shadow-lg shadow-[#F88A2B]/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Continuar jornada
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate('/enterprise')}
                  className="px-10 h-16 bg-black/[0.03] border border-black/5 text-[#111] rounded-full font-bold text-[15px] hover:bg-black/5 transition-all"
                >
                  Voltar ao início
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-10 space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#CCC]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase tracking-widest font-bold">
              Privacidade 100% Protegida
            </p>
          </div>
          <p className="text-[10px] text-[#999] max-w-xs mx-auto leading-relaxed font-medium">
            Todos os indicadores representam apenas tendências coletivas e agregadas do time.
          </p>
        </footer>
      </div>
    </Layout>
  );
};

export default EnterpriseJourneyEvolutionScreen;
