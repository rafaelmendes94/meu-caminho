import { Link } from "react-router-dom";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const ink900 = "#111111";
const ink700 = "#444444";
const ink600 = "#666666";
const ink500 = "#999999";
const brand = "#F88A2B";
const sage = "#8FB17D";
const sageBg = "#E3ECDD";
const lilac = "#9B8AC9";

const serif = { fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" } as const;

const Moon = ({ c = lilac }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>;
const Brain = ({ c = brand }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4a4 4 0 0 0-4 4v2a3 3 0 0 0-1 6 3 3 0 0 0 5 2 3 3 0 0 0 5-1V8a4 4 0 0 0-4-4z"/><path d="M9 9v8"/></svg>;
const Leaf = ({ c = sage }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19c4-4 8-8 14-14"/></svg>;
const Trend = ({ c = sage }: { c?: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>;
const Chat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4V6z"/></svg>;

type InsightCard = { icon: React.ReactNode; iconBg: string; title: string; sub: string; chip: string; chipColor: string; chipBg: string };
const cards: InsightCard[] = [];
const points: { x: number; y: number; label: string }[] = [];

const InsightsIAScreen = () => {
  const al = useAudienceLink();
  
  return (
    <EnterpriseUserLayout title="Insights da IA">
      <div className="relative w-full min-h-screen flex flex-col bg-white">
        <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(70% 30% at 50% 6%, rgba(248,138,43,0.08) 0%, transparent 70%)" }}/>
        
        <div className="relative z-10 flex-1 overflow-x-hidden no-scrollbar pb-24">
          <section className="px-7 pt-6">
            <p className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: brand }}>Espelho emocional</p>
            <h1 className="text-[26px] leading-[1.15] text-[#111] mt-1.5" style={serif}>Seus insights</h1>
            <p className="mt-2 text-[12.5px]" style={{ color: ink600 }}>Padrões e aprendizados que a IA percebeu na sua jornada.</p>
          </section>

          {cards.length > 0 ? <section className="px-5 mt-4 grid grid-cols-2 gap-2.5">
            {cards.map((c, i) => (
              <Link key={i} to={al("/cury-digital/chat")} className="bg-white rounded-2xl p-3.5 border border-black/5 shadow-sm active:scale-[0.98] transition flex flex-col">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: c.iconBg }}>{c.icon}</div>
                <p className="mt-2.5 text-[12.5px] leading-[1.3]" style={{ color: ink900 }}>{c.title}</p>
                <p className="mt-1 text-[10.5px] leading-[1.4]" style={{ color: ink600 }}>{c.sub}</p>
                <span className="mt-auto pt-2.5 text-[9.5px] inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full" style={{ background: c.chipBg, color: c.chipColor }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: c.chipColor }}/>
                  {c.chip}
                </span>
              </Link>
            ))}
          </section> : <section className="px-5 mt-4"><div className="rounded-2xl p-6 border border-dashed border-black/10 text-center"><p className="text-[12.5px]" style={{ color: ink600 }}>Seus insights aparecerão aqui após algumas conversas.</p></div></section>}

          {points.length > 0 && <section className="px-5 mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px]" style={{ color: ink600 }}>Sua evolução emocional</p>
              <p className="text-[10.5px]" style={{ color: sage }}>—</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
              <svg viewBox="0 0 320 110" className="w-full h-auto block">
                <defs>
                  <linearGradient id="ev-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={brand} stopOpacity="0.22"/>
                    <stop offset="100%" stopColor={brand} stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="ev-line" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor={lilac}/>
                    <stop offset="100%" stopColor={brand}/>
                  </linearGradient>
                </defs>
                {[20, 50, 80].map((y, i) => (
                  <line key={i} x1="0" x2="320" y1={y} y2={y} stroke="#F0EAE3" strokeWidth="1" strokeDasharray="3 4"/>
                ))}
                <path d={`M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join("")} L ${points[points.length-1].x} 110 L ${points[0].x} 110 Z`} fill="url(#ev-fill)" />
                <path d={`M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join("")}`} fill="none" stroke="url(#ev-line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => {
                  const last = i === points.length - 1;
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={last ? 7 : 4} fill={last ? brand : "#fff"} stroke={last ? "#fff" : lilac} strokeWidth={last ? 2 : 1.8}/>
                      {last && <circle cx={p.x} cy={p.y} r="11" fill={brand} fillOpacity="0.18"/>}
                    </g>
                  );
                })}
              </svg>
              <div className="flex items-center justify-between mt-2 px-1">
                {points.map((p) => (
                  <span key={p.label} className="text-[9.5px]" style={{ color: ink500 }}>{p.label}</span>
                ))}
              </div>
            </div>
          </section>}

          {/* Resumo gerado por IA oculto até haver conteúdo real. */}
        </div>

        <div className="mt-8 px-5 pb-12 lg:hidden">
          <Link to={al("/cury-digital/chat")} className="flex items-center justify-center gap-2 w-full text-white text-[14px] rounded-full py-4 active:scale-[0.99] transition" style={{ background: `linear-gradient(180deg, ${brand}, #E07A2B)`, boxShadow: "0 14px 30px -10px rgba(248,138,43,0.35)" }}>
            <Chat/> Continuar conversa
          </Link>
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </EnterpriseUserLayout>
  );
};

export default InsightsIAScreen;