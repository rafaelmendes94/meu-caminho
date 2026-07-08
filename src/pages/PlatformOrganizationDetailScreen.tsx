import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Details = {
  organization: any;
  counts: Record<string, number>;
  usage_30d: { active_users: number; ai_messages: number; tokens: number; ai_cost_cents: number; checkins: number };
  usage_daily: Array<{ usage_date: string; ai_messages: number; tokens: number; cost_cents: number; checkins: number }>;
  latest: { last_dna_at: string | null; last_score: number | null; last_score_date: string | null; last_activity_at: string | null };
  tickets: Array<{ id: string; title: string; status: string; priority: string; created_at: string }>;
  audit_logs: Array<{ id: string; action: string; entity_type: string | null; metadata: any; created_at: string }>;
};

const Field = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{label}</p>
    <p className="mt-1.5 text-lg font-semibold text-white break-words">{value ?? "—"}</p>
  </div>
);

const fmtDate = (v: string | null | undefined) => (v ? new Date(v).toLocaleDateString("pt-BR") : "—");
const fmtDT = (v: string | null | undefined) => (v ? new Date(v).toLocaleString("pt-BR") : "—");

const PlatformOrganizationDetailScreen = () => {
  const { id } = useParams();
  const [data, setData] = useState<Details | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: res, error } = await supabase.rpc("get_platform_organization_details" as any, { _id: id });
    if (error) setErr(error.message);
    else setData(res as Details | null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <PlatformAdminLayout>
        <div className="h-8 w-40 bg-white/5 rounded animate-pulse mb-4" />
        <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
      </PlatformAdminLayout>
    );
  }

  if (err || !data) {
    return (
      <PlatformAdminLayout>
        <Link to="/admin/organizations" className="text-xs text-white/50 hover:text-white">← Voltar</Link>
        <div className="mt-6 bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center">
          <p className="text-white/60">{err ? `Erro: ${err}` : "Organização não encontrada."}</p>
        </div>
      </PlatformAdminLayout>
    );
  }

  const org = data.organization;
  const u = data.usage_30d;

  return (
    <PlatformAdminLayout>
      <Link to="/admin/organizations" className="text-xs text-white/50 hover:text-white">← Voltar</Link>
      <div className="flex items-start justify-between mt-4 mb-2">
        <div>
          <h1 className="text-3xl font-black">{org.name}</h1>
          <p className="text-white/50">{org.slug} · {org.plan ?? "sem plano"} · {org.subscription_status}</p>
        </div>
        <div className="flex gap-2 text-[10px] uppercase tracking-[0.2em]">
          {org.suspended_at && <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">Suspensa</span>}
          {org.archived_at && <span className="px-2 py-1 bg-white/10 text-white/60 rounded">Arquivada</span>}
          {org.deleted_at && <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded">Excluída</span>}
        </div>
      </div>
      <p className="text-white/50 mb-8 text-xs">Visão operacional agregada. Dados individuais de colaboradores não são acessíveis neste ambiente.</p>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Dados comerciais</h2>
        <div className="grid grid-cols-4 gap-3">
          <Field label="CNPJ" value={org.cnpj} />
          <Field label="Domínio" value={org.domain} />
          <Field label="Plano" value={org.plan} />
          <Field label="Status" value={org.subscription_status} />
          <Field label="Fim do período" value={fmtDate(org.current_period_end)} />
          <Field label="Trial termina" value={fmtDate(org.trial_ends_at)} />
          <Field label="MRR (R$)" value={((org.mrr_cents ?? 0) / 100).toFixed(2)} />
          <Field label="Stripe" value={org.stripe_customer_id ? "conectado" : "não conectado"} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Licenças e usuários</h2>
        <div className="grid grid-cols-4 gap-3">
          <Field label="Licenças" value={`${org.licenses_used ?? 0} / ${org.licenses_total ?? 0}`} />
          <Field label="Perfis totais" value={data.counts.profiles} />
          <Field label="Administradores" value={data.counts.admins} />
          <Field label="Departamentos" value={data.counts.departments} />
          <Field label="Unidades" value={data.counts.units} />
          <Field label="Alertas abertos" value={data.counts.open_alerts} />
          <Field label="Tickets abertos" value={data.counts.open_tickets} />
          <Field label="Ativos 30d" value={u.active_users} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Uso — últimos 30 dias</h2>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Field label="Mensagens IA" value={u.ai_messages} />
          <Field label="Tokens" value={u.tokens.toLocaleString("pt-BR")} />
          <Field label="Custo IA" value={`R$ ${(u.ai_cost_cents / 100).toFixed(2)}`} />
          <Field label="Check-ins" value={u.checkins} />
        </div>
        {data.usage_daily.length > 0 && (
          <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/50">
                <tr>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">IA</th>
                  <th className="text-left p-2">Tokens</th>
                  <th className="text-left p-2">Custo</th>
                  <th className="text-left p-2">Check-ins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.usage_daily.map((d) => (
                  <tr key={d.usage_date}>
                    <td className="p-2 text-white/70">{fmtDate(d.usage_date)}</td>
                    <td className="p-2">{d.ai_messages}</td>
                    <td className="p-2">{Number(d.tokens).toLocaleString("pt-BR")}</td>
                    <td className="p-2">R$ {((d.cost_cents ?? 0) / 100).toFixed(2)}</td>
                    <td className="p-2">{d.checkins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Histórico</h2>
        <div className="grid grid-cols-4 gap-3">
          <Field label="Último acesso" value={fmtDT(data.latest.last_activity_at)} />
          <Field label="Último DNA" value={fmtDT(data.latest.last_dna_at)} />
          <Field label="Último Score" value={data.latest.last_score ?? "—"} />
          <Field label="Data do Score" value={fmtDate(data.latest.last_score_date)} />
          <Field label="Criada em" value={fmtDate(org.created_at)} />
          <Field label="Atualizada" value={fmtDate(org.updated_at)} />
          <Field label="Suspensa em" value={fmtDate(org.suspended_at)} />
          <Field label="Arquivada em" value={fmtDate(org.archived_at)} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Tickets ({data.tickets.length})</h2>
        {data.tickets.length === 0 ? (
          <p className="text-white/50 text-sm">Nenhum ticket.</p>
        ) : (
          <div className="space-y-2">
            {data.tickets.map((t) => (
              <div key={t.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">{t.title}</p>
                  <p className="text-xs text-white/40">{fmtDT(t.created_at)}</p>
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

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Timeline · Atividades administrativas</h2>
        {data.audit_logs.length === 0 ? (
          <p className="text-white/50 text-sm">Sem registros.</p>
        ) : (
          <div className="space-y-1 text-xs font-mono text-white/60">
            {data.audit_logs.map((l) => (
              <div key={l.id} className="py-1.5 border-b border-white/5">
                <span className="text-white/40">{fmtDT(l.created_at)}</span>
                {" · "}<span className="text-[#F88A2B]">{l.action}</span>
                {l.entity_type && <span className="text-white/50"> · {l.entity_type}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      {org.internal_notes && (
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Notas internas</h2>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-white/80 whitespace-pre-wrap">
            {org.internal_notes}
          </div>
        </section>
      )}

      <p className="mt-10 text-[11px] text-white/40 border-t border-white/10 pt-4">
        Dados individuais de colaboradores (check-ins, mensagens, chat, onboarding) nunca são acessíveis neste ambiente.
      </p>
    </PlatformAdminLayout>
  );
};

export default PlatformOrganizationDetailScreen;