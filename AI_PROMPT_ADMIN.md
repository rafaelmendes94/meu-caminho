# AI_PROMPT_ADMIN.md — Editor de Prompts do Super Admin

## Visão geral (Sub-fase A entregue)

O Super Admin passa a configurar o **Conselho Executivo IA™** por interface amigável em
`/admin/ai/conselho-executivo`. A Edge Function `executive-ai` lê a configuração
publicada em tempo de execução, com cache curto e fallback seguro.

## Tabelas

### `ai_prompt_configs`
Configuração ativa por chave (`key = 'executive_council'`).
Campos-chave: `system_instructions`, `tone_config`, `output_structure`,
`suggested_questions`, `examples`, `guardrails`, `model_config`, `version`,
`status` (`draft | published | archived`), `published_at`.

### `ai_prompt_versions`
Snapshot imutável por publicação (`prompt_config_id`, `version`, `snapshot`,
`change_note`).

Ambas com RLS restrita a `is_platform_admin()`; Edge Function usa `service_role`.

## Interface (abas)

1. **Comportamento** — tom, detalhe, formalidade, máx. recomendações, switches
   (riscos/oportunidades) e switches obrigatórios travados (evidências,
   confiança, limitações). Textarea de instruções adicionais + prompt base.
2. **Estrutura da Resposta** — blocos ordenáveis; três blocos obrigatórios
   (`evidence`, `confidence`, `limitations`) não podem ser desativados.
3. **Perguntas Sugeridas** — CRUD com ordenação e ativação.
4. **Exemplos** — pergunta + comportamento esperado + observações
   (apenas fictícios).
5. **Modelo e Limites** — modelo principal/fallback, temperatura, max_tokens,
   timeout, tentativas de correção de JSON, streaming. Chave de API nunca
   exposta.
6. **Testar no Chat** — ambiente isolado (Sub-fase B): seletor de empresa,
   escolha entre rascunho e versão publicada, envio de perguntas, métricas de
   execução (modelo, tempo, tokens in/out, custo estimado, versão da config).
   Nenhuma conversa é persistida.
7. **Histórico de Versões** — lista de snapshots; comparação/restauração na
   Sub-fase B.

## Regras obrigatórias de segurança

Renderizadas com cadeado no topo da tela e **sempre** injetadas no prompt final
pelo backend, independentemente do texto salvo. Cobrem:
dados agregados, k-anonimato, não identificação, sem diagnóstico, sem demissão
individual, sem invenção de números, isolamento entre empresas.

## Publicação e versionamento

- Botão **Salvar rascunho** persiste sem alterar `status`.
- Botão **Publicar versão** valida, incrementa `version`, marca
  `status='published'`, grava snapshot em `ai_prompt_versions` e registra
  `platform_audit_logs` (ação `ai_prompt_published`).

## Cache e fallback

`executive-ai` mantém a config em memória por 60s. Em erro/ausência, cai para o
`FALLBACK_SYSTEM_PROMPT` embutido — o Conselho nunca fica sem prompt.

## Permissões

Somente `platform_admin` acessa `/admin/ai/*`. Owner/RH continuam consumindo o
Conselho pelo RH; colaboradores não têm acesso.

## Sub-fase B — Testar no Chat

- A Edge Function `executive-ai` aceita `{ test_mode: true, test_organization_id, config_source: "draft" | "published" }`.
- Somente `platform_admin` pode ativar o modo de teste; caso contrário, retorna `403`.
- Contexto agregado é obtido via nova RPC `get_executive_context_admin(uuid)`,
  gated por `is_platform_admin()`, com o mesmo payload agregado usado no fluxo
  real (nunca dados individuais).
- Em `test_mode` **não** há gravação em `executive_ai_conversations` nem em
  `executive_ai_messages`.
- A resposta inclui `metrics`: `model`, `elapsed_ms`, `tokens_in`, `tokens_out`,
  `tokens_total`, `estimated_cost_usd`, `config_source`, `config_version`,
  `config_status`.
- O rate limit compartilhado da função continua sendo aplicado.

## Sub-fase C — Edição por linguagem natural + histórico

- Nova aba **Editar por IA** invoca a Edge Function `ai-prompt-suggest`
  (`platform_admin` + rate-limit `generation`), que envia a config atual e uma
  instrução em pt-BR ao Gemini 2.5 Pro e recebe um JSON com `summary`,
  `warnings` e `changes` parciais.
- Guardrails obrigatórios são **reforçados no backend**: `include_evidence`,
  `include_confidence` e `include_limitations` sempre `true`; blocos
  `evidence`, `confidence` e `limitations` são reinjetados ativos se a IA
  tentar removê-los.
- A UI mostra um **diff antes/depois por campo** (instruções, tom, estrutura,
  perguntas, exemplos, modelo). Nada é gravado até o Super Admin clicar em
  **Aplicar ao rascunho** — a aplicação ocorre apenas no estado local; publicar
  continua exigindo o botão **Publicar versão**.
- Aba **Histórico de Versões** ganhou:
  - **Comparar versões** (A × B) com diff campo a campo dos snapshots.
  - **Restaurar no rascunho** por versão — carrega o snapshot no estado local
    do editor sem publicar nada; guardrails obrigatórios são reforçados na
    restauração.