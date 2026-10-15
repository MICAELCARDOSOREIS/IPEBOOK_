# Tarefas: Meus Anúncios (Spec 008)

- [x] T001 Estender `IBookDataSource` com `listByOwner(ownerId: string): Promise<readonly Book[]>`.
- [x] T002 Implementar `listByOwner` em `MemoryBookDataSource` e `SupabaseBookDataSource`.
- [x] T003 Estender `IBookUseCases` e implementar `listMyListings(sessionUserId: string | null)` em `BookUseCases`, com testes unitários em `tests/unit/myListingsUseCases.test.ts`.
- [x] T004 Criar ViewModel `src/viewmodel/useMyListingsViewModel.ts` e testes de hook em `tests/hooks/useMyListingsViewModel.test.tsx`.
- [x] T005 Criar `src/view/listings/myListings.tsx` com `MyListings` e `MyListingsScreen`, com testes em `tests/components/myListingsView.test.tsx`.
- [x] T006 Criar rota `src/app/meus-anuncios.tsx`.
- [x] T007 Adicionar botão "Meus anúncios" na Home (`src/view/home.tsx` e `src/app/index.tsx`).
- [x] T008 Criar teste de integração completo em `tests/integration/myListingsIntegration.test.tsx`.
- [x] T009 Rodar `npm run validate` e `npm run build:web`, registrar validação.
