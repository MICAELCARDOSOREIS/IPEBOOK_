# Tarefas — Spec 144

- [x] T001 Instalar `react-native-pager-view` compatível com Expo 58 e documentar Spec 144 + ADR 0120
- [x] T002 Criar `src/view/stackScreenOptions.ts` e aplicar transições direcionais + arraste para voltar em `src/app/_layout.tsx`
- [x] T003 Criar `src/view/mainTabsState.ts` e `src/view/components/MainTabsPager.tsx` com mock Jest em `tests/mocks/react-native-pager-view.tsx`
- [x] T004 Suportar `scrollProgress` 1:1 e `onReselectActive` em `NavigationBar.tsx`, `ConnectedNavigationBar.tsx` e scroll-to-top em `ScreenContainer`/`Home`/`Search`/`MyListings`
- [x] T005 Integrar `MainTabsPager` no mobile em `src/app/index.tsx` e `_layout.tsx` mantendo Web e rotas diretas 100% preservadas
- [x] T006 Adicionar testes em `tests/components/instagramSwipeNavigation.test.tsx`, atualizar `README.md`/`docs/estado.md` e validar tudo
