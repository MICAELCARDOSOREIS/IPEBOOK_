# Plano de Implementação: Negociação Simples

Objetivo: implementar US1 (solicitar), US2 (ver e responder) e US3 (acompanhar), reaproveitando
a sessão autenticada e o modelo de anúncio da
[spec 003](../003-autenticacao-e-cadastro-de-anuncio/plan.md).

## Modelo (camada `model`)

- `src/model/entities/bookRequest.ts` (novo): `type RequestStatus = 'pending' | 'accepted' |
  'rejected'`; `type BookRequest = Readonly<{ id: string; listingId: string; requesterId: string;
  status: RequestStatus }>`.
- `src/model/entities/book.ts`: acrescentar `status: 'available' | 'reserved'` ao `Book`
  (iniciando sempre `available`).
- `src/model/datasources/iBookRequestDataSource.ts` (novo): contrato `create`, `findById`,
  `listByListing`, `listByRequester`, `respond(id, status)` (antes `listByOwner`; ver nota em
  `tasks.md`). `IBookDataSource` ganha `findById` e `updateStatus`.
- `src/model/errors.ts`: reaproveitar `DomainError`/`ValidationError` já existentes — nenhum
  tipo novo de erro.

## Casos de uso (camada `usecase`)

- `src/usecase/bookRequestUseCases.ts` (novo): `IBookRequestUseCases` com `requestNegotiation`
  (FR-001, FR-002, FR-003), `listReceivedRequests`, `listSentRequests`, `respondToRequest`
  (FR-004, FR-005).
- `src/usecase/bookUseCases.ts`: pequena extensão para expor o `status` do anúncio e permitir
  marcá-lo como `reserved` (chamado pelo `bookRequestUseCases` ao aceitar).

## Infraestrutura (camada `infra`)

- `src/infra/datasources/memoryBookRequestDataSource.ts` (novo): lista de pedidos em memória,
  com a lógica de recusa automática dos concorrentes (FR-004) na própria infraestrutura ou no
  caso de uso — decidir na implementação qual camada aplica a regra, mantendo o datasource
  "burro" (só CRUD) é o padrão já usado no projeto.

## Composição (camada `di`)

- `src/di/container.ts`: instanciar `MemoryBookRequestDataSource` e compor
  `IBookRequestUseCases`, reaproveitando a mesma instância de anúncios já existente.

## ViewModel

- `src/viewmodel/useRequestNegotiationViewModel.ts` (novo): ação de solicitar a partir do
  detalhe/card de um anúncio, com estado de carregamento/erro.
- `src/viewmodel/useReceivedRequestsViewModel.ts` (novo): lista de pedidos recebidos, ações
  aceitar/recusar.
- `src/viewmodel/useSentRequestsViewModel.ts` (novo): lista de pedidos enviados, só leitura.

## View e rotas (camadas `view` e `app`)

- `src/view/home.tsx`: botão "Solicitar negociação" em cada item da listagem quando o anúncio
  não é meu e está disponível.
- `src/view/requests/receivedRequests.tsx` (novo): lista de pedidos recebidos com ações
  aceitar/recusar.
- `src/view/requests/sentRequests.tsx` (novo): lista de pedidos enviados, só leitura de status.
- `src/app/pedidos-recebidos.tsx`, `src/app/meus-pedidos.tsx` (novas rotas).

## Sequência de implementação e commits planejados

1. Modelo: `bookRequest.ts`, extensão de `book.ts` (status), `iBookRequestDataSource.ts`.
2. Casos de uso: `bookRequestUseCases.ts`, com testes cobrindo FR-001 a FR-005.
3. Infraestrutura: `memoryBookRequestDataSource.ts`, com testes.
4. Composição: atualizar `di/container.ts`.
5. ViewModel: os três hooks novos, com testes (`renderHook`).
6. View: botão de solicitar na Home, telas de pedidos recebidos/enviados, com testes RNTL.
7. Rotas em `src/app/`.
8. Teste de integração cobrindo SC-002 (aceitar um pedido recusa os concorrentes
   automaticamente).
9. Atualizar `docs/arquitetura.md`, `docs/produto.md` e `docs/estado.md`.
10. Rodar `npm run validate`, registrar evidências em `validacao.md` desta spec.

## Dependências e ferramentas

Nenhuma dependência nova. Depende funcionalmente da spec 003 estar implementada (sessão e
anúncios reais, não só os de exemplo).
