import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Settings = {
  provider: string;
  default_model: string;
  fallback_model: string;
  embedding_model: string;
  temperature: number;
  max_tokens: number;
  key_configured: boolean;
  key_last4: string | null;
  test_status: string | null;
  tested_at: string | null;
  tested_model: string | null;
  test_latency_ms: number | null;
  test_error: string | null;
};

const CHAT_MODELS = [
  { value: "gemini-2.5-pro", label: "gemini-2.5-pro (mais capaz)" },
  { value: "gemini-2.5-flash", label: "gemini-2.5-flash (recomendado)" },
  { value: "gemini-2.5-flash-lite", label: "gemini-2.5-flash-lite (mais rápido/barato)" },
];
const EMBED_MODELS = [
  { value: "gemini-embedding-001", label: "gemini-embedding-001 (recomendado)" },
];

export default function PlatformAIProviderScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [s, setS] = useState<Settings | null>(null);
  const [newKey, setNewKey] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("platform-ai-settings", { method: "GET" as any });
    setLoading(false);
    if (error) return toast.error("Falha ao carregar configuração de IA.");
    setS(((data as any)?.settings) ?? null);
  }
  useEffect(() => { void load(); }, []);

  async function save(patch: Partial<Settings> & { gemini_api_key?: string }) {
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("platform-ai-settings", { body: patch });
    setSaving(false);
    if (error) return toast.error("Erro ao salvar configuração.");
    setS(((data as any)?.settings) ?? null);
    toast.success("Configuração salva.");
    setNewKey("");
  }

  async function test() {
    setTesting(true);
    const { data, error } = await supabase.functions.invoke("platform-ai-settings/test", { body: {} });
    setTesting(false);
    if (error) return toast.error("Erro no teste de conexão.");
    const res = data as any;
    if (res?.success) toast.success(`Gemini respondeu OK em ${res.latency_ms}ms (${res.model}).`);
    else toast.error(res?.error ?? "Teste falhou.");
    void load();
  }

  return (
    <PlatformAdminLayout title="Provedor de IA (Gemini)" description="Configuração global de IA para todas as edge functions.">
      {loading || !s ? (
        <div className="text-white/60 text-sm">Carregando…</div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-white font-bold">Gemini API Key</h3>
              <p className="text-white/50 text-xs mt-1">
                A chave é gravada apenas no backend (Supabase, acessível pelo service_role). Nunca é enviada ao frontend depois de salva.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-white/60">Status:</div>
              {s.key_configured ? (
                <div className="text-emerald-400 text-sm font-semibold">
                  Chave configurada: ****{s.key_last4 ?? "····"}
                </div>
              ) : (
                <div className="text-amber-400 text-sm font-semibold">Nenhuma chave configurada</div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder={s.key_configured ? "Cole uma nova chave para substituir" : "AIza… (chave do Google AI Studio)"}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                autoComplete="off"
              />
              <button
                disabled={saving || !newKey.trim()}
                onClick={() => save({ gemini_api_key: newKey.trim() })}
                className="px-4 py-2 rounded-lg bg-[#F88A2B] text-white text-sm font-bold disabled:opacity-50"
              >
                {saving ? "Salvando…" : "Salvar chave"}
              </button>
            </div>
            <button
              disabled={testing || !s.key_configured}
              onClick={test}
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/5 disabled:opacity-50"
            >
              {testing ? "Testando…" : "Testar conexão"}
            </button>
            {s.test_status && (
              <div className="text-xs text-white/60">
                Último teste: <span className={s.test_status === "success" ? "text-emerald-400" : "text-rose-400"}>{s.test_status}</span>
                {s.tested_at ? ` em ${new Date(s.tested_at).toLocaleString("pt-BR")}` : ""}
                {s.test_latency_ms ? ` — ${s.test_latency_ms}ms` : ""}
                {s.tested_model ? ` — ${s.tested_model}` : ""}
                {s.test_error ? <div className="text-rose-400 mt-1">{s.test_error}</div> : null}
              </div>
            )}
          </section>

          <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold">Modelos</h3>
            <Field label="Modelo padrão">
              <select value={s.default_model} onChange={(e) => save({ default_model: e.target.value })} className={selectCls}>
                {CHAT_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Modelo fallback">
              <select value={s.fallback_model} onChange={(e) => save({ fallback_model: e.target.value })} className={selectCls}>
                {CHAT_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Modelo de embeddings">
              <select value={s.embedding_model} onChange={(e) => save({ embedding_model: e.target.value })} className={selectCls}>
                {EMBED_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
          </section>

          <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold">Parâmetros padrão</h3>
            <Field label={`Temperatura: ${s.temperature.toFixed(2)}`}>
              <input type="range" min={0} max={2} step={0.05} defaultValue={s.temperature}
                onMouseUp={(e) => save({ temperature: Number((e.target as HTMLInputElement).value) })}
                onTouchEnd={(e) => save({ temperature: Number((e.target as HTMLInputElement).value) })}
                className="w-full" />
            </Field>
            <Field label="Max tokens">
              <input type="number" min={1} max={32768} defaultValue={s.max_tokens}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v !== s.max_tokens) save({ max_tokens: v });
                }}
                className={selectCls} />
            </Field>
          </section>
        </div>
      )}
    </PlatformAdminLayout>
  );
}

const selectCls = "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/50 uppercase tracking-widest font-bold mb-1">{label}</label>
      {children}
    </div>
  );
}