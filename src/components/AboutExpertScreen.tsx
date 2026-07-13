import { Link } from"react-router-dom";
import { ChevronLeft, User } from"lucide-react";
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

 <div className="flex-1 px-5 pt-4 pb-6 flex flex-col items-center justify-center text-center">
 <div className="w-20 h-20 rounded-full bg-[#F6EFE8] flex items-center justify-center mb-4">
 <User size={32} className="text-[#F88A2B]" />
 </div>
 <h2 className="text-[18px] font-bold text-[#111]">Perfil do expert em breve</h2>
 <p className="mt-2 text-[12.5px] leading-[19px] text-[#666] max-w-[260px]">
 As informações do especialista responsável pelo conteúdo serão exibidas aqui assim que forem configuradas.
 </p>
 </div>

 </div>
 </main>
   </AppUserLayout>
 );
};

export default AboutExpertScreen;
