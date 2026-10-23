# Tarefas — Spec 058 (Busca e preenchimento automático por ISBN)

- [x] **T01**: Criar entidade `BookMetadata` em `src/model/entities/bookMetadata.ts` e utilitário `src/model/isbn.ts`.
- [x] **T02**: Criar contrato `IBookMetadataService` em `src/model/services/iBookMetadataService.ts`.
- [x] **T03**: Implementar `MemoryBookMetadataService` e `OpenLibraryBookMetadataService` em `src/infra/services/`.
- [x] **T04**: Injetar `bookMetadataService` no container de DI `src/di/container.ts`.
- [x] **T05**: Criar testes unitários em `tests/unit/isbnValidator.test.ts` e `tests/unit/bookMetadataService.test.ts`.
- [x] **T06**: Expandir `useCreateListingViewModel` com estados e ações de busca de ISBN.
- [x] **T07**: Atualizar `createListingStep1.tsx` e `createListing.tsx` para interação de busca de ISBN.
- [x] **T08**: Criar teste de hook e atualizar testes de componentes de `CreateListing`.
- [x] **T09**: Executar `npm run validate` e `npm run build:web`.
- [x] **T10**: Registrar resultados em `specs/058-busca-livro-isbn/validacao.md`.
