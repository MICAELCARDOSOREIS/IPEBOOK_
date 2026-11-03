# Tarefas — Spec 122: Aprimoramento das Telas da Barra de Navegação e IHC

## Fase 1: Estante (`myListings.tsx`, `shelfRow.tsx`)
- [x] 1.1 Adicionar propriedade `onShareWhatsApp?: () => void` ao componente `ShelfRow` com botão acessível.
- [x] 1.2 Integrar o callback com `useShareListingViewModel` em `MyListingsListingsTab` e `MyListings`.
- [x] 1.3 Adicionar testes unitários para a ação de compartilhamento no card da estante em `tests/components/myListingsView.test.tsx`.

## Fase 2: Conversas (`conversations.tsx`)
- [x] 2.1 Adicionar a etiqueta de modalidade (`Tag variant={item.listing.modality}`) no card da conversa.
- [x] 2.2 Refinar a hierarquia visual e espaçamentos do cabeçalho da conversa (Avatar, Nome, Modalidade, Tempo).
- [x] 2.3 Atualizar os testes de componentes em `tests/components-mocked/conversationsView.test.tsx` e `tests/components/conversationsWide.test.tsx`.

## Fase 3: Início (`home.tsx`)
- [x] 3.1 Refinar o cabeçalho do carrossel local com informação amigável de livros no bairro de Piripiri.
- [x] 3.2 Verificar testes em `tests/components-mocked/homeViewMocked.test.tsx`.

## Fase 4: Perfil (`profileHub.tsx`)
- [x] 4.1 Adicionar o componente visual de Selos Comunitários de Piripiri (`badgesSection`) no `ProfileHub`.
- [x] 4.2 Exibir selos dinâmicos baseados no perfil (Leitor de Piripiri, Estante Ativa, Ponto Seguro).
- [x] 4.3 Adicionar testes de renderização e acessibilidade em `tests/components/profileHubView.test.tsx`.

## Fase 5: Validação e Integração
- [x] 5.1 Rodar suíte completa de testes (`npm test`).
- [x] 5.2 Executar `npm run typecheck`, `npm run check:architecture` e `npm run check:numbering`.
- [x] 5.3 Registrar ADR 0096 e atualizar `docs/adr/README.md`.
- [x] 5.4 Atualizar `docs/estado.md` e commitar as alterações na branch `develop`.
