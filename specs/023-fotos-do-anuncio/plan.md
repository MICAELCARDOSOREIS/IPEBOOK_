# Plano de Implementação: Fotos do Anúncio (Spec 023)

## 1. Arquitetura em Camadas

1. **Camada Model (Domínio):**
   - Atualizar `src/model/entities/book.ts`: adicionar `photoUrl?: string; photos?: readonly string[];`.
   - Atualizar `src/model/validators/bookValidator.ts`: validar quantidade máxima (5), formatos aceitos e URLs seguras.
2. **Camada Infraestrutura:**
   - Criar migração SQL `supabase/migrations/202610170002_fotos_anuncios.sql` adicionando `photo_url text` e `photos text[]` na tabela `public.v2_books` e configurando bucket no storage.
   - Atualizar `src/infra/datasources/memoryBookDataSource.ts` para persistir os campos de foto.
   - Atualizar `src/infra/datasources/supabaseBookDataSource.ts` para ler e persistir `photo_url` e `photos`.
3. **Camada Caso de Uso:**
   - Atualizar `src/usecase/iBookUseCases.ts`: adicionar `photoUrl?: string; photos?: readonly string[];` no `CreateListingInput`.
   - Atualizar `src/usecase/bookUseCases.ts`: processar campos de fotos e repassar aos datasources.
4. **Camada ViewModel:**
   - Atualizar `src/viewmodel/useCreateListingViewModel.ts`: suportar estado de foto da capa (`photoUrl`, `setPhotoUrl`).
5. **Camada View:**
   - Atualizar `src/view/components/BookCover.tsx`: aceitar `photoUrl?: string` e renderizar `Image` com fallback determinístico.
   - Atualizar `src/view/listings/createListing.tsx`: conectar `AddPhotoCard` para definir foto da capa.
   - Atualizar `src/view/listings/bookDetail.tsx`: exibir `photoUrl` na visualização principal do livro.
6. **Testes:**
   - Testes unitários do validador e do caso de uso.
   - Testes de componente de `BookCover` com imagem e com fallback.
   - `npm run validate` e `npm run test:sql`.
