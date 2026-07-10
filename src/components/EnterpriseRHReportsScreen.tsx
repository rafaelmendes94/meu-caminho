import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MoreVertical,
  AlertTriangle,
  EyeOff
} from "lucide-react";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
};

export default function EnterpriseRHReportsScreen() {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThisMonth, setNewThisMonth] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("id,protocol,subject,body,category,severity,status,is_anonymous,created_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as ReportRow[];
    setReports(rows);
    const startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);
    setNewThisMonth(rows.filter((r) => new Date(r.created_at) >= startMonth).length);
    setPendingCount(rows.filter((r) => r.status === "open").length);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  useRealtime(
    "rh_reports",
    organization?.id
      ? [{ table: "reports", filter: `organization_id=eq.${organization.id}` }]
      : [],
    () => load(),
    [organization?.id]
  );

  const term = searchTerm.trim().toLowerCase();
  const filtered = reports.filter((r) => {
    if (!showResolved && r.status === "resolved") return false;
    if (showResolved && r.status !== "resolved") return false;
    if (!term) return true;
    return (
      r.protocol.toLowerCase().includes(term) ||
      r.subject.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term)
    );
  });

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <EnterpriseRHLayout title="Canal Direto RH">
      <div className="space-y-8 animate-fade-in">
        
        {/* Hero Card */}
        <section>
          <div className="rounded-[2.5rem] bg-white border border-[#E5E0DA] text-[#111] p-10 md:p-14 relative overflow-hidden text-[#111] shadow-sm">
            {/* Simple decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-[0.03] rounded-full -translate-y-20 translate-x-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F88A2B] opacity-[0.02] rounded-full translate-y-16 -translate-x-10 blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Canal Confidencial</span>
                </div>
                
                <h2 className="text-[32px] md:text-[42px] leading-tight font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Escuta ativa e sigilosa.
                </h2>
                
                <p className="text-[15px] md:text-[18px] leading-relaxed text-[#666]">
                  Aqui você acessa as mensagens enviadas diretamente pelo time através do Canal Direto. Cada relato é tratado com confidencialidade e proteção de dados.
                </p>
              </div>

              <div className="bg-black/[0.03] backdrop-blur-md rounded-3xl p-6 border border-black/5 shrink-0">
                <div className="text-[32px] font-bold text-[#111] mb-1">{newThisMonth}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Relatos este mês</div>
                <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#F88A2B] animate-pulse" />
                  <span className="text-[10px] font-medium text-[#999]">{pendingCount} pendente(s)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999] group-focus-within:text-[#F88A2B] transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por protocolo, assunto ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-white/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 transition-all font-montserrat text-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowResolved((s) => !s)}
              className={`flex-1 md:flex-none h-14 px-6 rounded-2xl border shadow-sm flex items-center justify-center gap-2 font-bold text-sm transition-all ${showResolved ? "bg-[#F88A2B] text-white border-[#F88A2B]" : "bg-white text-[#111] border-[#E5E0DA] hover:bg-gray-50"}`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {showResolved ? "Ver abertos" : "Ver resolvidos"}
            </button>
          </div>
        </section>

        {/* Reports List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] font-montserrat">Mensagens Recebidas</h3>
            <span className="text-[11px] text-[#999] font-medium">{loading ? "Carregando…" : `Mostrando ${filtered.length} relatos`}</span>
          </div>

          {!loading && filtered.length === 0 && (
            <div className="rounded-[32px] bg-white border border-white/60 p-12 text-center text-[#999] text-sm">
              Nenhum relato {showResolved ? "resolvido" : "aberto"} encontrado.
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((report) => (
              <div 
                key={report.id}
                onClick={() => navigate(`/enterprise/rh/denuncias/${report.id}`)}
                className={`rounded-[32px] bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 transition-all hover:shadow-md cursor-pointer group relative overflow-hidden ${report.status === 'open' ? 'ring-2 ring-[#F88A2B]/20' : ''}`}
              >
                {report.status === 'open' && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F88A2B]" />
                )}
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-bold text-[#999] bg-[#F7F4F2] px-2.5 py-1 rounded-full uppercase tracking-widest">
                        {report.protocol}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#999] uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        {fmtDate(report.created_at)}
                      </div>
                      {report.severity === 'high' && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Alta prioridade
                        </div>
                      )}
                      {report.status === 'open' && (
                        <div className="px-2 py-1 rounded-full bg-[#F88A2B]/10 text-[#F88A2B] text-[9px] font-bold uppercase tracking-widest">
                          Aberto
                        </div>
                      )}
                    </div>

                    <h4 className="text-[18px] md:text-[20px] font-bold text-[#111] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {report.subject}
                    </h4>

                    <p className="text-[14px] text-[#555] leading-relaxed line-clamp-2 italic font-medium">
                      "{report.body}"
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#F7F4F2] flex items-center justify-center shrink-0">
                          <MessageSquare className="h-4 w-4 text-[#F88A2B]" />
                        </div>
                        <span className="text-[12px] font-bold text-[#111]">Categoria: {report.category}</span>
                      </div>
                      <div className="h-1 w-1 rounded-full bg-[#999]" />
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-3.5 w-3.5 text-[#999]" />
                        <span className="text-[11px] font-bold text-[#999] uppercase tracking-wider">
                          {report.is_anonymous ? "Anônimo" : "Identificado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-between items-center md:items-end gap-4 shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/enterprise/rh/denuncias/${report.id}`); }}
                      className="flex items-center gap-2 px-6 h-12 rounded-full bg-white border border-[#EFEAE5] text-[13px] font-bold text-[#111] hover:bg-[#F88A2B] hover:text-[#111] hover:border-[#F88A2B] transition-all group/btn"
                    >
                      Ver detalhes
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security and Privacy Footer */}
        <section className="pt-8">
          <div className="rounded-[32px] p-8 bg-white border border-white/60 shadow-sm flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="h-16 w-16 rounded-full bg-[#F88A2B]/10 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck size={32} className="text-[#F88A2B]" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-[18px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>Segurança de dados e anonimato garantido.</h4>
              <p className="text-[13px] text-[#666] leading-relaxed max-w-2xl">
                O Canal Direto foi projetado para proteger a identidade do colaborador. Somente o RH responsável tem acesso a estas mensagens. Nenhuma informação de identidade é exposta a menos que o colaborador opte explicitamente por se identificar em sua mensagem.
              </p>
            </div>
            <button className="px-8 h-14 rounded-full bg-[#F7F4F2] text-[#999] font-bold text-[13px] uppercase tracking-widest hover:bg-black/5 transition-all">
              Termos de Uso
            </button>
          </div>
        </section>

      </div>
    </EnterpriseRHLayout>
  );
}
