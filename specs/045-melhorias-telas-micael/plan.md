# Plano de Implementação: Melhorias nas Telas do Micael (Issues #160 a #165)

**Branch**: `feat/032-melhorias-telas-micael`
**Spec**: `specs/045-melhorias-telas-micael/spec.md`

## 1. Arquitetura e Camadas Afetadas

- **Camada View (`src/view/`)**:
  - `src/view/listings/createListing.tsx`: contador `${description.length}/280 caracteres`, validação visual de limite e barra de rascunho ativo com botão `"Limpar rascunho"`.
  - `src/view/listings/editListing.tsx`: contador `${description.length}/280 caracteres` e validação visual de limite.
  - `src/view/listings/myListings.tsx`: estado local de filtro (`all` | `active` | `paused` | `reserved`) com chips acessíveis e estado vazio por filtro.
  - `src/view/requests/requestListLayout.tsx`: estado local de filtro (`all` | `pending` | `accepted` | `history`) com chips acessíveis e estado vazio por filtro.
  - `src/view/notifications/notifications.tsx`: estado local de filtro (`all` | `unread`) com chips acessíveis e estado vazio para `"Não lidas"`.
  - `src/view/help/helpAndFaq.tsx`: campo `TextField` de busca instantânea normalizando acentos (`NFD`) e estado vazio com ação `"Limpar busca"`.
  - `src/view/auth/deleteAccount.tsx`: seção opcional/integrada de portabilidade LGPD com botão `"Exportar meus dados (LGPD)"` e exibição acessível do resumo exportado.
- **Camada ViewModel (`src/viewmodel/`) e App (`src/app/`)**:
  - `src/viewmodel/useDeleteAccountViewModel.ts`: suporte opcional a `exportUserDataUseCase` para exportar os dados do usuário autenticado (`exportedDataSummary`, `isExportingData`, `exportUserData`).
  - `src/app/excluir-conta.tsx`: injeção de `exportUserDataUseCase` do `appContainer` para o `useDeleteAccountViewModel` e repasse das props para `DeleteAccountView`.

## 2. Estratégia de Testes e Validação

1. **Testes de Componentes (`tests/components/`)**:
   - Atualizar e adicionar casos de teste para as 6 issues em `createListingView.test.tsx`, `editListingView.test.tsx`, `myListingsView.test.tsx`, `requestListView.test.tsx`, `notificationsView.test.tsx`, `helpAndFaqView.test.tsx` e `deleteAccountView.test.tsx`.
2. **Verificação Automatizada Completa**:
   - Executar `npm run verify:release` (`typecheck`, `check:architecture`, `test:sql`, `vitest run`, `expo export --platform web`).
3. **Verificação no Dispositivo Android via ADB (`SM_A165M`)**:
   - Validar as telas atualizadas no aparelho físico conectado via ADB.
