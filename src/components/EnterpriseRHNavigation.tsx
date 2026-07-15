import { ReactNode, useEffect, useMemo, useState } from "react";
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
  Sparkle,
  Gauge,
  Activity,
  LayoutDashboard,
  Search,
  HelpCircle,
  BookMarked,
  Building2,
  Users2,
  UserPlus,
  Package,
  Layers,
  Brain,
  Compass,
  Send,
  ShieldQuestion,
  KeyRound,
  Globe,
  Wallet,
  Plug,
  ChevronsLeft,
  ChevronsRight,
  Briefcase,
} from "lucide-react";
import logoMark from "@/assets/login-abstract.webp";
import AdminTopbar from "@/components/admin/AdminTopbar";
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
import { useAuth } from "@/hooks/useAuth";
import RHCommandPalette from "@/components/enterprise/RHCommandPalette";
import { Command as CommandIcon } from "lucide-react";

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

type RHNavItem = { to: string; label: string; icon: React.ElementType };
type RHNavGroup = { key: string; label: string; icon?: React.ElementType; collapsible?: boolean; items: RHNavItem[] };

const rhGroups: RHNavGroup[] = [
  {
    key: "overview",
    label: "Visão Geral",
    items: [
      { to: "/enterprise/rh/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/enterprise/rh/score-organizacional", label: "Score Organizacional", icon: Gauge },
      { to: "/enterprise/rh/insights-semanais", label: "Insights Semanais", icon: Sparkles },
    ],
  },
  {
    key: "company",
    label: "Empresa",
    icon: Building2,
    collapsible: true,
    items: [
      { to: "/enterprise/rh/central-admin", label: "Central Admin", icon: Settings },
      { to: "/enterprise/rh/equipe", label: "Equipe", icon: Users },
      { to: "/enterprise/rh/equipe/convidar", label: "Convites", icon: UserPlus },
      { to: "/enterprise/rh/equipe/licencas", label: "Licenças", icon: KeyRound },
      { to: "/enterprise/rh/departamentos", label: "Departamentos", icon: Users2 },
      { to: "/enterprise/rh/unidades", label: "Unidades", icon: Package },
      { to: "/enterprise/rh/cargos", label: "Cargos", icon: Briefcase },
      { to: "/enterprise/rh/organograma", label: "Organograma Vivo", icon: Network },
    ],
  },
  {
    key: "intel",
    label: "Inteligência Humana",
    icon: Brain,
    collapsible: true,
    items: [
      { to: "/enterprise/rh/dna-organizacional", label: "DNA Organizacional", icon: Dna },
      { to: "/enterprise/rh/conselho-executivo", label: "Conselho Executivo IA", icon: Sparkle },
      { to: "/enterprise/rh/insights-ia", label: "Inteligência Preditiva", icon: Sparkles },
      { to: "/enterprise/rh/alertas", label: "Alertas", icon: AlertTriangle },
      { to: "/enterprise/rh/mapa-emocional", label: "Mapa Emocional", icon: Map },
      { to: "/enterprise/rh/capacidade", label: "Capacidade", icon: Activity },
    ],
  },
  {
    key: "actions",
    label: "Ações",
    icon: Compass,
    collapsible: true,
    items: [
      { to: "/enterprise/rh/plano-acao", label: "Planos de Ação", icon: FileText },
      { to: "/enterprise/rh/rituais-inteligentes", label: "Rituais Inteligentes", icon: Zap },
      { to: "/enterprise/rh/comunicados", label: "Comunicados", icon: Send },
      { to: "/enterprise/rh/impacto", label: "Motor de Impacto", icon: TrendingUp },
    ],
  },
  {
    key: "governance",
    label: "Governança",
    icon: ShieldCheck,
    collapsible: true,
    items: [
      { to: "/enterprise/rh/compliance", label: "Compliance", icon: ShieldCheck },
      { to: "/enterprise/rh/politicas", label: "Políticas", icon: ShieldQuestion },
      { to: "/enterprise/rh/privacidade", label: "Privacidade", icon: Lock },
      { to: "/enterprise/rh/retencao-dados", label: "Retenção de Dados", icon: Layers },
      { to: "/enterprise/rh/auditoria", label: "Auditoria", icon: FileText },
      { to: "/enterprise/rh/permissoes", label: "Permissões", icon: KeyRound },
      { to: "/enterprise/rh/multiplos-admins", label: "Multi Admins", icon: Users2 },
      { to: "/enterprise/rh/dominio", label: "Domínio", icon: Globe },
    ],
  },
  {
    key: "settings",
    label: "Configurações",
    icon: Settings,
    collapsible: true,
    items: [
      { to: "/enterprise/rh/configuracoes", label: "Configurações da Empresa", icon: Settings },
      { to: "/enterprise/rh/integracoes", label: "Integrações", icon: Plug },
      { to: "/enterprise/rh/billing", label: "Billing", icon: Wallet },
    ],
  },
];

export const EnterpriseRHLayout = ({ children, title }: { children: ReactNode; title?: string }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const initiallyOpen = useMemo(() => {
    const set: Record<string, boolean> = {};
    for (const g of rhGroups) {
      if (g.collapsible) {
        set[g.key] = g.items.some((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
      }
    }
    return set;
  }, [pathname]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initiallyOpen);

  const initials =
    (profile?.display_name || profile?.full_name || "AE")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-[100dvh] flex bg-[#F6F7FB] font-montserrat text-[#0F172A]">
      {/* Sidebar (desktop) */}
      <aside
        className={`${
          collapsed ? "w-[72px]" : "w-[248px]"
        } sticky top-0 h-[100dvh] shrink-0 bg-[#0F172A] text-slate-200 hidden lg:flex flex-col transition-[width] duration-200 ease-out overflow-hidden`}
      >
        <div className="h-16 px-4 flex items-center gap-3 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-white grid place-items-center overflow-hidden shrink-0 ring-1 ring-white/10">
            <img src={logoMark} alt="Meu Caminho" className="w-[22px] h-[22px] object-contain" style={{ mixBlendMode: "multiply" }} draggable={false} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Meu Caminho
              </p>
              <p className="text-sm font-bold text-white leading-tight mt-1">Admin Empresa</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {!collapsed && (
            <button
              onClick={() => setPaletteOpen(true)}
              className="mx-2 w-[calc(100%-1rem)] flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[12px] font-medium transition-colors"
            >
              <CommandIcon className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">Pesquisa rápida</span>
              <span className="text-[10px] text-slate-500 font-mono">⌘K</span>
            </button>
          )}
          {rhGroups.map((g) => {
            const isOpen = g.collapsible ? openGroups[g.key] ?? false : true;
            return (
              <div key={g.key}>
                {g.collapsible ? (
                  <button
                    onClick={() => setOpenGroups((s) => ({ ...s, [g.key]: !s[g.key] }))}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 text-[12px] font-semibold"
                  >
                    {g.icon && <g.icon className="w-4 h-4 shrink-0" />}
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left uppercase tracking-wider">{g.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </>
                    )}
                  </button>
                ) : (
                  !collapsed && (
                    <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
                      {g.label}
                    </p>
                  )
                )}

                {isOpen && (
                  <ul className={`mt-1 space-y-0.5 ${g.collapsible && !collapsed ? "pl-2" : ""}`}>
                    {g.items.map((i) => (
                      <li key={i.to}>
                        <NavLink
                          to={i.to}
                          end
                          title={collapsed ? i.label : undefined}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                              isActive
                                ? "bg-[#F88A2B] text-black"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`
                          }
                        >
                          <i.icon className="w-4 h-4 shrink-0" />
                          {!collapsed && <span className="truncate">{i.label}</span>}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="h-11 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white hover:bg-white/5"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <><ChevronsLeft className="w-4 h-4" /> Recolher</>}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden shrink-0">
          <AppMobileHeader audience="rh" />
        </div>

        <AdminTopbar variant="rh" title={title || "Admin Empresa"} onSignOut={handleSignOut} />

        <main className="flex-1 min-w-0 overflow-x-clip">
          <div className="admin-surface p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-[1440px] mx-auto">{children}</div>
          <EnterpriseRHBottomNav />
        </main>
      </div>
      <RHCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
};
