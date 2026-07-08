import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles } from "lucide-react";

type Prompt = { id: string; question: string; dimension: string; rotation_weight: number };

export default function PulseWidget() {
  const { user, organization, hasEmployeeProfile } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!user || !hasEmployeeProfile) return;
    (async () => {
      const { data } = await supabase
        .from("pulse_prompts")
        .select("id,question,dimension,rotation_weight")
        .eq("active", true);
      const list = (data ?? []) as Prompt[];
      if (!list.length) return;
      // Weighted random choice
      const pool: Prompt[] = [];
      list.forEach((p) => {
        for (let i = 0; i < Math.max(1, p.rotation_weight); i++) pool.push(p);
      });
      setPrompt(pool[Math.floor(Math.random() * pool.length)]);
    })();
  }, [user, hasEmployeeProfile]);

  if (!user || !hasEmployeeProfile || hidden || !prompt) return null;

  const answer = async (value: number) => {
    if (submitting) return;
    setSubmitting(true);
    await supabase.from("pulse_responses").insert({
      user_id: user.id,
      organization_id: organization?.id ?? null,
      prompt_id: prompt.id,
      value_num: value,
    });
    setSubmitting(false);
    setDone(true);
    setTimeout(() => setHidden(true), 2200);
  };

  return (
    <section className="lg:max-w-3xl">
      <div className="rounded-[24px] bg-white p-5 lg:p-6 border border-black/5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-[#F88A2B1A] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[#F88A2B]" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Pulse IA™</p>
        </div>

        {done ? (
          <p className="text-[14px] text-[#111] font-medium">Obrigado por compartilhar. Registrado com privacidade.</p>
        ) : (
          <>
            <h3 className="text-[16px] lg:text-[18px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {prompt.question}
            </h3>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => answer(v)}
                  disabled={submitting}
                  className="flex-1 h-11 rounded-full bg-[#F88A2B0D] text-[#111] font-bold text-[14px] hover:bg-[#F88A2B1A] transition-colors disabled:opacity-60"
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#999] leading-relaxed">
              Esses sinais são usados de forma agregada e anonimizada para inteligência organizacional. O RH não acessa respostas individuais.
            </p>
          </>
        )}
      </div>
    </section>
  );
}