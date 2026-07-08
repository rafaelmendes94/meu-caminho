import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Row = {
  usage_date: string;
  ai_messages_count: number | null;
  executive_ai_messages_count: number | null;
  tokens_in: number | null;
  tokens_out: number | null;
  estimated_ai_cost_cents: number | null;
};

const Card = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</p>
    <p className="mt-2 text-3xl font-black text-white">{value}</p>
  </div>
);

const PlatformAIUsageScreen = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 86400 * 1000).toISOString().slice(0, 10);
      const { data } = await supabase
        .from("platform_usage_daily" as any)
        .select("usage_date,ai_messages_count,executive_ai_messages_count,tokens_in,tokens_out,estimated_ai_cost_cents")
        .gte("usage_date", since)
        .order("usage_date", { ascending: true });
      setRows(((data as any[]) ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const totals = useMemo(() => {
    return rows.reduce(
      (a, r) => ({
        messages: a.messages + (r.ai_messages_count || 0),
        exec: a.exec + (r.executive_ai_messages_count || 0),
        tokensIn: a.tokensIn + (r.tokens_in || 0),
        tokensOut: a.tokensOut + (r.tokens_out || 0),
        cost: a.cost + (r.estimated_ai_cost_cents || 0),
      }),
      { messages: 0, exec: 0, tokensIn: 0, tokensOut: 0, cost: 0 },
    );
  }, [rows]);

  const maxMsg = Math.max(1, ...rows.map((r) => r.ai_messages_count || 0));

  return (
    <PlatformAdminLayout>
      <h1 className="text-3xl font-black mb-2">Inteligência Artificial</h1>
      <p className="text-white/60 mb-6">Consumo global de IA nos últimos 30 dias.</p>

      {loading ? (
        <p className="text-white/50">Carregando…</p>
      ) : rows.length === 0 ? (
        <p className="text-white/50">Sem dados disponíveis.</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card label="Mensagens IA" value={totals.messages.toLocaleString("pt-BR")} />
            <Card label="Conselho IA" value={totals.exec.toLocaleString("pt-BR")} />
            <Card label="Tokens (in+out)" value={(totals.tokensIn + totals.tokensOut).toLocaleString("pt-BR")} />
            <Card label="Custo estimado" value={`R$ ${(totals.cost / 100).toFixed(2)}`} />
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">Chamadas IA por dia</p>
            <div className="flex items-end gap-1 h-40">
              {rows.map((r) => {
                const h = ((r.ai_messages_count || 0) / maxMsg) * 100;
                return (
                  <div key={r.usage_date} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full bg-[#F88A2B]/70 rounded-t" style={{ height: `${h}%` }} title={`${r.usage_date}: ${r.ai_messages_count}`} />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-white/40">
              <span>{rows[0]?.usage_date}</span>
              <span>{rows[rows.length - 1]?.usage_date}</span>
            </div>
          </div>
        </>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformAIUsageScreen;