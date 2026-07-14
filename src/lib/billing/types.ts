// Fase 27 — Billing & Subscriptions (adapter layer, sem integração real).

export type BillingGateway = "stripe" | "mercado_pago" | "pagarme" | "asaas" | "manual";

export type SubscriptionStatus =
  | "trialing" | "active" | "past_due" | "suspended" | "canceled" | "expired";

export type InvoiceStatus = "draft" | "open" | "paid" | "failed" | "refunded" | "void";

export interface SubscriptionDTO {
  id: string;
  organization_id: string;
  plan_id: string | null;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "yearly" | "custom";
  currency: string;
  amount_cents: number;
  mrr_cents: number;
  trial_ends_at?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  gateway: BillingGateway;
  external_customer_id?: string | null;
  external_subscription_id?: string | null;
}

export interface InvoiceDTO {
  id: string;
  number: string;
  organization_id: string;
  amount_cents: number;
  currency: string;
  status: InvoiceStatus;
  due_date?: string | null;
  paid_at?: string | null;
  gateway: BillingGateway;
  external_invoice_id?: string | null;
  pdf_url?: string | null;
}

export interface CouponDTO {
  id: string;
  code: string;
  discount_type: "percentage" | "amount" | "trial" | "licenses";
  value: number;
  currency?: string;
  max_redemptions?: number | null;
  redemptions_count: number;
  expires_at?: string | null;
  active: boolean;
}

/**
 * Contratos que qualquer futuro gateway deve implementar. Nenhuma regra
 * de negócio consome Stripe diretamente — sempre usa BillingProvider.
 */
export interface SubscriptionAdapter {
  create(input: Partial<SubscriptionDTO>): Promise<SubscriptionDTO>;
  update(id: string, patch: Partial<SubscriptionDTO>): Promise<SubscriptionDTO>;
  cancel(id: string, opts?: { at_period_end?: boolean }): Promise<SubscriptionDTO>;
  get(id: string): Promise<SubscriptionDTO | null>;
}

export interface InvoiceAdapter {
  create(input: Partial<InvoiceDTO>): Promise<InvoiceDTO>;
  markPaid(id: string, paidAt?: string): Promise<InvoiceDTO>;
  void(id: string): Promise<InvoiceDTO>;
  get(id: string): Promise<InvoiceDTO | null>;
}

export interface CouponAdapter {
  validate(code: string): Promise<CouponDTO | null>;
  redeem(code: string, organizationId: string, subscriptionId?: string): Promise<void>;
}

export interface GatewayAdapter {
  readonly id: BillingGateway;
  subscriptions: SubscriptionAdapter;
  invoices: InvoiceAdapter;
  coupons: CouponAdapter;
  /** Handle inbound webhook payload — persists to billing_webhook_events. */
  handleWebhook(event: { type: string; payload: any; externalId?: string }): Promise<void>;
}

export interface BillingProvider {
  gateway: GatewayAdapter;
}