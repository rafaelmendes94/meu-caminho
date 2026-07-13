import { useMemo, useState } from"react";
import { Link, useLocation } from"react-router-dom";
import NotificationsSheet from"./NotificationsSheet";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { useCmsItems, useCmsCategories, type CmsItem } from "@/hooks/use-cms-items";
import { RecommendedForYou } from "./RecommendedForYou";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const SearchI = ({ s = 18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
const Bell = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>);
const Chev = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>);
const Lock = ({ s = 16 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>);
const Clock = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
const Quote = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v4H8c0 2 1 3 3 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 3 3v3c-3 0-5-2-5-5V7z"/></svg>);
const BookOpen = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3V5z"/><path d="M21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7V5z"/></svg>);
// category icons
const IcEmotion = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V5z"/><path d="M15 5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V5z"/></svg>);
const IcCloud = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18a5 5 0 1 1 1.5-9.8A6 6 0 0 1 20 11a4 4 0 0 1 0 7H7z"/></svg>);
const IcPeople = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M14 20c0-2 2-3.5 4.5-3.5S23 18 23 20"/></svg>);
const IcLeaf = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z"/><path d="M5 19c4-4 7-7 9-9"/></svg>);
const IcShield = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/></svg>);
const IcHeart = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 6.6a5.5 5.5 0 0 0-9.3-2.4l-.5.5-.5-.5A5.5 5.5 0 1 0 2.7 12l8.3 8.3 8.3-8.3a5.5 5.5 0 0 0 1.5-5.4z"/></svg>);
const IcGrid = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>);

type Cat = { key: string; label: string; icon: JSX.Element };
const CAT_ICONS: Record<string, JSX.Element> = {
  brain: <IcEmotion/>, cloud: <IcCloud/>, people: <IcPeople/>,
  leaf: <IcLeaf/>, shield: <IcShield/>, heart: <IcHeart/>,
};
const GRADIENTS = [
  "linear-gradient(180deg,#FBE7C7 0%,#F5C786 50%,#C25A2A 100%)",
  "linear-gradient(180deg,#D8E4EA 0%,#7C9AAE 60%,#3B5567 100%)",
  "linear-gradient(180deg,#E8D7BE 0%,#B89770 60%,#6E4F33 100%)",
  "linear-gradient(180deg,#EFEBE2 0%,#C9C0B0 60%,#7B7367 100%)",
  "linear-gradient(180deg,#E8DABF 0%,#B58F62 55%,#5C3D26 100%)",
  "linear-gradient(180deg,#E6E1D6 0%,#B6B0A2 60%,#74695A 100%)",
];
const ACCENTS = ["#5B2A12","#0E2230","#3A2616","#2E2A22","#3A2614","#2C2519"];

type Book = {
  id: string;
  slug: string;
  title: string;
  cover: string;
  accent: string;
  bg: string;
  progress?: number;
  duration?: string;
  isNew?: boolean;
  locked?: boolean;
  categoryId: string | null;
};

function mapItem(item: CmsItem, idx: number): Book {
  const mins = item.duration_minutes ?? 0;
  const duration = mins ? `${Math.floor(mins/60)}h ${String(mins%60).padStart(2,"0")}min` : "";
  const isNew = item.published_at ? (Date.now() - new Date(item.published_at).getTime()) < 1000*60*60*24*30 : false;
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    cover: GRADIENTS[idx % GRADIENTS.length],
    accent: ACCENTS[idx % ACCENTS.length],
    bg: item.cover_url || item.banner_url || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70&auto=format&fit=crop",
    progress: 0,
    duration,
    isNew,
    locked: item.is_premium,
    categoryId: item.category_id,
  };
}

export default function LibraryScreen() {
 const location = useLocation();
 const isEnterprise = location.pathname.startsWith("/enterprise");
 const [catId, setCatId] = useState<string>("Todos");
 const [searchOpen, setSearchOpen] = useState(false);
 const [query, setQuery] = useState("");
 const [notifOpen, setNotifOpen] = useState(false);
 const { items, loading } = useCmsItems("book");
 const { categories } = useCmsCategories();
 const books = useMemo(() => items.map(mapItem), [items]);
 const cats: Cat[] = useMemo(() => [
   { key: "Todos", label: "Todos", icon: <IcGrid/> },
   ...categories.map((c) => ({ key: c.id, label: c.name, icon: CAT_ICONS[c.icon ?? ""] ?? <IcGrid/> })),
 ], [categories]);
 const base = catId === "Todos" ? books : books.filter((b) => b.categoryId === catId);
 const q = query.trim().toLowerCase();
 const list = q ? base.filter((b) => b.title.toLowerCase().includes(q)) : base;

  const Layout = isEnterprise ? (({ children }: { children: React.ReactNode }) => <EnterpriseUserLayout title="Biblioteca">{children}</EnterpriseUserLayout>) : AppUserLayout;
  return (
  <Layout>
  <main className={`${isEnterprise ? 'w-full lg:bg-transparent' : 'h-screen min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#F7F4F2]'} font-display`}>
  <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
 @keyframes fade-up { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
 @keyframes pulse-soft { 0%,100% { opacity: .55 } 50% { opacity: .95 } }
 @keyframes breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.015) } }
 .fade-up { animation: fade-up .55s ease both }
 .breathe { animation: breathe 6s ease-in-out infinite }
 .no-scrollbar::-webkit-scrollbar { display: none }
 .no-scrollbar { scrollbar-width: none }
 `}</style>

 <div
 className={`relative w-full flex flex-col text-[#111111] ${isEnterprise ? 'lg:bg-transparent' : 'h-[100dvh] overflow-hidden'}`}
 style={{
 fontFamily:"'Montserrat', system-ui, sans-serif",
 background: isEnterprise ? 'transparent' : "radial-gradient(120% 70% at 0% 0%, #FFF8F3 0%, #F7F4F2 45%, #F6EFE8 100%)",
 }}
 >
 {/* atmospheric glows */}
 <div className="pointer-events-none absolute -top-20 -left-16 w-[300px] h-[300px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.18), transparent 70%)", filter:"blur(22px)", animation:"pulse-soft 8s ease-in-out infinite" }} />
 <div className="pointer-events-none absolute top-1/3 -right-20 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(196,148,98,0.16), transparent 70%)", filter:"blur(22px)" }} />

 {/* Status bar */}
 {/* Scrollable content */}
 <div className="relative z-10 flex-1">

 {/* Header */}
 {searchOpen ? (
 <div className="relative z-20 px-5 pt-1 pb-4 flex items-center gap-2 fade-up">
 <div className="flex-1 h-11 px-4 rounded-full bg-white border border-[#EFE3D5] flex items-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
 <SearchI s={16}/>
 <input
 autoFocus
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Buscar livro..."
 className="flex-1 bg-transparent outline-none text-[13px] text-[#1F1A14] placeholder:text-[#999]"
 />
 {query && (
 <button onClick={() => setQuery("")} className="text-[11px] text-[#999] font-medium">limpar</button>
 )}
 </div>
 <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="px-3 h-10 text-[12px] font-semibold text-[#F88A2B]">Cancelar</button>
 </div>
 ) : (
  <div className={`relative z-20 px-5 pt-1 pb-4 flex items-center gap-3 ${isEnterprise ? 'lg:hidden' : ''}`}>
  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-[0_6px_18px_rgba(0,0,0,0.12)] shrink-0">
  <img src={isEnterprise ?"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" :"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=70&auto=format&fit=crop"} alt="" className="w-full h-full object-cover"/>
  </div>
  <div className="flex-1 min-w-0">
  <h1 style={serif} className="text-[20px] leading-tight text-[#111111] truncate">Clube do Livro</h1>
  <p className="text-[11.5px] text-[#666666] truncate">Sua biblioteca para evoluir sempre</p>
  </div>
  <button onClick={() => setSearchOpen(true)} className="w-10 h-10 rounded-full bg-white border border-[#EFE3D5] flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.04)]"><SearchI s={17}/></button>
   <button onClick={() => setNotifOpen(true)} className="relative w-10 h-10 rounded-full bg-white border border-[#EFE3D5] flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
   <Bell/>
   </button>
  </div>
 )}

  {/* HERO - Hidden on Enterprise mobile */}
  <div className={`relative z-20 px-5 pb-5 fade-up ${isEnterprise ? 'lg:px-0 lg:pt-2' : ''} ${isEnterprise ? 'hidden lg:block' : ''}`}>
    <div className="relative rounded-[24px] overflow-hidden h-[210px] lg:h-[320px] shadow-[0_18px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)]">
      <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80&auto=format&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
      <div className="absolute inset-0" style={{ background: isEnterprise ? "linear-gradient(100deg, rgba(255,244,228,0.92) 0%, rgba(255,242,222,0.85) 55%, rgba(255,238,214,0.35) 80%, rgba(255,238,214,0.05) 100%)" : "linear-gradient(100deg, rgba(255,244,228,0.99) 0%, rgba(255,242,222,0.96) 55%, rgba(255,238,214,0.55) 80%, rgba(255,238,214,0.1) 100%)" }} />
      <div className="absolute -bottom-12 -left-10 w-[220px] h-[220px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.30), transparent 70%)", filter:"blur(18px)" }} />
      <div className="relative z-10 h-full p-6 lg:p-12 flex flex-col justify-center max-w-[280px] lg:max-w-[550px]">
        <div>
          <h2 style={serif} className="text-[24px] lg:text-[42px] leading-[1.1] text-[#1A1208] font-bold" >
            Uma biblioteca para transformar sua mente.
          </h2>
          <p className="mt-4 text-[12px] lg:text-[16px] text-[#3D3225] leading-relaxed font-medium">
            Explore os livros que acompanham sua evolução emocional. Uma curadoria exclusiva de Augusto Cury para seu desenvolvimento.
          </p>
        </div>
      </div>
    </div>
  </div>

 {/* Filters */}
  <div className={`relative z-20 pl-5 pb-5 ${isEnterprise ? 'lg:px-0 lg:pt-4' : ''}`}>
  <div className="flex gap-2 overflow-x-auto overflow-y-visible no-scrollbar pr-5 py-6 -my-6">
   {cats.map((c) => {
  const active = c.key === catId;
  return (
  <button
  key={c.key}
  onClick={() => setCatId(c.key)}
  className={`shrink-0 h-11 pl-1.5 pr-4 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
  active ?"text-white shadow-[0_12px_24px_-8px_rgba(248,138,43,0.5)]" :"text-[#444444] bg-white border border-[#EFE3D5] hover:border-[#F88A2B]/30 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
  }`}
  style={active ? { background:"linear-gradient(135deg,#FFA158,#F88A2B)" } : undefined}
  >
  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${active ?"bg-white/20" :"bg-[#FFF1E2] text-[#F88A2B]"}`}>{c.icon}</span>
  <span className="leading-none">{c.label}</span>
  </button>
  );
  })}
  </div>
  </div>

  <div className={`relative z-20 ${isEnterprise ? 'lg:px-0 lg:pt-8' : ''}`}>
  <div className="flex items-center justify-between mb-8 px-5 lg:px-0">
  <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.25em]">Sua Estante</h3>
  <div className="flex items-center gap-4">
  <div className="hidden lg:flex items-center gap-2 px-4 h-10 rounded-full bg-white border border-[#EFE3D5] shadow-sm">
  <SearchI s={14}/>
  <input 
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Buscar em seus livros..." 
  className="bg-transparent outline-none text-xs font-medium text-[#111] w-48"
  />
  </div>
  </div>
  </div>
  </div>

  {/* Books grid */}
 <div className="relative z-20">
   <RecommendedForYou preferredType="book" title="Recomendado para você" />
 </div>

 {list.length === 0 ? (
 <div className="relative z-20 px-5 pb-8 text-center">
 <p className="text-[13px] text-[#666] py-8">{loading ? "Carregando biblioteca…" : query ? <>Nenhum livro encontrado para "<span className="text-[#1F1A14] font-semibold">{query}</span>"</> : "Nenhum livro disponível ainda."}</p>
 </div>
 ) : (
  <div className={`relative z-20 px-5 pb-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 lg:gap-x-8 gap-y-6 lg:gap-y-12 ${isEnterprise ? 'lg:px-0 lg:pt-8' : ''}`}>
  {list.map((b, i) => <BookCard key={b.id} b={b} delay={i * 50} isEnterprise={isEnterprise}/>)}
  </div>
 )}

  {/* Liberados do mês */}
  <div className={`relative z-20 px-5 pb-5 fade-up ${isEnterprise ? 'lg:px-0 lg:pt-8' : ''}`}>
  <div className="relative rounded-[24px] overflow-hidden p-6 lg:p-10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.2)]" style={{ background:"linear-gradient(120deg,#3A2818 0%,#1F140A 100%)" }}>
  <div className="absolute -top-10 -right-10 w-[300px] h-[300px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,178,80,0.3), transparent 70%)", filter:"blur(32px)" }} />
  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
  <div className="flex items-center gap-4">
  <div className="w-16 h-16 rounded-[24px] bg-white/10 border border-white/20 flex items-center justify-center text-[#F8B05A] backdrop-blur-xl shadow-inner"><BookOpen/></div>
  <div className="min-w-0">
  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#F8B05A] mb-1">Destaques do Mês</p>
  <h3 style={serif} className="text-2xl lg:text-3xl leading-tight font-bold">Novos títulos liberados</h3>
  <p className="text-sm text-white/60 mt-2 font-medium">Continue sua jornada com obras fundamentais para sua evolução.</p>
  </div>
  </div>
  </div>
  </div>
  </div>

  {/* Insight Cury */}
  <div className={`relative z-20 px-5 pb-10 fade-up ${isEnterprise ? 'lg:px-0 lg:pt-8' : ''}`}>
  <div className="relative rounded-[32px] overflow-hidden bg-white border border-[#EFE3D5] shadow-[0_15px_45px_rgba(0,0,0,0.04)]">
  <div className="absolute inset-0" style={{ background:"radial-gradient(120% 80% at 100% 100%, #FFE8C8 0%, transparent 60%), radial-gradient(80% 60% at 0% 0%, #F6EADD 0%, transparent 60%)" }} />
  <div className="absolute -top-12 -left-8 w-[200px] h-[200px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(143,177,125,0.15), transparent 70%)", filter:"blur(24px)" }} />

  <div className="relative z-10 p-8 lg:p-12 flex flex-col items-center text-center max-w-2xl mx-auto">
  <div className="text-[#F88A2B] mb-6 transform scale-150"><Quote/></div>
  <p style={serif} className="text-2xl lg:text-3xl leading-snug text-[#1F1A14] font-medium">
  "Os livros expandem horizontes que a ansiedade limita. Cada página é um passo em direção à sua liberdade emocional."
  </p>
  <div className="mt-8 flex items-center gap-3">
  <div className="h-px w-8 bg-[#F88A2B]/30" />
  <p className="text-sm text-[#F88A2B] font-bold uppercase tracking-widest">Augusto Cury</p>
  <div className="h-px w-8 bg-[#F88A2B]/30" />
  </div>
  </div>
  </div>
  </div>

 </div>

 {/* Bottom nav */}
 <NotificationsSheet open={notifOpen} onClose={() => setNotifOpen(false)} />
  </div>
  </main>
  </Layout>
  );
}

function BookCard({ b, delay, isEnterprise }: { b: Book; delay: number; isEnterprise?: boolean }) {
  const al = useAudienceLink();
  const locked = !!b.locked;
  const to = locked ? (isEnterprise ? "/enterprise/biblioteca" : "/biblioteca") : al(`/biblioteca/leitor?livro=${b.id}`);
 return (
 <Link to={to} className="block fade-up group" style={{ animationDelay: `${delay}ms` }}>
 <div className="relative aspect-[3/4] rounded-[14px] overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
 {/* gradient cover */}
 <div className="absolute inset-0" style={{ background: b.cover }} />
 {/* subtle photo */}
 <img src={b.bg} alt="" className={`absolute inset-0 w-full h-full object-cover mix-blend-soft-light opacity-80 ${locked ?"blur-[1.5px]" :""}`} />
 {/* top tag */}
 <div className="absolute top-2 left-2 right-2 flex items-center justify-center">
 <div className="text-[8px] tracking-[0.32em] uppercase font-semibold" style={{ color: b.accent }}>Augusto Cury</div>
 </div>
 {/* title on cover */}
 <div className="absolute inset-x-0 top-1/3 -translate-y-1/2 px-3 text-center">
 <div style={serif} className="text-[14px] leading-[1.05] font-semibold uppercase tracking-wide" >
 <span style={{ color: b.accent }}>{b.title}</span>
 </div>
 </div>

 {/* locked overlay */}
 {locked && (
 <>
 <div className="absolute inset-0 bg-[#1F140A]/35 backdrop-blur-[1px]" />
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-12 h-12 rounded-full bg-[#1F140A]/75 backdrop-blur border border-white/15 flex items-center justify-center text-white shadow-[0_10px_22px_rgba(0,0,0,0.35)]">
 <Lock s={20}/>
 </div>
 </div>
 </>
 )}

 {/* New badge */}
 {b.isNew && !locked && (
 <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-white px-2 py-1 rounded-md shadow-[0_6px_14px_rgba(248,138,43,0.45)]" style={{ background:"linear-gradient(135deg,#FFA158,#F88A2B)" }}>
 Novo
 </span>
 )}

 {/* glow for unlocked */}
 {!locked && (
 <div className="absolute -bottom-6 -left-6 w-[120px] h-[120px] rounded-full pointer-events-none" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.35), transparent 70%)", filter:"blur(14px)" }} />
 )}
 </div>

 {/* meta */}
 <div className="mt-3 px-0.5">
 <h3 style={serif} className="text-[14.5px] leading-[1.15] text-[#111111] line-clamp-2 min-h-[34px]">{b.title}</h3>
  {locked ? (
  <p className="mt-2 text-[11px] text-[#999] font-medium leading-snug">Disponível para<br/>colaboradores Enterprise</p>
 ) : (
 b.duration ? (
 <div className="mt-2 flex items-center gap-1 text-[10.5px] text-[#666666]"><Clock/> {b.duration}</div>
 ) : null
 )}
 </div>
 </Link>
 );
}
