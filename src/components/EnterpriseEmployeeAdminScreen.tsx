import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Building2, 
  Briefcase, 
  Mail, 
  Calendar, 
  UserCircle2, 
  Settings, 
  History, 
  Lock, 
  EyeOff, 
  MessageSquareOff,
  RefreshCw,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Edit2
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseEmployeeAdminScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { organization } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    full_name: "",
    job_title: "",
    department_id: "",
    unit_id: "",
    manager_id: "",
    status: "active",
    hired_at: "",
  });
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [units, setUnits] = useState<Array<{ id: string; name: string }>>([]);
  const [managers, setManagers] = useState<Array<{ id: string; full_name: string | null }>>([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; action: string; created_at: string; metadata: Record<string, unknown> | null }>>([]);
  const [rolesList, setRolesList] = useState<string[]>([]);
  const [pendingInvite, setPendingInvite] = useState<{ id: string; email: string } | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("—");

  useEffect(() => {
    if (!id || !organization?.id) return;
    (async () => {
      const [p, d, u, m, hist, roles] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("departments").select("id,name").eq("organization_id", organization.id).order("name"),
        supabase.from("units").select("id,name").eq("organization_id", organization.id).order("name"),
        supabase.from("profiles").select("id, full_name").eq("organization_id", organization.id).order("full_name"),
        supabase.from("organization_audit_logs")
          .select("id, action, created_at, metadata")
          .eq("organization_id", organization.id)
          .eq("entity_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("user_roles").select("role").eq("user_id", id).eq("organization_id", organization.id),
      ]);
      // deno-lint-ignore no-explicit-any
      const prof: any = p.data;
      if (prof) setForm({
        full_name: prof.full_name ?? "",
        job_title: prof.job_title ?? "",
        department_id: prof.department_id ?? "",
        unit_id: prof.unit_id ?? "",
        manager_id: prof.manager_id ?? "",
        status: prof.status ?? "active",
        hired_at: prof.hired_at ?? "",
      });
      setDeleted(!!prof?.deleted_at);
      setDepartments((d.data as typeof departments) ?? []);
      setUnits((u.data as typeof units) ?? []);
      setManagers(((m.data as typeof managers) ?? []).filter((x) => x.id !== id));
      setHistory((hist.data as typeof history) ?? []);
      setRolesList(((roles.data as Array<{ role: string }>) ?? []).map((r) => r.role));
      // Try to find email via active invite for same user
      const { data: inv } = await supabase.from("enterprise_invites")
        .select("id, email")
        .eq("organization_id", organization.id)
        .not("accepted_at", "is", null)
        .order("accepted_at", { ascending: false })
        .limit(50);
      // fallback: latest pending invite for this profile via full_name match — not reliable, so we skip email
      const { data: pending } = await supabase.from("enterprise_invites")
        .select("id, email, manager_id")
        .eq("organization_id", organization.id)
        .is("accepted_at", null).is("canceled_at", null).is("declined_at", null)
        .limit(50);
      // no direct link — leave email as "—"; if invite has manager_id/dept matching this user, we could use it
      void inv; void pending;
    })();
  }, [id, organization?.id]);

  const save = async () => {
    if (!id) return;
    const isAdmin = rolesList.some((r) => r === "rh_admin" || r === "owner");
    if (!isAdmin && !form.manager_id) {
      toast({
        title: "Gestor imediato é obrigatório",
        description: "Selecione um gestor. Só RH/Owner pode ficar sem gestor (topo da organização).",
        variant: "destructive",
      });
      return;
    }
    if (form.manager_id && form.manager_id === id) {
      toast({ title: "Um colaborador não pode ser gestor de si mesmo", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name || null,
      job_title: form.job_title || null,
      department_id: form.department_id || null,
      unit_id: form.unit_id || null,
      manager_id: form.manager_id || null,
      status: form.status,
      hired_at: form.hired_at || null,
    }).eq("id", id);
    setSaving(false);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Perfil atualizado" }); setEditing(false); }
  };

  const setActive = async (activate: boolean) => {
    if (!id) return;
    setBusyAction("status");
    const { error } = await supabase.from("profiles").update({ status: activate ? "active" : "inactive" }).eq("id", id);
    setBusyAction(null);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: activate ? "Colaborador reativado" : "Colaborador desativado" }); setForm((f) => ({ ...f, status: activate ? "active" : "inactive" })); }
  };

  const softDelete = async () => {
    if (!id) return;
    if (!confirm("Excluir este colaborador? Ele deixará de aparecer nas listas ativas. Esta ação pode ser auditada.")) return;
    setBusyAction("delete");
    const { error } = await supabase.from("profiles").update({ deleted_at: new Date().toISOString(), status: "inactive" }).eq("id", id);
    setBusyAction(null);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Colaborador excluído" }); setDeleted(true); }
  };

  const restore = async () => {
    if (!id) return;
    setBusyAction("restore");
    const { error } = await supabase.from("profiles").update({ deleted_at: null, status: "active" }).eq("id", id);
    setBusyAction(null);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Colaborador restaurado" }); setDeleted(false); }
  };

  // Mock data for the employee
  const employee = {
    name: form.full_name || "—",
    email,
    department: departments.find((d) => d.id === form.department_id)?.name ?? "—",
    role: form.job_title || "—",
    manager: managers.find((m) => m.id === form.manager_id)?.full_name ?? "—",
    activationDate: form.hired_at || "—",
    status: deleted ? "Excluído" : (form.status === "active" ? "Ativo" : form.status === "inactive" ? "Inativo" : form.status),
    licenseStatus: rolesList.length > 0 ? rolesList.join(", ") : "Sem papel",
  };

  return (
    <EnterpriseRHLayout title="Administração de colaboradores">
      <div className="space-y-12 animate-fade-in py-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border border-[#E5E0DA] flex items-center justify-center hover:bg-[#F88A2B]/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Perfil administrativo</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-[#F88A2B] rounded-full" />
              <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider">Gestão Enterprise</span>
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
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-black/5 border border-black/10 flex items-center justify-center overflow-hidden">
                  <UserCircle2 className="w-16 h-16 text-[#BBB]" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0B0908] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              <div className="text-center md:text-left space-y-4 flex-1">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h2 className="text-3xl font-playfair text-[#111]">{employee.name}</h2>
                    <span className="bg-[#F88A2B]/20 text-[#F88A2B] text-[10px] font-bold px-3 py-1 rounded-full border border-[#F88A2B]/30 uppercase tracking-widest">
                      {employee.status}
                    </span>
                  </div>
                  <p className="text-[#666] font-medium">{employee.role} • {employee.department}</p>
                </div>

                <div className="inline-flex items-center gap-2 bg-black/[0.03] backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                  <span className="text-[11px] font-bold text-[#F88A2B] tracking-[0.15em] uppercase">Privacidade preservada</span>
                </div>
                
                <p className="text-[#666] text-sm leading-relaxed max-w-lg">
                  O Enterprise separa administração organizacional de qualquer informação emocional individual.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Informações organizacionais */}
        <section className="space-y-6">
          <div className="bg-white border border-[#E5E0DA] rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-playfair font-semibold">Dados organizacionais</h3>
              <button onClick={() => setEditing((e) => !e)} className="flex items-center gap-2 text-xs font-bold text-[#F88A2B] hover:text-[#0B0908] transition-colors group">
                <Edit2 className="w-3.5 h-3.5" />
                <span>{editing ? "Cancelar" : "Editar dados"}</span>
              </button>
            </div>

            {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: "Nome completo", value: employee.name, icon: UserCircle2 },
                { label: "E-mail corporativo", value: employee.email, icon: Mail },
                { label: "Departamento", value: employee.department, icon: Building2 },
                { label: "Cargo", value: employee.role, icon: Briefcase },
                { label: "Gestor responsável", value: employee.manager, icon: UserCircle2 },
                { label: "Data de ativação", value: employee.activationDate, icon: Calendar },
                { label: "Status da licença", value: employee.licenseStatus, icon: ShieldCheck }
              ].map((info, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-[#0B0908]/20">
                    <info.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/30">{info.label}</span>
                    <p className="text-sm font-semibold text-[#0B0908]">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nome completo">
                  <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="admin-input" />
                </Field>
                <Field label="Cargo">
                  <input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="admin-input" />
                </Field>
                <Field label="Departamento">
                  <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="admin-input">
                    <option value="">—</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
                <Field label="Unidade">
                  <select value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })} className="admin-input">
                    <option value="">—</option>
                    {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </Field>
                <Field label="Gestor">
                  <select value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })} className="admin-input">
                    <option value="">— (apenas RH/Owner)</option>
                    {managers.map((m) => <option key={m.id} value={m.id}>{m.full_name ?? m.id}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-input">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </Field>
                <Field label="Data de contratação">
                  <input type="date" value={form.hired_at} onChange={(e) => setForm({ ...form, hired_at: e.target.value })} className="admin-input" />
                </Field>
                <div className="md:col-span-2 pt-4">
                  <button onClick={save} disabled={saving} className="px-6 py-3 rounded-2xl bg-[#F88A2B] text-white font-bold text-sm uppercase tracking-widest disabled:opacity-50">
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Status da conta */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Conta", value: "Ativa" },
            { label: "Convite", value: "Aceito" },
            { label: "Acesso", value: "Realizado" },
            { label: "Check-in", value: "Ativo" }
          ].map((status, i) => (
            <div key={i} className="bg-white border border-[#E5E0DA] p-5 rounded-3xl flex flex-col gap-2 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/30">{status.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-sm font-bold">{status.value}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Permissões organizacionais */}
        <section className="space-y-4">
          <div className="bg-white/40 backdrop-blur-sm border border-white rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-playfair font-semibold">Nível de acesso</h3>
            <div className="space-y-3">
              {[
                { label: "Colaborador padrão", active: true },
                { label: "Acesso ao app", active: true },
                { label: "Acesso ao Cury Digital", active: true },
                { label: "Notificações habilitadas", active: true },
                { label: "Visão limitada por área", active: false }
              ].map((perm, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-[#E5E0DA]/50 rounded-2xl">
                  <span className="text-sm font-medium text-[#0B0908]/80">{perm.label}</span>
                  <div className={`w-10 h-5 rounded-full p-1 transition-colors ${perm.active ? 'bg-[#F88A2B]' : 'bg-[#E5E0DA]'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${perm.active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Histórico administrativo */}
        <section className="space-y-6">
          <h3 className="text-xl font-playfair font-semibold px-2">Histórico administrativo</h3>
          <div className="relative space-y-4 px-4">
            {history.length === 0 && (
              <p className="text-sm text-[#0B0908]/40 py-4">Sem eventos auditados ainda.</p>
            )}
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-white border-2 border-[#E5E0DA] flex items-center justify-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#F88A2B] rounded-full" />
                </div>
                <div className="flex-1 flex justify-between items-center bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                  <span className="text-sm font-semibold">{h.action}</span>
                  <span className="text-[10px] font-bold text-[#0B0908]/40">
                    {new Date(h.created_at).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ações administrativas */}
        <section className="space-y-6">
          <h3 className="text-xl font-playfair font-semibold px-2">Ações de gestão</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!deleted && form.status === "active" && (
              <button onClick={() => setActive(false)} disabled={busyAction === "status"} className="bg-white border border-[#E5E0DA] p-6 rounded-[2rem] flex flex-col items-center gap-4 hover:border-[#F88A2B]/40 hover:bg-[#F88A2B]/5 transition-all shadow-sm disabled:opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]"><LogOut className="w-6 h-6" /></div>
                <span className="text-sm font-bold text-[#0B0908]">Desativar</span>
              </button>
            )}
            {!deleted && form.status !== "active" && (
              <button onClick={() => setActive(true)} disabled={busyAction === "status"} className="bg-white border border-[#E5E0DA] p-6 rounded-[2rem] flex flex-col items-center gap-4 hover:border-[#F88A2B]/40 hover:bg-[#F88A2B]/5 transition-all shadow-sm disabled:opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]"><RefreshCw className="w-6 h-6" /></div>
                <span className="text-sm font-bold text-[#0B0908]">Reativar</span>
              </button>
            )}
            {!deleted && (
              <button onClick={softDelete} disabled={busyAction === "delete"} className="bg-white border border-red-200 p-6 rounded-[2rem] flex flex-col items-center gap-4 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600"><Lock className="w-6 h-6" /></div>
                <span className="text-sm font-bold text-red-700">Excluir</span>
              </button>
            )}
            {deleted && (
              <button onClick={restore} disabled={busyAction === "restore"} className="bg-white border border-green-200 p-6 rounded-[2rem] flex flex-col items-center gap-4 hover:bg-green-50 transition-all shadow-sm disabled:opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-700"><RefreshCw className="w-6 h-6" /></div>
                <span className="text-sm font-bold text-green-700">Restaurar</span>
              </button>
            )}
            <button onClick={() => setEditing(true)} className="bg-white border border-[#E5E0DA] p-6 rounded-[2rem] flex flex-col items-center gap-4 hover:border-[#F88A2B]/40 hover:bg-[#F88A2B]/5 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]"><Edit2 className="w-6 h-6" /></div>
              <span className="text-sm font-bold text-[#0B0908]">Editar cargo/depto/gestor</span>
            </button>
          </div>
        </section>

        {/* Proteção emocional */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 text-[#111] space-y-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full -mr-10 -mt-10" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-black/5 px-3 py-1 rounded-full border border-black/5">
                  <EyeOff className="w-3.5 h-3.5 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Anonimização ativa</span>
                </div>
                <h2 className="text-2xl font-playfair leading-tight">O RH não possui acesso <br/> <span className="text-[#F88A2B]">emocional individual.</span></h2>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-black/[0.03] border border-black/5 flex items-center justify-center shrink-0">
                <Lock className="w-8 h-8 text-[#F88A2B]" />
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: ShieldAlert, text: "Sem respostas do check-in" },
                { icon: MessageSquareOff, text: "Sem conversas IA" },
                { icon: Settings, text: "Sem score emocional" },
                { icon: History, text: "Sem histórico emocional" },
                { icon: Briefcase, text: "Sem relatórios pessoais" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/[0.03] p-4 rounded-2xl border border-white/5">
                  <item.icon className="w-5 h-5 text-[#F88A2B]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#444]">{item.text}</span>
                </div>
              ))}
            </div>
            
            {/* Fluxo elegante */}
            <div className="relative z-10 pt-8 mt-8 border-t border-black/5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                {[
                  { text: "Colaborador utiliza app privadamente", step: 1 },
                  { text: "IA identifica tendências coletivas", step: 2 },
                  { text: "Empresa recebe sinais agregados", step: 3 }
                ].map((step, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center gap-3 text-center flex-1">
                      <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-[#F88A2B] font-bold text-sm">
                        {step.step}
                      </div>
                      <p className="text-[11px] font-medium text-[#777] max-w-[150px]">{step.text}</p>
                    </div>
                    {i < 2 && (
                      <ChevronRight className="w-5 h-5 text-[#CCC] hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4 pt-4 pb-8">
          <button 
            onClick={() => navigate("/enterprise/rh/equipe")}
            className="w-full bg-[#F88A2B] text-[#111] py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span className="font-bold text-lg tracking-tight">Voltar para equipe</span>
          </button>

          <button 
            onClick={() => navigate("/enterprise/rh/permissoes")}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[#0B0908]/40 hover:text-[#0B0908] transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="font-semibold text-sm">Gerenciar permissões</span>
          </button>
          
          <div className="pt-8 text-center">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-sm mx-auto">
              O perfil administrativo existe apenas para organização operacional e acesso ao Enterprise.
            </p>
          </div>
        </section>
      </div>
    </EnterpriseRHLayout>
  );
};

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default EnterpriseEmployeeAdminScreen;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40">{label}</span>
      <div>{children}</div>
      <style>{`.admin-input{width:100%;padding:0.75rem 1rem;border-radius:1rem;border:1px solid rgba(0,0,0,0.05);background:#fff;font-size:0.875rem}`}</style>
    </div>
  );
}
