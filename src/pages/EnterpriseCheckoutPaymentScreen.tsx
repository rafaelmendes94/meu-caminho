import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Receipt, 
  ShieldCheck, 
  Lock, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Crown, 
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { EnterpriseCheckoutLayout } from "@/components/layouts/EnterpriseCheckoutLayout";

const EnterpriseCheckoutPaymentScreen = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    authorized: false
  });

  const isFormValid = agreements.terms && agreements.privacy && agreements.authorized;

  const handleFinalize = () => {
    if (!isFormValid) {
      toast.error("Por favor, aceite todos os termos para continuar.");
      return;
    }
    
    setProcessing(true);
    
    // Mock processing delay
    setTimeout(() => {
      setProcessing(false);
      navigate("/enterprise/checkout/sucesso");
    }, 2500);
  };

  return (
    <EnterpriseCheckoutLayout currentStep="pagamento">
      <div className="animate-fade-in max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column: Payment & Billing */}
          <div className="lg:col-span-7 space-y-8">
            {/* Hero Card */}
            <section className="bg-[#0B0908] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/15 blur-[100px] rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Pagamento seguro</span>
                </div>
                <h1 className="font-playfair text-3xl md:text-4xl text-white mb-4 leading-tight">
                  Finalize a assinatura com segurança.
                </h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  Após a confirmação, você poderá criar o acesso RH e iniciar a implantação Enterprise da sua organização.
                </p>
              </div>
            </section>

            {/* Payment Methods */}
            <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-white/40 shadow-xl">
              <h2 className="font-playfair text-2xl mb-8">Forma de pagamento</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: "card", label: "Cartão corp.", icon: CreditCard },
                  { id: "boleto", label: "Boleto", icon: FileText },
                  { id: "invoice", label: "Faturamento", icon: Receipt },
                  { id: "expert", label: "Especialista", icon: Sparkles },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`
                      p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3
                      ${paymentMethod === method.id 
                        ? 'bg-[#F88A2B]/5 border-[#F88A2B] text-[#F88A2B]' 
                        : 'bg-white border-transparent hover:border-[#0B0908]/10 text-[#0B0908]/40'
                      }
                    `}
                  >
                    <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-[#F88A2B]' : 'text-[#0B0908]/20'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{method.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="mt-10 space-y-6 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Nome impresso no cartão</label>
                      <Input 
                        placeholder="NOME IGUAL AO CARTÃO"
                        className="rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] transition-all uppercase"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Número do cartão</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B0908]/20" />
                        <Input 
                          placeholder="0000 0000 0000 0000"
                          className="pl-11 rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Validade</label>
                      <Input 
                        placeholder="MM/AA"
                        className="rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">CVV</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B0908]/20" />
                        <Input 
                          placeholder="000"
                          className="pl-11 rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Billing Data */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#0B0908]/5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-[#F88A2B]" />
                  <h2 className="font-playfair text-2xl">Dados de faturamento</h2>
                </div>
                <div className="flex items-center gap-2 bg-[#0B0908]/5 px-3 py-1.5 rounded-full">
                  <Checkbox id="same-data" />
                  <label htmlFor="same-data" className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 cursor-pointer">
                    Mesmos dados da empresa
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Razão social</label>
                  <Input 
                    placeholder="Razão Social da Empresa LTDA"
                    className="rounded-2xl border-[#0B0908]/5 h-12 focus:border-[#F88A2B] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">CNPJ</label>
                  <Input 
                    placeholder="00.000.000/0000-00"
                    className="rounded-2xl border-[#0B0908]/5 h-12 focus:border-[#F88A2B] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">E-mail financeiro</label>
                  <Input 
                    placeholder="financeiro@empresa.com"
                    className="rounded-2xl border-[#0B0908]/5 h-12 focus:border-[#F88A2B] transition-all"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-6">
            <section className="bg-[#0B0908] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/10 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Resumo da assinatura</div>
                    <h3 className="font-playfair text-2xl">Enterprise Growth</h3>
                  </div>
                  <Crown className="w-8 h-8 text-[#F88A2B]" />
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Contrato</span>
                    <span className="font-medium">Anual</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Colaboradores</span>
                    <span className="font-medium">até 500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Valor mensal</span>
                    <span className="font-medium">R$ 7.250</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-white/60 font-medium text-xs">Total mensal</span>
                    <div className="text-right">
                      <span className="text-3xl font-playfair font-bold text-[#F88A2B]">R$ 7.250</span>
                      <span className="text-[10px] text-white/40 block uppercase tracking-widest">Cobrança Mensal</span>
                    </div>
                  </div>
                </div>

                {/* Terms and Agreements */}
                <div className="space-y-4 mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="terms" 
                      checked={agreements.terms}
                      onCheckedChange={(checked) => setAgreements(p => ({...p, terms: checked === true}))}
                      className="mt-1 border-white/20 data-[state=checked]:bg-[#F88A2B] data-[state=checked]:border-[#F88A2B]"
                    />
                    <label htmlFor="terms" className="text-[10px] text-white/60 leading-relaxed cursor-pointer font-medium">
                      Aceito os <span className="text-[#F88A2B] hover:underline">termos Enterprise</span>.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="privacy" 
                      checked={agreements.privacy}
                      onCheckedChange={(checked) => setAgreements(p => ({...p, privacy: checked === true}))}
                      className="mt-1 border-white/20 data-[state=checked]:bg-[#F88A2B] data-[state=checked]:border-[#F88A2B]"
                    />
                    <label htmlFor="privacy" className="text-[10px] text-white/60 leading-relaxed cursor-pointer font-medium">
                      Entendo que os dados são agregados.
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={handleFinalize}
                  disabled={!isFormValid || processing}
                  className="w-full h-14 bg-[#F88A2B] hover:bg-[#F88A2B]/90 text-white rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-[#F88A2B]/20 transition-all flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>Finalizar Assinatura</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                
                <p className="mt-4 text-[9px] text-center text-white/20 uppercase tracking-[0.2em] font-bold">
                  Pagamento 100% seguro via Meu Caminho
                </p>
              </div>
            </section>

            {/* Included Features */}
            <section className="bg-white rounded-3xl p-8 border border-[#0B0908]/5 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-6">O que está incluído</h4>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "Cury Digital Enterprise",
                  "Check-ins emocionais",
                  "Dashboard RH completo",
                  "Insights de IA",
                  "Relatórios executivos",
                  "Exportações protegidas",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="w-3 h-3 text-[#F88A2B]" />
                    <span className="text-[11px] font-medium text-[#0B0908]/70 uppercase tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Action Bar (Mobile Only or fallback) */}
        <div className="lg:hidden mt-8 mb-12">
          <button 
            onClick={() => navigate("/enterprise/checkout/dados")}
            className="w-full px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-[#0B0908]/40 hover:text-[#0B0908] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos dados</span>
          </button>
        </div>
      </div>
    </EnterpriseCheckoutLayout>
  );
};

export default EnterpriseCheckoutPaymentScreen;
