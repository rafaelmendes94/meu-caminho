import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Overview = {
  stripe_connected_count: number;
  total_organizations: number;
  has_billing_data: boolean;
  mrr_cents: number;
  arr_cents: number;
  revenue_month_cents: number;
  revenue_year_cents: number;
  trials: number;
  active: number;
  past_due: number;
  canceled: number;
  new_active_30d: number;
  churned_30d: number;
  conversion_rate_pct: number | null;
  churn_rate_pct: number | null;
  avg_mrr_per_customer_cents: number | null;
  ltv_cents: number | null;
  cac_cents: number | null;
};

type Row = {
  id: string;
  name: string;
  plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  mrr_cents: number | null;
  licenses_total: number | null;
  licenses_used: number | null;
  days_remaining: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

const brl = (cents: number | null | undefined) =>
  cents == null ? "—" : `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v: number | null | undefined) => (v == null ? "—" : `${v.toFixed(1)}%`);
const fmtDate = (v: string | null) => (v ? new Date(v).toLocaleDateString("pt-BR") : "—");

const Card = ({ label, value, hint, muted }: { label: string; value: string; hint?: string; muted?: boolean }) => (
  <div className={`border border-white/10 rounded-2xl p-5 ${muted ? "bg-white/[0.02]" : "bg-white/[0.03]"}`}>
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</p>
    <p className={`mt-2 text-2xl font-black ${muted ? "text-white/60" : "text-white"}`}>{value}</p>
    {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
  </div>
);

const PlatformBillingScreen = () => {
  const [ov, setOv] = useState<Overview | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [ovRes, rowsRes] = await Promise.all([
        supabase.rpc("billing_overview" as any),
        supabase.rpc("billing_organizations" as any),
      ]);
      if (ovRes.error) setErr(ovRes.error.message);
      else setOv(ovRes.data as Overview);
      if (!rowsRes.error) setRows((rowsRes.data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const stripeMissing = !!ov && ov.stripe_connected_count === 0 && !ov.has_billing_data;

  return (
    <PlatformAdminLayout>
      <h1 className="text-3xl font-black mb-2">Financeiro</h1>
      <p className="text-white/60 mb-6">MRR, ARR, trials, conversões e cobrança por empresa.</p>

      {stripeMissing && (
        <div className="mb-8 bg-[#F88A2B]/10 border border-[#F88A2B]/30 rounded-2xl p-5">
          <p className="text-[#F88A2B] font-bold mb-1">Billing não conectado</p>
          <p className="text-white/70 text-sm">
            O Stripe ainda não está integrado. Métricas financeiras aparecerão automaticamente
            quando as assinaturas passarem a sincronizar. Os campos abaixo já estão preparados
            (mrr_cents, stripe_customer_id, stripe_subscription_id, current_period_end).
          </p>
        </div>
      )}

      {loading || !ov ? (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">{err}</div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Receita</h2>
            <div className="grid grid-cols-4 gap-3">
              <Card label="MRR" value={brl(ov.mrr_cents)} muted={!ov.has_billing_data} />
              <Card label="ARR" value={brl(ov.arr_cents)} muted={!ov.has_billing_data} />
              <Card label="Receita mensal" value={brl(ov.revenue_month_cents)} muted={!ov.has_billing_data} />
              <Card label="Receita anual" value={brl(ov.revenue_year_cents)} muted={!ov.has_billing_data} />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Assinaturas</h2>
            <div className="grid grid-cols-4 gap-3">
              <Card label="Trials" value={String(ov.trials)} />
              <Card label="Ativas" value={String(ov.active)} hint={`+${ov.new_active_30d} nos últimos 30d`} />
              <Card label="Past Due" value={String(ov.past_due)} />
              <Card label="Canceladas" value={String(ov.canceled)} hint={`${ov.churned_30d} nos últimos 30d`} />
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Métricas</h2>
            <div className="grid grid-cols-4 gap-3">
              <Card label="Conversão trial → ativo" value={pct(ov.conversion_rate_pct)} />
              <Card label="Churn 30d" value={pct(ov.churn_rate_pct)} />
              <Card label="LTV estimado" value={brl(ov.ltv_cents ? Math.round(ov.ltv_cents) : null)} hint="ARPU / churn" />
              <Card label="CAC" value="—" hint="Placeholder — conectar fonte de aquisição" muted />
            </div>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">
              Cobrança por empresa ({rows.length})
            </h2>
            {rows.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center text-white/60">
                Sem organizações ativas.
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/50">
                    <tr>
                      <th className="text-left p-3">Empresa</th>
                      <th className="text-left p-3">Plano</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Próxima cobrança</th>
                      <th className="text-left p-3">Valor mensal</th>
                      <th className="text-left p-3">Licenças</th>
                      <th className="text-left p-3">Dias restantes</th>
                      <th className="text-left p-3">Stripe customer</th>
                      <th className="text-left p-3">Stripe subscription</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.02]">
                        <td className="p-3">
                          <Link to={`/admin/organizations/${r.id}`} className="font-semibold hover:text-[#F88A2B]">{r.name}</Link>
                        </td>
                        <td className="p-3 text-white/70">{r.plan ?? "—"}</td>
                        <td className="p-3 text-white/70">{r.subscription_status ?? "—"}</td>
                        <td className="p-3 text-white/70">
                          {r.subscription_status === "trialing"
                            ? fmtDate(r.trial_ends_at)
                            : fmtDate(r.current_period_end)}
                        </td>
                        <td className="p-3">{brl(r.mrr_cents)}</td>
                        <td className="p-3">{(r.licenses_used ?? 0)} / {(r.licenses_total ?? 0)}</td>
                        <td className="p-3">{r.days_remaining ?? "—"}</td>
                        <td className="p-3 text-xs font-mono text-white/50">{r.stripe_customer_id ?? "—"}</td>
                        <td className="p-3 text-xs font-mono text-white/50">{r.stripe_subscription_id ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformBillingScreen;