import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Status = "online" | "warning" | "offline" | "idle" | "not_configured";

type Health = {
  checked_at: string;
  database: { status: Status; size: string | null };
  cron: { status: Status; jobs: number; last_run: string | null };
  realtime: { status: Status; tables: number };
  ai: { status: Status; messages_1h: number; messages_24h: number };
  oauth: { status: Status; note: string };
  stripe: { status: Status; orgs_connected: number; orgs_total: number };
  audit: { events_24h: number; last_at: string | null; last_action: string | null };
  support: { open_tickets: number };
};

const statusStyle: Record<string, string> = {
  online: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  warning: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  offline: "bg-red-400/15 text-red-300 border-red-400/30",
  idle: "bg-white/10 text-white/60 border-white/20",
  not_configured: "bg-white/5 text-white/40 border-white/10",
};

const statusLabel: Record<string, string> = {
  online: "Online",
  warning: "Warning",
  offline: "Offline",
  idle: "Ocioso",
  not_configured: "Não configurado",
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleString("pt-BR") : "—";

const Card = ({
  title,
  status,
  meta,
}: {
  title: string;
  status: Status;
  meta: { label: string; value: string }[];
}) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle[status]}`}>
        {statusLabel[status] ?? status}
      </span>
    </div>
    <dl className="space-y-2 text-sm">
      {meta.map((m) => (
        <div key={m.label} className="flex justify-between gap-3">
          <dt className="text-white/50">{m.label}</dt>
          <dd className="text-white/90 text-right truncate">{m.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const PlatformSystemHealthScreen = () => {
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: res } = await supabase.rpc("health_check" as any);
    setData(res as unknown as Health);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <PlatformAdminLayout>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black">System Health</h1>
        <button
          onClick={load}
          className="px-4 py-2 rounded-full text-xs font-bold bg-[#F88A2B] text-black hover:opacity-90"
        >
          Recarregar
        </button>
      </div>
      <p className="text-white/60 mb-6">
        Última verificação: {data ? fmtDate(data.checked_at) : "—"} · atualiza a cada 30s.
      </p>

      {loading && !data ? (
        <p className="text-white/50">Carregando…</p>
      ) : !data ? (
        <p className="text-white/50">Sem dados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title="Database"
            status={data.database.status}
            meta={[
              { label: "Tamanho", value: data.database.size ?? "—" },
              { label: "Última verificação", value: fmtDate(data.checked_at) },
            ]}
          />
          <Card
            title="Cron"
            status={data.cron.status}
            meta={[
              { label: "Jobs ativos", value: String(data.cron.jobs) },
              { label: "Última execução", value: fmtDate(data.cron.last_run) },
            ]}
          />
          <Card
            title="Realtime"
            status={data.realtime.status}
            meta={[
              { label: "Tabelas publicadas", value: String(data.realtime.tables) },
            ]}
          />
          <Card
            title="Inteligência Artificial"
            status={data.ai.status}
            meta={[
              { label: "Mensagens (hoje)", value: data.ai.messages_1h.toLocaleString("pt-BR") },
              { label: "Mensagens (24h)", value: data.ai.messages_24h.toLocaleString("pt-BR") },
            ]}
          />
          <Card
            title="OAuth"
            status={data.oauth.status}
            meta={[{ label: "Provider", value: data.oauth.note }]}
          />
          <Card
            title="Stripe"
            status={data.stripe.status}
            meta={[
              { label: "Orgs conectadas", value: `${data.stripe.orgs_connected}/${data.stripe.orgs_total}` },
            ]}
          />
          <Card
            title="Storage"
            status="not_configured"
            meta={[{ label: "Buckets", value: "Não instrumentado" }]}
          />
          <Card
            title="Edge Functions"
            status="not_configured"
            meta={[{ label: "Métricas", value: "Sem telemetria no banco" }]}
          />
          <Card
            title="Resend"
            status="not_configured"
            meta={[{ label: "SMTP", value: "Não integrado" }]}
          />
          <Card
            title="Auditoria"
            status={data.audit.events_24h > 0 ? "online" : "idle"}
            meta={[
              { label: "Eventos 24h", value: String(data.audit.events_24h) },
              { label: "Última ação", value: data.audit.last_action ?? "—" },
              { label: "Último evento", value: fmtDate(data.audit.last_at) },
            ]}
          />
          <Card
            title="Suporte"
            status={data.support.open_tickets > 0 ? "warning" : "online"}
            meta={[{ label: "Tickets abertos", value: String(data.support.open_tickets) }]}
          />
        </div>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformSystemHealthScreen;
