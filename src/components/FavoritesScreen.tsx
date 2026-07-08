import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  ChevronLeft, BookOpen, Headphones, Play, Quote, Heart, 
  Trash2, Search, Filter, Sparkles, ChevronRight, Bookmark
} from "lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { motion, AnimatePresence } from "framer-motion";

const brand = "#F88A2B";
const serif = { fontFamily: "'Playfair Display', serif" };

type Fav = {
  id: string;
  type: "livro" | "aula" | "audio" | "frase";
  title: string;
  meta: string;
  to?: string;
  quote?: string;
  date?: string;
};

const initial: Fav[] = [
  { id: "1", type: "livro", title: "Ansiedade — como enfrentar o mal do século", meta: "Augusto Cury", to: "/biblioteca/detalhe", date: "2 dias atrás" },
  { id: "2", type: "frase", title: "", meta: "— Augusto Cury", quote: "A maior revolução acontece silenciosamente dentro da mente.", date: "Ontem" },
  { id: "3", type: "aula", title: "Respiração consciente", meta: "Curso · Aula 3", to: "/aula", date: "3 dias atrás" },
  { id: "4", type: "audio", title: "Meditação — mente serena", meta: "Áudio · 12 min", to: "/player/audio", date: "1 semana atrás" },
  { id: "5", type: "livro", title: "Inteligência emocional na prática", meta: "Augusto Cury", to: "/biblioteca/detalhe", date: "2 semanas atrás" },
  { id: "6", type: "frase", title: "", meta: "— Augusto Cury", quote: "A mente registra aquilo que repetimos emocionalmente.", date: "1 mês atrás" },
  { id: "7", type: "aula", title: "Limites saudáveis", meta: "Curso · Aula 2", to: "/aula", date: "Ontem" },
];

const tabs = ["Tudo", "Livros", "Aulas", "Áudios", "Frases"] as const;
const filterMap: Record<typeof tabs[number], Fav["type"][] | null> = {
  Tudo: null,
  Livros: ["livro"],
  Aulas: ["aula"],
  "Áudios": ["audio"],
  Frases: ["frase"],
};

const iconFor = (t: Fav["type"]) => {
  const map = {
    livro: { Icon: BookOpen, c: "#E26B6B", bg: "#FBE4E4" },
    aula: { Icon: Play, c: brand, bg: "#FDECDA" },
    audio: { Icon: Headphones, c: "#9B8AC9", bg: "#EFEAF7" },
    frase: { Icon: Quote, c: "#B89673", bg: "#F4ECDF" },
  } as const;
  return map[t];
};

const FavoritesScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  
  const [tab, setTab] = useState<typeof tabs[number]>("Tudo");
  const [items, setItems] = useState(initial);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let res = items;
    if (filterMap[tab]) {
      res = res.filter((i) => filterMap[tab]!.includes(i.type));
    }
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(i => 
        i.title.toLowerCase().includes(s) || 
        i.meta.toLowerCase().includes(s) || 
        (i.quote && i.quote.toLowerCase().includes(s))
      );
    }
    return res;
  }, [tab, items, search]);

  const remove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Meus Favoritos">
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
          
          {/* SaaS Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 style={serif} className="text-4xl lg:text-5xl font-bold text-[#111]">O que toca seu coração</h1>
              <p className="text-base text-[#8A8A8A] font-medium">Tudo que você guardou para reviver quando precisar.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B8B0A8]" />
                <input 
                  type="text" 
                  placeholder="Buscar favoritos..." 
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

          {/* SaaS Tabs */}
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
              <span className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">{filtered.length} Itens</span>
            </div>
          </div>

          {/* Grid of Favorites */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((it) => {
                const { Icon, c, bg: ibg } = iconFor(it.type);
                
                return (
                  <motion.div
                    layout
                    key={it.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-white rounded-[32px] p-6 shadow-sm border border-black/5 hover:border-orange-500/20 transition-all flex flex-col h-full"
                  >
                    {/* Header: Icon & Action */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: ibg }}>
                        <Icon size={24} color={c} strokeWidth={1.8} />
                      </div>
                      <button 
                        onClick={() => remove(it.id)}
                        className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 active:scale-90"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      {it.type === 'frase' ? (
                        <div className="space-y-3">
                          <p className="text-lg leading-relaxed text-[#111] italic font-playfair" style={serif}>
                            "{it.quote}"
                          </p>
                          <p className="text-xs font-bold text-[#F88A2B] uppercase tracking-widest">
                            {it.meta}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-[#111] leading-tight group-hover:text-orange-600 transition-colors">
                            {it.title}
                          </h4>
                          <p className="text-sm text-[#8A8A8A]">
                            {it.meta}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-black/[0.03] flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-[0.15em]">
                        Adicionado {it.date}
                      </span>
                      {it.to && (
                        <Link to={al(it.to)} className="flex items-center gap-1.5 text-xs font-bold text-[#111] hover:text-orange-500 transition-colors">
                          Acessar <ChevronRight size={14} />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="bg-white rounded-[40px] border border-dashed border-black/10 p-24 text-center space-y-6">
              <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-orange-200">
                <Bookmark size={40} />
              </div>
              <h3 style={serif} className="text-3xl font-bold text-[#111]">Sua curadoria está vazia</h3>
              <p className="text-base text-[#8A8A8A] max-w-sm mx-auto">Favorite frases, áudios e capítulos para encontrá-los facilmente aqui depois.</p>
              <button 
                onClick={() => navigate('/enterprise/feed')} 
                className="px-10 py-4 bg-[#0B0908] text-white text-sm font-bold rounded-2xl hover:scale-105 transition-all shadow-lg"
              >
                Explorar Conteúdos
              </button>
            </div>
          )}

          {/* Footer Branding */}
          <div className="text-center pt-10">
            <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest flex items-center justify-center gap-2">
              <Heart size={10} className="text-red-400" fill="currentColor" /> Curadoria Pessoal · Meu Caminho · v1.2.0
            </p>
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
          <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(70% 30% at 50% 6%, rgba(226,107,107,0.10) 0%, transparent 70%)" }} />

          <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
            <Link to={al("/menu")} className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition">
              <ChevronLeft size={18} className="text-[#444]" />
            </Link>
            <p className="text-[14px] text-[#444]">Favoritos</p>
            <div className="w-10 h-10 rounded-full bg-white/85 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)]">
              <Heart size={16} className="text-[#E26B6B]" fill="#E26B6B" />
            </div>
          </div>

          <div className="relative z-10 flex-1 px-5 pb-4 overflow-y-auto no-scrollbar">
            <h1 style={serif} className="text-[34px] leading-[1.05] text-[#111] mt-1">O que toca<br/>seu coração</h1>
            <p className="text-[12.5px] text-[#8A8A8A] mt-2">Tudo que você guardou para reviver quando precisar.</p>

            <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
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
                  <motion.div 
                    layout
                    key={it.id}
                    className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ibg }}>
                        <Icon size={20} color={c} strokeWidth={1.7} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {it.type === 'frase' ? (
                          <>
                            <p className="text-[14px] leading-[1.45] text-[#111] italic font-playfair" style={serif}>{it.quote}</p>
                            <p className="mt-1 text-[11px] font-bold text-[#F88A2B] uppercase tracking-wider">{it.meta}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[15px] font-bold text-[#111] leading-tight">{it.title}</p>
                            <p className="text-[12px] text-[#666] mt-0.5">{it.meta}</p>
                          </>
                        )}
                      </div>
                      <button onClick={() => remove(it.id)} className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <Heart size={14} className="text-[#E26B6B]" fill="#E26B6B" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-[13px] text-[#999]">
                  <Heart size={24} className="mx-auto mb-2 opacity-30" />
                  Nenhum favorito por aqui ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AppUserLayout>
  );
};

export default FavoritesScreen;