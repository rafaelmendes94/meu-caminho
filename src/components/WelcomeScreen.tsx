import { useNavigate } from"react-router-dom";
import abstractArt from"@/assets/login-abstract.png";
import { AppUserLayout } from "./layouts/AppUserLayout";

const SignalIcon = () => (
 <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
 <rect x="0" y="7" width="3" height="4" rx="0.5" />
 <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
 <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
 <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
 </svg>
);
const WifiIcon = () => (
 <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-hidden="true">
 <path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/>
 <path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/>
 <circle cx="8" cy="10" r="1"/>
 </svg>
);
const BatteryIcon = () => (
 <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
 <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/>
 <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
 <rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/>
 </svg>
);

const ChevronRight = ({ color ="#fff" }: { color?: string }) => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <polyline points="9 18 15 12 9 6" />
 </svg>
);

const ShieldIcon = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7FA06E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
 <path d="M9.5 12.5l2 2 3.5-4" />
 </svg>
);

const SparkDivider = () => (
 <div className="flex items-center justify-center gap-3">
 <span className="h-px w-14 bg-[#F3D7BE]" />
 <svg width="11" height="11" viewBox="0 0 10 10" aria-hidden="true">
 <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#F88A2B" />
 </svg>
 <span className="h-px w-14 bg-[#F3D7BE]" />
 </div>
);

const TrailIcon = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F88A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M6 21c0-3 3-5 6-5s6-2 6-5-3-5-6-5-6-2-6-5" />
 <path d="M6 3v18" />
 <path d="M6 4h6l-2 2 2 2H6" fill="#F88A2B" />
 </svg>
);
const BrainIcon = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6F9560" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M9 4a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10v2a3 3 0 0 0 1.5 2.6A3 3 0 0 0 9 19V4z" />
 <path d="M15 4a3 3 0 0 1 3 3v.5A3 3 0 0 1 20 10v2a3 3 0 0 1-1.5 2.6A3 3 0 0 1 15 19V4z" />
 <path d="M9 9h2M13 9h2M9 13h2M13 13h2" />
 </svg>
);
const FeedIcon = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E07F35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M21 12a9 9 0 0 1-9 9l-3 1 1-3a9 9 0 1 1 11-7z" />
 <path d="M8 11h.01M12 11h.01M16 11h.01" />
 </svg>
);
const BookIcon = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A9650" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5V4.5z" />
 <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v5H6.5A2.5 2.5 0 0 1 4 19.5z" />
 </svg>
);
const SparkIcon = () => (
 <svg width="14" height="14" viewBox="0 0 10 10" aria-hidden="true">
 <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#fff" />
 </svg>
);

type Card = {
 title: string;
 desc: string;
 icon: JSX.Element;
 iconBg: string;
};

const cards: Card[] = [
 { title:"Trilha Personalizada", desc:"Sua jornada com cursos em etapas.", icon: <TrailIcon />, iconBg:"#FFE9D4" },
 { title:"Cury Digital", desc:"IA que te orienta no dia a dia.", icon: <BrainIcon />, iconBg:"#E3ECDD" },
 { title:"Feed de Conteúdo", desc:"Áudios, vídeos e reflexões.", icon: <FeedIcon />, iconBg:"#FFE3CC" },
 { title:"Clube do Livro", desc:"Livros do Dr. Cury mês a mês.", icon: <BookIcon />, iconBg:"#E8EFD9" },
];

const WelcomeScreen = () => {
 const navigate = useNavigate();
 return (
   <AppUserLayout>
 <main className="min-h-[100dvh] lg:min-h-[auto] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 data-fullbleed
 className="relative w-full h-[100dvh] overflow-hidden bg-[#F7F4F2] flex flex-col animate-fade-in"
 style={{ paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 {/* Atmospheric glow */}
 <div
 className="pointer-events-none absolute inset-0"
 style={{
 background:
"radial-gradient(60% 35% at 50% 18%, rgba(248,138,43,0.12) 0%, rgba(248,138,43,0) 70%), radial-gradient(80% 40% at 50% 100%, rgba(248,138,43,0.06) 0%, rgba(248,138,43,0) 70%)",
 }}
 />
 <svg className="pointer-events-none absolute top-0 left-0 w-[200px] h-[160px] opacity-40" viewBox="0 0 200 160" fill="none" aria-hidden="true">
 {[0,1,2,3].map(i => (
 <path key={i} d={`M ${-20 - i*5} ${20 + i*10} Q ${60} ${100 - i*8}, ${220 + i*4} ${20 + i*8}`} stroke="#F88A2B" strokeOpacity={0.16 - i*0.025} strokeWidth="1" fill="none" />
 ))}
 </svg>
 <svg className="pointer-events-none absolute bottom-0 right-0 w-[220px] h-[140px] opacity-50" viewBox="0 0 220 140" fill="none" aria-hidden="true">
 {[0,1,2,3,4].map(i => (
 <path key={i} d={`M ${-20 + i*10} 140 Q ${110} ${60 + i*8}, ${240 - i*6} ${20 + i*8}`} stroke="#F88A2B" strokeOpacity={0.18 - i*0.025} strokeWidth="1" fill="none" />
 ))}
 </svg>

 {/* Content area (no scroll) */}
  <div className="relative z-10 flex-1 min-h-0 overflow-hidden flex flex-col items-center px-6 pt-3 pb-2">
 {/* Illustration */}
 <div className="relative" style={{ animation:"fade-in 1s ease-out" }}>
 <div
 className="absolute inset-0 rounded-full blur-3xl opacity-50"
 style={{ background:"radial-gradient(circle, rgba(248,138,43,0.35), transparent 65%)" }}
 />
 <img
 src={abstractArt}
 alt=""
 className="relative w-[150px] h-[115px] object-contain select-none"
 style={{ mixBlendMode:"multiply", animation:"welcome-breath 5s ease-in-out infinite" }}
 draggable={false}
 />
 </div>

 {/* Brand */}
 <p className="mt-2 text-[10px] tracking-[0.32em] uppercase text-[#F88A2B] font-semibold">
 Bem-vinda ao
 </p>
 <h1 className="mt-1 text-[26px] leading-none text-[#1a1a1a]" style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight: 600, letterSpacing:"-0.02em" }}>
 Meu Caminho
 </h1>
 <div className="mt-1.5 flex items-center gap-2">
 <span className="h-px w-6 bg-[#F88A2B]/50" />
 <p className="text-[9.5px] tracking-[0.32em] uppercase text-[#F88A2B] font-semibold">
 Saúde emocional
 </p>
 <span className="h-px w-6 bg-[#F88A2B]/50" />
 </div>

 {/* Headline */}
 <h2 className="mt-4 text-center text-[24px] leading-[1.15] text-[#1a1a1a]" style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight: 600, letterSpacing:"-0.02em" }}>
 Seu caminho <span className="text-[#F88A2B] italic font-medium">começa</span> agora.
 </h2>

 {/* Subheadline */}
 <p className="mt-2.5 text-center text-[12.5px] leading-[1.5] text-[#666] max-w-[300px]">
 Uma jornada guiada para evoluir sua mente, emoções, relações e qualidade de vida.
 </p>

 {/* Separator */}
 <div className="mt-3">
 <SparkDivider />
 </div>

 {/* Section title */}
 <p className="mt-3 text-[11px] tracking-[0.18em] text-[#666]">
 O que <span className="text-[#F88A2B] font-semibold">você encontra</span> aqui
 </p>

 {/* Cards 2x2 — fills remaining space */}
 <div className="mt-3 w-full flex-1 min-h-0 grid grid-cols-2 gap-2.5 pb-1">
 {cards.map((c) => (
 <div
 key={c.title}
 className="relative bg-white/85 backdrop-blur-sm rounded-[18px] p-3 border border-[#EFEAE5] shadow-[0_4px_14px_-8px_rgba(17,17,17,0.08)] flex flex-col justify-center"
 >
 <div
 className="w-9 h-9 rounded-full flex items-center justify-center mb-2"
 style={{ background: c.iconBg }}
 >
 {c.icon}
 </div>
 <h3 className="text-[12.5px] font-bold text-[#111] leading-tight">{c.title}</h3>
 <p className="mt-1 text-[10.5px] leading-[14px] text-[#666]">{c.desc}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Footer (CTA + privacy) */}
 <div className="relative z-10 px-6 pb-3 pt-2 shrink-0">
 <button
 onClick={() => navigate("/home")}
 className="relative h-[58px] w-full rounded-full flex items-center justify-center gap-2.5 text-[15px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
 style={{
 background:"linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
 boxShadow:
"0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.08) inset, 0 14px 32px -10px rgba(248,138,43,0.55), 0 6px 14px -2px rgba(248,138,43,0.30)",
 }}
 >
 <span className="absolute left-6 flex items-center"><SparkIcon /></span>
 Começar minha jornada
 <span className="absolute right-6 flex items-center"><ChevronRight /></span>
 </button>

       <div className="mt-3 flex flex-col items-center justify-center gap-1.5 text-center">
 <ShieldIcon />
 <div className="text-[11.5px] leading-[14px]">
 <p className="font-semibold text-[#111]">Seus dados estão protegidos.</p>
 <p className="text-[#666]">Privacidade e segurança são nossa prioridade.</p>
 </div>
 </div>
 </div>

  {/* Home indicator (mobile only) */}
  <div className="relative z-10 flex justify-center pb-2 shrink-0 lg:hidden">
  <div className="w-[120px] h-[5px] rounded-full bg-black/90" />
  </div>
 </div>

 <style>{`
 @keyframes welcome-breath {
 0%, 100% { transform: scale(1); opacity: 0.95; }
 50% { transform: scale(1.03); opacity: 1; }
 }
 `}</style>
 </main>
   </AppUserLayout>
 );
};

export default WelcomeScreen;
