import { Link } from"react-router-dom";
import { ChevronLeft } from"lucide-react";

const serif = { fontFamily:"'Playfair Display', serif" };

const SignalIcon = () => (
 <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
 <rect x="0" y="7" width="3" height="4" rx="0.5" /><rect x="4.5" y="5" width="3" height="6" rx="0.5" />
 <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" /><rect x="13.5" y="0" width="3" height="11" rx="0.5" />
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

export const Phone = ({ children }: { children: React.ReactNode }) => (
 <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
 <div
 className="relative w-full h-[100dvh] overflow-hidden bg-[#F7F4F2] flex flex-col"
 style={{ paddingTop:"env(safe-area-inset-top)", paddingBottom:"env(safe-area-inset-bottom)" }}
 >
 <div className="pointer-events-none absolute inset-0"
 style={{ background:"radial-gradient(70% 30% at 50% 0%, rgba(248,138,43,0.10) 0%, rgba(248,138,43,0) 70%)" }} />
 {children}
 </div>
 </main>
);

export const SubHeader = ({ title, back ="/configuracoes" }: { title: string; back?: string }) => (
 <div className="relative z-10 flex items-center px-5 pt-6 pb-1 shrink-0">
 <Link to={back} className="w-10 h-10 rounded-full bg-white/70 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition-transform">
 <ChevronLeft size={20} className="text-[#444]" />
 </Link>
 <h1 style={serif} className="flex-1 text-center text-[20px] text-[#111] tracking-tight pr-10">{title}</h1>
 </div>
);

export const sectionLabel ="text-[10.5px] font-semibold tracking-[0.18em] text-[#B58A5A] px-2 mb-2.5 mt-7";
export const card ="bg-white/70 backdrop-blur-sm rounded-3xl px-4 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.08)] border border-white/60";
export const serifFont = serif;
