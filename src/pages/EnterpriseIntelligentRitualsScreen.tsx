import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, ShieldCheck, Plus, Play, Check, X, Trash2, Clock, Activity } from "lucide-react";
import { EnterpriseRHLayout, EnterpriseRHButton } from "@/components/EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Ritual = {
  id: string;
  title: string;
  description: string | null;
  ritual_type: string;
  source_type: string;
  status: "draft" | "published" | "completed" | "canceled";
  scheduled_at: string | null;
  duration_minutes: number;
  audience: string;
  instructions: unknown;
  expected_outcome: string | null;
  generated_by_ai: boolean;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  completed: "Concluído",
  canceled: "Cancelado",
};

const statusColor = (s: string) => {
  switch (s) {
    case "published": return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
    case "completed": return "bg-[#F88A2B]/10 text-[#F88A2B] border-[#F88A2B]/20";
    case "canceled": return "bg-red-500/10 text-red-600 border-red-500/20";
    default: return "bg-[#F7F4F2] text-[#666] border-[#E5E0DA]";
  }
};

const toSteps = (v: unknown): { step: number; title: string; description: string }[] =>
  Array.isArray(v) ? v.map((it: any, i) => ({
    step: Number(it?.step) || i + 1,
    title: String(it?.title ?? ""),
    description: String(it?.description ?? ""),
  })) : [];

export default function EnterpriseIntelligentRitualsScreen() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ title: "", description: "", ritual_type: "custom", duration_minutes: 15, expected_outcome: "" });
  const [impactBySource, setImpactBySource] = useState<Record<string, number>>({});
  const [measuringId, setMeasuringId] = useState<string | null>(null);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("intelligent_rituals")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false });
    setRituals((data ?? []) as Ritual[]);
    const ids = (data ?? []).map((r: any) => r.id);
    if (ids.length) {
      const { data: imp } = await (supabase as any)
        .from("impact_measurements")
        .select("source_id, impact_score, measured_at")
        .eq("organization_id", organization.id)
        .eq("source_type", "ritual")
        .in("source_id", ids)
        .order("measured_at", { ascending: false });
      const map: Record<string, number> = {};
      ((imp ?? []) as any[]).forEach((r) => { if (!(r.source_id in map) && r.impact_score != null) map[r.source_id] = r.impact_score; });
      setImpactBySource(map);
    } else setImpactBySource({});
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const generateAI = async () => {
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("generate-intelligent-ritual", { body: { source_type: "dna" } });
    setGenerating(false);
    if (error || (data as any)?.error) {
      toast({ title: "Erro ao gerar ritual", description: error?.message ?? String((data as any)?.error), variant: "destructive" });
    } else {
      toast({ title: "Ritual sugerido pela IA" });
      await load();
    }
  };

  const setStatus = async (id: string, status: Ritual["status"]) => {
    const { error } = await (supabase as any)
      .from("intelligent_rituals").update({ status }).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: `Ritual ${STATUS_LABEL[status].toLowerCase()}` }); load(); }
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("intelligent_rituals").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Ritual removido" }); load(); }
  };

  const measureImpact = async (id: string) => {
    setMeasuringId(id);
    const { error } = await supabase.functions.invoke("measure-impact", {
      body: { source_type: "ritual", source_id: id },
    });
    setMeasuringId(null);
    if (error) toast({ title: "Erro ao medir impacto", description: error.message, variant: "destructive" });
    else { toast({ title: "Impacto medido" }); await load(); }
  };

  const createManual = async () => {
    if (!organization?.id || !manual.title.trim()) return;
    const { error } = await (supabase as any).from("intelligent_rituals").insert({
      organization_id: organization.id,
      title: manual.title.trim(),
      description: manual.description || null,
      ritual_type: manual.ritual_type,
      source_type: "manual",
      status: "draft",
      duration_minutes: manual.duration_minutes,
      expected_outcome: manual.expected_outcome || null,
      generated_by_ai: false,
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Ritual criado" });
      setShowManual(false);
      setManual({ title: "", description: "", ritual_type: "custom", duration_minutes: 15, expected_outcome: "" });
      load();
    }
  };

  return (
    <EnterpriseRHLayout title="Rituais Inteligentes™">
      <div className="space-y-8 animate-fade-in">
        <section className="rounded-[2.5rem] bg-white border border-[#E5E0DA] p-10 md:p-14 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/5 blur-[120px] rounded-full -mr-40 -mt-40" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="px-3 py-1.5 rounded-full bg-[#F88A2B]/10 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-[#F88A2B]/20 inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Rituais Inteligentes™
              </span>
              <h2 className="text-[32px] md:text-[42px] leading-tight font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Transforme sinais coletivos em rituais que a organização pratica.
              </h2>
              <p className="text-[15px] md:text-[17px] leading-relaxed text-[#666] max-w-xl">
                Sugestões geradas por IA a partir de indicadores agregados, ou rituais criados manualmente pelo RH.
              </p>
            </div>
            <div className="shrink-0 flex flex-col gap-2">
              <EnterpriseRHButton onClick={generateAI} icon={generating ? RefreshCw : Sparkles} fullWidth={false}>
                {generating ? "Gerando…" : "Sugerir ritual por IA"}
              </EnterpriseRHButton>
              <button
                onClick={() => setShowManual(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#F88A2B]/30 bg-white text-[#F88A2B] px-4 py-2 text-[12px] font-bold hover:bg-[#F88A2B]/5"
              >
                <Plus className="w-3.5 h-3.5" /> Criar manualmente
              </button>
            </div>
          </div>
        </section>

        <div className="rounded-2xl bg-[#F7F4F2] border border-[#E5E0DA] p-4 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#F88A2B] mt-0.5" />
          <p className="text-[12px] text-[#666] leading-relaxed">
            Rituais são sugeridos a partir de sinais agregados. Participações individuais não são exibidas ao RH.
          </p>
        </div>

        {loading && rituals.length === 0 && (
          <div className="rounded-3xl bg-white p-10 border border-white/60 text-center text-[13px] text-[#666]">
            Carregando rituais…
          </div>
        )}

        {!loading && rituals.length === 0 && (
          <div className="rounded-3xl bg-white p-10 border border-white/60 text-center space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-[#F88A2B]" />
            <p className="text-[15px] font-bold text-[#111]">Nenhum ritual criado ainda.</p>
            <p className="text-[12px] text-[#666] max-w-md mx-auto">
              Gere uma sugestão a partir do DNA Organizacional™ ou crie um ritual manualmente.
            </p>
          </div>
        )}

        {rituals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {rituals.map((r) => {
              const steps = toSteps(r.instructions);
              return (
                <article key={r.id} className="rounded-3xl bg-white border border-[#E5E0DA] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4">
                  <header className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusColor(r.status)}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F7F4F2] text-[#666] border border-[#E5E0DA]">
                          {r.ritual_type}
                        </span>
                        <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {r.duration_minutes}min
                        </span>
                        {r.generated_by_ai && (
                          <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> IA
                          </span>
                        )}
                        {impactBySource[r.id] != null && (
                          <span className={`text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${Number(impactBySource[r.id]) >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                            <Activity className="w-3 h-3" /> Impacto {Number(impactBySource[r.id]) >= 0 ? "+" : ""}{Number(impactBySource[r.id]).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[18px] font-bold text-[#111] leading-snug">{r.title}</h3>
                    </div>
                  </header>
                  {r.description && <p className="text-[13px] text-[#555] leading-relaxed">{r.description}</p>}
                  {steps.length > 0 && (
                    <div className="rounded-2xl bg-[#F7F4F2] p-3 border border-[#E5E0DA]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-2">Instruções</p>
                      <ol className="space-y-1.5">
                        {steps.slice(0, 6).map((s, i) => (
                          <li key={i} className="text-[12px] text-[#555] leading-relaxed">
                            <span className="font-bold text-[#F88A2B]">{s.step}.</span> {s.title}
                            {s.description && <span className="text-[#777]"> — {s.description}</span>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {r.expected_outcome && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-1">Resultado esperado</p>
                      <p className="text-[12px] text-[#555] leading-relaxed">{r.expected_outcome}</p>
                    </div>
                  )}
                  <footer className="flex flex-wrap gap-2 pt-2 border-t border-[#F7F4F2]">
                    {r.status === "draft" && (
                      <>
                        <button onClick={() => setStatus(r.id, "published")} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700">
                          <Play className="w-3 h-3" /> Publicar
                        </button>
                        <button onClick={() => remove(r.id)} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </>
                    )}
                    {r.status === "published" && (
                      <>
                        <button onClick={() => setStatus(r.id, "completed")} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#F88A2B] hover:opacity-80">
                          <Check className="w-3 h-3" /> Concluir
                        </button>
                        <button onClick={() => setStatus(r.id, "canceled")} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700">
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      </>
                    )}
                    <button onClick={() => measureImpact(r.id)} disabled={measuringId === r.id} className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#111] hover:text-[#F88A2B] disabled:opacity-40">
                      {measuringId === r.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />} Medir impacto
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        )}

        {showManual && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowManual(false)}>
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[18px] font-bold text-[#111]">Criar ritual manual</h3>
              <input
                value={manual.title}
                onChange={(e) => setManual({ ...manual, title: e.target.value })}
                placeholder="Título"
                className="w-full rounded-xl border border-[#E5E0DA] p-3 text-[13px]"
              />
              <textarea
                value={manual.description}
                onChange={(e) => setManual({ ...manual, description: e.target.value })}
                placeholder="Descrição"
                rows={3}
                className="w-full rounded-xl border border-[#E5E0DA] p-3 text-[13px]"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={manual.ritual_type}
                  onChange={(e) => setManual({ ...manual, ritual_type: e.target.value })}
                  className="rounded-xl border border-[#E5E0DA] p-3 text-[13px]"
                >
                  {["custom","energy","communication","recovery","leadership","engagement","collaboration","reflection"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={5} max={60}
                  value={manual.duration_minutes}
                  onChange={(e) => setManual({ ...manual, duration_minutes: Number(e.target.value) })}
                  className="rounded-xl border border-[#E5E0DA] p-3 text-[13px]"
                />
              </div>
              <textarea
                value={manual.expected_outcome}
                onChange={(e) => setManual({ ...manual, expected_outcome: e.target.value })}
                placeholder="Resultado esperado (opcional)"
                rows={2}
                className="w-full rounded-xl border border-[#E5E0DA] p-3 text-[13px]"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowManual(false)} className="px-4 py-2 text-[12px] font-bold text-[#666]">Cancelar</button>
                <button onClick={createManual} className="px-4 py-2 rounded-xl bg-[#F88A2B] text-white text-[12px] font-bold">Criar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EnterpriseRHLayout>
  );
}