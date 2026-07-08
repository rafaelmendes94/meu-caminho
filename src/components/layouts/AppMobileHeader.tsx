import React from "react";
import { useIsDesktop } from "@/hooks/use-desktop";
import { useAudience, type Audience } from "@/hooks/use-audience";
import logoMark from "@/assets/login-abstract.png";

interface AppMobileHeaderProps {
  /** Force a specific audience; otherwise inferred from the route. */
  audience?: Audience;
}

/**
 * Header padrão da versão app (mobile/tablet < 1024px).
 * - B2C: logo + "Meu Caminho".
 * - Enterprise User: logo + "Meu Caminho" / Enterprise.
 * - RH: logo + "Meu Caminho" / Enterprise · RH.
 * Desktop (>= 1024px) retorna null — chrome desktop usa sidebar/topbar próprias.
 */
export const AppMobileHeader: React.FC<AppMobileHeaderProps> = ({ audience: forced }) => {
  const isDesktop = useIsDesktop();
  const inferred = useAudience();
  const audience = forced ?? inferred;

  if (isDesktop) return null;

  const showEnterprise = audience !== "b2c";
  const enterpriseLabel = audience === "rh" ? "Enterprise · RH" : "Enterprise";

  return (
    <header className="sticky top-0 z-30 w-full bg-white backdrop-blur-md border-b border-[#0B0908]/5">
      <div className="max-w-[1180px] mx-auto px-5 h-16 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={logoMark}
            alt="Meu Caminho"
            className="h-7 w-7 object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <h1
            className="text-lg font-bold text-[#111] truncate"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Meu Caminho
          </h1>
          {showEnterprise && (
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F88A2B]">
              {enterpriseLabel}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppMobileHeader;
