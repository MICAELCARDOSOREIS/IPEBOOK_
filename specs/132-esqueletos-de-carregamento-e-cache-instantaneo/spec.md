# Especificação 132 — Esqueletos de carregamento (Skeleton Loading) e abertura instantânea de telas

**Estado:** Especificada em 2026-11-09  
**ADR:** [0103](../../docs/adr/0103-esqueletos-de-carregamento-e-cache-instantaneo.md)

## Objetivo e escopo

Eliminar a sensação de demora e as telas em branco com spinners soltos durante o carregamento das telas do IpêBook, substituindo os indicadores de carregamento por esqueletos estruturais ("caixinhas" pulsantes que desenham o formato da tela sem textos aparentes) e adotando cache em memória com *Stale-While-Revalidate* nas abas principais para que trocas de aba sejam instantâneas.

## Regras de negócio

- **RN-01 (Esqueletos estruturais sem textos visíveis):** O componente `LoadingState` deve renderizar blocos de esqueleto pulsantes ("caixinhas" com cantos arredondados nas cores de superfície do tema claro/escuro) representando cartões, avatares e linhas de conteúdo, sem mostrar frases de "Carregando..." na interface visual, mantendo `accessibilityLabel={label}` e nó acessível oculto para leitores de tela.
- **RN-02 (Variantes de esqueleto por contexto):** `LoadingState` deve suportar as variantes `"list"` (padrão), `"profile"` (layout de Meu Perfil e Perfil Público com cartão de identidade, métricas, botões, 3 selos comunitários e lista de atalhos), `"catalog"` (grade/carrossel de livros) e `"detail"` (detalhe de anúncio/pedido).
- **RN-03 (Unificação nas telas com spinner solto):** Telas que ainda exibiam `<ActivityIndicator />` solto em estado de carregamento (`profileHub.tsx`, `publicProfile.tsx`, `receivedRatings.tsx`, `blockedUsers.tsx`, `moderation.tsx`, `editAlert.tsx`, `manageAlert.tsx`, `chat.tsx`) devem usar o esqueleto visual.
- **RN-04 (Revalidação silenciosa / Stale-While-Revalidate):** Nos ViewModels `useProfileViewModel`, `useHomeViewModel` e `useMyListingsViewModel`, quando já houver dados carregados (ou em cache de sessão), uma nova montagem ou recarregamento não deve apagar os dados existentes nem bloquear a tela com `loading: true`, atualizando os dados em segundo plano.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | `LoadingState` exibe caixinhas de esqueleto pulsantes (variantes `list`, `profile`, `catalog`, `detail`) e preserva os rótulos de acessibilidade. | `src/view/components/LoadingState.tsx`, `tests/components/systemStates.test.tsx` |
| CA2 | `ProfileHub` e demais telas exibem o esqueleto estruturado durante o carregamento inicial em vez de spinner solto. | `src/view/profile/profileHub.tsx`, `tests/components/profileHubView.test.tsx` |
| CA3 | `useProfileViewModel`, `useHomeViewModel` e `useMyListingsViewModel` preservam dados já carregados durante revalidações. | `src/viewmodel/useProfileViewModel.ts`, `src/viewmodel/useHomeViewModel.ts`, `src/viewmodel/useMyListingsViewModel.ts` |
| CA4 | Pipeline completo `npm run validate` aprovado com 0 falhas. | `npm run validate` |
