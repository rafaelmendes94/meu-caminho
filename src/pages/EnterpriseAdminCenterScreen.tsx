import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  Bell, 
  HelpCircle, 
  Settings, 
  Users, 
  Building2, 
  ShieldCheck, 
  Lock, 
  EyeOff,
  ChevronRight, 

  Activity, 
  CreditCard, 
  FileCheck, 
  History, 
  Database, 
  MessageSquare, 
  Globe, 
  UserPlus, 
  Upload, 
  Key, 
  Puzzle, 
  ShieldAlert, 
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  Dna
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

function iconForEntity(entity?: string | null) {
  switch (entity) {
    case "profile": return Users;
    case "department": return Building2;
    case "unit": return Globe;
    case "alert": return ShieldAlert;
    case "action_plan": return CheckCircle2;
    case "organizational_dna_report": return Dna;
    default: return Activity;
  }
}

const EnterpriseAdminCenterScreen = () => {
  const navigate = useNavigate();
  const { user, profile, organization } = useAuth();
  const [kpiValues, setKpiValues] = useState({
    activeEmployees: "—",
    units: "—",
    licenseUsage: "—",
    compliance: "—",
  });
  const [recentActivity, setRecentActivity] = useState<
    Array<{ title: string; date: string; icon: any }>
  >([]);
  const [latestInsight, setLatestInsight] = useState<{
    title: string;
    summary: string | null;
    recs: string[];
    week_of: string;
  } | null>(null);
  const [orgStatus, setOrgStatus] = useState<Array<{ label: string; val: string; ok: boolean; icon: any }>>([]);

  useEffect(() => {
    if (!organization?.id) return;
    void (async () => {
      const [{ count: emp }, { count: unt }, { data: contract }, { data: logs }, { data: consents }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", organization.id)
            .is("deleted_at", null),
          supabase
            .from("units")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", organization.id),
          supabase
            .from("organization_contracts")
            .select("licenses_total, status")
            .eq("organization_id", organization.id)
            .maybeSingle(),
          supabase
            .from("organization_audit_logs")
            .select("action, entity_type, created_at, actor_name")
            .eq("organization_id", organization.id)
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("consent_events")
            .select("id, event_type")
            .eq("organization_id", organization.id),
        ]);

      const licenseTxt =
        contract && "licenses_total" in contract && contract.licenses_total
          ? `${emp ?? 0}/${contract.licenses_total}`
          : "sem contrato";

      let consentsPct = "—";
      if (consents && consents.length > 0) {
        const granted = consents.filter((c: any) => c.event_type === "granted").length;
        consentsPct = `${Math.round((granted / consents.length) * 100)}%`;
      }

      setKpiValues({
        activeEmployees: String(emp ?? 0),
        units: String(unt ?? 0),
        licenseUsage: licenseTxt,
        compliance: consentsPct,
      });

      setRecentActivity(
        (logs ?? []).map((l: any) => ({
          title: `${l.actor_name ?? "Sistema"} · ${l.entity_type} ${l.action}`,
          date: new Date(l.created_at).toLocaleString("pt-BR"),
          icon: iconForEntity(l.entity_type),
        }))
      );

      // B-04: leitura estratégica real (última insight semanal)
      const { data: insight } = await supabase
        .from("weekly_ai_insights")
        .select("title, summary, recommended_actions, week_of")
        .eq("organization_id", organization.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (insight) {
        const rawRecs = (insight as any).recommended_actions;
        const recs = Array.isArray(rawRecs)
          ? rawRecs
              .map((r: any) => (typeof r === "string" ? r : r?.title || r?.action || ""))
              .filter(Boolean)
              .slice(0, 4)
          : [];
        setLatestInsight({
          title: (insight as any).title,
          summary: (insight as any).summary,
          recs,
          week_of: (insight as any).week_of,
        });
      } else {
        setLatestInsight(null);
      }

      // B-05: status organizacional real (settings é k/v)
      const [{ data: settingsRows }, { data: minGroupData }] = await Promise.all([
        supabase
          .from("organization_settings")
          .select("key, value")
          .eq("organization_id", organization.id)
          .in("key", ["direct_channel", "privacy_min_group_size"]),
        supabase.rpc("get_org_min_group_size", { _organization_id: organization.id }),
      ]);
      const settingsMap = new Map(
        (settingsRows ?? []).map((r: any) => [r.key, r.value])
      );
      const directChannel = settingsMap.get("direct_channel");
      const directChannelOn = directChannel === undefined || directChannel === true || directChannel === "true";
      const minGroup = (minGroupData as number | null) ?? 5;
      const org = organization as any;
      const hasDomain = !!org?.domain;
      const hasSlug = !!org?.slug;
      const anonOk = minGroup >= 5;
      setOrgStatus([
        {
          label: "Compliance",
          val: contract?.status === "active" ? "Ativo" : contract?.status || "Sem contrato",
          ok: contract?.status === "active",
          icon: ShieldCheck,
        },
        {
          label: `Anonimização (k≥${minGroup})`,
          val: anonOk ? "Ativa" : "Abaixo do mínimo",
          ok: anonOk,
          icon: Lock,
        },
        {
          label: "Canal Direto",
          val: directChannelOn ? "Ativo" : "Desativado",
          ok: directChannelOn,
          icon: MessageSquare,
        },
        {
          label: "Domínio",
          val: hasDomain ? "Validado" : "Não configurado",
          ok: hasDomain,
          icon: Globe,
        },
        {
          label: "Identidade pública",
          val: hasSlug ? "Configurada" : "Não configurada",
          ok: hasSlug,
          icon: Key,
        },
        {
          label: "Auditoria",
          val: (logs?.length ?? 0) > 0 ? "Registrando" : "Sem atividade",
          ok: (logs?.length ?? 0) > 0,
          icon: History,
        },
      ]);
    })();
  }, [organization?.id]);

  const kpis = [
    { label: "Colaboradores ativos", value: kpiValues.activeEmployees, icon: Users },
    { label: "Unidades", value: kpiValues.units, icon: Building2 },
    { label: "Licenças em uso", value: kpiValues.licenseUsage, icon: FileCheck },
    { label: "Consentimentos válidos", value: kpiValues.compliance, icon: ShieldCheck },
  ];

  const governanceCards = [
    {
      title: "Dados da empresa",
      desc: "Configure identidade, contatos e preferências organizacionais.",
      path: "/enterprise/rh/configuracoes",
      icon: Building2
    },
    {
      title: "Unidades",
      desc: "Visualize regiões, filiais e hubs organizacionais.",
      path: "/enterprise/rh/unidades",
      icon: Globe
    },
    {
      title: "Múltiplos administradores",
      desc: "Distribua acessos e responsabilidades executivas.",
      path: "/enterprise/rh/multiplos-admins",
      icon: Users
    },
    {
      title: "Permissões",
      desc: "Controle acessos organizacionais.",
      path: "/enterprise/rh/permissoes",
      icon: Lock
    },
    {
      title: "Inteligência Preditiva",
      desc: "Antecipe riscos organizacionais com base em sinais agregados de energia, engajamento, comunicação e recuperação.",
      path: "/enterprise/rh/alertas",
      icon: Sparkles
    },
    {
      title: "DNA Organizacional™",
      desc: "Visão executiva do comportamento coletivo da organização baseada em Inteligência Artificial e dados agregados.",
      path: "/enterprise/rh/dna-organizacional",
      icon: Dna
    },
    {
      title: "Conselho Executivo IA™",
      desc: "Converse com a IA utilizando somente dados organizacionais autorizados e agregados.",
      path: "/enterprise/rh/conselho-executivo",
      icon: Sparkles
    }
  ];

  const privacyCards = [
    { title: "Compliance Enterprise", path: "/enterprise/rh/compliance", icon: ShieldCheck },
    { title: "Privacy Center", path: "/enterprise/rh/privacidade", icon: FileCheck },
    { title: "Retenção de dados", path: "/enterprise/rh/retencao-dados", icon: Database },
    { title: "Políticas", path: "/enterprise/rh/politicas", icon: Lock },
    { title: "Canal Direto RH", path: "/enterprise/sos-rh", icon: MessageSquare },
    { title: "Auditoria", path: "/enterprise/rh/auditoria", icon: History },

  ];

  const operationCards = [
    { title: "Billing", desc: "Gestão financeira", icon: CreditCard, path: "/enterprise/rh/billing" },
    { title: "Licenças", desc: "Controle de planos", icon: FileCheck, path: "/enterprise/rh/equipe/licencas" },
    { title: "Convites", desc: "Gestão de acessos", icon: UserPlus, path: "/enterprise/rh/equipe/convidar" },
    { title: "Importação", desc: "Dados de colaboradores", icon: Upload, path: "/enterprise/rh/equipe/importar" },
    { title: "Domínio", desc: "Validação oficial", icon: Globe, path: "/enterprise/rh/dominio" },
    { title: "Integrações", desc: "Ecossistema tech", icon: Puzzle, path: "/enterprise/rh/integracao" },
    { title: "Notificações", desc: "Alertas do sistema", icon: Bell, path: "/enterprise/rh/notificacoes" },
    { title: "Suporte", desc: "Cuidado direto", icon: HelpCircle, path: "/enterprise/rh/suporte" },
  ];

  return (
    <EnterpriseRHLayout title="Central Admin">
      <div className="space-y-12 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[#F88A2B]/10 flex items-center justify-center text-[#F88A2B] font-bold">
                {(profile?.full_name ?? user?.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F88A2B] uppercase tracking-wider">Enterprise Active</div>
              <h2 className="font-bold text-sm">{profile?.full_name ?? user?.email ?? "—"}</h2>
              <p className="text-[10px] text-zinc-400">{organization?.name ?? "Enterprise"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0B0908] text-white shadow-md hover:bg-zinc-800 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-bold text-[#0B0908]">Central Administrativa</h1>
          <p className="text-xs text-zinc-500">Governança organizacional, privacidade e operações Enterprise em um único espaço.</p>
        </div>
        {/* Hero Principal */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-14 text-[#0B0908] relative overflow-hidden shadow-sm border border-zinc-100 group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F88A2B]/5 blur-[120px] rounded-full -mr-40 -mt-40 transition-opacity group-hover:opacity-80"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-[#F88A2B]">
              <div className="w-10 h-10 rounded-full bg-[#F88A2B]/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Governança protegida</span>
            </div>
            
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-['Playfair_Display'] leading-tight text-[#0B0908]">
                A inteligência organizacional precisa de uma <span className="text-[#F88A2B]">base ética</span> sólida.
              </h2>
              <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-2xl">
                O Enterprise conecta cultura, governança e privacidade em uma operação organizacional sofisticada.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-32 opacity-5 pointer-events-none">
            <svg viewBox="0 0 1000 100" className="w-full h-full preserve-3d">
              <path d="M0,50 Q250,0 500,50 T1000,50" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M0,70 Q250,20 500,70 T1000,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F88A2B]/5 flex items-center justify-center text-[#F88A2B] mb-6 group-hover:scale-110 transition-transform">
                <kpi.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0B0908]">{kpi.value}</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">{kpi.label}</div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Governança Organizacional */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Governança organizacional</h3>
            <div className="h-px flex-1 bg-zinc-100 mx-6 hidden md:block"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {governanceCards.map((card, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => navigate(card.path)}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col justify-between cursor-pointer hover:border-[#F88A2B]/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="space-y-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-[#0B0908] group-hover:bg-[#F88A2B] group-hover:text-white transition-colors">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg text-[#0B0908]">{card.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{card.desc}</p>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-[#F88A2B] transition-colors">
                  Acessar área <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Privacidade & Compliance */}
        <section className="space-y-8">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Privacidade & Compliance</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {privacyCards.map((card, idx) => (
              <motion.button 
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(card.path)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center gap-4 text-center hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[#F88A2B]/10 group-hover:text-[#F88A2B] transition-colors">
                  <card.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#0B0908] uppercase tracking-tight">{card.title}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Operação Enterprise */}
        <section className="space-y-8">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Operação Enterprise</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {operationCards.map((card, idx) => (
              <div 
                key={idx} 
                onClick={() => card.path && navigate(card.path)}
                className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white hover:border-[#F88A2B]/20 transition-all cursor-pointer group flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0B0908] group-hover:bg-[#0B0908] group-hover:text-white transition-all">
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B0908]">{card.title}</h4>
                  <p className="text-[10px] text-zinc-400">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Status Organizacional */}
        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-zinc-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-md">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#F88A2B]">Status organizacional</h3>
              <p className="text-xl font-['Playfair_Display'] font-bold text-[#0B0908]">A operação Enterprise está em conformidade total e protegida.</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Todos os protocolos de anonimização e segurança de dados estão ativos e validados.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {orgStatus.length === 0 && (
                <p className="text-[11px] text-zinc-400 italic col-span-full">Carregando status…</p>
              )}
              {orgStatus.map((status, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className={`flex items-center gap-2 ${status.ok ? "text-emerald-600" : "text-amber-600"}`}>
                    {status.ok ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{status.val}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium">{status.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leitura Estratégica & Atividade Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Leitura estratégica</h3>
            <div className="bg-white/40 backdrop-blur-md border border-white p-8 rounded-[2.5rem] shadow-sm space-y-8 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#F88A2B]/10 blur-2xl rounded-full" />
              
              <div className="space-y-4">
                <Sparkles className="w-8 h-8 text-[#F88A2B]" />
                {latestInsight ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">
                      Semana de {new Date(latestInsight.week_of).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm md:text-base text-[#0B0908] leading-relaxed font-medium">
                      {latestInsight.summary || latestInsight.title}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-zinc-500 italic">
                    Nenhuma leitura estratégica disponível ainda. Gere um insight semanal para começar.
                  </p>
                )}
              </div>

              {latestInsight && (
                <button
                  onClick={() => navigate("/enterprise/rh/insights-semanais")}
                  className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] hover:underline"
                >
                  Ver insights semanais →
                </button>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Próximas recomendações</h3>
              <div className="space-y-3">
                {(latestInsight?.recs.length ?? 0) === 0 && (
                  <p className="text-[11px] text-zinc-400 italic">Nenhuma recomendação ativa da IA.</p>
                )}
                {(latestInsight?.recs ?? []).map((rec, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate("/enterprise/rh/plano-acao")}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-50 flex items-center justify-between group cursor-pointer hover:border-[#F88A2B]/20 transition-all"
                  >
                    <span className="text-xs font-bold text-[#0B0908]">{rec}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#F88A2B] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

            <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Atividade recente</h3>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100 space-y-8">
              {recentActivity.length === 0 && (
                <p className="text-[12px] text-zinc-400 italic">Nenhuma ação administrativa registrada ainda.</p>
              )}
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex gap-6 relative">
                  {idx !== recentActivity.length - 1 && <div className="absolute left-[15px] top-10 w-[1px] h-12 bg-zinc-100" />}
                  <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 relative z-10 group-hover:bg-[#F88A2B]/10 group-hover:text-[#F88A2B] transition-colors">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pb-8 border-b border-zinc-50 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-[#0B0908]">{item.title}</p>
                      <span className="text-[10px] text-zinc-400 font-medium">{item.date}</span>
                    </div>
                    <p className="text-xs text-zinc-500">Registrada em organization_audit_logs.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Princípio do Enterprise */}
        <section className="bg-[#0B0908] rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F88A2B]/5 blur-[120px] rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="space-y-8 md:w-1/2">
              <div className="bg-[#F88A2B]/10 text-[#F88A2B] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-[#F88A2B]/20 w-fit">
                Ética por desenho
              </div>
              <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] leading-tight">
                Governança existe para proteger pessoas.
              </h2>
              <p className="text-zinc-400 text-sm md:text-lg leading-relaxed">
                O Enterprise foi desenhado para ajudar organizações a evoluir emocionalmente sem transformar cuidado em vigilância.
              </p>
            </div>

            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Privacidade preservada", icon: Lock },
                { title: "Inteligência coletiva", icon: Sparkles },
                { title: "Ética organizacional", icon: ShieldCheck },
                { title: "Anonimização ativa", icon: EyeOff },
                { title: "Governança transparente", icon: Globe }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                  <item.icon className="w-5 h-5 text-[#F88A2B] mb-4" />
                  <span className="text-xs font-bold">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 pt-8">
          <button 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            className="flex-1 bg-[#F88A2B] text-white py-6 rounded-[2rem] font-bold text-base shadow-xl shadow-[#F88A2B]/20 active:scale-[0.98] transition-all hover:bg-[#e07a20] flex items-center justify-center gap-3"
          >
            <LayoutDashboard className="w-5 h-5" /> Acessar dashboard executivo
          </button>
          <button 
            onClick={() => navigate('/enterprise')}
            className="flex-1 bg-white text-[#0B0908] border border-zinc-200 py-6 rounded-[2rem] font-bold text-base active:scale-[0.98] transition-all hover:bg-zinc-50 flex items-center justify-center gap-3"
          >
            <ArrowLeft className="w-5 h-5" /> Voltar ao Enterprise
          </button>
        </div>

        <footer className="pt-8 pb-12 text-center">
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[400px] mx-auto italic">
            "A administração Enterprise deve equilibrar governança, privacidade e humanidade para fortalecer o ecossistema emocional da organização."
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseAdminCenterScreen;