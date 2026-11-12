# Plano de Implementação — Especificação 112 (Anúncio de Box de Livros)

Referência: [Spec 112](spec.md) | [ADR 0086](../../docs/adr/0086-suporte-a-box-e-colecoes-de-livros.md)

## 1. Banco de Dados e Migrações
- Criar a migração `supabase/migrations/202610310002_anuncio_box_de_livros.sql`:
  - Adicionar colunas `is_box` e `box_volumes_count` na tabela `public.v2_books`.
  - Criar restrições de integridade `check (box_volumes_count is null or (box_volumes_count >= 2 and box_volumes_count <= 100))`.
  - Criar restrição condicional `check (box_volumes_count is null or is_box = true)`.
  - Criar índice parcial `create index if not exists idx_v2_books_is_box on public.v2_books (is_box) where is_box = true`.
- Atualizar `scripts/verificar-migracoes.mjs` para testar as restrições SQL via PGlite.

## 2. Camada de Domínio e Infraestrutura
- Modificar `src/model/entities/book.ts`:
  - Adicionar campos `isBox?: boolean` e `boxVolumesCount?: number` no tipo `Book`.
  - Definir constantes de validação `MIN_BOX_VOLUMES = 2`, `MAX_BOX_VOLUMES = 100`.
- Modificar `src/usecase/iBookListingUseCases.ts`:
  - Adicionar campos em `CreateListingParams` e `EditListingParams`.
- Modificar `src/infra/datasources/supabaseBookDataSource.ts` e `src/infra/datasources/memoryBookDataSource.ts`:
  - Ler e persistir `is_box` e `box_volumes_count`.
- Modificar `src/model/datasources/iBookDataSource.ts` e contratos de catálogo para suportar filtro `onlyBoxes?: boolean`.

## 3. Camada de ViewModel
- `src/viewmodel/useCreateListingViewModel.ts`:
  - Gerenciar estado de `isBox` e `boxVolumesCount`.
  - Ações `setIsBox(isBox: boolean)` e `setBoxVolumesCount(count: number | null)`.
  - Integração com rascunhos.
- `src/viewmodel/useEditListingViewModel.ts`:
  - Carregar e permitir alterar `isBox` e `boxVolumesCount`.
- `src/viewmodel/searchFilters.ts`:
  - Adicionar `onlyBoxes` no estado e na lógica de filtragem local e remota.

## 4. Camada de Visão (UI / UX)
- `src/view/listings/createListing.tsx` (Etapa 3 - Detalhes):
  - Adicionar seção "Box ou coleção de livros" com checkbox e input de volumes.
- `src/view/listings/editListing.tsx`:
  - Adicionar os mesmos campos na edição.
- `src/view/components/ReaderCard.tsx` e `BookCard`:
  - Adicionar selo visual "Box" quando `book.isBox` for verdadeiro.
- `src/view/listings/bookDetail.tsx`:
  - Exibir tag "Box de Livros" com contagem de volumes na ficha técnica.
- `src/view/search/WebFilterSidebar.tsx`:
  - Adicionar opção de filtro de boxes.

## 5. Validação e Qualidade
- Escrever testes unitários e de integração antes/durante a implementação (TDD).
- Rodar `npm run validate` para checar tipos, arquitetura, migrações SQL e cobertura de código (mantendo ≥ 80%).
