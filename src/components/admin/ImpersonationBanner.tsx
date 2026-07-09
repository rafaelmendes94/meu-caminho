import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const KEY = "impersonation_target";

export function setImpersonation(target: { email: string; owner_id: string; organization_name?: string }) {
  sessionStorage.setItem(KEY, JSON.stringify(target));
}

const ImpersonationBanner = () => {
  const [target, setTarget] = useState<null | { email: string; organization_name?: string }>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setTarget(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  if (!target) return null;

  const exit = async () => {
    sessionStorage.removeItem(KEY);
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="sticky top-0 z-50 bg-red-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between gap-3">
      <span>
        Você está utilizando <b>impersonation</b> como {target.email}
        {target.organization_name ? ` — ${target.organization_name}` : ""}.
      </span>
      <button
        onClick={exit}
        className="px-3 py-1 rounded-md bg-white/15 hover:bg-white/25 transition-colors"
      >
        Voltar ao Super Admin
      </button>
    </div>
  );
};

export default ImpersonationBanner;