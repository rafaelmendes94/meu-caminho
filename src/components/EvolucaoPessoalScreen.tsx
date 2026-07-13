import { Link } from"react-router-dom";
import heroImg from"@/assets/trilha/evolucao-hero.jpg";
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
const ArrowR = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const Check = ({ c ="#fff", s = 11 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>;
const Quote = ({ c = brand, s = 18 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const StarFill = ({ c = brand, s = 22 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.3 9.4l6-.9z"/></svg>;
// Icons antes
const Cloud = ({ c = ink600 }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 7 17z"/><path d="M9 14l-1 2M13 14l-1 2"/></svg>;
const Spiral = ({ c = ink600 }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M15 12a3 3 0 1 1-3-3 5 5 0 0 1 5 5 7 7 0 0 1-7 7"/></svg>;
const Battery2 = ({ c = ink600 }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="5" width="12" height="16" rx="2.5"/><path d="M10 3h4"/><path d="M9 14h6"/></svg>;
const Clock = ({ c = ink600 }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const People = ({ c = ink600 }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.5"/><circle cx="17" cy="10" r="2"/><path d="M3 19c1-3 4-4.5 6-4.5s5 1.5 6 4.5"/><path d="M15 18.5c.7-2 2.5-3 4-3"/></svg>;
// Icons agora
const Leaf = ({ c = sage }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 8-8 14-14"/></svg>;
const Person = ({ c = sage }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="6" r="2.2"/><path d="M8 21c0-3 4-6 4-6s4 3 4 6"/><path d="M9 13c1-1 2-2 3-2s2 1 3 2"/></svg>;
const Shield = ({ c = sage }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/></svg>;
const Sun = ({ c = sage }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></svg>;
const HeartG = ({ c = sage }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
// Journey icons
const Clipboard = ({ c = ink600 }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 11h6M9 15h4"/></svg>;
const BookI = ({ c = ink600 }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h7M8 11h7"/></svg>;
const LotusI = ({ c = sage }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c2 3 2 6 0 9-2-3-2-6 0-9z"/><path d="M4 13c3-1 6 0 8 3-3 1-6 0-8-3z"/><path d="M20 13c-3-1-6 0-8 3 3 1 6 0 8-3z"/></svg>;
const StarI = ({ c = ink600 }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.3 9.4l6-.9z"/></svg>;
const Meditator = ({ c = lilac }: { c?: string }) => <svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="32" cy="18" r="5" opacity="0.7"/><path d="M20 50c0-7 5-12 12-12s12 5 12 12" opacity="0.7"/><path d="M14 50h36" opacity="0.5"/><path d="M22 38c-3 1-6 4-7 8M42 38c3 1 6 4 7 8" opacity="0.6"/></svg>;

type Row = { label: string; icon: React.ReactNode };
const before: Row[] = [
 { label:"Ansiedade constante", icon: <Cloud/> },
 { label:"Pensamentos acelerados", icon: <Spiral/> },
 { label:"Desgaste emocional", icon: <Battery2/> },
 { label:"Dificuldade de desacelerar", icon: <Clock/> },
 { label:"Relações cansativas", icon: <People/> },
];
const now: Row[] = [
 { label:"Mais clareza emocional", icon: <Leaf/> },
 { label:"Respostas conscientes", icon: <Person/> },
 { label:"Autocontrole e equilíbrio", icon: <Shield/> },
 { label:"Mais presença no presente", icon: <Sun/> },
 { label:"Relações mais saudáveis", icon: <HeartG/> },
];

type J = { label: string; icon: React.ReactNode; final?: boolean };
const journey: J[] = [
 { label:"Primeiro\ndiagnóstico", icon: <Clipboard/> },
 { label:"Primeira aula\nconcluída", icon: <BookI/> },
 { label:"Primeira prática\nemocional", icon: <LotusI/> },
 { label:"Primeira\nconquista", icon: <StarI/> },
 { label:"Desbloqueio\nemocional", icon: <StarFill c="#fff" s={18}/>, final: true },
];

const EvolucaoPessoalScreen = () => {
 return (
   <AppUserLayout>
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
 style={{ background: bg, paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 {/* warm atmospheric glow */}
 <div className="pointer-events-none absolute inset-0 z-0" style={{ background:"radial-gradient(70% 30% at 50% 8%, rgba(248,138,43,0.16) 0%, transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(248,138,43,0.06) 0%, transparent 70%)" }}/>
 <div className="pointer-events-none absolute -top-20 -left-20 w-[280px] h-[280px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.16), transparent 70%)", filter:"blur(28px)" }}/>
 <div className="pointer-events-none absolute -top-10 -right-24 w-[260px] h-[260px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(155,138,201,0.10), transparent 70%)", filter:"blur(28px)" }}/>

 {/* twinkles */}
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
 <Link to="/diagnostico-final" className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <ChevL/>
 </Link>
 <p className="text-[14px]" style={{ color: ink700 }}>Evolução Pessoal</p>
 <button className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <Share/>
 </button>
 </div>

 {/* Scroll */}
 <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pb-[170px]">
 {/* HERO TEXT */}
 <section className="px-6 pt-2 text-center animate-fade-in">
 <h1 style={serif} className="text-[34px] leading-[1.04] text-[#111]">
 Você não está<br/>no mesmo lugar.
 </h1>
 <p className="mt-3 text-[12.5px] leading-[1.5]" style={{ color: ink600 }}>
 A sua mente mudou.<br/>Sua forma de sentir também.
 </p>
 </section>

 {/* HERO IMAGE behind the cards */}
 <section className="relative mt-3">
 <div className="relative h-[420px]">
 <img src={heroImg} alt="Caminho iluminado" className="absolute inset-x-0 top-0 w-full h-[280px] object-cover" loading="lazy" width={1024} height={1024}/>
 <div className="absolute inset-x-0 top-0 h-[280px]" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0.05) 0%, rgba(247,244,242,0.55) 60%, #F7F4F2 100%)" }}/>
 <div className="absolute inset-x-0 top-[60px] h-[200px]" style={{ background:"radial-gradient(50% 50% at 50% 50%, rgba(248,138,43,0.18), transparent 70%)" }}/>

 {/* ANTES x AGORA cards */}
 <div className="absolute inset-x-0 top-[120px] px-4">
 <div className="relative grid grid-cols-2 gap-2.5">
 {/* Antes */}
 <div className="rounded-[22px] p-3 pt-3" style={{ background:"linear-gradient(180deg, rgba(255,255,255,0.78), rgba(248,243,237,0.85))", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 8px 22px -10px rgba(17,17,17,0.10)", backdropFilter:"blur(8px)" }}>
 <div className="flex justify-center">
 <span className="px-3 py-[3px] rounded-full text-[9.5px] font-semibold tracking-[0.2em]" style={{ background:"rgba(155,138,201,0.18)", color:"#6E5FA0" }}>ANTES</span>
 </div>
 <p className="text-center text-[9.5px] mt-1.5 leading-[1.35]" style={{ color: ink600 }}>Como você se sentia<br/>no início da jornada.</p>
 <ul className="mt-2.5 space-y-2">
 {before.map((r, i) => (
 <li key={i} className="flex items-center gap-2">
 <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background:"rgba(255,255,255,0.85)", border:"1px solid rgba(17,17,17,0.06)" }}>{r.icon}</span>
 <p className="text-[10px] font-semibold leading-[1.2]" style={{ color: ink700 }}>{r.label}</p>
 </li>
 ))}
 </ul>
 </div>

 {/* Agora */}
 <div className="rounded-[22px] p-3 pt-3" style={{ background:"linear-gradient(180deg, rgba(255,248,243,0.92), rgba(246,239,232,0.95))", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 10px 26px -10px rgba(248,138,43,0.30)", backdropFilter:"blur(8px)" }}>
 <div className="flex justify-center">
 <span className="px-3 py-[3px] rounded-full text-[9.5px] font-semibold tracking-[0.2em]" style={{ background:"rgba(248,138,43,0.18)", color: brand }}>AGORA</span>
 </div>
 <p className="text-center text-[9.5px] mt-1.5 leading-[1.35]" style={{ color: ink600 }}>Como sua mente e<br/>emoções evoluíram.</p>
 <ul className="mt-2.5 space-y-2">
 {now.map((r, i) => (
 <li key={i} className="flex items-center gap-2">
 <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background:"#EAF3DF", border:"1px solid rgba(143,177,125,0.25)" }}>{r.icon}</span>
 <p className="text-[10px] font-semibold leading-[1.2]" style={{ color: ink700 }}>{r.label}</p>
 </li>
 ))}
 </ul>
 </div>

 {/* Arrow connector */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center" style={{ boxShadow:"0 0 0 5px rgba(248,138,43,0.14), 0 8px 22px -6px rgba(248,138,43,0.55)", border: `1px solid rgba(248,138,43,0.30)`, animation:"breathe 3.4s ease-in-out infinite" }}>
 <ArrowR/>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* MOMENTOS DA JORNADA */}
 <section className="px-5 mt-2">
 <div className="rounded-[24px] bg-white/85 backdrop-blur-sm p-4" style={{ border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 18px -10px rgba(17,17,17,0.08)" }}>
 <p className="text-center text-[10px] tracking-[0.22em] font-semibold" style={{ color:"#7A6B5C" }}>MOMENTOS DA JORNADA</p>
 <div className="mt-3 relative">
 <span className="absolute left-[10%] right-[10%] top-[18px] h-px" style={{ background:"linear-gradient(to right, rgba(143,177,125,0.5), rgba(248,138,43,0.55))" }}/>
 <div className="grid grid-cols-5 gap-1 relative">
 {journey.map((j, i) => (
 <div key={i} className="flex flex-col items-center text-center">
 <span className="relative w-9 h-9 rounded-full flex items-center justify-center"
 style={{
 border: j.final ? `1.5px solid ${brand}` :"1px solid rgba(17,17,17,0.08)",
 boxShadow: j.final ? `0 0 0 4px rgba(248,138,43,0.16), 0 0 18px rgba(248,138,43,0.5)` :"0 2px 8px -4px rgba(17,17,17,0.10)",
 background: j.final ? brand :"#fff",
 animation: j.final ?"pulse-soft 3.2s ease-in-out infinite" :"none",
 }}>
 {j.icon}
 {!j.final && (
 <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: sage }}>
 <Check c="#fff" s={8}/>
 </span>
 )}
 </span>
 <p className="mt-1.5 text-[8.5px] leading-[1.15] whitespace-pre-line font-semibold" style={{ color: j.final ? brand : ink700 }}>
 {j.label}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>

 {/* INSIGHT PROFUNDO */}
 <section className="px-5 mt-3">
 <div className="relative overflow-hidden rounded-[24px] px-4 py-3 flex items-center gap-3"
 style={{ background:"linear-gradient(135deg, #F4EFFA, #ECE3F7)", border:"1px solid rgba(255,255,255,0.9)", boxShadow:"0 4px 18px -10px rgba(155,138,201,0.30)" }}>
 <div className="absolute -top-10 -right-10 w-[140px] h-[140px] rounded-full" style={{ background:"radial-gradient(circle, rgba(155,138,201,0.18), transparent 70%)" }}/>
 <Quote c={lilac} s={20}/>
 <p style={serif} className="relative flex-1 text-[13px] leading-[1.45] text-[#111]">
 Você aprendeu a observar sua mente<br/>sem ser dominado por ela.
 </p>
 <div className="relative shrink-0"><Meditator c={lilac}/></div>
 </div>
 </section>

  {/* Reflexão do mentor oculta até haver citação real do CMS. */}
 </div>

 {/* Sticky CTAs */}
 <div className="absolute bottom-0 left-0 right-0 z-30 px-5 pt-5 pb-4" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0) 0%, rgba(247,244,242,0.95) 30%, #F7F4F2 100%)" }}>
 <Link
 to="/proxima-trilha"
 className="relative w-full h-[54px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] active:scale-[0.99] transition"
 style={{ background:"linear-gradient(180deg,#FF9D4D 0%,#F88A2B 100%)", boxShadow:"0 14px 32px -10px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35)" }}
 >
 Continuar evoluindo
 <span className="absolute right-5 opacity-90"><ChevR s={18}/></span>
 </Link>
 <Link
 to="/conquista"
 className="mt-2.5 w-full h-[44px] rounded-full flex items-center justify-center gap-2 text-[12.5px] font-semibold active:scale-[0.99] transition"
 style={{ background:"rgba(255,255,255,0.7)", border:"1px solid rgba(17,17,17,0.08)", color: ink700, backdropFilter:"blur(6px)" }}
 >
 <Share c={ink700}/> Compartilhar minha jornada
 </Link>
 <p className="mt-2 text-center text-[10.5px] leading-[1.45] flex items-center justify-center gap-1.5" style={{ color: ink500 }}>
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ink500} strokeWidth="1.7"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
 Cada pequena mudança emocional<br/>transforma silenciosamente a vida.
 </p>
 </div>

 <style>{`
 @keyframes twinkle { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
 @keyframes breathe { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.06)} }
 @keyframes pulse-soft { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
 `}</style>
 </div>
 </main>
   </AppUserLayout>
 );
};

export default EvolucaoPessoalScreen;
