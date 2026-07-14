# Motor de Recomendação Inteligente™ — AI_RECOMMENDATION_ENGINE

## Visão

A recomendação diária de conteúdo (livro, vídeo, podcast, curso, trilha, exercício, reflexão, ritual, mensagem) é servida por **cache + ranking SQL/JS**, nunca por IA generativa a cada acesso. A IA generativa é usada apenas para:

- ajustar pesos e comportamento (aba **Editar por IA**),
- gerar explicações humanas ("Recomendado porque…"),
- manter o perfil do colaborador.

**Meta de latência:** ≤ 300 ms na leitura (cache HIT).

## Arquitetura

- **`content_items.recommendation_weights` (JSONB):** pesos por item (energia, ansiedade, comunicação, liderança, recuperação, dificuldade, formato, tempo, objetivos, tags).
- **`recommendation_events`:** telemetria (shown, clicked, started, completed, dismissed, favorite, shared) usada para aprendizado.
- **`user_recommendation_cache`:** Top-N pré-calculado por colaborador (com `user_vector`, `expires_at`, `is_stale`, `config_version`).
- **`ai_prompt_configs` key = `recommendation_engine`:** pesos de dimensão, pesos de formato, boosts, penalidades, limites de diversidade, tempo disponível padrão e explicação.
- **`ai_prompt_versions`:** snapshots versionados da config.
- **Edge Function `recommend-content`:** valida cache e recomputa quando necessário.

### Invalidação automática do cache

Triggers instalados marcam `is_stale = true` e `expires_at = now()`:

- por-usuário: `emotional_checkins`, `pulse_responses`, `ritual_participations`, `employee_profiles`, `recommendation_events`.
- global: `content_items` (status, `recommendation_weights`, `is_premium`).

Isso garante que a recomendação reflete o estado atual sem chamar IA a cada acesso.

## Fontes permitidas

`employee_profiles`, check-ins agregados do próprio colaborador (14 d), pulse organizacional agregado (30 d), histórico de views (90 d), eventos de recomendação, favoritos, trilhas/rituais concluídos, `is_premium`/licença da organização.

**Nunca:** dados de outro colaborador, denúncias, chats privados, onboarding de terceiros.

## Ranking

Para cada `content_item` publicado:

```
fit        = Σ(dim_weight × content_dim × user_dim) / Σ(dim_weight × content_dim)
format     = format_weights[type]
novelty    = 1 - exp(-days_since_view / half_life) × 0.9    (1.0 se nunca visto)
time_fit   = min(1, time_available / duration)              (1.0 se cabe no tempo)

score = fit×0.55 + format×0.15 + novelty×0.15 + time_fit×0.15
     + boost_never_seen | boost_partially_completed | boost_favorite_category
     | boost_featured    | boost_best_fit_profile
     - penalty_completed | penalty_repeat (dentro de repeat_within_days)
```

Filtros duros: `status='published'`, `is_premium` apenas com licença, sem eventos `dismissed`.

Diversidade: cap por formato e por categoria antes do corte em `top_n`.

## Explicação

Cada item traz `reason` humanizado, priorizando sinais emocionais:

- "indica energia reduzida no seu momento atual"
- "aponta necessidade de recuperação"
- "mostra ansiedade elevada nos check-ins recentes"
- + "é um conteúdo que você ainda não viu" / "você começou e ainda não concluiu" / "tem alta aderência ao seu perfil e momento atual" / "é do tipo de conteúdo que você costuma favoritar"

## Segurança

- RLS: `recommendation_events` e `user_recommendation_cache` só expõem o próprio usuário; Super Admin lê tudo.
- Funções de invalidação são `SECURITY DEFINER` com `EXECUTE` revogado de `anon`/`authenticated`; só são chamadas por triggers e `service_role`.
- Modo teste do admin (`test_mode: true` + `user_id`) exige `platform_admin`.

## Contrato da Edge Function `recommend-content`

`POST /functions/v1/recommend-content`

Body:
```json
{ "refresh": false, "test_mode": false, "user_id": null }
```

Resposta (HIT):
```json
{
  "ok": true,
  "recommendations": [ { "item_id": "...", "type": "book", "title": "...", "score": 0.87, "reason": "Recomendado porque…", "factors": {"fit":0.71,"format":0.9,"novelty":1,"time_fit":0.8,"boost_never_seen":1}, "confidence": 0.8 } ],
  "user_vector": { "energy": 0.42, "anxiety": 0.61, "communication": 0.55, "leadership": 0.5, "recovery": 0.55, "engagement": 0.5, "equilibrium": 0.6, "psychological_safety": 0.6, "development": 0.5 },
  "metrics": { "cache": "hit", "elapsed_ms": 0, "config_version": 1, "generated_at": "..." }
}
```

Resposta (MISS): mesmo formato + `metrics.cache = "miss"` e `elapsed_ms`, `candidates`, `scored`, `returned`.

## Roadmap

- **Sub-fase B:** tela `/admin/ai/recomendacoes` (abas Motor / Pesos / Categorias / Formatos / Ranking).
- **Sub-fase C:** aba **Testes** (top-20 por colaborador com score/fatores/motivo), **Editar por IA** (chat + diff) e **Histórico** (compare A×B + restaurar no rascunho).