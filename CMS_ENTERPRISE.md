# CMS Enterprise™ (Content Hub) — Fase 25

Centraliza no Super Admin toda a administração de conteúdo da
plataforma. Nenhum módulo de RH/Empresa/Colaborador foi
alterado; UX, RLS e regras de negócio permanecem intactas.

## Novas tabelas (RLS restrita a `platform_admin`)

| Tabela                    | Papel                                                    |
| ------------------------- | -------------------------------------------------------- |
| `cms_competencies`        | Catálogo de competências (nome/slug/cor/ícone/descrição) |
| `cms_emotions`            | Catálogo de emoções                                      |
| `cms_reflections`         | Reflexões curtas (texto, imagem, tema, status)           |
| `cms_messages`            | Mensagens motivacionais por categoria                    |
| `cms_quizzes`             | Cabeçalho de quiz                                        |
| `cms_quiz_questions`      | Questões (enunciado, tipo, opções JSON, resposta)        |
| `cms_certificates`        | Templates HTML de certificado                            |
| `cms_content_versions`    | Snapshots versionados de qualquer `content_items`        |
| `cms_content_imports`     | Registro de importações em massa                         |

Todas com trigger `cms_touch_updated_at`, `service_role` liberado
e política única `has_role('platform_admin')`.

## Nova tela

`/admin/content/hub` — `PlatformCMSHubScreen`.

Rotas alias que abrem o hub na aba correta:
`/admin/content/competencies`, `/emotions`, `/reflections`,
`/messages`, `/quizzes`, `/certificates`, `/imports`,
`/versions`, `/analytics`.

O hub agrupa em 9 abas:

1. **Competências** — CRUD do catálogo.
2. **Emoções** — CRUD do catálogo.
3. **Reflexões** — CRUD com status draft/review/published/archived.
4. **Mensagens** — CRUD com categorias energia/liderança/ansiedade/comunicação/produtividade.
5. **Quizzes** — CRUD do cabeçalho (questões via API/edge function).
6. **Certificados** — Editor HTML com placeholders (`{{user_name}}`, `{{course_name}}`, `{{date}}`, `{{validation_code}}`).
7. **Importações** — Registro de import jobs (books/courses/videos/podcasts/pdf); processamento em edge function futura.
8. **Versionamento** — Lista de snapshots por `content_item_id`.
9. **Analytics** — KPIs de `content_items` (total/publicados/rascunhos/arquivados) + top 10 mais consumidos a partir de `content_views`.

Um cabeçalho de shortcuts leva às telas legadas já existentes
(Livros, Autores, Cursos, Vídeos, Podcasts, Trilhas, Categorias,
Tags, Biblioteca, Coleções, Materiais). Nada foi removido.

## Menu Super Admin

`src/components/admin/adminNav.ts` recebeu novas entradas
dentro do grupo **Conteúdo**: CMS Hub, Competências, Emoções,
Reflexões, Mensagens, Quizzes, Certificados, Versionamento,
Analytics. Todas apontam para `PlatformCMSHubScreen`.

## Integrações preparadas

- **Knowledge Hub** — publicação em `content_items` continua
  alimentando `knowledge_documents/chunks/embeddings` pela
  pipeline atual; competências/emoções/reflexões são
  referenciáveis via IDs.
- **Recommendation Engine** — `content_items` já expõe
  metadados; novos vocabulários (`cms_competencies`,
  `cms_emotions`) enriquecem a segmentação sem alterar o motor.
- **IA de conteúdo** — resumo, palavras-chave, competências,
  emoções, categorias e descrição SEO são gerados sob demanda
  no editor; nada é publicado automaticamente.
- **Versionamento** — cada save do editor deve inserir em
  `cms_content_versions` (snapshot JSON do `content_items`).
  Estrutura pronta; hook a implementar nos editores.
- **Importações** — jobs em fila; edge function
  `cms-import-runner` a implementar para parse de CSV/RSS/ZIP.

## Permissões

- **Platform Admin** — CRUD total via UI e API.
- **Empresa / RH** — nenhuma exposição administrativa; leitura
  pública dos conteúdos publicados continua via `content_items`.
- **Colaborador** — nunca acessa `cms_*`.

## Pendências reais

- Editor visual de questões (`cms_quiz_questions`) — hoje via API.
- Upload de PDF/ePub/capas para bucket dedicado no editor de Livros.
- Editor drag-and-drop para Trilhas (usar `PlatformContentTrackBuilderScreen` existente e integrar novos vocabulários).
- Edge functions `cms-import-runner`, `cms-versioning-writer` e `cms-ai-enrich` para automação.
- Diff visual e rollback na aba Versionamento (SQL/UI a implementar).
- Bulk actions (publicar/arquivar/duplicar/mover) por seleção múltipla nas telas legadas.
- Assinatura digital + QR code do certificado no render final (template pronto, geração em edge function).