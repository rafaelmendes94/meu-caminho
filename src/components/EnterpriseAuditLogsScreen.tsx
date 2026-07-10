import React, { useEffect, useMemo, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";

type LogRow = {
  id: string;
  action: string;
  entity_type: string;
  actor_user_id: string | null;
  metadata: any;
  created_at: string;
};

const ENTITY_CATEGORY: Record<string, { name: string; icon: any }> = {
  profile: { name: "Colaboradores", icon: Users },
  department: { name: "Departamentos", icon: Settings },
  unit: { name: "Unidades", icon: Settings },
  org_setting: { name: "Configurações", icon: Settings },
  alert: { name: "Alertas", icon: AlertCircle },
  dna_report: { name: "DNA Organizacional", icon: FileText },
  action_plan: { name: "Planos de Ação", icon: FileText },
  invite: { name: "Convites", icon: Users },
  export: { name: "Exportações", icon: Download },
  consent: { name: "Consentimentos", icon: Lock },
  role: { name: "Permissões", icon: Key },
};

const EnterpriseAuditLogsScreen = () => {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [actors, setActors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("organization_audit_logs")
      .select("id,action,entity_type,actor_user_id,metadata,created_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(200);
    const rows = (data ?? []) as LogRow[];
    setLogs(rows);
    const ids = Array.from(new Set(rows.map((r) => r.actor_user_id).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,full_name").in("id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => { map[p.id] = p.full_name ?? "—"; });
      setActors(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [organization?.id]);
  useRealtime(
    "org_audit_logs",
    organization?.id ? [{ table: "organization_audit_logs", filter: `organization_id=eq.${organization.id}` }] : [],
    () => load(),
    [organization?.id]
  );

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => { counts[l.entity_type] = (counts[l.entity_type] ?? 0) + 1; });
    return Object.entries(counts).map(([k, count]) => ({
      key: k,
      name: ENTITY_CATEGORY[k]?.name ?? k,
      icon: ENTITY_CATEGORY[k]?.icon ?? Settings,
      count,
      desc: `${count} evento(s) registrado(s)`,
    }));
  }, [logs]);

  const filterOptions = ["Todos", ...categories.map((c) => c.name)];

  const startToday = new Date(); startToday.setHours(0,0,0,0);
  const eventsToday = logs.filter((l) => new Date(l.created_at) >= startToday).length;
  const permissionChanges = logs.filter((l) => l.entity_type === "role" || l.action.includes("role")).length;
  const exportEvents = logs.filter((l) => l.entity_type === "export" || l.action.includes("export")).length;

  const filteredLogs = activeFilter === "Todos"
    ? logs
    : logs.filter((l) => (ENTITY_CATEGORY[l.entity_type]?.name ?? l.entity_type) === activeFilter);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const today = new Date(); today.setHours(0,0,0,0);
    const dDay = new Date(d); dDay.setHours(0,0,0,0);
    const diff = (today.getTime() - dDay.getTime()) / 86400000;
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (diff === 0) return `Hoje · ${time}`;
    if (diff === 1) return `Ontem · ${time}`;
    return `${d.toLocaleDateString("pt-BR")} · ${time}`;
  };

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
            { label: "Eventos hoje", value: String(eventsToday), icon: Clock },
            { label: "Total registrado", value: String(logs.length), icon: History },
            { label: "Exportações", value: String(exportEvents), icon: Download },
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
            {filterOptions.map((filter) => (
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
          {loading && <p className="text-sm text-[#999] px-4">Carregando…</p>}
          {!loading && filteredLogs.length === 0 && (
            <p className="text-sm text-[#999] px-4">Nenhum evento registrado ainda.</p>
          )}
          <div className="relative space-y-6 px-4">
            <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-[#E5E0DA]/50" />
            {filteredLogs.slice(0, 30).map((activity, i) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.05 }}
                className="relative flex items-start gap-6 group"
              >
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E5E0DA] flex items-center justify-center relative z-10 shadow-sm group-hover:border-[#F88A2B] transition-colors shrink-0">
                  <div className="w-1.5 h-1.5 bg-[#F88A2B] rounded-full" />
                </div>
                <div className="flex-1 bg-white/60 backdrop-blur-sm p-5 rounded-[1.5rem] border border-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">
                      {ENTITY_CATEGORY[activity.entity_type]?.name ?? activity.entity_type}
                    </span>
                    <span className="text-[10px] font-medium text-[#0B0908]/30">{fmt(activity.created_at)}</span>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed">
                    <span className="text-[#0B0908]/40 font-medium">
                      {activity.actor_user_id ? (actors[activity.actor_user_id] ?? "Usuário") : "Sistema"}
                    </span>{" "}
                    {activity.action}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Categorias de auditoria */}
        <section className="space-y-6">
          <h3 className="text-xl font-playfair font-semibold px-2">Categorias de auditoria</h3>
          {categories.length === 0 && (
            <p className="text-sm text-[#999] px-4">Sem categorias registradas.</p>
          )}
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
