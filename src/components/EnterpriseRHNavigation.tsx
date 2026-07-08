import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutGrid, 
  AlertTriangle, 
  ShieldAlert,
  Users, 
  ChevronRight,
  FileText,
  BarChart3,
  Map,
  TrendingUp,
  HeartPulse,
  ShieldCheck,
  Share2,
  Bell,
  Download,
  Lock,
  Settings,
  MessageSquare,
  Sparkles,
  Zap,
  LogOut,
  User,
  ChevronDown,
  MoreHorizontal,
  Network,
  Dna,
  Sparkle
} from "lucide-react";
import logoMark from "@/assets/login-abstract.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppMobileHeader } from "./layouts/AppMobileHeader";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const EnterpriseNavItem = ({ to, icon: Icon, label }: NavItemProps) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex flex-col items-center justify-center gap-1 transition-colors relative px-1 sm:px-2.5 py-1 group
      ${isActive ? 'text-[#F88A2B]' : 'text-[#0B0908]/40 hover:text-[#0B0908]/60'}
    `}
  >
    {({ isActive }) => (
      <>
        <div className="relative">
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-500 group-active:scale-90" />
          {isActive && (
            <div className="absolute inset-0 bg-[#F88A2B]/20 blur-md rounded-full -z-10 animate-pulse" />
          )}
        </div>
        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] font-montserrat transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
          {label}
        </span>
      </>
    )}
  </NavLink>
);

const SidebarItem = ({ to, icon: Icon, label }: NavItemProps) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
      ${isActive ? 'bg-[#F88A2B] text-white shadow-lg shadow-[#F88A2B]/20' : 'text-[#666] hover:bg-black/5 hover:text-[#111]'}
    `}
  >
    <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
    <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
  </NavLink>
);

const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2 py-4">
    <div className="flex items-center gap-3 px-4 mb-2">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0908]/30 font-montserrat">{title}</h4>
      <div className="h-px flex-1 bg-black/5" />
    </div>
    {children}
  </div>
);

export const EnterpriseRHBottomNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-fit max-w-[95vw] h-[72px] z-[60] flex items-center justify-center gap-0 px-8 sm:px-12 shadow-2xl"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 20px 50px -12px rgba(0,0,0,0.25), 0 4px 12px -4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.95)",
        borderRadius: "36px"
      }}
    >
      <EnterpriseNavItem to="/enterprise/rh/dashboard" icon={LayoutGrid} label="Insights" />
      <EnterpriseNavItem to="/enterprise/rh/mapa-emocional" icon={Map} label="Clima" />
      <EnterpriseNavItem to="/enterprise/rh/alertas" icon={AlertTriangle} label="Alertas" />
      <EnterpriseNavItem to="/enterprise/rh/denuncias" icon={ShieldAlert} label="Canal" />
      <EnterpriseNavItem to="/enterprise/rh/relatorio" icon={FileText} label="Docs" />
      <EnterpriseNavItem to="/enterprise/rh/equipe" icon={Users} label="Time" />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center justify-center gap-1 text-[#0B0908]/40 hover:text-[#0B0908]/60 px-1 sm:px-2.5 py-1 transition-all group outline-none">
            <MoreHorizontal size={20} className="transition-transform duration-500 group-active:scale-90" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] font-montserrat opacity-60">Mais</span>
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-[#F7F4F2] border-l border-[#F1EDE9] w-full sm:max-w-[440px] px-6 pb-12 pt-8 overflow-y-auto outline-none shadow-2xl flex flex-col">
          <div className="w-12 h-1.5 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111]/5 rounded-full mx-auto mb-8" />
          <SheetHeader className="text-left space-y-2 mb-10 relative">
            <SheetTitle className="text-2xl font-playfair italic flex items-center gap-2">
              Mais opções <Sparkles className="w-4 h-4 text-[#F88A2B] animate-pulse" />
            </SheetTitle>
            <SheetDescription className="text-sm font-medium text-[#0B0908]/40 font-montserrat">
              Ferramentas estratégicas do Enterprise RH
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6">
            <SidebarItem to="/enterprise/rh/central-admin" icon={Settings} label="Central Admin" />
            <SidebarItem to="/enterprise/rh/billing" icon={FileText} label="Billing" />
            <SidebarItem to="/enterprise/rh/suporte" icon={MessageSquare} label="Suporte" />
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export const EnterpriseRHLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/[0.03] overflow-hidden shrink-0">
      <img src={logoMark} alt="Meu Caminho" className="h-[18px] w-[18px] object-contain" style={{ mixBlendMode: "multiply" }} draggable={false} />
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-sm font-bold text-[#0B0908] whitespace-nowrap tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        Meu Caminho
      </span>
      <span className="text-[8px] uppercase tracking-[0.15em] font-extrabold text-[#F88A2B] whitespace-nowrap">
        Enterprise
      </span>
    </div>
  </div>
);

export const EnterpriseRHButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  className = "",
  icon: Icon,
  fullWidth = true
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  icon?: React.ElementType;
  fullWidth?: boolean;
}) => {
  const baseStyles = "relative h-[56px] rounded-full flex items-center justify-center gap-2.5 text-[14px] font-bold transition-all duration-300 active:scale-[0.98] outline-none px-6";
  const widthStyles = fullWidth ? "w-full" : "w-auto";
  
  const variants: Record<string, { background: string; border?: string; boxShadow: string; text: string }> = {
    primary: {
      background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
      boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.08) inset, 0 14px 30px -12px rgba(248,138,43,0.55), 0 6px 14px -2px rgba(248,138,43,0.30)",
      text: "text-white"
    },
    secondary: {
      background: "white",
      border: "border border-[#EFEAE5]",
      boxShadow: "0 8px 24px -12px rgba(0,0,0,0.10)",
      text: "text-[#111]"
    },
    outline: {
      background: "transparent",
      border: "border border-[#0B0908]/10",
      boxShadow: "none",
      text: "text-[#0B0908]/60"
    }
  };

  const v = variants[variant];

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${widthStyles} ${v.text} ${v.border || ""} ${className}`}
      style={{
        background: v.background,
        boxShadow: v.boxShadow
      }}
    >
      {Icon && <Icon size={18} className={variant === "primary" ? "text-white/90" : "text-[#F88A2B]"} />}
      <span className="uppercase tracking-widest">{children}</span>
    </button>
  );
};

export const EnterpriseRHLayout = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const navigate = useNavigate();
  return (
    <div className="h-screen bg-white flex font-montserrat relative z-10 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-[#0B0908]/5 p-6 flex-col h-full overflow-y-auto no-scrollbar z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
        <div className="mb-10 px-2 pt-2">
          <EnterpriseRHLogo />
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarSection title="Insights">
            <SidebarItem to="/enterprise/rh/dashboard" icon={LayoutGrid} label="Dashboard" />
            <SidebarItem to="/enterprise/rh/mapa-emocional" icon={Map} label="Mapa Emocional" />
            <SidebarItem to="/enterprise/rh/evolucao" icon={TrendingUp} label="Evolução" />
          </SidebarSection>

          <SidebarSection title="Governança">
            <SidebarItem to="/enterprise/rh/equipe" icon={Users} label="Equipe" />
            <SidebarItem to="/enterprise/rh/organograma" icon={Network} label="Organograma Vivo" />
            <SidebarItem to="/enterprise/rh/dna-organizacional" icon={Dna} label="DNA Organizacional" />
            <SidebarItem to="/enterprise/rh/conselho-executivo" icon={Sparkle} label="Conselho Executivo IA" />
            <SidebarItem to="/enterprise/rh/insights-semanais" icon={Sparkles} label="Insights Semanais IA" />
            <SidebarItem to="/enterprise/rh/alertas" icon={AlertTriangle} label="Alertas" />
            <SidebarItem to="/enterprise/rh/privacidade" icon={Lock} label="Privacidade" />
            <SidebarItem to="/enterprise/rh/compliance" icon={ShieldCheck} label="Compliance" />
          </SidebarSection>

          <SidebarSection title="Cultura">
             <SidebarItem to="/enterprise/rh/denuncias" icon={ShieldAlert} label="Canal Direto" />
             <SidebarItem to="/enterprise/rh/rituais" icon={Zap} label="Rituais" />
             <SidebarItem to="/enterprise/rh/rituais-inteligentes" icon={Sparkles} label="Rituais Inteligentes" />
             <SidebarItem to="/enterprise/rh/lideranca" icon={HeartPulse} label="Liderança" />
          </SidebarSection>
          
          <SidebarSection title="Operação">
            <SidebarItem to="/enterprise/rh/relatorio" icon={FileText} label="Relatórios" />
            <SidebarItem to="/enterprise/rh/central-admin" icon={Settings} label="Configurações" />
          </SidebarSection>
        </nav>

        {/* User Footer in Sidebar */}
        <div className="mt-8 pt-6 border-t border-black/5">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 w-full p-3 rounded-2xl text-[#666] hover:bg-red-50 hover:text-red-600 transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Sair do Admin</span>
          </button>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden shrink-0">
          <AppMobileHeader audience="rh" />
        </div>
        
        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-20 bg-white border-b border-[#0B0908]/5 items-center justify-between px-10 z-30 shrink-0">
          <div>
             <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0908]/40">{title}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-2xl bg-[#FBF9F7] flex items-center justify-center text-[#0B0908]/40 hover:bg-[#F88A2B]/10 hover:text-[#F88A2B] transition-all relative outline-none">
                  <Bell size={18} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#F88A2B] border-2 border-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 overflow-hidden font-montserrat border-black/5 shadow-2xl">
                <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#111]">Notificações Admin</h3>
                  <span className="bg-[#F88A2B]/10 text-[#F88A2B] text-[10px] font-bold px-2 py-0.5 rounded-full">3 novas</span>
                </div>
                <div className="max-h-[320px] overflow-y-auto no-scrollbar bg-white">
                  <div className="p-3 space-y-1">
                    <button className="w-full text-left p-3 rounded-xl hover:bg-[#F9F8F6] transition-all flex gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                        <AlertTriangle size={18} className="text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111] leading-tight mb-1">Alerta de Sobrecarga</p>
                        <p className="text-[11px] text-[#666] line-clamp-2">A equipe de Design apresentou níveis elevados de estresse.</p>
                        <span className="text-[9px] font-bold text-[#999] uppercase tracking-tighter mt-1 block">Agora</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-xl hover:bg-[#F9F8F6] transition-all flex gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                        <Zap size={18} className="text-[#F88A2B]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111] leading-tight mb-1">Ritual Concluído</p>
                        <p className="text-[11px] text-[#666] line-clamp-2">85% dos colaboradores participaram do ritual de hoje.</p>
                        <span className="text-[9px] font-bold text-[#999] uppercase tracking-tighter mt-1 block">1h atrás</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-xl hover:bg-[#F9F8F6] transition-all flex gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                        <FileText size={18} className="text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111] leading-tight mb-1">Relatório Mensal</p>
                        <p className="text-[11px] text-[#666] line-clamp-2">O relatório executivo de Maio já está disponível para download.</p>
                        <span className="text-[9px] font-bold text-[#999] uppercase tracking-tighter mt-1 block">3h atrás</span>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="p-2 bg-[#F9F8F6] border-t border-black/5">
                  <button 
                    onClick={() => navigate("/enterprise/rh/alertas")}
                    className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] hover:text-[#d7711d] transition-colors"
                  >
                    Ver Central de Alertas
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-4 border-l border-[#0B0908]/5 outline-none group">
                   <div className="text-right hidden sm:block">
                     <p className="text-[12px] font-bold text-[#111] group-hover:text-[#F88A2B] transition-colors">RH Admin</p>
                     <p className="text-[10px] font-medium text-[#666]">Premium Partner</p>
                   </div>
                   <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-black/10">A</div>
                   <ChevronDown size={14} className="text-[#0B0908]/20" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 font-montserrat">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-[#999] px-3 py-2">Minha Conta</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 px-3">
                  <User size={16} className="mr-2 text-[#666]" />
                  <span className="text-sm font-medium">Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 px-3">
                  <Settings size={16} className="mr-2 text-[#666]" />
                  <span className="text-sm font-medium">Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={() => navigate("/")} className="rounded-xl cursor-pointer py-2.5 px-3 text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut size={16} className="mr-2" />
                  <span className="text-sm font-medium">Sair do Painel</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 w-full overflow-y-auto relative no-scrollbar bg-white">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-8 pb-24 lg:pb-12 bg-white">
            {children}
          </div>
          
          {/* Mobile Bottom Nav */}
          <EnterpriseRHBottomNav />
        </main>
      </div>
    </div>
  );
};
