# Tarefas de Implementação — Spec 130: Resiliência offline e banner de conectividade

- [x] **Tarefa 1: Componente `ConnectionStatusBanner`**
  - [x] 1.1 Criar `src/view/components/ConnectionStatusBanner.tsx` com acessibilidade e tema.
  - [x] 1.2 Integrar no `src/app/_layout.tsx`.
  - [x] 1.3 Criar testes dedicados em `tests/components/connectionStatusBanner.test.tsx`.

- [x] **Tarefa 2: Cache offline da estante no `CachedBookDataSource`**
  - [x] 2.1 Adicionar suporte a `ownerListKey` e fallback em `listByOwner(ownerId)`.
  - [x] 2.2 Invalidar cache do anunciante em mutações (`create`, `update`, `delete`, `updateStatus`).
  - [x] 2.3 Cobrir com testes em `tests/unit/cachedBookDataSource.test.ts`.

- [x] **Tarefa 3: Blindagem de envio no chat**
  - [x] 3.1 Integrar `useNetworkStatus` no `src/view/conversations/chat.tsx`.
  - [x] 3.2 Desabilitar botão de envio quando `!isOnline` com feedback acessível.
  - [x] 3.3 Cobrir com teste em `tests/components/chatOffline.test.tsx`.

- [x] **Tarefa 4: Verificação final e sincronia de métricas**
  - [x] 4.1 Executar `npm run validate` e conferir tipos, lint, arquitetura e testes.
  - [x] 4.2 Atualizar `docs/estado.md` e validar `npm run check:docs`.
