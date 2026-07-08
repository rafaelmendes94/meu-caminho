import { Link } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

type Chapter = {
  n: number;
  title: string;
  subtitle: string;
  minutes: number;
  progress: number; // 0..1
  status: "done" | "current" | "todo";
  notes?: number;
};

const chapters: Chapter[] = [
  { n: 1, title: "O despertar interior", subtitle: "Quando a mente se abre ao silêncio", minutes: 12, progress: 1, status: "done", notes: 3 },
  { n: 2, title: "Reescrevendo a história", subtitle: "Curar a memória que dói", minutes: 18, progress: 1, status: "done", notes: 2 },
  { n: 3, title: "A coragem da entrega", subtitle: "Soltar o que pesa, abraçar o que liberta", minutes: 22, progress: 1, status: "done", notes: 5 },
  { n: 4, title: "O território dos sonhos", subtitle: "Construir pontes entre o medo e a fé", minutes: 16, progress: 0.62, status: "current", notes: 1 },
  { n: 5, title: "A sabedoria do tempo", subtitle: "Aprender a esperar com paz", minutes: 20, progress: 0, status: "todo" },
  { n: 6, title: "O poder do silêncio", subtitle: "Quando ouvir é a maior resposta", minutes: 14, progress: 0, status: "todo" },
  { n: 7, title: "Recomeços possíveis", subtitle: "A leveza de uma nova página", minutes: 24, progress: 0, status: "todo" },
];

const Icon = {
  Back: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  More: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Play: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
  ),
  Lock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round"/></svg>
  ),
  Clock: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/></svg>
  ),
  Note: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M14 3v6h6"/></svg>
  ),
  Bookmark: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v18l-6-4-6 4z"/></svg>
  ),
  ArrowR: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
};

export default function BookChaptersScreen() {
  const total = chapters.length;
  const done = chapters.filter(c => c.status === "done").length;
  const current = chapters.find(c => c.status === "current");
  const totalMin = chapters.reduce((a, c) => a + c.minutes, 0);
  const remaining = chapters.filter(c => c.status !== "done").reduce((a, c) => a + Math.round(c.minutes * (1 - c.progress)), 0);

  return (
    <AppUserLayout>
    <div className="min-h-screen w-full" style={{ ...sans, background: "radial-gradient(120% 90% at 50% 0%, #FBF6EE 0%, #F4ECDF 60%, #EBE0CC 100%)", color: "#221912" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px);} to { opacity:1; transform:none;} }
        @keyframes shimmer { 0%{background-position: -200% 0;} 100%{background-position: 200% 0;} }
        .fade-up { animation: fadeUp .7s ease both; }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(194,138,62,.18), transparent); background-size: 200% 100%; animation: shimmer 2.4s linear infinite; }
      `}</style>

      <div className="mx-auto max-w-[440px] px-5 pt-3 pb-40">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/biblioteca/desbloqueado" className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(34,25,18,0.06)" }}>
            <Icon.Back />
          </Link>
          <div className="text-[11px] tracking-[0.28em] uppercase opacity-60">Sumário</div>
          <button className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(34,25,18,0.06)" }}>
            <Icon.More />
          </button>
        </div>

        {/* Hero */}
        <div className="fade-up mb-8">
          <div className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: "#9A6B2C" }}>Augusto Cury</div>
          <h1 className="text-[34px] leading-[1.1] mb-3" style={serif}>O vendedor de sonhos</h1>
          <p className="text-[13px] leading-relaxed opacity-70 max-w-[320px]">Uma jornada em sete capítulos pela coragem de recomeçar e pela arte de viver com profundidade.</p>
        </div>

        {/* Progress card */}
        <div className="fade-up rounded-3xl p-5 mb-8 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #1B130D 0%, #2A1D12 100%)", color: "#F4E7CE" }}>
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(248,176,90,0.35), transparent 70%)" }} />
          <div className="flex items-center justify-between mb-4 relative">
            <div className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "#F8B05A" }}>Em leitura</div>
            <Icon.Bookmark />
          </div>
          <div className="text-[20px] leading-tight mb-1" style={serif}>{current?.title}</div>
          <div className="text-[12px] opacity-70 mb-5">Capítulo {current?.n} · {Math.round((current?.progress ?? 0) * 100)}% concluído</div>

          <div className="h-[3px] rounded-full mb-5 overflow-hidden" style={{ background: "rgba(244,231,206,0.15)" }}>
            <div className="h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: "linear-gradient(90deg, #F8B05A, #E8C07A)" }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-5 text-[11px]">
              <div><div className="text-[15px]" style={serif}>{done}/{total}</div><div className="opacity-60">capítulos</div></div>
              <div><div className="text-[15px]" style={serif}>{Math.floor(remaining/60)}h{remaining%60 ? ` ${remaining%60}m` : ""}</div><div className="opacity-60">restante</div></div>
              <div><div className="text-[15px]" style={serif}>11</div><div className="opacity-60">reflexões</div></div>
            </div>
          </div>

          <Link to="/biblioteca/leitor" className="mt-5 w-full rounded-full py-3 grid place-items-center text-[13px] font-medium relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F8B05A, #C28A3E)", color: "#1B130D" }}>
            <span className="absolute inset-0 shimmer opacity-50" />
            <span className="relative flex items-center gap-2">Continuar leitura <Icon.ArrowR /></span>
          </Link>
        </div>

        {/* Section title */}
        <div className="flex items-end justify-between mb-5 fade-up">
          <h2 className="text-[20px]" style={serif}>Capítulos</h2>
          <div className="text-[11px] opacity-60">{totalMin} min · jornada</div>
        </div>

        {/* Chapter list */}
        <ol className="space-y-3">
          {chapters.map((c, i) => (
            <li key={c.n} className="fade-up" style={{ animationDelay: `${0.05 * i}s` }}>
              <Link to={c.status === "todo" ? "/biblioteca/bloqueado" : "/biblioteca/leitor"}
                className="block rounded-2xl p-4 relative transition-all hover:translate-y-[-1px]"
                style={{
                  background: c.status === "current"
                    ? "linear-gradient(160deg, #FFFDF8 0%, #F8EFDD 100%)"
                    : "rgba(255,253,248,0.7)",
                  border: c.status === "current" ? "1px solid rgba(194,138,62,0.45)" : "1px solid rgba(34,25,18,0.06)",
                  boxShadow: c.status === "current" ? "0 10px 30px -16px rgba(194,138,62,0.45)" : "0 1px 0 rgba(34,25,18,0.02)",
                }}>
                <div className="flex gap-4">
                  {/* Number / status */}
                  <div className="shrink-0">
                    <div className="w-11 h-11 rounded-full grid place-items-center text-[13px]" style={{
                      background: c.status === "done" ? "linear-gradient(135deg, #2A1D12, #463120)" : c.status === "current" ? "linear-gradient(135deg, #F8B05A, #C28A3E)" : "rgba(34,25,18,0.05)",
                      color: c.status === "todo" ? "#9A8675" : "#F4E7CE",
                      ...serif,
                    }}>
                      {c.status === "done" ? <Icon.Check /> : c.status === "current" ? <Icon.Play /> : c.n.toString().padStart(2, "0")}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] tracking-[0.24em] uppercase opacity-55">Cap. {c.n.toString().padStart(2, "0")}</span>
                      {c.status === "todo" && <span className="opacity-50"><Icon.Lock /></span>}
                    </div>
                    <div className="text-[15.5px] leading-tight mb-1 truncate" style={serif}>{c.title}</div>
                    <div className="text-[12px] opacity-60 mb-3 line-clamp-1">{c.subtitle}</div>

                    <div className="flex items-center gap-3 text-[11px] opacity-65">
                      <span className="flex items-center gap-1"><Icon.Clock /> {c.minutes} min</span>
                      {c.notes ? <span className="flex items-center gap-1"><Icon.Note /> {c.notes} reflexões</span> : null}
                      {c.status === "done" && <span style={{ color: "#9A6B2C" }}>· concluído</span>}
                      {c.status === "current" && <span style={{ color: "#9A6B2C" }}>· {Math.round(c.progress * 100)}%</span>}
                    </div>

                    {c.progress > 0 && c.progress < 1 && (
                      <div className="mt-3 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(34,25,18,0.08)" }}>
                        <div className="h-full" style={{ width: `${c.progress * 100}%`, background: "linear-gradient(90deg, #F8B05A, #C28A3E)" }} />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        {/* Saved reflections */}
        <div className="mt-10 fade-up">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-[18px]" style={serif}>Reflexões salvas</h2>
            <Link to="/biblioteca/salvos" className="text-[11px] opacity-60">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {[
              { q: "A coragem não é a ausência do medo, mas a decisão de seguir apesar dele.", c: "Cap. 03 · A coragem da entrega" },
              { q: "Quem sabe esperar, encontra no tempo o seu maior aliado.", c: "Cap. 02 · Reescrevendo a história" },
            ].map((r, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
                <div className="text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: "#9A6B2C" }}>Reflexão</div>
                <p className="text-[14px] leading-relaxed mb-2" style={{ ...serif, fontStyle: "italic" }}>"{r.q}"</p>
                <div className="text-[11px] opacity-55">{r.c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-10" style={{ background: "linear-gradient(to top, #F4ECDF 60%, transparent)" }}>
        <div className="mx-auto max-w-[440px]">
          <Link to="/biblioteca/leitor" className="w-full rounded-full py-4 grid place-items-center text-[14px] font-medium relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1B130D, #3A2818)", color: "#F4E7CE", boxShadow: "0 14px 40px -16px rgba(27,19,13,0.6)" }}>
            <span className="flex items-center gap-2">Continuar leitura <Icon.ArrowR /></span>
          </Link>
        </div>
      </div>
    </div>
    </AppUserLayout>
  );
}
