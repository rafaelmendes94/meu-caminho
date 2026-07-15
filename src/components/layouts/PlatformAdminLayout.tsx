import { ReactNode, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronsLeft, ChevronsRight, Star, Command as CommandIcon, Menu, X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import logoMark from "@/assets/login-abstract.webp";
import { adminNavGroups, flattenAdminNav } from "@/components/admin/adminNav";
import {
  getFavorites, isFavorite, toggleFavorite, pushRecent, useAdminPrefsVersion,
} from "@/lib/adminPrefs";
import CommandPalette from "@/components/admin/CommandPalette";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const groups = adminNavGroups;

export const PlatformAdminLayout = ({ children }: { children: ReactNode }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useAdminPrefsVersion();

  // Fecha o drawer mobile ao trocar de rota.
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Track recents from current pathname
  useEffect(() => {
    const match = flattenAdminNav().find((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
    if (match) pushRecent({ to: match.to, label: match.label });
  }, [pathname]);

  // ⌘K / Ctrl+K
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
    for (const g of groups) {
      if (g.collapsible) {
        set[g.key] = g.items.some((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
      }
    }
    return set;
  }, [pathname]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initiallyOpen);

  void profile;

  const favorites = getFavorites();

  const renderNav = (isMobile: boolean) => (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
      {(isMobile || !collapsed) && favorites.length > 0 && (
        <div className="space-y-3">
          <div>
            <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold flex items-center gap-1.5">
              <Star className="w-3 h-3" /> Favoritos
            </p>
            <ul className="space-y-0.5">
              {favorites.map((f) => (
                <li key={`fav-${f.to}`}>
                  <NavLink
                    to={f.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
                        isActive ? "bg-[#F88A2B] text-black" : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Star className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                    <span className="truncate">{f.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="h-px bg-white/5 mx-2" />
        </div>
      )}

      {(isMobile || !collapsed) && (
        <button
          onClick={() => { setPaletteOpen(true); if (isMobile) setMobileOpen(false); }}
          className="mx-2 w-[calc(100%-1rem)] flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[12px] font-medium transition-colors"
        >
          <CommandIcon className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Pesquisa rápida</span>
          <span className="text-[10px] text-slate-500 font-mono">⌘K</span>
        </button>
      )}

      {groups.map((g) => {
        const isOpen = g.collapsible ? openGroups[g.key] ?? false : true;
        const showLabels = isMobile || !collapsed;
        return (
          <div key={g.key}>
            {g.collapsible ? (
              <button
                onClick={() => setOpenGroups((s) => ({ ...s, [g.key]: !s[g.key] }))}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 text-[12px] font-semibold"
              >
                {g.icon && <g.icon className="w-4 h-4 shrink-0" />}
                {showLabels && (
                  <>
                    <span className="flex-1 text-left uppercase tracking-wider">{g.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>
            ) : (
              showLabels && (
                <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
                  {g.label}
                </p>
              )
            )}

            {isOpen && (
              <ul className={`mt-1 space-y-0.5 ${g.collapsible && showLabels ? "pl-2" : ""}`}>
                {g.items.map((i) => (
                  <li key={i.to} className="group/nav relative">
                    <NavLink
                      to={i.to}
                      end
                      title={!showLabels ? i.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                          isActive ? "bg-[#F88A2B] text-black" : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <i.icon className="w-4 h-4 shrink-0" />
                      {showLabels && <span className="truncate flex-1">{i.label}</span>}
                      {showLabels && !isMobile && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite({ to: i.to, label: i.label }); }}
                          className="opacity-0 group-hover/nav:opacity-100 transition-opacity p-0.5 -mr-1 rounded hover:bg-white/10"
                          title={isFavorite(i.to) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          aria-label="Favoritar item"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFavorite(i.to) ? "fill-amber-300 text-amber-300 opacity-100" : "text-slate-400"}`} />
                        </button>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

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
              <p className="text-sm font-bold text-white leading-tight mt-1">Super Admin</p>
            </div>
          )}
        </div>

        {renderNav(false)}

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="h-11 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white hover:bg-white/5"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <><ChevronsLeft className="w-4 h-4" /> Recolher</>}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-[#0F172A] text-white flex items-center gap-3 px-4 border-b border-white/5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button aria-label="Abrir menu" className="p-2 -ml-2 rounded-lg hover:bg-white/10">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] bg-[#0F172A] text-slate-200 border-r border-white/5 flex flex-col">
              <div className="h-14 px-4 flex items-center gap-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-white grid place-items-center overflow-hidden shrink-0 ring-1 ring-white/10">
                  <img src={logoMark} alt="Meu Caminho" className="w-5 h-5 object-contain" style={{ mixBlendMode: "multiply" }} draggable={false} />
                </div>
                <p className="text-sm font-bold text-white">Super Admin</p>
              </div>
              {renderNav(true)}
            </SheetContent>
          </Sheet>
          <div className="w-8 h-8 rounded-lg bg-white grid place-items-center overflow-hidden ring-1 ring-white/10">
            <img src={logoMark} alt="" className="w-5 h-5 object-contain" style={{ mixBlendMode: "multiply" }} draggable={false} />
          </div>
          <p className="text-sm font-bold flex-1 truncate">Super Admin</p>
          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Pesquisa rápida"
            className="p-2 -mr-2 rounded-lg hover:bg-white/10"
          >
            <CommandIcon className="w-5 h-5" />
          </button>
        </header>

        <AdminTopbar
          variant="super"
          title="Platform Admin"
          onSignOut={async () => { await signOut(); navigate("/login", { replace: true }); }}
        />

        {/* Scoped light theme for admin pages */}
        <main className="flex-1 min-w-0">
          <div className="admin-surface p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">{children}</div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
};

export default PlatformAdminLayout;