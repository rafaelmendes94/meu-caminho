import { Link, useLocation } from"react-router-dom";
import certBg from"@/assets/trilha/certificado-bg.jpg";
import curyImg from"@/assets/trilha/cury.jpg";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { useDisplayUser } from "@/hooks/use-display-user";

const ink900 ="#111111";
const ink700 ="#444444";
const ink600 ="#666666";
const ink500 ="#999999";
const brand ="#F88A2B";
const sage ="#8FB17D";
const sageBg ="#E3ECDD";
const lilac ="#9B8AC9";
const gold ="#C9A24C";
const goldSoft ="#D8C2A8";
const bg ="#F7F4F2";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;
const script = { fontFamily:"'Caveat', 'Dancing Script', cursive" } as const;

const Signal = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const Wifi = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const Battery = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const ChevL = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const Share = ({ c ="currentColor", s = 17 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>;
const Compass = ({ c = ink700 }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5L13 13l-4.5 2.5L11 11z"/></svg>;
const HeartO = ({ c = brand, s = 12 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const Quote = ({ c = brand, s = 18 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const Check = ({ c ="#fff", s = 12 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>;

// Medal seal (gold laurel) ----------------------------------------
const MedalSeal = ({ s = 60 }: { s?: number }) => (
 <svg width={s} height={s} viewBox="0 0 100 100">
 <defs>
 <radialGradient id="medalg" cx="50%" cy="40%" r="60%">
 <stop offset="0%" stopColor="#F4D27A"/>
 <stop offset="55%" stopColor="#D9AE53"/>
 <stop offset="100%" stopColor="#A37D2C"/>
 </radialGradient>
 </defs>
 <circle cx="50" cy="50" r="34" fill="url(#medalg)" stroke="#A37D2C" strokeWidth="0.8"/>
 <circle cx="50" cy="50" r="29" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8"/>
 {/* leaf */}
 <path d="M50 38c-6 4-9 9-9 14 4 0 8-2 9-5 1 3 5 5 9 5 0-5-3-10-9-14z" fill="#fff" opacity="0.9"/>
 <path d="M50 41v15" stroke="#A37D2C" strokeWidth="0.6" opacity="0.6"/>
 </svg>
);
const SealBadge = ({ s = 78 }: { s?: number }) => (
 <svg width={s} height={s} viewBox="0 0 100 100">
 <defs>
 <radialGradient id="badgeg" cx="50%" cy="40%" r="60%">
 <stop offset="0%" stopColor="#F4D27A"/>
 <stop offset="55%" stopColor="#D9AE53"/>
 <stop offset="100%" stopColor="#A37D2C"/>
 </radialGradient>
 </defs>
 <circle cx="50" cy="50" r="40" fill="url(#badgeg)" stroke="#A37D2C" strokeWidth="0.8"/>
 <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8"/>
 {/* laurel */}
 <path d="M30 55c2-10 6-16 12-20" fill="none" stroke="#fff" strokeWidth="1.3" opacity="0.9"/>
 <path d="M70 55c-2-10-6-16-12-20" fill="none" stroke="#fff" strokeWidth="1.3" opacity="0.9"/>
 {[ -10, -4, 2, 8 ].map((y,i)=>(<g key={i}>
 <ellipse cx={36-i*0.5} cy={50+y} rx="3" ry="1.4" transform={`rotate(-30 ${36-i*0.5} ${50+y})`} fill="#fff" opacity="0.9"/>
 <ellipse cx={64+i*0.5} cy={50+y} rx="3" ry="1.4" transform={`rotate(30 ${64+i*0.5} ${50+y})`} fill="#fff" opacity="0.9"/>
 </g>))}
 <path d="M44 52l4 4 9-10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
);

// Insight icons
const Book = ({ c = lilac }: { c?: string }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h7M8 11h7"/></svg>;
const ClockI = ({ c = sage }: { c?: string }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const Hands = ({ c = brand }: { c?: string }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c1 2 1 4 0 6-1-2-1-4 0-6z"/><path d="M5 14c1-2 4-3 7-3s6 1 7 3c-2 4-5 6-7 6s-5-2-7-6z"/></svg>;
const Trend = ({ c = lilac }: { c?: string }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>;

// Journey icons
const Clipboard = ({ c = ink600 }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 11h6M9 15h4"/></svg>;
const BookI = ({ c = ink600 }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h7M8 11h7"/></svg>;
const BrainI = ({ c = ink600 }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a4 4 0 0 0-4 4v2a3 3 0 0 0-1 6 3 3 0 0 0 5 2 3 3 0 0 0 5-1V8a4 4 0 0 0-4-4z"/></svg>;
const HeartI = ({ c = ink600 }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const SeedI = ({ c = ink600 }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V10"/><path d="M12 10c-3 0-6-2-6-5 3 0 6 2 6 5z"/><path d="M12 10c3 0 6-2 6-5-3 0-6 2-6 5z"/></svg>;
const StarFill = ({ c ="#fff", s = 18 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.3 9.4l6-.9z"/></svg>;

const insights = [
 { icon: <Book c={lilac}/>, num:"42", label:"aulas\nconcluídas", bg:"#EFEAF8" },
 { icon: <ClockI c={sage}/>, num:"18h", label:"de dedicação", bg: sageBg },
 { icon: <Hands c={brand}/>, num:"12", label:"práticas emocionais\nrealizadas", bg:"#FFE8D5" },
 { icon: <Trend c={lilac}/>, num:"", label:"Evolução emocional\nconsistente", bg:"#EFEAF8" },
];

const journey = [
 { label:"Diagnóstico\nInicial", icon: <Clipboard/>, ring:"#EFEAF8" },
 { label:"Curso 1\nInteligência\nEmocional", icon: <BookI/>, ring: sageBg },
 { label:"Curso 2\nGestão da\nEmoção", icon: <BrainI/>, ring: sageBg },
 { label:"Curso 3\nVida com\nPropósito", icon: <HeartI/>, ring: sageBg },
 { label:"Evolução\nEmocional", icon: <SeedI/>, ring: sageBg },
 { label:"Jornada\nConcluída", icon: <StarFill c="#fff" s={16}/>, ring: brand, final: true },
];

const ConquistaScreen = () => {
  useLocation();
  const { name: userName } = useDisplayUser();

 return (
   <AppUserLayout>
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
 style={{ background: bg, paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 {/* atmospheric golden glow */}
 <div className="pointer-events-none absolute inset-0 z-0" style={{ background:"radial-gradient(70% 30% at 50% 8%, rgba(217,174,83,0.18) 0%, transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(248,138,43,0.06) 0%, transparent 70%)" }}/>
 <div className="pointer-events-none absolute -top-20 -left-20 w-[280px] h-[280px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(217,174,83,0.18), transparent 70%)", filter:"blur(28px)" }}/>
 <div className="pointer-events-none absolute -top-10 -right-24 w-[260px] h-[260px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.12), transparent 70%)", filter:"blur(28px)" }}/>

 {/* twinkles */}
 {[
 { top:"12%", left:"10%", s: 4, d: 0 },
 { top:"20%", left:"84%", s: 3, d: 0.8 },
 { top:"36%", left:"8%", s: 4, d: 1.6 },
 { top:"30%", left:"92%", s: 3, d: 0.4 },
 { top:"10%", left:"60%", s: 3, d: 1.2 },
 { top:"55%", left:"92%", s: 3, d: 1.8 },
 { top:"60%", left:"6%", s: 3, d: 0.6 },
 ].map((p, i) => (
 <span key={i} className="pointer-events-none absolute rounded-full bg-white z-0" style={{ top: p.top, left: p.left, width: p.s, height: p.s, boxShadow: `0 0 8px ${gold}`, animation: `twinkle 3.2s ease-in-out ${p.d}s infinite` }}/>
 ))}

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-1 shrink-0">
 <Link to="/proxima-trilha" className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <ChevL/>
 </Link>
 <p className="text-[14px]" style={{ color: ink700 }}>Conquista</p>
 <button className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <Share/>
 </button>
 </div>

 {/* Scroll */}
 <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pb-[180px]">
 {/* HERO */}
 <section className="px-6 pt-2 text-center animate-fade-in">
 <h1 style={serif} className="text-[32px] leading-[1.04] text-[#111]">
 Uma nova versão<br/>sua nasceu.
 </h1>
 <p className="mt-3 text-[12px] leading-[1.5]" style={{ color: ink600 }}>
 Você concluiu uma jornada profunda<br/>de evolução emocional.
 </p>
 </section>

 {/* CERTIFICATE */}
 <section className="px-5 mt-5 relative">
 {/* Medal floating top */}
 <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-20" style={{ animation:"breathe 3.6s ease-in-out infinite" }}>
 <div className="rounded-full p-1 bg-[#F7F4F2]" style={{ boxShadow: `0 0 0 4px rgba(217,174,83,0.18), 0 10px 24px -8px rgba(217,174,83,0.5)` }}>
 <MedalSeal s={62}/>
 </div>
 </div>
 <div className="relative rounded-[22px] overflow-hidden pt-10 pb-5 px-5"
 style={{ backgroundImage: `url(${certBg})`, backgroundSize:"cover", backgroundPosition:"center", border: `1px solid ${goldSoft}`, boxShadow:"0 18px 44px -18px rgba(217,174,83,0.45), 0 4px 14px -8px rgba(17,17,17,0.10)" }}>
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(255,250,240,0.55), rgba(255,250,240,0.85))" }}/>
 <div className="relative text-center">
 <p className="text-[9.5px] font-semibold tracking-[0.28em]" style={{ color: gold }}>CERTIFICADO DE CONQUISTA</p>
 <p className="mt-2 text-[11px]" style={{ color: ink600 }}>Concedido a</p>
 <p style={serif} className="mt-1 text-[24px] leading-tight text-[#111]">{userName}</p>
 <div className="mt-2 flex items-center justify-center gap-2">
 <span className="block w-12 h-px" style={{ background: goldSoft }}/>
 <span className="block w-1.5 h-1.5 rotate-45" style={{ background: gold }}/>
 <span className="block w-12 h-px" style={{ background: goldSoft }}/>
 </div>
 <p className="mt-3 text-[9px] tracking-[0.24em] font-semibold" style={{ color: gold }}>TRILHA CONCLUÍDA</p>
 <p style={serif} className="mt-0.5 text-[16px] text-[#111]">Inteligência Emocional</p>

 <div className="mt-3 grid grid-cols-2 gap-2 text-center">
 <div>
 <p className="text-[8.5px] tracking-[0.22em] font-semibold" style={{ color: gold }}>DATA</p>
 <p className="mt-0.5 text-[11px]" style={{ color: ink700 }}>Junho de 2025</p>
 </div>
 <div>
 <p className="text-[8.5px] tracking-[0.22em] font-semibold" style={{ color: gold }}>NÍVEL EMOCIONAL ALCANÇADO</p>
 <p className="mt-0.5 text-[11px]" style={{ color: ink700 }}>Nível 4<br/><span className="text-[10px]" style={{ color: ink600 }}>Consciência Emocional</span></p>
 </div>
 </div>

 {/* signature */}
 <div className="mt-4 flex flex-col items-center">
 <p className="text-[26px] leading-none" style={{ ...script, color:"#3a2a14" }}>Augusto Cury</p>
 <span className="mt-1 block w-32 h-px" style={{ background: goldSoft }}/>
 <p className="mt-1 text-[8.5px] tracking-[0.28em] font-semibold" style={{ color: gold }}>AUGUSTO CURY</p>
 </div>

 {/* Seal */}
 <div className="absolute right-1 bottom-1" style={{ filter:"drop-shadow(0 6px 10px rgba(217,174,83,0.35))" }}>
 <div className="relative">
 <SealBadge s={70}/>
 <p className="absolute inset-0 flex flex-col items-center justify-center text-center text-[7.5px] font-semibold leading-tight text-white tracking-[0.06em]" style={{ paddingTop: 14 }}>JORNADA<br/>CONCLUÍDA</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* INSIGHTS */}
 <section className="px-5 mt-5">
 <p className="text-center text-[10px] tracking-[0.22em] font-semibold" style={{ color:"#7A6B5C" }}>INSIGHTS DA SUA JORNADA</p>
 <div className="mt-3 grid grid-cols-4 gap-2">
 {insights.map((it, i) => (
 <div key={i} className="rounded-[18px] bg-white/85 backdrop-blur-sm px-2 py-3 flex flex-col items-center text-center" style={{ border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 14px -8px rgba(17,17,17,0.10)" }}>
 <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: it.bg }}>{it.icon}</span>
 {it.num && <p style={serif} className="mt-2 text-[18px] leading-none text-[#111]">{it.num}</p>}
 <p className={`${it.num ?"mt-1" :"mt-2"} text-[9px] leading-[1.25] whitespace-pre-line`} style={{ color: ink600 }}>{it.label}</p>
 </div>
 ))}
 </div>
 </section>

 {/* CURY */}
 <section className="px-5 mt-3">
 <div className="relative overflow-hidden rounded-[24px] px-3 py-3 flex items-center gap-3"
 style={{ background:"linear-gradient(135deg, #FFF8F3, #F6EFE8)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 22px -12px rgba(248,138,43,0.18)" }}>
 <div className="absolute -top-10 -right-10 w-[160px] h-[160px] rounded-full" style={{ background:"radial-gradient(circle, rgba(217,174,83,0.14), transparent 70%)" }}/>
 <img src={curyImg} alt="Augusto Cury" className="relative w-[78px] h-[78px] rounded-2xl object-cover ring-1 ring-white shadow-[0_4px_14px_-6px_rgba(0,0,0,0.2)] shrink-0"/>
 <div className="flex-1 min-w-0 relative">
 <Quote c={brand} s={18}/>
 <p style={serif} className="mt-1 text-[13px] leading-[1.4] text-[#111]">
 Grandes mudanças começam quando aprendemos a cuidar silenciosamente da mente.
 </p>
 <p className="mt-1 text-[10px] tracking-[0.18em] uppercase" style={{ color: brand }}>— Augusto Cury</p>
 </div>
 </div>
 </section>

 {/* JOURNEY */}
 <section className="px-5 mt-3">
 <div className="rounded-[24px] bg-white/85 backdrop-blur-sm p-4" style={{ border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 18px -10px rgba(17,17,17,0.08)" }}>
 <p className="text-center text-[10px] tracking-[0.22em] font-semibold" style={{ color:"#7A6B5C" }}>SUA JORNADA</p>
 <div className="mt-3 relative">
 <span className="absolute left-[6%] right-[6%] top-[19px] h-px" style={{ background:"linear-gradient(to right, rgba(143,177,125,0.5), rgba(248,138,43,0.55))" }}/>
 <div className="grid grid-cols-6 gap-1 relative">
 {journey.map((j, i) => (
 <div key={i} className="flex flex-col items-center text-center">
 <span className="relative w-9 h-9 rounded-full flex items-center justify-center"
 style={{
 background: j.final ? brand : j.ring,
 border: j.final ? `1.5px solid ${brand}` : `1px solid rgba(143,177,125,0.5)`,
 boxShadow: j.final ? `0 0 0 4px rgba(248,138,43,0.16), 0 0 18px rgba(248,138,43,0.55)` :"0 2px 8px -4px rgba(17,17,17,0.10)",
 animation: j.final ?"pulse-soft 3.2s ease-in-out infinite" :"none",
 }}>
 {j.icon}
 <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: j.final ?"#fff" : sage }}>
 <Check c={j.final ? brand :"#fff"} s={8}/>
 </span>
 </span>
 <p className="mt-1.5 text-[7.5px] leading-[1.15] whitespace-pre-line font-semibold" style={{ color: j.final ? brand : ink700 }}>
 {j.label}
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
 <button
 className="relative w-full h-[54px] rounded-full flex items-center justify-center gap-2 text-white font-semibold text-[15px] active:scale-[0.99] transition"
 style={{ background:"linear-gradient(180deg,#FF9D4D 0%,#F88A2B 100%)", boxShadow:"0 14px 32px -10px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35)" }}
 >
 <Share c="#fff" s={16}/> Compartilhar conquista
 </button>
 <Link
 to="/proxima-trilha"
 className="mt-2.5 w-full h-[44px] rounded-full flex items-center justify-center gap-2 text-[12.5px] font-semibold active:scale-[0.99] transition"
 style={{ background:"rgba(255,255,255,0.7)", border:"1px solid rgba(17,17,17,0.08)", color: ink700, backdropFilter:"blur(6px)" }}
 >
 <Compass/> Continuar evoluindo
 </Link>
 <p className="mt-2 text-center text-[10.5px] leading-[1.45] flex items-center justify-center gap-1.5" style={{ color: brand }}>
 <HeartO c={brand} s={12}/> Sua evolução emocional continua além desta conquista.
 </p>
 </div>

 <style>{`
 @keyframes twinkle { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
 @keyframes pulse-soft { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
 @keyframes breathe { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-2px) scale(1.03)} }
 `}</style>
 </div>
 </main>
   </AppUserLayout>
 );
};

export default ConquistaScreen;
