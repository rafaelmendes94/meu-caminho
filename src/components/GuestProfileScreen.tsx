import { Link } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const Chev = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>);
const Share = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>);
const Verified = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="#F88A2B"><path d="M12 1l2.5 2.5L18 3l1 3.5L22 8l-1 3.5L22 15l-3 1.5L18 20l-3.5-.5L12 22l-2.5-2.5L6 20l-1-3.5L2 15l1-3.5L2 8l3-1.5L6 3l3.5.5L12 1z"/><path d="M9.5 12.2l1.8 1.8L15 10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>);
const Play = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l13 7-13 7V5z"/></svg>);
const ArrowR = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>);
const Quote = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v4H8c0 2 1 3 3 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 3 3v3c-3 0-5-2-5-5V7z"/></svg>);
const Spark = ({ size = 12 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/></svg>);

const PODCASTS = [
 { id:"p1", title:"O que separa quem faz de quem só sonha", duration:"42 min", img:"https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=70&auto=format&fit=crop", to:"/player/podcast" },
 { id:"p2", title:"Disciplina é a nova liberdade", duration:"38 min", img:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=70&auto=format&fit=crop", to:"/player/podcast" },
 { id:"p3", title:"Treinar a mente como atleta de elite", duration:"51 min", img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70&auto=format&fit=crop", to:"/player/podcast" },
];

const VIDEOS = [
 { id:"v1", title:"5h da manhã: o ritual que mudou tudo", duration:"6 min", img:"https://images.unsplash.com/photo-1499346030926-9a72daac6c63?w=600&q=70&auto=format&fit=crop", to:"/conteudo/video" },
 { id:"v2", title:"A coragem de quem começa de novo", duration:"4 min", img:"https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=70&auto=format&fit=crop", to:"/conteudo/video" },
];

const REFLECTIONS = [
 { id:"r1", text:"Não existe motivação sem direção. Encontre seu porquê antes de buscar como.", t:"linear-gradient(135deg,#FFE3C7,#F8C892)" },
 { id:"r2", text:"Você não precisa ser o mais talentoso. Precisa ser o mais consistente.", t:"linear-gradient(135deg,#F4E3D7,#E9C9B0)" },
];

export default function GuestProfileScreen() {
  const al = useAudienceLink();
 return (
   <AppUserLayout>
 <div className="min-h-screen w-full flex items-start justify-center bg-[#EDE7E1] p-0 sm:p-6">
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
 @keyframes fade-up { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
 @keyframes pulse-soft { 0%,100% { opacity: .55 } 50% { opacity: .95 } }
 @keyframes ken { 0% { transform: scale(1.04) } 100% { transform: scale(1.12) } }
 .fade-up { animation: fade-up .6s ease both }
 .ken { animation: ken 16s ease-in-out infinite alternate }
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
 {/* HERO cinematográfico */}
 <div className="relative w-full h-[480px] overflow-hidden">
 <img
 src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80&auto=format&fit=crop"
 alt=""
 className="absolute inset-0 w-full h-full object-cover ken"
 />
 {/* layered gradient */}
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(15,8,2,0.55) 0%, rgba(15,8,2,0.0) 30%, rgba(15,8,2,0.4) 60%, rgba(239,230,220,1) 100%)" }} />
 <div className="absolute inset-0" style={{ background:"radial-gradient(80% 60% at 80% 100%, rgba(248,138,43,0.30), transparent 60%)" }} />
 {/* glow */}
 <div className="absolute -bottom-16 -left-10 w-[280px] h-[280px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.45), transparent 70%)", filter:"blur(20px)", animation:"pulse-soft 8s ease-in-out infinite" }} />

 {/* status bar (transparent) */}
 {/* header */}
 <div className="relative z-20 px-5 pt-1 flex items-center justify-between text-white">
 <Link to={al("/feed")} className="w-9 h-9 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center"><Chev/></Link>
 <div className="text-[10.5px] tracking-[0.28em] text-white/85 uppercase flex items-center gap-1.5"><Spark size={11}/> Convidado</div>
 <button className="w-9 h-9 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center"><Share/></button>
 </div>

 {/* hero copy */}
 <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 z-20 text-white">
 <p className="text-[10px] uppercase tracking-[0.28em] text-white/75">Convidado especial</p>
 <h1 style={serif} className="mt-2 text-[40px] leading-[0.95]">
 Joel <span className="italic" style={{ color:"#FFD7B0" }}>Jota</span>
 </h1>
 <div className="mt-2 flex items-center gap-2 text-white/85 text-[12px]">
 <span>Mentor de alta performance</span>
 <Verified />
 </div>
 </div>
 </div>

 {/* Action bar */}
 <div className="relative z-20 -mt-6 mx-5 mb-4 fade-up">
 <div className="rounded-2xl bg-white/95 backdrop-blur border border-white/80 px-4 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.10)] flex items-center gap-3">
 <div className="flex-1 grid grid-cols-3 gap-2 text-center">
 {[
 { n:"24", l:"conteúdos" },
 { n:"8", l:"podcasts" },
 { n:"412k", l:"ouvintes" },
 ].map((s, i) => (
 <div key={s.l} className={`${i < 2 ?"border-r border-[#EADFD2]" :""}`}>
 <div style={serif} className="text-[18px] text-[#1F1A16]">{s.n}</div>
 <div className="text-[9.5px] uppercase tracking-[0.18em] text-[#8A7868] mt-0.5">{s.l}</div>
 </div>
 ))}
 </div>
 </div>
 <div className="mt-3 flex gap-2">
 <button className="flex-1 h-12 rounded-full text-white text-[12.5px] font-semibold flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(248,138,43,0.38)]" style={{ background:"linear-gradient(135deg,#FFA158,#F88A2B)" }}>
 <Play s={13}/> Ouvir agora
 </button>
 <button className="h-12 px-5 rounded-full bg-white border border-[#EADFD2] text-[#1F1A16] text-[12.5px] font-semibold">Seguir</button>
 </div>
 </div>

 {/* Bio emocional */}
 <div className="relative z-20 px-6 pb-6 fade-up">
 <p className="text-[10px] uppercase tracking-[0.28em] text-[#F88A2B] font-semibold">Sobre</p>
 <p style={serif} className="mt-3 text-[22px] leading-[1.2] text-[#1F1A16] italic">
 “Foco, fé e fome de evolução. Acredito que a mente bem treinada é a maior vantagem que existe.”
 </p>
 <p className="mt-4 text-[13px] text-[#5C4E42] leading-[1.7]">
 Joel Jota é mentor de alta performance e formou atletas olímpicos, executivos e empreendedores. Aqui no <em>Meu Caminho</em>, divide reflexões sobre disciplina, propósito e a coragem de viver com intensidade.
 </p>
 <button className="mt-3 text-[11.5px] text-[#F88A2B] font-semibold flex items-center gap-1">Ler biografia completa <ArrowR s={12}/></button>
 </div>

 {/* divider editorial */}
 <div className="relative z-20 px-6 pb-6">
 <div className="flex items-center gap-3">
 <div className="h-px flex-1 bg-[#E2D5C3]"/>
 <Spark size={12}/>
 <div className="h-px flex-1 bg-[#E2D5C3]"/>
 </div>
 </div>

 {/* Featured episode */}
 <div className="relative z-20 px-5 pb-5 fade-up">
 <p className="text-[10px] uppercase tracking-[0.28em] text-[#F88A2B] font-semibold mb-2.5">Em destaque</p>
 <Link to={al("/player/podcast")} className="block relative rounded-[24px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.18)] group">
 <div className="relative h-[200px]">
 <img src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=900&q=75&auto=format&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, transparent 30%, rgba(15,8,2,0.92))" }} />
 <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.40), transparent 70%)", filter:"blur(18px)" }} />
 <span className="absolute top-4 left-4 text-[9.5px] uppercase tracking-[0.22em] px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-white border border-white/25">Podcast · 42 min</span>
 <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
 <h3 style={serif} className="text-[22px] leading-[1.1]">A conversa que todo jovem precisa ouvir</h3>
 <div className="mt-3 flex items-center gap-3">
 <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#1F1A16] shadow-[0_8px_20px_rgba(0,0,0,0.35)]"><Play s={16}/></div>
 <div className="text-[11px] text-white/80">Joel Jota & Augusto Cury</div>
 </div>
 </div>
 </div>
 </Link>
 </div>

 {/* Podcasts */}
 <div className="relative z-20 px-5 pb-2 flex items-center justify-between">
 <h2 style={serif} className="text-[18px]">Podcasts</h2>
 <button className="text-[11px] uppercase tracking-[0.18em] text-[#F88A2B]">Ver todos</button>
 </div>
 <div className="relative z-20 pl-5 pb-6">
 <div className="flex gap-3 overflow-x-auto no-scrollbar pr-5">
 {PODCASTS.map((p, i) => (
 <Link key={p.id} to={p.to} className="shrink-0 w-[170px] rounded-2xl overflow-hidden bg-white border border-[#EFE3D5] shadow-[0_10px_22px_rgba(0,0,0,0.08)] fade-up" style={{ animationDelay: `${i * 50}ms` }}>
 <div className="relative h-[170px]">
 <img src={p.img} alt="" className="w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55))" }} />
 <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-[#1F1A16]"><Play s={13}/></div>
 <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.16em] text-white/95 bg-black/35 backdrop-blur px-2 py-0.5 rounded-full">{p.duration}</span>
 </div>
 <div className="px-3 py-3">
 <h4 style={serif} className="text-[14px] leading-[1.2] text-[#1F1A16] line-clamp-2 min-h-[34px]">{p.title}</h4>
 </div>
 </Link>
 ))}
 </div>
 </div>

 {/* Videos */}
 <div className="relative z-20 px-5 pb-2 flex items-center justify-between">
 <h2 style={serif} className="text-[18px]">Vídeos</h2>
 <button className="text-[11px] uppercase tracking-[0.18em] text-[#F88A2B]">Ver todos</button>
 </div>
 <div className="relative z-20 px-5 pb-6 grid grid-cols-2 gap-3">
 {VIDEOS.map((v, i) => (
 <Link key={v.id} to={v.to} className="rounded-2xl overflow-hidden bg-white border border-[#EFE3D5] shadow-[0_10px_22px_rgba(0,0,0,0.08)] fade-up" style={{ animationDelay: `${i * 60}ms` }}>
 <div className="relative h-[160px]">
 <img src={v.img} alt="" className="w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.6))" }} />
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-[#1F1A16]"><Play s={14}/></div>
 </div>
 <span className="absolute bottom-2 right-2 text-[10px] tabular-nums text-white/95 bg-black/45 backdrop-blur px-1.5 py-0.5 rounded">{v.duration}</span>
 </div>
 <div className="px-3 py-2.5">
 <h4 style={serif} className="text-[13.5px] leading-[1.2] text-[#1F1A16] line-clamp-2">{v.title}</h4>
 </div>
 </Link>
 ))}
 </div>

 {/* Reflexões */}
 <div className="relative z-20 px-5 pb-2">
 <h2 style={serif} className="text-[18px]">Reflexões</h2>
 </div>
 <div className="relative z-20 px-5 pb-8 space-y-3">
 {REFLECTIONS.map((r, i) => (
 <div key={r.id} className="fade-up rounded-2xl p-5 border border-[#EFE3D5] shadow-[0_8px_22px_rgba(0,0,0,0.06)]" style={{ background: r.t, animationDelay: `${i * 60}ms` }}>
 <div className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-[#F88A2B] mb-2"><Quote/></div>
 <p style={serif} className="text-[18px] leading-[1.35] text-[#3A2E24] italic">“{r.text}”</p>
 <p className="mt-3 text-[11px] text-[#5C4E42]/80">— Joel Jota</p>
 </div>
 ))}
 </div>

 {/* Editorial closing */}
 <div className="relative z-20 px-5 pb-32 fade-up">
 <div className="rounded-[24px] p-6 text-white relative overflow-hidden" style={{ background:"linear-gradient(135deg,#2E2218,#1A130C)" }}>
 <div className="absolute -top-12 -right-10 w-[200px] h-[200px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.35), transparent 70%)", filter:"blur(20px)" }} />
 <p className="text-[10px] uppercase tracking-[0.28em] text-[#F8B07A]">Próximo encontro</p>
 <p style={serif} className="mt-3 text-[22px] leading-[1.2]">
 Joel Jota e Augusto Cury, em <span className="italic" style={{ color:"#FFD7B0" }}>conversa inédita</span>.
 </p>
 <button className="mt-5 h-11 px-6 rounded-full bg-white text-[#1F1A16] text-[12.5px] font-semibold inline-flex items-center gap-2">
 Ativar lembrete <ArrowR s={13}/>
 </button>
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
