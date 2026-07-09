import React from "react";
import { EnterpriseRHLayout as StandardLayout } from "../EnterpriseRHNavigation";
import ImpersonationBanner from "../admin/ImpersonationBanner";

interface EnterpriseRHLayoutProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Proxy layout to EnterpriseRHNavigation to ensure consistency and single source of truth.
 * All Enterprise RH screens should use this or EnterpriseRHNavigation directly.
 */
export const EnterpriseRHLayout = ({ children, title }: EnterpriseRHLayoutProps) => {
  return (
    <StandardLayout title={title || "Enterprise RH"}>
      <ImpersonationBanner />
      {children}
    </StandardLayout>
  );
};
