import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  ChevronLeft, Flame, CalendarDays, Headphones, BookOpen, Sparkles, Bell, Settings,
  CheckCircle2, Clock, Filter, Trash2, MoreHorizontal, ChevronRight, User
} from "lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";

const serif = { fontFamily: "'Playfair Display', serif" };

type Cat = "jornada" | "conteudos" | "novidades";
type Group = "hoje" | "semana" | "anteriores";

type Notif = {
  id: string;
  title: string;
  desc: string;
  time: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
  unread?: boolean;
  category: Cat;
  group: Group;
};

const ALL_NOTIFS: Notif[] = [
  { id: "1", title: "Sequência de 12 dias!", desc: "Parabéns! Você mantém sua sequência de cuidado emocional.", time: "Agora", Icon: Flame, color: "#F88A2B", bg: "#FDECDA", unread: true, category: "jornada", group: "hoje" },
  { id: "2", title: "Resumo semanal disponível", desc: "Veja o seu progresso da semana e continue evoluindo.", time: "2h", Icon: CalendarDays, color: "#9B8AC9", bg: "#EFEAF7", unread: true, category: "jornada", group: "hoje" },
  { id: "3", title: "Novo áudio do dia", desc: "Uma nova mensagem para fortalecer sua mente.", time: "1d", Icon: Headphones, color: "#8FB17D", bg: "#E3ECDD", category: "conteudos", group: "semana" },
  { id: "4", title: "Novo conteúdo no Clube do Livro", desc: "Um novo capítulo foi liberado para sua leitura.", time: "2d", Icon: BookOpen, color: "#B58A5A", bg: "#F6EFE8", category: "conteudos", group: "semana" },
  { id: "5", title: "Pequena reflexão para você", desc: "Uma motivação curta para começar bem o dia.", time: "5d", Icon: Sparkles, color: "#9B8AC9", bg: "#EFEAF7", category: "jornada", group: "anteriores" },
  { id: "6", title: "Atualização do app", desc: "Melhorias na experiência da Trilha Personalizada.", time: "1sem", Icon: Bell, color: "#444", bg: "#ECE7E2", category: "novidades", group: "anteriores" },
];

const filters = [
  { id: "todas", label: "Todas" },
  { id: "naolidas", label: "Não lidas" },
  { id: "jornada", label: "Jornada" },
  { id: "conteudos", label: "Conteúdos" },
] as const;

const groupTitles: Record<Group, string> = {
  hoje: "Hoje",
  semana: "Esta semana",
  anteriores: "Anteriores",
};

const NotificationsScreen = () => {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  
  const [filter, setFilter] = useState<typeof filters[number]["id"]>("todas");

  const filtered = useMemo(() => {
    return ALL_NOTIFS.filter((n) => {
      if (filter === "todas") return true;
      if (filter === "naolidas") return n.unread;
      if (filter === "jornada") return n.category === "jornada";
      if (filter === "conteudos") return n.category === "conteudos";
      return true;
    });
  }, [filter]);

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Notificações">
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
          
          {/* SaaS Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 style={serif} className="text-4xl lg:text-5xl font-bold text-[#111]">Notificações</h1>
              <p className="text-base text-[#8A8A8A] font-medium">Acompanhe as atualizações da sua jornada e conteúdos.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-6 py-2.5 bg-white border border-black/5 rounded-xl text-xs font-bold text-[#111] hover:bg-black/5 transition-all flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-500" /> Marcar todas como lidas
              </button>
              <button className="px-4 py-2.5 bg-white border border-black/5 rounded-xl text-[#111] hover:bg-black/5 transition-all">
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Filtering SaaS Bar */}
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-black/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    active 
                      ? "bg-[#0B0908] text-white shadow-md" 
                      : "text-[#8A8A8A] hover:bg-[#F9F8F6]"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2 px-4 border-l border-black/5">
              <span className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">{filtered.length} Notificações</span>
            </div>
          </div>

          {/* Notification List SaaS */}
          <div className="space-y-8">
            {(["hoje", "semana", "anteriores"] as Group[]).map((g) => {
              const inGroup = filtered.filter((n) => n.group === g);
              if (inGroup.length === 0) return null;
              
              return (
                <section key={g} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B58A5A]">{groupTitles[g]}</h3>
                    <div className="h-px flex-1 bg-black/[0.03]" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {inGroup.map((n) => (
                      <div 
                        key={n.id} 
                        className={`group relative bg-white rounded-[24px] p-5 shadow-sm border border-black/5 hover:border-[#F88A2B]/20 transition-all flex items-center gap-5 ${n.unread ? 'ring-1 ring-[#F88A2B]/10' : ''}`}
                      >
                        {n.unread && (
                          <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-[#F88A2B] shadow-[0_0_12px_rgba(248,138,43,0.4)]" />
                        )}
                        
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: n.bg }}>
                          <n.Icon size={24} color={n.color} strokeWidth={1.8} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-base font-bold text-[#111] truncate pr-8">{n.title}</h4>
                            <span className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest whitespace-nowrap">· {n.time}</span>
                          </div>
                          <p className="text-sm text-[#666] leading-relaxed line-clamp-2 max-w-2xl">{n.desc}</p>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-[#F9F8F6] text-[#8A8A8A] transition-colors">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {filtered.length === 0 && (
              <div className="bg-white rounded-[40px] border border-dashed border-black/10 p-20 text-center space-y-4">
                <div className="w-20 h-20 bg-[#F9F8F6] rounded-[32px] flex items-center justify-center mx-auto mb-6 text-[#C9C2BB]">
                  <Bell size={32} />
                </div>
                <h3 style={serif} className="text-2xl font-bold text-[#111]">Tudo em dia por aqui!</h3>
                <p className="text-sm text-[#8A8A8A] max-w-xs mx-auto">Você não tem novas notificações no momento. Aproveite para explorar novos conteúdos.</p>
                <button onClick={() => navigate('/enterprise/feed')} className="px-8 py-3 bg-[#0B0908] text-white text-sm font-bold rounded-2xl hover:scale-105 transition-all">Ver Feed de Conteúdo</button>
              </div>
            )}
          </div>

          <div className="text-center pt-10">
            <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Meu Caminho · Central de Notificações · v1.2.0</p>
          </div>
        </div>
      </EnterpriseUserLayout>
    );
  }

  // Mobile/Legacy Layout
  return (
    <AppUserLayout title="Notificações">
      <main className="h-screen min-h-[100dvh] w-full flex items-center justify-center bg-[#F7F4F2] overflow-hidden font-display">
        <div
          className="relative w-full h-[100dvh] overflow-hidden bg-[#F7F4F2] flex flex-col"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(70% 30% at 50% 0%, rgba(248,138,43,0.10) 0%, rgba(248,138,43,0) 70%)" }} />

          {/* Header */}
          <div className="relative z-10 flex items-center px-5 pt-6 pb-1 shrink-0">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/70 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition-transform">
              <ChevronLeft size={20} className="text-[#444]" />
            </button>
            <h1 style={serif} className="flex-1 text-center text-[22px] text-[#111] tracking-tight">Notificações</h1>
            <Link to={al("/configuracoes")} className="w-10 h-10 rounded-full bg-white/70 border border-white flex items-center justify-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] active:scale-95 transition-transform">
              <Settings size={17} className="text-[#444]" />
            </Link>
          </div>

          {/* Filters */}
          <div className="relative z-10 px-5 pt-3 pb-1 shrink-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {filters.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 ${
                      active
                        ? "bg-[#111] text-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.3)]"
                        : "bg-white/70 text-[#666] border border-white/80"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scroll List */}
          <div className="relative z-10 flex-1 px-5 pb-6 pt-3 overflow-y-auto no-scrollbar">
            {filtered.length > 0 ? (
              (["hoje", "semana", "anteriores"] as Group[]).map((g) => {
                const inGroup = filtered.filter((n) => n.group === g);
                if (inGroup.length === 0) return null;
                return (
                  <section key={g} className="mb-6">
                    <p className="text-[10.5px] font-bold tracking-[0.18em] text-[#B58A5A] px-2 mb-2 uppercase">
                      {groupTitles[g]}
                    </p>
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl px-3 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.08)] border border-white/70 divide-y divide-[#F0EAE3]">
                      {inGroup.map((n, i) => (
                        <div
                          key={n.id}
                          className="relative flex items-start gap-3 py-3.5 px-1 active:bg-black/[0.015] transition-colors"
                        >
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: n.bg }}>
                            <n.Icon size={18} color={n.color} strokeWidth={1.8} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13.5px] font-semibold text-[#111] leading-tight truncate">{n.title}</p>
                              {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#F88A2B] shrink-0 shadow-[0_0_0_3px_rgba(248,138,43,0.18)]" />}
                            </div>
                            <p className="text-[11.5px] text-[#666] mt-1 leading-snug line-clamp-2">{n.desc}</p>
                          </div>
                          <span className="text-[10.5px] text-[#999] shrink-0 mt-0.5">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <div className="mt-12 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white/80 border border-white shadow-[0_4px_14px_-6px_rgba(0,0,0,0.1)] flex items-center justify-center mb-3 text-[#C9C2BB]">
                  <Bell size={20} />
                </div>
                <p style={serif} className="text-[18px] text-[#111]">Tudo em dia</p>
                <p className="text-[12px] text-[#666] mt-1">Nenhuma notificação por aqui.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </AppUserLayout>
  );
};

export default NotificationsScreen;