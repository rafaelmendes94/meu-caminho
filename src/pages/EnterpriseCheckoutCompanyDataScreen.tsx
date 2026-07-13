import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  UserRound, 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  Users, 
  Globe, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles,
  Check,
  Zap as ZapIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { EnterpriseCheckoutLayout } from "@/components/layouts/EnterpriseCheckoutLayout";

const EnterpriseCheckoutCompanyDataScreen = () => {
  const navigate = useNavigate();
  const [setupType, setSetupType] = useState("guided");
  
  const [formData, setFormData] = useState({
    companyName: "",
    cnpj: "",
    segment: "",
    employees: "",
    site: "",
    country: "Brasil",
    location: "",
    adminName: "",
    adminRole: "",
    adminEmail: "",
    adminPhone: "",
    adminDept: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    if (!formData.companyName || !formData.adminEmail) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }
    navigate("/enterprise/checkout/pagamento");
  };

  return (
    <EnterpriseCheckoutLayout currentStep="empresa">
      <div className="animate-fade-in max-w-[1200px] mx-auto">
        {/* Grid Layout: Form (7) | Summary (5) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Hero Card */}
            <section className="bg-[#0B0908] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/15 blur-[100px] rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Cadastro seguro</span>
                </div>
                <h1 className="font-playfair text-3xl md:text-4xl text-white mb-4 leading-tight">
                  Conte um pouco sobre a organização que vai iniciar essa jornada.
                </h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  Essas informações ajudam a configurar o Enterprise com segurança, governança e privacidade desde o primeiro acesso.
                </p>
              </div>
            </section>

            {/* Company Data Form */}
            <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-white/40 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-5 h-5 text-[#F88A2B]" />
                <h2 className="font-playfair text-2xl">Dados da empresa</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Nome da empresa</label>
                  <Input 
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Ex: Nome da sua empresa"
                    className="rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] focus:ring-[#F88A2B]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">CNPJ</label>
                  <Input 
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    placeholder="00.000.000/0000-00"
                    className="rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] focus:ring-[#F88A2B]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Segmento</label>
                  <Select onValueChange={(val) => setFormData(p => ({...p, segment: val}))}>
                    <SelectTrigger className="rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] focus:ring-[#F88A2B]/20">
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-[#0B0908]/5">
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="industria">Indústria</SelectItem>
                      <SelectItem value="varejo">Varejo</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Número de colaboradores</label>
                  <Select onValueChange={(val) => setFormData(p => ({...p, employees: val}))}>
                    <SelectTrigger className="rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] focus:ring-[#F88A2B]/20">
                      <SelectValue placeholder="Selecione o tamanho" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-[#0B0908]/5">
                      <SelectItem value="up-to-50">Até 50</SelectItem>
                      <SelectItem value="51-100">51 a 100</SelectItem>
                      <SelectItem value="101-500">101 a 500</SelectItem>
                      <SelectItem value="501-1000">501 a 1.000</SelectItem>
                      <SelectItem value="more-1000">Mais de 1.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Site da empresa</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B0908]/20" />
                    <Input 
                      name="site"
                      value={formData.site}
                      onChange={handleInputChange}
                      placeholder="www.empresa.com.br"
                      className="pl-11 rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] focus:ring-[#F88A2B]/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Cidade / Estado</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B0908]/20" />
                    <Input 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Ex: São Paulo, SP"
                      className="pl-11 rounded-2xl border-[#0B0908]/5 h-12 bg-white focus:border-[#F88A2B] focus:ring-[#F88A2B]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Responsible Section */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#0B0908]/5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <UserRound className="w-5 h-5 text-[#F88A2B]" />
                <h2 className="font-playfair text-2xl">Responsável pelo Enterprise</h2>
              </div>
              <p className="text-[11px] text-[#0B0908]/40 font-bold uppercase tracking-widest mb-8">
                Esse contato será o primeiro administrador da conta Enterprise.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Nome completo</label>
                  <Input 
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                    className="rounded-2xl border-[#0B0908]/5 h-12 focus:border-[#F88A2B] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">E-mail corporativo</label>
                  <Input 
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    placeholder="nome@empresa.com"
                    className="rounded-2xl border-[#0B0908]/5 h-12 focus:border-[#F88A2B] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Cargo</label>
                  <Input 
                    name="adminRole"
                    value={formData.adminRole}
                    onChange={handleInputChange}
                    placeholder="Ex: Diretor de RH"
                    className="rounded-2xl border-[#0B0908]/5 h-12 focus:border-[#F88A2B] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/60 ml-1">Telefone</label>
                  <Input 
                    name="adminPhone"
                    value={formData.adminPhone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="rounded-2xl border-[#0B0908]/5 h-12 focus:border-[#F88A2B] transition-all"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Summary & Privacy */}
          <div className="lg:col-span-5 space-y-8">
            {/* Selected Plan Summary */}
            <div className="bg-white rounded-3xl p-8 border border-[#0B0908]/5 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#F88A2B]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-1">Plano Selecionado</div>
                  <h3 className="font-playfair text-xl">Enterprise Growth</h3>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#0B0908]/60 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-[#F88A2B]" /> Até 500 colaboradores
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#0B0908]/60 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#F88A2B]" /> Insights de IA
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#0B0908]/60 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-[#F88A2B]" /> Relatórios Executivos
                </div>
              </div>

              <button 
                onClick={() => navigate("/enterprise/checkout/plano")}
                className="w-full h-12 rounded-xl border border-[#F88A2B]/20 text-[#F88A2B] font-bold text-[10px] uppercase tracking-widest hover:bg-[#F88A2B]/5 transition-colors"
              >
                Alterar plano
              </button>
            </div>

            {/* Privacy Disclaimer Card */}
            <section className="bg-[#0B0908] rounded-[2.5rem] p-8 relative overflow-hidden text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full"></div>
              
              <div className="relative z-10">
                <h3 className="font-playfair text-2xl mb-4 leading-tight">Privacidade preservada desde o início.</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-8">
                  Nesta etapa, coletamos apenas informações administrativas para ativar o plano e preparar a estrutura organizacional.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Sem dados emocionais",
                    "Sem check-ins individuais",
                    "Sem conversas com IA",
                    "Sem relatórios pessoais",
                    "Apenas configuração corporativa"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-xs text-white/80">
                      <Check className="w-3 h-3 text-[#F88A2B]" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Governança garantida</span>
                </div>
              </div>
            </section>

            {/* Configuration Type */}
            <section className="bg-white rounded-3xl p-8 border border-[#0B0908]/5 shadow-sm space-y-6">
              <h4 className="font-bold text-sm text-[#0B0908]/60 uppercase tracking-widest">Deseja implantação guiada?</h4>
              <div className="space-y-4">
                {[
                  { id: "guided", title: "Assistida", icon: Sparkles },
                  { id: "fast", title: "Rápida", icon: ZapIcon },
                ].map((option) => (
                  <div 
                    key={option.id}
                    onClick={() => setSetupType(option.id)}
                    className={`
                      p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group
                      ${setupType === option.id 
                        ? 'bg-[#F88A2B]/5 border-[#F88A2B]' 
                        : 'bg-white border-transparent hover:border-[#0B0908]/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                        ${setupType === option.id ? 'bg-[#F88A2B] text-white' : 'bg-[#0B0908]/5 text-[#0B0908]/30 group-hover:bg-[#0B0908]/10'}
                      `}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm">{option.title}</span>
                    </div>
                    {setupType === option.id && <CheckCircle className="w-5 h-5 text-[#F88A2B]" />}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white/80 backdrop-blur-xl border border-[#0B0908]/5 rounded-[2rem] p-8 md:p-10 my-12 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <button 
              onClick={() => navigate("/enterprise/checkout/plano")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-[#0B0908]/40 hover:text-[#0B0908] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao plano</span>
            </button>
            
            <button 
              onClick={handleContinue}
              className="w-full sm:w-auto px-16 py-4 rounded-2xl bg-[#0B0908] text-white font-bold text-[10px] uppercase tracking-widest hover:bg-[#0B0908]/90 transition-all shadow-xl flex items-center justify-center gap-3 group"
            >
              <span>Continuar para pagamento</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </EnterpriseCheckoutLayout>
  );
};

export default EnterpriseCheckoutCompanyDataScreen;
