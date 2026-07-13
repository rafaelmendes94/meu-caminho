import { Link } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const Chev = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>);
const ArrowR = ({ s = 16 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>);
const Spark = ({ size = 12 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/></svg>);
const Play = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l13 7-13 7V5z"/></svg>);

type Campaign = {
 id: string;
 badge: string;
 title: string;
 italic?: string;
 subtitle: string;
 img: string;
 accent: string;
 glow: string;
 pieces: number;
 duration: string;
 to: string;
};

// Campanhas reais serão carregadas via CMS (marketing_campaigns) em integração futura.
const HERO: Campaign | null = null;
const CAMPAIGNS: Campaign[] = [];
const PAST: { id: string; title: string; img: string; count: string }[] = [];

export default function CampaignsScreen() {
 return (
   <AppUserLayout>
 <div className="min-h-screen w-full flex items-start justify-center bg-[#EDE7E1] p-0 sm:p-6">
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
 @keyframes fade-up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
 @keyframes pulse-soft { 0%,100% { opacity: .55 } 50% { opacity: .95 } }
 @keyframes float-a { 0%,100% { transform: translate(0,0) } 50% { transform: translate(8px,-12px) } }
 @keyframes ken-burns { 0% { transform: scale(1.04) translate(0,0) } 100% { transform: scale(1.12) translate(-8px,-6px) } }
 .fade-up { animation: fade-up .6s ease both }
 .ken { animation: ken-burns 18s ease-in-out infinite alternate }
 .no-scrollbar::-webkit-scrollbar { display: none }
 .no-scrollbar { scrollbar-width: none }
 `}</style>

 <div
 className="relative w-[375px] min-h-[812px] overflow-hidden text-[#1F1A16]"
 style={{
 fontFamily:"'Montserrat', system-ui, sans-serif",
 background:"radial-gradient(120% 70% at 0% 0%, #FFF8F3 0%, #F7F1EA 45%, #EFE6DC 100%)",
 }}
 >
 {/* atmospheric glows */}
 <div className="pointer-events-none absolute -top-24 -left-20 w-[320px] h-[320px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.20), transparent 70%)", filter:"blur(22px)", animation:"pulse-soft 8s ease-in-out infinite" }} />
 <div className="pointer-events-none absolute top-1/3 -right-20 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(232,180,58,0.18), transparent 70%)", filter:"blur(22px)", animation:"float-a 12s ease-in-out infinite" }} />

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 px-5 pt-1 pb-3 flex items-center justify-between">
 <Link to="/feed" className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.05)]"><Chev/></Link>
 <div className="text-[12px] tracking-[0.22em] text-[#8A7868] uppercase">Movimentos</div>
 <div className="w-9 h-9"/>
 </div>

 {/* Title */}
 <div className="relative z-20 px-6 pt-2 pb-5 fade-up">
 <p className="text-[10.5px] uppercase tracking-[0.28em] text-[#F88A2B] font-semibold flex items-center gap-1.5"><Spark size={11}/> Campanhas especiais</p>
 <h1 style={serif} className="text-[34px] leading-[1.05] mt-3">
 Movimentos que<br/><span className="italic text-[#F88A2B]">tocam a alma</span>
 </h1>
 <p className="mt-2.5 text-[13px] text-[#7A6A5C] leading-relaxed max-w-[290px]">
 Experiências emocionais sazonais, criadas para acompanhar você nas datas que importam.
 </p>
 </div>

 {/* HERO cinematic */}
 <div className="relative z-20 px-5 pb-6 fade-up">
 <Link to={HERO.to} className="block relative rounded-[28px] overflow-hidden shadow-[0_22px_50px_rgba(0,0,0,0.22)] group">
 <div className="relative h-[440px]">
 <img src={HERO.img} alt="" className="absolute inset-0 w-full h-full object-cover ken" />
 {/* layered gradients */}
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(20,12,4,0.35) 0%, rgba(20,12,4,0.0) 35%, rgba(20,12,4,0.4) 65%, rgba(15,8,2,0.92) 100%)" }} />
 <div className="absolute inset-0" style={{ background:"radial-gradient(80% 60% at 80% 100%, rgba(248,138,43,0.35), transparent 60%)" }} />
 {/* glow */}
 <div className="absolute -bottom-16 -left-10 w-[280px] h-[280px] rounded-full" style={{ background: `radial-gradient(closest-side, ${HERO.glow}, transparent 70%)`, filter:"blur(20px)" }} />

 {/* top badge */}
 <div className="absolute top-5 left-5 flex items-center gap-2">
 <span className="text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-white border border-white/25">{HERO.badge}</span>
 </div>
 <div className="absolute top-5 right-5">
 <span className="text-[10px] uppercase tracking-[0.18em] text-white/85">{HERO.duration}</span>
 </div>

 {/* editorial copy */}
 <div className="absolute bottom-0 left-0 right-0 p-6">
 <p className="text-[10.5px] uppercase tracking-[0.28em] text-white/70">Movimento 2026</p>
 <h2 style={serif} className="text-white text-[44px] leading-[0.95] mt-2">
 {HERO.title}<br/><span className="italic" style={{ color:"#FFD7B0" }}>{HERO.italic}</span>
 </h2>
 <p className="mt-3 text-[12.5px] text-white/85 leading-relaxed max-w-[280px]">
 {HERO.subtitle}
 </p>

 <div className="mt-5 flex items-center gap-3">
 <button className="flex-1 h-12 rounded-full text-[#1F1A16] text-[12.5px] font-semibold bg-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] flex items-center justify-center gap-2">
 <Play s={13}/> Entrar no movimento
 </button>
 <button className="w-12 h-12 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white flex items-center justify-center"><ArrowR/></button>
 </div>

 <div className="mt-4 flex items-center gap-4 text-[10.5px] text-white/70">
 <span>{HERO.pieces} reflexões</span>
 <span className="w-1 h-1 rounded-full bg-white/40"/>
 <span>Augusto Cury</span>
 <span className="w-1 h-1 rounded-full bg-white/40"/>
 <span>Áudio · vídeo · leitura</span>
 </div>
 </div>
 </div>
 </Link>
 </div>

 {/* Section */}
 <div className="relative z-20 px-5 pb-3 flex items-center justify-between">
 <h2 style={serif} className="text-[20px]">Próximos movimentos</h2>
 <button className="text-[11px] uppercase tracking-[0.18em] text-[#F88A2B]">Ver tudo</button>
 </div>

 {/* Editorial cards */}
 <div className="relative z-20 px-5 space-y-4 pb-6">
 {CAMPAIGNS.map((c, i) => (
 <Link key={c.id} to={c.to} className="block fade-up rounded-[24px] overflow-hidden bg-white border border-[#EFE3D5] shadow-[0_12px_28px_rgba(0,0,0,0.10)] group" style={{ animationDelay: `${i * 70}ms` }}>
 <div className="relative h-[200px]">
 <img src={c.img} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(15,8,2,0.85) 100%)" }} />
 <div className="absolute -bottom-10 -right-8 w-[180px] h-[180px] rounded-full" style={{ background: `radial-gradient(closest-side, ${c.glow}, transparent 70%)`, filter:"blur(16px)" }} />

 <div className="absolute top-4 left-4 flex items-center gap-2">
 <span className="text-[9.5px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-white border border-white/25">{c.badge}</span>
 </div>
 <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.18em] text-white/80">{c.duration}</div>

 <div className="absolute bottom-4 left-5 right-5">
 <h3 style={serif} className="text-white text-[28px] leading-[1]">
 {c.title} <span className="italic" style={{ color: c.accent ==="#5B8DB8" ?"#BFD8EC" : c.accent ==="#E8B43A" ?"#FFE8A8" : c.accent ==="#D87BA8" ?"#F8C9DD" :"#FFD7B0" }}>{c.italic}</span>
 </h3>
 </div>
 </div>
 <div className="px-5 py-4">
 <p className="text-[12.5px] text-[#5C4E42] leading-relaxed">{c.subtitle}</p>
 <div className="mt-3.5 flex items-center justify-between">
 <div className="flex items-center gap-2 text-[10.5px] text-[#8A7868]">
 <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.accent }}/>
 <span>{c.pieces} conteúdos</span>
 <span className="w-1 h-1 rounded-full bg-[#D9C8B5]"/>
 <span>Augusto Cury</span>
 </div>
 <span className="text-[#1F1A16]"><ArrowR s={16}/></span>
 </div>
 </div>
 </Link>
 ))}
 </div>

 {/* Editorial quote */}
 <div className="relative z-20 px-5 pb-6 fade-up">
 <div className="rounded-[24px] p-6 text-white relative overflow-hidden" style={{ background:"linear-gradient(135deg,#2E2218,#1A130C)" }}>
 <div className="absolute -top-12 -right-10 w-[200px] h-[200px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.35), transparent 70%)", filter:"blur(20px)" }} />
 <p className="text-[10px] uppercase tracking-[0.28em] text-[#F8B07A]">Manifesto</p>
 <p style={serif} className="mt-3 text-[22px] leading-[1.2] italic">
 “Cuidar das emoções é o ato mais corajoso de uma geração apressada.”
 </p>
 <p className="mt-3 text-[11px] text-white/60">— Augusto Cury</p>
 </div>
 </div>

 {/* Past campaigns horizontal */}
 <div className="relative z-20 px-5 pb-2">
 <h2 style={serif} className="text-[18px]">Movimentos anteriores</h2>
 </div>
 <div className="relative z-20 pl-5 pb-32">
 <div className="flex gap-3 overflow-x-auto no-scrollbar pr-5">
 {PAST.map((p) => (
 <button key={p.id} className="shrink-0 w-[150px] rounded-2xl overflow-hidden bg-white border border-[#EFE3D5] shadow-[0_8px_18px_rgba(0,0,0,0.06)] text-left">
 <div className="relative h-[100px]">
 <img src={p.img} alt="" className="w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5))" }} />
 <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.16em] text-white/95 bg-black/35 backdrop-blur px-2 py-0.5 rounded-full">Arquivo</span>
 </div>
 <div className="px-3 py-2.5">
 <div style={serif} className="text-[13.5px] text-[#1F1A16] leading-snug">{p.title}</div>
 <div className="text-[10px] text-[#8A7868] mt-0.5">{p.count}</div>
 </div>
 </button>
 ))}
 </div>
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
