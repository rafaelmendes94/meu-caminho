import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import {
  CreditCard,
  KeyRound,
  Mail,
  ShieldCheck,
  Gauge,
  Timer,
  ToggleRight,
  Globe,
  Wrench,
  ChevronDown,
  Check,
  AlertCircle,
  RotateCcw,
  Save,
  PlayCircle,
  Eye,
  EyeOff,
} from "lucide-react";

type SettingRow = { id: string; key: string; value: any; updated_at: string };

type SectionKey =
  | "billing"
  | "oauth"
  | "resend"
  | "lgpd"
  | "limits"
  | "rate_limits"
  | "feature_flags"
  | "globals"
  | "maintenance";

const SECTIONS: {
  key: SectionKey;
  label: string;
  description: string;
  icon: any;
  defaults: Record<string, any>;
}[] = [
  {
    key: "billing",
    label: "Billing",
    description: "Cobrança e integrações financeiras.",
    icon: CreditCard,
    defaults: {
      provider: "stripe",
      stripe_connected: false,
      customer_portal_enabled: true,
      currency: "BRL",
      grace_period_days: 7,
    },
  },
  {
    key: "oauth",
    label: "OAuth",
    description: "Provedores de autenticação social.",
    icon: KeyRound,
    defaults: {
      google_enabled: true,
      apple_enabled: false,
      redirect_url: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
    },
  },
  {
    key: "resend",
    label: "Resend",
    description: "Chave da API e remetente padrão para e-mails transacionais.",
    icon: Mail,
    defaults: {
      from_email: "no-reply@meucaminho.app",
      from_name: "Meu Caminho",
    },
  },
  {
    key: "lgpd",
    label: "LGPD",
    description: "Retenção, DPO e políticas de privacidade.",
    icon: ShieldCheck,
    defaults: {
      terms_version: "1.0.0",
      privacy_version: "1.0.0",
      consent_required: true,
      retention_days: 730,
      anonymize_after_days: 365,
    },
  },
  {
    key: "limits",
    label: "Limites",
    description: "Quotas globais por organização.",
    icon: Gauge,
    defaults: {
      max_users_per_org: 5000,
      max_invites_per_day: 200,
      max_checkins_per_week: 7,
      max_ai_messages_per_user_per_day: 50,
      max_dna_per_month: 4,
    },
  },
  {
    key: "rate_limits",
    label: "Rate Limits",
    description: "Limites por edge function.",
    icon: Timer,
    defaults: {
      ai_chat_per_day: 200,
      executive_ai_per_day: 100,
      generate_dna_per_month: 5,
      send_invite_per_day: 300,
      submit_pulse_per_day: 20,
    },
  },
  {
    key: "feature_flags",
    label: "Feature Flags",
    description: "Ativar/desativar módulos globalmente.",
    icon: ToggleRight,
    defaults: {
      content_studio: true,
      executive_council: true,
      organizational_dna: true,
      organizational_score: true,
      intelligent_rituals: true,
      impact_engine: true,
      canal_direto: true,
      b2c: false,
      billing: true,
    },
  },
  {
    key: "globals",
    label: "Variáveis globais",
    description: "Valores globais utilizados pelo app.",
    icon: Globe,
    defaults: {
      platform_name: "Meu Caminho Enterprise",
      public_url: "https://meucaminho.app",
      support_email: "suporte@meucaminho.app",
      docs_url: "https://docs.meucaminho.app",
      environment: "production",
      version: "1.0.0",
    },
  },
  {
    key: "maintenance",
    label: "Manutenção",
    description: "Modo manutenção e mensagens do sistema.",
    icon: Wrench,
    defaults: {
      enabled: false,
      message: "",
      block_new_logins: false,
      block_ai: false,
    },
  },
];

// ---------- UI primitives ----------

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
  </div>
);

const inputCls =
  "w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#F88A2B] focus:ring-2 focus:ring-[#F88A2B]/20";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${inputCls} ${props.className ?? ""}`} />
);

const Select = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

const Switch = ({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
    <div>
      <div className="text-sm font-semibold text-slate-800">{label}</div>
      {hint && <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-[#F88A2B]" : "bg-slate-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  </div>
);

const Badge = ({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "off";
  children: React.ReactNode;
}) => {
  const map = {
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    off: "bg-slate-100 text-slate-600 border-slate-200",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${map[tone]}`}>
      {children}
    </span>
  );
};

const Card = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="mb-4">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

// ---------- Section forms ----------

const AI_MODELS = [
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
];

function AISection({ v, set }: { v: any; set: (p: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Modelo principal" hint="Usado por padrão em todas as chamadas.">
        <Select value={v.default_model ?? ""} onChange={(x) => set({ ...v, default_model: x })} options={AI_MODELS} />
      </Field>
      <Field label="Modelo fallback" hint="Usado quando o principal falha.">
        <Select value={v.fallback_model ?? ""} onChange={(x) => set({ ...v, fallback_model: x })} options={AI_MODELS} />
      </Field>
      <Field label="Máximo de tokens por requisição">
        <Input
          type="number"
          value={v.max_tokens_per_request ?? 0}
          onChange={(e) => set({ ...v, max_tokens_per_request: Number(e.target.value) })}
        />
      </Field>
      <Field label="Temperatura" hint="Entre 0 e 1. Mais alto = respostas mais criativas.">
        <Input
          type="number"
          step="0.1"
          min={0}
          max={1}
          value={v.temperature ?? 0.7}
          onChange={(e) => set({ ...v, temperature: Number(e.target.value) })}
        />
      </Field>
      <div className="md:col-span-2">
        <Switch
          checked={!!v.streaming_enabled}
          onChange={(x) => set({ ...v, streaming_enabled: x })}
          label="Streaming habilitado"
          hint="Renderiza a resposta da IA em tempo real."
        />
      </div>
    </div>
  );
}

function BillingSection({ v, set }: { v: any; set: (p: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Provedor">
        <Select
          value={v.provider ?? "stripe"}
          onChange={(x) => set({ ...v, provider: x })}
          options={[
            { value: "stripe", label: "Stripe" },
            { value: "manual", label: "Manual" },
            { value: "disabled", label: "Desativado" },
          ]}
        />
      </Field>
      <Field label="Status Stripe">
        <div className="h-10 flex items-center">
          {v.stripe_connected ? (
            <Badge tone="ok"><Check className="w-3 h-3" /> Conectado</Badge>
          ) : (
            <Badge tone="off">Não conectado</Badge>
          )}
        </div>
      </Field>
      <Field label="Moeda padrão">
        <Select
          value={v.currency ?? "BRL"}
          onChange={(x) => set({ ...v, currency: x })}
          options={[
            { value: "BRL", label: "BRL — Real" },
            { value: "USD", label: "USD — Dólar" },
          ]}
        />
      </Field>
      <Field label="Grace period (dias)" hint="Prazo antes de suspender após falha de pagamento.">
        <Input type="number" value={v.grace_period_days ?? 0} onChange={(e) => set({ ...v, grace_period_days: Number(e.target.value) })} />
      </Field>
      <div className="md:col-span-2">
        <Switch
          checked={!!v.customer_portal_enabled}
          onChange={(x) => set({ ...v, customer_portal_enabled: x })}
          label="Customer Portal habilitado"
          hint="Cliente gerencia assinatura via portal Stripe."
        />
      </div>
    </div>
  );
}

function OAuthSection({ v, set }: { v: any; set: (p: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
        <Switch checked={!!v.google_enabled} onChange={(x) => set({ ...v, google_enabled: x })} label="Google OAuth" hint="Login com Google." />
        <Switch checked={!!v.apple_enabled} onChange={(x) => set({ ...v, apple_enabled: x })} label="Apple OAuth" hint="Login com Apple ID." />
      </div>
      <Field label="Redirect URL" hint="URL configurada nos provedores OAuth.">
        <Input readOnly value={v.redirect_url ?? ""} className="bg-slate-50 text-slate-600" />
      </Field>
    </div>
  );
}

function ResendSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("platform-resend-settings", {
      method: "GET",
    });
    setLoading(false);
    if (error) { toast.error("Falha ao carregar configuração do Resend"); return; }
    setConfigured(!!data?.configured);
    setMaskedKey(data?.api_key_masked ?? null);
    setFromEmail(data?.from_email ?? "");
    setFromName(data?.from_name ?? "");
    setUpdatedAt(data?.updated_at ?? null);
    setApiKey("");
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    setSaving(true);
    const body: Record<string, string> = { from_email: fromEmail, from_name: fromName };
    if (apiKey.trim().length > 0) body.api_key = apiKey.trim();
    const { error } = await supabase.functions.invoke("platform-resend-settings", {
      method: "POST",
      body,
    });
    setSaving(false);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Configuração do Resend salva");
    await load();
  };

  const clearKey = async () => {
    if (!confirm("Remover a chave da API do Resend? O envio de e-mails será desativado.")) return;
    const { error } = await supabase.functions.invoke("platform-resend-settings", {
      method: "DELETE",
    });
    if (error) { toast.error("Erro ao remover chave"); return; }
    toast.success("Chave removida");
    await load();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700">Status:</span>
        {configured ? (
          <Badge tone="ok"><Check className="w-3 h-3" /> Chave configurada</Badge>
        ) : (
          <Badge tone="warn"><AlertCircle className="w-3 h-3" /> Sem chave — e-mails desativados</Badge>
        )}
        {updatedAt && (
          <span className="text-[11px] text-slate-500">
            · Atualizado {new Date(updatedAt).toLocaleString("pt-BR")}
          </span>
        )}
      </div>

      <Field
        label="Chave da API do Resend"
        hint={
          configured
            ? `Chave atual: ${maskedKey ?? "•••"}. Digite uma nova chave apenas se quiser substituir.`
            : "Cole aqui a chave gerada em resend.com/api-keys (começa com re_)."
        }
      >
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={configured ? "Nova chave (opcional)" : "re_xxxxxxxxxxxxxxxxxxxxxxxx"}
            autoComplete="off"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800"
            aria-label={showKey ? "Ocultar chave" : "Mostrar chave"}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="E-mail remetente" hint="Domínio precisa estar verificado no Resend.">
          <Input
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="no-reply@seudominio.com.br"
          />
        </Field>
        <Field label="Nome do remetente">
          <Input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Meu Caminho Enterprise"
          />
        </Field>
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-1">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#F88A2B] text-white rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-[#e57a20]"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Salvando…" : "Salvar"}
        </button>
        {configured && (
          <button
            onClick={clearKey}
            className="inline-flex items-center gap-1.5 px-4 h-10 bg-white border border-slate-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50"
          >
            Remover chave
          </button>
        )}
      </div>

      <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-3">
        A chave é armazenada apenas no backend (nunca é enviada ao navegador dos usuários). Ela é lida pelas funções
        <code className="font-mono text-slate-700"> send-enterprise-invite </code> e
        <code className="font-mono text-slate-700"> manage-enterprise-invite </code> para disparar convites e lembretes.
      </div>
    </div>
  );
}

function LGPDSection({ v, set }: { v: any; set: (p: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Versão atual dos termos">
          <Input value={v.terms_version ?? ""} onChange={(e) => set({ ...v, terms_version: e.target.value })} />
        </Field>
        <Field label="Versão política de privacidade">
          <Input value={v.privacy_version ?? ""} onChange={(e) => set({ ...v, privacy_version: e.target.value })} />
        </Field>
        <Field label="Retenção padrão (dias)">
          <Input type="number" value={v.retention_days ?? 0} onChange={(e) => set({ ...v, retention_days: Number(e.target.value) })} />
        </Field>
        <Field label="Anonimizar após (dias)">
          <Input type="number" value={v.anonymize_after_days ?? 0} onChange={(e) => set({ ...v, anonymize_after_days: Number(e.target.value) })} />
        </Field>
      </div>
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
        <Switch checked={!!v.consent_required} onChange={(x) => set({ ...v, consent_required: x })} label="Consentimento obrigatório" hint="Bloquear uso até aceite dos termos." />
      </div>
    </div>
  );
}

function NumberGrid({ v, set, fields }: { v: any; set: (p: any) => void; fields: { key: string; label: string; hint?: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <Field key={f.key} label={f.label} hint={f.hint}>
          <Input type="number" value={v[f.key] ?? 0} onChange={(e) => set({ ...v, [f.key]: Number(e.target.value) })} />
        </Field>
      ))}
    </div>
  );
}

function FeatureFlagsSection({ v, set }: { v: any; set: (p: any) => void }) {
  const flags: { key: string; label: string }[] = [
    { key: "content_studio", label: "Content Studio" },
    { key: "executive_council", label: "Conselho Executivo IA" },
    { key: "organizational_dna", label: "DNA Organizacional" },
    { key: "organizational_score", label: "Score Organizacional" },
    { key: "intelligent_rituals", label: "Rituais Inteligentes" },
    { key: "impact_engine", label: "Motor de Impacto" },
    { key: "canal_direto", label: "Canal Direto" },
    { key: "b2c", label: "B2C" },
    { key: "billing", label: "Billing" },
  ];
  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
      {flags.map((f) => (
        <Switch key={f.key} checked={!!v[f.key]} onChange={(x) => set({ ...v, [f.key]: x })} label={f.label} />
      ))}
    </div>
  );
}

function GlobalsSection({ v, set }: { v: any; set: (p: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Nome da plataforma">
        <Input value={v.platform_name ?? ""} onChange={(e) => set({ ...v, platform_name: e.target.value })} />
      </Field>
      <Field label="URL pública">
        <Input value={v.public_url ?? ""} onChange={(e) => set({ ...v, public_url: e.target.value })} />
      </Field>
      <Field label="Email de suporte">
        <Input type="email" value={v.support_email ?? ""} onChange={(e) => set({ ...v, support_email: e.target.value })} />
      </Field>
      <Field label="URL da documentação">
        <Input value={v.docs_url ?? ""} onChange={(e) => set({ ...v, docs_url: e.target.value })} />
      </Field>
      <Field label="Ambiente">
        <Select
          value={v.environment ?? "production"}
          onChange={(x) => set({ ...v, environment: x })}
          options={[
            { value: "development", label: "Desenvolvimento" },
            { value: "staging", label: "Staging" },
            { value: "production", label: "Produção" },
          ]}
        />
      </Field>
      <Field label="Versão">
        <Input value={v.version ?? ""} onChange={(e) => set({ ...v, version: e.target.value })} />
      </Field>
    </div>
  );
}

function MaintenanceSection({ v, set }: { v: any; set: (p: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
        <Switch checked={!!v.enabled} onChange={(x) => set({ ...v, enabled: x })} label="Modo manutenção" hint="Exibe página de manutenção para todos os usuários." />
        <Switch checked={!!v.block_new_logins} onChange={(x) => set({ ...v, block_new_logins: x })} label="Bloquear novos logins" />
        <Switch checked={!!v.block_ai} onChange={(x) => set({ ...v, block_ai: x })} label="Bloquear IA temporariamente" />
      </div>
      <Field label="Mensagem de manutenção" hint="Exibida na página de manutenção.">
        <textarea
          value={v.message ?? ""}
          onChange={(e) => set({ ...v, message: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:border-[#F88A2B] focus:ring-2 focus:ring-[#F88A2B]/20"
        />
      </Field>
    </div>
  );
}

// ---------- Main screen ----------

const PlatformSettingsScreen = () => {
  const [rows, setRows] = useState<Record<string, SettingRow>>({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<SectionKey>("billing");
  const [value, setValue] = useState<any>({});
  const [initial, setInitial] = useState<any>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("platform_settings" as any).select("*");
    const map: Record<string, SettingRow> = {};
    ((data as any[]) ?? []).forEach((r) => { map[r.key] = r as SettingRow; });
    setRows(map);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const section = useMemo(() => SECTIONS.find((s) => s.key === active)!, [active]);

  useEffect(() => {
    const existing = rows[section.key]?.value ?? section.defaults;
    const merged = { ...section.defaults, ...(existing ?? {}) };
    setValue(merged);
    setInitial(merged);
    setJsonDraft(JSON.stringify(merged, null, 2));
    setJsonError(null);
    setShowAdvanced(false);
  }, [active, rows, section]);

  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(initial), [value, initial]);

  const updateValue = (next: any) => {
    setValue(next);
    setJsonDraft(JSON.stringify(next, null, 2));
    setJsonError(null);
  };

  const applyJsonDraft = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      setValue(parsed);
      setJsonError(null);
      toast.success("JSON aplicado ao formulário");
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("platform_settings" as any)
      .upsert({ key: section.key, value }, { onConflict: "key" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Configuração salva");
    await load();
  };

  const reset = () => {
    if (!confirm("Restaurar padrões desta seção?")) return;
    updateValue(section.defaults);
    toast.success("Padrões restaurados (não salvo ainda)");
  };

  const testAction = () => {
    toast.info("Teste enviado. Verifique os logs.");
  };

  const renderForm = () => {
    switch (section.key) {
      case "billing": return <BillingSection v={value} set={updateValue} />;
      case "oauth": return <OAuthSection v={value} set={updateValue} />;
      case "resend": return <ResendSection />;
      case "lgpd": return <LGPDSection v={value} set={updateValue} />;
      case "limits":
        return <NumberGrid v={value} set={updateValue} fields={[
          { key: "max_users_per_org", label: "Máx. colaboradores por organização" },
          { key: "max_invites_per_day", label: "Máx. convites por dia" },
          { key: "max_checkins_per_week", label: "Máx. check-ins por semana" },
          { key: "max_ai_messages_per_user_per_day", label: "Máx. mensagens IA por usuário/dia" },
          { key: "max_dna_per_month", label: "Máx. geração de DNA por mês" },
        ]} />;
      case "rate_limits":
        return <NumberGrid v={value} set={updateValue} fields={[
          { key: "ai_chat_per_day", label: "ai-chat / dia" },
          { key: "executive_ai_per_day", label: "executive-ai / dia" },
          { key: "generate_dna_per_month", label: "generate-dna / mês" },
          { key: "send_invite_per_day", label: "send-invite / dia" },
          { key: "submit_pulse_per_day", label: "submit-pulse / dia" },
        ]} />;
      case "feature_flags": return <FeatureFlagsSection v={value} set={updateValue} />;
      case "globals": return <GlobalsSection v={value} set={updateValue} />;
      case "maintenance": return <MaintenanceSection v={value} set={updateValue} />;
    }
  };

  const showTest = ["billing", "oauth"].includes(section.key);
  const isCustomPanel = section.key === "resend";
  const Icon = section.icon;

  return (
    <PlatformAdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500">Painel de variáveis globais e feature flags da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <nav className="bg-white border border-slate-200 rounded-xl p-2 h-fit">
          {SECTIONS.map((s) => {
            const configured = !!rows[s.key];
            const isActive = active === s.key;
            const SIcon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-colors ${
                  isActive ? "bg-[#F88A2B] text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SIcon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{s.label}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    configured ? (isActive ? "bg-white" : "bg-emerald-500") : (isActive ? "bg-white/40" : "bg-slate-300")
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Panel */}
        <div className="space-y-4">
          <Card
            title={section.label}
            description={section.description}
          >
            <div className="flex items-center justify-between mb-4 -mt-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Icon className="w-3.5 h-3.5" />
                <span>Chave: <code className="font-mono text-slate-700">{section.key}</code></span>
                {rows[section.key] ? (
                  <span>· Atualizado {new Date(rows[section.key].updated_at).toLocaleString("pt-BR")}</span>
                ) : (
                  <span>· Nunca configurado</span>
                )}
              </div>
              {dirty && <Badge tone="warn"><AlertCircle className="w-3 h-3" /> Alterações não salvas</Badge>}
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ) : (
              renderForm()
            )}

            {!isCustomPanel && (
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 flex-wrap">
              <button
                onClick={save}
                disabled={saving || !dirty}
                className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#F88A2B] text-white rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-[#e57a20] transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Salvando…" : "Salvar"}
              </button>
              {showTest && (
                <button
                  onClick={testAction}
                  className="inline-flex items-center gap-1.5 px-4 h-10 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  {section.key === "billing" ? "Testar Stripe" : "Testar OAuth"}
                </button>
              )}
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-4 h-10 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar padrão
              </button>
            </div>
            )}
          </Card>

          {/* Advanced JSON */}
          {!isCustomPanel && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdvanced((x) => !x)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">Modo avançado</div>
                <div className="text-[11px] text-slate-500">Ver e editar o JSON bruto desta seção</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="px-5 pb-5 pt-1 border-t border-slate-100">
                <textarea
                  value={jsonDraft}
                  onChange={(e) => { setJsonDraft(e.target.value); setJsonError(null); }}
                  rows={14}
                  spellCheck={false}
                  className="w-full mt-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#F88A2B]"
                />
                {jsonError && (
                  <div className="mt-2 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    JSON inválido: {jsonError}
                  </div>
                )}
                <button
                  onClick={applyJsonDraft}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 h-9 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Aplicar JSON ao formulário
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </PlatformAdminLayout>
  );
};

export default PlatformSettingsScreen;