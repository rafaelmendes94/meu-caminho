import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  ShieldAlert, 
  Download, 
  Share2, 
  Users, 
  Settings, 
  Lock, 
  EyeOff, 
  FileText, 
  Key, 
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  History
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseAuditLogsScreen = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Todos");

  const categories = [
    { name: "Permissões", icon: Key, count: 18, desc: "Alterações de níveis de acesso" },
    { name: "Convites", icon: Users, count: 42, desc: "Envio de acessos ao time" },
    { name: "Integrações", icon: Share2, count: 5, desc: "Conexões externas e APIs" },
    { name: "Exportações", icon: Download, count: 7, desc: "Relatórios e dados gerados" },
    { name: "Privacidade", icon: Lock, count: 3, desc: "Ajustes de anonimização" },
    { name: "Configurações", icon: Settings, count: 12, desc: "Mudanças organizacionais" }
  ];

  const recentActivity = [
    { 
      admin: "Marina Costa", 
      action: "alterou permissões de liderança", 
      time: "Hoje · 09:42", 
      category: "Permissões",
      icon: Key 
    },
    { 
      admin: "Sistema", 
      action: "Relatório executivo exportado", 
      time: "Hoje · 08:17", 
      category: "Exportações",
      icon: Download 
    },
    { 
      admin: "Admin RH", 
      action: "Integração Slack conectada", 
      time: "Ontem · 18:03", 
      category: "Integrações",
      icon: Share2 
    },
    { 
      admin: "Marina Costa", 
      action: "42 convites enviados para colaboradores", 
      time: "Ontem · 15:12", 
      category: "Convites",
      icon: Users 
    },
    { 
      admin: "Diretoria", 
      action: "Política de anonimização atualizada", 
      time: "Ontem · 10:40", 
      category: "Privacidade",
      icon: Lock 
    }
  ];

  return (
    <EnterpriseRHLayout title="Logs de auditoria">
      <div className="space-y-12 animate-fade-in py-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border border-[#E5E0DA] flex items-center justify-center hover:bg-[#F88A2B]/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#0B0908]">Auditoria Enterprise</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-[#F88A2B] rounded-full" />
              <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider">Governança</span>
            </div>
          </div>
        </div>
        
        {/* Hero Section */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B]/10 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                <span className="text-[11px] font-bold text-orange-50 tracking-[0.15em] uppercase">Logs protegidos</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-playfair text-[#111] leading-[1.15]">
                Transparência organizacional <br/>
                <span className="text-[#F88A2B]">também gera confiança.</span>
              </h2>
              
              <p className="text-orange-50/70 text-base leading-relaxed max-w-xl">
                O Enterprise registra apenas eventos administrativos necessários para segurança e governança da organização.
              </p>
            </div>
          </motion.div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Eventos hoje", value: "42", icon: Clock },
            { label: "Permissões", value: "18", icon: Key },
            { label: "Exportações", value: "7", icon: Download },
            { label: "Logs protegidos", value: "100%", icon: ShieldCheck }
          ].map((kpi, i) => (
            <motion.div 
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-[#E5E0DA] p-5 rounded-3xl flex flex-col gap-3 shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]">
                <kpi.icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-2xl font-playfair font-bold">{kpi.value}</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 leading-tight mt-1">{kpi.label}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Filtros */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2 overflow-x-auto pb-2 no-scrollbar">
            <Filter className="w-4 h-4 text-[#0B0908]/30 mr-2 shrink-0" />
            {["Todos", "Permissões", "Convites", "Integrações", "Exportações", "Privacidade"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  activeFilter === filter 
                  ? "bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] shadow-lg" 
                  : "bg-white border border-[#E5E0DA] text-[#0B0908]/50 hover:border-[#F88A2B]/40"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Atividade Recente */}
        <section className="space-y-6">
          <h3 className="text-xl font-playfair font-semibold px-2">Atividade recente</h3>
          <div className="relative space-y-6 px-4">
            <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-[#E5E0DA]/50" />
            {recentActivity.map((activity, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start gap-6 group"
              >
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E5E0DA] flex items-center justify-center relative z-10 shadow-sm group-hover:border-[#F88A2B] transition-colors shrink-0">
                  <div className="w-1.5 h-1.5 bg-[#F88A2B] rounded-full" />
                </div>
                <div className="flex-1 bg-white/60 backdrop-blur-sm p-5 rounded-[1.5rem] border border-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">{activity.category}</span>
                    <span className="text-[10px] font-medium text-[#0B0908]/30">{activity.time}</span>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed">
                    <span className="text-[#0B0908]/40 font-medium">{activity.admin}</span> {activity.action}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Categorias de auditoria */}
        <section className="space-y-6">
          <h3 className="text-xl font-playfair font-semibold px-2">Categorias de auditoria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.name}
                whileHover={{ y: -4 }}
                className="bg-white border border-[#E5E0DA] p-6 rounded-3xl flex flex-col gap-4 shadow-sm group hover:border-[#F88A2B]/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-[#0B0908]/40 group-hover:text-[#F88A2B] transition-colors">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-playfair font-bold text-[#F88A2B]">{cat.count}</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">{cat.name}</h4>
                  <p className="text-[10px] text-[#0B0908]/40 font-medium leading-relaxed">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Eventos protegidos */}
        <section>
          <div className="bg-white/40 backdrop-blur-sm border border-white rounded-[2.5rem] p-8 md:p-12 space-y-8 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-[#F88A2B]" />
              </div>
              <h3 className="text-xl font-playfair font-semibold">O Enterprise não registra <br/> conteúdo emocional individual.</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: ShieldAlert, text: "Sem respostas emocionais" },
                { icon: MessageSquare, text: "Sem mensagens da IA" },
                { icon: History, text: "Sem histórico privado" },
                { icon: AlertCircle, text: "Sem score pessoal" },
                { icon: FileText, text: "Sem conteúdo confidencial" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <item.icon className="w-4 h-4 text-[#F88A2B]/40" />
                  <span className="text-sm font-medium text-[#0B0908]/60">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Retenção de logs */}
        <section>
          <div className="bg-white border border-[#E5E0DA] rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Retenção de logs</h3>
              <button className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest hover:underline">Configurar retenção</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Logs administrativos", value: "12 meses" },
                { label: "Exportações", value: "90 dias" },
                { label: "Acessos administrativos", value: "6 meses" }
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/30">{item.label}</span>
                  <p className="text-lg font-playfair font-bold text-[#0B0908]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Governança ética */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 text-[#111] space-y-8 shadow-xl relative overflow-hidden text-center md:text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full -mr-10 -mt-10 animate-pulse" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30 mx-auto md:mx-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Privacidade preservada</span>
                </div>
                <h2 className="text-3xl font-playfair leading-tight">A auditoria protege a operação, <br/> <span className="text-[#F88A2B]">não monitora pessoas.</span></h2>
                <p className="text-sm text-[#777] leading-relaxed max-w-lg">
                  O objetivo dos logs administrativos é garantir segurança organizacional sem comprometer privacidade emocional ou jornadas individuais.
                </p>
              </div>
              <div className="w-24 h-24 rounded-full bg-black/[0.03] border border-black/5 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-12 h-12 text-[#F88A2B]" />
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4 pt-4 pb-8">
          <button 
            onClick={() => navigate("/enterprise/rh/permissoes")}
            className="w-full bg-[#F88A2B] text-[#111] py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <Key className="w-5 h-5" />
            <span className="font-bold text-lg tracking-tight">Gerenciar permissões</span>
          </button>

          <button 
            onClick={() => navigate("/enterprise/rh")}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[#0B0908]/40 hover:text-[#0B0908] transition-colors"
          >
            <span className="font-semibold text-sm">Voltar ao módulo RH</span>
          </button>
          
          <div className="pt-8 text-center">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-sm mx-auto">
              A auditoria Enterprise registra apenas operações administrativas necessárias para governança.
            </p>
          </div>
        </section>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseAuditLogsScreen;
