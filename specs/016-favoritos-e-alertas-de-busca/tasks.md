# Tarefas: Favoritos e Alertas de Busca (Spec 016)

- [x] T001 Criar entidades `Favorite` e `SearchAlert` e seus contratos de datasource.
- [x] T002 Implementar datasources em memória e Supabase para os dois.
- [x] T003 Registrar resolução no container de DI `src/di/container.ts`.
- [x] T004 Criar casos de uso `FavoriteUseCases` e `SearchAlertUseCases`, incluindo o match de
  alerta ao criar um anúncio novo (integração com `BookUseCases.createListing`).
- [x] T005 Criar ViewModels `useFavoritesViewModel` e `useSearchAlertsViewModel`; ajustar
  `useBookDetailViewModel` para expor favoritar/desfavoritar.
- [x] T006 Criar Views `Favorites`/`FavoritesScreen` e `SearchAlerts`/`SearchAlertsScreen`;
  adicionar botão de favoritar no detalhe do livro e na linha de livro.
- [x] T007 Criar rotas `src/app/favoritos.tsx` e `src/app/alertas.tsx`; atalhos na Home e na
  busca sem resultado.
- [x] T008 Implementar testes unitários, de hooks e de componentes (cobertura > 80%).
- [x] T009 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
- [x] T010 (Issue #95) Adicionar `updateAlert` à interface, caso de uso e aos dois datasources
  (memória e Supabase), com proteção de posse e revalidação do termo; tela de edição inline a
  partir da lista de alertas.
