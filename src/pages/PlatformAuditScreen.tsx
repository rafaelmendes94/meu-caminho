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
  const [users, setUsers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionF, setActionF] = useState("");
  const [orgF, setOrgF] = useState("");
  const [userF, setUserF] = useState("");
  const [fromF, setFromF] = useState("");
  const [toF, setToF] = useState("");
  const [view, setView] = useState<"table" | "timeline">("table");

  useEffect(() => {
    (async () => {
      const [{ data: ls }, { data: os }, { data: ps }] = await Promise.all([
        supabase.from("platform_audit_logs" as any).select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("organizations").select("id,name"),
        supabase.from("profiles").select("id,full_name,display_name"),
      ]);
      setRows(((ls as any[]) ?? []) as Log[]);
      const map: Record<string, string> = {};
      ((os as any[]) ?? []).forEach((o) => { map[o.id] = o.name; });
      setOrgs(map);
      const umap: Record<string, string> = {};
      ((ps as any[]) ?? []).forEach((p) => { umap[p.id] = p.display_name || p.full_name || p.id.slice(0,8); });
      setUsers(umap);
      setLoading(false);
    })();
  }, []);

  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);
  const actorIds = useMemo(() => Array.from(new Set(rows.map((r) => r.actor_user_id).filter(Boolean) as string[])), [rows]);
  const filtered = useMemo(() => {
    const from = fromF ? new Date(fromF).getTime() : null;
    const to = toF ? new Date(toF).getTime() + 86400000 : null;
    return rows.filter((r) => {
      if (actionF && r.action !== actionF) return false;
      if (orgF && r.organization_id !== orgF) return false;
      if (userF && r.actor_user_id !== userF) return false;
      const t = new Date(r.created_at).getTime();
      if (from && t < from) return false;
      if (to && t > to) return false;
      return true;
    });
  }, [rows, actionF, orgF, userF, fromF, toF]);

  const exportCsv = () => {
    const header = ["created_at", "action", "organization", "actor", "entity_type", "entity_id", "ip", "metadata"];
    const esc = (v: any) => {
      const s = v == null ? "" : typeof v === "string" ? v : JSON.stringify(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const lines = [header.join(",")].concat(
      filtered.map((r) => [
        r.created_at,
        r.action,
        r.organization_id ? (orgs[r.organization_id] ?? r.organization_id) : "",
        r.actor_user_id ? (users[r.actor_user_id] ?? r.actor_user_id) : "",
        r.entity_type ?? "",
        r.entity_id ?? "",
        (r as any).ip ?? "",
        r.metadata,
      ].map(esc).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PlatformAdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black mb-2">Auditoria</h1>
          <p className="text-sm sm:text-base text-white/60">Registros operacionais da plataforma. Nunca exibe dados individuais de colaboradores.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-white/[0.03] border border-white/10 rounded-lg p-0.5">
            <button onClick={() => setView("table")} className={`px-3 py-1.5 text-xs rounded-md ${view === "table" ? "bg-[#F88A2B] text-black font-bold" : "text-white/60"}`}>Tabela</button>
            <button onClick={() => setView("timeline")} className={`px-3 py-1.5 text-xs rounded-md ${view === "timeline" ? "bg-[#F88A2B] text-black font-bold" : "text-white/60"}`}>Timeline</button>
          </div>
          <button onClick={exportCsv} disabled={filtered.length === 0} className="px-4 py-2 text-xs font-bold bg-[#F88A2B] text-black rounded-lg disabled:opacity-40">
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={actionF} onChange={(e) => setActionF(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Todas ações</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={orgF} onChange={(e) => setOrgF(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Todas empresas</option>
          {Object.entries(orgs).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <select value={userF} onChange={(e) => setUserF(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos usuários</option>
          {actorIds.map((id) => <option key={id} value={id}>{users[id] ?? id.slice(0,8)}</option>)}
        </select>
        <input type="date" value={fromF} onChange={(e) => setFromF(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80" />
        <input type="date" value={toF} onChange={(e) => setToF(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80" />
        {(actionF || orgF || userF || fromF || toF) && (
          <button onClick={() => { setActionF(""); setOrgF(""); setUserF(""); setFromF(""); setToF(""); }} className="text-xs text-white/50 hover:text-white/80 px-2">
            Limpar
          </button>
        )}
        <span className="ml-auto self-center text-xs text-white/40">{filtered.length} registros</span>
      </div>

      {loading ? (
        <p className="text-white/50">Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/50">Sem dados disponíveis.</p>
      ) : view === "table" ? (
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
                  <td className="p-3 text-white/40">{l.actor_user_id ? (users[l.actor_user_id] ?? l.actor_user_id.slice(0,8)) : "system"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative pl-6 border-l border-white/10">
          {filtered.map((l) => (
            <div key={l.id} className="relative pb-6">
              <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-[#F88A2B] ring-4 ring-[#0B0908]" />
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
                {new Date(l.created_at).toLocaleString("pt-BR")}
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-[#F88A2B]">{l.action}</span>
                  {l.organization_id && <span className="text-xs text-white/60">· {orgs[l.organization_id] ?? "—"}</span>}
                </div>
                <div className="text-xs text-white/60 space-y-1">
                  <div>Ator: <span className="text-white/80">{l.actor_user_id ? (users[l.actor_user_id] ?? l.actor_user_id.slice(0,8)) : "system"}</span></div>
                  {l.entity_type && <div>Entidade: <span className="text-white/80">{l.entity_type}{l.entity_id ? ` · ${l.entity_id.slice(0,8)}` : ""}</span></div>}
                  {l.metadata && Object.keys(l.metadata).length > 0 && (
                    <pre className="mt-2 p-2 bg-black/40 rounded text-[10px] text-white/50 overflow-x-auto font-mono">{JSON.stringify(l.metadata, null, 2)}</pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformAuditScreen;