import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Target, 
  Zap,
  CheckCircle2,
  LineChart,
  FileText
} from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";
import { toast } from "@/components/ui/use-toast";

const EnterpriseBenchmarkScreen = () => {
  const navigate = useNavigate();

  const handleGenerateExecutiveView = () => {
    toast({
      title: "Visão executiva preparada.",
      description: "O documento foi gerado com sucesso.",
    });
  };

  const benchmarkData: Array<{ label: string; value: number; benchmark: number; unit: string; inverse?: boolean }> = [];
  const strengths: string[] = [];
  const opportunities: string[] = [];
  const historyData: Array<{ month: string; value: number }> = [];
  const maturityScore: number | null = null;
  const maturityDeltaLabel: string | null = null;

  return (
    <EnterpriseRHLayout title="Comparativo interno por segmento">
      <div className="space-y-8 animate-fade-in">
        {/* HERO CARD */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-10 blur-[100px] -mr-32 -mt-32 rounded-full transition-all duration-700 group-hover:opacity-20" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#F88A2B]/20 px-3 py-1 rounded-full border border-[#F88A2B]/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider">Dados coletivos internos</span>
                </div>
              </div>
              <h2 className="text-3xl font-playfair text-[#111] leading-tight">
                O equilíbrio emocional também constrói cultura.
              </h2>
              <p className="text-[#F7F4F2]/70 text-sm leading-relaxed max-w-[90%]">
                Compare a evolução dos segmentos internos da própria organização em clareza, equilíbrio e sustentabilidade emocional. Não é benchmark de mercado.
              </p>
              
              <div className="pt-4 border-t border-black/5 mt-6">
                <div className="h-1.5 w-full bg-black/[0.03] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#F88A2B] to-[#F88A2B]/60 w-[74%]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MATURIDADE EMOCIONAL SECTION */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">
            Maturidade emocional da empresa
          </h3>
          <div className="bg-white rounded-3xl p-8 border border-[#0B0908]/5 flex flex-col items-center text-center space-y-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Outer Ring */}
              <svg className="absolute w-full h-full rotate-[-90deg]">
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  stroke="#F7F4F2"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  stroke="url(#indicator-gradient)"
                  strokeWidth="12"
                  strokeDasharray="464.95"
                  strokeDashoffset={464.95 * (1 - ((maturityScore ?? 0) / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="indicator-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F88A2B" />
                    <stop offset="100%" stopColor="#F88A2B" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="relative z-10">
                <span className="text-5xl font-playfair font-bold text-[#0B0908]">{maturityScore ?? "—"}</span>
                <span className="text-[#0B0908]/30 text-lg">/100</span>
              </div>
            </div>

            <div className="space-y-2">
              {maturityDeltaLabel ? (
                <div className="flex items-center justify-center gap-2 text-[#F88A2B]">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold">{maturityDeltaLabel}</span>
                </div>
              ) : null}
              <p className="text-[#0B0908]/60 text-sm leading-relaxed">
                {maturityScore == null
                  ? "Ainda não há maturidade emocional consolidada para esta organização."
                  : "Leitura agregada da maturidade emocional coletiva."}
              </p>
            </div>
          </div>
        </section>

        {/* COMPARATIVO ORGANIZACIONAL */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">
            Comparativo organizacional
          </h3>
          {benchmarkData.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-[#0B0908]/5 text-[13px] text-[#666]">
              Sem indicadores comparativos disponíveis. Assim que houver volume mínimo por segmento interno, o comparativo aparece aqui.
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benchmarkData.map((item, index) => (
              <div key={index} className="bg-white rounded-3xl p-6 border border-[#0B0908]/5 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-[#0B0908]/80">{item.label}</span>
                  <BarChart3 className="w-4 h-4 text-[#0B0908]/20" />
                </div>
                
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-playfair font-bold text-[#0B0908]">
                    {item.value}{item.unit}
                  </span>
                  <div className="flex flex-col mb-1">
                    <span className="text-[10px] text-[#0B0908]/40 uppercase tracking-tighter">Empresa</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#0B0908]/5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#0B0908]/40 uppercase tracking-wider font-bold">Referência interna</span>
                    <span className="font-bold text-[#0B0908]/80">{item.benchmark}{item.unit}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F7F4F2] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.inverse 
                          ? (item.value <= item.benchmark ? 'bg-green-400' : 'bg-[#F88A2B]/40')
                          : (item.value >= item.benchmark ? 'bg-[#F88A2B]' : 'bg-[#F88A2B]/40')
                      }`}
                      style={{ width: `${(item.value / (item.value + item.benchmark)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </section>

        {/* PONTOS FORTES CULTURAIS */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">
            Pontos fortes culturais
          </h3>
          {strengths.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 border border-[#0B0908]/5 text-[13px] text-[#666]">
              Sem pontos fortes consolidados no período.
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strengths.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 border border-[#0B0908]/5 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm font-medium text-[#0B0908]/80 leading-relaxed pt-1">
                  {item}
                </p>
              </div>
            ))}
          </div>
          )}
        </section>

        {/* OPORTUNIDADES DE EVOLUÇÃO */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">
            Oportunidades de evolução
          </h3>
          {opportunities.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 border border-[#0B0908]/5 text-[13px] text-[#666]">
              Sem oportunidades consolidadas no período.
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {opportunities.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 border border-[#0B0908]/5 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#F88A2B]/5 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-[#F88A2B]" />
                </div>
                <p className="text-sm font-medium text-[#0B0908]/80 leading-relaxed pt-1">
                  {item}
                </p>
              </div>
            ))}
          </div>
          )}
        </section>

        {/* EVOLUÇÃO HISTÓRICA */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">
            Evolução histórica
          </h3>
          <div className="bg-white rounded-3xl p-8 border border-[#0B0908]/5 space-y-8">
            {historyData.length === 0 ? (
              <p className="text-[13px] text-[#666]">
                Sem histórico consolidado ainda. A evolução aparece após múltiplos ciclos de agregados internos.
              </p>
            ) : (
            <div className="h-48 w-full flex items-end justify-between gap-2 px-2">
              {historyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="relative w-full flex flex-col items-center">
                    <div className="absolute -top-8 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Score: {data.value}
                    </div>
                    <div 
                      className="w-full max-w-[40px] bg-gradient-to-t from-[#F88A2B]/40 to-[#F88A2B] rounded-t-xl transition-all duration-700 ease-out"
                      style={{ height: `${(data.value / 100) * 160}px` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#0B0908]/30 uppercase rotate-[-45deg] origin-top-left mt-2">
                    {data.month.substring(0, 3)}
                  </span>
                </div>
              ))}
            </div>
            )}
            
            <div className="pt-6 border-t border-[#0B0908]/5 flex items-start gap-4">
              <LineChart className="w-5 h-5 text-[#F88A2B] mt-0.5" />
              <p className="text-xs text-[#0B0908]/60 leading-relaxed">
                Leitura consolidada da evolução da maturidade emocional coletiva ao longo do tempo.
              </p>
            </div>
          </div>
        </section>

        {/* LEITURA EXECUTIVA */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-1/2 left-0 w-32 h-32 bg-[#F88A2B] opacity-5 blur-[60px] rounded-full" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-black/[0.03] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#F88A2B]" />
                </div>
                <h4 className="text-lg font-playfair text-[#111]">
                  Empresas emocionalmente saudáveis sustentam melhor performance.
                </h4>
              </div>
              <p className="text-[#F7F4F2]/60 text-sm leading-relaxed">
                Quando equilíbrio, clareza e recuperação emocional crescem juntos, a cultura tende a reduzir desgaste silencioso e fortalecer retenção sustentável.
              </p>
              
              <div className="pt-6 flex flex-col gap-3">
                <EnterpriseRHButton 
                  onClick={handleGenerateExecutiveView}
                  icon={FileText}
                >
                  Gerar visão executiva
                </EnterpriseRHButton>
                <EnterpriseRHButton 
                  onClick={() => navigate('/enterprise/rh/relatorio')}
                  variant="outline"
                  className="text-[#111] border-black/10 hover:bg-black/[0.03]"
                >
                  Voltar ao relatório
                </EnterpriseRHButton>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center py-6">
          <p className="text-[10px] text-[#0B0908]/40 uppercase tracking-widest leading-relaxed max-w-[80%] mx-auto">
            Comparativo interno agregado e anonimizado. Não representa benchmark de mercado ou entre organizações.
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseBenchmarkScreen;