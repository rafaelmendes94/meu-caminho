import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Brain, 
  Eye, 
  Heart, 
  Coffee, 
  MessageCircle, 
  ChevronRight,
  Info,
  BarChart3,
  Lock,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseUserLayout } from "@/components/layouts/EnterpriseUserLayout";
import { EnterpriseRHLayout, EnterpriseRHButton } from "@/components/EnterpriseRHNavigation";

const EnterpriseAIInsightsScreen = () => {
  const navigate = useNavigate();

  const insights = [
    {
      id: 1,
      title: "Mente acelerada aumentou em áreas operacionais.",
      description: "A percepção coletiva de excesso mental cresceu nas últimas duas semanas, especialmente em grupos com maior pressão por entrega.",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      tag: "Alerta Preventivo"
    },
    {
      id: 2,
      title: "Times com maior adesão apresentam mais clareza.",
      description: "Grupos que mantêm rotina consistente de check-in demonstram melhora gradual de equilíbrio emocional.",
      icon: <Sparkles className="w-5 h-5 text-orange-400" />,
      tag: "Padrão Positivo"
    },
    {
      id: 3,
      title: "Existe redução silenciosa de energia em Atendimento.",
      description: "O padrão coletivo sugere aumento de fadiga emocional em períodos de maior demanda.",
      icon: <Brain className="w-5 h-5 text-amber-500" />,
      tag: "Atenção Necessária"
    }
  ];

  const trends = [
    { label: "Pressão por entrega", value: 75, color: "bg-orange-400" },
    { label: "Aceleração mental", value: 62, color: "bg-amber-400" },
    { label: "Necessidade de recuperação", value: 48, color: "bg-orange-500" },
    { label: "Clareza emocional", value: 82, color: "bg-amber-500" },
    { label: "Equilíbrio coletivo", value: 68, color: "bg-orange-300" }
  ];

  const recommendations = [
    { title: "Criar pausas cognitivas em áreas críticas.", icon: <Coffee className="w-5 h-5" /> },
    { title: "Reforçar conversas de escuta com liderança.", icon: <MessageCircle className="w-5 h-5" /> },
    { title: "Estimular conteúdos sobre desaceleração mental.", icon: <Brain className="w-5 h-5" /> },
    { title: "Acompanhar grupos com fadiga crescente.", icon: <Eye className="w-5 h-5" /> }
  ];

  return (
    <EnterpriseUserLayout title="Insights de IA">
      <div className="space-y-8 animate-fade-in py-2 min-h-screen bg-white -mx-4 px-4 lg:mx-0 lg:px-0 pb-20">
        {/* Hero Section */}
        {/* Hero Section */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FDFCFB] border border-black/5 rounded-3xl p-8 text-[#111] relative overflow-hidden shadow-sm"
          >
            {/* Glow and Abstract patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100/50 blur-[60px] -ml-24 -mb-24 rounded-full" />
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 400 400">
                <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="300" cy="150" r="2" fill="white" />
                <circle cx="100" cy="250" r="1.5" fill="white" />
              </svg>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-[#F88A2B]/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-[#F88A2B]" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 border border-black/5 rounded-full text-[10px] text-[#666] tracking-wider uppercase">
                  <ShieldCheck className="w-3 h-3 text-[#F88A2B]" />
                  Agregado e anônimo
                </div>
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl leading-tight text-[#111] font-bold">
                A IA identifica padrões. <br />
                A liderança escolhe como cuidar.
              </h2>
              <p className="text-[#666] text-sm md:text-base leading-relaxed max-w-lg font-medium">
                O Enterprise transforma tendências emocionais coletivas em insights estratégicos para prevenção e equilíbrio organizacional.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Principais Insights */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold tracking-[0.2em] text-[#0B0908]/40 uppercase ml-2 px-1">
            Principais insights desta semana
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-[#E8E2DE] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group cursor-default"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-[#F7F4F2] rounded-2xl group-hover:scale-110 transition-transform">
                    {insight.icon}
                  </div>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 uppercase tracking-wider">
                    {insight.tag}
                  </span>
                </div>
                <h4 className="font-playfair text-lg font-semibold mb-3 leading-snug">
                  {insight.title}
                </h4>
                <p className="text-[#0B0908]/60 text-sm leading-relaxed font-light">
                  {insight.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tendências Emocionais */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold tracking-[0.2em] text-[#0B0908]/40 uppercase">
              Tendências emocionais detectadas
            </h3>
            <BarChart3 className="w-4 h-4 text-[#0B0908]/20" />
          </div>
          <div className="bg-white border border-[#E8E2DE] p-8 rounded-[40px] shadow-sm relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-100 blur-3xl opacity-50" />
            
            <div className="space-y-6 relative z-10">
              {trends.map((trend, index) => (
                <div key={trend.label} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-[#0B0908]/80">{trend.label}</span>
                    <span className="text-[#F88A2B] font-bold">{trend.value}%</span>
                  </div>
                  <div className="h-2 bg-[#F7F4F2] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trend.value}%` }}
                      transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                      className={`h-full ${trend.color} rounded-full relative`}
                    >
                      <div className="absolute inset-0 bg-white/20 blur-[2px]" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leituras sugeridas */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold tracking-[0.2em] text-[#0B0908]/40 uppercase px-1">
            Leituras sugeridas pela IA
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between p-5 bg-white border border-[#E8E2DE] rounded-2xl group transition-all text-left shadow-sm hover:border-[#F88A2B]/30 hover:shadow-lg hover:shadow-orange-500/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#F88A2B] group-hover:bg-[#F88A2B] group-hover:text-white transition-colors">
                    {rec.icon}
                  </div>
                  <span className="text-sm font-semibold text-[#0B0908]/80 leading-snug max-w-[180px]">
                    {rec.title}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0B0908]/20 group-hover:text-[#F88A2B] transition-colors" />
              </motion.button>
            ))}
          </div>
        </section>

        {/* Como os insights são gerados */}
        <section>
          <div className="bg-white/40 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Info className="w-6 h-6 text-[#F88A2B]" />
              </div>
              <div className="space-y-4">
                <h3 className="font-playfair text-xl font-semibold">Como os insights são gerados</h3>
                <p className="text-[#0B0908]/60 text-sm leading-relaxed max-w-lg">
                  A IA analisa apenas padrões coletivos e tendências emocionais agregadas. Conversas individuais, mensagens privadas e respostas pessoais nunca aparecem para o RH.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[
                    { text: "Anonimização automática", icon: <Lock className="w-3 h-3" /> },
                    { text: "Leitura coletiva", icon: <Users className="w-3 h-3" /> },
                    { text: "Proteção individual", icon: <ShieldCheck className="w-3 h-3" /> },
                    { text: "Inferência ética", icon: <Heart className="w-3 h-3" /> }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-[#0B0908]/40 uppercase tracking-wider">
                      <div className="text-[#F88A2B]">{item.icon}</div>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visão Organizacional */}
        <section>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-[#FDFCFB] to-[#F7F4F2] border border-black/5 rounded-[40px] p-10 text-[#111] relative overflow-hidden group shadow-sm"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B]/10 blur-[100px] rounded-full -mr-40 -mt-40" />
            
            <div className="relative z-10 text-center space-y-6 max-w-xl mx-auto">
              <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm mb-2">
                <TrendingUp className="w-6 h-6 text-[#F88A2B]" />
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold">Perceber padrões antes da ruptura.</h2>
              <p className="text-[#666] text-sm md:text-base leading-relaxed font-medium">
                O valor da inteligência emocional organizacional está em agir preventivamente antes que desgaste coletivo se transforme em perda silenciosa.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <EnterpriseRHButton 
                  onClick={() => navigate('/enterprise/rh/impacto')}
                  icon={ChevronRight}
                  className="flex-row-reverse"
                  fullWidth={false}
                >
                  Ver impacto organizacional
                </EnterpriseRHButton>
                <EnterpriseRHButton 
                  onClick={() => navigate('/enterprise/rh/dashboard')}
                  variant="outline"
                  className="text-[#111] border-black/10 hover:bg-black/5"
                  fullWidth={false}
                >
                  Voltar ao dashboard
                </EnterpriseRHButton>
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="text-center px-4">
          <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
            Todos os insights são produzidos a partir de tendências coletivas protegidas por anonimização.
          </p>
        </footer>
      </div>
    </EnterpriseUserLayout>
  );
};

export default EnterpriseAIInsightsScreen;
