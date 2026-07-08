import { useMemo, useState } from"react";
import { Link } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const Chev = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>);
const Search = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
const More = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>);
const Bookmark = ({ filled = true }: { filled?: boolean }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={filled ?"currentColor" :"none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>);
const Play = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l13 7-13 7V5z"/></svg>);
const Heart = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.8 6.6a5.5 5.5 0 0 0-9.3-2.4l-.5.5-.5-.5A5.5 5.5 0 1 0 2.7 12l8.3 8.3 8.3-8.3a5.5 5.5 0 0 0 1.5-5.4z"/></svg>);
const Quote = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v4H8c0 2 1 3 3 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 3 3v3c-3 0-5-2-5-5V7z"/></svg>);
const Plus = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>);
const Spark = ({ size = 12 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/></svg>);

const TABS = ["Tudo","Áudios","Vídeos","Leituras","Reflexões"] as const;
type Tab = typeof TABS[number];

type Item = {
 id: string;
 type:"audio" |"video" |"read" |"quote";
 title: string;
 meta: string;
 img?: string;
 duration?: string;
 to?: string;
 saved: string;
 tone?: string;
};

const ITEMS: Item[] = [
 { id:"a1", type:"audio", title:"A coragem de recomeçar", meta:"Áudio · Augusto Cury", img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70&auto=format&fit=crop", duration:"12 min", to:"/player/audio", saved:"Hoje" },
 { id:"v1", type:"video", title:"O território das emoções", meta:"Vídeo · 4 min", img:"https://images.unsplash.com/photo-1499346030926-9a72daac6c63?w=600&q=70&auto=format&fit=crop", duration:"4 min", to:"/conteudo/video", saved:"Hoje" },
 { id:"r1", type:"read", title:"Quando o silêncio fala mais alto", meta:"Leitura · 6 min", img:"https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=70&auto=format&fit=crop", duration:"6 min", to:"/conteudo/leitura", saved:"Ontem" },
 { id:"a2", type:"audio", title:"Treine sua mente para a paz", meta:"Áudio · 18 min", img:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=70&auto=format&fit=crop", duration:"18 min", to:"/player/audio", saved:"Ontem" },
 { id:"q1", type:"quote", title:"Quem ama, educa pelo exemplo, não pela exigência.", meta:"Reflexão guardada", saved:"3 dias", tone:"linear-gradient(135deg,#FFE3C7,#F8C892)" },
 { id:"v2", type:"video", title:"A arte de pensar antes de sentir", meta:"Vídeo · 7 min", img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70&auto=format&fit=crop", duration:"7 min", to:"/conteudo/video", saved:"5 dias" },
 { id:"r2", type:"read", title:"O preço invisível da pressa", meta:"Leitura · 8 min", img:"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=70&auto=format&fit=crop", duration:"8 min", to:"/conteudo/leitura", saved:"1 sem" },
 { id:"q2", type:"quote", title:"Sua mente não é uma prisão. É um jardim que pede cuidado diário.", meta:"Reflexão guardada", saved:"2 sem", tone:"linear-gradient(135deg,#F4E3D7,#E9C9B0)" },
];

type Playlist = { id: string; title: string; count: number; gradient: string; emoji: string };
const PLAYLISTS: Playlist[] = [
 { id:"p1", title:"Para acalmar a mente", count: 14, gradient:"linear-gradient(135deg,#FFD7B0,#F88A2B)", emoji:"🌿" },
 { id:"p2", title:"Antes de dormir", count: 9, gradient:"linear-gradient(135deg,#C9B5E8,#7E5BB8)", emoji:"🌙" },
 { id:"p3", title:"Reconstruir-se", count: 11, gradient:"linear-gradient(135deg,#F8B8A0,#D86B4A)", emoji:"✦" },
 { id:"p4", title:"Foco profundo", count: 7, gradient:"linear-gradient(135deg,#A8C8E0,#4A6E92)", emoji:"◐" },
];

export default function SavedContentScreen() {
 const [tab, setTab] = useState<Tab>("Tudo");
 const filtered = useMemo(() => {
 if (tab ==="Tudo") return ITEMS;
 const map: Record<Exclude<Tab,"Tudo">, Item["type"]> = {"Áudios":"audio","Vídeos":"video","Leituras":"read","Reflexões":"quote" };
 return ITEMS.filter((i) => i.type === map[tab]);
 }, [tab]);

 const empty = filtered.length === 0;

 return (
 <div className="min-h-screen w-full flex items-start justify-center bg-[#EDE7E1] p-0 sm:p-6">
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
 @keyframes fade-up { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
 @keyframes pulse-soft { 0%,100% { opacity: .5 } 50% { opacity: .9 } }
 @keyframes float-a { 0%,100% { transform: translate(0,0) } 50% { transform: translate(10px,-14px) } }
 .fade-up { animation: fade-up .5s ease both }
 .no-scrollbar::-webkit-scrollbar { display: none }
 .no-scrollbar { scrollbar-width: none }
 `}</style>

 <div
 className="relative w-[375px] min-h-[812px] overflow-hidden text-[#1F1A16]"
 style={{
 fontFamily:"'Montserrat', system-ui, sans-serif",
 background:
"radial-gradient(120% 70% at 0% 0%, #FFF8F3 0%, #F7F1EA 45%, #EFE6DC 100%)",
 }}
 >
 {/* Atmospheric glows */}
 <div className="pointer-events-none absolute -top-24 -left-20 w-[320px] h-[320px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.22), transparent 70%)", filter:"blur(20px)", animation:"pulse-soft 8s ease-in-out infinite" }} />
 <div className="pointer-events-none absolute top-1/3 -right-24 w-[280px] h-[280px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(196,148,98,0.20), transparent 70%)", filter:"blur(22px)", animation:"float-a 12s ease-in-out infinite" }} />
 <div className="pointer-events-none absolute bottom-10 left-10 w-[220px] h-[220px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(255,255,255,0.6), transparent 70%)", filter:"blur(18px)" }} />

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 px-5 pt-1 pb-3 flex items-center justify-between">
 <Link to="/perfil" className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.05)]"><Chev /></Link>
 <div className="text-[12px] tracking-[0.22em] text-[#8A7868] uppercase">Minha biblioteca</div>
 <button className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.05)]"><Search /></button>
 </div>

 {/* Title */}
 <div className="relative z-20 px-6 pt-2 pb-4 fade-up">
 <h1 style={serif} className="text-[34px] leading-[1.05] text-[#1F1A16]">
 Conteúdo<br/><span className="italic text-[#F88A2B]">guardado</span>
 </h1>
 <p className="mt-2 text-[13px] text-[#7A6A5C] leading-relaxed max-w-[280px]">
 Sua biblioteca emocional. Releia, reescute e volte sempre que precisar.
 </p>
 </div>

 {/* Stats strip */}
 <div className="relative z-20 px-5 pb-3 fade-up">
 <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/80 px-4 py-3 flex items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
 {[
 { n:"42", l:"salvos" },
 { n:"8", l:"playlists" },
 { n:"12", l:"reflexões" },
 ].map((s, i) => (
 <div key={s.l} className={`flex-1 text-center ${i < 2 ?"border-r border-[#EADFD2]" :""}`}>
 <div style={serif} className="text-[20px] text-[#1F1A16]">{s.n}</div>
 <div className="text-[10px] uppercase tracking-[0.18em] text-[#8A7868] mt-0.5">{s.l}</div>
 </div>
 ))}
 </div>
 </div>

 {/* Tabs */}
 <div className="relative z-20 px-5 pb-4">
 <div className="flex gap-2 overflow-x-auto no-scrollbar">
 {TABS.map((t) => {
 const active = t === tab;
 return (
 <button
 key={t}
 onClick={() => setTab(t)}
 className={`shrink-0 h-9 px-4 rounded-full text-[12px] font-medium transition-all ${
 active
 ?"text-white shadow-[0_8px_18px_rgba(248,138,43,0.35)]"
 :"text-[#5C4E42] bg-white/70 border border-[#EADFD2]"
 }`}
 style={active ? { background:"linear-gradient(135deg,#FFA158,#F88A2B)" } : undefined}
 >
 {t}
 </button>
 );
 })}
 </div>
 </div>

 {/* Playlists */}
 <div className="relative z-20 px-5 pb-3 flex items-center justify-between fade-up">
 <h2 style={serif} className="text-[18px] text-[#1F1A16]">Playlists emocionais</h2>
 <button className="text-[11px] uppercase tracking-[0.18em] text-[#F88A2B]">Ver todas</button>
 </div>
 <div className="relative z-20 pl-5 pb-5">
 <div className="flex gap-3 overflow-x-auto no-scrollbar pr-5">
 {PLAYLISTS.map((p) => (
 <button key={p.id} className="shrink-0 w-[148px] rounded-2xl overflow-hidden text-left fade-up bg-white border border-[#EFE3D5] shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
 <div className="relative h-[100px]" style={{ background: p.gradient }}>
 <div className="absolute inset-0" style={{ background:"radial-gradient(closest-side at 70% 30%, rgba(255,255,255,0.45), transparent 60%)" }} />
 <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white"><Play /></div>
 <div className="absolute bottom-2 left-3 text-white/95 text-[22px]">{p.emoji}</div>
 </div>
 <div className="px-3 py-2.5">
 <div style={serif} className="text-[14px] text-[#1F1A16] leading-snug">{p.title}</div>
 <div className="text-[10.5px] text-[#8A7868] mt-1 flex items-center gap-1">
 <Bookmark filled={false} /> {p.count} itens
 </div>
 </div>
 </button>
 ))}
 {/* Create new playlist */}
 <button className="shrink-0 w-[148px] h-full min-h-[176px] rounded-2xl border border-dashed border-[#D9C8B5] bg-white/50 flex flex-col items-center justify-center gap-2 text-[#8A7868]">
 <div className="w-9 h-9 rounded-full bg-white border border-[#EADFD2] flex items-center justify-center text-[#F88A2B]"><Plus /></div>
 <span className="text-[11px]">Nova playlist</span>
 </button>
 </div>
 </div>

 {/* Items */}
 <div className="relative z-20 px-5 pb-2 flex items-center justify-between">
 <h2 style={serif} className="text-[18px] text-[#1F1A16]">Salvos recentemente</h2>
 <button className="text-[11px] text-[#8A7868] flex items-center gap-1"><Spark size={11}/> ordenar</button>
 </div>

 <div className="relative z-20 px-5 pb-32 space-y-3">
 {empty ? (
 <EmptyState type={tab} />
 ) : (
 filtered.map((it, idx) => (
 <ItemCard key={it.id} item={it} delay={idx * 40} />
 ))
 )}
 </div>

 {/* Bottom nav */}
 <div className="absolute bottom-0 left-0 right-0 z-30">
 <div className="h-16 bg-gradient-to-t from-[#EFE6DC] via-[#EFE6DC]/85 to-transparent" />
 
 </div>
 </div>
 </div>
 );
}

function ItemCard({ item, delay }: { item: Item; delay: number }) {
 if (item.type ==="quote") {
 return (
 <div className="fade-up rounded-2xl p-5 border border-[#EFE3D5] shadow-[0_8px_22px_rgba(0,0,0,0.06)]" style={{ animationDelay: `${delay}ms`, background: item.tone ||"#FFF8F3" }}>
 <div className="flex items-center justify-between mb-2">
 <div className="w-7 h-7 rounded-full bg-white/70 flex items-center justify-center text-[#F88A2B]"><Quote /></div>
 <button className="text-[#5C4E42]/70"><More /></button>
 </div>
 <p style={serif} className="text-[18px] leading-[1.35] text-[#3A2E24] italic">
 “{item.title}”
 </p>
 <div className="mt-3 flex items-center justify-between text-[11px] text-[#5C4E42]/80">
 <span>— Augusto Cury</span>
 <span className="flex items-center gap-1"><Bookmark/> {item.saved}</span>
 </div>
 </div>
 );
 }

 const badge = item.type ==="audio" ?"Áudio" : item.type ==="video" ?"Vídeo" :"Leitura";
 const accent = item.type ==="audio" ?"#F88A2B" : item.type ==="video" ?"#7E5BB8" :"#4A6E92";

 return (
 <Link to={item.to ||"#"} className="fade-up flex gap-3 rounded-2xl bg-white/90 backdrop-blur border border-[#EFE3D5] p-2.5 shadow-[0_8px_22px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-transform" style={{ animationDelay: `${delay}ms` }}>
 <div className="relative w-[88px] h-[88px] rounded-xl overflow-hidden shrink-0 bg-[#EADFD2]">
 {item.img && <img src={item.img} alt="" className="w-full h-full object-cover" />}
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.35))" }} />
 <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-white">
 <span className="text-[9.5px] uppercase tracking-[0.16em]" style={{ color:"#fff" }}>{badge}</span>
 {item.duration && <span className="text-[10px] tabular-nums">{item.duration}</span>}
 </div>
 {item.type !=="read" && (
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-9 h-9 rounded-full bg-white/85 backdrop-blur flex items-center justify-center text-[#1F1A16] shadow-md"><Play /></div>
 </div>
 )}
 </div>
 <div className="flex-1 min-w-0 py-1 pr-1">
 <div className="flex items-start justify-between gap-2">
 <h3 style={serif} className="text-[15.5px] leading-[1.2] text-[#1F1A16] line-clamp-2">{item.title}</h3>
 <button className="text-[#8A7868] -mt-1"><More /></button>
 </div>
 <p className="text-[11.5px] text-[#7A6A5C] mt-1 truncate">{item.meta}</p>
 <div className="mt-2 flex items-center gap-2">
 <span className="inline-flex items-center gap-1 text-[10px] text-white px-2 py-0.5 rounded-full" style={{ background: accent }}>
 <Bookmark/> Salvo
 </span>
 <span className="text-[10.5px] text-[#8A7868]">há {item.saved}</span>
 </div>
 </div>
 </Link>
 );
}

function EmptyState({ type }: { type: Tab }) {
 return (
   <AppUserLayout>
 <div className="fade-up mt-4 rounded-3xl border border-[#EFE3D5] bg-white/80 backdrop-blur px-6 py-10 text-center relative overflow-hidden">
 <div className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.22), transparent 70%)", filter:"blur(14px)" }} />
 <div className="relative z-10">
 <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_10px_24px_rgba(248,138,43,0.35)]" style={{ background:"linear-gradient(135deg,#FFA158,#F88A2B)" }}>
 <Bookmark/>
 </div>
 <h3 style={serif} className="mt-4 text-[20px] text-[#1F1A16]">Nada salvo em <span className="italic text-[#F88A2B]">{type.toLowerCase()}</span></h3>
 <p className="mt-2 text-[12.5px] text-[#7A6A5C] leading-relaxed max-w-[260px] mx-auto">
 Toque no ícone de marcador em qualquer conteúdo para guardá-lo aqui — sua biblioteca emocional cresce com você.
 </p>
 <Link to="/feed" className="inline-flex items-center justify-center mt-5 h-11 px-6 rounded-full text-white text-[12.5px] font-semibold shadow-[0_10px_24px_rgba(248,138,43,0.35)]" style={{ background:"linear-gradient(135deg,#FFA158,#F88A2B)" }}>
 Explorar conteúdos
 </Link>
 </div>
 </div>
   </AppUserLayout>
 );
}
