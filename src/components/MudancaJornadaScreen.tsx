import { Link, useLocation } from "react-router-dom";
import heroImg from "@/assets/trilha/mudanca-jornada-hero.jpg";
import curyImg from "@/assets/trilha/cury.jpg";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { MediaDesktopLayout } from "./layouts/MediaDesktopLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const ink900 = "#111111";
const ink700 = "#444444";
const ink600 = "#666666";
const ink500 = "#999999";
const brand = "#F88A2B";
const sage = "#8FB17D";
const sageBg = "#E3ECDD";
const lilac = "#9B8AC9";
const bg = "#F7F4F2";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const ChevL = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevR = ({ s = 18 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const Spark = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 4l1.4 4.2L17.5 9.5 13.4 11l-1.4 4-1.4-4L6.5 9.5l4.1-1.3z"/></svg>;
const Star = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.3 9.4l6-.9z"/></svg>;
const Leaf = ({ c = sage }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 8-8 14-14"/></svg>;
const Heart = ({ c = brand }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const Mind = ({ c = brand }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a4 4 0 0 0-4 4v2a3 3 0 0 0-1 6 3 3 0 0 0 5 2 3 3 0 0 0 5-1V8a4 4 0 0 0-4-4z"/></svg>;
const Sun = ({ c = sage }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>;
const Battery = ({ c = brand }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="5" width="12" height="16" rx="2.5"/><path d="M10 3h4"/></svg>;
const Person = ({ c = sage }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="6" r="2.2"/><path d="M8 21c0-3 4-6 4-6s4 3 4 6"/></svg>;
const Anchor = ({ c = sage }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v14"/><path d="M5 15a7 7 0 0 0 14 0"/></svg>;
const HeartG = ({ c = sage }: { c?: string }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const Layers = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>;
const Play = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/></svg>;
const Clock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const Quote = () => <svg width="36" height="36" viewBox="0 0 24 24" fill={brand} opacity="0.22"><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const Brain = ({ c = lilac }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 2-5 3 3 0 0 0-2-5 3 3 0 0 0-3-3 3 3 0 0 0-4 0z"/></svg>;
const Book = ({ c = sage }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h7M8 11h7"/></svg>;
const Lock = ({ c = brand }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
const Chat = ({ c = lilac }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>;

const before = [
  { label: "Ansiedade constante", icon: <Heart c={brand}/> },
  { label: "Aceleração mental", icon: <Mind c={brand}/> },
  { label: "Desgaste emocional", icon: <Battery c={brand}/> },
  { label: "Reações impulsivas", icon: <Sun c={brand}/> },
];
const now = [
  { label: "Clareza emocional", icon: <Sun/> },
  { label: "Presença consciente", icon: <Person/> },
  { label: "Equilíbrio interno", icon: <Anchor/> },
  { label: "Relações mais saudáveis", icon: <HeartG/> },
];

const miniCards = [
  { label: "Novos exercícios emocionais", icon: <Brain/>, bg: "#EFEAF8" },
  { label: "Conteúdos personalizados", icon: <Book/>, bg: sageBg },
  { label: "Novos livros desbloqueados", icon: <Lock/>, bg: "#FFF1E1" },
  { label: "Conversas IA mais profundas", icon: <Chat/>, bg: "#EFEAF8" },
];

const MudancaJornadaScreen = () => {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const backTo = isEnterprise ? "/enterprise/trilha" : "/trilha";

  const content = (
    <main className={`${isEnterprise ? '' : 'h-screen min-h-[100dvh] w-full flex items-center justify-center overflow-hidden'} bg-[#F7F4F2] font-display`}>
      <div
        className={`relative w-full ${isEnterprise ? '' : 'h-[100dvh]'} overflow-hidden flex flex-col`}
        style={{ background: bg, paddingTop: isEnterprise ? '0' : "env(safe-area-inset-top)", paddingBottom: isEnterprise ? '0' : "env(safe-area-inset-bottom)" }}
      >
        {/* Glows */}
        <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(70% 30% at 50% 6%, rgba(248,138,43,0.18) 0%, transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(155,138,201,0.08) 0%, transparent 70%)" }}/>
        <div className="pointer-events-none absolute -top-24 -left-20 w-[300px] h-[300px] rounded-full z-0" style={{ background: "radial-gradient(circle, rgba(248,138,43,0.20), transparent 70%)", filter: "blur(34px)", animation: "breathe 6s ease-in-out infinite" }}/>
        <div className="pointer-events-none absolute top-1/3 -right-24 w-[260px] h-[260px] rounded-full z-0" style={{ background: "radial-gradient(circle, rgba(155,138,201,0.12), transparent 70%)", filter: "blur(30px)", animation: "breathe 7s ease-in-out 1s infinite" }}/>

        {/* Particles */}
        {[
          { top: "16%", left: "14%", s: 4, d: 0 },
          { top: "22%", left: "82%", s: 3, d: 0.8 },
          { top: "38%", left: "10%", s: 3, d: 1.6 },
          { top: "46%", left: "90%", s: 4, d: 0.4 },
          { top: "10%", left: "58%", s: 3, d: 1.2 },
          { top: "62%", left: "20%", s: 3, d: 2.0 },
        ].map((p, i) => (
          <span key={i} className="pointer-events-none absolute rounded-full bg-white z-0" style={{ top: p.top, left: p.left, width: p.s, height: p.s, boxShadow: `0 0 8px ${brand}`, animation: `twinkle 3.4s ease-in-out ${p.d}s infinite` }}/>
        ))}

        {/* Header */}
        <div className="relative z-20 flex items-center justify-between px-5 pt-6 pb-1 shrink-0">
          <Link to={backTo} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition" style={{ color: ink700 }}>
            <ChevL/>
          </Link>
          <p style={serif} className="text-[15.5px] text-[#111]">Mudança de Jornada</p>
          <span className="w-10 h-10"/>
        </div>

        {/* Scroll */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pb-[170px]">
          {/* HERO */}
          <section className="px-6 pt-3 animate-fade-in">
            <h1 style={serif} className="text-[40px] leading-[1.02] text-[#111]">
              Seu caminho<br/>evoluiu.
            </h1>
            <p className="mt-3 text-[12.5px] leading-[1.5]" style={{ color: ink600 }}>
              Com base na sua evolução emocional, identificamos uma nova trilha mais alinhada ao seu momento atual.
            </p>
          </section>

          {/* HERO IMAGE */}
          <section className="px-5 mt-4">
            <div className="relative rounded-[28px] overflow-hidden" style={{ boxShadow: "0 22px 50px -22px rgba(248,138,43,0.42)" }}>
              <img src={heroImg} alt="Caminho que se divide ao amanhecer" className="w-full h-[200px] object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(247,244,242,0.12) 0%, rgba(247,244,242,0.0) 40%, rgba(247,244,242,0.85) 100%)" }}/>
              <div className="absolute inset-0" style={{ background: "radial-gradient(50% 50% at 50% 60%, rgba(248,138,43,0.20), transparent 70%)" }}/>
            </div>
          </section>

          {/* TRILHAS */}
          <section className="px-5 mt-5 grid grid-cols-2 gap-3">
            {/* Atual */}
            <div className="rounded-[22px] p-3.5" style={{ background: "linear-gradient(180deg,#F2F8EC,#E8F1DF)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 18px -10px rgba(143,177,125,0.30)" }}>
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#EAF3DF" }}><Leaf c={sage}/></span>
                <span className="px-2.5 py-[3px] rounded-full text-[9px] font-semibold" style={{ background: "rgba(255,255,255,0.7)", color: "#5A7A48" }}>Atual</span>
              </div>
              <p className="text-[8.5px] tracking-[0.18em] font-semibold mt-2.5" style={{ color: "#5A7A48" }}>SUA TRILHA ATUAL</p>
              <h3 style={serif} className="text-[17px] leading-[1.1] mt-1 text-[#111]">Controle da Ansiedade</h3>
              <p className="mt-2 text-[11px] font-semibold" style={{ color: "#5A7A48" }}>85% concluída</p>
              <div className="mt-1 h-[5px] rounded-full overflow-hidden" style={{ background: "#DCE7CE" }}>
                <span className="block h-full rounded-full" style={{ width: "85%", background: sage }}/>
              </div>
              <p className="mt-2.5 text-[10.5px] leading-[1.35]" style={{ color: ink700 }}>
                Você desenvolveu mais clareza emocional e autocontrole.
              </p>
            </div>

            {/* Nova */}
            <div className="relative rounded-[22px] p-3.5" style={{ background: "linear-gradient(180deg,#FFF6EE,#FBEEE3)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 26px -10px rgba(248,138,43,0.45)" }}>
              <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: brand, boxShadow: "0 6px 14px -4px rgba(248,138,43,0.55)" }}>
                <Star/>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#FFE3CC" }}><Heart c={brand}/></span>
              </div>
              <p className="text-[8.5px] tracking-[0.18em] font-semibold mt-2.5" style={{ color: brand }}>NOVA TRILHA RECOMENDADA</p>
              <h3 style={serif} className="text-[17px] leading-[1.1] mt-1 text-[#111]">Relações Saudáveis</h3>
              <p className="mt-2 text-[10.5px] leading-[1.35]" style={{ color: ink700 }}>
                Agora que sua mente está mais equilibrada, você está pronto para aprofundar seus vínculos emocionais.
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex flex-col items-center"><Layers/><span className="text-[10px] mt-0.5 font-semibold text-[#111]">3</span><span className="text-[8.5px]" style={{ color: ink600 }}>módulos</span></div>
                <div className="flex flex-col items-center"><Play/><span className="text-[10px] mt-0.5 font-semibold text-[#111]">24</span><span className="text-[8.5px]" style={{ color: ink600 }}>aulas</span></div>
                <div className="flex flex-col items-center"><Clock/><span className="text-[10px] mt-0.5 font-semibold text-[#111]">~6h</span><span className="text-[8.5px]" style={{ color: ink600 }}>conteúdo</span></div>
              </div>
              <div className="mt-2.5 rounded-full py-1.5 flex items-center justify-center gap-1.5" style={{ background: "rgba(248,138,43,0.12)", border: "1px solid rgba(248,138,43,0.22)" }}>
                <Spark/><span className="text-[10px] font-semibold" style={{ color: brand }}>Recomendado para você</span>
              </div>
            </div>
          </section>

          {/* COMPARATIVO */}
          <section className="px-5 mt-5">
            <div className="flex items-center gap-2 justify-center">
              <span className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(17,17,17,0.12))" }}/>
              <p className="text-[11px] font-semibold text-[#111]">Sua evolução até aqui</p>
              <span className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(17,17,17,0.12))" }}/>
            </div>
            <div className="relative mt-3 rounded-[24px] p-4 overflow-hidden" style={{ background: "linear-gradient(135deg,#FFF6EE 0%, #F4F8EE 100%)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 22px -12px rgba(17,17,17,0.10)" }}>
              {/* organic lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 220" preserveAspectRatio="none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <path key={i} d={`M30 ${50 + i * 22} C120 ${40 + i * 22}, 200 ${60 + i * 18}, 290 ${50 + i * 22}`} stroke={i < 3 ? brand : sage} strokeOpacity="0.18" strokeWidth="1" fill="none"/>
                ))}
              </svg>
              <div className="relative grid grid-cols-2 gap-2">
                <div>
                  <span className="px-2.5 py-[3px] rounded-full text-[9px] font-semibold tracking-[0.18em]" style={{ background: "#FFE3CC", color: brand }}>ANTES</span>
                  <ul className="mt-3 space-y-2">
                    {before.map((r, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)" }}>{r.icon}</span>
                        <span className="text-[10.5px]" style={{ color: ink700 }}>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="px-2.5 py-[3px] rounded-full text-[9px] font-semibold tracking-[0.18em]" style={{ background: sageBg, color: "#5A7A48" }}>AGORA</span>
                  <ul className="mt-3 space-y-2">
                    {now.map((r, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)" }}>{r.icon}</span>
                        <span className="text-[10.5px]" style={{ color: ink700 }}>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: "0 6px 18px -6px rgba(248,138,43,0.45), inset 0 0 0 1px rgba(248,138,43,0.18)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ink700} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
              </div>
            </div>
          </section>

          {/* CURY */}
          <section className="px-5 mt-4">
            <div className="relative overflow-hidden rounded-[28px] px-3 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#FFF8F3,#F6EFE8)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 22px -12px rgba(248,138,43,0.20)" }}>
              <div className="absolute -top-10 -right-10 w-[160px] h-[160px] rounded-full" style={{ background: "radial-gradient(circle, rgba(248,138,43,0.10), transparent 70%)" }}/>
              <img src={curyImg} alt="Augusto Cury" className="relative w-[78px] h-[78px] rounded-2xl object-cover ring-1 ring-white shadow-[0_4px_14px_-6px_rgba(0,0,0,0.2)] shrink-0"/>
              <div className="relative flex-1 min-w-0">
                <div className="absolute -top-2 -right-1"><Quote/></div>
                <p style={serif} className="text-[12.5px] leading-[1.4] text-[#111] italic">
                  "A evolução emocional muda não apenas o que sentimos, mas também os caminhos que escolhemos."
                </p>
                <p className="mt-1.5 text-[10px] tracking-[0.18em] uppercase" style={{ color: brand }}>— Augusto Cury</p>
              </div>
            </div>
          </section>

          {/* MINI CARDS */}
          <section className="px-5 mt-4">
            <div className="flex items-center gap-2 justify-center">
              <span className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(17,17,17,0.12))" }}/>
              <p className="text-[11px] font-semibold text-[#111]">O que muda nessa nova jornada</p>
              <span className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(17,17,17,0.12))" }}/>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {miniCards.map((m, i) => (
                <div key={i} className="rounded-xl p-2 flex flex-col items-center text-center bg-white/85" style={{ border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 10px -6px rgba(17,17,17,0.10)" }}>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: m.bg }}>{m.icon}</span>
                  <p className="mt-1.5 text-[9.5px] leading-[1.2] font-semibold text-[#111]">{m.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky CTAs */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-5 pt-5 pb-5" style={{ background: "linear-gradient(180deg, rgba(247,244,242,0) 0%, rgba(247,244,242,0.95) 30%, #F7F4F2 100%)" }}>
          <Link
            to={al("/mudar-trilha/confirmar")}
            className="relative w-full h-[56px] rounded-full flex items-center justify-center text-white font-semibold text-[15px] active:scale-[0.99] transition"
            style={{ background: "linear-gradient(180deg,#FF9D4D 0%,#F88A2B 100%)", boxShadow: "0 14px 32px -10px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35)" }}
          >
            <span className="absolute left-5 opacity-90"><Spark/></span>
            Mudar minha trilha
            <span className="absolute right-5 opacity-90"><ChevR s={18}/></span>
          </Link>
          <Link
            to={al("/trilha")}
            className="mt-2.5 w-full h-[46px] rounded-full flex items-center justify-center text-[13px] font-semibold active:scale-[0.99] transition"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(248,138,43,0.30)", color: brand, backdropFilter: "blur(6px)" }}
          >
            Continuar trilha atual
          </Link>
          <p className="mt-2.5 text-center text-[10.5px] flex items-center justify-center gap-1.5" style={{ color: ink500 }}>
            <HeartG c={ink500}/> Sua jornada emocional evolui junto com você.
          </p>
        </div>

        <style>{`
          @keyframes twinkle { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
          @keyframes breathe { 0%,100%{opacity:.85;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
        `}</style>
      </div>
    </main>
  );

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Mudança de Jornada">
        <div className="bg-white rounded-[24px] shadow-sm ring-1 ring-black/5 overflow-hidden">
          {content}
        </div>
      </EnterpriseUserLayout>
    );
  }

  return (
    <MediaDesktopLayout title="Jornada" backTo="/trilha">
      {content}
    </MediaDesktopLayout>
  );
};

export default MudancaJornadaScreen;
