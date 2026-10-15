# Plano de Implementação: Detalhes da Negociação e Encontro (Spec 009)

## Arquitetura e Contratos

A funcionalidade segue estritamente as 7 camadas da arquitetura:

1. **Model / UseCase Contract**:
   - `src/usecase/iBookRequestUseCases.ts`:
     - Definir tipo `NegotiationDetail`:
       ```typescript
       export type NegotiationDetail = Readonly<{
         request: BookRequest;
         book: Book;
         isOwner: boolean;
         counterpartId: string;
         safeMeetingPoints: readonly string[];
       }>;
       ```
     - Adicionar `getRequestDetail(requestId: string, sessionUserId: string | null): Promise<NegotiationDetail>`.
2. **UseCase**:
   - `src/usecase/bookRequestUseCases.ts`:
     - Implementar `getRequestDetail`:
       - Busca o pedido via `requestDataSource.findById(requestId)`. Se não encontrar, lança `DataSourceError("Pedido não encontrado.")`.
       - Busca o livro associado via `bookDataSource.findById(request.listingId)`. Se não encontrar, lança `DataSourceError("Anúncio não encontrado.")`.
       - Valida permissão: se `sessionUserId !== request.requesterId` e `sessionUserId !== book.ownerId`, lança `AuthError("Você não tem permissão para acessar esta negociação.")`.
       - Retorna objeto `NegotiationDetail` com pontos seguros recomendados em Piripiri (IFPI Campus Piripiri, Praça da Bandeira, etc.).
3. **ViewModel**:
   - `src/viewmodel/useRequestDetailViewModel.ts`: hook `[state, actions]` para carregar e recarregar os detalhes.
4. **View**:
   - `src/view/requests/requestDetail.tsx`: tela com TopAppBar, card do livro, informações da negociação, dicas de segurança do encontro e botão de voltar.
   - Atualizar `src/view/requests/receivedRequests.tsx` e `sentRequests.tsx` para adicionar o botão "Ver detalhes do encontro" nos itens aceitos.
5. **App / Rotas**:
   - `src/app/negociacao/[id].tsx`: rota dinâmica do Expo Router.
6. **Testes**:
   - `tests/unit/requestDetailUseCases.test.ts`
   - `tests/hooks/useRequestDetailViewModel.test.tsx`
   - `tests/components/requestDetailView.test.tsx`
   - `tests/integration/requestDetailIntegration.test.tsx`
