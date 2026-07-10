import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  EyeOff, 
  MessageSquareOff, 
  History, 
  BarChart4, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  Users,
  TrendingUp,
  Brain,
  CheckCircle2,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const EnterprisePrivacyConsentScreen = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [consents, setConsents] = useState({
    individualPrivate: false,
    collectiveTrends: false,
    anonymousProcessing: false,
    privacyPolicy: false
  });

  const allChecked = Object.values(consents).every(v => v === true);

  const toggleConsent = (key: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = async () => {
    if (!allChecked || saving) return;
    if (!user) {
      navigate("/enterprise/cadastro");
      return;
    }
    setSaving(true);
    const version = "v1.1";
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
    const { error } = await supabase.from("privacy_consents").insert({
      user_id: user.id,
      organization_id: profile?.organization_id ?? null,
      consent_type: "enterprise_privacy",
      version,
      user_agent: ua,
    });
    // Granular event trail: one row per toggle acknowledged
    const events = (Object.keys(consents) as (keyof typeof consents)[])
      .filter((k) => consents[k])
      .map((k) => ({
        user_id: user.id,
        organization_id: profile?.organization_id ?? null,
        consent_type: `enterprise_privacy.${k}`,
        action: "grant",
        version,
        source: "onboarding",
        user_agent: ua,
      }));
    if (events.length) await supabase.from("consent_events").insert(events);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível registrar seu consentimento.");
      return;
    }
    navigate("/enterprise/cadastro");
  };

  return (
    <EnterpriseUserLayout>
    <div className="min-h-screen min-h-[100dvh] bg-white text-[#0B0908] font-montserrat overflow-y-auto pb-40">
      {/* Header - Mobile Only or Minimal on Desktop */}
      <header className="px-6 pt-2 sticky top-0 bg-white z-50 md:hidden">
      </header>

      <main className="px-3 md:px-6 max-w-4xl mx-auto space-y-12 pt-4 md:pt-12">
        
        {/* Hero Section */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white border border-[#E5E0DA] text-[#111] rounded-[2rem] p-5 md:p-8 overflow-hidden shadow-sm"
          >
            <div className="relative z-10 space-y-6 text-center py-4">
              <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5 mb-2">
                <Lock className="w-3.5 h-3.5 text-[#F88A2B]" />
                <span className="text-[11px] font-bold text-[#F88A2B] tracking-[0.15em] uppercase">Privado e seguro</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-playfair text-[#111] leading-[1.2]">
                Sua jornada emocional <br/>
                <span className="text-[#F88A2B]">pertence a você.</span>
              </h1>
              
              <p className="text-[#0B0908]/70 text-base leading-relaxed max-w-md mx-auto">
                O Enterprise foi desenhado para apoiar equilíbrio emocional coletivo sem expor experiências individuais.
              </p>

              <div className="pt-4 flex justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-black/[0.03] flex items-center justify-center border border-black/5">
                    <ShieldCheck className="w-5 h-5 text-[#F88A2B]" />
                  </div>
                  <span className="text-[10px] text-[#999] uppercase tracking-widest">Protegido</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-black/[0.03] flex items-center justify-center border border-black/5">
                    <EyeOff className="w-5 h-5 text-[#F88A2B]" />
                  </div>
                  <span className="text-[10px] text-[#999] uppercase tracking-widest">Anônimo</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-black/[0.03] flex items-center justify-center border border-black/5">
                    <Brain className="w-5 h-5 text-[#F88A2B]" />
                  </div>
                  <span className="text-[10px] text-[#999] uppercase tracking-widest">IA Ética</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* O que a empresa NÃO vê */}
        <section className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-2 mb-4">
            <h2 className="text-2xl font-playfair font-semibold">O que a empresa NÃO vê</h2>
            <div className="w-12 h-0.5 bg-[#F88A2B]/30 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, title: "Respostas individuais", desc: "Seu check-in emocional não aparece para o RH." },
              { icon: MessageSquareOff, title: "Conversas com IA", desc: "O Cury Digital é privado e confidencial." },
              { icon: History, title: "Histórico emocional", desc: "A empresa não acompanha sua jornada individual." },
              { icon: BarChart4, title: "Relatórios pessoais", desc: "Nenhum gestor recebe análises individuais." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-[#E5E0DA] rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#0B0908]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-[#0B0908]">{item.title}</h3>
                  <p className="text-sm text-[#0B0908]/60 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* O que aparece de forma coletiva */}
        <section className="space-y-6">
          <div className="bg-white border border-[#E5E0DA] rounded-[2rem] p-6 space-y-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-playfair font-semibold">Visão Organizacional</h2>
              <p className="text-sm text-[#0B0908]/60 italic">Nunca com identificação individual.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "Tendências emocionais agregadas",
                "Equilíbrio coletivo",
                "Níveis gerais de sobrecarga",
                "Adesão ao check-in",
                "Temas recorrentes da organização"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/[0.03]0 backdrop-blur-sm p-3 rounded-2xl border border-white shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-[#F88A2B]/20">
                    <TrendingUp className="w-3.5 h-3.5 text-[#F88A2B]" />
                  </div>
                  <span className="text-sm font-medium text-[#0B0908]/80">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como a anonimização funciona */}
        <section className="space-y-6">
          <h2 className="text-2xl font-playfair font-semibold text-center">Como a anonimização funciona</h2>
          
          <div className="bg-white border border-[#E5E0DA] rounded-[2rem] p-6 relative overflow-hidden shadow-sm">
            
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[
                { step: 1, text: "Você realiza check-in", icon: CheckCircle2 },
                { step: 2, text: "A IA remove identificação individual", icon: EyeOff },
                { step: 3, text: "Padrões coletivos são agrupados", icon: Users },
                { step: 4, text: "RH recebe apenas tendências organizacionais", icon: BarChart4 }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-row md:flex-col items-center md:items-start gap-6">
                  {idx < 3 && (
                    <div className="absolute left-6 top-10 w-0.5 h-10 bg-gradient-to-b from-[#F88A2B] to-transparent md:hidden" />
                  )}
                  {idx < 3 && (
                    <div className="absolute left-12 top-6 w-full h-0.5 bg-gradient-to-r from-[#F88A2B] to-transparent hidden md:block" />
                  )}
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E0DA] text-[#111] flex items-center justify-center text-[#111] shrink-0 shadow-lg shadow-black/10">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest">Passo {item.step}</span>
                    <p className="text-base font-semibold text-[#0B0908]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compromisso Enterprise */}
        <section>
          <div className="bg-white border border-[#E5E0DA] text-[#111] rounded-[2rem] p-6 text-[#111] space-y-6 shadow-xl">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[#F88A2B] flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6 text-[#111]" />
              </div>
              <div>
                <h2 className="text-xl font-playfair">Compromisso do Enterprise</h2>
                <div className="inline-flex items-center gap-1.5 bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30">
                  <div className="w-1 h-1 bg-orange-500 rounded-full" />
                  <span className="text-[9px] font-bold text-orange-400 uppercase tracking-tighter">Proteção emocional ativa</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-playfair font-light leading-snug">
              O cuidado emocional só funciona <span className="text-[#F88A2B]">com confiança.</span>
            </h3>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                "Sem monitoramento individual",
                "Sem leitura de mensagens privadas",
                "Sem score emocional pessoal",
                "Sem exposição ao RH",
                "Anonimização automática"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center group-hover:border-[#F88A2B] transition-colors">
                    <Check className="w-3 h-3 text-[#F88A2B]" />
                  </div>
                  <span className="text-sm text-[#0B0908]/80 font-medium group-hover:text-[#F88A2B] transition-colors">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Consentimento */}
        <section className="space-y-6">
          <div className="bg-white border border-[#E5E0DA] rounded-[2rem] p-6 space-y-8 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-2xl font-playfair font-semibold">Sua Aprovação</h2>
              <p className="text-sm text-[#0B0908]/60 leading-relaxed">
                Para garantir a segurança de todos, confirme seu entendimento abaixo:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {[
                { key: 'individualPrivate', label: "Entendo que minha experiência individual é privada." },
                { key: 'collectiveTrends', label: "Entendo que a empresa verá apenas tendências coletivas agregadas." },
                { key: 'anonymousProcessing', label: "Concordo com o processamento anonimizado para fins de inteligência emocional organizacional." },
                { key: 'privacyPolicy', label: "Li e compreendi a política de privacidade Enterprise." }
              ].map((item) => (
                <div 
                  key={item.key}
                  onClick={() => toggleConsent(item.key as keyof typeof consents)}
                  className="flex items-start gap-4 cursor-pointer group"
                >
                  <div className={`
                    w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all duration-300
                    ${consents[item.key as keyof typeof consents] 
                      ? 'bg-[#F88A2B] border-[#F88A2B]' 
                      : 'bg-white border-[#E5E0DA] group-hover:border-[#F88A2B]/50'}
                  `}>
                    <AnimatePresence>
                      {consents[item.key as keyof typeof consents] && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <Check className="w-3.5 h-3.5 text-[#111]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className={`text-sm leading-relaxed select-none transition-colors ${consents[item.key as keyof typeof consents] ? 'text-[#0B0908] font-medium' : 'text-[#0B0908]/60'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full py-2 text-sm text-[#F88A2B] font-semibold border-b border-[#F88A2B]/20 hover:border-[#F88A2B] transition-all text-center">
              Ler política completa
            </button>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4 pt-4 pb-8">
          <button 
            disabled={!allChecked}
            onClick={handleContinue}
            className={`
              w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500
              ${allChecked 
                ? 'bg-[#F88A2B] text-[#111] shadow-lg hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-[#E5E0DA] text-[#0B0908]/30 cursor-not-allowed opacity-70'}
            `}
          >
            <span className="font-bold text-lg tracking-tight">Continuar com confiança</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button 
            onClick={() => navigate(-1)}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[#0B0908]/40 hover:text-[#0B0908] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">Voltar</span>
          </button>
          
          <div className="pt-8 text-center space-y-2">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-bold">
              O Enterprise existe para apoiar pessoas — nunca monitorá-las.
            </p>
            <div className="flex justify-center gap-4 text-[10px] text-[#0B0908]/20 font-medium">
              <span>GDPR/LGPD Compliant</span>
              <span>•</span>
              <span>End-to-End Encrypted</span>
              <span>•</span>
              <span>Ethical AI</span>
            </div>
          </div>
        </section>
      </main>
    </div>
    </EnterpriseUserLayout>
  );
};

export default EnterprisePrivacyConsentScreen;
