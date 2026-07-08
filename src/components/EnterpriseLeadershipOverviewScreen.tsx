import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Brain,
  Heart
} from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";

export default function EnterpriseLeadershipOverviewScreen() {
  const navigate = useNavigate();

  const kpis = [
    { label: "Maturidade emocional", value: "74", icon: Brain },
    { label: "Adesão da empresa", value: "87%", icon: Users },
    { label: "Redução de sobrecarga", value: "-18%", icon: Zap },
    { label: "Clareza coletiva", value: "+12%", icon: Target },
  ];

  const impacts = [
    {
      title: "Maior retenção emocional",
      text: "Grupos com maior equilíbrio apresentam menor desgaste silencioso.",
      icon: Heart
    },
    {
      title: "Melhora de clareza",
      text: "Times emocionalmente organizados tendem a tomar decisões com menos ruído.",
      icon: Sparkles
    },
    {
      title: "Redução de fadiga coletiva",
      text: "A jornada emocional demonstra impacto gradual na recuperação mental.",
      icon: Zap
    },
    {
      title: "Fortalecimento cultural",
      text: "O cuidado emocional começa a se tornar comportamento organizacional.",
      icon: ShieldCheck
    }
  ];

  const attentionAreas = [
    { area: "Operações", label: "pressão contínua" },
    { area: "Atendimento", label: "oscilação emocional" },
    { area: "Tecnologia", label: "recuperação gradual" }
  ];

  const evolutionSteps = [
    "Escuta coletiva",
    "Compreensão emocional",
    "Ação preventiva",
    "Redução de desgaste",
    "Cultura mais sustentável"
  ];

  const indicators = [
    { label: "Equilíbrio coletivo", percentage: 78 },
    { label: "Clareza emocional", percentage: 65 },
    { label: "Energia sustentável", percentage: 82 },
    { label: "Recuperação mental", percentage: 71 }
  ];

  return (
    <EnterpriseRHLayout title="Visão da liderança">
      <div className="space-y-8 animate-fade-in">
        {/* Hero Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-3xl p-8 text-[#111]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/20 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-[#F88A2B]">
              <div className="w-8 h-[1px] bg-[#F88A2B]"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Leitura organizacional</span>
            </div>
            
            <h2 className="font-playfair text-3xl leading-tight">
              Empresas saudáveis emocionalmente sustentam melhor crescimento.
            </h2>
            
            <p className="text-[#666] text-sm leading-relaxed max-w-md">
              O Enterprise transforma sinais emocionais coletivos em clareza estratégica para liderança.
            </p>
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-black/5 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B] mb-1">
                <kpi.icon size={20} />
              </div>
              <span className="text-2xl font-playfair font-bold text-[#0B0908]">{kpi.value}</span>
              <span className="text-[10px] text-black/40 font-bold uppercase tracking-wider leading-tight">
                {kpi.label}
              </span>
            </div>
          ))}
        </section>

        {/* Resumo Estratégico */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">Resumo estratégico</h3>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#F88A2B]"></div>
            <p className="text-[#0B0908] leading-relaxed text-lg font-medium italic">
              “A empresa demonstra evolução consistente em clareza emocional e equilíbrio coletivo. Os principais pontos de atenção continuam relacionados à pressão operacional e aceleração mental em áreas específicas.”
            </p>
          </div>
        </section>

        {/* Impacto Organizacional */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">Impacto organizacional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {impacts.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F88A2B]/5 flex items-center justify-center text-[#F88A2B]">
                  <item.icon size={20} />
                </div>
                <h4 className="font-bold text-[#0B0908]">{item.title}</h4>
                <p className="text-sm text-black/50 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Indicadores Estratégicos */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">Indicadores estratégicos</h3>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 space-y-8">
            {indicators.map((indicator, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-[#0B0908]">{indicator.label}</span>
                  <span className="text-xs font-bold text-[#F88A2B]">{indicator.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-[#F7F4F2] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F88A2B] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${indicator.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Áreas que merecem atenção */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">Áreas que merecem atenção</h3>
          <div className="space-y-3">
            {attentionAreas.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="font-bold text-[#0B0908]">{item.area}</span>
                </div>
                <span className="text-xs text-black/40 lowercase italic">→ {item.label}</span>
              </div>
            ))}
            <p className="text-[10px] text-center text-black/30 pt-2 italic">
              Os recortes aparecem apenas com anonimização automática.
            </p>
          </div>
        </section>

        {/* Visão de Evolução */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-black/40">Visão de evolução</h3>
          <div className="relative pl-8 space-y-8">
            <div className="absolute left-3.5 top-2 bottom-2 w-[1px] bg-black/5"></div>
            {evolutionSteps.map((step, idx) => (
              <div key={idx} className="relative flex items-center gap-4">
                <div className="absolute -left-8 w-7 h-7 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center z-10">
                  <div className={`w-2 h-2 rounded-full ${idx < 3 ? 'bg-[#F88A2B]' : 'bg-black/10'}`}></div>
                </div>
                <span className={`text-sm font-medium ${idx < 3 ? 'text-[#0B0908]' : 'text-black/30'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Leitura da liderança - Dark Footer Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-3xl p-8 text-[#111] text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#F88A2B]/10 to-transparent"></div>
          <div className="relative z-10 space-y-4">
            <h3 className="font-playfair text-2xl">O objetivo não é controlar emoções.</h3>
            <p className="text-[#666] text-sm leading-relaxed">
              O Enterprise ajuda lideranças a perceber sinais coletivos antes que desgaste emocional se transforme em perda silenciosa, baixa clareza ou ruptura cultural.
            </p>
          </div>
        </section>

        {/* CTAs */}
        <section className="flex flex-col gap-3 pt-4">
          <EnterpriseRHButton 
            onClick={() => navigate("/enterprise/rh/impacto")}
            icon={TrendingUp}
            className="flex-row-reverse"
          >
            Ver impacto organizacional
          </EnterpriseRHButton>

          <EnterpriseRHButton 
            onClick={() => navigate("/enterprise/rh/benchmark")}
            variant="secondary"
            icon={ArrowRight}
            className="flex-row-reverse"
          >
            Ver benchmark emocional
          </EnterpriseRHButton>
          
          <EnterpriseRHButton 
            onClick={() => navigate("/enterprise/rh/relatorio")}
            variant="outline"
          >
            Voltar ao relatório
          </EnterpriseRHButton>
        </section>

        {/* Footer info */}
        <footer className="text-center pt-8 pb-12">
          <div className="flex items-center justify-center gap-2 text-black/30 mb-2">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Protocolo de Segurança</span>
          </div>
          <p className="text-[10px] text-black/30 leading-relaxed max-w-[240px] mx-auto uppercase tracking-tighter">
            Todos os indicadores são coletivos, anônimos e protegidos por anonimização automática.
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
}
