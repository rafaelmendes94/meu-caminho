import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Settings, 
  Lock, 
  Eye, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight, 
  MoreVertical,
  Activity,
  Globe,
  PieChart,
  Layout,
  MessageSquare,
  History,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

const EnterpriseMultiAdminsScreen = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    accessLevel: "",
    areas: ""
  });

  const admins = [
    {
      id: 1,
      name: "Marina Costa",
      role: "Diretora de RH",
      permission: "Administrador global",
      access: "Todas as áreas",
      status: "Ativo",
      avatar: "MC"
    },
    {
      id: 2,
      name: "Carlos Mendes",
      role: "Liderança Operacional",
      permission: "Gestor regional",
      access: "Operações",
      status: "Ativo",
      avatar: "CM"
    },
    {
      id: 3,
      name: "Fernanda Lima",
      role: "People Analytics",
      permission: "Leitura estratégica",
      access: "Insights agregados",
      status: "Restrito",
      avatar: "FL"
    }
  ];

  const accessLevels = [
    {
      title: "Administrador global",
      desc: "Gerencia toda a organização.",
      icon: <Globe className="w-5 h-5 text-orange-500" />
    },
    {
      title: "RH estratégico",
      desc: "Acessa dashboards e cultura organizacional.",
      icon: <PieChart className="w-5 h-5 text-orange-500" />
    },
    {
      title: "Liderança regional",
      desc: "Acessa apenas áreas autorizadas.",
      icon: <Layout className="w-5 h-5 text-orange-500" />
    },
    {
      title: "Leitura executiva",
      desc: "Visualiza indicadores agregados.",
      icon: <Eye className="w-5 h-5 text-orange-500" />
    },
    {
      title: "Suporte operacional",
      desc: "Gerencia onboarding e acessos.",
      icon: <Settings className="w-5 h-5 text-orange-500" />
    }
  ];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Convite administrativo enviado.", {
      className: "bg-[#0B0908] text-white border-orange-500/20",
    });
    setShowAddForm(false);
    setFormData({ name: "", email: "", role: "", accessLevel: "", areas: "" });
  };

  return (
    <EnterpriseRHLayout title="Multi-admins">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] text-[#0B0908] font-['Montserrat'] overflow-y-auto pb-32">
      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 bg-[#F7F4F2]/80 backdrop-blur-md z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-semibold tracking-wider uppercase text-black/60">Múltiplos administradores</h1>
          <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold mt-1">
            Governança Enterprise
          </span>
        </div>
        <div className="w-10" />
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-8 animate-in fade-in duration-700">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#0B0908] rounded-[2rem] p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-orange-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Acessos protegidos</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] leading-tight">
              Governança distribuída exige clareza e proteção.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xl">
              O Enterprise permite que diferentes líderes administrem a organização sem comprometer privacidade emocional ou segurança organizacional.
            </p>
          </div>
          {/* Organic Lines Decor */}
          <svg className="absolute bottom-0 right-0 opacity-10 w-48 h-48" viewBox="0 0 200 200">
            <path d="M0,150 Q50,100 100,150 T200,150" fill="none" stroke="white" strokeWidth="1" />
            <path d="M0,160 Q50,110 100,160 T200,160" fill="none" stroke="white" strokeWidth="1" />
          </svg>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Administradores ativos", value: "6" },
            { label: "Líderes acesso limitado", value: "3" },
            { label: "Áreas organizacionais", value: "12" },
            { label: "Governança protegida", value: "100%" }
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-black/5 hover:shadow-md transition-shadow">
              <p className="text-[10px] text-black/40 uppercase font-bold tracking-widest mb-1">{kpi.label}</p>
              <p className="text-2xl font-['Playfair_Display'] text-orange-500 font-bold">{kpi.value}</p>
            </div>
          ))}
        </section>

        {/* Admins List Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-['Playfair_Display'] font-bold">Administradores ativos</h3>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-orange-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Adicionar novo <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {admins.map((admin) => (
              <div 
                key={admin.id}
                className="group bg-white p-6 rounded-3xl border border-black/5 hover:border-orange-500/20 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B0908] flex items-center justify-center text-white font-['Playfair_Display'] text-lg shadow-lg shadow-black/10">
                      {admin.avatar}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#0B0908]">{admin.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                          admin.status === 'Ativo' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {admin.status}
                        </span>
                      </div>
                      <p className="text-xs text-black/50 font-medium">{admin.role}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-black/5 rounded-full text-black/20 group-hover:text-black/60 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-black/5 pt-4">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-bold text-black/30 tracking-widest">Permissão</p>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-black/70">
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                      {admin.permission}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-bold text-black/30 tracking-widest">Áreas de Acesso</p>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-black/70">
                      <Globe className="w-3.5 h-3.5 text-orange-500" />
                      {admin.access}
                    </div>
                  </div>
                  <button className="ml-auto text-xs font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-full hover:bg-orange-500 hover:text-white transition-all">
                    Gerenciar acesso
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Add Admin Form */}
        <section className={`transition-all duration-500 ${showAddForm ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none hidden'}`}>
          <div className="bg-white/40 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <h3 className="text-xl font-['Playfair_Display'] font-bold">Adicionar administrador</h3>
            <form onSubmit={handleInvite} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-black/60 ml-1">Nome completo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Marina Costa"
                  className="w-full bg-white border border-black/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-black/60 ml-1">E-mail corporativo</label>
                <input 
                  type="email" 
                  placeholder="marina@empresa.com"
                  className="w-full bg-white border border-black/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-black/60 ml-1">Cargo</label>
                <input 
                  type="text" 
                  placeholder="Ex: People Analytics"
                  className="w-full bg-white border border-black/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-black/60 ml-1">Nível de acesso</label>
                <select 
                  className="w-full bg-white border border-black/5 rounded-2xl p-4 text-sm appearance-none focus:outline-none focus:border-orange-500/30 transition-all"
                  value={formData.accessLevel}
                  onChange={e => setFormData({...formData, accessLevel: e.target.value})}
                >
                  <option value="">Selecione o nível</option>
                  <option>Administrador global</option>
                  <option>RH estratégico</option>
                  <option>Liderança regional</option>
                  <option>Leitura executiva</option>
                  <option>Suporte operacional</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-black/60 ml-1">Áreas permitidas</label>
                <select 
                  className="w-full bg-white border border-black/5 rounded-2xl p-4 text-sm appearance-none focus:outline-none focus:border-orange-500/30 transition-all"
                  value={formData.areas}
                  onChange={e => setFormData({...formData, areas: e.target.value})}
                >
                  <option value="">Selecione as áreas</option>
                  <option>Todas as áreas</option>
                  <option>Operações</option>
                  <option>Marketing</option>
                  <option>Vendas</option>
                  <option>Tecnologia</option>
                </select>
              </div>
              <button 
                type="submit"
                className="md:col-span-2 bg-[#F88A2B] text-white py-5 rounded-2xl font-bold shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Enviar convite administrativo
              </button>
            </form>
          </div>
        </section>

        {/* Access Levels Cards */}
        <section className="space-y-6">
          <h3 className="text-xl font-['Playfair_Display'] font-bold">Níveis de acesso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessLevels.map((level, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 hover:border-orange-500/10 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {level.icon}
                </div>
                <h4 className="font-bold text-sm mb-1">{level.title}</h4>
                <p className="text-xs text-black/50 leading-relaxed">{level.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Protection Card */}
        <section className="bg-[#0B0908] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(248,138,43,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="text-xl font-['Playfair_Display'] font-bold tracking-wide">
                  Permissões nunca liberam acesso emocional individual.
                </h3>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                O Enterprise separa administração organizacional de qualquer experiência emocional privada.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                {[
                  "sem respostas individuais",
                  "sem conversas IA",
                  "sem score emocional",
                  "sem histórico privado",
                  "apenas leitura agregada"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3 text-orange-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 px-8 py-6 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
              <ShieldCheck className="w-10 h-10 text-orange-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Privacidade preservada</span>
            </div>
          </div>
        </section>

        {/* Administrative History */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-black/40" />
            <h3 className="text-xl font-['Playfair_Display'] font-bold">Histórico administrativo</h3>
          </div>
          <div className="space-y-6 relative ml-3 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-black/5">
            {[
              "Marina Costa adicionou novo admin",
              "Permissão regional atualizada",
              "Área Operações vinculada",
              "Convite executivo enviado",
              "Política de acesso revisada"
            ].map((log, i) => (
              <div key={i} className="relative pl-8 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(248,138,43,0.5)]"></div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-black/80">{log}</p>
                  <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">Há {i + 1} hora{i === 0 ? '' : 's'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommendation Card */}
        <section className="bg-white/40 backdrop-blur-md border border-white p-6 rounded-3xl flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
            <Info className="w-6 h-6 text-orange-500 group-hover:text-white" />
          </div>
          <p className="text-sm italic text-black/60 font-medium">
            "Empresas com múltiplos responsáveis organizacionais tendem a ter melhor continuidade cultural e governança emocional."
          </p>
        </section>

        {/* Actions */}
        <section className="space-y-4 pt-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full bg-[#F88A2B] text-white py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
          >
            <UserPlus className="w-6 h-6" />
            Adicionar novo administrador
          </button>
          <button 
            onClick={() => navigate('/enterprise/rh/permissoes')}
            className="w-full bg-transparent text-black/40 border border-black/5 py-5 rounded-2xl font-bold hover:bg-black/5 hover:text-black/60 transition-all flex items-center justify-center gap-2 group"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            Gerenciar permissões
          </button>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8">
          <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
            A governança Enterprise deve distribuir responsabilidade sem comprometer confiança emocional.
          </p>
        </footer>
      </main>
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseMultiAdminsScreen;
