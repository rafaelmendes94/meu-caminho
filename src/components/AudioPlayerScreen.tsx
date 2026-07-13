import { useEffect, useState } from"react";
import { Link } from"react-router-dom";
import { MediaDesktopLayout } from "./layouts/MediaDesktopLayout";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (
 <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></svg>
);
const WifiIcon = () => (
 <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z" /><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z" /><circle cx="8" cy="10" r="1" /></svg>
);
const BatteryIcon = () => (
 <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5" /><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" /><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" /></svg>
);

const Chevron = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>
);
const MoreIcon = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
);
const PlayIcon = () => (
 <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
);
const PauseIcon = () => (
 <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
);
const SkipBack = () => (
 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 19V5L2 12l9 7z" fill="#fff" /><line x1="22" y1="5" x2="22" y2="19" /></svg>
);
const SkipFwd = () => (
 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 19V5l9 7-9 7z" fill="#fff" /><line x1="2" y1="5" x2="2" y2="19" /></svg>
);
const Back15 = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><text x="12" y="15" fill="#fff" stroke="none" fontSize="7" fontWeight="700" textAnchor="middle">15</text></svg>
);
const Fwd15 = () => (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /><text x="12" y="15" fill="#fff" stroke="none" fontSize="7" fontWeight="700" textAnchor="middle">15</text></svg>
);
const TimerIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
);
const SpeedIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8" /><path d="m12 13 4-3M9 2h6" /></svg>
);
const SaveIcon = ({ filled }: { filled?: boolean }) => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ?"currentColor" :"none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
);
const ShareIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
);
const Heart = ({ filled }: { filled?: boolean }) => (
 <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ?"#FF3B5C" :"none"} stroke={filled ?"#FF3B5C" :"#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 6.6a5.5 5.5 0 0 0-9.3-2.4l-.5.5-.5-.5A5.5 5.5 0 1 0 2.7 12l8.3 8.3 8.3-8.3a5.5 5.5 0 0 0 1.5-5.4z" /></svg>
);

const COVER = "";

const Waveform = ({ progress }: { progress: number }) => {
 const bars = 56;
 const heights = Array.from({ length: bars }, (_, i) => {
 const t = i / bars;
 const v = Math.sin(t * Math.PI * 4) * 0.4 + Math.sin(t * Math.PI * 9 + 1.3) * 0.3 + 0.55;
 return Math.max(0.18, Math.min(1, v));
 });
 return (
 <div className="flex items-center gap-[3px] h-[44px] w-full">
 {heights.map((h, i) => {
 const active = i / bars <= progress;
 return (
 <span
 key={i}
 className="flex-1 rounded-full transition-all"
 style={{
 height: `${h * 100}%`,
 background: active
 ?"linear-gradient(180deg, #FFB778, #F88A2B)"
 :"rgba(255,255,255,0.22)",
 boxShadow: active ?"0 0 8px rgba(248,138,43,0.55)" :"none",
 }}
 />
 );
 })}
 </div>
 );
};

const fmt = (s: number) => {
 const m = Math.floor(s / 60);
 const r = Math.floor(s % 60);
 return `${m}:${r.toString().padStart(2,"0")}`;
};

const AudioPlayerScreen = () => {
  // Sem trilha real conectada — não simular tempo/reprodução.
  const total = 0;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
 const [saved, setSaved] = useState(false);
 const [liked, setLiked] = useState(false);
 const [speed, setSpeed] = useState(1);

  useEffect(() => {
  if (!playing || total <= 0) return;
  const id = setInterval(() => setT((v) => (v + speed >= total ? 0 : v + speed)), 1000);
  return () => clearInterval(id);
  }, [playing, speed, total]);

  const progress = total > 0 ? t / total : 0;

  return (
  <MediaDesktopLayout title="Player de áudio" backTo="/biblioteca">
  <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <style>{`
 @keyframes float-slow { 0%,100%{transform:translate(0,0)} 50%{transform:translate(8px,-12px)} }
 @keyframes float-slower { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-10px,10px)} }
 @keyframes spin-slow { to { transform: rotate(360deg); } }
 @keyframes pulse-soft { 0%,100% { box-shadow: 0 0 0 0 rgba(248,138,43,0.55), 0 20px 60px -10px rgba(248,138,43,0.55); } 50% { box-shadow: 0 0 0 14px rgba(248,138,43,0), 0 22px 70px -10px rgba(248,138,43,0.7); } }
 .float-1 { animation: float-slow 9s ease-in-out infinite; }
 .float-2 { animation: float-slower 11s ease-in-out infinite; }
 .cover-spin { animation: spin-slow 40s linear infinite; }
 .play-pulse { animation: pulse-soft 2.4s ease-in-out infinite; }
 .no-scrollbar::-webkit-scrollbar { display: none; }
 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
 `}</style>

 <div className="relative w-full h-[100dvh] overflow-hidden bg-[#0E0B14] flex flex-col">
 {/* Atmospheric blurred cover background */}
 <div className="absolute inset-0">
 {COVER && <img src={COVER} alt="" className="w-full h-full object-cover scale-125" style={{ filter:"blur(36px) saturate(1.1)" }} />}
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(14,11,20,0.55) 0%, rgba(14,11,20,0.75) 45%, rgba(14,11,20,0.95) 100%)" }} />
 {/* Glow */}
 <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.35) 0%, rgba(248,138,43,0) 65%)" }} />
 <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full" style={{ background:"radial-gradient(circle, rgba(155,138,201,0.28) 0%, rgba(155,138,201,0) 65%)" }} />

 {/* Particles */}
 <span className="absolute top-[18%] left-[14%] w-1.5 h-1.5 rounded-full bg-white/70 float-1" />
 <span className="absolute top-[28%] right-[20%] w-1 h-1 rounded-full bg-white/50 float-2" />
 <span className="absolute top-[55%] left-[10%] w-1 h-1 rounded-full bg-[#FFD9B3]/70 float-2" />
 <span className="absolute top-[68%] right-[12%] w-1.5 h-1.5 rounded-full bg-white/60 float-1" />
 <span className="absolute top-[40%] left-[48%] w-[3px] h-[3px] rounded-full bg-[#F88A2B]/70 float-2" />
 </div>

 {/* Status bar */}
 {/* Header */}
 <header className="relative z-10 flex items-center justify-between px-5 pt-2 pb-3 text-white">
 <Link to="/feed" aria-label="Voltar" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15 flex items-center justify-center active:scale-95 transition">
 <Chevron />
 </Link>
 <div className="text-center leading-tight">
 <p className="text-[10.5px] uppercase tracking-[0.22em] text-white/60 font-semibold">Tocando agora</p>
 <p className="text-[12.5px] font-semibold tracking-tight" style={{ ...serif }}>—</p>
 </div>
 <button aria-label="Mais" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15 flex items-center justify-center text-white active:scale-95 transition">
 <MoreIcon />
 </button>
 </header>

 {/* Body */}
 <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pt-2">
 {/* Cover */}
 <div className="relative mt-2 mx-auto w-[260px] h-[260px]">
 <div className="absolute inset-0 rounded-[36px]" style={{ background:"radial-gradient(circle at 50% 50%, rgba(248,138,43,0.45) 0%, rgba(248,138,43,0) 70%)", filter:"blur(20px)" }} />
 <div className="relative w-full h-full rounded-[32px] overflow-hidden ring-1 ring-white/10" style={{ boxShadow:"0 30px 60px -20px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.06)" }}>
 {COVER ? (
   <img src={COVER} alt="Capa do áudio" className={`w-full h-full object-cover ${playing ?"" :""}`} />
 ) : (
   <div className="w-full h-full bg-white/5" />
 )}
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)" }} />
 </div>
 </div>

 {/* Title */}
 <div className="mt-7 text-center text-white">
 <h1 className="text-[26px] leading-[1.15]" style={{ ...serif, fontWeight: 600 }}>
  Áudio indisponível
 </h1>
 <p className="mt-2 text-[12.5px] text-white/60">Conteúdo será liberado em breve.</p>
 </div>

 {/* Waveform */}
 <div className="mt-7">
 <Waveform progress={progress} />
 <div className="mt-2 flex items-center justify-between text-[11.5px] font-semibold text-white/70 tabular-nums">
 <span>{fmt(t)}</span>
 <span>-{fmt(total - t)}</span>
 </div>
 </div>

 {/* Transport */}
 <div className="mt-5 flex items-center justify-center gap-5 text-white">
 <button className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition opacity-80" aria-label="Voltar 15s"><Back15 /></button>
 <button className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition" aria-label="Anterior"><SkipBack /></button>
 <button
 onClick={() => setPlaying((v) => !v)}
 aria-label={playing ?"Pausar" :"Tocar"}
 className="w-[78px] h-[78px] rounded-full flex items-center justify-center active:scale-95 transition play-pulse"
 style={{ background:"linear-gradient(180deg, #FFA158 0%, #F88A2B 100%)", boxShadow:"0 20px 50px -10px rgba(248,138,43,0.6), inset 0 1px 0 rgba(255,255,255,0.4)" }}
 >
 {playing ? <PauseIcon /> : <PlayIcon />}
 </button>
 <button className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition" aria-label="Próximo"><SkipFwd /></button>
 <button className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition opacity-80" aria-label="Avançar 15s"><Fwd15 /></button>
 </div>

 {/* Tools row */}
 <div className="mt-6 flex items-center justify-between text-white/85">
 <button className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur text-[11.5px] font-semibold active:scale-95 transition">
 <TimerIcon /> Timer 15min
 </button>
 <button
 onClick={() => setSpeed((s) => (s >= 2 ? 0.75 : +(s + 0.25).toFixed(2)))}
 className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur text-[11.5px] font-semibold active:scale-95 transition"
 >
 <SpeedIcon /> {speed}x
 </button>
 <button onClick={() => setSaved((v) => !v)} className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur text-[11.5px] font-semibold active:scale-95 transition">
 <SaveIcon filled={saved} /> Salvar
 </button>
 <button className="flex items-center gap-1.5 px-3 h-9 rounded-full bg-white/10 ring-1 ring-white/10 backdrop-blur text-[11.5px] font-semibold active:scale-95 transition">
 <ShareIcon /> Enviar
 </button>
 </div>

 {/* Quote */}
 {/* Frase inspiracional oculta até o CMS fornecer citações reais. */}

 {/* CTA */}
 <Link
 to="/feed"
 className="mb-2 flex items-center justify-center gap-2 h-[52px] rounded-full text-white text-[14.5px] font-bold tracking-tight active:scale-[0.985] transition"
 style={{ background:"linear-gradient(180deg, #FFA158 0%, #F88A2B 100%)", boxShadow:"0 16px 34px -12px rgba(248,138,43,0.6), inset 0 1px 0 rgba(255,255,255,0.35)" }}
 >
 Continuar ouvindo
 </Link>
 </div>

 <div className="relative z-10">
 </div>
  </div>
  </main>
  </MediaDesktopLayout>
  );
};

export default AudioPlayerScreen;
