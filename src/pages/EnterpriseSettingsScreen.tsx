import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EnterpriseRHLayout } from "@/components/layouts/EnterpriseRHLayout";
import { useEnterpriseSettings } from "@/hooks/useEnterpriseSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Building2, Palette, Users, KeyRound, Globe, Clock, CalendarDays, Plug, Bell,
  ShieldCheck, Sparkles, ScrollText, Save, ArrowUpRight, Construction,
  Upload, Trash2, Plus, Image as ImageIcon, Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { validateAndCompressImage } from "@/lib/imageUpload";
import { getSignedUrl, invalidateSignedUrl } from "@/lib/signedUrlCache";

type TabKey =
  | "empresa" | "branding" | "usuarios" | "licenca" | "regionalizacao"
  | "jornada" | "calendario" | "integracoes" | "notificacoes"
  | "seguranca" | "ia" | "auditoria";

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "empresa",        label: "Empresa",        icon: Building2 },
  { key: "branding",       label: "Branding",       icon: Palette },
  { key: "usuarios",       label: "Usuários",       icon: Users },
  { key: "licenca",        label: "Licença",        icon: KeyRound },
  { key: "regionalizacao", label: "Regionalização", icon: Globe },
  { key: "jornada",        label: "Jornada",        icon: Clock },
  { key: "calendario",     label: "Calendário",     icon: CalendarDays },
  { key: "integracoes",    label: "Integrações",    icon: Plug },
  { key: "notificacoes",   label: "Notificações",   icon: Bell },
  { key: "seguranca",      label: "Segurança",      icon: ShieldCheck },
  { key: "ia",             label: "IA",             icon: Sparkles },
  { key: "auditoria",      label: "Auditoria",      icon: ScrollText },
];

// ---------- helpers ----------
const isValidCnpj = (v: string) => {
  const s = v.replace(/\D/g, "");
  if (s.length !== 14 || /^(\d)\1+$/.test(s)) return false;
  const calc = (n: number) => {
    let sum = 0, pos = n - 7;
    for (let i = 0; i < n; i++) {
      sum += Number(s[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(s[12]) && calc(13) === Number(s[13]);
};

// ---------- máscaras de input ----------
const maskCnpj = (v: string) => v.replace(/\D/g, "").slice(0, 14)
  .replace(/^(\d{2})(\d)/, "$1.$2")
  .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
  .replace(/\.(\d{3})(\d)/, ".$1/$2")
  .replace(/(\d{4})(\d)/, "$1-$2");
const maskCep = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
const maskPhone = (v: string) => {
  const s = v.replace(/\D/g, "").slice(0, 11);
  if (s.length <= 10) return s.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return s.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const ComingSoon = ({ label }: { label: string }) => (
  <Card>
    <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-3">
      <Construction className="h-8 w-8 text-muted-foreground" />
      <div className="text-lg font-semibold">{label}</div>
      <p className="text-sm text-muted-foreground max-w-md">
        Este módulo será entregue nas próximas sub-fases (B/C) do rollout de Configurações da Empresa.
      </p>
    </CardContent>
  </Card>
);

// ---------- ABA EMPRESA ----------
function EmpresaTab() {
  const { organization, refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const empty = {
    name: "", legal_name: "", cnpj: "", segment: "", employee_count: 0,
    website: "", email: "", phone: "", address: "", city: "", state: "",
    country: "", postal_code: "", description: "",
  };
  const [form, setForm] = useState(empty);
  const [snapshot, setSnapshot] = useState(empty);

  useEffect(() => {
    if (!organization?.id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("organizations").select(
        "name,legal_name,cnpj,segment,employee_count,website,email,phone,address,city,state,country,postal_code,description"
      ).eq("id", organization.id).maybeSingle();
      if (data) {
        const next = {
          name: data.name ?? "", legal_name: data.legal_name ?? "",
          cnpj: data.cnpj ?? "", segment: data.segment ?? "",
          employee_count: data.employee_count ?? 0, website: data.website ?? "",
          email: data.email ?? "", phone: data.phone ?? "",
          address: data.address ?? "", city: data.city ?? "",
          state: data.state ?? "", country: data.country ?? "Brasil",
          postal_code: data.postal_code ?? "", description: data.description ?? "",
        };
        setForm(next); setSnapshot(next);
      }
      setLoading(false);
    })();
  }, [organization?.id]);

  const handleSave = async () => {
    if (!organization?.id) return;
    if (!form.name.trim()) return toast.error("Nome fantasia é obrigatório.");
    if (form.cnpj && !isValidCnpj(form.cnpj)) return toast.error("CNPJ inválido.");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("E-mail inválido.");
    setSaving(true);
    const { error } = await supabase.from("organizations").update({
      name: form.name,
      legal_name: form.legal_name || null,
      cnpj: form.cnpj || null,
      segment: form.segment || null,
      employee_count: form.employee_count || null,
      website: form.website || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      country: form.country || null,
      postal_code: form.postal_code || null,
      description: form.description || null,
    }).eq("id", organization.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setSnapshot(form);
    toast.success("Dados da empresa atualizados.");
    void refresh();
  };

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  if (loading) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Empresa</CardTitle>
        <CardDescription>Informações institucionais visíveis para RH e integrações.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome fantasia"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Razão social"><Input value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} /></Field>
        <Field label="CNPJ"><Input value={form.cnpj} onChange={(e) => set("cnpj", maskCnpj(e.target.value))} placeholder="00.000.000/0000-00" /></Field>
        <Field label="Segmento"><Input value={form.segment} onChange={(e) => set("segment", e.target.value)} /></Field>
        <Field label="Nº de colaboradores">
          <Input type="number" min={0} value={form.employee_count}
                 onChange={(e) => set("employee_count", Number(e.target.value) || 0)} />
        </Field>
        <Field label="Site"><Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></Field>
        <Field label="E-mail institucional"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Telefone"><Input value={form.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} placeholder="(00) 00000-0000" /></Field>
        <Field label="Endereço" className="md:col-span-2"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="Cidade"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Estado"><Input value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
        <Field label="País"><Input value={form.country} onChange={(e) => set("country", e.target.value)} /></Field>
        <Field label="CEP"><Input value={form.postal_code} onChange={(e) => set("postal_code", maskCep(e.target.value))} placeholder="00000-000" /></Field>
        <Field label="Descrição" className="md:col-span-2">
          <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <div className="md:col-span-2 flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => setForm(snapshot)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const Field = ({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) => (
  <div className={`space-y-1.5 ${className ?? ""}`}>
    <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
    {children}
  </div>
);

// ---------- ABA LICENÇA ----------
function LicencaTab() {
  const { organization } = useAuth();
  const [row, setRow] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [aiUsed, setAiUsed] = useState<number>(0);
  const [storageUsedMb, setStorageUsedMb] = useState<number>(0);
  useEffect(() => {
    if (!organization?.id) return;
    (async () => {
      const { data } = await supabase.from("organizations").select(
        "plan,subscription_status,licenses_total,licenses_used,current_period_end,trial_ends_at"
      ).eq("id", organization.id).maybeSingle();
      setRow(data);
      if (data?.plan) {
        const { data: p } = await supabase.from("platform_plans")
          .select("name,features,ai_monthly_limit,storage_limit_mb")
          .eq("slug", data.plan).maybeSingle();
        setPlan(p);
      }
      // Consumo real de IA no mês corrente
      const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
      const { data: usage } = await supabase.from("platform_usage_daily")
        .select("ai_messages_count,executive_ai_messages_count,dna_reports_count,action_plans_count,rituals_count")
        .eq("organization_id", organization.id)
        .gte("usage_date", start.toISOString().slice(0,10));
      setAiUsed((usage ?? []).reduce((s: number, r: any) =>
        s + Number(r.ai_messages_count ?? 0) + Number(r.executive_ai_messages_count ?? 0)
        + Number(r.dna_reports_count ?? 0) + Number(r.action_plans_count ?? 0) + Number(r.rituals_count ?? 0), 0));
      // Consumo de storage: soma tamanho dos objetos do bucket da org (aproximação)
      try {
        const { data: files } = await supabase.storage.from("org-branding").list(organization.id, { limit: 1000 });
        const bytes = (files ?? []).reduce((s: number, f: any) => s + Number(f?.metadata?.size ?? 0), 0);
        setStorageUsedMb(Math.round(bytes / 1024 / 1024 * 100) / 100);
      } catch { /* opcional */ }
    })();
  }, [organization?.id]);

  const available = Math.max(0, (row?.licenses_total ?? 0) - (row?.licenses_used ?? 0));
  const licensesPct = row?.licenses_total ? Math.min(100, Math.round((row.licenses_used ?? 0) / row.licenses_total * 100)) : 0;
  const aiLimit = Number(plan?.ai_monthly_limit ?? 0);
  const aiPct = aiLimit ? Math.min(100, Math.round(aiUsed / aiLimit * 100)) : 0;
  const storageLimit = Number(plan?.storage_limit_mb ?? 0);
  const storagePct = storageLimit ? Math.min(100, Math.round(storageUsedMb / storageLimit * 100)) : 0;

  const openSupportTicket = async () => {
    if (!organization?.id) return;
    const { error } = await supabase.from("support_tickets").insert({
      organization_id: organization.id,
      title: "Solicitação de upgrade de plano",
      message: `Solicitamos avaliação para upgrade do plano atual (${row?.plan ?? "n/d"}).`,
      priority: "high",
      status: "open",
    });
    if (error) toast.error(error.message);
    else toast.success("Solicitação enviada. Nossa equipe entrará em contato.");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>Plano</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between"><span>Plano atual</span><Badge>{plan?.name ?? row?.plan ?? "—"}</Badge></div>
          <div className="flex items-center justify-between"><span>Status</span><Badge variant="outline">{row?.subscription_status ?? "—"}</Badge></div>
          <div className="flex items-center justify-between"><span>Renovação</span>
            <span className="text-sm text-muted-foreground">{row?.current_period_end ? new Date(row.current_period_end).toLocaleDateString() : "—"}</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Licenças</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Row label="Contratadas" value={row?.licenses_total ?? 0} />
          <Row label="Em uso" value={row?.licenses_used ?? 0} />
          <Row label="Disponíveis" value={available} />
          <Progress value={licensesPct} className="h-2 mt-2" />
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Consumo e Recursos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Row label={`IA — ${aiUsed} / ${aiLimit || "—"} req (mês)`} value={`${aiPct}%`} />
            <Progress value={aiPct} className="h-2" />
          </div>
          <div className="space-y-1">
            <Row label={`Storage — ${storageUsedMb} / ${storageLimit || "—"} MB`} value={`${storagePct}%`} />
            <Progress value={storagePct} className="h-2" />
          </div>
          {plan?.features && (
            <div className="pt-2">
              <div className="text-xs uppercase text-muted-foreground mb-1">Recursos habilitados</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(plan.features as Record<string, any>)
                  .filter(([, v]) => !!v)
                  .map(([k]) => <Badge key={k} variant="secondary">{k}</Badge>)}
              </div>
            </div>
          )}
          <div className="pt-4 flex justify-end">
            <Button onClick={openSupportTicket}>
              <ArrowUpRight className="h-4 w-4 mr-2" /> Solicitar Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: any }) => (
  <div className="flex items-center justify-between"><span>{label}</span><span className="font-semibold">{String(value)}</span></div>
);

// ---------- ABA REGIONALIZAÇÃO ----------
function RegionalizacaoTab() {
  const { value, setValue, save, loading, saving } = useEnterpriseSettings("regionalization", {
    timezone: "America/Sao_Paulo",
    locale: "pt-BR",
    date_format: "DD/MM/YYYY",
    time_format: "HH:mm",
    week_start: "monday",
    currency: "BRL",
    decimal_separator: ",",
    country: "BR",
  } as any);

  const set = (k: string, v: string) => setValue({ ...value, [k]: v });

  if (loading) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <Card>
      <CardHeader><CardTitle>Regionalização</CardTitle><CardDescription>Idioma, fuso e formatos aplicados em toda a empresa.</CardDescription></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Timezone">
          <SelectBox value={value.timezone} onChange={(v) => set("timezone", v)}
            options={["America/Sao_Paulo","America/Manaus","America/Fortaleza","America/Belem","UTC","America/New_York","Europe/Lisbon","Europe/London"]} />
        </Field>
        <Field label="Idioma">
          <SelectBox value={value.locale} onChange={(v) => set("locale", v)}
            options={[["pt-BR","Português (Brasil)"],["en-US","English (US)"],["es-ES","Español"]]} />
        </Field>
        <Field label="País">
          <SelectBox value={value.country} onChange={(v) => set("country", v)}
            options={[["BR","Brasil"],["US","United States"],["PT","Portugal"],["ES","España"]]} />
        </Field>
        <Field label="Moeda">
          <SelectBox value={value.currency} onChange={(v) => set("currency", v)}
            options={["BRL","USD","EUR","GBP"]} />
        </Field>
        <Field label="Formato de data">
          <SelectBox value={value.date_format} onChange={(v) => set("date_format", v)}
            options={["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"]} />
        </Field>
        <Field label="Formato de hora">
          <SelectBox value={value.time_format} onChange={(v) => set("time_format", v)}
            options={["HH:mm","hh:mm a"]} />
        </Field>
        <Field label="Primeiro dia da semana">
          <SelectBox value={value.week_start} onChange={(v) => set("week_start", v)}
            options={[["monday","Segunda"],["sunday","Domingo"]]} />
        </Field>
        <Field label="Separador decimal">
          <SelectBox value={value.decimal_separator} onChange={(v) => set("decimal_separator", v)}
            options={[[",","Vírgula (1.234,56)"],[".","Ponto (1,234.56)"]]} />
        </Field>
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={() => save(value)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SelectBox({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: (string | [string, string])[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => {
          const [val, label] = Array.isArray(o) ? o : [o, o];
          return <SelectItem key={val} value={val}>{label}</SelectItem>;
        })}
      </SelectContent>
    </Select>
  );
}

// ---------- ABA JORNADA ----------
function JornadaTab() {
  const { value, setValue, save, loading, saving } = useEnterpriseSettings("journey", {
    start_time: "09:00",
    end_time: "18:00",
    break_minutes: 60,
    daily_hours: 8,
    weekly_hours: 40,
    time_bank: false,
    workdays: ["mon","tue","wed","thu","fri"],
  } as any);

  const days: [string, string][] = [
    ["mon","Seg"],["tue","Ter"],["wed","Qua"],["thu","Qui"],["fri","Sex"],["sat","Sáb"],["sun","Dom"],
  ];

  const toggleDay = (d: string) => {
    const set = new Set<string>(value.workdays ?? []);
    if (set.has(d)) set.delete(d); else set.add(d);
    setValue({ ...value, workdays: Array.from(set) });
  };

  if (loading) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <Card>
      <CardHeader><CardTitle>Jornada de Trabalho</CardTitle><CardDescription>Horário padrão, carga horária e dias úteis da empresa.</CardDescription></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Entrada"><Input type="time" value={value.start_time} onChange={(e) => setValue({ ...value, start_time: e.target.value })} /></Field>
        <Field label="Saída"><Input type="time" value={value.end_time} onChange={(e) => setValue({ ...value, end_time: e.target.value })} /></Field>
        <Field label="Intervalo (min)"><Input type="number" min={0} value={value.break_minutes} onChange={(e) => setValue({ ...value, break_minutes: Number(e.target.value) || 0 })} /></Field>
        <Field label="Carga diária (h)"><Input type="number" min={0} step="0.5" value={value.daily_hours} onChange={(e) => setValue({ ...value, daily_hours: Number(e.target.value) || 0 })} /></Field>
        <Field label="Carga semanal (h)"><Input type="number" min={0} step="0.5" value={value.weekly_hours} onChange={(e) => setValue({ ...value, weekly_hours: Number(e.target.value) || 0 })} /></Field>
        <div className="flex items-center justify-between border rounded-md px-3 py-2 md:col-span-1">
          <div>
            <div className="text-sm font-medium">Banco de horas</div>
            <div className="text-xs text-muted-foreground">Permite compensação de horas.</div>
          </div>
          <Switch checked={!!value.time_bank} onCheckedChange={(v) => setValue({ ...value, time_bank: v })} />
        </div>
        <Field label="Dias úteis" className="md:col-span-2">
          <div className="flex flex-wrap gap-2 pt-1">
            {days.map(([k, label]) => {
              const active = (value.workdays ?? []).includes(k);
              return (
                <button key={k} type="button" onClick={() => toggleDay(k)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition ${active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-input hover:bg-accent"}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={() => save(value)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- ABA BRANDING ----------
type BrandingCfg = {
  primary_color: string; secondary_color: string; accent_color: string;
  theme: "light" | "dark" | "auto";
  logo_path?: string | null; logo_white_path?: string | null;
  favicon_path?: string | null; login_image_path?: string | null;
  onboarding_image_path?: string | null; dashboard_image_path?: string | null;
};

function BrandingTab() {
  const { organization } = useAuth();
  const { value, setValue, save, loading, saving } = useEnterpriseSettings<BrandingCfg>("branding", {
    primary_color: "#F88A2B", secondary_color: "#0B0908", accent_color: "#F7F4F2",
    theme: "light",
  });
  const [signed, setSigned] = useState<Record<string, string>>({});

  const orgId = organization?.id;

  useEffect(() => {
    const keys = ["logo_path","logo_white_path","favicon_path","login_image_path","onboarding_image_path","dashboard_image_path"] as const;
    (async () => {
      const map: Record<string, string> = {};
      for (const k of keys) {
        const p = (value as any)[k];
        if (!p) continue;
        const url = await getSignedUrl("org-branding", p);
        if (url) map[k] = url;
      }
      setSigned(map);
    })();
  }, [value.logo_path, value.logo_white_path, value.favicon_path, value.login_image_path, value.onboarding_image_path, value.dashboard_image_path]);

  const uploadFile = async (field: keyof BrandingCfg, file: File) => {
    if (!orgId) return;
    let processed;
    try {
      processed = await validateAndCompressImage(file, {
        maxSide: field === "favicon_path" ? 128 : 1600,
        preferWebp: field !== "favicon_path", // favicon fica no formato original comprimido
      });
    } catch (e: any) {
      return toast.error(e?.message || "Upload inválido.");
    }
    const path = `${orgId}/${String(field)}-${Date.now()}.${processed.ext}`;
    const { error } = await supabase.storage.from("org-branding").upload(path, processed.file, { upsert: true, contentType: processed.mime });
    if (error) return toast.error(error.message);
    invalidateSignedUrl("org-branding", path);
    const next = { ...value, [field]: path } as BrandingCfg;
    setValue(next);
    await save(next);
    toast.success("Imagem enviada.");
  };

  const removeFile = async (field: keyof BrandingCfg) => {
    const p = (value as any)[field];
    if (p) {
      await supabase.storage.from("org-branding").remove([p]);
      invalidateSignedUrl("org-branding", p);
    }
    const next = { ...value, [field]: null } as BrandingCfg;
    setValue(next);
    await save(next);
  };

  const UploadSlot = ({ field, label }: { field: keyof BrandingCfg; label: string }) => {
    const preview = signed[String(field)];
    return (
      <div className="border rounded-md p-3 space-y-2">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="h-24 rounded bg-muted/40 flex items-center justify-center overflow-hidden">
          {preview
            ? <img src={preview} alt={label} className="h-full object-contain" />
            : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
        </div>
        <div className="flex gap-2">
          <label className="inline-flex items-center gap-1 cursor-pointer text-xs px-2 py-1 rounded border hover:bg-accent">
            <Upload className="h-3 w-3" /> Enviar
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadFile(field, f); }} />
          </label>
          {(value as any)[field] && (
            <button type="button" onClick={() => void removeFile(field)}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50">
              <Trash2 className="h-3 w-3" /> Remover
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Identidade Visual</CardTitle><CardDescription>Logos, favicon e imagens da marca (bucket privado).</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UploadSlot field="logo_path" label="Logo principal" />
          <UploadSlot field="logo_white_path" label="Logo branca" />
          <UploadSlot field="favicon_path" label="FavIcon" />
          <UploadSlot field="login_image_path" label="Imagem de login" />
          <UploadSlot field="onboarding_image_path" label="Imagem onboarding" />
          <UploadSlot field="dashboard_image_path" label="Imagem dashboard" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Cores e Tema</CardTitle><CardDescription>Aplicadas às telas do portal da empresa.</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Cor primária">
            <div className="flex gap-2 items-center">
              <input type="color" value={value.primary_color} onChange={(e) => setValue({ ...value, primary_color: e.target.value })} className="h-9 w-12 rounded border" />
              <Input value={value.primary_color} onChange={(e) => setValue({ ...value, primary_color: e.target.value })} />
            </div>
          </Field>
          <Field label="Cor secundária">
            <div className="flex gap-2 items-center">
              <input type="color" value={value.secondary_color} onChange={(e) => setValue({ ...value, secondary_color: e.target.value })} className="h-9 w-12 rounded border" />
              <Input value={value.secondary_color} onChange={(e) => setValue({ ...value, secondary_color: e.target.value })} />
            </div>
          </Field>
          <Field label="Cor de destaque">
            <div className="flex gap-2 items-center">
              <input type="color" value={value.accent_color} onChange={(e) => setValue({ ...value, accent_color: e.target.value })} className="h-9 w-12 rounded border" />
              <Input value={value.accent_color} onChange={(e) => setValue({ ...value, accent_color: e.target.value })} />
            </div>
          </Field>
          <Field label="Tema">
            <SelectBox value={value.theme} onChange={(v) => setValue({ ...value, theme: v as any })}
              options={[["light","Claro"],["dark","Escuro"],["auto","Automático"]]} />
          </Field>
          <div className="md:col-span-2">
            <div className="text-xs uppercase text-muted-foreground mb-2">Preview</div>
            <div className="flex gap-2">
              <div className="h-14 w-14 rounded-md" style={{ background: value.primary_color }} />
              <div className="h-14 w-14 rounded-md" style={{ background: value.secondary_color }} />
              <div className="h-14 w-14 rounded-md border" style={{ background: value.accent_color }} />
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={() => save(value)} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando…" : "Salvar cores"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- ABA CALENDÁRIO ----------
type Holiday = { id: string; date: string; name: string; type: "national" | "state" | "city" | "internal" | "vacation" | "event" };

function CalendarioTab() {
  const { value, setValue, save, loading, saving } = useEnterpriseSettings<{ items: Holiday[] }>("calendar_holidays", { items: [] });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const items = value.items ?? [];

  const openNew = () => { setEditing({ id: crypto.randomUUID(), date: new Date().toISOString().slice(0,10), name: "", type: "internal" }); setOpen(true); };
  const openEdit = (h: Holiday) => { setEditing({ ...h }); setOpen(true); };

  const commit = async (next: Holiday[]) => {
    const nv = { items: next };
    setValue(nv);
    await save(nv);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.date) return toast.error("Nome e data são obrigatórios.");
    const exists = items.some((i) => i.id === editing.id);
    const next = exists ? items.map((i) => i.id === editing.id ? editing : i) : [...items, editing];
    await commit(next);
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    await commit(items.filter((i) => i.id !== id));
  };

  const marked = useMemo(() => items.map((i) => new Date(i.date + "T00:00:00")), [items]);

  if (loading) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
      <Card>
        <CardHeader><CardTitle>Datas</CardTitle></CardHeader>
        <CardContent>
          <Calendar mode="single" selected={selected} onSelect={setSelected}
            modifiers={{ event: marked }}
            modifiersClassNames={{ event: "bg-primary/20 text-primary font-semibold" }}
            className="pointer-events-auto" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div><CardTitle>Feriados e eventos</CardTitle><CardDescription>{items.length} registro(s)</CardDescription></div>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Novo</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 && <div className="text-sm text-muted-foreground">Nenhum registro.</div>}
          {items.sort((a,b) => a.date.localeCompare(b.date)).map((h) => (
            <div key={h.id} className="flex items-center justify-between border rounded-md px-3 py-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{h.date}</Badge>
                <div>
                  <div className="text-sm font-medium">{h.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{h.type}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(h)}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(h.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing && items.some(i => i.id === editing.id) ? "Editar data" : "Nova data"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="Nome"><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Data"><Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></Field>
              <Field label="Tipo">
                <SelectBox value={editing.type} onChange={(v) => setEditing({ ...editing, type: v as any })}
                  options={[["national","Feriado nacional"],["state","Feriado estadual"],["city","Feriado municipal"],["internal","Data interna"],["vacation","Férias coletivas"],["event","Evento interno"]]} />
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- ABA NOTIFICAÇÕES ----------
const NOTIF_CHANNELS = [["email","E-mail"],["in_app","In-App"]] as const;
const NOTIF_EVENTS: [string, string][] = [
  ["weekly_summary","Resumo semanal"],
  ["monthly_summary","Resumo mensal"],
  ["critical_alerts","Alertas críticos"],
  ["insights","Insights"],
  ["action_plans","Planos de Ação"],
  ["rituals","Rituais"],
  ["pulse","Pulse"],
  ["checkin","Check-in"],
  ["birthdays","Aniversários"],
  ["new_content","Novos conteúdos"],
];

function NotificacoesTab() {
  const { value, setValue, save, loading, saving } = useEnterpriseSettings<Record<string, Record<string, boolean>>>(
    "notifications",
    Object.fromEntries(NOTIF_EVENTS.map(([k]) => [k, { email: true, in_app: true }]))
  );

  const toggle = (ev: string, ch: string, v: boolean) => {
    setValue({ ...value, [ev]: { ...(value[ev] ?? {}), [ch]: v } });
  };

  if (loading) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <Card>
      <CardHeader><CardTitle>Notificações</CardTitle><CardDescription>Escolha quais eventos disparam alertas em cada canal.</CardDescription></CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto_auto] gap-y-2 items-center text-sm">
          <div className="text-xs uppercase text-muted-foreground">Evento</div>
          {NOTIF_CHANNELS.map(([k, l]) => <div key={k} className="text-xs uppercase text-muted-foreground px-3 text-center">{l}</div>)}
          {NOTIF_EVENTS.map(([ev, label]) => (
            <FragmentRow key={ev} label={label}>
              {NOTIF_CHANNELS.map(([ch]) => (
                <div key={ch} className="px-3 flex justify-center">
                  <Switch checked={!!value[ev]?.[ch]} onCheckedChange={(v) => toggle(ev, ch, v)} />
                </div>
              ))}
            </FragmentRow>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => save(value)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const FragmentRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <>
    <div className="py-2 border-t">{label}</div>
    {Array.isArray(children) ? children.map((c, i) => <div key={i} className="py-2 border-t">{c}</div>) : <div className="py-2 border-t">{children}</div>}
  </>
);

// ---------- PAGE ----------
// ---------- ABA IA ----------
// ---------- ABA USUÁRIOS ----------
function UsuariosTab() {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários e Acessos</CardTitle>
        <CardDescription>Gestão de administradores, convites e perfis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate("/enterprise/rh")}>
            <Users className="h-4 w-4 mr-2" /> Central de Acesso RH
          </Button>
          <Button variant="outline" onClick={() => navigate("/enterprise/rh/administradores")}>
            <ShieldCheck className="h-4 w-4 mr-2" /> Múltiplos administradores
          </Button>
          <Button variant="outline" onClick={() => navigate("/enterprise/rh/convites")}>
            <Bell className="h-4 w-4 mr-2" /> Convites
          </Button>
          <Button variant="outline" onClick={() => navigate("/enterprise/rh/times")}>
            <Users className="h-4 w-4 mr-2" /> Times e departamentos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type AiCfg = {
  participates: boolean;
  allow_recommendations: boolean; allow_insights: boolean; allow_dna: boolean;
  allow_council: boolean; allow_rituals: boolean; allow_plans: boolean; allow_score: boolean;
  temperature: number; model: string; language: string; tone: string;
};
function IaTab() {
  const { value, setValue, save, loading, saving } = useEnterpriseSettings<AiCfg>("ai_settings", {
    participates: true, allow_recommendations: true, allow_insights: true, allow_dna: true,
    allow_council: true, allow_rituals: true, allow_plans: true, allow_score: true,
    temperature: 0.7, model: "google/gemini-3-flash-preview", language: "pt-BR", tone: "consultivo",
  });
  const toggles: [keyof AiCfg, string][] = [
    ["participates","Empresa participa da IA"],
    ["allow_recommendations","Permitir recomendações"],
    ["allow_insights","Permitir Insights"],
    ["allow_dna","Permitir DNA"],
    ["allow_council","Permitir Conselho"],
    ["allow_rituals","Permitir Rituais"],
    ["allow_plans","Permitir Planos"],
    ["allow_score","Permitir Score"],
  ];
  if (loading) return <div className="text-sm text-muted-foreground">Carregando…</div>;
  return (
    <Card>
      <CardHeader><CardTitle>Configurações de IA</CardTitle><CardDescription>Participação da empresa na inteligência da plataforma.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {toggles.map(([k, l]) => (
            <div key={String(k)} className="flex items-center justify-between border rounded-md px-3 py-2">
              <span className="text-sm">{l}</span>
              <Switch checked={!!(value as any)[k]} onCheckedChange={(v) => setValue({ ...value, [k]: v } as AiCfg)} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Field label="Temperatura padrão">
            <Input type="number" min={0} max={2} step="0.1" value={value.temperature}
              onChange={(e) => setValue({ ...value, temperature: Number(e.target.value) || 0 })} />
          </Field>
          <Field label="Modelo padrão">
            <SelectBox value={value.model} onChange={(v) => setValue({ ...value, model: v })}
              options={["google/gemini-3-flash-preview","google/gemini-2.5-pro","openai/gpt-5","openai/gpt-5-mini"]} />
          </Field>
          <Field label="Idioma da IA">
            <SelectBox value={value.language} onChange={(v) => setValue({ ...value, language: v })}
              options={[["pt-BR","Português (Brasil)"],["en-US","English (US)"],["es-ES","Español"]]} />
          </Field>
          <Field label="Tom da IA">
            <SelectBox value={value.tone} onChange={(v) => setValue({ ...value, tone: v })}
              options={[["executivo","Executivo"],["inspirador","Inspirador"],["objetivo","Objetivo"],["consultivo","Consultivo"],["criativo","Criativo"]]} />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => save(value)} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving?"Salvando…":"Salvar"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- ABA INTEGRAÇÕES ----------
function IntegracoesTab() {
  const providers = [
    { key: "google_workspace", label: "Google Workspace" },
    { key: "microsoft_365", label: "Microsoft 365" },
    { key: "slack", label: "Slack" },
    { key: "teams", label: "Microsoft Teams" },
    { key: "zoom", label: "Zoom" },
    { key: "meet", label: "Google Meet" },
    { key: "webhook", label: "Webhook" },
    { key: "api", label: "API" },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>Integrações</CardTitle><CardDescription>Estrutura preparada. As conexões serão liberadas em breve.</CardDescription></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {providers.map((p) => (
          <div key={p.key} className="flex items-center justify-between border rounded-md px-3 py-3">
            <div className="flex items-center gap-3"><Plug className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">{p.label}</span></div>
            <div className="flex items-center gap-2"><Badge variant="outline">Não conectado</Badge><Button size="sm" variant="outline" disabled>Conectar</Button></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- ABA SEGURANÇA ----------
type SecCfg = {
  session_ttl_hours: number; min_password_length: number;
  require_mfa: boolean; allow_google: boolean; allow_microsoft: boolean;
};
function SegurancaTab() {
  const { value, setValue, save, loading, saving } = useEnterpriseSettings<SecCfg>("security", {
    session_ttl_hours: 12, min_password_length: 10,
    require_mfa: false, allow_google: true, allow_microsoft: false,
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setSessionsLoading(true);
      const { data } = await supabase.rpc("list_my_sessions");
      setSessions(data ?? []);
      setSessionsLoading(false);
    })();
  }, []);
  if (loading) return <div className="text-sm text-muted-foreground">Carregando…</div>;
  return (
    <div className="space-y-4">
    <Card>
      <CardHeader><CardTitle>Segurança</CardTitle><CardDescription>Políticas aplicadas ao acesso da empresa.</CardDescription></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Sessão expira em (horas)">
          <Input type="number" min={1} value={value.session_ttl_hours}
            onChange={(e) => setValue({ ...value, session_ttl_hours: Number(e.target.value) || 1 })} />
        </Field>
        <Field label="Senha mínima (caracteres)">
          <Input type="number" min={6} value={value.min_password_length}
            onChange={(e) => setValue({ ...value, min_password_length: Number(e.target.value) || 6 })} />
        </Field>
        <ToggleRow label="Obrigar MFA" checked={value.require_mfa} onChange={(v) => setValue({ ...value, require_mfa: v })} />
        <ToggleRow label="Permitir login Google" checked={value.allow_google} onChange={(v) => setValue({ ...value, allow_google: v })} />
        <ToggleRow label="Permitir login Microsoft" checked={value.allow_microsoft} onChange={(v) => setValue({ ...value, allow_microsoft: v })} />
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={() => save(value)} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving?"Salvando…":"Salvar"}</Button>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Sessões ativas</CardTitle><CardDescription>Dispositivos com sessão ativa da sua conta.</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {sessionsLoading ? <div className="text-sm text-muted-foreground">Carregando…</div> :
         sessions.length === 0 ? <div className="text-sm text-muted-foreground">Nenhuma sessão.</div> :
         sessions.map((s) => (
           <div key={s.id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
             <div className="min-w-0">
               <div className="truncate max-w-[420px]">{s.user_agent || "Dispositivo desconhecido"}</div>
               <div className="text-xs text-muted-foreground">
                 IP {s.ip ?? "—"} · Último acesso {s.updated_at ? new Date(s.updated_at).toLocaleString() : "—"}
               </div>
             </div>
             {s.is_current && <Badge variant="secondary">Atual</Badge>}
           </div>
         ))
        }
      </CardContent>
    </Card>
    </div>
  );
}
const ToggleRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between border rounded-md px-3 py-2">
    <span className="text-sm">{label}</span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

// ---------- ABA AUDITORIA ----------
function AuditoriaTab() {
  const { organization } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState<string>("all");

  useEffect(() => {
    if (!organization?.id) return;
    (async () => {
      setLoading(true);
      const query = supabase.from("organization_audit_logs")
        .select("id,created_at,actor_user_id,action,entity_type,metadata,before_data,after_data")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false })
        .limit(200);
      const { data } = await query;
      setRows(data ?? []);
      setLoading(false);
    })();
  }, [organization?.id]);

  const filtered = rows.filter((r) => {
    if (entity !== "all" && r.entity_type !== entity) return false;
    if (q && !JSON.stringify(r).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const exportCsv = () => {
    const header = ["data","ator","acao","entidade","metadata"];
    const lines = [header.join(",")].concat(filtered.map((r) => [
      new Date(r.created_at).toISOString(),
      r.actor_user_id ?? "",
      r.action,
      r.entity_type,
      JSON.stringify(r.metadata ?? {}).replace(/,/g, ";"),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `auditoria-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const entities = Array.from(new Set(rows.map((r) => r.entity_type))).sort();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <div><CardTitle>Auditoria</CardTitle><CardDescription>{filtered.length} de {rows.length} registro(s)</CardDescription></div>
        <Button size="sm" variant="outline" onClick={exportCsv}>Exportar CSV</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <Input placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} className="md:max-w-xs" />
          <div className="md:w-56">
            <SelectBox value={entity} onChange={setEntity}
              options={[["all","Todas as entidades"], ...entities.map((e) => [e, e] as [string,string])]} />
          </div>
        </div>
        {loading ? <div className="text-sm text-muted-foreground">Carregando…</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground text-left">
                <tr><th className="py-2">Quando</th><th>Ator</th><th>Ação</th><th>Entidade</th><th>Metadata</th></tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="whitespace-nowrap text-xs text-muted-foreground">{(r.actor_user_id ?? "").slice(0,8) || "—"}</td>
                    <td>{r.action}</td>
                    <td>{r.entity_type}</td>
                    <td className="text-xs text-muted-foreground max-w-md truncate">{JSON.stringify(r.metadata ?? {})}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">Sem registros.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EnterpriseSettingsScreen() {
  const { hasAnyRole, loading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const initial = (search.get("tab") as TabKey) || "empresa";
  const [tab, setTab] = useState<TabKey>(initial);

  useEffect(() => {
    setSearch((prev) => { const p = new URLSearchParams(prev); p.set("tab", tab); return p; }, { replace: true });
  }, [tab, setSearch]);

  useEffect(() => {
    if (!loading && !hasAnyRole(["owner", "rh_admin"])) navigate("/enterprise/rh", { replace: true });
  }, [loading, hasAnyRole, navigate]);

  const active = useMemo(() => TABS.find((t) => t.key === tab)!, [tab]);

  return (
    <EnterpriseRHLayout title="Configurações da Empresa">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <aside className="space-y-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === tab;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"
                }`}>
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </aside>
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <active.icon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{active.label}</h2>
          </div>
          {tab === "empresa"        && <EmpresaTab />}
          {tab === "licenca"        && <LicencaTab />}
          {tab === "regionalizacao" && <RegionalizacaoTab />}
          {tab === "jornada"        && <JornadaTab />}
          {tab === "branding"       && <BrandingTab />}
          {tab === "usuarios"       && <UsuariosTab />}
          {tab === "calendario"     && <CalendarioTab />}
          {tab === "notificacoes"   && <NotificacoesTab />}
          {tab === "ia"             && <IaTab />}
          {tab === "integracoes"    && <IntegracoesTab />}
          {tab === "seguranca"      && <SegurancaTab />}
          {tab === "auditoria"      && <AuditoriaTab />}
        </section>
      </div>
    </EnterpriseRHLayout>
  );
}