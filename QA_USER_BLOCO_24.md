# QA Bloco 24 — Enterprise Onboarding, Boas-vindas, Convites e Cadastro

## Status: 8/8 telas revisadas

### Correções (mocks removidos)
- **EnterpriseOnboardingScreen.tsx** — `formData` inicial ("Grupo Alpha Executive", "Tecnologia e Serviços", "250-500", "Marina Costa", "marina.costa@grupoalpha.com", "grupoalpha.com") zerado para strings vazias; placeholder de domínio "@grupoalpha.com" trocado por "@suaempresa.com".
- **EnterpriseWelcomeScreen.tsx** — Copy "método do Dr. Augusto Cury" trocada por "foco em saúde mental"; item da lista "Suas conversas com o Cury Digital" trocado por "Suas conversas com a IA".
- **EnterpriseWelcomeJourneyScreen.tsx** — Feature "Cury Digital IA / IA inspirada nos ensinamentos de Augusto Cury" trocada por "Conversa com IA / IA de apoio emocional"; bullet "Inteligência exclusiva Augusto Cury" trocado por "Apoio emocional guiado por IA"; seção inteira de citação atribuída a "Dr. Augusto Cury" ("Uma mente saudável aprende a desacelerar…") removida.
- **EnterpriseInviteAcceptanceScreen.tsx** — Label "Cury Digital IA" trocado por "Conversa com IA".
- **EnterpriseInviteEmployeesScreen.tsx** — Revisado; placeholders "Ex: Maria Silva" e "maria@empresa.com.br" mantidos por serem hints neutros de formulário (não mock de dados).
- **EnterpriseEmployeeRegisterScreen.tsx** — Email default "colaborador@empresa.com // Mockado conforme pedido" zerado; card "Conversas com o Cury Digital são privadas" trocado por "Conversas com a IA são privadas".
- **EnterpriseDomainAccessScreen.tsx** — Revisado; sem mocks a remover.
- **EnterpriseCompanySettingsScreen.tsx** — Revisado; sem mocks a remover.

### Pendências (features)
- FEATURE-B24-01 `organizations` — pré-preencher `EnterpriseOnboardingScreen` com dados reais da organização em edição (nome, segmento, contatos, domínio) em vez de estado vazio quando o RH volta ao wizard.
- FEATURE-B24-02 `enterprise_invites` — fluxo de envio de convites (`EnterpriseInviteEmployeesScreen`) já usa Supabase; validar mapeamento com `departments`/`employee_profiles`.
- FEATURE-B24-03 `organization_settings` — permitir configurar o nome do produto/IA por organização (substituindo copy fixa "Conversa com IA") para instâncias white-label.

**Próximo:** Bloco 25.