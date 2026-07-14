# Plataforma Enterprise de Inteligência Humana Corporativa

SaaS multi-tenant que transforma sinais humanos agregados em decisões executivas de RH.

## Módulos
Auth · Multi-tenant · Onboarding IA · Perfil Inteligente · Pulse IA™ · Check-ins · Dashboard RH · Organograma Vivo™ · Inteligência Preditiva · DNA Organizacional™ · Conselho Executivo IA™ · Planos de Ação · Insights Semanais · Rituais Inteligentes™ · Score Organizacional™ · Motor de Impacto™.

## Stack
- React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- Lovable Cloud (Supabase gerenciado): Postgres + RLS + Edge Functions (Deno) + Auth
- Lovable AI Gateway (Gemini 2.5 Pro / Flash)
- `pg_cron` + `pg_net` para jobs agendados

## Princípios de privacidade
1. RH nunca acessa dado individual — apenas agregados com k-anonimato ≥ 5.
2. IA nunca recebe PII.
3. Papéis em `user_roles` (nunca em `profiles`).
4. RLS em toda tabela pública, sem exceção.

## Documentação
- [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md)
- [`DATABASE.md`](./DATABASE.md)
- [`EDGE_FUNCTIONS.md`](./EDGE_FUNCTIONS.md)
- [`AI_ARCHITECTURE.md`](./AI_ARCHITECTURE.md)
- [`RLS.md`](./RLS.md)
- [`SECURITY_REPORT.md`](./SECURITY_REPORT.md)
- [`ROADMAP.md`](./ROADMAP.md)
- [`ENTERPRISE_REVIEW.md`](./ENTERPRISE_REVIEW.md)
- [`ENTERPRISE_READY_REPORT.md`](./ENTERPRISE_READY_REPORT.md)

## Dev
```bash
npm install
npm run dev
```

## Configurações da Empresa

Painel completo em `/enterprise/rh/configuracoes` (Owner/RH Admin). Ver `ENTERPRISE_SETTINGS.md`.
