import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Target, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Zap,
  BarChart3,
  Heart,
  FileText,
  ChevronRight,
  LineChart,
  LayoutDashboard
} from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";
import { useToast } from "@/hooks/use-toast";

const EnterpriseImpactScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGenerateReport = () => {
    toast({
      title: "Resumo executivo preparado",
      description: "O arquivo foi gerado e está pronto para visualização.",
    });
  };

  const kpis = [
    { value: "-22%", label: "Sobrecarga coletiva", icon: Zap },
    { value: "+18%", label: "Clareza emocional", icon: Sparkles },
    { value: "+26%", label: "Engajamento na jornada", icon: Target },
    { value: "+14%", label: "Percepção de equilíbrio", icon: Heart }
  ];

  const impactPoints = [
    "Maior recuperação emocional entre ciclos intensos",
    "Redução gradual de desgaste silencioso",
    "Mais clareza coletiva em áreas críticas",
    "Maior abertura para conversas emocionais"
  ];

  const evolutionData = [
    { month: "Janeiro", value: 61 },
    { month: "Fevereiro", value: 64 },
    { month: "Março", value: 68 },
    { month: "Abril", value: 71 },
    { month: "Maio", value: 74 }
  ];

  const dimensions = [
    { name: "Equilíbrio emocional", value: 82, desc: "Estabilidade e resiliência em situações de pressão." },
    { name: "Energia sustentável", value: 76, desc: "Manutenção do vigor mental ao longo da semana." },
    { name: "Clareza coletiva", value: 88, desc: "Capacidade de tomada de decisão sob estresse." },
    { name: "Recuperação mental", value: 71, desc: "Velocidade de retorno ao estado de calma após picos." },
    { name: "Percepção de apoio", value: 94, desc: "Sentimento de suporte emocional na cultura organizacional." }
  ];

  const culturalEffects = [
    "Mais consciência emocional coletiva",
    "Maior abertura para escuta",
    "Lideranças mais preventivas",
    "Cultura menos reativa"
  ];

  return (
    <EnterpriseRHLayout title="Impacto organizacional">
      <div className="space-y-8 animate-fade-in">
        {/* Hero Card */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-10 md:p-14 text-[#111] shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B] opacity-10 blur-[100px] -mr-40 -mt-40"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-[#F88A2B]">
              <FileText size={18} />
              <span className="text-[11px] uppercase font-bold tracking-[0.2em] font-montserrat">Leitura estratégica</span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-5xl leading-tight font-bold max-w-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              O cuidado emocional coletivo também gera sustentabilidade organizacional.
            </h2>
            
            <p className="text-[#666] font-light leading-relaxed text-lg max-w-2xl font-montserrat">
              O Enterprise ajuda a transformar percepção emocional em prevenção, clareza e fortalecimento cultural.
            </p>
            
            <div className="pt-8 border-t border-black/5 flex items-center justify-between">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[#F88A2B]/40 to-transparent mr-6"></div>
              <Sparkles className="text-[#F88A2B]/40" size={20} />
            </div>
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-white/60 flex flex-col items-center text-center space-y-3 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]">
                <kpi.icon size={24} />
              </div>
              <div className="font-serif text-3xl font-bold text-[#0B0908]" style={{ fontFamily: "'Playfair Display', serif" }}>{kpi.value}</div>
              <div className="text-[12px] text-gray-500 font-bold uppercase tracking-widest font-montserrat leading-tight">{kpi.label}</div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Impact Percebido */}
          <section className="space-y-6">
            <h3 className="font-serif text-xl md:text-2xl px-2 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Impacto percebido na organização</h3>
            <div className="grid grid-cols-1 gap-4">
              {impactPoints.map((point, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-white/60 flex items-center gap-5 group hover:border-[#F88A2B]/30 transition-all">
                  <div className="w-3 h-3 rounded-full bg-[#F88A2B]/20 group-hover:bg-[#F88A2B] transition-colors shrink-0 shadow-[0_0_8px_rgba(248,138,43,0)] group-hover:shadow-[0_0_8px_rgba(248,138,43,0.4)]"></div>
                  <p className="text-base font-medium text-gray-700 font-montserrat group-hover:text-[#0B0908] transition-colors">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Evolução Emocional - Graph Mock */}
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-white/60 space-y-8 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl md:text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Evolução emocional da empresa</h3>
              <LineChart className="text-[#F88A2B]" size={24} />
            </div>
            
            <div className="relative flex-1 flex items-end justify-between px-4 pb-4 min-h-[200px]">
              {evolutionData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-4 group w-full">
                  <div className="relative w-full flex flex-col items-center">
                    <div 
                      className="w-12 bg-[#F88A2B]/5 rounded-t-xl group-hover:bg-[#F88A2B]/10 transition-all duration-500"
                      style={{ height: `${d.value * 1.8}px` }}
                    ></div>
                    <div 
                      className="absolute bottom-0 w-12 bg-[#F88A2B] rounded-t-xl transition-all duration-700 delay-100 shadow-[0_0_20px_rgba(248,138,43,0.2)]"
                      style={{ height: `${(d.value - 40) * 1.8}px` }}
                    ></div>
                    <div className="absolute -top-8 text-[12px] font-bold text-[#F88A2B] opacity-0 group-hover:opacity-100 transition-opacity font-montserrat">
                      {d.value}%
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest font-montserrat">{d.month.substring(0, 3)}</span>
                </div>
              ))}
            </div>
            
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed text-center italic font-montserrat pt-4 border-t border-[#F7F4F2]">
              “A empresa demonstra evolução contínua de equilíbrio e clareza coletiva.”
            </p>
          </section>
        </div>

        {/* Impacto por Dimensão */}
        <section className="space-y-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-white/60">
          <h3 className="font-serif text-2xl font-bold text-[#0B0908]" style={{ fontFamily: "'Playfair Display', serif" }}>Impacto por dimensão</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {dimensions.map((dim, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#0B0908] font-montserrat uppercase tracking-wider text-[11px]">{dim.name}</span>
                  <span className="text-lg font-bold text-[#F88A2B] font-montserrat">{dim.value}%</span>
                </div>
                <div className="h-2 w-full bg-[#F7F4F2] rounded-full overflow-hidden ring-1 ring-black/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#F88A2B] to-[#ffb36e] rounded-full shadow-[0_0_10px_rgba(248,138,43,0.3)] transition-all duration-1000"
                    style={{ width: `${dim.value}%` }}
                  ></div>
                </div>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed font-montserrat">{dim.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Leitura Executiva Card */}
        <section className="bg-white p-10 rounded-[2.5rem] border-l-8 border-[#F88A2B] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={20} className="text-[#F88A2B]" />
            <h3 className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#F88A2B] font-montserrat">Leitura executiva</h3>
          </div>
          <p className="font-serif text-2xl leading-relaxed text-[#0B0908] italic" style={{ fontFamily: "'Playfair Display', serif" }}>
            “O principal impacto observado está relacionado à redução gradual de aceleração mental contínua e aumento de percepção de clareza emocional em grupos com maior adesão à jornada.”
          </p>
        </section>

        {/* Efeito Cultural Grid */}
        <section className="space-y-6">
          <h3 className="font-serif text-xl md:text-2xl px-2 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Efeito cultural</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {culturalEffects.map((effect, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-white/60 flex flex-col gap-4 group hover:border-[#F88A2B]/40 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B] group-hover:bg-[#F88A2B] group-hover:text-[#111] transition-all">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-[12px] font-bold text-gray-700 leading-tight uppercase tracking-widest font-montserrat">{effect}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Valor Estratégico Section */}
        <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-12 md:p-20 text-[#111] text-center space-y-10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F88A2B]/10 opacity-50"></div>
          
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl md:text-5xl leading-tight font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Prevenir desgaste custa menos do que reparar ruptura.
            </h2>
            <p className="text-[#777] font-light leading-relaxed text-lg font-montserrat">
              Empresas emocionalmente mais organizadas tendem a sustentar melhor clareza, retenção, recuperação e estabilidade cultural.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
            {['prevenção', 'cultura', 'clareza', 'sustentabilidade'].map((tag) => (
              <div key={tag} className="flex flex-col items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#F88A2B] shadow-[0_0_15px_rgba(248,138,43,0.8)]"></div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#999] font-bold font-montserrat">{tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <EnterpriseRHButton 
            onClick={handleGenerateReport}
            icon={BarChart3}
            className="flex-row-reverse"
          >
            Gerar visão para diretoria
          </EnterpriseRHButton>
          
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            variant="secondary"
            icon={LayoutDashboard}
          >
            Voltar ao dashboard
          </EnterpriseRHButton>
        </section>

        {/* Footer */}
        <footer className="text-center pb-12 opacity-60">
          <p className="text-[11px] text-gray-500 font-bold font-montserrat max-w-md mx-auto leading-relaxed uppercase tracking-widest">
            Todos os indicadores são coletivos, anônimos e protegidos por anonimização automática.
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseImpactScreen;
