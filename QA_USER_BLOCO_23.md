# QA Bloco 23 — Sobre o Expert, Chat IA, Fale Conosco, Downloads, Histórico

## Status: 5/5 telas revisadas

### Correções (mocks removidos)
- **AboutExpertScreen.tsx** — Perfil completo "Augusto Cury" removido (foto `augusto-cury.png`, bio, "40 milhões de livros vendidos", "40 anos de estudos", Teoria da Inteligência Multifocal, citação atribuída, cabeçalho "Acompanhe Augusto Cury" e ícones/links de redes sociais Instagram/YouTube/Facebook/Spotify/Site oficial). Substituído por estado vazio neutro ("Perfil do expert em breve") aguardando `content_authors` do CMS.
- **ChatAIScreen.tsx** — Removida conversa mockada ("Estou me sentindo ansiosa e com a mente muito acelerada…" + duas respostas de acolhimento hardcoded) e divisor de data fake ("Hoje"). Mantida apenas a saudação inicial dinâmica com nome real do usuário e as ações rápidas (respiração/exercício/mensagem positiva) que são UI de produto.
- **ContactUsScreen.tsx** — Removidos canais fictícios (WhatsApp `+55 11 99999-9999`, e-mail `suporte@cury.com.br`, "Sede Global — São Paulo, SP") das versões Enterprise e Mobile. Substituídos por card único informando que canais adicionais aparecerão quando configurados pela organização.
- **DownloadsScreen.tsx** — Array `initial` com 6 downloads inventados (meditação, aulas 2/3, e-book, PDF material, podcast) esvaziado. Tela usa o empty-state existente ("Nenhum download ainda.").
- **HistoryScreen.tsx** — Array `allActivities` com 8 atividades fictícias (aulas, chats com "Cury IA", leituras, conquistas) esvaziado. Estatísticas hardcoded (47 atividades / 12 dias / 7.2h / Lvl 3 no Enterprise e 47/12/7h no mobile) substituídas por "—" até integração de métricas reais. Adicionado empty-state na lista mobile.

### Pendências (features)
- FEATURE-B23-01 `content_authors` — perfil dinâmico do especialista (foto, bio, credenciais, redes sociais) para popular `AboutExpertScreen`.
- FEATURE-B23-02 `chat_ai_history` — persistir/retomar conversas reais do usuário com a IA (substituir bolhas mockadas por histórico real).
- FEATURE-B23-03 `organization_contacts` — canais de contato configuráveis por organização (WhatsApp, e-mail, endereço) para `ContactUsScreen`.
- FEATURE-B23-04 `user_downloads` — sincronizar arquivos baixados offline (áudio/vídeo/pdf/ebook) por usuário para `DownloadsScreen`.
- FEATURE-B23-05 `user_activity_log` + agregados (`activities_count`, `streak_days`, `total_time`, `level`) para popular `HistoryScreen`.

**Próximo:** Bloco 24.