# AI_ORCHESTRATOR.md — AI Orchestrator™

Camada de inteligência acima das IAs especialistas (Conselho, DNA, Insights,
Planos, Rituais, Recomendação, Impacto, Alertas, Score). Não conversa com o
usuário — trabalha apenas internamente.

## Fluxo
```
question → detectIntent → priorização → cache lookup
       → refresh memória organizacional → fetch memória
       → invocar especialistas em paralelo → consolidar (dedupe)
       → calcular confiança → gravar cache → gravar log → responder
```

## Objetos
- **ai_orchestrator_memory** — memória organizacional (nunca individual) por
  `kind` (dna, insight, plan, alert, ritual, score, council, recommendation,
  impact), com `expires_at` configurável em `tone_config.memory.ttl_days_*`.
- **ai_orchestrator_cache** — cache por `(organization_id, intent_hash)` com
  TTL configurável (`model_config.cache_ttl_seconds`, default 2h), invalidado
  automaticamente por triggers em check-in, pulse, DNA, insight semanal,
  plano e score organizacional.
- **ai_orchestrator_logs** — roteamento, modelo, tokens, custo estimado
  (tabela em `model_config.cost_table`), latência, cache_hit, confiança,
  fallback e erro.

## Roteamento
Configurado em `ai_prompt_configs.tone_config.routing` como lista de intents
com `keywords`, `specialists` e `priority`. A detecção é por contagem de
matches; se nenhum match, cai no `default_specialists`. O Orchestrator sempre
usa apenas os especialistas prioritários (top 3) e só chama fallback quando
necessário.

## Confiança
Fórmula ponderada em `tone_config.confidence.weights`:
`sources`, `consistency`, `data_volume`, `freshness`. Resultado 0–1.

## Consolidação
- Dedupe por prefixo de 200 chars.
- Uma seção por especialista respondido, prefixada com `【key】`.
- Sem resposta útil → `answer = "sem dados suficientes"` + `limitations[]`.

## Contrato da edge function `ai-orchestrator`
POST body:
```json
{
  "question": "Como melhorar o engajamento?",
  "organization_id": "<uuid>",
  "user_id": "<uuid opcional>",
  "force_refresh": false,
  "mode": "run"
}
```
Resposta:
```json
{
  "intent": "engagement",
  "specialists": ["dna","insights"],
  "priority": ["dna","insights"],
  "answer": "【dna】 … \n\n【insights】 …",
  "sections": [{"specialist":"dna","text":"…"}, …],
  "confidence": 0.72,
  "sources": ["dna","insights"],
  "config_version": 1,
  "cache_hit": false
}
```

## Guardrails
- Nunca conversa com o usuário final — a UI usa apenas o `answer`/`sections`.
- Nunca acessa dados individuais de outro colaborador.
- Memória é sempre organizacional; agregações vindas dos especialistas.
- Se todos os especialistas falharem → status `insufficient_data`, cache
  não é gravado.
- Config editável em `/admin/ai/orchestrator` (Sub-fase B).