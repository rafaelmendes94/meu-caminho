import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Matrix = Record<string, Record<string, boolean>>;

/**
 * Consumo client-side dos toggles de notificações. Serviços/edge functions
 * usam `supabase/functions/_shared/org_notifications.ts` (server-side).
 */
export function useNotificationSettings() {
  const { organization } = useAuth();
  const [value, setValue] = useState<Matrix>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!organization?.id) return;
    const { data } = await supabase.from("organization_settings")
      .select("value").eq("organization_id", organization.id).eq("key", "notifications").maybeSingle();
    setValue((data?.value as Matrix) ?? {});
    setLoading(false);
  }, [organization?.id]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!organization?.id) return;
    const channel = supabase.channel(`notif:${organization.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "organization_settings",
        filter: `organization_id=eq.${organization.id}`,
      }, (payload: any) => {
        const row = payload.new ?? payload.old;
        if (row?.key === "notifications") void load();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [organization?.id, load]);

  const isAllowed = useCallback((category: string, channel: "email" | "in_app") => {
    const row = value[category];
    if (!row) return true;
    return row[channel] !== false;
  }, [value]);

  return { value, loading, isAllowed };
}