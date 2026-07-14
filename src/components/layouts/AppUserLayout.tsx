import React from "react";
import { useIsDesktop } from "@/hooks/use-desktop";
import { useAudience } from "@/hooks/use-audience";
import RevealFooter from "../RevealFooter";
import { AppDesktopSidebar } from "./AppDesktopSidebar";
import { AppDesktopTopbar } from "./AppDesktopTopbar";
import { EnterpriseUserLayout } from "./EnterpriseUserLayout";
import { AppMobileHeader } from "./AppMobileHeader";
import BottomNav from "../BottomNav";
import { useLocation } from "react-router-dom";
import { EmployeeCommandPalette } from "../employee/EmployeeCommandPalette";
import { trackRoute, pingMotivation } from "@/lib/employeePrefs";

interface BaseLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
}

const MOBILE_BOTTOM_PAD = "calc(72px + env(safe-area-inset-bottom))";

/**
 * AppUserLayout (audience-aware)
 * - Mobile: header padrão + conteúdo + BottomNav fixo.
 * - Desktop B2C: sidebar + topbar.
 * - Desktop Enterprise User: chrome Enterprise.
 * - RH: passthrough (EnterpriseRHLayout cuida).
 */
export const AppUserLayout = ({ children }: BaseLayoutProps) => {
  const isDesktop = useIsDesktop();
  const audience = useAudience();
  const location = useLocation();

  React.useEffect(() => {
    if (audience === "rh") return;
    trackRoute(location.pathname);
    pingMotivation();
  }, [location.pathname, audience]);

  const paletteEnabled = audience !== "rh";

  if (!isDesktop) {
    if (audience === "rh") return <>{children}</>;
    return (
      <div className="min-h-[100dvh] bg-[#F7F4F2]">
        <AppMobileHeader />
        <div style={{ paddingBottom: MOBILE_BOTTOM_PAD }}>{children}</div>
        <BottomNav />
        {paletteEnabled && <EmployeeCommandPalette />}
      </div>
    );
  }

  if (audience === "rh") {
    return <>{children}</>;
  }

  if (audience === "enterprise-user") {
    return (
      <EnterpriseUserLayout>
        {children}
        {paletteEnabled && <EmployeeCommandPalette />}
      </EnterpriseUserLayout>
    );
  }

  return (
    <>
      <div className="min-h-[100dvh] bg-[#F7F4F2] flex font-display relative z-10">
        <AppDesktopSidebar />

        <div className="flex-1 ml-[260px] flex flex-col min-w-0">
          <AppDesktopTopbar />

          <main className="flex-1 w-full max-w-[1440px] mx-auto px-10 py-8">
            {children}
          </main>

          <div className="h-[400px] pointer-events-none" />
        </div>
      </div>

      <RevealFooter />
      {paletteEnabled && <EmployeeCommandPalette />}
    </>
  );
};
