// Feature flags per company (organization_settings.key)
export const RH_FLAG_KEYS = [
  "rh_dashboard",
  "rh_invites",
  "rh_pulse",
  "rh_checkin",
  "rh_org_chart",
  "rh_score",
  "rh_dna",
  "rh_executive_council",
  "rh_weekly_insights",
  "rh_action_plans",
  "rh_rituals",
  "rh_direct_channel",
  "rh_content_library",
] as const;

export type RhFlagKey = (typeof RH_FLAG_KEYS)[number];

export const FEATURE_FLAG_LABELS: Record<string, string> = {
  rh_dashboard: "Dashboard RH",
  rh_invites: "Convites",
  rh_pulse: "Pulse IA",
  rh_checkin: "Check-in",
  rh_org_chart: "Organograma Vivo",
  rh_score: "Score Organizacional",
  rh_dna: "DNA Organizacional",
  rh_executive_council: "Conselho Executivo IA",
  rh_weekly_insights: "Insights Semanais",
  rh_action_plans: "Planos de Ação",
  rh_rituals: "Rituais Inteligentes",
  rh_direct_channel: "Canal Direto",
  rh_content_library: "Content Library",
};

export type OrgSettingsMap = Record<string, { enabled?: boolean } & Record<string, any>>;

export const isFlagOn = (settings: OrgSettingsMap | null | undefined, key: string) =>
  !!settings?.[key]?.enabled;