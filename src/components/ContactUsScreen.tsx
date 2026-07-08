import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronLeft, Send, MessageSquare, Phone, Mail, MapPin, 
  Sparkles, CheckCircle2, Clock, Globe, Headphones, ArrowRight, ChevronRight
} from "lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const serif = { fontFamily: "'Playfair Display', serif" };

const ContactUsScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toast } = useToast();
  const isEnterprise = pathname.startsWith('/enterprise');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Mensagem enviada",
        description: "Recebemos seu contato e retornaremos em breve.",
        className: "bg-[#0B0908] text-white border-[#F88A2B]/20",
      });
    }, 1500);
  };

  const EnterpriseContent = () => (
    <div className="max-w-6xl mx-auto space-y-10 pb-24">
      {/* SaaS Header */}
      <section className="bg-white rounded-[40px] p-8 lg:p-14 shadow-sm border border-black/5 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-50/50 blur-[100px] rounded-full -mr-48 -mt-48" />
        
        <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest">
            <Headphones size={12} fill="currentColor" /> Suporte Dedicado
          </div>
          <h1 className="text-4xl lg:text-6xl font-playfair font-bold text-[#111] leading-tight">
            Estamos aqui para<br />
            <span className="text-green-600">te ouvir.</span>
          </h1>
          <p className="text-base text-[#666] leading-relaxed max-w-xl">
            Sua jornada emocional é nossa prioridade. Seja para suporte técnico, dúvidas sobre a trilha ou sugestões, nosso time de acolhimento está pronto para ajudar.
          </p>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F9F8F6] flex items-center justify-center text-[#111]">
                   <Clock size={18} />
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Tempo de Resposta</p>
                   <p className="text-sm font-bold text-[#111]">Abaixo de 2h</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F9F8F6] flex items-center justify-center text-[#111]">
                   <Globe size={18} />
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Disponibilidade</p>
                   <p className="text-sm font-bold text-[#111]">24/7 para Emergências</p>
                </div>
             </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px] relative z-10">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="bg-[#0B0908] rounded-[32px] p-8 text-white shadow-2xl space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Assunto</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 appearance-none">
                    <option className="bg-[#0B0908]">Suporte Técnico</option>
                    <option className="bg-[#0B0908]">Dúvidas sobre a Trilha</option>
                    <option className="bg-[#0B0908]">Sugestões e Feedback</option>
                    <option className="bg-[#0B0908]">Outros Assuntos</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Sua Mensagem</label>
                  <textarea 
                    rows={4}
                    placeholder="Como podemos te ajudar hoje?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 placeholder:text-white/20"
                    required
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar Mensagem"} <Send size={16} />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[32px] p-10 border border-black/5 shadow-xl text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto text-green-600">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[#111] font-playfair">Recebido com Sucesso!</h3>
                <p className="text-sm text-[#8A8A8A] leading-relaxed">
                  Sua mensagem já está com nosso time de acolhimento. Fique atento ao seu e-mail corporativo para nossa resposta.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="w-full py-4 bg-[#F9F8F6] text-[#111] rounded-xl font-bold text-sm hover:bg-black/5 transition-all"
                >
                  Enviar Outra Mensagem
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Direct Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "WhatsApp Corporate", desc: "+55 11 99999-9999", Icon: Phone, color: "text-green-600", bg: "bg-green-50" },
          { label: "E-mail de Suporte", desc: "suporte@cury.com.br", Icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Sede Global", desc: "São Paulo, SP - Brasil", Icon: MapPin, color: "text-orange-500", bg: "bg-orange-50" }
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-black/10 transition-all">
            <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
              <item.Icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">{item.label}</p>
              <p className="text-base font-bold text-[#111]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MobileContent = () => (
    <main className="min-h-screen bg-[#F7F4F2] flex flex-col font-display">
      <div className="px-5 pt-8 pb-4 shrink-0 flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5 active:scale-95 transition-all">
           <ChevronLeft size={20} className="text-[#111]" />
         </button>
         <h1 style={serif} className="text-xl font-bold text-[#111]">Fale Conosco</h1>
         <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-6 no-scrollbar">
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-black/5">
           <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#F88A2B]">
             <MessageSquare size={28} />
           </div>
           <h2 style={serif} className="text-2xl font-bold text-[#111]">Como podemos ajudar?</h2>
           <p className="text-sm text-[#8A8A8A] mt-2">Escolha um canal para falar com nosso time.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#B8B0A8] uppercase ml-1">Assunto</label>
              <select className="w-full bg-[#F9F8F6] border border-black/5 rounded-xl px-4 py-3 text-sm appearance-none">
                <option>Suporte Técnico</option>
                <option>Dúvidas da Trilha</option>
                <option>Sugestões</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#B8B0A8] uppercase ml-1">Sua Mensagem</label>
              <textarea 
                rows={3}
                placeholder="Escreva aqui..."
                className="w-full bg-[#F9F8F6] border border-black/5 rounded-xl px-4 py-3 text-sm"
                required
              />
            </div>
            <button className="w-full py-4 bg-[#F88A2B] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20">
              Enviar Agora
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-black/5 space-y-4">
             <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600">
               <CheckCircle2 size={32} />
             </div>
             <h3 className="text-lg font-bold text-[#111]">Enviado!</h3>
             <p className="text-xs text-[#8A8A8A]">Responderemos em seu e-mail em breve.</p>
             <button onClick={() => setSubmitted(false)} className="text-sm font-bold text-[#F88A2B]">Enviar outra mensagem</button>
          </div>
        )}

        <div className="space-y-3">
           <button className="w-full p-4 bg-white rounded-2xl border border-black/5 flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600"><Phone size={18} /></div>
              <div className="flex-1"><p className="text-xs font-bold text-[#111]">WhatsApp</p><p className="text-[10px] text-[#8A8A8A]">Atendimento Instantâneo</p></div>
              <ChevronRight size={16} className="text-black/10" />
           </button>
           <button className="w-full p-4 bg-white rounded-2xl border border-black/5 flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Mail size={18} /></div>
              <div className="flex-1"><p className="text-xs font-bold text-[#111]">E-mail</p><p className="text-[10px] text-[#8A8A8A]">suporte@cury.com.br</p></div>
              <ChevronRight size={16} className="text-black/10" />
           </button>
        </div>
      </div>
    </main>
  );

  return isEnterprise ? (
    <EnterpriseUserLayout title="Fale Conosco">
      <EnterpriseContent />
    </EnterpriseUserLayout>
  ) : (
    <AppUserLayout title="Fale Conosco">
      <MobileContent />
    </AppUserLayout>
  );
};

export default ContactUsScreen;