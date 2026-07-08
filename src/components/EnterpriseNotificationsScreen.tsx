import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Bell, 
  Calendar, 
  MessageSquare, 
  Mail, 
  Slack, 
  Layout, 
  ChevronRight, 
  Settings, 
  BarChart3, 
  Sparkles,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseNotificationsScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [notificationSettings, setNotificationSettings] = useState({
    checkin: true,
    pausa: true,
    conteudo: false,
    quedaEquilibrio: true,
    sobrecarga: true,
    baixaAdesao: true,
    resumoSemanal: true,
    relatorioMensal: true,
    insightsIA: false,
    benchmark: true
  });

  const [selectedTone, setSelectedTone] = useState("acolhedor");

  const toggleSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As preferências de notificação foram atualizadas.",
      className: "bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] border-[#F88A2B]/20",
    });
  };

  const Switch = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${
        active ? 'bg-[#F88A2B]' : 'bg-[#E5E5E5]'
      }`}
    >
      <motion.div
        animate={{ x: active ? 22 : 4 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );

  return (
    <EnterpriseRHLayout title="Configurações de Notificação">
      <div className="max-w-6xl mx-auto pb-20 space-y-10">
        
        {/* SaaS Header / Hero Section */}
        <section className="bg-white rounded-[32px] p-8 lg:p-10 shadow-sm border border-black/5 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F88A2B] text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={12} fill="currentColor" /> Automação Ética
            </div>
            <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-[#111] leading-tight">
              Comunicação que cuida, <br />não pressiona.
            </h1>
            <p className="text-base text-[#666] leading-relaxed max-w-2xl">
              Configure as notificações do sistema para incentivar check-ins, pausas e ações preventivas de forma humanizada. O equilíbrio ideal entre engajamento e saúde digital.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={handleSave}
                className="px-8 py-3 bg-[#F88A2B] text-[#111] text-sm font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
              >
                Salvar Alterações
              </button>
              <button 
                onClick={() => navigate('/enterprise/rh/rituais')}
                className="px-8 py-3 bg-[#F9F8F6] text-[#111] text-sm font-bold rounded-2xl border border-black/5 hover:bg-black/5 transition-all"
              >
                Configurar Rituais
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-72 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 text-[#111] relative overflow-hidden shadow-2xl shrink-0">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F88A2B]/20 blur-3xl rounded-full" />
             <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F88A2B] flex items-center justify-center mb-6">
                   <Clock className="text-[#111]" size={24} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Status Atual</p>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold">Máx. 3</span>
                   <span className="text-xs text-[#999] mb-1">por semana</span>
                </div>
                <div className="space-y-2">
                   <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#F88A2B] w-3/4 h-full" />
                   </div>
                   <p className="text-[10px] text-[#999]">Frequência recomendada ativa</p>
                </div>
             </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Configuration Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Employee Reminders */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111]">Lembretes do Colaborador</h2>
                  <p className="text-xs text-[#8A8A8A]">Notificações enviadas diretamente aos usuários</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'checkin',
                    title: 'Check-in Semanal',
                    desc: 'Incentiva a reserva de um tempo para autopercepção emocional.',
                    freq: 'Toda segunda-feira, 09h',
                    icon: <Calendar size={18} />
                  },
                  {
                    id: 'pausa',
                    title: 'Pausa Consciente',
                    desc: 'Convites para recuperar presença após ciclos intensos de trabalho.',
                    freq: 'Quartas-feiras, 15h',
                    icon: <Bell size={18} />
                  },
                  {
                    id: 'conteudo',
                    title: 'Conteúdo Recomendado',
                    desc: 'Aulas e reflexões personalizadas baseadas na jornada emocional.',
                    freq: 'Baseado na jornada individual',
                    icon: <Layout size={18} />
                  }
                ].map((item) => (
                  <div key={item.id} className="group p-5 rounded-2xl hover:bg-[#F9F8F6] transition-all border border-transparent hover:border-black/5 flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#111] group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm text-[#111]">{item.title}</h4>
                        <Switch 
                          active={notificationSettings[item.id as keyof typeof notificationSettings]} 
                          onClick={() => toggleSetting(item.id as keyof typeof notificationSettings)} 
                        />
                      </div>
                      <p className="text-xs text-[#8A8A8A] leading-relaxed mb-3">{item.desc}</p>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-black/[0.03] text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider shadow-sm">
                        <Clock size={10} />
                        {item.freq}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Alerts */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#F88A2B]">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111]">Alertas Críticos para RH</h2>
                  <p className="text-xs text-[#8A8A8A]">Notificações de inteligência e prevenção</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'quedaEquilibrio', title: 'Queda de Equilíbrio', desc: 'Notificar quando uma área apresentar piora coletiva.' },
                  { id: 'sobrecarga', title: 'Sobrecarga Crescente', desc: 'Alertar sobre aumento agregado de estresse/carga.' },
                  { id: 'baixaAdesao', title: 'Baixa Adesão', desc: 'Informar quando a participação coletiva cair do esperado.' }
                ].map((item) => (
                  <div key={item.id} className="p-6 rounded-2xl bg-[#F9F8F6] border border-black/5 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#111]">{item.title}</h4>
                        <Switch 
                          active={notificationSettings[item.id as keyof typeof notificationSettings]} 
                          onClick={() => toggleSetting(item.id as keyof typeof notificationSettings)} 
                        />
                      </div>
                      <p className="text-xs text-[#8A8A8A] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Tone */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#111]">Tom das Mensagens</h2>
                    <p className="text-xs text-[#8A8A8A]">Como o sistema deve se comunicar</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {['acolhedor', 'institucional', 'inspirador', 'direto'].map((tom) => (
                    <button
                      key={tom}
                      onClick={() => setSelectedTone(tom)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedTone === tom 
                          ? 'bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] shadow-lg' 
                          : 'bg-[#F9F8F6] text-[#8A8A8A] hover:bg-black/5 border border-transparent hover:border-black/5'
                      }`}
                    >
                      {tom.charAt(0).toUpperCase() + tom.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="bg-[#F9F8F6] rounded-2xl p-6 border border-black/5 relative">
                  <div className="absolute top-4 right-4 text-[#F88A2B]">
                    <Sparkles size={16} />
                  </div>
                  <p className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-[0.2em] mb-3">Prévia da Mensagem</p>
                  <p className="text-base italic text-[#111] font-playfair leading-relaxed pr-8">
                    {selectedTone === 'acolhedor' && "“Reserve dois minutos para perceber como sua mente tem caminhado esta semana. Seu bem-estar importa.”"}
                    {selectedTone === 'institucional' && "“A empresa convida você para realizar seu check-in semanal de saúde emocional. É importante para todos.”"}
                    {selectedTone === 'inspirador' && "“Cuidar da mente é o primeiro passo para voar mais alto. Como você se sente hoje?”"}
                    {selectedTone === 'direto' && "“Hora do seu check-in semanal de 2 minutos. Vamos começar?”"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Reports */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <h3 className="text-lg font-bold text-[#111] mb-6 flex items-center gap-2">
                <BarChart3 size={18} className="text-[#F88A2B]" /> Relatórios
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'resumoSemanal', label: 'Resumo Semanal', freq: 'Sextas-feiras' },
                  { id: 'relatorioMensal', label: 'Relatório Executivo', freq: 'Todo dia 01' },
                  { id: 'insightsIA', label: 'Insights de IA', freq: 'Quinzenal' },
                  { id: 'benchmark', label: 'Benchmark Mensal', freq: 'Mensal' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F8F6] border border-black/[0.03]">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#111]">{item.label}</span>
                      <span className="text-[10px] text-[#8A8A8A]">{item.freq}</span>
                    </div>
                    <Switch 
                      active={notificationSettings[item.id as keyof typeof notificationSettings]} 
                      onClick={() => toggleSetting(item.id as keyof typeof notificationSettings)} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Channels */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <h3 className="text-lg font-bold text-[#111] mb-6 flex items-center gap-2">
                <Settings size={18} className="text-[#F88A2B]" /> Canais
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Slack', status: 'Conectado', icon: <Slack size={16} className="text-[#4A154B]" /> },
                  { name: 'Google Workspace', status: 'Ativo', icon: <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-[#111] font-bold">G</div> },
                  { name: 'Microsoft Teams', status: 'Disponível', icon: <div className="w-4 h-4 bg-purple-600 rounded-sm" /> },
                  { name: 'E-mail Corp.', status: 'Ativo', icon: <Mail size={14} className="text-gray-400" /> }
                ].map((canal) => (
                  <div key={canal.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F9F8F6] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-black/[0.03]">
                        {canal.icon}
                      </div>
                      <span className="text-xs font-bold text-[#111]">{canal.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${canal.status === 'Disponível' ? 'text-black/20' : 'text-[#F88A2B]'}`}>
                      {canal.status}
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/enterprise/rh/central-admin')}
                className="w-full mt-6 py-4 px-4 bg-[#F9F8F6] text-[#111] text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-black/5 transition-all flex items-center justify-center gap-2"
              >
                Gerenciar Integrações <ChevronRight size={14} />
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-[#111] to-[#222] rounded-[32px] p-8 text-[#111] shadow-xl shadow-black/10 relative overflow-hidden">
               <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-[#111]/5 rotate-12" />
               <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#F88A2B] flex items-center justify-center mb-6">
                     <Info className="text-[#111]" size={20} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-playfair">Privacidade por Design</h3>
                  <p className="text-xs text-[#777] leading-relaxed mb-6">
                    As notificações são configuradas para apoiar o cuidado coletivo, nunca para monitorar indivíduos ou gerar pressão produtiva.
                  </p>
                  <button onClick={() => navigate('/enterprise/rh/privacidade')} className="w-full py-3 bg-black/5 hover:bg-white/20 text-[#111] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Ver Políticas</button>
               </div>
            </div>

          </div>
        </div>

        {/* Global CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 bg-white rounded-[40px] shadow-sm border border-black/5">
           <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-[#111] mb-1">Pronto para aplicar?</h3>
              <p className="text-sm text-[#8A8A8A]">As alterações terão efeito imediato para todos os colaboradores.</p>
           </div>
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <button onClick={() => navigate(-1)} className="flex-1 sm:flex-none px-10 py-4 bg-[#F9F8F6] text-[#111] font-bold rounded-2xl border border-black/5 hover:bg-black/5 transition-all">Descartar</button>
              <button onClick={handleSave} className="flex-1 sm:flex-none px-10 py-4 bg-[#F88A2B] text-[#111] font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">Salvar Configurações</button>
           </div>
        </div>

        <footer className="text-center pt-10">
          <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Enterprise RH · Central de Notificações · v1.2.0</p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseNotificationsScreen;