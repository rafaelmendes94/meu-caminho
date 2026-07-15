import { useState, useEffect, useRef, useMemo } from"react";
import { Link, useNavigate, useLocation, useSearchParams } from"react-router-dom";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { AppUserLayout } from "./layouts/AppUserLayout";
import etapa1Img from"@/assets/trilha/etapa1.jpg";
import prova1Img from"@/assets/trilha/prova1.jpg";
import etapa2Img from"@/assets/trilha/etapa2.jpg";
import prova2Img from"@/assets/trilha/prova2.jpg";
import etapa3Img from"@/assets/trilha/etapa3.jpg";
import diagImg from"@/assets/trilha/diagnostico.jpg";
import heroImg from"@/assets/trilha/hero.jpg";
import { useAudienceLink } from "@/hooks/use-audience";
import { useCmsTrack } from "@/hooks/use-cms-items";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ink900 ="#111111";
const ink500 ="#666666";
const brand ="#F88A2B";
const green ="#7A9F6A";
const purple ="#9B8AC9";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

/* status bar */
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

const ChevronLeft = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
);
const ChevronRight = ({ size = 14 }: { size?: number }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
);
const Dots = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>
);
const PlayFill = ({ size = 14, color ="#fff" }: { size?: number; color?: string }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M8 5v14l11-7z"/></svg>
);
const CheckIcon = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
);
const LockIcon = () => (
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
);
const FlameIcon = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s1 2 3 2c0-3-2-5 1-8z"/></svg>
);
const StarIcon = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.3 9.4l6-.9L12 3z"/></svg>
);
const TrendIcon = () => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
);
const PlayCircle = ({ color = ink500, size = 13 }: { color?: string; size?: number }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 9v6l5-3-5-3z" fill={color}/></svg>
);
const ClockIcon = ({ color = ink500 }: { color?: string }) => (
 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
);
const FileIcon = ({ color = green }: { color?: string }) => (
 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>
);
const FlagIcon = () => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>
);

type Status ="atual" |"concluido" |"bloqueado";

interface Etapa {
 tag: string;
 tagColor: string;
 title: string;
 desc: string;
 meta?: string;
 metaIcon?:"play+clock" |"file";
 status: Status;
 img: string;
}

const etapas: Etapa[] = [
 {
 tag:"ETAPA 1", tagColor: brand,
 title:"Curso 1 · Inteligência Emocional",
 desc:"Entenda suas emoções e aprenda a transformá-las em seu favor.",
 meta:"8 aulas · ~2h 30m", metaIcon:"play+clock",
 status:"atual", img: etapa1Img,
 },
 {
 tag:"PÓS ETAPA 1", tagColor: green,
 title:"Prova Final",
 desc:"Avalie seu aprendizado e consolide seu conhecimento.",
 meta:"Concluída em 12/05", metaIcon:"file",
 status:"concluido", img: prova1Img,
 },
 {
 tag:"ETAPA 2", tagColor: purple,
 title:"Curso 2 · Gestão da Emoção",
 desc:"Aprenda a lidar com desafios e fortalecer sua mente.",
 meta:"8 aulas · ~2h 40m", metaIcon:"play+clock",
 status:"bloqueado", img: etapa2Img,
 },
 {
 tag:"PÓS ETAPA 2", tagColor: purple,
 title:"Prova Final",
 desc:"Teste seus conhecimentos e avance para a próxima etapa.",
 status:"bloqueado", img: prova2Img,
 },
 {
 tag:"ETAPA 3", tagColor: purple,
 title:"Curso 3 · Construindo Relações Saudáveis",
 desc:"Desenvolva vínculos mais saudáveis e comunique-se melhor.",
 meta:"8 aulas · ~2h 30m", metaIcon:"play+clock",
 status:"bloqueado", img: etapa3Img,
 },
 {
 tag:"PÓS ETAPA 3", tagColor: purple,
 title:"Diagnóstico Final",
 desc:"Veja sua evolução completa e receba seu relatório final.",
 status:"bloqueado", img: diagImg,
 },
];

const StatBox = ({ Icon, value, label, bg }: { Icon: () => JSX.Element; value: string; label: string; bg: string }) => (
 <div className="flex items-center gap-2.5">
 <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: bg }}>
 <Icon />
 </span>
 <div className="leading-tight">
 <p className="text-[14px] font-bold text-[#111]">{value}</p>
 <p className="text-[10.5px]" style={{ color: ink500 }}>{label}</p>
 </div>
 </div>
);

const StatusOverlay = ({ status }: { status: Status }) => {
 if (status ==="atual") {
 return (
 <>
 <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
 <div className="absolute inset-0 flex items-center justify-center">
 <span
 className="w-11 h-11 rounded-full flex items-center justify-center"
 style={{
 background:"linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
 boxShadow:"0 6px 18px rgba(248,138,43,0.55)",
 }}
 >
 <PlayFill size={15} />
 </span>
 </div>
 <span
 className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.18em] text-white"
 style={{ background:"rgba(17,17,17,0.85)" }}
 >
 ATUAL
 </span>
 </>
 );
 }
 if (status ==="concluido") {
 return (
 <>
 <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
 <div className="absolute inset-0 flex items-center justify-center">
 <span
 className="w-11 h-11 rounded-full flex items-center justify-center"
 style={{ background: green, boxShadow:"0 6px 18px rgba(122,159,106,0.5)" }}
 >
 <CheckIcon />
 </span>
 </div>
 <span
 className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.18em] text-white"
 style={{ background:"rgba(122,159,106,0.95)" }}
 >
 CONCLUÍDO
 </span>
 </>
 );
 }
 return (
 <>
 <div className="absolute inset-0" style={{ background:"rgba(17,17,17,0.55)" }} />
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:"rgba(255,255,255,0.18)", backdropFilter:"blur(4px)" }}>
 <LockIcon />
 </span>
 </div>
 <span
 className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.18em] text-white"
 style={{ background:"rgba(17,17,17,0.7)" }}
 >
 BLOQUEADO
 </span>
 </>
 );
};

const EtapaCard = ({ e }: { e: Etapa }) => {
 const navigate = useNavigate();
 const al = useAudienceLink();
 const isBlocked = e.status ==="bloqueado";
 const isCurrent = e.status ==="atual";
 const isDone = e.status ==="concluido";

 const arrowColor = isCurrent ? brand : isDone ? green :"#BFBAB4";
 const arrowBg = isCurrent ?"rgba(248,138,43,0.10)" : isDone ?"rgba(122,159,106,0.10)" :"rgba(17,17,17,0.04)";

 const handleClick = () => {
 if (isBlocked) return;
 navigate(al("/curso"));
 };

 return (
 <button
 type="button"
 disabled={isBlocked}
 onClick={handleClick}
 className={`group relative w-full flex items-stretch text-left bg-white rounded-[22px] overflow-hidden transition active:scale-[0.99] ${isBlocked ?"opacity-85" :""}`}
 style={{
  boxShadow: isCurrent
  ?"0 0 0 1.5px #F88A2B, 0 14px 36px -16px rgba(248,138,43,0.3), 0 4px 14px rgba(0,0,0,0.03)"
  :"0 4px 16px rgba(0,0,0,0.03), inset 0 0 0 1px rgba(0,0,0,0.04)",
 }}
 >
 {/* thumbnail */}
 <div className="relative w-[120px] shrink-0 overflow-hidden">
 <img
 src={e.img}
 alt=""
 loading="lazy"
 width={512}
 height={512}
 className={`absolute inset-0 w-full h-full object-cover ${isBlocked ?"grayscale-[35%] brightness-75" :""}`}
 />
 <StatusOverlay status={e.status} />
 </div>

 {/* content */}
 <div className="flex-1 min-w-0 py-3 pl-3.5 pr-2 flex flex-col justify-center">
 <p className="text-[9.5px] font-bold uppercase tracking-[0.2em]" style={{ color: e.tagColor }}>
 {e.tag}
 </p>
 <h3
 className="mt-1 text-[15.5px] leading-[1.2] text-[#111] truncate"
 style={{ ...serif, fontWeight: 600 }}
 >
 {e.title}
 </h3>
 <p className="mt-1 text-[11.5px] leading-[15px]" style={{ color: ink500 }}>
 {e.desc}
 </p>
 {e.meta && (
 <div className="mt-2 flex items-center gap-1.5">
 {e.metaIcon ==="file" ? (
 <>
 <FileIcon color={isDone ? green : ink500} />
 <span className="text-[10.5px] font-semibold" style={{ color: isDone ? green : ink500 }}>{e.meta}</span>
 </>
 ) : (
 <>
 <PlayCircle color={isCurrent ? brand : ink500} />
 <span className="text-[10.5px] font-semibold" style={{ color: isCurrent ? brand : ink500 }}>
 {e.meta?.split("·")[0]?.trim()}
 </span>
 <span className="text-[10px]" style={{ color: ink500 }}>·</span>
 <ClockIcon color={ink500} />
 <span className="text-[10.5px]" style={{ color: ink500 }}>
 {e.meta?.split("·")[1]?.trim()}
 </span>
 </>
 )}
 </div>
 )}
 </div>

 {/* chevron */}
 <div className="self-center pr-3 pl-1">
 <span
 className="w-8 h-8 rounded-full flex items-center justify-center"
 style={{ background: arrowBg, color: arrowColor }}
 >
 <ChevronRight size={13} />
 </span>
 </div>
 </button>
 );
};

const TrilhaScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const location = useLocation();
  const isEnterprise = location.pathname.startsWith('/enterprise');
  const [menuOpen, setMenuOpen] = useState(false);
  const [params] = useSearchParams();
  const slug = params.get("slug");
  const { track, items: trackItems } = useCmsTrack(slug);

  const stageImgs = [etapa1Img, prova1Img, etapa2Img, prova2Img, etapa3Img, diagImg];
  const trackTitle = track?.title || "Domínio Emocional";
  const trackDesc = track?.short_description || "Desenvolva sua inteligência emocional e transforme sua forma de pensar, sentir e agir.";
  const stageColors = [brand, green, purple];

  const displayEtapas: Etapa[] = useMemo(() => {
    if (!trackItems.length) return [];
    return trackItems.map((it, i) => ({
      tag: `ETAPA ${i + 1}`,
      tagColor: stageColors[i % stageColors.length],
      title: it.title,
      desc: it.short_description || "",
      meta: it.duration_minutes ? `${Math.floor(it.duration_minutes / 60)}h ${it.duration_minutes % 60}m` : undefined,
      metaIcon: "play+clock",
      status: (i === 0 ? "atual" : "bloqueado") as Status,
      img: it.cover_url || stageImgs[i % stageImgs.length],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackItems]);

  const hasTrack = displayEtapas.length > 0;

 const menuRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const onClick = (e: MouseEvent) => {
 if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
 };
 if (menuOpen) document.addEventListener("mousedown", onClick);
 return () => document.removeEventListener("mousedown", onClick);
 }, [menuOpen]);

  const LayoutComponent = isEnterprise ? EnterpriseUserLayout : (({ children }: { children: React.ReactNode }) => <AppUserLayout>{children}</AppUserLayout>);

  return (
    <LayoutComponent title="Trilha Personalizada">
      <main className={`${isEnterprise ? 'w-full max-w-full' : 'h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden'} font-display`}>
        <div
          className={`relative w-full ${isEnterprise ? 'bg-transparent' : 'h-[100dvh] overflow-hidden bg-[#F7F4F2] flex flex-col'}`}
          aria-label="Trilha Personalizada"
        >
  {/* Status bar */}
  {/* Header */}
  <div className={`relative flex items-center justify-between px-5 pt-3 pb-2 lg:hidden`}>
  <button
  onClick={() => navigate(location.pathname.startsWith('/enterprise') ? '/enterprise' : '/home')}
  aria-label="Voltar"
  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] shadow-[0_2px_8px_rgba(17,17,17,0.06)] ring-1 ring-black/5 active:scale-95 transition"
  >
  <ChevronLeft />
  </button>
 <h1 className="text-[17px] text-[#111]" style={{ ...serif, fontWeight: 600 }}>
 Trilha Personalizada
 </h1>
 <div className="relative" ref={menuRef}>
 <button
 aria-label="Mais opções"
 onClick={() => setMenuOpen(o => !o)}
 className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] shadow-[0_2px_8px_rgba(17,17,17,0.06)] ring-1 ring-black/5 active:scale-95 transition"
 >
 <Dots />
 </button>
 {menuOpen && (
 <div className="absolute right-0 top-11 z-50 w-[200px] rounded-2xl bg-white py-1.5 ring-1 ring-black/5" style={{ boxShadow:"0 16px 40px -12px rgba(17,17,17,0.18)" }}>
 {[
 { label:"Ver progresso completo", to:"/jornada" },
 { label:"Mudança de trilha", to:"/mudanca-jornada" },
 { label:"Reiniciar trilha", to:"#" },
 { label:"Compartilhar", to:"#" },
 { label:"Configurações", to:"/configuracoes" },
 { label:"Ajuda", to:"/ajuda" },
 ].map((it, i) => (
 <Link
 key={i}
 to={it.to}
 onClick={() => setMenuOpen(false)}
 className="block px-4 py-2.5 text-[13px] text-[#111] hover:bg-[#F7F4F2] transition"
 >
 {it.label}
 </Link>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Scroll content */}
 <div className={`relative flex-1 ${isEnterprise ? 'px-0 pt-0' : 'px-5 pt-3'} pb-6`}>
 {/* Hero */}
 <section>
 <div className={`flex flex-col lg:flex-row lg:items-center items-start justify-between gap-6 lg:gap-10`}>
 <div className="flex-1 min-w-0">
 <p className="text-[10.5px] font-bold uppercase tracking-[0.22em]" style={{ color: brand }}>
 Sua jornada
 </p>
  <h2 className="mt-1.5 text-[28px] lg:text-[42px] leading-[1.05] text-[#111]" style={{ ...serif, fontWeight: 600 }}>
  {trackTitle}
  </h2>
  <p className="mt-2 text-[12.5px] leading-[17px]" style={{ color: ink500 }}>
  {trackDesc}
   </p>
  </div>
  </div>

 {/* stats card */}
  {hasTrack && (
    <div
      className="mt-6 lg:mt-10 rounded-[20px] lg:rounded-[32px] bg-white p-4 lg:p-8"
      style={{ boxShadow:"0 6px 22px rgba(0,0,0,0.03), inset 0 0 0 1px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-end gap-3">
        <div className="leading-none">
          <p className="text-[34px]" style={{ ...serif, color: brand, fontWeight: 600, lineHeight: 1 }}>
            0<span className="text-[18px] align-top">%</span>
          </p>
          <p className="mt-1 text-[10.5px]" style={{ color: ink500 }}>da jornada concluída</p>
        </div>
        <div className="flex-1 pb-1">
          <div className="relative h-1.5 rounded-full bg-[#F1ECE6] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "0%",
                background: "linear-gradient(90deg, #F88A2B 0%, #FFB778 100%)",
              }}
            />
          </div>
          <p className="mt-2 text-[10px]" style={{ color: ink500 }}>
            Seu progresso será registrado a cada etapa concluída.
          </p>
        </div>
      </div>
    </div>
  )}
 </section>

 {/* Sua jornada list */}
 <section className="mt-6">
 <h3 className="text-[15px] lg:text-[18px] font-bold text-[#111] px-1 mb-3 lg:mb-5" style={{ letterSpacing:"-0.01em" }}>
 Sua jornada
 </h3>
  {hasTrack ? (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-6">
      {displayEtapas.map((e, i) => <EtapaCard key={i} e={e} />)}
    </div>
  ) : (
    <div className="rounded-[20px] lg:rounded-[28px] bg-white p-6 lg:p-10 text-center" style={{ boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.05)" }}>
      <p className="text-[14px] lg:text-[16px] text-[#111]" style={{ ...serif, fontWeight: 600 }}>
        Sua trilha ainda não foi publicada.
      </p>
      <p className="mt-1 text-[11.5px] lg:text-[13px]" style={{ color: ink500 }}>
        Assim que sua organização liberar uma trilha personalizada, as etapas aparecerão aqui.
      </p>
    </div>
  )}
 </section>

 {/* Footer encouragement */}
 {hasTrack && (
 <section className="mt-5">
 <div
 className="rounded-[20px] p-3.5 flex items-center gap-3"
 style={{
 background: isEnterprise ? "linear-gradient(135deg, #F8F9FA 0%, #F1F1F1 100%)" : "linear-gradient(135deg, #FFF1E2 0%, #FFE3CC 100%)",
 boxShadow:"inset 0 0 0 1px rgba(248,138,43,0.18)",
 }}
 >
 <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
 <FlagIcon />
 </span>
 <div className="flex-1 min-w-0">
 <p className="text-[13.5px] leading-tight text-[#111]" style={{ ...serif, fontWeight: 600 }}>
 Você está no caminho certo!
 </p>
 <p className="text-[10.5px] mt-0.5" style={{ color: ink500 }}>
 Continue assim e alcance a sua melhor versão.
 </p>
 </div>
 <Link
 to={al("/jornada")}
 className="shrink-0 flex items-center gap-1.5 rounded-full bg-white px-3.5 h-9 text-[11.5px] font-bold text-[#111] active:scale-95 transition"
 style={{ boxShadow:"0 4px 12px rgba(248,138,43,0.18), inset 0 0 0 1px rgba(248,138,43,0.25)" }}
 >
 Ver meu progresso
 <span style={{ color: brand }}><ChevronRight size={11}/></span>
 </Link>
 </div>
 </section>
 )}
 </div>

 </div>
  </main>
   </LayoutComponent>
  );
};

export default TrilhaScreen;
