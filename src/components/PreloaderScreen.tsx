import abstractArt from"@/assets/login-abstract.webp";

const PreloaderScreen = () => {
 return (
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden bg-[#F7F4F2] flex flex-col items-center justify-center animate-fade-in"
 style={{ paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 aria-label="Carregando Meu Caminho"
 >
 {/* Atmospheric warm glow */}
 <div
 className="pointer-events-none absolute inset-0"
 style={{
 background:
"radial-gradient(60% 40% at 50% 35%, rgba(248,138,43,0.12) 0%, rgba(248,138,43,0) 70%), radial-gradient(70% 40% at 50% 100%, rgba(248,138,43,0.06) 0%, rgba(248,138,43,0) 70%)",
 }}
 />
 {/* Soft organic lines */}
 <svg className="pointer-events-none absolute top-0 left-0 w-[220px] h-[180px] opacity-50" viewBox="0 0 220 180" fill="none" aria-hidden="true">
 {[0,1,2,3,4].map(i => (
 <path key={i} d={`M ${-30 - i*4} ${20 + i*10} Q ${80} ${110 - i*8}, ${240 + i*4} ${30 + i*8}`} stroke="#F88A2B" strokeOpacity={0.18 - i*0.025} strokeWidth="1" fill="none" />
 ))}
 </svg>
 <svg className="pointer-events-none absolute bottom-0 right-0 w-[240px] h-[170px] opacity-50" viewBox="0 0 240 170" fill="none" aria-hidden="true">
 {[0,1,2,3,4].map(i => (
 <path key={i} d={`M ${-20 + i*8} 170 Q ${110} ${70 + i*8}, ${260 - i*6} ${30 + i*8}`} stroke="#F88A2B" strokeOpacity={0.18 - i*0.025} strokeWidth="1" fill="none" />
 ))}
 </svg>

 {/* Center content */}
 <div className="relative z-10 flex flex-col items-center px-8 -mt-6">
 {/* Illustration with breathing */}
 <div className="relative" style={{ animation:"preloader-breath 4.5s ease-in-out infinite" }}>
 <div
 className="absolute inset-0 rounded-full blur-3xl opacity-60"
 style={{
 background:"radial-gradient(circle, rgba(248,138,43,0.40), transparent 65%)",
 animation:"preloader-glow 4.5s ease-in-out infinite",
 }}
 />
           <div className="relative w-[260px] h-[200px]">
             {/* Ghost outline */}
             <div
               className="absolute inset-0"
               style={{
                 WebkitMaskImage: `url(${abstractArt})`,
                 maskImage: `url(${abstractArt})`,
                 WebkitMaskRepeat: "no-repeat",
                 maskRepeat: "no-repeat",
                 WebkitMaskPosition: "center",
                 maskPosition: "center",
                 WebkitMaskSize: "contain",
                 maskSize: "contain",
                 background: "#F88A2B",
                 opacity: 0.18,
               }}
               aria-hidden="true"
             />
             {/* Writing fill */}
             <div
               className="absolute inset-0"
               style={{
                 WebkitMaskImage: `url(${abstractArt})`,
                 maskImage: `url(${abstractArt})`,
                 WebkitMaskRepeat: "no-repeat",
                 maskRepeat: "no-repeat",
                 WebkitMaskPosition: "center",
                 maskPosition: "center",
                 WebkitMaskSize: "contain",
                 maskSize: "contain",
                 background: "linear-gradient(90deg, #F88A2B 0%, #FFB778 60%, #F88A2B 100%)",
                 animation: "preloader-write 2.6s ease-in-out infinite",
               }}
               aria-hidden="true"
             />
             {/* Pen tip glow */}
             <div
               className="absolute top-0 bottom-0 w-[18px] rounded-full pointer-events-none"
               style={{
                 background: "radial-gradient(circle, rgba(255,221,168,0.9), rgba(248,138,43,0) 70%)",
                 animation: "preloader-pen 2.6s ease-in-out infinite",
                 filter: "blur(2px)",
               }}
               aria-hidden="true"
             />
           </div>
 </div>

 {/* Brand */}
 <h1
 className="mt-8 text-[34px] leading-none tracking-tight text-[#1a1a1a] font-light"
 style={{ animation:"fade-in 1.2s ease-out 0.2s both" }}
 >
 Meu <span className="font-semibold">Caminho</span>
 </h1>
 <div
 className="mt-3 flex items-center gap-3"
 style={{ animation:"fade-in 1.2s ease-out 0.4s both" }}
 >
 <span className="h-px w-6 bg-[#F88A2B]/60" />
 <p className="text-[12px] tracking-[0.32em] uppercase text-[#444] font-medium">
 Saúde emocional
 </p>
 <span className="h-px w-6 bg-[#F88A2B]/60" />
 </div>

 {/* Spark */}
 <svg
 width="12" height="12" viewBox="0 0 10 10"
 className="mt-7"
 style={{ animation:"preloader-spark 3s ease-in-out infinite" }}
 aria-hidden="true"
 >
 <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#F88A2B" />
 </svg>

 {/* Tagline */}
 <p
 className="mt-5 text-[14.5px] text-[#444] font-medium tracking-tight"
 style={{ animation:"fade-in 1.2s ease-out 0.6s both" }}
 >
 Você é o autor da sua história.
 </p>

 {/* Loading bar */}
 <div
 className="mt-10 relative h-[3px] w-[200px] rounded-full overflow-hidden bg-[#F88A2B]/15"
 style={{ animation:"fade-in 1.2s ease-out 0.8s both" }}
 >
 <div
 className="absolute top-0 left-0 h-full w-1/2 rounded-full"
 style={{
 background:"linear-gradient(90deg, transparent 0%, #FFB778 30%, #F88A2B 50%, #FFB778 70%, transparent 100%)",
 boxShadow:"0 0 10px rgba(248,138,43,0.5)",
 animation:"preloader-bar 2.2s ease-in-out infinite",
 }}
 />
 </div>
 </div>
 </div>

 <style>{`
 @keyframes preloader-breath {
 0%, 100% { transform: scale(1); opacity: 0.95; }
 50% { transform: scale(1.035); opacity: 1; }
 }
 @keyframes preloader-glow {
 0%, 100% { opacity: 0.45; transform: scale(1); }
 50% { opacity: 0.7; transform: scale(1.08); }
 }
 @keyframes preloader-spark {
 0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
 50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
 }
        @keyframes preloader-bar {
 0% { transform: translateX(-100%); }
 100% { transform: translateX(300%); }
 }
        @keyframes preloader-write {
 0% { clip-path: inset(0 100% 0 0); }
 55% { clip-path: inset(0 0 0 0); }
 80% { clip-path: inset(0 0 0 0); opacity: 1; }
 100% { clip-path: inset(0 0 0 0); opacity: 0; }
 }
 @keyframes preloader-pen {
 0% { left: -2%; opacity: 0; }
 10% { opacity: 1; }
 55% { left: 98%; opacity: 1; }
 70%, 100% { left: 98%; opacity: 0; }
 }
 `}</style>
 </main>
 );
};

export default PreloaderScreen;
