import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Mapeamento content_type (DB) -> chave de formato usada no config
const TYPE_TO_FORMAT: Record<string, string> = {
  book: "book", video: "video", podcast: "podcast", course: "course",
  track: "track", exercise: "exercise", reflection: "reflection",
  ritual: "ritual", message: "message", article: "reflection",
};

type Cfg = {
  version: number;
  tone_config: any;
  model_config: any;
  guardrails: any;
};

async function loadConfig(admin: any): Promise<Cfg> {
  const { data } = await admin
    .from("ai_prompt_configs")
    .select("version, tone_config, model_config, guardrails")
    .eq("key", "recommendation_engine")
    .maybeSingle();
  if (!data) throw new Error("recommendation_engine config not found");
  return data as Cfg;
}

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }

function buildUserVector(args: {
  employeeProfile: any | null;
  recentCheckin: { mood: number | null; energy: number | null; stress: number | null; n: number } | null;
  pulseDims: Record<string, number>;
}): Record<string, number> {
  const v: Record<string, number> = {};
  const p = args.employeeProfile ?? {};
  // Perfis são jsonb com "score" 0-100. Se ausentes, usamos check-in/pulse.
  const readScore = (obj: any) => {
    if (!obj || typeof obj !== "object") return null;
    const s = Number(obj.score ?? obj.level ?? obj.value);
    return Number.isFinite(s) ? Math.max(0, Math.min(100, s)) / 100 : null;
  };
  const eProf = readScore(p.profile_energy);
  const engProf = readScore(p.profile_engagement);
  const leadProf = readScore(p.profile_leadership);
  const commProf = readScore(p.profile_communication);
  const devProf = readScore(p.profile_development);

  // Energia: perfil > pulse > check-in
  v.energy = eProf ?? (args.pulseDims.energy ? args.pulseDims.energy / 5 :
    args.recentCheckin?.energy ? args.recentCheckin.energy / 5 : 0.5);
  // Recuperação (inverso do stress)
  v.recovery = args.pulseDims.recovery ? args.pulseDims.recovery / 5 :
    args.recentCheckin?.stress ? 1 - args.recentCheckin.stress / 5 : 0.5;
  // Ansiedade: derivada de stress
  v.anxiety = args.recentCheckin?.stress ? args.recentCheckin.stress / 5 : 0.4;
  // Comunicação, liderança, engajamento
  v.communication = commProf ?? (args.pulseDims.communication ? args.pulseDims.communication / 5 : 0.5);
  v.leadership = leadProf ?? 0.5;
  v.engagement = engProf ?? (args.pulseDims.engagement ? args.pulseDims.engagement / 5 : 0.5);
  v.equilibrium = args.pulseDims.equilibrium ? args.pulseDims.equilibrium / 5 : 1 - v.anxiety;
  v.psychological_safety = 0.6;
  v.development = devProf ?? 0.5;

  for (const k of Object.keys(v)) v[k] = clamp01(v[k]);
  return v;
}

function computeItemScore(args: {
  item: any;
  cfg: Cfg;
  userVector: Record<string, number>;
  history: {
    viewedAt: Map<string, string>; // itemId -> last viewedAt ISO
    started: Set<string>;
    completed: Set<string>;
    dismissed: Set<string>;
    favorites: Set<string>;
    favoriteCategories: Set<string>;
  };
  hasLicense: boolean;
  now: number;
  timeAvailable: number;
}): { score: number; reason: string; factors: Record<string, number>; skip?: boolean } {
  const tc = args.cfg.tone_config ?? {};
  const dw: Record<string, number> = tc.dimension_weights ?? {};
  const fw: Record<string, number> = tc.format_weights ?? {};
  const boosts: Record<string, number> = tc.boosts ?? {};
  const penalties: Record<string, number> = tc.penalties ?? {};
  const half = Number(tc.novelty_half_life_days ?? 14);
  const repeatDays = Number(penalties.repeat_within_days ?? 30);

  const weights = args.item.recommendation_weights ?? {};
  const factors: Record<string, number> = {};
  const reasons: string[] = [];

  // Hard filters
  if (args.item.status !== "published") return { score: 0, reason: "", factors, skip: true };
  if (args.item.is_premium && !args.hasLicense) return { score: 0, reason: "", factors, skip: true };
  if (args.history.dismissed.has(args.item.id)) return { score: 0, reason: "", factors, skip: true };

  // 1) Aderência ao perfil (produto escalar normalizado)
  let dot = 0, sumW = 0;
  for (const [dim, w] of Object.entries(dw)) {
    const cw = Number(weights[dim] ?? 0) / 100; // 0-100 -> 0-1
    if (!Number.isFinite(cw) || cw <= 0) continue;
    const uv = Number(args.userVector[dim] ?? 0);
    dot += w * cw * uv;
    sumW += w * cw;
  }
  const fit = sumW > 0 ? dot / sumW : 0.3;
  factors.fit = Number(fit.toFixed(4));

  // 2) Formato
  const fmtKey = TYPE_TO_FORMAT[String(args.item.type)] ?? String(args.item.type);
  const fmt = Number(fw[fmtKey] ?? 0.8);
  factors.format = Number(fmt.toFixed(4));

  // 3) Novidade
  const lastViewedIso = args.history.viewedAt.get(args.item.id);
  let novelty = 1;
  if (lastViewedIso) {
    const days = (args.now - new Date(lastViewedIso).getTime()) / 86400000;
    novelty = clamp01(1 - Math.exp(-days / half) * 0.9);
  }
  factors.novelty = Number(novelty.toFixed(4));

  // 4) Tempo disponível
  const dur = Number(args.item.duration_minutes ?? weights.time_minutes ?? 0);
  let timeFit = 1;
  if (dur > 0 && args.timeAvailable > 0) {
    if (dur <= args.timeAvailable) timeFit = 1;
    else timeFit = clamp01(args.timeAvailable / dur);
  }
  factors.time_fit = Number(timeFit.toFixed(4));

  // 5) Base score
  let score = fit * 0.55 + fmt * 0.15 + novelty * 0.15 + timeFit * 0.15;

  // 6) Boosts / penalidades
  if (!lastViewedIso) { score += Number(boosts.never_seen ?? 0); factors.boost_never_seen = 1; reasons.push("é um conteúdo que você ainda não viu"); }
  if (args.history.started.has(args.item.id) && !args.history.completed.has(args.item.id)) {
    score += Number(boosts.partially_completed ?? 0); factors.boost_partial = 1; reasons.push("você começou e ainda não concluiu");
  }
  if (args.item.is_featured) { score += Number(boosts.featured ?? 0); factors.boost_featured = 1; }
  if (args.item.category_id && args.history.favoriteCategories.has(args.item.category_id)) {
    score += Number(boosts.favorite_category ?? 0); factors.boost_fav_category = 1; reasons.push("é do tipo de conteúdo que você costuma favoritar");
  }
  if (fit > 0.7) { score += Number(boosts.best_fit_profile ?? 0); factors.boost_best_fit = 1; reasons.push("tem alta aderência ao seu perfil e momento atual");
  }

  if (args.history.completed.has(args.item.id)) { score -= Number(penalties.completed_penalty ?? 0.9); factors.penalty_completed = 1; }
  if (lastViewedIso) {
    const days = (args.now - new Date(lastViewedIso).getTime()) / 86400000;
    if (days < repeatDays) { score -= Number(penalties.repeat_penalty ?? 0.5); factors.penalty_repeat = 1; }
  }

  score = Math.max(0, Math.min(1.5, score));

  // Motivo — reforça sinais emocionais
  const uv = args.userVector;
  if (uv.energy < 0.45) reasons.unshift("indica energia reduzida no seu momento atual");
  else if (uv.recovery < 0.45) reasons.unshift("aponta necessidade de recuperação");
  else if (uv.anxiety > 0.65) reasons.unshift("mostra ansiedade elevada nos check-ins recentes");

  const reason = reasons.length
    ? `Recomendado porque ${reasons.slice(0, 3).join(", ")}.`
    : "Recomendado porque tem boa aderência ao seu perfil.";

  return { score: Number(score.toFixed(4)), reason, factors };
}

function diversify(list: any[], caps: { max_per_format?: number; max_per_category?: number }, topN: number) {
  const perFmt = new Map<string, number>();
  const perCat = new Map<string, number>();
  const maxFmt = Number(caps.max_per_format ?? 6);
  const maxCat = Number(caps.max_per_category ?? 6);
  const out: any[] = [];
  for (const it of list) {
    if (out.length >= topN) break;
    const f = String(it.type ?? "");
    const c = String(it.category_id ?? "none");
    const nf = perFmt.get(f) ?? 0;
    const nc = perCat.get(c) ?? 0;
    if (nf >= maxFmt) continue;
    if (nc >= maxCat) continue;
    perFmt.set(f, nf + 1);
    perCat.set(c, nc + 1);
    out.push(it);
  }
  return out;
}

async function recompute(admin: any, targetUserId: string, cfg: Cfg) {
  const started = Date.now();
  const tc = cfg.tone_config ?? {};
  const topN = Number(tc.top_n ?? 20);
  const minScore = Number(tc.min_score ?? 0.05);
  const timeAvailable = Number(tc.time_available_minutes ?? 30);

  // Profile + org
  const { data: profile } = await admin.from("profiles").select("organization_id").eq("id", targetUserId).maybeSingle();
  const orgId: string | null = (profile as any)?.organization_id ?? null;

  // Employee profile
  const { data: emp } = await admin.from("employee_profiles").select("*").eq("user_id", targetUserId).maybeSingle();

  // Recent check-in (14d)
  const since14 = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: cks } = await admin.from("emotional_checkins")
    .select("mood_score, energy_score, stress_score")
    .eq("user_id", targetUserId).gte("created_at", since14).limit(50);
  const ckList = (cks ?? []) as any[];
  const recentCheckin = ckList.length ? {
    mood: avg(ckList.map((c) => c.mood_score)),
    energy: avg(ckList.map((c) => c.energy_score)),
    stress: avg(ckList.map((c) => c.stress_score)),
    n: ckList.length,
  } : null;

  // Pulse dims (org-agregado) — usa RPC segura se disponível
  let pulseDims: Record<string, number> = {};
  if (orgId) {
    try {
      const { data: pulse } = await admin.rpc("get_pulse_aggregate", { _organization_id: orgId, _days: 30 });
      for (const row of (pulse ?? []) as any[]) {
        if (row?.dimension && row?.avg_value != null) pulseDims[row.dimension] = Number(row.avg_value);
      }
    } catch { /* opcional */ }
  }

  const userVector = buildUserVector({ employeeProfile: emp, recentCheckin, pulseDims });

  // Histórico do usuário (90d de views + eventos)
  const since90 = new Date(Date.now() - 90 * 86400000).toISOString();
  const [{ data: views }, { data: events }] = await Promise.all([
    admin.from("content_views").select("item_id, viewed_at").eq("user_id", targetUserId).gte("viewed_at", since90).limit(500),
    admin.from("recommendation_events").select("item_id, event_type, created_at, context").eq("user_id", targetUserId).gte("created_at", since90).limit(1000),
  ]);

  const viewedAt = new Map<string, string>();
  for (const v of (views ?? []) as any[]) {
    if (!v.item_id) continue;
    const prev = viewedAt.get(v.item_id);
    if (!prev || new Date(v.viewed_at).getTime() > new Date(prev).getTime()) viewedAt.set(v.item_id, v.viewed_at);
  }
  const started_ = new Set<string>();
  const completed = new Set<string>();
  const dismissed = new Set<string>();
  const favorites = new Set<string>();
  const favCategories = new Set<string>();
  for (const e of (events ?? []) as any[]) {
    if (!e.item_id) continue;
    if (e.event_type === "started") started_.add(e.item_id);
    if (e.event_type === "completed") completed.add(e.item_id);
    if (e.event_type === "dismissed") dismissed.add(e.item_id);
    if (e.event_type === "favorite") {
      favorites.add(e.item_id);
      const cid = e.context?.category_id;
      if (cid) favCategories.add(String(cid));
    }
  }

  // Licença premium — hoje: se organization está active/trialing considera com licença
  let hasLicense = false;
  if (orgId) {
    const { data: org } = await admin.from("organizations").select("subscription_status").eq("id", orgId).maybeSingle();
    hasLicense = ["active", "trialing"].includes(String((org as any)?.subscription_status ?? ""));
  }

  // Itens publicados (limita para performance)
  const { data: items } = await admin.from("content_items")
    .select("id, type, status, title, subtitle, cover_url, category_id, duration_minutes, is_premium, is_featured, recommendation_weights")
    .eq("status", "published")
    .limit(1500);

  const now = Date.now();
  const scored: any[] = [];
  for (const it of (items ?? []) as any[]) {
    const r = computeItemScore({
      item: it, cfg, userVector,
      history: { viewedAt, started: started_, completed, dismissed, favorites, favoriteCategories: favCategories },
      hasLicense, now, timeAvailable,
    });
    if (r.skip || r.score < minScore) continue;
    scored.push({
      item_id: it.id,
      type: it.type,
      title: it.title,
      subtitle: it.subtitle,
      cover_url: it.cover_url,
      duration_minutes: it.duration_minutes,
      category_id: it.category_id,
      score: r.score,
      reason: r.reason,
      factors: r.factors,
      confidence: Math.min(1, 0.4 + (recentCheckin ? 0.2 : 0) + (emp ? 0.2 : 0) + (Object.keys(pulseDims).length ? 0.2 : 0)),
    });
  }
  scored.sort((a, b) => b.score - a.score);

  const diverse = diversify(scored, tc.diversity ?? {}, topN);

  // Persistência do cache
  await admin.from("user_recommendation_cache").upsert({
    user_id: targetUserId,
    organization_id: orgId,
    recommendations: diverse,
    user_vector: userVector,
    config_version: cfg.version,
    generated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    is_stale: false,
    invalidation_reason: null,
  }, { onConflict: "user_id" });

  return {
    recommendations: diverse,
    user_vector: userVector,
    metrics: {
      elapsed_ms: Date.now() - started,
      candidates: (items ?? []).length,
      scored: scored.length,
      returned: diverse.length,
      config_version: cfg.version,
      cache: "miss",
    },
  };
}

function avg(arr: number[]): number { const n = arr.filter((x) => Number.isFinite(x)); return n.length ? n.reduce((a, b) => a + b, 0) / n.length : 0; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const requesterId = userData.user.id;
    const body = await req.json().catch(() => ({}));
    const refresh = body?.refresh === true;
    const testMode = body?.test_mode === true;
    const requestedUserId: string | null = body?.user_id ?? null;

    // Admin pode consultar recomendação de outro usuário (test_mode)
    let targetUserId = requesterId;
    if (requestedUserId && requestedUserId !== requesterId) {
      const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", requesterId);
      const isAdmin = (roles ?? []).some((r: any) => r.role === "platform_admin");
      if (!isAdmin) return json({ error: "forbidden" }, 403);
      targetUserId = requestedUserId;
    }

    const cfg = await loadConfig(admin);

    // Cache HIT?
    if (!refresh && !testMode) {
      const { data: cache } = await admin
        .from("user_recommendation_cache")
        .select("recommendations, user_vector, generated_at, expires_at, is_stale, config_version")
        .eq("user_id", targetUserId).maybeSingle();
      const c: any = cache;
      if (c && !c.is_stale && new Date(c.expires_at).getTime() > Date.now() && c.config_version === cfg.version) {
        return json({
          ok: true,
          recommendations: c.recommendations ?? [],
          user_vector: c.user_vector ?? {},
          metrics: { cache: "hit", config_version: c.config_version, generated_at: c.generated_at, elapsed_ms: 0 },
        });
      }
    }

    const result = await recompute(admin, targetUserId, cfg);
    return json({ ok: true, ...result, test: testMode || undefined });
  } catch (e) {
    console.error("recommend-content error", e);
    return json({ error: (e as Error).message }, 500);
  }
});