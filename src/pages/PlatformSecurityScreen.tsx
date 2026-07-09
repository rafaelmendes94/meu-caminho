import { useState } from "react";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function PlatformSecurityScreen() {
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (pwd.length < 8) { toast.error("Senha deve ter no mínimo 8 caracteres"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Senha atualizada"); setPwd(""); }
  };

  return (
    <PlatformAdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-6 h-6 text-slate-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Segurança</h1>
          <p className="text-xs text-slate-500">Senha e proteção da conta</p>
        </div>
      </div>
      <div className="grid gap-4 max-w-xl">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Alterar senha</h2>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)}
            placeholder="Nova senha (mínimo 8 caracteres)"
            className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none text-sm mb-3" />
          <button onClick={changePassword} disabled={saving || !pwd}
            className="h-11 px-6 rounded-lg bg-[#0F172A] text-white text-sm font-bold hover:bg-[#1e293b] disabled:opacity-50">
            {saving ? "Salvando…" : "Alterar senha"}
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-2">Sessões ativas</h2>
          <p className="text-xs text-slate-500">Você está autenticado nesta sessão. Para revogar, faça logout.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-2">Autenticação em duas etapas (MFA)</h2>
          <p className="text-xs text-slate-500">Recurso em breve.</p>
        </div>
      </div>
    </PlatformAdminLayout>
  );
}