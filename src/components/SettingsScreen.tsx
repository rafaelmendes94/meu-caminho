import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, Globe, Moon, Bell, Play, Video,
  Lock, Mail, Shield, FileText, ScrollText, CheckCircle2, User, 
  Smartphone, Monitor, ShieldCheck, Info, HelpCircle, MessageSquare
} from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { motion } from "framer-motion";

const langLabel = (id: string) => ({ pt: "Português", en: "English", es: "Español" }[id] || "Português");
const qualityLabel = (id: string) => ({ auto: "Auto", high: "Alta", medium: "Média", low: "Baixa" }[id] || "Auto");

const serif = { fontFamily: "'Playfair Display', serif" };

const IOSSwitch = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    aria-pressed={on}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none ${on ? "bg-[#F88A2B]" : "bg-[#E5E5E5]"}`}
  >
    <motion.span
      animate={{ x: on ? 22 : 4 }}
      className="block h-4 w-4 rounded-full bg-white shadow-sm"
    />
  </button>
);

const SettingsScreen = () => {
  const al = useAudienceLink();
  const location = useLocation();
  const navigate = useNavigate();
  const isEnterprise = location.pathname.startsWith('/enterprise');
  
  const [dark, toggleDark] = useDarkMode();
  const [s, setS] = useState({ reminders: true, autoplay: false });
  const [lang, setLang] = useState<string>(() => (typeof window !== "undefined" && localStorage.getItem("mc-lang")) || "pt");
  const [quality, setQuality] = useState<string>(() => (typeof window !== "undefined" && localStorage.getItem("mc-quality")) || "auto");

  useEffect(() => {
    const onFocus = () => {
      setLang(localStorage.getItem("mc-lang") || "pt");
      setQuality(localStorage.getItem("mc-quality") || "auto");
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Configurações do Sistema">
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          
          {/* SaaS Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 style={serif} className="text-4xl lg:text-5xl font-bold text-[#111]">Configurações</h1>
              <p className="text-base text-[#8A8A8A] font-medium">Personalize sua experiência e gerencie sua conta corporativa.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-green-100 flex items-center gap-2">
                <CheckCircle2 size={12} /> Sincronizado com Nuvem
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Preferences */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Preferences Card */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
                <h2 className="text-xl font-bold text-[#111] mb-8 flex items-center gap-3">
                  <Monitor size={20} className="text-[#F88A2B]" /> Preferências de Uso
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      label: "Idioma do App", 
                      desc: langLabel(lang), 
                      Icon: Globe, 
                      to: al("/configuracoes/idioma"),
                      color: "#9B8AC9", bg: "#EFEAF7"
                    },
                    { 
                      label: "Qualidade de Vídeo", 
                      desc: qualityLabel(quality), 
                      Icon: Video, 
                      to: al("/configuracoes/qualidade"),
                      color: "#9B8AC9", bg: "#EFEAF7"
                    }
                  ].map((item) => (
                    <Link key={item.label} to={item.to} className="flex items-center justify-between p-5 rounded-2xl bg-[#F9F8F6] hover:bg-black/5 transition-all border border-transparent hover:border-black/5 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#111] shadow-sm">
                          <item.Icon size={20} style={{ color: item.color }} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#111]">{item.label}</span>
                          <span className="text-[11px] text-[#8A8A8A]">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-black/10 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    { label: "Tema Escuro", desc: "Reduz o cansaço visual em ambientes de pouca luz", Icon: Moon, type: 'dark' },
                    { label: "Lembretes Diários", desc: "Receba incentivos para manter sua sequência", Icon: Bell, type: 'reminders' },
                    { label: "Reprodução Automática", desc: "Próximo conteúdo inicia automaticamente", Icon: Play, type: 'autoplay' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-5 rounded-2xl hover:bg-[#F9F8F6] transition-all group border border-transparent hover:border-black/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F88A2B] flex items-center justify-center">
                          <item.Icon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#111]">{item.label}</span>
                          <span className="text-[11px] text-[#8A8A8A]">{item.desc}</span>
                        </div>
                      </div>
                      <IOSSwitch 
                        on={item.type === 'dark' ? dark : (item.type === 'reminders' ? s.reminders : s.autoplay)} 
                        onChange={() => {
                          if (item.type === 'dark') toggleDark();
                          else if (item.type === 'reminders') setS({...s, reminders: !s.reminders});
                          else setS({...s, autoplay: !s.autoplay});
                        }} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Account Card */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
                <h2 className="text-xl font-bold text-[#111] mb-8 flex items-center gap-3">
                  <Lock size={20} className="text-[#9B8AC9]" /> Conta e Segurança
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Alterar Senha", desc: "Atualize suas credenciais de acesso", Icon: Lock, to: al("/configuracoes/senha") },
                    { label: "Alterar E-mail", desc: "rafael.oliveira@cury.com.br", Icon: Mail, to: al("/configuracoes/email") },
                    { label: "Autenticação", desc: "Configurações de login corporativo", Icon: ShieldCheck, to: al("/configuracoes/privacidade") }
                  ].map((item) => (
                    <Link key={item.label} to={item.to} className="flex items-center justify-between p-5 rounded-2xl hover:bg-[#F9F8F6] transition-all group border border-transparent hover:border-black/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#9B8AC9] flex items-center justify-center">
                          <item.Icon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#111]">{item.label}</span>
                          <span className="text-[11px] text-[#8A8A8A]">{item.desc}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-black/10 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Legal & Device */}
            <div className="space-y-8">
              
              {/* Legal Card */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
                <h2 className="text-lg font-bold text-[#111] mb-6 flex items-center gap-2">
                  <Shield size={18} className="text-[#8FB17D]" /> Jurídico
                </h2>
                <div className="space-y-2">
                  {[
              { label: "Ajuda e Suporte", Icon: HelpCircle, to: al("/ajuda") },
              { label: "Fale Conosco", Icon: MessageSquare, to: al("/fale-conosco") },
              { label: "Sobre o App", Icon: Info, to: "#" }
                  ].map((item) => (
                    <Link key={item.label} to={item.to} className="flex items-center justify-between p-4 rounded-xl hover:bg-[#F9F8F6] transition-all group">
                      <div className="flex items-center gap-3">
                        <item.Icon size={16} className="text-[#8A8A8A]" />
                        <span className="text-xs font-bold text-[#111]">{item.label}</span>
                      </div>
                      <ChevronRight size={14} className="text-black/10" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Device Info Card */}
              <div className="bg-gradient-to-br from-[#111] to-[#222] rounded-[32px] p-8 text-white shadow-xl shadow-black/10 relative overflow-hidden">
                <Smartphone className="absolute -top-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] mb-4">Informações da Sessão</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">Dispositivo</span>
                      <span className="text-xs font-bold">Desktop Browser</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">Localização</span>
                      <span className="text-xs font-bold">São Paulo, BR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">Versão</span>
                      <span className="text-xs font-bold">v1.2.0 (Build 302)</span>
                    </div>
                  </div>
                  <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Encerrar Outras Sessões</button>
                </div>
              </div>

            </div>
          </div>

          <div className="text-center pt-10">
            <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Meu Caminho · Todos os direitos reservados</p>
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
            style={{ background: "radial-gradient(70% 30% at 50% 0%, rgba(248,138,43,0.10) 0%, rgba(248,138,43,0) 70%)" }} />
          <div className="relative z-10 flex items-center px-5 pt-6 pb-1 shrink-0">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/70 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition-transform">
              <ChevronLeft size={20} className="text-[#444]" />
            </button>
            <h1 style={serif} className="flex-1 text-center text-[22px] text-[#111] tracking-tight pr-10">Configurações</h1>
          </div>

          <div className="relative z-10 flex-1 px-5 pb-6 overflow-y-auto no-scrollbar">
            <p className="text-[10.5px] font-bold tracking-[0.18em] text-[#B58A5A] px-2 mb-2.5 mt-7 uppercase">Preferências</p>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl px-4 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.08)] border border-white/60 divide-y divide-[#F0EAE3]">
              <Link to={al("/configuracoes/idioma")} className="flex items-center gap-3.5 py-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#EFEAF7]">
                  <Globe size={16} color="#9B8AC9" />
                </div>
                <p className="flex-1 text-[14px] font-bold text-[#111]">Idioma</p>
                <div className="flex items-center gap-1 text-[12.5px] text-[#8A8A8A]">{langLabel(lang)} <ChevronRight size={14} /></div>
              </Link>
              <div className="flex items-center gap-3.5 py-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#ECE7E2]">
                  <Moon size={16} color="#444" />
                </div>
                <p className="flex-1 text-[14px] font-bold text-[#111]">Tema escuro</p>
                <IOSSwitch on={dark} onChange={() => toggleDark()} />
              </div>
              <div className="flex items-center gap-3.5 py-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FDECDA]">
                  <Bell size={16} color="#F88A2B" />
                </div>
                <p className="flex-1 text-[14px] font-bold text-[#111]">Lembretes diários</p>
                <IOSSwitch on={s.reminders} onChange={() => setS({...s, reminders: !s.reminders})} />
              </div>
            </div>

            <p className="text-[10.5px] font-bold tracking-[0.18em] text-[#B58A5A] px-2 mb-2.5 mt-7 uppercase">Conta</p>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl px-4 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.08)] border border-white/60 divide-y divide-[#F0EAE3]">
              <Link to={al("/configuracoes/senha")} className="flex items-center gap-3.5 py-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FDECDA]">
                  <Lock size={16} color="#F88A2B" />
                </div>
                <p className="flex-1 text-[14px] font-bold text-[#111]">Alterar senha</p>
                <ChevronRight size={16} className="text-[#C9C2BB]" />
              </Link>
              <Link to={al("/configuracoes/email")} className="flex items-center gap-3.5 py-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#EFEAF7]">
                  <Mail size={16} color="#9B8AC9" />
                </div>
                <p className="flex-1 text-[14px] font-bold text-[#111]">Alterar e-mail</p>
                <ChevronRight size={14} className="text-[#C9C2BB]" />
              </Link>
            </div>

            <p className="text-center text-[10.5px] text-[#B8B0A8] mt-10 mb-4">Meu Caminho · v1.2.0</p>
          </div>
        </div>
      </main>
    </AppUserLayout>
  );
};

export default SettingsScreen;