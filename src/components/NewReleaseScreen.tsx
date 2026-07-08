import { Link } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

const Icon = {
  Close: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/></svg>),
  Sparkle: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>),
  ArrowR: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  Pages: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/></svg>),
  Clock: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/></svg>),
};

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 22 }).map((_, i) => (
        <span key={i} className="absolute rounded-full" style={{
          left: `${(i * 47) % 100}%`,
          bottom: `-${(i * 13) % 40}px`,
          width: `${1.5 + (i % 4) * 0.7}px`,
          height: `${1.5 + (i % 4) * 0.7}px`,
          background: i % 3 === 0 ? "#F8B05A" : "rgba(248,176,90,0.55)",
          filter: "blur(0.4px)",
          boxShadow: "0 0 6px rgba(248,176,90,0.5)",
          animation: `drift ${11 + (i % 7)}s linear ${i * 0.4}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function NewReleaseScreen() {
  return (
    <AppUserLayout>
    <div className="min-h-screen w-full relative overflow-hidden" style={{ ...sans, background: "radial-gradient(120% 80% at 50% 30%, #1F1610 0%, #0E0905 55%, #050302 100%)", color: "#F4E7CE" }}>
      <style>{`
        @keyframes fadeUp { from {opacity:0; transform:translateY(18px);} to {opacity:1; transform:none;} }
        @keyframes glowPulse { 0%,100%{opacity:.45; transform:scale(1);} 50%{opacity:.95; transform:scale(1.08);} }
        @keyframes bookRise { 0%{opacity:0; transform:translateY(60px) scale(.85) rotate(-3deg);} 60%{opacity:1;} 100%{opacity:1; transform:translateY(0) scale(1) rotate(0);} }
        @keyframes bookFloat { 0%,100%{transform:translateY(0) rotate(-1deg);} 50%{transform:translateY(-10px) rotate(1deg);} }
        @keyframes sealIn { 0%{opacity:0; transform:scale(.4) rotate(-30deg);} 70%{transform:scale(1.1) rotate(-6deg);} 100%{opacity:1; transform:scale(1) rotate(-8deg);} }
        @keyframes drift { from {transform:translateY(0); opacity:0;} 10%{opacity:1;} 90%{opacity:1;} to {transform:translateY(-110vh); opacity:0;} }
        @keyframes shine { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        @keyframes rayRotate { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .fade-up{animation:fadeUp 1s ease both;}
        .glow{animation:glowPulse 5s ease-in-out infinite;}
        .rays{animation:rayRotate 40s linear infinite;}
        .book-enter{animation: bookRise 1.4s cubic-bezier(.2,.8,.2,1) .2s both, bookFloat 6s ease-in-out 1.6s infinite;}
        .seal{animation: sealIn 1.1s cubic-bezier(.2,.8,.2,1) 1.2s both;}
        .shine{background:linear-gradient(90deg, transparent, rgba(248,176,90,.55), transparent); background-size:200% 100%; animation: shine 2.6s linear infinite;}
      `}</style>

      <Particles />

      {/* god rays + ambient glow behind book */}
      <div className="pointer-events-none absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full glow"
        style={{ background: "radial-gradient(closest-side, rgba(248,176,90,0.35), transparent 70%)" }} />
      <div className="pointer-events-none absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rays opacity-25"
        style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(248,176,90,0.22) 30deg, transparent 60deg, transparent 120deg, rgba(248,176,90,0.18) 150deg, transparent 180deg, transparent 240deg, rgba(248,176,90,0.2) 270deg, transparent 300deg)" }} />

      <div className="mx-auto max-w-[440px] px-5 pt-3 pb-32 relative">
        {/* status */}
        {/* nav */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-9 h-9" />
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60" style={{ color: "#F8B05A" }}>Liberação</div>
          <Link to="/biblioteca" className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(244,231,206,0.08)" }}><Icon.Close /></Link>
        </div>

        {/* eyebrow */}
        <div className="fade-up text-center mb-3" style={{ animationDelay: ".1s" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] tracking-[0.32em] uppercase" style={{ background: "rgba(248,176,90,0.12)", border: "1px solid rgba(248,176,90,0.3)", color: "#F8B05A" }}>
            <Icon.Sparkle /> Nova liberação
          </div>
        </div>

        {/* book */}
        <div className="relative grid place-items-center my-10 h-[280px]">
          <div className="book-enter relative">
            <div className="w-[170px] aspect-[3/4] rounded-xl relative overflow-hidden" style={{
              background: "linear-gradient(160deg, #8B4A28, #3A1F12)",
              boxShadow: "0 40px 70px -20px rgba(0,0,0,0.8), 0 0 60px rgba(248,176,90,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)",
            }}>
              <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 30% 0%, rgba(248,176,90,0.35), transparent 60%)" }} />
              <div className="absolute inset-x-4 top-5 text-[9px] tracking-[0.28em] uppercase opacity-80" style={{ color: "#F8B05A" }}>Augusto Cury</div>
              <div className="absolute inset-x-4 bottom-5">
                <div className="text-[15px] leading-tight mb-1" style={{ ...serif, color: "#F4E7CE" }}>O vendedor de sonhos</div>
                <div className="h-[1px] w-10 mb-2" style={{ background: "#F8B05A" }} />
                <div className="text-[8px] tracking-[0.2em] uppercase opacity-60">Edição premium</div>
              </div>
              <div className="absolute inset-y-0 left-0 w-[4px]" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5), transparent, rgba(0,0,0,0.5))" }} />
              <div className="absolute inset-x-0 top-0 h-[60%] opacity-40" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15), transparent)" }} />
            </div>

            {/* Premium seal */}
            <div className="seal absolute -top-4 -right-6 w-[68px] h-[68px] rounded-full grid place-items-center text-center" style={{
              background: "radial-gradient(circle at 30% 30%, #F8D58A, #C28A3E)",
              color: "#1B130D",
              boxShadow: "0 12px 30px -8px rgba(248,176,90,0.7), inset 0 0 0 1px rgba(255,255,255,0.3)",
              transform: "rotate(-8deg)",
            }}>
              <div>
                <div style={{ ...serif, fontSize: 9, letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600 }}>Premium</div>
                <div className="h-[1px] w-6 mx-auto my-1 opacity-40" style={{ background: "#1B130D" }} />
                <div style={{ fontSize: 8, opacity: .7 }}>liberado</div>
              </div>
            </div>
          </div>

          {/* base reflection */}
          <div className="absolute bottom-0 w-[180px] h-[20px] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(248,176,90,0.35), transparent 70%)", filter: "blur(8px)" }} />
        </div>

        {/* headline */}
        <div className="fade-up text-center px-2 mb-6" style={{ animationDelay: "1.4s" }}>
          <h1 className="text-[30px] leading-[1.1]" style={serif}>
            Um novo capítulo<br/>
            da sua <span style={{ color: "#F8B05A", fontStyle: "italic" }}>evolução</span><br/>
            começou.
          </h1>
        </div>

        {/* subtext */}
        <div className="fade-up text-center mb-8 px-4" style={{ animationDelay: "1.6s" }}>
          <p className="text-[13px] leading-relaxed opacity-65 max-w-[300px] mx-auto">
            Esse livro foi liberado para você no momento certo. Respire, abra a primeira página e permita-se transformar.
          </p>
        </div>

        {/* meta */}
        <div className="fade-up flex items-center justify-center gap-4 text-[11px] opacity-60 mb-10" style={{ animationDelay: "1.8s" }}>
          <span className="flex items-center gap-1.5"><Icon.Pages /> 312 páginas</span>
          <span className="opacity-40">·</span>
          <span className="flex items-center gap-1.5"><Icon.Clock /> 5h 40m</span>
          <span className="opacity-40">·</span>
          <span>7 capítulos</span>
        </div>

        {/* quote */}
        <div className="fade-up text-center px-6" style={{ animationDelay: "2s" }}>
          <p className="text-[14px] leading-relaxed" style={{ ...serif, fontStyle: "italic", color: "#E8C07A" }}>
            "Os grandes começos começam em silêncio."
          </p>
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mt-3">Augusto Cury</div>
        </div>
      </div>

      {/* floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-12 z-10" style={{ background: "linear-gradient(to top, #050302 65%, transparent)" }}>
        <div className="mx-auto max-w-[440px] space-y-3">
          <Link to="/biblioteca/leitor" className="w-full rounded-full py-4 grid place-items-center text-[14px] font-medium relative overflow-hidden fade-up" style={{
            background: "linear-gradient(135deg, #F8B05A, #C28A3E)",
            color: "#1B130D",
            boxShadow: "0 20px 50px -16px rgba(248,176,90,0.6)",
            animationDelay: "2.2s",
          }}>
            <span className="absolute inset-0 shine opacity-40" />
            <span className="relative flex items-center gap-2">Começar agora <Icon.ArrowR /></span>
          </Link>
          <Link to="/biblioteca" className="w-full grid place-items-center text-[12px] opacity-60 fade-up" style={{ animationDelay: "2.4s" }}>
            Ver na biblioteca
          </Link>
        </div>
      </div>
    </div>
    </AppUserLayout>
  );
}
