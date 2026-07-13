# QA Bloco 33 — Cursos, Módulos, Materiais e afins

## Escopo
Auditoria de conteúdo curricular hardcoded em telas de curso do usuário.

## Telas revisadas
1. **CursoScreen** — neutralizado:
   - `modulos` com títulos `"Entendendo sua mente"`, `"Pensamentos acelerados"`, `"Gestão da emoção"` e status/durações fake (`"18 min"`, `"done"`, etc.) substituídos por `"Módulo N"` / `"—"` / todos `"locked"`.
2. **ModulosScreen** — neutralizado:
   - 5 módulos com títulos/descrições hardcoded substituídos por `"Módulo N"` + `"—"`.
3. **MateriaisScreen** — neutralizado:
   - 5 materiais (`"Exercícios reflexivos"`, `"Respiração e presença"`, `"Checklist de clareza mental"`, `"Diário emocional"`, `"Prática de desaceleração"`) e seus tipos (`"PDF REFLEXIVO"`, `"ÁUDIO GUIADO"`, `"CHECKLIST"`, `"DIÁRIO EMOCIONAL"`, `"EXERCÍCIO DO DIA"`) trocados por `"Material N"` / tipo genérico `"MATERIAL"`.
4. **CursoDesbloqueadoScreen** — sem mocks; apenas UI de comemoração.
5. **CampaignsScreen** — já neutro (`HERO=null`, `CAMPAIGNS=[]`, `PAST=[]`).
6. **BlogReadingScreen** — já neutro (fallback `"Leitura em preparação"`).
7. **AboutExpertScreen** — já neutro (`"Perfil do expert em breve"`).

## Alterações
- `src/components/CursoScreen.tsx`
- `src/components/ModulosScreen.tsx`
- `src/components/MateriaisScreen.tsx`

## Pendências (Features)
- **FEATURE-B33-01**: `CursoScreen`/`ModulosScreen` — carregar módulos reais de `course_modules` e progresso por usuário (via `content_views`/`user_journey_progress`).
- **FEATURE-B33-02**: `MateriaisScreen` — carregar materiais reais de `content_items` (type=material) com tipos dinâmicos (`content_categories`).
- **FEATURE-B33-03**: `CursoDesbloqueadoScreen` — persistir evento de conclusão de módulo e disparar notificação.
- **FEATURE-B33-04**: `CampaignsScreen` — nova tabela `marketing_campaigns` (org-scoped) para hero + lista + past.
- **FEATURE-B33-05**: `AboutExpertScreen` — carregar dados de `content_authors` (nome, bio, foto, especialidades) conforme conteúdo em foco.
- **FEATURE-B33-06**: `BlogReadingScreen` — carregar artigo do CMS (`content_items` type=material com formato blog) via slug.

## Status
Bloco 33 concluído. Restam ~40 telas ainda não formalmente auditadas (Enterprise checkout/onboarding/privacidade + Platform Admin). Pronto para o **Bloco 34**.