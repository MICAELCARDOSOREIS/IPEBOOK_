# Especificação 132 — Esqueletos de carregamento (Skeleton Loading) e abertura instantânea de telas

**Estado:** Especificada em 2026-11-09  
**ADR:** [0103](../../docs/adr/0103-esqueletos-de-carregamento-e-cache-instantaneo.md)

## Objetivo e escopo

Eliminar a sensação de demora e as telas em branco com spinners soltos durante o carregamento das telas do IpêBook, substituindo os indicadores de carregamento por esqueletos estruturais ("caixinhas" pulsantes que desenham o formato da tela sem textos aparentes) e adotando cache em memória com *Stale-While-Revalidate* nas abas principais para que trocas de aba sejam instantâneas.

## Regras de negócio

- **RN-01 (Esqueletos estruturais sem textos visíveis):** O componente `LoadingState` deve renderizar blocos de esqueleto pulsantes ("caixinhas" com cantos arredondados nas cores de superfície do tema claro/escuro) representando cartões, avatares e linhas de conteúdo, sem mostrar frases de "Carregando..." na interface visual, mantendo `accessibilityLabel={label}` e nó acessível oculto para leitores de tela.
- **RN-02 (Variantes de esqueleto fiéis à anatomia de cada página):** `LoadingState` (apoiado por `LoadingSkeletonVariants`) deve suportar 10 variantes que desenham o layout exato de cada página sem repetir cabeçalhos ou chips já visíveis:
  - `"shelf"` (Estante): 3 caixinhas coloridas de resumo (à venda, em troca, para doar), barra segmentada de 3 abas (`Anúncios | Propostas | Concluídos`), fileira de chips de status e card agrupador com linhas de livros e ícone circular de WhatsApp.
  - `"catalog"` (Explorar): barra de contagem/ordenação (`"12 livros" --- "Mais recentes"`) e cartões horizontais de livro (capa à esquerda, título, autor, pílula de modalidade + preço + bairro, coração e seta à direita).
  - `"homeCarousel"` (Início): cabeçalho da seção `"Perto de você"` com badge e carrossel horizontal de cartões verticais de `168px`.
  - `"profile"` (Meu Perfil): cartão de identidade com avatar à direita, 3 métricas, 2 botões em pílula, 3 Selos Comunitários e linhas de Atividade.
  - `"publicProfile"` (Perfil Público): avatar circular centralizado de `80px`, nome/handle centralizados, 3 cartões de estatísticas e lista de livros publicados.
  - `"conversations"` (Conversas, Notificações e Pessoas Bloqueadas): cartões horizontais com avatar circular de `48px` à esquerda, nome/horário, prévia e pílula de modalidade.
  - `"detail"` (Detalhe do Livro, Entrega, Encontro e Negociação): bloco de título/autor/preço abaixo do hero, cartão de especificações e cartão do anunciante.
  - `"manage"` (Gerenciar Anúncio): cartão resumo do livro e 4 cartões de ação empilhados.
  - `"form"` (Editar Perfil, Editar Anúncio e Alertas): cabeçalho, campos de formulário, pílulas de seleção e botão de ação.
  - `"list"` (Favoritos, Rascunhos, Pedidos e Encontros): cartões horizontais com miniatura à esquerda e metadados à direita.
- **RN-03 (Unificação nas telas com spinner solto):** Telas que ainda exibiam `<ActivityIndicator />` solto em estado de carregamento (`profileHub.tsx`, `publicProfile.tsx`, `editListing.tsx`, `requestDetail.tsx`, `receivedRatings.tsx`, `blockedUsers.tsx`, `moderation.tsx`, `editAlert.tsx`, `manageAlert.tsx`, `chat.tsx`) devem usar o esqueleto visual correspondente à sua página.
- **RN-04 (Revalidação silenciosa / Stale-While-Revalidate):** Nos ViewModels `useProfileViewModel`, `useHomeViewModel` e `useMyListingsViewModel`, quando já houver dados carregados (ou em cache de sessão), uma nova montagem ou recarregamento não deve apagar os dados existentes nem bloquear a tela com `loading: true`, atualizando os dados em segundo plano.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | `LoadingState` exibe caixinhas de esqueleto pulsantes (variantes `list`, `profile`, `catalog`, `detail`) e preserva os rótulos de acessibilidade. | `src/view/components/LoadingState.tsx`, `tests/components/systemStates.test.tsx` |
| CA2 | `ProfileHub` e demais telas exibem o esqueleto estruturado durante o carregamento inicial em vez de spinner solto. | `src/view/profile/profileHub.tsx`, `tests/components/profileHubView.test.tsx` |
| CA3 | `useProfileViewModel`, `useHomeViewModel` e `useMyListingsViewModel` preservam dados já carregados durante revalidações. | `src/viewmodel/useProfileViewModel.ts`, `src/viewmodel/useHomeViewModel.ts`, `src/viewmodel/useMyListingsViewModel.ts` |
| CA4 | Pipeline completo `npm run validate` aprovado com 0 falhas. | `npm run validate` |
