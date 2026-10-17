# Plano de Implementação: Editar e Pausar Anúncio (Spec 024)

## Arquitetura em Sete Camadas

1. **Model**:
   - `src/model/entities/book.ts`: Estender `BookStatus = "available" | "reserved" | "paused"`.
   - `src/model/datasources/iBookDataSource.ts`: Adicionar método `update(book: Book): Promise<Book>`.
2. **UseCase**:
   - `src/usecase/iBookUseCases.ts`: Declarar `updateListing` e `togglePauseListing`.
   - `src/usecase/bookUseCases.ts`: Implementar regras de posse, verificação de anúncio reservado e validação via `validateBook` / `validateUpdateListing`.
3. **Infra**:
   - `src/infra/datasources/memoryBookDataSource.ts`: Implementar `update` e filtrar `status === "available"` em `list()`.
   - `src/infra/datasources/supabaseBookDataSource.ts`: Implementar `update` persistindo em `v2_books` e filtrar `.eq("status", "available")` em `list()`.
4. **DI**:
   - `src/di/container.ts`: Mantém injeção sem alterações na interface externa.
5. **ViewModel**:
   - `src/viewmodel/useMyListingsViewModel.ts`: Adicionar ação `togglePauseListing(bookId: string): Promise<boolean>`.
   - `src/viewmodel/useEditListingViewModel.ts`: Hook gerenciador de formulário de edição (carregamento inicial, validações reativas e submissão).
6. **View**:
   - `src/view/listings/myListings.tsx`: Adicionar badge "Pausado", botão "Pausar/Retomar" e botão "Editar".
   - `src/view/listings/editListing.tsx`: Formulário pré-carregado com os dados atuais do livro.
7. **App / Rotas**:
   - `src/app/editar-anuncio/[id].tsx`: Rota conectando a view de edição com navegação de retorno.
