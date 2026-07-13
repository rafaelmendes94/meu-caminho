import { useState } from"react";
import { Link, useNavigate, useLocation } from"react-router-dom";
import heroImg from"@/assets/trilha/aula-hero.jpg";
import curyImg from"@/assets/trilha/cury.jpg";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { MediaDesktopLayout, SidePanelCard, SidePanelList } from "./layouts/MediaDesktopLayout";
import nextImg from"@/assets/trilha/modulo1.jpg";
import { useAudienceLink } from "@/hooks/use-audience";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

const ink900 ="#111111";
const ink600 ="#5A544E";
const ink500 ="#8A847E";
const brand ="#F88A2B";
const bg ="#F7F4F2";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;

const Signal = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const Wifi = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const Battery = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const ChevL = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevR = ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const Dots = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>;
const PlayFill = ({ s = 22, c ="#111" }: { s?: number; c?: string }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M8 5v14l11-7z"/></svg>;
const Bookmark = ({ c ="#111", filled = false }: { c?: string; filled?: boolean }) => <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? c :"none"} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>;
const Clock = ({ c = ink500 }: { c?: string }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const FullIcon = ({ c ="#fff" }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>;

const Speed = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="3"/><text x="12" y="15" textAnchor="middle" fontSize="7" fill={brand} stroke="none" fontWeight="700">1.0x</text></svg>;
const Audio = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v4h3l5 4V6L7 10H4z" fill="#111"/><path d="M16 8a5 5 0 0 1 0 8"/><path d="M19 5a9 9 0 0 1 0 14"/></svg>;
const CC = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M9 10a2 2 0 1 0 0 4M16 10a2 2 0 1 0 0 4"/></svg>;
const Materiais = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M13 3v5h5"/><path d="M8 13h7M8 17h5"/></svg>;
const FullscreenIco = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6"/></svg>;

const QuickAction = ({ icon, label, accent = false, to, onClick, children }: { icon: React.ReactNode; label: string; accent?: boolean; to?: string; onClick?: () => void; children?: React.ReactNode }) => {
  const cls = "flex flex-col items-center gap-1.5 active:scale-95 transition flex-1 group";
  const inner = (
    <>
      <span 
        className="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl bg-white flex items-center justify-center transition-all group-hover:shadow-md lg:group-hover:scale-105" 
        style={{ 
          boxShadow: accent ? "0 4px 12px rgba(248,138,43,0.18), inset 0 0 0 1px rgba(248,138,43,0.25)" : "0 2px 8px rgba(17,17,17,0.04), inset 0 0 0 1px rgba(17,17,17,0.05)" 
        }}
      >
        {icon}
      </span>
      <span className="text-[10.5px] lg:text-[12px] font-bold uppercase tracking-wider" style={{ color: ink600 }}>{label}</span>
    </>
  );

  if (children) {
    return (
      <div className="flex-1 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger className={cls}>
            {inner}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="rounded-2xl p-2 min-w-[180px] font-montserrat shadow-xl border-black/5 z-50">
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
};

type SheetKind = null | "speed" | "audio" | "captions" | "fullscreen";
const sheetData: Record<Exclude<SheetKind, null>, { title: string; options: string[]; current: string }> = {
  speed: { title: "Velocidade de reprodução", options: ["0.5x", "0.75x", "1.0x", "1.25x", "1.5x", "2.0x"], current: "1.0x" },
  audio: { title: "Áudio", options: ["Português (original)", "Espanhol", "Inglês"], current: "Português (original)" },
  captions: { title: "Legendas", options: ["Desativadas", "Português", "Espanhol", "Inglês"], current: "Desativadas" },
  fullscreen: { title: "Modo de exibição", options: ["Ajustar à tela", "Tela cheia", "Picture in picture"], current: "Ajustar à tela" },
};

const AulaPlayerScreen = () => {
  const al = useAudienceLink();
 const navigate = useNavigate();
  // No lesson player wired yet — do not fake progress.
  const current = 0;
  const total = 0;
  const pct = 0;

 const [favorited, setFavorited] = useState(false);
 const [sheet, setSheet] = useState<SheetKind>(null);
 const [picks, setPicks] = useState({ speed:"1.0x", audio:"Português (original)", captions:"Desativadas", fullscreen:"Ajustar à tela" });

  const isEnterprise = location.pathname.startsWith('/enterprise');
  const Layout = isEnterprise ? (({ children }: any) => <EnterpriseUserLayout>{children}</EnterpriseUserLayout>) : (({ children, title, backTo }: any) => <MediaDesktopLayout title={title} backTo={backTo}>{children}</MediaDesktopLayout>);

  return (
    <Layout title="Aula" backTo={isEnterprise ? "/enterprise/jornada" : "/jornada"}>
      <main className={`${isEnterprise ? 'w-full max-w-full' : 'h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden'} font-display`}>
 <div
 className={`relative w-full ${isEnterprise ? 'bg-transparent lg:h-auto' : 'h-[100dvh] overflow-hidden md:ring-black/30 flex flex-col'}`}
 style={!isEnterprise ? { background: bg } : {}}
 aria-label="Player de Aula"
 >
 {/* glows - hidden on enterprise desktop */}
 {!isEnterprise && (
   <div className="pointer-events-none absolute -top-24 -right-16 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.14), transparent 70%)", filter:"blur(8px)" }} />
 )}

 {/* Status bar */}
  {/* Header */}
  <div className={`relative flex items-center justify-between px-5 pt-2 pb-2 ${isEnterprise ? 'lg:hidden' : ''}`}>
  <button onClick={() => navigate(-1)} aria-label="Voltar" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] ring-1 ring-black/5 active:scale-95 transition" style={{ boxShadow:"0 2px 8px rgba(17,17,17,0.04)" }}>
  <ChevL/>
  </button>
  <h1 className="text-[14px] text-[#111] truncate px-2" style={{ ...serif, fontWeight: 600 }}>
  Curso 1 — Inteligência Emocional
  </h1>
  <button aria-label="Mais opções" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] ring-1 ring-black/5 active:scale-95 transition" style={{ boxShadow:"0 2px 8px rgba(17,17,17,0.04)" }}>
  <Dots/>
  </button>
  </div>

  {/* Scroll */}
  <div className={`relative flex-1 ${isEnterprise ? 'lg:overflow-visible' : 'overflow-y-auto no-scrollbar'} pb-24 lg:pb-48`}>
  {/* HERO VIDEO */}
  <section className="relative px-5 pt-4">
  <div className={`relative w-full group ${isEnterprise ? 'lg:aspect-video lg:max-w-5xl lg:mx-auto' : 'aspect-[16/10]'} rounded-[24px] lg:rounded-[32px] overflow-hidden bg-black`} style={{ boxShadow: "0 30px 60px -12px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05)" }}>
 <img src={heroImg} alt="" width={1024} height={640} className="absolute inset-0 w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.35) 100%)" }} />

  {/* Play */}
  <button
    disabled
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-md opacity-70 cursor-not-allowed"
    style={{
      boxShadow: "0 12px 32px rgba(0,0,0,0.25), 0 0 0 6px rgba(255,255,255,0.2)",
    }}
    aria-label="Player em produção"
    title="Player em produção — vídeo será liberado em breve"
  >
    <PlayFill s={isEnterprise ? 40 : 28} />
  </button>
  <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-black/60 backdrop-blur text-white">
    Prévia
  </div>

  {/* timeline oculta enquanto não há vídeo real conectado */}
 </div>
 </section>

  {/* AULA INFO */}
  <section className={`px-5 mt-8 ${isEnterprise ? 'lg:max-w-4xl lg:mx-auto' : ''}`}>
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <span className="inline-flex items-center h-6 px-3 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3" style={{ background: "rgba(248,138,43,0.1)", color: brand }}>
          Módulo 2
        </span>
        <h2 className="text-[28px] lg:text-[34px] leading-tight text-[#111] mb-3" style={{ ...serif, fontWeight: 600 }}>
          Pensamentos acelerados
        </h2>
        <div className="flex items-center gap-3 text-[13px] font-medium">
          <div className="flex items-center gap-1.5 text-[#666]">
            <Clock c={ink500} />
            <span>Duração a definir</span>
          </div>
        </div>
      </div>
      
      <button
        type="button"
        onClick={() => setFavorited(f => !f)}
        className="flex flex-col items-center gap-2 group transition-all shrink-0"
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${favorited ? 'bg-[#F88A2B] text-white shadow-lg shadow-[#F88A2B]/20' : 'bg-white border border-black/5 text-[#111] hover:border-[#F88A2B]/30 shadow-sm'}`}>
          <Bookmark c="currentColor" filled={favorited}/>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#999] group-hover:text-[#666]">{favorited ?"Salvo" :"Salvar"}</span>
      </button>
    </div>
    
    <p className="mt-6 text-[15px] lg:text-[16px] leading-relaxed text-[#555] max-w-2xl font-medium">
      Aprenda a desacelerar sua mente, reduzir a ansiedade mental e recuperar clareza para tomar decisões melhores e mais conscientes no seu dia a dia.
    </p>
  </section>

  {/* QUICK ACTIONS */}
  <section className={`px-5 mt-4 ${isEnterprise ? 'lg:max-w-4xl lg:mx-auto' : ''}`}>
    <div
      className={`rounded-[20px] lg:rounded-[28px] p-3 lg:p-4 flex items-stretch gap-1 lg:gap-4 ${isEnterprise ? 'bg-white border border-black/5 shadow-sm' : ''}`}
      style={!isEnterprise ? {
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 8px 22px -16px rgba(17,17,17,0.10), inset 0 0 0 1px rgba(17,17,17,0.05)",
      } : {}}
    >
      <QuickAction 
        icon={<Speed />} 
        label="Velocidade" 
        accent 
        onClick={() => setSheet("speed")}
      >
        <div className="px-2 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#999]">
          Velocidade
        </div>
        {sheetData.speed.options.map(opt => (
          <DropdownMenuItem 
            key={opt} 
            className="rounded-xl cursor-pointer py-2.5 px-3 flex items-center justify-between"
            onClick={() => setPicks(prev => ({ ...prev, speed: opt }))}
          >
            <span className={picks.speed === opt ? "font-bold text-[#F88A2B]" : "font-medium"}>{opt}</span>
            {picks.speed === opt && <Check size={14} className="text-[#F88A2B]" />}
          </DropdownMenuItem>
        ))}
      </QuickAction>

      <QuickAction 
        icon={<Audio />} 
        label="Áudio" 
        onClick={() => setSheet("audio")}
      >
        <div className="px-2 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#999]">
          Áudio
        </div>
        {sheetData.audio.options.map(opt => (
          <DropdownMenuItem 
            key={opt} 
            className="rounded-xl cursor-pointer py-2.5 px-3 flex items-center justify-between"
            onClick={() => setPicks(prev => ({ ...prev, audio: opt }))}
          >
            <span className={picks.audio === opt ? "font-bold text-[#F88A2B]" : "font-medium"}>{opt}</span>
            {picks.audio === opt && <Check size={14} className="text-[#F88A2B]" />}
          </DropdownMenuItem>
        ))}
      </QuickAction>

      <QuickAction 
        icon={<CC />} 
        label="Legendas" 
        onClick={() => setSheet("captions")}
      >
        <div className="px-2 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#999]">
          Legendas
        </div>
        {sheetData.captions.options.map(opt => (
          <DropdownMenuItem 
            key={opt} 
            className="rounded-xl cursor-pointer py-2.5 px-3 flex items-center justify-between"
            onClick={() => setPicks(prev => ({ ...prev, captions: opt }))}
          >
            <span className={picks.captions === opt ? "font-bold text-[#F88A2B]" : "font-medium"}>{opt}</span>
            {picks.captions === opt && <Check size={14} className="text-[#F88A2B]" />}
          </DropdownMenuItem>
        ))}
      </QuickAction>

      <QuickAction icon={<Materiais />} label="Materiais" to={al("/materiais")} />
      
      <QuickAction 
        icon={<FullscreenIco />} 
        label="Tela cheia" 
        onClick={() => setSheet("fullscreen")}
      >
        <div className="px-2 py-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#999]">
          Modo de Exibição
        </div>
        {sheetData.fullscreen.options.map(opt => (
          <DropdownMenuItem 
            key={opt} 
            className="rounded-xl cursor-pointer py-2.5 px-3 flex items-center justify-between"
            onClick={() => setPicks(prev => ({ ...prev, fullscreen: opt }))}
          >
            <span className={picks.fullscreen === opt ? "font-bold text-[#F88A2B]" : "font-medium"}>{opt}</span>
            {picks.fullscreen === opt && <Check size={14} className="text-[#F88A2B]" />}
          </DropdownMenuItem>
        ))}
      </QuickAction>
    </div>
  </section>

  {/* REFLEXÃO CURY */}
  <section className={`px-5 mt-4 ${isEnterprise ? 'lg:max-w-4xl lg:mx-auto' : ''}`}>
 <div
 className="relative rounded-[22px] p-4 pr-[110px] overflow-hidden"
 style={{
 background:"linear-gradient(135deg, #FFF1E2 0%, #FBE5D0 100%)",
 boxShadow:"0 6px 22px -14px rgba(248,138,43,0.25), inset 0 0 0 1px rgba(248,138,43,0.12)",
 }}
 >
 <span className="text-[28px] leading-none" style={{ ...serif, color: brand, fontWeight: 700 }}>“</span>
 <p className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: brand }}>Reflexão de Augusto Cury</p>
 <p className="mt-2 text-[14px] leading-[20px] text-[#111]" style={{ ...serif, fontWeight: 500 }}>
 Pensamentos acelerados roubam nossa capacidade de contemplar a vida.
 </p>
 <div className="absolute right-2 bottom-0 w-[100px] h-[120px] overflow-hidden">
 <img src={curyImg} alt="Augusto Cury" loading="lazy" width={512} height={512} className="absolute inset-0 w-full h-full object-cover object-top" style={{ maskImage:"radial-gradient(ellipse at 60% 40%, #000 55%, transparent 80%)", WebkitMaskImage:"radial-gradient(ellipse at 60% 40%, #000 55%, transparent 80%)" }} />
 </div>
 <svg className="absolute right-1 top-2 opacity-50" width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#D8A878" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
 <path d="M50 50 Q30 30 10 14"/>
 <path d="M30 30 q3 -8 -5 -12"/>
 <path d="M40 38 q3 -8 -5 -12"/>
 </svg>
 </div>
 </section>

   {/* Progresso e "Próxima aula" ocultos até haver player real conectado (evita métricas fake). */}
 </div>

  {/* Quick action sheet - MOBILE ONLY */}
  {sheet && (
  <div className="lg:hidden absolute inset-0 z-[60] flex items-end" onClick={() => setSheet(null)}>
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"/>
  <div
  className="relative w-full bg-white rounded-t-[32px] p-6 pb-10 animate-slide-up shadow-[0_-12px_40px_rgba(0,0,0,0.3)]"
  onClick={(e) => e.stopPropagation()}
  >
  <div className="w-12 h-1.5 rounded-full bg-[#E0DAD3] mx-auto mb-6"/>
  <h3 className="text-[18px] text-[#111] mb-5" style={{ ...serif, fontWeight: 700 }}>{sheetData[sheet].title}</h3>
  <div className="grid grid-cols-2 gap-3">
  {sheetData[sheet].options.map(opt => (
  <button
  key={opt}
  onClick={() => { setPicks(prev => ({ ...prev, [sheet]: opt })); setSheet(null); }}
  className={`h-[54px] rounded-2xl flex items-center justify-between px-4 transition-all ${picks[sheet as keyof typeof picks] === opt ? 'bg-[#F88A2B] text-white shadow-lg shadow-[#F88A2B]/20' : 'bg-[#F7F4F2] text-[#111] active:bg-[#EAE5E0]'}`}
  >
  <span className="font-bold text-[15px]">{opt}</span>
  {picks[sheet as keyof typeof picks] === opt && <Check size={18} />}
  </button>
  ))}
  </div>
  <button
  onClick={() => setSheet(null)}
  className="w-full mt-6 py-4 rounded-2xl bg-[#111] text-white font-bold text-[15px] active:scale-[0.98] transition-all"
  >
  Fechar
  </button>
  </div>
  </div>
  )}
  <style>{`
    @keyframes slide-up {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up {
      animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `}</style>

   </div>
   </main>
   </Layout>
  );
};

export default AulaPlayerScreen;
