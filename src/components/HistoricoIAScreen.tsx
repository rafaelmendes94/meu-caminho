import { Link, useLocation } from"react-router-dom";
import { useState } from"react";
import curyImg from"@/assets/trilha/cury.jpg";
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
const Filter = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ink700} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16M7 12h10M10 19h4"/></svg>;
const Bookmark = ({ c = ink600, fill ="none" }: { c?: string; fill?: string }) => <svg width="15" height="15" viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v17l-6-4-6 4z"/></svg>;
const Brain = ({ c = lilac, s = 18 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a4 4 0 0 0-4 4v2a3 3 0 0 0-1 6 3 3 0 0 0 5 2 3 3 0 0 0 5-1V8a4 4 0 0 0-4-4z"/><path d="M9 9v8"/></svg>;
const Moon = ({ c = lilac }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>;
const Leaf = ({ c = sage }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 8-8 14-14"/></svg>;
const HeartO = ({ c = brand }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const Quote = ({ c = brand, s = 16 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const Search = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ink500} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>;

const filters = ["Todos","Ansiedade","Autocontrole","Relacionamentos","Sono","Clareza emocional"];

type HistoryItem = { icon: React.ReactNode; iconBg: string; title: string; insight: string; state: string; stateColor: string; stateBg: string; when: string; time: string; saved: boolean };
const items: HistoryItem[] = [];

const HistoricoIAScreen = () => {
 const [filterOpen, setFilterOpen] = useState(false);
 const [activeFilter, setActiveFilter] = useState(0);
 const { pathname } = useLocation();
 const isEnterprise = pathname.startsWith('/enterprise');
 
 return (
   <AppUserLayout>
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
 style={{ background: bg, paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 {/* glows */}
 <div className="pointer-events-none absolute inset-0 z-0" style={{ background:"radial-gradient(70% 30% at 50% 6%, rgba(248,138,43,0.14) 0%, transparent 70%), radial-gradient(60% 25% at 50% 100%, rgba(155,138,201,0.06) 0%, transparent 70%)" }}/>
 <div className="pointer-events-none absolute -top-24 -left-24 w-[260px] h-[260px] rounded-full z-0" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.12), transparent 70%)", filter:"blur(28px)" }}/>

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-2 shrink-0">
 <Link to={isEnterprise ? "/enterprise/cury-digital" : "/cury-digital"} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
 <ChevL/>
 </Link>
 <p className="text-[14px]" style={{ color: ink700 }}>Histórico emocional</p>
 <button onClick={() => setFilterOpen(true)} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition">
 <Filter/>
 </button>
 </div>

 {/* Body */}
 <div className="relative z-10 flex-1 overflow-x-hidden no-scrollbar">
 {/* Title */}
 <section className="px-7 pt-3">
 <h1 className="text-[24px] leading-[1.15] text-[#111]" style={serif}>
 Seu diário<br/>emocional
 </h1>
 <p className="mt-2 text-[12.5px]" style={{ color: ink600 }}>
 Acompanhe sua evolução através das conversas.
 </p>
 </section>

 {/* Search */}
 <section className="px-5 mt-4">
 <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 border border-black/5 shadow-[0_4px_14px_-10px_rgba(0,0,0,0.08)]">
 <Search/>
 <input placeholder="Buscar nas suas conversas…" className="flex-1 bg-transparent outline-none text-[12.5px] placeholder:text-[#999]" style={{ color: ink900 }}/>
 </div>
 </section>

 {/* Filters */}
 <section className="mt-4">
 <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-1">
 {filters.map((f, i) => (
 <button key={f} onClick={() => setActiveFilter(i)} className={`shrink-0 text-[11.5px] px-3.5 py-1.5 rounded-full border transition active:scale-95 ${i === activeFilter ?"text-white" :""}`} style={i === activeFilter ? { background: brand, borderColor: brand, boxShadow:"0 6px 14px -8px rgba(248,138,43,0.6)" } : { background:"#fff", borderColor:"rgba(0,0,0,0.06)", color: ink700 }}>
 {f}
 </button>
 ))}
 </div>
 </section>

 {/* Stats summary */}
 <section className="px-5 mt-4 grid grid-cols-3 gap-2">
  {[
  { v:"0", l:"conversas", c: brand },
  { v:"0", l:"insights", c: lilac },
  { v:"—", l:"clareza", c: sage },
  ].map((s, i) => (
 <div key={i} className="bg-white rounded-2xl py-3 text-center border border-black/5 shadow-[0_4px_14px_-10px_rgba(0,0,0,0.08)]">
 <p className="text-[18px] leading-none" style={{ ...serif, color: s.c }}>{s.v}</p>
 <p className="text-[10px] mt-1.5" style={{ color: ink600 }}>{s.l}</p>
 </div>
 ))}
 </section>

 {/* Section label */}
 <div className="flex items-center justify-between px-5 mt-5 mb-2">
 <p className="text-[12px]" style={{ color: ink600 }}>Conversas recentes</p>
 <p className="text-[10.5px]" style={{ color: ink500 }}>{items.length} registros</p>
 </div>

 {/* List */}
 <section className="px-5 space-y-2.5">
 {items.map((it, i) => (
 <Link key={i} to={isEnterprise ? "/enterprise/cury-digital" : "/cury-digital/chat"} className="block bg-white rounded-2xl p-3.5 border border-black/5 shadow-[0_8px_22px_-16px_rgba(0,0,0,0.10)] active:scale-[0.99] transition">
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: it.iconBg }}>
 {it.icon}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <p className="text-[13px] leading-tight pr-1" style={{ color: ink900 }}>{it.title}</p>
 <div className="text-right shrink-0">
 <p className="text-[10px]" style={{ color: ink500 }}>{it.when}</p>
 <p className="text-[10px]" style={{ color: ink500 }}>{it.time}</p>
 </div>
 </div>
 <p className="text-[11.5px] leading-[1.45] mt-1" style={{ color: ink600 }}>{it.insight}</p>
 <div className="flex items-center justify-between mt-2.5">
 <span className="text-[10.5px] px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: it.stateBg, color: it.stateColor }}>
 <span className="w-1.5 h-1.5 rounded-full" style={{ background: it.stateColor }}/>
 {it.state}
 </span>
 {it.saved ? (
 <Link to={isEnterprise ? "/enterprise/cury-digital" : "/cury-digital/insights"} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[10.5px]" style={{ color: brand }}>
 <Bookmark c={brand} fill={brand}/> Insight salvo
 </Link>
 ) : (
 <Bookmark c={ink500}/>
 )}
 </div>
 </div>
 </div>
 </Link>
 ))}
 </section>

 {/* Insight do mentor oculto até haver conteúdo real do CMS. */}

 <div className="h-[40px]"/>
 </div>

 {/* Filter sheet */}
 {filterOpen && (
 <div className="absolute inset-0 z-40 flex items-end" onClick={() => setFilterOpen(false)}>
 <div className="absolute inset-0 bg-black/40"/>
 <div className="relative w-full bg-white rounded-t-3xl p-5 pb-7 shadow-[0_-12px_30px_-10px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
 <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-4"/>
 <p className="text-[15px]" style={{ ...serif, color: ink900 }}>Filtrar conversas</p>
 <p className="text-[11.5px] mt-1" style={{ color: ink600 }}>Escolha um tema para refinar.</p>
 <div className="mt-4 flex flex-wrap gap-2">
 {filters.map((f, i) => (
 <button key={f} onClick={() => { setActiveFilter(i); setFilterOpen(false); }} className="text-[12px] px-3.5 py-2 rounded-full border transition active:scale-95" style={i === activeFilter ? { background: brand, borderColor: brand, color:"#fff" } : { background:"#fff", borderColor:"rgba(0,0,0,0.08)", color: ink700 }}>
 {f}
 </button>
 ))}
 </div>
 <button onClick={() => setFilterOpen(false)} className="mt-5 w-full text-white text-[13px] font-medium rounded-full py-3 active:scale-[0.99] transition" style={{ background: `linear-gradient(180deg, ${brand}, #E07A2B)` }}>
 Aplicar
 </button>
 </div>
 </div>
 )}
 </div>

 <style>{`
 .no-scrollbar::-webkit-scrollbar{display:none}
 .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
 `}</style>
 </main>
   </AppUserLayout>
 );
};

export default HistoricoIAScreen;
