import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Lock, 
  Mail, 
  Send, 
  CheckCircle, 
  Plus, 
  ChevronRight,
  Sparkles,
  MessageCircle,
  Check,
  Globe,
  KeyRound,
  ClipboardCheck,
  ArrowRight,
  HeartHandshake,
  Network,
  Megaphone,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import logoMark from "@/assets/login-abstract.png";

const EnterpriseOnboardingScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    segment: "",
    employeeCount: "",
    rhContact: "",
    rhEmail: "",
    domain: ""
  });

  const [checklist, setChecklist] = useState({
    company: true,
    structure: false,
    privacy: true,
    domain: false,
    invites: false,
    launch: false,
    dashboard: false
  });

  const steps = [
    { id: 1, label: "Empresa", icon: Building2 },
    { id: 2, label: "Estrutura", icon: Network },
    { id: 3, label: "Privacidade", icon: Lock },
    { id: 4, label: "Acesso", icon: Globe },
    { id: 5, label: "Convites", icon: Users },
    { id: 6, label: "Lançamento", icon: Megaphone }
  ];

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else navigate(-1);
  };

  const handleFinish = () => {
    toast.success("Implantação concluída com sucesso!", {
      description: "O dashboard RH agora está liberado para monitoramento coletivo."
    });
    setTimeout(() => navigate("/enterprise/rh/dashboard"), 1500);
  };

  return (
    <EnterpriseRHLayout title="Implantação Enterprise">
      <div className="space-y-10 animate-fade-in py-2">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#F88A2B] mb-2">
              <button onClick={handleBack} className="p-1 hover:bg-[#F88A2B]/10 rounded-full transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-widest">Etapa {currentStep} de 6</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-playfair text-[#0B0908] leading-tight">
              Implantação Enterprise
            </h1>
            <p className="text-[#0B0908]/50 text-sm max-w-xl">
              Configure sua empresa para iniciar a jornada emocional com segurança, governança e privacidade.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-[#0B0908]/5">
            <Sparkles className="w-4 h-4 text-[#F88A2B]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40">Primeira configuração</span>
          </div>
        </section>

        {/* Hero Card */}
        <section className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B]/10 blur-[100px] -mr-40 -mt-40 animate-pulse" />
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/[0.03] border border-black/5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-[#666] text-[10px] font-bold uppercase tracking-widest">Privacidade desde o início</span>
              </div>
              <h2 className="text-3xl font-playfair text-[#111] leading-tight">
                Prepare a base antes de convidar pessoas.
              </h2>
              <p className="text-[#999] text-sm leading-relaxed max-w-md">
                Uma implantação bem configurada aumenta confiança, adesão e a qualidade dos sinais coletivos captados pela organização.
              </p>
            </div>
            <div className="hidden md:block w-px h-32 bg-black/5" />
            <div className="grid grid-cols-2 gap-8 text-[#111]">
              <div className="text-center">
                <div className="text-2xl font-playfair text-[#F88A2B] mb-1">250</div>
                <div className="text-[9px] uppercase tracking-widest text-[#999] font-bold">Licenças Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-playfair text-[#F88A2B] mb-1">Growth</div>
                <div className="text-[9px] uppercase tracking-widest text-[#999] font-bold">Plano Atual</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stepper */}
        <section className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-[#0B0908]/5 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[700px] px-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <button 
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-3 group transition-all duration-500 ${
                    currentStep >= step.id ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    currentStep === step.id 
                      ? 'bg-[#F88A2B] text-[#111] shadow-xl shadow-[#F88A2B]/30 scale-110' 
                      : currentStep > step.id 
                        ? 'bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111]' 
                        : 'bg-[#F7F4F2] text-[#0B0908]/20'
                  }`}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${
                    currentStep === step.id ? 'text-[#F88A2B]' : 'text-[#0B0908]/40'
                  }`}>
                    {step.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 mb-8 transition-colors duration-500 ${
                    currentStep > step.id ? 'bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111]/10' : 'bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111]/5'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Content Section */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-12 gap-10 items-start"
            >
              <div className="lg:col-span-8 space-y-8">
                <section className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/40 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <Building2 className="w-5 h-5 text-[#F88A2B]" />
                    <h3 className="text-2xl font-playfair font-bold text-[#0B0908]">Dados da empresa</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-2">Nome da empresa</label>
                      <input 
                        type="text" 
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        className="w-full h-14 bg-black/[0.03]0 border border-[#0B0908]/5 rounded-2xl px-6 text-sm focus:ring-2 focus:ring-[#F88A2B]/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-2">Segmento</label>
                      <input 
                        type="text" 
                        value={formData.segment}
                        className="w-full h-14 bg-black/[0.03]0 border border-[#0B0908]/5 rounded-2xl px-6 text-sm focus:ring-2 focus:ring-[#F88A2B]/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-2">Responsável RH</label>
                      <input 
                        type="text" 
                        value={formData.rhContact}
                        className="w-full h-14 bg-black/[0.03]0 border border-[#0B0908]/5 rounded-2xl px-6 text-sm focus:ring-2 focus:ring-[#F88A2B]/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-2">E-mail corporativo</label>
                      <input 
                        type="email" 
                        value={formData.rhEmail}
                        className="w-full h-14 bg-black/[0.03]0 border border-[#0B0908]/5 rounded-2xl px-6 text-sm focus:ring-2 focus:ring-[#F88A2B]/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleNext}
                    className="mt-10 w-full h-14 bg-[#F88A2B] hover:bg-[#F88A2B]/90 text-[#111] rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-[#F88A2B]/20"
                  >
                    Salvar e continuar
                  </Button>
                </section>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <aside className="bg-white rounded-[2rem] p-8 border border-[#0B0908]/5 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                      <ClipboardCheck className="w-5 h-5 text-[#F88A2B]" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40">Status Implantação</h4>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-medium text-[#0B0908]/60">Dados Empresa</span>
                         <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-medium text-[#0B0908]/40 italic">Estrutura</span>
                         <div className="w-4 h-px bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111]/10" />
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-medium text-[#0B0908]/60">Privacidade</span>
                         <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                   </div>
                </aside>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {[
                { 
                  title: "Departamentos", 
                  desc: "Cadastre áreas para convites, relatórios e recortes anônimos.", 
                  icon: Network, 
                  path: "/enterprise/rh/departamentos" 
                },
                { 
                  title: "Unidades", 
                  desc: "Organize filiais, regiões ou hubs operacionais.", 
                  icon: Building2, 
                  path: "/enterprise/rh/unidades" 
                },
                { 
                  title: "Administradores", 
                  desc: "Convide outros responsáveis pela operação Enterprise.", 
                  icon: Users, 
                  path: "/enterprise/rh/multiplos-admins" 
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-[#0B0908]/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer" onClick={() => navigate(item.path)}>
                   <div className="w-14 h-14 rounded-3xl bg-[#F88A2B]/5 flex items-center justify-center mb-8 group-hover:bg-[#F88A2B]/10 transition-colors">
                      <item.icon className="w-6 h-6 text-[#F88A2B]" />
                   </div>
                   <h3 className="font-playfair text-xl mb-3 text-[#0B0908]">{item.title}</h3>
                   <p className="text-xs text-[#0B0908]/50 leading-relaxed mb-8">{item.desc}</p>
                   <Button variant="ghost" className="w-full h-12 rounded-xl border border-[#0B0908]/5 text-[#0B0908]/60 group-hover:text-[#F88A2B] group-hover:border-[#F88A2B]/20 font-bold text-[10px] uppercase tracking-widest transition-all">
                      Configurar {item.title}
                   </Button>
                </div>
              ))}
              <div className="md:col-span-3 pt-6 flex justify-center">
                 <Button onClick={handleNext} className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] rounded-2xl h-14 px-12 font-bold uppercase text-[11px] tracking-widest shadow-2xl">
                    Próxima Etapa
                 </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl text-[#111]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B]/10 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
                  <div>
                    <h3 className="font-playfair text-3xl mb-6">Defina as regras que protegem confiança.</h3>
                    <p className="text-[#999] text-sm leading-relaxed mb-8">
                      O Enterprise é desenhado para anonimizar respostas e focar no coletivo, garantindo que o cuidado não se torne vigilância.
                    </p>
                    <Button 
                      onClick={() => navigate("/enterprise/rh/privacidade")}
                      variant="outline" 
                      className="border-black/5 text-[#111] hover:bg-black/[0.03] rounded-2xl h-12 px-8 font-bold uppercase text-[10px] tracking-widest"
                    >
                      Ver política completa
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {[
                      { label: "Anonimização automática", default: true },
                      { label: "Bloqueio de grupos pequenos (<8)", default: true },
                      { label: "Canal Direto separado dos dashboards", default: true },
                      { label: "IA agregada por padrão", default: true },
                      { label: "Exportações sem dados individuais", default: true }
                    ].map((config, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-black/[0.03] border border-white/5 rounded-2xl">
                        <span className="text-xs font-medium text-[#333]">{config.label}</span>
                        <Switch defaultChecked={config.default} className="data-[state=checked]:bg-[#F88A2B]" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <div className="flex justify-center">
                 <Button onClick={handleNext} className="bg-[#F88A2B] text-[#111] rounded-2xl h-14 px-12 font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-[#F88A2B]/20">
                    Confirmar Privacidade e Continuar
                 </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div className="bg-white rounded-[2.5rem] p-10 border border-[#0B0908]/5 shadow-sm space-y-8">
                <div className="w-14 h-14 rounded-3xl bg-[#F88A2B]/5 flex items-center justify-center">
                   <Globe className="w-6 h-6 text-[#F88A2B]" />
                </div>
                <div>
                   <h3 className="font-playfair text-2xl mb-3">Domínio corporativo</h3>
                   <p className="text-xs text-[#0B0908]/50 leading-relaxed mb-6">Permita entrada segura e simplificada por e-mail da empresa.</p>
                   <div className="space-y-4">
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B0908]/20" />
                         <input 
                            placeholder="ex: @suaempresa.com" 
                            className="w-full h-12 pl-12 rounded-xl bg-[#F7F4F2] border-none text-sm outline-none focus:ring-2 focus:ring-[#F88A2B]/10"
                         />
                      </div>
                      <Button className="w-full bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] rounded-xl h-12 text-[10px] uppercase font-bold tracking-widest">Validar Domínio</Button>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 border border-[#0B0908]/5 shadow-sm space-y-8">
                <div className="w-14 h-14 rounded-3xl bg-[#F88A2B]/5 flex items-center justify-center">
                   <KeyRound className="w-6 h-6 text-[#F88A2B]" />
                </div>
                <div>
                   <h3 className="font-playfair text-2xl mb-3">Login Corporativo SSO</h3>
                   <p className="text-xs text-[#0B0908]/50 leading-relaxed mb-6">Conecte Google, Microsoft, SAML ou OIDC para acesso centralizado.</p>
                   <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-12 rounded-xl border-[#0B0908]/10 text-xs font-bold">Google</Button>
                      <Button variant="outline" className="h-12 rounded-xl border-[#0B0908]/10 text-xs font-bold">Microsoft</Button>
                   </div>
                   <Button onClick={() => navigate("/enterprise/rh/sso")} variant="ghost" className="w-full mt-4 h-12 text-[10px] uppercase font-bold tracking-widest text-[#F88A2B] hover:bg-[#F88A2B]/5">Outros protocolos</Button>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-center pt-8">
                 <Button onClick={handleNext} className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] rounded-2xl h-14 px-12 font-bold uppercase text-[11px] tracking-widest">Acesso Configurado</Button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[3rem] p-10 md:p-12 border border-[#0B0908]/5 shadow-xl">
                 <h3 className="font-playfair text-3xl mb-10 text-center">Como deseja convidar sua equipe?</h3>
                 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: "Convites Manuais", icon: Mail, path: "/enterprise/rh/equipe/convidar" },
                      { title: "Importar Planilha", icon: ClipboardCheck, path: "/enterprise/rh/equipe/importar" },
                      { title: "Link Privado", icon: Globe, path: "/enterprise/rh/equipe/link" },
                      { title: "Conectar Slack", icon: Network, path: "/enterprise/rh/integracoes" }
                    ].map((opt, idx) => (
                      <div key={idx} onClick={() => navigate(opt.path)} className="bg-[#F7F4F2]/50 p-6 rounded-3xl border border-transparent hover:border-[#F88A2B]/30 hover:bg-white transition-all cursor-pointer group text-center flex flex-col items-center">
                         <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 group-hover:bg-[#F88A2B]/10 group-hover:scale-110 transition-all">
                            <opt.icon className="w-5 h-5 text-[#0B0908]/20 group-hover:text-[#F88A2B]" />
                         </div>
                         <span className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/60 group-hover:text-[#0B0908]">{opt.title}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex justify-center pt-6">
                 <Button onClick={handleNext} className="bg-[#F88A2B] text-[#111] rounded-2xl h-14 px-12 font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-[#F88A2B]/20">Preparar Lançamento</Button>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="grid md:grid-cols-2 gap-10 items-center">
                 <section className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-10 border border-white/40 shadow-xl space-y-8">
                    <div className="w-16 h-16 rounded-3xl bg-[#F88A2B]/10 flex items-center justify-center">
                       <Megaphone className="w-8 h-8 text-[#F88A2B]" />
                    </div>
                    <div>
                       <h3 className="font-playfair text-3xl mb-4">Prepare a comunicação interna.</h3>
                       <p className="text-sm text-[#0B0908]/60 leading-relaxed mb-8 font-medium italic">
                          "Explique aos colaboradores que a jornada individual é privada e que a empresa verá apenas sinais coletivos agregados."
                       </p>
                       <Button onClick={() => navigate("/enterprise/rh/comunicacao-lancamento")} className="w-full bg-[#F88A2B] text-[#111] rounded-2xl h-14 text-[11px] uppercase font-bold tracking-widest shadow-xl shadow-[#F88A2B]/20">
                          Criar comunicação de lançamento
                       </Button>
                    </div>
                 </section>

                 <section className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[3rem] p-10 text-[#111] relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#F88A2B]/10 blur-[80px] rounded-full"></div>
                    <div className="relative z-10">
                       <h4 className="font-playfair text-2xl mb-8">Resumo da implantação</h4>
                       <div className="space-y-4 mb-10">
                          <div className="flex justify-between border-b border-black/5 pb-3">
                             <span className="text-[#999] text-xs">Plano Ativo</span>
                             <span className="text-xs font-bold text-[#F88A2B]">Enterprise Growth</span>
                          </div>
                          <div className="flex justify-between border-b border-black/5 pb-3">
                             <span className="text-[#999] text-xs">Licenças</span>
                             <span className="text-xs font-bold">250</span>
                          </div>
                          <div className="flex justify-between border-b border-black/5 pb-3">
                             <span className="text-[#999] text-xs">Privacidade</span>
                             <span className="text-xs font-bold text-green-500">Ativa</span>
                          </div>
                          <div className="flex justify-between border-b border-black/5 pb-3">
                             <span className="text-[#999] text-xs">Acesso Corporativo</span>
                             <span className="text-xs font-bold text-green-500">Configurado</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 p-4 bg-black/[0.03] border border-white/5 rounded-2xl">
                          <Sparkles className="w-4 h-4 text-[#F88A2B]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Tudo pronto para o lançamento</span>
                       </div>
                    </div>
                 </section>
              </div>

              <div className="flex flex-col items-center gap-6">
                 <Button onClick={handleFinish} className="w-full md:w-auto px-20 h-16 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] rounded-2xl font-bold uppercase text-[12px] tracking-[0.2em] shadow-2xl flex items-center gap-3 group">
                    <span>Concluir implantação e abrir dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </Button>
                 <button onClick={() => navigate("/enterprise/rh/status")} className="text-[11px] font-bold uppercase tracking-widest text-[#0B0908]/40 hover:text-[#F88A2B] transition-colors">
                    Ver status da implantação completo
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confidence Card */}
        <section className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl text-[#111] mt-12">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/[0.03] blur-3xl rounded-full -mb-32 -ml-32"></div>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-playfair text-3xl mb-6 leading-tight">O Enterprise só funciona quando o colaborador confia.</h3>
              <p className="text-[#999] text-sm leading-relaxed mb-8 font-light">
                Por isso, a implantação começa com privacidade, transparência e comunicação clara antes de qualquer convite ser enviado.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/[0.03] border border-black/5 rounded-full">
                <HeartHandshake className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Ética por desenho</span>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "Sem respostas individuais para o RH",
                "Sem conversas privadas com IA",
                "Sem score emocional pessoal",
                "Dashboards apenas agregados",
                "Canal Direto separado"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs text-[#444]">
                   <div className="w-5 h-5 rounded-full bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#F88A2B]" />
                   </div>
                   {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <footer className="pt-12 text-center">
           <p className="text-[10px] text-[#0B0908]/30 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xl mx-auto">
             A implantação Enterprise deve começar pela confiança, não pela cobrança de respostas.
           </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseOnboardingScreen;
