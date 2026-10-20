# Validação: Estados Globais de Carregamento e Erro (Spec 021 / Issue #76)

Data: 2026-10-20.

## O que foi implementado

- Componentes `LoadingState`, `ErrorState` e `OfflineState` em `src/view/components/`.
- Detecção de conectividade: `INetworkStatusDataSource` (model), `NetInfoNetworkStatusDataSource`
  (infra, via `@react-native-community/netinfo`) e `MemoryNetworkStatusDataSource` (infra, testes
  e fallback), registrados em `src/di/container.ts`; hook `useNetworkStatus` (viewmodel).
- Hook utilitário `useAsyncState` (viewmodel), criado e testado, disponível para ViewModels
  novos — ver decisão de escopo em T004 de `tasks.md` sobre não migrar os ViewModels existentes.
- Aplicação dos três estados, substituindo markup duplicado ad hoc, em: `src/view/home.tsx`,
  `src/view/favorites/favorites.tsx`, `src/view/listings/myListings.tsx`,
  `src/view/notifications/notifications.tsx`, `src/view/requests/requestListLayout.tsx` (usado
  por `receivedRequests.tsx` e `sentRequests.tsx`), `src/view/search/search.tsx`.
- Novo ícone `wifiOff` em `src/view/components/AppIcon.tsx` para o `OfflineState`.
- Documentação: `design-system/04-componentes/estados-do-sistema.md` (novo); contagem de
  componentes do design system atualizada em `design-system/README.md` (24 → 25).

## Dependência adicionada

- `@react-native-community/netinfo` (via `npx expo install`, garantindo versão compatível com o
  SDK do Expo do projeto). Decisão tomada com o usuário: a alternativa sem dependência nova
  (inferir "sem conexão" apenas pelo tipo de erro do datasource, sem detecção ativa de
  conectividade) foi preterida em favor de detecção real de rede.
- Mock adicionado para os testes: `tests/mocks/netinfo.ts` (alias no `vitest.config.mts`) e
  `tests/mocks/netinfo.cjs` (interceptação CJS em `tests/setupNodeReactNative.cjs`), seguindo o
  mesmo padrão já usado para `react-native`, `expo-symbols` e `@expo/vector-icons`.

## Validação executada

- `npx tsc --noEmit`: limpo (não considerando um arquivo de outra feature em andamento e não
  commitada neste repositório, fora do escopo desta entrega).
- `npm run check:architecture`: sem violações de import de camada.
- `npm run validate` (typecheck + arquitetura + migrações SQL + testes com cobertura): aprovado.
  **556 testes passando em 88 arquivos** (após mesclar `develop`, que avançou com várias outras
  entregas em paralelo durante esta sessão); cobertura acima de 80% nas 4 dimensões (Statements
  90,68%, Branches 80,65%, Functions 88,30%, Lines 92,29%). O branch coverage exigiu testes
  adicionais cobrindo o ramo `OfflineState` (antes não exercitado em nenhuma tela) — ver seção
  "Testes novos" abaixo.
- `npm run build:web` (`expo export --platform web`): build concluído com sucesso, 23 rotas
  estáticas exportadas, sem erros — confirma que a nova dependência nativa funciona também no
  bundle Web.

## Testes novos

- `tests/components/systemStates.test.tsx`: `LoadingState`, `ErrorState`, `OfflineState`
  (rótulos padrão/customizados, alerta de leitor de tela, ação de retry).
- `tests/hooks/useNetworkStatus.test.tsx`: estado inicial, resposta a mudança de conectividade
  via `subscribe`, cancelamento da inscrição ao desmontar, e ignorar respostas tardias do
  datasource após desmontar (sem lançar erro).
- `tests/hooks/useAsyncState.test.tsx`: estado inicial, ciclo loading→sucesso, captura de
  `DomainError` vs. erro genérico, limpeza do erro anterior ao reexecutar.
- Testes existentes das telas tocadas (`myListingsView`, `favoritesAlertsView`,
  `notificationsView`, `requestListViews`, `requestViews` mocado, `searchView` mocado,
  `homeView`/`homeViewMocked`/`homeIntegration`) continuam passando sem alteração de
  comportamento observável (mesmos rótulos e textos de "Tentar novamente").
- Cobertura do ramo `OfflineState` (branch antes não exercitada em nenhuma tela), mockando
  `useNetworkStatus` para `isOnline: false` junto com um erro simulado: adicionado em
  `tests/components-mocked/homeViewMocked.test.tsx`, `searchView.test.tsx`, `requestViews.test.tsx`
  e em `tests/components/myListingsView.test.tsx`; novos arquivos
  `tests/components-mocked/favoritesViewMocked.test.tsx` e
  `tests/components-mocked/notificationsViewMocked.test.tsx` para as duas telas que ainda não
  tinham suíte com ViewModel mockado.

## Limitações e pendências

- Verificação manual de "sem conexão" num dispositivo real (desligar Wi-Fi/dados e observar o
  `OfflineState` aparecer) não foi feita nesta sessão — sem acesso a um dispositivo físico ou
  emulador neste ambiente. Fica como verificação manual recomendada antes da publicação.
- A migração dos ViewModels existentes para `useAsyncState` fica em aberto para uma entrega
  futura, por decisão de escopo (ver `tasks.md`).
