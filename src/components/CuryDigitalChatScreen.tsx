import { Link, useLocation } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { Search, Pin, MessageSquare, MoreVertical, Paperclip, Send as SendIcon } from "lucide-react";

const ink900 = "#111111";
const ink700 = "#444444";
const ink600 = "#666666";
const ink500 = "#999999";
const brand = "#F88A2B";
const sage = "#8FB17D";
const sageBg = "#E3ECDD";
const lilac = "#9B8AC9";
const bg = "#F7F4F2";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const ChevL = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const Check2 = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4L19 6"/><path d="M9 12l4 4L23 6" opacity="0.5"/></svg>;
const HeartO = ({ c = brand }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const Wind = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sage} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h16a3 3 0 1 1-3 3"/></svg>;
const Spark = ({ c = lilac }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l1.4 4.2L17.5 9.5 13.4 11l-1.4 4-1.4-4L6.5 9.5l4.1-1.3z"/></svg>;
const ChatIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4V6z"/></svg>;

const Orb = ({ s = 36 }: { s?: number }) => (
  <div className="relative flex items-center justify-center shrink-0" style={{ width: s, height: s }}>
    <div className="absolute rounded-full" style={{ width: s + 14, height: s + 14, background: "radial-gradient(circle, rgba(248,138,43,0.35), transparent 70%)", filter: "blur(6px)", animation: "pulse-soft 3.4s ease-in-out infinite" }} />
    <div
      className="relative rounded-full"
      style={{
        width: s, height: s,
        background: "radial-gradient(circle at 35% 30%, #FFE2C4 0%, #F8B26B 38%, #E07A2B 78%, #B85A18 100%)",
        boxShadow: "0 6px 16px -4px rgba(248,138,43,0.55), inset -3px -5px 8px rgba(0,0,0,0.18), inset 3px 4px 10px rgba(255,255,255,0.45)",
      }}
    >
      <span className="absolute top-1.5 left-2 w-2 h-1 rounded-full bg-white/70 blur-[1px]" />
    </div>
  </div>
);

const CuryDigitalChatScreen = () => {
  const al = useAudienceLink();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const base = isEnterprise ? '/enterprise/cury-digital' : '/cury-digital';
  
  const actions = [
    { icon: <HeartO/>, label: "Exercício rápido", sub: "3 min", to: al('/aula') },
    { icon: <Spark c={lilac}/>, label: "Reflexão guiada", sub: "5 min", to: al('/cury-digital/insights') },
    { icon: <Wind/>, label: "Respirar 2 minutos", sub: "Respiração", to: al('/aula') },
    { icon: <ChatIcon/>, label: "Continuar conversa", sub: "Aprofundar", to: al('/cury-digital/chat') },
  ];

  const Layout = isEnterprise ? EnterpriseUserLayout : AppUserLayout;

  const chatContent = (
    <div className={`relative flex flex-col h-full bg-white lg:bg-transparent ${isEnterprise ? '' : 'min-h-[100dvh]'}`}>
      {/* Mobile Header (Hidden on Desktop Enterprise) */}
      <div className={`relative z-20 flex items-center justify-between px-5 py-4 shrink-0 border-b border-black/5 lg:hidden`}>
        <Link to={base} className="w-10 h-10 rounded-full bg-[#F7F4F2] flex items-center justify-center text-ink700">
          <ChevL/>
        </Link>
        <div className="flex items-center gap-3">
          <Orb s={32}/>
          <div>
            <p className="text-[14px] font-bold text-ink900 leading-tight">Cury Digital</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sage"/>
              <p className="text-[10px] text-ink600 font-medium">Online</p>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#F7F4F2] flex items-center justify-center">
          <MoreVertical size={18} className="text-ink700" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className={`flex-1 overflow-y-auto no-scrollbar px-5 lg:px-10 py-0 space-y-4 lg:pt-2`}>
          {/* Empty state — chat backend não implementado */}
          <div className="flex flex-col items-center justify-center text-center px-6 py-10 gap-4">
            <Orb s={56}/>
            <div className="space-y-1 max-w-md">
              <h3 className="text-[18px] lg:text-[22px] font-bold text-ink900" style={serif}>
                O Cury Digital está sendo preparado.
              </h3>
              <p className="text-[13px] lg:text-[14px] text-ink600 leading-relaxed">
                A conversa com a IA será liberada em breve. Enquanto isso, use os recursos abaixo para cuidar da sua mente.
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {actions.map((a, i) => (
              <Link key={i} to={a.to} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-black/5 hover:border-brand/30 hover:shadow-md transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${i === 0 ? "bg-[#FFF1E1] text-brand" : i === 1 ? "bg-[#EFEAF8] text-lilac" : i === 2 ? "bg-[#E3ECDD] text-sage" : "bg-[#F7F4F2] text-brand"}`}>
                  {a.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-ink900 leading-tight group-hover:text-brand">{a.label}</p>
                  <p className="text-[11px] text-ink600 mt-0.5">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className={`p-5 lg:p-8 ${isEnterprise ? 'bg-[#F7F4F2]' : 'bg-white'} lg:border-t-0 border-t border-black/5 shrink-0`}>
          <div className="max-w-4xl mx-auto relative">
            <div className={`relative flex items-end gap-2 lg:gap-4 ${isEnterprise ? 'bg-white' : 'bg-[#F7F4F2]'} rounded-[28px] p-2 lg:p-3 border border-black/5 lg:shadow-xl lg:shadow-black/5 opacity-60`}>
              <button disabled aria-disabled className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shrink-0 cursor-not-allowed">
                <Paperclip size={20} className="text-ink600" />
              </button>
              <textarea 
                rows={1}
                disabled
                placeholder="Chat com a IA em breve…"
                className="flex-1 bg-transparent border-none outline-none text-[14px] lg:text-[16px] py-2 lg:py-3 resize-none max-h-40 min-h-[40px] placeholder:text-[#999] cursor-not-allowed"
              />
              <button disabled aria-disabled className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center bg-[#F88A2B]/40 text-white shrink-0 cursor-not-allowed">
                <SendIcon size={20} style={{ color: 'white' }} />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-[#999]">A conversa com o Cury Digital será liberada em breve.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Chat com Cury Digital">
      <main className={`h-full w-full ${isEnterprise ? 'lg:p-0 bg-[#F7F4F2]' : 'h-screen flex items-center justify-center bg-[#F7F4F2] overflow-hidden'}`}>
        <div className={`relative w-full h-full overflow-hidden flex ${isEnterprise ? 'h-[calc(100vh-80px)]' : 'h-[100dvh] flex-col'}`}>
          {isEnterprise && (
            <div className="hidden lg:flex w-[320px] flex-col border-r border-black/5 bg-white shrink-0 h-full">
              <div className="p-6 border-b border-black/5">
                <h2 style={serif} className="text-2xl font-bold text-ink900">Mensagens</h2>
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink500" size={16} />
                  <input placeholder="Buscar conversas..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F7F4F2] border-none text-sm outline-none" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
                <div className="p-6 rounded-2xl bg-white border border-dashed border-black/10 text-center">
                  <MessageSquare size={18} className="text-ink500 mx-auto mb-2" />
                  <p className="text-[13px] font-bold text-ink900">Nenhuma conversa ainda</p>
                  <p className="text-[11px] text-ink600 mt-1">Suas sessões com o Cury Digital aparecerão aqui.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-w-0 h-full relative">
            {isEnterprise && (
              <div className="hidden lg:flex items-center justify-between px-8 py-3 border-b border-black/5 bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <Orb s={44}/>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-ink900">Cury Digital</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-sage animate-pulse"/>
                      <p className="text-[12px] text-ink600 font-medium">IA Mentor — Pronto para ajudar</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="w-11 h-11 rounded-xl hover:bg-black/5 flex items-center justify-center transition-colors">
                    <Pin size={20} className="text-ink600" />
                  </button>
                  <button className="w-11 h-11 rounded-xl hover:bg-black/5 flex items-center justify-center transition-colors">
                    <MessageSquare size={20} className="text-ink600" />
                  </button>
                  <button className="w-11 h-11 rounded-xl hover:bg-black/5 flex items-center justify-center transition-colors">
                    <MoreVertical size={20} className="text-ink600" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex-1 min-h-0 flex flex-col">
              {chatContent}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse-soft { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.92} }
          .no-scrollbar::-webkit-scrollbar{display:none}
          .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        `}</style>
      </main>
    </Layout>
  );
};

export default CuryDigitalChatScreen;