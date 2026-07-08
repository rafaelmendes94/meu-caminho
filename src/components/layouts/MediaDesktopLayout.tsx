import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-desktop";
import RevealFooter from "../RevealFooter";
import { AppDesktopSidebar } from "./AppDesktopSidebar";
import { AppDesktopTopbar } from "./AppDesktopTopbar";

interface MediaDesktopLayoutProps {
  title?: string;
  subtitle?: string;
  backTo?: string;
  sidePanel?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Layout desktop para telas de mídia (leitor, player áudio/vídeo/aula/podcast).
 * Mobile e tablet (< 1024px): passthrough.
 * Desktop (lg+): sidebar + topbar + grid 2 colunas (player + painel lateral sticky).
 */
export const MediaDesktopLayout = ({
  title,
  subtitle,
  backTo,
  sidePanel,
  children,
}: MediaDesktopLayoutProps) => {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  if (!isDesktop) return <>{children}</>;

  const location = useLocation();
  const isEnterprise = location.pathname.startsWith('/enterprise');

  return (
    <>
      <div className="min-h-[100dvh] bg-[#F7F4F2] flex font-display relative z-10">
        <AppDesktopSidebar />

        <div className="flex-1 ml-[260px] flex flex-col min-w-0">
          <AppDesktopTopbar />

          <main className="flex-1 w-full max-w-[1440px] mx-auto px-10 py-8">
            {(title || backTo) && (
              <div className="flex items-center gap-4 mb-6">
                {backTo && (
                  <button
                    onClick={() => navigate(backTo)}
                    className="flex items-center gap-2 text-sm font-bold text-[#0B0908]/60 hover:text-[#F88A2B] transition-colors font-montserrat"
                  >
                    <ArrowLeft size={16} /> Voltar
                  </button>
                )}
                <div className="min-w-0">
                  {title && (
                    <h1 className="font-playfair text-2xl xl:text-3xl font-bold text-[#0B0908] leading-tight truncate">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-[#0B0908]/50 font-montserrat truncate">{subtitle}</p>
                  )}
                </div>
              </div>
            )}

            <div className={sidePanel ? "grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8" : ""}>
              <div className="min-w-0">
                <div className="bg-white rounded-3xl ring-1 ring-black/5 overflow-hidden shadow-sm">
                  {children}
                </div>
              </div>

              {sidePanel && (
                <aside className="hidden xl:block">
                  <div className="sticky top-24 space-y-4">{sidePanel}</div>
                </aside>
              )}
            </div>
          </main>

          {!isEnterprise && <div className="h-[400px] pointer-events-none" />}
        </div>
      </div>
      {!isEnterprise && <RevealFooter />}
    </>
  );
};

/* ---------- helpers de painel reaproveitáveis ---------- */

export const SidePanelCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-3xl ring-1 ring-black/5 p-5">
    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0B0908]/40 font-montserrat mb-4">
      {title}
    </h3>
    {children}
  </div>
);

export const SidePanelList = ({
  items,
}: {
  items: { label: string; meta?: string; active?: boolean; done?: boolean }[];
}) => (
  <ul className="space-y-1">
    {items.map((it, i) => (
      <li
        key={i}
        className={[
          "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-montserrat transition-colors",
          it.active
            ? "bg-[#F88A2B]/10 text-[#0B0908] font-bold"
            : "text-[#0B0908]/70 hover:bg-[#F0EDE9]",
        ].join(" ")}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span
            className={[
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
              it.done
                ? "bg-[#F88A2B] text-white"
                : it.active
                ? "bg-white ring-2 ring-[#F88A2B] text-[#F88A2B]"
                : "bg-[#F0EDE9] text-[#0B0908]/40",
            ].join(" ")}
          >
            {it.done ? "✓" : i + 1}
          </span>
          <span className="truncate">{it.label}</span>
        </span>
        {it.meta && <span className="text-[11px] text-[#0B0908]/40 shrink-0">{it.meta}</span>}
      </li>
    ))}
  </ul>
);
