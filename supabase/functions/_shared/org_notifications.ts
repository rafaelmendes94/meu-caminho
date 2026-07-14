// Verifica se a organização permite envio de uma categoria em determinado canal.
// Estrutura esperada em organization_settings.notifications:
// { [category: string]: { email?: boolean; in_app?: boolean; ... } }

type Channel = "email" | "in_app" | string;

const cache = new Map<string, { at: number; value: Record<string, Record<string, boolean>> }>();
const TTL_MS = 60_000;

async function load(admin: any, orgId: string) {
  const hit = cache.get(orgId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const { data } = await admin
    .from("organization_settings")
    .select("value")
    .eq("organization_id", orgId)
    .eq("key", "notifications")
    .maybeSingle();
  const v = (data?.value ?? {}) as Record<string, Record<string, boolean>>;
  cache.set(orgId, { at: Date.now(), value: v });
  return v;
}

// Categorias reconhecidas: weekly_summary, monthly_summary, critical_alerts, insights,
// action_plans, rituals, pulse, checkin, birthdays, new_content.
export async function isNotificationAllowed(
  admin: any,
  orgId: string | null | undefined,
  category: string,
  channel: Channel,
): Promise<boolean> {
  if (!orgId) return true; // sem contexto, não bloqueia
  try {
    const cfg = await load(admin, orgId);
    const row = cfg[category];
    if (!row) return true; // sem config explícita, permite (default true)
    return row[channel] !== false;
  } catch (_e) {
    return true;
  }
}