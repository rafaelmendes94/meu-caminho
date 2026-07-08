import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

const Field = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</p>
    <p className="mt-1.5 text-lg font-semibold text-white">{value ?? "—"}</p>
  </div>
);

const PlatformOrganizationDetailScreen = () => {
  const { id } = useParams();
  const [org, setOrg] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const [orgRes, usageRes, ticketsRes, logsRes] = await Promise.all([
        supabase.from("organizations").select("*").eq("id", id).maybeSingle(),
        supabase.from("platform_usage_daily" as any).select("*").eq("organization_id", id)
          .order("usage_date", { ascending: false }).limit(30),
        supabase.from("support_tickets" as any).select("*").eq("organization_id", id)
          .order("created_at", { ascending: false }).limit(20),
        supabase.from("platform_audit_logs" as any).select("*").eq("organization_id", id)
          .order("created_at", { ascending: false }).limit(20),
      ]);
      setOrg(orgRes.data);
      setUsage((usageRes.data as any[]) ?? []);
      setTickets((ticketsRes.data as any[]) ?? []);
      setLogs((logsRes.data as any[]) ?? []);
      setLoading(false);
    })();
  }, [id]);

  const totalIA = usage.reduce((acc, u) => acc + (u.ai_messages_count || 0), 0);
  const totalCheckins = usage.reduce((acc, u) => acc + (u.checkins_count || 0), 0);
  const totalCost = usage.reduce((acc, u) => acc + (u.estimated_ai_cost_cents || 0), 0);

  return (
    <PlatformAdminLayout>
      <Link to="/admin/organizations" className="text-xs text-white/50 hover:text-white">← Voltar</Link>
      {loading ? (
        <p className="text-white/50 mt-6">Carregando…</p>
      ) : !org ? (
        <p className="text-white/50 mt-6">Organização não encontrada.</p>
      ) : (
        <>
          <h1 className="mt-4 text-3xl font-black">{org.name}</h1>
          <p className="text-white/50 mb-8">Visão operacional — dados agregados.</p>

          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Assinatura</h2>
            <div className="grid grid-cols-4 gap-3">
              <Field label="Status" value={org.subscription_status} />
              <Field label="Licenças" value={`${org.licenses_used ?? 0} / ${org.licenses_total ?? 0}`} />
              <Field label="MRR (cents)" value={org.mrr_cents ?? 0} />
              <Field label="Fim do período" value={org.current_period_end ? new Date(org.current_period_end).toLocaleDateString("pt-BR") : "—"} />
            </div>
            <p className="mt-3 text-[11px] text-white/40">Integração Stripe será conectada em fase futura.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Uso — Últimos 30 dias</h2>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Check-ins" value={totalCheckins} />
              <Field label="Mensagens IA" value={totalIA} />
              <Field label="Custo IA estimado" value={`R$ ${(totalCost / 100).toFixed(2)}`} />
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Tickets ({tickets.length})</h2>
            {tickets.length === 0 ? (
              <p className="text-white/50 text-sm">Nenhum ticket.</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div key={t.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{t.title}</p>
                      <p className="text-xs text-white/40">{new Date(t.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] uppercase px-2 py-1 rounded bg-white/10">{t.priority}</span>
                      <span className="text-[10px] uppercase px-2 py-1 rounded bg-[#F88A2B]/20 text-[#F88A2B]">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Logs Operacionais</h2>
            {logs.length === 0 ? (
              <p className="text-white/50 text-sm">Sem registros.</p>
            ) : (
              <div className="space-y-1 text-xs font-mono text-white/60">
                {logs.map((l) => (
                  <div key={l.id} className="py-1 border-b border-white/5">
                    <span className="text-white/40">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
                    {" · "}<span className="text-[#F88A2B]">{l.action}</span>
                    {l.entity_type && <span className="text-white/50"> · {l.entity_type}</span>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="mt-10 text-[11px] text-white/40 border-t border-white/10 pt-4">
            Dados individuais de colaboradores não são acessíveis neste ambiente.
          </p>
        </>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformOrganizationDetailScreen;