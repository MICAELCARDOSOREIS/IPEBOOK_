# Plano de Implementação: catálogo de livros (retroativo)

Objetivo: documentar como a US1 (ver catálogo) e US2 (recuperar de falha) já estão implementadas,
seguindo a arquitetura MVVM de sete camadas (ver [docs/arquitetura.md](../../docs/arquitetura.md)),
sem nenhuma mudança de código — este plano é "as-built", não prescritivo.

## Modelo (camada `model`)

- `src/model/entities/book.ts`: `Book` já tem `id`, `title`, `author`, `ownerId`, `modality`,
  `price?`, `status` (estendido pelas specs 003/004). O catálogo consome o tipo como está, sem
  precisar de mudança.
- `src/model/datasources/iBookDataSource.ts`: contrato `list()` já existente, consumido sem
  alteração.
- `src/model/errors.ts`: `DomainError` já existente é o que a ViewModel reconhece para extrair
  mensagem segura (FR-003); qualquer outro erro cai no fallback genérico.

## Casos de uso (camada `usecase`)

- `src/usecase/bookUseCases.ts` (`BookUseCases.listBooks()`): delega ao datasource, sem lógica
  de paginação/filtro (fora de escopo).

## Infraestrutura (camada `infra`)

- `src/infra/datasources/memoryBookDataSource.ts` (`MemoryBookDataSource.list()`): retorna cópia
  defensiva do array em memória, na ordem de inserção.

## Composição (camada `di`)

- `src/di/container.ts`: `bookUseCases` já exportado e compartilhado com as specs 003/004 (mesma
  instância de `bookDataSource`, para refletir anúncios/reservas no catálogo).

## ViewModel

- `src/viewmodel/useHomeViewModel.ts` (`useHomeViewModel`): estado `{ books, loading, error }`,
  ação `reload()`. Implementa FR-001 (carrega ao montar), FR-002 (três estados mutuamente
  exclusivos), FR-003 (sanitiza erro desconhecido) e FR-004 (`active`/`request` refs cancelam
  efeito de requisição obsoleta).

## View

- `src/view/home.tsx`: renderiza os três estados (`ActivityIndicator` + rótulo acessível;
  `AppIcon` de erro + mensagem + botão "Tentar novamente"; `FlatList` com `ListEmptyComponent`).
  Cada item (`renderItem`) mostra título, autor e a tag de modalidade (FR-005, mapa
  `modalityTag` local ao arquivo, tokens `tokens.colors.badge.*`).
- `src/app/index.tsx`: rota raiz que monta `Home`, sem exigir sessão (FR-006) — o indicador de
  sessão e o botão "Anunciar" (specs 003) aparecem condicionalmente, mas não bloqueiam a
  listagem.

## Testes (já existentes, sem necessidade de novos)

- `tests/components/homeView.test.tsx`: cabeçalhos acessíveis, subtítulo, estado vazio, marca
  decorativa inacessível.
- `tests/components-mocked/homeViewMocked.test.tsx`: estados de loading/erro/retry/populado
  isolados via mock da ViewModel, incluindo a tag de modalidade.
- `tests/hooks/useHomeViewModel.test.tsx`: ciclo de vida do hook, concorrência (FR-004),
  sanitização de erro (FR-003).
- `tests/integration/homeIntegration.test.tsx`: View + ViewModel + UseCase + Datasource reais,
  sem mocks de negócio.
