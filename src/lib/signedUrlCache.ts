import { supabase } from "@/integrations/supabase/client";

// Cache in-memory de signed URLs por (bucket:path). TTL ligeiramente inferior ao expiresIn.
type Entry = { url: string; at: number; ttl: number };
const store = new Map<string, Entry>();
const EXPIRES_IN = 3600; // 1h assinada
const TTL_MS = 55 * 60 * 1000; // reaproveitar por 55 min

export async function getSignedUrl(bucket: string, path: string): Promise<string | null> {
  if (!path) return null;
  const key = `${bucket}:${path}`;
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.url;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, EXPIRES_IN);
  if (error || !data?.signedUrl) return null;
  store.set(key, { url: data.signedUrl, at: Date.now(), ttl: TTL_MS });
  return data.signedUrl;
}

export function invalidateSignedUrl(bucket: string, path: string) {
  store.delete(`${bucket}:${path}`);
}

export function clearSignedUrlCache() {
  store.clear();
}