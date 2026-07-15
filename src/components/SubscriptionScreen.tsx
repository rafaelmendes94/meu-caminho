import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Crown, Check, CreditCard, Calendar, Download, 
  RefreshCcw, ShieldCheck, Sparkles, Building2, Users, ArrowRight,
  Info, History, Wallet, Lock
} from "lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const brand = "#F88A2B";
const serif = { fontFamily: "'Playfair Display', serif" };

const benefits = [
  "Acesso completo a todos os cursos e trilhas",
  "Biblioteca premium liberada todo mês",
  "Cury IA ilimitado · conversas e insights",
  "Audiolivros e meditações guiadas",
  "Conteúdos offline e sem anúncios",
];

const SubscriptionScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const { organization } = useAuth();
  const orgName = organization?.name ?? "Sua empresa";

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Minha Assinatura Corporativa">
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
          
          {/* SaaS Header / Hero */}
          <section className="bg-white rounded-[40px] p-8 lg:p-14 shadow-sm border border-black/5 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50/50 blur-[100px] rounded-full -mr-48 -mt-48" />
            
            <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest">
                <Crown size={12} fill="currentColor" /> Benefício Corporativo Ativo
              </div>
              <h1 className="text-4xl lg:text-6xl font-playfair font-bold text-[#111] leading-tight">
                Sua jornada<br />
                <span className="text-orange-500">Premium & Ilimitada.</span>
              </h1>
              <p className="text-base text-[#666] leading-relaxed max-w-xl">
                Sua empresa disponibilizou o acesso completo ao ecossistema Meu Caminho. Aproveite todos os recursos de saúde emocional sem custos adicionais.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                 <div className="flex items-center gap-3 px-6 py-4 bg-[#F9F8F6] rounded-2xl border border-black/5">
                    <Building2 className="text-orange-500" size={20} />
                    <div className="text-left">
                       <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Plano vinculado a</p>
                       <p className="text-sm font-bold text-[#111]">{orgName}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 px-6 py-4 bg-[#F9F8F6] rounded-2xl border border-black/5">
                    <Users className="text-purple-500" size={20} />
                    <div className="text-left">
                       <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Tipo de Plano</p>
                       <p className="text-sm font-bold text-[#111]">Enterprise Unlimited</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="w-full lg:w-[380px] relative z-10 shrink-0">
               <div className="bg-[#0B0908] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/10 blur-2xl" />
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Crown size={24} className="text-white" />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em]">Status do Plano</p>
                        <p className="text-lg font-bold">Ativo</p>
                     </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-white/40">Empresa</span>
                        <span className="font-bold truncate max-w-[200px] text-right">{orgName}</span>
                     </div>
                     <div className="h-px w-full bg-white/5" />
                     <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400/80 uppercase tracking-widest">
                        <ShieldCheck size={12} /> Gerenciado pela sua empresa
                     </div>
                  </div>

                  <div className="w-full py-4 bg-white/5 text-white/70 border border-white/10 rounded-2xl text-xs text-center leading-relaxed px-4">
                    Todos os custos e detalhes contratuais são administrados pela sua empresa.
                  </div>
               </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              {/* Benefits Card */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
                <h2 className="text-xl font-bold text-[#111] mb-8 flex items-center gap-3">
                  <Sparkles size={20} className="text-orange-500" /> Benefícios Inclusos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-[#F9F8F6] border border-black/[0.03]">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-green-500 shrink-0">
                        <Check size={20} strokeWidth={3} />
                      </div>
                      <p className="text-sm font-bold text-[#111] leading-snug">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 space-y-8">
                <h2 className="text-xl font-bold text-[#111]">Gestão da Conta</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                      <Lock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111]">Gerenciar Privacidade</p>
                      <p className="text-[10px] text-[#8A8A8A]">Acesse o Centro de Dados</p>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-black/5" />

                <p className="text-[11px] text-[#8A8A8A] leading-relaxed text-center">
                  Pausas, saídas e alterações no plano são solicitadas ao RH da sua empresa.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#111] to-[#222] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
                 <Info className="absolute -top-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
                 <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-3 font-playfair">Dúvidas?</h3>
                    <p className="text-xs text-white/50 leading-relaxed mb-6">Entre em contato com o suporte da sua empresa ou com o nosso time de acolhimento.</p>
                    <button onClick={() => navigate('/enterprise/fale-conosco')} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Suporte Enterprise</button>
                 </div>
              </div>
            </div>

          </div>

          <div className="text-center pt-10">
            <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest flex items-center justify-center gap-2">
              Meu Caminho · Plano Corporativo · Todos os direitos reservados
            </p>
          </div>
        </div>
      </EnterpriseUserLayout>
    );
  }

  // Mobile/Legacy Layout
  return (
    <AppUserLayout>
      <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
        <div
          className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
          style={{ background: "#F7F4F2", paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(70% 30% at 50% 6%, rgba(248,138,43,0.16) 0%, transparent 70%)" }} />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-sm active:scale-95 transition">
              <ChevronLeft size={18} className="text-[#444]" />
            </button>
            <p className="text-[14px] text-[#444]">Assinatura</p>
            <div className="w-10 h-10" />
          </div>

          <div className="relative z-10 flex-1 px-5 pb-4 overflow-y-auto no-scrollbar">
            <h1 style={serif} className="text-[34px] leading-[1.05] text-[#111] mt-1">Sua jornada<br/>premium</h1>
            <p className="text-[12.5px] text-[#8A8A8A] mt-2">Gerencie seu plano, pagamentos e benefícios.</p>

            <div className="mt-5 relative rounded-3xl overflow-hidden p-5 text-white shadow-xl" style={{ background: "linear-gradient(135deg, #F88A2B 0%, #E07A2B 50%, #C25E1A 100%)" }}>
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Crown size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.22em] font-bold opacity-80 uppercase">Plano Ativo</p>
                    <p className="text-base font-bold leading-tight">Premium Anual</p>
                  </div>
                </div>
                <p className="mt-6 text-[11px] opacity-80 font-bold uppercase tracking-widest">Próxima renovação</p>
                <p className="text-2xl font-bold" style={serif}>12 Mar 2027</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-[10px] font-bold backdrop-blur uppercase tracking-wider">
                  <ShieldCheck size={12} /> Renovação Ativa
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { Icon: CreditCard, label: "Pagamento" },
                { Icon: Calendar, label: "Histórico" },
                { Icon: Download, label: "Recibos" },
              ].map(({ Icon, label }) => (
                <button key={label} className="bg-white rounded-2xl py-4 flex flex-col items-center gap-2 border border-black/5 shadow-sm active:scale-95 transition">
                  <Icon size={20} className="text-[#F88A2B]" />
                  <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest">{label}</span>
                </button>
              ))}
            </div>

            <p className="mt-8 text-[10px] font-bold tracking-widest text-[#B89673] uppercase px-2 mb-3">Seus Benefícios</p>
            <div className="bg-white rounded-3xl border border-black/5 shadow-sm divide-y divide-black/[0.03]">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-4">
                  <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-green-500" strokeWidth={3} />
                  </div>
                  <p className="text-[13px] text-[#111] font-medium leading-tight">{b}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <button className="w-full p-4 bg-white rounded-2xl border border-black/5 flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><RefreshCcw size={18} /></div>
                <span className="text-sm font-bold text-[#111]">Pausar Assinatura</span>
              </button>
              <button className="w-full p-4 bg-white rounded-2xl border border-black/5 flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500"><ShieldCheck size={18} /></div>
                <span className="text-sm font-bold text-red-500">Cancelar Assinatura</span>
              </button>
            </div>
            
            <p className="mt-8 text-center text-[10px] text-[#999] px-4 leading-relaxed">
              Você pode cancelar a qualquer momento. O acesso continua até o fim do período pago.
            </p>

            <div className="h-10" />
          </div>
        </div>
      </main>
    </AppUserLayout>
  );
};

export default SubscriptionScreen;