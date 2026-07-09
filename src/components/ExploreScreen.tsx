import { useEffect, useMemo, useState } from"react";
import { Link, useLocation } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { supabase } from "@/integrations/supabase/client";
import { RecommendedForYou } from "./RecommendedForYou";
import { useAudienceLink } from "@/hooks/use-audience";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const Chev = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>);
const SearchI = ({ s = 18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
const Mic = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>);
const Sliders = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h14M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></svg>);
const Trend = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>);
const Spark = ({ size = 12 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/></svg>);
const Play = ({ s = 12 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l13 7-13 7V5z"/></svg>);
const Close = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>);

const FILTERS = ["Todos","Áudios","Vídeos","Leituras","Podcasts","Reflexões"] as const;
type Filter = typeof FILTERS[number];

const TRENDING = [
 { tag:"Ansiedade noturna", count:"+32%" },
 { tag:"Reconstruir confiança", count:"+18%" },
 { tag:"Sono profundo", count:"+12%" },
 { tag:"Filhos e diálogo", count:"+9%" },
 { tag:"Pressão no trabalho", count:"+24%" },
];

const RECENTS = ["paz interior","augusto cury sono","perdoar","ansiedade no peito"];

const QUICK = [
 { label:"Calma", emoji:"🌿", g:"linear-gradient(135deg,#D9EAD9,#A8C8A4)" },
 { label:"Sono", emoji:"🌙", g:"linear-gradient(135deg,#D5C8E8,#9B86C4)" },
 { label:"Foco", emoji:"◐", g:"linear-gradient(135deg,#C8DDEB,#7AA1C4)" },
 { label:"Coragem", emoji:"✦", g:"linear-gradient(135deg,#FFD7B0,#F88A2B)" },
];

type Card = {
 id: string;
 type:"Áudio" |"Vídeo" |"Leitura" |"Podcast" |"Reflexão";
 title: string;
 meta: string;
 img?: string;
 h: number; // masonry height
 to: string;
 tone?: string;
};

const CARD_TYPE: Record<string, Card["type"]> = {
  audio: "Áudio", video: "Vídeo", book: "Leitura", material: "Leitura",
  podcast: "Podcast", course: "Leitura", track: "Leitura",
};
const HEIGHTS = [220, 170, 280, 200, 240, 190, 150, 230, 260, 200];
const REFLECTION_TONES = ["linear-gradient(135deg,#FFE3C7,#F8C892)", "linear-gradient(135deg,#F4E3D7,#E9C9B0)"];

function metaFor(item: any): string {
  if (item.duration_minutes) return `${item.duration_minutes} min${item.short_description ? " · " + item.short_description.split(".")[0] : ""}`;
  return item.short_description ?? "";
}
function routeFor(item: any, al: (p: string) => string): string {
  const s = encodeURIComponent(item.slug);
  switch (item.type) {
    case "audio": return al(`/player/audio?slug=${s}`);
    case "video": return al(`/conteudo/video?slug=${s}`);
    case "podcast": return al(`/player/podcast?slug=${s}`);
    case "book": return al(`/biblioteca/leitor?livro=${s}`);
    case "material": return al(`/conteudo/leitura?slug=${s}`);
    default: return al(`/conteudo/detalhe?slug=${s}`);
  }
}

const TYPE_COLOR: Record<Card["type"], string> = {
"Áudio":"#F88A2B",
"Vídeo":"#7E5BB8",
"Leitura":"#4A6E92",
"Podcast":"#D86B4A",
"Reflexão":"#A07A4A",
};

export default function ExploreScreen() {
 const location = useLocation();
 const al = useAudienceLink();
 const [q, setQ] = useState("");
 const [filter, setFilter] = useState<Filter>("Todos");
 const [cards, setCards] = useState<Card[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   let alive = true;
   (async () => {
     const { data } = await supabase
       .from("content_items")
       .select("id,type,slug,title,short_description,cover_url,duration_minutes")
       .eq("status", "published")
       .in("type", ["audio","video","podcast","book","material"])
       .order("published_at", { ascending: false })
       .limit(20);
     if (!alive) return;
     const mapped: Card[] = (data ?? []).map((it: any, i: number) => ({
       id: it.id,
       type: CARD_TYPE[it.type] ?? "Leitura",
       title: it.title,
       meta: metaFor(it),
       img: it.cover_url ?? undefined,
       h: HEIGHTS[i % HEIGHTS.length],
       to: routeFor(it, al),
     }));
     setCards(mapped);
     setLoading(false);
   })();
   return () => { alive = false; };
 }, [al]);

 const filtered = useMemo(() => {
 let list = cards;
 if (filter !=="Todos") {
 const map: Record<Exclude<Filter,"Todos">, Card["type"]> = {
"Áudios":"Áudio","Vídeos":"Vídeo","Leituras":"Leitura","Podcasts":"Podcast","Reflexões":"Reflexão",
 };
 list = list.filter((c) => c.type === map[filter]);
 }
 if (q.trim()) {
 const k = q.toLowerCase();
 list = list.filter((c) => c.title.toLowerCase().includes(k));
 }
 return list;
 }, [cards, filter, q]);

 // split into two columns for masonry
 const left: Card[] = [], right: Card[] = [];
 let lh = 0, rh = 0;
 filtered.forEach((c) => {
 if (lh <= rh) { left.push(c); lh += c.h; } else { right.push(c); rh += c.h; }
 });

 const showSearchState = q.trim().length > 0;

  return (
  <AppUserLayout>
  <div className="min-h-screen w-full flex items-start justify-center bg-[#EDE7E1] p-0 sm:p-6">
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
 @keyframes fade-up { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
 @keyframes pulse-soft { 0%,100% { opacity: .55 } 50% { opacity: .95 } }
 .fade-up { animation: fade-up .5s ease both }
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
 {/* glows */}
 <div className="pointer-events-none absolute -top-20 -left-16 w-[300px] h-[300px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.20), transparent 70%)", filter:"blur(22px)", animation:"pulse-soft 8s ease-in-out infinite" }} />
 <div className="pointer-events-none absolute top-1/2 -right-20 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(196,148,98,0.18), transparent 70%)", filter:"blur(22px)" }} />

 {/* Status bar */}
 {/* Header */}
 <div className="relative z-20 px-5 pt-1 pb-3 flex items-center justify-between">
 <Link to={location.pathname.startsWith('/enterprise') ? "/enterprise/feed" : "/feed"} className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.05)]"><Chev/></Link>
 <div className="text-[12px] tracking-[0.22em] text-[#8A7868] uppercase">Explorar</div>
 <button className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.05)]"><Sliders/></button>
 </div>

 {/* Title */}
 <div className="relative z-20 px-6 pt-1 pb-4 fade-up">
 <h1 style={serif} className="text-[32px] leading-[1.05]">
 O que sua alma<br/><span className="italic text-[#F88A2B]">precisa hoje?</span>
 </h1>
 </div>

 {/* Search bar */}
 <div className="relative z-20 px-5 pb-4 fade-up">
 <div className="relative">
 <div className="flex items-center gap-2 h-13 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur border border-[#EADFD2] shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
 <SearchI s={17}/>
 <input
 value={q}
 onChange={(e) => setQ(e.target.value)}
 placeholder="Buscar reflexões, áudios, temas…"
 className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[#A89684] text-[#1F1A16]"
 />
 {q ? (
 <button onClick={() => setQ("")} className="w-6 h-6 rounded-full bg-[#F2E7DA] flex items-center justify-center text-[#5C4E42]"><Close/></button>
 ) : (
 <button className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-[0_6px_14px_rgba(248,138,43,0.35)]" style={{ background:"linear-gradient(135deg,#FFA158,#F88A2B)" }}><Mic/></button>
 )}
 </div>
 </div>
 </div>

 {/* Filters */}
 <div className="relative z-20 pl-5 pb-4">
 <div className="flex gap-2 overflow-x-auto no-scrollbar pr-5">
 {FILTERS.map((f) => {
 const active = f === filter;
 return (
 <button
 key={f}
 onClick={() => setFilter(f)}
 className={`shrink-0 h-9 px-4 rounded-full text-[12px] font-medium transition-all ${
 active ?"text-white shadow-[0_8px_18px_rgba(248,138,43,0.35)]" :"text-[#5C4E42] bg-white/70 border border-[#EADFD2]"
 }`}
 style={active ? { background:"linear-gradient(135deg,#FFA158,#F88A2B)" } : undefined}
 >
 {f}
 </button>
 );
 })}
 </div>
 </div>

 {showSearchState ? (
 <>
 {/* Recent + suggestions when typing */}
 <div className="relative z-20 px-5 pb-3 fade-up">
 <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#8A7868] mb-2">Sugestões</p>
 <div className="space-y-1.5">
 {[`${q} para dormir`, `${q} de Augusto Cury`, `como lidar com ${q}`].map((s, i) => (
 <button key={i} onClick={() => setQ(s)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/85 border border-[#EFE3D5] text-left">
 <SearchI s={14}/>
 <span className="text-[13px] text-[#1F1A16] flex-1 truncate">{s}</span>
 <ArrowUL/>
 </button>
 ))}
 </div>
 </div>
 </>
 ) : (
 <>
 {/* Mood quick chips */}
 <div className="relative z-20 px-5 pb-5 fade-up">
 <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#8A7868] mb-2.5">Como você está se sentindo?</p>
 <div className="grid grid-cols-4 gap-2">
 {QUICK.map((m) => (
 <button key={m.label} className="aspect-square rounded-2xl flex flex-col items-center justify-center text-[#1F1A16] shadow-[0_8px_18px_rgba(0,0,0,0.08)]" style={{ background: m.g }}>
 <span className="text-[22px]">{m.emoji}</span>
 <span className="text-[10.5px] mt-0.5 font-semibold">{m.label}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Trending */}
 <div className="relative z-20 px-5 pb-5 fade-up">
 <div className="flex items-center justify-between mb-2.5">
 <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#F88A2B] font-semibold flex items-center gap-1.5"><Spark size={11}/> Tendências emocionais</p>
 </div>
 <div className="rounded-2xl bg-white/85 border border-[#EFE3D5] shadow-[0_8px_22px_rgba(0,0,0,0.06)] divide-y divide-[#F2E7DA]">
 {TRENDING.map((t, i) => (
 <button key={t.tag} className="w-full flex items-center gap-3 px-4 py-3">
 <span style={serif} className="text-[15px] text-[#A89684] tabular-nums w-5">{i + 1}</span>
 <div className="flex-1 text-left">
 <div className="text-[13px] text-[#1F1A16]">{t.tag}</div>
 </div>
 <span className="text-[10.5px] text-[#22A06B] font-semibold flex items-center gap-1"><Trend/> {t.count}</span>
 </button>
 ))}
 </div>
 </div>

 {/* Recent searches */}
 <div className="relative z-20 px-5 pb-5 fade-up">
 <div className="flex items-center justify-between mb-2.5">
 <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#8A7868]">Buscas recentes</p>
 <button className="text-[10.5px] text-[#F88A2B]">Limpar</button>
 </div>
 <div className="flex flex-wrap gap-2">
 {RECENTS.map((r) => (
 <button key={r} onClick={() => setQ(r)} className="h-8 px-3 rounded-full bg-white/85 border border-[#EADFD2] text-[12px] text-[#5C4E42] flex items-center gap-1.5">
 <SearchI s={12}/> {r}
 </button>
 ))}
 </div>
 </div>
 </>
 )}

 {/* Section title */}
 <div className="relative z-20 px-5 pb-2 flex items-center justify-between">
 <h2 style={serif} className="text-[19px]">{showSearchState ? `Resultados para “${q}”` :"Para você"}</h2>
 {!showSearchState && <span className="text-[10.5px] text-[#8A7868]">curado por IA</span>}
 </div>

 {!showSearchState && (
   <div className="relative z-20">
     <RecommendedForYou interest={filter !== "Todos" ? filter : undefined} title="Recomendado para você" />
   </div>
 )}

 {/* Masonry grid */}
 <div className="relative z-20 px-5 pb-32">
 {filtered.length === 0 ? (
 <div className="rounded-3xl border border-[#EFE3D5] bg-white/85 px-6 py-10 text-center mt-3">
 <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center text-white shadow-[0_10px_24px_rgba(248,138,43,0.35)]" style={{ background:"linear-gradient(135deg,#FFA158,#F88A2B)" }}><SearchI s={18}/></div>
 <h3 style={serif} className="mt-4 text-[18px]">{loading ? "Carregando…" : "Nada encontrado"}</h3>
 <p className="mt-1.5 text-[12px] text-[#7A6A5C]">{loading ? "Buscando conteúdos publicados." : "Tente outra palavra ou explore as tendências acima."}</p>
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-3">{left.map((c, i) => <ExploreCard key={c.id} c={c} delay={i * 40} />)}</div>
 <div className="space-y-3">{right.map((c, i) => <ExploreCard key={c.id} c={c} delay={i * 40 + 20} />)}</div>
 </div>
 )}

 {!showSearchState && (
 <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#8A7868]">
 <span className="w-1.5 h-1.5 rounded-full bg-[#F88A2B] animate-pulse"/> carregando mais reflexões…
 </div>
 )}
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

const ArrowUL = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7L7 17M7 7h10v10"/></svg>);

function ExploreCard({ c, delay }: { c: Card; delay: number }) {
 if (c.type ==="Reflexão") {
 return (
 <Link to={c.to} className="block fade-up rounded-2xl p-4 border border-[#EFE3D5] shadow-[0_8px_22px_rgba(0,0,0,0.06)]" style={{ background: c.tone, height: c.h, animationDelay: `${delay}ms` }}>
 <span className="text-[9px] uppercase tracking-[0.22em] text-[#8A6A3A] font-semibold">{c.type}</span>
 <p style={serif} className="mt-3 text-[15px] leading-[1.3] italic text-[#3A2E24]">“{c.title}”</p>
 <p className="mt-3 text-[10px] text-[#5C4E42]/80">— Augusto Cury</p>
 </Link>
 );
 }
 return (
 <Link
 to={c.to}
 className="block fade-up relative rounded-2xl overflow-hidden bg-white border border-[#EFE3D5] shadow-[0_10px_22px_rgba(0,0,0,0.08)]"
 style={{ height: c.h, animationDelay: `${delay}ms` }}
 >
 {c.img && <img src={c.img} alt="" className="absolute inset-0 w-full h-full object-cover" />}
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, transparent 35%, rgba(15,8,2,0.85))" }} />
 <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.18em] text-white/95 px-2 py-0.5 rounded-full backdrop-blur" style={{ background: TYPE_COLOR[c.type] +"cc" }}>{c.type}</span>
 {(c.type ==="Áudio" || c.type ==="Vídeo" || c.type ==="Podcast") && (
 <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center text-[#1F1A16]"><Play s={11}/></div>
 )}
 <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
 <h3 style={serif} className="text-[14px] leading-[1.2] line-clamp-3">{c.title}</h3>
 <p className="text-[10px] text-white/75 mt-1 truncate">{c.meta}</p>
 </div>
 </Link>
 );
}
