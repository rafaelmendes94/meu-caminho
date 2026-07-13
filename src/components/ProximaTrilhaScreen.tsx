import { Link } from"react-router-dom";
import heroImg from"@/assets/trilha/proxima-hero.jpg";
import thumb from"@/assets/trilha/relacoes-thumb.jpg";
import { AppUserLayout } from "./layouts/AppUserLayout";

const ink900 ="#111111";
const ink700 ="#444444";
const ink600 ="#666666";
const ink500 ="#999999";
const brand ="#F88A2B";
const sage ="#8FB17D";
const sageBg ="#E3ECDD";
const lilac ="#9B8AC9";
const bg ="#F7F4F2";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;

const Signal = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const Wifi = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const Battery = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const ChevL = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevR = ({ s = 18 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const Share = ({ c ="currentColor" }: { c?: string }) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>;
const Quote = ({ c = brand, s = 18 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const Check = ({ c ="#fff", s = 11 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>;
const Compass = ({ c = ink700 }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5L13 13l-4.5 2.5L11 11z"/></svg>;
const HeartO = ({ c = brand, s = 14 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;

// Card mini stats
const Mods = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ink700} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 9h16M9 5v14"/></svg>;
const Play = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ink700} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z" fill={ink700}/></svg>;
const Clock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ink700} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const Sparkle = ({ c = ink700, s = 16 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l1.4 4.2L17.5 9.5 13.4 11l-1.4 4-1.4-4L6.5 9.5l4.1-1.3z"/><path d="M19 4l.6 1.6L21 6l-1.4.4L19 8l-.6-1.6L17 6l1.4-.4z"/></svg>;

// Insights icons
const Leaf = ({ c = sage }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 8-8 14-14"/></svg>;
const Brain = ({ c = lilac }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a4 4 0 0 0-4 4v2a3 3 0 0 0-1 6 3 3 0 0 0 5 2 3 3 0 0 0 5-1V8a4 4 0 0 0-4-4z"/><path d="M9 9v8"/></svg>;
const HeartFill = ({ c = brand }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const People = ({ c ="#fff" }: { c?: string }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.5"/><circle cx="17" cy="10" r="2"/><path d="M3 19c1-3 4-4.5 6-4.5s5 1.5 6 4.5"/><path d="M15 18.5c.7-2 2.5-3 4-3"/><path d="M11 6c.7-1 1.7-1.5 2.5-1.5" opacity="0.6"/></svg>;

const insights: Array<{ icon: JSX.Element; text: string; bg: string }> = [];

const ProximaTrilhaScreen = () => {
 return (
   <AppUserLayout>
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
 style={{ background: bg, paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 {/* warm atmospheric glow */}
 <div className="pointer-events-none absolute inset-0 z-0" style={{ background:"radial-gradient(70% 30% at 50% 6%, rgba(248,138,43,0.16) 0%, transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(248,138,43,0.06) 0%, transparent 70%)" }}/>
 <div className="pointer-events-none absolute -top-20 -left-20 w-[280px] h-[280px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.16), transparent 70%)", filter:"blur(28px)" }}/>
 <div className="pointer-events-none absolute -top-10 -right-24 w-[260px] h-[260px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(155,138,201,0.10), transparent 70%)", filter:"blur(28px)" }}/>

 {[
 { top:"16%", left:"10%", s: 4, d: 0 },
 { top:"22%", left:"84%", s: 3, d: 0.8 },
 { top:"34%", left:"8%", s: 4, d: 1.6 },
 { top:"40%", left:"92%", s: 3, d: 0.4 },
 { top:"12%", left:"60%", s: 3, d: 1.2 },
 ].map((p, i) => (
 <span key={i} className="pointer-events-none absolute rounded-full bg-white z-0" style={{ top: p.top, left: p.left, width: p.s, height: p.s, boxShadow: `0 0 8px ${brand}`, animation: `twinkle 3.2s ease-in-out ${p.d}s infinite` }}/>
 ))}

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-1 shrink-0">
 <Link to="/evolucao-pessoal" className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <ChevL/>
 </Link>
 <p className="text-[14px]" style={{ color: ink700 }}>Próxima Jornada</p>
 <button className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <Share/>
 </button>
 </div>

 {/* Scroll */}
 <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pb-[180px]">
 {/* HERO */}
 <section className="px-5 pt-2 text-center animate-fade-in">
 <h1 style={serif} className="text-[30px] leading-[1.05] text-[#111]">
 Seu próximo caminho<br/>começa agora.
 </h1>
 <p className="mt-3 text-[12px] leading-[1.5]" style={{ color: ink600 }}>
 Com base na sua evolução emocional,<br/>selecionamos a próxima jornada ideal para você.
 </p>
 </section>

 {/* HERO IMAGE + CARD */}
 <section className="relative mt-3">
 <div className="relative h-[360px]">
 <img src={heroImg} alt="Próximo caminho" className="absolute inset-x-0 top-0 w-full h-[230px] object-cover" loading="lazy" width={1024} height={768}/>
 <div className="absolute inset-x-0 top-0 h-[230px]" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0.05) 0%, rgba(247,244,242,0.55) 65%, #F7F4F2 100%)" }}/>
 <div className="absolute inset-x-0 top-[30px] h-[200px]" style={{ background:"radial-gradient(50% 50% at 50% 50%, rgba(248,138,43,0.18), transparent 70%)" }}/>

 {/* Course Card */}
 <div className="absolute inset-x-4 top-[100px]">
 <div className="relative rounded-[26px] overflow-hidden" style={{ background:"linear-gradient(180deg, rgba(255,255,255,0.95), rgba(252,247,242,0.95))", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 22px 50px -22px rgba(248,138,43,0.35), 0 6px 20px -10px rgba(17,17,17,0.10)", backdropFilter:"blur(8px)" }}>
 <div className="flex">
 <div className="relative w-[42%] aspect-[3/4] shrink-0">
 <img src={thumb} alt="Relações Saudáveis" className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={1024} height={768}/>
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0.0), rgba(247,244,242,0.20))" }}/>
 </div>
 <div className="flex-1 px-3 pt-3 pb-2 relative">
 <span className="px-2.5 py-[3px] rounded-full text-[8.5px] font-semibold tracking-[0.2em]" style={{ background:"rgba(155,138,201,0.18)", color:"#6E5FA0" }}>PRÓXIMA TRILHA</span>
 <h2 style={serif} className="mt-2 text-[19px] leading-[1.05] text-[#111]">
 Relações<br/>Saudáveis
 </h2>
 <p className="mt-1.5 text-[10.5px] leading-[1.4]" style={{ color: ink600 }}>
 Aprenda a construir vínculos mais leves, conscientes e emocionalmente equilibrados.
 </p>
 <div className="absolute -left-5 top-3 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: lilac, boxShadow: `0 0 0 4px rgba(155,138,201,0.18), 0 8px 18px -6px rgba(155,138,201,0.55)`, animation:"pulse-soft 3.2s ease-in-out infinite" }}>
 <People/>
 </div>
 </div>
 </div>
 {/* Stats */}
 <div className="grid grid-cols-4 gap-1 px-3 pb-3 pt-2 border-t" style={{ borderColor:"rgba(17,17,17,0.06)" }}>
 {[
 { ic: <Mods/>, n:"3", l:"Módulos" },
 { ic: <Play/>, n:"24", l:"Aulas" },
 { ic: <Clock/>, n:"~6h", l:"Conteúdo" },
 { ic: <Sparkle c={brand}/>, n:"Nova etapa", l:"emocional", small: true },
 ].map((s, i) => (
 <div key={i} className="flex flex-col items-center text-center gap-1">
 <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background:"#F4EEE6" }}>{s.ic}</span>
 <p className={`${s.small ?"text-[8.5px]" :"text-[10px]"} font-semibold leading-tight text-[#111]`}>{s.n}</p>
 <p className="text-[8.5px] leading-tight" style={{ color: ink600 }}>{s.l}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* WHY THIS TRACK */}
 <section className="px-5 mt-3">
 <div className="rounded-[24px] bg-white/85 backdrop-blur-sm p-4" style={{ border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 18px -10px rgba(17,17,17,0.08)" }}>
 <p className="text-center text-[10px] tracking-[0.22em] font-semibold" style={{ color:"#7A6B5C" }}>POR QUE ESSA TRILHA?</p>
 <div className="mt-3 grid grid-cols-3 gap-2">
 {insights.map((it, i) => (
 <div key={i} className="flex flex-col items-center text-center">
 <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: it.bg }}>{it.icon}</span>
 <p className="mt-2 text-[10px] leading-[1.3]" style={{ color: ink700 }}>{it.text}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

  {/* Insight do mentor — aguarda conteúdo dinâmico (FEATURE-B20) */}

 {/* JOURNEY CONTINUES */}
 <section className="px-5 mt-3">
 <div className="rounded-[24px] bg-white/85 backdrop-blur-sm p-4" style={{ border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 18px -10px rgba(17,17,17,0.08)" }}>
 <p className="text-center text-[10px] tracking-[0.22em] font-semibold" style={{ color:"#7A6B5C" }}>SUA JORNADA CONTINUA</p>
 <div className="mt-3 relative">
 <span className="absolute left-[15%] right-[15%] top-[20px] h-px border-t border-dashed" style={{ borderColor:"rgba(248,138,43,0.45)" }}/>
 <div className="grid grid-cols-3 gap-2 relative">
 {[
 { label:"Inteligência\nEmocional", state:"done" as const },
 { label:"Gestão da\nEmoção", state:"done" as const },
 { label:"Relações\nSaudáveis", state:"next" as const },
 ].map((s, i) => (
 <div key={i} className="flex flex-col items-center text-center">
 <span className="relative w-10 h-10 rounded-full flex items-center justify-center"
 style={{
 background: s.state ==="next" ? brand : sageBg,
 border: s.state ==="next" ? `1.5px solid ${brand}` : `1px solid ${sage}`,
 boxShadow: s.state ==="next" ? `0 0 0 4px rgba(248,138,43,0.16), 0 0 18px rgba(248,138,43,0.5)` :"0 2px 8px -4px rgba(143,177,125,0.5)",
 animation: s.state ==="next" ?"pulse-soft 3.2s ease-in-out infinite" :"none",
 }}>
 {s.state ==="done"
 ? <Check c={sage} s={18}/>
 : <ChevR s={18}/>}
 </span>
 <p className="mt-1.5 text-[10px] leading-[1.2] whitespace-pre-line font-semibold" style={{ color: s.state ==="next" ? brand : ink700 }}>
 {s.label}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>
 </div>

 {/* Sticky CTAs */}
 <div className="absolute bottom-0 left-0 right-0 z-30 px-5 pt-5 pb-4" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0) 0%, rgba(247,244,242,0.95) 30%, #F7F4F2 100%)" }}>
 <Link
 to="/curso-desbloqueado"
 className="relative w-full h-[54px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] active:scale-[0.99] transition"
 style={{ background:"linear-gradient(180deg,#FF9D4D 0%,#F88A2B 100%)", boxShadow:"0 14px 32px -10px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35)" }}
 >
 Começar nova trilha
 <span className="absolute right-5 opacity-90"><ChevR s={18}/></span>
 </Link>
 <Link
 to="/jornada"
 className="mt-2.5 w-full h-[44px] rounded-full flex items-center justify-center gap-2 text-[12.5px] font-semibold active:scale-[0.99] transition"
 style={{ background:"rgba(255,255,255,0.7)", border:"1px solid rgba(17,17,17,0.08)", color: ink700, backdropFilter:"blur(6px)" }}
 >
 <Compass/> Explorar outras jornadas
 </Link>
 <p className="mt-2 text-center text-[10.5px] leading-[1.45] flex items-center justify-center gap-1.5" style={{ color: brand }}>
 <HeartO c={brand} s={12}/> Sua evolução emocional não termina aqui.
 </p>
 </div>

 <style>{`
 @keyframes twinkle { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
 @keyframes pulse-soft { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
 `}</style>
 </div>
 </main>
   </AppUserLayout>
 );
};

export default ProximaTrilhaScreen;
