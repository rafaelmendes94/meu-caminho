# QA Bloco 22 — Perfil de Convidados, Home, Menu, Configurações, Ajuda e Marca

## Status: 8/8 telas revisadas

### Correções (mocks removidos)
- **GuestProfileScreen.tsx** — HERO Unsplash removido (substituído por gradiente sólido); arrays `PODCASTS`/`VIDEOS`/`REFLECTIONS` (7 itens com Unsplash + títulos fictícios) esvaziados; nome/bio "Joel Jota" e atribuição "Joel Jota & Augusto Cury" removidos; card "Featured episode" (imagem Unsplash + copy inventada) removido; stats fake (24 conteúdos / 8 podcasts / 412k ouvintes) removidos; "Editorial closing — próximo encontro Joel Jota e Augusto Cury" removido; toda seção agora exibe estado vazio até integração com `content_authors` + `content_items`.
- **HomeScreen.tsx** — Descrição "A biblioteca dos livros do Dr. Augusto Cury" reduzida a "biblioteca do clube"; atribuição "Augusto Cury" no card de reflexão do dia trocada por "Reflexão do dia".
- **MenuScreen.tsx** — Footer "Meu Caminho · Augusto Cury · v1.2.0" reduzido a "Meu Caminho · v1.2.0"; descrição "Biblioteca dos livros do Dr. Augusto Cury" trocada por "Biblioteca de livros do clube".
- **SettingsScreen.tsx** — Footer "Meu Caminho · Augusto Cury · Todos os direitos reservados" reduzido a "Meu Caminho · Todos os direitos reservados".
- **SubscriptionScreen.tsx** — Copy "ecossistema do Dr. Augusto Cury" trocada por "ecossistema Meu Caminho".
- **HelpCenterScreen.tsx** — Resposta FAQ "biblioteca digital do Dr. Augusto Cury" trocada por "biblioteca digital do clube".
- **PreloaderScreen.tsx** — Tagline "Augusto Cury" abaixo do logo trocada por "Saúde emocional".
- **WelcomeScreen.tsx** — Tagline "Augusto Cury" abaixo do logo trocada por "Saúde emocional".

### Pendências (features)
- FEATURE-B22-01 `content_authors` — perfil de autor/convidado dinâmico (bio, foto, estatísticas) para popular `GuestProfileScreen` e `AboutExpertScreen`.
- FEATURE-B22-02 filtro `content_items?author_id=…` — listagem de podcasts/vídeos/reflexões por autor/convidado.
- FEATURE-B22-03 `app_branding` (organization_settings) — permitir que a copy institucional (tagline, footer, descrições de biblioteca) seja configurada por CMS/organização em vez de hardcoded.

**Próximo:** Bloco 23.