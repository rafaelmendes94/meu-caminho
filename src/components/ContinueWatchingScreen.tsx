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

 {/* HERO continue card / listas — só aparecem quando houver histórico real */}
 {HERO ? (
 <div className="relative z-20 px-5 pb-5 fade-up">
 <Link to={(HERO as Item).to} className="block relative rounded-[28px] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.18)] group">
 <div className="relative h-[230px]">
 <img src={(HERO as Item).img} alt="" className="w-full h-full object-cover" />
 <div className="absolute bottom-0 left-0 right-0 p-5">
 <h2 style={serif} className="text-white text-[24px] leading-[1.1] mt-1.5 max-w-[260px]">{(HERO as Item).title}</h2>
 </div>
 </div>
 </Link>
 </div>
 ) : (
 <div className="relative z-20 px-5 pb-6 fade-up">
 <div className="rounded-[24px] bg-white/70 border border-[#EFE3D5] p-6 text-center">
 <p className="text-[13px] text-[#7A6A5C]">Nada em andamento ainda. Comece uma trilha para ver aqui seu progresso.</p>
 </div>
 </div>
 )}


 {/* Bottom nav */}
 <div className="absolute bottom-0 left-0 right-0 z-30">
 <div className="h-16 bg-gradient-to-t from-[#EFE6DC] via-[#EFE6DC]/85 to-transparent" />
 
 </div>
 </div>
 </div>
   </AppUserLayout>
 );
}
