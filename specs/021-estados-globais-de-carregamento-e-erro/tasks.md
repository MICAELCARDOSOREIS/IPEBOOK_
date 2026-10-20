# Tarefas: Estados Globais de Carregamento e Erro (Spec 021)

- [x] T001 Levantar quais telas existentes não tratam loading/erro/sem conexão hoje.
  **Resultado:** todas as telas que buscam dados já tratavam loading/erro, cada uma à sua
  própria maneira (markup e textos duplicados); nenhuma tratava "sem conexão" como estado
  próprio. Telas ajustadas para usar os componentes padronizados: `src/view/home.tsx`,
  `src/view/favorites/favorites.tsx`, `src/view/listings/myListings.tsx`,
  `src/view/notifications/notifications.tsx`, `src/view/requests/requestListLayout.tsx`
  (usado por `receivedRequests.tsx` e `sentRequests.tsx`), `src/view/search/search.tsx`.
- [x] T002 Conferir se `DataSourceError` (`src/model/errors.ts`) distingue "sem conexão" de
  outros erros; criar subtipo se não distinguir.
  **Decisão:** não criado subtipo. "Sem conexão" é detectado de forma independente da
  exceção lançada, via conectividade real (`useNetworkStatus` + NetInfo) consultada no
  momento da renderização — quando há `state.error` e `isOnline` é falso, mostra-se
  `OfflineState` em vez de `ErrorState`, qualquer que seja a mensagem do erro.
- [x] T003 Criar componentes `LoadingState`, `OfflineState` e `ErrorState` em
  `src/view/components/`, com documentação correspondente em `design-system/04-componentes/`.
  Ver `design-system/04-componentes/estados-do-sistema.md`.
- [x] T004 Criar hook utilitário `useAsyncState` (loading/error padronizado) para os ViewModels.
  **Decisão de escopo:** o hook foi criado e testado (`src/viewmodel/useAsyncState.ts`), mas os
  ViewModels existentes não foram migrados para usá-lo nesta entrega — cada um já tinha seu
  próprio estado loading/error funcionando e testado; migrar todos agora seria uma refatoração
  ampla e de risco desproporcional ao pedido da issue. Fica disponível para ViewModels novos ou
  para uma migração incremental futura.
- [x] T005 Aplicar os três estados nas telas levantadas em T001.
- [x] T006 Implementar testes unitários e de componentes (cobertura > 80%).
- [x] T007 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
