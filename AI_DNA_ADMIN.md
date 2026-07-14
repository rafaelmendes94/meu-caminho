# AI_DNA_ADMIN.md — Editor do DNA Organizacional™ (Super Admin)

## Sub-fase A entregue

Rota `/admin/ai/dna-organizacional` habilita o Super Admin a editar tom, dimensões, classificações, estrutura, recomendações e modelo do DNA. A Edge Function `generate-organizational-dna` passa a ler a configuração publicada, montar o system prompt dinamicamente e aplicar guardrails imutáveis no backend, mantendo fallback seguro embutido.

## Banco

- `ai_prompt_configs` reaproveitada com duas colunas novas:
  - `dimensions_config jsonb` — dimensões avaliadas (key, label, descrição, peso, ativação, ordem, obrigatoriedade).
  - `classifications_config jsonb` — faixas 0–100 com label e descrição.
- Seed `key = 'organizational_dna'` inclui: 10 dimensões (6 obrigatórias: liderança, comunicação, engajamento, energia, recuperação, segurança psicológica), 5 classificações padrão, 12 blocos de estrutura (4 obrigatórios: resumo executivo, dimensões, confiança, limitações), guardrails imutáveis e modelo padrão Gemini 2.5 Pro com fallback Flash.
- `ai_prompt_versions` recebe snapshot v1 na criação.

RLS herdadas: leitura/escrita restritas a `platform_admin`; edge functions usam service role.

## Abas (Sub-fase A)

1. Comportamento — tom, detalhe, formalidade, máximos (forças, riscos, recomendações), switches (tensões, oportunidades, plano inicial, riscos), switches obrigatórios travados (evidências, confiança, limitações), instruções adicionais, prompt base.
2. Dimensões — ativar/desativar, editar label/descrição/peso/ordem; obrigatórias não podem ser removidas nem desativadas.
3. Estrutura — 12 blocos ordenáveis; 4 obrigatórios travados.
4. Classificações — faixas editáveis com validação de cobertura 0–100 sem lacunas nem sobreposição.
5. Recomendações — máximo (1–10), campos exigidos (responsável, prazo, esforço, impacto, métricas), heurística de baixo esforço/alto impacto, instruções adicionais.
6. Modelo e Limites — modelo primário/fallback, temperatura, max_tokens, timeout, tentativas de correção JSON, streaming. Chave nunca exposta.
7. Testar Geração — placeholder (Sub-fase B).
8. Histórico — lista de snapshots publicados; comparação/restauro chegam na Sub-fase C.

Publicação registra `platform_audit_logs` (`ai_prompt_published`, entity `ai_prompt_configs`).

## Guardrails imutáveis (aplicados sempre pelo backend)

- Apenas dados agregados fornecidos pelo backend.
- Respeitar k-anonimato (amostra mínima da organização).
- Nunca identificar indivíduos, times minoritários ou denunciantes.
- Nunca acessar chats, mensagens, onboarding individual ou denúncias.
- Nunca realizar diagnóstico clínico ou usar linguagem médica.
- Nunca inventar números, participantes ou tendências.
- Nunca inferir dimensão com amostra insuficiente — retornar null.
- Nunca cruzar dados com outra organização.

Regras renderizadas com cadeado no topo da tela; injetadas pelo backend independentemente do texto salvo.

## Edge Function `generate-organizational-dna`

- Aceita `test_mode: true` (restrito a `platform_admin`) e `config_source: 'draft' | 'published'`.
- Carrega config (cache 60s para publicada); fallback embutido caso ausente.
- Monta system prompt dinâmico com: guardrails imutáveis, dimensões ativas, classificações, seções da estrutura, comportamento (tom/detalhe/formalidade/máximos) e schema JSON alvo.
- Chama modelo primário; em erro 5xx, tenta fallback.
- Registra `metrics`: model, elapsed_ms, tokens_in/out/total, custo estimado em USD, config_source, config_version, config_status.
- Fluxo real: mantém insert em `organizational_dna_reports` com colunas legadas (mapeando dimensões `culture/leadership/…` para colunas correspondentes) e guarda o JSON rico completo em `evidence.rich` (não quebra o RH atual).
- Test mode: não persiste em `organizational_dna_reports` — apenas devolve `report` e `metrics`.

## Saída JSON alvo

`executive_summary`, `organizational_identity`, `overall_score`, `dimensions[]`, `strengths[]`, `tensions[]`, `risks[]`, `opportunities[]`, `priorities[]`, `recommendations[]`, `initial_action_plan[]`, `confidence`, `confidence_reason`, `limitations[]`, `used_sections[]`.

Dimensões com amostra insuficiente retornam `score = null` e são citadas em `limitations`.

## Pendências (próximas sub-fases)

- Sub-fase B: aba **Testar Geração** com seletor de empresa, execução em `test_mode`, preview do relatório renderizado + JSON + métricas, e botão explícito para persistir.
- Sub-fase C: "Aplicar instrução ao DNA" (edição por linguagem natural com diff, guardrails reforçados) e histórico com comparação A×B e restauro no rascunho.
