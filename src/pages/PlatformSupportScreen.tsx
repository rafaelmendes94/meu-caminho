import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Ticket = {
  id: string;
  organization_id: string | null;
  opened_by: string | null;
  assigned_to: string | null;
  title: string;
  message: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
};

type Comment = {
  id: string;
  ticket_id: string;
  author_id: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
};

const statusColor: Record<string, string> = {
  open: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  in_progress: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  resolved: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  closed: "bg-white/10 text-white/50 border-white/20",
};
const priorityColor: Record<string, string> = {
  low: "bg-white/5 text-white/50 border-white/10",
  medium: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  high: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  urgent: "bg-red-400/15 text-red-300 border-red-400/30",
};
const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const fmt = (d: string) => new Date(d).toLocaleString("pt-BR");

const PlatformSupportScreen = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orgs, setOrgs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusF, setStatusF] = useState("");
  const [prioF, setPrioF] = useState("");
  const [orgF, setOrgF] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [internal, setInternal] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: tks }, { data: os }] = await Promise.all([
      supabase.from("support_tickets" as any).select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("organizations").select("id,name"),
    ]);
    setTickets(((tks as any[]) ?? []) as Ticket[]);
    const map: Record<string, string> = {};
    ((os as any[]) ?? []).forEach((o) => (map[o.id] = o.name));
    setOrgs(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const loadComments = async (ticketId: string) => {
    const { data } = await supabase
      .from("support_ticket_comments" as any)
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setComments(((data as any[]) ?? []) as Comment[]);
  };

  const openTicket = async (t: Ticket) => {
    setSelected(t);
    setNewComment("");
    setInternal(true);
    await loadComments(t.id);
  };

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (statusF && t.status !== statusF) return false;
      if (prioF && t.priority !== prioF) return false;
      if (orgF && t.organization_id !== orgF) return false;
      if (search && !`${t.title} ${t.message ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tickets, statusF, prioF, orgF, search]);

  const counts = useMemo(() => ({
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    urgent: tickets.filter((t) => t.priority === "urgent" && t.status !== "closed").length,
    total: tickets.length,
  }), [tickets]);

  const updateStatus = async (id: string, status: string) => {
    setSaving(true);
    await supabase.from("support_tickets" as any).update({ status }).eq("id", id);
    if (selected?.id === id) setSelected({ ...selected, status: status as Ticket["status"] });
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: status as Ticket["status"] } : t)));
    setSaving(false);
  };

  const updatePriority = async (id: string, priority: string) => {
    setSaving(true);
    await supabase.from("support_tickets" as any).update({ priority }).eq("id", id);
    if (selected?.id === id) setSelected({ ...selected, priority: priority as Ticket["priority"] });
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, priority: priority as Ticket["priority"] } : t)));
    setSaving(false);
  };

  const assignSelf = async (id: string) => {
    if (!user?.id) return;
    setSaving(true);
    await supabase.rpc("assign_support_ticket" as any, { _ticket_id: id, _assignee: user.id });
    if (selected?.id === id) setSelected({ ...selected, assigned_to: user.id });
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, assigned_to: user.id } : t)));
    setSaving(false);
  };

  const unassign = async (id: string) => {
    setSaving(true);
    await supabase.rpc("assign_support_ticket" as any, { _ticket_id: id, _assignee: null });
    if (selected?.id === id) setSelected({ ...selected, assigned_to: null });
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, assigned_to: null } : t)));
    setSaving(false);
  };

  const postComment = async () => {
    if (!selected || !newComment.trim() || !user?.id) return;
    setSaving(true);
    const { data } = await supabase
      .from("support_ticket_comments" as any)
      .insert({ ticket_id: selected.id, author_id: user.id, body: newComment.trim(), is_internal: internal })
      .select()
      .single();
    if (data) setComments((prev) => [...prev, data as unknown as Comment]);
    setNewComment("");
    setSaving(false);
  };

  return (
    <PlatformAdminLayout>
      <h1 className="text-3xl font-black mb-2">Suporte</h1>
      <p className="text-white/60 mb-6">Sistema de tickets, atribuição e timeline.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { l: "Total", v: counts.total },
          { l: "Abertos", v: counts.open },
          { l: "Em progresso", v: counts.in_progress },
          { l: "Urgentes", v: counts.urgent },
        ].map((c) => (
          <div key={c.l} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{c.l}</p>
            <p className="mt-1 text-2xl font-black text-white">{c.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar…"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 min-w-[220px]"
        />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Todos status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={prioF} onChange={(e) => setPrioF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Todas prioridades</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={orgF} onChange={(e) => setOrgF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Todas empresas</option>
          {Object.entries(orgs).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-white/50">Carregando…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-white/50">Nenhum ticket encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.15em] text-white/40">
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3">Ticket</th>
                <th className="text-left px-3 py-3">Empresa</th>
                <th className="text-left px-3 py-3">Prioridade</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Responsável</th>
                <th className="text-left px-6 py-3">Aberto em</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => openTicket(t)} className="border-b border-white/5 hover:bg-white/[0.04] cursor-pointer">
                  <td className="px-6 py-3 text-white font-medium">{t.title}</td>
                  <td className="px-3 py-3 text-white/70">{t.organization_id ? orgs[t.organization_id] ?? "—" : "—"}</td>
                  <td className="px-3 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${priorityColor[t.priority]}`}>{t.priority}</span></td>
                  <td className="px-3 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${statusColor[t.status]}`}>{t.status}</span></td>
                  <td className="px-3 py-3 text-white/60 text-xs">{t.assigned_to ? t.assigned_to.slice(0, 8) : "—"}</td>
                  <td className="px-6 py-3 text-white/50 text-xs">{fmt(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/60" />
          <div
            className="w-full max-w-2xl h-full bg-[#0B0908] border-l border-white/10 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 sticky top-0 bg-[#0B0908] z-10">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">{selected.title}</h2>
                  <p className="text-xs text-white/50 mt-1">
                    {selected.organization_id ? orgs[selected.organization_id] : "sem empresa"} · #{selected.id.slice(0, 8)}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white">✕</button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 items-center text-xs">
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  disabled={saving}
                  className={`px-2 py-1 rounded-full border bg-transparent ${statusColor[selected.status]}`}
                >
                  {STATUSES.map((s) => <option key={s} value={s} className="bg-[#0B0908] text-white">{s}</option>)}
                </select>
                <select
                  value={selected.priority}
                  onChange={(e) => updatePriority(selected.id, e.target.value)}
                  disabled={saving}
                  className={`px-2 py-1 rounded-full border bg-transparent ${priorityColor[selected.priority]}`}
                >
                  {PRIORITIES.map((p) => <option key={p} value={p} className="bg-[#0B0908] text-white">{p}</option>)}
                </select>
                {selected.assigned_to === user?.id ? (
                  <button onClick={() => unassign(selected.id)} disabled={saving} className="px-3 py-1 rounded-full bg-white/10 text-white/70 hover:bg-white/20">
                    Liberar atribuição
                  </button>
                ) : (
                  <button onClick={() => assignSelf(selected.id)} disabled={saving} className="px-3 py-1 rounded-full bg-[#F88A2B] text-black font-bold">
                    Atribuir a mim
                  </button>
                )}
                <span className="text-white/40 ml-auto">
                  {selected.assigned_to ? `Responsável: ${selected.assigned_to.slice(0, 8)}` : "Sem responsável"}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Mensagem inicial</p>
                <p className="text-sm text-white/80 whitespace-pre-wrap">{selected.message ?? "—"}</p>
                <p className="text-[11px] text-white/40 mt-3">Aberto em {fmt(selected.created_at)}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3">Timeline · {comments.length} comentários</p>
                <div className="space-y-3">
                  <div className="border-l-2 border-white/10 pl-4 pb-2">
                    <p className="text-[11px] text-white/40">{fmt(selected.created_at)}</p>
                    <p className="text-sm text-white/70">Ticket aberto</p>
                  </div>
                  {comments.map((c) => (
                    <div key={c.id} className={`border-l-2 pl-4 pb-2 ${c.is_internal ? "border-[#F88A2B]/40" : "border-emerald-400/40"}`}>
                      <p className="text-[11px] text-white/40 flex gap-2">
                        <span>{fmt(c.created_at)}</span>
                        <span className={c.is_internal ? "text-[#F88A2B]" : "text-emerald-300"}>
                          {c.is_internal ? "Nota interna" : "Resposta cliente"}
                        </span>
                      </p>
                      <p className="text-sm text-white/90 whitespace-pre-wrap mt-1">{c.body}</p>
                    </div>
                  ))}
                  {selected.updated_at !== selected.created_at && (
                    <div className="border-l-2 border-white/10 pl-4">
                      <p className="text-[11px] text-white/40">{fmt(selected.updated_at)}</p>
                      <p className="text-sm text-white/70">Última atualização</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escrever comentário…"
                  rows={3}
                  maxLength={2000}
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <label className="flex items-center gap-2 text-xs text-white/60">
                    <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                    Nota interna (não visível ao cliente)
                  </label>
                  <button
                    onClick={postComment}
                    disabled={saving || !newComment.trim()}
                    className="px-4 py-2 rounded-full bg-[#F88A2B] text-black text-xs font-bold disabled:opacity-40"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PlatformAdminLayout>
  );
};

export default PlatformSupportScreen;
