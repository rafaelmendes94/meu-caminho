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
import { toast } from "sonner";
import {
  Building2, Palette, Users, KeyRound, Globe, Clock, CalendarDays, Plug, Bell,
  ShieldCheck, Sparkles, ScrollText, Save, ArrowUpRight, Construction,
} from "lucide-react";

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
  const [form, setForm] = useState({
    name: "", legal_name: "", cnpj: "", segment: "", employee_count: 0,
    website: "", email: "", phone: "", address: "", city: "", state: "",
    country: "", postal_code: "", description: "",
  });

  useEffect(() => {
    if (!organization?.id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("organizations").select(
        "name,legal_name,cnpj,segment,employee_count,website,email,phone,address,city,state,country,postal_code,description"
      ).eq("id", organization.id).maybeSingle();
      if (data) setForm({
        name: data.name ?? "", legal_name: data.legal_name ?? "",
        cnpj: data.cnpj ?? "", segment: data.segment ?? "",
        employee_count: data.employee_count ?? 0, website: data.website ?? "",
        email: data.email ?? "", phone: data.phone ?? "",
        address: data.address ?? "", city: data.city ?? "",
        state: data.state ?? "", country: data.country ?? "Brasil",
        postal_code: data.postal_code ?? "", description: data.description ?? "",
      });
      setLoading(false);
    })();
  }, [organization?.id]);

  const handleSave = async () => {
    if (!organization?.id) return;
    if (form.cnpj && !isValidCnpj(form.cnpj)) return toast.error("CNPJ inválido.");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("E-mail inválido.");
    setSaving(true);
    const { error } = await supabase.from("organizations").update({
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
        <Field label="Nome fantasia"><Input value={form.name} readOnly /></Field>
        <Field label="Razão social"><Input value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} /></Field>
        <Field label="CNPJ"><Input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" /></Field>
        <Field label="Segmento"><Input value={form.segment} onChange={(e) => set("segment", e.target.value)} /></Field>
        <Field label="Nº de colaboradores">
          <Input type="number" min={0} value={form.employee_count}
                 onChange={(e) => set("employee_count", Number(e.target.value) || 0)} />
        </Field>
        <Field label="Site"><Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></Field>
        <Field label="E-mail institucional"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="Telefone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Endereço" className="md:col-span-2"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="Cidade"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Estado"><Input value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
        <Field label="País"><Input value={form.country} onChange={(e) => set("country", e.target.value)} /></Field>
        <Field label="CEP"><Input value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} /></Field>
        <Field label="Descrição" className="md:col-span-2">
          <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <div className="md:col-span-2 flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => window.location.reload()}>Cancelar</Button>
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
    })();
  }, [organization?.id]);

  const available = Math.max(0, (row?.licenses_total ?? 0) - (row?.licenses_used ?? 0));

  const openSupportTicket = async () => {
    if (!organization?.id) return;
    const { error } = await supabase.from("support_tickets").insert({
      organization_id: organization.id,
      subject: "Solicitação de upgrade de plano",
      description: `Solicitamos avaliação para upgrade do plano atual (${row?.plan ?? "n/d"}).`,
      priority: "high",
      status: "open",
      category: "billing",
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
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Consumo e Recursos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Row label="Limite mensal de IA" value={plan?.ai_monthly_limit ?? "—"} />
          <Row label="Storage (MB)" value={plan?.storage_limit_mb ?? "—"} />
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

// ---------- PAGE ----------
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
          {tab === "branding"       && <ComingSoon label="Branding" />}
          {tab === "usuarios"       && <ComingSoon label="Usuários" />}
          {tab === "calendario"     && <ComingSoon label="Calendário" />}
          {tab === "notificacoes"   && <ComingSoon label="Notificações" />}
          {tab === "ia"             && <ComingSoon label="IA" />}
          {tab === "integracoes"    && <ComingSoon label="Integrações" />}
          {tab === "seguranca"      && <ComingSoon label="Segurança" />}
          {tab === "auditoria"      && <ComingSoon label="Auditoria" />}
        </section>
      </div>
    </EnterpriseRHLayout>
  );
}