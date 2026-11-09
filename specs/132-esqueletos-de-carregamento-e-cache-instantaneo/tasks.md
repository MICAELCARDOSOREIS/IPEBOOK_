# Tarefas de Implementação — Spec 132: Esqueletos de carregamento e abertura instantânea

- [x] **Tarefa 1: Transformar `LoadingState` em Skeleton Loading estrutural**
  - [x] 1.1 Implementar animação pulsante e variantes `list`, `profile`, `catalog` e `detail` em `src/view/components/LoadingState.tsx`.
  - [x] 1.2 Garantir compatibilidade de acessibilidade (`accessibilityLabel` e texto `srOnly`).
  - [x] 1.3 Adicionar testes para as variantes de esqueleto em `tests/components/systemStates.test.tsx`.

- [x] **Tarefa 2: Aplicar Skeleton Loading em `ProfileHub` e demais telas**
  - [x] 2.1 Atualizar `src/view/profile/profileHub.tsx` e `src/view/listings/publicProfile.tsx` com `variant="profile"`.
  - [x] 2.2 Atualizar `src/view/home.tsx`, `src/view/search/search.tsx`, `src/view/listings/bookDetail.tsx` e `src/view/listings/manageListing.tsx` com variantes `catalog` e `detail`.
  - [x] 2.3 Substituir spinners soltos em `receivedRatings.tsx`, `blockedUsers.tsx`, `moderation.tsx`, `editAlert.tsx`, `manageAlert.tsx` e `chat.tsx` por `LoadingState`.

- [x] **Tarefa 3: Stale-While-Revalidate nos ViewModels principais**
  - [x] 3.1 Implementar cache de sessão e revalidação sem bloqueio em `useProfileViewModel.ts`, `useHomeViewModel.ts` e `useMyListingsViewModel.ts`.

- [x] **Tarefa 4: Validação completa e documentação**
  - [x] 4.1 Executar `npm run validate` e atualizar `docs/estado.md` e `README.md`.
