import { useEffect, useState } from"react";
import { Link } from"react-router-dom";
import { MediaDesktopLayout } from "./layouts/MediaDesktopLayout";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z" /><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z" /><circle cx="8" cy="10" r="1" /></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5" /><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" /><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" /></svg>);

const Chev = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>);
const More = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>);
const Bookmark = ({ filled }: { filled?: boolean }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill={filled ?"currentColor" :"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const Play = ({ size = 30 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>);
const Pause = ({ size = 28 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>);
const Back15 = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><text x="12.5" y="15" fill="#1a1208" stroke="none" fontSize="7" fontWeight="700" textAnchor="middle">15</text></svg>);
const Fwd30 = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1208" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /><text x="11.5" y="15" fill="#1a1208" stroke="none" fontSize="7" fontWeight="700" textAnchor="middle">30</text></svg>);
const PrevTrack = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="#1a1208"><path d="M11 19V5L2 12l9 7z" /><rect x="20" y="5" width="2" height="14" rx="0.6" /></svg>);
const NextTrack = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="#1a1208"><path d="M13 19V5l9 7-9 7z" /><rect x="2" y="5" width="2" height="14" rx="0.6" /></svg>);
const Timer = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>);
const Speed = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8" /><path d="m12 13 4-3M9 2h6" /></svg>);
const List = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></svg>);

const COVER = "";

const fmt = (s: number) => {
 const h = Math.floor(s / 3600);
 const m = Math.floor((s % 3600) / 60);
 const r = Math.floor(s % 60);
 return h > 0 ? `${h}:${m.toString().padStart(2,"0")}:${r.toString().padStart(2,"0")}` : `${m}:${r.toString().padStart(2,"0")}`;
};

const chapters: { n: number; title: string; dur: string; done?: boolean; current?: boolean }[] = [];

const AudiobookScreen = () => {
 const total = 1;
 const [t, setT] = useState(0);
 const [playing, setPlaying] = useState(false);
 const [speed, setSpeed] = useState(1);
 const [saved, setSaved] = useState(false);

 useEffect(() => {
 if (!playing) return;
 const id = setInterval(() => setT((v) => (v + speed >= total ? 0 : v + speed)), 1000);
 return () => clearInterval(id);
 }, [playing, speed, total]);

 const progress = 0;
 const bookProgress = 0;

 return (
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <style>{`
 @keyframes float-a { 0%,100%{transform:translate(0,0)} 50%{transform:translate(8px,-12px)} }
 @keyframes float-b { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-10px,10px)} }
 @keyframes pulse-soft { 0%,100% { box-shadow: 0 0 0 0 rgba(248,138,43,0.5), 0 22px 60px -10px rgba(248,138,43,0.5); } 50% { box-shadow: 0 0 0 12px rgba(248,138,43,0), 0 24px 70px -10px rgba(248,138,43,0.7); } }
 .float-a { animation: float-a 9s ease-in-out infinite; }
 .float-b { animation: float-b 11s ease-in-out infinite; }
 .play-pulse { animation: pulse-soft 2.6s ease-in-out infinite; }
 .no-scrollbar::-webkit-scrollbar { display: none; }
 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
 `}</style>

 <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col" style={{ background:"linear-gradient(180deg, #FFEFD9 0%, #F7E0C0 35%, #EBC79A 100%)" }}>

 {/* Atmospheric warm glows */}
 <div className="absolute inset-0 pointer-events-none">
 <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.45) 0%, rgba(248,138,43,0) 65%)" }} />
 <div className="absolute bottom-[-100px] right-[-60px] w-[320px] h-[320px] rounded-full" style={{ background:"radial-gradient(circle, rgba(232,184,116,0.55) 0%, rgba(232,184,116,0) 65%)" }} />
 <div className="absolute top-[40%] -left-16 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(circle, rgba(122,159,106,0.18) 0%, rgba(122,159,106,0) 65%)" }} />
 <span className="absolute top-[20%] left-[16%] w-1.5 h-1.5 rounded-full bg-white/80 float-a" />
 <span className="absolute top-[28%] right-[18%] w-1 h-1 rounded-full bg-[#7A4A1A]/30 float-b" />
 <span className="absolute top-[60%] left-[10%] w-1 h-1 rounded-full bg-[#F88A2B]/60 float-b" />
 <span className="absolute top-[44%] right-[24%] w-[3px] h-[3px] rounded-full bg-white/70 float-a" />
 </div>

 {/* Status bar */}
 {/* Header */}
 <header className="relative z-10 flex items-center justify-between px-5 pt-2 pb-2 text-[#2A1A0A]">
 <Link to="/biblioteca" aria-label="Voltar" className="w-10 h-10 rounded-full bg-white/55 backdrop-blur ring-1 ring-black/5 flex items-center justify-center active:scale-95 transition" style={{ boxShadow:"0 6px 14px -8px rgba(122,74,26,0.35)" }}>
 <Chev />
 </Link>
 <div className="text-center leading-tight">
 <p className="text-[10px] uppercase tracking-[0.24em] text-[#7A4A1A]/75 font-bold">Audiolivro</p>
 <p className="text-[12.5px] font-semibold tracking-tight" style={{ ...serif }}>Tocando agora</p>
 </div>
 <button aria-label="Mais" className="w-10 h-10 rounded-full bg-white/55 backdrop-blur ring-1 ring-black/5 flex items-center justify-center active:scale-95 transition" style={{ boxShadow:"0 6px 14px -8px rgba(122,74,26,0.35)" }}>
 <More />
 </button>
 </header>

 {/* Body */}
 <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-[100px]">
 {/* Cover with book aesthetic */}
 <div className="relative mt-3 mx-auto w-[210px]">
 <div className="absolute inset-x-2 -bottom-3 h-6 rounded-full" style={{ background:"radial-gradient(ellipse, rgba(58,28,8,0.45) 0%, rgba(58,28,8,0) 70%)", filter:"blur(6px)" }} />
 <div className="relative w-full aspect-[3/4] rounded-[14px] overflow-hidden ring-1 ring-black/10" style={{
 boxShadow:"0 26px 50px -18px rgba(58,28,8,0.55), inset 0 0 0 1px rgba(255,255,255,0.15), -10px 0 0 -6px rgba(122,74,26,0.18), -18px 0 0 -12px rgba(122,74,26,0.10)",
 }}>
 {COVER ? <img src={COVER} alt="Capa do audiolivro" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#3A2818]" />}
 <div className="absolute inset-0" style={{ background:"linear-gradient(160deg, rgba(0,0,0,0) 40%, rgba(40,20,5,0.55) 100%)" }} />
 {/* spine highlight */}
 <span className="absolute inset-y-0 left-0 w-[6px]" style={{ background:"linear-gradient(90deg, rgba(0,0,0,0.35), rgba(0,0,0,0))" }} />
 {/* title overlay */}
 <div className="absolute inset-x-3 bottom-3 text-white">
 <p className="text-[9px] uppercase tracking-[0.24em] text-white/80 font-bold">—</p>
 <p className="mt-1 text-[15px] leading-[1.05]" style={{ ...serif, fontWeight: 600 }}>Audiolivro</p>
 </div>
 </div>
 </div>

 {/* Title */}
 <div className="mt-7 text-center text-[#2A1A0A]">
 <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#7A4A1A] font-bold">—</p>
 <h1 className="mt-1.5 text-[24px] leading-[1.15]" style={{ ...serif, fontWeight: 600 }}>Audiolivro indisponível</h1>
 <p className="mt-1.5 text-[12.5px] text-[#5A3A1F]">Conteúdo será liberado em breve</p>
 </div>

 {/* Book progress */}
 <div className="mt-5 flex items-center justify-between text-[10.5px] font-semibold text-[#7A4A1A] uppercase tracking-[0.16em]">
 <span>Progresso do livro</span>
 <span className="tabular-nums">{Math.round(bookProgress * 100)}%</span>
 </div>
 <div className="mt-1.5 h-1.5 rounded-full bg-[#7A4A1A]/15 overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${bookProgress * 100}%`, background:"linear-gradient(90deg, #F88A2B 0%, #FFB778 100%)", boxShadow:"0 0 10px rgba(248,138,43,0.5)" }} />
 </div>

 {/* Scrubber */}
 <div className="mt-5">
 <div className="relative h-[3px] rounded-full bg-[#2A1A0A]/15">
 <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress * 100}%`, background:"linear-gradient(90deg, #F88A2B, #FFB778)" }} />
 <span className="absolute -top-[5px] w-[13px] h-[13px] rounded-full bg-white -translate-x-1/2" style={{ left: `${progress * 100}%`, boxShadow:"0 2px 8px rgba(248,138,43,0.6), 0 0 0 1px rgba(248,138,43,0.4)" }} />
 </div>
 <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#5A3A1F] tabular-nums">
 <span>{fmt(t)}</span>
 <span>-{fmt(total - t)}</span>
 </div>
 </div>

 {/* Transport */}
 <div className="mt-5 flex items-center justify-center gap-5 text-[#1a1208]">
 <button className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition opacity-70" aria-label="Capítulo anterior"><PrevTrack /></button>
 <button className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition" aria-label="Voltar 15s"><Back15 /></button>
 <button
 onClick={() => setPlaying((v) => !v)}
 aria-label={playing ?"Pausar" :"Tocar"}
 className="w-[78px] h-[78px] rounded-full flex items-center justify-center active:scale-95 transition play-pulse"
 style={{ background:"linear-gradient(180deg, #FFA158 0%, #F88A2B 100%)", boxShadow:"0 22px 50px -10px rgba(248,138,43,0.6), inset 0 1px 0 rgba(255,255,255,0.4)" }}
 >
 {playing ? <Pause /> : <Play />}
 </button>
 <button className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition" aria-label="Avançar 30s"><Fwd30 /></button>
 <button className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition opacity-70" aria-label="Próximo capítulo"><NextTrack /></button>
 </div>

 {/* Tools */}
 <div className="mt-6 grid grid-cols-4 gap-2 text-[#2A1A0A]">
 {[
 { Icon: Timer, label:"15 min" },
 { Icon: Speed, label: `${speed}x`, onClick: () => setSpeed((s) => (s >= 2 ? 0.75 : +(s + 0.25).toFixed(2))) },
 { Icon: () => <Bookmark filled={saved} />, label:"Marcador", onClick: () => setSaved((v) => !v) },
 { Icon: List, label:"Capítulos" },
 ].map(({ Icon, label, onClick }) => (
 <button
 key={label}
 onClick={onClick}
 className="flex flex-col items-center justify-center gap-1 h-[58px] rounded-[16px] bg-white/55 backdrop-blur ring-1 ring-black/5 active:scale-95 transition"
 style={{ boxShadow:"0 6px 14px -8px rgba(122,74,26,0.3)" }}
 >
 <Icon />
 <span className="text-[10.5px] font-semibold tracking-tight text-[#3A2410]">{label}</span>
 </button>
 ))}
 </div>

 {/* Chapters */}
 <section className="mt-7">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#7A4A1A]">Capítulos</h2>
 <span className="text-[11px] text-[#7A4A1A]/70 font-semibold">{chapters.length} capítulos</span>
 </div>
 <div className="rounded-[20px] overflow-hidden bg-white/55 backdrop-blur ring-1 ring-black/5" style={{ boxShadow:"0 10px 28px -16px rgba(122,74,26,0.35)" }}>
 {chapters.length === 0 && (
 <div className="px-4 py-6 text-center text-[12px] text-[#7A4A1A]/70">Nenhum capítulo disponível ainda.</div>
 )}
 {chapters.map((c) => {
 const active = c.current;
 return (
   <MediaDesktopLayout title="Audiolivro" backTo="/biblioteca">
 <button key={c.n} className="w-full flex items-center gap-3 px-4 py-3 text-left active:scale-[0.99] transition border-b border-[#7A4A1A]/8 last:border-b-0" style={active ? { background:"linear-gradient(90deg, rgba(248,138,43,0.18) 0%, rgba(248,138,43,0) 100%)" } : {}}>
 <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold tabular-nums" style={
 active
 ? { background:"linear-gradient(180deg, #FFA158, #F88A2B)", color:"#fff", boxShadow:"0 8px 16px -6px rgba(248,138,43,0.55)" }
 : c.done
 ? { background:"rgba(122,74,26,0.12)", color:"#7A4A1A" }
 : { background:"rgba(122,74,26,0.06)", color:"#7A4A1A" }
 }>
 {active ? <Play size={11} /> : c.done ?"✓" : c.n}
 </span>
 <div className="flex-1 min-w-0">
 <p className="text-[13px] font-semibold tracking-tight truncate text-[#2A1A0A]">{c.title}</p>
 <p className="text-[10.5px] text-[#7A4A1A]/75 mt-0.5 tabular-nums">{c.dur}</p>
 </div>
 {active && <span className="text-[10px] font-bold uppercase tracking-wider text-[#F88A2B]">tocando</span>}
 </button>
   </MediaDesktopLayout>
 );
 })}
 </div>
 </section>

 {/* Quote section removida — sem dados reais */}
 </div>

 {/* Sticky CTA */}
 <div className="absolute bottom-[78px] left-0 right-0 z-20 px-5">
 <button
 onClick={() => setPlaying(true)}
 className="w-full flex items-center justify-center gap-2 h-[52px] rounded-full text-white text-[14px] font-bold tracking-tight active:scale-[0.985] transition"
 style={{ background:"linear-gradient(180deg, #FFA158 0%, #F88A2B 100%)", boxShadow:"0 18px 40px -12px rgba(248,138,43,0.65), inset 0 1px 0 rgba(255,255,255,0.35)" }}
 >
 Continuar ouvindo
 </button>
 </div>

 <div className="relative z-10">
 </div>
 </div>
 </main>
 );
};

export default AudiobookScreen;
