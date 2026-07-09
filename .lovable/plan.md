## Plano — corrigir login do Super Admin

### Objetivo
Garantir que qualquer usuário com role `platform_admin` nunca renderize a tela comum `/home` e seja enviado diretamente para `/admin/dashboard` após login ou ao acessar rotas comuns por engano.

### Alterações propostas
1. **Centralizar destino por perfil no auth**
   - Criar um helper no fluxo de autenticação para resolver o destino principal:
     - `platform_admin` → `/admin/dashboard`
     - `owner` / `rh_admin` → painel RH
     - `employee` / `leader` → enterprise/onboarding
     - demais → `/home`

2. **Proteger `/home` contra Platform Admin**
   - Adicionar um guard leve na tela `/home` ou em um wrapper de rota comum.
   - Se o usuário tiver `platform_admin`, redirecionar imediatamente para `/admin/dashboard` antes de renderizar o layout do aplicativo comum.
   - Isso evita exatamente o cenário do print: Super Admin vendo a home do app com menu comum.

3. **Corrigir comportamento pós-logout/pós-login**
   - Revisar o logout do painel admin para limpar sessão e voltar ao login sem depender de efeito indireto.
   - Manter o login aguardando `loading === false` e roles carregadas antes de navegar.

4. **Não alterar**
   - Backend
   - Banco de dados
   - Permissões
   - Rotas existentes
   - Design do app comum ou do Super Admin

### Validação
- Entrar com Super Admin deve ir para `/admin/dashboard`.
- Acessar `/home` logado como Super Admin deve redirecionar para `/admin/dashboard`.
- Owner/RH/colaborador continuam indo para seus destinos atuais.