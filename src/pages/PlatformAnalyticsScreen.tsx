import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Daily = {
  day: string;
  active_users: number;
  checkins: number;
  pulses: number;
  ai_messages: number;
};

type Analytics = {
  period_days: number;
  orgs_total: number;
  orgs_active: number;
  users_total: number;
  dau: number;
  wau: number;
  mau: number;
  checkins: number;
  pulses: number;
  dna_reports: number;
  action_plans: number;
  rituals: number;
  avg_impact: number | null;
  engagement_rate: number;
  retention_rate: number | null;
  retention_cohort: { prev_active: number; current_active: number; retained: number };
  daily: Daily[];
};

const PERIODS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

const fmt = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : Number(n).toLocaleString("pt-BR");

const Card = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
    {hint && <p className="mt-1 text-[11px] text-white/40">{hint}</p>}
  </div>
);

const Bars = ({
  data,
  color,
  label,
  pick,
}: {
  data: Daily[];
  color: string;
  label: string;
  pick: (d: Daily) => number;
}) => {
  const max = Math.max(1, ...data.map(pick));
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">{label}</p>
      {data.length === 0 ? (
        <p className="text-white/40 text-sm py-10 text-center">Sem dados</p>
      ) : (
        <>
          <div className="flex items-end gap-1 h-40">
            {data.map((d) => (
              <div
                key={d.day}
                className={`flex-1 rounded-t ${color}`}
                style={{ height: `${(pick(d) / max) * 100}%` }}
                title={`${d.day}: ${pick(d)}`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/40">
            <span>{data[0]?.day}</span>
            <span>{data[data.length - 1]?.day}</span>
          </div>
        </>
      )}
    </div>
  );
};

const PlatformAnalyticsScreen = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: res } = await supabase.rpc("get_platform_analytics" as any, { _days: days });
      if (!cancelled) {
        setData(res as unknown as Analytics);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const daily = useMemo(() => (data?.daily ?? []) as Daily[], [data]);

  return (
    <PlatformAdminLayout>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black">Analytics</h1>
        <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-full p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                days === p.days ? "bg-[#F88A2B] text-black" : "text-white/60 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-white/60 mb-6">Métricas operacionais agregadas — nenhum dado individual exposto.</p>

      {loading ? (
        <p className="text-white/50">Carregando…</p>
      ) : !data ? (
        <p className="text-white/50">Sem dados disponíveis.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card label="Organizações" value={fmt(data.orgs_total)} hint={`${fmt(data.orgs_active)} ativas`} />
            <Card label="Usuários" value={fmt(data.users_total)} />
            <Card label="DAU" value={fmt(data.dau)} hint="Últimas 24h" />
            <Card label="WAU" value={fmt(data.wau)} hint="Últimos 7 dias" />
            <Card label="MAU" value={fmt(data.mau)} hint="Últimos 30 dias" />
            <Card
              label="Engajamento"
              value={`${(data.engagement_rate ?? 0).toFixed(1)}%`}
              hint="MAU ÷ usuários"
            />
            <Card
              label="Retenção 30d"
              value={data.retention_rate === null ? "—" : `${data.retention_rate.toFixed(1)}%`}
              hint={`${data.retention_cohort.retained}/${data.retention_cohort.prev_active} retidos`}
            />
            <Card
              label="Impacto médio"
              value={data.avg_impact === null ? "—" : data.avg_impact.toString()}
              hint="Δ score pós-iniciativa"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card label="Check-ins" value={fmt(data.checkins)} />
            <Card label="Pulse" value={fmt(data.pulses)} />
            <Card label="DNA" value={fmt(data.dna_reports)} />
            <Card label="Planos" value={fmt(data.action_plans)} />
            <Card label="Rituais" value={fmt(data.rituals)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Bars data={daily} color="bg-[#F88A2B]/70" label="Usuários ativos por dia" pick={(d) => d.active_users} />
            <Bars data={daily} color="bg-emerald-400/70" label="Check-ins por dia" pick={(d) => d.checkins} />
            <Bars data={daily} color="bg-sky-400/70" label="Pulse por dia" pick={(d) => d.pulses} />
            <Bars data={daily} color="bg-violet-400/70" label="Mensagens IA por dia" pick={(d) => d.ai_messages} />
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">Uso por módulo (período)</p>
            <div className="space-y-3">
              {[
                { k: "Check-ins", v: data.checkins, c: "bg-emerald-400" },
                { k: "Pulse", v: data.pulses, c: "bg-sky-400" },
                { k: "Rituais", v: data.rituals, c: "bg-violet-400" },
                { k: "Planos de ação", v: data.action_plans, c: "bg-[#F88A2B]" },
                { k: "DNA organizacional", v: data.dna_reports, c: "bg-pink-400" },
              ]
                .sort((a, b) => b.v - a.v)
                .map((m) => {
                  const max = Math.max(1, data.checkins, data.pulses, data.rituals, data.action_plans, data.dna_reports);
                  return (
                    <div key={m.k}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">{m.k}</span>
                        <span className="text-white font-bold">{fmt(m.v)}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${m.c}`} style={{ width: `${(m.v / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformAnalyticsScreen;
