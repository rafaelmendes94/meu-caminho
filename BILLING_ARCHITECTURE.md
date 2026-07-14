# Billing & Subscriptions™ (Fase 27)

Camada de billing **preparada** para gateway externo. Nenhum pagamento real,
nenhum checkout, nenhuma integração Stripe/Mercado Pago ativa.
Ao plugar um provedor no futuro, basta implementar um novo `GatewayAdapter`.

## Tabelas (Lovable Cloud)

| Tabela | Função |
|---|---|
| `billing_subscriptions` | assinatura por empresa (plano, status, ciclo, MRR, trial, ids externos) |
| `billing_invoices` | faturas (número, valor, moeda, status, vencimento, pagamento, PDF) |
| `billing_coupons` | cupons (percentage/amount/trial/licenses, expiração, uso máximo) |
| `billing_coupon_redemptions` | resgates por empresa |
| `billing_addons` | catálogo (Pacote IA, Storage, Usuários, Consultoria, Treinamento) |
| `billing_org_addons` | add-ons contratados por empresa |
| `billing_license_events` | histórico de +/− licenças (delta, motivo, autor) |
| `billing_consumption_daily` | consumo diário (tokens IA, storage, uploads, downloads, edge invocations, custo estimado) |
| `billing_webhook_events` | inbox de webhooks futuros (subscription.*, invoice.*, trial.ending, customer.updated) |
| `billing_gateway_configs` | configuração por gateway (stripe, mercado_pago, pagarme, asaas, manual) |
| `billing_usage_alerts` | alertas 80/90/100% (nunca bloqueia — apenas avisa) |

## RLS
- Platform Admin → CRUD em tudo.
- Empresa (RH) → leitura das próprias assinaturas, faturas, licenças, consumo, add-ons e alertas (via `user_in_org`).
- Colaborador → sem acesso.

## Adapter layer (`src/lib/billing/`)

```
BillingProvider
 └─ GatewayAdapter (id, subscriptions, invoices, coupons, handleWebhook)
     ├─ SubscriptionAdapter (create/update/cancel/get)
     ├─ InvoiceAdapter      (create/markPaid/void/get)
     └─ CouponAdapter       (validate/redeem)
```

- `types.ts` — DTOs e contratos (nenhum SDK externo).
- `manualAdapter.ts` — implementação padrão que persiste em `billing_*`.
- `index.ts` — `getBillingProvider(gateway)`: fábrica única. Ao plugar Stripe,
  criar `stripeAdapter.ts` implementando `GatewayAdapter` e adicionar um `case`.

Nenhuma tela, hook ou serviço deve importar Stripe/Mercado Pago diretamente —
sempre via `getBillingProvider()`.

## Super Admin
Rota: `/admin/billing/hub`. Abas: Dashboard (MRR/ARR/ativas/trials/faturas/licenças),
Assinaturas, Faturas, Cupons, Add-ons, Alertas, Webhooks, Gateways.

## Configurações de gateway
`billing_gateway_configs` guarda `enabled`, `mode` (`sandbox`/`live`), `credentials` (JSONB
recebidas via `add_secret` no futuro) e `settings`. Ativação por linha; múltiplos gateways
coexistem para migração gradual.

## Webhooks
Eventos previstos (persistidos em `billing_webhook_events`):
`subscription.created`, `subscription.updated`, `subscription.deleted`,
`invoice.paid`, `invoice.failed`, `trial.ending`, `customer.updated`.
A edge function `billing-webhook` será criada no momento da integração real.

## Alertas de consumo
Job (futuro) percorre `billing_consumption_daily` × limites do plano e cria linhas em
`billing_usage_alerts` quando `current_value / limit_value` cruzar 0.8, 0.9 e 1.0.
Nunca bloqueia — apenas avisa RH e Platform Admin.

## Pendências reais
- Adapters Stripe / Mercado Pago / Pagar.me / Asaas (arquitetura definida, código a implementar).
- Edge function `billing-webhook` para receber eventos e chamar `handleWebhook`.
- Job de agregação de consumo (`billing-consumption-aggregator`).
- Job de emissão de faturas recorrentes (`billing-invoice-generator`).
- Exportação CSV/Excel/PDF (estrutura pronta, sem UI).
- UI de edição inline (hoje: criar/excluir).
