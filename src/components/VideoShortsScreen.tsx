import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, MoreVertical, Play, Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX } from "lucide-react";
import { MediaDesktopLayout, SidePanelCard } from "./layouts/MediaDesktopLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

/* ---------- icons ---------- */
const PlayLg = () => (<Play size={32} fill="currentColor" className="ml-1" />);
const Verified = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="#F88A2B"><path d="M12 1l2.4 2.1 3.2-.4.9 3.1 2.9 1.5-1 3.1 1 3.1-2.9 1.5-.9 3.1-3.2-.4L12 20l-2.4-2.1-3.2.4-.9-3.1L2.6 13.7l1-3.1-1-3.1L5.5 6l.9-3.1 3.2.4L12 1z"/><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>);

/* ---------- data ---------- */
type Vid = {
  id: string;
  video?: string;
  poster: string;
  title: string;
  caption: string;
  source: string;
  episode: string;
  duration: string;
  inspired: string;
  reflections: string;
  tint: string;
  creatorRole: string;
};

// Cortes reais serão carregados via CMS. Sem mocks.
const videos: Vid[] = [];

const VideoCard = ({ v, isActive }: { v: Vid; isActive: boolean }) => {
  const [inspired, setInspired] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  return (
    <article className="relative w-full aspect-[9/16] bg-black rounded-[32px] overflow-hidden shadow-2xl group">
      <video
        ref={videoRef}
        src={v.video}
        poster={v.poster}
        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
        loop
        muted={muted}
        playsInline
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* Action Buttons Right */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-20">
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={() => setInspired(!inspired)}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#F88A2B] hover:border-[#F88A2B] transition-all active:scale-90"
          >
            <Heart size={24} fill={inspired ? "currentColor" : "none"} />
          </button>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{v.inspired}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
            <MessageCircle size={24} />
          </button>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{v.reflections}</span>
        </div>

        <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90">
          <Share2 size={24} />
        </button>

        <button 
          onClick={() => setSaved(!saved)}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90"
        >
          <Bookmark size={24} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Info Bottom */}
      <div className="absolute left-6 right-20 bottom-8 z-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#F88A2B] p-0.5">
            <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80)" }} />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{v.creatorRole || "Criador"}</span>
              <Verified />
            </div>
            <span className="text-[10px] text-white/70 font-medium tracking-wider uppercase">{v.source} · {v.duration}</span>
          </div>
        </div>

        <h3 style={serif} className="text-xl font-bold text-white mb-2 leading-tight">
          {v.title}
        </h3>
        <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
          {v.caption}
        </p>
      </div>

      {/* Mute Toggle Top */}
      <button 
        onClick={() => setMuted(!muted)}
        className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </article>
  );
};

const VideoShortsScreen = () => {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/feed" : "/feed";
  
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollTop / el.clientHeight);
      if (i !== activeIndex) setActiveIndex(i);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeIndex]);

  const sidePanel = (
    <div className="space-y-4">
      <SidePanelCard title="Cortes Sugeridos">
        <div className="space-y-3">
          {videos.map((v, i) => (
            <button 
              key={v.id}
              onClick={() => {
                if (scrollerRef.current) {
                  scrollerRef.current.scrollTo({
                    top: i * scrollerRef.current.clientHeight,
                    behavior: 'smooth'
                  });
                }
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-2xl transition-all ${i === activeIndex ? 'bg-[#F88A2B]/10 ring-1 ring-[#F88A2B]/20' : 'hover:bg-black/5'}`}
            >
              <div className="w-14 h-20 rounded-xl overflow-hidden shrink-0 bg-black">
                <img src={v.poster} className="w-full h-full object-cover opacity-80" alt="" />
              </div>
              <div className="text-left min-w-0">
                <p className={`text-xs font-bold truncate ${i === activeIndex ? 'text-[#F88A2B]' : 'text-[#111]'}`}>{v.title}</p>
                <p className="text-[10px] text-[#999] font-medium uppercase mt-1">{v.source}</p>
              </div>
            </button>
          ))}
        </div>
      </SidePanelCard>
    </div>
  );

  const content = (
    <div className="bg-[#0B0908]">
      {/* Mobile Header - only if not enterprise */}
      {!isEnterprise && (
        <div className="lg:hidden absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 to-transparent">
          <Link to={backTo} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <ChevronLeft size={24} />
          </Link>
          <span className="text-white font-bold text-sm tracking-widest uppercase">Cortes</span>
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <MoreVertical size={20} />
          </button>
        </div>
      )}

      <div className="relative h-[80vh] lg:h-[750px] flex flex-col">
        {videos.length > 0 ? (
          <>
            <div 
              ref={scrollerRef}
              className="flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar"
            >
              {videos.map((v, i) => (
                <div key={v.id} className="w-full h-full snap-start flex items-center justify-center p-4 lg:p-8">
                  <div className="w-full max-w-[420px] h-full">
                    <VideoCard v={v} isActive={i === activeIndex} />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
              {videos.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 transition-all duration-300 rounded-full ${i === activeIndex ? 'h-8 bg-[#F88A2B]' : 'h-1.5 bg-white/30'}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/70 text-sm">
            Nenhum corte disponível no momento.
          </div>
        )}
      </div>
    </div>
  );

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Cortes">
        {content}
      </EnterpriseUserLayout>
    );
  }

  return (
    <MediaDesktopLayout title="Cortes em Vídeo" backTo={backTo} sidePanel={sidePanel}>
      {content}
    </MediaDesktopLayout>
  );
};

export default VideoShortsScreen;
