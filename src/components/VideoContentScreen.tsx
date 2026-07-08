import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, Bookmark, MoreVertical, Play, Maximize2, Heart, Clock, BarChart2, Calendar, Check, Download, Share2 } from "lucide-react";
import videoThumb from "@/assets/video-thumbnail.jpg";
import augusto from "@/assets/augusto-cury.png";
import { MediaDesktopLayout, SidePanelCard, SidePanelList } from "./layouts/MediaDesktopLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const VideoContentScreen = () => {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/feed" : "/feed";

  const topics = [
    "O que é ansiedade e como ela surge",
    "Os gatilhos mentais da preocupação",
    "Técnicas para acalmar a mente",
    "Construindo uma mente forte e equilibrada",
  ];

  const metaData = [
    { icon: <Play size={14} fill="currentColor" />, label: "24 min" },
    { icon: <BarChart2 size={14} />, label: "Intermediário" },
    { icon: <Calendar size={14} />, label: "15 de mai. de 2024" },
  ];

  const sidePanel = (
    <div className="space-y-4">
      <SidePanelCard title="Aulas do Módulo">
        <SidePanelList 
          items={[
            { label: "Introdução à Ansiedade", done: true },
            { label: "Como controlar a ansiedade", active: true, meta: "24:18" },
            { label: "Gatilhos da Emoção", meta: "15:30" },
            { label: "O Eu como Gestor", meta: "21:00" }
          ]}
        />
      </SidePanelCard>
      
      <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
        <h4 className="text-[#111] font-bold text-xs uppercase tracking-widest mb-4">Material de Apoio</h4>
        <button className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F7F4F2] hover:bg-[#F88A2B]/10 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#F88A2B] shadow-sm group-hover:scale-110 transition-transform">
              <Download size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#111]">PDF do Módulo</p>
              <p className="text-[10px] text-[#666]">1.2 MB</p>
            </div>
          </div>
          <ChevronLeft size={16} className="rotate-180 text-[#999]" />
        </button>
      </div>
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
          <img src={videoThumb} alt="Augusto Cury" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" loading="lazy" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-[#F88A2B] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 pointer-events-auto active:scale-95">
              <Play size={36} fill="currentColor" className="ml-1" />
            </button>
          </div>
          
          <div className="absolute top-6 right-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <Maximize2 size={18} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between text-white text-xs font-bold mb-4 tabular-nums tracking-widest uppercase">
              <span>07:35</span><span>24:18</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/20 overflow-hidden relative group/progress">
              <div className="h-full w-[31%] bg-[#F88A2B] shadow-[0_0_15px_rgba(248,138,43,0.8)] relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex-1 w-full">
            <div className="mb-8">
              <h1 style={serif} className="text-3xl lg:text-4xl font-bold text-[#111] leading-tight mb-4">
                Como controlar a ansiedade e ter uma mente tranquila
              </h1>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F6EFE8] overflow-hidden ring-2 ring-[#F88A2B]/10">
                    <img src={augusto} alt="Augusto Cury" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111]">Augusto Cury</p>
                    <p className="text-[11px] text-[#666] font-medium">Psiquiatra e Escritor</p>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-black/5 hidden sm:block" />
                
                <div className="flex items-center gap-4">
                  {metaData.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#999]">
                      <span className="text-[#F88A2B]">{m.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-widest">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8 mb-12">
              <div>
                <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.2em] mb-4 border-b border-black/5 pb-2 inline-block">Sobre a Aula</h3>
                <p className="text-lg leading-relaxed text-[#555]">
                  Neste vídeo, Augusto Cury explica como a mente funciona diante da ansiedade e apresenta estratégias práticas para recuperar o equilíbrio emocional. Você aprenderá a técnica DCD (Duvidar, Criticar e Determinar) para gerenciar pensamentos intrusivos.
                </p>
              </div>

              <div className="bg-[#F7F4F2] rounded-[32px] p-8 lg:p-10 border border-black/5">
                <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.2em] mb-6">Tópicos abordados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {topics.map((t, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-[#F88A2B] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-white" strokeWidth={4} />
                      </div>
                      <span className="text-base font-medium text-[#444] leading-snug">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
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
