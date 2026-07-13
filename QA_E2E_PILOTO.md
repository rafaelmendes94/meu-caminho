# Roteiro de QA E2E — Piloto MVP (27 passos)

**Objetivo:** validar fim-a-fim o MVP com usuários reais antes de declarar release.
**Duração estimada:** 1 dia útil (4–6h efetivas + esperas).
**Ambiente:** produção-piloto (URL publicada).

## Pré-requisitos

- [ ] 1 e-mail Platform Admin (já provisionado via `bootstrap-platform-admin`)
- [ ] 1 e-mail RH (será convidado como owner da empresa)
- [ ] 5 e-mails de colaboradores reais
- [ ] Navegador com DevTools aberto (Console + Network) para capturar erros
- [ ] Pasta de screenshots (`passo-XX-descricao.png`)
- [ ] Planilha de log: passo | executor | horário | status (✅/⚠️/❌) | observação | screenshot

## Convenções

- ✅ passou sem incidente
- ⚠️ passou com ressalva (anotar)
- ❌ falhou (anotar erro + screenshot do console)

---

## Bloco A — Setup Platform (1–4) — Platform Admin

### 1. Login Platform Admin
- `/login` com credenciais super admin.
- **Esperado:** redirect `/platform`, sem erro no console.

### 2. Criar empresa
- `/platform/organizations` → "Nova empresa" → nome, CNPJ, plano, e-mail do RH.
- **Esperado:** empresa criada, convite disparado ao RH.

### 3. Vincular plano e licenças
- Detalhe da empresa → "Assinatura" → licenças ≥ 6.
- **Esperado:** status `active`, contador correto.

### 4. Configurar módulos
- Aba "RH" → habilitar Score, DNA, Rituais, Motor de Impacto, Conselho.
- **Esperado:** toggles salvam e persistem após refresh.

---

## Bloco B — Onboarding RH (5–7) — RH

### 5. Login RH
- Link do convite → definir senha → login.
- **Esperado:** redirect `/enterprise/onboarding`.

### 6. Estrutura organizacional
- Wizard: mínimo 2 departments + 1 unit.
- **Esperado:** autosave visível; recarregar mantém o passo.

### 7. Convidar 5 colaboradores
- `/enterprise/rh/equipe/convidar` → 5 e-mails.
- **Esperado:** 5 convites `pending`. Fallback sem domínio: "Copiar link".

---

## Bloco C — Colaboradores (8–11) — 5 colaboradores

### 8. Aceite dos convites
- Cada colab abre link, define senha, aceita LGPD.
- **Esperado:** `profiles` + `user_roles=employee`.

### 9. Onboarding pessoal
- Chat IA → completa perfil.
- **Esperado:** `employee_profiles` criado; não repete ao logar de novo.

### 10. Pulse
- `/enterprise/pulse` → responder.
- **Esperado:** 5 linhas em `pulse_responses` para o mesmo prompt.

### 11. Check-in emocional
- `/enterprise/checkin` → emoção + intensidade.
- **Esperado:** 5 linhas hoje em `emotional_checkins`.

---

## Bloco D — Inteligência RH (12–17) — RH

### 12. Dashboard
- `/enterprise/rh/dashboard`.
- **Esperado:** cards populados; k-anon respeitado (limite = 5).

### 13. Score Organizacional
- `/enterprise/rh/score-organizacional` → gerar.
- **Esperado:** score + breakdown em `organizational_scores`.

### 14. DNA Organizacional
- `/enterprise/rh/dna` → gerar.
- **Esperado:** relatório em `organizational_dna_reports`; PDF baixa.

### 15. Conselho Executivo IA
- `/enterprise/rh/conselho` → nova conversa.
- **Esperado:** streaming responde; sem PII; conversa salva.

### 16. Plano de ação
- `/enterprise/rh/planos` → criar a partir da recomendação.
- **Esperado:** tarefas em `action_plans`/`action_plan_tasks`.

### 17. Ritual inteligente
- `/enterprise/rh/rituais-inteligentes` → publicar.
- **Esperado:** `intelligent_rituals` status `published`.

---

## Bloco E — Participação (18) — 5 colaboradores

### 18. Participar do ritual
- Feed / `/enterprise/rituais` → participa.
- **Esperado:** 5 linhas em `ritual_participations`.

---

## Bloco F — Motor de Impacto (19) — RH

### 19. Medir impacto
- `/enterprise/rh/impacto` → nova medição.
- **Esperado:** delta em `impact_measurements`.

---

## Bloco G — Canal Direto (20–22)

### 20. Denúncia anônima — colaborador
- `/enterprise/sos-rh` → registrar.
- **Esperado:** protocolo `RPT-*`; sem PII do autor.

### 21. RH responde
- `/enterprise/rh/denuncias` → responder.
- **Esperado:** `report_messages`; status atualizado.

### 22. Colaborador consulta
- Consulta pelo protocolo.
- **Esperado:** resposta visível; anonimato mantido.

---

## Bloco H — CMS (23–25)

### 23. Publicar conteúdo — Platform Admin
- `/platform/content/items` → novo item, upload real via `<StorageUpload>`.
- **Esperado:** arquivo em bucket privado; signed URL 1 ano.

### 24. Consumir — colaborador
- `/enterprise/biblioteca` → abrir.
- **Esperado:** stream/download ok; linha em `content_views`.

### 25. Progresso persiste
- Fechar, reabrir depois.
- **Esperado:** `content_views.progress` > 0 ao retomar.

---

## Bloco I — Sessão (26–27) — colaborador

### 26. Logout e novo login
- **Esperado:** sessão restaurada; sem repetir onboarding.

### 27. Persistência
- Check-ins, pulse, biblioteca, notificações mantidos; realtime funciona.

---

## Aceite

- **27/27 ✅ ou ⚠️** → MVP APROVADO; reemitir `RELEASE_CANDIDATE_REPORT.md`.
- **Qualquer ❌** → issue com screenshot + console + payload; NÃO aprovar até corrigir e re-rodar.
- **⚠️** → known-issue no report; decidir com cliente se bloqueia go-live.

## Notas

- Passos 7–8 dependem de e-mail transacional (BLK-08, aguardando domínio). Fallback: "Copiar link".
- K-anon mínimo = 5. Com exatos 5, se algum colab faltar, agregados ficam vazios (esperado).
- Blocos A→B→C são estritamente sequenciais.
