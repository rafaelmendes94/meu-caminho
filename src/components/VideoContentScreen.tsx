import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, Bookmark, MoreVertical, Play, Maximize2, Heart, Download, Share2 } from "lucide-react";
import { MediaDesktopLayout, SidePanelCard, SidePanelList } from "./layouts/MediaDesktopLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { supabase } from "@/integrations/supabase/client";
import VTurbPlayer from "./VTurbPlayer";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const VideoContentScreen = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/feed" : "/feed";
  const [params] = useSearchParams();
  const vturbSrc = params.get("v") ?? "";
  const lessonId = params.get("lesson");
  const contentId = params.get("id");
  const contentSlug = params.get("slug");
  const [lessonMedia, setLessonMedia] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [videoItem, setVideoItem] = useState<any | null>(null);

  // Vídeo informativo (type='video') via slug ou id
  useEffect(() => {
    if (!contentId && !contentSlug) return;
    (async () => {
      let q = supabase.from("content_items").select("*").eq("type", "video");
      if (contentId) q = q.eq("id", contentId);
      else if (contentSlug) q = q.eq("slug", contentSlug);
      const { data } = await q.maybeSingle();
      if (data) setVideoItem(data);
    })();
  }, [contentId, contentSlug]);

  // Compat legado: quando vem ?lesson= (curso). NÃO buscar course_lessons para vídeo informativo.
  useEffect(() => {
    if (!lessonId || contentId || contentSlug) return;
    (async () => {
      const { data } = await supabase
        .from("course_lessons")
        .select("title,media_url")
        .eq("id", lessonId)
        .maybeSingle();
      if (data) {
        setLessonMedia((data as any).media_url ?? "");
        setLessonTitle((data as any).title ?? "");
      }
    })();
  }, [lessonId, contentId, contentSlug]);

  const isInformational = !!videoItem;
  const meta = (videoItem?.metadata ?? {}) as any;
  const videoSource = vturbSrc || videoItem?.media_url || lessonMedia;
  const title = videoItem?.title || lessonTitle || (videoSource ? "Vídeo" : "Vídeo em preparação");
  const shortDesc = videoItem?.short_description ?? "";
  const longDesc = videoItem?.long_description ?? "";
  const topics: string[] = Array.isArray(meta.topics) ? meta.topics : [];
  const ctaLabel: string = meta.cta_label ?? meta?.cta_suggestion?.label ?? "";
  const ctaUrl: string = meta.cta_url ?? meta?.cta_suggestion?.url ?? "";

  const openCta = () => {
    if (!ctaUrl) return;
    if (/^https?:\/\//i.test(ctaUrl)) {
      window.open(ctaUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(ctaUrl);
    }
  };

  const metaData: { icon: React.ReactNode; label: string }[] = [];

  const sidePanel = (
    <div className="space-y-4">
      <SidePanelCard title="Aulas do Módulo">
        <SidePanelList items={[]} />
      </SidePanelCard>
    </div>
  );

  const content = (
    <div className="bg-white">
      {/* Mobile-only header - only if not enterprise */}
      {!isEnterprise && (
        <div className="lg:hidden relative flex items-center justify-between px-5 pt-3 pb-2 shrink-0 border-b border-black/5 bg-white/80 backdrop-blur-md z-20">
          <Link to={backTo} className="text-[#111]" aria-label="Voltar"><ChevronLeft size={26} strokeWidth={2} /></Link>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold text-[#111]">Vídeo</h1>
          <div className="flex items-center gap-3 text-[#111]">
            <Bookmark size={20} strokeWidth={1.8} />
            <MoreVertical size={20} strokeWidth={1.8} />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
        {/* Video Player (VTurb) */}
        <div className="relative rounded-[32px] overflow-hidden bg-black aspect-video shadow-2xl mb-8">
          {videoSource ? (
            <VTurbPlayer source={videoSource} className="absolute inset-0 w-full h-full" />
          ) : (
            <>
              <div className="w-full h-full bg-neutral-900" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button disabled className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-[#F88A2B]/70 text-white flex items-center justify-center shadow-2xl cursor-not-allowed" title="Vídeo não configurado">
                  <Play size={36} fill="currentColor" className="ml-1" />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex-1 w-full">
            <div className="mb-8">
              <h1 style={serif} className="text-3xl lg:text-4xl font-bold text-[#111] leading-tight mb-4">
                {title}
              </h1>
              {shortDesc && <p className="text-lg text-[#555] leading-relaxed mb-3">{shortDesc}</p>}
              {videoItem?.duration_minutes ? (
                <p className="text-xs uppercase tracking-widest text-[#999] font-bold">{videoItem.duration_minutes} min</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-6">
                {metaData.length > 0 && (
                  <div className="flex items-center gap-4">
                    {metaData.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-[#999]">
                        <span className="text-[#F88A2B]">{m.icon}</span>
                        <span className="text-xs font-bold uppercase tracking-widest">{m.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8 mb-12">
              <div>
                <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.2em] mb-4 border-b border-black/5 pb-2 inline-block">Sobre este vídeo</h3>
                <p className="text-lg leading-relaxed text-[#555]">
                  {longDesc || shortDesc || "Descrição do vídeo será publicada em breve."}
                </p>
              </div>

              {topics.length > 0 && (
                <div className="bg-[#F7F4F2] rounded-[32px] p-8 lg:p-10 border border-black/5">
                  <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.2em] mb-6">Tópicos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {topics.map((t, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#F88A2B] flex items-center justify-center shrink-0 mt-0.5" />
                        <span className="text-base font-medium text-[#444] leading-snug">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ctaLabel && ctaUrl && (
                <div className="bg-[#0F172A] text-white rounded-[24px] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">Próximo passo</p>
                    <p className="text-lg font-semibold">{ctaLabel}</p>
                  </div>
                  <button onClick={openCta} className="px-6 h-12 rounded-full bg-[#F88A2B] text-black font-bold">
                    {ctaLabel}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[280px] shrink-0 pt-2 lg:sticky lg:top-8">
            <div className="space-y-3">
              {ctaLabel && ctaUrl && (
                <button onClick={openCta} className="w-full h-14 rounded-full bg-[#F88A2B] text-white font-bold text-base shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Play size={20} />
                  {ctaLabel}
                </button>
              )}
              <button className="w-full h-14 rounded-full bg-white border-2 border-black/5 text-[#111] font-bold text-base hover:bg-black/5 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Heart size={20} className="text-[#F88A2B]" />
                Favoritar
              </button>
              <button onClick={() => { if (navigator.share) navigator.share({ title, url: window.location.href }).catch(() => {}); }} className="w-full h-14 rounded-full bg-white border-2 border-black/5 text-[#111] font-bold text-base hover:bg-black/5 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Share2 size={20} />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Vídeo">
        {content}
      </EnterpriseUserLayout>
    );
  }

  return (
    <MediaDesktopLayout title="Insight em Vídeo" backTo={backTo} sidePanel={sidePanel}>
      {content}
    </MediaDesktopLayout>
  );
};

export default VideoContentScreen;
