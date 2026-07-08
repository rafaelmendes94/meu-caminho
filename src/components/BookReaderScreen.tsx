import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MediaDesktopLayout } from "./layouts/MediaDesktopLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { ChevronLeft, List, Type, Bookmark, Headphones, X, Sun, Moon } from "lucide-react";

const FONT_FAMILIES = {
  serif: "'Lora','Playfair Display', Georgia, serif",
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  dyslexic: "'OpenDyslexic', 'Comic Sans MS', system-ui, sans-serif",
} as const;
type FontFamilyKey = keyof typeof FONT_FAMILIES;

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.01em" } as const;

const BookmarkI = ({ filled = false }: { filled?: boolean }) => (<Bookmark size={20} fill={filled ? "currentColor" : "none"} />);
const Sepia = () => (<div className="w-4 h-4 rounded-full bg-[#E5D4B5] border border-black/10" />);

type Theme = "light" | "sepia" | "dark" | "parchment" | "softnight";

const THEMES: Record<Theme, { bg: string; paper: string; text: string; muted: string; accent: string; border: string; }> = {
  light: { bg: "#EDE7E1", paper: "#FFF8F3", text: "#1F1A14", muted: "#6E6357", accent: "#F88A2B", border: "#EFE3D5" },
  sepia: { bg: "#E5D4B5", paper: "#F2E6D0", text: "#3A2E1E", muted: "#7A6442", accent: "#C28A3E", border: "#E5D4B5" },
  parchment: { bg: "#D9C39A", paper: "#F5E6C0", text: "#2A1F10", muted: "#7A5E36", accent: "#A8651C", border: "#D9C39A" },
  softnight: { bg: "#1A1714", paper: "#23201C", text: "#D6CFC2", muted: "#8A8275", accent: "#E8A664", border: "rgba(255,255,255,0.06)" },
  dark: { bg: "#000000", paper: "#0F0B07", text: "#E9E1D3", muted: "#9B8C76", accent: "#F8B05A", border: "rgba(255,255,255,0.08)" },
};

const FONT_SIZES = [15, 16, 17, 18, 20, 22] as const;
const LINE_HEIGHTS = { compact: 1.45, normal: 1.7, comfort: 1.95 } as const;
type LineKey = keyof typeof LINE_HEIGHTS;
const MARGINS = { narrow: 18, medium: 28, wide: 40 } as const;
type MarginKey = keyof typeof MARGINS;

type Prefs = {
  theme: Theme;
  fontIdx: number;
  fontFamily: FontFamilyKey;
  fontWeight: 400 | 500 | 700;
  lineKey: LineKey;
  marginKey: MarginKey;
  mode: "pagina" | "rolagem" | "kindle";
  width: "compact" | "normal" | "wide";
  brightness: number;
};

const DEFAULT_PREFS: Prefs = {
  theme: "sepia",
  fontIdx: 2,
  fontFamily: "serif",
  fontWeight: 400,
  lineKey: "normal",
  marginKey: "medium",
  mode: "pagina",
  width: "normal",
  brightness: 0,
};

type Block =
  | { kind: "h1"; text: string }
  | { kind: "p"; text: string }
  | { kind: "quote"; text: string };

const BOOK = {
  id: "o-vendedor-de-sonhos",
  title: "O Vendedor de Sonhos",
  author: "Augusto Cury",
  chapters: [
    {
      id: "c1",
      title: "A coragem de sonhar",
      blocks: [
        { kind: "h1", text: "A coragem de sonhar" },
        { kind: "p", text: "Há momentos em que a vida se silencia e nos convida a olhar para dentro. Não é o silêncio do vazio, mas o silêncio fértil — aquele em que as ideias mais simples encontram caminho até o coração." },
        { kind: "p", text: "Quando aprendemos a habitar esse silêncio, descobrimos que os sonhos não são fugas da realidade — são a forma mais nobre de transformá-la. Sonhar é um ato de coragem em uma época que celebra a pressa e despreza a contemplação." },
        { kind: "quote", text: "Quem perde a capacidade de sonhar perde antes a capacidade de viver." },
        { kind: "p", text: "A vida intensa não nasce de grandes feitos, mas de pequenos gestos de quem decide acreditar. E talvez seja por isso que, ao reencontrar um sonho esquecido, sentimos um arrepio que não sabemos nomear: é a alma reconhecendo um endereço antigo." },
      ],
    },
    {
      id: "c2",
      title: "O território do silêncio",
      blocks: [
        { kind: "h1", text: "O território do silêncio" },
        { kind: "p", text: "Há um lugar dentro de nós onde o barulho do mundo não entra. Esse lugar não tem endereço, mas tem caminho — e ele se chama atenção plena." },
        { kind: "quote", text: "O silêncio é a linguagem em que a alma finalmente se reconhece." },
        { kind: "p", text: "Cultivar o silêncio interior é um ato revolucionário. É dizer ao mundo: hoje, eu volto para casa. E essa casa é você mesmo, em sua versão mais íntegra." },
      ],
    },
  ],
};

export default function BookReaderScreen() {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/biblioteca" : "/biblioteca";

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const update = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }));

  const { theme, fontIdx, fontFamily, fontWeight, lineKey, marginKey, mode, width, brightness } = prefs;
  const t = THEMES[theme];
  const fs = FONT_SIZES[fontIdx];
  const lh = LINE_HEIGHTS[lineKey];
  const mPx = MARGINS[marginKey];
  const ff = FONT_FAMILIES[fontFamily];
  const isDarkish = theme === "dark" || theme === "softnight";

  const [showSettings, setShowSettings] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [bookmarked, setBookmarked] = useState(true);
  const [chromeVisible, setChromeVisible] = useState(true);

  // Auto-load bookmarks and progress could go here

  const renderPageContent = () => {
    return (
      <>
        {BOOK.chapters.map((ch, ci) => (
          <div key={ch.id} className="mb-12">
            {ch.blocks.map((b, bi) => (
              <div key={bi} className="mb-6">
                {b.kind === "h1" && <h2 style={{ ...serif, fontSize: fs * 1.5, color: t.text, lineHeight: 1.2, fontWeight: 700 }}>{b.text}</h2>}
                {b.kind === "p" && <p style={{ fontFamily: ff, fontSize: fs, lineHeight: lh, color: t.text, fontWeight }}>{b.text}</p>}
                {b.kind === "quote" && (
                  <div className="py-4 pl-4 border-l-2" style={{ borderColor: t.accent }}>
                    <p style={{ ...serif, fontSize: fs * 1.1, color: t.text, fontStyle: "italic", lineHeight: lh }}>{b.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </>
    );
  };

  const content = (
    <div className="relative w-full h-full overflow-hidden flex flex-col transition-colors duration-500" style={{ background: t.bg }}>
      {/* Header */}
      <header className={`relative z-30 px-5 py-4 transition-opacity duration-300 shrink-0 ${chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex items-center justify-between">
          <Link to={backTo} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ background: isDarkish ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: t.text }}>
            <ChevronLeft size={24} />
          </Link>
          <div className="text-center min-w-0 px-4">
            <div className="text-[9px] uppercase tracking-[0.25em] font-bold opacity-40 mb-1" style={{ color: t.text }}>{BOOK.author}</div>
            <h1 style={{ ...serif, color: t.text }} className="text-[15px] font-bold leading-tight truncate">{BOOK.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowToc(true)} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ background: isDarkish ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: t.text }}>
              <List size={20} />
            </button>
            <button onClick={() => setBookmarked(!bookmarked)} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ background: isDarkish ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: bookmarked ? t.accent : t.text }}>
              <BookmarkI filled={bookmarked} />
            </button>
          </div>
        </div>
      </header>

      {/* Reading Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth" onClick={() => setChromeVisible(!chromeVisible)}>
        <div 
          className="mx-auto py-12 transition-all duration-300" 
          style={{ 
            paddingLeft: mPx, 
            paddingRight: mPx,
            maxWidth: width === 'compact' ? '650px' : width === 'normal' ? '900px' : '100%'
          }}
        >
          {renderPageContent()}
        </div>
      </div>

      {/* Bottom Chrome */}
      <div className={`relative z-30 px-6 py-5 transition-opacity duration-300 shrink-0 ${chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`} style={{ background: t.bg }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: t.muted }}>
            <span>Capítulo 1 de {BOOK.chapters.length}</span>
            <span>45% concluído</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/5 overflow-hidden mb-6">
            <div className="h-full bg-[#F88A2B] shadow-[0_0_10px_rgba(248,138,43,0.3)] transition-all duration-300" style={{ width: "45%" }} />
          </div>
          <div className="flex items-center justify-between gap-4">
             <button onClick={() => setShowToc(true)} className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm border border-black/5 transition-all active:scale-95" style={{ background: t.paper, color: t.text }}><List size={18}/> Sumário</button>
             <button onClick={() => setShowSettings(true)} className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm border border-black/5 transition-all active:scale-95" style={{ background: t.paper, color: t.text }}><Type size={18}/> Ajustar</button>
             <button className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm border border-black/5 transition-all active:scale-95" style={{ background: t.paper, color: t.text }}><Headphones size={18}/> Ouvir</button>
          </div>
        </div>
      </div>

      {/* Simple Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-2xl bg-white rounded-t-[32px] p-8 animate-slide-up" onClick={e => e.stopPropagation()} style={{ background: t.paper }}>
            <div className="flex items-center justify-between mb-8">
              <h3 style={{ ...serif, color: t.text }} className="text-2xl font-bold">Ajustes de Leitura</h3>
              <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5" style={{ color: t.text }}><X /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40" style={{ color: t.text }}>Temas</p>
                <div className="flex gap-3">
                  {(['light', 'sepia', 'dark', 'parchment', 'softnight'] as Theme[]).map(th => (
                    <button 
                      key={th} 
                      onClick={() => update({ theme: th })}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${theme === th ? 'scale-110 shadow-lg' : 'opacity-60'}`}
                      style={{ background: THEMES[th].paper, borderColor: theme === th ? t.accent : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40" style={{ color: t.text }}>Tamanho da Fonte</p>
                <div className="flex items-center gap-4">
                   <button onClick={() => update({ fontIdx: Math.max(0, fontIdx - 1) })} className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center font-bold" style={{ color: t.text }}>A-</button>
                   <div className="flex-1 h-1 bg-black/5 rounded-full relative">
                      <div className="absolute top-1/2 left-0 h-4 w-4 bg-[#F88A2B] rounded-full -translate-y-1/2 shadow-md transition-all" style={{ left: `${(fontIdx / (FONT_SIZES.length - 1)) * 100}%` }} />
                   </div>
                   <button onClick={() => update({ fontIdx: Math.min(FONT_SIZES.length - 1, fontIdx + 1) })} className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center font-bold" style={{ color: t.text }}>A+</button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40" style={{ color: t.text }}>Largura da Página</p>
                <div className="flex gap-2">
                  {(['compact', 'normal', 'wide'] as const).map(w => (
                    <button 
                      key={w} 
                      onClick={() => update({ width: w })}
                      className={`flex-1 py-2 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${width === w ? 'border-[#F88A2B] bg-[#F88A2B]/10 text-[#F88A2B]' : 'border-black/5 text-[#999]'}`}
                    >
                      {w === 'compact' ? 'Focada' : w === 'normal' ? 'Padrão' : 'Larga'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40" style={{ color: t.text }}>Modo de Visualização</p>
                <div className="flex gap-2">
                  {(['pagina', 'rolagem', 'kindle'] as const).map(m => (
                    <button 
                      key={m} 
                      onClick={() => update({ mode: m })}
                      className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${mode === m ? 'border-[#F88A2B] bg-[#F88A2B]/10 text-[#F88A2B]' : 'border-black/5 text-[#999]'}`}
                    >
                      {m === 'pagina' ? 'Páginas' : m === 'rolagem' ? 'Rolagem' : 'Kindle'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* TOC Overlay */}
      {showToc && (
        <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowToc(false)}>
          <div className="w-full max-w-2xl bg-white rounded-t-[32px] p-8 animate-slide-up" onClick={e => e.stopPropagation()} style={{ background: t.paper }}>
            <div className="flex items-center justify-between mb-8">
              <h3 style={{ ...serif, color: t.text }} className="text-2xl font-bold">Sumário</h3>
              <button onClick={() => setShowToc(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5" style={{ color: t.text }}><X /></button>
            </div>
            <div className="space-y-2">
              {BOOK.chapters.map((ch, ci) => (
                <button 
                  key={ch.id} 
                  onClick={() => setShowToc(false)}
                  className="w-full text-left p-4 rounded-2xl hover:bg-black/5 transition-colors"
                >
                  <p className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest mb-1">Capítulo {ci + 1}</p>
                  <h4 style={{ ...serif, color: t.text }} className="text-lg font-bold">{ch.title}</h4>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Leitor">
        <div className="bg-white rounded-[24px] shadow-sm ring-1 ring-black/5 overflow-hidden h-[calc(100vh-100px)]">
          {content}
        </div>
      </EnterpriseUserLayout>
    );
  }

  return (
    <MediaDesktopLayout title="Leitura" backTo={backTo}>
      <main className="h-screen w-full flex items-center justify-center bg-black">
        <div className="w-full h-full max-w-[500px] bg-white shadow-2xl">
          {content}
        </div>
      </main>
    </MediaDesktopLayout>
  );
}
