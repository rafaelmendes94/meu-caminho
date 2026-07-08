import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type SettingRow = { id: string; key: string; value: any; updated_at: string };

type SectionKey =
  | "ai"
  | "billing"
  | "oauth"
  | "resend"
  | "lgpd"
  | "limits"
  | "rate_limits"
  | "feature_flags"
  | "globals"
  | "maintenance";

const SECTIONS: { key: SectionKey; label: string; description: string; defaults: Record<string, any> }[] = [
  {
    key: "ai",
    label: "IA",
    description: "Modelos, limites de tokens e provedores.",
    defaults: {
      default_model: "google/gemini-2.5-flash",
      fallback_model: "google/gemini-2.5-flash-lite",
      max_tokens_per_request: 4000,
      streaming_enabled: true,
    },
  },
  {
    key: "billing",
    label: "Billing",
    description: "Cobrança e integrações financeiras.",
    defaults: {
      currency: "BRL",
      trial_days: 14,
      grace_period_days: 7,
      stripe_enabled: false,
    },
  },
  {
    key: "oauth",
    label: "OAuth",
    description: "Provedores de autenticação social.",
    defaults: { google_enabled: true, microsoft_enabled: false, apple_enabled: false },
  },
  {
    key: "resend",
    label: "Resend",
    description: "Configuração de envio de e-mails transacionais.",
    defaults: { from_email: "no-reply@meucaminho.app", from_name: "Meu Caminho", reply_to: "" },
  },
  {
    key: "lgpd",
    label: "LGPD",
    description: "Retenção, DPO e políticas de privacidade.",
    defaults: {
      dpo_email: "",
      retention_days_checkins: 730,
      retention_days_messages: 365,
      k_anonymity_threshold: 5,
    },
  },
  {
    key: "limits",
    label: "Limites",
    description: "Quotas globais por organização.",
    defaults: { max_users_per_org: 5000, max_departments: 200, max_units: 100 },
  },
  {
    key: "rate_limits",
    label: "Rate Limits",
    description: "Limites de requisições por minuto.",
    defaults: { ai_messages_per_minute: 20, api_requests_per_minute: 120, login_attempts_per_hour: 10 },
  },
  {
    key: "feature_flags",
    label: "Feature Flags",
    description: "Ativar/desativar módulos globalmente.",
    defaults: {
      executive_council: true,
      intelligent_rituals: true,
      impact_engine: true,
      predictive_signals: true,
      weekly_insights: true,
    },
  },
  {
    key: "globals",
    label: "Variáveis globais",
    description: "Valores globais utilizados pelo app.",
    defaults: { support_email: "suporte@meucaminho.app", marketing_site: "https://meucaminho.app" },
  },
  {
    key: "maintenance",
    label: "Manutenção",
    description: "Modo manutenção e mensagens do sistema.",
    defaults: { enabled: false, message: "", allow_platform_admin: true },
  },
];

const PlatformSettingsScreen = () => {
  const [rows, setRows] = useState<Record<string, SettingRow>>({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<SectionKey>("ai");
  const [draft, setDraft] = useState<string>("");
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
    setDraft(JSON.stringify(existing, null, 2));
  }, [active, rows, section]);

  const save = async () => {
    let parsed: any;
    try {
      parsed = JSON.parse(draft);
    } catch {
      toast.error("JSON inválido");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("platform_settings" as any)
      .upsert({ key: section.key, value: parsed }, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Configuração salva");
    await load();
  };

  const reset = () => setDraft(JSON.stringify(section.defaults, null, 2));

  const remove = async () => {
    if (!rows[section.key]) return;
    if (!confirm(`Remover configuração "${section.label}"?`)) return;
    setSaving(true);
    const { error } = await supabase.from("platform_settings" as any).delete().eq("key", section.key);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removido");
    await load();
  };

  return (
    <PlatformAdminLayout>
      <h1 className="text-3xl font-black mb-2">Configurações</h1>
      <p className="text-white/60 mb-6">Painel de variáveis globais e feature flags. Persistido em platform_settings.</p>

      <div className="grid grid-cols-[220px_1fr] gap-6">
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((s) => {
            const configured = !!rows[s.key];
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  active === s.key ? "bg-[#F88A2B] text-black" : "text-white/70 hover:bg-white/5"
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    configured ? (active === s.key ? "bg-black/60" : "bg-emerald-400") : (active === s.key ? "bg-black/30" : "bg-white/20")
                  }`}
                />
              </button>
            );
          })}
        </nav>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-black">{section.label}</h2>
              <p className="text-sm text-white/60">{section.description}</p>
            </div>
            <div className="text-right text-xs text-white/40">
              {rows[section.key] ? (
                <>Atualizado em {new Date(rows[section.key].updated_at).toLocaleString("pt-BR")}</>
              ) : (
                <>Nunca configurado</>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-white/50 text-sm">Carregando…</p>
          ) : (
            <>
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Valor (JSON)</label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={16}
                spellCheck={false}
                className="mt-2 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white/90 focus:outline-none focus:border-[#F88A2B]/60"
              />

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 bg-[#F88A2B] text-black rounded-lg text-xs font-bold disabled:opacity-40"
                >
                  {saving ? "Salvando…" : "Salvar"}
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-xs font-semibold text-white/70 hover:bg-white/5"
                >
                  Restaurar padrões
                </button>
                {rows[section.key] && (
                  <button
                    onClick={remove}
                    disabled={saving}
                    className="ml-auto px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/10 disabled:opacity-40"
                  >
                    Remover
                  </button>
                )}
              </div>

              <p className="text-[11px] text-white/40 mt-4">
                Chave: <span className="font-mono text-white/60">{section.key}</span>. As alterações são gravadas em <span className="font-mono text-white/60">platform_settings</span> (RLS restrita a platform_admin).
              </p>
            </>
          )}
        </div>
      </div>
    </PlatformAdminLayout>
  );
};

export default PlatformSettingsScreen;