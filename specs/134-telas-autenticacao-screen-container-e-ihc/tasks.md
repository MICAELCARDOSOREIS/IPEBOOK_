# Tarefas — Especificação 133

**Responsável:** Maria Clara Almeida Martins (`pessoa:maria-clara`)  
**Status:** Aberta  

## Lista de Tarefas

- [ ] **T001 — Criar suite de testes de regressão para telas de autenticação no ScreenContainer**
  - Arquivo: `tests/components/authScreensContainer.test.tsx`
  - Validar renderização do `ScreenContainer maxWidth={560}` e presença de `InlineErrorCard`.

- [ ] **T002 — Migrar `src/view/auth/signIn.tsx` para o `ScreenContainer` e encadear foco**
  - Remover `SafeAreaView` e `ScrollView` manuais.
  - Adotar `<ScreenContainer maxWidth={560}>`.
  - Integrar foco automático e transição via `ref` de e-mail para senha.
  - Substituir alertas soltos de erro por `InlineErrorCard`.

- [ ] **T003 — Migrar `src/view/auth/signUp.tsx` para o `ScreenContainer` e encadear foco**
  - Remover `SafeAreaView` e `ScrollView` manuais.
  - Adotar `<ScreenContainer maxWidth={560}>`.
  - Encadear foco de Nome -> E-mail -> Senha.
  - Exibir erro de termos e erros de cadastro com `InlineErrorCard`.

- [ ] **T004 — Migrar `src/view/auth/forgotPassword.tsx` e `resetPassword.tsx` para o `ScreenContainer`**
  - Substituir `SafeAreaView` por `ScreenContainer maxWidth={560}`.
  - Harmonizar espaçamentos e erros com `InlineErrorCard`.

- [ ] **T005 — Migrar `src/view/auth/deleteAccount.tsx` e `authCallback.tsx` para o `ScreenContainer`**
  - Substituir `SafeAreaView` em todos os retornos condicionais.
  - Garantir `ScreenContainer maxWidth={560}` e acessibilidade.

- [ ] **T006 — Verificação final e conferência do pipeline de CI**
  - Executar `npm run check:architecture`, `npm run typecheck`, `npm run test` e `npm run validate`.
