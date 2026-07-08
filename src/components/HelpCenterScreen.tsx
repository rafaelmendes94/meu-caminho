import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  ChevronLeft, Search, ChevronDown, MessageCircle, Sparkles, 
  HelpCircle, Book, Headphones, ShieldCheck, Mail, Phone, ExternalLink,
  ChevronRight, ArrowRight, LifeBuoy
} from "lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { motion, AnimatePresence } from "framer-motion";

const serif = { fontFamily: "'Playfair Display', serif" };

const faqs = [
  { 
    category: "Jornada",
    q: "Como funciona a Trilha Personalizada?", 
    a: "A Trilha é criada com base no seu perfil emocional inicial. Ela evolui com você a cada interação, sugerindo conteúdos que fazem sentido para o seu momento atual e objetivos de desenvolvimento pessoal." 
  },
  { 
    category: "Conteúdo",
    q: "Como baixar conteúdos para ver offline?", 
    a: "Dentro de qualquer áudio, vídeo ou leitura, toque no ícone de download (nuvem). O conteúdo ficará disponível na aba 'Downloads' do seu menu, permitindo acesso mesmo sem conexão à internet." 
  },
  { 
    category: "Progresso",
    q: "Onde acompanho minha evolução emocional?", 
    a: "Acesse a tela 'Minha evolução' no Menu. Lá você encontrará gráficos de progresso, suas conquistas desbloqueadas e os principais indicadores do seu bem-estar ao longo do tempo." 
  },
  { 
    category: "Clube do Livro",
    q: "Quais os benefícios do Clube do Livro?", 
    a: "Você tem acesso ilimitado à biblioteca digital do Dr. Augusto Cury, incluindo lançamentos exclusivos, leituras guiadas pela IA e ferramentas de marcação inteligente para estudos." 
  },
  { 
    category: "Conta",
    q: "Como gerenciar minha assinatura Enterprise?", 
    a: "Assinaturas Enterprise são gerenciadas coletivamente pela sua organização. Se você precisar alterar dados do seu perfil ou senha, acesse Menu > Configurações > Conta." 
  },
];

const HelpCenterScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  
  const [open, setOpen] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!search) return faqs;
    const s = search.toLowerCase();
    return faqs.filter(f => f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s));
  }, [search]);

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Central de Ajuda & Suporte">
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
          
          {/* SaaS Header / Hero Section */}
          <section className="bg-white rounded-[40px] p-8 lg:p-14 shadow-sm border border-black/5 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50/50 blur-[100px] rounded-full -mr-48 -mt-48" />
            
            <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F88A2B] text-[10px] font-bold uppercase tracking-widest">
                <LifeBuoy size={12} fill="currentColor" /> Suporte Premium
              </div>
              <h1 className="text-4xl lg:text-6xl font-playfair font-bold text-[#111] leading-tight">
                Como podemos<br />
                <span className="text-[#F88A2B]">te apoiar hoje?</span>
              </h1>
              
              <div className="relative max-w-xl mx-auto lg:mx-0">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B8B0A8]" />
                <input 
                  type="text" 
                  placeholder="Busque por temas, dúvidas ou ferramentas..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-[#F9F8F6] border border-black/5 rounded-[24px] text-base focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/20 transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {["Trilha", "Privacidade", "Check-in", "IA"].map(tag => (
                  <button key={tag} className="px-5 py-2 rounded-xl bg-white border border-black/5 text-xs font-bold text-[#8A8A8A] hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-80 space-y-4 shrink-0 relative z-10">
               <div className="bg-[#0B0908] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-2xl rounded-full" />
                  <MessageCircle className="text-orange-500 mb-6" size={32} />
                  <h3 className="text-xl font-bold mb-2 font-playfair">Fale Conosco</h3>
                  <p className="text-xs text-white/50 leading-relaxed mb-6">Tire dúvidas em tempo real com nosso time de especialistas.</p>
                  <button className="w-full py-4 bg-white text-[#111] rounded-2xl font-bold text-sm hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                    Iniciar Chat <ArrowRight size={16} />
                  </button>
               </div>
               
               <div className="bg-white rounded-[32px] p-6 border border-black/5 shadow-sm flex items-center gap-4 group cursor-pointer hover:border-orange-500/20 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <Book size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#111]">Documentação</p>
                    <p className="text-[10px] text-[#8A8A8A]">Guia completo de uso</p>
                  </div>
                  <ChevronRight size={16} className="text-black/10 group-hover:translate-x-1 transition-all" />
               </div>
            </div>
          </section>

          {/* FAQ SaaS Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-[#111] flex items-center gap-3">
                <HelpCircle size={24} className="text-orange-500" /> Perguntas Frequentes
              </h2>
              
              <div className="space-y-4">
                {filteredFaqs.map((f, i) => (
                  <motion.div 
                    layout
                    key={i}
                    className={`bg-white rounded-[24px] border transition-all overflow-hidden ${
                      open === i ? "border-orange-500/20 shadow-md ring-1 ring-orange-500/5" : "border-black/5 shadow-sm hover:border-black/10"
                    }`}
                  >
                    <button 
                      onClick={() => setOpen(open === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">{f.category}</span>
                        <span className="text-base font-bold text-[#111] leading-tight">{f.q}</span>
                      </div>
                      <div className={`w-10 h-10 rounded-xl bg-[#F9F8F6] flex items-center justify-center shrink-0 transition-all ${open === i ? "bg-orange-500 text-white" : "text-black/20"}`}>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {open === i && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6"
                        >
                          <div className="h-px w-full bg-black/[0.03] mb-6" />
                          <p className="text-sm text-[#666] leading-relaxed max-w-2xl">{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Support Sidebar */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#111]">Canais de Contato</h2>
              
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 space-y-6">
                {[
                  { label: "Suporte via E-mail", desc: "meu@caminho.com", Icon: Mail, color: "#9B8AC9", bg: "bg-purple-50" },
                  { label: "WhatsApp Corporate", desc: "0800 700 800", Icon: Phone, color: "#7FBF9F", bg: "bg-green-50" },
                  { label: "Central de Privacidade", desc: "Ver políticas", Icon: ShieldCheck, color: "#F88A2B", bg: "bg-orange-50", to: "/enterprise/privacidade" }
                ].map((channel, i) => (
                  <div 
                    key={i} 
                    onClick={() => channel.to && navigate(channel.to)}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${channel.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                      <channel.Icon size={20} style={{ color: channel.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#111] group-hover:text-orange-500 transition-colors">{channel.label}</p>
                      <p className="text-[11px] text-[#8A8A8A]">{channel.desc}</p>
                    </div>
                    <ExternalLink size={14} className="text-black/10 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-[#111] to-[#222] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
                 <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-white/5 rotate-12 transition-transform group-hover:scale-110" />
                 <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2 font-playfair">Feedback</h3>
                    <p className="text-xs text-white/50 leading-relaxed mb-6">Sua opinião ajuda a moldar o futuro do ecossistema Enterprise.</p>
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Enviar Sugestão</button>
                 </div>
              </div>
            </div>

          </div>

          <div className="text-center pt-10 border-t border-black/[0.03]">
            <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Enterprise RH · Central de Suporte ao Colaborador · v1.2.0</p>
          </div>
        </div>
      </EnterpriseUserLayout>
    );
  }

  // Mobile/Legacy Layout
  return (
    <AppUserLayout>
      <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
        <div className="relative w-full h-[100dvh] overflow-hidden bg-[#F7F4F2] flex flex-col"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(80% 35% at 50% 0%, rgba(248,138,43,0.14) 0%, rgba(248,138,43,0) 70%), radial-gradient(60% 25% at 50% 100%, rgba(155,138,201,0.06) 0%, rgba(155,138,201,0) 70%)" }} />
          <div className="relative z-10 flex items-center px-5 pt-6 pb-1 shrink-0">
            <Link to={al("/menu")} className="w-10 h-10 rounded-full bg-white/70 border border-white flex items-center justify-center shadow-sm active:scale-95 transition-transform">
              <ChevronLeft size={20} className="text-[#444]" />
            </Link>
            <h1 style={serif} className="flex-1 text-center text-[20px] text-[#111] tracking-tight pr-10">Central de ajuda</h1>
          </div>

          <div className="relative z-10 flex-1 px-5 pb-6 overflow-y-auto no-scrollbar">
            <div className="relative mt-3 rounded-3xl bg-white/60 border border-white/70 shadow-sm p-6 text-center">
              <Sparkles size={24} className="text-[#F88A2B] mx-auto mb-3" />
              <h2 style={serif} className="text-xl text-[#111]">Como podemos ajudar?</h2>
            </div>

            <div className="mt-5 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" />
              <input
                placeholder="Buscar ajuda…"
                className="w-full bg-white/80 border border-white/70 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/30"
              />
            </div>

            <p className="text-[10px] font-bold tracking-widest text-[#B58A5A] px-2 mb-2.5 mt-7 uppercase">Perguntas Frequentes</p>
            <div className="bg-white/70 rounded-3xl px-4 border border-white/60 divide-y divide-[#F0EAE3]">
              {faqs.map((f, i) => (
                <div key={i} className="py-4">
                  <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between text-left gap-3">
                    <span className="text-[14px] font-bold text-[#111] leading-tight">{f.q}</span>
                    <ChevronDown size={16} className={`text-[#C9C2BB] transition-transform ${open === i ? "rotate-180" : ""}`} />
                  </button>
                  {open === i && <p className="mt-3 text-[13px] text-[#666] leading-relaxed">{f.a}</p>}
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-3xl bg-white/75 border border-white/60 p-6 text-center">
              <MessageCircle size={24} className="text-[#8FB17D] mx-auto mb-3" />
              <h3 style={serif} className="text-lg text-[#111]">Precisa de suporte?</h3>
              <button className="mt-4 w-full py-3.5 rounded-full text-sm font-bold text-white shadow-lg" style={{ background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)" }}>
                Falar com suporte
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppUserLayout>
  );
};

export default HelpCenterScreen;