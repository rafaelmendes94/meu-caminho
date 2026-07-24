import { Link, useNavigate, useSearchParams } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useLocation } from "react-router-dom";
import heroImg from"@/assets/trilha/curso-hero.jpg";
import mod1 from"@/assets/trilha/modulo1.jpg";
import mod2 from"@/assets/trilha/modulo2.jpg";
import mod3 from"@/assets/trilha/modulo3.jpg";
import { useAudienceLink } from "@/hooks/use-audience";
import { useCmsCourse } from "@/hooks/use-cms-items";
import { useMemo } from "react";

const ink900 ="#111111";
const ink600 ="#5A544E";
const ink500 ="#8A847E";
const brand ="#F88A2B";
const sage ="#8FB17D";
const lilac ="#B8B0D6";
const bg ="#F7F4F2";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;

const Signal = () => (
 <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>
);
const Wifi = () => (
 <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>
);
const Battery = () => (
 <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>
);
const ChevL = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevR = ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const Dots = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>;
const PlayCircle = ({ size = 18, color ="#fff" }: { size?: number; color?: string }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l6-3.5-6-3.5z" fill={color} stroke="none"/></svg>
);
const PlayFill = ({ s = 14, c ="#fff" }: { s?: number; c?: string }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M8 5v14l11-7z"/></svg>;
const CheckIcon = ({ c ="#fff" }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>;
const LockIcon = ({ c ="#fff", s = 13 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
const Clock = ({ c = ink500 }: { c?: string }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const PlayIco = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M11 9l4 3-4 3z" fill={brand} stroke="none"/></svg>;
const ClockBig = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={lilac} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const Lotus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sage} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c0-3 1.5-5 3-6 .5 2 0 5-3 6z"/><path d="M12 12c0-3-1.5-5-3-6-.5 2 0 5 3 6z"/><path d="M12 12c-2 0-4 1-5 3 2 .5 4 0 5-3z"/><path d="M12 12c2 0 4 1 5 3-2 .5-4 0-5-3z"/><path d="M12 12c0 2-1 4-3 5-.5-2 0-4 3-5z"/><path d="M12 12c0 2 1 4 3 5 .5-2 0-4-3-5z"/></svg>;

type Mod = { n: number; title: string; desc: string; min: string; status:"done" |"current" |"locked"; img: string };
// Módulos reais serão carregados via CMS (course_modules) — sem mocks.
const modulos: Mod[] = [
 { n: 1, title:"Módulo 1", desc:"—", min:"—", status:"locked", img: mod1 },
 { n: 2, title:"Módulo 2", desc:"—", min:"—", status:"locked", img: mod2 },
 { n: 3, title:"Módulo 3", desc:"—", min:"—", status:"locked", img: mod3 },
];

const ProgressRing = ({ pct = 35 }: { pct?: number }) => {
 const r = 22;
 const c = 2 * Math.PI * r;
 return (
 <div className="relative w-[58px] h-[58px]">
 <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
 <circle cx="28" cy="28" r={r} stroke="#F1E7DC" strokeWidth="4" fill="none" />
 <circle cx="28" cy="28" r={r} stroke={brand} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} />
 </svg>
 <div className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-[#111]" style={{ letterSpacing:"-0.02em" }}>
 {pct}%
 </div>
 </div>
 );
};

const ModCard = ({ m }: { m: Mod }) => {
 const navigate = useNavigate();
 const al = useAudienceLink();
 const isDone = m.status ==="done";
 const isCur = m.status ==="current";
 const isLock = m.status ==="locked";

 const numBg = isDone ? sage : isCur ? brand :"#B8B2AC";
 const titleColor = isLock ?"#9A938C" : ink900;

 return (
 <button
 type="button"
 disabled={isLock}
 onClick={() => !isLock && navigate(al("/aula"))}
 className="group relative w-full flex items-stretch text-left bg-white rounded-[20px] overflow-hidden transition active:scale-[0.995]"
 style={{
 boxShadow: isCur
 ?"0 0 0 1px rgba(248,138,43,0.45), 0 8px 24px -14px rgba(248,138,43,0.35)"
 :"0 2px 10px rgba(17,17,17,0.04), inset 0 0 0 1px rgba(17,17,17,0.05)",
 }}
 >
 <div className="relative w-[108px] shrink-0 overflow-hidden">
 <img src={m.img} alt="" loading="lazy" width={512} height={512} className={`absolute inset-0 w-full h-full object-cover ${isLock ?"grayscale-[40%] opacity-80" :""}`} />
 <div className="absolute inset-0 flex items-center justify-center">
 {isDone && (
 <span className="w-9 h-9 rounded-full flex items-center justify-center bg-white/85 backdrop-blur-sm" style={{ boxShadow:"inset 0 0 0 1px rgba(143,177,125,0.35)" }}>
 <CheckIcon c={sage} />
 </span>
 )}
 {isCur && (
 <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: brand, boxShadow:"0 6px 16px rgba(248,138,43,0.35)" }}>
 <PlayFill s={13} />
 </span>
 )}
 {isLock && (
 <span className="w-9 h-9 rounded-full flex items-center justify-center bg-white/75 backdrop-blur-sm" style={{ boxShadow:"inset 0 0 0 1px rgba(17,17,17,0.08)" }}>
 <LockIcon c="#7A746E" />
 </span>
 )}
 </div>
 {isDone && <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: sage, opacity: 0.7 }} />}
 </div>

 <div className="flex-1 min-w-0 py-3 pl-3 pr-2 flex flex-col justify-center">
 <div className="flex items-center gap-2">
 <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: numBg }}>
 {m.n}
 </span>
 <h4 className="text-[13.5px] truncate" style={{ ...serif, fontWeight: 600, color: titleColor }}>
 {m.title}
 </h4>
 </div>
 <p className="mt-1 text-[11px] leading-[15px]" style={{ color: isLock ?"#A8A29C" : ink600 }}>
 {m.desc}
 </p>
 <div className="mt-1.5 flex items-center gap-1">
 <Clock c={ink500} />
 <span className="text-[10.5px]" style={{ color: ink500 }}>{m.min}</span>
 </div>
 </div>

 <div className="self-center pr-3 pl-1 flex flex-col items-end gap-1.5">
 <span
 className="px-2.5 h-[22px] rounded-full text-[9.5px] font-semibold flex items-center"
 style={{
 background: isDone ?"rgba(143,177,125,0.18)" : isCur ?"rgba(248,138,43,0.16)" :"rgba(184,176,214,0.22)",
 color: isDone ?"#5A8A4A" : isCur ? brand :"#7A6FA8",
 }}
 >
 {isDone ?"Concluído" : isCur ?"Atual" :"Bloqueado"}
 </span>
 <span className="text-[#BFB9B2]">
 {isLock ? <LockIcon c="#BFB9B2" s={13} /> : <ChevR s={13} />}
 </span>
 </div>
 </button>
 );
};

const CursoScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const location = useLocation();
  const isEnterprise = location.pathname.startsWith('/enterprise');
  const [params] = useSearchParams();
  const slug = params.get("slug");
  const { course, modules: dbModules } = useCmsCourse(slug);

  const modImgs = [mod1, mod2, mod3];
  const courseTitle = course?.title || "Inteligência Emocional";
  const courseDesc = course?.short_description || "Aprenda a governar pensamentos, emoções e reações de forma consciente.";
  const courseLongDesc = course?.long_description || course?.short_description || "Uma jornada desenvolvida para fortalecer sua mente, desacelerar pensamentos acelerados e construir inteligência emocional no dia a dia.";

  const hasCms = dbModules.length > 0;
  const firstLesson = useMemo(() => {
    for (const m of dbModules) {
      if (m.lessons.length) return m.lessons[0];
    }
    return null;
  }, [dbModules]);
  const playHref = firstLesson ? al(`/aula?lesson=${firstLesson.id}`) : al("/aula");
  const displayModules: Mod[] = useMemo(() => {
    if (!hasCms) return [];
    return dbModules.map((m, i) => {
      const totalMin = m.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0);
      return {
        n: i + 1,
        title: m.title,
        desc: m.description || "",
        min: totalMin ? `${totalMin} min` : `${m.lessons.length} aulas`,
        // No progress tracking yet — first module is the entry point.
        status: (i === 0 ? "current" : "locked") as Mod["status"],
        img: modImgs[i % modImgs.length],
      };
    });
  }, [dbModules, hasCms]);

  const totalLessons = useMemo(
    () => dbModules.reduce((a, m) => a + m.lessons.length, 0),
    [dbModules]
  );
  const totalMinutes = useMemo(
    () => dbModules.reduce(
      (a, m) => a + m.lessons.reduce((s, l) => s + (l.duration_minutes || 0), 0),
      0
    ),
    [dbModules]
  );
  const formatDuration = (min: number) => {
    if (!min) return "";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? `${h}h${m ? ` ${m}min` : ""}` : `${m}min`;
  };
  // Progress tracking not implemented yet — always 0%.
  const progressPct = 0;

  const Layout = isEnterprise ? EnterpriseUserLayout : (({ children }: { children: React.ReactNode }) => <AppUserLayout>{children}</AppUserLayout>);

  return (
    <Layout title="Curso 1">
      <main className={`${isEnterprise ? 'w-full max-w-full' : 'h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden'} font-display`}>
        <div
          className={`relative w-full ${isEnterprise ? 'bg-transparent' : 'h-[100dvh] overflow-hidden md:ring-black/30 flex flex-col'}`}
          style={!isEnterprise ? { background: bg } : {}}
          aria-label="Curso 1 — Inteligência Emocional"
        >
          {/* Status bar */}
          {/* Header */}
          <div className={`relative flex items-center justify-between px-5 pt-2 pb-1.5 ${isEnterprise ? 'lg:hidden' : ''}`}>
            <button onClick={() => navigate(-1)} aria-label="Voltar" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] ring-1 ring-black/5 active:scale-95 transition" style={{ boxShadow:"0 2px 8px rgba(17,17,17,0.04)" }}>
              <ChevL/>
            </button>
            <h1 className="text-[16px] text-[#111]" style={{ ...serif, fontWeight: 600 }}>{courseTitle}</h1>
            <button aria-label="Mais opções" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] ring-1 ring-black/5 active:scale-95 transition" style={{ boxShadow:"0 2px 8px rgba(17,17,17,0.04)" }}>
              <Dots/>
            </button>
          </div>

          {/* Content */}
          <div className={`relative flex-1 ${isEnterprise ? 'px-0 pt-0 lg:pt-2' : 'pb-6'}`}>
            {/* HERO — clean editorial */}
            <section className="relative px-6 pt-4">
              {/* soft atmospheric background image - only for mobile/app */}
              {!isEnterprise && (
                <div className="absolute inset-x-0 top-0 h-[330px] pointer-events-none overflow-hidden">
                  <img
                    src={heroImg}
                    alt=""
                    width={1024}
                    height={768}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0.55, maskImage:"linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)", WebkitMaskImage:"linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)" }}
                  />
                  <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0.35) 0%, rgba(247,244,242,0.55) 60%, #F7F4F2 100%)" }} />
                </div>
              )}

              <div className="relative">
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c2 3 2 6 0 8-2-2-2-5 0-8z"/><path d="M5 13c3 0 5 1 6 3-3 0-5-1-6-3z"/><path d="M19 13c-3 0-5 1-6 3 3 0 5-1 6-3z"/></svg>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: brand }}>
                    Trilha Personalizada
                  </span>
                </div>

                <h2 className={`mt-3 text-[40px] lg:text-[48px] leading-[1.02] text-[#111]`} style={{ ...serif, fontWeight: 500 }}>
                  {courseTitle}
                </h2>

 {/* delicate underline */}
 <div className="mt-3 flex items-center gap-2">
 <span className="block h-[2px] w-9 rounded-full" style={{ background: brand }} />
 <span className="block h-[1px] w-3 rounded-full bg-[#D8CFC4]" />
 </div>

  <p className="mt-4 text-[13px] lg:text-[16px] leading-[18px] lg:leading-relaxed text-[#666] max-w-[400px]">
  {courseDesc}
  </p>
 </div>
 </section>

 {/* Stats card — Apple wellness */}
 {hasCms && <section className="px-5 mt-5 relative">
 <div
 className="rounded-[22px] p-3.5"
 style={{
 background:"rgba(255,255,255,0.78)",
 backdropFilter:"blur(14px)",
 WebkitBackdropFilter:"blur(14px)",
 boxShadow:"0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 24px -16px rgba(17,17,17,0.10), 0 0 0 1px rgba(17,17,17,0.05)",
 }}
 >
 <div className="grid grid-cols-3 gap-4">
 <div className="flex flex-col items-center text-center">
 <ProgressRing pct={progressPct} />
 <p className="mt-2 text-[10px]" style={{ color: ink500 }}>concluído</p>
 </div>
 <div className="flex flex-col items-center text-center">
 <span className="w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background:"#FFEFD9" }}>
 <PlayIco/>
 </span>
 <p className="mt-2 text-[12px] font-bold text-[#111]">{totalLessons} {totalLessons === 1 ? "aula" : "aulas"}</p>
 <p className="text-[9.5px] -mt-0.5" style={{ color: ink500 }}>no total</p>
 </div>
 <div className="flex flex-col items-center text-center">
 <span className="w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background:"#ECE6F4" }}>
 <ClockBig/>
 </span>
 <p className="mt-2 text-[12px] font-bold text-[#111]">{totalMinutes ? formatDuration(totalMinutes) : "—"}</p>
 <p className="text-[9.5px] -mt-0.5" style={{ color: ink500 }}>de conteúdo</p>
 </div>
 </div>
 </div>
 </section>}

 {/* Description + sprig */}
 <section className="px-6 mt-5 relative">
  <p className="text-[13px] lg:text-[15px] leading-[18px] lg:leading-relaxed text-[#666] max-w-[600px]">
  {courseLongDesc}
  </p>
 <svg className="absolute right-4 top-0 opacity-60" width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#D8CFC4" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
 <path d="M10 54 Q30 30 54 12"/>
 <path d="M22 42 q-4 -10 6 -14"/>
 <path d="M30 34 q-4 -10 6 -14"/>
 <path d="M38 26 q-4 -10 6 -14"/>
 <path d="M18 46 q-8 -2 -10 -10"/>
 <path d="M26 38 q-8 -2 -10 -10"/>
 </svg>
 </section>

 {/* CTA */}
 {hasCms && <section className="px-5 mt-5">
 <Link
 to={playHref}
 className="w-full lg:w-fit lg:px-12 h-14 rounded-full flex items-center justify-center gap-2.5 text-white text-[15px] font-bold active:scale-[0.98] transition shadow-lg shadow-[#F88A2B]/20"
 style={{
 background:"linear-gradient(180deg, #FFA75C 0%, #F88A2B 100%)",
 }}
 >
 <PlayCircle size={20} />
 <span>{progressPct > 0 ? "Continuar curso" : "Iniciar curso"}</span>
 </Link>
 </section>}

 {/* Modules */}
 <section className="px-5 mt-7">
 <div className="flex items-end justify-between mb-3">
 <h3 className="text-[18px] text-[#111]" style={{ ...serif, fontWeight: 600 }}>Módulos</h3>
 {hasCms && (
 <Link to={al("/modulos")} className="flex items-center gap-1 text-[11.5px] font-semibold active:scale-95 transition" style={{ color: brand }}>
 Ver todos <ChevR s={11}/>
 </Link>
 )}
 </div>
 {hasCms ? (
  <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6 gap-2.5">
  {displayModules.map((m) => <ModCard key={m.n} m={m} />)}
  </div>
 ) : (
  <div className="rounded-[20px] bg-white/70 border border-black/5 p-6 text-center">
   <p className="text-[13px] text-[#666]">Este curso ainda não possui módulos publicados.</p>
   <p className="text-[11px] text-[#999] mt-1">Assim que a organização publicar o conteúdo, ele aparecerá aqui.</p>
  </div>
 )}
 </section>

 {/* Prova Final — clickable but visually pending */}
 {hasCms && <section className="px-5 mt-5">
 <Link
 to={al("/prova-final")}
 className="block w-full rounded-[22px] p-4 relative overflow-hidden active:scale-[0.99] transition"
 style={{
 background:"linear-gradient(135deg, #FFFFFF 0%, #FFF7EE 100%)",
 boxShadow:"0 0 0 1px rgba(248,138,43,0.25), 0 8px 24px -16px rgba(248,138,43,0.35)",
 }}
 >
 <div className="flex items-center gap-3">
 <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background:"linear-gradient(180deg, #FFE3CC 0%, #FFD1A8 100%)" }}>
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
 <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
 <path d="M14 3v5h5"/>
 <path d="M9 14l2 2 4-4"/>
 </svg>
 <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-white" style={{ boxShadow:"0 2px 6px rgba(17,17,17,0.12)" }}>
 <LockIcon c={brand} s={11}/>
 </span>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[9.5px] font-bold uppercase tracking-[0.2em]" style={{ color: brand }}>Pós Curso</p>
 <h4 className="mt-0.5 text-[15px] text-[#111] truncate" style={{ ...serif, fontWeight: 600 }}>Prova Final</h4>
 <p className="text-[11px] leading-[15px] mt-0.5" style={{ color: ink500 }}>Libera ao concluir todas as aulas · toque para conhecer.</p>
 </div>
 <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background:"rgba(248,138,43,0.10)", color: brand }}>
 <ChevR s={13}/>
 </span>
 </div>
 <div className="mt-3 flex items-center gap-2">
 <div className="flex-1 h-1.5 rounded-full bg-[#F1ECE6] overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background:"linear-gradient(90deg, #F88A2B 0%, #FFB778 100%)" }}/>
 </div>
 <span className="text-[10px] font-semibold" style={{ color: brand }}>0/{totalLessons} aulas</span>
 </div>
 </Link>
 </section>}
 <section className="mt-10 mb-2 max-w-4xl mx-auto">
 <div
 className="relative rounded-[32px] bg-white p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10 overflow-hidden"
 style={{ boxShadow:"0 10px 30px rgba(0,0,0,0.03), inset 0 0 0 1px rgba(0,0,0,0.04)" }}
 >
 <span className="absolute left-6 top-4 text-[60px] leading-none" style={{ ...serif, color: brand, opacity: 0.15 }}>“</span>
 <div className="flex-1 min-w-0 pl-4 pt-4 text-center lg:text-left relative z-10">
 <p className="text-[18px] lg:text-[22px] leading-relaxed text-[#111]" style={{ ...serif, fontWeight: 500 }}>
 A mente humana é um jardim. O que você cultiva cresce.
 </p>
 <p className="mt-4 text-[11px] font-bold tracking-[0.3em]" style={{ color: brand }}>— DR. AUGUSTO CURY</p>
 </div>
 <svg className="absolute right-3 bottom-2 opacity-30 hidden lg:block" width="80" height="60" viewBox="0 0 80 60" fill="none" stroke="#D8CFC4" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
 <path d="M70 50 Q40 30 14 14"/>
 <path d="M40 30 q4 -10 -6 -14"/>
 <path d="M52 38 q4 -10 -6 -14"/>
 <path d="M28 22 q4 -10 -6 -14"/>
 <ellipse cx="60" cy="50" rx="18" ry="6" />
 </svg>
 </div>
 </section>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default CursoScreen;
