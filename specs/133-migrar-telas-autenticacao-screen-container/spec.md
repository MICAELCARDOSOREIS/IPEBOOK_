# Especificação 133 — Migrar telas de autenticação para ScreenContainer e aprimorar foco e erros

**Estado:** Especificada em 2026-11-10  
**ADR:** [0106](../../docs/adr/0106-migracao-telas-autenticacao-screen-container-e-ihc.md)  
**Issue:** [#217](https://github.com/clarinhamartins/ipebook/issues/217)

## Objetivo e escopo

Padronizar a experiência de layout, responsividade e acessibilidade das 6 telas da trilha de autenticação e acesso (`src/view/auth/`), substituindo o encapsulamento manual (`SafeAreaView` + `ScrollView`) pelo componente centralizado do design system `ScreenContainer` com `maxWidth={560}` e padding lateral `space-4` (16 dp). Além disso, aprimorar o fluxo de navegação por teclado virtual (encadeamento de foco consecutivo com `returnKeyType="next"`) e unificar a exibição de alertas de erro utilizando o componente semântico `InlineErrorCard`.

## Telas no escopo

1. `src/view/auth/signIn.tsx` — Entrar com e-mail
2. `src/view/auth/signUp.tsx` — Criar conta
3. `src/view/auth/forgotPassword.tsx` — Recuperar acesso e confirmação
4. `src/view/auth/resetPassword.tsx` — Nova senha e link expirado
5. `src/view/auth/deleteAccount.tsx` — Privacidade e exclusão de conta
6. `src/view/auth/authCallback.tsx` — Retorno e conclusão da autenticação

## Regras de negócio e IHC

- **RN-01 (Uso exclusivo de ScreenContainer):** Nenhuma tela de autenticação deve importar ou instanciar diretamente `SafeAreaView` da biblioteca `react-native-safe-area-context` para o contêiner raiz. Todas as telas devem adotar `ScreenContainer` com largura máxima de formulário padronizada em `maxWidth={560}` e respiro lateral de 16 dp (`space-4`).
- **RN-02 (Encadeamento de foco via teclado virtual):** Ao preencher formulários com múltiplos campos, a tecla de ação do teclado ("Avançar" / `returnKeyType="next"`) deve transferir o foco automaticamente para o campo seguinte (`inputRef.current?.focus()`). No último campo (`returnKeyType="done"`), a ação deve submeter o formulário (`onSubmitEditing`).
  - No login: E-mail -> Senha -> Submeter.
  - No cadastro: Nome -> E-mail -> Senha -> Submeter.
  - Na redefinição de senha: Nova senha -> Confirmar senha -> Submeter.
- **RN-03 (Feedback de erro com InlineErrorCard):** Mensagens de validação ou de erro retornadas pelo backend/ViewModel devem ser exibidas através do componente `InlineErrorCard`, garantindo ícone de erro em conformidade com o tema, fundo destacado (`errorContainer`), borda de advertência e atributo de acessibilidade `accessibilityRole="alert"` com live region correspondente.
- **RN-04 (Preservação de AuthShell e Web Larga):** As telas integradas a `AuthShell` (`signIn`, `signUp`, `forgotPassword`, `resetPassword`) continuam operando harmoniosamente com o painel institucional lateral em telas largas (web desktop), garantindo centralização vertical e alinhamento do formulário à direita.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Nenhuma tela em `src/view/auth/` importa diretamente `SafeAreaView` para o contêiner raiz. | Inspeção estática de código e `npm run check:architecture` |
| CA2 | Telas usam `ScreenContainer` com `maxWidth={560}` e padding lateral padronizado. | Testes de renderização de componentes |
| CA3 | Encadeamento de foco funciona via `returnKeyType="next"` e avanço de foco entre inputs. | Testes de unidade e interação de componentes |
| CA4 | Erros de autenticação utilizam `InlineErrorCard` com `accessibilityRole="alert"`. | `tests/components/authViews.test.tsx` |
| CA5 | `npm run validate` (typecheck, arquitetura e suite de testes) 100% verde. | Execução de `npm run validate` |
