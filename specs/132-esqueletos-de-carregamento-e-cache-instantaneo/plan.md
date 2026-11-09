# Plano de Implementação — Spec 132: Esqueletos de carregamento e abertura instantânea

## 1. Componente `LoadingState` com Skeleton Loading
- Atualizar `src/view/components/LoadingState.tsx`:
  - Adicionar prop `variant?: "list" | "profile" | "catalog" | "detail"`.
  - Criar animação de pulso contínua (`opacity` de `0.45` a `0.9` em 700ms) respeitando `AccessibilityInfo.isReduceMotionEnabled()`.
  - Renderizar blocos geométricos (`SkeletonBox`) com `colors.m3.surfaceContainerHighest` e contêineres com `colors.m3.surfaceContainerLow` e borda `colors.m3.outlineVariant`:
    - `profile`: Cartão de identidade (linhas de nome/arroba à esquerda + círculo de avatar à direita, faixa de 3 métricas, 2 botões arredondados), linha de título de seção + 3 caixinhas lado a lado (Selos Comunitários), e 3 itens de menu com ícone quadrado arredondado e duas linhas.
    - `catalog`: Barra de filtros + grade de cartões de livros (capa + 2 linhas).
    - `detail`: Bloco de capa e informações + cartão de detalhes.
    - `list` (padrão): 4 cartões horizontais com bloco de imagem/ícone à esquerda e 2-3 barras de texto à direita.
  - Preservar `accessibilityLabel={label}` no contêiner e manter `<Text style={styles.srOnly}>{label}…</Text>` (oculto visualmente com 1x1px / opacity 0) para que leitores de tela e testes existentes (`getByText("Carregando…")`, `getByLabelText(...)`) continuem funcionando sem mostrar texto na tela.

## 2. Aplicação nas Telas
- `src/view/profile/profileHub.tsx`: usar `<LoadingState label="Carregando perfil" variant="profile" />` quando `state.loading && !state.profile && isSignedIn`.
- `src/view/listings/publicProfile.tsx`: usar `<LoadingState label="Carregando perfil" variant="profile" />`.
- `src/view/home.tsx` e `src/view/search/search.tsx`: usar `variant="catalog"` no `LoadingState`.
- `src/view/listings/bookDetail.tsx` e `src/view/listings/manageListing.tsx`: usar `variant="detail"` no `LoadingState`.
- `src/view/profile/receivedRatings.tsx`, `src/view/profile/blockedUsers.tsx`, `src/view/moderation/moderation.tsx`, `src/view/search/editAlert.tsx`, `src/view/search/manageAlert.tsx`, `src/view/conversations/chat.tsx`: substituir `<ActivityIndicator />` isolado por `<LoadingState label="..." />`.

## 3. Stale-While-Revalidate e Cache de Sessão nos ViewModels
- Em `src/viewmodel/useProfileViewModel.ts`, `src/viewmodel/useHomeViewModel.ts` e `src/viewmodel/useMyListingsViewModel.ts`:
  - Adicionar cache em memória para execução fora de testes (`process.env.NODE_ENV !== "test"`), permitindo que ao trocar de aba na sessão real os dados apareçam em 0ms (`loading: false`) enquanto revalidam silenciosamente em segundo plano.
  - Além disso, quando `reload()` for chamado e já houver dados em `state` (`previous.profile !== null` ou `previous.books.length > 0`), manter os dados visíveis na tela sem voltar para o esqueleto em branco.
