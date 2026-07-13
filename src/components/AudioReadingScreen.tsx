import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, Bookmark, MoreVertical, Pause, RotateCcw, RotateCw, Gauge, Timer, Download, Heart, Headphones, Calendar, Tag, Play } from "lucide-react";
import audioCover from "@/assets/audio-cover.jpg";
import { MediaDesktopLayout, SidePanelCard, SidePanelList } from "./layouts/MediaDesktopLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const AudioReadingScreen = () => {
  const [tab, setTab] = useState<"sobre" | "leitura">("sobre");
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/feed" : "/feed";

  const sidePanel = (
    <div className="space-y-4">
      <SidePanelCard title="Sua Jornada">
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
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold text-[#111]">Áudio</h1>
          <div className="flex items-center gap-3 text-[#111]">
            <Bookmark size={20} strokeWidth={1.8} />
            <MoreVertical size={20} strokeWidth={1.8} />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-5 lg:px-10 py-6 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
          {/* Audio Cover */}
          <div className="w-full max-w-[280px] lg:max-w-[340px] shrink-0">
            <div className="bg-[#E3ECDD] rounded-[40px] p-8 aspect-square flex flex-col items-center justify-center relative shadow-2xl shadow-green-900/10 group overflow-hidden">
              <img src={audioCover} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40" />
              <div className="relative z-10 text-center">
                <p className="text-2xl lg:text-3xl font-serif italic text-[#3a4a30] leading-tight mb-4">Áudio indisponível</p>
                <p className="text-[10px] tracking-[0.3em] font-bold text-[#3a4a30]/60 uppercase">—</p>
              </div>
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex-1 w-full text-center lg:text-left">
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#111] leading-tight mb-2">Áudio indisponível</h1>
              <p className="text-lg text-[#666] leading-relaxed mb-2">Este conteúdo ainda não foi disponibilizado.</p>
              <p className="text-sm font-bold text-[#F88A2B] uppercase tracking-widest">—</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-2 rounded-full bg-black/5 overflow-hidden relative mb-3">
                <div className="h-full w-[0%] bg-[#F88A2B] shadow-[0_0_12px_rgba(248,138,43,0.4)]" />
              </div>
              <div className="flex justify-between text-xs font-bold text-[#999] tabular-nums tracking-widest">
                <span>00:00</span><span>--:--</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center lg:justify-start gap-8 mb-10">
              <button className="text-[#111] hover:text-[#F88A2B] transition-all hover:scale-110 active:scale-90" aria-label="Voltar 15s">
                <RotateCcw size={36} strokeWidth={1.2} />
              </button>
              <button className="w-20 h-20 rounded-full bg-[#F88A2B] text-white flex items-center justify-center shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all" aria-label="Pausar">
                <Pause size={36} fill="currentColor" />
              </button>
              <button className="text-[#111] hover:text-[#F88A2B] transition-all hover:scale-110 active:scale-90" aria-label="Avançar 15s">
                <RotateCw size={36} strokeWidth={1.2} />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: <Gauge size={22} />, label: "1.0x" },
                { icon: <Timer size={22} />, label: "Timer" },
                { icon: <Download size={22} />, label: "Baixar" },
              ].map((a) => (
                <button key={a.label} className="flex flex-col items-center gap-2 py-4 rounded-3xl bg-[#F7F4F2] border border-black/5 hover:border-[#F88A2B]/20 hover:bg-white hover:shadow-lg transition-all group">
                  <span className="text-[#F88A2B] group-hover:scale-110 transition-transform">{a.icon}</span>
                  <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Tabs Area */}
        <div className="mt-8">
          <div className="flex border-b border-black/5 mb-8">
            {([
              { id: "sobre", label: "Sobre o Conteúdo" },
              { id: "leitura", label: "Transcrição da Aula" },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-8 pb-4 text-sm font-bold relative transition-all ${tab === t.id ? "text-[#F88A2B]" : "text-[#999] hover:text-[#666]"}`}
              >
                {t.label}
                {tab === t.id && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F88A2B] rounded-full shadow-[0_0_10px_rgba(248,138,43,0.5)]" />}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {tab === "sobre" ? (
              <div className="animate-fade-in space-y-8">
                <p className="text-lg leading-relaxed text-[#444]">
                  A descrição deste áudio será exibida quando o conteúdo for publicado.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#F7F4F2] rounded-3xl p-6 border border-black/5">
                    <Headphones size={24} className="text-[#F88A2B] mb-3" />
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] mb-1">Formato</p>
                    <p className="text-base font-bold text-[#111]">—</p>
                  </div>
                  <div className="bg-[#F7F4F2] rounded-3xl p-6 border border-black/5">
                    <Calendar size={24} className="text-[#F88A2B] mb-3" />
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] mb-1">Duração</p>
                    <p className="text-base font-bold text-[#111]">—</p>
                  </div>
                  <div className="bg-[#F7F4F2] rounded-3xl p-6 border border-black/5">
                    <Tag size={24} className="text-[#F88A2B] mb-3" />
                    <p className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em] mb-1">Nível</p>
                    <p className="text-base font-bold text-[#111]">—</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in bg-[#F7F4F2] rounded-[32px] p-8 lg:p-12 border border-black/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/5 rounded-bl-full" />
                <p className="text-lg lg:text-xl leading-relaxed text-[#666] relative z-10">
                  A transcrição será exibida quando o conteúdo for publicado.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center lg:justify-start gap-4">
          <button className="h-14 px-10 rounded-full bg-[#F88A2B] text-white font-bold text-base shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <Heart size={20} strokeWidth={2} />
            Favorito
          </button>
          <button className="h-14 px-8 rounded-full border border-black/10 text-[#666] font-bold text-base hover:bg-black/5 active:scale-95 transition-all">
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Áudio">
        {content}
      </EnterpriseUserLayout>
    );
  }

  return (
    <MediaDesktopLayout title="Áudio" backTo={backTo} sidePanel={sidePanel}>
      {content}
    </MediaDesktopLayout>
  );
};

export default AudioReadingScreen;
