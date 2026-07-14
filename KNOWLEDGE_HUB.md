# KNOWLEDGE_HUB.md — Enterprise v1.0

Base de Conhecimento Corporativa compartilhada por TODAS as IAs da plataforma.

## Arquitetura

```
Upload → Extração → Chunking → Embeddings (Gemini 3072d) → Indexação (pgvector HNSW)
   ↓
match_knowledge_chunks() (RPC SECURITY DEFINER)
   ↓
fetchKnowledgeContext() (_shared/knowledge_rag.ts)
   ↓
Todas as IAs (Conselho, DNA, Insights, Planos, Rituais, Recomendação, Orchestrator)
```

## Tabelas
- `knowledge_collections` — coleções globais ou por organização (Augusto Cury, NR17, etc.)
- `knowledge_categories` — hierárquicas
- `knowledge_documents` — metadados completos + status pipeline
- `knowledge_chunks` — vetor `vector(3072)` + índice HNSW halfvec
- `knowledge_versions` — histórico
- `knowledge_cache` — cache RAG (TTL 1h default, invalidado por trigger em docs/coleções)
- `knowledge_logs` — auditoria (upload/edit/publish/delete/reprocess/use)
- `knowledge_usage` — uso por IA (módulo + chunks + confiança)

## Escopo multi-tenant
- `organization_id = NULL` → documento global (visível a todas orgs)
- `organization_id = <uuid>` → visível apenas àquela org
- **Platform Admin**: acesso total
- **Owner/RH Admin**: gerencia documentos da própria org
- **Demais**: consumo apenas via IA (edge functions com service_role)

## Storage
- Bucket privado `knowledge-hub`
- RLS `storage.objects`: apenas `platform_admin` manipula arquivos

## Edge Functions
- `knowledge-ingest` — upload → extração → chunk → embed → indexa → versão + log
- `knowledge-search` — busca semântica; mode `test` retorna chat RAG grounded
- `_shared/knowledge_rag.ts` — helper `fetchKnowledgeContext()` usado por todas as IAs

## Embeddings
- Padrão: `google/gemini-embedding-001` (3072d)
- Chunking padrão: 1000 chars / 150 overlap
- Recuperação: top-k=6, similaridade mínima 0.5, distância cosseno via HNSW halfvec

## Pipeline de qualidade
Cada documento recebe: `quality_score`, `confidence`, `completeness`, `freshness_at`.

## Sub-fases
- **A (concluída)**: schema, RLS, RPC, bucket, helper RAG, edge functions `ingest`/`search`, seeds.
- **B (concluída)**: UI Admin `/admin/knowledge` com todas as abas (Biblioteca, Coleções, Importações, Busca, Versões, Logs, Dashboard, Chat de Teste).
- **C (concluída)**: integração RAG (`fetchKnowledgeContext`) injetada em `executive-ai` (fluxo normal + test mode), `generate-organizational-dna`, `generate-weekly-insights`, `generate-action-plan`, `generate-intelligent-ritual` e `cms-recommend`. `ai-orchestrator` herda RAG via seus especialistas (evita chamadas duplicadas). `recommend-content` é motor algorítmico determinístico — não usa LLM e portanto não recebe injeção RAG nesta fase (a camada CMS conversacional usa `cms-recommend`).

## Integração RAG (Sub-fase C)
Cada IA integrada chama `fetchKnowledgeContext({ query, organizationId, aiModule })` e insere o `contextBlock` retornado como mensagem `user` imediatamente antes do prompt principal, mantendo o `system_prompt` versionado intacto. Cada uso é registrado em `knowledge_usage` (por documento, chunks e confiança) e cacheado em `knowledge_cache` (TTL 1h, invalidação automática por trigger em `knowledge_documents`/`knowledge_collections`).

## Pendências conhecidas
- Extração binária (PDF/DOCX/PPTX/XLSX) nesta fase usa fallback UTF-8 — para binários reais é necessário worker externo (fila com `pdf-parse`/`mammoth`/`officeparser`). Nesta fase A o pipeline aceita `raw_text`, `.txt`, `.md`, `.csv` e URLs.
- OCR: fora de escopo (não solicitado).
- Importação em lote (ZIP/Drive/OneDrive/SharePoint): tabelas prontas; UI/handlers virão na Sub-fase B.