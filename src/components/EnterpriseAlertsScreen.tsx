import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  ArrowRight,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Lock,
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Check,
  Sparkles,
  RefreshCw,
  Target
} from "lucide-react";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Alert = {
  id: string;
  alert_type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  status: "open" | "acknowledged" | "resolved";
  created_at: string;
  evidence: Record<string, unknown> | null;
};

type PredictiveSignal = {
  id: string;
  signal_type: string;
  severity: "info" | "warning" | "critical";
  confidence: number;
  title: string;
  narrative: string;
  status: "open" | "acknowledged" | "resolved";
  detected_at: string;
  evidence: Record<string, unknown> | null;
};

const SEVERITY_STYLE: Record<Alert["severity"], { badge: string; label: string }> = {
  info: { badge: "bg-black/5 text-[#666] border-black/10", label: "Info" },
  warning: { badge: "bg-[#F88A2B1A] text-[#F88A2B] border-[#F88A2B2A]", label: "Atenção" },
  critical: { badge: "bg-red-500/10 text-red-600 border-red-500/20", label: "Crítico" },
};

const RealAlertCard = ({ alert, onAck, onResolve, onPlan }: { alert: Alert; onAck: () => void; onResolve: () => void; onPlan: () => void }) => {
  const s = SEVERITY_STYLE[alert.severity];
  return (
    <div className="rounded-[32px] bg-white p-7 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 animate-fade-in">
      <div className="flex justify-between items-start gap-3">
        <h4 className="text-[20px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>{alert.title}</h4>
        <div className={`px-3 py-1 rounded-full border ${s.badge}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
        </div>
      </div>
      <p className="text-[13px] text-[#444] font-medium leading-relaxed">{alert.message}</p>
      {alert.evidence && Object.keys(alert.evidence).length > 0 && (
        <div className="text-[11px] text-[#999] font-mono bg-black/[0.02] rounded-xl p-3">
          {Object.entries(alert.evidence).map(([k, v]) => (
            <div key={k}><span className="text-[#666]">{k}:</span> {String(v)}</div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-[#F7F4F2]">
        <span className="text-[10px] text-[#999] uppercase tracking-widest">{new Date(alert.created_at).toLocaleDateString()}</span>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={onPlan} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#F88A2B] hover:opacity-80">
            <Target className="h-3 w-3" /> Gerar plano
          </button>
          {alert.status === "open" && (
            <button onClick={onAck} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#666] hover:text-[#111]">
              <Check className="h-3 w-3" /> Reconhecer
            </button>
          )}
          {alert.status !== "resolved" && (
            <button onClick={onResolve} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> Resolver
            </button>
          )}
          {alert.status === "acknowledged" && (
            <span className="text-[10px] text-[#999] uppercase">Reconhecido</span>
          )}
          {alert.status === "resolved" && (
            <span className="text-[10px] text-emerald-600 uppercase">Resolvido</span>
          )}
        </div>
      </div>
    </div>
  );
};

const AlertCard = ({ title, balance, overload, energy, trend, insight }: { 
  title: string; 
  balance: number; 
  overload: string; 
  energy: string; 
  trend: string;
  insight: string;
}) => (
  <div className="rounded-[32px] bg-white p-7 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 animate-fade-in">
    <div className="flex justify-between items-start">
      <h4 className="text-[20px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h4>
      <div className="px-3 py-1 rounded-full bg-[#F88A2B1A] border border-[#F88A2B2A]">
        <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider">Atenção</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-[10px] text-[#999] font-bold uppercase tracking-widest">Equilíbrio</p>
        <p className="text-[18px] font-bold text-[#111]">{balance}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-[#999] font-bold uppercase tracking-widest">Sobrecarga</p>
        <p className="text-[18px] font-bold text-[#111]">{overload}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-[#999] font-bold uppercase tracking-widest">Energia</p>
        <p className={`text-[14px] font-bold ${energy === 'baixa' ? 'text-[#D97706]' : 'text-[#111]'}`}>{energy}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-[#999] font-bold uppercase tracking-widest">Tendência</p>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-[#D97706]" />
          <p className="text-[14px] font-bold text-[#111]">{trend}</p>
        </div>
      </div>
    </div>

    <div className="pt-4 border-t border-[#F7F4F2]">
      <p className="text-[13px] text-[#444] font-medium leading-relaxed italic" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        “{insight}”
      </p>
    </div>

    <div className="w-full h-8 relative opacity-20">
      <svg viewBox="0 0 200 40" className="w-full h-full stroke-[#F88A2B] stroke-2 fill-none">
        <path d="M0,10 C20,15 40,5 60,25 S100,35 140,15 S180,25 200,35" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

const SuggestionItem = ({ text }: { text: string }) => (
  <div className="rounded-2xl p-4 bg-black/[0.03]0 border border-white/80 shadow-sm flex items-center gap-3">
    <div className="h-2 w-2 rounded-full bg-[#F88A2B] shrink-0" />
    <p className="text-[13px] text-[#333] font-medium leading-tight">{text}</p>
  </div>
);

export default function EnterpriseAlertsScreen() {
  const navigate = useNavigate();
  const { organization, user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [signals, setSignals] = useState<PredictiveSignal[]>([]);
  const [tab, setTab] = useState<"alerts" | "predictive">("alerts");
  const [analyzing, setAnalyzing] = useState(false);

  const load = async () => {
    if (!organization?.id) return;
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false });
    setAlerts((data as unknown as Alert[]) ?? []);
    const { data: sig } = await (supabase as any)
      .from("predictive_signals")
      .select("*")
      .eq("organization_id", organization.id)
      .order("detected_at", { ascending: false });
    setSignals((sig as PredictiveSignal[]) ?? []);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const ack = async (id: string) => {
    const { error } = await supabase
      .from("alerts")
      .update({ status: "acknowledged", acknowledged_at: new Date().toISOString(), acknowledged_by: user?.id })
      .eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };
  const resolve = async (id: string) => {
    const { error } = await supabase
      .from("alerts")
      .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: user?.id })
      .eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };

  const ackSignal = async (id: string) => {
    const { error } = await (supabase as any)
      .from("predictive_signals")
      .update({ status: "acknowledged", acknowledged_at: new Date().toISOString(), acknowledged_by: user?.id })
      .eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };
  const resolveSignal = async (id: string) => {
    const { error } = await (supabase as any)
      .from("predictive_signals")
      .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: user?.id })
      .eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };

  const analyze = async () => {
    setAnalyzing(true);
    const { error } = await supabase.functions.invoke("detect-predictive-signals");
    if (error) toast({ title: "Erro ao analisar tendências", description: error.message, variant: "destructive" });
    else toast({ title: "Sinais preditivos atualizados" });
    await load();
    setAnalyzing(false);
  };

  return (
    <EnterpriseRHLayout title="Áreas em alerta">
      <div className="space-y-8 animate-fade-in">
        
        {/* Hero Card */}
        <section>
          <div className="rounded-[32px] bg-white border border-[#E5E0DA] text-[#111] p-8 md:p-12 relative overflow-hidden text-[#111] shadow-sm">
            {/* Simple decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-[0.03] rounded-full -translate-y-20 translate-x-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F88A2B] opacity-[0.02] rounded-full translate-y-16 -translate-x-10 blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="h-4 w-4 text-[#F88A2B]" />
                <span className="px-3 py-1.5 rounded-full bg-black/5 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-white/5">Dados agregados</span>
              </div>
              
              <h2 className="text-[32px] md:text-[42px] leading-tight font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Alguns sinais merecem atenção esta semana.
              </h2>
              
              <p className="text-[15px] md:text-[18px] leading-relaxed text-[#666] mb-8 max-w-2xl">
                Os alertas ajudam a identificar áreas com queda de equilíbrio, aumento de sobrecarga ou desgaste emocional coletivo.
              </p>

              <div className="w-full h-12 relative opacity-40 max-w-md">
                <svg viewBox="0 0 200 40" className="w-full h-full stroke-[#F88A2B] stroke-2 fill-none">
                  <path d="M0,30 C40,10 80,40 120,20 S160,0 200,30" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-[#EFEAE5]">
          <button
            onClick={() => setTab("alerts")}
            className={`px-4 py-3 text-[12px] font-bold uppercase tracking-widest transition ${tab === "alerts" ? "text-[#111] border-b-2 border-[#F88A2B]" : "text-[#999]"}`}
          >Alertas ({alerts.filter(a => a.status !== "resolved").length})</button>
          <button
            onClick={() => setTab("predictive")}
            className={`px-4 py-3 text-[12px] font-bold uppercase tracking-widest transition inline-flex items-center gap-2 ${tab === "predictive" ? "text-[#111] border-b-2 border-[#F88A2B]" : "text-[#999]"}`}
          ><Sparkles className="h-3 w-3" /> Sinais Preditivos ({signals.filter(s => s.status !== "resolved").length})</button>
          <div className="ml-auto">
            {tab === "predictive" && (
              <button
                onClick={analyze}
                disabled={analyzing}
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#666] hover:text-[#111] disabled:opacity-40 px-3 py-2"
              >
                <RefreshCw className={`h-3 w-3 ${analyzing ? "animate-spin" : ""}`} /> Analisar tendências
              </button>
            )}
          </div>
        </div>

        {tab === "predictive" ? (
          <section className="space-y-6">
            <p className="text-[11px] text-[#999] italic px-1">
              A Inteligência Preditiva utiliza apenas dados agregados e anonimizados. Nenhuma pessoa é identificada.
            </p>
            {signals.length === 0 ? (
              <div className="rounded-[32px] bg-white p-10 border border-white/60 shadow-sm text-center">
                <p className="text-[14px] text-[#666]">Nenhum sinal preditivo ativo no momento.</p>
                <button onClick={analyze} disabled={analyzing} className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#F88A2B] hover:opacity-80 disabled:opacity-40">
                  <Sparkles className="h-3 w-3" /> Analisar tendências agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {signals.map((s) => {
                  const style = SEVERITY_STYLE[s.severity];
                  return (
                    <div key={s.id} className="rounded-[32px] bg-white p-7 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 animate-fade-in">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-[18px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>{s.title}</h4>
                        <div className={`px-3 py-1 rounded-full border ${style.badge}`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider">{style.label}</span>
                        </div>
                      </div>
                      <p className="text-[13px] text-[#444] font-medium leading-relaxed">{s.narrative}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#999] uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" />
                        Confiança {Math.round((s.confidence ?? 0) * 100)}%
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-[#F7F4F2]">
                        <span className="text-[10px] text-[#999] uppercase tracking-widest">{new Date(s.detected_at).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          {s.status === "open" && (
                            <button onClick={() => ackSignal(s.id)} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#666] hover:text-[#111]">
                              <Check className="h-3 w-3" /> Reconhecer
                            </button>
                          )}
                          {s.status !== "resolved" && (
                            <button onClick={() => resolveSignal(s.id)} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" /> Resolver
                            </button>
                          )}
                          {s.status === "acknowledged" && (<span className="text-[10px] text-[#999] uppercase">Reconhecido</span>)}
                          {s.status === "resolved" && (<span className="text-[10px] text-emerald-600 uppercase">Resolvido</span>)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
        <>
        {/* Áreas prioritárias */}
        <section className="space-y-6">
          <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] font-montserrat px-1">Alertas ativos</h3>
          {alerts.length === 0 ? (
            <div className="rounded-[32px] bg-white p-10 border border-white/60 shadow-sm text-center">
              <p className="text-[14px] text-[#666]">Nenhum alerta no momento.</p>
              <p className="text-[11px] text-[#999] mt-2 italic">Indicadores exibidos apenas quando há amostra mínima de 5 participantes. Dados individuais nunca são exibidos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map((a) => (
                <RealAlertCard key={a.id} alert={a} onAck={() => ack(a.id)} onResolve={() => resolve(a.id)} />
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] font-montserrat">Fatores associados aos alertas</h3>
              <AlertTriangle className="h-4 w-4 text-[#999]" />
            </div>
            <div className="rounded-[32px] bg-white p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
              <ul className="space-y-5">
                {[
                  "Pressão por entrega",
                  "Excesso de ruído operacional",
                  "Dificuldade de desacelerar a mente",
                  "Baixa recuperação emocional",
                  "Fadiga contínua"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="h-2 w-2 rounded-full bg-[#F88A2B] shrink-0 shadow-[0_0_8px_rgba(248,138,43,0.4)] transition-transform group-hover:scale-125" />
                    <span className="text-[15px] text-[#444] font-medium font-montserrat group-hover:text-[#111] transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-10 text-[11px] text-[#999] font-bold font-montserrat leading-tight pt-6 border-t border-[#F7F4F2] opacity-60">
                Os fatores são inferidos de padrões coletivos e nunca de respostas individuais.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] font-montserrat px-1">Movimentos sugeridos</h3>
            <div className="grid grid-cols-1 gap-4">
              <SuggestionItem text="Criar momentos de escuta para Operações." />
              <SuggestionItem text="Reavaliar pressão contínua de entregas." />
              <SuggestionItem text="Estimular pausas cognitivas ao longo da semana." />
              <SuggestionItem text="Reforçar conteúdos de equilíbrio emocional." />
            </div>
          </section>
        </div>

        <section className="mt-8 mb-4">
          <div className="rounded-[32px] bg-white border border-[#E5E0DA] text-[#111] p-8 md:p-10 relative overflow-hidden text-[#111] shadow-sm min-h-[220px] flex items-center">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Lock className="h-4 w-4 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] font-montserrat">Anonimização automática</span>
                </div>
                
                <h3 className="text-[22px] md:text-[26px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  O sistema protege automaticamente grupos pequenos.
                </h3>
                
                <p className="text-[14px] md:text-[15px] text-[#666] leading-relaxed max-w-2xl">
                  Recortes só aparecem quando existe volume mínimo suficiente para preservar anonimato e evitar identificação individual.
                </p>
              </div>
              <div className="shrink-0 bg-black/[0.03] p-6 rounded-full border border-black/5 hidden md:block">
                <ShieldCheck size={40} className="text-[#F88A2B]" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <button 
            onClick={() => navigate('/enterprise/rh/relatorio')}
            className="h-20 rounded-3xl bg-[#F88A2B] text-[#111] font-bold flex items-center justify-between px-10 shadow-[0_20px_40px_-15px_rgba(248,138,43,0.4)] active:scale-[0.98] transition-all hover:bg-[#e77a1a] group"
          >
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6" />
              <span className="text-lg font-montserrat">Ver relatório executivo</span>
            </div>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            className="h-20 rounded-3xl bg-white border border-[#EFEAE5] text-[#111] font-bold flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] transition-all hover:bg-[#fcfbf9] hover:border-[#F88A2B]/20 group"
          >
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-lg font-montserrat">Voltar ao dashboard</span>
          </button>
        </section>

        <p className="text-center text-[11px] text-[#999] font-bold font-montserrat pb-8 leading-relaxed max-w-md mx-auto opacity-60">
          O objetivo dos alertas é apoiar prevenção emocional coletiva, nunca monitoramento individual.
        </p>
        </>
        )}
      </div>
    </EnterpriseRHLayout>
  );
}
