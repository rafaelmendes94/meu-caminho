import React from "react";
import BottomNav from "../BottomNav";
import logoMark from "@/assets/login-abstract.webp";
import { AppMobileHeader } from "./AppMobileHeader";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, 
  Map, 
  MessageSquare, 
  Layout, 
  BookOpen, 
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

interface BaseLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
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

export const EnterpriseUserLayout = ({ children, title }: BaseLayoutProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };
  
  return (
    <div className="h-screen bg-white flex font-montserrat relative z-10 overflow-hidden touch-none">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-[#0B0908]/5 p-6 flex-col h-full overflow-y-auto no-scrollbar z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
        <div className="mb-10 px-2 pt-2">
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
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem to="/enterprise" icon={Home} label="Home" />
          <SidebarItem to="/enterprise/trilha" icon={Map} label="Minha Trilha" />
          <SidebarItem to="/enterprise/cury-digital" icon={MessageSquare} label="Cury AI" />
          <SidebarItem to="/enterprise/feed" icon={Layout} label="Feed" />
          <SidebarItem to="/enterprise/biblioteca" icon={BookOpen} label="Biblioteca" />
        </nav>

        <div className="mt-auto pt-6 border-t border-black/5 space-y-2">
          <SidebarItem to="/enterprise/menu" icon={Settings} label="Configurações" />
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full p-3 rounded-2xl text-[#666] hover:bg-red-50 hover:text-red-600 transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden shrink-0">
          <AppMobileHeader audience="enterprise-user" />
        </div>

        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-20 bg-white/80 backdrop-blur-xl border-b border-[#0B0908]/5 items-center justify-between px-10 z-30 shrink-0">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0908]/40">{title || "Área do Colaborador"}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-2xl bg-[#FBF9F7] flex items-center justify-center text-[#0B0908]/40 hover:bg-[#F88A2B]/10 hover:text-[#F88A2B] transition-all outline-none">
                  <Bell size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 overflow-hidden font-montserrat border-black/5 shadow-2xl">
                <div className="p-4 border-b border-black/5 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#111]">Notificações</h3>
                </div>
                <div className="p-8 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#F9F8F6] flex items-center justify-center text-[#C9C2BB]">
                    <Bell size={18} />
                  </div>
                  <p className="text-sm font-semibold text-[#111]">Sem notificações</p>
                  <p className="text-[11px] text-[#666]">Você está em dia por aqui.</p>
                </div>
                <div className="p-2 bg-[#F9F8F6] border-t border-black/5">
                  <button 
                    onClick={() => navigate("/enterprise/notificacoes")}
                    className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] hover:text-[#d7711d] transition-colors"
                  >
                    Ver todas as notificações
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-4 border-l border-[#0B0908]/5 outline-none group">
                  <div className="text-right hidden sm:block">
                    <p className="text-[12px] font-bold text-[#111] group-hover:text-[#F88A2B] transition-colors">Colaborador</p>
                    <p className="text-[10px] font-medium text-[#666]">Plano Enterprise</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#0B0908] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-black/10 shrink-0">C</div>
                  <ChevronDown size={14} className="text-[#0B0908]/20" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 font-montserrat">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-[#999] px-3 py-2">Minha Conta</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("/enterprise/menu")} className="rounded-xl cursor-pointer py-2.5 px-3">
                  <User size={16} className="mr-2 text-[#666]" />
                  <span className="text-sm font-medium">Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={handleSignOut} className="rounded-xl cursor-pointer py-2.5 px-3 text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut size={16} className="mr-2" />
                  <span className="text-sm font-medium">Sair da Conta</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 w-full overflow-y-auto relative bg-white pb-20 lg:pb-0 touch-pan-y">
          <div className="w-full max-w-full mx-auto">
            <div className="px-5 lg:px-8 py-0 lg:py-2">
              {children}
            </div>
          </div>
          
          <BottomNav />
          
        </main>
      </div>
    </div>
  );
};
