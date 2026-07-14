// Preferências locais do Super Admin: favoritos e recentes.
// Armazenamento client-side (sem alterações no banco).
import { useEffect, useState } from "react";

const FAV_KEY = "admin:favorites:v1";
const RECENT_KEY = "admin:recents:v1";
const RECENT_MAX = 8;

export type AdminNavRef = {
  to: string;
  label: string;
  icon?: string;
};

function read<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, v: T) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
}

export function getFavorites(): AdminNavRef[] {
  return read<AdminNavRef[]>(FAV_KEY, []);
}
export function isFavorite(to: string): boolean {
  return getFavorites().some((f) => f.to === to);
}
export function toggleFavorite(item: AdminNavRef): AdminNavRef[] {
  const list = getFavorites();
  const idx = list.findIndex((f) => f.to === item.to);
  const next = idx >= 0 ? list.filter((_, i) => i !== idx) : [...list, item];
  write(FAV_KEY, next);
  window.dispatchEvent(new CustomEvent("admin:prefs:changed"));
  return next;
}

export function getRecents(): AdminNavRef[] {
  return read<AdminNavRef[]>(RECENT_KEY, []);
}
export function pushRecent(item: AdminNavRef) {
  const list = getRecents().filter((r) => r.to !== item.to);
  list.unshift(item);
  write(RECENT_KEY, list.slice(0, RECENT_MAX));
  window.dispatchEvent(new CustomEvent("admin:prefs:changed"));
}
export function clearRecents() {
  write(RECENT_KEY, []);
  window.dispatchEvent(new CustomEvent("admin:prefs:changed"));
}

export function useAdminPrefsVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const h = () => setV((x: number) => x + 1);
    window.addEventListener("admin:prefs:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("admin:prefs:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return v;
}