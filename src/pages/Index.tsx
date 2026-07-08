import { useNavigate } from "react-router-dom";
import abstractArt from "@/assets/login-abstract.png";
import { useIsDesktop } from "@/hooks/use-desktop";

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-4.9c-1.9 1.4-4.3 2.4-6.9 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6 4.9c-.4.4 6.5-4.7 6.5-14.5 0-1.2-.1-2.3-.4-3.5z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 384 512" fill="#111" aria-hidden="true">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256.6 105.7c30.2-35.8 27.5-68.4 26.6-80.1-26.7 1.5-57.6 18.1-75.2 38.6-19.4 22-30.8 49.2-28.4 79.5 28.9 2.2 55.3-12.7 77-37.9z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const ChevronRight = ({ color = "#C9C2BB" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7FA06E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
    <path d="M9.5 12.5l2 2 3.5-4" />
  </svg>
);

const SparkDivider = () => (
  <div className="flex items-center justify-center gap-3">
    <span className="h-px w-14 bg-[#F3D7BE]" />
    <svg width="11" height="11" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#F88A2B" />
    </svg>
    <span className="h-px w-14 bg-[#F3D7BE]" />
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  
  const fakeAuth = (provider: string) => {
    console.log(`[mock] login with ${provider}`);
    try { localStorage.setItem("mc_authed", "1"); } catch {}
    
    if (provider === "Google") {
      navigate("/welcome");
    } else if (provider === "Apple") {
      navigate("/enterprise/welcome");
    } else if (provider === "E-mail") {
      navigate("/enterprise/rh");
    } else {
      navigate("/preloader");
    }
  };

  const LoginButtons = () => (
    <div className="mt-5 w-full flex flex-col gap-3">
      <button
        onClick={() => fakeAuth("Google")}
        className="relative h-[58px] w-full rounded-full bg-white border border-[#EFEAE5] flex items-center justify-center text-[15.5px] font-semibold text-[#111] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.10)] transition-all duration-300 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.16)] active:scale-[0.98]"
      >
        <span className="absolute left-6 flex items-center"><GoogleIcon /></span>
        Continuar com Google
        <span className="absolute right-6 flex items-center"><ChevronRight /></span>
      </button>

      <button
        onClick={() => fakeAuth("Apple")}
        className="relative h-[58px] w-full rounded-full bg-white border border-[#EFEAE5] flex items-center justify-center text-[15.5px] font-semibold text-[#111] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.10)] transition-all duration-300 hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.16)] active:scale-[0.98]"
      >
        <span className="absolute left-6 flex items-center"><AppleIcon /></span>
        Continuar com Apple
        <span className="absolute right-6 flex items-center"><ChevronRight /></span>
      </button>

      <div className="flex items-center gap-3 px-1 -my-0.5">
        <div className="h-px flex-1 bg-[#1a1a1a]/10" />
        <span className="text-[12px] text-[#999]">ou</span>
        <div className="h-px flex-1 bg-[#1a1a1a]/10" />
      </div>

      <button
        onClick={() => fakeAuth("E-mail")}
        className="relative h-[60px] w-full rounded-full flex items-center justify-center text-[16px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
        style={{
          background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.08) inset, 0 14px 30px -12px rgba(248,138,43,0.55), 0 6px 14px -2px rgba(248,138,43,0.30)",
        }}
      >
        <span className="absolute left-6 flex items-center"><MailIcon /></span>
        Entrar com e-mail
        <span className="absolute right-6 flex items-center"><ChevronRight color="rgba(255,255,255,0.9)" /></span>
      </button>
    </div>
  );

  if (isDesktop) {
    return (
      <main className="h-screen w-full flex bg-[#F7F4F2] font-display overflow-hidden">
        {/* Left Side: Illustration and High Impact Text */}
        <section className="hidden lg:flex flex-1 flex-col justify-center items-center bg-white relative overflow-hidden border-r border-[#EFEAE5]">
          {/* Atmospheric warm glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(80% 50% at 50% 50%, rgba(248,138,43,0.08) 0%, rgba(248,138,43,0) 70%)",
            }}
          />
          
          <div className="relative z-10 max-w-xl px-12 text-center">
            <div className="mb-10 flex justify-center">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-[80px] opacity-30"
                  style={{ background: "radial-gradient(circle, #F88A2B, transparent 70%)" }}
                />
                <img
                  src={abstractArt}
                  alt="Meu Caminho Illustration"
                  className="relative w-[320px] h-[240px] object-contain select-none"
                  draggable={false}
                />
              </div>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-black text-[#111] leading-tight tracking-tight mb-6">
              Você é o <span className="text-[#F88A2B]">autor</span> da sua história.
            </h1>
            
            <p className="text-lg text-[#666] leading-relaxed font-medium">
              Uma jornada guiada para evoluir sua mente, emoções e relações. Junte-se a milhares de pessoas transformando suas vidas.
            </p>
          </div>

          {/* Abstract lines for visual depth */}
          <svg className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[300px] opacity-30" viewBox="0 0 220 140" fill="none">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <path key={i} d={`M ${-20 + i * 15} 140 Q ${110} ${60 + i * 10}, ${240 - i * 8} ${20 + i * 10}`} stroke="#F88A2B" strokeWidth="0.8" fill="none" />
            ))}
          </svg>
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full lg:w-[540px] xl:w-[600px] flex flex-col justify-center px-12 xl:px-20 bg-[#F7F4F2] relative">
          <div className="max-w-[400px] mx-auto w-full">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-[#111] mb-3">Bem-vindo de volta</h2>
              <p className="text-[#666] font-medium">Escolha como deseja acessar sua conta.</p>
            </div>

            <LoginButtons />

            <div className="mt-8">
              <SparkDivider />
            </div>

            <div className="mt-8 flex items-start gap-4 p-5 bg-white border border-[#EFEAE5] rounded-3xl shadow-sm">
              <div className="mt-1 bg-[#F88A2B]/10 p-2 rounded-xl">
                <ShieldIcon />
              </div>
              <div className="text-[14px] leading-relaxed">
                <p className="font-bold text-[#111]">Seus dados estão protegidos.</p>
                <p className="text-[#666]">Privacidade e segurança são nossa prioridade em cada passo da sua jornada.</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-[15px] text-[#666]">
                Ainda não tem uma conta?
              </p>
              <button 
                onClick={() => fakeAuth("Criar conta")} 
                className="mt-2 text-[#F88A2B] font-bold text-lg hover:underline inline-flex items-center gap-1"
              >
                Criar conta <ChevronRight color="#F88A2B" />
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Mobile version (cleaner, smaller logo)
  return (
    <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
      <div
        className="relative w-full h-full max-w-md overflow-hidden bg-[#F7F4F2] flex flex-col animate-fade-in"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Tela de entrada Meu Caminho"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(60% 35% at 50% 18%, rgba(248,138,43,0.08) 0%, rgba(248,138,43,0) 70%), radial-gradient(80% 45% at 50% 100%, rgba(248,138,43,0.04) 0%, rgba(248,138,43,0) 70%)",
          }}
        />
        
        <div className="relative z-10 flex-1 flex flex-col items-center px-7 min-h-0 pt-8">
          <div className="mt-3 flex justify-center w-full" style={{ animation: "fade-in 1.2s ease-out" }}>
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-30"
                style={{ background: "radial-gradient(circle, rgba(248,138,43,0.30), transparent 65%)" }}
              />
              <img
                src={abstractArt}
                alt=""
                className="relative w-[180px] h-[135px] object-contain select-none"
                style={{ mixBlendMode: "multiply" }}
                draggable={false}
              />
            </div>
          </div>

          <h1 className="mt-3 text-center text-[32px] leading-[1.05] font-black tracking-[-0.03em] text-[#111]">
            Você é o <span className="text-[#F88A2B]">autor</span><br/>da sua história.
          </h1>

          <p className="mt-3 text-center text-[14px] leading-[1.55] font-medium text-[#666] max-w-[280px]">
            Uma jornada guiada para evoluir sua<br/>mente, emoções e relações.
          </p>

          <div className="mt-4">
            <SparkDivider />
          </div>

          <LoginButtons />

          <div className="mt-5 flex items-center justify-center gap-3 text-center">
            <ShieldIcon />
            <div className="text-[12px] leading-[16px] text-left">
              <p className="font-semibold text-[#111]">Seus dados estão protegidos.</p>
              <p className="text-[#666]">Privacidade e segurança são nossa prioridade.</p>
            </div>
          </div>

          <div className="mt-auto pt-4 pb-6 text-center">
            <p className="text-[14px] text-[#666]">
              Ainda não tem uma conta?
            </p>
            <button onClick={() => fakeAuth("Criar conta")} className="mt-1 text-[#F88A2B] font-semibold inline-flex items-center gap-0.5">
              Criar conta <ChevronRight color="#F88A2B" />
            </button>
          </div>
        </div>

        <div className="relative z-10 flex justify-center pb-4 shrink-0 lg:hidden">
          <div className="w-[120px] h-[5px] rounded-full bg-black/90" />
        </div>
      </div>
    </main>
  );
};

export default Index;