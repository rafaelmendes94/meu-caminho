import { Link } from"react-router-dom";
import { useState } from"react";
import { ChevronLeft, BookOpen, Headphones, Play, FileDown, Trash2, CheckCircle2, Wifi, WifiOff } from"lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const brand ="#F88A2B";
const ink600 ="#666";
const ink500 ="#999";
const bg ="#F7F4F2";
const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;

type Dl = {
 type:"audio" |"video" |"pdf" |"ebook";
 title: string;
 size: string;
 status:"ready" |"downloading";
 progress?: number;
};

const initial: Dl[] = [
 { type:"audio", title:"Meditação — mente serena", size:"12.4 MB", status:"ready" },
 { type:"video", title:"Aula 2 · Limites saudáveis", size:"186 MB", status:"ready" },
 { type:"ebook", title:"Ansiedade — capítulo 4", size:"3.1 MB", status:"ready" },
 { type:"pdf", title:"Material de apoio · Curso 1", size:"1.8 MB", status:"ready" },
 { type:"video", title:"Aula 3 · Respiração consciente", size:"212 MB", status:"downloading", progress: 64 },
 { type:"audio", title:"Podcast · Inteligência emocional", size:"28.7 MB", status:"ready" },
];

const iconFor = (t: Dl["type"]) => {
 const map = {
 audio: { Icon: Headphones, c:"#9B8AC9", bg:"#EFEAF7" },
 video: { Icon: Play, c: brand, bg:"#FDECDA" },
 ebook: { Icon: BookOpen, c:"#E26B6B", bg:"#FBE4E4" },
 pdf: { Icon: FileDown, c:"#7FBF9F", bg:"#EAF3EC" },
 } as const;
 return map[t];
};

const DownloadsScreen = () => {
  const al = useAudienceLink();
 const [items, setItems] = useState(initial);
 const [online, setOnline] = useState(true);
 const totalMB = items.reduce((s, i) => s + parseFloat(i.size), 0).toFixed(1);

 return (
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
 style={{ background: bg, paddingTop:"env(safe-area-inset-top)" }}
 >
 <div className="pointer-events-none absolute inset-0 z-0" style={{ background:"radial-gradient(70% 30% at 50% 6%, rgba(248,138,43,0.10) 0%, transparent 70%)" }} />

 <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
 <Link to={al("/menu")} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition">
 <ChevronLeft size={18} className="text-[#444]" />
 </Link>
 <p className="text-[14px] text-[#444]">Downloads</p>
 <button onClick={() => setOnline((v) => !v)} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition">
 {online ? <Wifi size={16} className="text-[#7FBF9F]" /> : <WifiOff size={16} className="text-[#E26B6B]" />}
 </button>
 </div>

 <div className="relative z-10 flex-1 px-5 pb-4">
 <h1 style={serif} className="text-[34px] leading-[1.05] text-[#111] mt-1">Conteúdos<br/>offline</h1>
 <p className="text-[12.5px] text-[#8A8A8A] mt-2">Disponíveis a qualquer momento, mesmo sem internet.</p>

 {/* Storage card */}
 <div className="mt-4 rounded-3xl bg-white/85 border border-white p-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)]">
 <div className="flex items-baseline justify-between">
 <p className="text-[12px]" style={{ color: ink600 }}>Espaço utilizado</p>
 <p className="text-[12px]" style={{ color: ink500 }}>{totalMB} MB de 2 GB</p>
 </div>
 <div className="mt-2 h-2 rounded-full bg-[#F0EAE3] overflow-hidden">
 <div className="h-full rounded-full" style={{ width:"22%", background: `linear-gradient(90deg, ${brand}, #E07A2B)` }} />
 </div>
 <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: ink600 }}>
 <CheckCircle2 size={14} className="text-[#7FBF9F]" />
 {items.filter((i) => i.status ==="ready").length} arquivos prontos
 </div>
 </div>

 {/* Section */}
 <p className="mt-5 text-[10.5px] tracking-[0.22em] font-semibold" style={{ color:"#B89673" }}>SEUS DOWNLOADS</p>

 <div className="mt-3 space-y-2.5">
 {items.map((it, i) => {
 const { Icon, c, bg: ibg } = iconFor(it.type);
 return (
   <AppUserLayout>
 <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-black/5 shadow-[0_8px_22px_-16px_rgba(0,0,0,0.10)]">
 <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ibg }}>
 <Icon size={20} color={c} strokeWidth={1.7} />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[13.5px] font-semibold text-[#111] truncate">{it.title}</p>
 <p className="text-[11px] mt-0.5" style={{ color: ink500 }}>{it.size} · {it.status ==="ready" ?"Disponível offline" : `Baixando ${it.progress}%`}</p>
 {it.status ==="downloading" && (
 <div className="mt-1.5 h-1 rounded-full bg-[#F0EAE3] overflow-hidden">
 <div className="h-full" style={{ width: `${it.progress}%`, background: brand }} />
 </div>
 )}
 </div>
 <button onClick={() => setItems((arr) => arr.filter((_, k) => k !== i))} aria-label="Remover" className="w-9 h-9 rounded-full bg-[#F7F4F2] flex items-center justify-center active:scale-95 transition">
 <Trash2 size={15} className="text-[#999]" />
 </button>
 </div>
   </AppUserLayout>
 );
 })}
 {items.length === 0 && (
 <div className="text-center py-12 text-[12.5px]" style={{ color: ink500 }}>
 Nenhum download ainda.
 </div>
 )}
 </div>

 <div className="h-6"/>
 </div>

 </div>
 </main>
 );
};

export default DownloadsScreen;
