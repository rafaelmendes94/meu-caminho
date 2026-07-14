import { useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl, invalidateSignedUrl } from "@/lib/signedUrlCache";

function hexToHslTriplet(hex: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  let r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Reads `organization_settings.branding` for the current org and applies:
 * - CSS vars `--primary`, `--secondary`, `--accent` (HSL triplets) on <html>
 * - `data-theme` attribute (light/dark/auto)
 * - <link rel="icon"> favicon via signed URL from the org-branding bucket
 */
export default function OrgBrandingProvider({ children }: { children: React.ReactNode }) {
  const { organization } = useAuth();
  const orgId = organization?.id;

  const applyBranding = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase.from("organization_settings")
      .select("value").eq("organization_id", orgId).eq("key", "branding").maybeSingle();
    if (!data?.value) return;
    const v: any = data.value;
    const root = document.documentElement;
    const apply = (name: string, hex?: string) => {
      if (!hex) return;
      const hsl = hexToHslTriplet(hex);
      if (hsl) root.style.setProperty(name, hsl);
    };
    apply("--primary", v.primary_color);
    apply("--secondary", v.secondary_color);
    apply("--accent", v.accent_color);
    if (v.theme && v.theme !== "auto") root.setAttribute("data-theme", v.theme);

    if (v.favicon_path) {
      invalidateSignedUrl("org-branding", v.favicon_path);
      const url = await getSignedUrl("org-branding", v.favicon_path);
      if (url) {
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = url;
      }
    }
    // Broadcast para outros consumidores (ex.: preview de sidebar/login)
    window.dispatchEvent(new CustomEvent("org-branding:updated", { detail: v }));
  }, [orgId]);

  useEffect(() => { void applyBranding(); }, [applyBranding]);

  // Realtime: aplica imediatamente ao salvar.
  useEffect(() => {
    if (!orgId) return;
    const channel = supabase
      .channel(`branding:${orgId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "organization_settings",
        filter: `organization_id=eq.${orgId}`,
      }, (payload: any) => {
        const row = payload.new ?? payload.old;
        if (row?.key === "branding") void applyBranding();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [orgId, applyBranding]);

  return <>{children}</>;
}