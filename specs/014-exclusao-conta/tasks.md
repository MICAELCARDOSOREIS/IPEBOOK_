# Tarefas: Exclusão de Conta (Spec 014)

- [x] T001 Adicionar `deleteAccount(userId: string): Promise<void>` em `src/model/datasources/iAuthDataSource.ts` e implementar em `MemoryAuthDataSource` e `SupabaseAuthDataSource`.
- [x] T002 Adicionar `deleteAccount` em `src/usecase/iAuthUseCases.ts` e implementar em `src/usecase/authUseCases.ts`.
- [x] T003 Criar ViewModel `src/viewmodel/useDeleteAccountViewModel.ts`.
- [x] T004 Criar View `DeleteAccount` e `DeleteAccountScreen` em `src/view/auth/deleteAccount.tsx` e `src/view/auth/deleteAccountScreen.tsx`.
- [x] T005 Criar rota `src/app/excluir-conta.tsx` e atalho na aba de Privacidade em `src/view/legal/termsAndPrivacy.tsx`.
- [x] T006 Criar testes unitários, de hook e de componentes.
- [x] T007 Executar validação completa (`npm run validate` e `npm run build:web`) e registrar em `validacao.md`.
