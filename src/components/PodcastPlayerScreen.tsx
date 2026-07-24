import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MediaDesktopLayout } from "./layouts/MediaDesktopLayout";
import { supabase } from "@/integrations/supabase/client";
import VTurbPlayer, { parseVTurbSource } from "@/components/VTurbPlayer";

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

type PodcastRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  cover_url: string | null;
  banner_url: string | null;
  duration_minutes: number | null;
  media_url: string | null;
  file_url: string | null;
  metadata: any;
};

const PodcastPlayerScreen = () => {
  const [params] = useSearchParams();
  const slug = params.get("slug");
  const id = params.get("id");

  const [pod, setPod] = useState<PodcastRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<{ id: string; slug: string; title: string; cover_url: string | null; duration_minutes: number | null }[]>([]);

  const total = (pod?.duration_minutes ?? 0) * 60;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from("content_items").select("id,title,slug,short_description,long_description,cover_url,banner_url,duration_minutes,media_url,file_url,metadata").eq("type", "podcast");
      if (id) q = q.eq("id", id);
      else if (slug) q = q.eq("slug", slug);
      else q = q.eq("status", "published").order("published_at", { ascending: false }).limit(1);
      const { data } = await q.maybeSingle();
      setPod((data as any) ?? null);
      if (data) {
        const seriesName = (data as any).metadata?.series_name;
        let r = supabase.from("content_items").select("id,slug,title,cover_url,duration_minutes").eq("type", "podcast").eq("status", "published").neq("id", (data as any).id).limit(6);
        if (seriesName) r = r.contains("metadata", { series_name: seriesName });
        const { data: rel } = await r;
        setRelated((rel as any) ?? []);
      }
      setLoading(false);
    })();
  }, [id, slug]);

 useEffect(() => {
    if (!playing || total <= 0) return;
    const iv = setInterval(() => setT((v) => (v + 1 >= total ? 0 : v + 1)), 1000);
    return () => clearInterval(iv);
 }, [playing, total]);

  const progress = total > 0 ? t / total : 0;
  const meta = (pod?.metadata ?? {}) as any;
  const podcastMode: string = meta.podcast_mode ?? meta.podcast_format ?? "video_podcast";
  const provider: string = meta.media_provider ?? (pod?.media_url && pod.media_url.includes("converteai.net") ? "vturb" : "external");
  const isVturb = provider === "vturb" && !!pod?.media_url && !!parseVTurbSource(pod.media_url);
  const isVideoPodcast = podcastMode !== "audio_only" && !!pod?.media_url;
  const keyMoments: { timestamp?: string; label?: string; title?: string }[] = Array.isArray(meta.key_moments) ? meta.key_moments : [];
  const topics: string[] = Array.isArray(meta.topics) ? meta.topics : [];
  const reflectionQuestions: string[] = Array.isArray(meta.reflection_questions) ? meta.reflection_questions : [];
  const chapters = keyMoments.map((k, i) => ({ t: (k.timestamp ?? `${i + 1}:00`), title: k.label ?? k.title ?? `Momento ${i + 1}`, dur: "" }));
  const cover = pod?.cover_url ?? pod?.banner_url ?? "";
  const seriesLabel = [meta.series_name, meta.season_number ? `T${meta.season_number}` : null, meta.episode_number ? `E${meta.episode_number}` : null].filter(Boolean).join(" · ");
  const cta = (meta.cta_suggestion || meta.cta_label) ? { label: meta.cta_label || meta.cta_suggestion?.label, url: meta.cta_url || meta.cta_suggestion?.url } : null;

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
  {cover && <img src={cover} alt="" className="w-full h-full object-cover scale-125" style={{ filter:"blur(40px) saturate(1.15)" }} />}
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
  <p className="text-[10px] uppercase tracking-[0.24em] text-white/60 font-semibold">Podcast{isVideoPodcast ? " · Vídeo" : ""}</p>
  <p className="text-[12px] font-semibold tracking-tight truncate max-w-[220px]" style={{ ...serif }}>{seriesLabel || "—"}</p>
 </div>
 <button aria-label="Compartilhar" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur ring-1 ring-white/15 flex items-center justify-center text-white active:scale-95 transition">
 <Share />
 </button>
 </header>

 {/* Scroll body */}
 <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-[100px]">
  {/* Player em destaque para video_podcast */}
  {loading ? (
  <p className="mt-8 text-center text-white/60 text-sm">Carregando episódio…</p>
  ) : !pod ? (
  <div className="mt-10 text-center text-white/70 fade-up">
  <div className="mx-auto w-[180px] h-[180px] rounded-[28px] bg-white/5 ring-1 ring-white/10" />
  <h1 className="mt-6 text-[22px]" style={{ ...serif, fontWeight: 600 }}>Podcast ainda não configurado.</h1>
  <p className="mt-2 text-[12.5px] text-white/60 px-2">Peça ao curador para publicar um episódio.</p>
  </div>
  ) : isVideoPodcast && isVturb ? (
  <div className="relative mt-3 mx-auto w-full max-w-[520px] fade-up rounded-[22px] overflow-hidden ring-1 ring-white/10" style={{ aspectRatio: "16/9", boxShadow:"0 32px 60px -22px rgba(0,0,0,0.75)" }}>
   <VTurbPlayer source={pod.media_url!} className="w-full h-full" />
  </div>
  ) : isVideoPodcast && pod.media_url ? (
  <div className="relative mt-3 mx-auto w-full max-w-[520px] fade-up rounded-[22px] overflow-hidden ring-1 ring-white/10 bg-black" style={{ aspectRatio: "16/9" }}>
   <video src={pod.media_url} controls playsInline className="w-full h-full" poster={cover || undefined} />
  </div>
  ) : (
  <div className="relative mt-3 mx-auto w-[230px] h-[230px] fade-up">
   <div className="absolute inset-0 rounded-[34px]" style={{ background:"radial-gradient(circle at 50% 50%, rgba(248,138,43,0.45) 0%, rgba(248,138,43,0) 70%)", filter:"blur(22px)" }} />
   <div className="relative w-full h-full rounded-[28px] overflow-hidden ring-1 ring-white/10" style={{ boxShadow:"0 32px 60px -22px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.06)" }}>
   {cover ? <img src={cover} alt="Capa do podcast" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
   <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
   <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide text-white" style={{ background:"rgba(248,138,43,0.92)", backdropFilter:"blur(8px)" }}>PODCAST</span>
   </div>
  </div>
  )}

  {/* Title + série */}
  {pod && (
  <div className="mt-6 text-center text-white fade-up">
   <h1 className="text-[24px] leading-[1.15]" style={{ ...serif, fontWeight: 600 }}>{pod.title}</h1>
   {pod.short_description && <p className="mt-2 text-[12.5px] text-white/70 px-2 max-w-[520px] mx-auto">{pod.short_description}</p>}
   <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-white/60 flex-wrap">
   {seriesLabel && <span>{seriesLabel}</span>}
   {pod.duration_minutes ? <span>· {pod.duration_minutes} min</span> : null}
   {Array.isArray(meta.host_names) && meta.host_names.length > 0 && <span>· Com {meta.host_names.join(", ")}</span>}
   {Array.isArray(meta.guest_names) && meta.guest_names.length > 0 && <span>· Convidado(s): {meta.guest_names.join(", ")}</span>}
   </div>
  </div>
  )}

  {/* Waveform e transporte só para áudio */}
  {pod && !isVideoPodcast && (
  <>
  <div className="mt-6 fade-up">
 <Wave progress={progress} />
 <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-white/70 tabular-nums">
 <span>{fmt(t)}</span>
 <span>-{fmt(total - t)}</span>
 </div>
  </div>
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
  </>
  )}

 {/* Chapters */}
 {chapters.length > 0 && <section className="mt-7 fade-up">
 <div className="flex items-center justify-between mb-3">
  <h2 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#FFB778]">Momentos-chave</h2>
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
  <p className="text-[10.5px] text-white/55 mt-0.5 tabular-nums">{c.t}{c.dur ? ` · ${c.dur}` : ""}</p>
 </div>
 {active && <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB778]">tocando</span>}
 </button>
 );
 })}
 </div>
 </section>}

  {/* Tópicos */}
  {topics.length > 0 && (
   <section className="mt-7 fade-up">
    <h2 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#FFB778] mb-3">Tópicos</h2>
    <div className="flex flex-wrap gap-2">
     {topics.map((t) => (<span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/85">{t}</span>))}
    </div>
   </section>
  )}

  {/* Perguntas de reflexão */}
  {reflectionQuestions.length > 0 && (
   <section className="mt-7 fade-up">
    <h2 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#FFB778] mb-3">Perguntas de reflexão</h2>
    <ul className="space-y-2">
     {reflectionQuestions.map((q) => (
      <li key={q} className="rounded-[16px] p-3 ring-1 ring-white/8 text-[12.5px] text-white/85" style={{ background:"rgba(255,255,255,0.05)", ...serif }}>"{q}"</li>
     ))}
    </ul>
   </section>
  )}

  {pod?.long_description && (
   <section className="mt-7 fade-up">
    <h2 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#FFB778] mb-3">Sobre este episódio</h2>
    <p className="text-[12.5px] text-white/80 leading-relaxed whitespace-pre-line">{pod.long_description}</p>
   </section>
  )}

 {/* Episódios relacionados */}
 {related.length > 0 && <section className="mt-7 fade-up">
 <div className="flex items-center justify-between mb-3">
  <h2 className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#FFB778]">Outros episódios</h2>
 <Link to="/feed" className="text-[11px] font-semibold text-white/70">Ver mais</Link>
 </div>
 <div className="-mx-6 px-6 overflow-x-auto no-scrollbar">
 <div className="flex gap-3 w-max">
 {related.map((r) => (
  <Link key={r.id} to={`/player/podcast?slug=${r.slug}`} className="w-[170px] shrink-0 rounded-[20px] overflow-hidden active:scale-[0.98] transition ring-1 ring-white/10" style={{ background:"rgba(255,255,255,0.05)", backdropFilter:"blur(12px)" }}>
 <div className="relative h-[110px] overflow-hidden">
  {r.cover_url ? <img src={r.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)" }} />
 <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background:"linear-gradient(180deg, #FFA158, #F88A2B)", boxShadow:"0 6px 14px -4px rgba(248,138,43,0.6)" }}>
 <Play size={11} />
 </span>
 </div>
 <div className="p-3">
 <p className="text-[12.5px] font-bold leading-tight text-white" style={{ ...serif }}>{r.title}</p>
  <p className="mt-1 text-[10.5px] text-white/55">Podcast{r.duration_minutes ? ` · ${r.duration_minutes} min` : ""}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </section>}
 </div>

  {/* Sticky CTA (do podcast, se configurado; senão, "Continuar reflexão") */}
  {pod && (
  <div className="absolute bottom-[78px] left-0 right-0 z-20 px-5">
   <Link
    to={cta?.url || "/cury-digital/chat"}
    className="flex items-center justify-center gap-2 h-[52px] rounded-full text-white text-[14px] font-bold tracking-tight active:scale-[0.985] transition"
    style={{ background:"linear-gradient(180deg, #FFA158 0%, #F88A2B 100%)", boxShadow:"0 18px 40px -12px rgba(248,138,43,0.65), inset 0 1px 0 rgba(255,255,255,0.35)" }}
   >
    {cta?.label || (isVideoPodcast ? "Assistir episódio" : "Ouvir episódio")}
   </Link>
  </div>
  )}

 <div className="relative z-10">
 </div>
  </div>
  </main>
  </MediaDesktopLayout>
  );
};

export default PodcastPlayerScreen;
