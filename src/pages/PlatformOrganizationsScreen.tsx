import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Row = {
  id: string;
  name: string;
  slug: string;
  subscription_status: string | null;
  licenses_total: number | null;
  licenses_used: number | null;
  created_at: string;
  active_users_30d: number;
  ai_messages_30d: number;
  last_dna_generated_at: string | null;
  last_score: number | null;
  health_status: string;
};

const healthColor = (s: string) =>
  s === "healthy" ? "text-emerald-400" :
  s === "attention" ? "text-amber-400" :
  s === "at_risk" ? "text-red-400" :
  s === "over_limit" ? "text-orange-400" : "text-white/60";

const PlatformOrganizationsScreen = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_platform_organizations" as any);
      if (error) setErr(error.message);
      else setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <PlatformAdminLayout>
      <h1 className="text-3xl font-black mb-2">Organizações</h1>
      <p className="text-white/60 mb-8">Todas as empresas clientes da plataforma.</p>

      {loading ? (
        <p className="text-white/50">Carregando…</p>
      ) : err ? (
        <p className="text-red-400 text-sm">{err}</p>
      ) : rows.length === 0 ? (
        <p className="text-white/50">Nenhuma organização encontrada.</p>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/50">
              <tr>
                <th className="text-left p-4">Nome</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Licenças</th>
                <th className="text-left p-4">Ativos 30d</th>
                <th className="text-left p-4">IA 30d</th>
                <th className="text-left p-4">Score</th>
                <th className="text-left p-4">DNA</th>
                <th className="text-left p-4">Saúde</th>
                <th className="text-left p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-semibold">{r.name}</td>
                  <td className="p-4 text-white/70">{r.subscription_status ?? "—"}</td>
                  <td className="p-4">{r.licenses_used ?? 0} / {r.licenses_total ?? 0}</td>
                  <td className="p-4">{r.active_users_30d}</td>
                  <td className="p-4">{r.ai_messages_30d}</td>
                  <td className="p-4">{r.last_score ?? "—"}</td>
                  <td className="p-4 text-white/50 text-xs">
                    {r.last_dna_generated_at ? new Date(r.last_dna_generated_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className={`p-4 font-bold ${healthColor(r.health_status)}`}>{r.health_status}</td>
                  <td className="p-4">
                    <Link to={`/admin/organizations/${r.id}`} className="text-[#F88A2B] hover:underline text-xs font-bold">
                      Detalhes →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformOrganizationsScreen;