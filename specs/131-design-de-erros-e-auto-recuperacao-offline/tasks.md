# Tarefas de Implementação — Spec 131: Design de erros visuais e auto-recuperação offline

- [x] **Tarefa 1: Componente `InlineErrorCard` e padronização visual de erros**
  - [x] 1.1 Criar `src/view/components/InlineErrorCard.tsx` com design harmonioso ao tema.
  - [x] 1.2 Aplicar em `src/view/conversations/chat.tsx` (para `sendError`) e `src/view/components/FavoriteButton.tsx`.
  - [x] 1.3 Aplicar em todas as telas restantes com erros inline (`reportUser.tsx`, `meetingCard.tsx`, `manageListing.tsx`, `ProposalSheet.tsx`, `betaInviteScreen.tsx`, `resetPassword.tsx`, `moderation.tsx` e `createListingStep{1,2,3}.tsx`).
  - [x] 1.4 Criar testes em `tests/components/inlineErrorCard.test.tsx`.

- [x] **Tarefa 2: Refinamento de `ErrorState` e `OfflineState`**
  - [x] 2.1 Refinar layout visual de `ErrorState.tsx` com card centralizado acolhedor.
  - [x] 2.2 Refinar layout visual de `OfflineState.tsx` com card centralizado acolhedor.
  - [x] 2.3 Implementar auto-recuperação no `OfflineState` ao reconectar rede.
  - [x] 2.4 Criar testes em `tests/components/offlineStateAutoRetry.test.tsx`.

- [x] **Tarefa 3: Tratamento de erros de conectividade no `supabaseErrors.ts`**
  - [x] 3.1 Atualizar `toDomainError` para detectar falhas de rede e gerar mensagem clara de internet.
  - [x] 3.2 Criar/atualizar testes em `tests/unit/supabaseErrors.test.ts`.

- [x] **Tarefa 4: Verificação final e sincronia de métricas**
  - [x] 4.1 Executar `npm run validate` (tipos, linter, arquitetura, design system, testes).
  - [x] 4.2 Atualizar `docs/estado.md` e `README.md` e conferir `npm run check:docs`.
