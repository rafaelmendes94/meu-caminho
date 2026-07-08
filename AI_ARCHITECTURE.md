# AI_ARCHITECTURE.md — Enterprise v1.0

## Provider
- **Lovable AI Gateway** (`LOVABLE_API_KEY`).
- Modelos usados:
  - `google/gemini-2.5-pro` — DNA, Conselho Executivo, Insights Semanais, Rituais.
  - `google/gemini-2.5-flash` — Onboarding, Perfil Inteligente, Planos de Ação (respostas rápidas).

## Princípios inegociáveis (aplicados em todos os prompts)
1. **Nunca produzir diagnóstico clínico.**
2. **Nunca identificar pessoas.** Apenas dados agregados; k-anonimato ≥ 5.
3. **LGPD-first.** Sem dados sensíveis individuais.
4. **Tom consultivo executivo**, direto, sem jargão psicológico.
5. **Resposta JSON estruturada** quando a UI depende de campos (DNA, Insights, Rituais, Planos, Impacto).

## Fluxo típico
```
Cliente RH ──► Edge Function ──► RPC agregadora (SECURITY DEFINER, k≥5)
                     │
                     └──► Lovable AI (system prompt + contexto agregado)
                                 │
                                 └──► resposta JSON validada
                                             │
                                             └──► persistida em tabela dedicada
```

## Módulos IA
- **Onboarding IA™** — entrevista adaptativa.
- **Perfil Inteligente** — sumariza traços profissionais.
- **Conselho Executivo IA™** — chat consultivo com contexto organizacional completo (`get_executive_context`).
- **DNA Organizacional™** — relatório trimestral com dimensões, forças, oportunidades.
- **Planos de Ação Inteligentes** — planos executáveis a partir de alertas/sinais/DNA.
- **Insights Semanais IA™** — briefing automático semanal.
- **Rituais Inteligentes™** — práticas coletivas contextuais.
- **Motor de Impacto™** — narrativa do delta de score pós-iniciativa.

## Guard-rails
- Todo prompt inclui: "Se dados forem insuficientes, responder explicitamente 'sem dados suficientes'".
- Toda resposta persistida guarda `confidence` e `evidence` para auditoria.
- Streaming (Conselho Executivo) mantém headers CORS e trata desconexão do cliente.