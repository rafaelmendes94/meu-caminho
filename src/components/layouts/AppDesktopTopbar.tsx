import { Search, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAudienceLink } from "@/hooks/use-audience";
import { useLocation } from "react-router-dom";
import { useDisplayUser } from "@/hooks/use-display-user";
import { useAuth } from "@/hooks/useAuth";

export const AppDesktopTopbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const al = useAudienceLink();
  const isEnterprise = location.pathname.startsWith('/enterprise');
  const { firstName, initial, planLabel } = useDisplayUser();
  const { signOut } = useAuth();
  if (isEnterprise) return null;

  return (
    <header className="hidden lg:flex sticky top-0 z-30 h-[72px] bg-[#F7F4F2]/85 backdrop-blur-md border-b border-black/5 items-center px-10 gap-6">
      {!isEnterprise && (
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-3 px-4 h-11 rounded-full bg-white ring-1 ring-black/5 focus-within:ring-[#F88A2B]/40 transition-all">
            <Search size={18} className="text-[#0B0908]/40 shrink-0" />
            <input
              type="text"
              placeholder="Buscar conteúdos, livros, trilhas..."
              className="bg-transparent border-none outline-none w-full text-sm text-[#0B0908] placeholder:text-[#0B0908]/40 font-montserrat"
            />
          </div>
        </div>
      )}
      {isEnterprise && <div className="flex-1" />}

      {!isEnterprise && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1 pr-3 rounded-2xl bg-white ring-1 ring-black/5 hover:ring-black/10 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-[#0B0908] text-white flex items-center justify-center font-bold text-xs">
                {initial}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[12px] font-bold text-[#111] font-montserrat group-hover:text-[#F88A2B] transition-colors">
                  {firstName}
                </span>
                <span className="text-[10px] font-medium text-[#666]">
                  {planLabel}
                </span>
              </div>
              <ChevronDown size={14} className="text-[#0B0908]/20 group-hover:text-[#F88A2B] transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 font-montserrat">
            <DropdownMenuItem onClick={() => navigate(al("/perfil"))} className="cursor-pointer">
              <User size={16} className="mr-2" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(al("/configuracoes"))} className="cursor-pointer">
              <Settings size={16} className="mr-2" /> Configurações
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => { await signOut(); navigate("/login", { replace: true }); }} className="cursor-pointer text-red-600">
              <LogOut size={16} className="mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};
