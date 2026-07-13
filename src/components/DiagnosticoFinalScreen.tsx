import { Link } from"react-router-dom";
import heroImg from"@/assets/trilha/diagnostico-final-hero.jpg";
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
const Share = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>;
const ArrowR = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ink700} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>;
const Quote = () => <svg width="22" height="22" viewBox="0 0 24 24" fill={brand}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const Flag = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ink600} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>;
const BookI = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ink600} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h7M8 11h7"/></svg>;
const LotusI = ({ c = sage }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c2 3 2 6 0 9-2-3-2-6 0-9z"/><path d="M4 13c3-1 6 0 8 3-3 1-6 0-8-3z"/><path d="M20 13c-3-1-6 0-8 3 3 1 6 0 8-3z"/></svg>;
const HeartI = ({ c = ink600 }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const SparkleI = ({ c ="#fff" }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M12 4l1.4 4.2L17.5 9.5 13.4 11l-1.4 4-1.4-4L6.5 9.5l4.1-1.3z"/></svg>;
const Check = ({ c ="#fff", s = 11 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>;
const Cloud = ({ c = brand }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 7 17z"/></svg>;
const Mind = ({ c = brand }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a4 4 0 0 0-4 4v2a3 3 0 0 0-1 6 3 3 0 0 0 5 2 3 3 0 0 0 5-1V8a4 4 0 0 0-4-4z"/><path d="M9 9v8"/></svg>;
const CloudM = ({ c = brand }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 17h11a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 6 17z"/></svg>;
const Battery2 = ({ c = brand }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="5" width="12" height="16" rx="2.5"/><path d="M10 3h4"/><path d="M9 14h6"/></svg>;
const Leaf = ({ c = sage }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 8-8 14-14"/></svg>;
const Person = ({ c = sage }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="6" r="2.2"/><path d="M8 21c0-3 4-6 4-6s4 3 4 6"/><path d="M9 13c1-1 2-2 3-2s2 1 3 2"/></svg>;
const Sun = ({ c = sage }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></svg>;
const HeartG = ({ c = sage }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const StarFill = ({ c = brand, s = 22 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.3 9.4l6-.9z"/></svg>;
const FlagJ = ({ c = ink600 }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>;

// Antes/Agora rows
type Row = { label: string; v: number; icon: React.ReactNode };
const before: Row[] = [];
const now: Row[] = [];

type J = { label: string; sub?: string; icon: React.ReactNode; state:"done"|"final" };
const journey: J[] = [
 { label:"Diagnóstico inicial", icon: <FlagJ/>, state:"done" },
 { label:"Curso 1\nAutoconhecimento", icon: <BookI/>, state:"done" },
 { label:"Curso 2\nGestão da Emoção", icon: <LotusI/>, state:"done" },
 { label:"Curso 3\nInteligência Emocional", icon: <HeartI/>, state:"done" },
 { label:"Evolução\nemocional", icon: <StarFill s={18}/>, state:"final" },
];

const insights: Array<{ title: string; color: string; icon: React.ReactNode }> = [];

const Bar = ({ v, c, soft }: { v: number; c: string; soft?: string }) => (
 <div className="mt-1.5 h-[5px] w-full rounded-full overflow-hidden" style={{ background: soft ??"#F0E9E1" }}>
 <span className="block h-full rounded-full" style={{ width: `${v}%`, background: c, transition:"width 1.2s cubic-bezier(.2,.8,.2,1)" }}/>
 </div>
);

const DiagnosticoFinalScreen = () => {
 return (
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
 style={{ background: bg, paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 {/* atmospheric warm glow */}
 <div className="pointer-events-none absolute inset-0 z-0" style={{ background:"radial-gradient(70% 30% at 50% 6%, rgba(248,138,43,0.16) 0%, transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(248,138,43,0.08) 0%, transparent 70%)" }}/>
 <div className="pointer-events-none absolute -top-24 -left-20 w-[280px] h-[280px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.16), transparent 70%)", filter:"blur(28px)" }}/>
 <div className="pointer-events-none absolute -top-10 -right-24 w-[260px] h-[260px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(155,138,201,0.10), transparent 70%)", filter:"blur(28px)" }}/>

 {/* twinkles */}
 {[
 { top:"18%", left:"12%", s: 4, d: 0 },
 { top:"24%", left:"84%", s: 3, d: 0.8 },
 { top:"36%", left:"8%", s: 4, d: 1.6 },
 { top:"42%", left:"92%", s: 3, d: 0.4 },
 { top:"12%", left:"60%", s: 3, d: 1.2 },
 ].map((p, i) => (
 <span key={i} className="pointer-events-none absolute rounded-full bg-white z-0" style={{ top: p.top, left: p.left, width: p.s, height: p.s, boxShadow: `0 0 8px ${brand}`, animation: `twinkle 3.2s ease-in-out ${p.d}s infinite` }}/>
 ))}

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-1 shrink-0">
 <Link to="/progresso" className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <ChevL/>
 </Link>
 <div className="text-center leading-tight">
 <p style={serif} className="text-[16px] text-[#111]">Diagnóstico Final</p>
 <p className="text-[10.5px]" style={{ color: ink500 }}>Comparativo</p>
 </div>
 <button className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <Share/>
 </button>
 </div>

 {/* Scroll */}
 <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pb-[180px]">
 {/* HERO */}
 <section className="px-6 pt-3 text-center animate-fade-in">
 <h1 style={serif} className="text-[34px] leading-[1.05] text-[#111]">
 Olhe o quanto<br/>você evoluiu.
 </h1>
 <p className="mt-3 text-[12.5px]" style={{ color: ink600 }}>
 Seu ponto de partida<br/>já ficou para trás.
 </p>
 </section>

 {/* HERO IMAGE */}
 <section className="px-5 mt-4">
 <div className="relative rounded-[28px] overflow-hidden" style={{ boxShadow:"0 20px 50px -20px rgba(248,138,43,0.35)" }}>
 <img src={heroImg} alt="Caminho iluminado" className="w-full h-[180px] object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0.15) 0%, rgba(247,244,242,0.0) 40%, rgba(247,244,242,0.85) 100%)" }}/>
 <div className="absolute inset-0" style={{ background:"radial-gradient(50% 50% at 50% 50%, rgba(248,138,43,0.18), transparent 70%)" }}/>
 </div>
 </section>

 {/* ANTES x AGORA */}
 <section className="px-5 mt-5">
 <div className="relative grid grid-cols-2 gap-3">
 {/* Antes */}
 <div className="rounded-[22px] p-3 pt-3.5" style={{ background:"linear-gradient(180deg,#FFF6EE,#FBEEE3)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 18px -10px rgba(17,17,17,0.08)" }}>
 <div className="flex justify-center">
 <span className="px-3 py-[3px] rounded-full text-[9.5px] font-semibold tracking-[0.18em]" style={{ background:"#FFE3CC", color: brand }}>ANTES</span>
 </div>
 <p className="text-center text-[10px] mt-1" style={{ color: ink600 }}>Como você estava</p>
 <ul className="mt-2.5 space-y-2.5">
 {before.map((r, i) => (
 <li key={i} className="flex items-start gap-2">
 <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background:"#FFF1E1", border:"1px solid rgba(248,138,43,0.18)" }}>{r.icon}</span>
 <div className="flex-1 min-w-0">
 <p className="text-[10.5px] font-semibold leading-[1.2] text-[#111]">{r.label}</p>
 <Bar v={r.v} c={brand} soft="#F4E4D2"/>
 </div>
 </li>
 ))}
 </ul>
 </div>

 {/* Agora */}
 <div className="rounded-[22px] p-3 pt-3.5" style={{ background:"linear-gradient(180deg,#F2F8EC,#E8F1DF)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 6px 22px -10px rgba(143,177,125,0.35)" }}>
 <div className="flex justify-center">
 <span className="px-3 py-[3px] rounded-full text-[9.5px] font-semibold tracking-[0.18em]" style={{ background: sageBg, color:"#5A7A48" }}>AGORA</span>
 </div>
 <p className="text-center text-[10px] mt-1" style={{ color: ink600 }}>Como você está hoje</p>
 <ul className="mt-2.5 space-y-2.5">
 {now.map((r, i) => (
 <li key={i} className="flex items-start gap-2">
 <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background:"#EAF3DF", border:"1px solid rgba(143,177,125,0.25)" }}>{r.icon}</span>
 <div className="flex-1 min-w-0">
 <p className="text-[10.5px] font-semibold leading-[1.2] text-[#111]">{r.label}</p>
 <Bar v={r.v} c={sage} soft="#DCE7CE"/>
 </div>
 </li>
 ))}
 </ul>
 </div>

 {/* Arrow connector */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center" style={{ boxShadow:"0 6px 18px -6px rgba(248,138,43,0.45), inset 0 0 0 1px rgba(248,138,43,0.18)" }}>
 <ArrowR/>
 </div>
 </div>
 </section>

 {/* JORNADA TIMELINE */}
 <section className="px-5 mt-5">
 <div className="rounded-[24px] bg-white/85 backdrop-blur-sm p-4" style={{ border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 18px -10px rgba(17,17,17,0.08)" }}>
 <p className="text-center text-[10px] tracking-[0.22em] font-semibold" style={{ color:"#7A6B5C" }}>SUA JORNADA</p>
 <div className="mt-3 relative">
 <span className="absolute left-[10%] right-[10%] top-[18px] h-px" style={{ background:"linear-gradient(to right, rgba(143,177,125,0.5), rgba(248,138,43,0.55))" }}/>
 <div className="grid grid-cols-5 gap-1 relative">
 {journey.map((j, i) => {
 const isFinal = j.state ==="final";
 return (
   <AppUserLayout>
 <div key={i} className="flex flex-col items-center text-center">
 <span className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center"
 style={{
 border: isFinal ? `1.5px solid ${brand}` :"1px solid rgba(17,17,17,0.08)",
 boxShadow: isFinal ? `0 0 0 4px rgba(248,138,43,0.16), 0 0 18px rgba(248,138,43,0.45)` :"0 2px 8px -4px rgba(17,17,17,0.10)",
 background: isFinal ?"#FFF1E1" :"#fff",
 }}>
 {isFinal ? <StarFill c={brand} s={18}/> : j.icon}
 {!isFinal && (
 <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: sage }}>
 <Check c="#fff" s={8}/>
 </span>
 )}
 </span>
 <p className="mt-1.5 text-[8.5px] leading-[1.15] whitespace-pre-line font-semibold" style={{ color: isFinal ? brand : ink700 }}>
 {j.label}
 </p>
 </div>
   </AppUserLayout>
 );
 })}
 </div>
 </div>
 </div>
 </section>

 {/* INSIGHTS */}
 <section className="px-5 mt-3">
 <div className="rounded-[24px] bg-white/85 backdrop-blur-sm p-4" style={{ border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 18px -10px rgba(17,17,17,0.08)" }}>
 <p className="text-center text-[10px] tracking-[0.22em] font-semibold" style={{ color:"#7A6B5C" }}>SEUS PRINCIPAIS INSIGHTS</p>
 <div className="mt-3 grid grid-cols-3 gap-2">
 {insights.map((it, i) => (
 <div key={i} className="flex flex-col items-center text-center">
 <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: i===0 ?"#EFEAF8" : i===1 ? sageBg :"#FFF1E1" }}>{it.icon}</span>
 <p className="mt-2 text-[10px] leading-[1.3]" style={{ color: ink700 }}>{it.title}</p>
 <span className="mt-1.5 block w-6 h-[3px] rounded-full" style={{ background: it.color }}/>
 </div>
 ))}
 </div>
 </div>
 </section>

  {/* Insight do mentor — aguarda conteúdo dinâmico (FEATURE-B20) */}

 {/* MICROCOPY */}
 <section className="px-6 mt-5 text-center">
 <p className="text-[13.5px] leading-[1.45]" style={{ ...serif, color: ink700 }}>
 Seu caminho continua.<br/>E sua evolução também.
 </p>
 </section>
 </div>

 {/* Sticky CTAs */}
 <div className="absolute bottom-0 left-0 right-0 z-30 px-5 pt-4 pb-5" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0) 0%, rgba(247,244,242,0.95) 35%, #F7F4F2 100%)" }}>
 <Link
 to="/progresso"
 className="relative w-full h-[56px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] active:scale-[0.99] transition"
 style={{ background:"linear-gradient(180deg,#FF9D4D 0%,#F88A2B 100%)", boxShadow:"0 14px 32px -10px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35)" }}
 >
 <span className="absolute left-5 opacity-90"><SparkleI/></span>
 Continuar minha evolução
 <span className="absolute right-5 opacity-90"><ChevR s={18}/></span>
 </Link>
 <Link
 to="/evolucao-pessoal"
 className="mt-2.5 w-full h-[46px] rounded-full flex items-center justify-center gap-2 text-[13px] font-semibold active:scale-[0.99] transition"
 style={{ background:"rgba(255,255,255,0.7)", border:"1px solid rgba(17,17,17,0.08)", color: ink700, backdropFilter:"blur(6px)" }}
 >
 <BookI/> Ver minha jornada completa
 </Link>
 </div>

 <style>{`
 @keyframes twinkle { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
 `}</style>
 </div>
 </main>
 );
};

export default DiagnosticoFinalScreen;
