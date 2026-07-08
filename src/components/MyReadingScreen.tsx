import { Link } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

const inProgress = [
  { t: "O vendedor de sonhos", a: "Augusto Cury", chap: "Cap. 04 · O território dos sonhos", pct: 0.62, c1: "#3A2818", c2: "#7B5E3B" },
  { t: "Ansiedade — Como enfrentar o mal do século", a: "Augusto Cury", chap: "Cap. 02 · A mente em silêncio", pct: 0.34, c1: "#1F2A2E", c2: "#4A6B6F" },
  { t: "O Código da Inteligência", a: "Augusto Cury", chap: "Cap. 01 · As janelas da mente", pct: 0.12, c1: "#2A1B2E", c2: "#6B4A7B" },
];

const lastChapters = [
  { b: "O vendedor de sonhos", c: "Cap. 04", t: "O território dos sonhos", time: "há 2h" },
  { b: "Ansiedade", c: "Cap. 02", t: "A mente em silêncio", time: "ontem" },
  { b: "O vendedor de sonhos", c: "Cap. 03", t: "A coragem da entrega", time: "3 dias atrás" },
];

const quotes = [
  { q: "A coragem não é a ausência do medo, mas a decisão de seguir apesar dele.", b: "O vendedor de sonhos" },
  { q: "Quem sabe esperar, encontra no tempo o seu maior aliado.", b: "Ansiedade" },
  { q: "Uma mente livre é um céu sem fronteiras.", b: "O Código da Inteligência" },
];

const Icon = {
  Back: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Search: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" strokeLinecap="round"/></svg>),
  Play: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>),
  Bookmark: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v18l-6-4-6 4z"/></svg>),
  Quote: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h4v4H8c0 2 1 3 3 3v2c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 3 3v2c-3 0-5-2-5-5V7z"/></svg>),
  Note: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M14 3v6h6"/></svg>),
  Clock: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/></svg>),
  ArrowR: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Chevron: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

export default function MyReadingScreen() {
  const current = inProgress[0];

  return (
    <AppUserLayout>
    <div className="min-h-screen w-full" style={{ ...sans, background: "radial-gradient(120% 90% at 50% 0%, #FBF6EE 0%, #F4ECDF 60%, #EBE0CC 100%)", color: "#221912" }}>
      <style>{`
        @keyframes fadeUp { from {opacity:0; transform:translateY(12px);} to {opacity:1; transform:none;} }
        .fade-up{animation:fadeUp .7s ease both;}
      `}</style>

      <div className="mx-auto max-w-[440px] px-5 pt-3 pb-32">
        {/* status */}
        {/* nav */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/biblioteca" className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(34,25,18,0.06)" }}><Icon.Back /></Link>
          <div className="text-[11px] tracking-[0.32em] uppercase opacity-60">Biblioteca</div>
          <button className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(34,25,18,0.06)" }}><Icon.Search /></button>
        </div>

        {/* hero */}
        <div className="fade-up mb-8">
          <div className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: "#9A6B2C" }}>Bem-vindo de volta</div>
          <h1 className="text-[32px] leading-[1.05] mb-3" style={serif}>Sua leitura,<br/>seu tempo.</h1>
          <p className="text-[13px] leading-relaxed opacity-65 max-w-[320px]">Continue de onde parou. Cada página é um passo na sua evolução.</p>
        </div>

        {/* continue card — current book */}
        <Link to="/biblioteca/leitor" className="fade-up block rounded-3xl p-5 mb-10 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #1B130D 0%, #2A1D12 100%)", color: "#F4E7CE" }}>
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(248,176,90,0.3), transparent 70%)" }} />
          <div className="flex gap-4 relative">
            <div className="w-[88px] aspect-[3/4] rounded-lg shrink-0 relative" style={{
              background: `linear-gradient(160deg, ${current.c2}, ${current.c1})`,
              boxShadow: "0 14px 30px -12px rgba(0,0,0,0.6)",
            }}>
              <div className="absolute inset-x-2 bottom-2 text-[8px] leading-tight" style={serif}>{current.t}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: "#F8B05A" }}>Continuar</div>
              <div className="text-[16px] leading-tight mb-1" style={serif}>{current.t}</div>
              <div className="text-[11px] opacity-60 mb-3">{current.chap}</div>
              <div className="h-[3px] rounded-full mb-2 overflow-hidden" style={{ background: "rgba(244,231,206,0.15)" }}>
                <div className="h-full" style={{ width: `${current.pct * 100}%`, background: "linear-gradient(90deg, #F8B05A, #E8C07A)" }} />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="opacity-60">{Math.round(current.pct * 100)}% lido</span>
                <span className="flex items-center gap-1 opacity-80"><Icon.Play /> retomar</span>
              </div>
            </div>
          </div>
        </Link>

        {/* stats inline */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { v: "3", l: "em andamento" },
            { v: "11", l: "marcações" },
            { v: "5h 20m", l: "esta semana" },
          ].map((s, i) => (
            <div key={i} className="text-center fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="text-[20px]" style={serif}>{s.v}</div>
              <div className="text-[10px] opacity-55 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* in progress list */}
        <div className="fade-up mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[18px]" style={serif}>Em andamento</h2>
            <Link to="/biblioteca" className="text-[11px] opacity-60 flex items-center gap-1">Todos <Icon.Chevron /></Link>
          </div>
          <div className="space-y-3">
            {inProgress.map((b, i) => (
              <Link key={i} to="/biblioteca/leitor" className="flex gap-4 rounded-2xl p-3 transition-all hover:translate-y-[-1px]" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
                <div className="w-[60px] aspect-[3/4] rounded-md shrink-0 relative overflow-hidden" style={{
                  background: `linear-gradient(160deg, ${b.c2}, ${b.c1})`,
                  boxShadow: "0 6px 14px -8px rgba(0,0,0,0.4)",
                }}>
                  <div className="absolute inset-x-1.5 bottom-1.5 text-[7px] leading-tight" style={{ ...serif, color: "#F4E7CE" }}>{b.t}</div>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="text-[14px] leading-tight mb-0.5 truncate" style={serif}>{b.t}</div>
                  <div className="text-[11px] opacity-55 mb-2 truncate">{b.chap}</div>
                  <div className="h-[2px] rounded-full mb-1.5 overflow-hidden" style={{ background: "rgba(34,25,18,0.08)" }}>
                    <div className="h-full" style={{ width: `${b.pct * 100}%`, background: "linear-gradient(90deg, #F8B05A, #C28A3E)" }} />
                  </div>
                  <div className="text-[10px] opacity-55">{Math.round(b.pct * 100)}% concluído</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* quick access tiles */}
        <div className="grid grid-cols-2 gap-3 mb-10 fade-up">
          <Link to="/biblioteca/salvos" className="rounded-2xl p-4" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
            <div className="w-9 h-9 rounded-full grid place-items-center mb-3" style={{ background: "rgba(248,176,90,0.18)", color: "#9A6B2C" }}><Icon.Bookmark /></div>
            <div className="text-[14px] mb-0.5" style={serif}>Marcações</div>
            <div className="text-[11px] opacity-55">11 trechos salvos</div>
          </Link>
          <Link to="/biblioteca/salvos" className="rounded-2xl p-4" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
            <div className="w-9 h-9 rounded-full grid place-items-center mb-3" style={{ background: "rgba(248,176,90,0.18)", color: "#9A6B2C" }}><Icon.Note /></div>
            <div className="text-[14px] mb-0.5" style={serif}>Reflexões</div>
            <div className="text-[11px] opacity-55">7 notas pessoais</div>
          </Link>
          <Link to="/biblioteca/progresso-leitura" className="rounded-2xl p-4" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
            <div className="w-9 h-9 rounded-full grid place-items-center mb-3" style={{ background: "rgba(248,176,90,0.18)", color: "#9A6B2C" }}><Icon.Clock /></div>
            <div className="text-[14px] mb-0.5" style={serif}>Progresso</div>
            <div className="text-[11px] opacity-55">12 dias seguidos</div>
          </Link>
          <Link to="/biblioteca/capitulos" className="rounded-2xl p-4" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
            <div className="w-9 h-9 rounded-full grid place-items-center mb-3" style={{ background: "rgba(248,176,90,0.18)", color: "#9A6B2C" }}><Icon.Quote /></div>
            <div className="text-[14px] mb-0.5" style={serif}>Capítulos</div>
            <div className="text-[11px] opacity-55">Sumário do livro</div>
          </Link>
        </div>

        {/* saved quotes */}
        <div className="fade-up mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[18px]" style={serif}>Frases salvas</h2>
            <Link to="/biblioteca/salvos" className="text-[11px] opacity-60 flex items-center gap-1">Ver todas <Icon.Chevron /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2" style={{ scrollbarWidth: "none" }}>
            {quotes.map((q, i) => (
              <div key={i} className="shrink-0 w-[260px] rounded-2xl p-5" style={{ background: "linear-gradient(160deg, #FFFDF8, #F4ECDF)", border: "1px solid rgba(194,138,62,0.18)" }}>
                <div className="opacity-50 mb-3" style={{ color: "#9A6B2C" }}><Icon.Quote /></div>
                <p className="text-[14px] leading-relaxed mb-4 line-clamp-4" style={{ ...serif, fontStyle: "italic" }}>"{q.q}"</p>
                <div className="text-[10px] tracking-[0.2em] uppercase opacity-55">{q.b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* recent chapters */}
        <div className="fade-up">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[18px]" style={serif}>Últimos capítulos</h2>
          </div>
          <div className="space-y-2">
            {lastChapters.map((c, i) => (
              <Link key={i} to="/biblioteca/leitor" className="flex items-center gap-3 rounded-xl p-3 transition-all hover:translate-x-1">
                <div className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(248,176,90,0.15)", color: "#9A6B2C" }}><Icon.Play /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] truncate" style={serif}>{c.t}</div>
                  <div className="text-[10px] opacity-55 truncate">{c.b} · {c.c}</div>
                </div>
                <div className="text-[10px] opacity-50 shrink-0">{c.time}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-10" style={{ background: "linear-gradient(to top, #EBE0CC 60%, transparent)" }}>
        <div className="mx-auto max-w-[440px]">
          <Link to="/biblioteca/leitor" className="w-full rounded-full py-4 grid place-items-center text-[14px] font-medium" style={{ background: "linear-gradient(135deg, #1B130D, #3A2818)", color: "#F4E7CE", boxShadow: "0 14px 40px -16px rgba(27,19,13,0.6)" }}>
            <span className="flex items-center gap-2">Continuar leitura <Icon.ArrowR /></span>
          </Link>
        </div>
      </div>
    </div>
    </AppUserLayout>
  );
}
