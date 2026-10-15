# Plano de Implementação: Favoritos e Alertas de Busca (Spec 016)

## Arquitetura em 7 Camadas (MVVM)

1. **Model:**
   - `src/model/entities/favorite.ts`: `Favorite { id, userId, bookId, createdAt }`.
   - `src/model/entities/searchAlert.ts`: `SearchAlert { id, userId, query, active, createdAt }`.
   - `src/model/datasources/iFavoriteDataSource.ts` e `src/model/datasources/iSearchAlertDataSource.ts`.
2. **Infra:**
   - `src/infra/datasources/memoryFavoriteDataSource.ts` / `supabaseFavoriteDataSource.ts`.
   - `src/infra/datasources/memorySearchAlertDataSource.ts` / `supabaseSearchAlertDataSource.ts`.
3. **DI:**
   - Registrar `favorites` e `searchAlerts` em `createDataSources()` e expor
     `favoriteUseCases`/`searchAlertUseCases` em `src/di/container.ts`, seguindo o padrão de
     `notificationUseCases`.
4. **UseCase:**
   - `src/usecase/favoriteUseCases.ts` (`toggleFavorite`, `listFavorites`).
   - `src/usecase/searchAlertUseCases.ts` (`createAlert`, `pauseAlert`, `resumeAlert`,
     `deleteAlert`, `listAlerts`, `matchNewBookAgainstAlerts` — este último chamado pelo caso de
     uso de criação de anúncio existente, `bookUseCases.create`, para gerar notificação).
5. **ViewModel:**
   - `src/viewmodel/useFavoritesViewModel.ts`.
   - `src/viewmodel/useSearchAlertsViewModel.ts`.
   - Ajuste em `src/viewmodel/useBookDetailViewModel.ts` para expor `isFavorite`/`toggleFavorite`.
6. **View:**
   - `src/view/favorites/favorites.tsx` + `favoritesScreen.tsx`.
   - `src/view/search/searchAlerts.tsx` + `searchAlertsScreen.tsx`.
   - Botão de favoritar no componente de detalhe do livro e na linha de livro (`Icon` `heart`/`heartFill` já existem em `AppIcon.tsx`).
7. **App (Expo Router):**
   - `src/app/favoritos.tsx` e `src/app/alertas.tsx`.
   - Atalhos na Home (`src/app/index.tsx`) e na busca sem resultado (`src/view/search`).
8. **Testes e Validação:**
   - Testes de usecase (toggle, match de alerta), datasource, viewmodel e view.
   - `npm run validate` e `npm run build:web`; registrar em `validacao.md` ao final.
