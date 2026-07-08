import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Users, 
  Target, 
  Share2, 
  MessageSquare, 
  Lock, 
  Bell, 
  FileJson,
  PlusCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";

const EnterpriseStatusHealthScreen = () => {
  const navigate = useNavigate();

  const kpis = [
    { label: "Configuração concluída", value: "92%", icon: <Target className="w-5 h-5 text-[#F88A2B]" /> },
    { label: "Colaboradores ativos", value: "118", icon: <Users className="w-5 h-5 text-[#F88A2B]" /> },
    { label: "Adesão ao check-in", value: "87%", icon: <Activity className="w-5 h-5 text-[#F88A2B]" /> },
    { label: "Integrações ativas", value: "4", icon: <Share2 className="w-5 h-5 text-[#F88A2B]" /> },
  ];

  const checklist = [
    { label: "Empresa configurada", status: "concluído" },
    { label: "Áreas cadastradas", status: "concluído" },
    { label: "Privacidade ativa", status: "concluído" },
    { label: "Convites enviados", status: "concluído" },
    { label: "Check-in semanal ativo", status: "concluído" },
    { label: "Relatório executivo habilitado", status: "pendente" },
  ];

  const operationalHealth = [
    { label: "Integrações", status: "saudável", icon: <Share2 className="w-5 h-5 text-emerald-500" /> },
    { label: "Notificações", status: "ativas", icon: <Bell className="w-5 h-5 text-emerald-500" /> },
    { label: "Anonimização", status: "ativa", icon: <Lock className="w-5 h-5 text-emerald-500" /> },
    { label: "Exportações", status: "configuradas", icon: <FileJson className="w-5 h-5 text-emerald-500" /> },
    { label: "Canal Direto RH", status: "ativo", icon: <MessageSquare className="w-5 h-5 text-emerald-500" /> },
  ];

  const nextSteps = [
    { label: "Ativar relatório executivo mensal", icon: <PlusCircle className="w-5 h-5 text-[#F88A2B]" /> },
    { label: "Revisar convites pendentes", icon: <Users className="w-5 h-5 text-[#F88A2B]" /> },
    { label: "Conectar Microsoft Teams", icon: <Share2 className="w-5 h-5 text-[#F88A2B]" /> },
    { label: "Configurar comunicação de lançamento", icon: <MessageSquare className="w-5 h-5 text-[#F88A2B]" /> },
  ];

  return (
    <EnterpriseRHLayout title="Status Enterprise">
      <div className="space-y-8 animate-fade-in">
        {/* Hero Card */}
        {/* Hero Card */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2rem] p-8 text-[#111] relative overflow-hidden shadow-2xl">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Operação saudável</span>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-playfair leading-tight italic">
                  Seu Enterprise está pronto para operar com segurança.
                </h2>
                <p className="text-[#666] text-sm leading-relaxed max-w-md">
                  Acompanhe a saúde da implantação, adesão inicial e configurações críticas.
                </p>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {kpis.map((kpi, index) => (
                  <div key={index} className="bg-black/[0.03] rounded-2xl p-4 border border-black/5">
                    <div className="mb-2">{kpi.icon}</div>
                    <div className="text-2xl font-playfair font-bold text-[#111] mb-0.5">{kpi.value}</div>
                    <div className="text-[10px] text-[#999] uppercase tracking-wider font-medium">{kpi.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Checklist Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-playfair italic px-1">Checklist de implantação</h3>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F1EDE9] space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-[#F1EDE9] last:border-0">
                <span className="text-sm font-medium text-[#0B0908]/80">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    item.status === 'concluído' ? 'text-emerald-500' : 'text-[#F88A2B]'
                  }`}>
                    {item.status}
                  </span>
                  {item.status === 'concluído' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-[#F88A2B]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Operational Health */}
        <section className="space-y-4">
          <h3 className="text-lg font-playfair italic px-1">Saúde operacional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operationalHealth.map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-3xl shadow-sm border border-[#F1EDE9] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F7F4F2] rounded-2xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-[#0B0908]/40 uppercase font-bold tracking-widest">{item.label}</p>
                    <p className="text-sm font-medium text-[#0B0908] capitalize">{item.status}</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Card */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2rem] p-8 text-[#111] relative overflow-hidden shadow-xl">
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F88A2B]/10 rounded-full blur-[40px] -ml-16 -mb-16" />
             <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-8 h-8 text-[#F88A2B]" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-playfair italic">Privacidade operacional ativa.</h4>
                  <p className="text-[#777] text-xs leading-relaxed">
                    Anonimização automática, bloqueio de grupos pequenos e exportações sem dados individuais estão habilitados.
                  </p>
                </div>
             </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-4">
          <h3 className="text-lg font-playfair italic px-1">Próximos ajustes recomendados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextSteps.map((step, index) => (
              <button 
                key={index}
                className="group bg-white p-5 rounded-3xl shadow-sm border border-[#F1EDE9] flex items-center justify-between hover:border-[#F88A2B]/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F88A2B]/5 rounded-2xl flex items-center justify-center group-hover:bg-[#F88A2B]/10 transition-colors">
                    {step.icon}
                  </div>
                  <span className="text-sm font-medium text-[#0B0908]/70 text-left">{step.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#0B0908]/20 group-hover:text-[#F88A2B] transition-colors" />
              </button>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="pt-4 space-y-3">
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            icon={Sparkles}
            className="flex-row-reverse"
          >
            Ver Dashboard RH
          </EnterpriseRHButton>
          
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/onboarding')}
            variant="secondary"
          >
            Continuar onboarding
          </EnterpriseRHButton>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8">
          <p className="text-[10px] text-[#0B0908]/30 uppercase font-bold tracking-[0.2em]">
            Status operacional não contém dados emocionais individuais.
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseStatusHealthScreen;
