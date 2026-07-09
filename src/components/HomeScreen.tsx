import { Link, useLocation } from"react-router-dom";
import { useState } from"react";
import NotificationsSheet from"./NotificationsSheet";
import { useDisplayUser } from "@/hooks/use-display-user";

/* ============ Status bar ============ */
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
 <path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z" />
 <path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z" />
 <circle cx="8" cy="10" r="1" />
 </svg>
);
const BatteryIcon = () => (
 <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
 <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5" />
 <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
 <rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
 </svg>
);

const ink900 ="#111111";
const ink700 ="#444444";
const ink500 ="#666666";
const ink400 ="#999999";
const brand ="#F88A2B";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

/* ============ Icons ============ */
const BellIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
 <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
 </svg>
);
const ChevronRight = ({ size = 14 }: { size?: number }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M9 6l6 6-6 6" />
 </svg>
);
const SparkIcon = ({ size = 14, color ="#FFFFFF" }: { size?: number; color?: string }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
 <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
 </svg>
);
const PlayDot = ({ color ="#F88A2B" }: { color?: string }) => (
 <svg width="11" height="11" viewBox="0 0 24 24" fill={color} aria-hidden="true">
 <path d="M8 5v14l11-7z" />
 </svg>
);

/* ============ Module icons ============ */
const TrailIcon = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F88A2B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M6 21c0-5 3-7 6-7M14 14c2 0 4-1 5-3" />
 <path d="M9 8a3 3 0 1 1 6 0c0 2-3 3-3 3s-3-1-3-3z" />
 <circle cx="12" cy="8" r="1" fill="#F88A2B" stroke="none" />
 </svg>
);
const BrainIcon = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A9F6A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M9 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V5z" />
 <path d="M15 5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V5z" />
 <path d="M9 11h2M13 11h2M9 15h2M13 15h2" />
 </svg>
);
const FeedSquareIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B8AC9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <circle cx="12" cy="12" r="9" />
 <path d="M10 9v6l5-3-5-3z" fill="#9B8AC9" stroke="#9B8AC9" />
 </svg>
);
const BookIcon = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A9F6A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z" />
 <path d="M8 7h6M8 10h6" />
 </svg>
);

const NextLessonIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F88A2B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <circle cx="12" cy="12" r="9" />
 <path d="M10 9v6l5-3-5-3z" fill="#F88A2B" stroke="#F88A2B" />
 </svg>
);
const LeafIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A9F6A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z" />
 <path d="M5 19c4-4 7-7 9-9" />
 </svg>
);
const HeadphonesIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B8AC9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <path d="M4 14a8 8 0 0 1 16 0" />
 <rect x="3" y="13" width="4" height="7" rx="1.5" />
 <rect x="17" y="13" width="4" height="7" rx="1.5" />
 </svg>
);

/* ============ Path illustration ============ */
const PathIllustration = () => (
 <svg width="120" height="110" viewBox="0 0 120 110" fill="none" aria-hidden="true">
 {/* sun arcs */}
 <g opacity="0.55" stroke="#F88A2B" strokeWidth="0.6" fill="none">
 <path d="M20 60 Q60 10 100 60" />
 <path d="M28 60 Q60 18 92 60" />
 <path d="M36 60 Q60 26 84 60" />
 <path d="M44 60 Q60 34 76 60" />
 </g>
 {/* sun */}
 <circle cx="60" cy="50" r="6" fill="#F88A2B" opacity="0.85" />
 {/* horizon haze */}
 <ellipse cx="60" cy="65" rx="44" ry="6" fill="#F88A2B" opacity="0.18" />
 {/* path */}
 <path d="M30 100 Q55 72 60 60 Q66 50 78 56 Q90 60 92 90" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.95" />
 <path d="M30 100 Q55 72 60 60 Q66 50 78 56 Q90 60 92 90" stroke="#E9D6BD" strokeWidth="1.2" strokeLinecap="round" fill="none" />
 {/* leaves */}
 <g fill="#7A9F6A" opacity="0.75">
 <path d="M14 70 Q22 64 30 70 Q22 74 14 70z" />
 <path d="M16 78 Q23 73 30 78 Q23 82 16 78z" />
 </g>
 <g fill="#7A9F6A" opacity="0.75">
 <path d="M106 68 Q98 62 90 68 Q98 72 106 68z" />
 <path d="M104 76 Q97 71 90 76 Q97 80 104 76z" />
 </g>
 </svg>
);

/* ============ Mock ============ */
const trilha = {
 curso:"Domínio Emocional",
 meta:"Curso 1 de 3 · Inteligência Emocional",
 progresso: 35,
 etapas: { feitas: 4, total: 12 },
 proxima:"Como controlar pensamentos acelerados",
};

const modules = [
 {
 label:"Trilha Personalizada",
 desc:"Sua jornada prescrita com três cursos organizados em etapas.",
 Icon: TrailIcon,
 to:"/trilha",
 iconBg:"#FFE3CC",
 arrowColor:"#F88A2B",
 },
 {
 label:"Cury Digital",
 desc:"Uma IA conversacional para te orientar no dia a dia.",
 Icon: BrainIcon,
 to:"/cury-digital",
 iconBg:"#E3ECDD",
 arrowColor:"#7A9F6A",
 },
 {
 label:"Feed de Conteúdo",
 desc:"Áudios, vídeos, podcasts e reflexões para sua rotina.",
 Icon: FeedSquareIcon,
 to:"/feed",
 iconBg:"#EDE6F5",
 arrowColor:"#9B8AC9",
 },
 {
 label:"Clube do Livro",
 desc:"A biblioteca dos livros do Dr. Augusto Cury, liberada mês a mês.",
 Icon: BookIcon,
 to:"/biblioteca",
 iconBg:"#E3ECDD",
 arrowColor:"#7A9F6A",
 },
];

const proximosPassos = [
 {
 label:"Próxima aula",
 title:"Como controlar pensamentos acelerados",
 sub:"8 min",
 Icon: NextLessonIcon,
 iconBg:"#FFE3CC",
 accentLabel:"#F88A2B",
 accentSub:"#F88A2B",
 to:"/conteudo/video",
 },
 {
 label:"Exercício",
 title:"Respiração consciente",
 sub:"5 min",
 Icon: LeafIcon,
 iconBg:"#E3ECDD",
 accentLabel:"#7A9F6A",
 accentSub:"#7A9F6A",
 to:"/conteudo/leitura",
 },
 {
 label:"Áudio do dia",
 title:"Mensagem para fortalecer sua mente",
 sub:"4 min",
 Icon: HeadphonesIcon,
 iconBg:"#EDE6F5",
 accentLabel:"#9B8AC9",
 accentSub:"#9B8AC9",
 to:"/conteudo/audio",
 },
];

const moods = [
 { e:"🌧", k:"pesado" },
 { e:"🌥", k:"neutro" },
 { e:"🌤", k:"leve" },
 { e:"☀️", k:"ótimo" },
 { e:"✨", k:"inspirado" },
] as const;

const MoodCheckIn = () => {
 const [mood, setMood] = useState<string | null>(null);
 return (
 <div className="mt-3 rounded-[22px] bg-white/85 backdrop-blur p-3.5" style={{ boxShadow:"0 6px 20px -14px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(17,17,17,0.04)" }}>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-[10px] uppercase tracking-[0.16em] font-bold" style={{ color: ink400 }}>Como você chega hoje?</p>
 <p className="text-[12px] mt-0.5" style={{ color: ink500 }}>Seu check-in alimenta as recomendações.</p>
 </div>
 <div className="text-right leading-tight">
 <p className="text-[18px] font-semibold" style={{ ...serif, color: brand }}>7</p>
 <p className="text-[9px] uppercase tracking-wider" style={{ color: ink400 }}>dias seguidos</p>
 </div>
 </div>
 <div className="mt-3 flex items-center justify-between">
 {moods.map((m) => {
 const sel = mood === m.k;
 return (
 <button
 key={m.k}
 onClick={() => setMood(m.k)}
 className="flex flex-col items-center gap-1 active:scale-95 transition"
 >
 <span
 className="w-11 h-11 rounded-full flex items-center justify-center text-[20px] transition"
 style={{
 background: sel ?"linear-gradient(135deg,#FFE3C4,#F8C58A)" :"#F4EDE4",
 boxShadow: sel ?"0 6px 14px -8px rgba(248,138,43,0.55), inset 0 0 0 1px rgba(248,138,43,0.4)" :"inset 0 0 0 1px rgba(0,0,0,0.04)",
 }}
 >
 {m.e}
 </span>
 <span className="text-[9.5px] capitalize" style={{ color: sel ? brand : ink400, fontWeight: sel ? 600 : 500 }}>{m.k}</span>
 </button>
 );
 })}
 </div>
 </div>
 );
};

import { AppUserLayout } from "./layouts/AppUserLayout";

const HomeScreen = () => {
  const isEnterprise = useLocation().pathname.startsWith('/enterprise');
  const { firstName } = useDisplayUser();
  const userName = firstName;

 const [notifOpen, setNotifOpen] = useState(false);
  return (
   <AppUserLayout>
     <div className="relative min-h-[100dvh] bg-[#F7F4F2] animate-fade-in">

 {/* Atmospheric glow */}
 <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
 <span
 className="absolute -top-24 right-[-60px] w-[280px] h-[280px] rounded-full"
 style={{ background:"radial-gradient(circle, rgba(248,138,43,0.18) 0%, rgba(248,138,43,0) 65%)" }}
 />
 <span
 className="absolute top-[40%] -left-20 w-[260px] h-[260px] rounded-full"
 style={{ background:"radial-gradient(circle, rgba(143,177,125,0.10) 0%, rgba(143,177,125,0) 65%)" }}
 />
 <svg
 className="absolute top-12 right-0 opacity-40"
 width="200" height="120" viewBox="0 0 200 120" fill="none"
 >
 <path d="M0 80 Q60 40 200 60" stroke="#F88A2B" strokeWidth="0.5" fill="none" opacity="0.5" />
 <path d="M0 95 Q70 55 200 75" stroke="#F88A2B" strokeWidth="0.5" fill="none" opacity="0.4" />
 </svg>
 </div>

 {/* Scrollable content */}
 <div className="relative px-5 pt-6 pb-4">
 {/* Header */}
 <header className="flex items-start justify-between px-1">
 <div>
 <h1 className="text-[34px] leading-[1.05] text-[#111]" style={{ ...serif, fontWeight: 600 }}>
 Olá, {userName}
 </h1>
 <p className="mt-1.5 text-[13px] leading-[18px]" style={{ color: ink500 }}>
 Seu caminho continua hoje.
 </p>
 </div>
 <button
 onClick={() => setNotifOpen(true)}
 className="relative w-10 h-10 rounded-full bg-white/70 backdrop-blur flex items-center justify-center shadow-[0_2px_10px_rgba(17,17,17,0.05)] ring-1 ring-black/5 active:scale-95 transition-transform"
 aria-label="Notificações"
 style={{ color: ink900 }}
 >
 <BellIcon />
 <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#F88A2B] ring-2 ring-white" />
 </button>
 </header>

 {/* Pausa do dia */}
 <Link
 to="/conteudo/audio"
 className="block relative overflow-hidden rounded-[26px] p-4 mt-4 active:scale-[0.99] transition"
 style={{
 background:"linear-gradient(135deg, #FFF1DD 0%, #FCE3C5 55%, #F4D0AA 100%)",
 boxShadow:"0 12px 30px -18px rgba(178,108,40,0.45), inset 0 1px 0 rgba(255,255,255,0.55)",
 }}
 aria-label="Pausa do dia — meditação guiada"
 >
 <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full" style={{ background:"radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)" }} aria-hidden="true" />
 <div className="relative flex items-start gap-3">
 <span className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/70 backdrop-blur shadow-sm shrink-0">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
 <circle cx="12" cy="12" r="4" />
 <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" />
 </svg>
 </span>
 <div className="flex-1 min-w-0">
 <p className="text-[10.5px] uppercase tracking-[0.18em] font-semibold" style={{ color:"#9C5A1A" }}>Pausa do dia</p>
 <p className="mt-1 text-[15.5px] leading-snug text-[#3D2A18]" style={{ ...serif, fontWeight: 500 }}>
 Respire fundo. Seu dia merece um instante de silêncio.
 </p>
 <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color:"#7A4316" }}>
 <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
 3 min · meditação guiada
 </div>
 </div>
 </div>
 </Link>

 {/* Mood check-in */}
 <MoodCheckIn />

 {/* Hero — Sua evolução */}
 <section className="mt-5" aria-label="Sua evolução">
 <div
 className="relative rounded-[26px] overflow-hidden p-5"
 style={{
 background:"linear-gradient(140deg, #FFFFFF 0%, #FFF6EE 60%, #FFE9D4 100%)",
 boxShadow:"0 18px 44px -22px rgba(248,138,43,0.30), inset 0 0 0 1px rgba(248,138,43,0.10)",
 }}
 >
 {/* Path illustration */}
 <div className="absolute top-3 right-2 opacity-95 pointer-events-none">
 <PathIllustration />
 </div>

 <div className="relative">
 <p className="text-[10.5px] font-bold uppercase tracking-[0.22em]" style={{ color: brand }}>
 Sua evolução
 </p>
 <h2 className="mt-2 text-[24px] leading-[1.1] text-[#111]" style={{ ...serif, fontWeight: 600 }}>
 {trilha.curso}
 </h2>
 <p className="mt-1 text-[12px]" style={{ color: ink500 }}>
 {trilha.meta}
 </p>

 {/* Progress block */}
 <div className="mt-4 flex items-center gap-3">
 <span
 className="text-[40px] leading-none italic"
 style={{ ...serif, color: brand, fontWeight: 500 }}
 >
 {trilha.progresso}%
 </span>
 <span className="w-px h-10 bg-[#F88A2B]/30" />
 <div>
 <p className="text-[14px] font-bold leading-tight" style={{ color: ink900 }}>
 {trilha.etapas.feitas} de {trilha.etapas.total}
 </p>
 <p className="text-[11.5px]" style={{ color: ink500 }}>
 etapas concluídas
 </p>
 </div>
 </div>

 {/* Progress bar */}
 <div className="mt-3 relative h-2 rounded-full bg-white/80 shadow-inner overflow-visible">
 <div
 className="h-full rounded-full relative"
 style={{
 width: `${trilha.progresso}%`,
 background:"linear-gradient(90deg, #F88A2B 0%, #FFB778 100%)",
 boxShadow:"0 0 14px rgba(248,138,43,0.55)",
 }}
 >
 <span
 className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white"
 style={{ boxShadow:"0 2px 8px rgba(248,138,43,0.55), 0 0 0 1px rgba(248,138,43,0.4)" }}
 />
 </div>
 </div>

 {/* Próxima aula */}
 <div className="mt-5 flex items-center gap-3">
 <span
 className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 ring-1 ring-[#F88A2B]/15"
 >
 <PlayDot color="#F88A2B" />
 </span>
 <div className="min-w-0">
 <p className="text-[11px]" style={{ color: ink500 }}>Próxima aula:</p>
 <p className="text-[13px] font-bold leading-snug truncate" style={{ color: ink900 }}>
 {trilha.proxima}
 </p>
 </div>
 </div>

 {/* CTA full width */}
 <Link
 to="/trilha"
 className="mt-4 flex items-center justify-between rounded-full pl-4 pr-3.5 h-[52px] active:scale-[0.985] transition"
 style={{
 background:"linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
 boxShadow:
"0 14px 30px -10px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.08)",
 }}
 >
 <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center">
 <SparkIcon size={13} />
 </span>
 <span className="text-[15px] font-bold text-white tracking-tight">Continuar jornada</span>
 <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white">
 <ChevronRight size={14} />
 </span>
 </Link>
 </div>
 </div>
 </section>

 {/* Grid das áreas */}
 <section className="mt-5" aria-label="Suas áreas">
 <div className="grid grid-cols-2 gap-3">
 {modules.map(({ label, desc, Icon, to, iconBg, arrowColor }) => (
 <Link
 key={label}
 to={to}
 className="relative rounded-[22px] p-3.5 h-[150px] flex flex-col bg-white/85 backdrop-blur-sm overflow-hidden active:scale-[0.985] transition"
 style={{
 boxShadow:"0 6px 20px rgba(17,17,17,0.05), inset 0 0 0 1px rgba(17,17,17,0.04)",
 }}
 >
 <div
 className="w-11 h-11 rounded-full flex items-center justify-center mb-2"
 style={{ background: iconBg }}
 >
 <Icon />
 </div>
 <p className="text-[13.5px] font-bold leading-tight tracking-tight text-[#111]">
 {label}
 </p>
 <p className="mt-1 text-[10.5px] leading-[14px] flex-1" style={{ color: ink500 }}>
 {desc}
 </p>
 <span className="self-end" style={{ color: arrowColor }}>
 <ChevronRight size={13} />
 </span>
 </Link>
 ))}
 </div>
 </section>

 {/* Próximo passo */}
 <section className="mt-5" aria-label="Próximo passo">
 <div className="flex items-center justify-between mb-2.5 px-1">
 <h3 className="text-[13px] font-bold flex items-center gap-1.5" style={{ color: ink900 }}>
 <SparkIcon size={12} color="#F88A2B" />
 Próximo passo
 </h3>
 <Link to="/trilha" className="text-[11.5px] font-semibold flex items-center gap-1" style={{ color: brand }}>
 Ver agenda <ChevronRight size={11} />
 </Link>
 </div>
 <div className="grid grid-cols-3 gap-2.5">
 {proximosPassos.map(({ label, title, sub, Icon, iconBg, accentLabel, accentSub, to }) => (
 <Link
 key={label}
 to={to}
 className="rounded-[18px] bg-white/85 backdrop-blur-sm p-3 flex flex-col"
 style={{ boxShadow:"0 4px 14px rgba(17,17,17,0.04), inset 0 0 0 1px rgba(17,17,17,0.04)" }}
 >
 <div
 className="w-9 h-9 rounded-full flex items-center justify-center mb-2"
 style={{ background: iconBg }}
 >
 <Icon />
 </div>
 <p
 className="text-[8.5px] font-bold uppercase tracking-[0.14em]"
 style={{ color: accentLabel }}
 >
 {label}
 </p>
 <p className="mt-1 text-[11.5px] font-bold leading-[14px] text-[#111]">
 {title}
 </p>
 <p className="mt-1.5 text-[10.5px] font-semibold" style={{ color: accentSub }}>
 {sub}
 </p>
 </Link>
 ))}
 </div>
 </section>

 {/* Insight do dia */}
 <section className="mt-5 mb-2" aria-label="Insight emocional do dia">
 <div
 className="relative rounded-[22px] p-5 overflow-hidden"
 style={{
 background:"linear-gradient(135deg, #FFFFFF 0%, #FFF6EE 100%)",
 boxShadow:"0 6px 22px rgba(17,17,17,0.05), inset 0 0 0 1px rgba(248,138,43,0.10)",
 }}
 >
 {/* botanic decoration */}
 <svg
 className="absolute -bottom-2 -right-2 opacity-70"
 width="120" height="110" viewBox="0 0 120 110" fill="none" aria-hidden="true"
 >
 <ellipse cx="80" cy="95" rx="40" ry="6" fill="#F88A2B" opacity="0.25" />
 <circle cx="80" cy="80" r="14" fill="#F88A2B" opacity="0.45" />
 <g stroke="#7A9F6A" strokeWidth="1" fill="none" opacity="0.85">
 <path d="M70 90 Q72 70 78 50" />
 <path d="M78 70 Q84 66 88 60" />
 <path d="M76 78 Q70 74 66 70" />
 <path d="M78 60 Q86 58 92 52" />
 </g>
 <g fill="#7A9F6A" opacity="0.7">
 <ellipse cx="86" cy="58" rx="3" ry="1.5" transform="rotate(-30 86 58)" />
 <ellipse cx="90" cy="52" rx="3" ry="1.5" transform="rotate(-20 90 52)" />
 <ellipse cx="68" cy="72" rx="3" ry="1.5" transform="rotate(40 68 72)" />
 </g>
 </svg>

 <span
 className="absolute top-3 left-4 text-[44px] leading-none"
 style={{ color: brand, ...serif }}
 aria-hidden="true"
 >
"
 </span>
 <p
 className="relative pt-6 pr-16 text-[15px] leading-[1.4] text-[#111]"
 style={{ ...serif, fontWeight: 500 }}
 >
 Governar a mente é aprender a não ser refém dos próprios pensamentos.
 </p>
 <div className="relative mt-3 flex items-center gap-2">
 <span className="w-5 h-px bg-[#F88A2B]" />
 <span className="text-[11.5px] font-semibold" style={{ color: brand }}>
 Augusto Cury
 </span>
 </div>
 </div>
  </section>
  </div>
  </div>
  <NotificationsSheet open={notifOpen} onClose={() => setNotifOpen(false)} />
  </AppUserLayout>
 );
};

export default HomeScreen;
