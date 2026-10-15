# Plano de Implementação: Exclusão de Conta (Spec 014)

## Arquitetura MVVM Sofisticada em 7 Camadas

1. **Camada Model (Domínio):**
   - Atualizar `src/model/datasources/iAuthDataSource.ts` com `deleteAccount(userId: string): Promise<void>`.
2. **Camada Infraestrutura:**
   - Implementar `deleteAccount` em `src/infra/datasources/memoryAuthDataSource.ts`.
   - Implementar `deleteAccount` em `src/infra/datasources/supabaseAuthDataSource.ts`.
3. **Camada Caso de Uso:**
   - Atualizar `src/usecase/iAuthUseCases.ts` com `deleteAccount(sessionUserId: string | null): Promise<void>`.
   - Implementar método em `src/usecase/authUseCases.ts`.
4. **Camada ViewModel:**
   - Criar `src/viewmodel/useDeleteAccountViewModel.ts` retornando `[state, actions]`.
5. **Camada View:**
   - Criar `src/view/auth/deleteAccount.tsx` e `src/view/auth/deleteAccountScreen.tsx`.
   - Incluir link "Solicitar exclusão da conta" na aba de Privacidade em `src/view/legal/termsAndPrivacy.tsx`.
6. **Camada App (Rotas):**
   - Criar `src/app/excluir-conta.tsx`.
7. **Testes e Validação:**
   - Teste unitário em `tests/unit/authUseCases.test.ts`.
   - Teste de hook em `tests/hooks/useDeleteAccountViewModel.test.tsx`.
   - Teste de componente em `tests/components/deleteAccountView.test.tsx`.
   - Validação completa (`npm run validate` e `npm run build:web`).
