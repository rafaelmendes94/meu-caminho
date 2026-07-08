import { useNavigate } from "react-router-dom";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Tv, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseDesktopResponsiveScreen = () => {
  const navigate = useNavigate();

  const breakpoints = [
    {
      id: "mobile",
      title: "Mobile",
      range: "Até 767px",
      use: "Colaborador, check-ins, leitura rápida",
      icon: <Smartphone className="w-6 h-6" />,
      color: "from-amber-500/20 to-orange-500/20"
    },
    {
      id: "tablet",
      title: "Tablet",
      range: "768px – 1023px",
      use: "RH em movimento, revisão de painéis",
      icon: <Tablet className="w-6 h-6" />,
      color: "from-orange-500/20 to-red-500/20"
    },
    {
      id: "desktop",
      title: "Desktop",
      range: "1024px – 1439px",
      use: "Análise RH completa",
      icon: <Monitor className="w-6 h-6" />,
      color: "from-orange-400/20 to-amber-400/20"
    },
    {
      id: "large",
      title: "Large Desktop",
      range: "1440px+",
      use: "Reuniões executivas, diretoria e apresentações",
      icon: <Tv className="w-6 h-6" />,
      color: "from-amber-400/20 to-orange-600/20"
    }
  ];

  const hierarchies = [
    { title: "Hero estratégico primeiro", description: "O impacto visual e a mensagem central dominam o topo." },
    { title: "KPIs em leitura horizontal", description: "Aproveitamento da largura para métricas comparativas." },
    { title: "Insights em cards amplos", description: "Espaço para análise profunda sem poluição visual." },
    { title: "Decisões sugeridas sempre visíveis", description: "Ações rápidas priorizadas na hierarquia de leitura." },
    { title: "Privacidade como camada constante", description: "Garantia visual de segurança em todos os níveis." }
  ];

  return (
    <EnterpriseRHLayout title="Responsividade Enterprise">
      <main className="max-w-[1440px] mx-auto px-6 py-8 space-y-12">
        {/* Hero Card */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-12 overflow-hidden text-[#111]"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/10 blur-[100px] rounded-full -mr-48 -mt-48" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 backdrop-blur-md rounded-full mb-6 border border-black/5">
                <Sparkles className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-xs font-bold uppercase tracking-widest italic">Board-room ready</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair mb-6 leading-tight">
                Desktop não é uma versão ampliada. <br />
                <span className="text-[#F88A2B]">É uma sala de decisão.</span>
              </h2>
              <p className="text-lg text-[#444] font-light leading-relaxed">
                O módulo RH precisa respirar em telas grandes, com hierarquia, leitura executiva e clareza estratégica.
              </p>
            </div>
            {/* Organic lines decoration */}
            <div className="absolute bottom-0 right-0 p-8 opacity-20 pointer-events-none">
              <div className="w-64 h-64 border-t-2 border-r-2 border-[#F88A2B] rounded-tr-[100px]" />
            </div>
          </motion.div>
        </section>

        {/* Breakpoints */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-playfair font-bold">Breakpoints principais</h3>
            <div className="h-px flex-1 bg-black/5 mx-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {breakpoints.map((bp) => (
              <motion.div 
                key={bp.id}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 flex flex-col items-center text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bp.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {bp.icon}
                </div>
                <h4 className="text-lg font-bold mb-1">{bp.title}</h4>
                <p className="text-xs font-bold text-[#F88A2B] uppercase tracking-widest mb-4">{bp.range}</p>
                <div className="h-px w-12 bg-black/10 mb-4" />
                <p className="text-sm text-black/60 leading-relaxed">{bp.use}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Layout Desktop Recommended */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-playfair font-bold">Layout desktop recomendado</h3>
            <div className="h-px flex-1 bg-black/5 mx-6" />
          </div>
          
          <div className="bg-white rounded-[2.5rem] p-4 lg:p-8 shadow-sm border border-black/5">
            <div className="mb-8 text-center max-w-xl mx-auto">
              <p className="text-sm text-black/60">
                “Em desktop, o conteúdo deve priorizar leitura estratégica e não apenas empilhar cards.”
              </p>
            </div>

            {/* Visual Mock of Layout */}
            <div className="aspect-video bg-[#F7F4F2] rounded-3xl overflow-hidden border border-black/5 flex shadow-inner">
              {/* Sidebar Mock */}
              <div className="w-16 lg:w-48 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] h-full p-4 flex flex-col gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#F88A2B] mx-auto lg:mx-0" />
                <div className="space-y-3 mt-8">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black/[0.03] mx-auto lg:mx-0" />
                      <div className="hidden lg:block h-2 flex-1 bg-black/5 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Main Content Mock */}
              <div className="flex-1 h-full p-6 space-y-6 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-32 bg-black/10 rounded-full" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-black/5" />
                    <div className="w-8 h-8 rounded-lg bg-black/5" />
                  </div>
                </div>
                {/* Hero Area Mock */}
                <div className="h-32 bg-white rounded-2xl shadow-sm border border-black/5 p-4 flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-2/3 bg-black/5 rounded-full" />
                    <div className="h-2 w-1/2 bg-black/5 rounded-full" />
                    <div className="h-8 w-24 bg-[#F88A2B]/10 rounded-lg mt-4" />
                  </div>
                  <div className="w-32 h-full bg-[#F88A2B]/5 rounded-xl" />
                </div>
                {/* Grid Mock */}
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-white rounded-xl shadow-sm border border-black/5" />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 h-full">
                  <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-black/5" />
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Executivo Rules */}
        <section className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-12 text-[#111]">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-playfair mb-12 text-center italic">Grid executivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="space-y-2">
                <p className="text-[#F88A2B] text-xs font-bold uppercase tracking-widest">Container Máximo</p>
                <p className="text-2xl font-light">1440px</p>
              </div>
              <div className="space-y-2">
                <p className="text-[#F88A2B] text-xs font-bold uppercase tracking-widest">Sidebar</p>
                <p className="text-2xl font-light">280px</p>
              </div>
              <div className="space-y-2">
                <p className="text-[#F88A2B] text-xs font-bold uppercase tracking-widest">Grid System</p>
                <p className="text-2xl font-light">12 colunas</p>
              </div>
              <div className="space-y-2">
                <p className="text-[#F88A2B] text-xs font-bold uppercase tracking-widest">Gutters</p>
                <p className="text-2xl font-light italic">Generosos</p>
              </div>
            </div>
            <div className="mt-12 h-px bg-black/5" />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-[#777]">
              <p>• Cards principais: 6 ou 12 colunas</p>
              <p>• KPIs: 3 colunas cada</p>
              <p>• Relatórios: 8 + 4 colunas</p>
            </div>
          </div>
        </section>

        {/* Visual Hierarchy */}
        <section className="space-y-6">
          <h3 className="text-2xl font-playfair font-bold">Hierarquia visual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hierarchies.map((h, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#F88A2B]/10 text-[#F88A2B] flex items-center justify-center font-bold text-xs mb-4">
                  0{i + 1}
                </div>
                <h4 className="font-bold mb-2">{h.title}</h4>
                <p className="text-sm text-black/60 leading-relaxed">{h.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Composition Example Mock */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-playfair font-bold">Exemplo de composição desktop</h3>
            <div className="h-px flex-1 bg-black/5 mx-6" />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Hero Mock */}
            <div className="col-span-12 lg:col-span-8 h-64 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-3xl p-8 text-[#111] relative overflow-hidden flex flex-col justify-end">
               <div className="absolute top-0 right-0 p-8 opacity-20">
                 <BrainCircuit className="w-24 h-24 text-[#F88A2B]" />
               </div>
               <h4 className="text-3xl font-playfair mb-2 italic">Saúde Emocional</h4>
               <p className="text-sm text-[#666]">Análise de IA identificou aumento de 12% no engajamento.</p>
            </div>
            
            {/* Privacy Card Mock */}
            <div className="col-span-12 lg:col-span-4 h-64 bg-white rounded-3xl p-8 border border-black/5 shadow-sm flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-12 h-12 text-[#F88A2B] mb-4" />
              <h4 className="font-bold mb-2 uppercase text-xs tracking-widest text-[#F88A2B]">Segurança Máxima</h4>
              <p className="text-sm text-black/60">Dados anonimizados e protegidos.</p>
            </div>

            {/* KPIs */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="col-span-6 lg:col-span-3 h-32 bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex flex-col justify-between">
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Métrica 0{i}</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-playfair">92.4%</span>
                  <div className="w-8 h-4 bg-green-500/10 text-green-600 rounded text-[10px] flex items-center justify-center font-bold">
                    +4%
                  </div>
                </div>
              </div>
            ))}

            {/* Organic Chart Mock */}
            <div className="col-span-12 lg:col-span-9 h-80 bg-white rounded-3xl border border-black/5 shadow-sm p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-bold italic">Curva de Evolução Organizacional</h4>
                <BarChart3 className="w-5 h-5 text-black/20" />
              </div>
              <div className="flex-1 flex items-end gap-2 px-4">
                {[40, 60, 45, 70, 85, 65, 90, 80, 95, 85, 100, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#F88A2B]/10 rounded-t-lg transition-all hover:bg-[#F88A2B]/30 cursor-pointer" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Insights Lateral */}
            <div className="col-span-12 lg:col-span-3 h-80 bg-white rounded-3xl border border-black/5 shadow-sm p-6 flex flex-col gap-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-black/40">Insights da IA</h4>
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 p-3 bg-black/[0.02] rounded-xl hover:bg-black/[0.04] transition-colors cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-[#F88A2B] mt-1" />
                  <p className="text-xs leading-relaxed text-black/70">Novo insight sobre equilíbrio trabalho-vida detectado...</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Adaptation */}
        <section>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-[2.5rem] p-12 border border-black/5 shadow-sm overflow-hidden relative"
          >
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#F88A2B]/5 rounded-full blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-playfair mb-6 leading-tight italic">No mobile, <br /> tudo volta a ser jornada.</h3>
                <p className="text-black/60 leading-relaxed mb-8">
                  Cards devem empilhar com respiro, CTAs devem ficar dentro do fluxo e nenhum elemento pode bloquear o scroll.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/[0.02] rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] mb-2">Regra 01</p>
                    <p className="text-xs font-bold italic">Sem h-screen</p>
                  </div>
                  <div className="p-4 bg-black/[0.02] rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] mb-2">Regra 02</p>
                    <p className="text-xs font-bold italic">Scroll livre</p>
                  </div>
                  <div className="p-4 bg-black/[0.02] rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] mb-2">Regra 03</p>
                    <p className="text-xs font-bold italic">PB-32 constante</p>
                  </div>
                  <div className="p-4 bg-black/[0.02] rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] mb-2">Regra 04</p>
                    <p className="text-xs font-bold italic">Sidebar vira Sheet</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-[400px] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[3rem] p-4 border-4 border-[#0B0908] shadow-2xl relative overflow-hidden">
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                  <div className="space-y-4">
                    <div className="h-24 bg-black/5 rounded-2xl" />
                    <div className="h-24 bg-black/5 rounded-2xl" />
                    <div className="h-24 bg-black/5 rounded-2xl" />
                    <div className="h-24 bg-black/5 rounded-2xl" />
                  </div>
                  <div className="absolute bottom-6 left-4 right-4 h-12 bg-[#F88A2B] rounded-2xl" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Presentation Mode */}
        <section>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-12 text-center text-[#111] relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#F88A2B]/20 blur-[120px] rounded-full -mt-40" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl font-playfair mb-6 italic">
                Quando projetado em tela grande, o Enterprise deve parecer uma leitura de diretoria.
              </h3>
              <p className="text-[#666] leading-relaxed mb-12">
                Use menos cards, mais espaço, títulos editoriais e gráficos orgânicos. O objetivo é gerar clareza, não quantidade de informação.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/enterprise/rh')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#F88A2B] text-[#111] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#e07b25] transition-all active:scale-95"
                >
                  Voltar ao módulo RH
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/enterprise/rh/dashboard')}
                  className="w-full sm:w-auto px-8 py-4 bg-black/5 text-[#111] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95 border border-black/5"
                >
                  Abrir Dashboard RH
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseDesktopResponsiveScreen;
