import { useState } from "react";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "lucide-react";

export default function PlatformAccountScreen() {
  const { profile, user, refresh } = useAuth();
  const [name, setName] = useState(profile?.display_name || profile?.full_name || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Perfil atualizado"); refresh(); }
  };

  return (
    <PlatformAdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-slate-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Minha conta</h1>
          <p className="text-xs text-slate-500">Informações do administrador</p>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl space-y-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full h-11 px-3 rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email</label>
          <input value={user?.email || ""} readOnly
            className="mt-1 w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500" />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Perfil</label>
          <p className="mt-1 text-sm text-slate-700">Platform Admin</p>
        </div>
        <button onClick={save} disabled={saving}
          className="h-11 px-6 rounded-lg bg-[#F88A2B] text-white text-sm font-bold hover:bg-[#e07020] disabled:opacity-50">
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </PlatformAdminLayout>
  );
}