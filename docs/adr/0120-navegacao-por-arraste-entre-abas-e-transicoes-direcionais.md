# ADR 0120 — Navegação por arraste entre abas (`react-native-pager-view`) e transições direcionais no Stack

- **Data:** 2026-11-26
- **Status:** Aceito
- **Spec vinculada:** [Spec 144](../../specs/144-navegacao-arraste-estilo-instagram/spec.md)
- **ADRs relacionados:** [ADR 0011](0011-navegacao-tres-destinos.md), [ADR 0084](0084-adocao-material-3-expressive.md), [ADR 0115](0115-base-liquid-glass-apple-hig.md)

## Contexto

Todas as trocas de tela no `Stack` raiz (`src/app/_layout.tsx`) usavam `animation: "fade"` (180 ms) e a troca entre as três abas principais do dock (`Início`, `Explorar` e `Estante`, ADR 0011) usava `replaceOnce`, desmontando a aba anterior, perdendo a posição de rolagem e impedindo a navegação por arraste horizontal 1:1 (estilo Instagram). Ao mesmo tempo, a tela `Início` possui carrosséis horizontais de livros (`CatalogCarousel`) e fileiras de chips roláveis que conflitam facilmente com soluções puramente em JavaScript.

## Decisão

1. **Adotar `react-native-pager-view`** (suportado oficialmente pelo Expo SDK 58, baseado em `ViewPager2` no Android e `UIPageViewController` no iOS) para hospedar as 3 abas principais (`Início` ↔ `Explorar` ↔ `Estante`) no app nativo (`Platform.OS !== "web"`) via `MainTabsPager`, sem reintroduzir `react-native-reanimated` ou `react-native-worklets`.
2. **Montagem preguiçosa com preservação de estado (*keep alive*):** `Início` monta imediatamente; `Explorar` e `Estante` montam na primeira visita ou aproximação de arraste e permanecem montadas para retorno instantâneo preservando rolagem e filtros.
3. **Sincronização 1:1 da pílula no `NavigationBar` e scroll-to-top:** `MainTabsPager` publica o progresso contínuo do arraste (`0..2`) em `mainTabsState`, dirigindo a pílula ativa do `NavigationBar` em tempo real; tocar na aba já ativa aciona rolagem suave ao topo.
4. **Transições direcionais no `Stack`:** substituir o `fade` uniforme por `slide_from_right` com gesto interativo de voltar (`gestureEnabled: true`, `fullScreenGestureEnabled: true` no iOS) para telas hierárquicas, `slide_from_bottom` para compositores/modais (`anunciar`, `editar-anuncio/[id]`, `denunciar/[id]`, `denunciar-pessoa/[userId]`, `excluir-conta`) e `animation: "none"` quando `Reduce Motion` estiver ativado.
5. **Isolamento Web:** na Web (`Platform.OS === "web"`), `src/app/index.tsx` continua renderizando `Home` diretamente e as rotas `/`, `/pesquisa` e `/meus-anuncios` preservam URLs canônicas, SSR e exportação estática sem montar `PagerView`.

## Alternativas consideradas

- **`ScrollView horizontal pagingEnabled` puro em JS:** funcionaria via OTA sem módulo nativo, porém sofre com mediação manual de scroll aninhado contra `CatalogCarousel` no Android e entrega menos fluidez em aparelhos intermediários.
- **`react-native-reanimated` + `react-native-gesture-handler`:** recém-removidos por adicionar compilação C++ pesada e tamanho extra ao AAB sem necessidade real para este fluxo.

## Consequências

- **Positivas:** gestos nativos a 60–120 fps sem briga com carrosséis horizontais; retorno instantâneo entre abas preservando rolagem; pílula do dock acompanhando o dedo; transições naturais nas telas internas; zero impacto na Web/SEO e nas 46 rotas existentes.
- **Negativas / Atenção:** por adicionar um módulo nativo (`react-native-pager-view`), a funcionalidade de arraste entre abas exige um novo build nativo Android/iOS (APK/AAB) para funcionar nos aparelhos instalados (não entra apenas via OTA).
