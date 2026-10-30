# Tarefas — Spec 110: Ações Interativas de Reserva e Acompanhamento no Detalhe do Livro

Status: [x] Concluído | Branch: `develop`

- [x] **T01**: Adicionar suporte a parâmetro `categoria` em `src/app/pesquisa.tsx` e `initialCategory` em `src/view/search/search.tsx`.
- [x] **T02**: Criar componente `ReservedListingSheet` (`src/view/listings/ReservedListingSheet.tsx`) com Material 3 Expressive, ações contextuais e suporte a acessibilidade.
- [x] **T03**: Adicionar badge interativa "3D · Toque para virar" no container do `Book3D` (`src/view/components/Book3D.tsx`).
- [x] **T04**: Atualizar `BookDetail` (`src/view/listings/bookDetail.tsx`) para tornar a pílula de status interativa com feedback `withPress` e abrir `ReservedListingSheet` ou navegar para gestão/pedidos conforme o papel do usuário.
- [x] **T05**: Conectar os callbacks de navegação em `src/app/livro/[id].tsx`.
- [x] **T06**: Criar testes automatizados para `ReservedListingSheet` e navegação de status em `tests/components/bookDetailInteractiveStatus.test.tsx`.
- [x] **T07**: Validar testes (`npm test`), tipagem (`npm run typecheck`), conformidade arquitetural (`npm run check:architecture`) e numeração (`npm run check:numbering`).
