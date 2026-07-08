import { Link } from"react-router-dom";
import curyImg from"@/assets/trilha/cury.jpg";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

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
const ChevR = ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const Mic = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>;
const Clock = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ink700} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const Brain = ({ c = lilac, s = 18 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a4 4 0 0 0-4 4v2a3 3 0 0 0-1 6 3 3 0 0 0 5 2 3 3 0 0 0 5-1V8a4 4 0 0 0-4-4z"/><path d="M9 9v8"/></svg>;
const Quote = ({ c = brand, s = 16 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const Send = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;

const suggestions = [
 { label:"Estou ansioso", icon:"🌬️" },
 { label:"Minha mente não desacelera", icon:"🧠" },
 { label:"Estou emocionalmente cansado", icon:"🤍" },
 { label:"Quero melhorar meus relacionamentos", icon:"🤝" },
 { label:"Preciso dormir melhor", icon:"🌙" },
];

const recents = [
 { title:"Ansiedade e pensamentos acelerados", time:"Hoje · 10:32" },
 { title:"Como desacelerar minha mente", time:"Ontem · 22:15" },
];

const CuryDigitalHomeScreen = () => {
  const al = useAudienceLink();
 return (
   <AppUserLayout>
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
 style={{ background: bg, paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 {/* atmospheric glows */}
 <div className="pointer-events-none absolute inset-0 z-0" style={{ background:"radial-gradient(75% 38% at 50% 22%, rgba(248,138,43,0.22) 0%, transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(155,138,201,0.06) 0%, transparent 70%)" }}/>
 <div className="pointer-events-none absolute -top-24 -left-24 w-[280px] h-[280px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.16), transparent 70%)", filter:"blur(28px)" }}/>
 <div className="pointer-events-none absolute -top-10 -right-24 w-[260px] h-[260px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(227,236,221,0.5), transparent 70%)", filter:"blur(28px)" }}/>

 {[
 { top:"14%", left:"10%", s: 4, d: 0 },
 { top:"20%", left:"86%", s: 3, d: 0.8 },
 { top:"30%", left:"8%", s: 3, d: 1.6 },
 { top:"36%", left:"92%", s: 4, d: 0.4 },
 { top:"12%", left:"62%", s: 3, d: 1.2 },
 { top:"44%", left:"18%", s: 2, d: 2.0 },
 { top:"42%", left:"78%", s: 2, d: 0.6 },
 ].map((p, i) => (
 <span key={i} className="pointer-events-none absolute rounded-full bg-white z-0" style={{ top: p.top, left: p.left, width: p.s, height: p.s, boxShadow: `0 0 8px ${brand}`, animation: `twinkle 3.4s ease-in-out ${p.d}s infinite` }}/>
 ))}

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-1 shrink-0">
 <Link to={al("/home")} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <ChevL/>
 </Link>
 <p className="text-[14px]" style={{ color: ink700 }}>Cury Digital</p>
 <Link to={al("/cury-digital/historico")} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition">
 <Clock/>
 </Link>
 </div>

 {/* Scroll body */}
 <div className="relative z-10 flex-1 overflow-x-hidden no-scrollbar">
 {/* Hero */}
 <section className="px-7 pt-5 text-center">
 <h1 className="text-[28px] leading-[1.12] text-[#111]" style={serif}>
 Como sua mente<br/>está hoje?
 </h1>
 <p className="mt-2.5 text-[13px] leading-[1.55] mx-auto max-w-[260px]" style={{ color: ink600 }}>
 O Cury Digital está aqui para conversar com você.
 </p>
 </section>

 {/* Orb */}
 <section className="relative flex items-center justify-center mt-3 mb-2 h-[210px]">
 {/* outer ring */}
 <div className="absolute w-[200px] h-[200px] rounded-full" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.25), transparent 70%)", filter:"blur(18px)", animation:"pulse-soft 4s ease-in-out infinite" }}/>
 <div className="absolute w-[170px] h-[170px] rounded-full border" style={{ borderColor:"rgba(248,138,43,0.18)" }}/>
 <div className="absolute w-[140px] h-[140px] rounded-full border" style={{ borderColor:"rgba(248,138,43,0.28)" }}/>
 {/* orb */}
 <div
 className="relative w-[110px] h-[110px] rounded-full"
 style={{
 background:"radial-gradient(circle at 35% 30%, #FFE2C4 0%, #F8B26B 38%, #E07A2B 78%, #B85A18 100%)",
 boxShadow:"0 18px 50px -10px rgba(248,138,43,0.55), inset -6px -10px 20px rgba(0,0,0,0.18), inset 8px 10px 24px rgba(255,255,255,0.45)",
 animation:"pulse-soft 3.6s ease-in-out infinite",
 }}
 >
 <span className="absolute top-3 left-5 w-6 h-3 rounded-full bg-white/70 blur-[2px]"/>
 <span className="absolute top-7 left-3 w-2 h-2 rounded-full bg-white/80 blur-[1px]"/>
 </div>
 </section>

 {/* Input */}
 <section className="px-5">
 <div className="flex items-center gap-2 bg-white rounded-full pl-5 pr-2 py-2 border border-black/5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.08)]">
 <input
 placeholder="Escreva o que está sentindo…"
 className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[#999] py-2"
 style={{ color: ink900 }}
 />
 <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background:"rgba(248,138,43,0.08)" }}>
 <Mic/>
 </button>
 <Link to={al("/cury-digital/chat")} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition" style={{ background: `linear-gradient(180deg, ${brand}, #E07A2B)`, boxShadow:"0 8px 20px -6px rgba(248,138,43,0.55)" }}>
 <Send/>
 </Link>
 </div>
 </section>

 {/* Quick suggestions */}
 <section className="px-5 mt-5">
 <p className="text-[12px] mb-2.5" style={{ color: ink600 }}>Sugestões rápidas</p>
 <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
 {suggestions.map((s, i) => (
 <Link key={i} to={al("/cury-digital/chat")} className="shrink-0 bg-white rounded-2xl px-3 py-2.5 border border-black/5 shadow-[0_4px_14px_-8px_rgba(0,0,0,0.08)] flex flex-col items-start gap-1.5 w-[110px] active:scale-95 transition">
 <span className="text-[16px]">{s.icon}</span>
 <span className="text-[11px] leading-[1.25]" style={{ color: ink700 }}>{s.label}</span>
 </Link>
 ))}
 </div>
 </section>

 {/* Estado emocional + Insight Cury */}
 <section className="px-5 mt-5 grid grid-cols-2 gap-3">
 <div className="bg-white rounded-2xl p-3.5 border border-black/5 shadow-[0_8px_22px_-14px_rgba(0,0,0,0.10)]">
 <p className="text-[10.5px] uppercase tracking-[0.12em]" style={{ color: ink500 }}>Seu estado atual</p>
 <div className="flex items-center gap-1.5 mt-2">
 <Brain s={16}/>
 <p className="text-[12px]" style={{ color: ink900 }}>Mente acelerada</p>
 </div>
 <div className="mt-2 h-1.5 rounded-full bg-[#F1ECE6] overflow-hidden">
 <div className="h-full rounded-full" style={{ width:"62%", background: `linear-gradient(90deg, ${brand}, ${lilac})` }}/>
 </div>
 <p className="mt-2 text-[10.5px] leading-[1.4]" style={{ color: ink600 }}>Clareza emocional em evolução</p>
 </div>

 <div className="rounded-2xl p-3.5 border border-black/5 shadow-[0_8px_22px_-14px_rgba(0,0,0,0.10)] relative overflow-hidden" style={{ background:"linear-gradient(160deg, #FFFFFF 0%, #F6EFE8 100%)" }}>
 <div className="absolute -right-6 -bottom-6 w-[78px] h-[78px] rounded-full overflow-hidden border-2 border-white shadow-[0_4px_10px_-2px_rgba(0,0,0,0.12)]">
 <img src={curyImg} alt="Augusto Cury" className="w-full h-full object-cover"/>
 </div>
 <Quote s={14}/>
 <p className="mt-1.5 text-[11.5px] leading-[1.4] pr-10" style={{ color: ink900, fontStyle:"italic" }}>
"Pensamentos acelerados silenciam emoções importantes."
 </p>
 <p className="mt-1.5 text-[10px]" style={{ color: brand }}>— Augusto Cury</p>
 </div>
 </section>

 {/* Histórico recente */}
 <section className="px-5 mt-5">
 <div className="flex items-center justify-between mb-2.5">
 <p className="text-[12px]" style={{ color: ink600 }}>Conversas recentes</p>
 <Link to={al("/cury-digital/historico")} className="text-[11px] flex items-center gap-1" style={{ color: brand }}>
 Ver todas <ChevR s={12}/>
 </Link>
 </div>
 <div className="space-y-2">
 {recents.map((r, i) => (
 <Link key={i} to={al("/cury-digital/chat")} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-black/5 shadow-[0_4px_14px_-10px_rgba(0,0,0,0.10)] active:scale-[0.99] transition">
 <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background:"#EFEAF8" }}>
 <Brain c={lilac} s={16}/>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[12.5px] truncate" style={{ color: ink900 }}>{r.title}</p>
 <p className="text-[10.5px]" style={{ color: ink500 }}>{r.time}</p>
 </div>
 <ChevR s={14}/>
 </Link>
 ))}
 </div>
 </section>

 <div className="h-6"/>
 </div>

 {/* Sticky CTA above bottom nav */}
 <div className="relative z-30 px-5 pt-3 pb-3 shrink-0" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0) 0%, rgba(247,244,242,0.95) 35%, #F7F4F2 100%)" }}>
 <Link to={al("/cury-digital/chat")} className="block w-full text-center text-white text-[14px] font-medium rounded-full py-3.5 active:scale-[0.99] transition" style={{ background: `linear-gradient(180deg, ${brand}, #E07A2B)`, boxShadow:"0 14px 30px -10px rgba(248,138,43,0.55)" }}>
 Começar conversa
 </Link>
 </div>

 </div>

 <style>{`
 @keyframes twinkle { 0%,100%{opacity:0.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
 @keyframes pulse-soft { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.92} }
 .no-scrollbar::-webkit-scrollbar{display:none}
 .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
 `}</style>
 </main>
   </AppUserLayout>
 );
};

export default CuryDigitalHomeScreen;
