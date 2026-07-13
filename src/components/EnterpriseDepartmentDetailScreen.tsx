import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrgMinGroupSize } from "@/hooks/useOrgMinGroupSize";
import { 
  ShieldCheck, 
  TrendingDown, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const BG = "#F7F4F2";
const ORANGE = "#F88A2B";
const DARK_BG = "#0B0908";

const KPIItem = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] text-[#999] font-bold uppercase tracking-widest">{label}</p>
    <div className="flex items-baseline gap-1">
      <p className="text-[24px] font-bold text-[#111] leading-none">{value}</p>
      {sub && <span className="text-[12px] text-[#999] font-medium">{sub}</span>}
    </div>
  </div>
);

const RecommendedActionCard = ({ text }: { text: string }) => (
  <div className="rounded-2xl p-5 bg-white border border-white/60 shadow-sm flex items-start gap-4 group active:scale-[0.98] transition-all">
    <div className="h-6 w-6 rounded-full bg-[#F88A2B1A] flex items-center justify-center shrink-0 mt-0.5">
      <CheckCircle2 className="h-3.5 w-3.5 text-[#F88A2B]" />
    </div>
    <p className="text-[14px] text-[#333] font-medium leading-relaxed">{text}</p>
  </div>
);

export default function EnterpriseDepartmentDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { organization } = useAuth();
  const minGroup = useOrgMinGroupSize();
  const [deptName, setDeptName] = useState<string>("Carregando…");
  const [memberCount, setMemberCount] = useState<number>(0);
  const [leaderName, setLeaderName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id || !organization?.id) return;
      setLoading(true);
      const [depRes, membersRes] = await Promise.all([
        supabase.from("departments").select("name,leader_id").eq("id", id).maybeSingle(),
        supabase.from("profiles").select("id").eq("department_id", id).is("deleted_at", null),
      ]);
      if (!alive) return;
      setDeptName(depRes.data?.name ?? "Departamento");
      setMemberCount((membersRes.data ?? []).length);
      if (depRes.data?.leader_id) {
        const { data: leader } = await supabase.from("profiles").select("full_name").eq("id", depRes.data.leader_id).maybeSingle();
        if (alive) setLeaderName(leader?.full_name ?? null);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [id, organization?.id]);

  const belowThreshold = memberCount > 0 && memberCount < minGroup;

  const handleGeneratePlan = () => {
    toast({
      title: "Plano de ação será gerado em breve.",
      description: "A geração automática de planos entra no próximo release do módulo.",
    });
  };

  return (
    <EnterpriseRHLayout title={deptName}>
      <div className="space-y-8 animate-fade-in">
        
        {/* Hero Card */}
        <section>
          <div className="rounded-[32px] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 relative overflow-hidden text-[#111] shadow-2xl">
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F88A2B] opacity-[0.08] rounded-full -translate-y-20 translate-x-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F88A2B] opacity-[0.05] rounded-full translate-y-16 -translate-x-10 blur-2xl" />
            
            <div className="relative z-10">
              <h2 className="text-[26px] leading-tight font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {deptName}
              </h2>
              
              <p className="text-[14px] leading-relaxed text-[#666] mb-8 max-w-[300px]">
                {leaderName ? `Líder: ${leaderName}. ` : ""}
                {loading ? "Carregando dados…" :
                  belowThreshold
                    ? `Este departamento tem apenas ${memberCount} colaboradores — abaixo do mínimo (${minGroup}) para exibir recortes agregados.`
                    : `${memberCount} colaboradores. Indicadores agregados abaixo, sem nenhum dado individual.`}
              </p>

              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                <KPIItem label="Colaboradores" value={String(memberCount)} />
                <KPIItem label="Líder" value={leaderName ?? "—"} />
                <KPIItem label="Mín. grupo" value={String(minGroup)} sub="pessoas" />
                <KPIItem label="Status" value={belowThreshold ? "Protegido" : "Elegível"} />
              </div>
            </div>
          </div>
        </section>

        {/* Tendência */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999]">Tendência das últimas semanas</h3>
          </div>
          
          <div className="rounded-[32px] bg-white p-7 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            <p className="text-[13px] text-[#666] leading-relaxed">
              {belowThreshold
                ? "Tendências não são exibidas para grupos abaixo do volume mínimo."
                : "Sem tendência consolidada ainda. Os agregados por área aparecem conforme o volume de check-ins cresce."}
            </p>
          </div>
        </section>

        {/* Fatores Associados */}
        <section className="space-y-5">
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999]">Fatores associados</h3>
          <div className="rounded-2xl p-4 bg-white border border-white/80 shadow-sm text-[13px] text-[#666]">
            Sem fatores associados consolidados para este departamento.
          </div>
        </section>

        {/* Temas no assistente IA */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999]">Temas na IA</h3>
            <Activity className="h-4 w-4 text-[#999]" />
          </div>
          
          <div className="rounded-[32px] bg-white p-7 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            <p className="text-[13px] text-[#666] leading-relaxed">
              Sem agregados temáticos disponíveis para este recorte no período.
            </p>

            <div className="flex items-start gap-2 pt-4 border-t border-[#F7F4F2]">
              <Info className="h-3 w-3 text-[#999] mt-0.5" />
              <p className="text-[10px] text-[#999] font-medium leading-tight">
                Temas agregados anonimamente. O RH não acessa conversas individuais.
              </p>
            </div>
          </div>
        </section>

        {/* Ações recomendadas */}
        <section className="space-y-5">
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999]">Ações recomendadas para esta área</h3>
          <div className="rounded-2xl p-5 bg-white border border-white/60 shadow-sm text-[13px] text-[#666]">
            Sem ações recomendadas geradas para este departamento no momento.
          </div>
        </section>

        {/* Anonimato */}
        <section>
          <div className="rounded-[32px] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 relative overflow-hidden text-[#111] shadow-xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-4 w-4 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Segurança de dados</span>
              </div>
              
              <h3 className="text-[20px] font-bold mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Identidade protegida por desenho.
              </h3>
              
              <p className="text-[14px] text-[#666] leading-relaxed">
                Este recorte só aparece porque há volume mínimo suficiente para impedir identificação individual.
              </p>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <section className="space-y-4 pt-4">
          <button 
            onClick={handleGeneratePlan}
            className="w-full h-16 rounded-full bg-[#F88A2B] text-[#111] font-bold flex items-center justify-between px-8 shadow-[0_12px_30px_-10px_rgba(248,138,43,0.5)] active:scale-[0.98] transition-all"
          >
            <span>Gerar plano de ação</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => navigate('/enterprise/rh/alertas')}
            className="w-full h-16 rounded-full bg-white border border-[#EFEAE5] text-[#111] font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
          >
            <span>Voltar aos alertas</span>
          </button>
        </section>

      </div>
    </EnterpriseRHLayout>
  );
}