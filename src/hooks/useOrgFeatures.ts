import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isFlagOn, type OrgSettingsMap, type RhFlagKey } from "@/lib/orgSettings";

interface State {
  loading: boolean;
  settings: OrgSettingsMap;
  organizationId: string | null;
}

let cache: { orgId: string; settings: OrgSettingsMap; at: number } | null = null;
const TTL_MS = 60_000;

export function invalidateOrgFeaturesCache() {
  cache = null;
}

/**
 * Loads the current user's organization feature flags (organization_settings).
 * Cached in-memory for 60s to avoid refetch on every route.
 */
export function useOrgFeatures() {
  const [state, setState] = useState<State>({
    loading: true,
    settings: {},
    organizationId: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) { if (!cancelled) setState({ loading: false, settings: {}, organizationId: null }); return; }
      const { data: profile } = await supabase
        .from("profiles").select("organization_id").eq("id", uid).maybeSingle();
      const orgId = profile?.organization_id ?? null;
      if (!orgId) { if (!cancelled) setState({ loading: false, settings: {}, organizationId: null }); return; }
      if (cache && cache.orgId === orgId && Date.now() - cache.at < TTL_MS) {
        if (!cancelled) setState({ loading: false, settings: cache.settings, organizationId: orgId });
        return;
      }
      const { data } = await supabase
        .from("organization_settings")
        .select("key,value")
        .eq("organization_id", orgId);
      const map: OrgSettingsMap = {};
      (data ?? []).forEach((row: { key: string; value: unknown }) => {
        map[row.key] = (row.value as { enabled?: boolean }) ?? {};
      });
      cache = { orgId, settings: map, at: Date.now() };
      if (!cancelled) setState({ loading: false, settings: map, organizationId: orgId });
    })();
    return () => { cancelled = true; };
  }, []);

  return {
    ...state,
    hasFeature: (key: RhFlagKey | string) => isFlagOn(state.settings, key),
  };
}