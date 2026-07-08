import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Check, Brain, Cloud, Activity, Mountain, Sun, Lock } from "lucide-react";
import { Phone } from "./settings/Phone";
import heroImg from "@/assets/trilha/diagnostico-hero.jpg";
import { AppUserLayout } from "./layouts/AppUserLayout";

const serif = { fontFamily: "'Playfair Display', serif" };

type Opt = { id: string; label: string; Icon: any; iconBg: string; iconColor: string };

const options: Opt[] = [
  { id: "acel", label: "Pensamentos acelerados", Icon: Brain, iconBg: "#FFE7D2", iconColor: "#F88A2B" },
  { id: "cans", label: "Cansaço emocional", Icon: Cloud, iconBg: "#EAE4F4", iconColor: "#9B8AC9" },
  { id: "ans", label: "Ansiedade constante", Icon: Activity, iconBg: "#FFE0CC", iconColor: "#F88A2B" },
  { id: "mot", label: "Falta de motivação", Icon: Mountain, iconBg: "#E3ECDD", iconColor: "#8FB17D" },
  { id: "bem", label: "Estou bem, mas quero evoluir", Icon: Sun, iconBg: "#EAE4F4", iconColor: "#9B8AC9" },
];

export default function DiagnosticoScreen() {
  const [selected, setSelected] = useState<string>("acel");
  const navigate = useNavigate();
  const progress = (1 / 6) * 100;

  return (
    <AppUserLayout>
    <Phone>
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(60% 40% at 80% 20%, rgba(248,138,43,0.18) 0%, rgba(248,138,43,0) 70%), radial-gradient(50% 35% at 15% 85%, rgba(255,200,150,0.12) 0%, transparent 70%)"
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
        <Link to="/trilha" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-[#444]" />
        </Link>
        <div className="flex flex-col items-center">
          <h1 style={serif} className="text-[18px] text-[#111] tracking-tight leading-none">Diagnóstico Inicial</h1>
          <span className="text-[9.5px] font-semibold tracking-[0.22em] text-[#F88A2B] mt-1">MARCO ZERO</span>
        </div>
        <button className="h-10 px-3 rounded-full bg-white/80 backdrop-blur border border-white flex items-center gap-1 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition-transform">
          <span className="text-[12px] text-[#444] font-medium">Sair</span>
          <LogOut size={13} className="text-[#444]" />
        </button>
      </div>

      {/* Progress */}
      <div className="relative z-10 px-12 pt-1 pb-1 shrink-0">
        <div className="text-center text-[11px] text-[#666] font-medium mb-1.5">1 de 6</div>
        <div className="h-[5px] rounded-full bg-[#E8E2DA] overflow-hidden relative">
          <div
            className="h-full rounded-full relative"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #FFB778 0%, #F88A2B 100%)",
              boxShadow: "0 0 10px rgba(248,138,43,0.5)",
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#F88A2B] shadow-[0_0_8px_rgba(248,138,43,0.6)]" />
          </div>
        </div>
      </div>

      {/* Scroll content */}
      <div className="relative z-10 flex-1 overflow-x-hidden">
        {/* Hero */}
        <div className="relative px-6 pt-5 pb-2">
          <div className="relative">
            <h2 style={serif} className="text-[40px] leading-[1.05] text-[#111] tracking-tight">
              Vamos entender
              <br />
              <em className="not-italic font-normal" style={{ ...serif, fontStyle: "italic", color: "#F88A2B" }}>seu momento.</em>
            </h2>
            <p className="mt-3 text-[13px] leading-[1.55] text-[#666] max-w-[55%]">
              Não existem respostas certas.<br />Apenas honestidade com você.
            </p>
            <img
              src={heroImg}
              alt=""
              width={1024}
              height={768}
              className="absolute -right-6 -top-2 w-[58%] h-[180px] object-cover object-left opacity-90 pointer-events-none"
              style={{
                maskImage: "linear-gradient(to left, black 40%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to left, black 40%, transparent 100%)",
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="px-6 pt-4 pb-3 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_-4px_rgba(248,138,43,0.25)] flex items-center justify-center mb-3 animate-[breathing_4s_ease-in-out_infinite]">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#F88A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              <circle cx="12" cy="12" r="2" fill="#F88A2B" />
            </svg>
          </div>
          <h3 style={serif} className="text-[20px] leading-[1.25] text-[#111] tracking-tight max-w-[280px]">
            Como sua mente tem se sentido nos últimos dias?
          </h3>
          <p className="mt-2 text-[11.5px] text-[#F88A2B] font-medium">Escolha a opção que mais representa você agora.</p>
        </div>

        {/* Options */}
        <div className="px-5 pt-2 pb-4 space-y-2.5">
          {options.map((o) => {
            const active = selected === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setSelected(o.id)}
                className="w-full text-left transition-all duration-200 active:scale-[0.99]"
              >
                <div
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-[20px] bg-white"
                  style={{
                    boxShadow: active
                      ? "0 0 0 1.5px #F88A2B, 0 8px 24px -8px rgba(248,138,43,0.35)"
                      : "0 2px 12px -6px rgba(17,17,17,0.08), inset 0 0 0 1px rgba(17,17,17,0.05)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: o.iconBg }}
                  >
                    <o.Icon size={18} style={{ color: o.iconColor }} strokeWidth={1.8} />
                  </div>
                  <span className="flex-1 text-[14px] text-[#111] font-medium">{o.label}</span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                    style={{
                      background: active ? "#F88A2B" : "transparent",
                      border: active ? "none" : "1.5px solid #D9D2C8",
                    }}
                  >
                    {active && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Reflection */}
          <div
            className="mt-4 relative px-4 py-3.5 rounded-[18px] overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FFF5EC 0%, #F6EFE8 100%)",
              border: "1px solid rgba(248,138,43,0.12)",
            }}
          >
            <div className="flex gap-2.5">
              <span style={serif} className="text-[28px] leading-none text-[#F88A2B]">"</span>
              <p style={serif} className="text-[12.5px] leading-[1.5] text-[#444] italic pt-1">
                Reconhecer o que sentimos é<br />o primeiro passo da transformação.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pt-2 pb-3">
          <button
            onClick={() => navigate("/trilha")}
            className="w-full h-[54px] rounded-full flex items-center justify-center gap-2 text-white text-[15px] font-semibold tracking-tight active:scale-[0.99] transition-transform"
            style={{
              background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
              boxShadow: "0 10px 28px -8px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            Continuar
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <Lock size={11} className="text-[#999]" />
            <span className="text-[10.5px] text-[#999]">Suas respostas são confidenciais e seguras</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 14px -4px rgba(248,138,43,0.25); }
          50% { transform: scale(1.05); box-shadow: 0 6px 20px -4px rgba(248,138,43,0.4); }
        }
      `}</style>
    </Phone>
    </AppUserLayout>
  );
}
