# Plano de Implementação: Meus Anúncios (Spec 008)

## Arquitetura e Contratos

A funcionalidade segue estritamente a arquitetura MVVM sofisticado em 7 camadas:

1. **Model & DataSource Contract**:
   - `src/model/datasources/iBookDataSource.ts`: Adicionar `listByOwner(ownerId: string): Promise<readonly Book[]>`.
2. **Infra**:
   - `src/infra/datasources/memoryBookDataSource.ts`: Implementar `listByOwner`.
   - `src/infra/datasources/supabaseBookDataSource.ts`: Implementar `listByOwner`.
3. **UseCase**:
   - `src/usecase/iBookUseCases.ts`: Adicionar `listMyListings(sessionUserId: string | null): Promise<readonly Book[]>`.
   - `src/usecase/bookUseCases.ts`: Implementar `listMyListings`, exigindo `sessionUserId` não nulo.
4. **ViewModel**:
   - `src/viewmodel/useMyListingsViewModel.ts`: Hook gerenciando estado `[state, actions]` com proteção contra race conditions.
5. **View**:
   - `src/view/listings/myListings.tsx`:
     - Componente puro `MyListings` com cabeçalho (`TopAppBar`), listagem com `BookCover`, badge de modalidade, status (Disponível/Reservado) e estado vazio com atalho para anunciar.
     - Componente com gate de sessão `MyListingsScreen` que redireciona para `/entrar` caso não autenticado.
   - `src/view/home.tsx`: Adicionar atalho "Meus anúncios" ao lado de "Pedidos recebidos" e "Meus pedidos".
6. **App (Rotas)**:
   - `src/app/meus-anuncios.tsx`: Rota que conecta navegação para `/livro/[id]`, `/anunciar` e volta (`router.back()`).
7. **Testes**:
   - `tests/unit/myListingsUseCases.test.ts`
   - `tests/hooks/useMyListingsViewModel.test.tsx`
   - `tests/components/myListingsView.test.tsx`
   - `tests/integration/myListingsIntegration.test.tsx`
