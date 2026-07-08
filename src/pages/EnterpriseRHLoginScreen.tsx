import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  Chrome, 
  MonitorCheck,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";


const EnterpriseRHLoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signInWithPassword, isAuthenticated, hasAnyRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && hasAnyRole(["owner", "rh_admin"])) {
      navigate("/enterprise/rh/welcome", { replace: true });
    }
  }, [isAuthenticated, loading, hasAnyRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    setSubmitting(true);
    const { error } = await signInWithPassword(email, password);
    setSubmitting(false);
    if (error) toast.error(error.message);
  };

  const handleForgotPassword = () => {
    toast.success("Enviaremos instruções de recuperação para seu e-mail corporativo.");
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7] flex items-center justify-center p-6 font-montserrat">
      <div className="animate-fade-in max-w-[1200px] w-full text-[#0B0908]">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch min-h-[600px]">
          
          {/* Left Column: Hero/Info (Dark Premium) */}
          <section className="lg:col-span-7 bg-[#0B0908] rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl text-white flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/10 blur-[120px] rounded-full -mr-64 -mt-64 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8">
                <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Ambiente Administrativo</span>
              </div>
              
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
                Bem-vindo ao Enterprise RH.
              </h1>
              
              <p className="text-white/60 text-lg lg:text-xl leading-relaxed mb-12 font-light max-w-lg">
                Gerencie sua organização, acompanhe sinais coletivos e promova a inteligência emocional com total segurança e privacidade.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: CheckCircle2, text: "Dashboards agregados" },
                  { icon: ShieldCheck, text: "Privacidade garantida" },
                  { icon: Building2, text: "Gestão organizacional" },
                  { icon: Sparkles, text: "Onboarding assistido" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                      <item.icon className="w-5 h-5 text-[#F88A2B]" />
                    </div>
                    <span className="text-xs font-medium text-white/70 uppercase tracking-widest">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Login Card */}
          <section className="lg:col-span-5 flex flex-col justify-center gap-8">
            <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-10 md:p-12 border border-white/40 shadow-2xl">
              <div className="mb-10">
                <h2 className="font-playfair text-3xl mb-3 text-[#0B0908]">Acessar Admin</h2>
                <p className="text-sm text-[#0B0908]/40 leading-relaxed font-medium">Entre com suas credenciais corporativas.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-2">E-mail corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B0908]/20" />
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu-email@empresa.com"
                      className="h-14 pl-12 rounded-2xl border-[#0B0908]/5 bg-white focus:border-[#F88A2B] focus:ring-[#F88A2B]/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60">Senha</label>
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] font-bold text-[#F88A2B] hover:underline uppercase tracking-widest"
                    >
                      Esqueci
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B0908]/20" />
                    <Input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-14 pl-12 rounded-2xl border-[#0B0908]/5 bg-white focus:border-[#F88A2B] focus:ring-[#F88A2B]/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 bg-[#0B0908] text-white rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 group hover:bg-[#0B0908]/90"
                >
                  <span>{submitting ? "Entrando..." : "Entrar no Enterprise RH"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#0B0908]/5"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-transparent px-4 text-[9px] font-bold text-[#0B0908]/20 uppercase tracking-widest">Sistemas Integrados</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12 rounded-xl border-[#0B0908]/5 hover:bg-[#0B0908]/5 transition-all flex items-center justify-center gap-2 text-[10px] font-bold text-[#0B0908]/60 uppercase tracking-tighter"
                >
                  <Chrome className="w-3.5 h-3.5" />
                  <span>Google</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 rounded-xl border-[#0B0908]/5 hover:bg-[#0B0908]/5 transition-all flex items-center justify-center gap-2 text-[10px] font-bold text-[#0B0908]/60 uppercase tracking-tighter"
                >
                  <MonitorCheck className="w-3.5 h-3.5" />
                  <span>Microsoft</span>
                </Button>
              </div>
            </div>

            {/* Support info */}
            <div className="text-center px-8">
              <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-bold leading-relaxed">
                Acesso restrito a administradores autorizados.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseRHLoginScreen;
