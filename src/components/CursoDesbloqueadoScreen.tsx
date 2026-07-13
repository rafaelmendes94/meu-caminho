import { Link } from"react-router-dom";
import thumb from"@/assets/trilha/curso2-thumb.jpg";
import { AppUserLayout } from "./layouts/AppUserLayout";

const ink900 ="#111111";
const ink600 ="#666666";
const ink500 ="#999999";
const brand ="#F88A2B";
const lilac ="#9B8AC9";
const bg ="#F7F4F2";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;

const Signal = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const Wifi = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const Battery = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const Close = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>;
const ChevR = ({ s = 18 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const PlayMini = ({ c = lilac }: { c?: string }) => <svg width="11" height="11" viewBox="0 0 24 24" fill={c}><path d="M8 5v14l11-7z"/></svg>;
const BookIco = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={lilac} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h7M8 11h7"/></svg>;
const ClockIco = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={lilac} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const TrendIco = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={lilac} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>;
const Quote = () => <svg width="18" height="18" viewBox="0 0 24 24" fill={brand}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const LockMini = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={ink500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
const Sparkle = ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M12 4l1.5 4L18 9.5 13.5 11 12 15l-1.5-4L6 9.5 10.5 8z"/></svg>;
const Unlock = ({ s = 56 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="11" width="12" height="9" rx="2" fill={brand} stroke={brand}/><path d="M9 11V8a3 3 0 0 1 5.5-1.7" stroke={brand} fill="none"/><path d="M10 15.5l1.5 1.5 3-3.5" stroke="white" strokeWidth="2"/></svg>;

const dots = [
 { state:"done" }, { state:"current" }, { state:"next" }, { state:"next" }, { state:"next" },
];

const CursoDesbloqueadoScreen = () => {
 return (
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
 style={{ background: bg, paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 {/* Atmospheric warm glow */}
 <div className="pointer-events-none absolute inset-0" style={{ background:"radial-gradient(60% 40% at 50% 22%, rgba(248,138,43,0.20) 0%, transparent 65%), radial-gradient(80% 35% at 50% 100%, rgba(248,138,43,0.10) 0%, transparent 70%)" }}/>
 <div className="pointer-events-none absolute -top-24 -left-24 w-[300px] h-[300px] rounded-full" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.16), transparent 70%)", filter:"blur(28px)" }}/>
 <div className="pointer-events-none absolute -top-10 -right-24 w-[280px] h-[280px] rounded-full" style={{ background:"radial-gradient(circle, rgba(155,138,201,0.10), transparent 70%)", filter:"blur(28px)" }}/>

 {/* Twinkles */}
 {[
 { top:"20%", left:"14%", s: 4, d: 0 },
 { top:"26%", left:"82%", s: 5, d: 0.8 },
 { top:"38%", left:"10%", s: 3, d: 1.6 },
 { top:"44%", left:"88%", s: 4, d: 0.4 },
 { top:"16%", left:"60%", s: 3, d: 1.2 },
 ].map((p, i) => (
 <span key={i} className="pointer-events-none absolute rounded-full bg-white" style={{ top: p.top, left: p.left, width: p.s, height: p.s, boxShadow: `0 0 8px ${brand}`, animation: `twinkle 3.2s ease-in-out ${p.d}s infinite` }}/>
 ))}

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-1 shrink-0">
 <Link to="/progresso" className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color:"#444" }} aria-label="Fechar">
 <Close/>
 </Link>
 {/* Journey progress dots */}
 <div className="flex flex-col items-center gap-1">
 <div className="flex items-center gap-1.5">
 {dots.map((d, i) => {
 const done = d.state ==="done", cur = d.state ==="current";
 return (
   <AppUserLayout>
 <span key={i} className="flex items-center">
 <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{
 background: done ? brand : cur ?"white" :"#E5DED5",
 boxShadow: cur ? `inset 0 0 0 2px ${brand}, 0 0 12px rgba(248,138,43,0.45)` : done ? `0 0 8px rgba(248,138,43,0.4)` :"none",
 }}>
 {done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>}
 {cur && <span className="w-[7px] h-[7px] rounded-full" style={{ background: brand }}/>}
 </span>
 {i < dots.length - 1 && <span className="block w-3.5 h-px" style={{ background: i === 0 ? brand :"#E5DED5" }}/>}
 </span>
   </AppUserLayout>
 );
 })}
 </div>
 <span className="text-[10.5px]" style={{ color: ink600 }}>Sua jornada</span>
 </div>
 <span className="w-10 h-10"/>
 </div>

 {/* Scroll content */}
 <div className="relative z-10 flex-1 px-5 pt-3">
 {/* Hero medallion */}
 <div className="relative mx-auto w-[220px] h-[220px] flex items-center justify-center">
 <span className="absolute inset-0 rounded-full" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.32), transparent 65%)", animation:"pulseGlow 4s ease-in-out infinite" }}/>
 <span className="absolute w-[200px] h-[200px] rounded-full" style={{ border:"1px solid rgba(248,138,43,0.4)", boxShadow:"0 0 30px rgba(248,138,43,0.35), inset 0 0 30px rgba(248,138,43,0.18)" }}/>
 <span className="absolute w-[170px] h-[170px] rounded-full" style={{ border:"1px solid rgba(248,138,43,0.25)" }}/>
 {/* Laurel branches */}
 <svg className="absolute" width="220" height="220" viewBox="0 0 220 220" fill="none" stroke={brand} strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round">
 <path d="M55 130 q-8 -18 0 -34 q8 6 5 18 q12 -2 14 12 q-10 2 -19 4z"/>
 <path d="M165 130 q8 -18 0 -34 q-8 6 -5 18 q-12 -2 -14 12 q10 2 19 4z"/>
 </svg>
 {/* Lock badge */}
 <div className="relative w-[110px] h-[110px] rounded-full flex items-center justify-center" style={{ background:"linear-gradient(180deg,#FFB870,#F88A2B)", boxShadow:"0 18px 46px -14px rgba(248,138,43,0.7), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -6px 16px rgba(177,82,12,0.35)", animation:"breath 5.5s ease-in-out infinite" }}>
 <Unlock s={56}/>
 </div>
 </div>

 {/* Headline */}
 <div className="text-center mt-3 animate-fade-in">
 <h1 style={serif} className="text-[30px] leading-[1.05] text-[#111]">Nova etapa liberada.</h1>
 <p className="mt-2.5 text-[12.5px] leading-[1.55] mx-auto max-w-[300px]" style={{ color: ink600 }}>
 Você concluiu sua primeira jornada e desbloqueou um novo nível de evolução emocional.
 </p>
 </div>

 {/* Course card */}
 <div className="relative mt-4 overflow-hidden rounded-[24px] bg-white/90 backdrop-blur-sm flex" style={{ boxShadow:"0 14px 38px -16px rgba(17,17,17,0.18), inset 0 0 0 1px rgba(255,255,255,0.9)", border:"1px solid rgba(17,17,17,0.04)" }}>
 <div className="relative w-[40%] shrink-0 overflow-hidden">
 <img src={thumb} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover"/>
 <div className="absolute inset-0" style={{ background:"linear-gradient(to right, transparent 60%, rgba(255,255,255,0.6))" }}/>
 </div>
 <div className="flex-1 min-w-0 p-3">
 <span className="inline-block px-2.5 py-1 rounded-full text-[9.5px] font-bold tracking-[0.18em]" style={{ background:"#EFEAF7", color: lilac }}>
 PRÓXIMA ETAPA
 </span>
 <h3 style={serif} className="mt-1.5 text-[19px] leading-[1.05] text-[#111]">Gestão da Emoção</h3>
 <p className="mt-1.5 text-[11px] leading-[1.45]" style={{ color: ink600 }}>
 Aprenda a lidar com ansiedade, pressão e desgaste emocional com mais equilíbrio.
 </p>
 <div className="mt-2.5 grid grid-cols-3 gap-1.5">
 {[
 { Icon: BookIco, val:"8 aulas", sub:"Conteúdo" },
 { Icon: ClockIco, val:"~2h40m", sub:"Duração" },
 { Icon: TrendIco, val:"Avançado", sub:"Nível" },
 ].map((s, i) => (
 <div key={i} className="flex flex-col items-center text-center">
 <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:"#EFEAF7" }}><s.Icon/></span>
 <p className="text-[10px] font-bold text-[#111] mt-1 leading-none">{s.val}</p>
 <p className="text-[8.5px] mt-0.5" style={{ color: ink500 }}>{s.sub}</p>
 </div>
 ))}
 </div>
 <button className="mt-2.5 w-full py-2 rounded-full bg-white text-[11px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99] transition" style={{ border: `1px solid ${lilac}33`, color: lilac, boxShadow:"0 2px 8px -4px rgba(155,138,201,0.3)" }}>
 Ver prévia do curso <PlayMini c={lilac}/>
 </button>
 </div>
 </div>

  {/* Insight do mentor — aguarda conteúdo dinâmico (FEATURE-B20) */}
 </div>

 {/* CTA */}
 <div className="relative z-10 px-5 pt-3 pb-2 shrink-0" style={{ background:"linear-gradient(to top, rgba(247,244,242,1) 60%, rgba(247,244,242,0))" }}>
 <Link
 to="/curso"
 className="relative w-full h-[56px] rounded-full text-white font-semibold text-[14.5px] flex items-center justify-center gap-2 transition active:scale-[0.99] overflow-hidden"
 style={{ background:"linear-gradient(180deg,#FF9D4D 0%,#F88A2B 100%)", boxShadow:"0 16px 36px -10px rgba(248,138,43,0.6), inset 0 1px 0 rgba(255,255,255,0.35)" }}
 >
 <Sparkle s={14}/>
 <span>Começar próximo curso</span>
 <ChevR s={18}/>
 </Link>
 <p className="mt-2 text-center text-[10.5px] flex items-center justify-center gap-1.5" style={{ color: ink500 }}>
 <LockMini/> Sua jornada é única e contínua. Siga evoluindo.
 </p>
 </div>
 </div>

 <style>{`
 @keyframes pulseGlow { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.85; } }
 @keyframes twinkle { 0%,100% { opacity: 0.2; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1.2); } }
 @keyframes breath { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
 `}</style>
 </main>
 );
};

export default CursoDesbloqueadoScreen;
