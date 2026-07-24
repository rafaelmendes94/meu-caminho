// Cloudflare R2 helper (S3-compatible, AWS Signature V4).
// Loads credentials from `platform_r2_storage` (service_role) and performs signed PUT / DELETE / HEAD requests.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export interface R2Config {
  provider: string;
  account_id: string;
  access_key_id: string;
  secret_access_key: string;
  bucket_name: string;
  public_base_url: string | null;
  region: string;
}

export async function loadR2Config(): Promise<R2Config> {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data, error } = await admin.from("platform_r2_storage").select("*").limit(1).maybeSingle();
  if (error) throw new Error("Falha ao ler configuração R2: " + error.message);
  if (!data) throw new Error("Configuração R2 não encontrada.");
  const missing: string[] = [];
  if (!data.account_id) missing.push("account_id");
  if (!data.access_key_id) missing.push("access_key_id");
  if (!data.secret_access_key) missing.push("secret_access_key");
  if (!data.bucket_name) missing.push("bucket_name");
  if (missing.length) throw new Error("R2 não configurado: faltando " + missing.join(", "));
  return {
    provider: data.provider ?? "cloudflare_r2",
    account_id: data.account_id!,
    access_key_id: data.access_key_id!,
    secret_access_key: data.secret_access_key!,
    bucket_name: data.bucket_name!,
    public_base_url: data.public_base_url ?? null,
    region: data.region ?? "auto",
  };
}

const enc = new TextEncoder();

async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const buf = typeof data === "string" ? enc.encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return toHex(new Uint8Array(hash));
}

function toHex(u8: Uint8Array): string {
  return Array.from(u8).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey(
    "raw",
    key as any,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(data));
  return new Uint8Array(sig);
}

async function signingKey(secret: string, date: string, region: string, service: string) {
  const kDate = await hmac(enc.encode("AWS4" + secret), date);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  return kSigning;
}

function amzDate(d = new Date()) {
  const iso = d.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { amz: iso, date: iso.slice(0, 8) };
}

function uriEncode(str: string, encodeSlash = true) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%2F/g, encodeSlash ? "%2F" : "/");
}

export interface SignedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: Uint8Array;
}

export async function signR2Request(cfg: R2Config, opts: {
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  key: string; // object key inside bucket (no leading slash)
  body?: Uint8Array;
  contentType?: string;
  bucketOverride?: string; // for listing / testing
  query?: string;
}): Promise<SignedRequest> {
  const host = `${cfg.account_id}.r2.cloudflarestorage.com`;
  const bucket = opts.bucketOverride ?? cfg.bucket_name;
  const objectPath = opts.key.split("/").map((p) => uriEncode(p, false)).join("/");
  const canonicalUri = `/${uriEncode(bucket, false)}/${objectPath}`;
  const url = `https://${host}${canonicalUri}${opts.query ? "?" + opts.query : ""}`;
  const body = opts.body ?? new Uint8Array();
  const payloadHash = await sha256Hex(body);
  const { amz, date } = amzDate();
  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amz,
  };
  if (opts.contentType) headers["content-type"] = opts.contentType;

  const signedHeaderNames = Object.keys(headers).map((h) => h.toLowerCase()).sort();
  const canonicalHeaders = signedHeaderNames.map((h) => `${h}:${headers[h].toString().trim()}\n`).join("");
  const signedHeaders = signedHeaderNames.join(";");
  const canonicalRequest = [
    opts.method,
    canonicalUri,
    opts.query ?? "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${date}/${cfg.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amz,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const kSigning = await signingKey(cfg.secret_access_key, date, cfg.region, "s3");
  const signature = toHex(await hmac(kSigning, stringToSign));

  headers["authorization"] = `AWS4-HMAC-SHA256 Credential=${cfg.access_key_id}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { url, method: opts.method, headers, body };
}

export function publicUrlFor(cfg: R2Config, key: string): string {
  if (cfg.public_base_url) {
    const base = cfg.public_base_url.replace(/\/+$/, "");
    return `${base}/${key.split("/").map((p) => encodeURIComponent(p)).join("/")}`;
  }
  const host = `${cfg.account_id}.r2.cloudflarestorage.com`;
  return `https://${host}/${encodeURIComponent(cfg.bucket_name)}/${key.split("/").map((p) => encodeURIComponent(p)).join("/")}`;
}

export async function testR2Connection(cfg: R2Config): Promise<{ ok: boolean; message: string }> {
  try {
    // HEAD bucket via list-objects style: GET /{bucket}?location or ?list-type=2&max-keys=0
    const req = await signR2Request(cfg, { method: "GET", key: "", query: "list-type=2&max-keys=1" });
    const res = await fetch(req.url, { method: req.method, headers: req.headers });
    if (res.ok) return { ok: true, message: "Conexão OK. Bucket acessível." };
    const text = await res.text().catch(() => "");
    return { ok: false, message: `HTTP ${res.status}: ${text.slice(0, 300) || res.statusText}` };
  } catch (e) {
    return { ok: false, message: (e as Error).message || String(e) };
  }
}

export async function putObject(cfg: R2Config, key: string, body: Uint8Array, contentType: string) {
  const req = await signR2Request(cfg, { method: "PUT", key, body, contentType });
  const res = await fetch(req.url, { method: "PUT", headers: req.headers, body });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`R2 PUT falhou (${res.status}): ${text.slice(0, 400)}`);
  }
}

export async function deleteObject(cfg: R2Config, key: string) {
  const req = await signR2Request(cfg, { method: "DELETE", key });
  const res = await fetch(req.url, { method: "DELETE", headers: req.headers });
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "");
    throw new Error(`R2 DELETE falhou (${res.status}): ${text.slice(0, 400)}`);
  }
}

export async function requirePlatformAdmin(req: Request): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const userClient = createClient(SUPABASE_URL, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: role } = await admin.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "platform_admin").maybeSingle();
  if (!role) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
  return { userId: u.user.id };
}