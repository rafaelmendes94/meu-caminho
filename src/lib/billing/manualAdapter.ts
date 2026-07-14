import { supabase } from "@/integrations/supabase/client";
import type {
  BillingProvider, CouponAdapter, GatewayAdapter,
  InvoiceAdapter, SubscriptionAdapter,
  SubscriptionDTO, InvoiceDTO, CouponDTO,
} from "./types";

/**
 * Adapter "manual" — persiste tudo em billing_* sem chamar gateway externo.
 * Serve como implementação padrão até que Stripe/Mercado Pago/etc sejam plugados.
 */

const from = (t: string) => (supabase.from as any)(t);

const subscriptions: SubscriptionAdapter = {
  async create(input) {
    const { data, error } = await from("billing_subscriptions").insert({ ...input, gateway: "manual" }).select().single();
    if (error) throw error;
    return data as SubscriptionDTO;
  },
  async update(id, patch) {
    const { data, error } = await from("billing_subscriptions").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return data as SubscriptionDTO;
  },
  async cancel(id, opts) {
    const patch = opts?.at_period_end
      ? { cancel_at: new Date().toISOString() }
      : { status: "canceled", canceled_at: new Date().toISOString() };
    return this.update(id, patch as any);
  },
  async get(id) {
    const { data } = await from("billing_subscriptions").select("*").eq("id", id).maybeSingle();
    return (data ?? null) as SubscriptionDTO | null;
  },
};

const invoices: InvoiceAdapter = {
  async create(input) {
    const number = input.number ?? `INV-${Date.now()}`;
    const { data, error } = await from("billing_invoices")
      .insert({ ...input, number, gateway: "manual" }).select().single();
    if (error) throw error;
    return data as InvoiceDTO;
  },
  async markPaid(id, paidAt) {
    const { data, error } = await from("billing_invoices")
      .update({ status: "paid", paid_at: paidAt ?? new Date().toISOString() })
      .eq("id", id).select().single();
    if (error) throw error;
    return data as InvoiceDTO;
  },
  async void(id) {
    const { data, error } = await from("billing_invoices").update({ status: "void" }).eq("id", id).select().single();
    if (error) throw error;
    return data as InvoiceDTO;
  },
  async get(id) {
    const { data } = await from("billing_invoices").select("*").eq("id", id).maybeSingle();
    return (data ?? null) as InvoiceDTO | null;
  },
};

const coupons: CouponAdapter = {
  async validate(code) {
    const { data } = await from("billing_coupons").select("*").eq("code", code).eq("active", true).maybeSingle();
    if (!data) return null;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
    if (data.max_redemptions && data.redemptions_count >= data.max_redemptions) return null;
    return data as CouponDTO;
  },
  async redeem(code, organizationId, subscriptionId) {
    const coupon = await this.validate(code);
    if (!coupon) throw new Error("Cupom inválido");
    await from("billing_coupon_redemptions").insert({
      coupon_id: coupon.id, organization_id: organizationId, subscription_id: subscriptionId,
    });
    await from("billing_coupons").update({ redemptions_count: coupon.redemptions_count + 1 }).eq("id", coupon.id);
  },
};

export const manualGateway: GatewayAdapter = {
  id: "manual",
  subscriptions,
  invoices,
  coupons,
  async handleWebhook(event) {
    await from("billing_webhook_events").insert({
      gateway: "manual",
      event_type: event.type,
      external_id: event.externalId,
      payload: event.payload,
      status: "processed",
      processed_at: new Date().toISOString(),
    });
  },
};

export const manualProvider: BillingProvider = { gateway: manualGateway };