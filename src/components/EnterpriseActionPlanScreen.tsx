import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Target, 
  Users, 
  Zap, 
  Brain, 
  LineChart, 
  ArrowRight,
  Download,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";

const BG = "#F7F4F2";
const ORANGE = "#F88A2B";
const DARK_BG = "#0B0908";

const PriorityCard = ({ area, status, description, impact }: { area: string; status: string; description: string; impact: string }) => (
  <div className="rounded-3xl p-6 bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm relative overflow-hidden group hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="text-[18px] font-bold text-[#111] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{area}</h4>
        <div className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
          status === 'Alta prioridade' ? 'bg-amber-100 text-amber-700' : 
          status === 'Média prioridade' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {status}
        </div>
      </div>
      <div className="h-8 w-8 rounded-full bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]">
        <Target className="h-4 w-4" />
      </div>
    </div>
    
    <p className="text-[13px] text-[#555] font-medium leading-relaxed mb-4">
      {description}
    </p>
    
    <div className="pt-4 border-t border-[#F7F4F2] flex items-center gap-2">
      <Sparkles className="h-3 w-3 text-[#F88A2B]" />
      <div className="text-[11px] font-bold text-[#F88A2B] uppercase tracking-wider">
        Impacto: <span className="text-[#111]">{impact}</span>
      </div>
    </div>
  </div>
);

const ActionCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
  <div className="rounded-2xl p-5 bg-white border border-white/60 shadow-sm flex gap-4 items-start">
    <div className="h-10 w-10 rounded-full bg-[#F88A2B0A] flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5 text-[#F88A2B]" />
    </div>
    <div className="space-y-1">
      <h4 className="text-[15px] font-bold text-[#111] leading-snug">{title}</h4>
      <p className="text-[13px] text-[#666] leading-relaxed font-medium">{description}</p>
    </div>
  </div>
);

const IndicatorRow = ({ label, percentage, color = "#F88A2B" }: { label: string; percentage: number; color?: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-[13px] font-bold text-[#111]">{label}</span>
      <span className="text-[12px] font-black text-[#111]">{percentage}%</span>
    </div>
    <div className="h-1.5 w-full bg-[#F7F4F2] rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const TimelineStep = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-center gap-4 group">
    <div className="h-8 w-8 rounded-full bg-white border border-[#F88A2B20] shadow-sm flex items-center justify-center shrink-0 relative z-10">
      <span className="text-[11px] font-black text-[#F88A2B]">{number}</span>
    </div>
    <div className="text-[14px] font-semibold text-[#444] group-last:text-[#111]">{title}</div>
  </div>
);

export default function EnterpriseActionPlanScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Exportando...",
      description: "Plano preparado para exportação.",
    });
  };

  return (
    <EnterpriseRHLayout title="Plano de ação">
      <div className="space-y-8 animate-fade-in">
        
        {/* Hero Card */}
        <section>
          <div className="rounded-[32px] bg-white border border-black/5 p-8 relative overflow-hidden text-[#111] shadow-sm shadow-black/5">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/5 mb-6">
                <Zap className="h-3 w-3 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#111]">Estratégia emocional</span>
              </div>
              
              <h2 className="text-[28px] leading-tight font-extrabold mb-4 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Agir antes da perda é a essência do cuidado coletivo.
              </h2>
              
              <p className="text-[14px] leading-relaxed text-[#666] font-medium max-w-3xl">
                O Enterprise transforma sinais emocionais agregados em recomendações práticas para liderança e RH.
              </p>
            </div>
          </div>
        </section>

        {/* Prioridades da semana */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999]">Prioridades desta semana</h3>
            <div className="h-px flex-1 bg-black/5 ml-4" />
          </div>
          
          <div className="space-y-4">
            <PriorityCard 
              area="Operações"
              status="Alta prioridade"
              description="O grupo apresenta queda contínua de equilíbrio e aumento de sobrecarga."
              impact="Redução de desgaste coletivo."
            />
            <PriorityCard 
              area="Atendimento"
              status="Média prioridade"
              description="O time demonstra oscilação emocional em períodos de maior pressão."
              impact="Maior estabilidade emocional."
            />
            <PriorityCard 
              area="Produto"
              status="Acompanhamento"
              description="Existe melhora gradual, mas ainda com sinais de aceleração mental."
              impact="Consolidação da recuperação."
            />
          </div>
        </section>

        {/* Ações sugeridas */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999]">Ações sugeridas</h3>
            <div className="h-px flex-1 bg-black/5 ml-4" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <ActionCard 
              title="Criar momentos de escuta com lideranças."
              description="Conversas estruturadas ajudam a reduzir ruído emocional coletivo."
              icon={Users}
            />
            <ActionCard 
              title="Reduzir pressão operacional contínua."
              description="Sem pausas cognitivas, clareza e energia tendem a cair."
              icon={Clock}
            />
            <ActionCard 
              title="Estimular conteúdos sobre mente acelerada."
              description="A educação emocional preventiva melhora autorregulação."
              icon={Brain}
            />
            <ActionCard 
              title="Reforçar equilíbrio entre foco e recuperação."
              description="Alta performance sustentável exige recuperação mental."
              icon={Sparkles}
            />
          </div>
        </section>

        {/* Impacto esperado */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999]">Impacto esperado</h3>
            <div className="h-px flex-1 bg-black/5 ml-4" />
          </div>

          <div className="rounded-[32px] bg-white p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="space-y-6">
              <IndicatorRow label="Melhora de equilíbrio coletivo" percentage={24} />
              <IndicatorRow label="Redução de sobrecarga" percentage={18} color="#7FA06E" />
              <IndicatorRow label="Aumento de clareza emocional" percentage={32} />
              <IndicatorRow label="Maior adesão ao check-in" percentage={15} color="#6366F1" />
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#F7F4F2] flex items-center justify-center gap-2">
              <LineChart className="h-4 w-4 text-[#F88A2B]" />
              <p className="text-[12px] font-bold text-[#111] uppercase tracking-wider">
                Projeção baseada em padrões históricos
              </p>
            </div>
          </div>
        </section>

        {/* Linha do cuidado coletivo */}
        <section>
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999]">Linha do cuidado coletivo</h3>
            <div className="h-px flex-1 bg-black/5 ml-4" />
          </div>

          <div className="relative pl-4 space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-[29px] top-4 bottom-4 w-px bg-gradient-to-b from-[#F88A2B] via-[#F88A2B]/30 to-transparent" />
            
            <TimelineStep number="1" title="Identificar sinais" />
            <TimelineStep number="2" title="Compreender padrões coletivos" />
            <TimelineStep number="3" title="Agir preventivamente" />
            <TimelineStep number="4" title="Acompanhar evolução emocional" />
            <TimelineStep number="5" title="Reduzir desgaste silencioso" />
          </div>
        </section>

        {/* Observação importante */}
        <section>
          <div className="rounded-[32px] bg-white border border-black/5 text-[#111] p-8 relative overflow-hidden shadow-sm">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/[0.02] rounded-full blur-2xl" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#F88A2B]" />
                <h3 className="text-[18px] font-extrabold tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  O objetivo não é controlar pessoas.
                </h3>
              </div>
              <p className="text-[14px] leading-relaxed text-[#666] font-medium">
                O Enterprise existe para apoiar decisões humanas mais conscientes a partir de sinais coletivos e protegidos por anonimização.
              </p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="space-y-3 pt-4">
          <EnterpriseRHButton 
            onClick={handleExport}
            icon={Download}
          >
            Exportar plano executivo
          </EnterpriseRHButton>
          
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/relatorio')}
            variant="secondary"
          >
            Voltar ao relatório
          </EnterpriseRHButton>
        </section>

        {/* Rodapé */}
        <footer className="text-center pb-8">
          <p className="text-[11px] text-[#999] leading-relaxed max-w-[280px] mx-auto italic font-medium">
            Todas as recomendações são baseadas em tendências coletivas e nunca em comportamento individual.
          </p>
        </footer>

      </div>
    </EnterpriseRHLayout>
  );
}