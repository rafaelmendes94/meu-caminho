import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Msg = { role: "user" | "assistant"; content: string };

const DIMENSIONS = [
  "Contexto",
  "Rotina",
  "Liderança",
  "Comunicação",
  "Energia",
  "Objetivos",
];

const INITIAL_ASSISTANT =
  "Olá! Que bom ter você aqui. Vou fazer algumas perguntas curtas para entender o seu momento e personalizar sua jornada. Para começar: como você descreveria o seu trabalho hoje em uma frase?";

export default function OnboardingChatScreen() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: INITIAL_ASSISTANT },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [userTurns, setUserTurns] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (finish = false) => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("onboarding-chat", {
        body: { interview_id: interviewId, message: content, finish },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setInterviewId((data as any).interview_id);
      setUserTurns((n) => n + 1);
      setMessages((m) => [...m, { role: "assistant", content: (data as any).assistant }]);
    } catch (e: any) {
      toast.error(e?.message || "Não foi possível enviar sua mensagem.");
    } finally {
      setSending(false);
    }
  };

  const generateProfile = async () => {
    if (!interviewId) return toast.error("Envie ao menos uma mensagem antes.");
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-employee-profile", {
        body: { interview_id: interviewId },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      await refresh();
      toast.success("Perfil Inteligente gerado!");
      navigate("/onboarding/concluido", { replace: true });
    } catch (e: any) {
      toast.error(e?.message || "Não foi possível gerar o perfil.");
    } finally {
      setGenerating(false);
    }
  };

  const canFinish = userTurns >= 4;
  const progress = Math.min(userTurns / DIMENSIONS.length, 1);

  return (
    <main className="min-h-[100dvh] bg-[#F7F4F2] font-display flex flex-col">
      <header className="px-6 pt-8 pb-4 max-w-2xl w-full mx-auto">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#F88A2B] font-bold">Onboarding</p>
        <h1 className="mt-1 text-[26px] leading-tight font-black text-[#111]">
          Vamos conhecer você
        </h1>
        <p className="mt-2 text-[13px] text-[#666] leading-relaxed">
          Suas respostas ajudam a personalizar sua jornada. Elas não são diagnóstico clínico e não serão exibidas individualmente ao RH.
        </p>
        <div className="mt-4 flex items-center gap-2">
          {DIMENSIONS.map((d, i) => (
            <div
              key={d}
              className="flex-1 h-[6px] rounded-full"
              style={{
                background: i / DIMENSIONS.length < progress ? "#F88A2B" : "#EFEAE5",
              }}
            />
          ))}
        </div>
      </header>

      <section
        ref={listRef}
        className="flex-1 overflow-y-auto px-6 pb-4 max-w-2xl w-full mx-auto space-y-3"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
              m.role === "assistant"
                ? "bg-white border border-[#EFEAE5] text-[#111]"
                : "ml-auto bg-[#F88A2B] text-white"
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white border border-[#EFEAE5] text-[#999] text-[13px]">
            Pensando…
          </div>
        )}
      </section>

      <footer className="px-6 pt-3 pb-6 max-w-2xl w-full mx-auto sticky bottom-0 bg-[#F7F4F2]">
        {canFinish && (
          <button
            onClick={generateProfile}
            disabled={generating}
            className="w-full mb-3 h-[48px] rounded-full bg-[#111] text-white text-[14px] font-semibold disabled:opacity-60"
          >
            {generating ? "Gerando seu Perfil Inteligente…" : "Gerar meu Perfil Inteligente"}
          </button>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escreva sua resposta…"
            disabled={sending || generating}
            className="flex-1 h-[52px] px-5 rounded-full bg-white border border-[#EFEAE5] text-[15px] text-[#111] focus:outline-none focus:border-[#F88A2B]"
          />
          <button
            onClick={() => send()}
            disabled={sending || generating || !input.trim()}
            className="h-[52px] px-6 rounded-full bg-[#F88A2B] text-white text-[14px] font-semibold disabled:opacity-60"
          >
            Enviar
          </button>
        </div>
      </footer>
    </main>
  );
}