# Plano de Implementação — Spec 058 (Busca e preenchimento automático por ISBN)

## Arquitetura e Camadas (MVVM)

1. **Camada de Modelo e Casos de Uso (`model/` e `usecase/`)**:
   - `src/model/entities/bookMetadata.ts`:
     - Tipo `BookMetadata`: `{ isbn: string; title: string; author: string; coverUrl?: string }`.
   - `src/usecase/iBookMetadataService.ts`:
     - Interface `IBookMetadataService` com método `lookupByIsbn(isbn: string): Promise<BookMetadata | null>`.
   - Utilitário de validação e normalização `src/model/isbn.ts`:
     - `normalizeIsbn(raw: string): string`
     - `isValidIsbn(raw: string): boolean`

2. **Camada de Infraestrutura (`infra/`)**:
   - `src/infra/services/openLibraryBookMetadataService.ts`:
     - Consulta à Open Library Books API (`https://openlibrary.org/api/books?bibkeys=ISBN:...&format=json&jscmd=data`).
     - Trata timeout (5s) e erros de rede silenciosamente retornando `null`.
   - `src/infra/services/memoryBookMetadataService.ts`:
     - Catálogo pré-configurado de ISBNs para testes e modo memória (ex: Dom Casmurro 9788535914849, O Cortiço 9788508114320).
   - Injeção no container `src/di/container.ts`.

3. **Camada de ViewModel (`viewmodel/`)**:
   - Atualizar `src/viewmodel/useCreateListingViewModel.ts`:
     - Novos campos de estado: `isbn: string`, `lookingUpIsbn: boolean`, `isbnFeedback: { type: 'success' | 'info' | 'error'; message: string } | null`.
     - Novas ações: `setIsbn: (isbn: string) => void`, `lookupIsbn: () => Promise<boolean>`, `clearIsbnFeedback: () => void`.

4. **Camada de View (`view/`)**:
   - Atualizar `src/view/listings/createListingStep1.tsx`:
     - Card de ISBN expansível ou com campo de entrada do código e botão "Buscar".
     - Feedback acessível (`accessibilityLiveRegion="polite"`).
     - Preenchimento em tempo real de `title`, `author` e prévia de foto se encontrada.
   - Atualizar `src/view/listings/createListing.tsx` para repassar os novos estados e ações do ViewModel ao Step 1.

5. **Testes**:
   - `tests/unit/isbnValidator.test.ts`
   - `tests/unit/openLibraryBookMetadataService.test.ts`
   - `tests/hooks/useCreateListingViewModelIsbn.test.tsx`
   - Atualizar `tests/components/createListingView.test.tsx`
