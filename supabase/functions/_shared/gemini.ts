// Shared Gemini helper — substitui chamadas ao Lovable AI Gateway.
// Expõe uma interface OpenAI-compatível para minimizar mudanças nas edge functions:
//  - chatCompletion({ model, messages, temperature, max_tokens, response_format }) -> { choices: [{ message: { content }, finish_reason }], usage }
//  - createEmbedding({ model, input }) -> { data: [{ embedding: number[] }] }
//
// Configuração:
//  - Lê `platform_ai_settings` (service_role) para obter API key, modelos e defaults.
//  - Fallback para env var `GEMINI_API_KEY` se a linha ainda não foi configurada.
//  - Nunca expõe a API key em respostas / logs.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ENV_GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface PlatformAiSettings {
  provider: string;
  default_model: string;
  fallback_model: string;
  embedding_model: string;
  temperature: number;
  max_tokens: number;
  gemini_api_key: string | null;
}

let cachedSettings: PlatformAiSettings | null = null;
let cachedAt = 0;
const SETTINGS_TTL_MS = 30_000;

export function invalidateSettingsCache() {
  cachedSettings = null;
  cachedAt = 0;
}

export async function loadPlatformAiSettings(): Promise<PlatformAiSettings> {
  const now = Date.now();
  if (cachedSettings && now - cachedAt < SETTINGS_TTL_MS) return cachedSettings;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data } = await admin
    .from("platform_ai_settings")
    .select("provider,default_model,fallback_model,embedding_model,temperature,max_tokens,gemini_api_key")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const row = (data ?? {}) as Partial<PlatformAiSettings>;
  cachedSettings = {
    provider: row.provider ?? "gemini",
    default_model: row.default_model ?? "gemini-3.1-flash-lite",
    fallback_model: row.fallback_model ?? "gemini-3.1-flash-lite",
    embedding_model: row.embedding_model ?? "gemini-embedding-001",
    temperature: typeof row.temperature === "number" ? row.temperature : 0.7,
    max_tokens: typeof row.max_tokens === "number" ? row.max_tokens : 2048,
    gemini_api_key: row.gemini_api_key || ENV_GEMINI_KEY || null,
  };
  cachedAt = now;
  return cachedSettings;
}

// Modelos descontinuados / renomeados → substituição automática.
const LEGACY_MODEL_MAP: Record<string, string> = {
  "gemini-2.5-flash": "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite": "gemini-3.1-flash-lite",
  "gemini-2.5-pro": "gemini-3.1-pro-preview",
};

// Mapeia nomes do formato Lovable/OpenAI para nomes nativos do Gemini.
// - Modelos OpenAI (openai/* ou gpt-*) → fallback_model configurado.
// - Prefixo google/ é removido.
// - Modelos Gemini antigos são substituídos por seus equivalentes atuais.
export function mapModelName(input: string | undefined, settings: PlatformAiSettings): string {
  if (!input) return settings.default_model;
  const raw = String(input).trim();
  if (raw.startsWith("openai/") || raw.startsWith("gpt-")) {
    return LEGACY_MODEL_MAP[settings.fallback_model] ?? settings.fallback_model;
  }
  const bare = raw.startsWith("google/") ? raw.slice("google/".length) : raw;
  return LEGACY_MODEL_MAP[bare] ?? bare;
}

// --------- Conversão de mensagens OpenAI-style -> contents Gemini ---------
interface OAMessage { role: string; content: string | Array<{ type: string; text?: string }> }

function messageContentToText(content: OAMessage["content"]): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content ?? "");
  return content.map((p) => (p && typeof p === "object" && p.type === "text" ? (p.text ?? "") : "")).join("\n");
}

function toGeminiContents(messages: OAMessage[]): { systemInstruction?: { parts: Array<{ text: string }> }; contents: Array<{ role: string; parts: Array<{ text: string }> }> } {
  const systemParts: string[] = [];
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  for (const m of messages) {
    const text = messageContentToText(m.content);
    if (!text) continue;
    if (m.role === "system") {
      systemParts.push(text);
      continue;
    }
    const role = m.role === "assistant" ? "model" : "user";
    // Merge sequential same-role turns (Gemini prefere alternância).
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts.push({ text });
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }
  const out: ReturnType<typeof toGeminiContents> = { contents };
  if (systemParts.length) out.systemInstruction = { parts: [{ text: systemParts.join("\n\n") }] };
  return out;
}

// --------- Chat completions ---------
export interface ChatCompletionRequest {
  model?: string;
  messages: OAMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type?: string } | null;
}

export interface ChatCompletionResponse {
  choices: Array<{ index: number; message: { role: "assistant"; content: string }; finish_reason: string }>;
  model: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

export class GeminiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(`gemini_${status}`);
    this.status = status;
    this.detail = detail;
  }
}

export async function chatCompletion(req: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  const settings = await loadPlatformAiSettings();
  if (!settings.gemini_api_key) throw new GeminiError(500, "gemini_api_key_not_configured");

  const model = mapModelName(req.model, settings);
  const { systemInstruction, contents } = toGeminiContents(req.messages ?? []);

  const generationConfig: Record<string, unknown> = {
    temperature: typeof req.temperature === "number" ? req.temperature : settings.temperature,
    maxOutputTokens: typeof req.max_tokens === "number" ? req.max_tokens : settings.max_tokens,
  };
  if (req.response_format?.type === "json_object") {
    generationConfig.responseMimeType = "application/json";
  }

  const body: Record<string, unknown> = { contents, generationConfig };
  if (systemInstruction) body.systemInstruction = systemInstruction;

  const url = `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(settings.gemini_api_key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Preserva semântica do gateway (429 = rate limit, 402 = credits).
    const status = res.status === 402 ? 402 : res.status;
    throw new GeminiError(status, redactKey(text));
  }
  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .map((p: { text?: string }) => (typeof p?.text === "string" ? p.text : ""))
    .join("");
  const usage = data?.usageMetadata
    ? {
        prompt_tokens: data.usageMetadata.promptTokenCount,
        completion_tokens: data.usageMetadata.candidatesTokenCount,
        total_tokens: data.usageMetadata.totalTokenCount,
      }
    : undefined;
  return {
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: candidate?.finishReason ? String(candidate.finishReason).toLowerCase() : "stop",
      },
    ],
    usage,
  };
}

// Conveniência: retorna JSON parseado quando a function pede response_format json_object.
export async function generateJson<T = unknown>(req: ChatCompletionRequest): Promise<T> {
  const merged: ChatCompletionRequest = {
    ...req,
    response_format: { type: "json_object" },
  };
  const resp = await chatCompletion(merged);
  const raw = resp.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as T;
}

// --------- Embeddings ---------
export interface EmbeddingRequest {
  model?: string;
  input: string | string[];
}
export interface EmbeddingResponse {
  data: Array<{ embedding: number[]; index: number }>;
  model: string;
}

export async function createEmbedding(req: EmbeddingRequest): Promise<EmbeddingResponse> {
  const settings = await loadPlatformAiSettings();
  if (!settings.gemini_api_key) throw new GeminiError(500, "gemini_api_key_not_configured");
  const requested = req.model && !req.model.startsWith("openai/") && !req.model.startsWith("gpt-")
    ? req.model.replace(/^google\//, "")
    : settings.embedding_model;
  const model = LEGACY_MODEL_MAP[requested] ?? requested;

  const inputs = Array.isArray(req.input) ? req.input : [req.input];
  const embeddings: Array<{ embedding: number[]; index: number }> = [];
  for (let i = 0; i < inputs.length; i++) {
    const url = `${GEMINI_BASE}/models/${encodeURIComponent(model)}:embedContent?key=${encodeURIComponent(settings.gemini_api_key)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: String(inputs[i] ?? "").slice(0, 8000) }] } }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new GeminiError(res.status, redactKey(text));
    }
    const json = await res.json();
    const vector: number[] = json?.embedding?.values ?? [];
    embeddings.push({ embedding: vector, index: i });
  }
  return { model, data: embeddings };
}

// --------- Utils ---------
function redactKey(text: string): string {
  // Nunca deixa chave vazar em logs/erros.
  return text.replace(/AIza[0-9A-Za-z_\-]{20,}/g, "***REDACTED***").slice(0, 500);
}

export function maskKey(key: string | null | undefined): string {
  if (!key) return "";
  const s = String(key);
  if (s.length <= 4) return "****";
  return `****${s.slice(-4)}`;
}

// --------- Compat: substituto drop-in para fetch(gateway) ---------
// Aceita o body OpenAI-compatível já usado nas edge functions e devolve
// um Response com o mesmo shape que o gateway devolvia.
export async function openAICompatChatFetch(body: ChatCompletionRequest): Promise<Response> {
  try {
    const resp = await chatCompletion(body);
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const err = e as GeminiError;
    const status = err?.status ?? 500;
    const detail = err?.detail ?? String(e);
    return new Response(JSON.stringify({ error: { message: detail } }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function openAICompatEmbeddingFetch(body: EmbeddingRequest): Promise<Response> {
  try {
    const resp = await createEmbedding(body);
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const err = e as GeminiError;
    const status = err?.status ?? 500;
    const detail = err?.detail ?? String(e);
    return new Response(JSON.stringify({ error: { message: detail } }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}