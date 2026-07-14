// Resolve overrides de IA por organização a partir de organization_settings.ai_settings.
// Uso: const ov = await resolveOrgAiSettings(admin, orgId); apply: model = ov.model ?? modelPrimary; temperature = ov.temperature ?? temperature;
// Nunca lança — em caso de erro/ausência retorna {} para não quebrar execução.

type OrgAiOverrides = {
  participates?: boolean;
  model?: string | null;
  temperature?: number | null;
  language?: string | null;
  tone?: string | null;
  allow_recommendations?: boolean;
  allow_insights?: boolean;
  allow_dna?: boolean;
  allow_council?: boolean;
  allow_rituals?: boolean;
  allow_plans?: boolean;
  allow_score?: boolean;
};

const cache = new Map<string, { at: number; value: OrgAiOverrides }>();
const TTL_MS = 60_000;

export async function resolveOrgAiSettings(admin: any, orgId?: string | null): Promise<OrgAiOverrides> {
  if (!orgId) return {};
  const hit = cache.get(orgId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  try {
    const { data } = await admin
      .from("organization_settings")
      .select("value")
      .eq("organization_id", orgId)
      .eq("key", "ai_settings")
      .maybeSingle();
    const v = (data?.value ?? {}) as OrgAiOverrides;
    const norm: OrgAiOverrides = {
      participates: v.participates ?? true,
      model: v.model ?? null,
      temperature: typeof v.temperature === "number" ? v.temperature : null,
      language: v.language ?? null,
      tone: v.tone ?? null,
      allow_recommendations: v.allow_recommendations ?? true,
      allow_insights: v.allow_insights ?? true,
      allow_dna: v.allow_dna ?? true,
      allow_council: v.allow_council ?? true,
      allow_rituals: v.allow_rituals ?? true,
      allow_plans: v.allow_plans ?? true,
      allow_score: v.allow_score ?? true,
    };
    cache.set(orgId, { at: Date.now(), value: norm });
    return norm;
  } catch (_e) {
    return {};
  }
}

// Aplica overrides sobre um objeto {model, temperature} preservando defaults quando ausentes.
export function applyOrgAiOverrides<T extends { model?: string; temperature?: number }>(
  base: T,
  ov: OrgAiOverrides
): T {
  return {
    ...base,
    model: ov.model || base.model,
    temperature: ov.temperature != null ? ov.temperature : base.temperature,
  };
}