# Enterprise Gamification™ (Fase 26)

Sistema corporativo de gamificação focado em **evolução individual**.
Sem ranking global obrigatório, sem competição negativa entre colaboradores.

## Tabelas (Lovable Cloud)

| Tabela | Função |
|---|---|
| `gam_xp_rules` | Ações que geram XP (login, check-in, curso, ritual, quiz…) |
| `gam_levels` | Catálogo de níveis (nome, XP mínimo, cor, ícone) |
| `gam_badges` | Emblemas (categoria, critério, XP, imagem) |
| `gam_missions` | Missões diárias/semanais/mensais/especiais |
| `gam_achievements` | Conquistas por critério (XP, cursos, tempo, jornadas) |
| `gam_seasons` | Temporadas (Q1, Janeiro 2026…) |
| `gam_events` | Eventos com `xp_multiplier` (Semana Saúde Mental…) |
| `gam_user_xp` | Ledger de XP por usuário/ação/temporada/evento |
| `gam_user_badges` | Badges conquistadas |
| `gam_user_missions` | Progresso das missões |
| `gam_user_streaks` | Streak atual, recorde e recuperações usadas |
| `gam_org_settings` | Ativar/ocultar XP, níveis, streak, badges por empresa |

## RLS
- Catálogos (regras, níveis, badges, missões, conquistas, temporadas, eventos, org settings): leitura para autenticados, CRUD apenas `platform_admin`.
- Dados do usuário (`gam_user_*`): usuário lê o próprio; admin acessa tudo.
- `gam_user_missions`: usuário pode atualizar o próprio progresso.

## Super Admin
Rota: `/admin/gamification` (Sidebar → Gamification).
Abas: Dashboard, XP, Níveis, Badges, Missões, Conquistas, Temporadas, Eventos, Configurações.
Dashboard agrega XP dos últimos 30 dias, usuários ativos, missões concluídas, badges concedidas, streak médio, catálogo de níveis.

## Permissões
- **Platform Admin** — CRUD completo, todas as abas.
- **Empresa (RH)** — visualização e ativação/personalização via `gam_org_settings`.
- **Colaborador** — consumo (XP, badges, missões, streak) respeitando flags da empresa.

## IA
A IA pode **sugerir** missões, badges, temporadas e eventos (rascunho), nunca publica automaticamente. Estrutura pronta para futuras edge functions.

## Pendências
- UI de edição inline (hoje: criação + delete). Editar via SQL/patch.
- Componentes de perfil e dashboard do colaborador consumindo `gam_user_*` (estrutura pronta, integração incremental).
- Exportação (PDF/Excel) — apenas estrutura.
- Motor server-side de concessão automática de XP (edge function `gamification-award`).
- Editor visual de critérios (JSONB) para missões/conquistas.
