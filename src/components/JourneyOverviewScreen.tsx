import { Link } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useLocation } from "react-router-dom";
import journeyHero from"@/assets/trilha/journey-hero.jpg";
import lockImg from"@/assets/trilha/lock-illustration.jpg";
import curyImg from"@/assets/trilha/cury-portrait.jpg";
import { useAudienceLink } from "@/hooks/use-audience";

const ink900 ="#111111";
const ink500 ="#666666";
const brand ="#F88A2B";
const green ="#8FB17D";
const purple ="#9B8AC9";
const sage ="#E3ECDD";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

/* ── Status bar icons ─────────────────────────────── */
const SignalIcon = () => (
 <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>
);
const WifiIcon = () => (
 <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>
);
const BatteryIcon = () => (
 <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>
);

/* ── icons ─────────────────────────────── */
const ChevronLeft = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>);
const ChevronRight = ({ size=14 }:{size?:number}) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>);
const ShareIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.7l7.6-4.4M8.2 13.3l7.6 4.4"/></svg>);
const Check = ({ size=14, color="#fff" }:{size?:number;color?:string}) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>);
const Lock = ({ size=14, color="#9B8AC9" }:{size?:number;color?:string}) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>);
const ArrowDown = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7l10 10M17 9v8H9"/></svg>);
const ArrowUp = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>);

/* checkpoint icons */
const MountainIcon = ({ color=green }:{color?:string}) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 19l5-8 4 5 3-4 6 7H3z"/><circle cx="17" cy="6" r="1.4"/></svg>);
const SunMtnIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="2.5"/><path d="M3 19l5-7 4 4 3-3 6 6H3z"/></svg>);
const FlagIcon = ({ color=purple }:{color?:string}) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>);

/* etapa icons */
const ClipboardIcon = ({color=green})=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z" fill={color} fillOpacity="0.15"/><path d="M9 12h6M9 16h4"/></svg>);
const BrainIcon = ({color=brand})=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1 4 3 3 0 0 0 4 3V4z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1 4 3 3 0 0 1-4 3V4z"/></svg>);
const ShieldIcon = ({color=purple})=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>);
const UsersIcon = ({color=purple})=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-4 4-4s2 1 2 2"/></svg>);
const TrophyIcon = ({color=purple})=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3M9 18h6M10 14v4M14 14v4M8 21h8"/><circle cx="12" cy="7" r="1.2" fill={color}/></svg>);

/* indicator icons */
const BrainSm = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5a3 3 0 0 0-3 3 3 3 0 0 0-2 4 3 3 0 0 0 1 4 3 3 0 0 0 4 3V5zM15 5a3 3 0 0 1 3 3 3 3 0 0 1 2 4 3 3 0 0 1-1 4 3 3 0 0 1-4 3V5z"/></svg>);
const LotusSm = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A9F6A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c2 3 3 6 3 9-1.5 1-3 1.5-3 1.5s-1.5-.5-3-1.5c0-3 1-6 3-9z"/><path d="M5 11c2 0 5 1 7 4-2 1-5 1-7-1-1-1-1-2 0-3zM19 11c-2 0-5 1-7 4 2 1 5 1 7-1 1-1 1-2 0-3z"/></svg>);
const SunSm = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>);
const HeartSm = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B8AC9" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>);

/* ── Checkpoint pill ─────────────────────────────── */
type Cp = { Icon: () => JSX.Element; bg: string; label: string; sub: string; date: string; active?: boolean; color?: string };
const Checkpoint = ({ c }: { c: Cp }) => (
 <div className="flex flex-col items-center text-center w-[33.33%]">
 <div className="relative">
 {c.active && (
 <span className="absolute inset-0 rounded-full" style={{ boxShadow:"0 0 0 4px rgba(248,138,43,0.18), 0 8px 22px rgba(248,138,43,0.35)" }} />
 )}
 <span className="relative w-12 h-12 rounded-full flex items-center justify-center" style={{ background: c.bg, boxShadow:"inset 0 0 0 1px rgba(17,17,17,0.04)" }}>
 <c.Icon />
 </span>
 </div>
 <p className="mt-2 text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: c.active ? brand :"#8a847d" }}>{c.label}</p>
 <p className="text-[10.5px] mt-0.5" style={{ color: c.active ? brand : ink500, fontWeight: c.active ? 600 : 500 }}>{c.sub}</p>
 <p className="text-[10px] mt-0.5" style={{ color: c.active ? brand :"#9c948c", fontWeight: c.active ? 700 : 500 }}>{c.date}</p>
 </div>
);

/* ── Etapa row ─────────────────────────────── */
type EStatus ="concluido" |"atual" |"bloqueado";
type EItem = { n: string; Icon: React.ComponentType<any>; iconBg: string; title: string; desc: string; status: EStatus; meta?: string; progress?: number };
const etapas: EItem[] = [
 { n:"1", Icon: ClipboardIcon, iconBg: sage, title:"Diagnóstico Inicial", desc:"Conheça seu ponto de partida e seus padrões emocionais.", status:"bloqueado" },
 { n:"2", Icon: () => <BrainIcon color={purple} />, iconBg:"#EFE9F8", title:"Curso 1 · Inteligência Emocional", desc:"Entenda suas emoções e aprenda a transformá-las em seu favor.", status:"bloqueado" },
 { n:"3", Icon: () => <ShieldIcon color={purple} />, iconBg:"#EFE9F8", title:"Curso 2 · Gestão da Emoção", desc:"Aprenda a lidar com desafios e fortalecer sua mente.", status:"bloqueado" },
 { n:"4", Icon: () => <UsersIcon color={purple} />, iconBg:"#EFE9F8", title:"Curso 3 · Relações Saudáveis", desc:"Desenvolva vínculos mais saudáveis e comunique-se melhor.", status:"bloqueado" },
 { n:"5", Icon: () => <TrophyIcon color={purple} />, iconBg:"#EFE9F8", title:"Diagnóstico Final", desc:"Veja sua evolução completa e receba seu relatório final.", status:"bloqueado" },
];

const StatusBadge = ({ s, meta, progress }: { s: EStatus; meta?: string; progress?: number }) => {
 if (s ==="concluido") {
 return (
 <div className="flex flex-col items-end gap-1">
 <span className="px-2.5 h-[22px] rounded-full text-[9px] font-bold tracking-[0.16em] flex items-center" style={{ background: sage, color:"#5e7e51" }}>CONCLUÍDO</span>
 {meta && <span className="text-[9.5px]" style={{ color: ink500 }}>{meta}</span>}
 </div>
 );
 }
 if (s ==="atual") {
 return (
 <div className="flex flex-col items-end gap-1">
 <span className="px-2.5 h-[22px] rounded-full text-[9px] font-bold tracking-[0.16em] flex items-center text-white" style={{ background: brand, boxShadow:"0 4px 12px rgba(248,138,43,0.4)" }}>EM ANDAMENTO</span>
 {typeof progress ==="number" && <span className="text-[9.5px]" style={{ color: brand, fontWeight: 600 }}>{progress}% concluído</span>}
 </div>
 );
 }
 return <span className="px-2.5 h-[22px] rounded-full text-[9px] font-bold tracking-[0.16em] flex items-center" style={{ background:"#EFE9F8", color:"#7a6dab" }}>BLOQUEADO</span>;
};

const EtapaRow = ({ e, isLast }: { e: EItem; isLast: boolean }) => {
 const isCurrent = e.status ==="atual";
 const isDone = e.status ==="concluido";
 const isBlocked = e.status ==="bloqueado";

 const dotBg = isDone ? green : isCurrent ?"#fff" :"#F1ECE6";
 const dotColor = isDone ?"#fff" : isCurrent ? brand :"#9c948c";

 return (
 <div className="relative flex gap-3">
 {/* Timeline rail */}
 <div className="relative flex flex-col items-center w-7 shrink-0">
 <div
 className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${isCurrent ?"ring-2" :""}`}
 style={{
 background: dotBg,
 color: dotColor,
 ...(isCurrent ? { boxShadow:"0 0 0 4px rgba(248,138,43,0.18), 0 6px 16px rgba(248,138,43,0.35)", borderColor: brand } as any : {}),
 }}
 >
 {isDone ? <Check size={13} /> : e.n}
 </div>
 {!isLast && (
 <div
 className="flex-1 w-px mt-1 mb-1"
 style={{
 background: isDone
 ? `linear-gradient(180deg, ${green} 0%, ${green} 50%, #DDD3C7 100%)`
 :"repeating-linear-gradient(180deg, #CFC7BD 0 3px, transparent 3px 7px)",
 }}
 />
 )}
 </div>

 {/* Card */}
 <button
 type="button"
 disabled={isBlocked}
 className="flex-1 mb-3 text-left flex items-center gap-3 bg-white rounded-[18px] p-3 pr-3.5 transition active:scale-[0.99]"
 style={{
 boxShadow: isCurrent
 ?"0 0 0 1.5px #F88A2B, 0 12px 28px -14px rgba(248,138,43,0.5), 0 4px 14px rgba(17,17,17,0.04)"
 :"0 4px 14px rgba(17,17,17,0.04), inset 0 0 0 1px rgba(17,17,17,0.04)",
 opacity: isBlocked ? 0.92 : 1,
 }}
 >
 <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: e.iconBg }}>
 <e.Icon />
 </span>
 <div className="flex-1 min-w-0">
 <h4 className="text-[13.5px] leading-[1.2] text-[#111]" style={{ ...serif, fontWeight: 600 }}>{e.title}</h4>
 <p className="text-[10.5px] mt-0.5 leading-[14px]" style={{ color: ink500 }}>{e.desc}</p>
 </div>
 <div className="flex flex-col items-end gap-1 shrink-0">
 <StatusBadge s={e.status} meta={e.meta} progress={e.progress} />
 <span className="mt-0.5" style={{ color: isCurrent ? brand : isDone ?"#9c948c" :"#bcb4ab" }}>
 {isBlocked ? <Lock /> : <ChevronRight size={13} />}
 </span>
 </div>
 </button>
 </div>
 );
};

/* ── Screen ─────────────────────────────── */
const JourneyOverviewScreen = () => {
  const al = useAudienceLink();
  const location = useLocation();
  const isEnterprise = location.pathname.startsWith('/enterprise');
  
  const Layout = isEnterprise ? EnterpriseUserLayout : (({ children }: { children: React.ReactNode }) => <AppUserLayout>{children}</AppUserLayout>);

  return (
    <Layout title="Visão da Jornada">
      <main className={`${isEnterprise ? 'w-full max-w-full' : 'h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden'} font-display`}>
        <div
          className={`relative w-full ${isEnterprise ? 'bg-transparent' : 'h-[100dvh] overflow-hidden bg-[#F7F4F2] flex flex-col'}`}
          aria-label="Visão da Jornada"
        >
          {/* ambient glow - hidden on enterprise desktop */}
          {!isEnterprise && (
            <>
              <div className="pointer-events-none absolute inset-0" style={{ background:"radial-gradient(60% 28% at 50% 0%, rgba(248,138,43,0.14) 0%, rgba(248,138,43,0) 75%)" }} />
              <div className="pointer-events-none absolute inset-x-0 top-[300px] h-[260px]" style={{ background:"radial-gradient(70% 60% at 80% 50%, rgba(255,193,140,0.18) 0%, transparent 70%)" }} />
            </>
          )}

          {/* Header */}
          <div className={`relative z-10 flex items-center justify-between px-5 pt-2 pb-2 ${isEnterprise ? 'lg:hidden' : ''}`}>
            <Link to={al("/trilha")} aria-label="Voltar" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] shadow-[0_2px_8px_rgba(17,17,17,0.06)] ring-1 ring-black/5 active:scale-95 transition">
              <ChevronLeft />
            </Link>
            <h1 className="text-[17px] text-[#111]" style={{ ...serif, fontWeight: 600 }}>Visão da Jornada</h1>
            <button
              aria-label="Compartilhar"
              onClick={async () => {
                const shareData = {
                  title:"Minha Jornada — Meu Caminho",
                  text:"Estou evoluindo no Domínio Emocional com Augusto Cury.",
                  url: typeof window !=="undefined" ? window.location.href :"",
                };
                try {
                  if (typeof navigator !=="undefined" && (navigator as any).share) {
                    await (navigator as any).share(shareData);
                  } else if (typeof navigator !=="undefined" && navigator.clipboard) {
                    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                    alert("Link copiado para a área de transferência.");
                  }
                } catch {}
              }}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] shadow-[0_2px_8px_rgba(17,17,17,0.06)] ring-1 ring-black/5 active:scale-95 transition"
            >
              <ShareIcon />
            </button>
          </div>

          {/* Content */}
          <div className={`relative z-10 flex-1 ${isEnterprise ? 'px-0 pt-0 lg:pt-2' : 'px-5 pt-3'} pb-8`}>
 {/* Hero */}
 <section className="relative">
 <div className="flex flex-col lg:flex-row lg:items-center items-start justify-between gap-6 lg:gap-10">
 <div className="flex-1 min-w-0 pt-1">
 <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: brand }}>Sua jornada</p>
 <h2 className="mt-1.5 text-[30px] lg:text-[42px] leading-[1.02] text-[#111]" style={{ ...serif, fontWeight: 600 }}>
 Domínio Emocional
 </h2>
 <p className="mt-2 text-[12px] lg:text-[16px] leading-[16px] lg:leading-relaxed text-[#666] max-w-[500px]">
 Uma jornada construída para fortalecer sua mente, emoções e relações.
 </p>
 </div>
 <div className="w-[140px] h-[120px] lg:hidden shrink-0 rounded-[20px] overflow-hidden relative">
 <img src={journeyHero} alt="" className="w-full h-full object-cover" loading="eager" />
 <div className="absolute inset-0" style={{ background:"radial-gradient(60% 60% at 65% 50%, rgba(255,200,140,0.25), transparent 70%)" }} />
 </div>
 </div>

 {/* Mapa da Evolução */}
 <div
 className="mt-5 rounded-[22px] bg-white px-3.5 py-4"
 style={{ boxShadow:"0 6px 22px rgba(17,17,17,0.05), inset 0 0 0 1px rgba(17,17,17,0.04)" }}
 >
 <div className="flex justify-between gap-1">
 <Checkpoint c={{ Icon: () => <MountainIcon color={green} />, bg: sage, label:"MARCO ZERO", sub:"Ponto de partida", date:"08/04/2025" }} />
 <Checkpoint c={{ Icon: SunMtnIcon, bg:"#FFE3CC", label:"VOCÊ AGORA", sub:"Em evolução", date:"35% da jornada", active: true }} />
 <Checkpoint c={{ Icon: () => <FlagIcon color={purple} />, bg:"#EFE9F8", label:"PRÓXIMA EVOLUÇÃO", sub:"Seu melhor futuro", date:"100% da jornada" }} />
 </div>
 {/* progress line */}
 <div className="relative mt-5 lg:mt-8 mx-4 h-2 rounded-full" style={{ background:"#F1ECE6" }}>
 <div
 className="absolute left-0 top-0 h-full rounded-full"
 style={{ width:"35%", background:"linear-gradient(90deg, #8FB17D 0%, #F88A2B 100%)", boxShadow:"0 0 16px rgba(248,138,43,0.5)" }}
 />
 {/* current dot */}
 <span
 className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 w-4 h-4 rounded-full bg-white transition-all duration-1000"
 style={{ left:"35%", boxShadow:"0 0 0 4px #F88A2B, 0 0 0 8px rgba(248,138,43,0.2), 0 6px 16px rgba(248,138,43,0.4)" }}
 />
 </div>
 </div>
 </section>

 {/* Indicadores — em breve (aguarda tabela de check-ins/agregações) */}
 <section className="mt-10 lg:mt-14">
 <div className="rounded-[22px] bg-white px-5 py-6 text-center" style={{ boxShadow:"0 4px 14px rgba(17,17,17,0.04), inset 0 0 0 1px rgba(17,17,17,0.04)" }}>
 <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: brand }}>Evolução emocional</p>
 <p className="mt-2 text-[13px]" style={{ color: ink500 }}>Seus indicadores aparecem aqui após algumas semanas de check-ins.</p>
 </div>
 </section>

 {/* Etapas */}
 <section className="mt-12 lg:mt-16">
 <h3 className="text-[12px] font-bold uppercase tracking-[0.24em] text-[#111] px-1 mb-6">Etapas da transformação</h3>
 <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
 {etapas.map((e, i) => <EtapaRow key={i} e={e} isLast={i === etapas.length - 1} />)}
 </div>
 </section>

 {/* Próximo desbloqueio */}
 <section className="mt-4">
 <div
 className="rounded-[32px] p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10"
 style={{
 background:"linear-gradient(135deg, #FFF6EC 0%, #FFE9D3 100%)",
 boxShadow:"inset 0 0 0 1px rgba(248,138,43,0.18), 0 8px 24px -12px rgba(248,138,43,0.3)",
 }}
 >
 <div className="flex-1 min-w-0 text-center lg:text-left">
 <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: brand }}>Próximo desbloqueio</p>
 <h4 className="mt-2 text-[18px] lg:text-[24px] leading-[1.2] text-[#111]" style={{ ...serif, fontWeight: 600 }}>
 Curso 2 será desbloqueado<br className="hidden lg:block"/> após sua prova final.
 </h4>
 <p className="mt-3 text-[13px] lg:text-[15px] leading-relaxed text-[#666] font-medium">
 Continue sua jornada e avance para o próximo nível da sua evolução.
 </p>
 </div>
 <div className="w-[100px] h-[100px] lg:w-[140px] lg:h-[140px] rounded-[24px] lg:rounded-[32px] overflow-hidden shrink-0 shadow-lg">
 <img src={lockImg} alt="" className="w-full h-full object-cover" loading="lazy" />
 </div>
 </div>
 <Link
 to={al("/prova-final")}
 className="mt-6 w-full lg:w-fit lg:px-12 h-14 rounded-full flex items-center justify-center gap-3 text-white text-[15px] font-bold active:scale-[0.98] transition shadow-lg shadow-[#F88A2B]/20"
 style={{
 background:"linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
 }}
 >
 <span>Continuar jornada</span>
 <ChevronRight size={16} />
 </Link>
 </section>

 {/* Insight editorial */}
 <section className="mt-10 mb-2 max-w-4xl mx-auto">
 <div
 className="relative rounded-[32px] bg-white p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10 overflow-hidden"
 style={{ boxShadow:"0 10px 30px rgba(0,0,0,0.03), inset 0 0 0 1px rgba(0,0,0,0.04)" }}
 >
 <span
 aria-hidden
 className="absolute -top-4 left-6 text-[80px] leading-none"
 style={{ ...serif, color: brand, opacity: 0.15 }}
 >
 “
 </span>
 <div className="flex-1 min-w-0 pl-4 pt-4 text-center lg:text-left relative z-10">
 <p className="text-[18px] lg:text-[22px] leading-relaxed text-[#111]" style={{ ...serif, fontStyle:"italic", fontWeight: 500 }}>
 A maior revolução acontece silenciosamente dentro da mente.
 </p>
 <p className="mt-4 text-[11px] font-bold tracking-[0.3em]" style={{ color: brand }}>— DR. AUGUSTO CURY</p>
 </div>
 <div className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-full overflow-hidden shrink-0 ring-4 ring-[#F88A2B08] shadow-sm relative z-10">
 <img src={curyImg} alt="Augusto Cury" className="w-full h-full object-cover" loading="lazy" />
 </div>
 </div>
 </section>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default JourneyOverviewScreen;
