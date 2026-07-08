import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Ticket = {
  id: string;
  organization_id: string | null;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  category?: string | null;
};

const PlatformSupportScreen = () => {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [orgs, setOrgs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusF, setStatusF] = useState("");
  const [prioF, setPrioF] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: tks }, { data: os }] = await Promise.all([
        supabase.from("support_tickets" as any).select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("organizations").select("id,name"),
      ]);
      setRows(((tks as any[]) ?? []) as Ticket[]);
      const map: Record<string, string> = {};
      ((os as any[]) ?? []).forEach((o) => { map[o.id] = o.name; });
      setOrgs(map);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => rows.filter((r) => (!statusF || r.status === statusF) && (!prioF || r.priority === prioF)),
    [rows, statusF, prioF],
  );

  const setStatus = async (id: string, status: string) => {
    await supabase.from("support_tickets" as any).update({ status }).eq("id", id);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <PlatformAdminLayout>
      <h1 className="text-3xl font-black mb-2">Suporte</h1>
      <p className="text-white/60 mb-6">Tickets operacionais da plataforma.</p>

      <div className="flex gap-3 mb-6">
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos status</option>
          <option value="open">Aberto</option>
          <option value="in_progress">Em progresso</option>
          <option value="resolved">Resolvido</option>
          <option value="closed">Fechado</option>
        </select>
        <select value={prioF} onChange={(e) => setPrioF(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Todas prioridades</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

      {loading ? (
        <p className="text-white/50">Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/50">Sem dados disponíveis.</p>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/50">
              <tr>
                <th className="text-left p-4">Título</th>
                <th className="text-left p-4">Empresa</th>
                <th className="text-left p-4">Prioridade</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Criado</th>
                <th className="text-left p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="p-4 font-semibold">{t.title}</td>
                  <td className="p-4 text-white/70">{t.organization_id ? (orgs[t.organization_id] ?? "—") : "—"}</td>
                  <td className="p-4"><span className="text-[10px] uppercase px-2 py-1 rounded bg-white/10">{t.priority}</span></td>
                  <td className="p-4"><span className="text-[10px] uppercase px-2 py-1 rounded bg-[#F88A2B]/20 text-[#F88A2B]">{t.status}</span></td>
                  <td className="p-4 text-white/50 text-xs">{new Date(t.created_at).toLocaleString("pt-BR")}</td>
                  <td className="p-4">
                    <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs">
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em progresso</option>
                      <option value="resolved">Resolvido</option>
                      <option value="closed">Fechado</option>
                    </select>
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

export default PlatformSupportScreen;