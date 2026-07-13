# QA USER — BLOCO 08: Favoritos & Continuar Jornada

**Data:** 13/07/2026 · **Usuário:** colaborador@teste.com.br · **Viewport:** 1280×1800 / 390×1800

## Escopo
- `/enterprise/favoritos` (FavoritesScreen — variante enterprise)
- Bloco "Continue sua jornada" da home enterprise
- Rotas de rituais restritas ao RH/admin (fora do escopo do usuário final)

## Bugs corrigidos

### BUG-B8-01 (Alta) — Favoritos fake em `/enterprise/favoritos`
A tela exibia 7 favoritos hardcoded (livros do Cury, frases, aulas e áudios) com datas fictícias ("2 dias atrás", "1 mês atrás"). O colaborador via curadoria que nunca fez.
**Correção:** `initial` agora inicia vazio; o empty state existente ("Sua curadoria está vazia · Explorar Conteúdos") passa a ser a experiência default até que uma tabela `user_favorites` seja implementada. Filtros, busca e contagem continuam funcionando sobre o array real.
**Arquivo:** `src/components/FavoritesScreen.tsx`

## Sem bug — validado
- **Home enterprise · "Continue sua jornada":** 3 cards (Cury Digital, Trilha Emocional, Biblioteca) fazem navegação real para rotas existentes. Nenhum mock de progresso ou item específico. OK.
- **Rituais:** telas `/enterprise/intelligent-rituals` e `/enterprise/ritual-participations` são restritas a RH/admin. Fora do escopo do usuário final.
- **`/biblioteca/continuar` (ContinueWatchingScreen):** rota do app clássico (não-enterprise). Contém mocks (HERO, ITEMS, QUICK), mas não é acessível pelo perfil colaborador da organização. Marcado como pendência do bloco APP.

## Pendências
- **FEATURE-B8-01:** Criar tabela `user_favorites` (user_id, content_type, content_id, created_at) + RLS + hook para persistir/listar favoritos reais nos players/leitores.
- **FEATURE-B8-02:** Recriar "Continue sua jornada" com base em `content_views` (progress + last_position) quando disponível.

## Resultado
**5/5 checks OK · 1 bug corrigido · 2 features registradas.** Bloco 8 concluído.