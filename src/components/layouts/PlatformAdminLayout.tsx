import { ReactNode, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  UserCog,
  CreditCard,
  Wallet,
  Sparkles,
  Activity,
  LifeBuoy,
  ShieldCheck,
  FolderKanban,
  Library,
  BookOpen,
  GraduationCap,
  Route,
  Podcast,
  Video,
  Music,
  FileText,
  Tags,
  Users,
  Layers,
  Import,
  Settings,
  ChevronDown,
  Search,
  Bell,
  HelpCircle,
  BookMarked,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoMark from "@/assets/login-abstract.png";

type NavItem = { to: string; label: string; icon: any };
type NavGroup = { key: string; label: string; icon?: any; collapsible?: boolean; items: NavItem[] };

const groups: NavGroup[] = [
  {
    key: "overview",
    label: "Visão Geral",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    key: "platform",
    label: "Plataforma",
    items: [
      { to: "/admin/organizations", label: "Organizações", icon: Building2 },
      { to: "/admin/owners", label: "Owners", icon: UserCog },
      { to: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
      { to: "/admin/billing", label: "Financeiro", icon: Wallet },
      { to: "/admin/ai-usage", label: "IA", icon: Sparkles },
      { to: "/admin/system", label: "System Health", icon: Activity },
      { to: "/admin/support", label: "Suporte", icon: LifeBuoy },
      { to: "/admin/audit", label: "Auditoria", icon: ShieldCheck },
    ],
  },
  {
    key: "content",
    label: "Content Studio",
    icon: FolderKanban,
    collapsible: true,
    items: [
      { to: "/admin/content", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/content/library", label: "Biblioteca", icon: Library },
      { to: "/admin/content/books", label: "Livros", icon: BookOpen },
      { to: "/admin/content/courses", label: "Cursos", icon: GraduationCap },
      { to: "/admin/content/tracks", label: "Trilhas", icon: Route },
      { to: "/admin/content/podcasts", label: "Podcasts", icon: Podcast },
      { to: "/admin/content/videos", label: "Vídeos", icon: Video },
      { to: "/admin/content/audios", label: "Áudios", icon: Music },
      { to: "/admin/content/materials", label: "Materiais", icon: FileText },
      { to: "/admin/content/categories", label: "Categorias", icon: Tags },
      { to: "/admin/content/authors", label: "Autores", icon: Users },
      { to: "/admin/content/collections", label: "Coleções", icon: Layers },
      { to: "/admin/content/tags", label: "Tags", icon: Tags },
      { to: "/admin/content/imports", label: "Importações", icon: Import },
    ],
  },
  {
    key: "settings",
    label: "Configurações",
    icon: Settings,
    collapsible: true,
    items: [
      { to: "/admin/settings", label: "Geral", icon: Settings },
      { to: "/admin/settings/ai", label: "IA", icon: Sparkles },
      { to: "/admin/settings/billing", label: "Billing", icon: CreditCard },
      { to: "/admin/settings/oauth", label: "OAuth", icon: ShieldCheck },
      { to: "/admin/settings/resend", label: "Resend", icon: FileText },
      { to: "/admin/settings/lgpd", label: "LGPD", icon: ShieldCheck },
      { to: "/admin/settings/rate-limits", label: "Rate Limits", icon: Activity },
      { to: "/admin/settings/flags", label: "Feature Flags", icon: Layers },
      { to: "/admin/settings/env", label: "Variáveis", icon: FileText },
      { to: "/admin/settings/maintenance", label: "Manutenção", icon: Settings },
    ],
  },
];

export const PlatformAdminLayout = ({ children }: { children: ReactNode }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const initiallyOpen = useMemo(() => {
    const set: Record<string, boolean> = {};
    for (const g of groups) {
      if (g.collapsible) {
        set[g.key] = g.items.some((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
      }
    }
    return set;
  }, [pathname]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initiallyOpen);

  const initials =
    (profile?.display_name || profile?.full_name || "SA")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="min-h-[100dvh] flex bg-[#F6F7FB] font-montserrat text-[#0F172A]">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-[72px]" : "w-[248px]"
        } shrink-0 bg-[#0F172A] text-slate-200 flex flex-col transition-[width] duration-200 ease-out`}
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
              <p className="text-sm font-bold text-white leading-tight mt-1">Super Admin</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {groups.map((g) => {
            const isOpen = g.collapsible ? openGroups[g.key] ?? false : true;
            return (
              <div key={g.key}>
                {g.collapsible ? (
                  <button
                    onClick={() =>
                      setOpenGroups((s) => ({ ...s, [g.key]: !s[g.key] }))
                    }
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 text-[12px] font-semibold"
                  >
                    {g.icon && <g.icon className="w-4 h-4 shrink-0" />}
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left uppercase tracking-wider">
                          {g.label}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
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
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-6 sticky top-0 z-30">
          <div className="ml-auto w-full max-w-[360px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar organizações, owners, conteúdos…"
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-100 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <button className="w-10 h-10 grid place-items-center rounded-lg hover:bg-slate-100" title="Notificações">
              <Bell className="w-[18px] h-[18px]" />
            </button>
            <button className="w-10 h-10 grid place-items-center rounded-lg hover:bg-slate-100" title="Ajuda">
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>
            <button className="w-10 h-10 grid place-items-center rounded-lg hover:bg-slate-100" title="Documentação">
              <BookMarked className="w-[18px] h-[18px]" />
            </button>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-semibold text-slate-800 leading-tight">
                {profile?.display_name || profile?.full_name || "Admin"}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">Platform Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F88A2B] to-[#e07020] text-white grid place-items-center text-xs font-bold">
              {initials}
            </div>
            <button
              onClick={async () => { await signOut(); navigate("/login", { replace: true }); }}
              className="w-10 h-10 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#F88A2B]"
              title="Sair"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </header>

        {/* Scoped light theme for admin pages */}
        <main className="flex-1 min-w-0">
          <div className="admin-surface p-8 max-w-[1440px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default PlatformAdminLayout;