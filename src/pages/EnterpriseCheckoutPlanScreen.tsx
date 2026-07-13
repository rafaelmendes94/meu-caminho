import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Crown, 
  CheckCircle, 
  ArrowRight, 
  Lock, 
  Brain, 
  LineChart, 
  Headphones,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import logoMark from "@/assets/login-abstract.png";
import { EnterpriseCheckoutLayout } from "@/components/layouts/EnterpriseCheckoutLayout";

const EnterpriseCheckoutPlanScreen = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("growth");

  const plans = [
    {
      id: "essential",
      name: "Essential",
      subtitle: "Para empresas começando a jornada emocional.",
      price: "Sob consulta",
      features: [
        "Check-ins emocionais",
        "Trilhas personalizadas",
        "IA de apoio emocional",
        "Dashboard RH agregado",
        "Privacidade individual",
        "Até 100 colaboradores"
      ],
      buttonText: "Escolher Essential",
      highlight: false
    },
    {
      id: "growth",
      name: "Growth",
      badge: "Mais escolhido",
      subtitle: "Para empresas que querem inteligência emocional organizacional.",
      price: "Sob consulta",
      features: [
        "Tudo do Essential",
        "Insights de IA",
        "Relatórios executivos",
        "Alertas coletivos",
        "Exportações protegidas",
        "Integrações Slack/Google",
        "Até 500 colaboradores"
      ],
      buttonText: "Escolher Growth",
      highlight: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      subtitle: "Para grandes organizações com governança avançada.",
      price: "Sob consulta",
      features: [
        "Tudo do Growth",
        "SSO corporativo",
        "Múltiplos admins",
        "Organizações e unidades",
        "Compliance avançado",
        "Suporte prioritário",
        "Benchmark setorial",
        "Colaboradores ilimitados"
      ],
      buttonText: "Falar com especialista",
      highlight: false
    }
  ];

  const handleContinue = () => {
    if (selectedPlan === 'enterprise') {
      toast.success("Um especialista Enterprise entrará em contato.");
    } else {
      navigate("/enterprise/checkout/dados");
    }
  };

  return (
    <EnterpriseCheckoutLayout currentStep="plano">
      <div className="animate-fade-in max-w-[1200px] mx-auto">
        {/* Hero Card */}
        <section className="bg-[#0B0908] rounded-[2rem] p-8 md:p-12 lg:p-16 relative overflow-hidden mb-16 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/20 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F88A2B]/10 blur-[80px] rounded-full -ml-20 -mb-20"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Privacidade por desenho</span>
            </div>
            <h1 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              Escolha como sua empresa vai iniciar a jornada emocional.
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              O Enterprise leva inteligência emocional, privacidade e governança para organizações que desejam cuidar melhor de suas pessoas.
            </p>
          </div>
        </section>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`
                relative p-8 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer flex flex-col
                ${selectedPlan === plan.id 
                  ? 'bg-white border-[#F88A2B] shadow-2xl lg:scale-[1.02] z-10' 
                  : 'bg-white/50 border-transparent hover:border-[#0B0908]/10 shadow-sm hover:shadow-md'
                }
              `}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F88A2B] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-playfair text-2xl mb-2">{plan.name}</h3>
                <p className="text-xs text-[#0B0908]/60 leading-relaxed mb-6">
                  {plan.subtitle}
                </p>
                <div className="text-[#0B0908] font-bold text-lg">
                  {plan.price}
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 ${selectedPlan === plan.id ? 'text-[#F88A2B]' : 'text-[#0B0908]/30'}`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-[#0B0908]/70 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={selectedPlan === plan.id ? "default" : "outline"}
                className={`
                  w-full h-12 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300
                  ${selectedPlan === plan.id 
                    ? 'bg-[#F88A2B] hover:bg-[#F88A2B]/90 text-white border-none shadow-lg shadow-[#F88A2B]/20' 
                    : 'bg-transparent border-[#0B0908]/10 hover:bg-[#0B0908]/5 text-[#0B0908]'
                  }
                `}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        {/* Comparison Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl mb-4">Comparativo simples</h2>
            <p className="text-sm text-[#0B0908]/60">Recursos principais de cada nível de parceria.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-[#0B0908]/5 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {[
                  { label: "Check-ins Emocionais", essential: true, growth: true, enterprise: true },
                  { label: "IA de apoio emocional", essential: true, growth: true, enterprise: true },
                  { label: "Dashboard RH", essential: "Agregado", growth: "Completo", enterprise: "Múltiplas Unidades" },
                  { label: "Insights de IA", essential: false, growth: true, enterprise: true },
                  { label: "Relatórios Executivos", essential: false, growth: true, enterprise: true },
                  { label: "SSO Corporativo", essential: false, growth: false, enterprise: true },
                  { label: "Compliance Avançado", essential: false, growth: false, enterprise: true },
                  { label: "Suporte Prioritário", essential: false, growth: false, enterprise: true },
                ].map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center py-5 border-b border-[#0B0908]/5 last:border-0">
                    <span className="col-span-6 font-medium text-sm text-[#0B0908]">{item.label}</span>
                    <div className="col-span-2 flex justify-center">
                      {typeof item.essential === 'string' ? <span className="text-[11px] font-bold text-[#0B0908]/60">{item.essential}</span> : item.essential ? <Check className="w-4 h-4 text-[#F88A2B]" /> : <div className="w-4 h-px bg-[#0B0908]/10" />}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {typeof item.growth === 'string' ? <span className="text-[11px] font-bold text-[#F88A2B]">{item.growth}</span> : item.growth ? <Check className="w-4 h-4 text-[#F88A2B]" /> : <div className="w-4 h-px bg-[#0B0908]/10" />}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {typeof item.enterprise === 'string' ? <span className="text-[11px] font-bold text-[#0B0908]/60">{item.enterprise}</span> : item.enterprise ? <Check className="w-4 h-4 text-[#F88A2B]" /> : <div className="w-4 h-px bg-[#0B0908]/10" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-24">
          <h2 className="font-playfair text-3xl mb-12 text-center">Como funciona após escolher</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
            <div className="hidden lg:block absolute top-6 left-0 right-0 h-px bg-[#0B0908]/10 -z-10"></div>
            {[
              "Escolha o plano",
              "Dados da empresa",
              "Finalize pagamento",
              "Crie o acesso RH",
              "Onboarding Enterprise",
              "Convide colaboradores"
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className={`
                  w-12 h-12 rounded-full mb-4 flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${idx === 0 ? 'bg-[#F88A2B] text-white shadow-lg' : 'bg-white text-[#0B0908]/40 border border-[#0B0908]/10'}
                `}>
                  {idx + 1}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#0B0908]/60 leading-tight px-2">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Card */}
        <section className="bg-[#0B0908] rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden mb-24 text-white">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500 rounded-full blur-[150px] -mr-[250px] -mt-[250px]"></div>
          </div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl mb-6 leading-tight">O plano define acesso. Nunca exposição emocional.</h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Desde a assinatura, o Enterprise separa gestão administrativa de qualquer experiência emocional individual.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <Lock className="w-4 h-4 text-[#F88A2B]" />
                  <span className="text-xs font-medium">Dados Criptografados</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                  <span className="text-xs font-medium">GDPR & LGPD Compliant</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: Users, text: "RH vê apenas dados agregados" },
                { icon: Brain, text: "Conversas com IA são privadas" },
                { icon: Sparkles, text: "Check-ins individuais não aparecem" },
                { icon: ShieldCheck, text: "Exportações não incluem nomes" },
                { icon: Headphones, text: "Canal Direto segue fluxo separado" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <item.icon className="w-5 h-5 text-[#F88A2B]" />
                  <span className="text-sm font-medium text-white/80">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Action Bar (Non-fixed) */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#0B0908]/5 rounded-[2rem] p-8 md:p-10 mb-12 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 block mb-2">Plano Selecionado</span>
              <div className="font-playfair text-3xl text-[#0B0908]">
                {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => toast.success("Um especialista Enterprise entrará em contato.")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-[#0B0908]/60 hover:text-[#0B0908] transition-colors"
              >
                Falar com especialista
              </button>
              <button 
                onClick={handleContinue}
                className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-[#0B0908] text-white font-bold text-[10px] uppercase tracking-widest hover:bg-[#0B0908]/90 transition-all shadow-xl flex items-center justify-center gap-3 group"
              >
                <span>Continuar com {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <footer className="text-center pb-12">
          <p className="text-[10px] text-[#0B0908]/40 leading-relaxed max-w-2xl mx-auto uppercase tracking-widest">
            Planos e valores são demonstrativos para o protótipo. A assinatura Enterprise pode ser adaptada ao tamanho da organização.
          </p>
        </footer>
      </div>
    </EnterpriseCheckoutLayout>
  );
};

export default EnterpriseCheckoutPlanScreen;

