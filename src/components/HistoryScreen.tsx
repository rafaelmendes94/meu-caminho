import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  ChevronLeft, BookOpen, Headphones, MessageCircle, Award, Play, 
  Sparkles, Filter, Search, Calendar, Clock, BarChart3, TrendingUp, History
} from "lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { motion, AnimatePresence } from "framer-motion";

const brand = "#F88A2B";
const serif = { fontFamily: "'Playfair Display', serif" };

type Item = {
  id: string;
  type: "aula" | "audio" | "chat" | "conquista" | "leitura";
  title: string;
  meta: string;
  when: string;
  time: string;
  duration?: string;
  to?: string;
};

const allActivities: Item[] = [
  { id: "1", type: "aula", title: "Respiração consciente", meta: "Curso · Aula 3", when: "Hoje", time: "09:42", duration: "12m", to: "/aula" },
  { id: "2", type: "chat", title: "Conversa sobre ansiedade", meta: "Cury IA", when: "Hoje", time: "08:10", to: "/cury-digital/chat" },
  { id: "3", type: "leitura", title: "Ansiedade — capítulo 4", meta: "Biblioteca", when: "Ontem", time: "22:18", to: "/biblioteca/leitor" },
  { id: "4", type: "audio", title: "Mente serena — meditação", meta: "Áudio · 12 min", when: "Ontem", time: "21:05", duration: "12m", to: "/player/audio" },
  { id: "5", type: "conquista", title: "7 dias seguidos!", meta: "Conquista desbloqueada", when: "13/06", time: "07:32", to: "/conquista" },
  { id: "6", type: "aula", title: "Limites saudáveis", meta: "Curso · Aula 2", when: "12/06", time: "19:48", duration: "15m", to: "/aula" },
  { id: "7", type: "leitura", title: "Inteligência emocional — cap. 1", meta: "Biblioteca", when: "11/06", time: "18:00", to: "/biblioteca/leitor" },
  { id: "8", type: "chat", title: "Reflexão sobre relações", meta: "Cury IA", when: "10/06", time: "20:22", to: "/cury-digital/chat" },
];

const tabs = ["Tudo", "Aulas", "Áudios", "Leituras", "IA", "Conquistas"] as const;
const filterMap: Record<typeof tabs[number], Item["type"][] | null> = {
  Tudo: null,
  Aulas: ["aula"],
  "Áudios": ["audio"],
  Leituras: ["leitura"],
  IA: ["chat"],
  Conquistas: ["conquista"],
};

const iconFor = (t: Item["type"]) => {
  const map = {
    aula: { Icon: Play, c: brand, bg: "#FDECDA" },
    audio: { Icon: Headphones, c: "#9B8AC9", bg: "#EFEAF7" },
    chat: { Icon: MessageCircle, c: "#7FBF9F", bg: "#EAF3EC" },
    conquista: { Icon: Award, c: "#E0A93A", bg: "#FBF1D8" },
    leitura: { Icon: BookOpen, c: "#E26B6B", bg: "#FBE4E4" },
  } as const;
  return map[t];
};

const HistoryScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  
  const [tab, setTab] = useState<typeof tabs[number]>("Tudo");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let res = allActivities;
    if (filterMap[tab]) {
      res = res.filter((i) => filterMap[tab]!.includes(i.type));
    }
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(i => 
        i.title.toLowerCase().includes(s) || 
        i.meta.toLowerCase().includes(s)
      );
    }
    return res;
  }, [tab, search]);

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Meu Histórico">
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
          
          {/* SaaS Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 style={serif} className="text-4xl lg:text-5xl font-bold text-[#111]">Sua jornada até aqui</h1>
              <p className="text-base text-[#8A8A8A] font-medium">Tudo o que você já viu, leu, ouviu e conversou.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B8B0A8]" />
                <input 
                  type="text" 
                  placeholder="Buscar atividade..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-white border border-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/20 w-full sm:w-64 transition-all shadow-sm"
                />
              </div>
              <button className="p-3 bg-white border border-black/5 rounded-2xl text-[#111] hover:bg-[#F9F8F6] transition-all shadow-sm">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Stats SaaS Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Atividades Concluídas", value: "47", Icon: CheckCircle2, color: "#F88A2B", bg: "bg-orange-50" },
              { label: "Dias Seguidos", value: "12", Icon: TrendingUp, color: "#9B8AC9", bg: "bg-purple-50" },
              { label: "Tempo de Cuidado", value: "7.2h", Icon: Clock, color: "#7FBF9F", bg: "bg-green-50" },
              { label: "Nível de Evolução", value: "Lvl 3", Icon: Award, color: "#E0A93A", bg: "bg-yellow-50" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[24px] p-6 border border-black/5 shadow-sm flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.Icon size={24} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#111]">{stat.value}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#8A8A8A]">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs SaaS */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white p-2 rounded-2xl border border-black/5 shadow-sm">
            {tabs.map((t) => (
              <button 
                key={t} 
                onClick={() => setTab(t)} 
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  tab === t 
                    ? "bg-[#0B0908] text-white shadow-md" 
                    : "text-[#8A8A8A] hover:bg-[#F9F8F6]"
                }`}
              >
                {t}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 px-4 border-l border-black/5">
              <span className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">{filtered.length} Atividades</span>
            </div>
          </div>

          {/* List SaaS */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((it) => {
                const { Icon, c, bg: ibg } = iconFor(it.type);
                return (
                  <motion.div
                    layout
                    key={it.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group bg-white rounded-[24px] p-4 border border-black/5 shadow-sm hover:border-orange-500/20 transition-all flex items-center gap-6"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: ibg }}>
                      <Icon size={24} color={c} strokeWidth={1.8} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                        <h4 className="text-base font-bold text-[#111] truncate">{it.title}</h4>
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{it.type}</span>
                      </div>
                      <p className="text-sm text-[#8A8A8A] font-medium">{it.meta}</p>
                    </div>

                    <div className="hidden md:flex flex-col items-end gap-1 px-8 border-x border-black/[0.03]">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#111] uppercase tracking-wider">
                        <Calendar size={12} className="text-black/20" /> {it.when}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">
                        <Clock size={11} className="text-black/10" /> {it.time}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {it.to && (
                        <Link to={al(it.to)} className="px-6 py-2.5 bg-[#F9F8F6] text-[#111] rounded-xl text-xs font-bold hover:bg-[#0B0908] hover:text-white transition-all">
                          Ver Detalhes
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="bg-white rounded-[40px] border border-dashed border-black/10 p-24 text-center space-y-6">
                <div className="w-24 h-24 bg-[#F9F8F6] rounded-[32px] flex items-center justify-center mx-auto mb-6 text-[#C9C2BB]">
                  <History size={40} />
                </div>
                <h3 style={serif} className="text-3xl font-bold text-[#111]">Inicie sua jornada</h3>
                <p className="text-base text-[#8A8A8A] max-w-sm mx-auto">Suas atividades aparecerão aqui à medida que você progride na sua trilha personalizada.</p>
                <button 
                  onClick={() => navigate('/enterprise/trilha')} 
                  className="px-10 py-4 bg-[#0B0908] text-white text-sm font-bold rounded-2xl hover:scale-105 transition-all shadow-lg"
                >
                  Ir para Minha Trilha
                </button>
              </div>
            )}
          </div>

          <div className="text-center pt-10">
            <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Enterprise RH · Registro de Atividade · v1.2.0</p>
          </div>
        </div>
      </EnterpriseUserLayout>
    );
  }

  // Mobile/Legacy Layout
  return (
    <AppUserLayout>
      <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
        <div
          className="relative w-full h-[100dvh] overflow-hidden flex flex-col"
          style={{ background: "#F7F4F2", paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(70% 30% at 50% 6%, rgba(248,138,43,0.12) 0%, transparent 70%)" }} />

          <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
            <Link to={al("/menu")} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition">
              <ChevronLeft size={18} className="text-[#444]" />
            </Link>
            <p className="text-[14px] text-[#444]">Histórico</p>
            <button className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)]">
              <Filter size={16} className="text-[#444]" />
            </button>
          </div>

          <div className="relative z-10 flex-1 px-5 pb-4 overflow-y-auto no-scrollbar">
            <h1 style={serif} className="text-[34px] leading-[1.05] text-[#111] mt-1">Sua jornada<br/>até aqui</h1>
            <p className="text-[12.5px] text-[#8A8A8A] mt-2">Tudo o que você já viu, leu, ouviu e conversou.</p>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { v: "47", l: "atividades", c: brand },
                { v: "12", l: "dias seguidos", c: "#9B8AC9" },
                { v: "7h", l: "tempo total", c: "#7FBF9F" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl py-3 text-center border border-black/5 shadow-sm">
                  <p className="text-[18px] font-bold" style={{ color: s.c }}>{s.v}</p>
                  <p className="text-[10px] text-[#666] uppercase font-bold tracking-widest mt-1">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {tabs.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`shrink-0 text-[11.5px] px-4 py-2 rounded-full border transition-all ${t === tab ? "bg-[#F88A2B] border-[#F88A2B] text-white shadow-md" : "bg-white border-black/5 text-[#444]"}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {filtered.map((it) => {
                const { Icon, c, bg: ibg } = iconFor(it.type);
                return (
                  <motion.div layout key={it.id} className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ibg }}>
                        <Icon size={20} color={c} strokeWidth={1.7} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#111] truncate">{it.title}</p>
                        <p className="text-[11px] text-[#666] mt-0.5">{it.meta}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10.5px] text-[#999] font-bold">{it.when}</p>
                        <p className="text-[9px] text-[#B8B0A8] uppercase font-bold">{it.time}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </AppUserLayout>
  );
};

const CheckCircle2 = ({ size, className, style }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

export default HistoryScreen;