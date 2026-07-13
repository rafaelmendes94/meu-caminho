import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import orb from "@/assets/trilha/prova-orb.jpg";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const ink900 = "#111111";
const ink600 = "#666666";
const ink500 = "#999999";
const brand = "#F88A2B";
const sage = "#8FB17D";
const lilac = "#9B8AC9";
const bg = "#F7F4F2";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const ChevL = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevR = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>;
const LockMini = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={ink500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
const Quote = ({ c = brand }: { c?: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={c}><path d="M7 7h4v4H8c0 2 1 3 2 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 2 3v3c-3 0-5-2-5-5V7z"/></svg>;

// Answer icons
const Brain = ({ c = brand }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8c0 1.3.8 2.4 2 2.8V15a3 3 0 0 0 3 3h.5V4H9z"/><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8c0 1.3-.8 2.4-2 2.8V15a3 3 0 0 1-3 3h-.5V4H15z"/></svg>;
const Wind = ({ c = sage }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h17a3 3 0 1 1-3 3"/><path d="M3 16h9"/></svg>;
const Lotus = ({ c = brand }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c2 3 2 6 0 9-2-3-2-6 0-9z"/><path d="M4 13c3-1 6 0 8 3-3 1-6 0-8-3z"/><path d="M20 13c-3-1-6 0-8 3 3 1 6 0 8-3z"/><path d="M3 17c4 3 14 3 18 0"/></svg>;
const Heart = ({ c = lilac }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
const Star = ({ c = "#C28B3A" }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.3 9.4l6-.9L12 3z"/></svg>;

type Answer = { id: string; label: string; Icon: React.FC<{ c?: string }>; iconBg: string };
const answers: Answer[] = [
  { id: "a", label: "Tenho mais clareza emocional", Icon: Brain, iconBg: "#FDECDA" },
  { id: "b", label: "Estou desacelerando minha mente", Icon: Wind, iconBg: "#E3ECDD" },
  { id: "c", label: "Consigo reagir com mais calma", Icon: Lotus, iconBg: "#FDECDA" },
  { id: "d", label: "Ainda estou aprendendo a lidar comigo", Icon: Heart, iconBg: "#EFEAF7" },
  { id: "e", label: "Quero aprofundar minha evolução", Icon: Star, iconBg: "#FBE9D5" },
];

const ProvaFinalScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const total = 5;
  const pct = (step / total) * 100;
  
  const isEnterprise = location.pathname.startsWith('/enterprise');
  const Layout = isEnterprise ? (({ children }: any) => <EnterpriseUserLayout title="Avaliação">{children}</EnterpriseUserLayout>) : AppUserLayout;

  const handleNext = () => {
    if (step < total) setStep((s) => s + 1);
    else navigate(al("/prova-final/resultado"));
  };

  const content = (
    <div className={`relative w-full h-full min-h-[calc(100vh-160px)] flex flex-col font-display ${isEnterprise ? 'lg:min-h-0' : bg}`}>
      {!isEnterprise && (
        <>
          <div className="pointer-events-none absolute inset-0" style={{ background:"radial-gradient(70% 40% at 50% 20%, rgba(248,138,43,0.13) 0%, rgba(248,138,43,0) 70%), radial-gradient(60% 30% at 50% 100%, rgba(248,138,43,0.10) 0%, transparent 70%)" }}/>
          <div className="pointer-events-none absolute -top-20 -left-24 w-[280px] h-[280px] rounded-full" style={{ background:"radial-gradient(circle, rgba(155,138,201,0.10), transparent 70%)", filter:"blur(28px)" }}/>
          <div className="pointer-events-none absolute top-[50%] -right-24 w-[280px] h-[280px] rounded-full" style={{ background:"radial-gradient(circle, rgba(143,177,125,0.09), transparent 70%)", filter:"blur(28px)" }}/>
        </>
      )}

      <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-1 shrink-0 lg:hidden">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/80 border border-black/5 flex items-center justify-center shadow-sm active:scale-95 transition" style={{ color:"#444" }}>
          <ChevL/>
        </button>
        <h1 style={serif} className="text-[18px] text-[#111]">Avaliação do Módulo</h1>
        <button onClick={() => navigate(al("/trilha"))} className="px-4 h-10 rounded-full bg-white/80 border border-white flex items-center justify-center text-[12.5px] font-bold shadow-sm active:scale-95 transition" style={{ color: brand }}>
          Sair
        </button>
      </div>

      <div className={`relative z-10 px-7 shrink-0 ${isEnterprise ? 'lg:mt-2' : 'pt-6 pb-1'}`}>
        <p className="text-center text-[11.5px] lg:text-[14px] font-bold uppercase tracking-wider" style={{ color: ink600 }}>Pergunta {step} de {total}</p>
        <div className={`mt-2 relative h-[4px] lg:h-[6px] rounded-full bg-black/5 max-w-xl mx-auto`}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: brand, boxShadow: `0 0 10px rgba(248,138,43,0.3)` }}/>
        </div>
      </div>

      <div className={`relative z-10 flex-1 px-5 ${isEnterprise ? 'pt-4 lg:pt-8' : 'pt-8 lg:pt-16'} overflow-y-auto no-scrollbar lg:pb-0`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 mb-10 lg:mb-16">
            <div className="flex-1 text-center lg:text-left animate-fade-in">
              <h2 style={serif} className="text-[28px] lg:text-[48px] leading-tight text-[#111]">Qual foi a principal mudança percebida?</h2>
              <p className="mt-4 text-[14px] lg:text-[18px] text-[#666] max-w-[420px] mx-auto lg:mx-0 leading-relaxed font-medium">
                Reflita sobre sua jornada neste módulo e selecione a opção que melhor descreve sua evolução.
              </p>
            </div>

            <div className="relative mt-8 lg:mt-0 mx-auto lg:mx-0 w-full lg:w-[240px] h-[120px] lg:h-[240px] flex items-center justify-center shrink-0">
              <div className="absolute inset-0" style={{ background:"radial-gradient(60% 80% at 50% 50%, rgba(248,138,43,0.1) 0%, transparent 70%)" }}/>
              <img src={orb} alt="" loading="lazy" className="relative w-[120px] h-[120px] lg:w-[180px] lg:h-[180px] object-cover rounded-full" style={{ animation:"breath 5.5s ease-in-out infinite", boxShadow:"0 12px 48px -12px rgba(248,138,43,0.3)" }}/>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5 mb-16">
            {answers.map((a) => {
              const isSel = selected === a.id;
              const Icon = a.Icon;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelected(a.id)}
                  className={`group text-left rounded-[24px] lg:rounded-[28px] px-5 lg:px-6 py-5 lg:py-6 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 ${a.id === 'e' ? 'lg:col-span-2' : ''}`}
                  style={{
                    background: "white",
                    border: `2px solid ${isSel ? brand : "rgba(17,17,17,0.04)"}`,
                    boxShadow: isSel ? "0 12px 32px -12px rgba(248,138,43,0.25)" : "0 4px 12px -8px rgba(0,0,0,0.04)",
                  }}
                >
                  <span className="relative w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ border: `2px solid ${isSel ? brand : "#D9D2CB"}`, background:"white" }}>
                    {isSel && <span className="w-[12px] h-[12px] rounded-full" style={{ background: brand }}/>}
                  </span>
                  <span className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: a.iconBg }}>
                    <Icon />
                  </span>
                  <span className="text-[14px] lg:text-[16px] leading-tight flex-1" style={{ color: "#111", fontWeight: isSel ? 700 : 500 }}>
                    {a.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Insight do mentor — aguarda conteúdo dinâmico (FEATURE-B20) */}
        </div>
      </div>

      <div className={`shrink-0 z-20 px-5 pt-6 pb-8 lg:pb-0 ${isEnterprise ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-t border-black/5'}`}>
        <div className="max-w-xl mx-auto flex flex-col items-center gap-5">
          <button
            onClick={handleNext}
            disabled={!selected}
            className="w-full h-[62px] rounded-full text-white font-bold text-[16px] lg:text-[18px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 hover:brightness-105"
            style={{ 
              background: brand,
              boxShadow: "0 16px 32px -12px rgba(248,138,43,0.4)" 
            }}
          >
            <span>{step < total ? "Próxima Pergunta" : "Finalizar Avaliação"}</span>
            <ChevR />
          </button>
          <p className="text-[11px] lg:text-[13px] flex items-center gap-2 font-medium mb-4" style={{ color: ink500 }}>
            <LockMini /> Suas respostas são pessoais e anônimas.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes breath {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.95; }
        }
      `}</style>
    </div>
  );

  return (
    <Layout>
      {content}
    </Layout>
  );
};

export default ProvaFinalScreen;