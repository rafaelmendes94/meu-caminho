import { Link } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const Chev = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>);
const Search = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
const Play = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l13 7-13 7V5z"/></svg>);
const More = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>);
const Clock = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
const Spark = ({ size = 12 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/></svg>);

type Item = {
 id: string;
 type:"Áudio" |"Vídeo" |"Curso" |"Audiolivro" |"Podcast" |"Leitura";
 title: string;
 meta: string;
 img: string;
 progress: number; // 0-100
 remaining: string;
 to: string;
 lastSeen: string;
};

// Sem histórico real conectado: listas iniciam vazias.
const HERO: Item | null = null;
const ITEMS: Item[] = [];
const QUICK: Item[] = [];

export default function ContinueWatchingScreen() {
 return (
   <AppUserLayout>
 <div className="min-h-screen w-full flex items-start justify-center bg-[#EDE7E1] p-0 sm:p-6">
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
 @keyframes fade-up { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
 @keyframes pulse-soft { 0%,100% { opacity: .5 } 50% { opacity: .9 } }
 @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
 .fade-up { animation: fade-up .5s ease both }
 .no-scrollbar::-webkit-scrollbar { display: none }
 .no-scrollbar { scrollbar-width: none }
 .progress-shimmer { background: linear-gradient(90deg, #F88A2B 0%, #FFB36B 50%, #F88A2B 100%); background-size: 200% 100%; animation: shimmer 3s linear infinite }
 `}</style>

 <div
 className="relative w-[375px] min-h-[812px] overflow-hidden text-[#1F1A16]"
 style={{
 fontFamily:"'Montserrat', system-ui, sans-serif",
 background:"radial-gradient(120% 70% at 0% 0%, #FFF8F3 0%, #F7F1EA 45%, #EFE6DC 100%)",
 }}
 >
 {/* Atmospheric glows */}
 <div className="pointer-events-none absolute -top-20 -left-16 w-[300px] h-[300px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.22), transparent 70%)", filter:"blur(20px)", animation:"pulse-soft 8s ease-in-out infinite" }} />
 <div className="pointer-events-none absolute top-1/2 -right-20 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(196,148,98,0.20), transparent 70%)", filter:"blur(22px)" }} />

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 px-5 pt-1 pb-3 flex items-center justify-between">
 <Link to="/perfil" className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.05)]"><Chev/></Link>
 <div className="text-[12px] tracking-[0.22em] text-[#8A7868] uppercase">Sua jornada</div>
 <button className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.05)]"><Search/></button>
 </div>

 {/* Title */}
 <div className="relative z-20 px-6 pt-2 pb-5 fade-up">
 <h1 style={serif} className="text-[34px] leading-[1.05]">
 Continue<br/><span className="italic text-[#F88A2B]">de onde parou</span>
 </h1>
 <p className="mt-2 text-[13px] text-[#7A6A5C] leading-relaxed max-w-[280px]">
 Cada minuto retomado é um passo a mais na sua jornada emocional.
 </p>
 </div>

 {/* HERO continue card */}
 <div className="relative z-20 px-5 pb-5 fade-up">
 <Link to={HERO.to} className="block relative rounded-[28px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.18)] group">
 <div className="relative h-[230px]">
 <img src={HERO.img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(20,12,4,0.85) 100%)" }} />
 {/* glow */}
 <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.45), transparent 70%)", filter:"blur(18px)" }} />

 <div className="absolute top-4 left-4 flex items-center gap-2">
 <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white border border-white/30">{HERO.type}</span>
 <span className="text-[10px] text-white/80 flex items-center gap-1"><Spark size={10}/> retomar</span>
 </div>

 <div className="absolute bottom-0 left-0 right-0 p-5">
 <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{HERO.meta}</p>
 <h2 style={serif} className="text-white text-[24px] leading-[1.1] mt-1.5 max-w-[260px]">{HERO.title}</h2>

 <div className="mt-4 flex items-center gap-3">
 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1F1A16] shadow-[0_8px_22px_rgba(0,0,0,0.35)]">
 <Play s={18}/>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between text-white text-[10.5px] mb-1.5">
 <span className="flex items-center gap-1"><Clock/> {HERO.remaining}</span>
 <span className="tabular-nums">{HERO.progress}%</span>
 </div>
 <div className="h-[3px] rounded-full bg-white/20 overflow-hidden">
 <div className="h-full progress-shimmer rounded-full" style={{ width: `${HERO.progress}%` }}/>
 </div>
 </div>
 </div>
 </div>
 </div>
 </Link>
 </div>

 {/* CTA */}
 <div className="relative z-20 px-5 pb-6 fade-up">
 <Link
 to={HERO.to}
 className="flex items-center justify-center gap-2 h-12 rounded-full text-white text-[13px] font-semibold shadow-[0_14px_28px_rgba(248,138,43,0.38)]"
 style={{ background:"linear-gradient(135deg,#FFA158,#F88A2B)" }}
 >
 <Play s={13}/> Retomar jornada
 </Link>
 </div>

 {/* Recents — horizontal cards */}
 <div className="relative z-20 px-5 pb-2 flex items-center justify-between">
 <h2 style={serif} className="text-[18px]">Recentes</h2>
 <button className="text-[11px] uppercase tracking-[0.18em] text-[#F88A2B]">Ver tudo</button>
 </div>
 <div className="relative z-20 pl-5 pb-6">
 <div className="flex gap-3 overflow-x-auto no-scrollbar pr-5">
 {ITEMS.map((it, i) => (
 <Link
 key={it.id}
 to={it.to}
 className="shrink-0 w-[220px] rounded-2xl overflow-hidden bg-white border border-[#EFE3D5] shadow-[0_10px_24px_rgba(0,0,0,0.08)] fade-up"
 style={{ animationDelay: `${i * 50}ms` }}
 >
 <div className="relative h-[130px]">
 <img src={it.img} alt="" className="w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.55))" }} />
 <span className="absolute top-2 left-2 text-[9.5px] uppercase tracking-[0.18em] text-white/95 bg-black/35 backdrop-blur px-2 py-0.5 rounded-full">{it.type}</span>
 <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-[#1F1A16] shadow-md">
 <Play s={13}/>
 </div>
 <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15">
 <div className="h-full" style={{ width: `${it.progress}%`, background:"linear-gradient(90deg,#FFB36B,#F88A2B)" }}/>
 </div>
 </div>
 <div className="px-3 py-3">
 <h3 style={serif} className="text-[14.5px] leading-[1.2] text-[#1F1A16] line-clamp-2 min-h-[34px]">{it.title}</h3>
 <p className="text-[10.5px] text-[#8A7868] mt-1 truncate">{it.meta}</p>
 <div className="mt-2.5 flex items-center justify-between text-[10.5px]">
 <span className="text-[#F88A2B] flex items-center gap-1 font-medium"><Clock/> {it.remaining}</span>
 <span className="text-[#A89684]">{it.lastSeen}</span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>

 {/* Quick resume — list */}
 <div className="relative z-20 px-5 pb-2 flex items-center justify-between">
 <h2 style={serif} className="text-[18px]">Retomada rápida</h2>
 <span className="text-[11px] text-[#8A7868] flex items-center gap-1"><Spark size={11}/> próximos 5 min</span>
 </div>
 <div className="relative z-20 px-5 pb-32 space-y-2.5">
 {QUICK.map((it, i) => (
 <Link
 key={it.id}
 to={it.to}
 className="fade-up flex items-center gap-3 rounded-2xl bg-white/85 backdrop-blur border border-[#EFE3D5] p-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.05)] active:scale-[0.99] transition-transform"
 style={{ animationDelay: `${i * 40}ms` }}
 >
 <div className="relative w-[64px] h-[64px] rounded-xl overflow-hidden shrink-0">
 <img src={it.img} alt="" className="w-full h-full object-cover" />
 <div className="absolute inset-0 flex items-center justify-center bg-black/25">
 <div className="w-7 h-7 rounded-full bg-white/95 flex items-center justify-center text-[#1F1A16]"><Play s={11}/></div>
 </div>
 <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/15">
 <div className="h-full" style={{ width: `${it.progress}%`, background:"#F88A2B" }}/>
 </div>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1.5">
 <span className="text-[9.5px] uppercase tracking-[0.16em] text-[#F88A2B] font-semibold">{it.type}</span>
 <span className="w-1 h-1 rounded-full bg-[#D9C8B5]"/>
 <span className="text-[10px] text-[#8A7868]">{it.meta}</span>
 </div>
 <h3 style={serif} className="text-[14.5px] leading-tight text-[#1F1A16] truncate mt-0.5">{it.title}</h3>
 <div className="mt-1 flex items-center gap-2">
 <div className="flex-1 h-[3px] rounded-full bg-[#F2E7DA] overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${it.progress}%`, background:"linear-gradient(90deg,#FFB36B,#F88A2B)" }}/>
 </div>
 <span className="text-[10px] text-[#7A6A5C] tabular-nums shrink-0">{it.remaining}</span>
 </div>
 </div>
 <button className="text-[#A89684] -mr-1"><More/></button>
 </Link>
 ))}
 </div>

 {/* Bottom nav */}
 <div className="absolute bottom-0 left-0 right-0 z-30">
 <div className="h-16 bg-gradient-to-t from-[#EFE6DC] via-[#EFE6DC]/85 to-transparent" />
 
 </div>
 </div>
 </div>
   </AppUserLayout>
 );
}
