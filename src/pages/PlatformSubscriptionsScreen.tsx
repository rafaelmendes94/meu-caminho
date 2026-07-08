import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Row = {
  id: string;
  name: string;
  slug: string;
  subscription_status: string | null;
  licenses_total: number | null;
  licenses_used: number | null;
  current_period_end?: string | null;
  mrr_cents?: number | null;
  stripe_customer_id?: string | null;
};

const StatusBadge = ({ s }: { s: string | null }) => {
  const map: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-300",
    trialing: "bg-sky-500/20 text-sky-300",
    past_due: "bg-amber-500/20 text-amber-300",
    canceled: "bg-red-500/20 text-red-300",
  };
  const cls = map[s ?? ""] ?? "bg-white/10 text-white/60";
  return <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${cls}`}>{s ?? "—"}</span>;
};

const PlatformSubscriptionsScreen = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id,name,slug,subscription_status,licenses_total,licenses_used,current_period_end,mrr_cents,stripe_customer_id" as any)
        .order("created_at", { ascending: false });
      if (error) setErr(error.message);
      else {
        const list = (data as any as Row[]) ?? [];
        setRows(list);
        setStripeConnected(list.some((r) => !!r.stripe_customer_id));
      }
      setLoading(false);
    })();
  }, []);

  return (
    <PlatformAdminLayout>
      <h1 className="text-3xl font-black mb-2">Assinaturas</h1>
      <p className="text-white/60 mb-6">Visão comercial e cobrança das organizações.</p>

      {!stripeConnected && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm">
          Billing ainda não conectado — Stripe não configurado. Métricas de MRR/ARR aparecerão quando a integração for ativada.
        </div>
      )}

      {loading ? (
        <p className="text-white/50">Carregando…</p>
      ) : err ? (
        <p className="text-red-400 text-sm">{err}</p>
      ) : rows.length === 0 ? (
        <p className="text-white/50">Sem dados disponíveis.</p>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/50">
              <tr>
                <th className="text-left p-4">Empresa</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Licenças</th>
                <th className="text-left p-4">MRR</th>
                <th className="text-left p-4">Próxima cobrança</th>
                <th className="text-left p-4">Stripe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-semibold">{r.name}</td>
                  <td className="p-4"><StatusBadge s={r.subscription_status} /></td>
                  <td className="p-4">{r.licenses_used ?? 0} / {r.licenses_total ?? 0}</td>
                  <td className="p-4">{r.mrr_cents ? `R$ ${(r.mrr_cents / 100).toFixed(2)}` : "—"}</td>
                  <td className="p-4 text-white/60">{r.current_period_end ? new Date(r.current_period_end).toLocaleDateString("pt-BR") : "—"}</td>
                  <td className="p-4 text-xs">{r.stripe_customer_id ? <span className="text-emerald-300">conectado</span> : <span className="text-white/40">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformSubscriptionsScreen;