# FINAL_RELEASE_CHECKLIST — GO LIVE

Data: 2026-07-13. Legenda: ✅ Aprovado · ⚠ Atenção · ❌ Bloqueado.

## Fluxos funcionais

| Item | Status | Nota |
|---|---|---|
| Nenhum botão morto | ✅ | 9 âncoras `href="#"` no footer institucional (`RevealFooter`) apenas — documentado, não bloqueia app |
| Nenhuma rota quebrada | ✅ | `ProtectedRoute` cobre todas |
| Nenhum mock / dado fake | ✅ | Auditoria RC-01/02 confirmou |
| Nenhum erro de console | ✅ | Snapshot atual limpo |
| Nenhum erro de build | ✅ | `tsgo --noEmit` 0 erros |
| Nenhum erro Edge Function | ✅ | Logs recentes limpos |
| Nenhum erro RPC | ✅ | Consistente |
| Nenhum erro de autenticação | ✅ | Fluxos email+senha e Google OK |
| Nenhum erro de permissão | ✅ | 5 roles isolados |
| Nenhum módulo inacessível | ✅ | Todas as rotas atingíveis pelos roles corretos |
| Nenhuma tela órfã | ✅ | `SCREEN_MAP.md` conferido |
| Nenhuma tabela sem uso | ✅ | 57/57 usadas |
| Nenhuma função sem uso | ✅ | 30 edge functions ativas |
| Nenhum conteúdo sem origem | ✅ | Todo `content_items` referencia arquivo real |
| Nenhum indicador inconsistente | ⚠ | C-01/C-02 (contador de licenças) — não bloqueia, adiado |
| Nenhuma empresa acessando outra | ✅ | RLS por `organization_id` + `has_role` |
| Nenhum dado individual exposto ao RH | ✅ | k-anon ≥5 + views anônimas |
| Nenhum problema LGPD | ✅ | Export + delete implementados |

## Segurança

| Item | Status | Nota |
|---|---|---|
| RLS habilitada em todas as tabelas `public` | ✅ | 57/57 |
| Nenhum vazamento cross-org via Data API | ✅ | Confirmado |
| Storage: `content-images` só serve publicados | ❌ | **B-01** — política permissiva ativa |
| Storage: `content-audio` só serve publicados | ❌ | **B-02** — sem join em `content_items.status` |
| Storage: `content-video` só serve publicados | ❌ | **B-03** — idem |
| Storage: `content-pdf` só serve publicados | ❌ | **B-04** — idem |
| Nenhuma view com `SECURITY DEFINER` | ❌ | **B-05** — 1 view identificada pelo linter |
| Segredos fora do código | ✅ | `LOVABLE_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY` em env |
| Rate-limit em rotas de IA | ✅ | `_shared/rate_limit.ts` |

## Produção

| Item | Status | Nota |
|---|---|---|
| Build | ✅ | Verde |
| Auth (login/logout/refresh/OAuth) | ✅ | — |
| Storage upload/download/signed URL | ⚠ | Funciona; controle de acesso a arquivos premium é o **B-01…B-04** |
| Edge Functions (30) | ✅ | Ativas |
| RPCs (`has_role`, agregados) | ✅ | Estáveis |
| Cron jobs | ✅ | Sem duplicidade |
| IA (fallback JSON, quota, 429) | ✅ | — |
| E-mails transacionais | ❌ | **BLK-08** aguardando domínio do cliente |
| Logs de auditoria | ✅ | `platform_audit_logs` + `organization_audit_logs` |
| Analytics consistentes | ✅ | Mesma base de tabelas |
| Console limpo | ✅ | — |
| Network sem 4xx/5xx inesperados | ✅ | — |

## Homologação humana

| Item | Status | Nota |
|---|---|---|
| QA humano E2E dos 27 passos (`QA_E2E_PILOTO.md`) | ❌ | **BLK-01** aguardando execução manual (~4-6h) |

---

## Contagem

- ✅ Aprovados: 30
- ⚠ Atenção: 3
- ❌ Bloqueados: **7** (B-01, B-02, B-03, B-04, B-05, BLK-01, BLK-08)

## Decisão

**MVP BLOQUEADO.**  
Ação requerida antes do go-live:

1. Aprovar migration única corrigindo B-01…B-05 (Storage + view). Estimativa: <60 linhas SQL.
2. Concluir configuração do domínio de e-mail (BLK-08) — depende do cliente.
3. Executar QA humano E2E (BLK-01) — depende de time de QA.

Após 1+2+3 → **MVP APROVADO PARA PRODUÇÃO**.