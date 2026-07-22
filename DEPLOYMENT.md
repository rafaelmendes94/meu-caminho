# Deployment

Production target:

- App domain: `meucaminhoapp.com.br`
- Supabase domain: `supabase.meucaminhoapp.com.br`
- Server OS: Ubuntu 22.04 x64

## Git and environment rules

- Keep `.env`, `.env.*`, and `.env.production` out of Git.
- Keep `.env.example` and `.env.production.example` in Git with empty values only.
- Lovable remains connected to `main`; do not rewrite published Git history.

## Frontend deploy

Expected server paths:

- Repository: `/var/www/meu-caminho`
- Published frontend: `/var/www/meucaminhoapp.com.br`
- Production env: `/var/www/meu-caminho/.env.production`

Run on the server:

```bash
cd /var/www/meu-caminho
bash scripts/deploy.sh
```

The script pulls `main`, runs `npm ci`, builds the Vite app, syncs `dist/` to the web root, and reloads Nginx.

## Supabase self-hosting notes

This app is not frontend-only. Before go-live, the VPS needs:

- Supabase self-hosted stack
- 89 migrations applied from `supabase/migrations`
- 41 Edge Functions deployed from `supabase/functions`
- Storage buckets created for avatars, content, knowledge hub, and org branding
- Function secrets configured: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`
- `GEMINI_API_KEY` opcional como fallback — o recomendado é configurar via Super Admin em `/admin/ai/provider` (persistido em `platform_ai_settings`, acessível apenas via `service_role`).

Current Lovable dependencies to decide before full independence:

- OAuth helper: `@lovable.dev/cloud-auth-js`
- Email connector gateway: `https://connector-gateway.lovable.dev/resend/emails`

## IA (Gemini direto)

O projeto NÃO usa mais o Lovable AI Gateway. Todas as Edge Functions chamam a API do Gemini diretamente através do helper `supabase/functions/_shared/gemini.ts`.

- Configuração global (chave, modelos, temperatura, max_tokens) fica em `public.platform_ai_settings`.
- A chave só é lida no backend via `service_role`. RLS impede leitura direta por `anon`/`authenticated`.
- Super Admin gerencia em `/admin/ai/provider` (Edge Function `platform-ai-settings`).
- Modelos suportados: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-embedding-001`.
- Legado: nomes `google/gemini-*` são mapeados automaticamente; qualquer `openai/*` cai no `fallback_model` do Gemini.

### Edge Functions afetadas

`onboarding-chat`, `generate-employee-profile`, `executive-ai`, `generate-organizational-dna`, `generate-weekly-insights`, `generate-intelligent-ritual`, `generate-action-plan`, `ai-prompt-suggest`, `ai-lab-playground`, `ai-lab-benchmark`, `ai-lab-compare`, `ai-lab-judge`, `cms-recommend`, `knowledge-search`, `knowledge-ingest`, `_shared/knowledge_rag.ts`.

### Secrets necessárias por Edge Function

| Função | Secrets |
|---|---|
| Todas de IA | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (chave Gemini vem de `platform_ai_settings`) |
| `platform-ai-settings` | idem |
| Fallback bootstrap | `GEMINI_API_KEY` (opcional, usado se a linha de settings ainda não tem chave) |
