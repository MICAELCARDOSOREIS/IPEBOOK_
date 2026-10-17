# Tarefas: Editar e Pausar Anúncio (Spec 024)

- [x] T001: Criar migração SQL `202610170003_pausar_anuncio.sql` e validar em PGlite via `npm run test:sql`.
- [x] T002: Aplicar migração no banco Supabase remoto via `npx supabase db push`.
- [x] T003: Atualizar `BookStatus` para `"available" | "reserved" | "paused"` em `src/model/entities/book.ts` e `iBookDataSource.ts`.
- [x] T004: Implementar casos de uso `updateListing` e `togglePauseListing` em `src/usecase/bookUseCases.ts` e contratos em `iBookUseCases.ts`.
- [x] T005: Atualizar adaptadores `MemoryBookDataSource` e `SupabaseBookDataSource` com método `update` e filtro de disponíveis em `list()`.
- [x] T006: Criar testes unitários em `tests/unit/bookUseCases.test.ts` cobrindo edição, alternância de pausa, posse e bloqueio de itens reservados.
- [x] T007: Atualizar `useMyListingsViewModel.ts` para suportar `togglePauseListing`.
- [x] T008: Atualizar `myListings.tsx` com botões e estados de "Pausar", "Retomar" e "Editar".
- [x] T009: Criar `useEditListingViewModel.ts`, `editListing.tsx` e rota `src/app/editar-anuncio/[id].tsx`.
- [x] T010: Criar testes de componentes para edição e pausa em `myListingsView.test.tsx` e tela de edição.
- [x] T011: Validar todo o projeto via `npm run validate` e `npm run build:web`.
