# Plano de Implementação: Histórico de Buscas Recentes (Spec 027)

## Observação de dependência

`@react-native-async-storage/async-storage` já é dependência do projeto (usado em
`src/infra/supabaseClient.ts`). Nenhuma dependência nova é necessária.

## Arquitetura em 7 Camadas (MVVM)

1. **Model:**
   - `src/model/datasources/iSearchHistoryDataSource.ts`: contrato
     `list(ownerKey)`, `add(ownerKey, term)`, `clear(ownerKey)`.
2. **Infra:**
   - `src/infra/datasources/asyncStorageSearchHistoryDataSource.ts`: implementação real via
     `AsyncStorage`, serializando um array JSON por chave `search-history:<ownerKey>`, com limite
     de 10 itens e deduplicação (termo repetido sobe ao topo).
   - `src/infra/datasources/memorySearchHistoryDataSource.ts`: implementação em memória para
     testes e para qualquer ambiente sem `AsyncStorage` configurado.
3. **DI:**
   - Registrar `searchHistory: ISearchHistoryDataSource` em `src/di/container.ts`, usando a
     implementação `AsyncStorage` tanto no app quanto na Web (biblioteca já tem fallback Web).
4. **UseCase:**
   - `src/usecase/searchHistoryUseCases.ts` (`ISearchHistoryUseCases`): `listTerms(userId)`,
     `registerSearch(userId, term)` (ignora termo vazio), `clearHistory(userId)`. Resolve
     `ownerKey` como `userId ?? "guest"` internamente — não exige sessão.
5. **ViewModel:**
   - `src/viewmodel/useSearchViewModel.ts`: passa a expor `history: readonly string[]`,
     `registerSearch()` ao confirmar uma busca e `clearHistory()`; recebe `userId` para isolar a
     chave por conta.
   - `src/viewmodel/useDeleteAccountViewModel.ts`: ao concluir `deleteAccount` com sucesso,
     chama `searchHistoryUseCases.clearHistory(sessionUserId)` para cumprir a seção 2 da spec
     (LGPD).
6. **View:**
   - `src/view/search/search.tsx`: quando o campo está vazio e há histórico, mostra a lista de
     termos recentes (toque refaz a busca) e um botão "Limpar histórico" com `Dialog` de
     confirmação (#89).
7. **App (Expo Router):** nenhuma rota nova.
8. **Testes e Validação:**
   - Teste do usecase (ownerKey por conta/guest, limite de 10, deduplicação, limpeza).
   - Teste do datasource `AsyncStorage` (persistência e parsing).
   - Teste do viewmodel (`useSearchViewModel` expõe histórico e ações) e do componente (mostrar
     sugestões, tocar para refazer busca, limpar com confirmação).
   - Teste cobrindo a limpeza automática do histórico ao excluir a conta.
   - `npm run validate`; registrar em `validacao.md` ao final.
