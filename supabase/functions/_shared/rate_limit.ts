// Ad-hoc per-user daily rate limit backed by public.ai_usage_daily
// and configured via public.platform_settings keys.
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

type Kind = "chat" | "generation";

const SETTING_KEY: Record<Kind, string> = {
  chat: "ai_chat_per_day",
  generation: "ai_generation_per_day",
};

const DEFAULT_LIMIT: Record<Kind, number> = {
  chat: 100,
  generation: 20,
};

// 60s in-memory cache of resolved limits (per isolate).
const limitCache = new Map<Kind, { value: number; at: number }>();

async function resolveLimit(admin: SupabaseClient, kind: Kind): Promise<number> {
  const cached = limitCache.get(kind);
  const now = Date.now();
  if (cached && now - cached.at < 60_000) return cached.value;
  const { data } = await admin
    .from("platform_settings")
    .select("value")
    .eq("key", SETTING_KEY[kind])
    .maybeSingle();
  const raw = (data?.value as { limit?: number } | null)?.limit;
  const value = typeof raw === "number" && raw > 0 ? raw : DEFAULT_LIMIT[kind];
  limitCache.set(kind, { value, at: now });
  return value;
}

export interface RateLimitOptions {
  userId: string;
  functionName: string;
  kind: Kind;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  response?: Response;
}

export async function enforceRateLimit(
  admin: SupabaseClient,
  opts: RateLimitOptions,
  corsHeaders: Record<string, string>,
): Promise<RateLimitResult> {
  const limit = await resolveLimit(admin, opts.kind);
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await admin
    .from("ai_usage_daily")
    .select("count")
    .eq("user_id", opts.userId)
    .eq("usage_date", today)
    .eq("function_name", opts.functionName)
    .maybeSingle();

  const current = existing?.count ?? 0;

  if (current >= limit) {
    return {
      allowed: false,
      limit,
      used: current,
      remaining: 0,
      response: new Response(
        JSON.stringify({
          error: "rate_limit_exceeded",
          message: `Limite diário de ${limit} requisições atingido para esta funcionalidade.`,
          limit,
          used: current,
          reset_at: `${today}T23:59:59Z`,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "3600",
          },
        },
      ),
    };
  }

  const nextCount = current + 1;
  await admin
    .from("ai_usage_daily")
    .upsert(
      {
        user_id: opts.userId,
        usage_date: today,
        function_name: opts.functionName,
        count: nextCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,usage_date,function_name" },
    );

  return { allowed: true, limit, used: nextCount, remaining: limit - nextCount };
}