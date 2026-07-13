import { Link } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

const newBooks: { t: string; a: string; sub: string; pages: number; minutes: string; c1: string; c2: string; accent: string }[] = [];

const Icon = {
  Back: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Share: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v12m0-12l-4 4m4-4l4 4M5 20h14" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Sparkle: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>),
  Pages: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/></svg>),
  Clock: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/></svg>),
  ArrowR: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Gift: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8s-3-5-6-3 1 5 6 3zM12 8s3-5 6-3-1 5-6 3z" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

// Particles drifting upward
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="absolute rounded-full" style={{
          left: `${(i * 73) % 100}%`,
          bottom: `-${(i * 17) % 30}px`,
          width: `${2 + (i % 3)}px`,
          height: `${2 + (i % 3)}px`,
          background: "rgba(248,176,90,0.5)",
          filter: "blur(0.5px)",
          animation: `drift ${10 + (i % 6)}s linear ${i * 0.6}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function MonthlyBooksScreen() {
  return (
    <AppUserLayout>
    <div className="min-h-screen w-full relative overflow-hidden" style={{ ...sans, background: "radial-gradient(120% 80% at 50% -10%, #1F1610 0%, #110B07 55%, #050302 100%)", color: "#F4E7CE" }}>
      <style>{`
        @keyframes fadeUp { from {opacity:0; transform:translateY(16px);} to {opacity:1; transform:none;} }
        @keyframes glow { 0%,100%{opacity:.5; transform:scale(1);} 50%{opacity:.9; transform:scale(1.05);} }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(-1deg);} 50%{transform:translateY(-8px) rotate(1deg);} }
        @keyframes drift { from {transform:translateY(0); opacity:0;} 10%{opacity:1;} 90%{opacity:1;} to {transform:translateY(-110vh); opacity:0;} }
        @keyframes shine { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        @keyframes sealIn { 0%{opacity:0; transform:scale(.6) rotate(-12deg);} 100%{opacity:1; transform:scale(1) rotate(-8deg);} }
        .fade-up{animation:fadeUp .9s ease both;}
        .glow{animation:glow 5s ease-in-out infinite;}
        .float{animation:float 6s ease-in-out infinite;}
        .seal{animation:sealIn .9s cubic-bezier(.2,.8,.2,1) .3s both;}
        .shine{background:linear-gradient(90deg, transparent, rgba(248,176,90,.5), transparent); background-size:200% 100%; animation: shine 2.6s linear infinite;}
      `}</style>

      <Particles />

      {/* ambient golden glow */}
      <div className="pointer-events-none absolute top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full glow"
        style={{ background: "radial-gradient(closest-side, rgba(248,176,90,0.28), transparent 70%)" }} />

      <div className="mx-auto max-w-[440px] px-5 pt-3 pb-32 relative">
        {/* status */}
        {/* nav */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/biblioteca" className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(244,231,206,0.08)" }}><Icon.Back /></Link>
          <div className="text-[11px] tracking-[0.32em] uppercase opacity-60">Liberação do mês</div>
          <button className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(244,231,206,0.08)" }}><Icon.Share /></button>
        </div>

        {/* hero copy */}
        <div className="fade-up text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[10px] tracking-[0.32em] uppercase" style={{ background: "rgba(248,176,90,0.12)", border: "1px solid rgba(248,176,90,0.3)", color: "#F8B05A" }}>
            <Icon.Gift /> Liberações do mês
          </div>
          <h1 className="text-[34px] leading-[1.05] mb-4" style={serif}>
            Novos conhecimentos<br/>
            <span style={{ color: "#F8B05A", fontStyle: "italic" }}>chegaram</span> para<br/>
            sua jornada.
          </h1>
          <p className="text-[13px] leading-relaxed opacity-65 max-w-[300px] mx-auto">
            {newBooks.length > 0 ? "Novos livros selecionados para o seu próximo passo de evolução." : "Aguardando novas liberações."}
          </p>
        </div>

        {/* the two books */}
        {newBooks.length > 0 && (<div className="space-y-8 mb-12">
          {newBooks.map((b, i) => (
            <div key={i} className="fade-up relative" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
              {/* book card */}
              <div className="relative">
                {/* halo */}
                <div className="absolute inset-0 -m-6 rounded-[40px] blur-2xl opacity-60" style={{
                  background: `radial-gradient(closest-side, ${b.accent}55, transparent 70%)`,
                }} />

                <div className="relative rounded-3xl p-6 overflow-hidden" style={{
                  background: "linear-gradient(160deg, rgba(244,231,206,0.07), rgba(244,231,206,0.02))",
                  border: "1px solid rgba(244,231,206,0.1)",
                  boxShadow: `0 30px 60px -30px ${b.accent}33`,
                }}>
                  <div className="flex gap-5">
                    {/* cover */}
                    <div className="relative shrink-0 float" style={{ animationDelay: `${i * 1.5}s` }}>
                      <div className="w-[112px] aspect-[3/4] rounded-lg relative overflow-hidden" style={{
                        background: `linear-gradient(160deg, ${b.c2}, ${b.c1})`,
                        boxShadow: "0 20px 40px -16px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.06)",
                      }}>
                        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 80% at 30% 0%, ${b.accent}33, transparent 60%)` }} />
                        <div className="absolute inset-x-3 top-4 text-[8px] tracking-[0.25em] uppercase opacity-70" style={{ color: b.accent }}>{b.author ?? "—"}</div>
                        <div className="absolute inset-x-3 bottom-3 text-[10px] leading-tight" style={{ ...serif, color: "#F4E7CE" }}>{b.t}</div>
                        <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.4))" }} />
                      </div>
                      {/* "Novo" seal */}
                      <div className="seal absolute -top-3 -right-3 w-14 h-14 rounded-full grid place-items-center text-center" style={{
                        background: `linear-gradient(135deg, ${b.accent}, #C28A3E)`,
                        color: "#1B130D",
                        boxShadow: `0 8px 20px -6px ${b.accent}99`,
                        transform: "rotate(-8deg)",
                      }}>
                        <div>
                          <div className="text-[8px] tracking-[0.15em] uppercase font-semibold" style={serif}>Novo</div>
                          <div className="text-[7px] opacity-80">2026</div>
                        </div>
                      </div>
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-1 mb-2 text-[9px] tracking-[0.3em] uppercase" style={{ color: b.accent }}>
                        <Icon.Sparkle /> Liberado agora
                      </div>
                      <h3 className="text-[17px] leading-tight mb-2" style={serif}>{b.t}</h3>
                      <p className="text-[12px] opacity-65 leading-relaxed mb-4 line-clamp-3">{b.sub}</p>
                      <div className="flex items-center gap-3 text-[10px] opacity-60">
                        <span className="flex items-center gap-1"><Icon.Pages /> {b.pages} pág.</span>
                        <span className="opacity-40">·</span>
                        <span className="flex items-center gap-1"><Icon.Clock /> {b.minutes}</span>
                      </div>
                    </div>
                  </div>

                  {/* action */}
                  <Link to="/biblioteca/desbloqueado" className="mt-5 w-full rounded-full py-3 grid place-items-center text-[12px] font-medium relative overflow-hidden" style={{
                    background: "rgba(244,231,206,0.08)",
                    border: "1px solid rgba(244,231,206,0.15)",
                    color: "#F4E7CE",
                  }}>
                    <span className="absolute inset-0 shine opacity-30" />
                    <span className="relative flex items-center gap-2">Abrir livro <Icon.ArrowR /></span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>)}

        {/* Citação mensal removida — aguardando conteúdo real do CMS */}

        {/* next cycle hint */}
        <div className="fade-up rounded-2xl p-4 text-center" style={{
          background: "rgba(244,231,206,0.04)",
          border: "1px dashed rgba(244,231,206,0.12)",
        }}>
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-55 mb-1">Próxima liberação</div>
          <div className="text-[14px]" style={serif}>Em breve</div>
        </div>
      </div>

      {/* floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-12 z-10" style={{ background: "linear-gradient(to top, #050302 65%, transparent)" }}>
        <div className="mx-auto max-w-[440px]">
          <Link to="/biblioteca" className="w-full rounded-full py-4 grid place-items-center text-[14px] font-medium relative overflow-hidden" style={{
            background: "linear-gradient(135deg, #F8B05A, #C28A3E)",
            color: "#1B130D",
            boxShadow: "0 18px 50px -16px rgba(248,176,90,0.55)",
          }}>
            <span className="absolute inset-0 shine opacity-40" />
            <span className="relative flex items-center gap-2">Explorar livros <Icon.ArrowR /></span>
          </Link>
        </div>
      </div>
    </div>
    </AppUserLayout>
  );
}
