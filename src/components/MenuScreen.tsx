import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronRight, TrendingUp, History, Download, Heart, Shield,
  Crown, HelpCircle, Settings, Headphones, BellRing, LogOut, Flame, Sparkles,
  User, CreditCard, Lock, Globe, Smartphone, Home, Flag, MessageCircle, Play, BookOpen
} from "lucide-react";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { useDisplayUser } from "@/hooks/use-display-user";
import { useAuth } from "@/hooks/useAuth";

const serif = { fontFamily: "'Playfair Display', serif" };

export default function MenuScreen() {
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');
  const al = useAudienceLink();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { name, email, avatarUrl, initial, planLabel } = useDisplayUser();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  if (!isEnterprise) {
    return <LegacyMobileMenu />;
  }

  return (
    <EnterpriseUserLayout title="Configurações">
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        
        {/* Profile SaaS Hero Section */}
        <section className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-black/5 flex flex-col lg:flex-row items-center gap-10">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-32 h-32 lg:w-40 lg:h-40 rounded-[48px] object-cover shadow-2xl ring-4 ring-orange-50 transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[48px] bg-[#0B0908] text-white flex items-center justify-center text-5xl font-bold shadow-2xl ring-4 ring-orange-50">
                {initial}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-[#F88A2B] border-4 border-white flex items-center justify-center text-white shadow-lg">
              <Sparkles size={20} fill="currentColor" />
            </div>
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F88A2B] text-[10px] font-bold uppercase tracking-widest mb-4">
              <Crown size={12} fill="currentColor" /> {planLabel}
            </div>
            <h1 style={serif} className="text-4xl lg:text-6xl font-bold text-[#111] leading-tight mb-2">{name}</h1>
            <p className="text-base lg:text-lg text-[#8A8A8A] font-medium mb-6">{email}</p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <button className="px-8 py-3 bg-[#F88A2B] text-white text-sm font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">Editar Perfil</button>
              <button className="px-8 py-3 bg-white text-[#111] text-sm font-bold rounded-2xl border border-black/5 hover:bg-black/5 transition-all">Segurança</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="bg-[#F9F8F6] p-6 rounded-3xl border border-black/5 text-center min-w-[140px]">
              <Flame size={24} className="text-[#F88A2B] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#111]">12</p>
              <p className="text-[10px] text-[#8A8A8A] uppercase font-bold tracking-widest">Dias Seguidos</p>
            </div>
            <div className="bg-[#F9F8F6] p-6 rounded-3xl border border-black/5 text-center min-w-[140px]">
              <TrendingUp size={24} className="text-[#9B8AC9] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#111]">Nível 3</p>
              <p className="text-[10px] text-[#8A8A8A] uppercase font-bold tracking-widest">Evolução</p>
            </div>
          </div>
        </section>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Settings Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold text-[#111] mb-8 flex items-center gap-3">
                <Settings size={20} className="text-[#F88A2B]" /> 
                Configurações do Sistema
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Notificações", desc: "Push, Email e Alertas", Icon: BellRing, to: "/notificacoes" },
                  { label: "Privacidade", desc: "Controle de visibilidade", Icon: Shield, to: "/privacidade" },
                  { label: "Preferências", desc: "Idioma e Aparência", Icon: Globe, to: "/configuracoes" },
                  { label: "Acessibilidade", desc: "Opções de leitura", Icon: User, to: "/configuracoes/leitura" },
                ].map((item) => (
                  <Link key={item.label} to={al(item.to)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F9F8F6] transition-all border border-transparent hover:border-black/5 group">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#F88A2B] group-hover:bg-[#F88A2B] group-hover:text-white transition-colors">
                      <item.Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111]">{item.label}</h4>
                      <p className="text-xs text-[#8A8A8A]">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold text-[#111] mb-8 flex items-center gap-3">
                <History size={20} className="text-[#9B8AC9]" /> 
                Atividade e Conteúdo
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Meus Favoritos", desc: "Conteúdos salvos", Icon: Heart, to: "/favoritos" },
                  { label: "Downloads", desc: "Acesso offline", Icon: Download, to: "/downloads" },
                  { label: "Histórico", desc: "Últimos acessos", Icon: History, to: "/historico" },
                  { label: "Progresso", desc: "Metas e conquistas", Icon: TrendingUp, to: "/progresso" },
                ].map((item) => (
                  <Link key={item.label} to={al(item.to)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F9F8F6] transition-all border border-transparent hover:border-black/5 group">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#9B8AC9] group-hover:bg-[#9B8AC9] group-hover:text-white transition-colors">
                      <item.Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111]">{item.label}</h4>
                      <p className="text-xs text-[#8A8A8A]">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Support & Plan Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#111] to-[#222] rounded-[32px] p-8 text-white shadow-xl shadow-black/10 relative overflow-hidden">
              <Crown className="absolute -top-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">Corporate Plan</p>
                <h3 className="text-2xl font-bold mb-4">Acesso Premium</h3>
                <p className="text-sm text-white/60 mb-8 leading-relaxed">Sua empresa liberou acesso ilimitado a todos os treinamentos e à Cury AI.</p>
                <button onClick={() => navigate(al("/assinatura"))} className="w-full py-4 bg-white text-[#111] rounded-2xl font-bold text-sm hover:bg-orange-50 transition-colors">Ver Benefícios</button>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold text-[#111] mb-6">Suporte</h2>
              <div className="space-y-2">
                {[
                  { label: "Central de Ajuda", Icon: HelpCircle, to: "/ajuda" },
                  { id: "s2", label: "Fale Conosco", Icon: Headphones, to: "/fale-conosco" },
                ].map((item) => (
                  <Link key={item.label} to={al(item.to)} className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#F9F8F6] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <item.Icon size={18} />
                      </div>
                      <span className="font-bold text-sm text-[#111]">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-black/10 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
              
              <button 
                onClick={handleSignOut}
                className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all"
              >
                <LogOut size={18} /> Sair da Conta
              </button>
            </div>
          </div>

        </div>

        <div className="text-center pt-10">
          <p className="text-[11px] font-bold text-[#B8B0A8] uppercase tracking-widest">Meu Caminho · Augusto Cury · v1.2.0</p>
        </div>
      </div>
    </EnterpriseUserLayout>
  );
}

function LegacyMobileMenu() {
  const al = useAudienceLink();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const serif = { fontFamily:"'Playfair Display', serif" };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const sections = [
    {
      title: "MINHA JORNADA",
      items: [
        { label:"Minha evolução", desc:"Acompanhe seu progresso", Icon: TrendingUp, iconColor:"#7FBF9F", bg:"#EAF3EC", to:"/progresso" },
        { label:"Histórico", desc:"Veja tudo que você já fez", Icon: History, iconColor:"#9B8AC9", bg:"#EFEAF7", to:"/historico" },
        { label:"Downloads", desc:"Acesse conteúdos salvos", Icon: Download, iconColor:"#F88A2B", bg:"#FDECDA", to:"/downloads" },
        { label:"Favoritos", desc:"Seus conteúdos favoritos", Icon: Heart, iconColor:"#E26B6B", bg:"#FBE4E4", to:"/favoritos" },
      ]
    },
    {
      title: "ÁREAS DO APP",
      items: [
        { label:"Home", desc:"Painel principal", Icon: Home, iconColor:"#F88A2B", bg:"#FDECDA", to:"/home" },
        { label:"Trilha Personalizada", desc:"Sua jornada de evolução", Icon: Flag, iconColor:"#F88A2B", bg:"#FDECDA", to:"/trilha" },
        { label:"Cury Digital", desc:"Converse com a IA do Cury", Icon: MessageCircle, iconColor:"#7FBF9F", bg:"#EAF3EC", to:"/cury-digital" },
        { label:"Feed de Conteúdo", desc:"Áudios, vídeos e reflexões", Icon: Play, iconColor:"#9B8AC9", bg:"#EFEAF7", to:"/feed" },
        { label:"Clube do Livro", desc:"Biblioteca dos livros do Dr. Augusto Cury", Icon: BookOpen, iconColor:"#7FBF9F", bg:"#EAF3EC", to:"/biblioteca" },
      ]
    }
  ];

  return (
    <AppUserLayout title="Menu">
      <main className="min-h-screen bg-[#F7F4F2] px-5 pb-10">
        <div className="pt-8 pb-10">
          <h1 style={serif} className="text-5xl font-bold text-[#111]">Menu</h1>
          <p className="text-sm font-medium text-[#8A8A8A] mt-2">Sua central pessoal</p>
        </div>

        <div className="space-y-8">
          {sections.map(section => (
            <section key={section.title}>
              <p className="text-[11px] font-bold tracking-[0.25em] text-[#B58A5A] px-2 mb-4 uppercase">{section.title}</p>
              <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-black/5 divide-y divide-black/[0.03]">
                {section.items.map((item) => (
                  <Link key={item.label} to={al(item.to)} className="flex items-center gap-4 py-4 px-4 hover:bg-black/[0.01]">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: item.bg }}>
                      <item.Icon size={20} strokeWidth={1.7} color={item.iconColor} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-bold text-[#111]">{item.label}</p>
                      <p className="text-[12px] text-[#8A8A8A] mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={18} className="text-black/10" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <button onClick={handleSignOut} className="mt-10 w-full py-4 rounded-[24px] bg-white border border-black/5 text-red-500 font-bold flex items-center justify-center gap-2">
          <LogOut size={18} /> Sair da conta
        </button>
      </main>
    </AppUserLayout>
  );
}
