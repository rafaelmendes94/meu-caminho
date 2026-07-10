import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Users, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  Lock,
  Plus,
  CheckCircle2,
  Clock,
  UserMinus,
  X,
  Search,
  LayoutDashboard
} from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";

const KPICard = ({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) => (
  <div className="bg-white rounded-2xl p-6 border border-black/5 flex flex-col justify-between shadow-sm group-hover:shadow-md transition-shadow">
    <p className="text-[32px] font-extrabold text-[#111] mb-2 tracking-tighter" style={{ fontFamily: "'Montserrat', sans-serif" }}>{value}</p>
    <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${colorClass || 'text-black/40'} font-montserrat`}>{label}</p>
  </div>
);

const AreaCard = ({ area, activePercentage }: { area: string; activePercentage: number }) => (
  <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-sm flex items-center justify-between group hover:border-[#F88A2B]/30 transition-all hover:shadow-md">
    <div className="flex flex-col">
      <span className="text-[16px] font-bold text-[#111] mb-1 font-montserrat">{area}</span>
      <span className="text-[12px] text-[#666] font-medium font-montserrat">Taxa de ativação</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="w-32 h-2 bg-black/[0.03] rounded-full overflow-hidden ring-1 ring-black/5">
        <div 
          className="h-full bg-[#F88A2B] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(248,138,43,0.3)]" 
          style={{ width: `${activePercentage}%` }}
        />
      </div>
      <span className="text-[16px] font-bold text-[#F88A2B] font-montserrat w-10 text-right">{activePercentage}%</span>
    </div>
  </div>
);

const PendingInviteItem = ({ name, area }: { name: string; area: string }) => (
  <div className="flex items-center justify-between py-5 border-b border-black/5 last:border-0 group hover:px-2 transition-all rounded-xl hover:bg-black/[0.02]">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-white border border-[#E5E0DA] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        <span className="text-[16px] font-bold text-[#F88A2B] font-montserrat">{name.charAt(0)}</span>
      </div>
      <div>
        <p className="text-[15px] font-bold text-[#111] font-montserrat">{name}</p>
        <p className="text-[13px] text-[#666] font-medium font-montserrat uppercase tracking-wider text-[10px]">{area}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F88A2B1A] border border-[#F88A2B2A]">
      <Clock className="h-3.5 w-3.5 text-[#F88A2B]" />
      <span className="text-[11px] font-bold text-[#F88A2B] uppercase tracking-widest font-montserrat">Pendente</span>
    </div>
  </div>
);

export default function EnterpriseTeamManagementScreen() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { organization } = useAuth();
  const [stats, setStats] = useState<{ invited: number; active: number; pending: number; removed: number } | null>(null);
  const [members, setMembers] = useState<Array<{ id: string; full_name: string | null; job_title: string | null; department_name: string | null; unit_name: string | null; status: string | null }>>([]);
  const [pending, setPending] = useState<Array<{ id: string; email: string; department: string | null; full_name: string | null }>>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [busyInvite, setBusyInvite] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const load = async () => {
    if (!organization?.id) return;
    const [invitesRes, profilesRes, pendingRes, removedRes] = await Promise.all([
      supabase.from("enterprise_invites").select("id", { count: "exact", head: true }).eq("organization_id", organization.id),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).is("deleted_at", null),
      supabase.from("enterprise_invites").select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id)
        .is("accepted_at", null).is("canceled_at", null).is("declined_at", null),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).not("deleted_at", "is", null),
    ]);
    setStats({
      invited: invitesRes.count ?? 0,
      active: profilesRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      removed: removedRes.count ?? 0,
    });
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, job_title, status, deleted_at, departments(name), units(name)")
      .eq("organization_id", organization.id)
      .order("full_name");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setMembers((profs as any[] ?? []).map((p) => ({
      id: p.id, full_name: p.full_name, job_title: p.job_title,
      status: p.deleted_at ? "removed" : (p.status ?? "active"),
      department_name: p.departments?.name ?? null,
      unit_name: p.units?.name ?? null,
    })));
    const { data: pendList } = await supabase
      .from("enterprise_invites")
      .select("id, email, department, full_name")
      .eq("organization_id", organization.id)
      .is("accepted_at", null).is("canceled_at", null).is("declined_at", null)
      .order("created_at", { ascending: false })
      .limit(20);
    setPending((pendList as unknown as typeof pending) ?? []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [organization?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (statusFilter === "active" && m.status !== "active") return false;
      if (statusFilter === "inactive" && m.status === "active") return false;
      if (!q) return true;
      return (
        (m.full_name ?? "").toLowerCase().includes(q) ||
        (m.job_title ?? "").toLowerCase().includes(q) ||
        (m.department_name ?? "").toLowerCase().includes(q) ||
        (m.unit_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [members, search, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleInviteAction = async (invite_id: string, action: "cancel" | "resend") => {
    setBusyInvite(invite_id);
    const { data, error } = await supabase.functions.invoke("manage-enterprise-invite", { body: { invite_id, action } });
    setBusyInvite(null);
    const err = (data as { error?: string } | null)?.error ?? error?.message;
    if (err) { toast.error(err); return; }
    toast.success(action === "cancel" ? "Convite cancelado." : "Convite reenviado.");
    load();
  };

  return (
    <EnterpriseRHLayout title="Equipe Enterprise">
      <div className="space-y-8 animate-fade-in bg-white -mx-6 lg:mx-0 px-6 lg:px-0 pb-20">
        
        {/* Hero Card */}
        <section>
          <div className="rounded-[48px] bg-white border border-black/5 p-10 md:p-14 relative overflow-hidden text-[#111] shadow-sm">
            
            <div className="relative z-10">
              <h2 className="text-[36px] md:text-[52px] leading-[1.1] font-extrabold mb-6 max-w-2xl tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Gerencie acessos sem invadir jornadas.
              </h2>
              
              <p className="text-[16px] md:text-[18px] leading-relaxed text-[#666] max-w-[600px] mb-12 font-medium">
                O RH administra quem tem acesso ao benefício, mas nunca vê respostas, conversas ou resultados individuais.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 bg-white border border-black/5 rounded-[32px] p-6 shadow-sm">
                <KPICard label="Convidados" value={stats ? String(stats.invited) : "—"} />
                <KPICard label="Ativos" value={stats ? String(stats.active) : "—"} colorClass="text-[#F88A2B]" />
                <KPICard label="Pendentes" value={stats ? String(stats.pending) : "—"} />
                <KPICard label="Removidos" value={stats ? String(stats.removed) : "—"} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ativação por área */}
          <section className="space-y-6">
            <h3 className="text-[20px] font-extrabold text-[#111] px-1 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Colaboradores
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  placeholder="Buscar por nome, cargo, departamento..."
                  className="w-full pl-9 pr-3 h-11 rounded-2xl border border-black/5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/30"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(0); }}
                className="h-11 rounded-2xl border border-black/5 bg-white text-sm px-3"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos/Removidos</option>
              </select>
            </div>
            <div className="rounded-[32px] bg-white p-6 border border-black/5 shadow-sm max-h-[420px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-[13px] text-[#666] py-6 text-center">Nenhum colaborador ainda.</p>
              ) : (
                <ul className="divide-y divide-black/5">
                  {pageItems.map((m) => (
                    <li
                      key={m.id}
                      className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-black/[0.02] px-2 rounded-xl"
                      onClick={() => navigate(`/enterprise/rh/equipe/${m.id}`)}
                    >
                      <div>
                        <p className="text-[14px] font-bold text-[#111]">{m.full_name ?? "Sem nome"}</p>
                        <p className="text-[11px] text-[#666]">
                          {[m.job_title, m.department_name, m.unit_name].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-black/40">{m.status ?? "active"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {pageCount > 1 && (
              <div className="flex items-center justify-between text-xs text-black/50 px-2">
                <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="disabled:opacity-30">← Anterior</button>
                <span>{page + 1} / {pageCount}</span>
                <button disabled={page + 1 >= pageCount} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} className="disabled:opacity-30">Próxima →</button>
              </div>
            )}
          </section>

          {/* Convites pendentes */}
          <section className="space-y-6">
            <h3 className="text-[20px] font-extrabold text-[#111] px-1 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Convites pendentes
            </h3>
            <div className="rounded-[32px] p-8 bg-white border border-black/5 shadow-sm h-full">
              <div className="flex flex-col">
                {pending.length === 0 ? (
                  <p className="text-[13px] text-[#666] py-6 text-center">Nenhum convite pendente.</p>
                ) : (
                  pending.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-4 border-b border-black/5 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-white border border-[#E5E0DA] flex items-center justify-center shadow-sm">
                          <span className="text-[14px] font-bold text-[#F88A2B]">{(p.full_name ?? p.email).charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-[#111] truncate">{p.full_name ?? p.email}</p>
                          <p className="text-[10px] text-[#666] uppercase tracking-wider truncate">{p.department ?? "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={busyInvite === p.id}
                          onClick={() => handleInviteAction(p.id, "resend")}
                          className="px-3 py-1.5 rounded-full text-[10px] font-bold text-[#F88A2B] hover:bg-[#F88A2B]/10 uppercase tracking-widest disabled:opacity-40"
                        >
                          Reenviar
                        </button>
                        <button
                          disabled={busyInvite === p.id}
                          onClick={() => handleInviteAction(p.id, "cancel")}
                          className="px-3 py-1.5 rounded-full text-[10px] font-bold text-black/40 hover:text-red-600 hover:bg-red-50 uppercase tracking-widest disabled:opacity-40"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => navigate('/enterprise/rh/equipe/convidar')}
                className="w-full mt-6 py-4 text-[#F88A2B] font-bold text-sm uppercase tracking-widest font-montserrat hover:bg-[#F88A2B]/5 rounded-2xl transition-all"
              >
                Convidar mais colaboradores
              </button>
            </div>
          </section>
        </div>

        {/* Privacy Card */}
        <section>
          <div className="rounded-[40px] p-10 bg-white border border-black/5 shadow-sm flex flex-col md:flex-row items-center gap-10">
            <div className="h-20 w-20 rounded-[28px] bg-black/[0.02] flex items-center justify-center shrink-0 border border-black/5">
              <Lock className="h-10 w-10 text-[#999]" />
            </div>
            <div className="text-center md:text-left space-y-3">
              <h4 className="text-[22px] font-extrabold text-[#111] tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Gestão de acesso não é monitoramento.
              </h4>
              <p className="text-[16px] text-[#666] leading-relaxed font-medium">
                Esta área mostra apenas status de ativação. Nenhum dado emocional individual aparece para o RH. Sua governança é focada na liberação do benefício e na saúde coletiva.
              </p>
            </div>
            <div className="flex-1" />
            <div className="bg-[#F88A2B]/10 px-6 py-3 rounded-2xl border border-[#F88A2B]/20">
              <ShieldCheck className="h-8 w-8 text-[#F88A2B]" />
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 pb-12">
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/equipe/convidar')}
            icon={Plus}
          >
            Convidar colaboradores
          </EnterpriseRHButton>
          
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            variant="secondary"
            icon={LayoutDashboard}
          >
            Voltar ao dashboard
          </EnterpriseRHButton>
        </section>

      </div>

    </EnterpriseRHLayout>
  );
}
