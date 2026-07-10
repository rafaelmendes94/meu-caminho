import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BarChart3, LayoutDashboard, Zap, Clock, Users } from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrgMinGroupSize } from "@/hooks/useOrgMinGroupSize";
import { EmptyState } from "@/components/ui/empty-state";

type PulseRow = { dimension: string; avg_value: number | null; participants_count: number; response_count: number };

const DIMENSIONS: { key: string; label: string; status: string }[] = [
  { key: "energy", label: "Energia", status: "coletivo" },
  { key: "engagement", label: "Engajamento", status: "coletivo" },
  { key: "communication", label: "Comunicação", status: "coletivo" },
  { key: "equilibrium", label: "Equilíbrio", status: "coletivo" },
  { key: "recovery", label: "Recuperação", status: "coletivo" },
];

const EnterpriseCapacityPulseScreen = () => {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const minGroup = useOrgMinGroupSize();
  const [rows, setRows] = useState<PulseRow[]>([]);
  const [lastRun, setLastRun] = useState<{ at: string | null; participants: number; responses: number }>({
    at: null,
    participants: 0,
    responses: 0,
  });

  useEffect(() => {
    if (!organization?.id) return;
    void supabase
      .rpc("get_capacity_pulse", { _organization_id: organization.id, _days: 30 })
      .then(({ data }) => setRows((data as PulseRow[]) ?? []));
    void (async () => {
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
      const { data } = await supabase
        .from("pulse_responses")
        .select("user_id, responded_at")
        .eq("organization_id", organization.id)
        .gte("responded_at", since)
        .order("responded_at", { ascending: false });
      const list = (data ?? []) as Array<{ user_id: string; responded_at: string }>;
      const users = new Set(list.map((r) => r.user_id));
      setLastRun({
        at: list[0]?.responded_at ?? null,
        participants: users.size,
        responses: list.length,
      });
    })();
  }, [organization?.id]);

  const byDim = new Map(rows.map((r) => [r.dimension, r]));
  const metrics = DIMENSIONS.map((d) => {
    const r = byDim.get(d.key);
    return {
      label: d.label,
      value: r?.avg_value != null ? Number(r.avg_value).toFixed(2) : "•••",
      status: r?.avg_value != null ? d.status : "amostra insuficiente",
    };
  });

  return (
    <EnterpriseRHLayout title="Pulso de Capacidade">
      <div className="space-y-8 animate-fade-in bg-white -mx-6 lg:mx-0 px-6 lg:px-0 pb-20">
        <section>
          <div className="rounded-[32px] bg-white border border-black/5 p-8 md:p-12 relative overflow-hidden text-[#111] shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-[0.05] rounded-full -translate-y-20 translate-x-20 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-4 w-4 text-[#F88A2B]" />
                <span className="px-3 py-1.5 rounded-full bg-black/5 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-black/5">Tempo Real Coletivo</span>
              </div>
              <h2 className="text-[32px] md:text-[42px] leading-tight font-extrabold mb-4 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Sinta o ritmo da sua organização.
              </h2>
              <p className="text-[15px] md:text-[18px] leading-relaxed text-[#666] mb-8 max-w-2xl font-medium">
                O pulso de capacidade identifica se o time está operando em fluxo ou se há sinais de exaustão iminente.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">{m.label}</p>
              <p className="text-[32px] font-extrabold text-[#111] tracking-tighter" style={{ fontFamily: "'Montserrat', sans-serif" }}>{m.value}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{m.status}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-3xl bg-white border border-black/5 p-5">
            <div className="flex items-center gap-2 text-[#F88A2B]">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Última coleta</span>
            </div>
            <p className="mt-3 text-[18px] font-bold text-[#111]">
              {lastRun.at ? new Date(lastRun.at).toLocaleString("pt-BR") : "Ainda sem coletas"}
            </p>
          </div>
          <div className="rounded-3xl bg-white border border-black/5 p-5">
            <div className="flex items-center gap-2 text-[#F88A2B]">
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Participantes (30d)</span>
            </div>
            <p className="mt-3 text-[28px] font-extrabold text-[#111]">{lastRun.participants}</p>
          </div>
          <div className="rounded-3xl bg-white border border-black/5 p-5">
            <div className="flex items-center gap-2 text-[#F88A2B]">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Respostas (30d)</span>
            </div>
            <p className="mt-3 text-[28px] font-extrabold text-[#111]">{lastRun.responses}</p>
          </div>
        </section>

        <p className="text-[11px] text-[#999] italic px-1">
          Indicadores exibidos apenas quando há amostra mínima de {minGroup} participantes. Dados individuais nunca são exibidos.
        </p>

        {rows.length === 0 && (
          <EmptyState
            icon={Zap}
            title="Ainda sem amostra suficiente"
            description={`O pulso só exibe indicadores quando há pelo menos ${minGroup} respostas por dimensão nos últimos 30 dias.`}
          />
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            variant="secondary"
            icon={LayoutDashboard}
          >
            Voltar ao Dashboard
          </EnterpriseRHButton>
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/relatorio')}
            icon={BarChart3}
          >
            Relatório Detalhado
          </EnterpriseRHButton>
        </section>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseCapacityPulseScreen;