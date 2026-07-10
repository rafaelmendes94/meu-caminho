import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, ShieldOff, ShieldCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { EnterpriseUserLayout } from "@/components/layouts/EnterpriseUserLayout";

function download(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MyPrivacyScreen() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [consents, setConsents] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [deletion, setDeletion] = useState<any | null>(null);

  const load = async () => {
    if (!user) return;
    const [{ data: ce }, { data: ex }, { data: del }] = await Promise.all([
      supabase.from("consent_events").select("id,consent_type,action,version,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("data_export_requests").select("id,status,requested_at,completed_at,file_size_bytes").eq("user_id", user.id).order("requested_at", { ascending: false }).limit(10),
      supabase.from("data_deletion_requests").select("id,status,scheduled_for,requested_at,canceled_at").eq("user_id", user.id).order("requested_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setConsents(ce ?? []);
    setExports(ex ?? []);
    setDeletion(del ?? null);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const exportMyData = async () => {
    if (!user) return;
    setBusy("export");
    const { data: req } = await supabase.from("data_export_requests").insert({ user_id: user.id, organization_id: profile?.organization_id ?? null, status: "processing" }).select("id").single();
    try {
      const [prof, checkins, pulses, consentsRes, tickets] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("emotional_checkins").select("*").eq("user_id", user.id),
        supabase.from("pulse_responses").select("*").eq("user_id", user.id),
        supabase.from("privacy_consents").select("*").eq("user_id", user.id),
        supabase.from("support_tickets").select("*").eq("user_id", user.id),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        profile: prof.data,
        emotional_checkins: checkins.data ?? [],
        pulse_responses: pulses.data ?? [],
        privacy_consents: consentsRes.data ?? [],
        support_tickets: tickets.data ?? [],
      };
      const content = JSON.stringify(payload, null, 2);
      download(`meus-dados-${new Date().toISOString().slice(0,10)}.json`, content);
      if (req?.id) await supabase.from("data_export_requests").update({ status: "completed", completed_at: new Date().toISOString(), file_size_bytes: content.length }).eq("id", req.id);
      toast.success("Seus dados foram baixados.");
      load();
    } catch (e: any) {
      if (req?.id) await supabase.from("data_export_requests").update({ status: "failed", error: e?.message ?? "erro" }).eq("id", req.id);
      toast.error("Não foi possível gerar sua exportação.");
    } finally {
      setBusy(null);
    }
  };

  const requestDeletion = async () => {
    if (!user) return;
    if (!confirm("Tem certeza? Sua conta será agendada para exclusão em 30 dias. Você pode cancelar antes.")) return;
    setBusy("delete");
    const scheduled = new Date(); scheduled.setDate(scheduled.getDate() + 30);
    const { error } = await supabase.from("data_deletion_requests").insert({
      user_id: user.id,
      organization_id: profile?.organization_id ?? null,
      status: "scheduled",
      scheduled_for: scheduled.toISOString(),
      reason: "user_requested",
    });
    setBusy(null);
    if (error) toast.error("Não foi possível registrar sua solicitação.");
    else { toast.success("Exclusão agendada."); load(); }
  };

  const cancelDeletion = async () => {
    if (!deletion) return;
    setBusy("cancel");
    const { error } = await supabase.from("data_deletion_requests").update({ status: "canceled", canceled_at: new Date().toISOString() }).eq("id", deletion.id);
    setBusy(null);
    if (error) toast.error("Não foi possível cancelar.");
    else { toast.success("Solicitação cancelada."); load(); }
  };

  const revokeConsent = async () => {
    if (!user) return;
    setBusy("revoke");
    const { error } = await supabase.from("consent_events").insert({
      user_id: user.id,
      organization_id: profile?.organization_id ?? null,
      consent_type: "enterprise_privacy",
      action: "revoke",
      version: "v1.1",
      source: "self_service",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    setBusy(null);
    if (error) toast.error("Não foi possível registrar a revogação.");
    else { toast.success("Consentimento revogado. RH será notificado."); load(); }
  };

  return (
    <EnterpriseUserLayout title="Minha Privacidade">
      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-[12px] font-bold text-[#666] uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <header className="space-y-3">
          <h1 className="text-[36px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Meus dados, minhas regras.
          </h1>
          <p className="text-[15px] text-[#666] max-w-2xl">
            Aqui você exerce seus direitos LGPD: acessa, exporta, revoga consentimentos e solicita a eliminação da sua conta.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-black/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F88A2B]/10 flex items-center justify-center"><Download className="h-5 w-5 text-[#F88A2B]" /></div>
              <h3 className="text-lg font-bold">Exportar meus dados</h3>
            </div>
            <p className="text-sm text-[#666]">Baixe em JSON tudo o que a plataforma armazena sobre você.</p>
            <button onClick={exportMyData} disabled={busy === "export"} className="w-full h-12 rounded-full bg-[#F88A2B] text-white font-bold text-sm disabled:opacity-50">
              {busy === "export" ? "Gerando…" : "Baixar meus dados (JSON)"}
            </button>
            {exports.length > 0 && (
              <ul className="text-xs text-[#999] space-y-1 pt-2 border-t border-black/5">
                {exports.slice(0, 3).map((e) => (
                  <li key={e.id} className="flex justify-between">
                    <span>{new Date(e.requested_at).toLocaleString("pt-BR")}</span>
                    <span className="font-bold text-[#666]">{e.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-white border border-black/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center"><Trash2 className="h-5 w-5 text-red-500" /></div>
              <h3 className="text-lg font-bold">Excluir minha conta</h3>
            </div>
            <p className="text-sm text-[#666]">Sua conta será agendada para exclusão em 30 dias. Cancele quando quiser durante o prazo.</p>
            {deletion && (deletion.status === "scheduled" || deletion.status === "pending") ? (
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-800 text-xs flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Agendada para {new Date(deletion.scheduled_for).toLocaleDateString("pt-BR")}
                </div>
                <button onClick={cancelDeletion} disabled={busy === "cancel"} className="w-full h-12 rounded-full bg-black/5 text-[#111] font-bold text-sm disabled:opacity-50">
                  {busy === "cancel" ? "Cancelando…" : "Cancelar exclusão"}
                </button>
              </div>
            ) : (
              <button onClick={requestDeletion} disabled={busy === "delete"} className="w-full h-12 rounded-full bg-red-500 text-white font-bold text-sm disabled:opacity-50">
                {busy === "delete" ? "Registrando…" : "Solicitar exclusão"}
              </button>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-white border border-black/5 space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center"><ShieldOff className="h-5 w-5 text-[#111]" /></div>
              <h3 className="text-lg font-bold">Revogar meu consentimento</h3>
            </div>
            <p className="text-sm text-[#666]">Ao revogar, seus dados agregados deixam de ser incluídos em análises futuras. O RH é notificado.</p>
            <button onClick={revokeConsent} disabled={busy === "revoke"} className="h-12 px-6 rounded-full bg-[#111] text-white font-bold text-sm disabled:opacity-50">
              {busy === "revoke" ? "Registrando…" : "Revogar consentimento"}
            </button>

            <div className="pt-4 border-t border-black/5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-3">Histórico de consentimentos</h4>
              {consents.length === 0 ? (
                <p className="text-xs text-[#999]">Nenhum evento registrado ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {consents.slice(0, 8).map((c) => (
                    <li key={c.id} className="flex items-center justify-between text-xs">
                      <span className="text-[#333]">{c.consent_type}</span>
                      <span className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${c.action === "grant" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{c.action}</span>
                        <span className="text-[#999]">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <p className="text-[10px] text-center text-[#999] uppercase tracking-widest">
          <ShieldCheck className="inline h-3 w-3 mr-1 text-[#F88A2B]" />
          Todos os direitos exercidos aqui são registrados na trilha de auditoria e cumprem a LGPD Art. 18.
        </p>
      </div>
    </EnterpriseUserLayout>
  );
}