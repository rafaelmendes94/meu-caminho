import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Building2, AlertCircle } from "lucide-react";

type InviteInfo = {
  status: "valid" | "accepted" | "canceled" | "declined" | "expired";
  email: string;
  full_name: string | null;
  role: string;
  organization_name: string | null;
  organization_logo: string | null;
};

const EnterpriseAcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) { setLoadError("Token ausente."); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("enterprise-invite-info", { body: { token } });
      if (!alive) return;
      const err = (data as { error?: string } | null)?.error ?? error?.message;
      if (err) setLoadError(err === "invalid_token" ? "Convite não encontrado." : err);
      else {
        setInfo(data as InviteInfo);
        setFullName((data as InviteInfo).full_name ?? "");
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [token]);

  const statusMessage = (s: InviteInfo["status"]) => {
    switch (s) {
      case "accepted": return "Este convite já foi aceito. Faça login para continuar.";
      case "canceled": return "Este convite foi cancelado pela empresa.";
      case "declined": return "Este convite foi recusado.";
      case "expired": return "Este convite expirou. Peça um novo à sua empresa.";
      default: return null;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Token inválido");
    if (!fullName.trim() || fullName.trim().length < 3) return toast.error("Informe seu nome completo");
    if (password.length < 8) return toast.error("Senha deve ter no mínimo 8 caracteres");
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return toast.error("A senha deve conter letras e números");
    if (password !== confirmPassword) return toast.error("As senhas não coincidem");
    if (!accepted) return toast.error("Você precisa aceitar a política de privacidade");
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("accept-enterprise-invite", {
      body: { token, full_name: fullName, password, accepted_privacy: true },
    });
    setSubmitting(false);
    const err = (data as { error?: string } | null)?.error ?? error?.message;
    if (err) {
      const map: Record<string, string> = {
        invalid_token: "Convite inválido.",
        already_accepted: "Este convite já foi aceito.",
        canceled: "Convite cancelado.",
        declined: "Convite recusado.",
        expired: "Convite expirado.",
        privacy_consent_required: "É preciso aceitar a política de privacidade.",
      };
      return toast.error(map[err] ?? err);
    }
    toast.success("Convite aceito. Faça login para continuar.");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F4F2] font-montserrat flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#F88A2B]/20 border-t-[#F88A2B] animate-spin" />
      </main>
    );
  }

  if (loadError || !info) {
    return (
      <main className="min-h-screen bg-[#F7F4F2] font-montserrat flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border border-[#E5E0DA] rounded-3xl p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
          <h1 className="text-xl font-black text-[#0B0908]">Convite inválido</h1>
          <p className="text-sm text-[#666]">{loadError ?? "Não foi possível carregar este convite."}</p>
          <button onClick={() => navigate("/login", { replace: true })} className="h-11 px-6 rounded-xl bg-[#F88A2B] text-white font-bold">Ir para login</button>
        </div>
      </main>
    );
  }

  const blockedMsg = statusMessage(info.status);
  if (blockedMsg) {
    return (
      <main className="min-h-screen bg-[#F7F4F2] font-montserrat flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border border-[#E5E0DA] rounded-3xl p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 mx-auto text-amber-500" />
          <h1 className="text-xl font-black text-[#0B0908]">Convite indisponível</h1>
          <p className="text-sm text-[#666]">{blockedMsg}</p>
          <button onClick={() => navigate("/login", { replace: true })} className="h-11 px-6 rounded-xl bg-[#F88A2B] text-white font-bold">Ir para login</button>
        </div>
      </main>
    );
  }

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
        <div className="rounded-2xl bg-[#F7F4F2] border border-[#E5E0DA] p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[#0B0908]">
            <Building2 className="w-4 h-4 text-[#F88A2B]" />
            <span className="font-bold">{info.organization_name ?? "Sua empresa"}</span>
          </div>
          <p className="text-[#666]">Convite enviado para <strong className="text-[#0B0908]">{info.email}</strong></p>
        </div>
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0B0908]/50">Nome completo</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-[#E5E0DA] bg-white focus:outline-none focus:border-[#F88A2B]" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0B0908]/50">Senha</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8, com letras e números" className="w-full h-12 px-4 rounded-xl border border-[#E5E0DA] bg-white focus:outline-none focus:border-[#F88A2B]" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0B0908]/50">Confirmar senha</span>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className="w-full h-12 px-4 rounded-xl border border-[#E5E0DA] bg-white focus:outline-none focus:border-[#F88A2B]" />
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