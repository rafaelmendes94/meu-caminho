import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Bell, 
  HelpCircle, 
  Settings, 
  Users, 
  Building2, 
  ShieldCheck, 
  Lock, 
  EyeOff,
  ChevronRight, 

  Activity, 
  CreditCard, 
  FileCheck, 
  History, 
  Database, 
  MessageSquare, 
  Globe, 
  UserPlus, 
  Upload, 
  Key, 
  Puzzle, 
  ShieldAlert, 
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  Dna
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

const EnterpriseAdminCenterScreen = () => {
  const navigate = useNavigate();

  const kpis = [
    { label: "Colaboradores ativos", value: "812", icon: Users },
    { label: "Organizações vinculadas", value: "4", icon: Building2 },
    { label: "Consentimentos válidos", value: "98%", icon: FileCheck },
    { label: "Compliance ativo", value: "100%", icon: ShieldCheck },
  ];

  const governanceCards = [
    {
      title: "Organizações",
      desc: "Gerencie empresas, holdings e estruturas independentes.",
      path: "/enterprise/rh/organizacoes",
      icon: Building2
    },
    {
      title: "Unidades",
      desc: "Visualize regiões, filiais e hubs organizacionais.",
      path: "/enterprise/rh/unidades",
      icon: Globe
    },
    {
      title: "Múltiplos administradores",
      desc: "Distribua acessos e responsabilidades executivas.",
      path: "/enterprise/rh/multiplos-admins",
      icon: Users
    },
    {
      title: "Permissões",
      desc: "Controle acessos organizacionais.",
      path: "/enterprise/rh/permissoes",
      icon: Lock
    },
    {
      title: "Inteligência Preditiva",
      desc: "Antecipe riscos organizacionais com base em sinais agregados de energia, engajamento, comunicação e recuperação.",
      path: "/enterprise/rh/alertas",
      icon: Sparkles
    },
    {
      title: "DNA Organizacional™",
      desc: "Visão executiva do comportamento coletivo da organização baseada em Inteligência Artificial e dados agregados.",
      path: "/enterprise/rh/dna-organizacional",
      icon: Dna
    }
  ];

  const privacyCards = [
    { title: "Compliance Enterprise", path: "/enterprise/rh/compliance", icon: ShieldCheck },
    { title: "Consentimentos", path: "/enterprise/rh/consentimentos", icon: FileCheck },
    { title: "Retenção de dados", path: "/enterprise/rh/retencao-dados", icon: Database },
    { title: "Políticas", path: "/enterprise/rh/politicas", icon: Lock },
    { title: "Canal Direto RH", path: "/enterprise/sos-rh", icon: MessageSquare },
    { title: "Auditoria", path: "/enterprise/rh/auditoria", icon: History },

  ];

  const operationCards = [
    { title: "Billing", desc: "Gestão financeira", icon: CreditCard, path: "/enterprise/rh/billing" },
    { title: "Licenças", desc: "Controle de planos", icon: FileCheck },
    { title: "Convites", desc: "Gestão de acessos", icon: UserPlus },
    { title: "Importação", desc: "Dados de colaboradores", icon: Upload },
    { title: "SSO", desc: "Login corporativo", icon: Key },
    { title: "Domínio", desc: "Validação oficial", icon: Globe },
    { title: "Integrações", desc: "Ecossistema tech", icon: Puzzle },
    { title: "Suporte", desc: "Cuidado direto", icon: HelpCircle },
  ];

  const recentActivity = [
    { title: "Política Enterprise atualizada", date: "Há 2 horas", icon: ShieldCheck },
    { title: "Novo admin regional adicionado", date: "Há 5 horas", icon: UserPlus },
    { title: "Organização Latam criada", date: "Ontem", icon: Building2 },
    { title: "Consentimentos atualizados", date: "Há 2 dias", icon: FileCheck },
    { title: "Exportação executiva gerada", date: "Há 3 dias", icon: Upload },
    { title: "Integração Google Workspace", date: "Há 1 semana", icon: Puzzle },
  ];

  return (
    <EnterpriseRHLayout title="Central Admin">
      <div className="space-y-12 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop" 
                  alt="Marina Costa" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F88A2B] uppercase tracking-wider">Enterprise Active</div>
              <h2 className="font-bold text-sm">Marina Costa</h2>
              <p className="text-[10px] text-zinc-400">Diretora de RH Enterprise</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0B0908] text-white shadow-md hover:bg-zinc-800 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-bold text-[#0B0908]">Central Administrativa</h1>
          <p className="text-xs text-zinc-500">Governança organizacional, privacidade e operações Enterprise em um único espaço.</p>
        </div>
        {/* Hero Principal */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-14 text-[#0B0908] relative overflow-hidden shadow-sm border border-zinc-100 group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F88A2B]/5 blur-[120px] rounded-full -mr-40 -mt-40 transition-opacity group-hover:opacity-80"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-[#F88A2B]">
              <div className="w-10 h-10 rounded-full bg-[#F88A2B]/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Governança protegida</span>
            </div>
            
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-['Playfair_Display'] leading-tight text-[#0B0908]">
                A inteligência organizacional precisa de uma <span className="text-[#F88A2B]">base ética</span> sólida.
              </h2>
              <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-2xl">
                O Enterprise conecta cultura, governança e privacidade em uma operação organizacional sofisticada.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-32 opacity-5 pointer-events-none">
            <svg viewBox="0 0 1000 100" className="w-full h-full preserve-3d">
              <path d="M0,50 Q250,0 500,50 T1000,50" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M0,70 Q250,20 500,70 T1000,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F88A2B]/5 flex items-center justify-center text-[#F88A2B] mb-6 group-hover:scale-110 transition-transform">
                <kpi.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0B0908]">{kpi.value}</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">{kpi.label}</div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Governança Organizacional */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Governança organizacional</h3>
            <div className="h-px flex-1 bg-zinc-100 mx-6 hidden md:block"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {governanceCards.map((card, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => navigate(card.path)}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col justify-between cursor-pointer hover:border-[#F88A2B]/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="space-y-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-[#0B0908] group-hover:bg-[#F88A2B] group-hover:text-white transition-colors">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-[#0B0908]">{card.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{card.desc}</p>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-[#F88A2B] transition-colors">
                  Acessar área <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Privacidade & Compliance */}
        <section className="space-y-8">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Privacidade & Compliance</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {privacyCards.map((card, idx) => (
              <motion.button 
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(card.path)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center gap-4 text-center hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[#F88A2B]/10 group-hover:text-[#F88A2B] transition-colors">
                  <card.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#0B0908] uppercase tracking-tight">{card.title}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Operação Enterprise */}
        <section className="space-y-8">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Operação Enterprise</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {operationCards.map((card, idx) => (
              <div 
                key={idx} 
                onClick={() => card.path && navigate(card.path)}
                className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white hover:border-[#F88A2B]/20 transition-all cursor-pointer group flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0B0908] group-hover:bg-[#0B0908] group-hover:text-white transition-all">
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B0908]">{card.title}</h4>
                  <p className="text-[10px] text-zinc-400">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Status Organizacional */}
        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-zinc-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#F88A2B]">Status organizacional</h3>
              <p className="text-xl font-['Playfair_Display'] font-bold text-[#0B0908]">A operação Enterprise está em conformidade total e protegida.</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Todos os protocolos de anonimização e segurança de dados estão ativos e validados.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { label: "Compliance", val: "Ativo", icon: ShieldCheck },
                { label: "Anonimização", val: "Ativa", icon: Lock },
                { label: "Exportações", val: "Protegidas", icon: Upload },
                { label: "Canal Direto", val: "Protegido", icon: MessageSquare },
                { label: "SSO", val: "Conectado", icon: Key },
                { label: "Domínio", val: "Validado", icon: Globe }
              ].map((status, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{status.val}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium">{status.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leitura Estratégica & Atividade Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Leitura estratégica</h3>
            <div className="bg-white/40 backdrop-blur-md border border-white p-8 rounded-[2.5rem] shadow-sm space-y-8 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#F88A2B]/10 blur-2xl rounded-full" />
              
              <div className="space-y-4">
                <Sparkles className="w-8 h-8 text-[#F88A2B]" />
                <p className="text-sm md:text-base text-[#0B0908] leading-relaxed font-medium">
                  “A estrutura organizacional demonstra maturidade crescente em governança emocional, privacidade e inteligência coletiva.”
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/60">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-600 uppercase">Eficiência administrativa +12%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold text-zinc-600 uppercase">Tempo de onboarding reduzido</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Próximas recomendações</h3>
              <div className="space-y-3">
                {[
                  "Revisar retenção trimestral",
                  "Expandir onboarding Latam",
                  "Atualizar admins regionais",
                  "Fortalecer rituais organizacionais"
                ].map((rec, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-50 flex items-center justify-between group cursor-pointer hover:border-[#F88A2B]/20 transition-all">
                    <span className="text-xs font-bold text-[#0B0908]">{rec}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#F88A2B] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Atividade recente</h3>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100 space-y-8">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex gap-6 relative">
                  {idx !== recentActivity.length - 1 && <div className="absolute left-[15px] top-10 w-[1px] h-12 bg-zinc-100" />}
                  <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 relative z-10 group-hover:bg-[#F88A2B]/10 group-hover:text-[#F88A2B] transition-colors">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pb-8 border-b border-zinc-50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-[#0B0908]">{item.title}</p>
                      <span className="text-[10px] text-zinc-400 font-medium">{item.date}</span>
                    </div>
                    <p className="text-xs text-zinc-500">Ação registrada via painel de governança central.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Princípio do Enterprise */}
        <section className="bg-[#0B0908] rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F88A2B]/5 blur-[120px] rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="space-y-8 md:w-1/2">
              <div className="bg-[#F88A2B]/10 text-[#F88A2B] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-[#F88A2B]/20 w-fit">
                Ética por desenho
              </div>
              <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] leading-tight">
                Governança existe para proteger pessoas.
              </h2>
              <p className="text-zinc-400 text-sm md:text-lg leading-relaxed">
                O Enterprise foi desenhado para ajudar organizações a evoluir emocionalmente sem transformar cuidado em vigilância.
              </p>
            </div>

            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Privacidade preservada", icon: Lock },
                { title: "Inteligência coletiva", icon: Sparkles },
                { title: "Ética organizacional", icon: ShieldCheck },
                { title: "Anonimização ativa", icon: EyeOff },
                { title: "Governança transparente", icon: Globe }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                  <item.icon className="w-5 h-5 text-[#F88A2B] mb-4" />
                  <span className="text-xs font-bold">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 pt-8">
          <button 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            className="flex-1 bg-[#F88A2B] text-white py-6 rounded-[2rem] font-bold text-base shadow-xl shadow-[#F88A2B]/20 active:scale-[0.98] transition-all hover:bg-[#e07a20] flex items-center justify-center gap-3"
          >
            <LayoutDashboard className="w-5 h-5" /> Acessar dashboard executivo
          </button>
          <button 
            onClick={() => navigate('/enterprise')}
            className="flex-1 bg-white text-[#0B0908] border border-zinc-200 py-6 rounded-[2rem] font-bold text-base active:scale-[0.98] transition-all hover:bg-zinc-50 flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-5 h-5" /> Voltar ao Enterprise
          </button>
        </div>

        <footer className="pt-8 pb-12 text-center">
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[400px] mx-auto italic">
            "A administração Enterprise deve equilibrar governança, privacidade e humanidade para fortalecer o ecossistema emocional da organização."
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseAdminCenterScreen;