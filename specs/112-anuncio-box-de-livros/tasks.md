# Tarefas — Especificação 112 (Anúncio de Box de Livros)

Status geral: [X] Concluído

## Fase 1: Banco de Dados e Migração SQL
- [X] T1.1 Criar migração `supabase/migrations/202610310002_anuncio_box_de_livros.sql` com colunas `is_box`, `box_volumes_count`, restrições e índice.
- [X] T1.2 Adicionar validação SQL no script `scripts/verificar-migracoes.mjs` e rodar `npm run test:sql`.

## Fase 2: Domínio e Infraestrutura
- [X] T2.1 Atualizar entidade `Book` em `src/model/entities/book.ts` com `isBox`, `boxVolumesCount` e constantes.
- [X] T2.2 Atualizar contratos em `iBookListingUseCases.ts` e `iBookDataSource.ts`.
- [X] T2.3 Implementar persistência e mapeamento em `memoryBookDataSource.ts` e `supabaseBookDataSource.ts`.
- [X] T2.4 Adicionar suporte ao filtro `onlyBoxes` no caso de uso do catálogo e testes.

## Fase 3: ViewModels
- [X] T3.1 Atualizar `useCreateListingViewModel.ts` com campos, validações e persistência em rascunhos.
- [X] T3.2 Atualizar `useEditListingViewModel.ts` para carregar e atualizar campos de box.
- [X] T3.3 Atualizar `searchFilters.ts` com filtro `onlyBoxes`.
- [X] T3.4 Expandir testes de unidade dos ViewModels (`tests/hooks/`).

## Fase 4: Telas e Componentes
- [X] T4.1 Atualizar `src/view/listings/createListing.tsx` (Etapa 3) com opção de box e número de volumes.
- [X] T4.2 Atualizar `src/view/listings/editListing.tsx`.
- [X] T4.3 Atualizar `src/view/components/ReaderCard.tsx` e `BookCover.tsx` com selo visual "Box".
- [X] T4.4 Atualizar `src/view/listings/bookDetail.tsx` com exibição de tag na ficha técnica.
- [X] T4.5 Atualizar `src/view/search/WebFilterSidebar.tsx` e filtros com checkbox "Apenas boxes / coleções".

## Fase 5: Verificação e Validação Integral
- [X] T5.1 Rodar `npm run typecheck` e garantir 0 erros de tipo.
- [X] T5.2 Rodar `npm run check:architecture` e `npm run check:numbering`.
- [X] T5.3 Rodar `npm run test:coverage` e garantir todos os índices ≥ 80%.
- [X] T5.4 Rodar `npm run validate` e consolidar commit na branch `feat/112-anuncio-box-de-livros`.
