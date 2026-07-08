import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  ShieldCheck,
  ChevronDown,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Star,
  Users,
  Target,
  ArrowRight,
  Sparkles,
  BarChart3,
  LayoutDashboard
} from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";
import { useToast } from "@/hooks/use-toast";

const BG = "#F7F4F2";
const ORANGE = "#F88A2B";
const DARK_BG = "#0B0908";

const KPICard = ({ value, label, trend, isPositive = true }: { value: string; label: string; trend?: string; isPositive?: boolean }) => (
  <div className="rounded-3xl p-5 bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm">
    <div className="text-[24px] font-bold text-[#111] mb-1 leading-none">{value}</div>
    <div className="text-[11px] font-medium text-[#666] uppercase tracking-wide leading-tight">{label}</div>
    {trend && (
      <div className={`mt-2 flex items-center gap-1 text-[11px] font-bold ${isPositive ? 'text-[#7FA06E]' : 'text-amber-600'}`}>
        <TrendingUp className={`h-3 w-3 ${!isPositive && 'rotate-180'}`} />
        {trend}
      </div>
    )}
  </div>
);

const ImpactRow = ({ label, before, after, isWarning = false }: { label: string; before: string; after: string; isWarning?: boolean }) => (
  <div className="flex flex-col gap-2">
    <div className="text-[13px] font-bold text-[#111]">{label}</div>
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-[#F7F4F2] h-2 rounded-full overflow-hidden flex">
        <div 
          className="h-full bg-gray-300" 
          style={{ width: before }}
        />
      </div>
      <div className="text-[12px] font-bold text-[#999] w-8">{before}</div>
      <ArrowRight className="h-3 w-3 text-[#999]" />
      <div className="flex-1 bg-[#F7F4F2] h-2 rounded-full overflow-hidden flex">
        <div 
          className={`h-full ${isWarning ? 'bg-amber-500' : 'bg-[#F88A2B]'}`} 
          style={{ width: after }}
        />
      </div>
      <div className={`text-[12px] font-bold w-8 ${isWarning ? 'text-amber-600' : 'text-[#F88A2B]'}`}>{after}</div>
    </div>
  </div>
);

const RecommendationCard = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="rounded-2xl p-4 bg-[#F7F4F2] border border-white/40 flex gap-4 items-center">
    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
      <Icon className="h-5 w-5 text-[#F88A2B]" />
    </div>
    <p className="text-[14px] text-[#444] font-medium leading-snug">{text}</p>
  </div>
);

export default function EnterpriseReportScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Exportando...",
      description: "Relatório preparado para exportação.",
    });
  };

  return (
    <EnterpriseRHLayout title="Relatório executivo">
      <div className="space-y-8 animate-fade-in">
        {/* Sub-header inside main */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/5 w-fit">
              <span className="text-[9px] font-bold text-[#666] uppercase tracking-wider">Mês atual</span>
            </div>
          </div>

          <button className="text-[13px] font-bold text-[#111] bg-white px-4 py-2 rounded-full border border-white/60 shadow-sm flex items-center gap-2">
            Maio 2026
            <ChevronDown className="h-4 w-4 text-[#F88A2B]" />
          </button>
        </div>
        
        {/* Hero Card */}
        <section>
          <div className="rounded-[32px] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 relative overflow-hidden text-[#111] shadow-2xl">
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-[0.12] rounded-full -translate-y-20 translate-x-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F88A2B] opacity-[0.08] rounded-full translate-y-16 -translate-x-10 blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="h-4 w-4 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Agregado e anônimo</span>
              </div>
              
              <h2 className="text-[32px] leading-tight font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Bem-estar emocional como instrumento de gestão.
              </h2>
              
              <p className="text-[15px] leading-relaxed text-[#666] mb-8">
                Uma leitura executiva sobre equilíbrio, clareza, sobrecarga e evolução do time ao longo do mês.
              </p>

              {/* Elegant timeline visual */}
              <div className="flex items-center gap-1 h-1 w-full bg-black/5 rounded-full mb-2">
                <div className="h-full w-1/4 bg-[#F88A2B] rounded-full shadow-[0_0_10px_#F88A2B]" />
                <div className="h-full w-1/4 bg-[#F88A2B] rounded-full shadow-[0_0_10px_#F88A2B]" />
                <div className="h-full w-1/4 bg-[#F88A2B] rounded-full shadow-[0_0_10px_#F88A2B]" />
                <div className="h-full w-1/4 bg-[#F88A2B] rounded-full shadow-[0_0_10px_#F88A2B]" />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-[#999] uppercase tracking-widest">
                <span>Semana 1</span>
                <span>Semana 4</span>
              </div>
            </div>
          </div>
        </section>

        {/* Resumo Executivo */}
        <section>
          <div className="rounded-[32px] bg-white p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[20px] font-bold text-[#111] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Síntese do mês</h3>
            <p className="text-[15px] leading-relaxed text-[#555] font-medium">
              O time apresentou melhora em clareza emocional, manutenção do índice geral de equilíbrio e aumento pontual de sobrecarga em áreas operacionais. O principal ponto de atenção segue sendo a pressão por entrega e a dificuldade de desacelerar a mente.
            </p>
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 gap-3">
          <KPICard value="+12%" label="Clareza emocional" trend="Evolução" />
          <KPICard value="3,8/5" label="Equilíbrio médio" trend="Estável" />
          <KPICard value="87%" label="Adesão ao check-in" />
          <KPICard value="2" label="Áreas em atenção" isPositive={false} />
        </section>

        {/* Evolução do mês */}
        <section>
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999] mb-5 px-1">Evolução do mês</h3>
          <div className="rounded-[32px] bg-white p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-end justify-between h-40 gap-4 mb-6">
              {[
                { week: "Sem 1", val: 3.4, h: "60%" },
                { week: "Sem 2", val: 3.5, h: "65%" },
                { week: "Sem 3", val: 3.7, h: "75%" },
                { week: "Sem 4", val: 3.8, h: "80%" }
              ].map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div className="relative w-full flex justify-center items-end h-full">
                    <div 
                      className="w-full max-w-[40px] rounded-2xl bg-gradient-to-t from-[#F88A2B] to-[#F88A2B]/40 transition-all duration-1000"
                      style={{ height: d.h }}
                    />
                    <div className="absolute -top-6 text-[12px] font-bold text-[#111]">{d.val}</div>
                  </div>
                  <span className="text-[10px] font-bold text-[#999] uppercase">{d.week}</span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-[#666] font-medium leading-relaxed italic text-center border-t border-[#F7F4F2] pt-4">
              "O equilíbrio coletivo apresentou evolução gradual, com melhora consistente nas últimas duas semanas."
            </p>
          </div>
        </section>

        {/* Impacto da Jornada */}
        <section>
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999] mb-5 px-1">Impacto da jornada</h3>
          <div className="rounded-[32px] bg-white p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
            <div className="flex justify-between text-[10px] font-bold text-[#999] uppercase tracking-widest mb-2">
              <span>Antes</span>
              <span>Depois da trilha</span>
            </div>
            
            <ImpactRow label="Clareza emocional" before="58%" after="70%" />
            <ImpactRow label="Equilíbrio estável" before="31%" after="39%" />
            <ImpactRow label="Sobrecarga elevada" before="55%" after="48%" isWarning />

            <div className="bg-[#F88A2B0A] rounded-2xl p-4 border border-[#F88A2B1A]">
              <p className="text-[13px] text-[#F88A2B] font-semibold leading-relaxed">
                Colaboradores que avançaram na trilha apresentaram maior percepção de clareza e equilíbrio coletivo.
              </p>
            </div>
          </div>
        </section>

        {/* Principais temas emocionais */}
        <section>
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999] mb-5 px-1">Principais temas emocionais</h3>
          <div className="rounded-[32px] bg-white p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="space-y-6">
              {[
                { label: "Ansiedade e pressão por entrega", val: 41 },
                { label: "Mente acelerada", val: 29 },
                { label: "Cansaço emocional", val: 18 },
                { label: "Conflitos de comunicação", val: 12 }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-[16px] font-bold text-[#F88A2B] w-10 shrink-0">{item.val}%</div>
                  <div className="flex-1 h-[1px] bg-[#F7F4F2]" />
                  <div className="text-[14px] font-semibold text-[#333]">{item.label}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#F7F4F2] flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-[#999] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#999] leading-relaxed italic">
                Temas extraídos apenas de padrões agregados. Conversas individuais permanecem privadas e protegidas por anonimização.
              </p>
            </div>
          </div>
        </section>

        {/* Áreas de atenção */}
        <section>
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999] mb-5 px-1">Áreas de atenção</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-[24px] bg-amber-50/50 p-6 border border-amber-200/50 flex justify-between items-center">
              <div>
                <div className="text-[16px] font-bold text-[#111]">Operações</div>
                <div className="text-[12px] text-amber-700 font-medium">Sobrecarga elevada há 3 semanas</div>
              </div>
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div className="rounded-[24px] bg-white p-6 border border-white/60 flex justify-between items-center shadow-sm">
              <div>
                <div className="text-[16px] font-bold text-[#111]">Atendimento</div>
                <div className="text-[12px] text-[#666] font-medium">Oscilação emocional em semanas de pico</div>
              </div>
            </div>
            <div className="rounded-[24px] bg-white p-6 border border-white/60 flex justify-between items-center shadow-sm">
              <div>
                <div className="text-[16px] font-bold text-[#111]">Produto</div>
                <div className="text-[12px] text-[#7FA06E] font-medium">Melhora gradual de clareza</div>
              </div>
              <CheckCircle2 className="h-6 w-6 text-[#7FA06E]" />
            </div>
          </div>
        </section>

        {/* Recomendações estratégicas */}
        <section>
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999] mb-5 px-1">Recomendações estratégicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecommendationCard icon={Target} text="Reduzir ruído operacional em áreas sob pressão." />
            <RecommendationCard icon={Users} text="Criar momentos estruturados de escuta com liderança." />
            <RecommendationCard icon={ShieldCheck} text="Reforçar conteúdos sobre mente acelerada e clareza." />
            <RecommendationCard icon={FileText} text="Acompanhar Operações por mais duas semanas." />
          </div>
        </section>

        {/* Prova de valor */}
        <section>
          <div className="rounded-[32px] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 relative overflow-hidden text-[#111] shadow-2xl">
            <div className="relative z-10">
              <Star className="h-6 w-6 text-[#F88A2B] mb-4" />
              <h3 className="text-[22px] font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                O valor está em agir antes da perda.
              </h3>
              <p className="text-[14px] leading-relaxed text-[#666] mb-8">
                A leitura emocional recorrente permite que a liderança identifique sinais de desgaste antes de queda de entrega, afastamento ou desligamento silencioso.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "prevenção", icon: ShieldCheck },
                  { label: "retenção", icon: Target },
                  { label: "clareza", icon: Star },
                  { label: "cultura", icon: Users }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon className="h-3.5 w-3.5 text-[#F88A2B]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#333]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="space-y-3 pt-4">
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/plano-acao')}
            icon={Sparkles}
            className="flex-row-reverse"
          >
            Ver plano de ação
          </EnterpriseRHButton>
          
          <EnterpriseRHButton 
            onClick={handleExport}
            variant="secondary"
            icon={Download}
          >
            Exportar relatório
          </EnterpriseRHButton>

          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/benchmark')}
            variant="secondary"
            icon={BarChart3}
          >
            Ver benchmark emocional
          </EnterpriseRHButton>

          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            variant="outline"
            icon={LayoutDashboard}
          >
            Voltar ao dashboard
          </EnterpriseRHButton>
        </section>

        {/* Rodapé */}
        <footer className="text-center pb-8">
          <p className="text-[11px] text-[#999] leading-relaxed max-w-[280px] mx-auto">
            Este relatório não contém dados individuais. Todos os indicadores são coletivos, agregados e protegidos por anonimização automática.
          </p>
        </footer>

      </div>
    </EnterpriseRHLayout>
  );
}