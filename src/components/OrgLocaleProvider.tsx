import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type LocaleCfg = {
  timezone: string;
  locale: string;
  date_format: string;
  time_format: string;
  week_start: "monday" | "sunday";
  currency: string;
  decimal_separator: "," | ".";
  country: string;
};

const DEFAULTS: LocaleCfg = {
  timezone: "America/Sao_Paulo",
  locale: "pt-BR",
  date_format: "DD/MM/YYYY",
  time_format: "HH:mm",
  week_start: "monday",
  currency: "BRL",
  decimal_separator: ",",
  country: "BR",
};

type Ctx = LocaleCfg & {
  formatDate: (d: Date | string | number) => string;
  formatTime: (d: Date | string | number) => string;
  formatDateTime: (d: Date | string | number) => string;
  formatCurrency: (n: number) => string;
  formatNumber: (n: number) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

export function useOrgLocale(): Ctx {
  const ctx = useContext(LocaleContext);
  if (ctx) return ctx;
  // Fallback: sem provider (uso avulso)
  return buildCtx(DEFAULTS);
}

function buildCtx(cfg: LocaleCfg): Ctx {
  const toDate = (d: Date | string | number) => (d instanceof Date ? d : new Date(d));
  const dateOpts: Intl.DateTimeFormatOptions = { timeZone: cfg.timezone, year: "numeric", month: "2-digit", day: "2-digit" };
  const timeOpts: Intl.DateTimeFormatOptions = { timeZone: cfg.timezone, hour: "2-digit", minute: "2-digit", hour12: cfg.time_format.includes("a") };
  return {
    ...cfg,
    formatDate: (d) => new Intl.DateTimeFormat(cfg.locale, dateOpts).format(toDate(d)),
    formatTime: (d) => new Intl.DateTimeFormat(cfg.locale, timeOpts).format(toDate(d)),
    formatDateTime: (d) => new Intl.DateTimeFormat(cfg.locale, { ...dateOpts, ...timeOpts }).format(toDate(d)),
    formatCurrency: (n) => new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.currency }).format(n),
    formatNumber: (n) => new Intl.NumberFormat(cfg.locale).format(n),
  };
}

export default function OrgLocaleProvider({ children }: { children: React.ReactNode }) {
  const { organization } = useAuth();
  const [cfg, setCfg] = useState<LocaleCfg>(DEFAULTS);

  useEffect(() => {
    if (!organization?.id) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from("organization_settings")
        .select("value").eq("organization_id", organization.id).eq("key", "regionalization").maybeSingle();
      if (cancelled) return;
      if (data?.value) setCfg({ ...DEFAULTS, ...(data.value as any) });
    };
    void load();
    const channel = supabase.channel(`locale:${organization.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "organization_settings",
        filter: `organization_id=eq.${organization.id}`,
      }, (payload: any) => {
        const row = payload.new ?? payload.old;
        if (row?.key === "regionalization") void load();
      })
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, [organization?.id]);

  // Aplica lang no <html> e no documento
  useEffect(() => {
    try { document.documentElement.lang = cfg.locale; } catch { /* noop */ }
  }, [cfg.locale]);

  const value = useMemo(() => buildCtx(cfg), [cfg]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}