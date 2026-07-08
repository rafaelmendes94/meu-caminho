import { useEffect, useState } from"react";
import { Link } from"react-router-dom";
import { MediaDesktopLayout } from "./layouts/MediaDesktopLayout";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.015em" } as const;

const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" /><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" /></svg>);
const WifiIcon = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z" /><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z" /><circle cx="8" cy="10" r="1" /></svg>);
const BatteryIcon = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5" /><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" /><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" /></svg>);

const Chevron = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>);
const Share = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>);
const Play = ({ size = 26 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>);
const Pause = ({ size = 24 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>);
const Back15 = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><text x="12.5" y="15" fill="#fff" stroke="none" fontSize="7" fontWeight="700" textAnchor="middle">15</text></svg>);
const Fwd30 = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /><text x="11.5" y="15" fill="#fff" stroke="none" fontSize="7" fontWeight="700" textAnchor="middle">30</text></svg>);
const Heart = ({ filled }: { filled?: boolean }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill={filled ?"#FF3B5C" :"none"} stroke={filled ?"#FF3B5C" :"currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 6.6a5.5 5.5 0 0 0-9.3-2.4l-.5.5-.5-.5A5.5 5.5 0 1 0 2.7 12l8.3 8.3 8.3-8.3a5.5 5.5 0 0 0 1.5-5.4z" /></svg>);
const Verified = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="#F88A2B"><path d="M12 1l2.4 2.1 3.2-.4.9 3.1 2.9 1.5-1 3.1 1 3.1-2.9 1.5-.9 3.1-3.2-.4L12 20l-2.4-2.1-3.2.4-.9-3.1L2.6 13.7l1-3.1-1-3.1L5.5 6l.9-3.1 3.2.4L12 1z" /><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>);

const COVER ="https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1200&q=85";

const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2,"0")}`;

const Wave = ({ progress }: { progress: number }) => {
 const bars = 64;
 return (
 <div className="flex items-center gap-[3px] h-[34px] w-full">
 {Array.from({ length: bars }).map((_, i) => {
 const t = i / bars;
 const v = Math.sin(t * Math.PI * 4.5) * 0.4 + Math.sin(t * Math.PI * 10 + 1.3) * 0.32 + 0.55;
 const h = Math.max(0.18, Math.min(1, v));
 const active = i / bars <= progress;
 return (
 <span key={i} className="flex-1 rounded-full" style={{
 height: `${h * 100}%`,
 background: active ?"linear-gradient(180deg, #FFB778, #F88A2B)" :"rgba(255,255,255,0.18)",
 boxShadow: active ?"0 0 6px rgba(248,138,43,0.5)" :"none",
 }} />
 );
 })}
 </div>
 );
};

const chapters = [
 { t:"00:00", title:"Abertura — A mente que não para", dur:"2:14" },
 { t:"02:14", title:"Por que pensamos sem permissão", dur:"4:38" },
 { t:"06:52", title:"Técnica do silêncio interior", dur:"5:22" },
 { t:"12:14", title:"Reflexão final · Augusto Cury", dur:"3:46" },
];

const comments = [
 { name:"Marina S.", time:"há 2 h", text:"Ouvi três vezes. Minhas noites mudaram.", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" },
 { name:"Rafael M.", time:"há 5 h", text:"A pausa do minuto 7 valeu o episódio inteiro.", avatar:"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=80&q=80" },
];

const related = [
 { title:"Ansiedade silenciosa", meta:"16 min", img:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80" },
 { title:"O peso do excesso", meta:"21 min", img:"https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80" },
 { title:"Mentes cansadas", meta:"12 min", img:"https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=600&q=80" },
];

const PodcastPlayerScreen = () => {
 const total = 18 * 60;
 const [t, setT] = useState(6 * 60 + 52);
 const [playing, setPlaying] = useState(true);
 const [liked, setLiked] = useState(false);
 const [activeChapter, setActiveChapter] = useState(2);

 useEffect(() => {
 if (!playing) return;
 const id = setInterval(() => setT((v) => (v + 1 >= total ? 0 : v + 1)), 1000);
 return () => clearInterval(id);
 }, [playing, total]);

 const progress = t / total;

  return (
  <MediaDesktopLayout title="Podcast" backTo="/explorar">
  <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <style>{`
 @keyframes float-a { 0%,100%{transform:translate(0,0)} 50%{transform:translate(8px,-12px)} }
 @keyframes float-b { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-10px,10px)} }
 @keyframes pulse-soft { 0%,100% { box-shadow: 0 0 0 0 rgba(248,138,43,0.55), 0 22px 60px -10px rgba(248,138,43,0.55); } 50% { box-shadow: 0 0 0 12px rgba(248,138,43,0), 0 24px 70px -10px rgba(248,138,43,0.7); } }
 @keyframes fade-up { from {opacity:0; transform:translateY(10px)} to {opacity:1; transform:translateY(0)} }
 .float-a { animation: float-a 9s ease-in-out infinite; }
 .float-b { animation: float-b 11s ease-in-out infinite; }
 .play-pulse { animation: pulse-soft 2.6s ease-in-out infinite; }
 .fade-up { animation: fade-up .55s ease-out both; }
 .no-scrollbar::-webkit-scrollbar { display: none; }
 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
 `}</style>

 <div className="relative w-full h-[100dvh] overflow-hidden bg-[#0E0B14] flex flex-col">

 {/* Atmospheric blurred bg */}
 <div className="absolute inset-0">
 <img src={COVER} alt="" className="w-full h-full object-cover scale-125" style={{ filter:"blur(40px) saturate(1.15)" }} />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(14,11,20,0.45) 0%, rgba(14,11,20,0.7) 40%, rgba(14,11,20,0.96) 100%)" }} />
 <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[440px] h-[440px] rounded-full" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.32) 0%, rgba(248,138,43,0) 65%)" }} />
 <div className="absolute bottom-[-80px] right-[-60px] w-[320px] h-[320px] rounded-full" style={{ background:"radial-gradient(circle, rgba(155,138,201,0.28) 0%, rgba(155,138,201,0) 65%)" }} />
 <span className="absolute top-[16%] left-[14%] w-1.5 h-1.5 rounded-full bg-white/70 float-a" />
 <span className="absolute top-[26%] right-[18%] w-1 h-1 rounded-full bg-white/50 float-b" />
 <span className="absolute top-[52%] left-[10%] w-1 h-1 rounded-full bg-[#FFD9B3]/70 float-b" />
 <span className="absolute top-[40%] left-[48%] w-[3px] h-[3px] rounded-full bg-[#F88A2B]/70 float-a" />
 </div>

 {/* Status bar */}
 {/* Header */}
 <header className="relative z-10 flex items-center justify-between px-5 pt-2 pb-2 text-white">
 <Link to="/conteudo/detalhe" aria-label="Voltar" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15 flex items-center justify-center active:scale-95 transition">
 <Chevron />
 </Link>
 <div className="text-center leading-tight">
 <p className="text-[10px] uppercase tracking-[0.24em] text-white/60 font-semibold">Podcast · Episódio 12</p>
 <p className="text-[12px] font-semibold tracking-tight" style={{ ...serif }}>Mente em paz</p>
 </div>
 <button aria-label="Compartilhar" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15 flex items-center justify-center text-white active:scale-95 transition">
 <Share />
 </button>
 </header>

 {/* Scroll body */}
 <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-[100px]">
 {/* Cover */}
 <div className="relative mt-3 mx-auto w-[230px] h-[230px] fade-up">
 <div className="absolute inset-0 rounded-[34px]" style={{ background:"radial-gradient(circle at 50% 50%, rgba(248,138,43,0.45) 0%, rgba(248,138,43,0) 70%)", filter:"blur(22px)" }} />
 <div className="relative w-full h-full rounded-[28px] overflow-hidden ring-1 ring-white/10" style={{ boxShadow:"0 32px 60px -22px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.06)" }}>
 <img src={COVER} alt="Capa do podcast" className="w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
 <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide text-white" style={{ background:"rgba(248,138,43,0.92)", backdropFilter:"blur(8px)" }}>PODCAST</span>
 </div>
 </div>

 {/* Title + author */}
 <div className="mt-6 text-center text-white fade-up">
 <h1 className="text-[24px] leading-[1.15]" style={{ ...serif, fontWeight: 600 }}>
 Como desacelerar pensamentos acelerados
 </h1>
 <p className="mt-2 text-[12.5px] text-white/70 px-2">
 Técnicas práticas para reduzir o ruído mental e recuperar a clareza emocional.
 </p>
 <div className="mt-3 flex items-center justify-center gap-2 text-white/85">
 <span className="w-5 h-5 rounded-full bg-cover bg-center ring-1 ring-white/30" style={{ backgroundImage:"url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80)" }} />
 <p className="text-[12px] font-semibold tracking-tight flex items-center gap-1">@augustocury <Verified /></p>
 <span className="w-1 h-1 rounded-full bg-white/40" />
 <p className="text-[11.5px] text-white/60">Ep. 12 · 18 min</p>
 </div>
 </div>

 {/* Waveform */}
 <div className="mt-6 fade-up">
 <Wave progress={progress} />
 <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-white/70 tabular-nums">
 <span>{fmt(t)}</span>
 <span>-{fmt(total - t)}</span>
 </div>
 </div>

 {/* Transport */}
 <div className="mt-3 flex items-center justify-center gap-7 text-white">
 <button className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition opacity-85" aria-label="Voltar 15s"><Back15 /></button>
 <button
 onClick={() => setPlaying((v) => !v)}
 aria-label={playing ?"Pausar" :"Tocar"}
 className="w-[72px] h-[72px] rounded-full flex items-center justify-center active:scale-95 transition play-pulse"
 style={{ background:"linear-gradient(180deg, #FFA158 0%, #F88A2B 100%)", boxShadow:"0 22px 50px -10px rgba(248,138,43,0.6), inset 0 1px 0 rgba(255,255,255,0.4)" }}
 >
 {playing ? <Pause size={26} /> : <Play size={28} />}
 </button>
 <button className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition opacity-85" aria-label="Avançar 30s"><Fwd30 /></button>
 </div>

 {/* Chapters */}
 <section className="mt-7 fade-up">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#FFB778]">Capítulos</h2>
 <span className="text-[11px] text-white/50">{chapters.length} momentos</span>
 </div>
 <div className="rounded-[20px] overflow-hidden ring-1 ring-white/8" style={{ background:"rgba(255,255,255,0.05)", backdropFilter:"blur(14px)" }}>
 {chapters.map((c, i) => {
 const active = i === activeChapter;
 return (
 <button
 key={c.t}
 onClick={() => setActiveChapter(i)}
 className="w-full flex items-center gap-3 px-4 py-3 text-left active:scale-[0.99] transition border-b border-white/5 last:border-b-0"
 style={active ? { background:"linear-gradient(90deg, rgba(248,138,43,0.18) 0%, rgba(248,138,43,0) 100%)" } : {}}
 >
 <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[10.5px] font-bold tabular-nums" style={{
 background: active ?"linear-gradient(180deg, #FFA158, #F88A2B)" :"rgba(255,255,255,0.08)",
 color:"#fff",
 boxShadow: active ?"0 8px 18px -8px rgba(248,138,43,0.6)" :"none",
 }}>
 {active ? <Play size={12} /> : c.t.split(":")[0]}
 </span>
 <div className="flex-1 min-w-0">
 <p className="text-[13px] font-semibold tracking-tight truncate" style={{ color: active ?"#fff" :"rgba(255,255,255,0.92)" }}>{c.title}</p>
 <p className="text-[10.5px] text-white/55 mt-0.5 tabular-nums">{c.t} · {c.dur}</p>
 </div>
 {active && <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB778]">tocando</span>}
 </button>
 );
 })}
 </div>
 </section>

 {/* Insight */}
 <section className="mt-6 fade-up">
 <div className="rounded-[22px] p-4 ring-1 ring-white/10" style={{ background:"rgba(255,255,255,0.06)", backdropFilter:"blur(14px)" }}>
 <p className="text-white text-[14.5px] leading-snug" style={{ ...serif, fontWeight: 500 }}>
"A pausa que você não dá hoje, sua mente cobrará amanhã."
 </p>
 <div className="mt-2 flex items-center justify-between">
 <div className="flex items-center gap-2 text-[11px] text-white/65">
 <span className="w-4 h-px bg-[#F88A2B]" />
 Augusto Cury
 </div>
 <button onClick={() => setLiked((v) => !v)} aria-label="Curtir" className="active:scale-90 transition text-white/85">
 <Heart filled={liked} />
 </button>
 </div>
 </div>
 </section>

 {/* Reflexões da comunidade */}
 <section className="mt-7 fade-up">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#FFB778]">Reflexões da comunidade</h2>
 <button className="text-[11px] font-semibold text-white/70">Ver todas</button>
 </div>
 <div className="space-y-2.5">
 {comments.map((c) => (
 <div key={c.name} className="flex gap-3 rounded-[18px] p-3 ring-1 ring-white/8" style={{ background:"rgba(255,255,255,0.05)", backdropFilter:"blur(12px)" }}>
 <span className="w-9 h-9 rounded-full bg-cover bg-center shrink-0 ring-1 ring-white/15" style={{ backgroundImage: `url(${c.avatar})` }} />
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between">
 <p className="text-[12.5px] font-semibold text-white">{c.name}</p>
 <p className="text-[10.5px] text-white/45">{c.time}</p>
 </div>
 <p className="mt-1 text-[12.5px] leading-snug text-white/80" style={{ ...serif }}>"{c.text}"</p>
 </div>
 </div>
 ))}
 </div>
 </section>

 {/* Episódios relacionados */}
 <section className="mt-7 fade-up">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#FFB778]">Episódios relacionados</h2>
 <Link to="/feed" className="text-[11px] font-semibold text-white/70">Ver mais</Link>
 </div>
 <div className="-mx-6 px-6 overflow-x-auto no-scrollbar">
 <div className="flex gap-3 w-max">
 {related.map((r) => (
 <Link key={r.title} to="/conteudo/detalhe" className="w-[170px] shrink-0 rounded-[20px] overflow-hidden active:scale-[0.98] transition ring-1 ring-white/10" style={{ background:"rgba(255,255,255,0.05)", backdropFilter:"blur(12px)" }}>
 <div className="relative h-[110px] overflow-hidden">
 <img src={r.img} alt="" className="w-full h-full object-cover" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)" }} />
 <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background:"linear-gradient(180deg, #FFA158, #F88A2B)", boxShadow:"0 6px 14px -4px rgba(248,138,43,0.6)" }}>
 <Play size={11} />
 </span>
 </div>
 <div className="p-3">
 <p className="text-[12.5px] font-bold leading-tight text-white" style={{ ...serif }}>{r.title}</p>
 <p className="mt-1 text-[10.5px] text-white/55">Podcast · {r.meta}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>
 </div>

 {/* Sticky CTA */}
 <div className="absolute bottom-[78px] left-0 right-0 z-20 px-5">
 <Link
 to="/cury-digital/chat"
 className="flex items-center justify-center gap-2 h-[52px] rounded-full text-white text-[14px] font-bold tracking-tight active:scale-[0.985] transition"
 style={{ background:"linear-gradient(180deg, #FFA158 0%, #F88A2B 100%)", boxShadow:"0 18px 40px -12px rgba(248,138,43,0.65), inset 0 1px 0 rgba(255,255,255,0.35)" }}
 >
 Continuar reflexão
 </Link>
 </div>

 <div className="relative z-10">
 </div>
  </div>
  </main>
  </MediaDesktopLayout>
  );
};

export default PodcastPlayerScreen;
