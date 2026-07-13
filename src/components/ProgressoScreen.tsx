import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import heroImg from "@/assets/trilha/progresso-hero.jpg";
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

const Signal = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const Wifi = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const Battery = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const ChevL = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevR = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const Share = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>;
const Flame = ({ c = brand, s = 18 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c1 4 5 5 5 9a5 5 0 1 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/></svg>;
const Clock = ({ c = sage, s = 18 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const Book = ({ c = lilac, s = 18 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h7M8 11h7"/></svg>;
const Check = ({ c = "#fff", s = 14 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>;
const Lock = ({ c = "#9C948C", s = 13 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
const BookOpen = ({ c = brand, s = 14 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3z"/><path d="M21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/></svg>;
const Quote = () => <svg width="22" height="22" viewBox="0 0 24 24" fill={brand}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;
const Sun = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></svg>;
const Lotus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={lilac} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c2 3 2 6 0 9-2-3-2-6 0-9z"/><path d="M4 13c3-1 6 0 8 3-3 1-6 0-8-3z"/><path d="M20 13c-3-1-6 0-8 3 3 1 6 0 8-3z"/><path d="M3 17c4 3 14 3 18 0"/></svg>;
const Heart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E26B6B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const Spiral = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C28B3A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M15 12a3 3 0 1 1-3-3 5 5 0 0 1 5 5 7 7 0 0 1-7 7"/></svg>;

// Progress ring
const Ring = ({ value }: { value: number }) => {
  const r = 22; const c = 2 * Math.PI * r;
  return (
    <div className="relative w-[58px] h-[58px] lg:w-[72px] lg:h-[72px]">
      <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
        <circle cx="28" cy="28" r={r} stroke="#F2EBE3" strokeWidth="4" fill="none" />
        <circle cx="28" cy="28" r={r} stroke={brand} strokeWidth="4" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" />
      </svg>
      <span style={serif} className="absolute inset-0 flex items-center justify-center text-[15px] lg:text-[18px] text-[#111] font-bold">{value}%</span>
    </div>
  );
};

type Emo = { Icon: () => JSX.Element; iconBg: string; label: string; before: string; now: string; pct: number; nowColor: string };
// Progressos reais serão carregados via CMS/backend. Mocks removidos.
const emocoes: Emo[] = [];
const days = ["S","T","Q","Q","S","S","D"];
const dayState: string[] = [];
const barVals: number[] = [];
type Step = { label: string; sub?: string; state: "done" | "current" | "locked" };
const steps: Step[] = [];

const ProgressoScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const location = useLocation();
  const isEnterprise = location.pathname.startsWith('/enterprise');
  const Layout = isEnterprise ? (({ children }: any) => <EnterpriseUserLayout title="Seu Progresso">{children}</EnterpriseUserLayout>) : AppUserLayout;

  const content = (
    <div className={`relative w-full h-full min-h-screen flex flex-col font-display ${isEnterprise ? 'lg:min-h-0' : bg}`}>
      {!isEnterprise && (
        <>
          <div className="pointer-events-none absolute inset-0" style={{ background:"radial-gradient(80% 35% at 50% 0%, rgba(248,138,43,0.10) 0%, rgba(248,138,43,0) 70%), radial-gradient(60% 25% at 50% 100%, rgba(143,177,125,0.06) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute -top-16 -right-20 w-[280px] h-[280px] rounded-full" style={{ background:"radial-gradient(circle, rgba(248,138,43,0.10), transparent 70%)", filter:"blur(20px)" }} />
        </>
      )}

      {/* Header - Mobile Only */}
      <div className={`relative z-10 flex items-center justify-between px-5 pt-6 pb-2 shrink-0 lg:hidden`}>
        <Link to={al("/menu")} className="w-10 h-10 rounded-full bg-white/80 border border-white flex items-center justify-center shadow-sm active:scale-95 transition" style={{ color: ink700 }}>
          <ChevL />
        </Link>
        <h1 style={serif} className="text-[19px] text-[#111]">Seu progresso</h1>
        <button className="w-10 h-10 rounded-full bg-white/80 border border-white flex items-center justify-center shadow-sm active:scale-95 transition" style={{ color: ink700 }} aria-label="Compartilhar">
          <Share />
        </button>
      </div>

      <div className="relative z-10 flex-1 px-5 pt-4 lg:pt-8 overflow-y-auto no-scrollbar lg:pb-12">
        <div className="max-w-6xl mx-auto">
          {/* HERO */}
          <section className="relative mb-8 lg:mb-12">
            <div className={`relative overflow-hidden rounded-[32px] min-h-[220px] lg:min-h-[340px] flex flex-col justify-center ${isEnterprise ? 'bg-white border border-black/5' : ''}`}>
              <img src={heroImg} alt="" className="absolute right-[-5%] top-0 w-[70%] lg:w-[45%] h-full object-cover opacity-95" style={{ WebkitMaskImage:"linear-gradient(to left, black 35%, transparent 95%)", maskImage:"linear-gradient(to left, black 35%, transparent 95%)" }} />
              <div className="relative p-6 lg:p-12 max-w-[65%] lg:max-w-[50%]">
                <h2 style={serif} className="text-[28px] lg:text-[52px] leading-[1.05] text-[#111] font-bold">Você está<br/>evoluindo.</h2>
                <p className="mt-4 text-[13px] lg:text-[18px] leading-relaxed text-[#666] font-medium max-w-sm">Cada pequena prática fortalece sua mente e suas emoções rumo à melhor versão de si mesmo.</p>
              </div>
            </div>
          </section>

          {/* STATS GRID */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6 mb-8 lg:mb-12">
            <div className="rounded-[28px] bg-white border border-black/5 p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <Ring value={0} />
              <p className="text-[11px] lg:text-[13px] mt-4 font-bold text-[#111] uppercase tracking-wider">Progresso<br/>geral</p>
            </div>
            <div className="rounded-[28px] bg-white border border-black/5 p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center mb-1">
                <Flame c={brand} s={28}/>
              </span>
              <p style={serif} className="text-[24px] lg:text-[32px] text-[#111] font-bold">0 <span className="text-[12px] lg:text-[14px] font-sans font-medium text-[#666]">dias</span></p>
              <p className="text-[11px] lg:text-[13px] font-bold text-[#111] uppercase tracking-wider">Sequência</p>
            </div>
            <div className="rounded-[28px] bg-white border border-black/5 p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[#8FB17D]/10 flex items-center justify-center mb-1">
                <Clock c={sage} s={28}/>
              </span>
              <p style={serif} className="text-[24px] lg:text-[32px] text-[#111] font-bold">0h <span className="text-[12px] lg:text-[14px] font-sans font-medium text-[#666]">00m</span></p>
              <p className="text-[11px] lg:text-[13px] font-bold text-[#111] uppercase tracking-wider">Dedicado</p>
            </div>
            <div className="rounded-[28px] bg-white border border-black/5 p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[#9B8AC9]/10 flex items-center justify-center mb-1">
                <Book c={lilac} s={28}/>
              </span>
              <p style={serif} className="text-[24px] lg:text-[32px] text-[#111] font-bold">0 <span className="text-[12px] lg:text-[14px] font-sans font-medium text-[#666]">aulas</span></p>
              <p className="text-[11px] lg:text-[13px] font-bold text-[#111] uppercase tracking-wider">Concluídas</p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-12">
            {/* ANTES E AGORA & RITMO */}
            <div className="lg:col-span-7 space-y-6 lg:space-y-8">
              <div className="rounded-[32px] bg-white border border-black/5 p-6 lg:p-10 shadow-sm">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 style={serif} className="text-[22px] lg:text-[28px] text-[#111] font-bold">Antes e agora</h3>
                </div>
                <p className="text-[13px] lg:text-[15px] text-[#666] font-medium mb-8">Acompanhe sua evolução em cada pilar emocional.</p>

                <div className="flex justify-between text-[11px] lg:text-[12px] tracking-[0.2em] uppercase font-bold mb-6 pl-14 pr-2 text-[#999]">
                  <span>Antes</span><span>Agora</span>
                </div>

                {emocoes.length > 0 ? <ul className="space-y-8">
                  {emocoes.map((e) => (
                    <li key={e.label} className="flex items-center gap-4 lg:gap-6">
                      <span className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: e.iconBg }}>
                        <e.Icon/>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] lg:text-[18px] font-bold text-[#111] mb-2">{e.label}</p>
                        <div className="relative h-2 rounded-full bg-black/5 overflow-hidden">
                          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000" style={{ width: `${e.pct}%`, background: `linear-gradient(90deg, ${brand}, ${e.nowColor})` }} />
                        </div>
                        <div className="flex items-center justify-between mt-2 font-bold text-[11px] lg:text-[12px] uppercase tracking-wider">
                          <span style={{ color:"#C28B3A" }}>{e.before}</span>
                          <span style={{ color: e.nowColor }}>{e.now}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul> : <p className="text-[13px] text-[#999] py-8 text-center">Sem dados de evolução emocional ainda.</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-[32px] bg-white border border-black/5 p-6 lg:p-8 shadow-sm">
                  <h3 style={serif} className="text-[18px] lg:text-[22px] text-[#111] font-bold">Seu ritmo</h3>
                  <p className="text-[12px] lg:text-[14px] text-[#666] font-medium mt-1 mb-6">Consistência que transforma</p>
                  <div className="grid grid-cols-7 gap-2 mb-8">
                    {days.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-3">
                        <span className="text-[11px] font-bold" style={{ color: "#999" }}>{d}</span>
                        <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-[#F2ECE5]" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[12px] text-[#999] text-center">Sem histórico de sequência ainda.</p>
                </div>

                <div className="rounded-[32px] bg-white border border-black/5 p-6 lg:p-8 shadow-sm">
                  <h3 style={serif} className="text-[18px] lg:text-[22px] text-[#111] font-bold">Esta semana</h3>
                  <p className="text-[12px] lg:text-[14px] text-[#666] font-medium mt-1 mb-6">Seu progresso diário</p>
                  <p className="h-[80px] flex items-center justify-center text-[12px] text-[#999] mb-4">Sem dados desta semana ainda.</p>
                </div>
              </div>
            </div>

            {/* JORNADA TIMELINE */}
            <div className="lg:col-span-5 space-y-6 lg:space-y-8">
              <div className="rounded-[32px] bg-white border border-black/5 p-6 lg:p-10 shadow-sm">
                <h3 style={serif} className="text-[22px] lg:text-[28px] text-[#111] font-bold">Sua jornada</h3>
                <p className="text-[13px] lg:text-[15px] text-[#666] font-medium mt-1 mb-10">Cada etapa concluída te aproxima da maestria emocional.</p>

                {steps.length > 0 ? <ol className="relative space-y-2">
                  <div className="absolute left-[20px] top-6 bottom-6 w-0.5 bg-black/5" />
                  {steps.map((s, i) => {
                    const done = s.state ==="done";
                    const cur = s.state ==="current";
                    return (
                      <li key={i} onClick={() => { if (s.label ==="Diagnóstico Final") { navigate(al("/diagnostico-final")); return; } if (s.state !=="locked") navigate(cur ? al("/prova-final") : al("/curso")); }} className={`group relative pl-14 py-4 transition-all ${s.state !=="locked" ? "cursor-pointer hover:bg-black/[0.02] rounded-2xl" : "opacity-60"}`}>
                        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${done ? 'bg-[#8FB17D]' : cur ? 'bg-[#F88A2B] shadow-lg shadow-orange-500/20' : 'bg-[#F2ECE5] border border-black/5'}`}>
                          {done ? <Check c="#fff" s={18}/> : cur ? <BookOpen c="#fff" s={20}/> : <Lock c="#A8A29C" s={16}/>}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-[15px] lg:text-[17px] font-bold leading-tight ${cur ? 'text-[#F88A2B]' : '#111'}`}>{s.label}</p>
                          {s.sub && <p className={`text-[12px] lg:text-[13px] font-medium mt-1 ${cur ? 'text-[#F88A2B]' : 'text-[#999]'}`}>{s.sub}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol> : <p className="text-[13px] text-[#999] text-center py-8">Sua jornada aparecerá aqui quando os cursos forem publicados.</p>}
              </div>

              {/* Insight do mentor oculto até haver citação real. */}
            </div>
          </div>
        </div>
      </div>
      
      {!isEnterprise && (
        <div className={`shrink-0 z-20 px-5 pt-4 pb-8 bg-white/80 backdrop-blur-md border-t border-black/5`}>
          <div className="max-w-xl mx-auto">
            <Link to={al("/home")} className="w-full h-[62px] rounded-full text-white font-bold text-[16px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] bg-[#111] shadow-xl shadow-black/10">
              Continuar trilha
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      {content}
    </Layout>
  );
};

export default ProgressoScreen;