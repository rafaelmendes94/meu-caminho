import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  Users,
  Calendar,
  Info,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Ritual = {
  id: string;
  title: string;
  description: string | null;
  ritual_type: string;
  duration_minutes: number;
  expected_outcome: string | null;
  instructions: unknown;
  scheduled_at: string | null;
  created_at: string;
};

type Participation = {
  id: string;
  ritual_id: string;
  completed_at: string | null;
  feedback_score: number | null;
};

const toSteps = (v: unknown): { step: number; title: string; description: string }[] =>
  Array.isArray(v)
    ? v.map((it: any, i) => ({
        step: Number(it?.step) || i + 1,
        title: String(it?.title ?? ""),
        description: String(it?.description ?? ""),
      }))
    : [];

const EnterpriseRitualsScreen = () => {
  const { organization, user } = useAuth();
  const { toast } = useToast();
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [parts, setParts] = useState<Record<string, Participation>>({});
  const [loading, setLoading] = useState(false);
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const [feedbackScore, setFeedbackScore] = useState<number>(0);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("intelligent_rituals")
      .select("id,title,description,ritual_type,duration_minutes,expected_outcome,instructions,scheduled_at,created_at")
      .eq("organization_id", organization.id)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    const list = (data ?? []) as Ritual[];
    setRituals(list);
    if (user?.id && list.length > 0) {
      const { data: p } = await (supabase as any)
        .from("ritual_participations")
        .select("id,ritual_id,completed_at,feedback_score")
        .eq("user_id", user.id)
        .in("ritual_id", list.map((r) => r.id));
      const map: Record<string, Participation> = {};
      (p ?? []).forEach((it: Participation) => { map[it.ritual_id] = it; });
      setParts(map);
    } else {
      setParts({});
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id, user?.id]);

  const join = async (rId: string) => {
    if (!user?.id) return;
    const { data, error } = await (supabase as any)
      .from("ritual_participations")
      .upsert({ ritual_id: rId, user_id: user.id }, { onConflict: "ritual_id,user_id" })
      .select("id,ritual_id,completed_at,feedback_score")
      .single();
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { setParts({ ...parts, [rId]: data as Participation }); toast({ title: "Participação confirmada" }); }
  };

  const complete = async (rId: string) => {
    const p = parts[rId];
    if (!p) return;
    const { data, error } = await (supabase as any)
      .from("ritual_participations")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", p.id)
      .select("id,ritual_id,completed_at,feedback_score")
      .single();
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      setParts({ ...parts, [rId]: data as Participation });
      toast({ title: "Ritual concluído" });
      setFeedbackFor(rId);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackFor || !feedbackScore) { setFeedbackFor(null); return; }
    const p = parts[feedbackFor];
    if (!p) return;
    const { error } = await (supabase as any)
      .from("ritual_participations")
      .update({ feedback_score: feedbackScore })
      .eq("id", p.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Obrigado pelo feedback" });
    setFeedbackFor(null);
    setFeedbackScore(0);
    load();
  };

  const impacts = [
    { label: "Redução de aceleração mental", value: 68 },
    { label: "Maior sensação de apoio", value: 84 },
    { label: "Melhora de clareza coletiva", value: 72 },
    { label: "Recuperação emocional gradual", value: 59 },
  ];

  const timeline = [
    { day: "SEGUNDA", event: "check-in coletivo" },
    { day: "QUARTA", event: "pausa consciente" },
    { day: "SEXTA", event: "momento de recuperação" },
  ];

  return (
    <EnterpriseRHLayout title="Rituais coletivos">
      <div className="space-y-8 animate-fade-in py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-black/5 text-[#111] rounded-3xl p-8 relative overflow-hidden shadow-sm"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#F88A2B]/20 flex items-center justify-center border border-[#F88A2B]/30">
                <Sparkles className="w-4 h-4 text-[#F88A2B]" />
              </div>
              <span className="text-[#666] text-xs uppercase tracking-[0.2em] font-medium">Cuidado coletivo</span>
            </div>
            <h2 className="font-playfair text-2xl md:text-3xl text-[#111] leading-tight mb-4">
              Culturas saudáveis são construídas em pequenos rituais repetidos.
            </h2>
            <p className="text-[#444] text-sm md:text-base leading-relaxed">
              Participe dos rituais publicados pela sua organização.
            </p>
          </div>
        </motion.div>

        <section className="space-y-4">
          <h3 className="font-playfair text-xl font-bold">Rituais publicados</h3>
          {loading && rituals.length === 0 && (
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-black/5 text-center text-sm text-[#666]">
              Carregando rituais…
            </div>
          )}
          {!loading && rituals.length === 0 && (
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-black/5 text-center text-sm text-[#666]">
              Nenhum ritual publicado no momento.
            </div>
          )}
          <div className="grid gap-4">
            {rituals.map((ritual, index) => {
              const p = parts[ritual.id];
              const steps = toSteps(ritual.instructions);
              return (
                <motion.div
                  key={ritual.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-[#F88A2B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h4 className="font-bold text-[#0B0908]">{ritual.title}</h4>
                        <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider whitespace-nowrap">
                          {ritual.duration_minutes}min · {ritual.ritual_type}
                        </span>
                      </div>
                      {ritual.description && (
                        <p className="text-sm text-[#0B0908]/60 leading-relaxed">{ritual.description}</p>
                      )}
                    </div>
                  </div>
                  {steps.length > 0 && (
                    <ol className="space-y-1.5 bg-[#F7F4F2] rounded-2xl p-4">
                      {steps.slice(0, 6).map((s, i) => (
                        <li key={i} className="text-[12px] text-[#555]">
                          <span className="font-bold text-[#F88A2B]">{s.step}.</span> {s.title}
                          {s.description && <span className="text-[#777]"> — {s.description}</span>}
                        </li>
                      ))}
                    </ol>
                  )}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-black/5">
                    {!p && (
                      <button onClick={() => join(ritual.id)} className="text-[11px] font-bold uppercase tracking-wider text-[#F88A2B] hover:opacity-80 inline-flex items-center gap-1">
                        <Users className="w-3 h-3" /> Participar
                      </button>
                    )}
                    {p && !p.completed_at && (
                      <button onClick={() => complete(ritual.id)} className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Marcar como concluído
                      </button>
                    )}
                    {p?.completed_at && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Concluído
                        {p.feedback_score ? ` · ${p.feedback_score}/5` : ""}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-playfair text-xl font-bold">Impacto percebido</h3>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 space-y-6">
            {impacts.map((impact, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#0B0908]/60">
                  <span>{impact.label}</span>
                  <span className="text-[#F88A2B]">{impact.value}%</span>
                </div>
                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${impact.value}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-full bg-gradient-to-r from-[#F88A2B] to-[#F88A2B]/60 rounded-full"
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-2 text-xs text-[#0B0908]/40 bg-black/[0.02] p-4 rounded-2xl border border-black/5">
              <Info className="w-4 h-4 shrink-0 text-[#F88A2B]" />
              <p>Rituais são sugeridos a partir de sinais agregados. Participações individuais não são exibidas ao RH.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-playfair text-xl font-bold">Calendário emocional</h3>
          <div className="relative">
            <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-[#F88A2B]/30 via-[#F88A2B]/10 to-transparent" />
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-full bg-white border border-black/5 flex items-center justify-center relative z-10 shadow-sm group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5 text-[#F88A2B]" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                    <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest">{item.day}</span>
                    <h4 className="font-bold text-sm text-[#0B0908]">{item.event}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="pt-4 pb-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-[#0B0908]/40 px-4 py-2 rounded-full border border-black/5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-medium">Os rituais fortalecem equilíbrio coletivo sem monitorar indivíduos.</span>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {feedbackFor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeedbackFor(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] z-[101] p-8 pb-12 max-w-md mx-auto shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-8" />
              <div className="space-y-6 text-center">
                <h2 className="font-playfair text-xl font-bold">Como foi este ritual?</h2>
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFeedbackScore(n)}
                      className={`w-12 h-12 rounded-full border font-bold ${feedbackScore >= n ? "bg-[#F88A2B] text-white border-[#F88A2B]" : "bg-white text-[#666] border-black/10"}`}
                    >{n}</button>
                  ))}
                </div>
                <button
                  onClick={submitFeedback}
                  className="w-full bg-[#F88A2B] text-[#111] py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#F88A2B]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Enviar feedback
                </button>
                <button
                  onClick={() => { setFeedbackFor(null); setFeedbackScore(0); }}
                  className="w-full text-xs text-[#666] font-bold uppercase tracking-widest"
                >
                  Pular
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseRitualsScreen;