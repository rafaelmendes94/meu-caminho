import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, Bookmark, MoreVertical, Play, Maximize2, Heart, Download, Share2 } from "lucide-react";
import { MediaDesktopLayout, SidePanelCard, SidePanelList } from "./layouts/MediaDesktopLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const VideoContentScreen = () => {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/feed" : "/feed";

  const topics: string[] = [];
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
        {/* Video Player */}
        <div className="relative rounded-[32px] overflow-hidden bg-black aspect-video shadow-2xl group mb-8">
          <div className="w-full h-full bg-neutral-900" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button disabled className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-[#F88A2B]/70 text-white flex items-center justify-center shadow-2xl cursor-not-allowed" title="Player em produção">
              <Play size={36} fill="currentColor" className="ml-1" />
            </button>
          </div>
          
          <div className="absolute top-6 right-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <Maximize2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex-1 w-full">
            <div className="mb-8">
              <h1 style={serif} className="text-3xl lg:text-4xl font-bold text-[#111] leading-tight mb-4">
                Vídeo em preparação
              </h1>
              
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
                <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.2em] mb-4 border-b border-black/5 pb-2 inline-block">Sobre a Aula</h3>
                <p className="text-lg leading-relaxed text-[#555]">
                  Descrição do vídeo será publicada em breve.
                </p>
              </div>

              {topics.length > 0 && (
                <div className="bg-[#F7F4F2] rounded-[32px] p-8 lg:p-10 border border-black/5">
                  <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.2em] mb-6">Tópicos abordados</h3>
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
            </div>
          </div>

          <div className="w-full lg:w-[280px] shrink-0 pt-2 lg:sticky lg:top-8">
            <div className="space-y-3">
              <button className="w-full h-14 rounded-full bg-[#F88A2B] text-white font-bold text-base shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Download size={20} />
                Baixar Vídeo
              </button>
              <button className="w-full h-14 rounded-full bg-white border-2 border-black/5 text-[#111] font-bold text-base hover:bg-black/5 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Heart size={20} className="text-[#F88A2B]" />
                Favoritar
              </button>
              <button className="w-full h-14 rounded-full bg-white border-2 border-black/5 text-[#111] font-bold text-base hover:bg-black/5 active:scale-95 transition-all flex items-center justify-center gap-3">
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
