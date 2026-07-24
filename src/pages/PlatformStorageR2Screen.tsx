import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Cloud, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Settings = {
  id: string;
  provider: string;
  account_id: string | null;
  access_key_id: string | null;
  access_key_id_masked: string | null;
  secret_configured: boolean;
  secret_access_key_masked: string | null;
  bucket_name: string | null;
  public_base_url: string | null;
  region: string | null;
  connection_status: string | null;
  last_test_at: string | null;
  last_test_message: string | null;
};

export default function PlatformStorageR2Screen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [s, setS] = useState<Settings | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [form, setForm] = useState({
    account_id: "", access_key_id: "", secret_access_key: "",
    bucket_name: "", public_base_url: "", region: "auto",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("platform-r2-settings", { method: "GET" as any });
    setLoading(false);
    if (error) return toast.error("Falha ao carregar configuração R2.");
    const settings = (data as any)?.settings as Settings | null;
    setS(settings);
    if (settings) setForm({
      account_id: settings.account_id ?? "",
      access_key_id: settings.access_key_id ?? "",
      secret_access_key: "",
      bucket_name: settings.bucket_name ?? "",
      public_base_url: settings.public_base_url ?? "",
      region: settings.region ?? "auto",
    });
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    setSaving(true);
    const patch: any = { ...form };
    if (!patch.secret_access_key) delete patch.secret_access_key;
    const { data, error } = await supabase.functions.invoke("platform-r2-settings", { body: patch });
    setSaving(false);
    if (error || (data as any)?.error) return toast.error((data as any)?.error ?? "Erro ao salvar.");
    toast.success("Configuração salva.");
    setForm((f) => ({ ...f, secret_access_key: "" }));
    setS(((data as any)?.settings) ?? null);
  };

  const test = async () => {
    setTesting(true);
    const { data, error } = await supabase.functions.invoke("platform-r2-settings", { body: { action: "test" } });
    setTesting(false);
    if (error) return toast.error("Erro no teste.");
    const ok = (data as any)?.ok;
    const msg = (data as any)?.message ?? "";
    if (ok) toast.success("Conexão OK.");
    else toast.error(msg || "Falha na conexão.");
    setS(((data as any)?.settings) ?? s);
  };

  return (
    <PlatformAdminLayout>
      <header className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F88A2B]/20 flex items-center justify-center"><Cloud className="w-5 h-5 text-[#F88A2B]" /></div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Storage</p>
          <h1 className="text-3xl font-black text-white">Storage de Áudios · Cloudflare R2</h1>
          <p className="text-xs text-white/50 mt-1">Bucket externo usado para hospedar arquivos de áudio. Credenciais nunca saem do backend.</p>
        </div>
      </header>

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}

      {!loading && (
        <div className="grid gap-6 max-w-3xl">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Credenciais R2</h2>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                s?.connection_status === "ok" ? "bg-emerald-500/20 text-emerald-300" :
                s?.connection_status === "error" ? "bg-red-500/20 text-red-300" :
                "bg-white/10 text-white/50"
              }`}>
                {s?.connection_status === "ok" ? <CheckCircle2 className="w-3 h-3" /> :
                 s?.connection_status === "error" ? <XCircle className="w-3 h-3" /> : null}
                {s?.connection_status ?? "desconhecido"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 block text-xs text-white/60">Provider
                <input value="Cloudflare R2" disabled className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm" />
              </label>
              <label className="col-span-2 block text-xs text-white/60">Account ID
                <input value={form.account_id} onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))} placeholder="ex.: 1a2b3c…" className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono" />
              </label>
              <label className="block text-xs text-white/60">Access Key ID
                <input value={form.access_key_id} onChange={(e) => setForm((f) => ({ ...f, access_key_id: e.target.value }))} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono" />
              </label>
              <label className="block text-xs text-white/60">Secret Access Key
                <div className="relative">
                  <input type={showSecret ? "text" : "password"} value={form.secret_access_key}
                    onChange={(e) => setForm((f) => ({ ...f, secret_access_key: e.target.value }))}
                    placeholder={s?.secret_configured ? `Configurado (${s?.secret_access_key_masked})` : "Cole a Secret Key"}
                    className="w-full mt-1 px-3 py-2 pr-9 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono" />
                  <button type="button" onClick={() => setShowSecret((v) => !v)} className="absolute right-2 top-1/2 mt-0.5 -translate-y-1/2 text-white/50 hover:text-white/80" tabIndex={-1}>
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-white/40">Deixe em branco para manter a atual.</span>
              </label>
              <label className="block text-xs text-white/60">Bucket
                <input value={form.bucket_name} onChange={(e) => setForm((f) => ({ ...f, bucket_name: e.target.value }))} placeholder="ex.: meucaminho-audios" className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono" />
              </label>
              <label className="block text-xs text-white/60">Região
                <input value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="auto" className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono" />
              </label>
              <label className="col-span-2 block text-xs text-white/60">Public Base URL / CDN Domain
                <input value={form.public_base_url} onChange={(e) => setForm((f) => ({ ...f, public_base_url: e.target.value }))} placeholder="https://media.seudominio.com.br" className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono" />
                <span className="text-[10px] text-white/40">Se vazio, será usada a URL padrão do bucket R2.</span>
              </label>
            </div>

            <div className="mt-5 flex items-center gap-2 flex-wrap">
              <button onClick={save} disabled={saving} className="px-5 py-2 bg-[#F88A2B] text-black rounded-lg text-sm font-bold disabled:opacity-40">
                {saving ? "Salvando…" : "Salvar configuração"}
              </button>
              <button onClick={test} disabled={testing || !s?.secret_configured} className="px-5 py-2 bg-white/10 border border-white/10 text-white rounded-lg text-sm font-bold disabled:opacity-40 flex items-center gap-2">
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Testar conexão
              </button>
              {s?.last_test_at && (
                <span className="text-[11px] text-white/50 ml-auto">
                  Último teste: {new Date(s.last_test_at).toLocaleString("pt-BR")}
                </span>
              )}
            </div>

            {s?.last_test_message && (
              <p className={`mt-3 text-xs ${s.connection_status === "ok" ? "text-emerald-300" : "text-red-300"} font-mono whitespace-pre-line`}>{s.last_test_message}</p>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-xs text-white/60 space-y-2">
            <p className="text-white/80 font-bold text-sm">Segurança</p>
            <p>• Secret Access Key nunca é retornada ao frontend depois de salva; aparece apenas mascarada.</p>
            <p>• Uploads passam pela Edge Function <code className="text-white/80">upload-audio-r2</code>, que assina requisições no backend.</p>
            <p>• Apenas Super Admin pode gerenciar credenciais, subir e remover arquivos.</p>
          </div>
        </div>
      )}
    </PlatformAdminLayout>
  );
}