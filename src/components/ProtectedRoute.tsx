import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, type AppRole } from "@/hooks/useAuth";

interface Props {
  children: ReactNode;
  requiredRoles?: AppRole[];
  redirectTo?: string;
  requireEmployeeProfile?: boolean;
}

const ProtectedRoute = ({ children, requiredRoles, redirectTo = "/login", requireEmployeeProfile }: Props) => {
  const { isAuthenticated, loading, hasAnyRole, hasEmployeeProfile } = useAuth();
  const location = useLocation();

  const denied = !loading && isAuthenticated && requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles);
  const needsOnboarding =
    !loading &&
    isAuthenticated &&
    requireEmployeeProfile &&
    hasAnyRole(["employee", "leader"]) &&
    !hasAnyRole(["owner", "rh_admin"]) &&
    !hasEmployeeProfile;

  useEffect(() => {
    if (denied) toast.error("Acesso negado para este perfil.");
  }, [denied]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F4F2] font-montserrat">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#F88A2B]/20 border-t-[#F88A2B] animate-spin" />
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#0B0908]/40 font-bold">Carregando…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (denied) {
    return <Navigate to="/" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;