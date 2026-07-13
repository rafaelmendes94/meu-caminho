# CONTENT_INITIAL_SEED_REPORT — Curadoria Inicial (Augusto Cury)

**Data:** 2026-07-13
**Escopo:** Fase Content Seed 01. Popular Content Studio com curadoria mínima baseada nas obras e temas de Augusto Cury, respeitando estritamente propriedade intelectual.

## Princípios aplicados
- Nenhum ISBN, ano, editora, duração ou URL foi inventado.
- Nenhuma capa, PDF, ePub, audiobook ou vídeo foi anexado sem autorização confirmada.
- Nenhum trecho longo copiado de editoras/livros/páginas externas.
- Descrições editoriais próprias, curtas e resumidas.
- Todo item cuja procedência/direito não pôde ser confirmado permanece **draft**.

## Resumo quantitativo
| Item | Quantidade | Status |
|---|---|---|
| Autor principal (Augusto Cury) | 1 | atualizado (published) |
| Categorias | 9 novas + 6 existentes | published |
| Tags | 20 | ativas |
| Livros de Augusto Cury (fichas) | 12 | **draft** (direitos pendentes) |
| Vídeos placeholder | 12 | **draft** (nenhum vídeo oficial localizado ainda) |
| Coleções | 4 | draft |
| Trilhas | 4 | **draft** (dependem dos itens externos) |
| Conteúdo editorial próprio (Equipe Meu Caminho) | 30 | **published** |

## Livros cadastrados (12)
1. Ansiedade — Como Enfrentar o Mal do Século — draft
2. O Código da Inteligência — draft
3. Pais Brilhantes, Professores Fascinantes — draft
4. Nunca Desista de Seus Sonhos — draft
5. Seja Líder de Si Mesmo — draft
6. O Futuro da Humanidade — draft
7. O Vendedor de Sonhos: O Chamado — draft
8. O Vendedor de Sonhos e a Revolução dos Anônimos — draft
9. O Semeador de Ideias — draft
10. O Homem Mais Inteligente da História — draft
11. O Homem Mais Feliz da História — draft
12. Prisioneiros da Mente — draft

Todos vinculados ao autor Augusto Cury via `content_item_authors`.

## Vídeos
- **Encontrados oficiais/autorizados:** 0 (não foi realizada verificação online em fonte oficial nesta execução).
- **Descartados:** 0.
- **Pendentes (placeholders draft):** 12 — um por obra, com `media_url = null`, título prefixado `[PENDENTE]` e nota interna solicitando localização de vídeo oficial no canal do autor/editora.

## Coleções
- Gestão da Emoção
- Ansiedade e Equilíbrio
- Liderança de Si Mesmo
- Sonhos, Propósito e Resiliência

Todas em draft, populadas exclusivamente com livros já cadastrados.

## Trilhas
- Trilha — Gestão da Emoção (3 itens)
- Trilha — Liderança de Si Mesmo (3 itens)
- Trilha — Sonhos e Propósito (3 itens)
- Trilha — Educação Emocional (2 itens)

Todas em draft — dependem da liberação dos livros/vídeos vinculados.

## Conteúdo publicado (30 itens editoriais próprios)
- 6 exercícios de reflexão
- 6 práticas emocionais
- 6 perguntas para diário
- 4 guias de apoio
- 4 checklists
- 4 atividades para líderes

Todos marcados com `metadata.author_type = internal_editorial` e `source_type = original_content`; nenhum atribui frases a Augusto Cury.

## Fontes utilizadas
- **Títulos de obras:** conhecimento público sobre a bibliografia do autor. Nenhum campo bibliográfico (editora/ano/ISBN) foi preenchido para evitar afirmação sem fonte verificada.
- **Conteúdo editorial:** autoria interna Equipe Meu Caminho.

## Pendências (ver CONTENT_ASSETS_PENDING.md)
- 12 capas licenciadas
- 12 arquivos (PDF/ePub/audiobook) licenciados
- 12 vídeos oficiais/autorizados
- Confirmação bibliográfica (editora, ano, ISBN) das 12 obras
- Direitos formais para exibir sinopse expandida das obras

## Erros encontrados
Nenhum. Migração de dados aplicada com sucesso; operação idempotente via `ON CONFLICT`.

## Verificação pós-seed
Contagem final por tipo/status:

| type    | draft | published |
|---------|-------|-----------|
| book    | 12    | 5 (pré-existentes) |
| course  | 0     | 3         |
| track   | 4     | 3         |
| podcast | 0     | 3         |
| video   | 12    | 4         |
| audio   | 0     | 3         |
| material| 0     | 33        |

## Status
**CURADORIA INICIAL CADASTRADA**
- 12 livros (draft — aguardando direitos)
- 0 vídeos oficiais confirmados / 12 placeholders draft
- 4 trilhas (draft)
- 4 coleções (draft)
- 30 conteúdos editoriais próprios publicados
- 34 itens totais em draft aguardando autorização