import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Clock,
  AlertTriangle,
  EyeOff,
  MessageSquare,
  CheckCircle2,
  Send,
  Paperclip,
  Tag,
  Building2,
  Radio,
  Forward,
  Archive,
  Flag,
  Inbox,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRealtime } from "@/hooks/useRealtime";

type ReportRow = {
  id: string;
  protocol: string;
  subject: string;
  body: string;
  category: string;
  severity: string;
  status: string;
  is_anonymous: boolean;
  created_at: string;
  resolved_at: string | null;
};
type MessageRow = { id: string; body: string; author_role: string; created_at: string };

const statusLabel: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em análise",
  resolved: "Resolvido",
  archived: "Arquivado",
};

const severityStyles: Record<string, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-emerald-50 text-emerald-700",
  critical: "bg-red-100 text-red-700",
};

const severityLabel: Record<string, string> = {
  critical: "Crítica",
  high: "Alta prioridade",
  medium: "Média prioridade",
  low: "Baixa prioridade",
};

export default function EnterpriseRHReportDetailScreen() {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!id || !organization?.id) return;
    setLoading(true);
    const [{ data: r }, { data: msgs }] = await Promise.all([
      supabase.from("reports").select("*").eq("id", id).maybeSingle(),
      supabase.from("report_messages").select("id,body,author_role,created_at").eq("report_id", id).order("created_at"),
    ]);
    setReport(r as ReportRow | null);
    setMessages((msgs ?? []) as MessageRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, organization?.id]);

  useRealtime(
    "rh_report_detail",
    id
      ? [
          { table: "report_messages", filter: `report_id=eq.${id}` },
          { table: "reports", filter: `id=eq.${id}` },
        ]
      : [],
    () => load(),
    [id]
  );

  const setStatus = async (status: string) => {
    if (!report) return;
    const patch: any = { status };
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("reports").update(patch).eq("id", report.id);
    if (error) toast.error("Não foi possível atualizar o status.");
    else toast.success(`Marcado como ${statusLabel[status] ?? status}.`);
  };

  const sendReply = async () => {
    if (!reply.trim() || !report || !user || sending) return;
    setSending(true);
    const { error } = await supabase.from("report_messages").insert({
      report_id: report.id,
      organization_id: report.organization_id as any,
      author_user_id: user.id,
      author_role: "rh",
      body: reply.trim(),
    } as any);
    if (error) {
      toast.error("Não foi possível enviar a resposta.");
    } else {
      setReply("");
      if (report.status === "open") await setStatus("in_progress");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <EnterpriseRHLayout title="Carregando…">
        <div className="p-16 text-center text-sm text-[#999]">Carregando relato…</div>
      </EnterpriseRHLayout>
    );
  }

  if (!report) {
    return (
      <EnterpriseRHLayout title="Relato não encontrado">
        <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-[#F7F4F2] mx-auto flex items-center justify-center">
            <Inbox className="h-8 w-8 text-[#999]" />
          </div>
          <h2
            className="text-[28px] font-bold text-[#111]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Relato não encontrado
          </h2>
          <p className="text-[14px] text-[#666]">
            O identificador <strong>{id}</strong> não corresponde a nenhum relato cadastrado.
          </p>
          <button
            onClick={() => navigate("/enterprise/rh/denuncias")}
            className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] text-[13px] font-bold hover:bg-[#1a1a1a] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Canal Direto
          </button>
        </main>
      </EnterpriseRHLayout>
    );
  }

  const created = new Date(report.created_at);
  const dateStr = created.toLocaleDateString("pt-BR");
  const timeStr = created.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <EnterpriseRHLayout title={`Relato ${report.protocol}`}>
      <div className="space-y-8 animate-fade-in">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => navigate("/enterprise/rh/denuncias")}
          className="inline-flex items-center gap-2 text-[12px] font-bold text-[#666] uppercase tracking-widest hover:text-[#F88A2B] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Canal Direto
        </button>

        {/* Hero / Header */}
        <section>
          <div className="rounded-[32px] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 md:p-12 relative overflow-hidden text-[#111] shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-[0.1] rounded-full -translate-y-20 translate-x-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F88A2B] opacity-[0.05] rounded-full translate-y-16 -translate-x-10 blur-2xl" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">
                    Canal Confidencial
                  </span>
                </div>
                <span className="text-[#AAA]">•</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">
                  {report.protocol}
                </span>
                <span className="text-[#AAA]">•</span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#666]">
                  <Clock className="h-3 w-3" />
                  {dateStr} às {timeStr}
                </div>
              </div>

              <h2
                className="text-[28px] md:text-[40px] leading-tight font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {report.subject}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${severityStyles[report.severity] ?? "bg-black/5 text-[#666]"}`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {severityLabel[report.severity] ?? report.severity}
                </div>
                <div className="px-3 py-1.5 rounded-full bg-black/5 backdrop-blur-md text-[#111] text-[10px] font-bold uppercase tracking-widest border border-black/5">
                  {statusLabel[report.status] ?? report.status}
                </div>
                {report.is_anonymous && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 backdrop-blur-md text-[#111] text-[10px] font-bold uppercase tracking-widest border border-black/5">
                    <EyeOff className="h-3 w-3" />
                    Identidade protegida
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Meta Info */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: Tag, label: "Categoria", value: report.category },
            { icon: Radio, label: "Canal", value: "Direto RH" },
            { icon: EyeOff, label: "Identidade", value: report.is_anonymous ? "Anônimo" : "Identificado" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-white border border-white/60 shadow-sm p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-3.5 w-3.5 text-[#F88A2B]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#999]">
                  {label}
                </span>
              </div>
              <p className="text-[13px] font-bold text-[#111] leading-snug">{value}</p>
            </div>
          ))}
        </section>

        {/* Message */}
        <section className="rounded-[32px] bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5 text-[#F88A2B]" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-1">
                Mensagem recebida
              </div>
              <div className="text-[13px] font-bold text-[#111]">{report.is_anonymous ? "Colaborador anônimo" : "Colaborador identificado"}</div>
            </div>
          </div>
          <blockquote className="text-[16px] md:text-[18px] text-[#222] leading-relaxed italic border-l-4 border-[#F88A2B] pl-6">
            "{report.body}"
          </blockquote>
        </section>

        {/* Actions */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: CheckCircle2, label: "Marcar como resolvido", action: () => setStatus("resolved") },
            { icon: Flag, label: "Em análise", action: () => setStatus("in_progress") },
            { icon: Archive, label: "Arquivar", action: () => setStatus("archived") },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="h-14 rounded-2xl bg-white border border-white/60 shadow-sm hover:bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] hover:text-[#111] hover:border-[#0B0908] transition-all flex items-center justify-center gap-2 text-[12px] font-bold text-[#111] px-4"
            >
              <Icon className="h-4 w-4" />
              <span className="text-left leading-tight">{label}</span>
            </button>
          ))}
        </section>

        {/* Reply */}
        <section className="rounded-[32px] bg-white border border-white/60 shadow-sm p-8 md:p-10 space-y-5">
          <div>
            <h3
              className="text-[22px] font-bold text-[#111] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {report.is_anonymous
                ? "Responder pelo canal anônimo"
                : "Responder ao colaborador"}
            </h3>
            <p className="text-[13px] text-[#666] leading-relaxed">
              {report.is_anonymous
                ? "Este relato é anônimo — o colaborador não é visível no fluxo. A resposta fica registrada no histórico do caso."
                : "Sua resposta será enviada ao colaborador e ficará registrada no histórico do caso."}
            </p>
          </div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Escreva uma resposta acolhedora e objetiva..."
            rows={5}
            className="w-full rounded-2xl bg-[#FAF7F4] border border-white/60 p-4 text-[14px] text-[#111] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 resize-none font-montserrat"
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[#999] font-medium">
              <ShieldCheck className="h-4 w-4 text-[#F88A2B]" />
              Registrada no histórico do caso
            </div>
            <button
              disabled={!reply.trim() || sending}
              onClick={sendReply}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#F88A2B] text-[#111] text-[13px] font-bold hover:bg-[#e07a1f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {sending ? "Enviando…" : "Enviar resposta"}
            </button>
          </div>
        </section>

        {/* Timeline */}
        <section className="rounded-[32px] bg-white border border-white/60 shadow-sm p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <h3
              className="text-[22px] font-bold text-[#111]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Histórico do caso
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#999]">
              {messages.length} mensagem(ns)
            </span>
          </div>
          {messages.length === 0 ? (
            <p className="text-[13px] text-[#999]">Nenhuma resposta ainda.</p>
          ) : (
            <ol className="relative border-l border-[#EFEAE5] ml-3 space-y-6">
              {messages.map((m) => (
                <li key={m.id} className="pl-6 relative">
                  <div className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full bg-[#F88A2B] ring-4 ring-[#F88A2B]/10" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-1">
                    {new Date(m.created_at).toLocaleString("pt-BR")} • {m.author_role === "rh" ? "RH" : "Colaborador"}
                  </div>
                  <p className="text-[13px] text-[#333] leading-relaxed whitespace-pre-wrap">{m.body}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

      </div>
    </EnterpriseRHLayout>
  );
}
