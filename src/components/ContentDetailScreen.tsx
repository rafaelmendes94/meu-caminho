import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { MediaDesktopLayout } from "./layouts/MediaDesktopLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { ChevronLeft, Bookmark, Heart, MessageCircle, Play, Mic, Clock, Check, MoreVertical } from "lucide-react";
import { useCmsItemBySlug } from "@/hooks/use-cms-items";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.015em" } as const;

const Wave = ({ progress }: { progress: number }) => {
  const bars = 48;
  return (
    <div className="flex items-center gap-[3px] h-[28px] w-full">
      {Array.from({ length: bars }).map((_, i) => {
        const t = i / bars;
        const v = Math.sin(t * Math.PI * 4) * 0.4 + Math.sin(t * Math.PI * 9 + 1.3) * 0.3 + 0.55;
        const h = Math.max(0.18, Math.min(1, v));
        const active = i / bars <= progress;
        return (
          <span key={i} className="flex-1 rounded-full" style={{ height: `${h * 100}%`, background: active ? "linear-gradient(180deg, #FFB778, #F88A2B)" : "rgba(17,17,17,0.14)" }} />
        );
      })}
    </div>
  );
};

const TYPE_LABEL: Record<string, string> = { book: "Leitura", course: "Curso", track: "Trilha", podcast: "Podcast", video: "Vídeo", audio: "Áudio", material: "Material" };
const TYPE_TONE: Record<string, string> = { podcast: "#9B8AC9", video: "#C25E5E", audio: "#7A6CA8", book: "#956A3F", track: "#F88A2B", course: "#5E8F76", material: "#7A9F6A" };
const FALLBACK_IMG = "";

const ContentDetailScreen = () => {
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/feed" : "/feed";
  const [params] = useSearchParams();
  const slug = params.get("slug");
  const { item, related, author } = useCmsItemBySlug(slug);
  const cover = item?.banner_url || item?.cover_url || FALLBACK_IMG;
  const typeLabel = item ? (TYPE_LABEL[item.type] || item.type) : "—";
  const duration = item?.duration_minutes ? `${item.duration_minutes} min` : "—";
  const title = item?.title || "Conteúdo indisponível";
  const subtitle = item?.subtitle || item?.short_description || "";
  const description = item?.long_description || item?.short_description || "";
  const authorName = author?.name || "—";
  const authorRole = author?.role || "";
  const authorAvatar = author?.avatar_url || "";

  const content = (
    <main className={`${isEnterprise ? '' : 'h-screen min-h-[100dvh] w-full flex items-center justify-center overflow-hidden'} bg-[#F7F4F2] font-display`}>
      <div className={`relative w-full ${isEnterprise ? '' : 'h-[100dvh] max-w-[500px] mx-auto shadow-2xl'} overflow-hidden bg-[#F7F4F2] flex flex-col`}>
        <style>{`
          @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          .fade-up { animation: fade-up .6s ease-out both; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div className="relative w-full h-full overflow-y-auto no-scrollbar bg-[#F7F4F2] flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-black/5 shrink-0">
            <Link to={backTo} className="w-10 h-10 rounded-full bg-[#F7F4F2] flex items-center justify-center text-[#111] hover:bg-black/5 transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-[#111]">Detalhes</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setSaved(!saved)} className="w-10 h-10 rounded-full bg-[#F7F4F2] flex items-center justify-center text-[#111]">
                <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
              </button>
            </div>
          </header>

          <div className="flex-1 pb-10">
            {/* HERO Section */}
            <div className="relative h-[300px] lg:h-[400px] w-full overflow-hidden">
              <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F7F4F2] via-transparent to-black/20" />
            </div>

            <div className="px-6 -mt-12 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#F88A2B] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">{typeLabel}</span>
                <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest">{duration}</span>
              </div>
              
              <h1 style={serif} className="text-3xl lg:text-4xl font-bold text-[#111] leading-tight mb-6">
                {title}
              </h1>

              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-black/5">
                <div className="w-12 h-12 rounded-full border-2 border-[#F88A2B] p-0.5">
                  <div className="w-full h-full rounded-full bg-cover bg-center bg-[#EEE]" style={authorAvatar ? { backgroundImage: `url(${authorAvatar})` } : undefined} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111]">{authorName}</p>
                  <p className="text-[11px] text-[#666] font-medium">{authorRole}</p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-[#555] leading-relaxed mb-10">
                <p className="text-lg text-[#111] font-medium mb-4">{subtitle}</p>
                <p>{description}</p>
              </div>

              {/* Player UI */}
              <div className="bg-white rounded-[32px] p-6 mb-10 border border-black/5 shadow-xl shadow-black/5">
                <div className="flex items-center gap-4">
                  <button onClick={() => setPlaying(!playing)} className="w-14 h-14 rounded-full bg-[#F88A2B] text-white flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0">
                    {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <Wave progress={0} />
                    <div className="mt-2 flex justify-between text-[10px] font-bold text-[#999] tabular-nums">
                      <span>00:00</span><span>{duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related */}
              <section className="mb-10">
                <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.2em] mb-6">Você também pode gostar</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
                  {(related.length ? related : []).map((r) => {
                    const rCover = r.cover_url || r.banner_url || FALLBACK_IMG;
                    const rLabel = TYPE_LABEL[r.type] || r.type;
                    const rTone = TYPE_TONE[r.type] || "#F88A2B";
                    const rDur = r.duration_minutes ? `${r.duration_minutes} min` : "";
                    return (
                      <Link key={r.id} to={al(`/conteudo/detalhe?slug=${r.slug}`)} className="w-[180px] shrink-0 group">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 shadow-md">
                          <img src={rCover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                          <span className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[8px] font-bold uppercase tracking-wider" style={{ color: rTone }}>{rLabel}</span>
                        </div>
                        <p className="text-sm font-bold text-[#111] leading-tight line-clamp-1">{r.title}</p>
                        <p className="text-[10px] text-[#999] font-medium mt-1">{rDur}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Action Buttons Enterprise Desktop */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-black/5">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-[#666] font-bold text-sm opacity-60" disabled>
                    <Heart size={18} /> —
                  </button>
                  <button className="flex items-center gap-2 text-[#666] font-bold text-sm opacity-60" disabled>
                    <MessageCircle size={18} /> —
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSaved(!saved)} className={`h-12 px-6 rounded-full border border-black/10 font-bold text-sm transition-all flex items-center gap-2 ${saved ? 'bg-[#F88A2B]/10 border-[#F88A2B]/20 text-[#F88A2B]' : 'hover:bg-black/5'}`}>
                    <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                    {saved ? 'Salvo' : 'Salvar'}
                  </button>
                  <Link to={al("/player/audio")} className="h-12 px-10 rounded-full bg-[#F88A2B] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <Play size={18} fill="currentColor" /> Ouvir Agora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Detalhes">
        <div className="bg-white rounded-[24px] shadow-sm ring-1 ring-black/5 overflow-hidden">
          {content}
        </div>
      </EnterpriseUserLayout>
    );
  }

  return (
    <MediaDesktopLayout title="Detalhes" backTo={backTo}>
      {content}
    </MediaDesktopLayout>
  );
};

const Pause = ({ size = 20, fill = "none" }: { size?: number, fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
);

export default ContentDetailScreen;
