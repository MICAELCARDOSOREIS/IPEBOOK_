# Tarefas — Spec 126 (Dívidas estruturais: injeção, tamanho de telas e runtime de teste)

Dependem da Spec 126 e do ADR 0098. Seguem a regra do projeto: primeiro a verificação que falha,
depois a mudança de estrutura. Nenhuma tarefa altera texto, rota ou regra de negócio vista pelo
usuário; nenhuma usa Playwright.

## Fase 1 — verificações com efeito de catraca

- [x] **T001** Em `scripts/verificar-arquitetura.mjs`, retirar a aresta `viewmodel → di` da matriz `allowed` e adicionar a regra que reprova import de `@/di` em `src/viewmodel/**`, com **lista de exceções explícita** contendo os 50 arquivos atuais. Verificação: `npm run check:architecture` passa com a lista cheia; reprova ao importar `@/di` em um arquivo fora da lista e ao adicionar arquivo novo à lista sem mover o código correspondente.
- [x] **T002** Criar a varredura de `.parent!` em `tests/components*` com teto = 0 (as 5 ocorrências de `createListingView.test.tsx`, `favoritesAlertsView.test.tsx` e `stepProgress.test.tsx` já substituídas por `testID` em T017), embutida no `check:architecture`. Verificação: passa com 0 ocorrências, reprova se aparecer qualquer `.parent!`.
- [x] **T003** Criar a catraca de tamanho de arquivo de tela: teto definido no plano de extração (900 linhas), com a lista das cinco telas acima do teto (`home.tsx` 1.381, `profileHub.tsx` 1.107, `bookDetail.tsx` 1.104, `scheduleMeeting.tsx` 1.063, `chat.tsx` 900) registrada e decrescente. Verificação: o script falha contra o estado atual com a lista vazia e passa com ela; cresce a lista ⇒ falha.

## Fase 2 — E1: injeção de dependência (ADR 0098), em lotes por fluxo

Cada lote: o ViewModel passa a receber dependências por parâmetro obrigatório, a fábrica `make…`
entra em `src/di/container.ts`, a View chama a fábrica, o arquivo sai da lista de T001 e a suíte
completa roda no fim do lote.

- [x] **T004** Lote catálogo: ViewModels de início, busca, favoritos e alertas. Concluído em 2026-11-05 com `useHomeViewModel`, `useSearchViewModel`, `useFavoritesViewModel`, `useFavoriteButtonViewModel`, `useSearchAlertsViewModel` e `useWelcomeGateViewModel` sem importar `@/di/container`, as seis fábricas `make…` em `src/di/container.ts` e as dez Views do fluxo chamando-as. Verificação: `npm run check:architecture` com a lista de exceções reduzida de 50 para 44, sonda de mutação reprovando a reinserção do import, suíte completa com 2.079 testes em 292 arquivos.
- [x] **T005** Lote anúncios: criar, editar, gerenciar, estante e perfil público (`useCreateListingViewModel`, `useDraftsViewModel`, `useEditListingViewModel`, `useManageListingViewModel`, `useBookDetailViewModel`, `useListingPhotoViewModel`, `useMyListingsViewModel`, `usePublicProfileViewModel`, `useShareListingViewModel`).
- [x] **T006** Lote pedidos, encontro e entrega (`useRequestNegotiationViewModel`, `useReceivedRequestsViewModel`, `useSentRequestsViewModel`, `useRequestDetailViewModel`, `useMeetingViewModel`, `useScheduleMeetingViewModel`, `useUserMeetingsViewModel`, `useDeliveryViewModel` e `useDeliveryStatus`).
- [x] **T007** Lote conversas e notificações — inclui os quatro sem parâmetro hoje (`useNegotiationChatViewModel.ts`, `useConversationsViewModel.ts`, `useChatWithUser.ts`, `useNegotiationRatingViewModel.ts`, `useNavigationBadgesViewModel.ts`, `useNotificationsViewModel.ts`, `useNotificationPreferencesViewModel.ts`, `usePushRegistration.ts`, `useReceivedRatingsViewModel.ts`).
- [x] **T008** Lote conta e preferências: entrada, cadastro, redefinição, configurações, bloqueios, segurança e os contratos de efeito colateral (`useAuthViewModel.ts`, `useBetaSignupViewModel.ts`, `useBlockedUsersViewModel.ts`, `useDeleteAccountViewModel.ts`, `useInviteFriendsViewModel.ts`, `useModerationViewModel.ts`, `useProfilePhotoViewModel.ts`, `useProfileSafetyViewModel.ts`, `useProfileViewModel.ts`, `useReportListingViewModel.ts`, `useReportUserViewModel.ts`, `useResetPasswordViewModel.ts`, `useSettingsViewModel.ts`, `useThemeViewModel.ts`, `useUserPreferencesViewModel.ts`, `useNetworkStatus.ts`, `usePwaViewModel.ts`, `errorReporting.ts`).
- [x] **T009** Para cada um dos 9 ViewModels que hoje não expõem parâmetro, acrescentar ao menos um teste que exercita sucesso e falha de datasource por injeção real, sem `vi.mock` do módulo do ViewModel (`useNetworkStatus.ts` atualizado com parâmetro `dataSource: INetworkStatusDataSource` e testado por injeção direta em `tests/hooks/useNetworkStatus.test.tsx`, somando-se aos outros 8 que já expõem parâmetros `deps`/`useCases`/`options`). Verificação: CA2 da Spec 126.
- [x] **T010** Lista de exceções de T001 removida de `scripts/verificar-arquitetura.mjs` (a regra que reprova import de `@/di` em `src/viewmodel/**` passou a ser absoluta, sem verificação reversa). Verificação: `grep -r "from \"@/di" src/viewmodel` vazio e `npm run check:architecture` verde.

## Fase 3 — E2: extração de seções de tela (uma tela por entrega)

- [x] **T011** Definir o teto por arquivo no plano de extração, considerando as cinco telas de T003 e o custo de manter `styles` compartilhadas (`VIEW_FILE_LINE_CEILING = 900` em `scripts/verificar-arquitetura.mjs`, com `VIEW_SIZE_EXCEPTIONS` zerada).
- [x] **T012** Extrair seções de `home.tsx` (1.381 → 842 linhas) em componentes de `src/view/home/CatalogCarousel.tsx` (`CatalogCarousel`, `HomeShortcutsSection`, `HomeEmptyCatalogSection`), com testes de componente em `tests/components/extractedViewSections.test.tsx`.
- [x] **T013** Repetir a extração em `profileHub.tsx` (1.107 → 402 linhas, `src/view/profile/ProfileHubSections.tsx`), `bookDetail.tsx` (1.104 → 833 linhas, `src/view/listings/BookDetailSections.tsx`), `scheduleMeeting.tsx` (1.063 → 558 linhas, `src/view/requests/ScheduleMeetingWideLayout.tsx`) e `chat.tsx` (900 → 693 linhas, `src/view/conversations/ChatProposalCards.tsx`), mantendo a rota de `src/app/` importando a mesma composição em cada passo.
- [x] **T014** Conferir, para cada tela extraída, que os testes antigos de comportamento continuam valendo sem reescrever expectativa (`homeView.test.tsx`, `profileHubView.test.tsx`, `bookDetailView.test.tsx`, `scheduleMeetingView.test.tsx` e `chatView.test.tsx` passaram integralmente sem alteração de expectativa).

## Fase 4 — E3: runtime de teste

- [x] **T015** Spike em uma tela piloto: verificado sobre `homeView.test.tsx` e `profileHubView.test.tsx` que `react-native` pacote nativo exige transform Flow/Babel ausente no runner Node/Vitest, enquanto `react-native-web` altera a árvore de primitivos esperada por `@testing-library/react-native` (`View`/`Text`/`Pressable` viram nós DOM). As asserções de contrato público (papéis acessíveis, rótulos, `testID` e estilos declarados) sobrevivem integralmente no mock `tests/mocks/react-native.ts`; apenas layout calculado (Yoga/DOM) e foco nativo não são verificáveis neste ambiente.
- [x] **T016** Decisão do spike: manter `tests/mocks/react-native.ts` com regras vigiadas por `npm run check:architecture` (T002: 0 ocorrências de `.parent!`), sem introduzir segundo runtime de teste nem nova dependência.
- [x] **T017** Eliminar as 5 asserções `.parent!`, expressando cada expectativa por contrato público (papel acessível, rótulo, `testID`, estilo declarado). Verificação: T002 com teto rebaixado a zero.
- [x] **T018** Escrever em `docs/estado.md` e no README de testes o que é validado por suíte e o que depende de conferência em dispositivo, sem afirmar validação de layout onde não houve. Verificação: CA7 da Spec 126.

## Ordenação, riscos e estado atual

- A Fase 1 vem antes: sem catraca, a migração de 50 arquivos e a extração de cinco telas não têm como
  provar que não regrediram (mesmo critério usado na Spec 125).
- Fases 2 e 3 não se misturam em um mesmo commit: uma muda imports e composição, outra muda a
  estrutura da View.
- **Bloqueio em 2026-11-05:** `src/viewmodel/useNegotiationChatViewModel.ts`,
  `src/viewmodel/notificationRoute.ts`, `src/view/listings/bookDetail.tsx`,
  `src/view/search/searchAlerts.tsx` e `tests/components/favoritesAlertsView.test.tsx` estão com
  edição de outro agente nesta data. Nenhuma tarefa desta spec foi iniciada; T001 e T002 tocam só
  `scripts/` e podem começar quando aqueles arquivos estiverem commitados, para não medir a base
  errada.
- E2 não tem prazo e entra na fila somente quando não houver defeito de usuário aberto na mesma tela.
