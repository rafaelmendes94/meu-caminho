import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle, 
  ArrowLeft, 
  Crown, 
  Receipt,
  CheckCircle2,
  ExternalLink,
  Info,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";
import { toast } from "sonner";

const EnterpriseBillingScreen = () => {
  const navigate = useNavigate();

  const handleExpansionRequest = () => {
    toast.success("Solicitação de expansão enviada.", {
      description: "Um especialista entrará em contato em breve.",
      style: {
        background: "#0B0908",
        color: "#FFF",
        border: "none"
      }
    });
  };

  const planFeatures = [
    "IA de apoio emocional",
    "Insights de IA",
    "Relatórios executivos",
    "Benchmark organizacional",
    "SSO corporativo",
    "Integrações enterprise",
    "Suporte prioritário",
    "Rituais organizacionais"
  ];

  const licenseKPIs = [
    { label: "Licenças contratadas", value: "250", icon: Crown },
    { label: "Licenças em uso", value: "198", icon: Users },
    { label: "Convites pendentes", value: "21", icon: FileText },
    { label: "Disponíveis", value: "31", icon: CheckCircle2 },
  ];

  const invoices = [
    { date: "Março 2026", plan: "Enterprise Growth", status: "Pago" },
    { date: "Fevereiro 2026", plan: "Enterprise Growth", status: "Pago" },
    { date: "Janeiro 2026", plan: "Enterprise Growth", status: "Pago" },
  ];

  const activeResources = [
    { title: "IA de apoio emocional", desc: "Assistente conversacional para acolhimento emocional", icon: Sparkles },
    { title: "Check-ins emocionais", desc: "Mapeamento anônimo de clima", icon: Heart },
    { title: "Insights IA", desc: "Análise preditiva de tendências", icon: TrendingUp },
    { title: "Benchmark organizacional", desc: "Comparativo de mercado", icon: FileText },
    { title: "Relatórios executivos", desc: "Dados prontos para o C-Level", icon: Download },
    { title: "Exportações protegidas", desc: "Dados seguros em CSV/JSON", icon: ShieldCheck },
    { title: "SSO corporativo", desc: "Login via Google/Microsoft", icon: ShieldCheck },
    { title: "Integrações", desc: "Slack, Teams e Google Workspace", icon: ExternalLink },
    { title: "Suporte Enterprise", desc: "Consultoria dedicada ao RH", icon: Info },
    { title: "Rituais guiados", desc: "Práticas culturais integradas", icon: CheckCircle },
  ];

  return (
    <EnterpriseRHLayout title="Faturamento">
      <div className="space-y-12 animate-fade-in">
        
        {/* Header Section */}
        <header className="flex flex-col gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-[#0B0908] transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Voltar</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#F88A2B]/10 text-[9px] font-bold text-[#F88A2B] uppercase tracking-widest border border-[#F88A2B]/20">
                  Enterprise Active
                </span>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Governança validada</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-['Playfair_Display'] font-bold text-[#0B0908]">Plano & assinatura</h1>
              <p className="text-sm text-zinc-500 font-medium">Gestão da parceria estratégica e expansão Enterprise.</p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-[#F88A2B]">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </header>

        {/* Hero Card */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-14 text-[#0B0908] relative overflow-hidden shadow-sm border border-black/5 group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/5 blur-[100px] rounded-full -mr-40 -mt-40 transition-opacity group-hover:opacity-80"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F88A2B]/10 flex items-center justify-center text-[#F88A2B]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-black/5 border border-black/10 text-[9px] font-bold uppercase tracking-widest text-[#F88A2B]">
                Parceria ativa
              </span>
            </div>
            
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] leading-tight text-[#0B0908]">
                O cuidado emocional cresce junto com a organização.
              </h2>
              <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
                Gerencie plano, licenças e expansão do Enterprise com clareza, segurança e visão estratégica de longo prazo.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-24 opacity-[0.05] pointer-events-none">
            <svg viewBox="0 0 1000 100" className="w-full h-full text-[#F88A2B]">
              <path d="M0,50 Q250,0 500,50 T1000,50" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M0,70 Q250,20 500,70 T1000,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </section>

        {/* Main Grid: Plan & Licenses */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Plano Atual - 7/12 */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Plano atual</h3>
              <div className="h-px flex-1 bg-zinc-100"></div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-zinc-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[480px]">
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest mb-1">Assinatura Ativa</div>
                    <h4 className="text-2xl md:text-3xl font-['Playfair_Display'] font-bold text-[#0B0908]">Enterprise Growth</h4>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#0B0908]">
                    <Crown className="w-7 h-7" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Ciclo</span>
                    <p className="text-sm font-bold text-[#0B0908]">Anual</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Renovação</span>
                    <p className="text-sm font-bold text-[#0B0908]">17 de Março de 2027</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Recursos incluídos:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {planFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#F88A2B]" />
                        <span className="text-xs font-medium text-zinc-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10">
                <button className="h-14 rounded-2xl bg-[#0B0908] text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
                  Gerenciar plano
                </button>
                <button className="h-14 rounded-2xl bg-white border border-zinc-200 text-[#0B0908] text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                  Falar com especialista
                </button>
              </div>
            </div>
          </section>

          {/* Uso de Licenças - 5/12 */}
          <section className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Uso de licenças</h3>
              <div className="h-px flex-1 bg-zinc-100"></div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {licenseKPIs.map((kpi, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]">
                      <kpi.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#0B0908]">{kpi.value}</div>
                      <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{kpi.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-[#0B0908]">198 de 250 licenças utilizadas</span>
                    <span className="text-xs font-bold text-[#F88A2B]">79%</span>
                  </div>
                  <div className="h-3 w-full bg-[#F7F4F2] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "79%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#F88A2B] to-[#FFB26B] rounded-full shadow-[0_0_10px_rgba(248,138,43,0.3)]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  O aumento de adesão indica um crescimento saudável da cultura de saúde emocional na organização.
                </p>
                <button 
                  onClick={() => navigate('/enterprise/rh/equipe/licencas')}
                  className="w-full h-14 bg-[#F88A2B] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-[#F88A2B]/20 transition-all"
                >
                  Gerenciar licenças
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Expansão Recomendada */}
        <section className="bg-gradient-to-br from-[#FDFCFB] to-[#F7F4F2] p-8 md:p-12 rounded-[3rem] border border-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#F88A2B]/5 rounded-full blur-3xl -ml-10 -mt-10" />
          
          <div className="space-y-4 max-w-xl">
            <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#0B0908]">A empresa está crescendo dentro da jornada Enterprise.</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              O aumento de adesão indica que novas licenças podem apoiar a expansão gradual do cuidado emocional para mais colaboradores.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-[#F88A2B]">+50</div>
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Licenças sugeridas</div>
            </div>
            <button 
              onClick={handleExpansionRequest}
              className="h-16 px-10 bg-[#0B0908] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
            >
              Solicitar expansão
            </button>
          </div>
        </section>

        {/* Recursos Ativos Grid */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Recursos ativos</h3>
            <div className="h-px flex-1 bg-zinc-100"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {activeResources.map((resource, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col gap-4 group hover:border-[#F88A2B]/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-zinc-400 group-hover:text-[#F88A2B] transition-colors">
                  <resource.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-[#0B0908] uppercase tracking-tight">{resource.title}</h4>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">{resource.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Histórico de Faturas & Privacidade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Histórico */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Histórico de faturas</h3>
            <div className="bg-white rounded-[2.5rem] p-4 border border-zinc-100 shadow-sm space-y-2">
              {invoices.map((invoice, idx) => (
                <div key={idx} className="p-5 rounded-2xl flex items-center justify-between gap-3 flex-wrap hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-zinc-400 group-hover:text-[#0B0908] transition-colors">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B0908]">{invoice.date}</h4>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">{invoice.plan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-600 uppercase tracking-widest border border-emerald-100">
                      {invoice.status}
                    </span>
                    <button className="flex items-center gap-2 text-[#F88A2B] hover:text-[#0B0908] transition-colors">
                      <Download className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Baixar fatura</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Privacidade Preservada */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Segurança de dados</h3>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 text-[#0B0908] relative overflow-hidden h-full flex flex-col justify-between border border-black/5 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-[#F88A2B]" />
                  <h4 className="text-xl font-['Playfair_Display'] font-bold text-[#0B0908]">Faturamento nunca acessa dados emocionais.</h4>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                  A assinatura controla apenas licenças, plano e operação administrativa. Nenhuma informação emocional individual é usada no faturamento.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Sem respostas individuais",
                    "Sem conversas com IA",
                    "Sem score pessoal",
                    "Dados anônimos agregados"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/70 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F88A2B]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 relative z-10 border-t border-white/5">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest italic">
                  Garantia ética Enterprise
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseBillingScreen;