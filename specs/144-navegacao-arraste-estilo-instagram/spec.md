# Spec 144 — Navegação por arraste estilo Instagram e transições direcionais

**Data:** 2026-11-26
**Status:** Implementada e validada localmente
**ADR vinculado:** [ADR 0120](../../docs/adr/0120-navegacao-por-arraste-entre-abas-e-transicoes-direcionais.md)

## Objetivo

Tornar a navegação móvel do IpêBook fluida, tátil e previsível — permitindo arrastar horizontalmente 1:1 entre as três abas principais do dock (`Início` ↔ `Explorar` ↔ `Estante`) com a pílula da barra inferior acompanhando o dedo em tempo real, retornar ao topo ao tocar na aba ativa, e substituir o `fade` genérico das telas internas por transições direcionais com gesto interativo de voltar.

## Escopo

- **Incluído:**
  1. **Transições direcionais no `Stack` raiz (`src/app/_layout.tsx` + `src/view/stackScreenOptions.ts`):**
     - Telas hierárquicas (`/livro/[id]`, `/conversa/[id]`, `/perfil`, `/perfil/[userId]`, `/negociacao/[id]`, `/notificacoes`, `/pedidos-recebidos` etc.): `slide_from_right` com `gestureEnabled: true` e `fullScreenGestureEnabled: true` no iOS.
     - Fluxos modais de criação/edição/denúncia (`anunciar`, `editar-anuncio/[id]`, `denunciar/[id]`, `denunciar-pessoa/[userId]`, `excluir-conta`): `slide_from_bottom` com `gestureEnabled: true`.
     - Rotas raiz/acesso (`index`, `pesquisa`, `meus-anuncios`, `bem-vindo`, `entrar`, `criar-conta`, `beta`): `fade` leve.
     - Respeito a `Reduce Motion` (`animation: "none"` quando o usuário prefere movimento reduzido).
  2. **Pager nativo das 3 abas no mobile (`src/view/components/MainTabsPager.tsx` + `src/view/mainTabsState.ts`):**
     - `react-native-pager-view` (`ViewPager2` no Android e `UIPageViewController` no iOS) ligando `Início` (0), `Explorar` (1) e `Estante` (2) em `src/app/index.tsx` quando `Platform.OS !== "web"`.
     - Montagem preguiçosa (*lazy mount*) com preservação de estado e rolagem (*keep alive*) após a primeira visita ou aproximação.
     - Conflito zero com carrosséis horizontais (`CatalogCarousel`) e chips horizontais graças à mediação nativa de scroll aninhado do `ViewPager2`/`UIPageViewController`.
  3. **Pílula sincronizada 1:1 no `NavigationBar` e scroll-to-top ao tocar na aba ativa:**
     - `NavigationBar` aceita `scrollProgress?: Animated.Value` (0..2) para interpolar a posição X da pílula em tempo real durante o arraste, mantendo o fallback em `Animated.spring` quando não houver `scrollProgress`.
     - `NavigationBar` aceita `onReselectActive?: (destination) => void`: tocar na aba já ativa rola a tela para o topo (`scrollTo({ y: 0, animated: true })` / `scrollToOffset({ offset: 0, animated: true })`).
     - Feedback tátil (`triggerHaptic("selection")`) ao cruzar para outra aba.
  4. **Preservação integral da Web, SEO, Deep Links e testes:**
     - Na Web (`Platform.OS === "web"`), as rotas `/`, `/pesquisa` e `/meus-anuncios` permanecem independentes com URLs canônicas, SSR e exportação estática intactos.
     - As 46 rotas de `src/app/` e o dock de 3 destinos (ADR 0011) permanecem intactos.

- **Fora de escopo:**
  - Alterar o número de abas do dock (mantido em 3 conforme ADR 0011).
  - Reintroduzir `react-native-reanimated` ou `react-native-worklets`.

## Critérios de aceite

- **CA1:** `getStackScreenOptions` retorna `slide_from_right` + `gestureEnabled: true` para rotas de detalhe/fluxo, `slide_from_bottom` para modais (`anunciar`, `editar-anuncio/[id]`, `denunciar/[id]`, `denunciar-pessoa/[userId]`, `excluir-conta`), `fade` para raiz/acesso e `none` quando `reduceMotion` está ativo.
- **CA2:** No mobile (`Platform.OS !== "web"`), `MainTabsPager` renderiza `Início`, `Explorar` e `Estante` em `PagerView`, sincroniza o índice com `mainTabsState` e `ConnectedNavigationBar`, e só monta `Explorar`/`Estante` sob demanda mantendo-as vivas depois de visitadas.
- **CA3:** `NavigationBar` interpola a posição da pílula quando recebe `scrollProgress`, aciona `onReselectActive` ao tocar na aba já ativa e respeita `Reduce Motion`.
- **CA4:** Na Web (`Platform.OS === "web"`), `src/app/index.tsx` continua renderizando `Home` diretamente sem montar `PagerView`.
- **CA5:** Testes automatizados cobrem `stackScreenOptions`, `mainTabsState`, `MainTabsPager` e `NavigationBar` (pílula + reselect), e a exportação Web permanece limpa.
