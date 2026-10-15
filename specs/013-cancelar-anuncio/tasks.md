# Tarefas: Cancelamento e Remoção de Anúncio (Spec 013)

- [x] T001 Adicionar `delete(id: string)` em `src/model/datasources/iBookDataSource.ts` e implementar em `MemoryBookDataSource` e `SupabaseBookDataSource`.
- [x] T002 Adicionar `cancelListing` em `src/usecase/iBookUseCases.ts` e implementar em `src/usecase/bookUseCases.ts` com validação de sessão, posse e bloqueio de itens reservados.
- [x] T003 Atualizar ViewModel `src/viewmodel/useMyListingsViewModel.ts` com a ação `cancelListing`.
- [x] T004 Atualizar View `src/view/listings/myListings.tsx` com botão e confirmação de remoção de anúncio.
- [x] T005 Criar/atualizar testes unitários, de hook e de componente.
- [x] T006 Executar validação completa (`npm run validate` e `npm run build:web`) e registrar em `validacao.md`.
