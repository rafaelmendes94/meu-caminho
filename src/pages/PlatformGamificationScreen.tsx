import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlatformAdminLayout } from "@/components/layouts/PlatformAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Trophy, Flame, Target, Star, Sparkles, CalendarClock, Settings2 } from "lucide-react";

/**
 * Fase 26 — Enterprise Gamification™ (Super Admin).
 * CRUD real sobre tabelas gam_* (RLS platform_admin) e dashboards
 * agregados de XP, usuários ativos, missões, badges e streak.
 * Não cria ranking global e não introduz competição negativa.
 */

type Row = Record<string, any>;

type GamTable =
  | "gam_xp_rules"
  | "gam_levels"
  | "gam_badges"
  | "gam_missions"
  | "gam_achievements"
  | "gam_seasons"
  | "gam_events"
  | "gam_org_settings";

function useGamTable(table: GamTable, order = "created_at") {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from as any)(table)
      .select("*")
      .order(order, { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, [table]);
  return { rows, loading, reload };
}

function KPI({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </Card>
  );
}

/* ============ Dashboard ============ */
function DashboardTab() {
  const [metrics, setMetrics] = useState({
    totalXp: 0, activeUsers: 0, missionsDone: 0, badgesAwarded: 0, avgStreak: 0, avgLevel: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const [xpAgg, missions, badges, streaks, levels] = await Promise.all([
        (supabase.from as any)("gam_user_xp").select("user_id,xp").gte("created_at", since),
        (supabase.from as any)("gam_user_missions").select("id", { count: "exact", head: true }).eq("status", "completed"),
        (supabase.from as any)("gam_user_badges").select("id", { count: "exact", head: true }),
        (supabase.from as any)("gam_user_streaks").select("current_streak"),
        (supabase.from as any)("gam_levels").select("min_xp"),
      ]);
      const rows: any[] = xpAgg.data ?? [];
      const totalXp = rows.reduce((s, r) => s + (r.xp ?? 0), 0);
      const activeUsers = new Set(rows.map((r) => r.user_id)).size;
      const streakRows: any[] = streaks.data ?? [];
      const avgStreak = streakRows.length
        ? Math.round((streakRows.reduce((s, r) => s + (r.current_streak ?? 0), 0) / streakRows.length) * 10) / 10
        : 0;
      const levelRows: any[] = levels.data ?? [];
      const avgLevel = levelRows.length ? Math.round((levelRows.length + 1) / 2) : 0;
      setMetrics({
        totalXp,
        activeUsers,
        missionsDone: missions.count ?? 0,
        badgesAwarded: badges.count ?? 0,
        avgStreak,
        avgLevel,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <KPI label="XP distribuído (30d)" value={metrics.totalXp.toLocaleString("pt-BR")} icon={Star} />
      <KPI label="Usuários ativos (30d)" value={metrics.activeUsers} icon={Sparkles} />
      <KPI label="Missões concluídas" value={metrics.missionsDone} icon={Target} />
      <KPI label="Badges concedidos" value={metrics.badgesAwarded} icon={Trophy} />
      <KPI label="Sequência média" value={`${metrics.avgStreak} dias`} icon={Flame} />
      <KPI label="Nível médio (catálogo)" value={metrics.avgLevel} icon={CalendarClock} />
    </div>
  );
}

/* ============ Generic CRUD helper ============ */
function CrudPanel<T extends GamTable>({
  table, columns, defaults, title,
}: {
  table: T;
  title: string;
  columns: { key: string; label: string; type?: "text" | "number" | "textarea" | "datetime-local"; placeholder?: string }[];
  defaults: Row;
}) {
  const { rows, loading, reload } = useGamTable(table);
  const [draft, setDraft] = useState<Row>(defaults);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase.from as any)(table).insert(draft);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Criado");
    setDraft(defaults);
    reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este registro?")) return;
    const { error } = await (supabase.from as any)(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Novo {title.toLowerCase()}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {columns.map((c) => (
            <div key={c.key} className={c.type === "textarea" ? "md:col-span-2" : ""}>
              <Label className="text-xs">{c.label}</Label>
              {c.type === "textarea" ? (
                <Textarea
                  value={draft[c.key] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [c.key]: e.target.value })}
                  placeholder={c.placeholder}
                  rows={2}
                />
              ) : (
                <Input
                  type={c.type ?? "text"}
                  value={draft[c.key] ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [c.key]: c.type === "number" ? Number(e.target.value || 0) : e.target.value,
                    })
                  }
                  placeholder={c.placeholder}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" />Criar</>}
          </Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-3 border-b text-sm font-medium">{title} ({rows.length})</div>
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum registro ainda.</div>
        ) : (
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.id} className="p-3 flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.name ?? r.title ?? r.code ?? r.label ?? r.id}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {columns
                      .filter((c) => c.key !== "name" && c.key !== "title")
                      .slice(0, 3)
                      .map((c) => `${c.label}: ${String(r[c.key] ?? "—")}`)
                      .join(" · ")}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============ Page ============ */
export default function PlatformGamificationScreen() {
  const tabs = useMemo(
    () => [
      { v: "dashboard", label: "Dashboard" },
      { v: "xp", label: "XP" },
      { v: "levels", label: "Níveis" },
      { v: "badges", label: "Badges" },
      { v: "missions", label: "Missões" },
      { v: "achievements", label: "Conquistas" },
      { v: "seasons", label: "Temporadas" },
      { v: "events", label: "Eventos" },
      { v: "settings", label: "Configurações" },
    ],
    []
  );

  return (
    <PlatformAdminLayout
      title="Gamification"
      subtitle="XP, badges, missões, sequências, temporadas e eventos — sem ranking obrigatório."
    >
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.v} value={t.v}>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="mt-4"><DashboardTab /></TabsContent>

        <TabsContent value="xp" className="mt-4">
          <CrudPanel
            table="gam_xp_rules"
            title="Regras de XP"
            defaults={{ action_key: "", label: "", xp: 10, daily_cap: null, active: true }}
            columns={[
              { key: "action_key", label: "Ação (chave)", placeholder: "checkin_daily" },
              { key: "label", label: "Rótulo", placeholder: "Check-in diário" },
              { key: "xp", label: "XP", type: "number" },
              { key: "daily_cap", label: "Limite diário (opcional)", type: "number" },
            ]}
          />
        </TabsContent>

        <TabsContent value="levels" className="mt-4">
          <CrudPanel
            table="gam_levels"
            title="Níveis"
            defaults={{ level: 1, name: "", min_xp: 0, color: "#3B82F6", icon: "star" }}
            columns={[
              { key: "level", label: "Nível", type: "number" },
              { key: "name", label: "Nome" },
              { key: "min_xp", label: "XP mínimo", type: "number" },
              { key: "color", label: "Cor" },
              { key: "icon", label: "Ícone" },
            ]}
          />
        </TabsContent>

        <TabsContent value="badges" className="mt-4">
          <CrudPanel
            table="gam_badges"
            title="Badges"
            defaults={{ code: "", name: "", description: "", category: "", color: "#F59E0B", xp_reward: 0, status: "active" }}
            columns={[
              { key: "code", label: "Código" },
              { key: "name", label: "Nome" },
              { key: "category", label: "Categoria" },
              { key: "xp_reward", label: "XP", type: "number" },
              { key: "color", label: "Cor" },
              { key: "image_url", label: "Imagem (URL)" },
              { key: "description", label: "Descrição", type: "textarea" },
            ]}
          />
        </TabsContent>

        <TabsContent value="missions" className="mt-4">
          <CrudPanel
            table="gam_missions"
            title="Missões"
            defaults={{ code: "", title: "", description: "", mission_type: "daily", xp_reward: 20, status: "active" }}
            columns={[
              { key: "code", label: "Código" },
              { key: "title", label: "Título" },
              { key: "mission_type", label: "Tipo (daily/weekly/monthly/special)" },
              { key: "xp_reward", label: "XP", type: "number" },
              { key: "starts_at", label: "Início", type: "datetime-local" },
              { key: "ends_at", label: "Fim", type: "datetime-local" },
              { key: "description", label: "Descrição", type: "textarea" },
            ]}
          />
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          <CrudPanel
            table="gam_achievements"
            title="Conquistas"
            defaults={{ code: "", name: "", description: "", xp_reward: 0, status: "active" }}
            columns={[
              { key: "code", label: "Código" },
              { key: "name", label: "Nome" },
              { key: "xp_reward", label: "XP", type: "number" },
              { key: "description", label: "Descrição", type: "textarea" },
            ]}
          />
        </TabsContent>

        <TabsContent value="seasons" className="mt-4">
          <CrudPanel
            table="gam_seasons"
            title="Temporadas"
            defaults={{ code: "", name: "", description: "", starts_at: "", ends_at: "", status: "scheduled" }}
            columns={[
              { key: "code", label: "Código" },
              { key: "name", label: "Nome" },
              { key: "starts_at", label: "Início", type: "datetime-local" },
              { key: "ends_at", label: "Fim", type: "datetime-local" },
              { key: "description", label: "Descrição", type: "textarea" },
            ]}
          />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <CrudPanel
            table="gam_events"
            title="Eventos"
            defaults={{ code: "", name: "", description: "", starts_at: "", ends_at: "", xp_multiplier: 1, status: "scheduled" }}
            columns={[
              { key: "code", label: "Código" },
              { key: "name", label: "Nome" },
              { key: "xp_multiplier", label: "Multiplicador XP", type: "number" },
              { key: "starts_at", label: "Início", type: "datetime-local" },
              { key: "ends_at", label: "Fim", type: "datetime-local" },
              { key: "description", label: "Descrição", type: "textarea" },
            ]}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="p-4 text-sm space-y-2">
            <div className="flex items-center gap-2 font-medium"><Settings2 className="h-4 w-4" /> Configurações por empresa</div>
            <p className="text-muted-foreground">
              Cada empresa pode ativar/desativar gamificação e ocultar XP, níveis, streak ou badges via a tabela
              <code className="mx-1 px-1 rounded bg-muted">gam_org_settings</code>.
              A UX do colaborador respeita essas flags sem competição obrigatória.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </PlatformAdminLayout>
  );
}