import { useState } from "react";
import { Link } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import {
  ArrowLeft, Search, Sparkles, Quote, Clock, BookOpen, ChevronRight,
  Heart, Brain, Shield, Activity, Wind, type LucideIcon,
} from "lucide-react";

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

type Theme = {
  id: string;
  label: string;
  icon: LucideIcon;
  hue: { from: string; to: string; accent: string; bg: string };
  hero: string;
  subtitle: string;
  quote: string;
};

const themes: Theme[] = [
  {
    id: "ansiedade",
    label: "Ansiedade",
    icon: Wind,
    hue: { from: "#1F2A3A", to: "#0E141C", accent: "#A8C5F0", bg: "#0B1220" },
    hero: "Acalme a mente que não para.",
    subtitle: "Caminhos para silenciar o ruído interno e respirar com mais leveza.",
    quote: "A ansiedade é a sombra de uma mente que esqueceu de morar no presente.",
  },
  {
    id: "relacoes",
    label: "Relações",
    icon: Heart,
    hue: { from: "#3A1F28", to: "#1C0E14", accent: "#E89A9A", bg: "#1A0B10" },
    hero: "Reaprenda a amar com presença.",
    subtitle: "Sobre afeto, perdão, escuta e os vínculos que nos transformam.",
    quote: "Os melhores relacionamentos começam dentro de nós.",
  },
  {
    id: "inteligencia",
    label: "Inteligência emocional",
    icon: Brain,
    hue: { from: "#2A1F3A", to: "#140E1C", accent: "#C9A8F0", bg: "#120B1A" },
    hero: "Pense além das suas emoções.",
    subtitle: "Domine seus pensamentos antes que eles dominem você.",
    quote: "Inteligência sem gestão emocional é luz sem direção.",
  },
  {
    id: "autocontrole",
    label: "Autocontrole",
    icon: Shield,
    hue: { from: "#3A2818", to: "#1C130D", accent: "#F8B05A", bg: "#0F0905" },
    hero: "Você no comando de você.",
    subtitle: "A coragem silenciosa de escolher quem você quer ser.",
    quote: "Quem domina a si mesmo é mais poderoso que quem conquista o mundo.",
  },
  {
    id: "saude",
    label: "Saúde mental",
    icon: Activity,
    hue: { from: "#1F3A2A", to: "#0E1C14", accent: "#9AD8B8", bg: "#0A1A12" },
    hero: "Cuide do que ninguém vê.",
    subtitle: "Práticas e leituras para uma mente saudável e em paz.",
    quote: "A maior riqueza é a saúde da mente que habita você.",
  },
];

const booksByTheme: Record<string, Array<{ t: string; sub: string; min: string; pct?: number; locked?: boolean; c1: string; c2: string }>> = {
  ansiedade: [
    { t: "Ansiedade — O mal do século", sub: "Como enfrentar e silenciar a mente acelerada", min: "5h 20m", pct: 0.34, c1: "#3D5A7B", c2: "#1F2A3A" },
    { t: "Mentes Ansiosas", sub: "Histórias que ensinam a respirar de novo", min: "4h 10m", c1: "#4A6B9B", c2: "#1F2A3A" },
    { t: "O silêncio que cura", sub: "Reflexões para a mente em tempestade", min: "3h 50m", locked: true, c1: "#2C3F5C", c2: "#1F2A3A" },
  ],
  relacoes: [
    { t: "O vendedor de sonhos", sub: "Sobre vínculos que reconstroem", min: "5h 40m", pct: 0.62, c1: "#8B4A28", c2: "#3A1F12" },
    { t: "Pais Brilhantes", sub: "A arte de educar e amar", min: "4h 20m", c1: "#A56B4A", c2: "#3A1F28" },
    { t: "Filhos Fascinantes", sub: "Compreender, escutar, guiar", min: "3h 40m", locked: true, c1: "#7B3D2C", c2: "#3A1F28" },
  ],
  inteligencia: [
    { t: "O Código da Inteligência", sub: "As janelas da mente humana", min: "6h 10m", pct: 0.12, c1: "#6B4A7B", c2: "#2A1B2E" },
    { t: "Inteligência Multifocal", sub: "A teoria por trás da mente plena", min: "5h 20m", c1: "#8B6B9B", c2: "#2A1B2E" },
    { t: "A mente sem fronteiras", sub: "Pensar com profundidade", min: "4h 40m", locked: true, c1: "#5C3D6B", c2: "#2A1B2E" },
  ],
  autocontrole: [
    { t: "Gestão da Emoção", sub: "Liderança interior para a vida real", min: "4h 50m", c1: "#A56B3D", c2: "#3A2818" },
    { t: "O poder da escolha", sub: "Pequenas decisões, grandes destinos", min: "5h 10m", c1: "#8B5A3D", c2: "#3A2818" },
    { t: "A coragem silenciosa", sub: "Disciplina que liberta", min: "3h 30m", locked: true, c1: "#7B4A2C", c2: "#3A2818" },
  ],
  saude: [
    { t: "Mente saudável", sub: "Hábitos para uma vida em paz", min: "4h 20m", c1: "#5C8B6B", c2: "#1F3A2A" },
    { t: "O cérebro feliz", sub: "Neurociência e bem-estar", min: "5h 40m", c1: "#7BA88B", c2: "#1F3A2A" },
    { t: "Respirar é viver", sub: "Práticas diárias de presença", min: "2h 50m", locked: true, c1: "#4A7B5C", c2: "#1F3A2A" },
  ],
};

const insightsByTheme: Record<string, Array<{ q: string; b: string }>> = {
  ansiedade: [
    { q: "A ansiedade não é o problema. O problema é tentar fugir dela.", b: "Ansiedade — O mal do século" },
    { q: "Respirar fundo é o primeiro ato de coragem.", b: "Mentes Ansiosas" },
  ],
  relacoes: [
    { q: "Amar é estar presente, mesmo no silêncio.", b: "O vendedor de sonhos" },
    { q: "Educar é um ato de escuta antes de fala.", b: "Pais Brilhantes" },
  ],
  inteligencia: [
    { q: "A mente é uma casa: arrume antes de receber visitas.", b: "O Código da Inteligência" },
    { q: "Pensar bem é o luxo de quem desacelera.", b: "Inteligência Multifocal" },
  ],
  autocontrole: [
    { q: "Quem espera, escolhe. Quem reage, perde.", b: "Gestão da Emoção" },
    { q: "A maior batalha é dentro de você.", b: "O poder da escolha" },
  ],
  saude: [
    { q: "Cuidar da mente é cuidar de tudo o que você ainda vai viver.", b: "Mente saudável" },
    { q: "Você não precisa estar bem o tempo todo. Só precisa voltar.", b: "O cérebro feliz" },
  ],
};

export default function ThemedLibraryScreen() {
  const [active, setActive] = useState<Theme>(themes[0]);
  const books = booksByTheme[active.id];
  const insights = insightsByTheme[active.id];

  return (
    <div className="min-h-screen w-full transition-colors duration-700" style={{ ...sans, background: active.hue.bg, color: "#F4E7CE" }}>
      <style>{`
        @keyframes fadeUp { from {opacity:0; transform:translateY(14px);} to {opacity:1; transform:none;} }
        @keyframes glow { 0%,100%{opacity:.5;} 50%{opacity:.85;} }
        .fade-up{animation:fadeUp .7s ease both;}
        .glow{animation:glow 5s ease-in-out infinite;}
        .no-scrollbar::-webkit-scrollbar{display:none}
      `}</style>

      <div className="mx-auto max-w-[440px] pb-32">
        {/* Hero */}
        <div className="relative overflow-hidden" style={{
          background: `linear-gradient(180deg, ${active.hue.from} 0%, ${active.hue.to} 100%)`,
        }}>
          {/* ambient glow */}
          <div className="pointer-events-none absolute top-10 right-[-60px] w-[280px] h-[280px] rounded-full glow" style={{
            background: `radial-gradient(closest-side, ${active.hue.accent}55, transparent 70%)`,
          }} />

          <div className="relative px-5 pt-3 pb-8">
            {/* status */}
            {/* nav */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/biblioteca" className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(244,231,206,0.1)" }}><ArrowLeft size={18} /></Link>
              <div className="text-[11px] tracking-[0.32em] uppercase opacity-60">Por tema</div>
              <button className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(244,231,206,0.1)" }}><Search size={16} /></button>
            </div>

            {/* hero content */}
            <div className="fade-up" key={active.id}>
              <div className="flex items-center gap-2 mb-4 text-[10px] tracking-[0.32em] uppercase" style={{ color: active.hue.accent }}>
                <active.icon size={14} />
                {active.label}
              </div>
              <h1 className="text-[32px] leading-[1.05] mb-4" style={serif}>{active.hero}</h1>
              <p className="text-[13px] leading-relaxed opacity-65 max-w-[320px]">{active.subtitle}</p>

              <div className="flex items-center gap-4 mt-6 text-[11px] opacity-65">
                <span className="flex items-center gap-1.5"><BookOpen size={11} /> {books.length} livros</span>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1.5"><Quote size={11} /> {insights.length} insights</span>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1.5"><Sparkles size={11} /> Curadoria IA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Theme chips */}
        <div className="sticky top-0 z-10 backdrop-blur-md py-3 px-5 -mt-1" style={{ background: `${active.hue.bg}cc` }}>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {themes.map((t) => {
              const ItemIcon = t.icon;
              const isActive = active.id === t.id;
              return (
                <button key={t.id} onClick={() => setActive(t)} className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] transition-all whitespace-nowrap" style={{
                  background: isActive ? t.hue.accent : "rgba(244,231,206,0.06)",
                  color: isActive ? "#0E0905" : "rgba(244,231,206,0.7)",
                  border: `1px solid ${isActive ? t.hue.accent : "rgba(244,231,206,0.08)"}`,
                }}>
                  <ItemIcon size={11} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 pt-6 space-y-10">
          {/* AI suggestion banner */}
          <div className="fade-up rounded-2xl p-4 flex gap-3 items-start" key={`ai-${active.id}`} style={{
            background: `linear-gradient(160deg, ${active.hue.accent}20, ${active.hue.accent}08)`,
            border: `1px solid ${active.hue.accent}30`,
          }}>
            <div className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: active.hue.accent, color: active.hue.bg }}>
              <Sparkles size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: active.hue.accent }}>Recomendação Cury IA</div>
              <p className="text-[13px] leading-relaxed opacity-80">Para o seu momento atual, comecemos por <em style={serif}>{books[0].t}</em>. É o ponto de partida ideal nesta jornada de {active.label.toLowerCase()}.</p>
              <Link to="/cury-digital/chat" className="text-[11px] mt-3 inline-flex items-center gap-1" style={{ color: active.hue.accent }}>
                Conversar com a IA <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Books — featured + list */}
          <div className="fade-up" key={`books-${active.id}`}>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-[18px]" style={serif}>Livros sobre {active.label.toLowerCase()}</h2>
              <span className="text-[11px] opacity-55">{books.length}</span>
            </div>

            {/* Featured card */}
            <Link to={books[0].locked ? "/biblioteca/bloqueado" : "/biblioteca/detalhe"} className="block rounded-3xl p-5 mb-4 relative overflow-hidden" style={{
              background: `linear-gradient(160deg, ${books[0].c1}, ${books[0].c2})`,
              boxShadow: `0 30px 60px -24px ${active.hue.accent}55`,
            }}>
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full" style={{ background: `radial-gradient(closest-side, ${active.hue.accent}50, transparent 70%)` }} />
              <div className="flex gap-4 relative">
                <div className="w-[96px] aspect-[3/4] rounded-lg shrink-0 relative overflow-hidden" style={{
                  background: `linear-gradient(160deg, ${books[0].c1}, ${books[0].c2})`,
                  boxShadow: "0 14px 30px -14px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}>
                  <div className="absolute inset-0" style={{ background: `radial-gradient(120% 80% at 30% 0%, ${active.hue.accent}33, transparent 60%)` }} />
                  <div className="absolute inset-x-2 bottom-2 text-[8px] leading-tight" style={{ ...serif, color: "#F4E7CE" }}>{books[0].t}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: active.hue.accent }}>Em destaque</div>
                  <div className="text-[16px] leading-tight mb-1" style={serif}>{books[0].t}</div>
                  <div className="text-[11px] opacity-65 line-clamp-2 mb-3">{books[0].sub}</div>
                  <div className="flex items-center gap-3 text-[10px] opacity-65">
                    <span className="flex items-center gap-1"><Clock size={10} /> {books[0].min}</span>
                    {books[0].pct && <><span className="opacity-40">·</span><span style={{ color: active.hue.accent }}>{Math.round(books[0].pct * 100)}% lido</span></>}
                  </div>
                </div>
              </div>
            </Link>

            {/* List */}
            <div className="space-y-3">
              {books.slice(1).map((b, i) => (
                <Link key={i} to={b.locked ? "/biblioteca/bloqueado" : "/biblioteca/detalhe"} className="flex gap-4 rounded-2xl p-3 transition-all hover:translate-y-[-1px]" style={{
                  background: "rgba(244,231,206,0.04)",
                  border: "1px solid rgba(244,231,206,0.06)",
                }}>
                  <div className="w-[60px] aspect-[3/4] rounded-md shrink-0 relative overflow-hidden" style={{
                    background: `linear-gradient(160deg, ${b.c1}, ${b.c2})`,
                  }}>
                    <div className="absolute inset-x-1.5 bottom-1.5 text-[7px] leading-tight" style={{ ...serif, color: "#F4E7CE" }}>{b.t}</div>
                    {b.locked && <div className="absolute inset-0 grid place-items-center" style={{ background: "rgba(0,0,0,0.45)" }}><Shield size={14} className="opacity-70" /></div>}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="text-[14px] leading-tight mb-0.5 truncate" style={serif}>{b.t}</div>
                    <div className="text-[11px] opacity-55 mb-2 line-clamp-1">{b.sub}</div>
                    <div className="flex items-center gap-2 text-[10px] opacity-55">
                      <Clock size={10} /> {b.min}
                      {b.locked && <><span className="opacity-40">·</span><span>em breve</span></>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Emotional insights */}
          <div className="fade-up" key={`ins-${active.id}`}>
            <div className="flex items-end justify-between mb-4">
              <h2 className="text-[18px]" style={serif}>Insights emocionais</h2>
              <Link to="/biblioteca/salvos" className="text-[11px] opacity-55">Ver todos</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
              {insights.map((q, i) => (
                <div key={i} className="shrink-0 w-[280px] rounded-2xl p-5 relative overflow-hidden" style={{
                  background: `linear-gradient(160deg, ${active.hue.from}, ${active.hue.to})`,
                  border: `1px solid ${active.hue.accent}25`,
                }}>
                  <Quote size={14} style={{ color: active.hue.accent }} className="opacity-70 mb-3" />
                  <p className="text-[14px] leading-relaxed mb-4" style={{ ...serif, fontStyle: "italic" }}>"{q.q}"</p>
                  <div className="text-[10px] tracking-[0.2em] uppercase opacity-55">{q.b}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pull quote of the theme */}
          <div className="fade-up text-center px-4 py-6" key={`pq-${active.id}`}>
            <div className="opacity-50 mb-4 grid place-items-center" style={{ color: active.hue.accent }}>
              <Quote size={18} />
            </div>
            <p className="text-[18px] leading-relaxed" style={{ ...serif, fontStyle: "italic", color: active.hue.accent }}>"{active.quote}"</p>
          </div>

          {/* Related themes */}
          <div className="fade-up">
            <h2 className="text-[16px] mb-4" style={serif}>Outros temas para explorar</h2>
            <div className="grid grid-cols-2 gap-3">
              {themes.filter(t => t.id !== active.id).slice(0, 4).map((t) => {
                const ItemIcon = t.icon;
                return (
                  <AppUserLayout>
                  <button key={t.id} onClick={() => setActive(t)} className="rounded-2xl p-4 text-left relative overflow-hidden" style={{
                    background: `linear-gradient(160deg, ${t.hue.from}, ${t.hue.to})`,
                    border: "1px solid rgba(244,231,206,0.06)",
                  }}>
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-50" style={{ background: `radial-gradient(closest-side, ${t.hue.accent}55, transparent 70%)` }} />
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full grid place-items-center mb-3" style={{ background: `${t.hue.accent}20`, color: t.hue.accent }}>
                        <ItemIcon size={14} />
                      </div>
                      <div className="text-[13px] mb-1" style={serif}>{t.label}</div>
                      <div className="text-[10px] opacity-55">{(booksByTheme[t.id] || []).length} livros</div>
                    </div>
                  </button>
                  </AppUserLayout>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-12" style={{ background: `linear-gradient(to top, ${active.hue.bg} 65%, transparent)` }}>
        <div className="mx-auto max-w-[440px]">
          <Link to="/biblioteca/detalhe" className="w-full rounded-full py-4 grid place-items-center text-[14px] font-medium" style={{
            background: active.hue.accent,
            color: active.hue.bg,
            boxShadow: `0 18px 40px -16px ${active.hue.accent}80`,
          }}>
            <span className="flex items-center gap-2">Explorar {active.label.toLowerCase()} <ChevronRight size={16} /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
