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
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const stripEndMarker = (t: string) => t.replace(/\s*\[FIM\]\s*$/i, "").trim();
  const hasEndMarker = (t: string) => /\[FIM\]/i.test(t);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const loadInterview = async () => {
    if (!user) return;
    setLoadingHistory(true);
    setLoadError(null);
    try {
      const { data: iv, error: ivErr } = await supabase
        .from("onboarding_interviews")
        .select("id,status")
        .eq("user_id", user.id)
        .neq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (ivErr) throw ivErr;
      if (!iv) {
        setInterviewId(null);
        setMessages([{ role: "assistant", content: INITIAL_ASSISTANT }]);
        setUserTurns(0);
        return;
      }
      setInterviewId(iv.id);
      const { data: msgs, error: msgErr } = await supabase
        .from("onboarding_messages")
        .select("role,content,created_at")
        .eq("interview_id", iv.id)
        .order("created_at", { ascending: true });
      if (msgErr) throw msgErr;
      const loaded: Msg[] = (msgs ?? [])
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: stripEndMarker(m.content) }));
      setMessages(
        loaded.length > 0 ? loaded : [{ role: "assistant", content: INITIAL_ASSISTANT }]
      );
      setUserTurns(loaded.filter((m) => m.role === "user").length);
      const lastAssistant = [...(msgs ?? [])].reverse().find((m) => m.role === "assistant");
      setInterviewEnded(!!lastAssistant && hasEndMarker(lastAssistant.content));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao carregar sua entrevista.";
      setLoadError(msg);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    void loadInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
      const payload = data as { error?: string; interview_id?: string; assistant?: string } | null;
      if (payload?.error) throw new Error(payload.error);
      if (payload?.interview_id) setInterviewId(payload.interview_id);
      setUserTurns((n) => n + 1);
      const assistant = (payload?.assistant ?? "").trim();
      if (!assistant) throw new Error("empty_ai_response");
      const ended = hasEndMarker(assistant);
      setMessages((m) => [...m, { role: "assistant", content: stripEndMarker(assistant) }]);
      if (ended) setInterviewEnded(true);
    } catch (e: any) {
      const code = String(e?.message ?? "");
      const map: Record<string, string> = {
        rate_limited: "Muitas mensagens em pouco tempo. Aguarde alguns segundos e tente de novo.",
        credits_exhausted: "Cota de IA temporariamente indisponível. Tente novamente em instantes.",
        ai_error: "A IA não conseguiu responder agora. Tente novamente.",
        empty_ai_response: "Não recebi uma resposta. Tente reenviar a mensagem.",
        unauthorized: "Sua sessão expirou. Faça login novamente.",
      };
      // Restore the user message into the input so nothing is lost.
      setMessages((m) => m.filter((_, i) => i !== m.length - 1));
      setInput(content);
      toast.error(map[code] ?? "Não foi possível enviar sua mensagem. Tente novamente.");
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

  const canFinish = interviewEnded || userTurns >= 4;
  const progress = Math.min(userTurns / DIMENSIONS.length, 1);

  if (loadingHistory) {
    return (
      <main className="min-h-[100dvh] bg-[#F7F4F2] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#F88A2B]/20 border-t-[#F88A2B] animate-spin" />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-[100dvh] bg-[#F7F4F2] flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-[#666]">{loadError}</p>
          <button
            onClick={() => void loadInterview()}
            className="h-11 px-6 rounded-xl bg-[#F88A2B] text-white font-bold"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

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
          <div className="mb-3">
            {interviewEnded && (
              <p className="text-center text-[12px] text-[#666] mb-2">
                Entrevista concluída. Clique abaixo para gerar seu Perfil Inteligente.
              </p>
            )}
            <button
              onClick={generateProfile}
              disabled={generating}
              className={`w-full h-[52px] rounded-full text-[14px] font-semibold disabled:opacity-60 ${
                interviewEnded
                  ? "bg-[#F88A2B] text-white shadow-lg shadow-[#F88A2B]/30"
                  : "bg-[#111] text-white"
              }`}
            >
              {generating ? "Gerando seu Perfil Inteligente…" : "Gerar meu Perfil Inteligente"}
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={interviewEnded ? "Entrevista concluída — gere seu Perfil Inteligente acima." : "Escreva sua resposta…"}
            disabled={sending || generating || interviewEnded}
            rows={4}
            className="flex-1 min-h-[120px] max-h-[240px] px-5 py-3 rounded-2xl bg-white border border-[#EFEAE5] text-[15px] text-[#111] focus:outline-none focus:border-[#F88A2B] resize-y leading-relaxed"
          />
          <button
            onClick={() => send()}
            disabled={sending || generating || !input.trim() || interviewEnded}
            className="self-end h-[52px] px-6 rounded-full bg-[#F88A2B] text-white text-[14px] font-semibold disabled:opacity-60"
          >
            Enviar
          </button>
        </div>
      </footer>
    </main>
  );
}