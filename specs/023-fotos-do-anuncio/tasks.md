# Tarefas — Fotos do Anúncio (Spec 023)

- [x] T001: Registrar ADR 0017 sobre a arquitetura de armazenamento de fotos com Supabase Storage e ciclo de vida LGPD.
- [x] T002: Criar migração SQL `202610170002_fotos_anuncios.sql` estendendo `v2_books` e bucket de storage.
- [x] T003: Estender entidade `Book` e validador `bookValidator.ts` com suporte e validação de fotos.
- [x] T004: Atualizar datasources (`memoryBookDataSource.ts` e `supabaseBookDataSource.ts`) e caso de uso `BookUseCases`.
- [x] T005: Atualizar `BookCover.tsx` para renderizar foto real com fallback determinístico de design system.
- [x] T006: Integrar `AddPhotoCard` na tela `createListing.tsx` e ViewModel `useCreateListingViewModel.ts`.
- [x] T007: Exibir capa real em `bookDetail.tsx`.
- [x] T008: Atualizar suíte de testes unitários e testes SQL.
- [x] T009: Validar suíte completa com `npm run validate` e sincronizar banco com `supabase db push`.
