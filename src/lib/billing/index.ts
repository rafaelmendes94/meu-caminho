import type { BillingProvider, BillingGateway } from "./types";
import { manualProvider } from "./manualAdapter";

/**
 * Fábrica única. Ao plugar Stripe/Mercado Pago/etc, adicionar aqui
 * um novo `case` retornando o adapter correspondente.
 * Nenhuma tela ou serviço deve importar Stripe diretamente.
 */
export function getBillingProvider(gateway: BillingGateway = "manual"): BillingProvider {
  switch (gateway) {
    case "manual":
      return manualProvider;
    // case "stripe": return stripeProvider;
    // case "mercado_pago": return mercadoPagoProvider;
    // case "pagarme": return pagarmeProvider;
    // case "asaas": return asaasProvider;
    default:
      return manualProvider;
  }
}

export * from "./types";