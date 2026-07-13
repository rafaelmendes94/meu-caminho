import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Users, Lock, ShieldCheck, Check } from "lucide-react";
import logoMark from "@/assets/login-abstract.webp";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const BG = "#F7F4F2";
const ORANGE = "#F88A2B";

const Item = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3 text-[15px] leading-relaxed text-[#222]">
    <span
      className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
      style={{ background: "rgba(248,138,43,0.12)" }}
    >
      <Check className="h-3 w-3" style={{ color: ORANGE }} strokeWidth={3} />
    </span>
    <span>{children}</span>
  </li>
);

const Card = ({
  icon,
  title,
  children,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent?: React.ReactNode;
}) => (
  <div
    className="relative overflow-hidden rounded-[26px] border border-white/60 bg-white/70 p-6 shadow-[0_10px_40px_-20px_rgba(17,17,17,0.18)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-25px_rgba(248,138,43,0.35)]"
  >
    {accent}
    <div className="mb-4 flex items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl"
        style={{ background: "rgba(248,138,43,0.12)", color: ORANGE }}
      >
        {icon}
      </div>
      <h3
        className="text-[22px] leading-tight text-[#111]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h3>
    </div>
    <ul className="space-y-2.5 relative z-10">{children}</ul>
  </div>
);

export default function EnterpriseWelcomeScreen() {
  const navigate = useNavigate();

  return (
    <EnterpriseUserLayout title="Boas-vindas ao Enterprise">
    <div className="w-full lg:bg-transparent overflow-hidden">
      <div className="relative w-full flex flex-col">
        {/* Atmospheric glow - hidden on desktop as per user request */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden" aria-hidden="true">
          <span
            className="absolute -top-24 right-[-60px] w-[280px] h-[280px] rounded-full opacity-50"
            style={{ background: "radial-gradient(circle, rgba(248,138,43,0.18) 0%, rgba(248,138,43,0) 65%)" }}
          />
          <span
            className="absolute top-[20%] -left-20 w-[400px] h-[400px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, rgba(143,177,125,0.10) 0%, rgba(143,177,125,0) 65%)" }}
          />
        </div>

        {/* Content */}
        <div className="relative flex-1 px-5 pt-4 lg:pt-0 pb-10">
          <div className="mx-auto max-w-6xl">
            {/* Header - Only visible on mobile as layout handles desktop header */}
            <header className="mb-8 lg:hidden">
              <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden shrink-0"
                  >
                    <img src={logoMark} alt="Meu Caminho" className="h-8 w-8 object-contain" style={{ mixBlendMode: "multiply" }} draggable={false} />
                  </div>
                  <div className="flex flex-col leading-none">
                    <div
                      className="text-[18px] font-semibold text-[#111] whitespace-nowrap"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Meu Caminho
                    </div>
                    <div className="text-[8px] font-bold tracking-[0.2em] text-[#F88A2B] whitespace-nowrap uppercase mt-0.5">ENTERPRISE</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-3 py-2 text-[11px] font-medium text-[#666] shadow-sm backdrop-blur-sm ring-1 ring-black/5">
                  <Building2 className="h-3.5 w-3.5" style={{ color: ORANGE }} />
                  <span className="leading-tight">
                    Benefício da<br />sua empresa
                  </span>
                </div>
              </div>
            </header>

            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16 lg:mt-10">
              <div className="flex-1">
                {/* Hero */}
                <section className="mb-10 text-center lg:text-left animate-fade-in">
                  <h1
                    className="text-[32px] lg:text-[48px] leading-[1.1] text-[#111]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}
                  >
                    Seu caminho é pessoal.{" "}
                    <span style={{ color: ORANGE }} className="lg:block">
                      A empresa acompanha apenas o coletivo.
                    </span>
                  </h1>
                  <div className="my-6 flex items-center justify-center lg:justify-start gap-2">
                    <span className="h-px w-10" style={{ background: ORANGE, opacity: 0.3 }} />
                    <span className="h-1.5 w-1.5 rotate-45" style={{ background: ORANGE }} />
                    <span className="h-px w-10" style={{ background: ORANGE, opacity: 0.3 }} />
                  </div>
                  <p className="text-[15px] lg:text-[18px] leading-relaxed text-[#666] max-w-xl mx-auto lg:mx-0">
                    Você recebeu acesso a uma jornada de evolução emocional com foco em saúde mental. Suas respostas individuais, conversas e reflexões são privadas.
                  </p>
                </section>

                {/* CTAs - Hidden on mobile, shown on desktop here, vice versa below */}
                <div className="hidden lg:flex flex-col gap-4 max-w-sm">
                  <button
                    onClick={() => navigate("/enterprise")}
                    className="group relative flex w-full h-[58px] items-center justify-center rounded-full px-6 text-[16px] font-bold text-[#111] transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.985]"
                    style={{ 
                      background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
                      boxShadow: "0 14px 30px -10px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.08)"
                    }}
                  >
                    <span>Começar minha jornada</span>
                    <div className="absolute right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[#111]">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/enterprise/privacy")}
                    className="group flex w-full h-[58px] items-center justify-center gap-3 rounded-full border border-white/60 bg-white/70 text-[15px] font-bold text-[#111] backdrop-blur-sm transition-all duration-300 hover:bg-white ring-1 ring-black/5 active:scale-[0.985]"
                  >
                    <ShieldCheck className="h-4 w-4" style={{ color: ORANGE }} />
                    <span>Entender privacidade</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-[#999]" />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                {/* Cards */}
                <div className="space-y-5">
                  <Card
                    icon={<Users className="h-5 w-5" />}
                    title="O que sua empresa vê"
                    accent={
                      <div
                        className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full opacity-20 blur-2xl"
                        style={{ background: ORANGE }}
                      />
                    }
                  >
                    <Item>Adesão geral ao check-in</Item>
                    <Item>Tendências emocionais do time</Item>
                    <Item>Temas recorrentes de forma anônima</Item>
                    <Item>Alertas por área com volume mínimo</Item>
                  </Card>

                  <Card
                    icon={<Lock className="h-5 w-5" />}
                    title="O que continua só seu"
                    accent={
                      <div
                        className="pointer-events-none absolute -right-10 -bottom-10 h-44 w-44 rounded-full opacity-10 blur-2xl"
                        style={{ background: ORANGE }}
                      />
                    }
                  >
                    <Item>Suas respostas individuais</Item>
                    <Item>Suas conversas com a IA</Item>
                    <Item>Seu resultado emocional pessoal</Item>
                    <Item>Sua trilha e evolução privada</Item>
                  </Card>
                </div>

                {/* CTAs - Mobile version */}
                <div className="mt-10 space-y-4 lg:hidden">
                  <button
                    onClick={() => navigate("/enterprise")}
                    className="group relative flex w-full h-[58px] items-center justify-center rounded-full px-6 text-[16px] font-bold text-[#111] transition-all duration-300 active:scale-[0.985]"
                    style={{ 
                      background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
                      boxShadow: "0 14px 30px -10px rgba(248,138,43,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.08)"
                    }}
                  >
                    <span>Começar minha jornada</span>
                    <div className="absolute right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[#111]">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/enterprise/privacy")}
                    className="group flex w-full h-[58px] items-center justify-center gap-3 rounded-full border border-white/60 bg-white/70 text-[15px] font-bold text-[#111] backdrop-blur-sm transition-all duration-300 ring-1 ring-black/5 active:scale-[0.985]"
                  >
                    <ShieldCheck className="h-4 w-4" style={{ color: ORANGE }} />
                    <span>Entender privacidade</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-[#999]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 flex items-center justify-center gap-3 text-center">
              <span className="h-1 w-1 rounded-full" style={{ background: ORANGE }} />
              <p className="text-[12px] font-medium text-[#999]">
                Criado para cuidar do time sem expor o indivíduo.
              </p>
              <span className="h-1 w-1 rounded-full" style={{ background: ORANGE }} />
            </footer>
          </div>
        </div>
      </div>
    </div>
    </EnterpriseUserLayout>
  );
}
