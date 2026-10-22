# Tarefas: Estados do fluxo de acesso (Spec 046 / Issue #97)

- [x] T001 Criar `EmailAlreadyRegisteredError` e `ExpiredLinkError` em `src/model/errors.ts`
      (ambos `extends AuthError`, preservando compatibilidade com código existente que captura
      `AuthError`).
- [x] T002 `memoryAuthDataSource.ts`: `signUp` lança `EmailAlreadyRegisteredError` em vez de
      `AuthError` genérico para e-mail já em uso.
- [x] T003 `supabaseAuthDataSource.ts`: `signUp` detecta `identities: []` (e-mail já cadastrado e
      confirmado) e lança `EmailAlreadyRegisteredError`, em vez de tratar como sucesso.
- [x] T004 `supabaseAuthDataSource.ts`: `completePasswordReset` lança `ExpiredLinkError` em todos
      os caminhos de link inválido/expirado (corrige também um bug latente em que o `catch`
      sempre convertia para um erro genérico novo, mascarando o tipo específico já lançado).
- [x] T005 `useResetPasswordViewModel.ts`: novo campo `linkExpired: boolean`, derivado de
      `error instanceof ExpiredLinkError`.
- [x] T006 `resetPassword.tsx`: novo estado "Link expirado" (ícone de erro, mensagem, botão
      "Solicitar novo link"), com nova prop `onNavigateToForgotPassword`; rota
      `src/app/redefinir-senha.tsx` atualizada.
- [x] T007 Testes: `tests/unit/supabaseAuthDataSource.test.ts` (novo),
      `tests/hooks/useResetPasswordViewModel.test.tsx` (caso de link expirado),
      `tests/components/resetPasswordView.test.tsx` (estado "Link expirado" e navegação).
- [x] T008 `npm run validate` completo e registro em `validacao.md`.

## Decisões de escopo

- RN-01/RN-02 não exigiram nova tela de cadastro além da mensagem de erro já existente em
  `signUp.tsx` (já coberta por teste prévio em `tests/components/authViews.test.tsx`,
  "exibe mensagem de e-mail já cadastrado") — o problema real era o datasource Supabase
  silenciosamente tratar o caso como sucesso, não a ausência de UI.
- Os estados de confirmação de e-mail por link (`01.12`/`01.13`/`01.15`/`01.16`) ficam fora desta
  entrega — ver "Fora de escopo" em `spec.md`.
