import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useOrgFeatures } from "@/hooks/useOrgFeatures";
import type { RhFlagKey } from "@/lib/orgSettings";

interface Props {
  feature: RhFlagKey | string;
  /** When true, redirect to fallback route instead of rendering nothing. */
  redirect?: boolean;
  fallbackTo?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Gate rendering of a route or section on an organization feature flag.
 * If the flag is off, renders `fallback` (or redirects to `fallbackTo`).
 * While loading org settings, renders nothing to avoid flashing gated UI.
 */
export const FeatureGate = ({ feature, redirect, fallbackTo = "/enterprise/rh/dashboard", fallback = null, children }: Props) => {
  const { loading, hasFeature } = useOrgFeatures();
  if (loading) return null;
  if (hasFeature(feature)) return <>{children}</>;
  if (redirect) return <Navigate to={fallbackTo} replace />;
  return <>{fallback}</>;
};