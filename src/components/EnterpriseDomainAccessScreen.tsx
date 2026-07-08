import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Lock, 
  EyeOff, 
  Mail, 
  UserPlus, 
  Building2,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseDomainAccessScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newDomain, setNewDomain] = useState("");
  const [domains, setDomains] = useState([
    { id: 1, url: "empresa.com.br", status: "Verificado", statusColor: "text-green-500", bgColor: "bg-green-50" },
    { id: 2, url: "grupoempresa.com", status: "Pendente de verificação", statusColor: "text-amber-500", bgColor: "bg-amber-50" },
    { id: 3, url: "filialempresa.com.br", status: "Ativo", statusColor: "text-[#F88A2B]", bgColor: "bg-orange-50" }
  ]);

  const [rules, setRules] = useState({
    autoRegister: true,
    requirePrivacy: true,
    autoDept: false,
    blockPersonal: true
  });

  const handleAddDomain = () => {
    if (!newDomain) return;
    toast({
      title: "Domínio adicionado",
      description: "Domínio enviado para verificação com sucesso.",
    });
    setNewDomain("");
  };

  const handleSaveRules = () => {
    toast({
      title: "Configurações salvas",
      description: "Regras de acesso atualizadas com segurança.",
    });
  };

  const toggleRule = (key: keyof typeof rules) => {
    setRules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <EnterpriseRHLayout title="Acesso por domínio">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] text-[#0B0908] font-montserrat overflow-y-auto pb-32">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#F7F4F2]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border border-[#E5E0DA] flex items-center justify-center hover:bg-[#F88A2B]/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Domínio corporativo</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-[#F88A2B] rounded-full" />
              <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider">Acesso seguro</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 max-w-3xl mx-auto space-y-12 pt-4">
        
        {/* Hero Section */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B]/10 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                <span className="text-[11px] font-bold text-orange-50 tracking-[0.15em] uppercase">Validação corporativa</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-playfair text-[#111] leading-[1.15]">
                Permita que colaboradores entrem <br/>
                <span className="text-[#F88A2B]">com segurança pelo e-mail da empresa.</span>
              </h2>
              
              <p className="text-orange-50/70 text-base leading-relaxed max-w-xl">
                Configure domínios autorizados para simplificar o onboarding sem abrir mão da proteção Enterprise.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Domínios autorizados */}
        <section className="space-y-6">
          <h3 className="text-xl font-playfair font-semibold px-2">Domínios autorizados</h3>
          <div className="space-y-3">
            {domains.map((domain, i) => (
              <motion.div 
                key={domain.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#E5E0DA] p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm group hover:border-[#F88A2B]/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#0B0908]/20">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{domain.url}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${domain.status === 'Verificado' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${domain.statusColor}`}>{domain.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0DA] hover:bg-[#F7F4F2] transition-colors">Gerenciar</button>
                  <button className="p-2.5 rounded-xl text-[#0B0908]/20 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Adicionar domínio */}
        <section className="space-y-6">
          <div className="bg-white/40 backdrop-blur-sm border border-white rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-6">
            <h3 className="text-xl font-playfair font-semibold">Adicionar novo domínio</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B0908]/20">
                  <Globe className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  placeholder="ex: empresa.com.br"
                  className="w-full bg-white border border-[#E5E0DA] rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-1 focus:ring-[#F88A2B]/20 focus:border-[#F88A2B]/30 transition-all text-sm"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <button 
                onClick={handleAddDomain}
                className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar domínio</span>
              </button>
            </div>
          </div>
        </section>

        {/* Como a verificação funciona */}
        <section className="space-y-8">
          <h3 className="text-xl font-playfair font-semibold text-center">Como a verificação funciona</h3>
          <div className="relative space-y-10 px-4">
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#F88A2B]/20 via-[#F88A2B]/10 to-transparent" />
            {[
              { step: 1, title: "Adicione o domínio", icon: Plus },
              { step: 2, title: "Receba código de verificação", icon: Mail },
              { step: 3, title: "Confirme propriedade", icon: ShieldCheck },
              { step: 4, title: "Libere entrada dos colaboradores", icon: UserPlus }
            ].map((item, idx) => (
              <div key={idx} className="relative flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E0DA] flex items-center justify-center shadow-sm relative z-10 group-hover:border-[#F88A2B]/30 transition-colors">
                  <item.icon className="w-5 h-5 text-[#F88A2B]" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#F88A2B]/40 uppercase tracking-widest">Passo {item.step}</span>
                  <p className="text-base font-semibold text-[#0B0908]">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Entrada por link + domínio */}
        <section>
          <div className="bg-white border border-[#E5E0DA] rounded-[2.5rem] p-8 md:p-12 shadow-sm flex flex-col md:flex-row gap-10">
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-playfair font-semibold">Mais simples para o colaborador.</h3>
                <p className="text-sm text-[#0B0908]/60 leading-relaxed">
                  Quando um colaborador acessa o link privado, o Enterprise valida se o e-mail pertence a um domínio autorizado.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: UserPlus, text: "Reduz cadastro manual" },
                  { icon: ShieldCheck, text: "Evita acessos externos" },
                  { icon: Building2, text: "Controle administrativo" },
                  { icon: Lock, text: "Privacidade individual" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]">
                      <item.icon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-[#0B0908]/70">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-48 h-48 bg-[#F7F4F2] rounded-[3rem] shrink-0 self-center flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F88A2B]/10 to-transparent rounded-[3rem]" />
              <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center">
                <Mail className="w-10 h-10 text-[#F88A2B]" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] p-4 rounded-[1.5rem] shadow-xl">
                <CheckCircle2 className="w-6 h-6 text-[#F88A2B]" />
              </div>
            </div>
          </div>
        </section>

        {/* Regras de acesso */}
        <section className="space-y-6">
          <h3 className="text-xl font-playfair font-semibold px-2">Regras de acesso</h3>
          <div className="space-y-3">
            {[
              { id: 'autoRegister', title: "Permitir cadastro automático por domínio", desc: "Colaboradores com e-mail do domínio autorizado entram sem convite manual." },
              { id: 'requirePrivacy', title: "Exigir aceite de privacidade antes do cadastro", desc: "Garante que todos leiam e aceitem os termos de proteção emocional." },
              { id: 'autoDept', title: "Vincular automaticamente ao departamento padrão", desc: "Novos colaboradores entram direto em um departamento pré-definido." },
              { id: 'blockPersonal', title: "Bloquear e-mails pessoais", desc: "Impede o cadastro de contas @gmail, @outlook ou @hotmail." }
            ].map((rule) => (
              <div 
                key={rule.id}
                onClick={() => toggleRule(rule.id as keyof typeof rules)}
                className="bg-white border border-[#E5E0DA] p-6 rounded-3xl flex items-center justify-between gap-6 cursor-pointer hover:border-[#F88A2B]/30 transition-all shadow-sm"
              >
                <div className="space-y-1">
                  <p className="font-bold text-base">{rule.title}</p>
                  <p className="text-xs text-[#0B0908]/40 leading-relaxed max-w-md">{rule.desc}</p>
                </div>
                <div className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${rules[rule.id as keyof typeof rules] ? 'bg-[#F88A2B]' : 'bg-[#E5E0DA]'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${rules[rule.id as keyof typeof rules] ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacidade preservada */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 text-[#111] space-y-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full -mr-10 -mt-10" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30 mx-auto md:mx-0">
                  <EyeOff className="w-3.5 h-3.5 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Anonimização ativa</span>
                </div>
                <h2 className="text-3xl font-playfair leading-tight">Validar domínio não revela <br/> <span className="text-[#F88A2B]">jornada emocional.</span></h2>
                <p className="text-sm text-[#777] leading-relaxed max-w-lg">
                  O domínio confirma pertencimento à empresa. Ele não dá ao RH acesso a respostas, conversas ou resultados individuais dos colaboradores.
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-black/[0.03] border border-black/5 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-8 h-8 text-[#F88A2B]" />
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4 pt-4 pb-8">
          <button 
            onClick={handleSaveRules}
            className="w-full bg-[#F88A2B] text-[#111] py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span className="font-bold text-lg tracking-tight">Salvar regras de acesso</span>
          </button>

          <button 
            onClick={() => navigate("/enterprise/rh/configuracoes")}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[#0B0908]/40 hover:text-[#0B0908] transition-colors"
          >
            <span className="font-semibold text-sm">Voltar para configurações</span>
          </button>
          
          <div className="pt-8 text-center">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-xs mx-auto">
              O domínio corporativo protege entrada e simplifica ativação do Enterprise.
            </p>
          </div>
        </section>
      </main>
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseDomainAccessScreen;
