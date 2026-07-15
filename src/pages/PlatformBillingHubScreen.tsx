import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlatformAdminLayout } from "@/components/layouts/PlatformAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, DollarSign, Users, TrendingUp, Wallet, Percent, Package, Webhook } from "lucide-react";

/**
 * Fase 27 — Billing & Subscriptions (Super Admin).
 * Arquitetura pronta, sem integração real com Stripe/Mercado Pago.
 * Todas as leituras/escritas são via BillingProvider ("manual").
 */

type Row = Record<string, any>;
const from = (t: string) => (supabase.from as any)(t);
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function KPI({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </Card>
  );
}

/* ============ Dashboard ============ */
function DashboardTab() {
  const [m, setM] = useState({ mrr: 0, arr: 0, active: 0, trial: 0, canceled: 0, invoices: 0, licenses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [subs, invCount, orgs] = await Promise.all([
        from("billing_subscriptions").select("status,mrr_cents,amount_cents"),
        from("billing_invoices").select("id", { count: "exact", head: true }),
        from("organizations").select("licenses_total"),
      ]);
      const rows: any[] = subs.data ?? [];
      const mrr = rows.reduce((s, r) => s + (r.mrr_cents ?? 0), 0);
      const active = rows.filter((r) => r.status === "active").length;
      const trial = rows.filter((r) => r.status === "trialing").length;
      const canceled = rows.filter((r) => r.status === "canceled").length;
      const licenses = (orgs.data ?? []).reduce((s: number, r: any) => s + (r.licenses_total ?? 0), 0);
      setM({ mrr, arr: mrr * 12, active, trial, canceled, invoices: invCount.count ?? 0, licenses });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="MRR" value={brl(m.mrr)} icon={DollarSign} />
      <KPI label="ARR (projeção)" value={brl(m.arr)} icon={TrendingUp} />
      <KPI label="Assinaturas ativas" value={m.active} icon={Wallet} />
      <KPI label="Trials" value={m.trial} icon={Users} />
      <KPI label="Canceladas" value={m.canceled} icon={Users} />
      <KPI label="Faturas emitidas" value={m.invoices} icon={Wallet} />
      <KPI label="Licenças contratadas" value={m.licenses} icon={Users} />
      <KPI label="Gateways ativos" value="0 (manual)" icon={Package} />
    </div>
  );
}

/* ============ Generic CRUD ============ */
function useTable(table: string) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    const { data, error } = await from(table).select("*").order("created_at", { ascending: false }).limit(500);
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, [table]);
  return { rows, loading, reload };
}

function Crud({ table, title, defaults, columns }: {
  table: string; title: string; defaults: Row;
  columns: { key: string; label: string; type?: "text" | "number" }[];
}) {
  const { rows, loading, reload } = useTable(table);
  const [draft, setDraft] = useState<Row>(defaults);
  const save = async () => {
    const { error } = await from(table).insert(draft);
    if (error) return toast.error(error.message);
    toast.success("Criado");
    setDraft(defaults);
    reload();
  };
  const del = async (id: string) => {
    if (!confirm("Remover?")) return;
    const { error } = await from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Novo {title.toLowerCase()}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {columns.map((c) => (
            <div key={c.key}>
              <Label className="text-xs">{c.label}</Label>
              <Input
                type={c.type ?? "text"}
                value={draft[c.key] ?? ""}
                onChange={(e) => setDraft({ ...draft, [c.key]: c.type === "number" ? Number(e.target.value || 0) : e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={save}><Plus className="h-4 w-4 mr-1" />Criar</Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-3 border-b text-sm font-medium">{title} ({rows.length})</div>
        {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
          : rows.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">Nenhum registro.</div>
          : <div className="divide-y">
              {rows.map((r) => (
                <div key={r.id} className="p-3 flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.name ?? r.code ?? r.number ?? r.id}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {columns.slice(1, 4).map((c) => `${c.label}: ${String(r[c.key] ?? "—")}`).join(" · ")}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>}
      </Card>
    </div>
  );
}

/* ============ Subscriptions view ============ */
function SubscriptionsTab() {
  const { rows, loading } = useTable("billing_subscriptions");
  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-3 border-b text-sm font-medium">Assinaturas ({rows.length})</div>
      {rows.length === 0 ? <div className="p-6 text-sm text-muted-foreground text-center">Sem assinaturas ainda.</div>
      : <div className="divide-y text-sm">
          {rows.map((r) => (
            <div key={r.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.organization_id?.slice(0, 8)}… · {r.status}</div>
                <div className="text-xs text-muted-foreground">{r.billing_cycle} · {brl(r.amount_cents ?? 0)} · gateway {r.gateway}</div>
              </div>
              <div className="text-xs text-muted-foreground">{r.current_period_end ? new Date(r.current_period_end).toLocaleDateString() : "—"}</div>
            </div>
          ))}
        </div>}
    </Card>
  );
}

/* ============ Gateways ============ */
const GATEWAYS = ["stripe", "mercado_pago", "pagarme", "asaas", "manual"] as const;
function GatewaysTab() {
  const { rows, reload } = useTable("billing_gateway_configs");
  const upsert = async (gateway: string, enabled: boolean) => {
    const { error } = await from("billing_gateway_configs")
      .upsert({ gateway, enabled, mode: "sandbox" }, { onConflict: "gateway" });
    if (error) return toast.error(error.message);
    reload();
  };
  const byId: Record<string, any> = Object.fromEntries((rows ?? []).map((r) => [r.gateway, r]));
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium"><Webhook className="h-4 w-4" /> Configuração de gateways</div>
      <p className="text-xs text-muted-foreground">
        Arquitetura preparada. Nenhum gateway ativo por enquanto — o adapter em uso é <code>manual</code>.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {GATEWAYS.map((g) => {
          const cfg = byId[g];
          return (
            <div key={g} className="flex items-center justify-between border rounded-md p-3 text-sm">
              <div>
                <div className="font-medium capitalize">{g.replace("_", " ")}</div>
                <div className="text-xs text-muted-foreground">{cfg?.enabled ? `ativo · ${cfg.mode}` : "desativado"}</div>
              </div>
              <Button size="sm" variant={cfg?.enabled ? "outline" : "default"} onClick={() => upsert(g, !cfg?.enabled)}>
                {cfg?.enabled ? "Desativar" : "Ativar (sandbox)"}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ============ Page ============ */
export default function PlatformBillingHubScreen() {
  return (
    <PlatformAdminLayout>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Billing & Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Arquitetura pronta para Stripe, Mercado Pago, Pagar.me e Asaas — nenhum gateway integrado.
        </p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="inline-flex h-auto w-max gap-1 overflow-x-auto scrollbar-none max-w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="coupons">Cupons</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4"><DashboardTab /></TabsContent>
        <TabsContent value="subscriptions" className="mt-4"><SubscriptionsTab /></TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Crud
            table="billing_invoices" title="Faturas"
            defaults={{ number: `INV-${Date.now()}`, organization_id: "", amount_cents: 0, status: "draft", gateway: "manual", currency: "BRL" }}
            columns={[
              { key: "number", label: "Número" },
              { key: "organization_id", label: "Empresa (UUID)" },
              { key: "amount_cents", label: "Valor (centavos)", type: "number" },
              { key: "status", label: "Status" },
              { key: "due_date", label: "Vencimento (YYYY-MM-DD)" },
            ]}
          />
        </TabsContent>

        <TabsContent value="coupons" className="mt-4">
          <Crud
            table="billing_coupons" title="Cupons"
            defaults={{ code: "", discount_type: "percentage", value: 10, active: true }}
            columns={[
              { key: "code", label: "Código" },
              { key: "discount_type", label: "Tipo (percentage/amount/trial/licenses)" },
              { key: "value", label: "Valor", type: "number" },
              { key: "max_redemptions", label: "Máx. resgates", type: "number" },
              { key: "expires_at", label: "Expira (ISO)" },
            ]}
          />
        </TabsContent>

        <TabsContent value="addons" className="mt-4">
          <Crud
            table="billing_addons" title="Add-ons"
            defaults={{ code: "", name: "", category: "ai", price_cents: 0, currency: "BRL", unit: "pack", active: true }}
            columns={[
              { key: "code", label: "Código" },
              { key: "name", label: "Nome" },
              { key: "category", label: "Categoria (ai/storage/users/consulting/training)" },
              { key: "price_cents", label: "Preço (centavos)", type: "number" },
              { key: "unit", label: "Unidade" },
            ]}
          />
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card className="p-4 text-sm space-y-2">
            <div className="font-medium flex items-center gap-2"><Percent className="h-4 w-4" /> Alertas de consumo</div>
            <p className="text-muted-foreground">
              Estrutura pronta em <code>billing_usage_alerts</code>. Ao atingir 80%, 90% ou 100% de um limite
              (licenças, tokens IA, storage, edge invocations), o job cria um alerta — nunca bloqueia.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card className="p-4 text-sm space-y-2">
            <div className="font-medium flex items-center gap-2"><Webhook className="h-4 w-4" /> Webhooks</div>
            <p className="text-muted-foreground">
              Inbox <code>billing_webhook_events</code> pronto para receber <em>subscription.created</em>,{" "}
              <em>subscription.updated</em>, <em>subscription.deleted</em>, <em>invoice.paid</em>,{" "}
              <em>invoice.failed</em>, <em>trial.ending</em>, <em>customer.updated</em>. A edge function
              <code className="ml-1">billing-webhook</code> será criada quando um gateway for plugado.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="gateways" className="mt-4"><GatewaysTab /></TabsContent>
      </Tabs>
    </PlatformAdminLayout>
  );
}