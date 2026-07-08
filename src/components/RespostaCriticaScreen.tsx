import { Link } from"react-router-dom";
import heroImg from"@/assets/trilha/evolucao-hero.jpg";
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
const HeartO = ({ c ="#fff", s = 17 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const Phone = ({ c ="#fff" }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2z"/></svg>;
const User = ({ c = lilac }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>;
const Chat = ({ c = sage }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4V6z"/></svg>;
const Wind = ({ c = brand }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h16a3 3 0 1 1-3 3"/></svg>;
const ChevR = ({ s = 14, c = ink500 }: { s?: number; c?: string }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;

const actions = [
 {
 primary: true,
 bg: `linear-gradient(180deg, ${brand}, #E07A2B)`,
 icon: <Phone/>,
 iconBg:"rgba(255,255,255,0.18)",
 title:"Ligar para o CVV — 188",
 sub:"Disponível 24h por dia · Gratuito",
 href:"tel:188",
 },
 {
 primary: false,
 icon: <User/>,
 iconBg:"#EFEAF8",
 title:"Conversar com um profissional",
 sub:"Atendimento especializado",
 to:"/ajuda",
 },
 {
 primary: false,
 icon: <Chat/>,
 iconBg: sageBg,
 title:"Continuar conversa com IA",
 sub:"O Cury Digital está aqui",
 to:"/cury-digital/chat",
 },
 {
 primary: false,
 icon: <Wind/>,
 iconBg:"#FFF1E1",
 title:"Respirar comigo",
 sub:"Exercício para acalmar sua mente",
 to:"/cury-digital/chat",
 },
];

const RespostaCriticaScreen = () => {
  const al = useAudienceLink();
 return (
   <AppUserLayout>
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
 style={{ background: bg, paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 {/* glows */}
 <div className="pointer-events-none absolute inset-0 z-0" style={{ background:"radial-gradient(75% 38% at 50% 18%, rgba(248,138,43,0.18) 0%, transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(155,138,201,0.08) 0%, transparent 70%)" }}/>
 <div className="pointer-events-none absolute -top-24 -left-24 w-[280px] h-[280px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.16), transparent 70%)", filter:"blur(28px)" }}/>
 <div className="pointer-events-none absolute -top-10 -right-24 w-[260px] h-[260px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(227,236,221,0.5), transparent 70%)", filter:"blur(28px)" }}/>

 {[
 { top:"14%", left:"10%", s: 4, d: 0 },
 { top:"20%", left:"86%", s: 3, d: 0.8 },
 { top:"30%", left:"8%", s: 3, d: 1.6 },
 { top:"12%", left:"62%", s: 3, d: 1.2 },
 { top:"44%", left:"18%", s: 2, d: 2.0 },
 ].map((p, i) => (
 <span key={i} className="pointer-events-none absolute rounded-full bg-white z-0" style={{ top: p.top, left: p.left, width: p.s, height: p.s, boxShadow: `0 0 8px ${brand}`, animation: `twinkle 3.4s ease-in-out ${p.d}s infinite` }}/>
 ))}

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-1 shrink-0">
 <Link to={al("/cury-digital/chat")} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <ChevL/>
 </Link>
 <p className="text-[14px]" style={{ color: ink700 }}>Resposta crítica</p>
 <button className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition">
 <HeartO c={brand} s={15}/>
 </button>
 </div>

 {/* Body */}
 <div className="relative z-10 flex-1 overflow-x-hidden no-scrollbar">
 {/* Hero */}
 <section className="px-7 pt-4 text-center">
 <h1 className="text-[26px] leading-[1.18] text-[#111]" style={serif}>
 Você não precisa<br/>passar por isso sozinho.
 </h1>
 <p className="mt-2.5 text-[12.5px] leading-[1.55] mx-auto max-w-[280px]" style={{ color: ink600 }}>
 Buscar ajuda é um ato de coragem.
 </p>
 </section>

 {/* Contemplative illustration */}
 <section className="mt-4 px-5">
 <div className="relative h-[180px] rounded-3xl overflow-hidden border border-white/60 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)]">
 <img src={heroImg} alt="Paisagem contemplativa" className="w-full h-full object-cover"/>
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0) 30%, rgba(247,244,242,0.55) 100%)" }}/>
 {/* breathing dot */}
 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
 <div className="relative w-14 h-14 flex items-center justify-center">
 <span className="absolute inset-0 rounded-full" style={{ background:"rgba(248,138,43,0.25)", filter:"blur(8px)", animation:"pulse-soft 3.6s ease-in-out infinite" }}/>
 <span className="relative w-8 h-8 rounded-full" style={{ background:"radial-gradient(circle at 35% 30%, #FFE2C4 0%, #F8B26B 38%, #E07A2B 78%, #B85A18 100%)", boxShadow:"0 6px 16px -4px rgba(248,138,43,0.55)" }}/>
 </div>
 </div>
 </div>
 </section>

 {/* Actions */}
 <section className="px-5 mt-5 space-y-2.5">
 {actions.map((a, i) => {
 const inner = (
 <div className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 active:scale-[0.99] transition ${a.primary ?"" :"bg-white border border-black/5 shadow-[0_8px_22px_-16px_rgba(0,0,0,0.10)]"}`} style={a.primary ? { background: a.bg, boxShadow:"0 14px 30px -10px rgba(248,138,43,0.55)" } : undefined}>
 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: a.iconBg }}>
 {a.icon}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[13.5px] leading-tight" style={{ color: a.primary ?"#fff" : ink900 }}>{a.title}</p>
 <p className="text-[10.5px] mt-0.5" style={{ color: a.primary ?"rgba(255,255,255,0.85)" : ink600 }}>{a.sub}</p>
 </div>
 <ChevR s={14} c={a.primary ?"#fff" : ink500}/>
 </div>
 );
 return a.href ? (
 <a key={i} href={a.href}>{inner}</a>
 ) : (
 <Link key={i} to={a.to!}>{inner}</Link>
 );
 })}
 </section>

 {/* Reassurance */}
 <section className="px-5 mt-5">
 <div className="rounded-2xl p-4 border border-black/5 text-center" style={{ background:"linear-gradient(160deg, #FFFFFF, #F6EFE8)" }}>
 <p className="text-[12.5px] leading-[1.55]" style={{ color: ink700 }}>
 Se você estiver em perigo, procure ajuda imediata. Você é importante e sua vida importa.
 </p>
 <div className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] px-3 py-1 rounded-full" style={{ background: sageBg, color:"#4a6741" }}>
 <span className="w-1.5 h-1.5 rounded-full" style={{ background: sage }}/>
 Atendimento sigiloso e gratuito
 </div>
 </div>
 </section>

 <div className="h-[40px]"/>
 </div>

 </div>

 <style>{`
 @keyframes twinkle { 0%,100%{opacity:0.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
 @keyframes pulse-soft { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.85} }
 .no-scrollbar::-webkit-scrollbar{display:none}
 .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
 `}</style>
 </main>
   </AppUserLayout>
 );
};

export default RespostaCriticaScreen;
