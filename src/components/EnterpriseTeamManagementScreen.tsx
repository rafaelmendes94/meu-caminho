import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  const [stats, setStats] = useState<{ invited: number; active: number; pending: number } | null>(null);

  useEffect(() => {
    if (!organization?.id) return;
    (async () => {
      const [invitesRes, profilesRes, pendingRes] = await Promise.all([
        supabase.from("enterprise_invites").select("id", { count: "exact", head: true }).eq("organization_id", organization.id),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("organization_id", organization.id),
        supabase.from("enterprise_invites").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).is("accepted_at", null),
      ]);
      setStats({
        invited: invitesRes.count ?? 0,
        active: profilesRes.count ?? 0,
        pending: pendingRes.count ?? 0,
      });
    })();
  }, [organization?.id]);

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
                <KPICard label="Convidados" value={stats ? String(stats.invited) : "142"} />
                <KPICard label="Ativos" value={stats ? String(stats.active) : "118"} colorClass="text-[#F88A2B]" />
                <KPICard label="Pendentes" value={stats ? String(stats.pending) : "19"} />
                <KPICard label="Removidos" value="0" />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ativação por área */}
          <section className="space-y-6">
            <h3 className="text-[20px] font-extrabold text-[#111] px-1 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Ativação por área
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <AreaCard area="Comercial" activePercentage={92} />
              <AreaCard area="Operações" activePercentage={78} />
              <AreaCard area="Produto" activePercentage={84} />
              <AreaCard area="Atendimento" activePercentage={71} />
            </div>
          </section>

          {/* Convites pendentes */}
          <section className="space-y-6">
            <h3 className="text-[20px] font-extrabold text-[#111] px-1 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Convites pendentes
            </h3>
            <div className="rounded-[32px] p-8 bg-white border border-black/5 shadow-sm h-full">
              <div className="flex flex-col">
                <PendingInviteItem name="Ana C." area="Operações" />
                <PendingInviteItem name="Bruno M." area="Atendimento" />
                <PendingInviteItem name="Carla R." area="Produto" />
                <PendingInviteItem name="Daniel S." area="RH / Gente" />
                <PendingInviteItem name="Eduardo F." area="Comercial" />
              </div>
              <button className="w-full mt-6 py-4 text-[#F88A2B] font-bold text-sm uppercase tracking-widest font-montserrat hover:bg-[#F88A2B]/5 rounded-2xl transition-all">
                Ver todos os pendentes
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
