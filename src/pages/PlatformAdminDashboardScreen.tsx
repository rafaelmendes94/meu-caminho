import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Overview = {
  total_organizations: number;
  active_organizations: number;
  trialing_organizations: number;
  past_due_organizations: number;
  canceled_organizations: number;
  total_licenses: number;
  licenses_used: number;
  total_active_users_30d: number;
  total_ai_messages_30d: number;
  total_tokens_30d: number;
  estimated_ai_cost_30d: number;
  open_support_tickets: number;
};

const Card = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</p>
    <p className="mt-2 text-3xl font-black text-white">{value}</p>
    {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 animate-pulse">
    <div className="h-3 w-24 bg-white/10 rounded" />
    <div className="mt-3 h-8 w-20 bg-white/10 rounded" />
  </div>
);

const PlatformAdminDashboardScreen = () => {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [contracts, setContracts] = useState<{ mrr: number; arr: number; suspended: number } | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: ov, error }, { data: rows }] = await Promise.all([
        supabase.rpc("get_platform_overview" as any),
        supabase.from("organization_contracts" as any).select("price_monthly_cents,price_yearly_cents,billing_cycle,status,discount_percent"),
      ]);
      if (error) setErr(error.message);
      else setData(ov as Overview);
      if (rows) {
        let mrr = 0; let arr = 0; let suspended = 0;
        for (const r of rows as any[]) {
          if (!["active", "trialing", "past_due"].includes(r.status)) {
            if (r.status === "suspended") suspended += 1;
            continue;
          }
          const disc = 1 - (Number(r.discount_percent) || 0) / 100;
          const monthly = (Number(r.price_monthly_cents) || 0) * disc;
          const yearly = (Number(r.price_yearly_cents) || 0) * disc;
          if (r.billing_cycle === "yearly") { arr += yearly; mrr += yearly / 12; }
          else { mrr += monthly; arr += monthly * 12; }
        }
        setContracts({ mrr, arr, suspended });
      }
      setLoading(false);
    })();
  }, []);

  return (
    <PlatformAdminLayout>
      <h1 className="text-3xl font-black mb-2">Visão Geral SaaS</h1>
      <p className="text-white/60 mb-8">Indicadores operacionais e comerciais da plataforma.</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : err ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <p className="text-red-300 text-sm font-bold">Não foi possível carregar o dashboard.</p>
          <p className="text-red-300/70 text-xs mt-1">{err}</p>
        </div>
      ) : !data ? (
        <p className="text-white/50">Sem dados disponíveis.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card label="Total organizações" value={data.total_organizations} />
          <Card label="Ativas" value={data.active_organizations} />
          <Card label="Trials" value={data.trialing_organizations} />
          <Card label="Past due" value={data.past_due_organizations} />
          <Card label="Canceladas" value={data.canceled_organizations} />
          <Card label="Suspensas" value={contracts?.suspended ?? 0} />
          <Card label="Licenças contratadas" value={data.total_licenses} />
          <Card label="Licenças usadas" value={data.licenses_used} />
          <Card label="MRR estimado" value={`R$ ${((contracts?.mrr ?? 0) / 100).toFixed(2)}`} />
          <Card label="ARR estimado" value={`R$ ${((contracts?.arr ?? 0) / 100).toFixed(2)}`} />
          <Card label="Usuários ativos (30d)" value={data.total_active_users_30d} />
          <Card label="Mensagens IA (30d)" value={data.total_ai_messages_30d} />
          <Card label="Tokens (30d)" value={data.total_tokens_30d} />
          <Card label="Custo IA estimado (30d)" value={`R$ ${(data.estimated_ai_cost_30d / 100).toFixed(2)}`} />
          <Card label="Tickets abertos" value={data.open_support_tickets} />
        </div>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformAdminDashboardScreen;