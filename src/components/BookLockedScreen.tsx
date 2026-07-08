import { Link } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const Close = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>);
const Bell = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>);
const LockBig = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>);
const ArrowR = ({ s = 13 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>);
const Calendar = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>);
const Clock = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
const Spark = ({ s = 10 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/></svg>);

const NEXT = [
 { id:"codigo", title:"O Código da Inteligência", days: 12, cover:"linear-gradient(180deg,#DCDCDC,#5E5E5E)", bg:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=70&auto=format&fit=crop" },
 { id:"futuro", title:"O Futuro da Humanidade", days: 38, cover:"linear-gradient(180deg,#D8DEE2,#4A535B)", bg:"https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&q=70&auto=format&fit=crop" },
 { id:"pais", title:"Pais Brilhantes", days: 65, cover:"linear-gradient(180deg,#E6E1D6,#74695A)", bg:"https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=70&auto=format&fit=crop" },
];

export default function BookLockedScreen() {
 const days = 12;
 const totalDays = 30;
 const dayProgress = ((totalDays - days) / totalDays) * 100;

 return (
   <AppUserLayout>
 <div className="min-h-screen w-full flex items-start justify-center bg-[#EDE7E1] p-0 sm:p-6">
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
 @keyframes fade-up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
 @keyframes pulse-soft { 0%,100% { opacity: .55 } 50% { opacity: .9 } }
 @keyframes float-cover { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
 .fade-up { animation: fade-up .6s ease both }
 .float-cover { animation: float-cover 6s ease-in-out infinite }
 .no-scrollbar::-webkit-scrollbar { display: none }
 .no-scrollbar { scrollbar-width: none }
 `}</style>

 <div
 className="relative w-[375px] min-h-[100dvh] h-screen overflow-y-auto overflow-x-hidden text-[#1F1A14]"
 style={{
 fontFamily:"'Montserrat', system-ui, sans-serif",
 background:
"radial-gradient(120% 70% at 50% 0%, #F4ECE3 0%, #ECE2D5 45%, #DCD0C0 100%)",
 }}
 >
 {/* atmospheric glows */}
 <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[360px] h-[360px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(196,148,98,0.32), transparent 70%)", filter:"blur(28px)", animation:"pulse-soft 8s ease-in-out infinite" }} />
 <div className="pointer-events-none absolute top-1/3 -right-24 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(155,138,201,0.18), transparent 70%)", filter:"blur(22px)" }} />

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 px-5 pt-1 pb-3 flex items-center justify-between">
 <Link to="/biblioteca" className="w-9 h-9 rounded-full bg-white/85 backdrop-blur flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.05)]"><Close/></Link>
 <div className="text-[10px] tracking-[0.3em] text-[#8A7868] uppercase flex items-center gap-1.5"><Spark/> Em breve</div>
 <div className="w-9 h-9"/>
 </div>

 {/* Cover area */}
 <div className="relative z-20 mt-4 mb-6 flex flex-col items-center">
 {/* halo */}
 <div className="absolute top-2 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(196,148,98,0.30), transparent 70%)", filter:"blur(22px)", animation:"pulse-soft 6s ease-in-out infinite" }} />

 {/* Locked cover */}
 <div className="relative w-[180px] aspect-[3/4] float-cover">
 <div className="absolute -bottom-5 left-3 right-3 h-8 rounded-full" style={{ background:"radial-gradient(closest-side, rgba(80,55,30,0.4), transparent 70%)", filter:"blur(12px)" }} />
 <div className="relative w-full h-full rounded-[10px] overflow-hidden shadow-[0_24px_50px_rgba(80,55,30,0.30)]">
 {/* base cover */}
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,#DCDCDC 0%,#A8A8A8 60%,#5E5E5E 100%)" }} />
 <img
 src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=70&auto=format&fit=crop"
 alt=""
 className="absolute inset-0 w-full h-full object-cover mix-blend-soft-light opacity-70 blur-[2px]"
 />
 {/* desaturate / dim layer */}
 <div className="absolute inset-0 bg-[#1F140A]/35 backdrop-blur-[2px]" />
 {/* faded title */}
 <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
 <div className="text-[8px] tracking-[0.32em] uppercase text-white/55">Augusto Cury</div>
 <div style={serif} className="mt-2 text-[16px] leading-[1.05] uppercase text-white/70">O Código<br/>da Inteligência</div>
 </div>
 </div>

 {/* lock badge */}
 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
 <div className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_12px_28px_rgba(0,0,0,0.30)] border border-white/20" style={{ background:"linear-gradient(135deg,#3A2818,#1F140A)" }}>
 <LockBig/>
 </div>
 </div>
 </div>
 </div>

 {/* Title */}
 <div className="relative z-20 px-7 text-center fade-up">
 <p className="text-[10px] uppercase tracking-[0.3em] text-[#A88860] font-semibold flex items-center justify-center gap-1.5"><Calendar/> Disponível em {days} dias</p>
 <h1 style={serif} className="mt-3 text-[28px] leading-[1.05] text-[#1F1A14]">
 Esse conhecimento<br/>
 <span className="italic" style={{ color:"#C28A3E" }}>chega no momento certo.</span>
 </h1>
 <p className="mt-3 text-[12.5px] text-[#5C4E42] leading-relaxed max-w-[300px] mx-auto">
 Sua jornada respeita o seu tempo. Continue evoluindo — esse livro será desbloqueado para você em breve.
 </p>
 </div>

 {/* Countdown card */}
 <div className="relative z-20 px-5 mt-6 fade-up">
 <div className="rounded-2xl bg-white/85 backdrop-blur border border-white/80 p-5 shadow-[0_14px_32px_rgba(0,0,0,0.10)]">
 <div className="flex items-center justify-between mb-3">
 <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#8A7868]">Liberação programada</p>
 <span className="text-[10.5px] text-[#C28A3E] font-semibold">27 mai · 2026</span>
 </div>
 <div className="flex items-end justify-between">
 <div>
 <div style={serif} className="text-[44px] leading-none text-[#1F1A14] tabular-nums">{days}</div>
 <div className="text-[10px] uppercase tracking-[0.22em] text-[#8A7868] mt-1">dias restantes</div>
 </div>
 <div className="flex-1 ml-5">
 <div className="h-[6px] rounded-full bg-[#F0E4D2] overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${dayProgress}%`, background:"linear-gradient(90deg,#FFD7B0,#C28A3E)", boxShadow:"0 0 12px rgba(194,138,62,0.45)" }}/>
 </div>
 <div className="mt-2 flex items-center justify-between text-[10px] text-[#8A7868]">
 <span>Ciclo 02</span>
 <span className="tabular-nums">{Math.round(dayProgress)}%</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Subscription progress */}
 <div className="relative z-20 px-5 mt-4 fade-up">
 <div className="rounded-2xl bg-white/70 border border-[#EFE3D5] p-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-[0_8px_18px_rgba(248,138,43,0.35)]" style={{ background:"linear-gradient(135deg,#FFA158,#F88A2B)" }}>
 <Spark s={14}/>
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-[12.5px] font-semibold text-[#1F1A14]">Assinatura Premium</div>
 <div className="text-[10.5px] text-[#8A7868] mt-0.5">3 de 7 livros desbloqueados</div>
 </div>
 <button className="text-[11px] text-[#F88A2B] font-semibold flex items-center gap-1">Detalhes <ArrowR s={11}/></button>
 </div>
 <div className="mt-3 grid grid-cols-7 gap-1.5">
 {Array.from({ length: 7 }).map((_, i) => (
 <div key={i} className="h-1.5 rounded-full" style={{ background: i < 3 ?"linear-gradient(90deg,#FFB36B,#F88A2B)" :"#EADFD2" }}/>
 ))}
 </div>
 </div>
 </div>

 {/* Próximos livros */}
 <div className="relative z-20 px-5 mt-6 pb-3 flex items-center justify-between">
 <h2 style={serif} className="text-[18px] text-[#1F1A14]">Próximos livros</h2>
 <span className="text-[10.5px] text-[#8A7868]">na sua jornada</span>
 </div>
 <div className="relative z-20 pl-5 pb-6">
 <div className="flex gap-3 overflow-x-auto no-scrollbar pr-5">
 {NEXT.map((b, i) => (
 <div key={b.id} className="shrink-0 w-[140px] fade-up" style={{ animationDelay: `${i * 60}ms` }}>
 <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-[0_10px_22px_rgba(80,55,30,0.20)]">
 <div className="absolute inset-0" style={{ background: b.cover }}/>
 <img src={b.bg} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-soft-light opacity-60 blur-[1.5px]"/>
 <div className="absolute inset-0 bg-[#1F140A]/35 backdrop-blur-[1px]"/>
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-9 h-9 rounded-full bg-[#1F140A]/70 backdrop-blur border border-white/15 flex items-center justify-center text-white">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
 </div>
 </div>
 <div className="absolute bottom-2 left-2 right-2 text-center">
 <div className="inline-flex items-center gap-1 text-[9.5px] text-white/95 bg-black/40 backdrop-blur px-2 py-0.5 rounded-full"><Clock/> {b.days}d</div>
 </div>
 </div>
 <h4 style={serif} className="mt-2 text-[12.5px] leading-[1.2] text-[#1F1A14] line-clamp-2">{b.title}</h4>
 </div>
 ))}
 </div>
 </div>

 {/* Quote */}
 <div className="relative z-20 px-6 pb-5 fade-up">
 <p style={serif} className="text-center text-[15px] leading-[1.4] italic text-[#5C4E42]">
 “A pressa é inimiga da sabedoria. Cada livro chega na hora em que você está pronto para recebê-lo.”
 </p>
 <p className="mt-2 text-center text-[10.5px] text-[#C28A3E] tracking-[0.22em] uppercase">— Augusto Cury</p>
 </div>

 {/* CTAs */}
 <div className="relative z-20 px-6 pb-10 fade-up">
 <Link
 to="/biblioteca"
 className="flex items-center justify-center gap-2 h-13 py-3.5 rounded-full text-white text-[13px] font-semibold shadow-[0_16px_34px_rgba(248,138,43,0.40)]"
 style={{ background:"linear-gradient(135deg,#FFA158 0%,#F88A2B 100%)" }}
 >
 Continuar evoluindo <ArrowR s={13}/>
 </Link>
 <button className="mt-3 w-full h-12 rounded-full bg-white border border-[#EADFD2] text-[#1F1A14] text-[12.5px] font-medium flex items-center justify-center gap-2">
 <Bell/> Avise-me quando liberar
 </button>
 </div>
 </div>
 </div>
   </AppUserLayout>
 );
}
