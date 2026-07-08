import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  Map,
  BookOpen,
  Sparkles,
  TrendingUp,
  Heart,
  History,
  Download,
  User,
  Settings,
} from "lucide-react";
import avatar from "@/assets/avatar-juliana.jpg";

import type { LucideIcon } from "lucide-react";
type Item = { to: string; label: string; icon: LucideIcon };

const principal: Item[] = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/explorar", label: "Explorar", icon: Compass },
  { to: "/jornada", label: "Jornada", icon: Map },
  { to: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { to: "/cury-digital", label: "Cury Digital", icon: Sparkles },
];

const voce: Item[] = [
  { to: "/progresso", label: "Progresso", icon: TrendingUp },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/downloads", label: "Downloads", icon: Download },
];

const conta: Item[] = [
  { to: "/perfil", label: "Perfil", icon: User },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

const NavItem = ({ to, label, icon: Icon }: Item) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      [
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
        isActive
          ? "bg-white text-[#0B0908] shadow-sm ring-1 ring-black/5"
          : "text-[#0B0908]/60 hover:text-[#0B0908] hover:bg-white/60",
      ].join(" ")
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          size={18}
          className={isActive ? "text-[#F88A2B]" : "text-[#0B0908]/40 group-hover:text-[#0B0908]/80"}
        />
        <span className="font-montserrat">{label}</span>
      </>
    )}
  </NavLink>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#0B0908]/40 font-bold font-montserrat px-3 mb-3">
    {children}
  </h3>
);

export const AppDesktopSidebar = () => {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  
  const principalItems = isEnterprise ? [
    { to: "/enterprise", label: "Início", icon: Home },
    { to: "/enterprise/trilha", label: "Trilha", icon: Map },
    { to: "/enterprise/cury-digital", label: "Cury AI", icon: Sparkles },
    { to: "/enterprise/feed", label: "Feed", icon: Home }, // Reaproveitando Home como feed se necessário ou mudando ícone
    { to: "/enterprise/biblioteca", label: "Biblioteca", icon: BookOpen },
  ] : principal;

  const voceItems = isEnterprise ? [
    { to: "/enterprise/progresso", label: "Progresso", icon: TrendingUp },
    { to: "/enterprise/favoritos", label: "Favoritos", icon: Heart },
  ] : voce;

  const contaItems = isEnterprise ? [
    { to: "/enterprise/menu", label: "Configurações", icon: Settings },
  ] : conta;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] bg-[#F0EDE9] border-r border-black/5 flex-col z-40">
      <div className="px-6 pt-8 pb-6">
        <div className="font-playfair text-2xl font-bold text-[#0B0908] tracking-tight leading-none">
          {isEnterprise ? "Meu Caminho" : "Meu Caminho"}
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#F88A2B] font-bold font-montserrat mt-2">
          {isEnterprise ? "Enterprise" : "Augusto Cury"}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-8 pb-6 no-scrollbar">
        <div>
          <SectionLabel>Principal</SectionLabel>
          <div className="space-y-1">
            {principalItems.map((i) => <NavItem key={i.to} {...i} />)}
          </div>
        </div>
        <div>
          <SectionLabel>Você</SectionLabel>
          <div className="space-y-1">
            {voceItems.map((i) => <NavItem key={i.to} {...i} />)}
          </div>
        </div>
        <div>
          <SectionLabel>Conta</SectionLabel>
          <div className="space-y-1">
            {contaItems.map((i) => <NavItem key={i.to} {...i} />)}
          </div>
        </div>
      </nav>

      <div className="px-4 pb-6">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white ring-1 ring-black/5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#0B0908] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {isEnterprise ? "C" : "J"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#0B0908] truncate font-montserrat">
              {isEnterprise ? "Colaborador" : "Juliana"}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[#F88A2B] font-bold">
              {isEnterprise ? "Plano Enterprise" : "Plano Premium"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
