# QA Bloco 34 — Enterprise Checkout (Planos/Dados/Pagamento/Sucesso)

## Escopo
Remoção de preços fake e branding "Cury" nas telas de checkout Enterprise.

## Telas revisadas
1. **EnterpriseCheckoutPlanScreen** — neutralizado:
   - Preços fake `"a partir de R$ 19 / colaborador"` e `"a partir de R$ 29 / colaborador"` → `"Sob consulta"`.
   - Feature `"Cury Digital"` → `"IA de apoio emocional"`.
   - Linha comparativa `"Cury Digital (IA)"` → `"IA de apoio emocional"`.
2. **EnterpriseCheckoutCompanyDataScreen** — placeholder `"Ex: Augusto Cury Institucional"` → `"Ex: Nome da sua empresa"`.
3. **EnterpriseCheckoutPaymentScreen** — neutralizado:
   - Valor `"R$ 7.250"` (mensal + total) → `"Sob consulta"` em ambos os pontos.
   - Feature incluída `"Cury Digital Enterprise"` → `"IA de apoio emocional"`.
4. **EnterpriseCheckoutSuccessScreen** — sem mocks; layout de confirmação apenas.

## Alterações
- `src/pages/EnterpriseCheckoutPlanScreen.tsx`
- `src/pages/EnterpriseCheckoutCompanyDataScreen.tsx`
- `src/pages/EnterpriseCheckoutPaymentScreen.tsx`

## Pendências (Features)
- **FEATURE-B34-01**: Todos os checkouts — carregar `plans` reais de `platform_plans` (nome, preço, features, limites) por organização/segmento.
- **FEATURE-B34-02**: `EnterpriseCheckoutPaymentScreen` — calcular resumo (valor mensal, total, colaboradores) a partir do plano selecionado + tamanho da empresa.
- **FEATURE-B34-03**: `EnterpriseCheckoutPaymentScreen` — integrar gateway real (Stripe/Paddle) e criar `organization_contracts` ao finalizar.
- **FEATURE-B34-04**: `EnterpriseCheckoutCompanyDataScreen` — persistir dados fiscais em `organizations` (CNPJ, razão social, endereço) com validação de CNPJ.
- **FEATURE-B34-05**: `EnterpriseCheckoutSuccessScreen` — enviar email transacional de boas-vindas + provisionar convite do primeiro admin.

## Status
Bloco 34 concluído. Pronto para o **Bloco 35**.