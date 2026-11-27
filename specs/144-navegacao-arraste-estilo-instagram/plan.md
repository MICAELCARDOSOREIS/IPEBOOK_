# Plano — Spec 144 (Navegação por arraste estilo Instagram)

1. Instalar `react-native-pager-view` via `npx expo install` e registrar mock Jest (`tests/mocks/react-native-pager-view.tsx` em `jest.config.cjs`).
2. Criar `src/view/stackScreenOptions.ts` com o mapeamento puro de animações/gestos por rota e integrá-lo em `src/app/_layout.tsx` (incluindo detecção de `Reduce Motion`).
3. Criar `src/view/mainTabsState.ts` (estado reativo da aba ativa, `scrollProgress: Animated.Value`, registro de controlador do pager e contador `scrollToTopTick` por aba).
4. Evoluir `src/view/components/NavigationBar.tsx` e `ConnectedNavigationBar.tsx` para suportar `scrollProgress` 1:1 na pílula e `onReselectActive` (scroll-to-top ao tocar na aba ativa).
5. Criar `src/view/components/MainTabsPager.tsx` com `PagerView`, montagem preguiçosa + preservação de estado, sincronização de `scrollProgress` e `triggerHaptic("selection")` na troca de página.
6. Conectar `scrollToTopTick` opcional em `Home`, `Search` e `MyListings` (e `scrollRef` opcional em `ScreenContainer`) e integrar `MainTabsPager` em `src/app/index.tsx` apenas para `Platform.OS !== "web"`.
7. Criar suíte de testes dedicada (`tests/components/instagramSwipeNavigation.test.tsx`), atualizar métricas/docs e rodar todas as verificações.
