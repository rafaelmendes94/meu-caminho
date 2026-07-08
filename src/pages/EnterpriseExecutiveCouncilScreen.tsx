import React, { useEffect, useMemo, useRef, useState } from "react";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Send, ShieldCheck, MessageSquarePlus, Loader2, Dna, ChevronRight, Info } from "lucide-react";

type ExecMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  context_snapshot?: Record<string, any>;
  created_at: string;
};

type Conversation = {
  id: string;
  title: string | null;
  updated_at: string;
};

type AssistantPayload = {
  answer: string;
  confidence: "low" | "medium" | "high";
  used_sections: string[];
  recommendations: string[];
};

const SUGGESTED = [
  "Como evoluiu nosso engajamento nos últimos meses?",
  "Quais áreas precisam de atenção agora?",
  "Onde devemos investir treinamento?",
  "Quais indicadores melhoraram?",
  "Como está nossa comunicação organizacional?",
  "Existe algum risco emergente?",
];

function parseAssistant(content: string): AssistantPayload | null {
  try {
    const p = JSON.parse(content);
    if (p && typeof p === "object" && "answer" in p) return p as AssistantPayload;
  } catch {
    /* ignore */
  }
  return null;
}

const ConfidenceBadge = ({ level }: { level: string }) => {
  const map: Record<string, string> = {
    high: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-zinc-50 text-zinc-600 border-zinc-200",
  };
  const label: Record<string, string> = { high: "Alta confiança", medium: "Confiança moderada", low: "Baixa confiança" };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${map[level] ?? map.low}`}>
      {label[level] ?? "Confiança"}
    </span>
  );
};

const EnterpriseExecutiveCouncilScreen = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ExecMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [dnaSummary, setDnaSummary] = useState<{ overall_score: number | null; summary: string | null } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("executive_ai_conversations")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) return;
    setConversations((data ?? []) as Conversation[]);
  };

  const loadMessages = async (id: string) => {
    const { data, error } = await supabase
      .from("executive_ai_messages")
      .select("id,role,content,context_snapshot,created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (error) return;
    setMessages((data ?? []) as ExecMessage[]);
  };

  const loadDna = async () => {
    const { data } = await supabase
      .from("organizational_dna_reports")
      .select("overall_score,summary")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setDnaSummary(data as any);
  };

  useEffect(() => {
    loadConversations();
    loadDna();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const startNew = () => {
    setActiveId(null);
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const send = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || sending || !user) return;
    setSending(true);
    setInput("");

    // Optimistic user message
    setMessages((prev) => [
      ...prev,
      { id: `tmp-${Date.now()}`, role: "user", content: question, created_at: new Date().toISOString() },
    ]);

    try {
      const { data, error } = await supabase.functions.invoke("executive-ai", {
        body: { question, conversation_id: activeId ?? undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(String(data.error));

      const convId = data.conversation_id as string;
      if (!activeId) setActiveId(convId);
      await loadMessages(convId);
      await loadConversations();
    } catch (e: any) {
      const msg = e?.message ?? "Erro ao consultar o Conselho Executivo IA.";
      toast({ title: "Não foi possível responder", description: msg, variant: "destructive" });
      // Rollback optimistic if needed
      if (activeId) loadMessages(activeId);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const bodyMessages = useMemo(
    () => messages.filter((m) => m.role !== "system"),
    [messages],
  );

  return (
    <EnterpriseRHLayout title="Conselho Executivo IA">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 animate-fade-in">
        {/* Sidebar: past conversations */}
        <aside className="space-y-4">
          <button
            onClick={startNew}
            className="w-full flex items-center justify-center gap-2 bg-[#0B0908] text-white py-3 rounded-2xl font-bold text-xs hover:bg-zinc-800 transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" /> Nova conversa
          </button>
          <div className="bg-white rounded-2xl border border-zinc-100 p-3 max-h-[70vh] overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-2 py-2">
              Conversas anteriores
            </div>
            {conversations.length === 0 && (
              <p className="text-xs text-zinc-400 px-2 py-4">Nenhuma conversa ainda.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                  activeId === c.id ? "bg-[#F88A2B]/10 text-[#0B0908]" : "hover:bg-zinc-50 text-zinc-600"
                }`}
              >
                <div className="font-medium truncate">{c.title || "Sem título"}</div>
                <div className="text-[10px] text-zinc-400">{new Date(c.updated_at).toLocaleString("pt-BR")}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <section className="space-y-6">
          {/* Top: DNA summary */}
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center text-[#F88A2B]">
              <Dna className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">DNA Organizacional™ — resumo</div>
              <div className="text-sm text-zinc-700 mt-1 line-clamp-3">
                {dnaSummary?.summary || "Ainda não há relatório do DNA Organizacional. Gere um relatório para enriquecer as respostas."}
              </div>
              {dnaSummary?.overall_score != null && (
                <div className="mt-2 text-[10px] font-bold text-zinc-500">Score geral: {Math.round(dnaSummary.overall_score)}/100</div>
              )}
            </div>
          </div>

          {/* Privacy notice */}
          <div className="flex items-center gap-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl px-4 py-3 text-[11px] text-emerald-800">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>
              O Conselho Executivo IA responde exclusivamente com indicadores agregados e anonimizados. Nenhuma resposta utiliza dados individuais.
            </span>
          </div>

          {/* Chat */}
          <div className="bg-white rounded-3xl border border-zinc-100 flex flex-col min-h-[55vh]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[55vh]">
              {bodyMessages.length === 0 && !sending && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#F88A2B]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Perguntas sugeridas</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SUGGESTED.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-left text-xs p-4 rounded-2xl border border-zinc-100 hover:border-[#F88A2B]/40 hover:bg-[#F88A2B]/5 transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="text-zinc-700">{q}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {bodyMessages.map((m) => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="bg-[#0B0908] text-white text-sm rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                        {m.content}
                      </div>
                    </div>
                  );
                }
                const parsed = parseAssistant(m.content);
                return (
                  <div key={m.id} className="flex justify-start">
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] space-y-3">
                      {parsed ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#F88A2B]" />
                            <ConfidenceBadge level={parsed.confidence} />
                          </div>
                          <p className="text-sm text-[#0B0908] whitespace-pre-wrap">{parsed.answer}</p>
                          {parsed.recommendations?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Recomendações</div>
                              <ul className="space-y-1">
                                {parsed.recommendations.map((r, i) => (
                                  <li key={i} className="text-xs text-zinc-700 flex gap-2">
                                    <span className="text-[#F88A2B]">•</span> {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {parsed.used_sections?.length > 0 && (
                            <div className="pt-2 border-t border-zinc-200/60 flex flex-wrap gap-1.5">
                              {parsed.used_sections.map((s) => (
                                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-500">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-[#0B0908] whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex justify-start">
                  <div className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-zinc-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#F88A2B]" />
                    Analisando indicadores organizacionais…
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-zinc-100 p-4">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Pergunte ao Conselho Executivo IA…"
                  rows={2}
                  className="flex-1 resize-none rounded-2xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-[#F88A2B]"
                  disabled={sending}
                />
                <button
                  onClick={() => send()}
                  disabled={sending || !input.trim()}
                  className="h-12 w-12 rounded-2xl bg-[#F88A2B] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#e07a20] transition-colors"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-zinc-400">
                <Info className="w-3 h-3" />
                Respostas baseadas apenas em dados agregados. Nunca são utilizados check-ins, mensagens ou perfis individuais.
              </div>
            </div>
          </div>
        </section>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseExecutiveCouncilScreen;