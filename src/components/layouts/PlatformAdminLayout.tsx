import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/organizations", label: "Organizações" },
  { to: "/admin/subscriptions", label: "Assinaturas" },
  { to: "/admin/billing", label: "Financeiro" },
  { to: "/admin/ai-usage", label: "Inteligência Artificial" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/system", label: "System Health" },
  { to: "/admin/support", label: "Suporte" },
  { to: "/admin/audit", label: "Auditoria" },
  { to: "/admin/content", label: "Content — Dashboard" },
  { to: "/admin/content/authors", label: "Content — Autores" },
  { to: "/admin/content/categories", label: "Content — Categorias" },
  { to: "/admin/content/tags", label: "Content — Tags" },
  { to: "/admin/settings", label: "Configurações" },
];

export const PlatformAdminLayout = ({ children }: { children: ReactNode }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#0B0908] text-white font-montserrat flex">
      <aside className="w-[240px] border-r border-white/10 p-6 flex flex-col gap-2">
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Meu Caminho</p>
          <p className="text-lg font-black text-[#F88A2B]">Super Admin</p>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? "bg-[#F88A2B] text-black" : "text-white/70 hover:bg-white/5"
                }`
              }
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-white/10 text-xs text-white/50">
          <p className="mb-2">{profile?.display_name || profile?.full_name || "Admin"}</p>
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="text-[#F88A2B] hover:underline"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="px-3 py-2 bg-[#F88A2B]/10 border-b border-[#F88A2B]/20 text-[11px] text-[#F88A2B] text-center">
          Painel operacional. Dados individuais de colaboradores não são acessíveis neste ambiente.
        </div>
        <div className="p-10 max-w-[1440px] mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default PlatformAdminLayout;