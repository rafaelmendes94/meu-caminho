import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  FileText, 
  Presentation, 
  Table, 
  Download, 
  Calendar, 
  Shield, 
  Lock, 
  ArrowRight, 
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseExportsScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const formats = [
    {
      id: "pdf",
      title: "Relatório executivo PDF",
      description: "Síntese mensal com KPIs, evolução, áreas de atenção e recomendações.",
      icon: <FileText className="w-6 h-6 text-orange-500" />,
      buttonText: "Exportar PDF"
    },
    {
      id: "board",
      title: "Board Report",
      description: "Versão resumida para reuniões de diretoria.",
      icon: <ShieldCheck className="w-6 h-6 text-orange-500" />,
      buttonText: "Gerar board report"
    },
    {
      id: "slides",
      title: "Apresentação para liderança",
      description: "Slides prontos com leitura executiva e recomendações estratégicas.",
      icon: <Presentation className="w-6 h-6 text-orange-500" />,
      buttonText: "Gerar apresentação"
    },
    {
      id: "csv",
      title: "CSV agregado",
      description: "Dados coletivos para análise interna, sem identificação individual.",
      icon: <Table className="w-6 h-6 text-orange-500" />,
      buttonText: "Exportar CSV"
    }
  ];

  const periods = [
    { id: "week", label: "semana atual" },
    { id: "month", label: "mês atual" },
    { id: "quarter", label: "trimestre" },
    { id: "custom", label: "período personalizado" }
  ];

  const history = [
    { id: 1, name: "Relatório executivo", date: "Maio 2026", format: "PDF" },
    { id: 2, name: "Board Report", date: "Abril 2026", format: "PDF" },
    { id: 3, name: "CSV agregado", date: "Março 2026", format: "CSV" }
  ];

  const includedItems = [
    "maturidade emocional coletiva",
    "adesão ao check-in",
    "evolução de clareza e equilíbrio",
    "áreas em atenção",
    "temas recorrentes agregados",
    "recomendações estratégicas",
    "proteção de anonimato"
  ];

  const handleGenerate = () => {
    toast({
      title: "Processando exportação",
      description: "Exportação preparada com segurança.",
      duration: 3000,
    });
  };

  return (
    <EnterpriseRHLayout title="Exportações">
      <div className="space-y-8 animate-fade-in py-2">
        {/* Hero Section */}
        <section className="mt-4">
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] rounded-full filter blur-[100px] opacity-20 -mr-20 -mt-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-black/5 backdrop-blur-md rounded-full border border-black/5">
                  <span className="text-[#333] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-3 h-3 text-[#F88A2B]" />
                    Selo: Sem dados individuais
                  </span>
                </div>
              </div>
              
              <h2 className="text-3xl font-playfair text-[#111] mb-4 leading-tight">
                Relatórios que levam cuidado emocional para a decisão estratégica.
              </h2>
              <p className="text-[#666] text-sm leading-relaxed max-w-md">
                Exporte leituras agregadas e anônimas para liderança, diretoria e acompanhamento organizacional.
              </p>
            </div>
          </div>
        </section>

        {/* Format Selection */}
        <section>
          <h3 className="text-lg font-playfair font-bold mb-4 px-1">Formatos disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formats.map((format) => (
              <div 
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                  selectedFormat === format.id 
                  ? "bg-white border-[#F88A2B] shadow-lg scale-[1.02]" 
                  : "bg-black/[0.03]0 border-transparent hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-orange-50 rounded-2xl">
                    {format.icon}
                  </div>
                  {selectedFormat === format.id && (
                    <div className="w-5 h-5 bg-[#F88A2B] rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#111]" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold mb-2 text-[#0B0908]">{format.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {format.description}
                </p>
                <button 
                  className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                    selectedFormat === format.id ? "text-[#F88A2B]" : "text-gray-400"
                  }`}
                >
                  {format.buttonText}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Period Selection */}
        <section className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Período do relatório
          </h3>
          <div className="flex flex-wrap gap-3">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedPeriod === period.id
                  ? "bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] shadow-md"
                  : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </section>

        {/* What will be included */}
        <section className="bg-white p-8 rounded-3xl shadow-sm">
          <h3 className="text-lg font-playfair font-bold mb-6">O que será incluído</h3>
          <div className="space-y-4">
            {includedItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="w-2 h-2 rounded-full bg-[#F88A2B]/40 group-hover:bg-[#F88A2B] transition-colors"></div>
                <span className="text-sm text-gray-600 group-hover:text-[#0B0908] transition-colors">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* History */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-playfair font-bold">Histórico de exportações</h3>
            <span className="text-xs text-gray-400 font-medium">Últimos 30 dias</span>
          </div>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm border border-transparent hover:border-orange-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">{item.name}</h5>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{item.date}</span>
                      <span className="text-[10px] text-orange-400 font-bold uppercase">{item.format}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-orange-50 rounded-full text-gray-400 hover:text-[#F88A2B] transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Protection */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#F88A2B] rounded-full filter blur-[80px] opacity-10 -mb-20 -mr-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#F88A2B]" />
                </div>
                <h3 className="text-lg font-playfair text-[#111]">Nenhuma exportação contém dados individuais.</h3>
              </div>
              
              <p className="text-[#666] text-xs leading-relaxed mb-6">
                Arquivos exportados incluem apenas indicadores coletivos, agregados e protegidos por anonimização automática.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#F88A2B]" />
                  <span className="text-[10px] text-[#333] font-medium uppercase tracking-wider">sem nomes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#F88A2B]" />
                  <span className="text-[10px] text-[#333] font-medium uppercase tracking-wider">sem respostas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#F88A2B]" />
                  <span className="text-[10px] text-[#333] font-medium uppercase tracking-wider">sem conversas IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#F88A2B]" />
                  <span className="text-[10px] text-[#333] font-medium uppercase tracking-wider">sem scores</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Actions */}
        <section className="space-y-4 pt-4">
          <button 
            onClick={handleGenerate}
            className="w-full h-16 bg-[#F88A2B] text-[#111] rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            Gerar exportação
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => navigate("/enterprise/rh/privacidade")}
            className="w-full py-4 text-gray-500 font-bold text-xs uppercase tracking-[0.2em] hover:text-[#0B0908] transition-colors"
          >
            Configurar privacidade
          </button>
        </section>

        {/* Footer info */}
        <footer className="pt-4 pb-12">
          <p className="text-[10px] text-center text-gray-400 leading-relaxed uppercase tracking-widest px-8">
            Exportações seguem as mesmas regras de anonimização do painel Enterprise.
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseExportsScreen;
