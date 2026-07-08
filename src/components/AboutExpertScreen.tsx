import { Link } from"react-router-dom";
import { ChevronLeft, Star } from"lucide-react";
import augusto from"@/assets/augusto-cury.png";
import youtubeLogo from"@/assets/youtube.png";
import spotifyLogo from"@/assets/spotify.png";
import { AppUserLayout } from "./layouts/AppUserLayout";

const SignalIcon = () => (
 <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
 <rect x="0" y="7" width="3" height="4" rx="0.5" />
 <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
 <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
 <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
 </svg>
);
const WifiIcon = () => (
 <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-hidden="true">
 <path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z" />
 <path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z" />
 <circle cx="8" cy="10" r="1" />
 </svg>
);
const BatteryIcon = () => (
 <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
 <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5" />
 <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
 <rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
 </svg>
);

const InstagramLogo = () => (
 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
 <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="white" strokeWidth="1.8" />
 <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.8" />
 <circle cx="17.4" cy="6.6" r="1.2" fill="white" />
 </svg>
);

const YoutubeLogo = () => (
 <img src={youtubeLogo} alt="YouTube" className="w-full h-full object-contain" />
);

const FacebookLogo = () => (
 <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
 <path
 d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.6V4.2C16.4 4.1 15.5 4 14.5 4c-2.2 0-3.7 1.3-3.7 3.8v3H8v3.2h2.8V22h2.7z"
 fill="white"
 />
 </svg>
);

const GlobeLogo = () => (
 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" aria-hidden="true">
 <circle cx="12" cy="12" r="9" />
 <ellipse cx="12" cy="12" rx="4" ry="9" />
 <path d="M3 12h18" />
 </svg>
);

const BrainLeavesIllustration = () => (
 <svg width="92" height="92" viewBox="0 0 92 92" fill="none" aria-hidden="true">
 <g stroke="#F88A2B" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
 <path d="M28 38c-4 0-7 3-7 7 0 2 1 4 3 5-1 1-1 3 0 4 1 2 3 2 5 2 1 2 3 3 5 3s4-1 5-3v-22c-1-2-3-3-5-3s-4 1-5 3c-1-0-1 0-1 4z" />
 <path d="M30 44c1-1 3-1 4 0M30 50c2 1 4 1 5 0M34 38v22" />
 </g>
 <g stroke="#8FB17D" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
 <path d="M55 30c6-2 14-1 22 4-6 2-12 2-18 0" />
 <path d="M58 44c5-3 13-4 21-1-5 4-12 5-18 3" />
 <path d="M60 58c5-2 13-2 20 1-5 3-12 3-18 1" />
 <path d="M52 28c3 12 4 24 3 38" />
 </g>
 <g stroke="#F88A2B" strokeWidth="1" opacity="0.6" fill="none">
 <path d="M18 22l2 2M22 18l-2 2M82 70l-2 2M78 74l2-2" />
 </g>
 </svg>
);

const SpotifyLogo = () => (
 <img src={spotifyLogo} alt="Spotify" className="w-full h-full object-contain" />
);

const socials = [
 { label:"Instagram", icon: <InstagramLogo />, bg:"linear-gradient(135deg,#FEDA77 0%,#F58529 30%,#DD2A7B 60%,#8134AF 100%)" },
 { label:"YouTube", icon: <YoutubeLogo />, bg:"transparent" },
 { label:"Facebook", icon: <FacebookLogo />, bg:"#1877F2" },
 { label:"Spotify", icon: <SpotifyLogo />, bg:"transparent" },
 { label:"Site oficial", icon: <GlobeLogo />, bg:"#FFFFFF" },
];

const AboutExpertScreen = () => {
 return (
   <AppUserLayout>
 <main className="min-h-screen w-full flex items-center justify-center bg-[#1a1a1a] py-6 px-4 font-display">
 <div className="relative w-[375px] h-[812px] max-h-[100dvh] rounded-[44px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/40 bg-[#F7F4F2] flex flex-col">
 {/* Status bar */}
 {/* Header */}
 <div className="relative flex items-center justify-center px-5 pt-3 pb-2 shrink-0">
 <Link to="/perfil" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#111]" aria-label="Voltar">
 <ChevronLeft size={26} strokeWidth={2} />
 </Link>
 <h1 className="text-[18px] font-semibold text-[#111]">Sobre o Expert</h1>
 </div>

 <div className="flex-1 px-5 pt-4 pb-6">
 {/* Profile block */}
 <div className="flex items-start gap-4">
 <div className="w-[118px] h-[118px] rounded-full bg-[#F6EFE8] flex items-center justify-center shrink-0 overflow-hidden">
 <img src={augusto} alt="Augusto Cury" className="w-full h-full object-cover object-top" loading="lazy" width={400} height={400} />
 </div>
 <div className="flex-1 pt-1 min-w-0">
 <h2 className="text-[22px] font-bold text-[#111] leading-tight">Augusto Cury</h2>
 <div className="w-9 h-[3px] rounded-full bg-[#F88A2B] mt-1.5" />
 <p className="text-[12.5px] text-[#666] leading-[17px] mt-2.5">Psiquiatra, escritor<br />e pesquisador</p>
 <div className="mt-3 inline-flex items-center gap-1.5 bg-white rounded-full pl-2 pr-3 py-1.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)]">
 <Star size={14} color="#F88A2B" fill="#F88A2B" strokeWidth={1.5} />
 <span className="text-[10.5px] font-medium text-[#444] leading-[13px]">Mais de 40 milhões<br />de livros vendidos</span>
 </div>
 </div>
 </div>

 {/* Biography */}
 <p className="text-[12.5px] leading-[19px] text-[#444] mt-5">
 Augusto Cury é um dos psiquiatras mais lidos do mundo e referência internacional no estudo da mente humana, inteligência emocional e desenvolvimento da autoestima.
 </p>
 <p className="text-[12.5px] leading-[19px] text-[#444] mt-2.5">
 Sua missão é ajudar pessoas a viverem melhor, com equilíbrio emocional, clareza mental e sabedoria para lidar com os desafios da vida moderna.
 </p>

 {/* Sua jornada card */}
 <div className="relative mt-5 bg-white rounded-[22px] p-4 pr-2 shadow-[0_6px_20px_-12px_rgba(0,0,0,0.12)] overflow-hidden">
 <div className="flex items-center gap-2.5">
 <div className="w-9 h-9 rounded-full bg-[#F6EFE8] flex items-center justify-center">
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F88A2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>
 </div>
 <h3 className="text-[15px] font-bold text-[#111]">Sua jornada</h3>
 </div>

 <div className="flex">
 <ul className="flex-1 mt-3 space-y-2 max-w-[210px]">
 {[
"Médico psiquiatra e psicoterapeuta",
"Mais de 40 anos de estudos sobre a mente humana",
"Autor de mais de 40 milhões de livros vendidos em mais de 70 países",
"Criador da Teoria da Inteligência Multifocal",
 ].map((item) => (
 <li key={item} className="flex gap-2 text-[11.5px] leading-[16px] text-[#444]">
 <span className="w-1.5 h-1.5 rounded-full bg-[#F88A2B] mt-1.5 shrink-0" />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 <div className="absolute right-2 bottom-2 opacity-90">
 <BrainLeavesIllustration />
 </div>
 </div>
 </div>

 {/* Quote */}
 <div className="mt-5 bg-[#F6EFE8] rounded-[22px] p-4">
 <div className="text-[#F88A2B] text-[34px] leading-none font-serif font-bold">“</div>
 <p className="text-[12.5px] leading-[19px] text-[#333] italic font-medium -mt-2">
 A emoção precisa ser educada e a razão iluminada. Esse é o caminho para o equilíbrio e para uma vida plena.
 </p>
 <p className="mt-2.5 text-[12.5px] font-semibold text-[#F88A2B]">– Augusto Cury</p>
 </div>

 {/* Socials */}
 <h3 className="mt-6 text-[15px] font-bold text-[#111]">Acompanhe Augusto Cury</h3>
 <p className="mt-1 text-[12px] leading-[17px] text-[#666]">
 Siga nas redes sociais e receba conteúdos diários para sua mente e emoção.
 </p>

 <div className="mt-4 flex items-start justify-between">
 {socials.map((s) => (
 <button key={s.label} className="flex flex-col items-center gap-1.5 w-[58px]">
 <div
 className="w-[50px] h-[50px] rounded-full flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
 style={{ background: s.bg }}
 >
 {s.icon}
 </div>
 <span className="text-[10.5px] text-[#444] text-center leading-tight">{s.label}</span>
 </button>
 ))}
 </div>
 </div>

 </div>
 </main>
   </AppUserLayout>
 );
};

export default AboutExpertScreen;
