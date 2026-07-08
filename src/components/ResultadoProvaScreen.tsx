import { Link, useLocation } from "react-router-dom";
import hero from "@/assets/trilha/resultado-hero.jpg";
import cury from "@/assets/trilha/cury.jpg";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const ink900 ="#111111";
const ink600 ="#666666";
const ink500 ="#999999";
const brand ="#F88A2B";
const sage ="#8FB17D";
const sageBg ="#E3ECDD";
const lilac ="#9B8AC9";
const bg ="#F7F4F2";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;

const Signal = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const Wifi = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const Battery = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const ChevL = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevR = ({ s = 16 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const Share = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>;
const LockMini = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={ink500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
const Quote = ({ c = brand }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const Sparkle = () => <svg width="14" height="14" viewBox="0 0 24 24" fill={brand}><path d="M12 4l1.5 4L18 9.5 13.5 11 12 15l-1.5-4L6 9.5 10.5 8z"/></svg>;
const Sapling = ({ s = 30 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V10"/><path d="M12 10c0-3 2-5 5-5-1 4-3 5-5 5z"/><path d="M12 13c0-2-2-4-5-4 1 3 3 4 5 4z"/><path d="M12 8c0-2 1-4 3-4-.5 3-1.5 4-3 4z"/></svg>;
const Unlock = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={sage} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7-2.6"/></svg>;

// Insight icons
const Brain = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={sage} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8c0 1.3.8 2.4 2 2.8V15a3 3 0 0 0 3 3h.5V4H9z"/><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8c0 1.3-.8 2.4-2 2.8V15a3 3 0 0 1-3 3h-.5V4H15z"/></svg>;
const Lotus = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={lilac} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="2"/><path d="M12 12c2 3 2 6 0 9-2-3-2-6 0-9z"/><path d="M4 14c3-1 6 0 8 3-3 1-6 0-8-3z"/><path d="M20 14c-3-1-6 0-8 3 3 1 6 0 8-3z"/></svg>;
const Heart = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;

const insights = [
 { Icon: Brain, iconBg: sageBg, title:"Mais clareza mental", text:"Você demonstra mais consciência sobre seus pensamentos e emoções." },
 { Icon: Lotus, iconBg:"#EFEAF7", title:"Redução da ansiedade", text:"Você está lidando melhor com a ansiedade e os pensamentos acelerados." },
 { Icon: Heart, iconBg:"#FBE9D5", title:"Respostas conscientes", text:"Você tem reagido com mais calma e equilíbrio nas situações do dia a dia." },
];

// Emo small icons
const Cloud = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C28B3A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A4 4 0 0 0 7 16z"/><path d="M10 19l-1 2M14 19l-1 2"/></svg>;
const Sun = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></svg>;
const LotusS = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={lilac} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c2 3 2 6 0 9-2-3-2-6 0-9z"/><path d="M4 13c3-1 6 0 8 3-3 1-6 0-8-3z"/><path d="M20 13c-3-1-6 0-8 3 3 1 6 0 8-3z"/></svg>;
const Group = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c1-3 4-4 6-4s5 1 6 4"/><path d="M14 19c1-2 3-3 5-3"/></svg>;

const emos = [
 { Icon: Cloud, iconBg:"#FBE9D5", label:"Ansiedade", before:"Alta", now:"Moderada", pct: 55 },
 { Icon: Sun, iconBg:"#FDECDA", label:"Clareza mental", before:"Baixa", now:"Melhorando", pct: 65 },
 { Icon: LotusS, iconBg:"#EFEAF7", label:"Autocontrole", before:"Instável", now:"Consistente", pct: 78 },
 { Icon: Group, iconBg:"#FDECDA", label:"Relações", before:"Desgastadas", now:"Mais saudáveis", pct: 60 },
];

const ResultadoProvaScreen = () => {
  const location = useLocation();
  const al = useAudienceLink();
  const isEnterprise = location.pathname.startsWith('/enterprise');
  const Layout = isEnterprise ? (({ children }: any) => <EnterpriseUserLayout title="Resultado">{children}</EnterpriseUserLayout>) : AppUserLayout;

  const content = (
    <div className={`relative w-full h-full min-h-screen flex flex-col font-display ${isEnterprise ? 'lg:min-h-0' : bg}`}>
      {!isEnterprise && (
        <>
          <div className="pointer-events-none absolute inset-0" style={{ background:"radial-gradient(70% 30% at 50% 0%, rgba(248,138,43,0.12) 0%, transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(248,138,43,0.10) 0%, transparent 70%)" }}/>
          <div className="pointer-events-none absolute -top-16 -right-20 w-[280px] h-[280px] rounded-full" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.10), transparent 70%)", filter:"blur(20px)" }}/>
        </>
      )}
      
      {/* Sparkle particles */}
      {[
        { top:"18%", left:"12%", s: 5, d: 0 },
        { top:"32%", left:"82%", s: 4, d: 1.2 },
        { top:"48%", left:"8%", s: 3, d: 2 },
        { top:"62%", left:"88%", s: 4, d: 0.6 },
        { top:"78%", left:"16%", s: 3, d: 1.6 },
      ].map((p, i) => (
        <span key={i} className="pointer-events-none absolute rounded-full bg-white z-0" style={{ top: p.top, left: p.left, width: p.s, height: p.s, boxShadow: `0 0 8px ${brand}`, animation: `twinkle 3.4s ease-in-out ${p.d}s infinite` }}/>
      ))}

      {/* Header - Mobile only */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-1 shrink-0 lg:hidden">
        <Link to={al("/progresso")} className="w-10 h-10 rounded-full bg-white/80 border border-white flex items-center justify-center shadow-sm active:scale-95 transition" style={{ color:"#444" }}>
          <ChevL/>
        </Link>
        <h1 style={serif} className="text-[18px] text-[#111]">Resultado</h1>
        <button className="w-10 h-10 rounded-full bg-white/80 border border-white flex items-center justify-center shadow-sm active:scale-95 transition" style={{ color:"#444" }} aria-label="Compartilhar">
          <Share/>
        </button>
      </div>

      <div className="relative z-10 flex-1 px-5 pt-4 lg:pt-12 overflow-y-auto no-scrollbar lg:pb-12">
        <div className="max-w-5xl mx-auto">
          {/* HERO */}
          <section className="relative mb-10 lg:mb-16">
            <div className={`relative overflow-hidden rounded-[32px] min-h-[300px] lg:min-h-[420px] ${isEnterprise ? 'bg-white border border-black/5 shadow-sm' : ''}`}>
              <img src={hero} alt="" className="absolute right-[-5%] top-0 w-[80%] lg:w-[60%] h-full object-cover" style={{ WebkitMaskImage:"linear-gradient(to left, black 40%, transparent 95%)", maskImage:"linear-gradient(to left, black 40%, transparent 95%)" }}/>
              <div className="relative p-8 lg:p-16 flex flex-col justify-center h-full min-h-[300px] lg:min-h-[420px] max-w-[70%] lg:max-w-[50%]">
                <h2 style={serif} className="text-[38px] lg:text-[64px] leading-[0.95] text-[#111] font-bold">Você<br/>evoluiu.</h2>
                <p className="mt-4 text-[14px] lg:text-[18px] leading-relaxed text-[#666] font-medium">Seu progresso emocional já começa a aparecer nas pequenas atitudes do cotidiano.</p>
                
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
                    <Sapling s={isEnterprise ? 34 : 26}/>
                  </div>
                  <div>
                    <p style={serif} className="text-[20px] lg:text-[32px] leading-none text-[#111] font-bold">Excelente!</p>
                    <p className="text-[11px] lg:text-[14px] text-[#666] mt-1">Consciência e maturidade emocional.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* INSIGHTS */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-6">
                <h3 style={serif} className="text-[24px] lg:text-[32px] text-[#111] font-bold">Seus principais insights</h3>
                <Sparkle/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-5">
                {insights.map((ins) => (
                  <div key={ins.title} className="rounded-[24px] bg-white border border-black/5 p-5 flex lg:flex-row flex-col lg:items-center gap-4 transition-all hover:shadow-md">
                    <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ins.iconBg }}>
                      <ins.Icon/>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] lg:text-[18px] font-bold text-[#111] leading-tight">{ins.title}</p>
                      <p className="mt-1 text-[12px] lg:text-[14px] leading-relaxed text-[#666]">{ins.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EVOLUÇÃO EMOCIONAL */}
            <div className="lg:col-span-5">
              <h3 style={serif} className="text-[24px] lg:text-[32px] text-[#111] font-bold mb-6">Sua evolução</h3>
              <div className="rounded-[32px] bg-white border border-black/5 p-6 lg:p-8">
                <div className="flex justify-between text-[11px] lg:text-[12px] tracking-[0.2em] uppercase font-bold mb-6" style={{ color: ink500 }}>
                  <span className="pl-12">Antes</span><span>Agora</span>
                </div>
                <ul className="space-y-6">
                  {emos.map((e) => (
                    <li key={e.label}>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: e.iconBg }}>
                          <e.Icon/>
                        </span>
                        <p className="text-[14px] lg:text-[16px] font-bold text-[#111]">{e.label}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden flex flex-row-reverse">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${100 - e.pct}%`, background: brand }}/>
                        </div>
                        <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000 delay-300" style={{ width: `${e.pct}%`, background: sage }}/>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 font-bold text-[10px] lg:text-[11px] uppercase tracking-wider">
                        <span style={{ color:"#C28B3A" }}>{e.before}</span>
                        <span style={{ color: sage }}>{e.now}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-12 lg:mt-16 mb-20">
            {/* CURY QUOTE */}
            <div className="relative overflow-hidden rounded-[32px] p-8 flex items-center gap-6" style={{ background: "linear-gradient(135deg,#FFF8F3,#F6EFE8)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <div className="relative flex-1 min-w-0">
                <Quote/>
                <p style={serif} className="mt-3 text-[16px] lg:text-[22px] italic leading-relaxed text-[#111] font-medium">
                  "A mente que se conhece, se transforma. E a vida acompanha."
                </p>
                <p className="mt-3 text-[12px] lg:text-[14px] tracking-[0.2em] uppercase font-bold text-[#F88A2B]">— Augusto Cury</p>
              </div>
              <img src={cury} alt="Augusto Cury" className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-3xl object-cover shadow-xl ring-4 ring-white"/>
            </div>

            {/* UNLOCK CARD */}
            <div className="relative overflow-hidden rounded-[32px] p-8 flex items-center gap-6" style={{ background: "linear-gradient(135deg,#F2F8EE,#E8F1E1)", border: "1px solid rgba(143,177,125,0.15)" }}>
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-3xl bg-white flex items-center justify-center shrink-0 shadow-lg shadow-green-900/10">
                <Unlock/>
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-[11px] lg:text-[12px] font-bold tracking-[0.2em] uppercase text-[#8FB17D]">Conquista desbloqueada</p>
                <p style={serif} className="text-[20px] lg:text-[28px] text-[#111] leading-tight mt-1 font-bold">Curso 2 liberado!</p>
                <p className="text-[13px] lg:text-[15px] mt-2 leading-relaxed text-[#666] font-medium">Você avançou mais um passo na sua evolução emocional.</p>
                <Link to={al("/curso-desbloqueado")} className="mt-4 inline-flex items-center gap-2 text-[14px] font-bold text-[#8FB17D] hover:underline">
                  Ver novo conteúdo <ChevR s={14}/>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className={`shrink-0 z-20 px-5 pt-6 pb-8 lg:pb-12 ${isEnterprise ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-t border-black/5'}`}>
        <div className="max-w-xl mx-auto flex flex-col items-center gap-5">
          <Link
            to={al("/progresso")}
            className="w-full h-[62px] rounded-full text-white font-bold text-[16px] lg:text-[18px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:brightness-105"
            style={{ 
              background: "linear-gradient(180deg,#FF9D4D 0%,#F88A2B 100%)", 
              boxShadow: "0 20px 40px -12px rgba(248,138,43,0.5), inset 0 1px 0 rgba(255,255,255,0.3)" 
            }}
          >
            <span>Continuar jornada</span>
            <ChevR />
          </Link>
          <p className="text-[11px] lg:text-[14px] flex items-center gap-2 font-medium mb-4" style={{ color: ink500 }}>
            <LockMini /> Sua jornada é única e contínua. Siga evoluindo.
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes pulseGlow { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: 0.85; } }
        @keyframes twinkle { 0%,100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
      `}</style>
    </div>
  );

  return (
    <Layout>
        {content}
    </Layout>
  );
};

export default ResultadoProvaScreen;
