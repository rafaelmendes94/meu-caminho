import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Link as LinkIcon, 
  Slack, 
  Layout, 
  Globe, 
  Calendar, 
  Users, 
  Code, 
  Bell, 
  FileText, 
  Zap, 
  MessageSquare,
  Lock,
  ArrowRight,
  Info,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseIntegrationsScreen = () => {
  const navigate = useNavigate();
  
  const [integrations, setIntegrations] = useState([
    {
      id: "slack",
      name: "Slack",
      icon: <Slack className="w-6 h-6 text-[#E01E5A]" />,
      description: "Enviar lembretes de check-in e insights coletivos diretamente nos canais da empresa.",
      status: "Conectado",
      buttonText: "Gerenciar",
      connected: true
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      icon: <Layout className="w-6 h-6 text-[#6264A7]" />,
      description: "Integre check-ins emocionais e comunicações coletivas ao fluxo da equipe.",
      status: "Disponível",
      buttonText: "Conectar",
      connected: false
    },
    {
      id: "google",
      name: "Google Workspace",
      icon: <Globe className="w-6 h-6 text-[#4285F4]" />,
      description: "Sincronize colaboradores, áreas e calendários organizacionais.",
      status: "Conectado",
      buttonText: "Gerenciar",
      connected: true
    },
    {
      id: "outlook",
      name: "Outlook Calendar",
      icon: <Calendar className="w-6 h-6 text-[#0078D4]" />,
      description: "Criar pausas conscientes e rituais coletivos na agenda corporativa.",
      status: "Disponível",
      buttonText: "Conectar",
      connected: false
    },
    {
      id: "hris",
      name: "HRIS / BambooHR",
      icon: <Users className="w-6 h-6 text-[#619A31]" />,
      description: "Sincronização organizacional segura e agregada.",
      status: "Disponível",
      buttonText: "Conectar",
      connected: false
    },
    {
      id: "api",
      name: "API Enterprise",
      icon: <Code className="w-6 h-6 text-gray-400" />,
      description: "Conecte o Enterprise aos sistemas internos da organização.",
      status: "Avançado",
      buttonText: "Ver documentação",
      connected: false
    }
  ]);

  const automations = [
    { id: 1, title: "Lembrete semanal de check-in", icon: <Bell className="w-4 h-4 text-orange-400" /> },
    { id: 2, title: "Relatório executivo mensal", icon: <FileText className="w-4 h-4 text-blue-400" /> },
    { id: 3, title: "Alerta preventivo coletivo", icon: <Zap className="w-4 h-4 text-yellow-400" /> },
    { id: 4, title: "Comunicação automática de rituais", icon: <MessageSquare className="w-4 h-4 text-purple-400" /> },
    { id: 5, title: "Insights organizacionais semanais", icon: <Info className="w-4 h-4 text-teal-400" /> }
  ];

  const privacyPoints = [
    "Nenhuma conversa individual é compartilhada",
    "Sem acesso a respostas pessoais",
    "Apenas dados coletivos agregados",
    "Permissões controladas por role",
    "Criptografia organizacional"
  ];

  const timelineSteps = [
    { number: 1, text: "Colaborador realiza check-in" },
    { number: 2, text: "IA identifica tendências coletivas" },
    { number: 3, text: "RH recebe insights agregados" },
    { number: 4, text: "Liderança toma decisões preventivas" },
    { number: 5, text: "Empresa fortalece equilíbrio coletivo" }
  ];

  const mostUsed = [
    { title: "Slack para lembretes conscientes", subtitle: "Integração instantânea" },
    { title: "Google Calendar para pausas coletivas", subtitle: "Gestão de tempo" },
    { title: "Teams para comunicação emocional", subtitle: "Fluxo de equipe" },
    { title: "HRIS para sincronização organizacional", subtitle: "Estrutura segura" }
  ];

  return (
    <EnterpriseRHLayout title="Integrações">
      <div className="space-y-10 animate-fade-in py-2">
        {/* HERO CARD */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-3xl p-8 overflow-hidden shadow-2xl"
        >
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/[0.03] rounded-full blur-[60px] -ml-24 -mb-24" />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-2 rounded-full border border-black/5">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-[#111]">Integrações seguras</span>
            </div>
            
            <h2 className="text-3xl font-playfair leading-tight text-[#111] max-w-md">
              O cuidado emocional funciona melhor quando se integra naturalmente à rotina.
            </h2>
            
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Conecte o Enterprise às ferramentas que já fazem parte do fluxo da empresa.
            </p>
          </div>
          
          {/* Organic Lines/Particles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <path d="M0,100 C150,50 250,150 400,100" stroke="white" fill="transparent" strokeWidth="0.5" />
              <path d="M0,200 C100,250 300,150 400,200" stroke="#F88A2B" fill="transparent" strokeWidth="0.5" />
            </svg>
          </div>
        </motion.section>

        {/* INTEGRAÇÕES DISPONÍVEIS */}
        <section className="space-y-6">
          <h3 className="text-lg font-playfair font-bold text-gray-900 ml-1">Integrações disponíveis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner">
                      {item.icon}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'Conectado' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                <button className={`mt-6 w-full py-3 rounded-2xl text-xs font-bold transition-all ${
                  item.connected 
                  ? 'bg-gray-50 text-gray-700 hover:bg-gray-100' 
                  : 'bg-white border border-gray-200 text-gray-800 hover:border-[#F88A2B] hover:text-[#F88A2B]'
                }`}>
                  {item.buttonText}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AUTOMAÇÃO INTELIGENTE */}
        <section className="space-y-6">
          <h3 className="text-lg font-playfair font-bold text-gray-900 ml-1">Automação inteligente</h3>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-8">
              <Zap className="w-24 h-24 text-orange-50 opacity-[0.05]" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#F88A2B]" />
                </div>
                <h4 className="text-xl font-playfair font-bold text-gray-900">Processos que cuidam por você</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Configure ações automáticas baseadas no clima emocional coletivo para manter a cultura sempre viva.
                </p>
              </div>

              <div className="space-y-3">
                {automations.map((auto) => (
                  <div key={auto.id} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3 group hover:bg-white hover:shadow-md transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      {auto.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{auto.title}</span>
                    <div className="ml-auto w-8 h-4 bg-orange-100 rounded-full flex items-center px-1">
                      <div className="w-2 h-2 bg-[#F88A2B] rounded-full translate-x-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* PRIVACIDADE NAS INTEGRAÇÕES */}
        <section className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-white/60 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
              <Lock className="w-8 h-8 text-[#F88A2B]" />
            </div>
            
            <div className="space-y-4 flex-1">
              <h3 className="text-xl font-playfair font-bold text-gray-900">
                As integrações respeitam anonimização automática.
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {privacyPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600 font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FLUXO CONECTADO */}
        <section className="space-y-8">
          <h3 className="text-lg font-playfair font-bold text-gray-900 ml-1">Fluxo conectado</h3>
          
          <div className="relative pl-8 space-y-8">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-orange-400 via-gray-200 to-transparent" />
            
            {timelineSteps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center gap-6"
              >
                <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-white border-2 border-orange-400 shadow-sm z-10" />
                <div className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-playfair font-bold text-orange-400/30">0{step.number}</span>
                    <span className="text-sm font-bold text-gray-800">{step.text}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* INTEGRAÇÕES MAIS UTILIZADAS */}
        <section className="space-y-6">
          <h3 className="text-lg font-playfair font-bold text-gray-900 ml-1">Integrações mais utilizadas</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {mostUsed.map((item, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all cursor-pointer">
                <h4 className="text-xs font-bold text-gray-900 leading-tight">{item.title}</h4>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VISÃO ESTRATÉGICA */}
        <motion.section 
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-3xl p-10 text-center space-y-8 relative overflow-hidden shadow-2xl"
        >
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#F88A2B]/5 blur-[120px]" />
          
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl font-playfair text-[#111] max-w-lg mx-auto leading-relaxed">
              “A melhor tecnologia é a que desaparece na experiência.”
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              O Enterprise se integra ao fluxo organizacional sem transformar cuidado emocional em mais uma ferramenta invasiva.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-4 pt-4">
            <button 
              onClick={() => navigate('/enterprise/rh/notificacoes')}
              className="bg-[#F88A2B] text-[#111] py-4 rounded-2xl font-bold text-sm shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
            >
              Configurar notificações
            </button>
            <button 
              onClick={() => navigate('/enterprise/rh/permissoes')}
              className="bg-black/5 text-[#333] py-4 rounded-2xl font-bold text-sm border border-black/5 hover:bg-white/20 transition-all"
            >
              Voltar às permissões
            </button>
          </div>
        </motion.section>

        {/* FOOTER */}
        <footer className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
            Todas as integrações seguem padrões de segurança, anonimização e privacidade organizacional.
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseIntegrationsScreen;