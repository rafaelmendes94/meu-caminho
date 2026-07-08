import { Link, useLocation } from "react-router-dom";

const HomeIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10.5z" />
  </svg>
);
const TrilhaIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 20c2-4 4-4 7-4s5 0 7-4" />
    <circle cx="5" cy="20" r="1.4" fill={color} stroke="none" />
    <circle cx="12" cy="16" r="1.4" fill={color} stroke="none" />
    <circle cx="19" cy="12" r="1.4" fill={color} stroke="none" />
  </svg>
);
const CuryAIIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8c0 1.3.8 2.4 2 2.8V15a3 3 0 0 0 3 3h.5V4H9z" />
    <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8c0 1.3-.8 2.4-2 2.8V15a3 3 0 0 1-3 3h-.5V4H15z" />
  </svg>
);
const FeedIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="6" rx="2" />
    <rect x="4" y="13" width="16" height="3" rx="1.2" />
    <rect x="4" y="18" width="10" height="3" rx="1.2" />
  </svg>
);
const BibliotecaIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" />
    <path d="M4 19a2 2 0 0 0 2 2h13" />
  </svg>
);
const MenuIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="5" cy="6" r="1.4" fill={color} stroke="none" />
    <circle cx="5" cy="12" r="1.4" fill={color} stroke="none" />
    <circle cx="5" cy="18" r="1.4" fill={color} stroke="none" />
    <line x1="10" y1="6" x2="20" y2="6" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <line x1="10" y1="18" x2="20" y2="18" />
  </svg>
);

const getNavItems = (isEnterprise: boolean) => [
  { label: "Home", Icon: HomeIcon, to: isEnterprise ? "/enterprise" : "/home", match: ["/home", "/enterprise"] },
  { label: "Trilha", Icon: TrilhaIcon, to: isEnterprise ? "/enterprise/trilha" : "/trilha", match: ["/trilha"] },
  { label: "Cury AI", Icon: CuryAIIcon, to: isEnterprise ? "/enterprise/cury-digital" : "/cury-digital", match: ["/chat", "/cury-digital"] },
  { label: "Feed", Icon: FeedIcon, to: isEnterprise ? "/enterprise/feed" : "/feed", match: ["/feed"] },
  { label: "Biblioteca", Icon: BibliotecaIcon, to: isEnterprise ? "/enterprise/biblioteca" : "/biblioteca", match: ["/biblioteca", "/conteudo"] },
  { label: "Menu", Icon: MenuIcon, to: isEnterprise ? "/enterprise/menu" : "/menu", match: ["/menu", "/perfil", "/sobre-expert"] },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const navItems = getNavItems(isEnterprise);
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 px-3 pt-2 bg-[#F7F4F2]/95 backdrop-blur-md border-t border-black/5"
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      aria-label="Navegação principal"
    >
      <div
        className="mx-auto max-w-[640px] rounded-[26px] px-1.5 pt-1.5"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow:
            "0 18px 40px -18px rgba(0,0,0,0.35), 0 2px 6px -2px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.9)",
        }}
      >
        <div className="grid grid-cols-6">
          {navItems.map(({ label, Icon, to, match }) => {
            const active = match.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));
            const color = active ? "#F88A2B" : "#7A7A7A";
            return (
              <Link key={label} to={to} className="flex flex-col items-center gap-1 py-1.5 relative">
                <Icon color={color} />
                <span className="text-[9.5px] font-semibold tracking-tight" style={{ color }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
