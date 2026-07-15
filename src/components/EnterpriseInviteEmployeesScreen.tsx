import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  ChevronRight, 
  Mail, 
  Users, 
  Upload, 
  Globe, 
  Slack, 
  CheckCircle2, 
  ShieldCheck, 
  Send,
  MoreVertical,
  Briefcase,
  LayoutGrid,
  UserCircle2,
  Lock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseInviteEmployeesScreen = () => {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [tone, setTone] = useState("Acolhedor");
  const [form, setForm] = useState<{ full_name: string; email: string; department: string; job_title: string; department_id: string; unit_id: string; manager_id: string; role: "employee" | "leader" | "rh_admin" }>({
    full_name: "", email: "", department: "", job_title: "", department_id: "", unit_id: "", manager_id: "", role: "employee",
  });
  const [depts, setDepts] = useState<Array<{ id: string; name: string }>>([]);
  const [units, setUnits] = useState<Array<{ id: string; name: string }>>([]);
  const [managers, setManagers] = useState<Array<{ id: string; full_name: string | null; email: string | null }>>([]);
  const [sending, setSending] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [invites, setInvites] = useState<Array<{ id: string; email: string; full_name: string | null; department: string | null; accepted_at: string | null; canceled_at: string | null; declined_at: string | null; created_at: string }>>([]);
  const [busyInvite, setBusyInvite] = useState<string | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);
  const [csvSummary, setCsvSummary] = useState<{ ok: number; failed: Array<{ email: string; error: string }> } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!organization?.id) return;
    (async () => {
      const [d, u] = await Promise.all([
        supabase.from("departments").select("id,name").eq("organization_id", organization.id).order("name"),
        supabase.from("units").select("id,name").eq("organization_id", organization.id).order("name"),
      ]);
      setDepts((d.data as typeof depts) ?? []);
      setUnits((u.data as typeof units) ?? []);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("organization_id", organization.id)
        .order("full_name");
      setManagers(((profs as Array<{ id: string; full_name: string | null }>) ?? []).map((p) => ({ id: p.id, full_name: p.full_name, email: null })));
    })();
    loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  const loadInvites = async () => {
    if (!organization?.id) return;
    const { data } = await supabase
      .from("enterprise_invites")
      .select("id, email, full_name, department, accepted_at, canceled_at, declined_at, created_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setInvites((data as typeof invites) ?? []);
  };

  const inviteStatusLabel = (i: typeof invites[number]) => {
    if (i.accepted_at) return { label: "Aceito", tone: "bg-green-100 text-green-700" };
    if (i.canceled_at) return { label: "Cancelado", tone: "bg-gray-100 text-gray-600" };
    if (i.declined_at) return { label: "Recusado", tone: "bg-red-100 text-red-700" };
    return { label: "Pendente", tone: "bg-amber-100 text-amber-700" };
  };

  const handleInviteAction = async (invite_id: string, action: "cancel" | "resend") => {
    setBusyInvite(invite_id);
    const { data, error } = await supabase.functions.invoke("manage-enterprise-invite", { body: { invite_id, action } });
    setBusyInvite(null);
    const err = (data as { error?: string } | null)?.error ?? error?.message;
    if (err) { toast.error(err); return; }
    toast.success(action === "cancel" ? "Convite cancelado." : "Convite reenviado.");
    if (action === "resend") {
      const link = (data as { invite_link?: string } | null)?.invite_link;
      if (link) setLastInviteLink(link);
    }
    loadInvites();
  };

  const handleCsvUpload = async (file: File) => {
    setCsvBusy(true);
    setCsvSummary(null);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length === 0) { toast.error("CSV vazio"); return; }
      // detect header
      const header = lines[0].toLowerCase();
      const hasHeader = header.includes("email");
      const rows = hasHeader ? lines.slice(1) : lines;
      let ok = 0;
      const failed: Array<{ email: string; error: string }> = [];
      for (const row of rows) {
        const cols = row.split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
        const email = cols[0];
        const full_name = cols[1] ?? "";
        const dept = cols[2] ?? "";
        const job_title = cols[3] ?? "";
        const managerEmail = (cols[4] ?? "").toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          failed.push({ email: email || "(vazio)", error: "email_invalido" });
          continue;
        }
        // Descobre manager pelo e-mail (coluna 5, opcional na header mas obrigatória por linha)
        let managerId: string | null = null;
        if (managerEmail) {
          const { data: mgrProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("organization_id", organization?.id ?? "")
            .ilike("full_name", `%`)
            .limit(1);
          void mgrProfile;
          // fallback: usa managers já carregados por nome quando possível
          const mgrByName = managers.find((m) => (m.full_name ?? "").toLowerCase() === managerEmail);
          managerId = mgrByName?.id ?? null;
        }
        if (!managerId) {
          failed.push({ email, error: "gestor_obrigatorio (informe manager_email na 5ª coluna, correspondendo a um colaborador já cadastrado)" });
          continue;
        }
        const deptMatch = depts.find((d) => d.name.toLowerCase() === dept.toLowerCase());
        const { data, error } = await supabase.functions.invoke("send-enterprise-invite", {
          body: {
            email, full_name, job_title,
            department: dept || null,
            department_id: deptMatch?.id ?? null,
            manager_id: managerId,
            role: "employee",
          },
        });
        const err = (data as { error?: string } | null)?.error ?? error?.message;
        if (err) failed.push({ email, error: err });
        else ok++;
      }
      setCsvSummary({ ok, failed });
      if (ok > 0) toast.success(`${ok} convite(s) enviado(s).`);
      if (failed.length > 0) toast.warning(`${failed.length} falha(s) — veja detalhes abaixo.`);
      loadInvites();
    } finally {
      setCsvBusy(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const handleSendInvites = async () => {
    if (!form.email.trim()) return toast.error("Informe o e-mail do colaborador");
    if (form.role !== "rh_admin" && !form.manager_id) {
      return toast.error("Selecione o gestor imediato. Só RH/Admin pode ficar sem gestor.");
    }
    setSending(true);
    const dept = depts.find((d) => d.id === form.department_id);
    const { data, error } = await supabase.functions.invoke("send-enterprise-invite", {
      body: {
        full_name: form.full_name,
        email: form.email,
        job_title: form.job_title,
        department: dept?.name ?? form.department,
        department_id: form.department_id || null,
        unit_id: form.unit_id || null,
        manager_id: form.manager_id || null,
        role: form.role,
      },
    });
    setSending(false);
    const errMsg = (data as { error?: string } | null)?.error ?? error?.message;
    if (errMsg) {
      const map: Record<string, string> = {
        license_limit_reached: "Sem licenças disponíveis. Solicite expansão de plano.",
        invite_already_pending: "Já existe um convite pendente para este e-mail.",
        invalid_email: "E-mail inválido.",
        manager_required: "Gestor imediato é obrigatório para colaboradores e líderes.",
        manager_invalid: "O gestor selecionado não pertence à organização.",
      };
      return toast.error(map[errMsg] ?? errMsg);
    }
    const link = (data as { invite_link?: string } | null)?.invite_link ?? null;
    setLastInviteLink(link);
    toast.success(link ? "Convite criado. Link de teste disponível abaixo." : "Convite enviado com sucesso.");
    setForm({ full_name: "", email: "", department: "", job_title: "", department_id: "", unit_id: "", manager_id: "", role: "employee" });
    loadInvites();
  };

  return (
    <EnterpriseRHLayout title="Convidar colaboradores">
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-black/5"
          >
            <ArrowLeft className="w-6 h-6 text-[#0B0908]" />
          </Button>
          <h1 className="text-xl font-playfair font-bold text-[#0B0908]">
            Convidar colaboradores
          </h1>
        </div>
        <Badge className="bg-[#F88A2B] hover:bg-[#F88A2B] text-[#111] border-none px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
          Onboarding Enterprise
        </Badge>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white border border-black/5 text-[#111] rounded-3xl p-8 shadow-sm">
          {/* Subtle decoration instead of large glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/5 rounded-bl-full pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold leading-tight">
              A jornada começa no convite.
            </h2>
            <p className="text-[#444] text-sm md:text-base max-w-md font-light leading-relaxed">
              O primeiro contato do colaborador com o Enterprise deve transmitir cuidado, privacidade e acolhimento.
            </p>
            
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-2 rounded-full border border-black/5">
                <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#111]">Privado e seguro</span>
              </div>
              <div className="h-px w-12 bg-gradient-to-r from-[#F88A2B] to-transparent" />
            </div>
          </div>
        </section>

        {/* Adicionar Colaboradores */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Users className="w-5 h-5 text-[#F88A2B]" />
            <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Adicionar colaboradores</h3>
          </div>
          
          <div className="bg-white border border-black/5 p-8 rounded-3xl shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/50 ml-1">Nome completo</label>
                <Input 
                  placeholder="Ex: Maria Silva" 
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="rounded-2xl border-black/5 bg-white h-14 focus-visible:ring-[#F88A2B]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/50 ml-1">E-mail corporativo</label>
                <Input 
                  placeholder="maria@empresa.com.br" 
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="rounded-2xl border-black/5 bg-white h-14 focus-visible:ring-[#F88A2B]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/50 ml-1">Departamento</label>
                <Select value={form.department_id} onValueChange={(v) => setForm((f) => ({ ...f, department_id: v }))}>
                  <SelectTrigger className="rounded-2xl border-black/5 bg-white h-14 focus:ring-[#F88A2B]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-black/5">
                    {depts.length === 0 && <SelectItem value="__none" disabled>Cadastre em Departamentos</SelectItem>}
                    {depts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/50 ml-1">Unidade (opcional)</label>
                <Select value={form.unit_id} onValueChange={(v) => setForm((f) => ({ ...f, unit_id: v }))}>
                  <SelectTrigger className="rounded-2xl border-black/5 bg-white h-14 focus:ring-[#F88A2B]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-black/5">
                    {units.length === 0 && <SelectItem value="__none" disabled>Cadastre em Unidades</SelectItem>}
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/50 ml-1">Cargo (opcional)</label>
                <Input 
                  placeholder="Ex: Gestor de Operações" 
                  value={form.job_title}
                  onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
                  className="rounded-2xl border-black/5 bg-white h-14 focus-visible:ring-[#F88A2B]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/50 ml-1">Gestor imediato (opcional)</label>
                <Select value={form.manager_id || "__none"} onValueChange={(v) => setForm((f) => ({ ...f, manager_id: v === "__none" ? "" : v }))}>
                  <SelectTrigger className="rounded-2xl border-black/5 bg-white h-14 focus:ring-[#F88A2B]">
                    <SelectValue placeholder="Selecione um líder..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-black/5 max-h-72">
                    <SelectItem value="__none">Sem gestor</SelectItem>
                    {managers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.full_name ?? "(sem nome)"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/50 ml-1">Papel na plataforma</label>
                <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as typeof f.role }))}>
                  <SelectTrigger className="rounded-2xl border-black/5 bg-white h-14 focus:ring-[#F88A2B]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-black/5">
                    <SelectItem value="employee">Colaborador</SelectItem>
                    <SelectItem value="leader">Líder</SelectItem>
                    <SelectItem value="rh_admin">RH / Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="pt-2">
              <Button onClick={handleSendInvites} disabled={sending} className="w-full md:w-auto px-10 h-14 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] hover:bg-[#1a1715] text-[#111] rounded-2xl transition-all shadow-lg hover:shadow-xl font-bold tracking-wide">
                {sending ? "Enviando..." : "Enviar convite"}
              </Button>
              {lastInviteLink && (
                <div className="mt-4 p-4 bg-[#F7F4F2] rounded-2xl border border-[#E5E0DA] break-all">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/50 mb-1">Link de teste</p>
                  <a href={lastInviteLink} className="text-sm text-[#F88A2B] underline" target="_blank" rel="noreferrer">{lastInviteLink}</a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Convite em Massa */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <LayoutGrid className="w-5 h-5 text-[#F88A2B]" />
            <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Convite em massa</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Import CSV */}
            <div className="bg-white border border-black/5 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-[#F88A2B]/10 rounded-2xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#F88A2B]" />
              </div>
              <div className="space-y-2 flex-grow">
                <h4 className="font-bold text-[#0B0908]">Importar CSV</h4>
                <p className="text-xs text-black/50 leading-relaxed">Colunas: email, nome, departamento, cargo. Uma linha por colaborador.</p>
              </div>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); }}
              />
              <Button
                variant="outline"
                disabled={csvBusy}
                onClick={() => csvInputRef.current?.click()}
                className="w-full rounded-xl border-[#0B0908]/10 text-[#0B0908] hover:bg-black/5 font-bold disabled:opacity-50"
              >
                {csvBusy ? "Enviando..." : "Selecionar arquivo"}
              </Button>
              {csvSummary && (
                <div className="w-full text-left space-y-1 pt-2 border-t border-black/5 text-xs">
                  <p className="font-bold text-green-700">{csvSummary.ok} enviado(s)</p>
                  {csvSummary.failed.length > 0 && (
                    <details className="text-red-700">
                      <summary className="cursor-pointer font-bold">{csvSummary.failed.length} falha(s)</summary>
                      <ul className="mt-1 space-y-0.5 max-h-32 overflow-auto">
                        {csvSummary.failed.map((f, i) => (<li key={i} className="truncate">{f.email}: {f.error}</li>))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Google Workspace */}
            <div className="bg-white border border-black/5 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-2 flex-grow">
                <h4 className="font-bold text-[#0B0908]">Google Workspace</h4>
                <p className="text-xs text-black/50 leading-relaxed">Sincronize colaboradores automaticamente.</p>
              </div>
              <Button variant="outline" className="w-full rounded-xl border-[#0B0908]/10 text-[#0B0908] hover:bg-black/5 font-bold">
                Conectar
              </Button>
            </div>

            {/* Slack */}
            <div className="bg-white border border-black/5 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                <Slack className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-2 flex-grow">
                <h4 className="font-bold text-[#0B0908]">Slack</h4>
                <p className="text-xs text-black/50 leading-relaxed">Enviar convites diretamente pelos canais da empresa.</p>
              </div>
              <Button variant="outline" className="w-full rounded-xl border-[#0B0908]/10 text-[#0B0908] hover:bg-black/5 font-bold">
                Conectar
              </Button>
            </div>
          </div>
        </section>

        {/* Convite por link - NOVA SEÇÃO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Globe className="w-5 h-5 text-[#F88A2B]" />
            <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Convite por link</h3>
          </div>
          
          <div className="bg-white border border-black/5 p-8 md:p-12 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/[0.02] blur-[80px] rounded-full pointer-events-none group-hover:bg-[#F88A2B]/[0.05] transition-all duration-700" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-md">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/[0.03]">
                    <Globe className="w-6 h-6 text-[#F88A2B]" />
                  </div>
                  <h4 className="text-2xl font-playfair font-bold text-[#0B0908]">Compartilhar link privado</h4>
                  <p className="text-sm text-black/50 leading-relaxed font-light">
                    Envie um único link seguro para que colaboradores ativem a própria jornada com privacidade.
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]/60">
                    Perfeito para Slack, WhatsApp, Teams e comunicados internos.
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText("meucaminho.app/empresa/acesso/ABX-48291");
                      toast.success("Link copiado com segurança.", {
                        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
                      });
                    }}
                    className="h-14 px-8 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] hover:bg-[#1a1715] text-[#111] rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-black/10"
                  >
                    Copiar link
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-black/5 text-[#0B0908]/60 font-bold text-xs uppercase tracking-widest hover:bg-black/5">
                      Compartilhar
                    </Button>
                    <Button variant="ghost" className="h-12 px-4 rounded-xl text-[#0B0908]/40 font-bold text-[10px] uppercase tracking-widest hover:text-[#F88A2B] hover:bg-[#F88A2B]/5">
                      Gerar novo link
                    </Button>
                  </div>
                </div>
              </div>

              {/* Link Display Area */}
              <div className="bg-[#F7F4F2] p-6 rounded-2xl border border-black/[0.03] flex items-center justify-between group/link">
                <code className="text-[#0B0908]/70 font-mono text-sm md:text-base select-all">
                  meucaminho.app/empresa/acesso/ABX-48291
                </code>
                <div className="hidden md:flex items-center gap-2 opacity-0 group-hover/link:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest">Link Ativo</span>
                  <div className="w-2 h-2 rounded-full bg-[#F88A2B] animate-pulse" />
                </div>
              </div>

              {/* Como Funciona - Mini Fluxo */}
              <div className="pt-4 space-y-6">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 text-center">Como funciona o fluxo self-service</h5>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                  {[
                    { icon: <Briefcase className="w-4 h-4" />, text: "RH compartilha" },
                    { icon: <Globe className="w-4 h-4" />, text: "Colaborador acessa" },
                    { icon: <ShieldCheck className="w-4 h-4" />, text: "Aceita privacidade" },
                    { icon: <UserCircle2 className="w-4 h-4" />, text: "Cria conta" },
                    { icon: <Sparkles className="w-4 h-4" />, text: "Inicia jornada" }
                  ].map((step, idx, arr) => (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center gap-2 group/step">
                        <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center text-[#F88A2B] shadow-sm group-hover/step:scale-110 transition-transform">
                          {step.icon}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-black/40 text-center max-w-[80px]">
                          {step.text}
                        </span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div className="hidden md:block h-px w-8 bg-gradient-to-r from-[#F88A2B]/20 to-[#F88A2B]/5" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Mockup Preview */}
              <div className="pt-6 border-t border-black/[0.03] space-y-4">
                 <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Prévia da experiência do colaborador</h5>
                 <div className="bg-white p-6 rounded-3xl border border-black/[0.03] shadow-inner space-y-4 max-w-sm mx-auto text-center">
                    <h6 className="font-playfair font-bold text-[#0B0908]">Bem-vindo ao Meu Caminho Enterprise</h6>
                    <p className="text-[11px] text-black/50 leading-relaxed">Sua empresa disponibilizou uma jornada emocional com total privacidade individual.</p>
                    <Button disabled className="h-10 px-6 bg-[#F88A2B]/10 text-[#F88A2B] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#F88A2B]/10">
                      Ativar minha jornada
                    </Button>
                 </div>
              </div>
            </div>
          </div>

          {/* Bloco de Privacidade Dark */}
          <div className="bg-white border border-black/5 text-[#111] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-sm">
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F88A2B]/[0.03] blur-[60px] rounded-full pointer-events-none" />
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-14 h-14 bg-black/[0.03] rounded-2xl flex items-center justify-center border border-black/5 shrink-0">
                  <Lock className="w-7 h-7 text-[#F88A2B]" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h4 className="font-playfair text-xl font-bold">O colaborador entra diretamente em ambiente privado.</h4>
                  <p className="text-[#999] text-sm font-light leading-relaxed">O link leva para uma experiência individual protegida, sem exposição emocional ao RH.</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 shrink-0">
                  {["Respostas privadas", "IA confidencial", "Anonimização", "Sem monitoramento"].map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#F88A2B]" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#666]">{t}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </section>

        {/* Prévia do Convite */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Mail className="w-5 h-5 text-[#F88A2B]" />
            <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Prévia do convite</h3>
          </div>
          
          <div className="bg-white p-1 md:p-12 rounded-[2rem] shadow-2xl border border-black/5 relative overflow-hidden">
             {/* Editorial Background Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/5 rounded-bl-full pointer-events-none" />
            
            <div className="bg-[#F7F4F2] p-8 md:p-12 rounded-2xl space-y-10 max-w-2xl mx-auto border border-black/[0.03]">
              <div className="text-center space-y-4">
                <div className="inline-block px-4 py-1.5 bg-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#F88A2B] border border-black/5">
                  Convite Exclusivo
                </div>
                <h4 className="text-2xl md:text-3xl font-playfair font-bold text-[#0B0908] leading-tight">
                  Você recebeu acesso ao Meu Caminho Enterprise
                </h4>
              </div>

              <div className="h-px w-20 bg-[#F88A2B]/30 mx-auto" />

              <p className="text-center text-[#0B0908]/70 font-light leading-relaxed md:text-lg">
                Sua empresa disponibilizou uma jornada de cuidado emocional coletivo com total privacidade individual.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Respostas privadas",
                  "IA agregada",
                  "Sem monitoramento individual",
                  "Experiência confidencial"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-black/[0.03]0 p-4 rounded-xl border border-white">
                    <CheckCircle2 className="w-5 h-5 text-[#F88A2B]" />
                    <span className="text-sm font-medium text-[#0B0908]/80">{item}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-4">
                <Button className="h-14 px-12 bg-[#F88A2B] hover:bg-[#e0751a] text-[#111] rounded-full font-bold shadow-lg shadow-[#F88A2B]/20 transition-all hover:scale-105">
                  Ativar minha jornada
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mensagem do RH */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Briefcase className="w-5 h-5 text-[#F88A2B]" />
            <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Mensagem do RH</h3>
          </div>
          
          <div className="bg-white border border-black/5 p-8 rounded-3xl shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/50 ml-1">Tom da comunicação</label>
              <div className="flex flex-wrap gap-3">
                {["Acolhedor", "Institucional", "Inspirador"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                      tone === t 
                        ? "bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] shadow-lg" 
                        : "bg-white text-[#0B0908]/60 border border-black/5 hover:bg-black/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/50 ml-1">Corpo da mensagem</label>
              <Textarea 
                defaultValue="Estamos iniciando uma jornada coletiva de cuidado emocional. Sua experiência individual é privada e protegida por anonimização automática."
                className="min-h-[120px] rounded-2xl border-black/5 bg-white p-6 focus-visible:ring-[#F88A2B] leading-relaxed"
              />
            </div>
          </div>
        </section>

        {/* Lista de Convites */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F88A2B]" />
              <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Lista de convites</h3>
            </div>
            <span className="text-xs font-bold text-black/40 uppercase tracking-widest">{invites.length} Últimos</span>
          </div>
          
          <div className="bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
            <div className="divide-y divide-black/[0.03]">
              {invites.length === 0 && (
                <div className="p-8 text-center text-sm text-black/40">Nenhum convite ainda.</div>
              )}
              {invites.map((person) => {
                const st = inviteStatusLabel(person);
                const active = !person.accepted_at && !person.canceled_at && !person.declined_at;
                const initials = (person.full_name ?? person.email).slice(0, 2).toUpperCase();
                return (
                  <div key={person.id} className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-[#F88A2B]/20 to-[#F88A2B]/40 text-[#0B0908] font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-[#0B0908] truncate">{person.full_name ?? person.email}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-black/50 font-medium truncate">{person.department ?? person.email}</span>
                          <span className="w-1 h-1 rounded-full bg-black/20" />
                          <Badge variant="secondary" className={`text-[9px] uppercase tracking-tighter h-4 px-1.5 border-none ${st.tone}`}>
                            {st.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {active && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="sm"
                          disabled={busyInvite === person.id}
                          onClick={() => handleInviteAction(person.id, "resend")}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] hover:text-[#e0751a] hover:bg-[#F88A2B]/5 rounded-full px-4"
                        >
                          Reenviar
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          disabled={busyInvite === person.id}
                          onClick={() => handleInviteAction(person.id, "cancel")}
                          className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-red-600 hover:bg-red-50 rounded-full px-4"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacidade */}
        <section className="bg-white border border-black/5 text-[#111] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-sm">
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F88A2B]/[0.02] blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-black/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-black/5">
                <ShieldCheck className="w-7 h-7 text-[#F88A2B]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-playfair font-bold leading-tight">
                O RH nunca acessa jornadas individuais.
              </h3>
              <div className="inline-flex items-center gap-2 bg-[#F88A2B]/20 border border-[#F88A2B]/30 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#F88A2B] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Anonimização automática</span>
              </div>
            </div>

            <div className="space-y-6 bg-black/[0.03] backdrop-blur-xl p-8 rounded-[2rem] border border-black/5">
              <p className="text-[#666] text-sm font-light uppercase tracking-widest">O colaborador verá claramente que:</p>
              <ul className="space-y-4">
                {[
                  "Respostas emocionais são privadas",
                  "Conversas com IA não aparecem para empresa",
                  "Dashboards mostram apenas tendências coletivas"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F88A2B]" />
                    <span className="text-[#333] font-light leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Action CTAs */}
        <section className="pt-8 space-y-4 max-w-lg mx-auto w-full">
          <Button 
            onClick={handleSendInvites}
            className="w-full h-16 bg-[#F88A2B] hover:bg-[#e0751a] text-[#111] rounded-2xl text-lg font-bold shadow-xl shadow-[#F88A2B]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Send className="w-5 h-5" />
            Enviar convites
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/enterprise/rh/equipe')}
            className="w-full h-14 text-[#0B0908]/50 hover:text-[#0B0908] hover:bg-black/5 rounded-2xl font-bold uppercase tracking-widest text-xs"
          >
            Voltar para equipe
          </Button>
        </section>

        {/* Footer */}
        <footer className="pt-12 pb-8 text-center">
          <p className="text-[#0B0908]/30 text-xs font-medium max-w-xs mx-auto leading-relaxed italic">
            "O convite é o primeiro contato do colaborador com a cultura emocional da empresa."
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseInviteEmployeesScreen;
