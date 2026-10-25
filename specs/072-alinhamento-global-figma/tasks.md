# Tarefas — Spec 072: Alinhamento Global das Telas Android ao Figma

Status geral: Concluído (100% — 33/33 tarefas executadas e validadas)

## Grupo B · Livro e Comunidade (Telas 03.01–03.06, 08.01, 09.02–09.05)
- [x] T001: Alinhar `src/view/listings/bookDetail.tsx` às telas 03.01 (venda), 03.02 (troca) e 03.03 (doação).
- [x] T002: Alinhar `src/view/listings/publicProfile.tsx` à tela 03.04 (Perfil público do anunciante).
- [x] T003: Alinhar `src/view/listings/photoGallery.tsx` à tela 03.06 (Galeria de fotos do anúncio).
- [x] T004: Alinhar `src/view/listings/reportListing.tsx` e `reportListingScreen.tsx` às telas 09.03 e 09.04.
- [x] T005: Alinhar `src/view/profile/blockedUsers.tsx` à tela 09.02.
- [x] T006: Executar typecheck e testes do Grupo B (`tests/components/bookDetailView.test.tsx`, `tests/components/publicProfileView.test.tsx`).

## Grupo A · Acesso e Onboarding (Telas 01.01–01.17)
- [x] T007: Alinhar `src/view/onboarding/welcome.tsx` e `welcomeRoute.tsx` à tela 01.01 (Boas-vindas).
- [x] T008: Alinhar `src/view/auth/signIn.tsx` às telas 01.02 / 01.10 / 01.11 (Entrar com e-mail, estados de erro).
- [x] T009: Alinhar `src/view/auth/signUp.tsx` às telas 01.03 / 01.12 / 01.14 (Criar conta, confirmações).
- [x] T010: Alinhar `src/view/auth/forgotPassword.tsx` às telas 01.04 e 01.05 (Recuperar acesso e confira e-mail).
- [x] T011: Alinhar `src/view/auth/resetPassword.tsx` às telas 01.06–01.09 (Nova senha, senha atualizada).
- [x] T012: Executar typecheck e testes do Grupo A (`tests/components/authView.test.tsx`, etc.).

## Grupo C · Publicação e Gestão (Telas 04.01–04.21)
- [x] T013: Alinhar `src/view/listings/createListingStep1.tsx` (04.01), `createListingStep2.tsx` (04.04/04.05), `createListingStep3.tsx` (04.06) e `createListingSuccess.tsx` (04.07).
- [x] T014: Alinhar `src/view/listings/manageListing.tsx` e `manageListingScreen.tsx` à tela 04.08 (Gerenciar anúncio).
- [x] T015: Alinhar `src/view/listings/editListing.tsx` e `editListingScreen.tsx` à tela 04.09 (Editar anúncio).
- [x] T016: Executar typecheck e testes do Grupo C.

## Grupo D · Estante e Negociações (Telas 05.01–05.08, 06.01–06.22)
- [x] T017: Revisar e ajustar `src/view/listings/myListings.tsx`, abas e `myListingsEmpty.tsx` (05.01–05.08).
- [x] T018: Alinhar `src/view/requests/sentRequests.tsx` e `receivedRequests.tsx` (06.01, 06.03).
- [x] T019: Alinhar `src/view/requests/requestDetail.tsx` e `NegotiationChatModal.tsx` (06.02, 06.04–06.06).
- [x] T020: Alinhar `src/view/requests/NegotiationRatingModal.tsx` (06.21, 06.22) e conclusão de negociação.
- [x] T021: Executar typecheck e testes do Grupo D.

## Grupo E · Perfil, Notificações e Sistema (Telas 07.01–07.23, 09.01, 09.06–09.07)
- [x] T022: Ajustar `src/view/profile/profile.tsx`, `security.tsx` (07.02, 07.18–07.21).
- [x] T023: Alinhar `src/view/notifications/notifications.tsx` à tela 07.04 (Notificações).
- [x] T024: Alinhar `src/view/profile/receivedRatings.tsx` (07.05) e `meetingHistory.tsx` (07.06).
- [x] T025: Alinhar `src/view/legal/termsAndPrivacy.tsx` (07.14–07.16) e `src/view/help/helpAndFaq.tsx` (09.01).
- [x] T026: Alinhar `src/view/auth/deleteAccount.tsx` (07.17) e `inviteFriends.tsx` (07.03).
- [x] T027: Executar typecheck e testes do Grupo E.

## Grupo F · Descoberta, Filtros e Alertas (Telas 02.01–02.16)
- [x] T028: Refinar `src/view/search/search.tsx` para garantir alinhamento perfeito de filtros, chips e listas.
- [x] T029: Alinhar `src/view/favorites/favorites.tsx` (02.06, 02.14).
- [x] T030: Alinhar `src/view/search/searchAlerts.tsx`, `manageAlert.tsx`, `editAlert.tsx` (02.07–02.13).
- [x] T031: Executar typecheck e testes do Grupo F.

## Verificação e Entrega
- [x] T032: Validação com ADB no Galaxy A16 e diagnóstico da desconexão do Expo CLI.
- [x] T033: Executar `bun run check:numbering`, `bun run check:architecture`, `bun run typecheck` e suíte completa de testes (166 arquivos, 1161 testes aprovados).
