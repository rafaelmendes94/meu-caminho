import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck } from "lucide-react";

const EnterpriseAcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Token inválido");
    if (password.length < 8) return toast.error("Senha deve ter no mínimo 8 caracteres");
    if (!accepted) return toast.error("Você precisa aceitar a política de privacidade");
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("accept-enterprise-invite", {
      body: { token, full_name: fullName, password, accepted_privacy: true },
    });
    setSubmitting(false);
    const err = (data as { error?: string } | null)?.error ?? error?.message;
    if (err) return toast.error(err);
    toast.success("Convite aceito. Faça login para continuar.");
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#F7F4F2] font-montserrat flex items-center justify-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white border border-[#E5E0DA] rounded-3xl p-8 shadow-sm space-y-6">
        <header className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#F88A2B]" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Convite Enterprise</p>
          <h1 className="text-2xl font-black text-[#0B0908]">Ativar sua jornada</h1>
          <p className="text-sm text-[#666]">Crie sua senha para acessar o Meu Caminho Enterprise.</p>
        </header>
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0B0908]/50">Nome completo</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#E5E0DA] bg-white focus:outline-none focus:border-[#F88A2B]" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0B0908]/50">Senha</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full h-12 px-4 rounded-xl border border-[#E5E0DA] bg-white focus:outline-none focus:border-[#F88A2B]" />
          </label>
          <label className="flex items-start gap-3 text-sm text-[#0B0908]/70 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 w-4 h-4 accent-[#F88A2B]" />
            <span>Li e aceito a política de privacidade Enterprise, entendendo que minha experiência individual é confidencial.</span>
          </label>
        </div>
        <button type="submit" disabled={submitting} className="w-full h-14 rounded-2xl bg-[#F88A2B] text-white font-bold disabled:opacity-60">
          {submitting ? "Ativando..." : "Ativar minha jornada"}
        </button>
      </form>
    </main>
  );
};

export default EnterpriseAcceptInvitePage;