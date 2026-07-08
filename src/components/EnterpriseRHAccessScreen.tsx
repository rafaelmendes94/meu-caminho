import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  LayoutDashboard, 
  AlertCircle, 
  FileText, 
  Lock,
  ChevronRight,
  Users,
  Settings
} from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";

const BG = "#F7F4F2";
const ORANGE = "#F88A2B";
const DARK_BG = "#0B0908";

const AccessCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  buttonText 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  onClick: () => void; 
  buttonText: string;
}) => (
  <div className="rounded-[32px] p-7 bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full transition-all hover:shadow-md group">
    <div className="h-12 w-12 rounded-2xl bg-[#F88A2B1A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="h-6 w-6 text-[#F88A2B]" />
    </div>
    
    <h3 className="text-[20px] font-bold text-[#111] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
      {title}
    </h3>
    
    <p className="text-[14px] text-[#666] leading-relaxed mb-8 flex-1">
      {description}
    </p>
    
    <button 
      onClick={onClick}
      className="flex items-center justify-between w-full py-4 px-6 rounded-2xl bg-[#F7F4F2] text-[#111] font-bold text-[14px] active:scale-[0.98] transition-all"
    >
      <span>{buttonText}</span>
      <ChevronRight className="h-4 w-4 text-[#999]" />
    </button>
  </div>
);

export default function EnterpriseRHAccessScreen() {
  const navigate = useNavigate();

  return (
    <EnterpriseRHLayout title="Acesso RH">
      <main className="px-6 space-y-8 animate-fade-in py-8">
        
        {/* Hero Card */}
        <section>
          <div className="rounded-[40px] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 md:p-10 relative overflow-hidden text-[#111] shadow-2xl">
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-[0.1] rounded-full -translate-y-32 translate-x-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F88A2B] opacity-[0.05] rounded-full translate-y-24 -translate-x-16 blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#111]">Agregado e anônimo</span>
                </div>
              </div>
              
              <h2 className="text-[32px] md:text-[40px] leading-[1.1] font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Leia o time sem expor o indivíduo.
              </h2>
              
              <p className="text-[15px] md:text-[16px] leading-relaxed text-[#666] max-w-[480px]">
                O módulo RH transforma sinais coletivos de bem-estar, capacidade e sobrecarga em decisões estratégicas.
              </p>
            </div>
          </div>
        </section>

        {/* Access Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AccessCard 
            title="Painel RH"
            description="Visão geral do temperamento emocional do time."
            icon={LayoutDashboard}
            buttonText="Abrir dashboard"
            onClick={() => navigate('/enterprise/rh/dashboard')}
          />
          <AccessCard 
            title="Pulso de capacidade"
            description="Entenda energia, entrega, domínio da função e prontidão para crescer."
            icon={Zap}
            buttonText="Ver capacidade"
            onClick={() => navigate('/enterprise/rh/capacidade')}
          />
          <AccessCard 
            title="Áreas em alerta"
            description="Identifique grupos que merecem atenção preventiva esta semana."
            icon={AlertCircle}
            buttonText="Ver alertas"
            onClick={() => navigate('/enterprise/rh/alertas')}
          />
          <AccessCard 
            title="Canal Direto (SOS)"
            description="Acesse relatos e denúncias anônimas enviadas pelo time."
            icon={ShieldCheck}
            buttonText="Ver relatos"
            onClick={() => navigate('/enterprise/rh/denuncias')}
          />
          <AccessCard 
            title="Relatório executivo"
            description="Síntese mensal para liderança e diretoria."
            icon={FileText}
            buttonText="Ver relatório"
            onClick={() => navigate('/enterprise/rh/relatorio')}
          />
          <div className="md:col-span-2">
            <AccessCard 
              title="Equipe Enterprise"
              description="Gerencie acessos, convites e ativação do time por área."
              icon={Users}
              buttonText="Gerenciar equipe"
              onClick={() => navigate('/enterprise/rh/equipe')}
            />
          </div>
          <div className="md:col-span-2">
            <AccessCard 
              title="Configurações"
              description="Defina regras de anonimato, departamentos e frequências."
              icon={Settings}
              buttonText="Ajustar regras"
              onClick={() => navigate('/enterprise/rh/configuracoes')}
            />
          </div>
        </section>

        {/* Privacy Card */}
        <section>
          <div className="rounded-[32px] p-8 bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center shrink-0">
              <Lock className="h-6 w-6 text-[#999]" />
            </div>
            <div>
              <h4 className="text-[18px] font-bold text-[#111] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Nenhum dado individual aparece aqui.
              </h4>
              <p className="text-[14px] text-[#666] leading-relaxed">
                O RH acessa apenas indicadores coletivos, agregados e protegidos por anonimização automática.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pt-4">
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            icon={ArrowRight}
            className="flex-row-reverse"
          >
            Abrir Painel RH
          </EnterpriseRHButton>
        </section>

      </main>
    </EnterpriseRHLayout>
  );
}