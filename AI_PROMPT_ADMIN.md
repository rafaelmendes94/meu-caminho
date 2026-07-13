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
6. **Testar no Chat** — placeholder “Em breve” (Sub-fase B).
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

## Próximas sub-fases

- **B** — Aba “Testar no Chat” com `test_mode`, seletor de empresa, métricas de
  execução (tokens, custo, tempo, confiança).
- **C** — Edição do prompt por linguagem natural com diff antes/depois +
  aplicação apenas no draft + comparação/restauração de versões no histórico.