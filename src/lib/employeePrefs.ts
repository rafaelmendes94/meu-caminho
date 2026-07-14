/**
 * Employee (Colaborador 2.0) local preferences.
 * Persist "continue where you left off", recent items and small
 * motivational streak state without touching the database.
 * All reads/writes are safe on SSR (guarded by typeof window).
 */

export type EmployeeContentKind =
  | "book"
  | "course"
  | "video"
  | "podcast"
  | "audio"
  | "exercise"
  | "reflection";

export interface EmployeeContinueItem {
  id: string;
  kind: EmployeeContentKind;
  title: string;
  href: string;
  progress?: number; // 0..100
  updatedAt: number;
  cover?: string;
  subtitle?: string;
}

export interface EmployeeRecentRoute {
  path: string;
  label?: string;
  at: number;
}

const CONTINUE_KEY = "employee.continue.v1";
const RECENT_KEY = "employee.recent.v1";
const MOTIV_KEY = "employee.motivation.v1";

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  return safeParse(window.localStorage.getItem(key), fallback);
};

const write = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — no-op */
  }
};

/* ============ Continue where you left off ============ */

export const getContinueItems = (limit = 6): EmployeeContinueItem[] => {
  const list = read<EmployeeContinueItem[]>(CONTINUE_KEY, []);
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
};

export const trackContinue = (item: Omit<EmployeeContinueItem, "updatedAt">) => {
  const list = read<EmployeeContinueItem[]>(CONTINUE_KEY, []);
  const next: EmployeeContinueItem[] = [
    { ...item, updatedAt: Date.now() },
    ...list.filter((x) => !(x.id === item.id && x.kind === item.kind)),
  ].slice(0, 24);
  write(CONTINUE_KEY, next);
};

export const getLatestByKind = (
  kind: EmployeeContentKind
): EmployeeContinueItem | undefined =>
  getContinueItems(24).find((x) => x.kind === kind);

/* ============ Recent routes ============ */

export const getRecentRoutes = (limit = 8): EmployeeRecentRoute[] => {
  const list = read<EmployeeRecentRoute[]>(RECENT_KEY, []);
  return [...list].sort((a, b) => b.at - a.at).slice(0, limit);
};

export const trackRoute = (path: string, label?: string) => {
  if (!path || path === "/") return;
  const list = read<EmployeeRecentRoute[]>(RECENT_KEY, []);
  const next: EmployeeRecentRoute[] = [
    { path, label, at: Date.now() },
    ...list.filter((x) => x.path !== path),
  ].slice(0, 20);
  write(RECENT_KEY, next);
};

/* ============ Motivation streak ============ */

export interface EmployeeMotivationState {
  streakDays: number;
  lastVisitISO: string | null;
}

export const getMotivation = (): EmployeeMotivationState =>
  read<EmployeeMotivationState>(MOTIV_KEY, { streakDays: 0, lastVisitISO: null });

export const pingMotivation = (): EmployeeMotivationState => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const prev = getMotivation();

  if (prev.lastVisitISO === today) return prev;

  let streak = 1;
  if (prev.lastVisitISO) {
    const last = new Date(prev.lastVisitISO);
    const diff = Math.round(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) streak = prev.streakDays + 1;
    else if (diff === 0) streak = prev.streakDays;
  }

  const next: EmployeeMotivationState = { streakDays: streak, lastVisitISO: today };
  write(MOTIV_KEY, next);
  return next;
};

/* ============ Small motivational copy pool ============ */

const MESSAGES = [
  "Mais um passo. Continue.",
  "Você está evoluindo.",
  "Pequenos hábitos, grandes mudanças.",
  "Respire fundo. Está indo bem.",
  "Seu ritmo é seu — siga.",
  "Constância vale mais que intensidade.",
  "Um pouco hoje já é vitória.",
];

export const pickMotivationMessage = (seed?: number): string => {
  const s = seed ?? Math.floor(Date.now() / (1000 * 60 * 60 * 6));
  return MESSAGES[s % MESSAGES.length];
};