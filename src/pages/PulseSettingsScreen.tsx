import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EnterpriseUserLayout } from "@/components/layouts/EnterpriseUserLayout";

const DAYS = [
  { v: 1, label: "Seg" }, { v: 2, label: "Ter" }, { v: 3, label: "Qua" },
  { v: 4, label: "Qui" }, { v: 5, label: "Sex" }, { v: 6, label: "Sáb" }, { v: 0, label: "Dom" },
];

export default function PulseSettingsScreen() {
  const { user } = useAuth();
  const [days, setDays] = useState<number[]>([2, 4]);
  const [hour, setHour] = useState(10);
  const [optedOut, setOptedOut] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("pulse_schedules")
        .select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setDays(data.preferred_days ?? [2, 4]);
        setHour(data.preferred_hour ?? 10);
        setOptedOut(data.opted_out ?? false);
        setSnoozeUntil(data.snooze_until ?? null);
      }
      setLoading(false);
    })();
  }, [user]);

  const toggleDay = (d: number) =>
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort());

  const save = async (patch?: Partial<{ opted_out: boolean; snooze_until: string | null }>) => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      preferred_days: days,
      preferred_hour: hour,
      opted_out: patch?.opted_out ?? optedOut,
      snooze_until: patch?.snooze_until !== undefined ? patch.snooze_until : snoozeUntil,
    };
    const { error } = await supabase.from("pulse_schedules").upsert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Preferências salvas.");
  };

  const snooze7 = async () => {
    const until = new Date(Date.now() + 7 * 86_400_000).toISOString();
    setSnoozeUntil(until);
    await save({ snooze_until: until });
  };

  const toggleOptOut = async () => {
    const next = !optedOut;
    setOptedOut(next);
    await save({ opted_out: next });
  };

  return (
    <EnterpriseUserLayout title="Preferências do Pulse">
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-8">
        <header>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#F88A2B] font-bold">Pulse IA™</p>
          <h1 className="mt-1 text-[26px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Preferências
          </h1>
          <p className="mt-2 text-[13px] text-[#666]">Configure quando quer receber seus pulses semanais.</p>
        </header>

        {loading ? (
          <p className="text-[#999]">Carregando…</p>
        ) : (
          <>
            <section className="rounded-3xl bg-white border border-black/5 p-6">
              <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-3">Dias preferidos</h2>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d.v}
                    onClick={() => toggleDay(d.v)}
                    className={`h-10 px-4 rounded-full text-[13px] font-bold border transition-colors ${
                      days.includes(d.v) ? "bg-[#F88A2B] text-white border-[#F88A2B]" : "bg-white text-[#111] border-black/10"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white border border-black/5 p-6">
              <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#999] mb-3">Horário preferido</h2>
              <input
                type="range" min={6} max={22} value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-full accent-[#F88A2B]"
              />
              <p className="mt-2 text-[15px] font-bold text-[#111]">{String(hour).padStart(2, "0")}:00</p>
            </section>

            <button
              onClick={() => save()}
              disabled={saving}
              className="w-full h-12 rounded-full bg-[#F88A2B] text-white font-semibold disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar preferências"}
            </button>

            <section className="rounded-3xl bg-white border border-black/5 p-6 space-y-3">
              <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#999]">Pausar</h2>
              <button onClick={snooze7} className="w-full h-11 rounded-full border border-black/10 text-[#111] font-bold text-[13px]">
                {snoozeUntil ? `Pausado até ${new Date(snoozeUntil).toLocaleDateString("pt-BR")}` : "Pausar por 7 dias"}
              </button>
              <button onClick={toggleOptOut} className={`w-full h-11 rounded-full font-bold text-[13px] ${optedOut ? "bg-[#111] text-white" : "border border-black/10 text-[#111]"}`}>
                {optedOut ? "Reativar Pulse" : "Desativar Pulse (opt-out)"}
              </button>
            </section>
          </>
        )}
      </div>
    </EnterpriseUserLayout>
  );
}