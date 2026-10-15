# Tarefas: Favoritos e Alertas de Busca (Spec 016)

- [ ] T001 Criar entidades `Favorite` e `SearchAlert` e seus contratos de datasource.
- [ ] T002 Implementar datasources em memória e Supabase para os dois.
- [ ] T003 Registrar resolução no container de DI `src/di/container.ts`.
- [ ] T004 Criar casos de uso `FavoriteUseCases` e `SearchAlertUseCases`, incluindo o match de
  alerta ao criar um anúncio novo (integração com `BookUseCases.create`).
- [ ] T005 Criar ViewModels `useFavoritesViewModel` e `useSearchAlertsViewModel`; ajustar
  `useBookDetailViewModel` para expor favoritar/desfavoritar.
- [ ] T006 Criar Views `Favorites`/`FavoritesScreen` e `SearchAlerts`/`SearchAlertsScreen`;
  adicionar botão de favoritar no detalhe do livro e na linha de livro.
- [ ] T007 Criar rotas `src/app/favoritos.tsx` e `src/app/alertas.tsx`; atalhos na Home e na
  busca sem resultado.
- [ ] T008 Implementar testes unitários, de hooks e de componentes (cobertura > 80%).
- [ ] T009 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
