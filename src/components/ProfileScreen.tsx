import { Link, useLocation } from"react-router-dom";
import { ChevronLeft, Sparkles, Mail, User } from"lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useDisplayUser } from "@/hooks/use-display-user";

const serif = { fontFamily:"'Playfair Display', serif" };

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
 <path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/>
 <path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/>
 <circle cx="8" cy="10" r="1"/>
 </svg>
);
const BatteryIcon = () => (
 <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
 <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/>
 <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
 <rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/>
 </svg>
);

const Frame = ({ children, isEnterprise }: { children: React.ReactNode; isEnterprise: boolean }) => (
  <main className={`${isEnterprise ? 'w-full' : 'h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden'} font-display`}>
    <div
      className={`relative w-full ${isEnterprise ? 'max-w-4xl mx-auto py-0' : 'h-[100dvh] overflow-hidden bg-[#F7F4F2] flex flex-col'}`}
      style={{ paddingTop: isEnterprise ? 0 : "env(safe-area-inset-top)", paddingBottom: isEnterprise ? 0 : "env(safe-area-inset-bottom)" }}
    >
      {!isEnterprise && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 30% at 50% 0%, rgba(248,138,43,0.10) 0%, rgba(248,138,43,0) 70%), radial-gradient(80% 35% at 50% 100%, rgba(248,138,43,0.05) 0%, rgba(248,138,43,0) 70%)",
          }}
        />
      )}
      {children}
    </div>
  </main>
);

const Header = ({ title, back }: { title: string; back?: string }) => {
 const { pathname } = useLocation();
 const isEnterprise = pathname.startsWith('/enterprise');
 const defaultBack = isEnterprise ? "/enterprise/menu" : "/menu";
 
 return (
  <div className={`relative z-10 flex items-center px-5 pt-6 pb-1 shrink-0 ${isEnterprise ? 'lg:hidden' : ''}`}>
  <Link to={back || defaultBack} className="w-10 h-10 rounded-full bg-white/70 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition-transform">
  <ChevronLeft size={20} className="text-[#444]" />
  </Link>
  <h1 style={serif} className="flex-1 text-center text-[22px] text-[#111] tracking-tight pr-10">{title}</h1>
  </div>
 );
};

const ProfileScreen = () => {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const { name: userName, email: userEmail, avatarUrl, initial } = useDisplayUser();
  const userAvatar = avatarUrl;

  const LayoutComponent = isEnterprise ? EnterpriseUserLayout : (({ children }: { children: React.ReactNode }) => <AppUserLayout>{children}</AppUserLayout>);

  return (
  <LayoutComponent title="Meu Perfil">
  <Frame isEnterprise={isEnterprise}>
  <Header title="Perfil" />
  <div className="relative z-10 flex-1 px-5 pb-6 scrollbar-hide">
  {/* Main user card */}
  <div className="mt-3 rounded-3xl bg-white/75 backdrop-blur-sm border border-white/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] p-5 flex flex-col items-center text-center">
  <div className="relative">
  {userAvatar ? (
    <img src={userAvatar} alt={userName} className="w-[96px] h-[96px] rounded-full object-cover ring-2 ring-white shadow-[0_6px_20px_-8px_rgba(0,0,0,0.25)]" />
  ) : (
    <div className="w-[96px] h-[96px] rounded-full bg-[#0B0908] text-white flex items-center justify-center text-3xl font-bold ring-2 ring-white shadow-[0_6px_20px_-8px_rgba(0,0,0,0.25)]">
      {initial}
    </div>
  )}
  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#F88A2B] border-2 border-white flex items-center justify-center">
  <Sparkles size={13} className="text-white" />
  </div>
  </div>
  <h2 style={serif} className="text-[24px] text-[#111] mt-3 leading-tight">{userName}</h2>
  <p className="text-[12px] text-[#8A8A8A] mt-1">Sua jornada de evolução continua</p>
 </div>

 <p className="text-[10.5px] font-semibold tracking-[0.18em] text-[#B58A5A] px-2 mb-2.5 mt-7">SOBRE VOCÊ</p>
 <div className="bg-white/70 backdrop-blur-sm rounded-3xl px-4 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.08)] border border-white/60 divide-y divide-[#F0EAE3]">
  {[
  { I: User, l:"Nome", v: userName },
  { I: Mail, l:"E-mail", v: userEmail },
 ].map((r) => (
 <div key={r.l} className="flex items-center gap-3.5 py-3.5">
 <div className="w-9 h-9 rounded-xl bg-[#F6EFE8] flex items-center justify-center">
 <r.I size={16} className="text-[#F88A2B]" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[11px] text-[#8A8A8A]">{r.l}</p>
 <p className="text-[13.5px] font-semibold text-[#111] mt-0.5 truncate">{r.v}</p>
 </div>
 </div>
 ))}
 </div>

 <p className="mt-5 text-center text-[11px] text-[#999]">
 Edição de perfil e estatísticas de jornada serão liberadas em breve.
 </p>
 </div>
  </Frame>
   </LayoutComponent>
  );
};

export default ProfileScreen;
