import { Link, useLocation } from "react-router-dom";
import trilhaThumb from "@/assets/trilha/curso2-thumb.jpg";
import c1 from "@/assets/trilha/modulo1.jpg";
import c2 from "@/assets/trilha/modulo2.jpg";
import c3 from "@/assets/trilha/modulo3.jpg";
import c4 from "@/assets/trilha/modulo4.jpg";
import { MediaDesktopLayout, SidePanelCard } from "./layouts/MediaDesktopLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { Sparkles, ChevronRight, Play, Wind, Headphones, BookOpen, Clock, BarChart, ArrowRight } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const Orb = ({ s = 28 }: { s?: number }) => (
  <div className="relative flex items-center justify-center" style={{ width: s, height: s }}>
    <div className="absolute rounded-full" style={{ width: s + 10, height: s + 10, background: "radial-gradient(circle, rgba(248,138,43,0.32), transparent 70%)", filter: "blur(5px)" }} />
    <div className="relative rounded-full" style={{ width: s, height: s, background: "radial-gradient(circle at 35% 30%, #FFE2C4 0%, #F8B26B 38%, #E07A2B 78%, #B85A18 100%)", boxShadow: "0 4px 12px -3px rgba(248,138,43,0.55), inset -2px -3px 6px rgba(0,0,0,0.18), inset 2px 3px 8px rgba(255,255,255,0.45)" }} />
  </div>
);

const contents = [
  { thumb: c1, type: "Aula Recomendada", title: "Como a mente cria ansiedade", time: "12 min", icon: <Play size={14} fill="currentColor" />, tagColor: "#F88A2B", bgColor: "#FFF1E1" },
  { thumb: c2, type: "Exercício Emocional", title: "Respiração para acalmar a mente", time: "5 min", icon: <Wind size={14} />, tagColor: "#8FB17D", bgColor: "#E3ECDD" },
  { thumb: c3, type: "Áudio Guiado", title: "Desacelerar para clareza", time: "8 min", icon: <Headphones size={14} />, tagColor: "#9B8AC9", bgColor: "#EFEAF8" },
  { thumb: c4, type: "Leitura do Dia", title: "O poder do pensamento", time: "2 min", icon: <BookOpen size={14} />, tagColor: "#8FB17D", bgColor: "#E3ECDD" },
];

const SugestaoTrilhaScreen = () => {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/cury-digital/chat" : "/cury-digital/chat";

  const sidePanel = (
    <div className="space-y-4">
      <SidePanelCard title="Por que estas sugestões?">
        <div className="flex items-start gap-4">
          <Orb s={36} />
          <p className="text-sm text-[#444] leading-relaxed">
            Suas conversas recentes mostram foco em <strong>gestão de ansiedade</strong> e busca por <strong>foco</strong>. Estes conteúdos foram selecionados para acompanhar sua evolução hoje.
          </p>
        </div>
      </SidePanelCard>
      
      <div className="bg-[#F88A2B] rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Insight IA</h4>
        <p className="text-base font-bold leading-tight mb-4">Você completou 85% dos conteúdos de Controle Emocional!</p>
        <button className="w-full py-2.5 bg-white text-[#F88A2B] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-colors">
          Ver Conquistas
        </button>
      </div>
    </div>
  );

  const content = (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
        <header className="text-center lg:text-left mb-10">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <Orb s={32} />
            <span className="text-[11px] font-bold text-[#F88A2B] uppercase tracking-[0.2em]">Curadoria Inteligente</span>
          </div>
          <h1 style={serif} className="text-3xl lg:text-5xl font-bold text-[#111] leading-tight mb-4">
            Com base na sua mente hoje…
          </h1>
          <p className="text-lg text-[#666] max-w-2xl">
            Preparamos uma seleção exclusiva de conteúdos para impulsionar sua evolução emocional e clareza mental.
          </p>
        </header>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.2em]">Conteúdos Recomendados</h3>
            <Link to={al("/biblioteca")} className="text-[12px] font-bold text-[#F88A2B] flex items-center gap-1 hover:gap-2 transition-all">
              Ver Biblioteca <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contents.map((c, i) => (
              <Link key={i} to={al("/aula")} className="group flex flex-col active:scale-95 transition-all">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg mb-4">
                  <img src={c.thumb} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pt-20" />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                    <span style={{ color: c.tagColor }}>{c.icon}</span>
                    <span className="text-[9px] font-bold text-[#111] uppercase tracking-wider">{c.type.split(' ')[0]}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#F88A2B] text-white flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-[#111] leading-tight group-hover:text-[#F88A2B] transition-colors mb-1">{c.title}</h4>
                <div className="flex items-center gap-2 text-[#999] font-bold text-[10px] uppercase tracking-widest">
                  <Clock size={10} /> {c.time}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-[#111] uppercase tracking-[0.2em]">Próxima Trilha</h3>
          </div>
          
          <Link to={al("/curso")} className="group block relative rounded-[40px] overflow-hidden shadow-2xl bg-[#0B0908]">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-[240px] lg:h-[380px] overflow-hidden">
                <img src={trilhaThumb} alt="Gestão da Emoção" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0B0908] hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0908] to-transparent lg:hidden" />
              </div>
              
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full bg-[#F88A2B] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">Sugerido pela IA</span>
                </div>
                <h2 style={serif} className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  Gestão da Emoção
                </h2>
                <p className="text-lg text-white/70 mb-8 leading-relaxed">
                  Agora que você dominou os conceitos básicos de equilíbrio, está pronto para aprofundar seu autocontrole em situações de alta pressão.
                </p>
                
                <div className="flex flex-wrap items-center gap-6 mb-8 text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2"><Play size={14} /> 8 Aulas</div>
                  <div className="flex items-center gap-2"><Clock size={14} /> 2h 40m</div>
                  <div className="flex items-center gap-2"><BarChart size={14} /> Avançado</div>
                </div>

                <div className="flex items-center gap-2 text-[#F88A2B] font-bold text-sm uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                  Iniciar Trilha <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );

  return (
    <MediaDesktopLayout title="Sugestão IA" backTo={backTo} sidePanel={sidePanel}>
      {content}
    </MediaDesktopLayout>
  );
};

export default SugestaoTrilhaScreen;
