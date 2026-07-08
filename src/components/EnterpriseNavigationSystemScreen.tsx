import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  LayoutGrid, 
  Activity, 
  AlertTriangle, 
  FileText, 
  BrainCircuit, 
  Map, 
  BarChart3, 
  Globe, 
  Users, 
  ShieldCheck, 
  Link, 
  Bell, 
  Download, 
  Lock, 
  MessageSquare, 
  Heart, 
  TrendingUp, 
  UserCircle,
  Search,
  Calendar,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  Plus
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseNavigationSystemScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("visão geral");

  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", path: "/enterprise/rh/dashboard" },
    { icon: Activity, label: "Pulso de capacidade", path: "/enterprise/rh/capacidade" },
    { icon: AlertTriangle, label: "Áreas em alerta", path: "/enterprise/rh/alertas" },
    { icon: FileText, label: "Relatórios", path: "/enterprise/rh/relatorio" },
    { icon: BrainCircuit, label: "Insights de IA", path: "/enterprise/rh/insights-ia" },
    { icon: Map, label: "Mapa emocional", path: "/enterprise/rh/mapa-emocional" },
    { icon: BarChart3, label: "Impacto organizacional", path: "/enterprise/rh/impacto" },
    { icon: Globe, label: "Benchmark emocional", path: "/enterprise/rh/benchmark" },
  ];

  const managementItems = [
    { icon: Users, label: "Equipe", path: "/enterprise/rh/equipe" },
    { icon: ShieldCheck, label: "Permissões", path: "/enterprise/rh/permissoes" },
    { icon: Link, label: "Integrações", path: "/enterprise/rh/integracoes" },
    { icon: Bell, label: "Notificações", path: "/enterprise/rh/notificacoes" },
    { icon: Download, label: "Exportações", path: "/enterprise/rh/exportacoes" },
    { icon: Lock, label: "Privacidade", path: "/enterprise/rh/privacidade" },
  ];

  const cultureItems = [
    { icon: MessageSquare, label: "Comunicados", path: "/enterprise/rh/comunicados" },
    { icon: Heart, label: "Rituais coletivos", path: "/enterprise/rh/rituais" },
    { icon: TrendingUp, label: "Evolução da jornada", path: "/enterprise/rh/evolucao" },
    { icon: Activity, label: "Saúde da liderança", path: "/enterprise/rh/saude-lideranca" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8 px-6 text-white/90">
      <div className="mb-10">
        <h1 className="text-xl font-playfair font-bold text-white tracking-tight flex flex-col leading-tight">
          Meu Caminho <span className="text-orange-500 text-xs uppercase tracking-[0.2em] font-montserrat mt-1">Enterprise</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1 font-montserrat">
          Inteligência emocional organizacional
        </p>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
        <div>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10 hover:text-white group"
                >
                  <item.icon size={18} className="text-white/40 group-hover:text-orange-400 transition-colors" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 px-3 mb-3 font-montserrat font-bold">
            Gestão
          </h3>
          <ul className="space-y-1">
            {managementItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10 hover:text-white group"
                >
                  <item.icon size={18} className="text-white/40 group-hover:text-orange-400 transition-colors" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 px-3 mb-3 font-montserrat font-bold">
            Cultura
          </h3>
          <ul className="space-y-1">
            {cultureItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10 hover:text-white group"
                >
                  <item.icon size={18} className="text-white/40 group-hover:text-orange-400 transition-colors" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="mt-auto pt-8">
        <div className="bg-gradient-to-br from-white/10 to-transparent p-4 rounded-2xl border border-white/10">
          <p className="text-xs text-white/60 leading-relaxed mb-3">
            Todos os indicadores são agregados e anônimos.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={10} />
            Enterprise Secure
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <EnterpriseRHLayout title="Sistema de navegação">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] flex flex-col md:flex-row font-montserrat">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] h-screen sticky top-0 overflow-hidden shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E0DA] flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-[#F0EDE9] rounded-full transition-colors">
                    <Menu size={24} className="text-[#0B0908]" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] border-none w-72">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#0B0908]/40 font-medium">
              <span>Enterprise</span>
              <ChevronRight size={14} />
              <span>RH</span>
              <ChevronRight size={14} />
              <span className="text-[#0B0908]">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden lg:flex items-center bg-[#F0EDE9] rounded-full px-4 py-2 text-sm text-[#0B0908]/60 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
              <Search size={16} className="mr-2" />
              <input 
                type="text" 
                placeholder="Buscar indicadores..." 
                className="bg-transparent border-none outline-none w-48"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#F0EDE9] rounded-full px-4 py-2 text-sm text-[#0B0908] font-medium">
              <Calendar size={16} className="text-orange-500" />
              <span>Últimos 30 dias</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 bg-white border border-[#E5E0DA] rounded-full text-[#0B0908] hover:bg-[#F0EDE9] transition-all relative outline-none">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 overflow-hidden font-montserrat border-[#E5E0DA] shadow-2xl">
                <div className="p-4 border-b border-[#E5E0DA] flex items-center justify-between bg-white">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#0B0908]">Notificações</h3>
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Demo</span>
                </div>
                <div className="p-4 bg-white text-center">
                  <p className="text-sm text-[#0B0908]/60 leading-relaxed">Esta é uma visualização prévia do sistema de notificações corporativo.</p>
                </div>
                <div className="p-2 bg-[#F7F4F2] border-t border-[#E5E0DA]">
                  <button className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-orange-500">
                    Acessar Central
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white shadow-sm cursor-pointer overflow-hidden ring-2 ring-[#F0EDE9]">
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-6 md:px-10 py-10 pb-32">
          {/* Header Section */}
          <div className="max-w-6xl mx-auto space-y-12">
            <div>
              <button 
                onClick={() => navigate('/enterprise/rh')}
                className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-wider mb-4 hover:gap-3 transition-all"
              >
                <ArrowLeft size={16} />
                Sistema de Navegação
              </button>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-[#0B0908] mb-4">
                Estrutura de Navegação <span className="text-orange-500">Premium</span>
              </h2>
              <p className="text-lg text-[#0B0908]/60 max-w-2xl leading-relaxed">
                Referência visual para o sistema organizacional do módulo Enterprise, projetado para clareza estratégica e calma cognitiva.
              </p>
            </div>

            {/* Tabs Contextuais */}
            <section className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0B0908]/40">
                Tabs Contextuais
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-4 border-b border-[#E5E0DA] pb-0.5">
                {["visão geral", "tendências", "impacto", "cultura", "prevenção"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                      activeTab === tab ? "text-orange-500" : "text-[#0B0908]/40 hover:text-[#0B0908]"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-full shadow-[0_-4px_12px_rgba(248,138,43,0.4)]"></div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Cards de Navegação Rápida */}
            <section className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0B0908]/40">
                Cards de Navegação Rápida
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Ver alertas críticos", icon: AlertTriangle, color: "text-red-500" },
                  { title: "Exportar board report", icon: FileText, color: "text-orange-500" },
                  { title: "Acompanhar liderança", icon: Users, color: "text-blue-500" },
                  { title: "Analisar evolução", icon: TrendingUp, color: "text-green-500" },
                  { title: "Configurar integrações", icon: Link, color: "text-purple-500" },
                  { title: "Abrir insights IA", icon: BrainCircuit, color: "text-orange-500" }
                ].map((card, i) => (
                  <button 
                    key={i}
                    className="group bg-white p-6 rounded-3xl border border-[#E5E0DA] hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl bg-[#F7F4F2] ${card.color} group-hover:scale-110 transition-transform`}>
                        <card.icon size={24} />
                      </div>
                      <span className="font-bold text-[#0B0908]">{card.title}</span>
                    </div>
                    <ChevronRight size={20} className="text-[#0B0908]/20 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </section>

            {/* Experiência Desktop Editorial */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-[#E5E0DA] relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10 space-y-6 max-w-2xl">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-3xl md:text-4xl font-playfair font-bold text-[#0B0908]">
                  O Enterprise precisa respirar como uma plataforma executiva.
                </h3>
                <p className="text-lg text-[#0B0908]/60 leading-relaxed">
                  A navegação deve reduzir ruído visual e aumentar clareza estratégica. Cada transição e elemento foi pensado para transmitir confiança e autoridade silenciosa.
                </p>
              </div>
            </section>

            {/* Princípios da Navegação */}
            <section className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#0B0908]/40">
                Princípios da Navegação
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  "Menos ruído visual",
                  "Mais foco emocional",
                  "Hierarquia clara",
                  "Movimento suave",
                  "Calma cognitiva",
                  "Leitura estratégica"
                ].map((principle, i) => (
                  <div key={i} className="bg-[#F0EDE9]/50 p-6 rounded-3xl border border-transparent hover:border-[#E5E0DA] hover:bg-white transition-all text-center">
                    <span className="text-sm font-bold text-[#0B0908] leading-tight block">
                      {principle}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Modo Executivo */}
            <section className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-16 text-white overflow-hidden relative">
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full -mb-32 -mr-32"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-xl space-y-6 text-center md:text-left">
                  <h3 className="text-3xl md:text-4xl font-playfair font-bold">
                    Uma interface silenciosa comunica confiança.
                  </h3>
                  <p className="text-lg text-white/60 leading-relaxed">
                    O design do Enterprise deve parecer uma leitura estratégica sofisticada — não uma central operacional pesada.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => navigate('/enterprise/rh/dashboard')}
                    className="px-8 py-5 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                  >
                    Acessar Dashboard RH
                  </button>
                  <button 
                    onClick={() => navigate('/enterprise/rh')}
                    className="px-8 py-5 bg-white/10 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all active:scale-95"
                  >
                    Voltar ao módulo RH
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseNavigationSystemScreen;
