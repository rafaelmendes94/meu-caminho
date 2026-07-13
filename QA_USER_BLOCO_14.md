# QA USER — Bloco 14 (Prova Final + Resultado + Materiais + Mudança de Jornada)

## Escopo
- `/enterprise/prova-final` — `ProvaFinalScreen`
- `/enterprise/prova-final/resultado` — `ResultadoProvaScreen`
- `/enterprise/materiais` — `MateriaisScreen`
- `/enterprise/mudanca-jornada` — `MudancaJornadaScreen`

## Checks
- [OK] 1. Prova Final: resposta "c" pré-selecionada removida (default = null).
- [OK] 2. Resultado: "Excelente! · Consciência e maturidade emocional" trocado por "Obrigado · Suas respostas foram registradas".
- [OK] 3. Resultado: 3 cards de insights e grid Antes/Agora com 4 barras percentuais fake removidos → placeholder "em breve".
- [OK] 4. Resultado: "Conquista desbloqueada · Curso 2 liberado" trocado por "Continue evoluindo" apontando para `/trilha`.
- [OK] 5. Materiais: cabeçalho "22 min · Aula em progresso" removido.
- [OK] 6. Materiais: todos os 5 itens marcados `locked` (sem "Baixado / Baixar" fake e sem tamanhos "1,8 MB / 582 KB / 12 min / 7 min").
- [OK] 7. Mudança Jornada: card "Trilha atual · Controle da Ansiedade · 85% concluída" e "Nova trilha · Relações Saudáveis · 3 módulos · 24 aulas · ~6h" substituídos por placeholders neutros.
- [OK] 8. Mudança Jornada: CTA "Mudar minha trilha" desabilitado com rótulo "(em breve)" — evita link para rota inexistente `/mudar-trilha/confirmar`.

## Bugs corrigidos
- BUG-B14-01 (Alta) ProvaFinal — resposta padrão pré-marcada.
- BUG-B14-02 (Crítica) ProvaFinal — respostas não persistem em nenhuma tabela; nenhum registro é criado ao finalizar (feature abaixo).
- BUG-B14-03 (Alta) Resultado — insights e evolução emocional 100% hardcoded, exibidos independente das respostas.
- BUG-B14-04 (Alta) Resultado — "Curso 2 liberado" fake com link para rota `/curso-desbloqueado` inexistente.
- BUG-B14-05 (Alta) Materiais — statuses "Baixado / Baixar" fake sem storage/downloads reais.
- BUG-B14-06 (Média) Materiais — cabeçalho "Módulo 2 · Pensamentos acelerados · 22 min · Aula em progresso" hardcoded.
- BUG-B14-07 (Alta) MudancaJornada — trilha atual "Controle da Ansiedade 85%" e recomendação "Relações Saudáveis" completamente fake.
- BUG-B14-08 (Média) MudancaJornada — CTA apontava para rota `/mudar-trilha/confirmar` inexistente.

## Features registradas
- FEATURE-B14-01: tabela `assessment_responses(user_id, assessment_id, question_id, answer_id, created_at)` para persistir a Prova Final.
- FEATURE-B14-02: geração de insights e evolução emocional por IA a partir das respostas + `emotional_checkins` históricos.
- FEATURE-B14-03: regra de desbloqueio de próximo curso após conclusão (`course_unlocks(user_id, course_id, unlocked_at)`).
- FEATURE-B14-04: integração com `content_downloads` e Storage para materiais (download real + status por usuário).
- FEATURE-B14-05: engine de recomendação de trilha (nova trilha sugerida com base em progresso + assessment).
- FEATURE-B14-06: rota `/mudar-trilha/confirmar` + ação de troca de trilha.

## Arquivos alterados
- `src/components/ProvaFinalScreen.tsx`
- `src/components/ResultadoProvaScreen.tsx`
- `src/components/MateriaisScreen.tsx`
- `src/components/MudancaJornadaScreen.tsx`

## Status
Bloco 14 concluído — 8/8 checks OK, 8 bugs corrigidos, 6 features registradas.
Próximo: Bloco 15 = Feed / Conteúdo (Leitura, Vídeo, Áudio, Cortes, Leitor da Biblioteca, Player de Vídeo).
