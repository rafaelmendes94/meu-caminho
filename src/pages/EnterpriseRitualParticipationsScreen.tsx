import { useEffect, useState } from "react";
import { Activity, Users, CheckCircle2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { useOrgMinGroupSize } from "@/hooks/useOrgMinGroupSize";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";
import { EmptyState } from "@/components/ui/empty-state";

type Row = {
  ritual_id: string;
  ritual_name: string;
  ritual_type: string | null;
  participants: number;
  completed: number;
  avg_score: number | null;
};

export default function EnterpriseRitualParticipationsScreen() {
  const { organization } = useAuth();
  const minGroup = useOrgMinGroupSize();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data: rituals } = await supabase
      .from("intelligent_rituals")
      .select("id, name, ritual_type")
      .eq("organization_id", organization.id);

    if (!rituals?.length) {
      setRows([]);
      setLoading(false);
      return;
    }

    const ids = rituals.map((r) => r.id);
    const { data: parts } = await supabase
      .from("ritual_participations")
      .select("ritual_id, completed_at, feedback_score")
      .in("ritual_id", ids);

    const grouped: Record<string, { p: number; c: number; sum: number; n: number }> = {};
    for (const p of parts ?? []) {
      const g = (grouped[p.ritual_id] ||= { p: 0, c: 0, sum: 0, n: 0 });
      g.p += 1;
      if (p.completed_at) g.c += 1;
      if (p.feedback_score != null) {
        g.sum += p.feedback_score;
        g.n += 1;
      }
    }

    setRows(
      rituals.map((r) => {
        const g = grouped[r.id] ?? { p: 0, c: 0, sum: 0, n: 0 };
        return {
          ritual_id: r.id,
          ritual_name: r.name,
          ritual_type: r.ritual_type,
          participants: g.p,
          completed: g.c,
          avg_score: g.n > 0 ? g.sum / g.n : null,
        };
      })
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  useRealtime(
    "ritual-participations-admin",
    [{ table: "ritual_participations", event: "*" }],
    () => void load(),
    [organization?.id]
  );

  const totalP = rows.reduce((a, r) => a + r.participants, 0);
  const totalC = rows.reduce((a, r) => a + r.completed, 0);
  const completionRate = totalP > 0 ? Math.round((totalC / totalP) * 100) : 0;

  return (
    <EnterpriseRHLayout title="Participação em Rituais">
      <div className="space-y-6 pb-20">
        <header className="rounded-3xl bg-white border border-black/5 p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#F88A2B] font-bold">Rituais Inteligentes</p>
          <h1 className="mt-1 text-[26px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Participação real por ritual
          </h1>
          <p className="mt-2 text-[13px] text-[#666]">
            Amostras individuais preservadas; nomes só aparecem em grupos de {minGroup}+ participantes.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPI icon={Users} label="Participações totais" value={totalP.toString()} />
          <KPI icon={CheckCircle2} label="Conclusões" value={totalC.toString()} />
          <KPI icon={Activity} label="Taxa de conclusão" value={`${completionRate}%`} />
        </section>

        {loading ? (
          <p className="text-[#999] px-1">Carregando…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Nenhum ritual criado ainda"
            description="Crie um ritual inteligente para começar a acompanhar a participação real do time."
          />
        ) : (
          <div className="rounded-3xl bg-white border border-black/5 overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#FAF7F5] text-[11px] uppercase tracking-widest text-[#999]">
                <tr>
                  <th className="px-5 py-3">Ritual</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3 text-right">Participantes</th>
                  <th className="px-5 py-3 text-right">Concluídos</th>
                  <th className="px-5 py-3 text-right">Nota média</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const rate = r.participants > 0 ? Math.round((r.completed / r.participants) * 100) : 0;
                  const showAvg = r.participants >= minGroup && r.avg_score != null;
                  return (
                    <tr key={r.ritual_id} className="border-t border-black/5">
                      <td className="px-5 py-3 font-medium text-[#111]">{r.ritual_name}</td>
                      <td className="px-5 py-3 text-[#666]">{r.ritual_type ?? "—"}</td>
                      <td className="px-5 py-3 text-right text-[#111]">{r.participants}</td>
                      <td className="px-5 py-3 text-right text-[#111]">
                        {r.completed} <span className="text-[#999]">({rate}%)</span>
                      </td>
                      <td className="px-5 py-3 text-right text-[#111]">
                        {showAvg ? (
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#F88A2B]" />
                            {r.avg_score!.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-[#999]">amostra &lt; {minGroup}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EnterpriseRHLayout>
  );
}

function KPI({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white border border-black/5 p-5">
      <div className="flex items-center gap-2 text-[#F88A2B]">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-3 text-[28px] font-extrabold text-[#111]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {value}
      </p>
    </div>
  );
}