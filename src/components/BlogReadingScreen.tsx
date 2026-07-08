import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Bookmark, MoreVertical, Heart, MessageCircle, Share2, Check } from "lucide-react";
import blogHero from "@/assets/blog-hero.jpg";
import augusto from "@/assets/augusto-cury.png";
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
        {/* Hero */}
        <div className="relative rounded-[24px] overflow-hidden aspect-[16/9] shadow-2xl shadow-black/10">
          <img src={blogHero} alt="Pessoa contemplando paisagem ao pôr do sol" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
          <span className="absolute top-4 left-4 bg-[#F88A2B] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg">
            Desenvolvimento pessoal
          </span>
        </div>

        {/* Title */}
        <h2 style={serif} className="mt-8 text-2xl lg:text-4xl font-bold text-[#111] leading-tight">
          O poder da mente focada: como direcionar seus pensamentos transforma sua vida
        </h2>

        {/* Author + actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#F6EFE8] overflow-hidden ring-2 ring-white shadow-md">
              <img src={augusto} alt="Augusto Cury" className="w-full h-full object-cover object-top" loading="lazy" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#111] leading-tight">Augusto Cury</p>
              <p className="text-[12px] text-[#666] mt-0.5">20 de abril de 2024 • 6 min de leitura</p>
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
          <blockquote className="relative pl-6 py-1">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F88A2B] rounded-full" />
            <p style={serif} className="text-lg lg:text-2xl italic text-[#333] leading-relaxed">
              "Você se torna aquilo em que pensa a maior parte do tempo."
            </p>
            <p className="mt-2 text-[14px] font-bold text-[#F88A2B] uppercase tracking-widest">— Augusto Cury</p>
          </blockquote>

          <div className="prose prose-lg max-w-none text-[#444] leading-relaxed">
            <p className="text-lg">
              A mente humana é poderosa. Ela pode ser nossa maior aliada ou nossa maior inimiga. Quando aprendemos a direcionar nossos pensamentos, ganhamos clareza, foco e propósito.
            </p>

            <h3 style={serif} className="text-xl lg:text-2xl font-bold text-[#111] pt-4">1. Seus pensamentos criam sua realidade</h3>
            <p>
              Nossos pensamentos geram emoções, e nossas emoções geram atitudes. Mudando a forma como você pensa, você muda a forma como vive. O segredo não está em evitar problemas, mas em como o seu "Eu" gestor da mente reage a eles.
            </p>
            
            <p>
              A inteligência emocional não é a ausência de dor, mas a capacidade de gerenciá-la. Quando focamos no que podemos controlar — nossos pensamentos e reações — desarmamos a ansiedade e construímos uma mente resiliente.
            </p>
          </div>
        </div>

        {/* Related Tags */}
        <div className="mt-12 pt-8 border-t border-black/5 flex flex-wrap gap-2">
          {['Mentalidade', 'Foco', 'Resiliência', 'Augusto Cury'].map(tag => (
            <span key={tag} className="px-4 py-1.5 rounded-full bg-[#F7F4F2] text-[12px] font-bold text-[#666] hover:bg-[#F88A2B]/10 hover:text-[#F88A2B] transition-colors cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>

        {/* Bottom actions within content for desktop flow */}
        <div className="mt-12 pt-10 border-t border-black/5 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-[#444] group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <Heart size={22} className="text-[#F88A2B] transition-transform group-hover:scale-110" strokeWidth={1.8} />
                </div>
                <span className="text-[14px] font-bold">1.2k</span>
              </button>
              <button className="flex items-center gap-2 text-[#444] group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <MessageCircle size={22} className="text-[#666] group-hover:text-blue-500 transition-colors" strokeWidth={1.8} />
                </div>
                <span className="text-[14px] font-bold">128</span>
              </button>
            </div>
          </div>
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
