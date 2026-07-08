import { Link, useLocation, useNavigate } from"react-router-dom";
import { ArrowLeft, MoreVertical, ShieldCheck, Brain, Wind, Leaf, Sun, Send, Check } from"lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

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

const HomeIcon = ({ color }: { color: string }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/></svg>);
const TestsNavIcon = ({ color }: { color: string }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4v-1h6v1M9 10l1.5 1.5L13 9M9 15l1.5 1.5L13 14"/></svg>);
const BookIcon = ({ color }: { color: string }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 0 2 2h13"/></svg>);
const CartIcon = ({ color }: { color: string }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.3a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L21 8H6"/></svg>);
const ProfileIcon = ({ color }: { color: string }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>);

const navItems = [
 { label:"Home", Icon: HomeIcon, to:"/" },
 { label:"Trilha", Icon: TestsNavIcon, to:"/trilha" },
 { label:"Feed", Icon: BookIcon, to:"/feed" },
 { label:"Biblioteca", Icon: CartIcon, to:"/biblioteca" },
 { label:"Menu", Icon: ProfileIcon, to:"/menu" },
];

const BottomNav = () => {
 const { pathname } = useLocation();
 return (
 <nav className="bg-white/95 border-t border-[#EAEAEA] px-2 pt-2 pb-1">
 <div className="grid grid-cols-5">
 {navItems.map(({ label, Icon, to }) => {
 const active = pathname === to || (to ==="/perfil" && pathname.startsWith("/chat"));
 const color = active ?"#F88A2B" :"#6F6F6F";
 return (
 <Link key={label} to={to} className="flex flex-col items-center gap-1 py-1">
 <Icon color={color} />
 <span className="text-[11px] font-medium" style={{ color }}>{label}</span>
 </Link>
 );
 })}
 </div>
 <div className="flex justify-center pt-1.5 pb-1">
 <div className="w-[120px] h-[5px] rounded-full bg-black" />
 </div>
 </nav>
 );
};

const AIBubble = ({ children, time }: { children: React.ReactNode; time: string }) => (
 <div className="flex items-start gap-2 max-w-[82%]">
 <div className="w-8 h-8 rounded-full bg-[#FFE7D1] flex items-center justify-center shrink-0 mt-1">
 <Brain size={16} color="#F88A2B" strokeWidth={1.8} />
 </div>
 <div className="bg-white rounded-[18px] rounded-tl-[6px] px-4 py-2.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)]">
 <p className="text-[13px] leading-[19px] text-[#222]">{children}</p>
 <p className="text-[10.5px] text-[#999] mt-1.5 text-right">{time}</p>
 </div>
 </div>
);

const UserBubble = ({ children, time }: { children: React.ReactNode; time: string }) => (
 <div className="flex justify-end">
 <div className="max-w-[82%] bg-[#FFF1E6] rounded-[18px] rounded-tr-[6px] px-4 py-2.5">
 <p className="text-[13px] leading-[19px] text-[#F88A2B] font-medium">{children}</p>
 <div className="flex items-center justify-end gap-1 mt-1.5">
 <span className="text-[10.5px] text-[#C18A5A]">{time}</span>
 <div className="flex -space-x-1.5 text-[#F88A2B]">
 <Check size={12} strokeWidth={2.5} />
 <Check size={12} strokeWidth={2.5} />
 </div>
 </div>
 </div>
 </div>
);

const ChatAIScreen = () => {
  const isEnterprise = useLocation().pathname.startsWith('/enterprise');
  const userName = isEnterprise ? "Rafael" : "Juliana";

 const navigate = useNavigate();
  const LayoutComponent = isEnterprise ? EnterpriseUserLayout : (({ children }: { children: React.ReactNode }) => <AppUserLayout>{children}</AppUserLayout>);

  return (
    <LayoutComponent title="Conversa com a IA">
      <main className={`${isEnterprise ? 'w-full' : 'min-h-screen w-full flex items-center justify-center bg-[#1a1a1a] py-6 px-4'} font-display`}>
        <div className={`relative ${isEnterprise ? 'w-full max-w-4xl mx-auto h-[calc(100vh-180px)]' : 'w-[375px] h-[812px] max-h-[100dvh] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/40'} rounded-[44px] overflow-hidden bg-[#F7F4F2] flex flex-col`}>
 {/* Status bar */}
 {/* Header */}
 <div className={`relative flex items-center px-5 pt-3 pb-3 shrink-0 ${isEnterprise ? 'lg:hidden' : ''}`}>
 <button onClick={() => navigate(-1)} className="text-[#111]" aria-label="Voltar">
 <ArrowLeft size={22} strokeWidth={2} />
 </button>
 <div className="flex-1 flex items-center justify-center gap-2.5">
 <div className="w-9 h-9 rounded-full bg-[#FFE7D1] flex items-center justify-center">
 <Brain size={18} color="#F88A2B" strokeWidth={1.8} />
 </div>
 <div className="text-left">
 <p className="text-[15px] font-bold text-[#111] leading-tight">Conversa com a IA</p>
 <p className="text-[11px] text-[#666]">Seu apoio emocional diário</p>
 </div>
 </div>
 <button className="text-[#111]" aria-label="Mais"><MoreVertical size={20} /></button>
 </div>

 {/* Messages */}
 <div className="flex-1 overflow-y-auto px-4 pt-1 pb-3 space-y-3">
 {/* Safety card */}
 <div className="bg-[#FFF1E6] rounded-[18px] p-3.5 flex items-start gap-3">
 <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
 <ShieldCheck size={18} color="#F88A2B" strokeWidth={1.8} />
 </div>
 <div className="flex-1">
 <p className="text-[13px] font-bold text-[#111]">Este é um espaço seguro</p>
 <p className="text-[11.5px] leading-[16px] text-[#555] mt-0.5">
 Tudo o que você compartilhar é confidencial<br/>e usado para te apoiar melhor.
 </p>
 </div>
 </div>

 {/* Date divider */}
 <div className="flex justify-center pt-1">
 <span className="bg-[#EFEAE5] text-[#888] text-[11px] font-medium px-3 py-1 rounded-full">Hoje</span>
 </div>

 <AIBubble time="09:41">
 Olá, {userName}! 👋<br/>
 Como você está se sentindo hoje?<br/>
 Estou aqui para te ouvir.
 </AIBubble>

 <UserBubble time="09:42">
 Estou me sentindo ansiosa e com a mente muito acelerada...
 </UserBubble>

 <AIBubble time="09:43">
 Entendo como isso pode ser desafiador. A ansiedade costuma surgir quando nossa mente tenta antecipar situações ou lidar com muitas preocupações ao mesmo tempo.
 </AIBubble>

 <AIBubble time="09:43">
 Vamos respirar juntos? 🌿<br/>
 Que tal fazermos um exercício rápido para te ajudar a se acalmar agora?
 </AIBubble>

 {/* Quick actions */}
 <div className="flex gap-2 pt-1 overflow-x-auto pb-1" style={{ scrollbarWidth:"none" }}>
 {[
 { label:"Respiração guiada", Icon: Wind },
 { label:"Exercício rápido", Icon: Leaf },
 { label:"Mensagem positiva", Icon: Sun },
 ].map(({ label, Icon }) => (
 <button
 key={label}
 className="shrink-0 inline-flex items-center gap-1.5 bg-white border border-[#F88A2B] text-[#F88A2B] text-[11.5px] font-semibold rounded-full px-3 py-1.5"
 >
 <Icon size={13} strokeWidth={2} />
 {label}
 </button>
 ))}
 </div>
 </div>

 {/* Input */}
 <div className="px-4 pt-6 pb-2 shrink-0">
 <div className="flex items-center gap-2 bg-white rounded-full pl-5 pr-1.5 py-1.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)]">
 <input
 type="text"
 placeholder="Digite sua mensagem..."
 className="flex-1 bg-transparent outline-none text-[13px] text-[#222] placeholder:text-[#999] py-2"
 />
 <button className="w-10 h-10 rounded-full bg-[#F88A2B] flex items-center justify-center" aria-label="Enviar">
 <Send size={16} color="white" strokeWidth={2} />
 </button>
 </div>
 </div>

 </div>
 </main>
    </LayoutComponent>
 );
};

export default ChatAIScreen;
