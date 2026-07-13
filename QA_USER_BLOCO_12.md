# QA USER — BLOCO 12: Perfil do Colaborador

**Data:** 13/07/2026 · **Usuário:** colaborador@teste.com.br · **Viewport:** 1280×1800 / 390×1800

## Escopo
- `/enterprise/perfil` (ProfileScreen)
- Card principal (avatar, nome, badges de jornada)
- Grid "Resumo da Jornada"
- Bloco "Sobre você" (identidade + contato)
- CTA "Editar perfil"

## Bugs corrigidos

### BUG-B12-01 (Alta) — Badges de jornada hardcoded
O card do usuário exibia "12 dias seguidos", "Nível 3 em evolução" e "35% concluído" — todos fixos, sem ligação com dados reais (não há tabela de streak, nivelamento ou percentual global). Enganava o colaborador sobre progresso inexistente.
**Correção:** grid removido. Card fica apenas com avatar + nome + subtítulo neutro ("Sua jornada de evolução continua").

### BUG-B12-02 (Alta) — "Resumo da Jornada" 100% mock (47 aulas · 23 exercícios · 14h)
Três cards inteiramente hardcoded. Não há agregações reais de aulas concluídas, exercícios ou tempo assistido por usuário.
**Correção:** seção inteira removida. Reintroduzir quando existir `lesson_progress` + agregações.

### BUG-B12-03 (Média) — "Nascimento: 12 mar 1990" e "Localização: São Paulo, BR"
Dados pessoais fictícios em campos de identidade. A tabela `profiles` não tem `birth_date` nem `location` por enquanto.
**Correção:** linhas removidas. "Sobre você" agora exibe apenas Nome e E-mail vindos de `useDisplayUser` (dados reais do `auth.users` + `profiles`).

### BUG-B12-04 (Média) — CTA "Editar perfil" sem ação
Botão laranja proeminente sem `onClick`/handler.
**Correção:** substituído por nota discreta: "Edição de perfil e estatísticas de jornada serão liberadas em breve.". Evita frustração de clique sem efeito.

## Validado sem bug
- Avatar real (`profile.avatar_url`) com fallback para inicial em círculo preto — comportamento correto.
- Nome e e-mail vêm de `useDisplayUser` → `useAuth` → `profiles`/`auth.users`.
- Header com botão voltar respeita `/enterprise/menu` (audiência correta).
- Layout responsivo `EnterpriseUserLayout` mantido.

## Pendências (fora do escopo)
- **FEATURE-B12-01:** tela `EditProfile` (nome, avatar upload em `avatars` bucket, birth_date opcional, location opcional) + colunas correspondentes em `profiles`.
- **FEATURE-B12-02:** view/RPC de agregação por usuário: `streak_days`, `lessons_completed`, `total_minutes_watched`, `overall_progress_pct` (baseado em `lesson_progress` + `emotional_checkins`).
- **FEATURE-B12-03:** reintroduzir badges/resumo consumindo a view acima, com fallback zeroado nas primeiras semanas.

## Resultado
**6/6 checks OK · 4 bugs corrigidos · 3 features registradas.** Bloco 12 concluído.