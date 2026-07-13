import { Link } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const Close = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>);
const Share = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>);
const Play = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l13 7-13 7V5z"/></svg>);
const ArrowR = ({ s = 13 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>);
const Check = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>);
const Sparkle = ({ s = 10 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/></svg>);

// Light particles
const Particles = () => (
 <div className="pointer-events-none absolute inset-0 overflow-hidden">
 {Array.from({ length: 22 }).map((_, i) => {
 const left = (i * 47) % 100;
 const top = (i * 73) % 100;
 const delay = (i % 7) * 0.6;
 const size = 2 + ((i * 3) % 4);
 return (
 <span
 key={i}
 className="absolute rounded-full"
 style={{
 left: `${left}%`,
 top: `${top}%`,
 width: size,
 height: size,
 background: i % 3 === 0 ?"#FFE3B0" :"#FFF3DC",
 opacity: 0.55,
 filter:"blur(0.5px)",
 boxShadow:"0 0 10px rgba(255,200,120,0.55)",
 animation: `drift ${10 + (i % 5)}s ease-in-out ${delay}s infinite`,
 }}
 />
 );
 })}
 </div>
);

export default function BookUnlockedScreen() {
 return (
 <div className="min-h-screen w-full flex items-start justify-center bg-[#0A0703] p-0 sm:p-6">
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
 @keyframes fade-up { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
 @keyframes glow-pulse { 0%,100% { opacity: .55; transform: scale(1) } 50% { opacity: .95; transform: scale(1.05) } }
 @keyframes float-cover { 0%,100% { transform: translateY(0) rotate(-1.5deg) } 50% { transform: translateY(-8px) rotate(-1.5deg) } }
 @keyframes drift { 0%,100% { transform: translate(0,0); opacity: .25 } 50% { transform: translate(8px,-14px); opacity: .8 } }
 @keyframes shine { 0% { transform: translateX(-120%) skewX(-20deg) } 100% { transform: translateX(220%) skewX(-20deg) } }
 @keyframes seal-in { 0% { opacity: 0; transform: scale(0.6) rotate(-15deg) } 60% { opacity: 1; transform: scale(1.08) rotate(-12deg) } 100% { opacity: 1; transform: scale(1) rotate(-12deg) } }
 .fade-up { animation: fade-up .7s ease both }
 .float-cover { animation: float-cover 6s ease-in-out infinite }
 .seal-in { animation: seal-in .8s cubic-bezier(.2,.8,.3,1) both }
 .shine::after { content:''; position:absolute; inset:0; background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%); animation: shine 4s ease-in-out infinite; }
 `}</style>

 <div
 className="relative w-[375px] min-h-[100dvh] h-screen overflow-y-auto overflow-x-hidden text-white"
 style={{
 fontFamily:"'Montserrat', system-ui, sans-serif",
 background:
"radial-gradient(120% 80% at 50% 0%, #2B1808 0%, #160B04 45%, #0A0502 100%)",
 }}
 >
 {/* atmospheric golden glow */}
 <div className="pointer-events-none absolute top-[120px] left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(255,184,90,0.55), transparent 70%)", filter:"blur(28px)", animation:"glow-pulse 6s ease-in-out infinite" }} />
 <div className="pointer-events-none absolute -top-10 -right-20 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.35), transparent 70%)", filter:"blur(26px)" }} />
 <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[260px]" style={{ background:"linear-gradient(180deg, transparent, rgba(248,138,43,0.10) 60%, rgba(248,138,43,0.18))" }} />

 <Particles />

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 px-5 pt-1 pb-2 flex items-center justify-between">
 <Link to="/biblioteca" className="w-9 h-9 rounded-full bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center text-white/90"><Close/></Link>
 <div className="text-[10px] tracking-[0.3em] text-white/55 uppercase flex items-center gap-1.5"><Sparkle/> Conquista</div>
 <button className="w-9 h-9 rounded-full bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center text-white/90"><Share/></button>
 </div>

 {/* Eyebrow */}
 <div className="relative z-20 px-6 pt-3 text-center fade-up">
 <p className="text-[10px] uppercase tracking-[0.32em] text-[#F8B05A] font-semibold">Novo capítulo da sua jornada</p>
 </div>

 {/* Cover */}
 <div className="relative z-20 mt-7 mb-7 flex items-center justify-center">
 {/* halo */}
 <div className="absolute w-[290px] h-[290px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(255,200,120,0.55), transparent 70%)", filter:"blur(20px)", animation:"glow-pulse 5s ease-in-out infinite" }} />
 <div className="absolute w-[230px] h-[230px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(255,232,180,0.35), transparent 70%)", filter:"blur(14px)" }} />

 {/* book cover */}
 <div className="relative w-[200px] aspect-[3/4] float-cover">
 {/* shadow under */}
 <div className="absolute -bottom-6 left-4 right-4 h-10 rounded-full" style={{ background:"radial-gradient(closest-side, rgba(0,0,0,0.7), transparent 70%)", filter:"blur(14px)" }} />

 {/* spine */}
 <div className="absolute -left-1.5 top-1.5 bottom-1.5 w-2 rounded-l-md" style={{ background:"linear-gradient(180deg,#3A1E0C,#1B0E05)" }} />

 <div className="relative w-full h-full rounded-[10px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.55),0_0_40px_rgba(255,180,100,0.35)] shine">
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,#FBE7C7 0%,#F5C786 50%,#C25A2A 100%)" }} />
 {/* imagem de capa removida — sem dado real */}
 <div className="absolute inset-0 p-3 flex flex-col items-center text-center">
 <div className="text-[9px] tracking-[0.32em] uppercase font-semibold mt-1.5" style={{ color:"#5B2A12" }}>—</div>
 <div style={serif} className="mt-7 text-[18px] leading-[1.05] font-semibold uppercase" >
 <span style={{ color:"#5B2A12" }}>Novo livro</span>
 </div>
 <div className="mt-2 w-10 h-px bg-[#5B2A12]/40"/>
 </div>
 {/* gold edge */}
 <div className="absolute inset-y-0 right-0 w-1.5" style={{ background:"linear-gradient(180deg,#FFE6B0,#C28A3E,#FFE6B0)" }} />
 </div>

 {/* Liberado seal */}
 <div className="absolute -top-3 -right-4 seal-in">
 <div
 className="relative w-[78px] h-[78px] rounded-full flex flex-col items-center justify-center text-center text-[#3A1E0C] shadow-[0_14px_30px_rgba(0,0,0,0.5),0_0_30px_rgba(255,200,120,0.55)]"
 style={{ background:"radial-gradient(circle at 30% 25%, #FFF3D6, #F5C77A 55%, #C28A3E 100%)" }}
 >
 <Sparkle s={11}/>
 <div style={serif} className="text-[12px] leading-none mt-0.5 font-bold tracking-wider">LIBERADO</div>
 <div className="text-[7.5px] uppercase tracking-[0.2em] mt-1 opacity-80">—</div>
 <div className="absolute inset-0 rounded-full border border-[#FFE3A8]/60"/>
 </div>
 </div>
 </div>
 </div>

 {/* Title block */}
 <div className="relative z-20 px-7 text-center fade-up">
 <h1 style={serif} className="text-[30px] leading-[1.05]">
 Um novo livro<br/>
 <span className="italic" style={{ color:"#F8B05A" }}>foi desbloqueado.</span>
 </h1>
 <p className="mt-3.5 text-[12.5px] text-white/70 leading-relaxed max-w-[300px] mx-auto">
 Um novo título foi liberado na sua biblioteca.
 </p>
 </div>

 {/* Citação removida — sem atribuição real */}

 {/* Progress journey */}
 <div className="relative z-20 px-6 mt-6 fade-up">
 <div className="flex items-center justify-between mb-3">
 <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">Sua jornada</p>
 <p className="text-[10.5px] text-white/70 tabular-nums">—</p>
 </div>
 <div className="relative h-[6px] rounded-full bg-white/10 overflow-hidden">
 <div className="absolute inset-y-0 left-0 rounded-full" style={{ width:"0%", background:"linear-gradient(90deg,#FFE3B0,#F8B05A,#F88A2B)", boxShadow:"0 0 14px rgba(248,176,90,0.65)" }}/>
 </div>
 <div className="mt-3 flex items-center justify-between">
 {[1,2,3,4,5,6,7].map((n) => {
 const done = false;
 return (
   <AppUserLayout>
 <div key={n} className="flex flex-col items-center gap-1">
 <div
 className={`w-6 h-6 rounded-full flex items-center justify-center text-[#1F140A] ${done ?"" :"bg-white/10 text-white/40"}`}
 style={done ? { background:"linear-gradient(135deg,#FFE3B0,#F8B05A)", boxShadow: n === 3 ?"0 0 14px rgba(248,176,90,0.7)" : undefined } : undefined}
 >
 {done ? <Check/> : <span className="text-[10px]">{n}</span>}
 </div>
 </div>
   </AppUserLayout>
 );
 })}
 </div>
 </div>

 {/* Stats inline */}
 <div className="relative z-20 px-6 mt-6 fade-up">
 <div className="grid grid-cols-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm py-3">
 {[
 { n:"—", l:"duração" },
 { n:"—", l:"capítulos" },
 { n:"—", l:"este mês" },
 ].map((s, i) => (
 <div key={s.l} className={`text-center ${i < 2 ?"border-r border-white/10" :""}`}>
 <div style={serif} className="text-[16px] text-white">{s.n}</div>
 <div className="text-[9.5px] uppercase tracking-[0.18em] text-white/55 mt-0.5">{s.l}</div>
 </div>
 ))}
 </div>
 </div>

 {/* CTAs */}
 <div className="relative z-20 px-6 mt-7 pb-10 fade-up">
 <Link
 to="/biblioteca/leitor?livro=vendedor"
 className="relative flex items-center justify-center gap-2 h-13 py-3.5 rounded-full text-[#1F140A] text-[13px] font-semibold overflow-hidden"
 style={{
 background:"linear-gradient(135deg,#FFE3B0 0%,#F8B05A 50%,#F88A2B 100%)",
 boxShadow:"0 18px 38px rgba(248,138,43,0.45), 0 0 24px rgba(255,200,120,0.35)",
 }}
 >
 <Play s={13}/> Começar leitura <ArrowR s={13}/>
 </Link>
 <button className="mt-3 w-full h-12 rounded-full bg-white/[0.06] border border-white/15 text-white/85 text-[12.5px] font-medium backdrop-blur">
 Ouvir audiolivro
 </button>
 <button className="mt-3.5 w-full text-center text-[11.5px] text-white/55">
 Ver na biblioteca
 </button>
 </div>
 </div>
 </div>
 );
}
