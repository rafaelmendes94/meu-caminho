import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Log = {
  id: string;
  action: string;
  actor_user_id: string | null;
  organization_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: any;
  created_at: string;
};

const PlatformAuditScreen = () => {
  const [rows, setRows] = useState<Log[]>([]);
  const [orgs, setOrgs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionF, setActionF] = useState("");
  const [orgF, setOrgF] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: ls }, { data: os }] = await Promise.all([
        supabase.from("platform_audit_logs" as any).select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("organizations").select("id,name"),
      ]);
      setRows(((ls as any[]) ?? []) as Log[]);
      const map: Record<string, string> = {};
      ((os as any[]) ?? []).forEach((o) => { map[o.id] = o.name; });
      setOrgs(map);
      setLoading(false);
    })();
  }, []);

  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);
  const filtered = useMemo(
    () => rows.filter((r) => (!actionF || r.action === actionF) && (!orgF || r.organization_id === orgF)),
    [rows, actionF, orgF],
  );

  return (
    <PlatformAdminLayout>
      <h1 className="text-3xl font-black mb-2">Auditoria</h1>
      <p className="text-white/60 mb-6">Registros operacionais da plataforma.</p>

      <div className="flex gap-3 mb-6">
        <select value={actionF} onChange={(e) => setActionF(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Todas ações</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={orgF} onChange={(e) => setOrgF(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Todas empresas</option>
          {Object.entries(orgs).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-white/50">Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/50">Sem dados disponíveis.</p>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/50 font-sans">
              <tr>
                <th className="text-left p-3">Quando</th>
                <th className="text-left p-3">Ação</th>
                <th className="text-left p-3">Empresa</th>
                <th className="text-left p-3">Entidade</th>
                <th className="text-left p-3">Ator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td className="p-3 text-white/60">{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-[#F88A2B]">{l.action}</td>
                  <td className="p-3 text-white/70">{l.organization_id ? (orgs[l.organization_id] ?? "—") : "—"}</td>
                  <td className="p-3 text-white/50">{l.entity_type ?? "—"}{l.entity_id ? ` · ${l.entity_id.slice(0,8)}` : ""}</td>
                  <td className="p-3 text-white/40">{l.actor_user_id ? l.actor_user_id.slice(0, 8) : "system"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformAuditScreen;