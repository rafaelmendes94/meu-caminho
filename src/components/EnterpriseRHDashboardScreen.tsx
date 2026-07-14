import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Minus, ArrowRight, ShieldCheck, Zap, RefreshCw,
  Sparkles, Dna, Target, Gauge, Activity, AlertTriangle, Users, UserPlus,
  MessageSquare, Building2, Package as PackageIcon, BookOpen, Download,
  Play, ChevronRight, ClipboardList, Calendar,
} from "lucide-react";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRealtime } from "@/hooks/useRealtime";
import { Skeleton } from "@/components/ui/skeleton";

type Summary = {
  avg_mood_30d: number | null;
  avg_energy_30d: number | null;
  avg_stress_30d: number | null;
  equilibrium_index_30d: number | null;
  checkin_participants_30d: number | null;
  pulse_energy_30d: number | null;
  pulse_engagement_30d: number | null;
  pulse_communication_30d: number | null;
  pulse_equilibrium_30d: number | null;
  pulse_recovery_30d: number | null;
  pulse_participants_30d: number | null;
  open_alerts_count: number;
  critical_alerts_count: number;
};

const fmt = (v: number | null | undefined, digits = 1) =>
  v === null || v === undefined ? "•••" : Number(v).toFixed(digits);

// Fase 23 — Executive Cockpit
// Reorganiza o Dashboard em seções densas (Hero → Saúde → Alertas → IA → Operação → Equipe → Conteúdo → Próximas ações).
// Todas as queries preexistentes foram mantidas; adicionamos apenas contagens leves e reagrupamos a apresentação.

const Card = ({
  children, className = "", onClick, as = "div",
}: {
  children: React.ReactNode; className?: string; onClick?: () => void; as?: "div" | "button";
}) => {
  const cls = `rounded-2xl bg-white border border-[#E9E4DF] shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all ${
    onClick ? "text-left hover:border-[#F88A2B]/40 hover:shadow-[0_10px_30px_-10px_rgba(248,138,43,0.25)]" : ""
  } ${className}`;
  if (as === "button" || onClick) {
    return <button onClick={onClick} className={`w-full ${cls}`}>{children}</button>;
  }
  return <div className={cls}>{children}</div>;
};

const SectionTitle = ({ label, action }: { label: string; action?: React.ReactNode }) => (
  <div className="flex items-end justify-between px-1 mb-3">
    <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0B0908]/50 font-montserrat">{label}</h3>
    {action}
  </div>
);

const MiniKPI = ({
  icon: Icon, value, label, trend, onClick,
}: {
  icon: any; value: string; label: string; trend?: { dir: "up" | "down" | "flat"; text: string }; onClick?: () => void;
}) => (
  <Card onClick={onClick} className="p-4">
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-[#F88A2B]/10 grid place-items-center shrink-0">
        <Icon className="h-4 w-4 text-[#F88A2B]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#666]">{label}</div>
        <div className="text-[22px] font-bold text-[#111] leading-none mt-1">{value}</div>
        {trend && (
          <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${
            trend.dir === "up" ? "text-emerald-600" : trend.dir === "down" ? "text-amber-600" : "text-slate-500"
          }`}>
            {trend.dir === "up" ? <TrendingUp className="h-3 w-3" /> : trend.dir === "down" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {trend.text}
          </div>
        )}
      </div>
    </div>
  </Card>
);

const SeverityDot = ({ level }: { level: string }) => {
  const color =
    level === "critical" ? "bg-red-500" :
    level === "high" ? "bg-orange-500" :
    level === "medium" || level === "warning" ? "bg-amber-500" :
    "bg-blue-500";
  return <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />;
};

type AlertRow = { id: string; title: string; severity: string; created_at: string };
type NextAction = { id: string; label: string; hint: string; icon: any; to: string; when?: string };

export default function EnterpriseRHDashboardScreen() {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [predictive, setPredictive] = useState<{ open: number; critical: number; top?: { title: string; severity: string } | null }>({ open: 0, critical: 0, top: null });
  const [dna, setDna] = useState<{ overall: number | null; generated_at: string | null; strengths: string[] } | null>(null);
  const [weeklyInsights, setWeeklyInsights] = useState<{ count: number; top: { title: string; severity: string | null } | null }>({ count: 0, top: null });
  const [orgScore, setOrgScore] = useState<{ overall: number | null; previous: number | null; confidence: number | null } | null>(null);
  const [impactSummary, setImpactSummary] = useState<{ count: number; avg: number | null; top: { source_type: string; impact: number } | null }>({ count: 0, avg: null, top: null });
  const [alertsList, setAlertsList] = useState<AlertRow[]>([]);
  const [team, setTeam] = useState<{ employees: number; invites: number; departments: number; units: number }>({ employees: 0, invites: 0, departments: 0, units: 0 });
  const [contentStats, setContentStats] = useState<{ views7d: number; downloads7d: number; topTitle: string | null }>({ views7d: 0, downloads7d: 0, topTitle: null });
  const [plansSoon, setPlansSoon] = useState<{ id: string; title: string; due_date: string | null }[]>([]);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_rh_dashboard_summary", {
      _organization_id: organization.id,
    });
    if (!error && data) setSummary(data as unknown as Summary);
    const { data: sig } = await (supabase as any)
      .from("predictive_signals")
      .select("title, severity, status")
      .eq("organization_id", organization.id)
      .neq("status", "resolved")
      .order("detected_at", { ascending: false });
    const list = (sig as { title: string; severity: string; status: string }[]) ?? [];
    setPredictive({
      open: list.length,
      critical: list.filter((s) => s.severity === "critical").length,
      top: list[0] ?? null,
    });
    const { data: dnaRow } = await (supabase as any)
      .from("organizational_dna_reports")
      .select("overall_score, generated_at, strengths")
      .eq("organization_id", organization.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (dnaRow) {
      const s = Array.isArray((dnaRow as any).strengths) ? (dnaRow as any).strengths : [];
      setDna({
        overall: (dnaRow as any).overall_score ?? null,
        generated_at: (dnaRow as any).generated_at ?? null,
        strengths: s.slice(0, 3).map((x: unknown) => typeof x === "string" ? x : JSON.stringify(x)),
      });
    } else {
      setDna(null);
    }
    const { data: wi } = await (supabase as any)
      .from("weekly_ai_insights")
      .select("title, severity, week_of, generated_at")
      .eq("organization_id", organization.id)
      .order("generated_at", { ascending: false })
      .limit(10);
    const wiList = (wi as { title: string; severity: string | null; week_of: string }[]) ?? [];
    const currentWeek = wiList[0]?.week_of;
    const weekItems = currentWeek ? wiList.filter((w) => w.week_of === currentWeek) : [];
    setWeeklyInsights({ count: weekItems.length, top: weekItems[0] ?? null });
    const { data: scoresRows } = await (supabase as any)
      .from("organizational_scores")
      .select("overall_score, confidence, score_date")
      .eq("organization_id", organization.id)
      .order("score_date", { ascending: false })
      .limit(2);
    const sr = (scoresRows ?? []) as { overall_score: number | null; confidence: number | null }[];
    if (sr.length > 0) {
      setOrgScore({
        overall: sr[0].overall_score,
        previous: sr[1]?.overall_score ?? null,
        confidence: sr[0].confidence,
      });
    } else {
      setOrgScore(null);
    }
    const { data: impRows } = await (supabase as any)
      .from("impact_measurements")
      .select("source_type, impact_score, measured_at")
      .eq("organization_id", organization.id)
      .order("measured_at", { ascending: false })
      .limit(50);
    const impList = ((impRows ?? []) as { source_type: string; impact_score: number | null }[]).filter((r) => r.impact_score != null);
    if (impList.length) {
      const avg = impList.reduce((s, r) => s + Number(r.impact_score), 0) / impList.length;
      const top = [...impList].sort((a, b) => Number(b.impact_score) - Number(a.impact_score))[0];
      setImpactSummary({ count: impList.length, avg, top: { source_type: top.source_type, impact: Number(top.impact_score) } });
    } else {
      setImpactSummary({ count: 0, avg: null, top: null });
    }

    // Fase 23 — dados leves adicionais (contagens; nada de novo backend).
    const [alertsRes, empRes, invRes, deptRes, unitsRes, plansRes] = await Promise.all([
      (supabase as any).from("alerts")
        .select("id,title,severity,created_at,status")
        .eq("organization_id", organization.id)
        .neq("status", "resolved")
        .order("created_at", { ascending: false }).limit(8),
      (supabase as any).from("employee_profiles").select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id),
      (supabase as any).from("enterprise_invites").select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id).eq("status", "pending"),
      (supabase as any).from("departments").select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id),
      (supabase as any).from("units").select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id),
      (supabase as any).from("action_plans")
        .select("id,title,due_date,status")
        .eq("organization_id", organization.id)
        .not("due_date", "is", null)
        .order("due_date", { ascending: true }).limit(5),
    ]);
    setAlertsList(((alertsRes.data as any[]) || []).map((a) => ({
      id: a.id, title: a.title || "Alerta", severity: a.severity || "info", created_at: a.created_at,
    })));
    setTeam({
      employees: empRes.count || 0,
      invites: invRes.count || 0,
      departments: deptRes.count || 0,
      units: unitsRes.count || 0,
    });
    setPlansSoon(((plansRes.data as any[]) || []).map((p) => ({ id: p.id, title: p.title, due_date: p.due_date })));

    // Conteúdo consumido nos últimos 7 dias
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const [viewsRes, dlRes] = await Promise.all([
      (supabase as any).from("content_views").select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id).gte("created_at", since),
      (supabase as any).from("content_downloads").select("id", { count: "exact", head: true })
        .eq("organization_id", organization.id).gte("created_at", since),
    ]);
    setContentStats({
      views7d: viewsRes.count || 0,
      downloads7d: dlRes.count || 0,
      topTitle: null,
    });

    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  // Live refresh of KPIs/alerts on the dashboard.
  useRealtime(
    `dashboard-${organization?.id ?? "none"}`,
    organization?.id
      ? [
          { table: "alerts", filter: `organization_id=eq.${organization.id}` },
          { table: "weekly_ai_insights", filter: `organization_id=eq.${organization.id}` },
        ]
      : [],
    () => { void load(); },
    [organization?.id]
  );

  const refreshAlerts = async () => {
    setRecomputing(true);
    const { error } = await supabase.functions.invoke("compute-basic-alerts");
    if (error) toast({ title: "Erro ao atualizar alertas", description: error.message, variant: "destructive" });
    else toast({ title: "Alertas atualizados" });
    await load();
    setRecomputing(false);
  };

  const scoreDelta = orgScore?.overall != null && orgScore?.previous != null
    ? Math.round(Number(orgScore.overall) - Number(orgScore.previous)) : null;

  const orgName = (organization as any)?.name || "Sua empresa";
  const orgLogo = (organization as any)?.logo_url || null;
  const plan = (organization as any)?.plan || (organization as any)?.subscription_status || "—";
  const seats = (organization as any)?.seats || (organization as any)?.max_users || null;

  const nextActions: NextAction[] = [
    ...plansSoon.slice(0, 3).map((p) => ({
      id: `plan-${p.id}`, label: p.title, hint: p.due_date ? `Plano vence em ${new Date(p.due_date).toLocaleDateString("pt-BR")}` : "Plano em andamento",
      icon: Target, to: "/enterprise/rh/plano-acao", when: p.due_date || undefined,
    })),
    ...(weeklyInsights.top ? [{ id: "wi-top", label: weeklyInsights.top.title, hint: "Novo insight semanal", icon: Sparkles, to: "/enterprise/rh/insights-semanais" }] : []),
    ...(predictive.top ? [{ id: "sig-top", label: predictive.top.title, hint: `Sinal preditivo • ${predictive.top.severity}`, icon: Activity, to: "/enterprise/rh/alertas" }] : []),
    ...(team.invites > 0 ? [{ id: "inv", label: `${team.invites} convite(s) pendente(s)`, hint: "Reenvie ou acompanhe", icon: UserPlus, to: "/enterprise/rh/equipe/convidar" }] : []),
  ].slice(0, 5);

  const alertsByLevel = {
    critical: alertsList.filter((a) => a.severity === "critical"),
    high: alertsList.filter((a) => a.severity === "high"),
    medium: alertsList.filter((a) => a.severity === "medium" || a.severity === "warning"),
    info: alertsList.filter((a) => !["critical", "high", "medium", "warning"].includes(a.severity)),
  };

  return (
    <EnterpriseRHLayout title="Cockpit">
      <div className="space-y-6 animate-fade-in">

        {/* 1. HERO EXECUTIVO */}
        <section>
          <div className="rounded-2xl bg-gradient-to-br from-[#0B0908] via-[#141010] to-[#1F1712] text-white p-6 md:p-8 relative overflow-hidden border border-[#F88A2B]/20 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="h-14 w-14 rounded-xl bg-white/95 grid place-items-center shrink-0 ring-1 ring-white/10 overflow-hidden">
                  {orgLogo
                    ? <img src={orgLogo} alt={orgName} className="h-full w-full object-cover" />
                    : <Building2 className="h-6 w-6 text-[#F88A2B]" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#F88A2B]/15 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-[#F88A2B]/25">Executive Cockpit</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold uppercase tracking-wider text-white/70">{plan}</span>
                    {seats && <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold uppercase tracking-wider text-white/70">{team.employees}/{seats} licenças</span>}
                  </div>
                  <h1 className="text-[26px] md:text-[32px] font-bold leading-tight truncate" style={{ fontFamily: "'Playfair Display', serif" }}>{orgName}</h1>
                  <p className="text-[12px] text-white/60 mt-1">
                    {dna?.generated_at && <>DNA: {new Date(dna.generated_at).toLocaleDateString("pt-BR")} · </>}
                    {weeklyInsights.top && <>Insight: {weeklyInsights.top.title.slice(0, 40)}{weeklyInsights.top.title.length > 40 ? "…" : ""} · </>}
                    Atualizado agora
                  </p>
                </div>
              </div>

              {/* Score inline */}
              <button
                onClick={() => navigate('/enterprise/rh/score-organizacional')}
                className="flex items-center gap-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-4 transition-colors"
                aria-label="Abrir Score Organizacional"
              >
                <div className="text-right">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#F88A2B]">Score</div>
                  <div className="text-[36px] font-bold leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {orgScore?.overall != null ? Math.round(Number(orgScore.overall)) : "•••"}
                    <span className="text-[12px] text-white/50 font-bold">/100</span>
                  </div>
                  <div className="text-[10px] text-white/60 mt-1">
                    {scoreDelta != null && (
                      <span className={scoreDelta >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {scoreDelta >= 0 ? "+" : ""}{scoreDelta}
                      </span>
                    )}
                    {" "}· Confiança {orgScore?.confidence != null ? `${Math.round(Number(orgScore.confidence) * 100)}%` : "•••"}
                  </div>
                </div>
                <Gauge className="h-8 w-8 text-[#F88A2B]" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { label: "Adicionar colaborador", icon: UserPlus, to: "/enterprise/rh/equipe/convidar" },
                { label: "Executar IA", icon: Sparkles, to: "/enterprise/rh/conselho-executivo" },
                { label: "Criar plano", icon: Target, to: "/enterprise/rh/plano-acao" },
                { label: "Gerar DNA", icon: Dna, to: "/enterprise/rh/dna-organizacional" },
                { label: "Executar insight", icon: Zap, to: "/enterprise/rh/insights-semanais" },
              ].map((a) => (
                <button
                  key={a.to}
                  onClick={() => navigate(a.to)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#0B0908] text-[12px] font-semibold hover:bg-[#F88A2B] hover:text-white transition-colors"
                >
                  <a.icon className="h-3.5 w-3.5" /> {a.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-[#999] italic mt-2 px-1">
            Todos os indicadores são agregados e anonimizados (mín. 5 participantes por recorte).
          </p>
        </section>

        {/* 2. SAÚDE ORGANIZACIONAL — KPIs */}
        <section>
          <SectionTitle
            label="Saúde organizacional"
            action={
              <button
                onClick={refreshAlerts}
                disabled={recomputing || loading}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#666] hover:text-[#111] disabled:opacity-40"
              >
                <RefreshCw className={`h-3 w-3 ${recomputing ? "animate-spin" : ""}`} />
                Atualizar
              </button>
            }
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniKPI icon={Users} label="Participantes 30d" value={summary?.checkin_participants_30d != null ? String(summary.checkin_participants_30d) : "•••"} />
            <MiniKPI icon={Zap} label="Engajamento" value={fmt(summary?.pulse_engagement_30d, 2)} />
            <MiniKPI icon={Activity} label="Equilíbrio" value={fmt(summary?.equilibrium_index_30d, 2)} />
            <MiniKPI icon={AlertTriangle} label="Alertas abertos" value={summary ? String(summary.open_alerts_count) : "•••"} onClick={() => navigate('/enterprise/rh/alertas')} />
          </div>
        </section>

        {/* 3. ALERTAS painel + IA consolidada */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Painel de alertas */}
          <Card className="p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Alertas</div>
                <div className="text-[16px] font-bold text-[#111]">{alertsList.length} ativos</div>
              </div>
              <button onClick={() => navigate('/enterprise/rh/alertas')} className="text-[11px] font-bold text-[#666] hover:text-[#F88A2B] inline-flex items-center gap-1">
                Abrir <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-lg" />)}
              </div>
            ) : alertsList.length === 0 ? (
              <p className="text-[12px] text-[#999] italic py-4">Nenhum alerta ativo.</p>
            ) : (
              <div className="space-y-3">
                {(["critical", "high", "medium", "info"] as const).map((lv) => {
                  const items = alertsByLevel[lv];
                  if (items.length === 0) return null;
                  const labelMap: Record<string, string> = { critical: "Crítico", high: "Alto", medium: "Médio", info: "Informativo" };
                  return (
                    <div key={lv}>
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityDot level={lv} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">{labelMap[lv]}</span>
                        <span className="text-[10px] text-[#999]">· {items.length}</span>
                      </div>
                      <ul className="space-y-1">
                        {items.slice(0, 2).map((a) => (
                          <li key={a.id}>
                            <button
                              onClick={() => navigate('/enterprise/rh/alertas')}
                              className="w-full text-left text-[12px] text-[#111] hover:text-[#F88A2B] truncate"
                            >
                              {a.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* IA consolidada */}
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Inteligência Artificial</div>
                <div className="text-[16px] font-bold text-[#111]">Últimas execuções</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: Dna, title: "DNA", value: dna?.overall != null ? `${Math.round(dna.overall)}/100` : "—", hint: dna?.generated_at ? new Date(dna.generated_at).toLocaleDateString("pt-BR") : "Ainda não gerado", to: "/enterprise/rh/dna-organizacional" },
                { icon: MessageSquare, title: "Conselho", value: "Abrir", hint: "Chat executivo", to: "/enterprise/rh/conselho-executivo" },
                { icon: Sparkles, title: "Insights", value: String(weeklyInsights.count), hint: weeklyInsights.top?.title?.slice(0, 32) || "Esta semana", to: "/enterprise/rh/insights-semanais" },
                { icon: Target, title: "Planos", value: String(plansSoon.length), hint: "Com prazo", to: "/enterprise/rh/plano-acao" },
                { icon: Zap, title: "Rituais", value: "Ver", hint: "Sugestões coletivas", to: "/enterprise/rh/rituais-inteligentes" },
                { icon: Activity, title: "Impacto", value: impactSummary.count ? String(impactSummary.count) : "—", hint: impactSummary.avg != null ? `${impactSummary.avg >= 0 ? "+" : ""}${impactSummary.avg.toFixed(1)} médio` : "sem dados", to: "/enterprise/rh/impacto" },
              ].map((c) => (
                <button
                  key={c.to}
                  onClick={() => navigate(c.to)}
                  className="text-left rounded-xl border border-[#EEE7E1] p-3 hover:border-[#F88A2B]/40 hover:bg-[#FFF8F1] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <c.icon className="h-3.5 w-3.5 text-[#F88A2B]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">{c.title}</span>
                  </div>
                  <div className="text-[16px] font-bold text-[#111] leading-none">{c.value}</div>
                  <div className="text-[10px] text-[#888] mt-1 truncate">{c.hint}</div>
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* 4. OPERAÇÃO — Capacity + Emocional + Próximas ações */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card onClick={() => navigate('/enterprise/rh/capacidade')} className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Capacity Pulse</div>
            <div className="mt-1 text-[22px] font-bold text-[#111]">{fmt(summary?.pulse_energy_30d, 2)}</div>
            <div className="text-[11px] text-[#666] mt-1">Energia coletiva · comunicação {fmt(summary?.pulse_communication_30d, 2)}</div>
          </Card>
          <Card onClick={() => navigate('/enterprise/rh/mapa-emocional')} className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Mapa Emocional</div>
            <div className="mt-1 text-[22px] font-bold text-[#111]">
              Humor {fmt(summary?.avg_mood_30d, 1)} · Estresse {fmt(summary?.avg_stress_30d, 1)}
            </div>
            <div className="text-[11px] text-[#666] mt-1">Recuperação {fmt(summary?.pulse_recovery_30d, 2)}</div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Próximas ações</div>
              <Calendar className="h-4 w-4 text-[#F88A2B]" />
            </div>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-7 rounded" />)}</div>
            ) : nextActions.length === 0 ? (
              <p className="text-[12px] text-[#999] italic">Nada urgente no radar.</p>
            ) : (
              <ul className="space-y-2">
                {nextActions.map((a) => (
                  <li key={a.id}>
                    <button onClick={() => navigate(a.to)} className="w-full text-left flex items-start gap-2 group">
                      <a.icon className="h-3.5 w-3.5 text-[#F88A2B] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-[#111] truncate group-hover:text-[#F88A2B]">{a.label}</div>
                        <div className="text-[10px] text-[#888] truncate">{a.hint}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* 5. EQUIPE resumo */}
        <section>
          <SectionTitle
            label="Equipe"
            action={<button onClick={() => navigate('/enterprise/rh/equipe')} className="text-[11px] font-bold text-[#666] hover:text-[#F88A2B] inline-flex items-center gap-1">Gerenciar <ChevronRight className="h-3 w-3" /></button>}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniKPI icon={Users} label="Colaboradores" value={String(team.employees)} onClick={() => navigate('/enterprise/rh/equipe')} />
            <MiniKPI icon={UserPlus} label="Convites pendentes" value={String(team.invites)} onClick={() => navigate('/enterprise/rh/equipe/convidar')} />
            <MiniKPI icon={Building2} label="Departamentos" value={String(team.departments)} onClick={() => navigate('/enterprise/rh/departamentos')} />
            <MiniKPI icon={PackageIcon} label="Unidades" value={String(team.units)} onClick={() => navigate('/enterprise/rh/unidades')} />
          </div>
        </section>

        {/* 6. CONTEÚDO */}
        <section>
          <SectionTitle label="Conteúdo consumido" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MiniKPI icon={Play} label="Visualizações 7d" value={String(contentStats.views7d)} />
            <MiniKPI icon={Download} label="Downloads 7d" value={String(contentStats.downloads7d)} />
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-3.5 w-3.5 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Biblioteca</span>
              </div>
              <p className="text-[12px] text-[#111]">Recomende conteúdos e acompanhe o consumo agregado da equipe.</p>
              <button onClick={() => navigate('/enterprise/rh/central-admin')} className="mt-2 text-[11px] font-bold text-[#F88A2B] inline-flex items-center gap-1">
                Ver biblioteca <ChevronRight className="h-3 w-3" />
              </button>
            </Card>
          </div>
        </section>

        <p className="text-[10px] text-[#999] italic text-center pt-2">
          Todos os indicadores são agregados e anonimizados. Dados individuais nunca são exibidos ao RH.
        </p>
      </div>
    </EnterpriseRHLayout>
  );
}
