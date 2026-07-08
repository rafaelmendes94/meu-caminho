import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppUserLayout } from "./layouts/AppUserLayout";

const brand = "#F88A2B";
const sage = "#8FB17D";
const ink900 = "#111111";
const ink600 = "#666666";
const ink500 = "#999999";
const bg = "#F7F4F2";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const ChevL = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
);
const Check = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
);
const Spark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 4l1.4 4.2L17.5 9.5 13.4 11l-1.4 4-1.4-4L6.5 9.5l4.1-1.3z"/></svg>
);
const Heart = ({ c = brand }: { c?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
);
const Leaf = ({ c = sage }: { c?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 8-8 14-14"/></svg>
);
const Arrow = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ink600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
);
const ChevR = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
);

const steps = [
  { label: "Finalizando trilha atual", icon: <Leaf c={sage}/> },
  { label: "Sincronizando seu progresso", icon: <Spark/> },
  { label: "Preparando nova jornada", icon: <Heart c={brand}/> },
];

const MudarTrilhaConfirmScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const dur = 3200;
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setProgress(p);
      setStepIdx(p < 0.33 ? 0 : p < 0.7 ? 1 : 2);
      if (p >= 1) {
        clearInterval(id);
        setDone(true);
      }
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
      <div
        className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
        style={{ background: bg, paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Glows */}
        <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(70% 40% at 50% 20%, rgba(248,138,43,0.22) 0%, transparent 70%), radial-gradient(60% 40% at 50% 90%, rgba(143,177,125,0.14) 0%, transparent 70%)" }}/>
        <div className="pointer-events-none absolute -top-24 -left-20 w-[320px] h-[320px] rounded-full z-0" style={{ background: "radial-gradient(circle, rgba(248,138,43,0.25), transparent 70%)", filter: "blur(40px)", animation: "breathe 6s ease-in-out infinite" }}/>
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-[300px] h-[300px] rounded-full z-0" style={{ background: "radial-gradient(circle, rgba(143,177,125,0.18), transparent 70%)", filter: "blur(38px)", animation: "breathe 7s ease-in-out 1s infinite" }}/>

        {/* Particles */}
        {[
          { top: "14%", left: "12%", s: 4, d: 0 },
          { top: "20%", left: "84%", s: 3, d: 0.8 },
          { top: "36%", left: "8%", s: 3, d: 1.6 },
          { top: "44%", left: "88%", s: 4, d: 0.4 },
          { top: "62%", left: "18%", s: 3, d: 1.2 },
          { top: "70%", left: "78%", s: 3, d: 2.0 },
          { top: "28%", left: "50%", s: 2, d: 1.4 },
        ].map((p, i) => (
          <span key={i} className="pointer-events-none absolute rounded-full bg-white z-0" style={{ top: p.top, left: p.left, width: p.s, height: p.s, boxShadow: `0 0 10px ${brand}`, animation: `twinkle 3.4s ease-in-out ${p.d}s infinite` }}/>
        ))}

        {/* Header */}
        <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-1 shrink-0">
          <Link to="/mudanca-jornada" className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink600 }}>
            <ChevL/>
          </Link>
          <p style={serif} className="text-[15.5px] text-[#111]">Mudar de Trilha</p>
          <span className="w-10 h-10"/>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-6">
          {/* Orb central */}
          <div className="relative w-[180px] h-[180px] flex items-center justify-center">
            <span className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(248,138,43,0.35), transparent 70%)", filter: "blur(20px)", animation: "breathe 3.2s ease-in-out infinite" }}/>
            <span className="absolute inset-4 rounded-full" style={{ border: "1px solid rgba(248,138,43,0.25)", animation: "spin-slow 18s linear infinite" }}/>
            <span className="absolute inset-8 rounded-full" style={{ border: "1px dashed rgba(143,177,125,0.35)", animation: "spin-slow 24s linear reverse infinite" }}/>
            <div className="relative w-[96px] h-[96px] rounded-full flex items-center justify-center transition-all duration-500" style={{
              background: done
                ? "linear-gradient(180deg,#9FC689 0%,#7AA365 100%)"
                : "linear-gradient(180deg,#FF9D4D 0%,#F88A2B 100%)",
              boxShadow: done
                ? "0 18px 40px -12px rgba(143,177,125,0.55), inset 0 1px 0 rgba(255,255,255,0.35)"
                : "0 18px 40px -12px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
            }}>
              {done ? <Check/> : (
                <svg className="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 3a9 9 0 1 0 9 9" />
                </svg>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 style={serif} className="mt-6 text-[28px] leading-[1.05] text-[#111] text-center animate-fade-in">
            {done ? "Tudo pronto." : "Trocando sua trilha…"}
          </h1>
          <p className="mt-2 text-[12.5px] leading-[1.5] text-center max-w-[280px]" style={{ color: ink600 }}>
            {done
              ? "Sua nova jornada emocional começa agora. Respire fundo e siga em frente."
              : "Estamos preparando uma jornada alinhada ao seu novo momento emocional."}
          </p>

          {/* Transição visual: trilha → trilha */}
          <div className="mt-6 w-full max-w-[320px] rounded-[22px] px-3.5 py-3 flex items-center gap-2.5" style={{
            background: "linear-gradient(135deg,#FFF6EE 0%, #F4F8EE 100%)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 8px 24px -14px rgba(17,17,17,0.10)",
          }}>
            <div className="flex-1 min-w-0">
              <p className="text-[8.5px] tracking-[0.18em] font-semibold" style={{ color: "#5A7A48" }}>ANTERIOR</p>
              <p style={serif} className="text-[13px] leading-[1.15] text-[#111] truncate">Controle da Ansiedade</p>
              <div className="mt-1 h-[4px] rounded-full overflow-hidden" style={{ background: "#DCE7CE" }}>
                <span className="block h-full rounded-full" style={{ width: "85%", background: sage }}/>
              </div>
            </div>
            <span className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: "0 4px 12px -4px rgba(248,138,43,0.45), inset 0 0 0 1px rgba(248,138,43,0.18)" }}>
              <Arrow/>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[8.5px] tracking-[0.18em] font-semibold" style={{ color: brand }}>NOVA</p>
              <p style={serif} className="text-[13px] leading-[1.15] text-[#111] truncate">Relações Saudáveis</p>
              <div className="mt-1 h-[4px] rounded-full overflow-hidden" style={{ background: "#F6E1CC" }}>
                <span className="block h-full rounded-full transition-all duration-300" style={{ width: `${Math.round(progress * 100)}%`, background: brand }}/>
              </div>
            </div>
          </div>

          {/* Steps */}
          <ul className="mt-5 w-full max-w-[300px] space-y-2.5">
            {steps.map((s, i) => {
              const active = i === stepIdx && !done;
              const completed = done || i < stepIdx;
              return (
                <AppUserLayout>
                <li key={i} className="flex items-center gap-3 transition-opacity" style={{ opacity: completed || active ? 1 : 0.45 }}>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{
                    background: completed ? sage : active ? "rgba(248,138,43,0.15)" : "rgba(255,255,255,0.7)",
                    border: completed ? "none" : `1px solid ${active ? "rgba(248,138,43,0.35)" : "rgba(0,0,0,0.06)"}`,
                  }}>
                    {completed ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    ) : s.icon}
                  </span>
                  <span className="text-[12px] font-semibold" style={{ color: completed ? "#5A7A48" : ink900 }}>{s.label}</span>
                </li>
                </AppUserLayout>
              );
            })}
          </ul>
        </div>

        {/* Sticky CTA */}
        <div className="relative z-30 px-5 pt-3 pb-5 shrink-0" style={{ background: "linear-gradient(180deg, rgba(247,244,242,0) 0%, rgba(247,244,242,0.95) 30%, #F7F4F2 100%)" }}>
          <button
            disabled={!done}
            onClick={() => navigate("/trilha")}
            className="relative w-full h-[56px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] active:scale-[0.99] transition disabled:cursor-not-allowed"
            style={{
              background: done ? "linear-gradient(180deg,#FF9D4D 0%,#F88A2B 100%)" : "rgba(17,17,17,0.12)",
              boxShadow: done ? "0 14px 32px -10px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35)" : "none",
              color: done ? "#fff" : ink500,
            }}
          >
            <span className="absolute left-5 opacity-90"><Spark/></span>
            {done ? "Começar nova trilha" : "Aguarde um instante…"}
            {done && <span className="absolute right-5 opacity-90"><ChevR/></span>}
          </button>
          <p className="mt-2.5 text-center text-[10.5px]" style={{ color: ink500 }}>
            Seu progresso anterior fica salvo na sua jornada.
          </p>
        </div>

        <style>{`
          @keyframes twinkle { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
          @keyframes breathe { 0%,100%{opacity:.85;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
          @keyframes spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        `}</style>
      </div>
    </main>
  );
};

export default MudarTrilhaConfirmScreen;
