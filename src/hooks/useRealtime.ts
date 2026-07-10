import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Filter = {
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  schema?: string;
  table: string;
  filter?: string;
};

/**
 * Subscribes to Postgres changes on a table and invokes `onChange`
 * whenever a matching row event arrives. Cleans up on unmount.
 */
export function useRealtime(
  channelName: string,
  filters: Filter | Filter[],
  onChange: (payload: unknown) => void,
  deps: unknown[] = []
) {
  useEffect(() => {
    const list = Array.isArray(filters) ? filters : [filters];
    if (list.length === 0) return;
    let channel = supabase.channel(channelName);
    list.forEach((f) => {
      channel = channel.on(
        "postgres_changes" as never,
        {
          event: f.event ?? "*",
          schema: f.schema ?? "public",
          table: f.table,
          ...(f.filter ? { filter: f.filter } : {}),
        } as never,
        (payload: unknown) => onChange(payload)
      );
    });
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}