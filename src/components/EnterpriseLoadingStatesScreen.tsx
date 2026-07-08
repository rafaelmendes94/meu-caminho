import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  BrainCircuit, 
  CheckCircle2,
  RefreshCw,
  Waves,
  Slack,
  MessageSquare
} from "lucide-react";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const SkeletonPulse = () => (
  <div className="animate-pulse bg-gray-200/50 rounded-xl w-full h-full" />
);

const ShimmerLine = ({ width = "w-full", height = "h-4" }: { width?: string, height?: string }) => (
  <div className={`${width} ${height} relative overflow-hidden bg-gray-200/40 rounded-lg`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </div>
);

const PremiumSkeletonCard = () => (
  <div className="p-6 rounded-3xl bg-white shadow-sm border border-gray-100 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-lg bg-orange-200/50 animate-pulse" />
      </div>
      <div className="w-16 h-6 rounded-full bg-gray-100 animate-pulse" />
    </div>
    <ShimmerLine width="w-3/4" height="h-6" />
    <div className="space-y-2">
      <ShimmerLine width="w-full" height="h-3" />
      <ShimmerLine width="w-5/6" height="h-3" />
    </div>
  </div>
);

const EnterpriseLoadingStatesScreen = () => {
  const navigate = useNavigate();

  return (
    <EnterpriseRHLayout title="Estados de carregamento">
      <div className="space-y-12 animate-fade-in py-2">
        {/* Hero Section */}
        <section className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/20 blur-[80px] rounded-full -mr-20 -mt-20 animate-pulse" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 backdrop-blur-md border border-black/5 mb-6">
              <Sparkles size={14} className="text-[#F88A2B]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">UX Premium</span>
            </div>
            
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Até o carregamento deve parecer cuidado.
            </h2>
            <p className="text-[#666] text-sm md:text-base max-w-xl">
              Loadings no Enterprise comunicam processamento, proteção e inteligência — sem ansiedade visual.
            </p>

            <div className="mt-8 flex gap-4 overflow-hidden py-2">
              <div className="h-[2px] w-full bg-black/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F88A2B] to-transparent animate-[shimmer_3s_infinite]" />
              </div>
            </div>
          </div>
        </section>

        {/* Skeleton do Dashboard RH */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-playfair text-2xl font-bold">Skeleton do Dashboard RH</h3>
            <p className="text-gray-500 text-sm italic">Usado enquanto o Painel RH consolida sinais coletivos.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32">
                <PremiumSkeletonCard />
              </div>
            ))}
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] relative overflow-hidden min-h-[240px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
            <div className="relative z-10 space-y-4">
              <div className="w-1/3 h-8 bg-black/5 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-black/5 rounded-lg animate-pulse" />
                <div className="w-2/3 h-4 bg-black/5 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Gerando relatório executivo */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-playfair text-2xl font-bold">Gerando relatório executivo</h3>
          </div>
          
          <div className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-gray-50 flex items-center justify-center relative">
                <div className="absolute inset-0 border-4 border-t-[#F88A2B] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center animate-pulse">
                  <FileText className="text-[#F88A2B]" size={32} />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white shadow-lg rounded-full px-3 py-1 border border-gray-100">
                <span className="text-xs font-bold text-[#F88A2B]">68%</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-playfair text-2xl font-bold">Preparando leitura executiva…</h4>
              <p className="text-gray-500 max-w-md mx-auto">
                Organizando evolução, áreas de atenção e recomendações estratégicas.
              </p>
            </div>
          </div>
        </section>

        {/* IA analisando padrões coletivos */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-playfair text-2xl font-bold">IA analisando padrões coletivos</h3>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] flex flex-col items-center text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
               {/* Simulating organic particles with animated div blobs */}
               <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-500/10 blur-[50px] animate-pulse rounded-full" />
               <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-amber-500/10 blur-[50px] animate-pulse delay-700 rounded-full" />
            </div>

            <div className="relative z-10 w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#F88A2B]/20 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-[#F88A2B]/10 rounded-full animate-pulse" />
              <BrainCircuit className="text-[#F88A2B] relative z-20" size={48} />
            </div>

            <div className="relative z-10 space-y-2">
              <h4 className="font-playfair text-2xl font-bold">A IA está identificando tendências agregadas.</h4>
              <div className="flex items-center justify-center gap-2 text-[#777] text-sm">
                <ShieldCheck size={14} />
                <p>Nenhuma conversa individual é acessada neste processo.</p>
              </div>
            </div>

            <div className="relative z-10 flex gap-1">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full bg-[#F88A2B] animate-bounce`} 
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Exportação em andamento */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-playfair text-2xl font-bold">Exportação em andamento</h3>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                <RefreshCw className="text-gray-400 animate-spin" size={24} />
              </div>
              <div>
                <h4 className="font-playfair text-xl font-bold">Preparando arquivo seguro…</h4>
                <p className="text-sm text-gray-500">Isso pode levar alguns segundos.</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Removendo dados individuais", status: "complete" },
                { label: "Aplicando anonimização", status: "complete" },
                { label: "Organizando indicadores coletivos", status: "loading" },
                { label: "Finalizando relatório", status: "waiting" },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      step.status === 'complete' ? 'bg-green-50 border-green-200 text-green-500' : 
                      step.status === 'loading' ? 'bg-orange-50 border-orange-200 text-[#F88A2B]' : 
                      'bg-gray-50 border-gray-100 text-gray-300'
                    }`}>
                      {step.status === 'complete' ? <CheckCircle2 size={14} /> : 
                       step.status === 'loading' ? <RefreshCw size={12} className="animate-spin" /> : 
                       <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span className={`text-sm ${step.status === 'waiting' ? 'text-gray-400' : 'text-gray-700'}`}>
                      {step.label}
                    </span>
                  </div>
                  {step.status === 'loading' && (
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F88A2B] animate-[shimmer_2s_infinite] w-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Conectando integração */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-playfair text-2xl font-bold">Conectando integração</h3>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm space-y-8">
            <div className="text-center space-y-2">
              <h4 className="font-playfair text-2xl font-bold">Conectando com segurança…</h4>
              <p className="text-sm text-gray-500">Validando permissões e protegendo dados emocionais.</p>
            </div>

            <div className="flex justify-center items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 animate-pulse flex items-center justify-center text-gray-300">
                <Slack size={32} />
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F88A2B] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#F88A2B] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#F88A2B] animate-bounce [animation-delay:0.4s]" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gray-50 animate-pulse flex items-center justify-center text-gray-300">
                <MessageSquare size={32} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border border-gray-100 rounded-2xl flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 animate-pulse" />
                   <div className="flex-1 space-y-2">
                     <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
                     <div className="w-full h-2 bg-gray-50 rounded animate-pulse" />
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Consolidando check-ins */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-playfair text-2xl font-bold">Consolidando check-ins</h3>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm text-center space-y-8 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20 overflow-hidden">
               <Waves className="w-[200%] h-full text-[#F88A2B] animate-[waves_10s_linear_infinite]" />
            </div>

            <div className="space-y-2 relative z-10">
              <h4 className="font-playfair text-2xl font-bold">Lendo sinais coletivos da semana…</h4>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Os resultados aparecem apenas quando houver volume suficiente para anonimização.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 relative z-10">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i} 
                  className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 animate-pulse" 
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Microcopy recomendada */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-playfair text-2xl font-bold">Microcopy recomendada</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Estamos organizando sinais coletivos com segurança.",
              "Aplicando proteção de anonimato.",
              "Preparando uma leitura executiva do time.",
              "A IA está analisando padrões agregados.",
              "Quase pronto. Nenhum dado individual será exibido."
            ].map((text, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex-shrink-0 flex items-center justify-center text-[#F88A2B] font-bold text-xs">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 font-medium">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Princípio de design */}
        <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] space-y-4">
          <h3 className="font-playfair text-2xl font-bold italic">“Loading não é espera. É confiança.”</h3>
          <p className="text-[#666] leading-relaxed">
            No Enterprise, cada estado de carregamento deve reforçar que os dados estão sendo tratados com cuidado, privacidade e inteligência.
          </p>
        </section>

        {/* CTA Final */}
        <div className="flex flex-col items-center pt-8">
          <button
            onClick={() => navigate("/enterprise/rh")}
            className="px-8 py-4 bg-[#F88A2B] text-[#111] rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
          >
            Voltar ao módulo RH
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes waves {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </EnterpriseRHLayout>
  );
};

export default EnterpriseLoadingStatesScreen;
