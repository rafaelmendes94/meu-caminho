import { Link, useNavigate } from"react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import heroImg from"@/assets/trilha/curso-hero.jpg";
import mod1 from"@/assets/trilha/modulo1.jpg";
import mod2 from"@/assets/trilha/modulo2.jpg";
import mod3 from"@/assets/trilha/modulo3.jpg";
import mod4 from"@/assets/trilha/modulo4.jpg";
import mod5 from"@/assets/trilha/modulo5.jpg";
import { useAudienceLink } from "@/hooks/use-audience";

const ink900 ="#111111";
const ink600 ="#5A544E";
const ink500 ="#8A847E";
const brand ="#F88A2B";
const sage ="#8FB17D";
const lilac ="#9B8AC9";
const bg ="#F7F4F2";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;

const Signal = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const Wifi = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const Battery = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const ChevL = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevR = ({ s = 14 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const ChevD = ({ s = 12 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>;
const Dots = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>;
const PlayFill = ({ s = 14, c ="#fff" }: { s?: number; c?: string }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M8 5v14l11-7z"/></svg>;
const Check = ({ c ="#fff" }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>;
const Lock = ({ c ="#fff", s = 13 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
const Clock = ({ c = ink500 }: { c?: string }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const ClockBig = ({ c = lilac }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const Trend = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>;
const Sliders = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h10M18 6h2"/><path d="M4 12h4M12 12h8"/><path d="M4 18h12M20 18h0"/><circle cx="16" cy="6" r="1.5" fill="currentColor"/><circle cx="10" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="18" r="1.5" fill="currentColor"/></svg>;
const Star = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.3 9.4l6-.9L12 3z"/></svg>;
const Sprig = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4c2 3 2 6 0 8-2-2-2-5 0-8z"/><path d="M5 13c3 0 5 1 6 3-3 0-5-1-6-3z"/><path d="M19 13c-3 0-5 1-6 3 3 0 5-1 6-3z"/></svg>;

type Status ="done" |"current" |"locked";
type Mod = { n: number; title: string; desc: string; min: string; status: Status; img: string; progress: number };

const modulos: Mod[] = [
 { n: 1, title:"Entendendo sua mente", desc:"Como os pensamentos moldam emoções e comportamentos.", min:"18 min", status:"done", img: mod1, progress: 100 },
 { n: 2, title:"Pensamentos acelerados", desc:"Aprenda a desacelerar sua mente e recuperar clareza.", min:"22 min", status:"current", img: mod2, progress: 45 },
 { n: 3, title:"Gestão da emoção", desc:"Ferramentas práticas para lidar com ansiedade emocional.", min:"20 min", status:"locked", img: mod3, progress: 0 },
 { n: 4, title:"Autoconhecimento profundo", desc:"Descubra seus padrões emocionais e crenças limitantes.", min:"24 min", status:"locked", img: mod4, progress: 0 },
 { n: 5, title:"Inteligência nas relações", desc:"Como se relacionar melhor e construir conexões saudáveis.", min:"18 min", status:"locked", img: mod5, progress: 0 },
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
 <div className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-[#111]" style={{ letterSpacing:"-0.02em" }}>{pct}%</div>
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
 const barColor = isDone ? sage : isCur ? brand :"#D8D2CB";

 return (
 <button
 type="button"
 disabled={isLock}
 onClick={() => !isLock && navigate(al("/aula"))}
 className="group relative w-full flex items-stretch text-left bg-white rounded-[20px] overflow-hidden transition active:scale-[0.995]"
 style={{
 boxShadow: isCur
 ?"0 0 0 1px rgba(248,138,43,0.45), 0 10px 26px -16px rgba(248,138,43,0.4)"
 :"0 2px 10px rgba(17,17,17,0.04), inset 0 0 0 1px rgba(17,17,17,0.05)",
 }}
 >
 <div className="relative w-[110px] shrink-0 overflow-hidden">
 <img src={m.img} alt="" loading="lazy" width={512} height={512} className={`absolute inset-0 w-full h-full object-cover ${isLock ?"grayscale-[55%] opacity-75" :""}`} />
 {isCur && <div className="absolute inset-0" style={{ background:"linear-gradient(135deg, rgba(255,180,120,0.18), rgba(255,255,255,0))" }} />}
 <div className="absolute inset-0 flex items-center justify-center">
 {isDone && (
 <span className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm" style={{ boxShadow:"inset 0 0 0 1px rgba(143,177,125,0.4)" }}>
 <Check c={sage} />
 </span>
 )}
 {isCur && (
 <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: brand, boxShadow:"0 6px 16px rgba(248,138,43,0.4)" }}>
 <PlayFill s={13} />
 </span>
 )}
 {isLock && (
 <span className="w-9 h-9 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm" style={{ boxShadow:"inset 0 0 0 1px rgba(17,17,17,0.08)" }}>
 <Lock c="#7A746E" />
 </span>
 )}
 </div>
 </div>

 <div className="flex-1 min-w-0 py-3 pl-3 pr-2 flex flex-col justify-center">
 <div className="flex items-center gap-2">
 <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: numBg }}>{m.n}</span>
 <h4 className="text-[13.5px] truncate" style={{ ...serif, fontWeight: 600, color: titleColor }}>{m.title}</h4>
 </div>
 <p className="mt-1 text-[11px] leading-[15px]" style={{ color: isLock ?"#A8A29C" : ink600 }}>{m.desc}</p>
 <div className="mt-1.5 flex items-center gap-1">
 <Clock c={ink500} />
 <span className="text-[10.5px]" style={{ color: ink500 }}>{m.min}</span>
 </div>
 {/* progress bar */}
 <div className="mt-2 h-[2.5px] rounded-full overflow-hidden" style={{ background:"#F0EAE3" }}>
 <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: barColor, boxShadow: isCur ?"0 0 8px rgba(248,138,43,0.5)" :"none" }} />
 </div>
 </div>

 <div className="self-center pr-3 pl-1 flex flex-col items-end gap-1.5">
 <span
 className="px-2.5 h-[22px] rounded-full text-[9.5px] font-semibold flex items-center"
 style={{
 background: isDone ?"rgba(143,177,125,0.18)" : isCur ?"rgba(248,138,43,0.16)" :"rgba(155,138,201,0.16)",
 color: isDone ?"#5A8A4A" : isCur ? brand :"#7A6FA8",
 }}
 >
 {isDone ?"Concluído" : isCur ?"Atual" :"Bloqueado"}
 </span>
 <span className="text-[#BFB9B2]">
 {isLock ? <Lock c="#BFB9B2" s={13} /> : <ChevR s={13} />}
 </span>
 </div>
 </button>
 );
};

const ModulosScreen = () => {
  const al = useAudienceLink();
  return (
  <AppUserLayout>
  <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden md:ring-black/30 flex flex-col"
 style={{ background: bg }}
 aria-label="Curso 1 — Inteligência Emocional"
 >
 {/* warm ambient glows */}
 <div className="pointer-events-none absolute -top-24 -right-16 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.16), transparent 70%)", filter:"blur(8px)" }} />
 <div className="pointer-events-none absolute top-[55%] -left-20 w-[220px] h-[220px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(155,138,201,0.10), transparent 70%)", filter:"blur(8px)" }} />

 {/* Status bar */}
 {/* Header */}
 <div className="relative flex items-center justify-between px-5 pt-2 pb-1.5">
 <Link to={al("/curso")} aria-label="Voltar" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] ring-1 ring-black/5 active:scale-95 transition" style={{ boxShadow:"0 2px 8px rgba(17,17,17,0.04)" }}>
 <ChevL/>
 </Link>
 <h1 className="text-[14px] text-[#111] truncate px-2" style={{ ...serif, fontWeight: 600 }}>
 Curso 1 — Inteligência Emocional
 </h1>
 <button aria-label="Mais opções" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] ring-1 ring-black/5 active:scale-95 transition" style={{ boxShadow:"0 2px 8px rgba(17,17,17,0.04)" }}>
 <Dots/>
 </button>
 </div>

 {/* Scroll */}
 <div className="relative flex-1 pb-8">
 {/* HERO MINI */}
 <section className="relative px-6 pt-4">
 <div className="absolute inset-x-0 top-0 h-[270px] pointer-events-none overflow-hidden">
 <img src={heroImg} alt="" width={1024} height={768} className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.5, maskImage:"linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)", WebkitMaskImage:"linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)" }} />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(247,244,242,0.35) 0%, rgba(247,244,242,0.6) 60%, #F7F4F2 100%)" }} />
 </div>
 <div className="relative">
 <div className="flex items-center gap-1.5">
 <Sprig />
 <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: brand }}>Trilha Personalizada</span>
 </div>
 <h2 className="mt-3 text-[34px] leading-[1.02] text-[#111]" style={{ ...serif, fontWeight: 500 }}>
 Inteligência<br/>Emocional
 </h2>
 <div className="mt-3 flex items-center gap-2">
 <span className="block h-[2px] w-9 rounded-full" style={{ background: brand }} />
 <span className="block h-[1px] w-3 rounded-full bg-[#D8CFC4]" />
 </div>
 <p className="mt-3 text-[12.5px] leading-[18px] max-w-[240px]" style={{ color: ink600 }}>
 Aprenda a governar pensamentos,<br/>emoções e reações.
 </p>
 </div>
 </section>

 {/* PROGRESS CARD */}
 <section className="px-5 mt-5 relative">
 <div
 className="rounded-[22px] p-3.5"
 style={{
 background:"rgba(255,255,255,0.8)",
 backdropFilter:"blur(14px)",
 WebkitBackdropFilter:"blur(14px)",
 boxShadow:"0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 24px -16px rgba(17,17,17,0.10), 0 0 0 1px rgba(17,17,17,0.05)",
 }}
 >
 <div className="grid grid-cols-4 gap-1">
 <div className="flex flex-col items-center text-center">
 <ProgressRing pct={35} />
 <p className="mt-2 text-[9.5px]" style={{ color: ink500 }}>progresso geral</p>
 </div>
 <div className="flex flex-col items-center text-center">
 <span className="w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background:"#E8EFE2" }}>
 <Check c={sage} />
 </span>
 <p className="mt-2 text-[12px] font-bold text-[#111]">2 / 8</p>
 <p className="text-[9.5px] -mt-0.5" style={{ color: ink500 }}>módulos concluídos</p>
 </div>
 <div className="flex flex-col items-center text-center">
 <span className="w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background:"#ECE6F4" }}>
 <ClockBig c={lilac}/>
 </span>
 <p className="mt-2 text-[12px] font-bold text-[#111]">1h 05m</p>
 <p className="text-[9.5px] -mt-0.5" style={{ color: ink500 }}>tempo dedicado</p>
 </div>
 <div className="flex flex-col items-center text-center">
 <span className="w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background:"#FFEFD9" }}>
 <Trend/>
 </span>
 <p className="mt-2 text-[12px] font-bold text-[#111]">Nível 3</p>
 <p className="text-[9.5px] -mt-0.5" style={{ color: ink500 }}>evolução emocional</p>
 </div>
 </div>
 </div>
 </section>

 {/* MÓDULOS */}
 <section className="px-5 mt-7">
 <div className="flex items-end justify-between mb-3">
 <h3 className="text-[20px] text-[#111]" style={{ ...serif, fontWeight: 600 }}>Módulos do curso</h3>
 <button
 className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-white text-[10.5px] font-semibold text-[#111] active:scale-95 transition"
 style={{ boxShadow:"0 2px 8px rgba(17,17,17,0.05), inset 0 0 0 1px rgba(17,17,17,0.06)" }}
 >
 <Sliders/> Ordem padrão <ChevD s={11}/>
 </button>
 </div>
 <div className="flex flex-col gap-2.5">
 {modulos.map((m) => <ModCard key={m.n} m={m} />)}
 </div>
 </section>

 {/* EDITORIAL FINAL CARD */}
 <section className="px-5 mt-6">
 <div
 className="relative rounded-[22px] p-4 pl-16 pr-20 overflow-hidden"
 style={{
 background:"linear-gradient(135deg, #FFF8F1 0%, #FBF1E5 100%)",
 boxShadow:"0 6px 22px -14px rgba(248,138,43,0.25), inset 0 0 0 1px rgba(248,138,43,0.14)",
 }}
 >
 <span className="absolute left-3.5 top-3.5 w-10 h-10 rounded-full bg-white flex items-center justify-center" style={{ boxShadow:"inset 0 0 0 1px rgba(248,138,43,0.25)" }}>
 <Star/>
 </span>
 <p className="text-[12.5px] leading-[18px] text-[#111]" style={{ ...serif, fontWeight: 500 }}>
 Cada módulo foi criado para te aproximar de uma mente mais equilibrada e de uma vida mais leve.
 </p>
 <button className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: brand }}>
 Continue sua jornada. <ChevR s={11}/>
 </button>
 <svg className="absolute right-2 bottom-1 opacity-55" width="78" height="58" viewBox="0 0 80 60" fill="none" stroke="#D8CFC4" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  </AppUserLayout>
  );
};

export default ModulosScreen;
