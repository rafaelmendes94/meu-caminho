import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type WorkSchedule = {
  start_time: string;
  end_time: string;
  break_minutes: number;
  daily_hours: number;
  weekly_hours: number;
  time_bank: boolean;
  workdays: string[]; // ["mon","tue",...]
};

const DEFAULTS: WorkSchedule = {
  start_time: "09:00", end_time: "18:00", break_minutes: 60,
  daily_hours: 8, weekly_hours: 40, time_bank: false,
  workdays: ["mon", "tue", "wed", "thu", "fri"],
};

type Ctx = WorkSchedule & {
  isWorkday: (d: Date) => boolean;
};

const WorkScheduleContext = createContext<Ctx | null>(null);

const DAY_MAP: Record<number, string> = { 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat" };

export function useOrgWorkSchedule(): Ctx {
  const ctx = useContext(WorkScheduleContext);
  if (ctx) return ctx;
  return { ...DEFAULTS, isWorkday: (d) => DEFAULTS.workdays.includes(DAY_MAP[d.getDay()]) };
}

export default function OrganizationWorkScheduleProvider({ children }: { children: React.ReactNode }) {
  const { organization } = useAuth();
  const [cfg, setCfg] = useState<WorkSchedule>(DEFAULTS);

  useEffect(() => {
    if (!organization?.id) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from("organization_settings")
        .select("value").eq("organization_id", organization.id).eq("key", "journey").maybeSingle();
      if (cancelled) return;
      if (data?.value) setCfg({ ...DEFAULTS, ...(data.value as any) });
    };
    void load();
    const channel = supabase.channel(`journey:${organization.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "organization_settings",
        filter: `organization_id=eq.${organization.id}`,
      }, (payload: any) => {
        const row = payload.new ?? payload.old;
        if (row?.key === "journey") void load();
      })
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, [organization?.id]);

  const value = useMemo<Ctx>(() => ({
    ...cfg,
    isWorkday: (d: Date) => cfg.workdays.includes(DAY_MAP[d.getDay()]),
  }), [cfg]);

  return <WorkScheduleContext.Provider value={value}>{children}</WorkScheduleContext.Provider>;
}