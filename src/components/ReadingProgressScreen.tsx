import { Link } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

const week: { d: string; m: number; on: boolean; today?: boolean }[] = [
  { d: "S", m: 0, on: false }, { d: "T", m: 0, on: false }, { d: "Q", m: 0, on: false },
  { d: "Q", m: 0, on: false }, { d: "S", m: 0, on: false }, { d: "S", m: 0, on: false, today: true },
  { d: "D", m: 0, on: false },
];
const finished: { t: string; a: string; c: string }[] = [];
const insights: { q: string; c: string }[] = [];

const Icon = {
  Back: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Share: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v12m0-12l-4 4m4-4l4 4M5 20h14" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Flame: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s4 4 4 9a4 4 0 11-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 1012 0c0-7-6-12-6-12z"/></svg>),
  Clock: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/></svg>),
  Note: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M14 3v6h6"/></svg>),
  Book: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/></svg>),
  ArrowR: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Spark: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>),
};

function Ring({ pct }: { pct: number }) {
  const r = 78, c = 2 * Math.PI * r;
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-[0_10px_30px_rgba(248,176,90,0.25)]">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F8B05A" />
          <stop offset="100%" stopColor="#C28A3E" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(248,176,90,0.35)" />
          <stop offset="100%" stopColor="rgba(248,176,90,0)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#glow)" />
      <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(244,231,206,0.12)" strokeWidth="10" />
      <circle cx="100" cy="100" r={r} fill="none" stroke="url(#rg)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 100 100)" />
    </svg>
  );
}

export default function ReadingProgressScreen() {
  const pct = 0;
  const max = Math.max(...week.map(w => w.m));
  const weekMax = max || 1;
  const weekMin = week.reduce((a, w) => a + w.m, 0);

  return (
    <AppUserLayout>
    <div className="min-h-screen w-full" style={{ ...sans, background: "radial-gradient(120% 80% at 50% -10%, #1F1610 0%, #110B07 60%, #070503 100%)", color: "#F4E7CE" }}>
      <style>{`
        @keyframes fadeUp { from {opacity:0; transform:translateY(14px);} to {opacity:1; transform:none;} }
        @keyframes pulseGlow { 0%,100%{opacity:.5;} 50%{opacity:.9;} }
        @keyframes rise { from { transform: scaleY(0); } to { transform: scaleY(1);} }
        .fade-up{animation:fadeUp .8s ease both;}
        .glow{animation:pulseGlow 4s ease-in-out infinite;}
        .bar{transform-origin: bottom; animation: rise .9s cubic-bezier(.2,.8,.2,1) both;}
      `}</style>

      <div className="mx-auto max-w-[440px] px-5 pt-3 pb-32 relative">
        {/* ambient glow */}
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full glow"
          style={{ background: "radial-gradient(closest-side, rgba(248,176,90,0.22), transparent 70%)" }} />

        {/* status */}
        {/* nav */}
        <div className="flex items-center justify-between mb-10 relative">
          <Link to="/biblioteca" className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(244,231,206,0.08)" }}><Icon.Back /></Link>
          <div className="text-[11px] tracking-[0.32em] uppercase opacity-60">Sua leitura</div>
          <button className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(244,231,206,0.08)" }}><Icon.Share /></button>
        </div>

        {/* hero ring */}
        <div className="fade-up flex flex-col items-center relative mb-10">
          <div className="text-[10px] tracking-[0.4em] uppercase mb-5" style={{ color: "#F8B05A" }}>Jornada emocional</div>
          <div className="relative">
            <Ring pct={pct} />
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase opacity-60 mb-1">Concluído</div>
                <div className="text-[52px] leading-none" style={serif}>{Math.round(pct * 100)}<span className="text-[22px] opacity-70">%</span></div>
                <div className="text-[11px] opacity-60 mt-2">do livro atual</div>
              </div>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed opacity-70 text-center mt-6 max-w-[300px]" style={{ ...serif, fontStyle: "italic" }}>
            "Cada página lida é uma camada a mais de quem você está se tornando."
          </p>
        </div>

        {/* stat row */}
        <div className="grid grid-cols-3 gap-3 mb-10 fade-up">
          {[
            { i: <Icon.Flame />, v: "—", l: "dias seguidos" },
            { i: <Icon.Clock />, v: "—", l: "esta semana" },
            { i: <Icon.Note />, v: String(insights.length), l: "insights" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 text-center" style={{ background: "rgba(244,231,206,0.05)", border: "1px solid rgba(244,231,206,0.08)" }}>
              <div className="grid place-items-center mb-2 opacity-80" style={{ color: "#F8B05A" }}>{s.i}</div>
              <div className="text-[18px]" style={serif}>{s.v}</div>
              <div className="text-[10px] opacity-55 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* sequence chart */}
        <div className="fade-up rounded-3xl p-5 mb-10" style={{ background: "linear-gradient(160deg, rgba(244,231,206,0.06), rgba(244,231,206,0.02))", border: "1px solid rgba(244,231,206,0.08)" }}>
          <div className="flex items-end justify-between mb-1">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-55 mb-1">Constância</div>
              <div className="text-[18px]" style={serif}>Esta semana</div>
            </div>
            <div className="text-right">
              <div className="text-[18px]" style={serif}>{weekMin} min</div>
              <div className="text-[10px] opacity-55">semana atual</div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-[110px] mt-6">
            {week.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-full">
                  <div className="bar w-[14px] rounded-full" style={{
                    height: `${Math.max(6, (w.m / weekMax) * 100)}%`,
                    animationDelay: `${i * 0.08}s`,
                    background: w.today
                      ? "linear-gradient(180deg, #F8B05A, #C28A3E)"
                      : w.on ? "rgba(248,176,90,0.45)" : "rgba(244,231,206,0.08)",
                    boxShadow: w.today ? "0 0 18px rgba(248,176,90,0.55)" : "none",
                  }} />
                </div>
                <div className={`text-[10px] ${w.today ? "opacity-100" : "opacity-50"}`}>{w.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* insights saved */}
        {insights.length > 0 && (<div className="fade-up mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[18px]" style={serif}>Insights marcados</h2>
            <Link to="/biblioteca/salvos" className="text-[11px] opacity-60">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {insights.map((r, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(244,231,206,0.05)", border: "1px solid rgba(244,231,206,0.08)" }}>
                <div className="flex items-center gap-2 mb-2 text-[10px] tracking-[0.28em] uppercase" style={{ color: "#F8B05A" }}>
                  <Icon.Spark /> Reflexão
                </div>
                <p className="text-[14px] leading-relaxed mb-2" style={{ ...serif, fontStyle: "italic" }}>"{r.q}"</p>
                <div className="text-[11px] opacity-55">{r.c}</div>
              </div>
            ))}
          </div>
        </div>)}

        {/* finished books */}
        <div className="fade-up mb-6">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[18px]" style={serif}>Livros concluídos</h2>
            <span className="text-[11px] opacity-55">{finished.length} deste ciclo</span>
          </div>
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2" style={{ scrollbarWidth: "none" }}>
            {finished.map((b, i) => (
              <div key={i} className="shrink-0 w-[120px]">
                <div className="aspect-[3/4] rounded-xl mb-2 relative overflow-hidden" style={{
                  background: `linear-gradient(160deg, ${b.c}, #2A1D12)`,
                  boxShadow: "0 12px 28px -14px rgba(0,0,0,0.6)",
                }}>
                  <div className="absolute inset-x-3 bottom-3 text-[11px]" style={serif}>{b.t}</div>
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full grid place-items-center" style={{ background: "#F8B05A", color: "#1B130D" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <div className="text-[11px] opacity-60">{b.a}</div>
              </div>
            ))}
            <div className="shrink-0 w-[120px]">
              <div className="aspect-[3/4] rounded-xl grid place-items-center text-center text-[10px] opacity-60 px-2" style={{ background: "rgba(244,231,206,0.04)", border: "1px dashed rgba(244,231,206,0.15)" }}>
                Próximo livro<br/>em breve
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-10" style={{ background: "linear-gradient(to top, #070503 60%, transparent)" }}>
        <div className="mx-auto max-w-[440px]">
          <Link to="/biblioteca/leitor" className="w-full rounded-full py-4 grid place-items-center text-[14px] font-medium relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #F8B05A, #C28A3E)", color: "#1B130D", boxShadow: "0 18px 40px -16px rgba(248,176,90,0.5)" }}>
            <span className="flex items-center gap-2">Continuar lendo <Icon.ArrowR /></span>
          </Link>
        </div>
      </div>
    </div>
    </AppUserLayout>
  );
}
