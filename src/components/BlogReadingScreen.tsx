import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Bookmark, MoreVertical, Share2, Check } from "lucide-react";
import { MediaDesktopLayout } from "./layouts/MediaDesktopLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const BlogReadingScreen = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/feed" : "/feed";

  const content = (
    <div className="bg-white">
      {/* Mobile-only header - only if not enterprise */}
      {!isEnterprise && (
        <div className="lg:hidden relative flex items-center justify-between px-5 pt-3 pb-2 shrink-0 border-b border-black/5 bg-white/80 backdrop-blur-md z-20">
          <Link to={backTo} className="text-[#111]" aria-label="Voltar"><ChevronLeft size={26} strokeWidth={2} /></Link>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold text-[#111]">Leitura</h1>
          <div className="flex items-center gap-3 text-[#111]">
            <Bookmark size={20} strokeWidth={1.8} />
            <MoreVertical size={20} strokeWidth={1.8} />
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-5 lg:px-10 py-6 lg:py-12">
        {/* Hero placeholder */}
        <div className="relative rounded-[24px] overflow-hidden aspect-[16/9] bg-[#F6EFE8] flex items-center justify-center">
          <span className="text-[12px] uppercase tracking-widest text-[#999] font-bold">Imagem indisponível</span>
        </div>

        {/* Title */}
        <h2 style={serif} className="mt-8 text-2xl lg:text-4xl font-bold text-[#111] leading-tight">
          Leitura em preparação
        </h2>

        {/* Author + actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#F6EFE8]" />
            <div>
              <p className="text-[14px] font-bold text-[#111] leading-tight">Autor</p>
              <p className="text-[12px] text-[#666] mt-0.5">—</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#111]">
            <button aria-label="Tamanho do texto" className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors">
              <span className="text-[16px] font-bold">A</span>
              <span className="text-[12px] font-medium">a</span>
            </button>
            <button aria-label="Compartilhar" className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors">
              <Share2 size={20} strokeWidth={1.8} />
            </button>
            <button aria-label="Guardar" className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors">
              <Bookmark size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-8 space-y-6">
          <div className="prose prose-lg max-w-none text-[#666] leading-relaxed">
            <p className="text-[14px]">Conteúdo desta leitura será publicado em breve.</p>
          </div>
        </div>

        {/* Bottom actions within content for desktop flow */}
        <div className="mt-12 pt-10 border-t border-black/5 flex flex-col gap-8">
          <div className="flex flex-row items-center gap-3 w-full">
            <button 
              onClick={() => navigate(backTo)}
              className="flex-1 h-12 px-4 rounded-full border border-black/10 text-[#666] text-[13px] font-bold hover:bg-black/5 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft size={16} />
              <span>Voltar</span>
            </button>
            <button 
              className="flex-1 h-12 px-4 rounded-full bg-[#F88A2B] text-white text-[13px] font-bold shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              onClick={() => navigate(backTo)}
            >
              <Check size={16} />
              <span>Concluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Leitura">
        {content}
      </EnterpriseUserLayout>
    );
  }

  return (
    <MediaDesktopLayout title="Leitura" backTo={backTo}>
      {content}
    </MediaDesktopLayout>
  );
};

export default BlogReadingScreen;
