import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Send, 
  Copy, 
  XCircle, 
  TrendingUp, 
  ShieldCheck, 
  Lock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  PieChart,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";
import { toast as sonner } from "sonner";

const EnterpriseLicensesScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization } = useAuth();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [distribution, setDistribution] = useState<Array<{ name: string; active: number }>>([]);
  const [pendingInvites, setPendingInvites] = useState<Array<{ id: string; email: string; full_name: string | null; department: string | null; created_at: string }>>([]);
  const [busyInvite, setBusyInvite] = useState<string | null>(null);

  const load = async () => {
    if (!organization?.id) return;
    const { count } = await supabase
      .from("enterprise_invites")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .is("accepted_at", null).is("canceled_at", null).is("declined_at", null);
    setPendingCount(count ?? 0);
    const { data: profs } = await supabase
      .from("profiles")
      .select("departments(name)")
      .eq("organization_id", organization.id)
      .is("deleted_at", null);
    const bucket: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (profs as any[] ?? []).forEach((p) => {
      const name = p.departments?.name ?? "Sem departamento";
      bucket[name] = (bucket[name] ?? 0) + 1;
    });
    setDistribution(Object.entries(bucket).map(([name, active]) => ({ name, active })).sort((a, b) => b.active - a.active));
    const { data: pends } = await supabase
      .from("enterprise_invites")
      .select("id, email, full_name, department, created_at")
      .eq("organization_id", organization.id)
      .is("accepted_at", null).is("canceled_at", null).is("declined_at", null)
      .order("created_at", { ascending: false })
      .limit(10);
    setPendingInvites((pends as typeof pendingInvites) ?? []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [organization?.id]);

  const total = organization?.licenses_total ?? 0;
  const used = organization?.licenses_used ?? 0;
  const available = Math.max(total - used, 0);
  const usagePct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  const handleInviteAction = async (invite_id: string, action: "cancel" | "resend") => {
    setBusyInvite(invite_id);
    const { data, error } = await supabase.functions.invoke("manage-enterprise-invite", { body: { invite_id, action } });
    setBusyInvite(null);
    const err = (data as { error?: string } | null)?.error ?? error?.message;
    if (err) { sonner.error(err); return; }
    if (action === "resend") {
      const link = (data as { invite_link?: string } | null)?.invite_link;
      if (link) { navigator.clipboard.writeText(link).catch(() => {}); sonner.success("Convite reenviado. Link copiado."); }
      else sonner.success("Convite reenviado.");
    } else {
      sonner.success("Convite cancelado.");
    }
    load();
  };
  const maxDept = distribution.reduce((m, d) => Math.max(m, d.active), 0) || 1;

  return (
    <EnterpriseRHLayout title="Licenças">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] text-[#0B0908] font-montserrat overflow-y-auto pb-32">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#F7F4F2]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border border-[#E5E0DA] flex items-center justify-center hover:bg-[#F88A2B]/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Licenças Enterprise</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-[#F88A2B] rounded-full" />
              <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider">Gestão organizacional</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 max-w-3xl mx-auto space-y-12 pt-4">
        
        {/* Hero Section */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B]/10 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/[0.03] blur-[80px] rounded-full -ml-10 -mb-10" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                <span className="text-[11px] font-bold text-orange-50 tracking-[0.15em] uppercase">Escalabilidade segura</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-playfair text-[#111] leading-[1.15]">
                A jornada emocional <br/>
                <span className="text-[#F88A2B]">cresce junto com a empresa.</span>
              </h2>
              
              <p className="text-orange-50/70 text-base leading-relaxed max-w-xl">
                Gerencie acessos, disponibilidade e expansão do Enterprise mantendo uma experiência organizada e humana.
              </p>
            </div>
          </motion.div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Licenças contratadas", value: String(total), icon: Users },
            { label: "Colaboradores ativos", value: String(used), icon: CheckCircle2 },
            { label: "Convites pendentes", value: pendingCount === null ? "—" : String(pendingCount), icon: Send },
            { label: "Licenças disponíveis", value: String(available), icon: UserPlus }
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

        {/* Uso atual */}
        <section className="space-y-4">
          <div className="bg-white border border-[#E5E0DA] rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Uso atual da capacidade</h3>
              <span className="text-sm font-bold text-[#F88A2B]">79% utilizado</span>
            </div>
            
            <div className="space-y-3">
              <div className="h-4 w-full bg-[#F7F4F2] rounded-full overflow-hidden p-1 border border-[#E5E0DA]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "79%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#F88A2B] to-[#FBBF24] rounded-full shadow-[0_0_15px_rgba(248,138,43,0.3)] relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-[#0B0908]/40 uppercase tracking-widest px-1">
                <span>198 colaboradores ativos</span>
                <span>250 licenças totais</span>
              </div>
            </div>
          </div>
        </section>

        {/* Distribuição por área */}
        <section className="space-y-6">
          <h3 className="text-xl font-playfair font-semibold px-2">Distribuição por área</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept, i) => (
              <motion.div 
                key={dept.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#E5E0DA] p-6 rounded-3xl flex flex-col gap-4 shadow-sm group hover:border-[#F88A2B]/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base">{dept.name}</span>
                  <span className="text-sm font-bold text-[#0B0908]/40">{dept.active} ativos</span>
                </div>
                <div className="h-1.5 w-full bg-[#F7F4F2] rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${dept.color} transition-all duration-1000`} 
                    style={{ width: `${(dept.active / 60) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Convites aguardando ativação */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-playfair font-semibold">Convites aguardando ativação</h3>
            <span className="text-xs font-bold text-[#F88A2B] uppercase tracking-widest">21 pendentes</span>
          </div>

          <div className="space-y-3">
            {pendingInvites.map((invite, i) => (
              <motion.div 
                key={invite.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/60 backdrop-blur-sm border border-white p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#0B0908]/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{invite.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#0B0908]/40">{invite.area}</span>
                      <span className="w-1 h-1 bg-[#E5E0DA] rounded-full" />
                      <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-tighter">{invite.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleResend}
                    className="p-3 rounded-xl bg-white border border-[#E5E0DA] text-[#0B0908]/60 hover:text-[#F88A2B] hover:border-[#F88A2B]/20 transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className="p-3 rounded-xl bg-white border border-[#E5E0DA] text-[#0B0908]/60 hover:text-[#0B0908] transition-all shadow-sm"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-3 rounded-xl bg-white border border-[#E5E0DA] text-[#0B0908]/60 hover:text-red-400 hover:border-red-100 transition-all shadow-sm">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Expansão recomendada */}
        <section>
          <div className="bg-[#F88A2B]/5 border border-[#F88A2B]/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/10 blur-[40px] rounded-full -mr-10 -mt-10" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-md">
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-orange-100 shadow-sm mb-2">
                  <TrendingUp className="w-3 h-3 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest">Crescimento detectado</span>
                </div>
                <h3 className="text-2xl font-playfair font-semibold leading-tight">A empresa está próxima do limite ideal.</h3>
                <p className="text-sm text-[#0B0908]/60 leading-relaxed">
                  Com o crescimento atual de adesão, recomendamos reservar novas licenças para futuras ativações.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-[2rem] border border-orange-100 shadow-xl shadow-orange-900/5 min-w-[200px]">
                <span className="text-3xl font-playfair font-bold text-[#F88A2B]">+50</span>
                <span className="text-[10px] font-bold text-[#0B0908]/40 uppercase tracking-widest text-center">Licenças sugeridas</span>
                <button className="w-full bg-[#F88A2B] text-[#111] py-3 rounded-xl text-xs font-bold shadow-lg shadow-orange-200 hover:scale-[1.02] transition-all">
                  Solicitar expansão
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Como funcionam as licenças */}
        <section className="space-y-6">
          <h3 className="text-xl font-playfair font-semibold px-2">Entendendo a gestão</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Licença ativa", desc: "Conta criada e colaborador ativo na jornada.", icon: CheckCircle2 },
              { title: "Convite pendente", desc: "Reserva temporária aguardando ativação inicial.", icon: Send },
              { title: "Licença liberada", desc: "Espaço disponível para novos convites na equipe.", icon: UserPlus },
              { title: "Privacidade preservada", desc: "Controle de acesso sem visibilidade emocional.", icon: Lock }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#E5E0DA] p-6 rounded-3xl flex items-start gap-4 shadow-sm group">
                <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B] shrink-0 group-hover:bg-[#F88A2B]/10 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base">{item.title}</h4>
                  <p className="text-xs text-[#0B0908]/50 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Proteção organizacional */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 text-[#111] space-y-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full -mr-10 -mt-10" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-playfair leading-snug">Gestão administrativa <br/> <span className="text-[#F88A2B]">sem exposição emocional.</span></h2>
                <p className="text-sm text-[#777] leading-relaxed max-w-lg">
                  O controle de licenças não oferece acesso a jornadas emocionais individuais. A expansão foca em pessoas, nunca em monitoramento.
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-black/[0.03] border border-black/5 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8 text-[#F88A2B]" />
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: AlertCircle, text: "Sem respostas emocionais" },
                { icon: MessageSquare, text: "Sem acesso à IA privada" },
                { icon: PieChart, text: "Sem score individual" },
                { icon: CheckCircle2, text: "Apenas status de acesso" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/[0.03] p-3 rounded-xl border border-white/5">
                  <item.icon className="w-4 h-4 text-[#F88A2B]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#333]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4 pt-4">
          <button 
            onClick={() => navigate("/enterprise/rh/equipe/convidar")}
            className="w-full bg-[#F88A2B] text-[#111] py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span className="font-bold text-lg tracking-tight">Convidar colaboradores</span>
            <UserPlus className="w-5 h-5" />
          </button>

          <button 
            onClick={() => navigate("/enterprise/rh/equipe")}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[#0B0908]/40 hover:text-[#0B0908] transition-colors"
          >
            <span className="font-semibold text-sm">Ver equipe completa</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="pt-8 text-center">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-xs mx-auto">
              A escalabilidade do Enterprise deve crescer sem perder humanidade.
            </p>
          </div>
        </section>
      </main>
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseLicensesScreen;
