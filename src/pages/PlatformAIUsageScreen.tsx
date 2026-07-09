import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Daily = {
  usage_date: string;
  messages: number;
  exec_messages: number;
  tokens_in: number;
  tokens_out: number;
  cost_cents: number;
};

type Totals = {
  messages: number;
  exec_messages: number;
  tokens_in: number;
  tokens_out: number;
  tokens_total: number;
  cost_cents: number;
  dna_reports: number;
  action_plans: number;
  rituals: number;
  active_orgs: number;
};

type OrgCost = {
  organization_id: string;
  organization_name: string;
  messages: number;
  exec_messages: number;
  tokens_in: number;
  tokens_out: number;
  tokens_total: number;
  dna_reports: number;
  action_plans: number;
  rituals: number;
  cost_cents: number;
};

const PERIODS: { label: string; days: number }[] = [
  { label: "Hoje", days: 1 },
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
];

const fmt = (n: number) => (n ?? 0).toLocaleString("pt-BR");
const brl = (cents: number) => `R$ ${((cents ?? 0) / 100).toFixed(2)}`;

const Card = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
    {hint && <p className="mt-1 text-[11px] text-white/40">{hint}</p>}
  </div>
);

const PlatformAIUsageScreen = () => {
  const [days, setDays] = useState(30);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [daily, setDaily] = useState<Daily[]>([]);
  const [orgs, setOrgs] = useState<OrgCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgFilter, setOrgFilter] = useState<string>("");
  const [insightsCount, setInsightsCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const sinceISO = new Date(Date.now() - Math.max(days, 1) * 86400000).toISOString();
      const [usage, costs, insights] = await Promise.all([
        supabase.rpc("get_ai_usage" as any, { _days: days }),
        supabase.rpc("get_ai_costs" as any, { _days: days }),
        supabase.from("weekly_ai_insights").select("id", { count: "exact", head: true }).gte("created_at", sinceISO),
      ]);
      if (cancelled) return;
      const payload = (usage.data as any) ?? {};
      setTotals((payload.totals as Totals) ?? null);
      setDaily(((payload.daily as Daily[]) ?? []).map((d) => ({
        usage_date: d.usage_date,
        messages: Number(d.messages) || 0,
        exec_messages: Number(d.exec_messages) || 0,
        tokens_in: Number(d.tokens_in) || 0,
        tokens_out: Number(d.tokens_out) || 0,
        cost_cents: Number(d.cost_cents) || 0,
      })));
      setOrgs(((costs.data as any[]) ?? []) as OrgCost[]);
      setInsightsCount(insights.count ?? 0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const filteredOrgs = useMemo(
    () => (orgFilter ? orgs.filter((o) => o.organization_id === orgFilter) : orgs),
    [orgs, orgFilter]
  );
  const displayTotals = useMemo<Totals | null>(() => {
    if (!orgFilter) return totals;
    const acc = filteredOrgs.reduce(
      (a, o) => ({
        messages: a.messages + Number(o.messages || 0),
        exec_messages: a.exec_messages + Number(o.exec_messages || 0),
        tokens_in: a.tokens_in + Number(o.tokens_in || 0),
        tokens_out: a.tokens_out + Number(o.tokens_out || 0),
        tokens_total: a.tokens_total + Number(o.tokens_total || 0),
        cost_cents: a.cost_cents + Number(o.cost_cents || 0),
        dna_reports: a.dna_reports + Number(o.dna_reports || 0),
        action_plans: a.action_plans + Number(o.action_plans || 0),
        rituals: a.rituals + Number(o.rituals || 0),
        active_orgs: filteredOrgs.length,
      }),
      { messages: 0, exec_messages: 0, tokens_in: 0, tokens_out: 0, tokens_total: 0, cost_cents: 0, dna_reports: 0, action_plans: 0, rituals: 0, active_orgs: 0 }
    );
    return acc;
  }, [orgFilter, filteredOrgs, totals]);

  const maxMsg = useMemo(() => Math.max(1, ...daily.map((d) => d.messages)), [daily]);
  const maxCost = useMemo(() => Math.max(1, ...daily.map((d) => d.cost_cents)), [daily]);

  return (
    <PlatformAdminLayout>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black">Inteligência Artificial</h1>
        <div className="flex items-center gap-2">
          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/80"
          >
            <option value="">Todas empresas</option>
            {orgs.map((o) => (
              <option key={o.organization_id} value={o.organization_id}>{o.organization_name}</option>
            ))}
          </select>
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
      </div>
      <p className="text-white/60 mb-6">Consumo global de IA agregado do banco.</p>

      {loading ? (
        <p className="text-white/50">Carregando…</p>
      ) : !displayTotals ? (
        <p className="text-white/50">Sem dados disponíveis.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card label="Mensagens IA" value={fmt(displayTotals.messages)} />
            <Card label="Conselho IA" value={fmt(displayTotals.exec_messages)} />
            <Card label="Tokens Input" value={fmt(displayTotals.tokens_in)} />
            <Card label="Tokens Output" value={fmt(displayTotals.tokens_out)} />
            <Card label="Custo estimado" value={brl(displayTotals.cost_cents)} />
            <Card label="DNA gerados" value={fmt(displayTotals.dna_reports)} />
            <Card label="Insights gerados" value={fmt(orgFilter ? 0 : insightsCount)} hint={orgFilter ? "filtro por empresa" : undefined} />
            <Card label="Planos + Rituais" value={fmt(displayTotals.action_plans + displayTotals.rituals)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">Mensagens por dia</p>
              <div className="flex items-end gap-1 h-40">
                {daily.map((d) => (
                  <div
                    key={d.usage_date}
                    className="flex-1 bg-[#F88A2B]/70 rounded-t"
                    style={{ height: `${(d.messages / maxMsg) * 100}%` }}
                    title={`${d.usage_date}: ${d.messages} msgs`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-white/40">
                <span>{daily[0]?.usage_date ?? "-"}</span>
                <span>{daily[daily.length - 1]?.usage_date ?? "-"}</span>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">Custo por dia (R$)</p>
              <div className="flex items-end gap-1 h-40">
                {daily.map((d) => (
                  <div
                    key={d.usage_date}
                    className="flex-1 bg-emerald-400/70 rounded-t"
                    style={{ height: `${(d.cost_cents / maxCost) * 100}%` }}
                    title={`${d.usage_date}: ${brl(d.cost_cents)}`}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-white/40">
                <span>{daily[0]?.usage_date ?? "-"}</span>
                <span>{daily[daily.length - 1]?.usage_date ?? "-"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Consumo por empresa</p>
              <span className="text-[11px] text-white/40">{orgs.length} empresas</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-[0.15em] text-white/40">
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-3">Empresa</th>
                    <th className="text-right px-3 py-3">Mensagens</th>
                    <th className="text-right px-3 py-3">Tokens</th>
                    <th className="text-right px-3 py-3">DNA</th>
                    <th className="text-right px-3 py-3">Planos</th>
                    <th className="text-right px-3 py-3">Conselho IA</th>
                    <th className="text-right px-6 py-3">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-6 text-center text-white/40">Sem consumo no período.</td></tr>
                  ) : filteredOrgs.map((o) => (
                    <tr key={o.organization_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-6 py-3 text-white font-medium">{o.organization_name}</td>
                      <td className="px-3 py-3 text-right text-white/80">{fmt(Number(o.messages))}</td>
                      <td className="px-3 py-3 text-right text-white/80">{fmt(Number(o.tokens_total))}</td>
                      <td className="px-3 py-3 text-right text-white/60">{fmt(Number(o.dna_reports))}</td>
                      <td className="px-3 py-3 text-right text-white/60">{fmt(Number(o.action_plans))}</td>
                      <td className="px-3 py-3 text-right text-white/60">{fmt(Number(o.exec_messages))}</td>
                      <td className="px-6 py-3 text-right text-emerald-300 font-bold">{brl(Number(o.cost_cents))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 text-xs text-amber-100/80">
            <strong className="text-amber-300">Não instrumentado:</strong> latência média, modelo utilizado, taxas de erro (429/500) e chamadas em streaming ainda não são registrados no banco.
            Ao adicionar instrumentação nas edge functions de IA, estes indicadores aparecerão automaticamente aqui.
          </div>
        </>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformAIUsageScreen;