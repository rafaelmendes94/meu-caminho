# PRODUCTION_BLOCKERS — bloqueadores reais para go-live

Data: 2026-07-13.  
Somente itens de nível **ERROR** ou risco alto de produção.

## B-01 · Bucket `content-images`: conteúdo não-publicado e premium acessível por qualquer logado

- **Severidade:** ERROR (scanner Supabase).
- **Causa:** duas políticas SELECT combinadas por OR. A restritiva (`cms read content-images`) valida `content_items.status='published'`; a permissiva (`content_content_images_auth_read`) libera **qualquer** objeto para `authenticated`. OR faz a permissiva vencer.
- **Impacto:** vazamento de artes premium/rascunho para todo colaborador logado (inclusive cross-org).
- **Correção:** `DROP POLICY "content_content_images_auth_read" ON storage.objects;` (mantém a política que checa `content_items.status`).
- **Escopo:** 1 migration curta.

## B-02 · Bucket `content-audio`: mesmo padrão

- **Severidade:** ERROR.
- **Causa:** única política SELECT (`content_content_audio_auth_read`) libera qualquer objeto para `authenticated`, sem join em `content_items.status`.
- **Impacto:** áudios não-publicados e premium acessíveis por todo logado.
- **Correção:** substituir a política por uma que faça `EXISTS (SELECT 1 FROM public.content_items WHERE ... AND status='published')` (padrão já aplicado em `content-audios` — usar como referência).

## B-03 · Bucket `content-video`: mesmo padrão

- **Severidade:** ERROR.
- **Correção:** idêntica a B-02.

## B-04 · Bucket `content-pdf`: mesmo padrão

- **Severidade:** ERROR.
- **Correção:** idêntica a B-02.

## B-05 · View com `SECURITY DEFINER`

- **Severidade:** ERROR (linter Supabase `0010_security_definer_view`).
- **Causa:** existe 1 view no schema `public` criada com `SECURITY DEFINER`, o que ignora RLS do chamador.
- **Impacto:** dependendo da view, pode expor dados que RLS deveria filtrar.
- **Correção:** recriar a view sem `SECURITY DEFINER` (ou usar `WITH (security_invoker=on)`).
- **Ação prévia:** identificar qual view (rodar `SELECT ... FROM pg_views WHERE definition ILIKE '%security definer%'` na próxima janela).

---

## Não-bloqueadores (documentado; não impede go-live)

- **WARN 0029** (funções `SECURITY DEFINER` executáveis por `authenticated`): todas são internas ao padrão de segurança do projeto (`has_role`, RPCs de escrita controlada). Comportamento **intencional** — o linter não distingue funções seguras/inseguras.
- **WARN metadata premium** (`content_items` com `is_premium=true` visível sem checar entitlement): decisão de produto — no MVP, metadados de conteúdo premium são visíveis para permitir descoberta; o **arquivo** é protegido pelo bucket. Ficará em revisão pós-MVP.
- **P-01/P-02** de `CONSISTENCY_PENDING.md` (contador de licenças) permanecem em pendências, não bloqueiam.
- **BLK-01** (E2E humano) e **BLK-08** (e-mail transacional aguardando domínio) permanecem em `RELEASE_BLOCKERS.md`.

---

## Ação necessária

Antes de liberar produção, aprovar a migration que remove/substitui as 4 políticas permissivas de storage (B-01…B-04) e a view `SECURITY DEFINER` (B-05). Escopo total estimado: **1 migration, <60 linhas SQL**.