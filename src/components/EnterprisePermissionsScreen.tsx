import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Lock, 
  UserPlus, 
  Settings, 
  Users, 
  EyeOff, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  History,
  Info,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterprisePermissionsScreen = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Gestor",
    area: ""
  });

  const accessLevels = [
    {
      id: "admin",
      title: "Administrador",
      permissions: ["gerenciar empresa", "integrações", "exportações", "acessos", "configurações"],
      indicator: "Acesso total administrativo",
      color: "from-orange-500/20 to-orange-600/20"
    },
    {
      id: "rh",
      title: "RH",
      permissions: ["visualizar dashboards agregados", "relatórios executivos", "alertas coletivos", "plano de ação"],
      indicator: "Nunca acessa dados individuais",
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      id: "leadership",
      title: "Liderança",
      permissions: ["visualizar áreas permitidas", "insights coletivos", "evolução emocional agregada"],
      indicator: "Acesso limitado por área",
      color: "from-emerald-500/20 to-emerald-600/20"
    },
    {
      id: "manager",
      title: "Gestor",
      permissions: ["visão resumida do time", "alertas preventivos", "tendências coletivas"],
      indicator: "Sem acesso sensível",
      color: "from-purple-500/20 to-purple-600/20"
    }
  ];

  const peopleWithAccess = [
    { name: "Marina Costa", role: "Administrador", initials: "MC" },
    { name: "Carlos Mendes", role: "RH", initials: "CM" },
    { name: "Fernanda Lima", role: "Liderança", initials: "FL" },
    { name: "Ricardo Alves", role: "Gestor", initials: "RA" }
  ];

  const governanceLogs = [
    { event: "Novo gestor adicionado", date: "Hoje, 14:20" },
    { event: "Permissão alterada", date: "Ontem, 09:15" },
    { event: "Exportação executiva gerada", date: "12 Mai, 16:45" },
    { event: "Política de anonimização atualizada", date: "10 Mai, 11:30" }
  ];

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Acesso configurado com segurança.", {
      className: "bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] border-orange-500/30",
    });
    setShowAddForm(false);
    setFormData({ name: "", email: "", role: "Gestor", area: "" });
  };

  return (
    <EnterpriseRHLayout title="Permissões & acessos">
      <main className="px-6 space-y-8 max-w-4xl mx-auto py-8">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 text-[#111] shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-xs font-medium text-orange-400 tracking-wider uppercase">Selo de Acesso Protegido</span>
            </div>
            
            <h2 className="font-serif text-3xl mb-4 leading-tight">
              Privacidade emocional exige governança sofisticada.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              O Enterprise separa acessos administrativos de qualquer informação emocional individual, garantindo total anonimato.
            </p>
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
          </div>
        </motion.section>

        {/* Access Levels */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-semibold">Níveis de acesso</h3>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessLevels.map((level, idx) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{level.title}</h4>
                    <span className="text-xs text-orange-600 font-medium">{level.indicator}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                    <Lock className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {level.permissions.map((perm, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 className="w-3 h-3 text-orange-500" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* People with Access */}
        <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-serif font-semibold">Pessoas com acesso</h3>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline"
            >
              <UserPlus className="w-4 h-4" />
              Novo acesso
            </button>
          </div>

          <div className="space-y-4">
            {peopleWithAccess.map((person, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center font-bold text-orange-700 text-xs">
                    {person.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{person.name}</p>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{person.role}</span>
                  </div>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors flex items-center gap-1">
                  Editar acesso
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Automatic Protection */}
        <section className="relative overflow-hidden bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <EyeOff className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-serif font-semibold">Dados individuais nunca aparecem.</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, text: "Anonimização automática" },
              { icon: ShieldAlert, text: "Bloqueio de grupos pequenos" },
              { icon: Lock, text: "Sem acesso a conversas privadas" },
              { icon: EyeOff, text: "Sem acesso a respostas individuais" },
              { icon: Settings, text: "IA agregada por padrão" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.03]0 border border-white/50">
                <item.icon className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-600">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Add New Access Form */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-serif font-semibold mb-6">Adicionar novo acesso</h3>
          <form onSubmit={handleGrantAccess} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Nome completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm" 
                  placeholder="Ex: João Silva" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">E-mail corporativo</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm" 
                  placeholder="email@empresa.com" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Nível de Role</label>
                <div className="relative">
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm appearance-none"
                  >
                    <option>Administrador</option>
                    <option>RH</option>
                    <option>Liderança</option>
                    <option>Gestor</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Área permitida</label>
                <input 
                  type="text" 
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm" 
                  placeholder="Ex: Marketing (Opcional)" 
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg mt-4 group"
            >
              Conceder acesso
              <ShieldCheck className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
            </button>
          </form>
        </section>

        {/* Governance Logs */}
        <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-serif font-semibold">Logs de governança</h3>
          </div>
          
          <div className="space-y-4">
            {governanceLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-orange-200 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.event}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{log.date}</p>
                </div>
              </div>
            ))}
          </div>
          
          <p className="mt-6 text-[10px] text-gray-400 font-medium italic">
            * Logs administrativos não exibem dados emocionais.
          </p>
        </section>

        {/* Ethical Reading */}
        <section className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 text-[#111] relative overflow-hidden text-center shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full" />
          
          <div className="relative z-10">
            <h3 className="font-serif text-2xl mb-4 leading-tight">
              O objetivo é proteger pessoas, não monitorá-las.
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              O Enterprise foi desenhado para separar cuidado coletivo de vigilância individual.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/enterprise/rh/integracoes')}
                className="w-full py-4 rounded-2xl bg-[#F88A2B] text-[#111] font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Configurar integrações
              </button>
              
              <button 
                onClick={() => navigate('/enterprise/rh')}
                className="w-full py-4 rounded-2xl bg-black/[0.03] text-[#111] font-bold text-sm border border-black/5 hover:bg-black/5 transition-all"
              >
                Voltar ao módulo RH
              </button>
            </div>
          </div>
        </section>

        <footer className="text-center">
          <p className="text-[10px] text-gray-400 leading-relaxed max-w-[240px] mx-auto">
            Todas as permissões respeitam anonimização automática e proteção emocional coletiva.
          </p>
        </footer>
      </main>
    </EnterpriseRHLayout>
  );
};

export default EnterprisePermissionsScreen;