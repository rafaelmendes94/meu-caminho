import { useState } from"react";
import { Link } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z" /><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z" /><circle cx="8" cy="10" r="1" /></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5" /><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" /><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" /></svg>);
const Chev = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>);
const Search = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
const Spark = ({ size = 12 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" /></svg>);

type Cat = {
 key: string;
 title: string;
 count: number;
 img: string;
 tone: string;
 glow: string;
 icon: JSX.Element;
};

const Wave = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /></svg>);
const Moon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>);
const People = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M14 20c0-2 2-3.5 4.5-3.5S23 18 23 20" /></svg>);
const Brain = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V5z" /><path d="M15 5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V5z" /></svg>);
const Leaf = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z" /><path d="M5 19c4-4 7-7 9-9" /></svg>);
const Shield = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" /></svg>);
const Heart = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 6.6a5.5 5.5 0 0 0-9.3-2.4l-.5.5-.5-.5A5.5 5.5 0 1 0 2.7 12l8.3 8.3 8.3-8.3a5.5 5.5 0 0 0 1.5-5.4z" /></svg>);

// Territórios emocionais reais serão carregados do CMS (cms_categories) em integração futura.
void Wave; void Moon; void People; void Brain; void Leaf; void Shield; void Heart;
const categories: Cat[] = [];

const moods = ["Calmo","Ansioso","Cansado","Inspirado","Reflexivo"];

const FeedCategoriesScreen = () => {
 const [mood, setMood] = useState("Reflexivo");

 const featured = categories[0];
 const [a, b] = [categories[1], categories[2]];
 const rest = categories.slice(3);

 return (
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <style>{`
 @keyframes fade-up { from {opacity:0; transform:translateY(10px)} to {opacity:1; transform:translateY(0)} }
 .fade-up { animation: fade-up .55s ease-out both; }
 .no-scrollbar::-webkit-scrollbar { display: none; }
 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
 `}</style>

 <div className="relative w-full h-[100dvh] overflow-hidden bg-[#F7F4F2] flex flex-col">

 {/* Soft glows */}
 <div className="pointer-events-none absolute inset-0 overflow-hidden">
 <span className="absolute -top-24 right-[-60px] w-[280px] h-[280px] rounded-full" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.18) 0%, rgba(248,138,43,0) 65%)" }} />
 <span className="absolute top-[40%] -left-20 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(circle, rgba(155,138,201,0.10) 0%, rgba(155,138,201,0) 65%)" }} />
 </div>

 {/* Status bar */}
 {/* Header */}
 <header className="relative flex items-center justify-between px-5 pt-2 pb-2">
 <Link to="/feed" aria-label="Voltar" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur ring-1 ring-black/5 flex items-center justify-center text-[#111] active:scale-95 transition" style={{ boxShadow:"0 6px 14px -8px rgba(17,17,17,0.18)" }}>
 <Chev />
 </Link>
 <p className="text-[12.5px] font-semibold tracking-tight text-[#111]" style={{ ...serif }}>Descobrir</p>
 <button aria-label="Buscar" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur ring-1 ring-black/5 flex items-center justify-center text-[#111] active:scale-95 transition" style={{ boxShadow:"0 6px 14px -8px rgba(17,17,17,0.18)" }}>
 <Search />
 </button>
 </header>

 {/* Body */}
 <div className="relative flex-1 px-5 pb-4">
 {/* Hero title */}
 <section className="mt-3 fade-up">
 <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#F88A2B] flex items-center gap-1.5">
 <Spark /> Categorias
 </p>
 <h1 className="mt-2 text-[30px] leading-[1.05] text-[#111]" style={{ ...serif, fontWeight: 600 }}>
 Encontre o conteúdo que sua mente precisa hoje.
 </h1>
 <p className="mt-2 text-[13px] text-[#666] leading-snug">
 Sete territórios emocionais. Curados por Augusto Cury.
 </p>
 </section>

 {/* Mood pills */}
 <section className="mt-5 fade-up">
 <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#666] mb-2">Como você está hoje?</p>
 <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
 <div className="flex items-center gap-2 w-max">
 {moods.map((m) => {
 const active = mood === m;
 return (
   <AppUserLayout>
 <button
 key={m}
 onClick={() => setMood(m)}
 className="h-9 px-3.5 rounded-full text-[12.5px] font-semibold tracking-tight active:scale-95 transition"
 style={
 active
 ? { background:"linear-gradient(180deg, #FFA158 0%, #F88A2B 100%)", color:"#fff", boxShadow:"0 8px 18px -8px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35)" }
 : { background:"#fff", color:"#444", boxShadow:"inset 0 0 0 1px rgba(17,17,17,0.06), 0 4px 10px -6px rgba(17,17,17,0.1)" }
 }
 >
 {m}
 </button>
   </AppUserLayout>
 );
 })}
 </div>
 </div>
 </section>

 {/* Featured large card */}
 <section className="mt-6 fade-up">
 <Link to="/feed" className="relative block rounded-[24px] overflow-hidden h-[210px]" style={{ boxShadow:"0 18px 40px -18px rgba(248,138,43,0.45), inset 0 0 0 1px rgba(17,17,17,0.05)" }}>
 <img src={featured.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 100%)" }} />
 <div className="absolute -top-8 -right-8 w-[180px] h-[180px] rounded-full" style={{ background: `radial-gradient(circle, ${featured.glow} 0%, rgba(0,0,0,0) 65%)` }} />

 <div className="absolute top-3 left-3">
 <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide text-white" style={{ background:"rgba(20,20,20,0.45)", backdropFilter:"blur(10px)" }}>
 <Spark size={10} /> EM ALTA
 </span>
 </div>

 <div className="absolute left-0 right-0 bottom-0 p-5 text-white">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-[10.5px] uppercase tracking-[0.22em] opacity-85 font-bold">Para sua mente hoje</p>
 <h2 className="mt-1 text-[26px] leading-[1.05]" style={{ ...serif, fontWeight: 600, textShadow:"0 2px 14px rgba(0,0,0,0.5)" }}>
 {featured.title}
 </h2>
 <p className="mt-1 text-[12px] opacity-90">{featured.count} conteúdos curados</p>
 </div>
 <span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: featured.tone, backdropFilter:"blur(10px)", boxShadow:"0 10px 24px -8px rgba(0,0,0,0.4)" }}>
 {featured.icon}
 </span>
 </div>
 </div>
 </Link>
 </section>

 {/* Two-up */}
 <section className="mt-3 grid grid-cols-2 gap-3 fade-up">
 {[a, b].map((c) => (
 <Link key={c.key} to="/feed" className="relative block rounded-[20px] overflow-hidden h-[170px]" style={{ boxShadow:"0 10px 26px -14px rgba(17,17,17,0.3), inset 0 0 0 1px rgba(17,17,17,0.05)" }}>
 <img src={c.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)" }} />
 <div className="absolute -top-6 -right-6 w-[120px] h-[120px] rounded-full" style={{ background: `radial-gradient(circle, ${c.glow} 0%, rgba(0,0,0,0) 65%)` }} />
 <div className="absolute top-3 left-3">
 <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: c.tone, backdropFilter:"blur(8px)", boxShadow:"0 6px 14px -4px rgba(0,0,0,0.4)" }}>
 {c.icon}
 </span>
 </div>
 <div className="absolute left-0 right-0 bottom-0 p-3 text-white">
 <h3 className="text-[16px] leading-tight" style={{ ...serif, fontWeight: 600, textShadow:"0 2px 12px rgba(0,0,0,0.5)" }}>{c.title}</h3>
 <p className="text-[11px] opacity-85 mt-0.5">{c.count} conteúdos</p>
 </div>
 </Link>
 ))}
 </section>

 {/* Section title */}
 <div className="mt-6 mb-2 flex items-center justify-between">
 <h3 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#666]">Todos os territórios</h3>
 <span className="text-[11px] text-[#999]">{categories.length} categorias</span>
 </div>

 {/* Editorial list */}
 <section className="space-y-3 fade-up">
 {rest.map((c) => (
 <Link key={c.key} to="/feed" className="relative flex items-center gap-3 rounded-[20px] overflow-hidden bg-white p-3 active:scale-[0.99] transition" style={{ boxShadow:"0 6px 18px -10px rgba(17,17,17,0.18), inset 0 0 0 1px rgba(17,17,17,0.05)" }}>
 <div className="relative w-[78px] h-[78px] rounded-[16px] overflow-hidden shrink-0">
 <img src={c.img} alt="" className="w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)" }} />
 <span className="absolute bottom-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: c.tone, backdropFilter:"blur(8px)" }}>
 {c.icon}
 </span>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: c.tone.replace(/0\.85\)|0\.88\)/,"1)") }}>Território</p>
 <h4 className="mt-0.5 text-[16px] leading-tight text-[#111]" style={{ ...serif, fontWeight: 600 }}>{c.title}</h4>
 <p className="mt-1 text-[11px] text-[#666]">{c.count} conteúdos · curado por Cury</p>
 </div>
 <span className="w-8 h-8 rounded-full bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
 </span>
 </Link>
 ))}
 </section>

 {/* Insight */}
 <section className="mt-6 mb-2 fade-up">
 <div className="relative rounded-[22px] p-5 overflow-hidden" style={{ background:"linear-gradient(135deg, #FFFFFF 0%, #FFF6EE 100%)", boxShadow:"0 10px 28px -14px rgba(248,138,43,0.3), inset 0 0 0 1px rgba(248,138,43,0.12)" }}>
 <p className="text-[15px] leading-[1.4] text-[#111]" style={{ ...serif, fontWeight: 500 }}>
"Quem conhece o território da própria mente nunca se perde no mundo."
 </p>
 <div className="mt-2 flex items-center gap-2">
 <span className="w-5 h-px bg-[#F88A2B]" />
 <span className="text-[11.5px] font-semibold text-[#F88A2B]">Augusto Cury</span>
 </div>
 </div>
 </section>
 </div>

 </div>
 </main>
 );
};

export default FeedCategoriesScreen;
