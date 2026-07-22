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
- Function secrets configured: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM`

Current Lovable dependencies to decide before full independence:

- OAuth helper: `@lovable.dev/cloud-auth-js`
- AI gateway: `https://ai.gateway.lovable.dev`
- Email connector gateway: `https://connector-gateway.lovable.dev/resend/emails`
